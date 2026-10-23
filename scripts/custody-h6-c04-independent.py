"""Copy and seal only synthetic private auditor resources, never remove originals."""
import datetime,hashlib,json,os,pathlib,re,shutil,subprocess,time
os.umask(0o077); ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-c04-independent';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
sources=[pathlib.Path(x) for x in ['/tmp/h6c04-audit-db-sp4dd2vt','/tmp/h6c04-audit-base-gbgucgj0','/tmp/h6c04-audit-final-ingy90f8']]
dest=pathlib.Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-c04-independent');dest.mkdir(mode=0o700,exist_ok=False)
entries=[];bad=[]
for source in sources:
 target=dest/source.name
 if any(p.is_symlink() for p in source.rglob('*')):raise RuntimeError('SOURCE_SYMLINK')
 if any(p.name=='postmaster.pid' for p in source.rglob('*')):raise RuntimeError('SOURCE_RUNNING')
 shutil.copytree(source,target)
 for p in target.rglob('*'):
  if p.is_dir():os.chmod(p,0o700)
  elif p.is_file():
   os.chmod(p,0o600);original=source/p.relative_to(target);digest=sha(original)
   if sha(p)!=digest:bad.append(str(p.relative_to(dest)))
   entries.append({'source':str(original),'destination':str(p),'bytes':p.stat().st_size,'sha256':digest})
 entries.sort(key=lambda x:x['destination'])
inv=dest/'private-inventory.json';inv.write_text(json.dumps(entries,indent=2)+'\n');os.chmod(inv,0o600)
for p in [dest,*dest.rglob('*')]:
 if p.stat().st_uid!=os.getuid() or p.stat().st_mode&0o777!=(0o700 if p.is_dir() else 0o600):bad.append('MODE_OR_OWNER')
ls=subprocess.run(['/bin/ls','-leR',str(dest)],capture_output=True,check=True).stdout.decode();allow=len(re.findall(r'^\s*\d+:.*\ballow\b',ls,re.M))
if allow:bad.append('ACL_ALLOW')
for x in entries:
 if sha(pathlib.Path(x['source']))!=x['sha256'] or sha(pathlib.Path(x['destination']))!=x['sha256']:bad.append('HASH_RECHECK')
r={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':'PASS' if not bad else 'FAIL','sources':list(map(str,sources)),'destination':str(dest),'files':len(entries),'bytes':sum(x['bytes'] for x in entries),'inventorySHA256':sha(inv),'modes':'directories700/files600','ownerVerified':True,'allowACLCount':allow,'originalsPreserved':True,'allResourcesStopped':True,'failures':bad,'excludedFromGitAndDrive':True}
p=OUT/'custody-receipt-v1.json';p.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'state':r['state'],'files':r['files'],'bytes':r['bytes'],'inventorySHA256':r['inventorySHA256'],'receiptSHA256':sha(p)}))
