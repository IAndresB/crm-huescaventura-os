from pathlib import Path
import hashlib,json,subprocess,datetime,os,gzip,shutil
root=Path('/tmp/h6-001-audit');replica=root/'replica';source=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os');out=root/'focal-independent-01';out.mkdir();(out/'source').mkdir()
inputs=[]
for name in ['tests/integration/postgres-h6-001.test.ts','scripts/run-h6-001.mjs']:
 b=(source/name).read_bytes();frozen=(source/'tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/source'/Path(name).name).read_bytes();assert b==frozen,name
 (replica/name).write_bytes(b);(out/'source'/Path(name).name).write_bytes(b);inputs.append({'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
for f in json.loads((root/'received-product.json').read_text())['functional']:
 if f['path'].startswith(('src/','supabase/migrations/','tests/support/')):
  b=(replica/f['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==f['sha256'],f['path'];assert b==(source/f['path']).read_bytes(),f['path']
(out/'inputs.json').write_text(json.dumps({'base':'971c55d5ce5770c71284d106d3c0deecca9514b5','sourceIdentical':True,'files':inputs,'expectedSHA':'ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2'},indent=2)+'\n')
env={'PATH':os.environ['PATH'],'TMPDIR':str(root/'runtime'),'LANG':'C','LC_ALL':'C','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','CI':'1','NODE_NO_WARNINGS':'1','H6001_OUTPUT':str(out)}
command=['node','scripts/test-postgres.mjs','postgres-h6-001.test.ts'];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(command,cwd=replica,env=env,capture_output=True)
for name,data in [('stdout',p.stdout),('stderr',p.stderr)]: (out/(name+'.log.gz')).write_bytes(gzip.compress(data))
summary=[x for x in p.stdout.decode().splitlines() if x.startswith(('ℹ tests','ℹ pass','ℹ fail','ℹ cancelled','ℹ skipped','ℹ duration'))]
record={'command':command,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exit':p.returncode,'summary':summary,'stdoutSHA':hashlib.sha256(p.stdout).hexdigest(),'stderrSHA':hashlib.sha256(p.stderr).hexdigest()};(out/'run.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));print(p.stdout.decode()[-3500:])
