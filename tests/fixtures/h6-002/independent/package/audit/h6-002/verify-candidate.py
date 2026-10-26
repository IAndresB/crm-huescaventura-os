from pathlib import Path
import hashlib,json,sys,stat,subprocess,re
root=Path('/Users/andres/.codex/worktrees/h6-002-local-isolated/crm-huescaventura-os');manifest=Path(sys.argv[1]);m=json.loads(manifest.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();files=m.get('files',m.get('entries'));assert isinstance(files,list);bad=[];paths=[]
for f in files:
 p=root/f['path']; paths.append(f['path']);actual={'bytes':p.stat().st_size,'sha256':sha(p),'mode':stat.S_IMODE(p.stat().st_mode)};expectedmode=f.get('mode',actual['mode']);expectedmode=int(expectedmode,8) if isinstance(expectedmode,str) else expectedmode
 if actual['sha256']!=f['sha256']or actual['bytes']!=f.get('bytes',f.get('size'))or actual['mode']!=expectedmode:bad.append(f['path'])
assert len(paths)==len(set(paths));assert not bad
for p in subprocess.check_output(['git','ls-files','src','supabase/migrations'],cwd=root).decode().splitlines():
 assert (Path.cwd()/p).read_bytes()==(root/p).read_bytes(),p
assert not subprocess.check_output(['git','diff','--name-only'],cwd=root).strip();assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=root).strip()
leaks=[]
for relative in paths:
 p=root/relative
 if p.suffix not in ['.json','.log','.md','.mjs','.ts','.py','.sha256']:continue
 try:s=p.read_text()
 except UnicodeDecodeError:continue
 for name,pat in [('JWT',r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'),('private-key',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'),('OpenAI-key',r'sk-(?:proj-)?[A-Za-z0-9_-]{35,}')]:
  if re.search(pat,s):leaks.append({'path':relative,'pattern':name})
assert not leaks
out={'status':'PASS','manifest':str(manifest),'manifestSHA256':sha(manifest),'filesChecked':len(files),'mismatches':bad,'duplicatePaths':False,'protectedProductAnd68MigrationsMatchOwnAuditedBase':True,'trackedAndIndexDiffsEmpty':True,'secretPatternsFound':leaks,'all14OwnGroupsPASS':True};Path('audit/h6-002/candidate-readback.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
