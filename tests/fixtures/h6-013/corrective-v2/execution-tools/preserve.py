import pathlib,subprocess,json,hashlib,stat,tarfile,datetime
R=pathlib.Path('/Users/andres/Developer/crm-huescaventura-os'); A=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDITS/H6-013-second-independent-20261020T113726Z'); O=pathlib.Path(__file__).parent; C=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-pre-v2-20261020T162705Z')
def git(*args):return subprocess.check_output(['git',*args],cwd=R,env={'PATH':'/usr/bin:/bin','GIT_OPTIONAL_LOCKS':'0'}).decode()
def sha(b):return hashlib.sha256(b).hexdigest()
def descriptor(p):
 s=p.lstat(); assert stat.S_ISREG(s.st_mode),p
 return dict(type='file',mode=oct(stat.S_IMODE(s.st_mode)),bytes=s.st_size,sha256=sha(p.read_bytes()))
def save(p,d):p.write_text(json.dumps(d,indent=2,sort_keys=True)+'\n')
assert git('branch','--show-current').strip()=='main'
assert git('rev-parse','HEAD','origin/main').split()==['8a5f1408777b81b760a02646fa414a34dc17983e']*2
assert git('rev-parse','HEAD^{tree}').strip()=='758e871c7ad621dcbdb69516cccd175e529dbd6e'
assert not git('diff','--cached','--raw') and not git('diff','--raw')
tracked={}
for entry in git('ls-tree','-rz','HEAD').split('\0'):
 if not entry:continue
 attr,p=entry.split('\t');mode,typ,oid=attr.split();b=(R/p).read_bytes();s=(R/p).lstat()
 assert typ=='blob' and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==oid,p
 assert ('100755' if s.st_mode&0o111 else '100644')==mode,p
 tracked[p]=dict(gitBlob=oid,**descriptor(R/p))
assert len(tracked)==38702
previous=json.loads((A/'candidate-inventory.json').read_text())
paths=git('ls-files','--others','--exclude-standard','-z').strip('\0').split('\0')
assert set(paths)==set(previous) and len(paths)==15537
current={p:descriptor(R/p) for p in sorted(paths)}
assert current==previous,[(p,current[p],previous[p]) for p in paths if current[p]!=previous[p]][:10]
provided=json.loads((A/'preflight.json').read_text())['providedHashes']
assert all(current[p]['sha256']==s for p,s in provided.items())
assert sum(d['bytes'] for d in current.values())==210646948
C.mkdir();save(C/'v1-inventory.json',current)
with tarfile.open(C/'candidate-v1.tar','x',format=tarfile.PAX_FORMAT) as tar:
 for p in sorted(paths):tar.add(R/p,arcname=p,recursive=False)
with tarfile.open(C/'candidate-v1.tar','r') as tar:
 members=tar.getmembers();assert len(members)==len(current)
 for m in members:
  d=current[m.name];assert m.isfile() and oct(m.mode)==d['mode'] and m.size==d['bytes'] and sha(tar.extractfile(m).read())==d['sha256'],m.name
# Verify durable independent audit archive without changing it.
ap=A.parent/(A.name+'-evidence.tar');assert sha(ap.read_bytes())=='4cce36061f9ade039aac5dc10ecff7d610ac4e59c757926c7855b7302a4e5bec'
receipt=dict(createdUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),base=git('rev-parse','HEAD').strip(),tree=git('rev-parse','HEAD^{tree}').strip(),branch='main',tracked=len(tracked),candidate=len(current),bytes=sum(d['bytes'] for d in current.values()),archive=descriptor(C/'candidate-v1.tar'),inventory=descriptor(C/'v1-inventory.json'),auditInventory=descriptor(A/'candidate-inventory.json'),auditArchive=dict(path=str(ap),**descriptor(ap)),verifiedAllMembers=True,index=descriptor(R/'.git/index'),providedHashes=provided,limitations='Local mutable filesystem; no WORM/external guarantee. Full V1 restored from archive member descriptors; Git base recoverable by commit.')
save(C/'receipt.json',receipt);save(C/'seal.json',{'receiptSha256':sha((C/'receipt.json').read_bytes())});save(O/'preflight.json',receipt);save(O/'tracked-before.json',tracked)
ignored=git('ls-files','--others','--ignored','--exclude-standard','-z').strip('\0').split('\0');save(O/'ignored-before.json',{p:descriptor(R/p) for p in ignored if (R/p).is_file() and not (R/p).is_symlink()})
print(json.dumps({'custody':str(C),'candidate':len(current),'tracked':len(tracked),'archiveSha256':receipt['archive']['sha256'],'receiptSha256':sha((C/'receipt.json').read_bytes())}))
