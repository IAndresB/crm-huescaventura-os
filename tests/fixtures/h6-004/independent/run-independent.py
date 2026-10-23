from pathlib import Path
import os,sys,subprocess,json,hashlib,datetime
root=Path('/tmp/h6-004-independent-audit'); replica=root/'replica'; runtime=root/'private-runtime'; group=sys.argv[1]; names=sys.argv[2:]; stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'); directory=root/'runs'/(group+'-'+stamp);directory.mkdir(parents=True,exist_ok=False)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
cache=runtime/'crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e'; assert (cache/'dist/start/server.js').is_file(), 'OFFLINE_CACHE_REQUIRED'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=cache,text=True).strip()=='5def1dfc15ab7f08fe271c7d1e70542424524e4e';assert subprocess.run(['git','diff','--quiet'],cwd=cache).returncode==0
seal=json.loads((root/'expected-seal-v1.json').read_text());assert all(sha(root/x['path'])==x['sha256'] for x in seal['entries'])
paths=[Path('scripts/test-postgres.mjs')]+[Path('tests/integration')/n for n in names]+list(Path('src').joinpath().parts and Path(replica/'src').rglob('*'))
inputs=[]
for d in ['src','supabase/migrations','tests/support','tests/integration','scripts']:
 for p in sorted((replica/d).rglob('*')):
  if p.is_file():inputs.append({'path':str(p.relative_to(replica)),'sha256':sha(p),'bytes':p.stat().st_size})
(directory/'inputs.json').write_text(json.dumps(inputs,indent=2)+'\n')
env={'PATH':os.environ['PATH'],'TMPDIR':str(runtime),'LANG':'C','LC_ALL':'C','CI':'1','NODE_NO_WARNINGS':'1','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','H6004_OUTPUT':str(directory),'H6004_AUDIT_OUTPUT':str(directory),'H4012_CORRECTIVE44':'1','H4016_CORRECTIVE47':'1','H4018_CURRENT48':'1'}
if group.startswith('regression'):env['NODE_OPTIONS']='--import='+str(replica/'tests/support/h5-017-g-hook.mjs')
phases=[]
for n in names:
 args=['node','scripts/test-postgres.mjs',n]; prefix=directory/('phase-'+str(len(phases)+1).zfill(2));start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with open(str(prefix)+'.stdout.log','w') as stdout,open(str(prefix)+'.stderr.log','w') as stderr:p=subprocess.run(args,cwd=replica,env=env,stdout=stdout,stderr=stderr)
 text=Path(str(prefix)+'.stdout.log').read_text();summary=[s for s in text.splitlines() if s.startswith(('# tests ','# pass ','# fail ','# cancelled ','# skipped ','# duration','ℹ tests ','ℹ pass ','ℹ fail ','ℹ cancelled ','ℹ skipped ','ℹ duration'))]
 phase={'file':n,'command':args,'startedAt':start,'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'status':'PASS' if p.returncode==0 else 'FAIL','summary':summary,'stdoutSHA256':sha(Path(str(prefix)+'.stdout.log')),'stderrSHA256':sha(Path(str(prefix)+'.stderr.log'))};phases.append(phase);Path(str(prefix)+'.json').write_text(json.dumps(phase,indent=2)+'\n');print(json.dumps({'directory':str(directory),**phase}),flush=True)
result={'schema':'H6-004-independent-run/v1','base':'971c55d5ce5770c71284d106d3c0deecca9514b5','group':group,'expectedSHA256':sha(root/'expected-v1.md'),'runnerSHA256':sha(Path(__file__)),'node':subprocess.check_output(['node','--version'],text=True).strip(),'postgres':subprocess.check_output([env['POSTGRES_H0_BIN']+'/postgres','--version'],text=True).strip(),'phases':phases,'status':'PASS' if all(x['exitCode']==0 for x in phases) else 'FAIL','realExternalEffects':False,'networkDependencies':False,'runtimeOwn':True,'databaseOwn':True}
(directory/'run.json').write_text(json.dumps(result,indent=2)+'\n');sys.exit(0 if result['status']=='PASS' else 1)
