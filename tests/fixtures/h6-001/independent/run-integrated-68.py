from pathlib import Path
import subprocess,os,hashlib,json,gzip,datetime
root=Path('/tmp/h6-001-audit');repo=root/'replica';out=root/'integrated-68'
source=repo/'tests/integration/postgres-h5-019-integrated.test.ts'
out.mkdir(); (out/'source.test.ts').write_bytes(source.read_bytes())
env={'PATH':os.environ['PATH'],'TMPDIR':str(root/'runtime'),'LANG':'C','LC_ALL':'C','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','CI':'1','NODE_NO_WARNINGS':'1'}
cmd=['node','scripts/test-postgres.mjs',source.name];start=datetime.datetime.now(datetime.timezone.utc).isoformat()
p=subprocess.run(cmd,cwd=repo,env=env,capture_output=True)
for name,data in [('stdout',p.stdout),('stderr',p.stderr)]:
 (out/(name+'.log.gz')).write_bytes(gzip.compress(data))
record={'command':cmd,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exit':p.returncode,'sourceSHA':hashlib.sha256(source.read_bytes()).hexdigest(),'stdoutSHA':hashlib.sha256(p.stdout).hexdigest(),'stderrSHA':hashlib.sha256(p.stderr).hexdigest()}
(out/'run.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));print(p.stdout.decode()[-7000:]);print(p.stderr.decode()[-1000:])
