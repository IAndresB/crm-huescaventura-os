from pathlib import Path
import hashlib,json,subprocess,datetime
root=Path('.').resolve();src=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os/tests/fixtures/h6-017/preservation/readback-v3.json');index=json.loads(src.read_text())['H6015'];checked=[];bad=[]
for package in index['packages']:
 mp=root/package['manifest']; assert hashlib.sha256(mp.read_bytes()).hexdigest()==package['manifestSHA256']
 for r in package['resolutions']:
  origin=r['resolved']
  if origin.startswith('/'):
   p=Path(origin); assert '/crm-huescaventura-os/' in str(p) and (r['path'].startswith(('tests/','scripts/','docs/','specs/','supabase/','src/'))or r['path'] in ['README.md','package.json','pnpm-lock.yaml','tsconfig.json','next-env.d.ts','.gitignore','next.config.ts','eslint.config.mjs']);data=p.read_bytes()
  elif origin.startswith('published-canonical-identical:'):data=(root/r['path']).read_bytes()
  elif origin.startswith(('snapshot:','snapshot-identical:')):
   _,ref,path=origin.split(':',2);data=subprocess.check_output(['git','show',ref+':'+path])
  else: raise RuntimeError(origin)
  actual=hashlib.sha256(data).hexdigest()
  if actual!=r['sha256']:bad.append({'path':r['path'],'actual':actual,'expected':r['sha256']})
  checked.append({'path':r['path'],'sha256':actual})
out={'status':'PASS' if not bad else 'FAIL','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceLocatorOnly':str(src),'sourceSHA256':hashlib.sha256(src.read_bytes()).hexdigest(),'manifestCount':len(index['packages']),'entriesChecked':len(checked),'mismatches':bad,'readOnly':True,'runtimeAccess':False,'SQL':False,'S11':False,'suspendedJobsAccess':False,'entries':checked}
Path('audit/h6-002/H6015-documentary-integrity.json').write_text(json.dumps(out,indent=2)+'\n');assert not bad;print(out['status'],out['manifestCount'],out['entriesChecked'])
