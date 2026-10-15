"""Prepare another isolated copy; never overwrite evidence or mutate the main checkout."""
import hashlib,json,re,subprocess,sys,tempfile
from pathlib import Path
r=Path(__file__).resolve().parents[4];e=Path(__file__).resolve().parent
label=sys.argv[1]
assert re.fullmatch(r'[a-z0-9-]+',label)
target=e/('inputs-'+label+'.json');assert not target.exists()
m=json.loads((e/'inputs-supplement.json').read_text())
for i in m['inputs']:assert hashlib.sha256((r/i['path']).read_bytes()).hexdigest()==i['sha256'],i['path']
d=Path(tempfile.mkdtemp(prefix='h512repeat-',dir='/tmp'))/'r'
subprocess.run(['git','clone','--shared','--quiet',str(r),str(d)],check=True)
subprocess.run(['git','checkout','--quiet','--detach',m['base_sha']],cwd=d,check=True)
subprocess.run(['cp','-cR',str(r/'node_modules'),str(d/'node_modules')],check=True)
for i in m['inputs']:(d/i['path']).write_bytes((r/i['path']).read_bytes())
m['copy']=str(d);target.write_text(json.dumps(m,indent=2)+'\n')
print('New copy:',d)
print('Run the selected gate with: python3',e/'run-gate.py',label,'full')
print('The full suite in this reproduction includes the separate reference-chain supplement too.')
