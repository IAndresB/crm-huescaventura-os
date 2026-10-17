"""Read fresh raw logs; never substitute the implementer's PASS for an execution."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re,sys
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-018-sixth'
sha=lambda b:hashlib.sha256(b).hexdigest()
def obj(path):
 p=Path(path);b=p.read_bytes();return json.loads(gzip.decompress(b)if p.suffix=='.gz'else b)
def log(name):return gzip.decompress((o/name).read_bytes()).decode()
def counts(text):return {k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',text))}
def cases(text):
 # The historical H2-008 subprocess intentionally reproduces old product FAILs.
 text=re.sub(r'H2-008 historical complete stdout: [\s\S]*?H2-008 historical complete stderr:', '',text)
 return [{'name':m[1],'result':'PASS'if m[0]=='✔'else'FAIL'}for m in re.findall(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',text.split('✖ failing tests:')[0],re.M)]
def save(name,x):
 b=(json.dumps(x,indent=2,sort_keys=True)+'\n').encode()
 with (o/name).open('xb')as f:f.write(gzip.compress(b,mtime=0)if name.endswith('.gz')else b)
 return sha(b)
expected=obj(o/'expected-seal.json');assert sha((r/expected['path']).read_bytes())==expected['sha256']
baseline=obj(o/'received-inventory.json.gz')['files'];assert len(baseline)==38388
archives={sha(p.read_bytes()):str(p.relative_to(r))for p in (o/'instrument-originals').glob('*')}
captures=[]
for p in sorted(o.glob('*.status.json')):
 tag=p.name[:-12];s=obj(p);stdout=log(tag+'.stdout.log.gz');assert counts(stdout)==s['counts']and not s['candidateChanged'],tag
 exceptions=[]
 for n,d in s['inputs'].items():
  if sha((r/n).read_bytes())!=d:
   assert n=='tests/integration/postgres-h5-018-sixth-temporal.test.ts'and d in archives,(tag,n)
   exceptions.append({'path':n,'inputSha256':d,'preservedExactSource':archives[d]})
 if tag in ['01-temporal','04-typecheck','21-original-focal']:assert s['exit']==1,tag
 else:assert s['exit']==0,tag
 captures.append({'tag':tag,'exit':s['exit'],'counts':s['counts'],'durationSeconds':s['finished']-s['started'],'command':s['command'],'statusSha256':sha(p.read_bytes()),'stdoutSha256':sha(stdout.encode()),'stderrSha256':sha(gzip.decompress((o/(tag+'.stderr.log.gz')).read_bytes())),'exactInputFiles':len(s['inputs']),'ownHistoricalInstrumentInputs':exceptions})
assert {x['tag']for x in captures}>={'20-complete','21-original-focal','22-corrected-focal','13-frozen','07-unit','08-health','06-typecheck','09-lint','10-dependency-audit','11-build','03-migration','05-temporal-repeat','12-historical-migration66'}
ph=obj(o/'20-phases.json');assert len(ph['phases'])==15
selected=[n for phase in ph['phases']for n in phase['files']];assert len(selected)==len(set(selected))==196
assert set(selected)==set(obj(o/'20-selection.json')['selected'])
allcases=[]
for i,phase in enumerate(ph['phases'],1):
 text=log(phase['stdout']);c=counts(text);assert c==phase['counts']and phase['exit']==0
 rows=cases(text);assert len(rows)==c['tests']and all(x['result']=='PASS'for x in rows),(i,len(rows),c)
 allcases.extend(dict(x,id=f'S6/20/{i:02d}/{j:04d}',files=phase['files'],log=phase['stdout'])for j,x in enumerate(rows,1))
assert ph['total']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}and len(allcases)==2945
assert Counter(x['name']for x in allcases)==Counter(x['name']for x in obj(r/'tests/fixtures/h5-017-g/current-case-inventory.json.gz')['cases'])
byname={x['name']:x for x in allcases};frequencies=Counter(x['name']for x in allcases)
prior=obj(o/'fifth-303-independent-extraction.json');assert prior['counts']=={'evidence':295,'assertion':7,'lock':1};recovered=[]
snapshot=obj(o/'20-copied-inputs.json.gz');assert snapshot['allBytesVerified']and not snapshot['originalWorkspaceWrites']
for item in prior['cases']:
 name=item['name'];assert frequencies[name]==1;file=item['location'].split(':')[0];assert file.split('/')[-1]in selected
 assert snapshot['files'][file]['sha256']==baseline[file]['sha256']==sha((r/file).read_bytes())
 recovered.append({'name':name,'source':item['location'],'previousFailureClass':item['kind'],'previousLog':prior['source'],'currentResult':'PASS','currentId':byname[name]['id'],'currentLog':byname[name]['log'],'unchangedSourceSha256':baseline[file]['sha256']})
original=cases(log('21-original-focal.stdout.log.gz'));corrected=cases(log('22-corrected-focal.stdout.log.gz'));orig={x['name']:x for x in original};fix={x['name']:x for x in corrected};assert len(original)==len(corrected)==116 and all(x['result']=='PASS'for x in corrected)
eight=[x for x in recovered if x['previousFailureClass']!='evidence'];assert len(eight)==8
for x in eight:assert orig[x['name']]['result']=='FAIL'and fix[x['name']]['result']=='PASS'
focal=cases(gzip.decompress((r/'tests/fixtures/h5-018-fifth/01-originals.stdout.log.gz').read_bytes()).decode());assert len(focal)==71
assert all(x['name']in byname for x in focal)
rep=obj(o/'20-replica-preservation.json');assert rep['exit']==0 and rep['verificationComplete']and not rep['verificationErrors']and not rep['fatal']and rep['workspaceProtectedOutputsNeverOverwritten']and rep['replicaRemoved'];assert rep['workspaceChecked']==rep['replicaChecked']==rep['expectedFiles']==len(snapshot['files'])
for n,m in snapshot['files'].items():assert sha((r/n).read_bytes())==m['sha256'],('FULL_SNAPSHOT_CHANGED',n)
for x in rep['regenerated']:
 assert x['allowed']and x['protectedWorkspaceUnchanged']
 assert sha(gzip.decompress((o/x['capture']).read_bytes()))==x['generatedSha256']and sha((r/x['path']).read_bytes())==x['protectedWorkspaceSha256']
audit=json.loads(log('10-dependency-audit.stdout.log.gz'));assert all(v==0 for v in audit['metadata']['vulnerabilities'].values())
assert obj(o/'07-unit.status.json')['counts']['pass']==208
assert obj(o/'08-health.status.json')['counts']['pass']==1
assert obj(o/'05-temporal-repeat.status.json')['counts']['pass']==14
assert obj(o/'03-migration.status.json')['counts']['pass']==2
casehash=save('current-case-inventory.json.gz',{'cases':allcases,'candidateOnly':True,'independentOwnCasesNotAdded':16,'unitNotAdded':208,'healthNotAdded':1,'extraHistoricalMigration66NotAdded':2})
save('recovered-303.json',{'counts':prior['counts'],'allRecovered':303,'cases':recovered})
coverage={'result':'PASS local isolated independent audit','candidateFiles':38388,'candidatePostgres':ph['total'],'selectedFiles':196,'phases':15,'ownIndependentCases':16,'ownTemporalCases':14,'ownMigrationSecurityCases':2,'extraHistoricalMigration66':2,'prior303Recovered':303,'eightSpecialRecovered':8,'protectedFocal71Pass':71,'unit':208,'health':1,'productionVulnerabilities':0,'caseInventoryContentSha256':casehash,'captures':captures,'replica':rep,'materialDefectsOpen':0,'acceptance':'recommend exact candidate G for director decision in local scope','publicationAuthorized':False,'state':'STOP'}
save('coverage.json',coverage);print(json.dumps({k:v for k,v in coverage.items()if k not in ['captures','replica']}))
