from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[1];folder=r/'tests/fixtures/h5-017-c';original=r/'tests/support/h5-006-dependency-preservation.ts';source=original.read_text()
transition={'path':'src/server/composition.ts','historicalSha256':'fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879','correctedSha256':'31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d','authorization':'User Block C F03: inherited technical correction permitted; same normative E4/E5 definitions','scope':'H5-017/H5-018 local isolated; no publication'}
assert hashlib.sha256((r/transition['path']).read_bytes()).hexdigest()==transition['correctedSha256']
(folder/'composition-transition.json').write_text(json.dumps(transition,indent=2)+'\n')
branch="""
// Block C successor guard: only this exact product transition is authorized.
const compositionC=Object.freeze(TRANSITION);
function assertCompositionC(path:string,current:Uint8Array,historicalHash:string,root:string):boolean {
 if(path!==compositionC.path)return false;
 assert.equal(historicalHash,compositionC.historicalSha256,path+': frozen historical input');
 const file=resolve(root,path),metadata=lstatSync(file);assert.ok(metadata.isFile()&&!metadata.isSymbolicLink());assert.equal(metadata.mode&0o777,0o644);
 assert.equal(digest(execFileSync('git',['show','9649a2773530ea8a43237b4e1f2034f80e34136f:'+path],{cwd:root})),compositionC.historicalSha256);
 assert.equal(digest(current),compositionC.correctedSha256,path+': exact authorized C successor');assert.equal(digest(readFileSync(file)),compositionC.correctedSha256);
 assert.deepEqual(JSON.parse(readFileSync(resolve(root,'tests/fixtures/h5-017-c/composition-transition.json'),'utf8')),compositionC);
 return true;
}
""".replace('TRANSITION',json.dumps(transition,separators=(',',':')))
changed=source+branch
changed=changed.replace("export function assertHistoricalHash(path:string,current:Uint8Array,historicalHash:string,root:string='.'):void {", "export function assertHistoricalHash(path:string,current:Uint8Array,historicalHash:string,root:string='.'):void {\n if(assertCompositionC(path,current,historicalHash,root))return;")
changed=changed.replace("export function assertHistoricalBytes(path:string,current:Uint8Array,historical:Uint8Array):void {", "export function assertHistoricalBytes(path:string,current:Uint8Array,historical:Uint8Array):void {\n if(assertCompositionC(path,current,digest(historical),'.'))return;")
helper=r/'tests/support/h5-017-c-dependency-preservation.ts';helper.write_text(changed)
rows=[]
for p in sorted((r/'tests/integration').glob('*.test.ts')):
 b=p.read_bytes();needle=b"../support/h5-006-dependency-preservation.ts"
 if needle not in b:continue
 assert b.count(needle)==1
 q=p.with_name('h5017c-preservation-'+p.name);value=b.replace(needle,b'../support/h5-017-c-dependency-preservation.ts',1);q.write_bytes(value)
 rows.append({'source':str(p.relative_to(r)),'sourceSha256':hashlib.sha256(b).hexdigest(),'derived':str(q.relative_to(r)),'derivedSha256':hashlib.sha256(value).hexdigest(),'change':'preservation helper import only; all original assertions intact'})
(folder/'preservation-derivatives.json').write_text(json.dumps({'originalHelper':str(original.relative_to(r)),'originalSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'successorHelper':str(helper.relative_to(r)),'successorSha256':hashlib.sha256(helper.read_bytes()).hexdigest(),'files':rows},indent=2)+'\n');print('C preservation successors',len(rows))
