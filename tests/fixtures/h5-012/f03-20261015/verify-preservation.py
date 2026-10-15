"""Read-only verification of every preexisting file and of the tested candidate."""
import hashlib,json,stat,subprocess,datetime
from pathlib import Path
e=Path(__file__).resolve().parent;r=e.parents[3]
b=json.loads((e/'preflight.json').read_text());changed=[]
for x in b['files']:
 p=r/x['path']
 if not p.is_file() or p.stat().st_size!=x['bytes'] or oct(stat.S_IMODE(p.stat().st_mode))!=x['mode'] or hashlib.sha256(p.read_bytes()).hexdigest()!=x['sha256']:changed.append(x['path'])
refs=subprocess.check_output(['git','rev-parse','HEAD','main','origin/main'],cwd=r,text=True).splitlines()
index=subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r,text=True)
expected=r/'specs/001-core-crm/expected-TSK-H5-011-012.md'
m=json.loads((e/'inputs-final.json').read_text());source_changes=[x['path'] for x in m['inputs'] if hashlib.sha256((r/x['path']).read_bytes()).hexdigest()!=x['sha256']]
result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseline_files':len(b['files']),'unchanged':len(b['files'])-len(changed),'changed':changed,'source_files':len(m['inputs']),'source_changes':source_changes,'refs':refs,'index_empty':not index,'expected_bytes':expected.stat().st_size,'expected_sha256':hashlib.sha256(expected.read_bytes()).hexdigest()}
result['pass']=not changed and not source_changes and not index and refs==[b['base']]*3 and result['expected_bytes']==67346 and result['expected_sha256']=='669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b'
print(json.dumps(result,indent=2));raise SystemExit(0 if result['pass'] else 1)
