from pathlib import Path
import json,hashlib,gzip,os,subprocess,re,datetime
root=Path('/tmp/h6-001-audit');repo=root/'replica';out=root/'compatibility-02'
source=repo/'scripts/test-postgres.mjs';s=source.read_text();needle='["--test","--experimental-strip-types",...files]';assert s.count(needle)==1;s=s.replace(needle,'["--test","--experimental-strip-types","--test-concurrency=1","--test-name-pattern="+process.env.H6001_AUDIT_PATTERN,...files]');r=repo/'scripts/h6001-compatibility-runner.mjs';r.write_text(s);(out/'runner.mjs').write_text(s)
files=[Path(x['successor']).name for x in json.loads((out/'inputs.json').read_text())['sources']]
titles=[]
for phase in [1,15]:
 text=gzip.decompress((root/f'regression-01/phase-{phase:02}.stdout.log.gz').read_bytes()).decode()
 for line in text.splitlines():
  m=re.match(r'✖ (.+) \([0-9.]+ms\)$',line)
  if m and not m[1].startswith(('F-R01','F-R02','F-R03','F-R04','F-R05')) and m[1] not in titles: titles.append(m[1])
assert len(titles)==34,len(titles)
pattern='^(?:'+'|'.join(re.escape(t) for t in titles)+')$'
env={'PATH':os.environ['PATH'],'TMPDIR':str(root/'runtime'),'LANG':'C','LC_ALL':'C','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','CI':'1','NODE_NO_WARNINGS':'1','NODE_OPTIONS':'--import=file:///tmp/h6-001-audit/replica/tests/support/h5-017-g-hook.mjs','H6001_AUDIT_PATTERN':pattern}
start=datetime.datetime.now(datetime.timezone.utc).isoformat();cmd=['node','scripts/h6001-compatibility-runner.mjs',*files]
(out/'selection.json').write_text(json.dumps({'command':cmd,'titles':titles,'pattern':pattern,'runnerOriginalSHA':hashlib.sha256(source.read_bytes()).hexdigest(),'runnerSHA':hashlib.sha256(r.read_bytes()).hexdigest(),'reason':'34 original failed tests only; explicit instrument successors; sequential to avoid fixed-port overlap. Other cases retain first-run outcome.'},indent=2)+'\n')
p=subprocess.run(cmd,cwd=repo,env=env,capture_output=True)
for name,data in [('stdout',p.stdout),('stderr',p.stderr)]: (out/(name+'.log.gz')).write_bytes(gzip.compress(data))
record={'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exit':p.returncode,'summary':[s for s in p.stdout.decode().splitlines() if re.match(r'ℹ (?:tests|pass|fail|cancelled|skipped|duration_ms)',s)],'stdoutSHA':hashlib.sha256(p.stdout).hexdigest(),'stderrSHA':hashlib.sha256(p.stderr).hexdigest()}
(out/'run.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));print(p.stdout.decode()[-6000:]);print(p.stderr.decode()[-1000:])
