from pathlib import Path
import os,json,hashlib,shutil,subprocess,datetime
os.umask(0o077)
roots=[Path('/tmp/h6accept-THXAhi'),Path('/tmp/h6accept-N9Gbju')]
dest=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-acceptance-focal');dest.mkdir(mode=0o700,exist_ok=False)
rows=[];total=0
for root in roots:
 data=subprocess.check_output(['/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin/pg_controldata',str(root/'data')],env={'PATH':os.environ['PATH'],'LANG':'C'}).decode();assert 'shut down' in data
 target=dest/root.name;shutil.copytree(root,target)
 for p in [target,*target.rglob('*')]:
  assert not p.is_symlink();assert p.stat().st_uid==os.getuid();p.chmod(0o700 if p.is_dir() else 0o600)
  if p.is_file():
   original=root/p.relative_to(target);a=hashlib.sha256(original.read_bytes()).hexdigest();b=hashlib.sha256(p.read_bytes()).hexdigest();assert a==b and original.stat().st_size==p.stat().st_size
   rows.append({'source':str(original),'destination':str(p),'bytes':p.stat().st_size,'sha256':b});total+=p.stat().st_size
allPaths=[dest,*dest.rglob('*')]
for i in range(0,len(allPaths),500):
 listing=subprocess.check_output(['ls','-lde',*[str(p) for p in allPaths[i:i+500]]]).decode();assert not any(' allow ' in line for line in listing.splitlines())
inv=dest/'private-inventory.json';inv.write_text(json.dumps(rows,indent=2)+'\n');inv.chmod(0o600)
receipt={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'root':str(dest),'files':len(rows),'bytes':total,'inventorySHA256':hashlib.sha256(inv.read_bytes()).hexdigest(),'originalsPreserved':True,'allCopiesRehashed':True,'ownerVerified':True,'modes':'directories0700/files0600','allowACL':0,'resourcesStopped':True,'privatePayloadsExcluded':True}
Path('tests/fixtures/h6-015-acceptance/custody-v1.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
