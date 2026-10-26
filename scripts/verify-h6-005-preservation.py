from pathlib import Path
import json,hashlib,gzip,datetime
r=Path(__file__).resolve().parent.parent;o=r/'tests/fixtures/h6-005';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
errors=[];baseline=json.loads((o/'baseline-tracked.json').read_text())
for e in baseline:
 p=r/e['path']
 if not p.is_file() or p.stat().st_size!=e['size'] or sha(p)!=e['sha256'] or oct(p.stat().st_mode&0o777)!=e['mode']:errors.append(e['path'])
source=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os/tests/fixtures/h6-017/preservation/dependencies-readback-v2.json');prior=json.loads(source.read_text());dep=[]
for x in prior['checks']:
 if not x['id'].startswith('H5-019_') or 'path' not in x:continue
 p=Path(x['path']);p=r/p.relative_to('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os') if str(p).startswith('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os/') else p
 actual=sha(p);dep.append({'id':x['id'],'path':str(p),'expected':x['expectedSHA256'],'actual':actual,'status':'PASS' if actual==x['expectedSHA256'] else 'FAIL'})
audit=Path('/Users/andres/Developer/crm-h5-019-corrective-independent-audit-20261018');inv=json.loads((audit/'AUDIT-INVENTORY.json').read_text());fail=[]
for name,e in inv['files'].items():
 p=audit/name
 if not p.is_file() or sha(p)!=e['sha256'] or p.stat().st_size!=e['bytes']:fail.append(name)
dep.append({'id':'H5-019-original-audit-payloads','count':len(inv['files']),'errors':fail,'status':'FAIL' if fail else 'PASS'})
seal=json.loads((r/'tests/fixtures/h5-019-corrective/candidate-seal.json').read_text());assert seal['inventorySha256']==sha(r/'tests/fixtures/h5-019-corrective/candidate-inventory.json.gz')
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'protected':len(baseline),'migrations':len(list((r/'supabase/migrations').glob('*.sql'))),'protectedErrors':errors,'dependency':dep,'h6015':'No runtime/SQL/S11/reentry/jobs accessed; protected tracked bytes read only','status':'PASS' if not errors and all(x['status']=='PASS' for x in dep) else 'FAIL'}
(o/'preservation-readback.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'protected':len(baseline),'migrations':result['migrations'],'status':result['status'],'deps':len(dep)},indent=2));assert result['status']=='PASS'
