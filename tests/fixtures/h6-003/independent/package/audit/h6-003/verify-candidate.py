from pathlib import Path
import json,hashlib,stat,subprocess,tarfile,re,datetime
r=Path('/Users/andres/.codex/worktrees/h6-003-local-isolated/crm-huescaventura-os');d=r/'tests/fixtures/h6-003';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();bad=[];m=json.loads((d/'technical-manifest.json').read_text());s=json.loads((d/'technical-seal.json').read_text());assert sha(d/'technical-manifest.json')=='3c3e1e3f78df762e2a52d5a04a5d181cb0e9b9d31b0c5b88f4c24e4a06715f83'==s['manifestSHA256'];assert sha(d/'technical-seal.json')=='242a78a8722b7513c6f4ec635001906d81715e82cb30c2b4a305ec97dd2e7f09';files=m['files'];expected={x['path']:x for x in files};assert len(files)==311==len(expected)
for x in files:
 p=r/x['path'];mode=x['mode'];mode=int(mode,8)if isinstance(mode,str)else mode
 if not p.is_file()or p.is_symlink()or sha(p)!=x['sha256']or p.stat().st_size!=x['bytes']or stat.S_IMODE(p.stat().st_mode)!=mode:bad.append(x['path'])
 for pattern in [r'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'sk-(?:proj-)?[A-Za-z0-9_-]{35,}']:
  if p.suffix in ['.json','.log','.md','.ts','.mjs','.py']and re.search(pattern,p.read_text()):bad.append('SENSITIVE_PATTERN:'+x['path'])
for p in subprocess.check_output(['git','ls-files','src','supabase/migrations'],cwd=r).decode().splitlines():
 if (Path.cwd()/p).read_bytes()!=(r/p).read_bytes():bad.append('protected:'+p)
assert not subprocess.check_output(['git','diff','--name-only'],cwd=r).strip();assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r).strip()
extras=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))-set(expected);assert extras==set(m['selfMetadataExcluded']),extras
archive=d/'technical-custody-v1.tar.gz';assert sha(archive)==s['archiveSHA256']=='36ea96678fdfe6bf7d9aaea990cd7c1e465cb1ada251115935e7ff8b90e1374b';assert sha(d/'technical-custody-readback.json')==s['custodyReadbackSHA256']=='bab3238bb439e2b0fd9012a7d158de23d9805553344e9c1c90fefa1b04bb5551';p=d/'technical-manifest.json';expected[p.relative_to(r).as_posix()]={'bytes':p.stat().st_size,'sha256':sha(p),'mode':oct(stat.S_IMODE(p.stat().st_mode))};seen=[]
with tarfile.open(archive,'r:gz')as tar:
 for member in tar:
  seen.append(member.name);x=expected.get(member.name);assert x is not None,member.name;data=tar.extractfile(member).read();mode=int(x['mode'],8)
  if len(data)!=x['bytes']or hashlib.sha256(data).hexdigest()!=x['sha256']or member.mode!=mode:bad.append('archive:'+member.name)
assert len(seen)==len(set(seen))==312 and set(seen)==set(expected);assert not bad,bad
runs=[]
for p in sorted((d/'runs').iterdir()):
 if p.is_dir()and(p/'result.json').is_file():
  result=json.loads((p/'result.json').read_text());text=(p/'stdout.log').read_text();runs.append({'run':p.name,'status':result['status'],'summary':re.findall(r'ℹ (?:tests|pass|fail|skipped) \d+',text)})
q=[]
for p in d.glob('quality/**/*.status.json'):
 x=json.loads(p.read_text());q.append({'path':str(p.relative_to(r)),'status':x})
out={'status':'PASS','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'filesChecked':len(files),'manifestSHA256':sha(d/'technical-manifest.json'),'sealSHA256':sha(d/'technical-seal.json'),'archiveSHA256':sha(archive),'archiveMembersFullStream':len(seen),'archiveExtracted':False,'metadataExcludedExact':sorted(extras),'mismatches':bad,'protected110ProductAnd68MigrationsMatchOwnAuditedBase':True,'secretPatternsFound':0,'runs':runs,'quality':q};Path('audit/h6-003/candidate-readback.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items()if k not in ['runs','quality']}))
