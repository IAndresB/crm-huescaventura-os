from pathlib import Path
import subprocess,json,hashlib,os,sys,datetime,shutil
r=Path(__file__).resolve().parent.parent/'crm-huescaventura-os';d=Path(__file__).resolve().parent/sys.argv[1];d.mkdir(exist_ok=False);runtime=Path('/tmp/crm-h6007-execution-runtime');runtime.mkdir(mode=0o700,exist_ok=True);cache='crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e'
if not (runtime/cache).exists() and (Path('/tmp/crm-h6-f-publication-runtime')/cache).exists():shutil.copytree(Path('/tmp/crm-h6-f-publication-runtime')/cache,runtime/cache,symlinks=True)
inputs=[]
for folder in ['src','supabase/migrations','tests/support','tests/integration','scripts']:
 for p in sorted((r/folder).rglob('*')):
  if p.is_file():inputs.append({'path':str(p.relative_to(r)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(d/'inputs.json').write_text(json.dumps(inputs,indent=2)+'\n');env={k:os.environ[k] for k in ['PATH','HOME'] if k in os.environ};env.update({'TMPDIR':str(runtime),'LANG':'C','LC_ALL':'C','CI':'1','NODE_NO_WARNINGS':'1','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','H5008_CAPTURE_DIR':str(d/'observations'),'H5009_CAPTURE_DIR':str(d/'observations'),'H6001_OUTPUT':str(d/'observations'),'H6004_OUTPUT':str(d/'observations'),'H6007_OUTPUT':str(d/'observations')});(d/'observations').mkdir();cmd=['node','scripts/test-postgres.mjs',*sys.argv[2:]]
started=datetime.datetime.now(datetime.timezone.utc).isoformat()
with (d/'stdout.log').open('wb') as out,(d/'stderr.log').open('wb') as err:q=subprocess.run(cmd,cwd=r,env=env,stdout=out,stderr=err)
stdout=(d/'stdout.log').read_text();summary=[l for l in stdout.splitlines() if l.startswith(('# tests','# pass','# fail','# cancelled','# skipped','ℹ tests','ℹ pass','ℹ fail','ℹ cancelled','ℹ skipped'))];result={'command':cmd,'startedAt':started,'endedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':q.returncode,'status':'PASS' if q.returncode==0 else 'FAIL','summary':summary,'stdoutSHA256':hashlib.sha256((d/'stdout.log').read_bytes()).hexdigest(),'stderrSHA256':hashlib.sha256((d/'stderr.log').read_bytes()).hexdigest(),'freshRuntime':str(runtime),'candidateWritten':False};(d/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result),flush=True);sys.exit(q.returncode)
