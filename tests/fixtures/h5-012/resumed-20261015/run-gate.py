import json,sys,os,hashlib,subprocess,time,datetime
from pathlib import Path
e=Path(__file__).resolve().parent
run,gate=sys.argv[1:];manifest=e/('inputs-'+run+'.json');m=json.loads(manifest.read_text());d=Path(m['copy'])
commands={'references':['node','scripts/test-postgres.mjs','postgres-h5-012-reference-chain.test.ts'],'f02':['node','scripts/test-postgres.mjs','postgres-h5-012-f02.test.ts'],'focal':['node','scripts/test-postgres.mjs','postgres-h5-012-complete.test.ts','postgres-h5-012-independent.test.ts','postgres-h5-012-f01-corrective.test.ts','postgres-h5-012-f01-security.test.ts','postgres-h5-012-f02.test.ts','postgres-h5-012-final-migration.test.ts','postgres-h5-012-final-security.test.ts'],'full':['node','scripts/test-postgres.mjs'],'unit':['pnpm','test'],'typecheck':['pnpm','typecheck'],'lint':['pnpm','lint'],'build':['pnpm','build'],'audit':['pnpm','audit','--prod','--json'],'health':['node','--test','tests/operations/supabase-health.test.mjs']}
for i in m['inputs']:assert hashlib.sha256((d/i['path']).read_bytes()).hexdigest()==i['sha256'],i['path']
log=e/(run+'-'+gate+'.log');receipt=e/(run+'-'+gate+'.json');assert not log.exists() and not receipt.exists()
env=dict(os.environ,POSTGRES_H0_BIN='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin');start=time.time();utc=datetime.datetime.now(datetime.timezone.utc).isoformat()
with log.open('x') as f:p=subprocess.run(commands[gate],cwd=d,env=env,stdout=f,stderr=subprocess.STDOUT)
r={'run':run,'gate':gate,'command':commands[gate],'cwd':str(d),'utc':utc,'seconds':time.time()-start,'exit_code':p.returncode,'manifest_sha256':hashlib.sha256(manifest.read_bytes()).hexdigest(),'log_sha256':hashlib.sha256(log.read_bytes()).hexdigest()};receipt.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r));print('\n'.join(log.read_text().splitlines()[-35:]));sys.exit(p.returncode)
