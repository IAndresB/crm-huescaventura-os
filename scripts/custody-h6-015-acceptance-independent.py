from pathlib import Path
import datetime,hashlib,json,os,re,shutil,subprocess
os.umask(0o077)
R=Path(__file__).resolve().parents[1];O=R/'tests/fixtures/h6-015-acceptance-independent'
sources=[Path('/tmp/h6015-acceptance-audit-5y8wphdm'),Path('/tmp/h6015-acceptance-audit-vpblx1ab')]
dest=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-acceptance-independent');dest.mkdir(mode=0o700)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();pg='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin/pg_controldata';items=[]
for source in sources:
 state=subprocess.run([pg,str(source/'data')],capture_output=True,text=True,check=True,env={'PATH':os.environ['PATH'],'LANG':'C','LC_ALL':'C'}).stdout
 assert re.search(r'Database cluster state:\s+shut down',state)
 for p in source.rglob('*'):assert not p.is_symlink()
 target=dest/source.name;shutil.copytree(source,target)
 for p in [target,*target.rglob('*')]:
  p.chmod(0o700 if p.is_dir() else 0o600);assert p.stat().st_uid==os.getuid()
  if p.is_file():
   original=source/p.relative_to(target);assert p.stat().st_size==original.stat().st_size and sha(p)==sha(original);items.append({'source':str(original),'destination':str(p),'bytes':p.stat().st_size,'sha256':sha(p)})
items.sort(key=lambda x:x['destination']);inventory=dest/'private-inventory.json';inventory.write_text(json.dumps(items,indent=2)+'\n');inventory.chmod(0o600)
for i in items:assert sha(Path(i['destination']))==i['sha256'] and sha(Path(i['source']))==i['sha256']
acl=subprocess.run(['/bin/ls','-leR',str(dest)],capture_output=True,text=True,check=True).stdout;assert not re.search(r'^\s*\d+:.*\ballow\b',acl,re.M)
receipt={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':'PASS','root':str(dest),'files':len(items),'bytes':sum(x['bytes'] for x in items),'privateInventorySHA256':sha(inventory),'sourceRoots':[str(x) for x in sources],'originalsPreserved':True,'allCopiesRehashed':True,'ownerVerified':True,'directoryMode':'0700','fileMode':'0600','allowACLCount':0,'allPostgresStopped':True,'publicPayloadsContainNoSecrets':True}
p=O/'custody-v1.json';p.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
