"""Reproduce the frozen candidate in a new disposable checkout, never overwrite evidence."""
import hashlib,json,os,shutil,subprocess,sys,tempfile
from pathlib import Path
e=Path(__file__).resolve().parent
r=e.parents[3]
m=json.loads((e/'candidate-inputs.json').read_text())
mode=sys.argv[1] if len(sys.argv)>1 else 'focal'
commands={'focal':['node','scripts/test-postgres.mjs','postgres-h5-012-candidate61.test.ts','postgres-h5-012-f01-candidate61.test.ts','postgres-h5-012-f02.test.ts','postgres-h5-012-f03.test.ts','postgres-h5-012-coverage61.test.ts','postgres-h5-012-migration61.test.ts','postgres-h5-012-security61.test.ts','postgres-h5-012-reference-chain.test.ts'],'full':['node','scripts/test-postgres.mjs'],'unit':['pnpm','test'],'typecheck':['pnpm','typecheck'],'lint':['pnpm','lint'],'build':['pnpm','build'],'audit':['pnpm','audit','--prod','--json'],'health':['node','--test','tests/operations/supabase-health.test.mjs']}
if mode not in commands:raise SystemExit('mode must be '+', '.join(commands))
for f in m['inputs']:assert hashlib.sha256((e/'source-final'/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
root=Path(tempfile.mkdtemp(prefix='h512-f03-reproduce-'));copy=root/'repo'
subprocess.run(['git','clone','--shared','--no-checkout',str(r),str(copy)],check=True)
subprocess.run(['git','checkout','--detach',m['base']],cwd=copy,check=True)
for f in m['inputs']:
 target=copy/f['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(e/'source-final'/f['path'],target)
subprocess.run(['cp','-cR',str(r/'node_modules'),str(copy/'node_modules')],check=True)
expected=json.loads((e/'inputs-final.json').read_text())
for f in expected['inputs']:assert hashlib.sha256((copy/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
env=dict(os.environ,POSTGRES_H0_BIN='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
with (root/(mode+'.log')).open('x') as out:result=subprocess.run(commands[mode],cwd=copy,env=env,stdout=out,stderr=subprocess.STDOUT)
receipt={'mode':mode,'exit_code':result.returncode,'copy':str(copy),'manifest_sha256':hashlib.sha256((e/'inputs-final.json').read_bytes()).hexdigest(),'log_sha256':hashlib.sha256((root/(mode+'.log')).read_bytes()).hexdigest()}
(root/(mode+'.json')).write_text(json.dumps(receipt,indent=2)+'\n');print(root);print(json.dumps(receipt));sys.exit(result.returncode)
