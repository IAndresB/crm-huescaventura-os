"""Append-only independent execution capture; protected input hashes before/after."""
import pathlib,json,gzip,hashlib,subprocess,os,sys,time,re
root=pathlib.Path(__file__).resolve().parents[1];out=root/'tests/fixtures/h5-018-fourth';label=sys.argv[1];cmd=sys.argv[2:]
assert re.fullmatch('[a-z0-9-]+',label) and not(out/(label+'.status.json')).exists()
def inputs():
 paths=[]
 for folder in ['src','supabase/migrations','tests/support','tests/integration','scripts','tests/operations']:
  paths.extend(p for p in(root/folder).rglob('*')if p.is_file())
 paths.extend(root/p for p in ['package.json','pnpm-lock.yaml','tsconfig.json','specs/001-core-crm/expected-TSK-H5-018-fourth.md'])
 return{str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest()for p in sorted(paths)}
before=inputs();env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';start=time.time()
p=subprocess.run(cmd,cwd=root,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE);after=inputs()
counts={k:int(m[-1])for k in ['tests','pass','fail','cancelled','skipped']if(m:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',p.stdout.decode(errors='replace')))}
d={'command':cmd,'startedAtEpoch':start,'finishedAtEpoch':time.time(),'exit':p.returncode,'inputs':before,'changedDuringRun':[k for k,v in before.items()if after.get(k)!=v],'counts':counts}
for stream,b in [('stdout',p.stdout),('stderr',p.stderr)]:
 target=out/(label+'.'+stream+'.log.gz');assert not target.exists();target.write_bytes(gzip.compress(b,mtime=0))
(out/(label+'.status.json')).write_text(json.dumps(d,indent=2)+'\n');print(json.dumps({k:v for k,v in d.items()if k!='inputs'}));print(p.stdout.decode(errors='replace')[-2000:]);print(p.stderr.decode(errors='replace')[-1000:]);sys.exit(p.returncode if not d['changedDuringRun']else 98)
