"""Reproduce F03 in a fresh isolated checkout; never change product or prior evidence."""
from pathlib import Path
import datetime, hashlib, json, os, subprocess, tempfile, time

e = Path(__file__).resolve().parent
r = e.parents[3]
m = json.loads((e / 'copy-manifest.json').read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
for item in m['inputs']:
    assert digest(r / item['path']) == item['sha256'], item['path']
workspace = Path(tempfile.mkdtemp(prefix='h512-audit-repeat-', dir='/tmp'))
d = workspace / 'copy'
subprocess.run(['git', 'clone', '--shared', '--quiet', str(r), str(d)], check=True)
subprocess.run(['git', 'checkout', '--quiet', '--detach', m['base']], cwd=d, check=True)
subprocess.run(['cp', '-cR', str(r / 'node_modules'), str(d / 'node_modules')], check=True)
for item in m['inputs']:
    (d / item['path']).write_bytes((r / item['path']).read_bytes())
source = e / 'probe-v2.ts.txt'
(d / 'tests/integration/postgres-h5-012-audit.test.ts').write_bytes(source.read_bytes())
command = ['node', 'scripts/test-postgres.mjs', 'postgres-h5-012-audit.test.ts']
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
begin = time.monotonic()
log = workspace / 'probe.log'
with log.open('x') as output:
    result = subprocess.run(command, cwd=d, stdout=output, stderr=subprocess.STDOUT,
        env=dict(os.environ, POSTGRES_H0_BIN='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin'))
receipt = {'utc': started, 'command': command, 'cwd': str(d), 'exit_code': result.returncode,
    'seconds': time.monotonic() - begin, 'source_sha256': digest(source),
    'manifest_sha256': digest(e / 'copy-manifest.json'), 'log_sha256': digest(log)}
(workspace / 'receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'output': str(workspace), **receipt}, indent=2))
raise SystemExit(result.returncode)
