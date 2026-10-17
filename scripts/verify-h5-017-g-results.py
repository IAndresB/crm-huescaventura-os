"""Reconcile current G executions with raw logs, protected tests and exact replica inputs."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-017-g'
def sha(b):return hashlib.sha256(b).hexdigest()
def obj(n):return json.loads((o/n).read_bytes())
def log(n):return gzip.decompress((o/n).read_bytes()).decode()
def counts(s):return {k:int(m[-1])for k in ['tests','pass','fail','cancelled','skipped']if(m:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s))}
def save(n,v,compressed=False):
 b=(json.dumps(v,sort_keys=True,indent=2)+'\n').encode()
 with(o/n).open('xb')as f:f.write(gzip.compress(b,mtime=0)if compressed else b)
 return sha(b)
known={
 '01-original-cancellation':(1,103,29,74),'02-original-races':(1,13,11,2),
 '03-corrected-cancellation':(1,103,0,103),'04-temporal':(0,10,10,0),
 '05-corrected-cancellation':(0,103,103,0),'07-corrected-races':(0,13,13,0),
 '08-temporal-repeat':(0,10,10,0),'10-unit':(0,208,208,0),'11-health':(0,1,1,0),
 '20-complete':(0,2945,2945,0),
}
captures=[]
for p in sorted(o.glob('*.status.json')):
 tag=p.name[:-12];s=json.loads(p.read_bytes());out=log(tag+'.stdout.log.gz');err=log(tag+'.stderr.log.gz');c=counts(out)
 assert c==s['counts']and not s['candidateChanged'],tag
 for n,d in s['inputs'].items():assert sha((r/n).read_bytes())==d,('EXECUTION_INPUT_CHANGED',tag,n)
 if tag in known:assert(s['exit'],c['tests'],c['pass'],c['fail'])==known[tag],tag
 else:assert s['exit']==0,tag
 if c:assert c['cancelled']==c['skipped']==0,tag
 if tag=='03-corrected-cancellation':assert 'pg_ctl: could not start server'in out
 captures.append({'tag':tag,'exit':s['exit'],'counts':c,'durationSeconds':s['finished']-s['started'],'statusSha256':sha(p.read_bytes()),'stdoutSha256':sha(out.encode()),'stderrSha256':sha(err.encode()),'inputFiles':len(s['inputs'])})
assert len(captures)==15,len(captures)
ph=obj('20-phases.json');assert len(ph['phases'])==15
files=[n for phase in ph['phases']for n in phase['files']]
assert len(files)==len(set(files))==196 and set(files)==set(obj('20-selection.json')['selected'])
cases=[];nested=[]
for number,phase in enumerate(ph['phases'],1):
 s=log(phase['stdout']);c=counts(s);assert c==phase['counts']and phase['exit']==0
 assert c['tests']==c['pass']and c['fail']==c['cancelled']==c['skipped']==0
 titles=re.findall(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',s.split('✖ failing tests:')[0],re.M)
 if phase['files']==['postgres-h2-008-defects.test.ts']:
  block=s.split('H2-008 historical complete stdout: ',1)[1].split('H2-008 historical complete stderr:',1)[0]
  nested=re.findall(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',block.split('✖ failing tests:')[0],re.M)
  assert len(nested)==57 and Counter(x[0]for x in nested)=={'✔':55,'✖':2}
  titles=[x for x in re.findall(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',s,re.M)if x[1]=='H2-008 F01/F02 original15dbf11 reproduces normative FAIL without weakening expected']
 assert len(titles)==c['tests']and all(x[0]=='✔'for x in titles)
 cases.extend({'id':f'G20/{number:02d}/{i:04d}','name':title[1],'result':'PASS','files':phase['files'],'log':phase['stdout']}for i,title in enumerate(titles,1))
assert len(cases)==2945 and ph['total']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}
old=json.loads(gzip.decompress((r/'tests/fixtures/h5-018-fifth/current-case-inventory.json.gz').read_bytes()))['cases']
extra=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',log('04-temporal.stdout.log.gz'),re.M)
v09=re.findall(r'^\s*✔ (V09 .*) \([0-9.]+ms\)$',gzip.decompress((r/'tests/fixtures/h5-018-fifth/16-chronology.stdout.log.gz').read_bytes()).decode(),re.M)
assert len(extra)==10 and len(v09)==2 and Counter(x['name']for x in cases)==Counter(x['name']for x in old)+Counter(extra)+Counter(v09)
oldFailed=[x['name']for x in old if x['result']=='FAIL'];assert len(oldFailed)==303
names={x['name']for x in cases};assert set(oldFailed)<=names
focal=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',gzip.decompress((r/'tests/fixtures/h5-018-fifth/01-originals.stdout.log.gz').read_bytes()).decode(),re.M)
assert len(focal)==71 and set(focal)<=names
eight=obj('eight-failures-analysis.json');assert len(eight['cases'])==8 and eight['unresolved']==0
assert all(x['classification']=='Consecuencia demostrada del fixture temporal'and x['before']['result']=='FAIL'and x['after']['result']=='PASS'and x['test']in names for x in eight['cases'])
rep=obj('20-replica-preservation.json');assert rep['exit']==0 and rep['replicaRemoved']and rep['verificationComplete']and rep['workspaceProtectedOutputsNeverOverwritten']and not rep['verificationErrors']and not rep['fatal']
assert rep['workspaceChecked']==rep['replicaChecked']==rep['expectedFiles']
snapshot=json.loads(gzip.decompress((o/'20-copied-inputs.json.gz').read_bytes()));assert snapshot['allBytesVerified']and not snapshot['originalWorkspaceWrites']
for n,m in snapshot['files'].items():assert sha((r/n).read_bytes())==m['sha256'],('COPIED_INPUT_CHANGED',n)
for item in rep['regenerated']:
 assert item['allowed']and item['protectedWorkspaceUnchanged']
 assert sha(gzip.decompress((o/item['capture']).read_bytes()))==item['generatedSha256']and sha((r/item['path']).read_bytes())==item['protectedWorkspaceSha256']
audit=json.loads(log('13-dependency-audit.stdout.log.gz'));assert all(v==0 for v in audit['metadata']['vulnerabilities'].values())
tr=obj('instrumentation-transition.json');assert sha((r/tr['originalPath']).read_bytes())==tr['originalSha256']and sha((r/tr['adaptationPath']).read_bytes())==tr['adaptationSha256']and not tr['originalModified']
expected=obj('expected-seal.json');assert sha((r/expected['path']).read_bytes())==expected['sha256']
casehash=save('current-case-inventory.json.gz',{'cases':cases,'newG':extra,'fifthV09AddedToFull':v09,'historicalNestedCasesExcluded':nested},True)
coverage={'result':'PASS internal local isolated G instrumentation only','candidate':'unchanged product F plus G instrumentation; fifth audit remains FAIL','complete':ph['total'],'files':196,'disjointPhases':15,'candidateFRegression':2920,'fifthIndependentCases':15,'newGCases':10,'newGRepeatsNotAdded':True,'prior303NowPass':303,'eightIndividuallyClassifiedNowPass':8,'focal71NowPass':71,'unit':208,'health':1,'productionVulnerabilities':0,'materialDefectsOpen':0,'independentAuditStillRequired':True,'caseInventoryContentSha256':casehash,'replica':rep,'captures':captures,'historicalNestedExcluded':{'tests':57,'pass':55,'fail':2},'instrumentIncidentPreserved':'03 local port collision; no tests admitted','accepted':False,'published':False,'state':'STOP after seal'}
save('current-coverage.json',coverage)
print(json.dumps({k:v for k,v in coverage.items()if k not in ['replica','captures']}))
