"""Run technical gates in a new disposable byte copy, with clean frozen install."""
from pathlib import Path
import gzip,hashlib,json,os,shutil,subprocess,tempfile,time,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-019';tag=sys.argv[1]
assert tag.isalnum() and not (o/(tag+'-gates.json')).exists()
paths=sorted(set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0')))
base=Path(tempfile.mkdtemp(prefix='crm-h5019-gates-'));rep=base/'repo';rep.mkdir();inputs={}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for n in paths:
 p=rep/n;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(r/n,p);inputs[n]=sha(p);assert inputs[n]==sha(r/n)
# Local Git metadata is copied only for read-only historical identity checks.
subprocess.run(['git','clone','--shared','--no-checkout','--quiet',str(r),str(base/'git-shell')],check=True)
shutil.move(base/'git-shell/.git',rep/'.git');subprocess.run(['git','reset','--mixed','--quiet','HEAD'],cwd=rep,check=True)
env={**os.environ,'POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','NEXT_TELEMETRY_DISABLED':'1'}
commands=[('frozen',['pnpm','install','--frozen-lockfile','--ignore-scripts']),('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('build',['pnpm','build']),('audit',['pnpm','audit','--prod','--json']),('unit',['pnpm','test']),('health',['node','--test','tests/operations/supabase-health.test.mjs']),('migration',['node','scripts/test-postgres.mjs','postgres-h5-018-sixth-migration.test.ts']),('temporal',['node','scripts/test-postgres.mjs','postgres-h5-018-sixth-temporal.test.ts','postgres-h5-018-sixth-auxiliary.test.ts'])]
results=[]
for name,command in commands:
 start=time.time();p=subprocess.run(command,cwd=rep,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 row={'gate':name,'command':command,'started':start,'finished':time.time(),'exit':p.returncode,'stdout':f'{tag}-{name}.stdout.log.gz','stderr':f'{tag}-{name}.stderr.log.gz'}
 for stream,b in [('stdout',p.stdout),('stderr',p.stderr)]:
  with(o/row[stream]).open('xb')as f:f.write(gzip.compress(b,mtime=0))
 results.append(row);print(json.dumps(row),flush=True)
 if name=='frozen' and p.returncode:break
changed=[n for n,d in inputs.items()if not(r/n).exists()or sha(r/n)!=d]
replicaChanges=[n for n,d in inputs.items()if not(rep/n).exists()or sha(rep/n)!=d]
report={'base':'1e7822c11be817e4f2d4791338284aa825ad1a24','results':results,'copiedInputs':inputs,'workspaceChanged':changed,'replicaChanged':replicaChanges,'freshNodeModules':True,'externalBusinessServices':False,'replica':str(rep),'removed':False}
# Only known CLI update cache is permitted to change in this disposable copy.
valid=not changed and not set(replicaChanges)-{'supabase/.temp/cli-latest'} and len(results)==len(commands)and all(x['exit']==0 for x in results)
if valid:shutil.rmtree(base);report['removed']=True
with(o/(tag+'-gates.json')).open('x')as f:json.dump(report,f,sort_keys=True);f.write('\n')
print(json.dumps({k:v for k,v in report.items()if k not in ['results','copiedInputs']}))
sys.exit(0 if valid else 1)
