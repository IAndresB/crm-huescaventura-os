"""Capture one local gate, immutable streams, exact inputs, versions and exit.
Run: python3 tests/support/h5-diagnostic-capture.py NAME COMMAND [ARGS...]
"""
import gzip,hashlib,json,os,subprocess,sys,time
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'tests/fixtures/h5-017';name=sys.argv[1]
assert not (out/(name+'.status.json')).exists()
paths=sorted({str(p.relative_to(root)) for folder in ['src','supabase/migrations','tests','scripts'] for p in (root/folder).rglob('*') if p.is_file() and p.suffix in ['.ts','.tsx','.sql','.mjs','.py']}|{'package.json','pnpm-lock.yaml','tsconfig.json','next-env.d.ts'})
inputs={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
(out/(name+'.inputs.json')).write_text(json.dumps(inputs,indent=2)+'\n')
start=time.time();env=os.environ.copy();env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin'
with (out/(name+'.stdout.log')).open('wb') as stdout,(out/(name+'.stderr.log')).open('wb') as stderr:
 p=subprocess.run(sys.argv[2:],cwd=root,env=env,stdout=stdout,stderr=stderr)
for stream in ['stdout','stderr']:
 path=out/(name+'.'+stream+'.log');data=path.read_bytes();path.with_suffix('.log.gz').write_bytes(gzip.compress(data,mtime=0));path.unlink()
changed=[p for p,h in inputs.items() if hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
record={'command':sys.argv[2:],'startedAtEpoch':start,'finishedAtEpoch':time.time(),'exit':p.returncode,'inputs':len(inputs),'changedDuringRun':changed,'base':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()}
(out/(name+'.status.json')).write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));sys.exit(p.returncode if not changed else 98)
