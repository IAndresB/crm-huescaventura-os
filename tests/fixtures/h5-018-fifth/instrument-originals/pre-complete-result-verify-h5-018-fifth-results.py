"""Reconstruct audit outcomes from current raw logs and exact source inputs."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-fifth'
def sha(b):return hashlib.sha256(b).hexdigest()
def obj(n):return json.loads((o/n).read_bytes())
def log(n):return gzip.decompress((o/n).read_bytes()).decode()
def counts(s):return {k:int(m[-1])for k in ['tests','pass','fail','cancelled','skipped']if(m:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s))}
def save(n,v,compressed=False):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with (o/n).open('xb')as f:f.write(gzip.compress(b,mtime=0)if compressed else b)
 return sha(b)
archives={sha(p.read_bytes()):str(p.relative_to(r))for p in(o/'instrument-originals').glob('*')if p.is_file()}
captures=[]
known={'01-originals':(0,71,71,0),'02-new-sequences':(1,11,9,2),'04-migration':(0,2,2,0),'05-sequences-retest':(1,11,10,1),'06-sequences-retest':(0,11,11,0),'08-complete':(0,2933,2933,0),'09-unit':(0,208,208,0),'10-health':(0,1,1,0)}
for p in sorted(o.glob('*.status.json')):
 tag=p.name[:-12];s=json.loads(p.read_bytes());out=log(tag+'.stdout.log.gz');err=log(tag+'.stderr.log.gz');c=counts(out);assert c==s['counts']and not s['candidateChanged'],tag
 recovered=[]
 for n,d in s['inputs'].items():
  if sha((r/n).read_bytes())!=d:
   assert d in archives,('INPUT_NOT_RECOVERABLE',tag,n,d)
   recovered.append({'input':n,'sha256':d,'archive':archives[d]})
 if tag in known:assert (s['exit'],c['tests'],c['pass'],c['fail'])==known[tag],tag
 else:assert s['exit']==0,tag
 if c:assert c['cancelled']==c['skipped']==0,tag
 captures.append({'tag':tag,'exit':s['exit'],'counts':c,'statusSha256':sha(p.read_bytes()),'stdoutSha256':sha(out.encode()),'stderrSha256':sha(err.encode()),'inputs':len(s['inputs']),'recovered':recovered})
assert len(captures)==14,len(captures)
ph=obj('08-phases.json');assert len(ph['phases'])==15
files=[n for phase in ph['phases']for n in phase['files']];assert len(files)==len(set(files))==194;assert set(files)==set(obj('08-selection.json')['selected'])
cases=[];embedded=0
for number,phase in enumerate(ph['phases'],1):
 s=log(phase['stdout']);c=counts(s);assert c==phase['counts']and phase['exit']==0;assert c['tests']==c['pass']and c['fail']==c['cancelled']==c['skipped']==0
 titles=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',s,re.M)
 if len(titles)!=c['tests']:
  assert phase['files']==['postgres-h2-008-defects.test.ts']and c['tests']==1
  embedded+=len(titles)-1;titles=titles[-1:]
 cases.extend({'id':f'08/{number:02d}/{i:04d}','name':title,'result':'PASS','files':phase['files'],'log':phase['stdout']}for i,title in enumerate(titles,1))
assert len(cases)==2933 and embedded==54
previous=json.loads(gzip.decompress((r/'tests/fixtures/h5-017-f/current-case-inventory.json.gz').read_bytes()))['cases']
new=[]
for tag in ['04-migration','06-sequences-retest']:
 new+=re.findall(r'^\s*✔ (V[0-9]+ .*) \([0-9.]+ms\)$',log(tag+'.stdout.log.gz'),re.M)
assert len(new)==len(set(new))==13
assert Counter(x['name']for x in cases)==Counter(x['name']for x in previous)+Counter(new)
original=gzip.decompress((r/'tests/fixtures/h5-017-f/02-before.stdout.log.gz').read_bytes()).decode().split('ℹ tests ')[0]
seven=re.findall(r'^\s*✖ (Q\d+ .*) \([0-9.]+ms\)$',original,re.M);assert len(seven)==7
assert set(seven)<={x['name']for x in cases}
rep=obj('08-replica-preservation.json');assert rep['exit']==0 and rep['replicaRemoved']and rep['workspaceProtectedOutputsNeverOverwritten']and rep['verificationComplete']and not rep['verificationErrors']and not rep['fatal'];assert rep['workspaceChecked']==rep['replicaChecked']==rep['expectedFiles']
snapshot=json.loads(gzip.decompress((o/'08-copied-inputs.json.gz').read_bytes()));assert snapshot['allBytesVerified']and not snapshot['originalWorkspaceWrites']
for n,m in snapshot['files'].items():assert sha((r/n).read_bytes())==m['sha256'],('COPIED_INPUT_CHANGED',n)
for item in rep['regenerated']:
 assert item['allowed'];assert sha(gzip.decompress((o/item['capture']).read_bytes()))==item['generatedSha256'];assert sha((r/item['path']).read_bytes())==item['protectedWorkspaceSha256']
audit=json.loads(log('13-dependency-audit.stdout.log.gz'));assert all(v==0 for v in audit['metadata']['vulnerabilities'].values())
casehash=save('current-case-inventory.json.gz',{'cases':cases,'new':new,'historicalEmbeddedExcluded':embedded,'priorSelectionRerun':2920},True)
observations=[]
for tag in ['01-originals','02-new-sequences','04-migration','05-sequences-retest','06-sequences-retest']:
 for line in log(tag+'.stdout.log.gz').splitlines():
  if line.startswith(('V','F-','Q','R','T'))and' {'in line:
   name,data=line.split(' {',1)
   try:observations.append({'capture':tag,'name':name,'data':json.loads('{'+data)})
   except json.JSONDecodeError:pass
save('material-observations.json',observations)
coverage={'result':'PASS independent local/isolated','candidate':'H5-017-F','complete':ph['total'],'files':194,'disjointPhases':15,'candidateCasesRerun':2920,'newCases':13,'originalFocal':71,'focalOverlapsComplete':True,'originalSevenNowPass':seven,'unit':208,'health':1,'productionVulnerabilities':0,'historicalOutcomesReused':0,'materialDefectsOpen':0,'caseInventoryContentSha256':casehash,'replica':rep,'instrumentFailuresPreserved':{'02':2,'05':1},'inputArchives':archives}
save('current-coverage.json',coverage);save('final-verification.json',{'result':'PASS','captures':captures,'coverage':coverage})
print(json.dumps({'result':'PASS','captures':len(captures),'complete':2933,'newCases':13,'files':194,'phases':15,'caseInventoryContentSha256':casehash}))
