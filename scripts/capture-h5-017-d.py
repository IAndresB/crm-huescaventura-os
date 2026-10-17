"""Block C append-only capture. Rejected candidate and independent evidence stay immutable."""
import sys,os,subprocess,json,hashlib,gzip,time,pathlib
root=pathlib.Path(__file__).resolve().parents[1];out=root/'tests/fixtures/h5-017-d'
name=sys.argv[1];args=sys.argv[2:];assert not(out/(name+'.status.json')).exists()
def inputs():
 paths=[]
 for folder in ['src','supabase/migrations','tests/support','tests/integration','scripts']:
  paths.extend(p for p in (root/folder).rglob('*') if p.is_file())
 paths.extend(root/p for p in ['package.json','pnpm-lock.yaml','tsconfig.json','specs/001-core-crm/expected-TSK-H5-018.md','specs/001-core-crm/expected-TSK-H5-017-C.md'])
 return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(paths)}
before=inputs();env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';t=time.time()
p=subprocess.run(args,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
after=inputs();status={'command':args,'startedAtEpoch':t,'finishedAtEpoch':time.time(),'exit':p.returncode,'inputs':before,'changedDuringRun':[k for k in before if before[k]!=after.get(k)]}
for stream,data in [('stdout',p.stdout),('stderr',p.stderr)]: (out/(name+'.'+stream+'.log.gz')).write_bytes(gzip.compress(data,mtime=0))
(out/(name+'.status.json')).write_text(json.dumps(status,indent=2)+'\n');print(json.dumps({k:v for k,v in status.items() if k!='inputs'}));print(p.stdout.decode(errors='replace')[-1800:]);print(p.stderr.decode(errors='replace')[-1800:]);sys.exit(p.returncode if not status['changedDuringRun'] else 98)
