"""Additive owner-only custody of receipt-referenced bootstrap variant resources."""
import datetime,hashlib,json,os,shutil,stat,subprocess
from pathlib import Path
os.umask(0o077)
W=Path(__file__).resolve().parents[1]
O=W/'tests/fixtures/h6-bootstrap-variant'
D=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-bootstrap-variant')
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def main():
 assert not D.exists(),'NEW_CUSTODY_REQUIRED'
 roots={json.loads(p.read_text())['privateRoot'] for p in (O/'runs').glob('*/report.json')}
 for root in roots:
  p=Path(root);assert str(p).startswith('/tmp/h6boot-') and p.is_dir() and not p.is_symlink()
  assert not list(p.rglob('postmaster.pid')),'RESOURCE_MUST_BE_STOPPED'
 assert D.resolve()==D and 'CloudStorage' not in str(D)
 D.mkdir(mode=0o700);rows=[];resources=[]
 for root in sorted(roots):
  source=Path(root);target=D/source.name;target.mkdir(mode=0o700);n=total=0
  for p in sorted(source.rglob('*')):
   info=p.lstat();assert info.st_uid==os.getuid() and not stat.S_ISLNK(info.st_mode)
   q=target/p.relative_to(source)
   if stat.S_ISDIR(info.st_mode):q.mkdir(mode=0o700)
   else:
    assert stat.S_ISREG(info.st_mode),'SPECIAL_FILE_REJECTED'
    before=digest(p);shutil.copyfile(p,q);os.chmod(q,0o600)
    assert digest(q)==before==digest(p) and q.stat().st_size==info.st_size
    rows.append({'source':str(p),'destination':str(q),'bytes':info.st_size,'sha256':before});n+=1;total+=info.st_size
  resources.append({'sourceRoot':root,'custodyRoot':str(target),'files':n,'bytes':total})
 inv=D/'private-inventory.json';inv.write_text(json.dumps(rows,indent=2)+'\n');os.chmod(inv,0o600)
 paths=[D,*D.rglob('*')]
 for p in paths:
  info=p.lstat();assert info.st_uid==os.getuid() and stat.S_IMODE(info.st_mode)==(0o700 if p.is_dir() else 0o600)
 for i in range(0,len(paths),200):
  acl=subprocess.run(['/bin/ls','-lde',*map(str,paths[i:i+200])],capture_output=True,text=True,check=True).stdout
  assert ' allow ' not in acl,'UNEXPECTED_ALLOW_ACL'
 for r in rows:assert digest(Path(r['destination']))==r['sha256']==digest(Path(r['source']))
 receipt={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','root':str(D),'files':len(rows),'bytes':sum(r['bytes'] for r in rows),'privateInventorySHA256':digest(inv),'resources':resources,'directoryMode':'0700','fileMode':'0600','ownerVerified':True,'allowACL':False,'symlinks':False,'originalsDeleted':False,'allSourceAndCopiesRehashed':True,'scriptSHA256':digest(Path(__file__))}
 (O/'custody-receipt-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps({k:receipt[k] for k in ['status','files','bytes','privateInventorySHA256']}))
if __name__=='__main__':
 try:main()
 except Exception as e:print(json.dumps({'status':'FAIL_PRESERVED','error':type(e).__name__}));raise SystemExit(1)
