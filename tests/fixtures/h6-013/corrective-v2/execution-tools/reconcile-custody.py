import pathlib,json,hashlib,stat,tarfile,datetime,tempfile,os
O=pathlib.Path(__file__).parent;C=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-precorrectivo-20261019T233427Z');T=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-auditor-archive-recovery-20261020T003459Z');A=pathlib.Path('/Users/andres/Documents/CRM_HUESCAVENTURA_AUDITS/H6-013-second-independent-20261020T113726Z')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def desc(p):
 s=p.lstat();return {'type':'file' if stat.S_ISREG(s.st_mode) else 'other','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p) if p.is_file() else None}
result={'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'historicalAudit':{'path':str(A/'custody-verification.json'),'sha256':sha(A/'custody-verification.json'),'reportedModeDifferences':{'candidate':20,'auditor':98}},'originalReceipts':{str(p):{'sha256':sha(p),'content':json.loads(p.read_text())} for d in [C,T] for p in d.glob('*.json') if 'inventory' not in p.name}}
inventories={}
for key in ['candidate','auditor']:
 inv=json.loads((C/(key+'-original-inventory.json')).read_text());inventories[key]=inv;base=C/(key+'-original');diff=[]
 actual={str(p.relative_to(base)) for p in base.rglob('*') if p.is_file() or p.is_symlink()};assert actual==set(inv)
 for p,d in inv.items():
  got=desc(base/p)
  if got!=d:diff.append({'path':p,'expected':d,'observed':got,'differentFields':[k for k in d if d[k]!=got[k]]})
 result[key]={'files':len(inv),'inventorySha256':sha(C/(key+'-original-inventory.json')),'differences':diff,'modeDifferences':sum('mode' in x['differentFields'] for x in diff),'contentTypeSizeDifferences':sum(any(k in x['differentFields'] for k in ['sha256','type','bytes']) for x in diff)}
 print(key,len(diff),flush=True)
archive=T/'auditor-original.tar';assert sha(archive)=='0ce0d6f83f1affdd9002b23676bc7daf0fb7c160257d696cac8f287676449f0f'
recovered=pathlib.Path(tempfile.mkdtemp(prefix='h6013-v2-recovery-',dir='/private/tmp'));inv=inventories['auditor'];seen=set()
with tarfile.open(archive,'r:') as tf:
 for m in tf:
  assert m.isfile() and m.name not in seen and m.name in inv and not pathlib.Path(m.name).is_absolute() and '..' not in pathlib.Path(m.name).parts,m.name
  seen.add(m.name);data=tf.extractfile(m).read();got={'type':'file','mode':oct(m.mode),'bytes':m.size,'sha256':hashlib.sha256(data).hexdigest()};assert got==inv[m.name],m.name
  p=recovered/m.name;p.parent.mkdir(parents=True,exist_ok=True)
  # Permissions are applied only on the new recovery destination, never on originals.
  with p.open('xb') as f:f.write(data)
  os.chmod(p,m.mode)
  assert desc(p)==inv[m.name],m.name
assert seen==set(inv)
for p,d in inventories['candidate'].items():assert inv['replica/'+p]==d and desc(recovered/'replica'/p)==d,p
result['recovery']={'source':str(archive),'sha256':sha(archive),'bytes':archive.stat().st_size,'auditorMembersVerifiedAndRecovered':len(seen),'candidateMembersRecovered':len(inventories['candidate']),'destination':str(recovered),'differences':[],'sourceUnmodified':True}
result.update(finishedUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(),cause='Not established; previous discrepancies remain historical discrepancies. Current loose copies are mutable.',scope='Local verified recovery only; no WORM, external copy or guaranteed availability.')
(O/'custody-reconciliation-v2.json').write_text(json.dumps(result,indent=2)+'\n');print('recovery',len(seen),len(inventories['candidate']),flush=True)
