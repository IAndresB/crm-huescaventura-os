from pathlib import Path
import json,hashlib,subprocess,re
root=Path('/tmp/h6-001-audit'); repo=root/'replica'; out=root/'compatibility-02';out.mkdir()
sha=lambda b:hashlib.sha256(b).hexdigest()
received=json.loads((root/'received-product.json').read_text()); inherited={f['path']:f for f in received['inherited']};base=received['base']
trans={}
for p,v in inherited.items():
 a=subprocess.run(['git','show',base+':'+p],cwd=repo,capture_output=True)
 trans[p]={'current':v['sha256'],'base':sha(a.stdout) if a.returncode==0 else None}
helper="""// New H6-001 audit harness only. Historical tests/results remain unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertHistoricalHash as originalHash,assertAuthorizedPreservationChain} from './h5-017-c-dependency-preservation.ts';
export {assertAuthorizedPreservationChain};
const base='971c55d5ce5770c71284d106d3c0deecca9514b5';
const transitions:Record<string,{current:string;base:string|null}>=TRANSITIONS;
const digest=(v:Uint8Array|string)=>createHash('sha256').update(v).digest('hex');
function declared(path:string,current:Uint8Array|string,historicalHash:string):boolean{
 const t=transitions[path];if(!t)return false;
 assert.ok(t.base,path+': introduced path cannot masquerade as historical');
 assert.equal(historicalHash,t.base,path+': historical byteguard input equals accepted base');
 assert.equal(digest(execFileSync('git',['show',base+':'+path])),t.base,path+': base bytes');
 assert.equal(digest(current),t.current,path+': exact frozen inherited bytes');
 assert.equal(digest(readFileSync(path)),t.current,path+': actual file exact');
 return true;
}
export function assertInheritedOrHistorical(path:string,current:string,historical:string):void{
 if(declared(path,current,digest(historical)))return;
 assert.equal(current,historical,path);
}
export function assertHistoricalHash(path:string,current:Uint8Array,historicalHash:string,root:string='.'):void{
 if(declared(path,current,historicalHash))return;
 originalHash(path,current,historicalHash,root);
}
""".replace('TRANSITIONS',json.dumps(trans,indent=2))
hp=repo/'tests/support/h6-001-inherited-compatibility.ts';hp.write_text(helper);(out/'support.ts').write_text(helper)
failed=json.loads((root/'regression-01/failures.json').read_text()); files={x['file'].split(':')[0].removeprefix('test at ') for x in failed if 'postgres-h5-017-f-replay' not in x['file']}; files.add('tests/integration/h5017c-preservation-postgres-h5-008-migration.test.ts')
manifest=[]
for path in sorted(files):
 b=(repo/path).read_bytes();s=b.decode();changes=[]
 s,n=re.subn(r"(['\"])--fail-on\1\s*,\s*(['\"])error\2", "'--fail-on','error','--output-format','json'",s)
 if n:changes.append({'kind':'CLI_EXPLICIT_JSON','occurrences':n,'meaning':'same pinned CLI and assertions, explicit machine output format'})
 if path.endswith(('h5017c-preservation-postgres-h5-004-migration.test.ts','h5017c-preservation-postgres-h5-006-migration.test.ts','h5017c-preservation-postgres-h5-008-migration.test.ts')):
  s="import {assertInheritedOrHistorical} from '../support/h6-001-inherited-compatibility.ts';\n"+s
  s,n=re.subn(r'else assert\.equal\(current,historical,(file|f)\)',r'else assertInheritedOrHistorical(\1,current,historical)',s)
  assert n==1,(path,n);changes.append({'kind':'FROZEN_BASE_INHERITED_DELTA','occurrences':n,'meaning':'exact old input equals base, new bytes equal declared14, all other original checks retained'})
 if path.endswith('h5017d-dependency-postgres-h4-024.test.ts'):
  old="import {assertAuthorizedPreservationChain,assertHistoricalHash} from '../support/h5-017-c-dependency-preservation.ts';"
  new=old.replace('h5-017-c-dependency-preservation','h6-001-inherited-compatibility');assert old in s;s=s.replace(old,new,1);changes.append({'kind':'FROZEN_BASE_INHERITED_DELTA','occurrences':1,'meaning':'unchanged old helper called for every noninherited path'})
 if path.endswith('postgres-h4-006-scope-reproducer.test.ts'):
  old="const f=await availabilityFixture(h);await f.apply(await f.receive({happenedAt:'2026-10-20T00:00:00Z'}));await assert.rejects(f.apply(await f.verify()),/AVAILABILITY_/);"
  new="const actionAt='2026-10-19T00:00:00Z',later=new Date(new Date(actionAt).getTime()+86400000).toISOString();const f=await availabilityFixture(h,undefined,0,{at:actionAt});await f.apply(await f.receive({happenedAt:later}));await assert.rejects(f.apply(await f.verify()),/AVAILABILITY_/);"
  assert old in s;s=s.replace(old,new,1);changes.append({'kind':'FIXED_TEMPORAL_RELATION','occurrences':1,'meaning':'same future fact rejection; action fixed and fact derived at +1 day'})
 assert changes,path
 dest='tests/integration/h6001compat-'+Path(path).name
 (repo/dest).write_text(s);(out/Path(dest).name).write_text(s)
 diff=subprocess.run(['git','diff','--no-index','--',str(repo/path),str(repo/dest)],capture_output=True).stdout
 (out/(Path(dest).name+'.diff')).write_bytes(diff)
 manifest.append({'original':path,'sourceSHA':sha(b),'successor':dest,'successorSHA':sha(s.encode()),'changes':changes,'failedTitles':[x['title'] for x in failed if x['file'].startswith('test at '+path+':')]})
(out/'inputs.json').write_text(json.dumps({'base':base,'expectedSHA':'ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2','helperSHA':sha(helper.encode()),'sources':manifest,'interpretation':'Explicit independent instrument successors. Original 46 FAILs remain FAIL. No changes to product, historical test source, assertion expectations outside exact accepted byte delta, or candidate.'},indent=2)+'\n')
print('Created explicit instrument variants',len(manifest));print([x['successor'] for x in manifest])
