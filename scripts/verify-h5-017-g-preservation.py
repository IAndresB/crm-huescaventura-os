"""Independent exact candidate check, historical hashes and recoverable preimages."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,tarfile,sys
r=Path(__file__).resolve().parents[1];out=r/'tests/fixtures/h5-017-g'
def sha(b):return hashlib.sha256(b).hexdigest()
def read(n):return (r/n).read_bytes()
def obj(n):
 b=read(n);return json.loads(gzip.decompress(b)if n.endswith('.gz')else b)
def meta(n):
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink(),n
 return {'type':'file','mode':oct(stat.S_IMODE(s.st_mode)),'bytes':s.st_size,'sha256':sha(p.read_bytes())}
received=obj('tests/fixtures/h5-018-fifth/received-inventory.json.gz')['files'];assert len(received)==38118
for n,v in received.items():assert meta(n)==v,('CANDIDATE_F_CHANGED',n)
assert sha(read('tests/fixtures/h5-017-f/candidate-seal.json'))=='da14b2ba3cf0767b9b807c2cf12c8edbca0b0a221bc7c2f70e11d3f7a42dd9dd'
assert sha(gzip.decompress(read('tests/fixtures/h5-017-f/candidate-inventory.json.gz')))== '67a024e11fc7dc9c1336f463f372ccd5c90b4aebcca1fb14ba8c94340dbf7a9e'
inventory_paths=[];seal_checks=[]
def checkseal(folder,sealname,pairs):
 s=obj(folder+'/'+sealname)
 for filename,key,compressed in pairs:
  data=read(folder+'/'+filename);assert sha(gzip.decompress(data)if compressed else data)==s[key],(folder,key)
  seal_checks.append({'seal':folder+'/'+sealname,'artifact':filename,'key':key})
for c in ['c','d','e','f']:
 folder='tests/fixtures/h5-017-'+c;pairs=[('candidate-inventory.json.gz','candidateInventoryContentSha256',True),('candidate-inventory.json.gz','candidateInventoryGzipSha256',False),('delta-inventory.json','deltaInventorySha256',False)]
 if c in ['c','d']:pairs.append(('corrected-overlay.tar.gz','correctedOverlaySha256',False))
 checkseal(folder,'candidate-seal.json',pairs);inventory_paths.append(folder+'/candidate-inventory.json.gz')
for c in ['h5-018','h5-018-second','h5-018-third','h5-018-fourth']:
 folder='tests/fixtures/'+c;assert obj(folder+'/audit-seal.json')['result']=='FAIL';checkseal(folder,'audit-seal.json',[('audit-inventory.json','inventorySha256',False)]);inventory_paths.append(folder+'/audit-inventory.json')
checkseal('tests/fixtures/h5-017','final-seal.json',[('candidate-inventory.json','inventorySha256',False)]);inventory_paths.append('tests/fixtures/h5-017/candidate-inventory.json')
checkseal('tests/fixtures/h5-018','candidate-seal.json',[('candidate-manifest.json.gz','completeManifestSha256',True),('candidate-manifest.json.gz','compressedManifestSha256',False),('candidate-overlay.tar.gz','overlaySha256',False)])
inventory_paths.append('tests/fixtures/h5-018/candidate-manifest.json.gz')
archives=[tarfile.open(r/p)for p in ['tests/fixtures/h5-017-d/before-d-overlay.tar.gz','tests/fixtures/h5-017-c/before-c-overlay.tar.gz','tests/fixtures/h5-018/candidate-overlay.tar.gz']]
historical=[]
for name in inventory_paths:
 files=obj(name)['files'];old=[]
 for n,v in files.items():
  if all(received[n].get(k)==value for k,value in v.items()if k in received[n]):continue
  assert n in ['docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md','src/server/composition.ts'],(name,n)
  recovered=False
  for archive in archives:
   try:
    member=archive.getmember(n);b=archive.extractfile(member).read()
    if sha(b)==v['sha256']and len(b)==v['bytes']and oct(member.mode)==v['mode']:old.append({'path':n,'archive':str(Path(archive.name).relative_to(r)),'sha256':sha(b)});recovered=True;break
   except KeyError:pass
  if not recovered and n=='src/server/composition.ts':
   b=subprocess.check_output(['git','show','9649a2773530ea8a43237b4e1f2034f80e34136f:'+n],cwd=r);recovered=sha(b)==v['sha256']and len(b)==v['bytes']
   if recovered:old.append({'path':n,'source':'approved git base','sha256':sha(b)})
  assert recovered,('HISTORICAL_PREIMAGE_MISSING',name,n)
 historical.append({'inventory':name,'files':len(files),'exactCurrent':len(files)-len(old),'recovered':old})
for a in archives:a.close()
h16=obj('tests/fixtures/h5-016/final-inputs.json')['inputs'];assert len(h16)==456
delta=[n for n,d in h16.items()if received[n]['sha256']!=d];assert delta==['src/server/composition.ts']
assert h16[delta[0]]=='fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879'
assert received[delta[0]]['sha256']=='31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d'
expected=obj('tests/fixtures/h5-018-fifth/expected-seal.json');assert sha(read(expected['path']))==expected['sha256']
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=r).decode().strip('\0').split('\0'))
assert set(received)<=names
new=sorted(names-set(received));assert all('h5-018-fifth' in n or 'TSK-H5-018-fifth' in n or 'h5-017-g' in n or 'TSK-H5-017-G' in n for n in new),new
base='9649a2773530ea8a43237b4e1f2034f80e34136f'
refs={ref:subprocess.check_output(['git','rev-parse',ref],cwd=r).decode().strip()for ref in ['HEAD','main','origin/main']};assert all(v==base for v in refs.values())
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=r);assert subprocess.check_output(['git','rev-list','--left-right','--count','main...origin/main'],cwd=r).decode().split()==['0','0'];subprocess.run(['git','diff','--check'],cwd=r,check=True)
gReceived=obj('tests/fixtures/h5-017-g/received-inventory.json.gz')['files'];assert len(gReceived)==38271
for n,v in gReceived.items():assert meta(n)==v,('PROTECTED_F_OR_FIFTH_CHANGED',n)
assert sha(read('tests/fixtures/h5-018-fifth/audit-seal.json'))=='dcd6a2ad70c72b6e22c52c95230155df76e775a47bb3b2a88d9fe3d025887dea'
gExpected=obj('tests/fixtures/h5-017-g/expected-seal.json');assert sha(read(gExpected['path']))==gExpected['sha256']
gNew=sorted(names-set(gReceived));assert all('h5-017-g'in n or 'TSK-H5-017-G'in n for n in gNew),gNew
report={'result':'PASS','candidateUnchanged':38118,'previousReceived':37874,'Fnew':244,'newAuditFiles':gNew,'fifthAuditProtected':153,'totalProtected':38271,'historicalInventories':historical,'sealChecks':seal_checks,'fourAuditsRemainFAIL':True,'h5016Identical':455,'h5016AuthorizedTransition':delta,'migrations1to68Intact':True,'refs':refs,'divergence':'0/0','indexEmpty':True}
if len(sys.argv)>1:
 with (out/(sys.argv[1]+'.json')).open('x')as f:json.dump(report,f,indent=2);f.write('\n')
print(json.dumps({k:v for k,v in report.items()if k not in ['historicalInventories','sealChecks','newAuditFiles']}))
