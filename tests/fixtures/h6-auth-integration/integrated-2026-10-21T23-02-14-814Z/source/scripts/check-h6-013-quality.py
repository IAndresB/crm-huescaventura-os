"""Check final new test in a separate source replica; build/type artifacts never reach workspace."""
import json,pathlib,tempfile,shutil,subprocess,os,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-013';replica=pathlib.Path(tempfile.mkdtemp(prefix='crm-h6013-quality-'))
base=json.loads((OUT/'base-inventory.json').read_text())
for part,info in base['files'].items():
 target=replica/part;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/part,target)
 assert hashlib.sha256(target.read_bytes()).hexdigest()==info['sha256']
for p in (ROOT/'tests/integration').glob('*h6-013*.ts'):shutil.copy2(p,replica/'tests/integration'/p.name)
shutil.copytree(ROOT/'node_modules',replica/'node_modules',symlinks=True)
# Separate Git metadata, only read-only historical queries in unit checks.
(replica/'.git').mkdir()
for p in ['HEAD','config','index','packed-refs','shallow']:
 if (ROOT/'.git'/p).exists():shutil.copy2(ROOT/'.git'/p,replica/'.git'/p)
shutil.copytree(ROOT/'.git/refs',replica/'.git/refs');(replica/'.git/objects').symlink_to(ROOT/'.git/objects',target_is_directory=True)
env={k:v for k,v in os.environ.items() if not k.startswith(('PG','DATABASE','SUPABASE','NODE_OPTIONS'))}
commands=[['pnpm','install','--frozen-lockfile','--offline','--ignore-scripts'],['pnpm','typecheck'],['pnpm','lint'],['pnpm','test'],['pnpm','build']]
results=[]
for i,c in enumerate(commands,1):
 with (OUT/f'quality-{i}.stdout.log').open('xb') as o,(OUT/f'quality-{i}.stderr.log').open('xb') as e:p=subprocess.run(c,cwd=replica,env=env,stdout=o,stderr=e)
 results.append({'command':c,'exit':p.returncode});print(c,p.returncode,flush=True)
(OUT/'quality-result.json').write_text(json.dumps({'replica':str(replica),'results':results},indent=2)+'\n')
