"""Independent verification; no writes to any candidate or predecessor file."""
from pathlib import Path
import gzip,hashlib,json,stat,subprocess,tarfile,sys
R=Path(__file__).resolve().parents[1]; O=R/'tests/fixtures/h5-018-third'
sha=lambda b:hashlib.sha256(b).hexdigest()
def read(p): return (R/p).read_bytes()
def obj(p):
 b=read(p);return json.loads(gzip.decompress(b) if p.endswith('.gz') else b)
pre=obj('tests/fixtures/h5-018-third/preflight.json.gz'); current={}
for n,m in pre['files'].items():
 p=R/n;s=p.lstat();assert stat.S_ISREG(s.st_mode) and not p.is_symlink(),n
 actual={'bytes':s.st_size,'mode':oct(stat.S_IMODE(s.st_mode)),'sha256':sha(p.read_bytes()),'type':'file'}
 assert actual==m,('CANDIDATE_CHANGED',n);current[n]=actual
assert len(current)==37400
archives=[tarfile.open(R/p)for p in ['tests/fixtures/h5-017-d/before-d-overlay.tar.gz','tests/fixtures/h5-017-c/before-c-overlay.tar.gz','tests/fixtures/h5-018/candidate-overlay.tar.gz']]
allowed={'docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md','src/server/composition.ts'}
results={}
def check_inventory(path):
 d=obj(path);recovered=[]
 for n,m in d['files'].items():
  actual=current[n]
  if all(actual.get(k)==v for k,v in m.items() if k in actual): continue
  assert n in allowed,(path,n)
  found=False
  for a in archives:
   try:
    member=a.getmember(n);b=a.extractfile(member).read()
    if sha(b)==m['sha256'] and len(b)==m['bytes'] and oct(member.mode)==m['mode']:
     found=True;recovered.append({'path':n,'archive':str(Path(a.name).relative_to(R)),'sha256':sha(b)});break
   except KeyError: pass
  if not found and n=='src/server/composition.ts':
   b=subprocess.check_output(['git','show',pre['base']+':'+n],cwd=R)
   if sha(b)==m['sha256'] and len(b)==m['bytes']:
    found=True;recovered.append({'path':n,'gitBase':pre['base'],'sha256':sha(b)})
  assert found,(path,n,'HISTORICAL_BYTES_UNAVAILABLE')
 results[path]={'files':len(d['files']),'currentExact':len(d['files'])-len(recovered),'authorizedPredecessorsRecovered':recovered}
for folder in ['h5-017-c','h5-017-d']:
 b='tests/fixtures/'+folder+'/';s=obj(b+'candidate-seal.json')
 for fn,key,unzip in [('candidate-inventory.json.gz','candidateInventoryContentSha256',True),('candidate-inventory.json.gz','candidateInventoryGzipSha256',False),('delta-inventory.json','deltaInventorySha256',False),('corrected-overlay.tar.gz','correctedOverlaySha256',False)]:
  data=read(b+fn);assert sha(gzip.decompress(data)if unzip else data)==s[key],(folder,fn)
 check_inventory(b+'candidate-inventory.json.gz')
for folder in ['h5-018','h5-018-second']:
 b='tests/fixtures/'+folder+'/';s=obj(b+'audit-seal.json');assert sha(read(b+'audit-inventory.json'))==s['inventorySha256'];check_inventory(b+'audit-inventory.json');assert s['result']=='FAIL'
s=obj('tests/fixtures/h5-018/candidate-seal.json');b=read('tests/fixtures/h5-018/candidate-manifest.json.gz');assert sha(gzip.decompress(b))==s['completeManifestSha256'];assert sha(b)==s['compressedManifestSha256'];assert sha(read('tests/fixtures/h5-018/candidate-overlay.tar.gz'))==s['overlaySha256'];check_inventory('tests/fixtures/h5-018/candidate-manifest.json.gz')
s=obj('tests/fixtures/h5-017/final-seal.json');assert sha(read('tests/fixtures/h5-017/candidate-inventory.json'))==s['inventorySha256'];check_inventory('tests/fixtures/h5-017/candidate-inventory.json')
old=obj('tests/fixtures/h5-016/final-inputs.json')['inputs'];changed=[n for n,h in old.items()if current[n]['sha256']!=h];assert len(old)==456 and changed==['src/server/composition.ts']
assert old[changed[0]]=='fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879'
assert current[changed[0]]['sha256']=='31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d'
assert sha(subprocess.check_output(['git','show',pre['base']+':'+changed[0]],cwd=R))==old[changed[0]]
expected=obj('tests/fixtures/h5-018-third/expected-seal.json');assert sha(read(expected['path']))==expected['sha256']
norm=obj('tests/fixtures/h5-018-third/normative-sources.json');assert all(sha(read(n))==h for n,h in norm['sources'].items())
assert all(subprocess.check_output(['git','rev-parse',ref],cwd=R).decode().strip()==pre['base']for ref in ['HEAD','main','origin/main'])
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=R)
assert subprocess.run(['git','diff','--check'],cwd=R,capture_output=True).returncode==0
names=set(subprocess.check_output(['git','ls-files','-c','-o','--exclude-standard','-z'],cwd=R).decode().strip('\0').split('\0'));assert not set(current)-names
new=sorted(names-set(current))
for n in new: assert 'h5-018-third' in n or 'H5-018-third' in n,('UNRELATED_NEW_FILE',n)
report={'candidateUnchanged':37400,'candidateInventorySha256':pre['candidateInventorySha256'],'historicalInventories':results,'h5016Inputs':456,'h5016Identical':455,'authorizedCompositionTransition':changed,'migrations1to65Preserved':True,'newAuditFiles':new,'newAuditFileCount':len(new),'deleted':0,'indexEmpty':True,'result':'PASS preservation'}
for a in archives:a.close()
if len(sys.argv)>1:
 out=O/(sys.argv[1]+'.json');assert not out.exists();out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items()if k not in ['historicalInventories','newAuditFiles']}))
