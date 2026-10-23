"""Copy only this auditor's stopped private synthetic resources; never removes originals."""
import datetime,hashlib,json,os,re,shutil,stat,subprocess,sys,time
from pathlib import Path
os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-bootstrap-independent'
DEST=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015')/sys.argv[1]
assert not DEST.exists(),'NEW_CUSTODY_DESTINATION_REQUIRED'
roots=[Path(x)for x in sys.argv[2:]]
assert len(roots)>0 and len(set(roots))==len(roots)
for p in roots:
 assert p.is_dir()and not p.is_symlink()and re.fullmatch('/tmp/h6ba-[A-Za-z0-9_-]+',str(p))
 assert not list(p.rglob('postmaster.pid')),'ALL_POSTGRES_RESOURCES_MUST_BE_STOPPED'
DEST.mkdir(mode=0o700)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for chunk in iter(lambda:f.read(1048576),b''):h.update(chunk)
 return h.hexdigest()
entries=[];allpaths=[DEST]
for root in roots:
 for here,dirs,files in os.walk(root,followlinks=False):
  h=Path(here);target=DEST/root.name/h.relative_to(root);target.mkdir(mode=0o700,parents=True,exist_ok=True);allpaths.append(target)
  assert not h.is_symlink()
  for name in dirs:assert not(h/name).is_symlink()
  for name in files:
   src=h/name;dst=target/name;assert src.is_file()and not src.is_symlink()
   digest=sha(src);size=src.stat().st_size
   with src.open('rb')as inp,dst.open('xb')as out:shutil.copyfileobj(inp,out)
   os.chmod(dst,0o600)
   assert digest==sha(src)==sha(dst)and size==src.stat().st_size==dst.stat().st_size
   entries.append({'source':str(src),'destination':str(dst),'sha256':digest,'bytes':size});allpaths.append(dst)
inventory=DEST/'private-inventory.json';inventory.write_text(json.dumps(entries,indent=2)+'\n');allpaths.append(inventory)
assert all(stat.S_IMODE(p.stat().st_mode)==(0o700 if p.is_dir()else 0o600)and p.stat().st_uid==os.getuid()for p in allpaths)
for i in range(0,len(allpaths),100):
 res=subprocess.run(['/bin/ls','-lde',*[str(x)for x in allpaths[i:i+100]]],capture_output=True,text=True)
 assert res.returncode==0 and not re.search(r'^\s*\d+:.*\ballow\b',res.stdout,re.MULTILINE)
receipt={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':'PASS_PERSISTENT_PRIVATE_COPY','custody':str(DEST),'sources':list(map(str,roots)),'files':len(entries),'bytes':sum(x['bytes']for x in entries),'privateInventorySHA256':sha(inventory),'permissions':'directories0700/files0600/current-user/no-symlink/no-allow-ACL','sourceRetained':True,'resourcesStopped':True,'payloadNotExported':True}
p=OUT/('custody-'+str(time.time_ns())+'.json');p.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({'receipt':str(p),**receipt}))
