from pathlib import Path
import hashlib,json,subprocess
r=Path.cwd();base=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');prior=json.loads((base/'tests/fixtures/h6-017/preservation/readback-v3.json').read_text())['H6015'];out=[];count=0
sha=lambda b:hashlib.sha256(b).hexdigest()
for p in prior['packages']:
 manifest=r/p['manifest']
 if not manifest.exists() or sha(manifest.read_bytes())!=p['manifestSHA256']:manifest=Path(p['source'])/p['manifest']
 assert sha(manifest.read_bytes())==p['manifestSHA256'],p['manifest']
 for item in p['resolutions']:
  loc=item['resolved']
  if loc.startswith('/'):b=Path(loc).read_bytes()
  elif loc.startswith('published-canonical-identical:'):b=(r/loc.split(':',1)[1]).read_bytes()
  elif loc.startswith('snapshot:') or loc.startswith('snapshot-identical:'):
   _,commit,path=loc.split(':',2);b=subprocess.check_output(['git','show',commit+':'+path],cwd=r)
  else:raise Exception(loc)
  assert sha(b)==item['sha256'],item['path'];count+=1
 out.append({'manifest':p['manifest'],'manifestSHA256':p['manifestSHA256'],'entries':len(p['resolutions']),'status':'PASS'})
assert len(out)==16 and count==4568
result={'status':'PASS','manifestCount':16,'payloadEntries':count,'runtimeSQL':False,'S11':False,'reentry':False,'suspendedJobsInteracted':False,'operation':'read documentary files/Git snapshots only; no process executed','packages':out};(r/'audit/h6-005/h6015-full-documentary-readback.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'status':'PASS','manifestCount':16,'payloadEntries':count}))
