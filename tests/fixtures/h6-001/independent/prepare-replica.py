from pathlib import Path
import subprocess,json,hashlib,shutil,os,datetime
source=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os')
root=Path('/tmp/h6-001-audit');dest=root/'replica';manifest=[]
if dest.exists(): raise SystemExit('replica exists; do not overwrite')
subprocess.run(['git','clone','--shared','--quiet',str(source),str(dest)],check=True)
inputs=json.loads((source/'tests/fixtures/h6-001/inherited-inputs.json').read_text())
for entry in inputs['files']:
 p=source/entry['path'];b=p.read_bytes();assert hashlib.sha256(b).hexdigest()==entry['sha256'],entry['path']
 q=dest/entry['path'];q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q);manifest.append(entry)
(dest/'node_modules').symlink_to(source/'node_modules',target_is_directory=True)
for rel in ['src','supabase/migrations']:
 for p in (source/rel).rglob('*'):
  if p.is_file():
   q=dest/p.relative_to(source)
   assert q.is_file() and p.read_bytes()==q.read_bytes(),str(p)
functional=[]
for rel in ['src','supabase/migrations','tests/support','tests/integration','scripts']:
 for p in (dest/rel).rglob('*'):
  if p.is_file(): functional.append({'path':str(p.relative_to(dest)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
for name in ['package.json','pnpm-lock.yaml','tsconfig.json']:
 p=dest/name;functional.append({'path':name,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(root/'received-product.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':str(source),'base':inputs['baseCommit'],'inherited':manifest,'functional':sorted(functional,key=lambda x:x['path'])},indent=2)+'\n')
runtime=root/'runtime';runtime.mkdir(mode=0o700)
(runtime/'crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e').symlink_to('/tmp/crm-h6-local-2accac43ca72/crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e',target_is_directory=True)
print(json.dumps({'replica':str(dest),'functionalFiles':len(functional),'inheritedFiles':len(manifest),'sourceProductExact':True}))
