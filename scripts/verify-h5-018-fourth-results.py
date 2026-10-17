"""Reconstruct new audit executions; material FAILs must remain FAIL."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h5-018-fourth'
sha=lambda data:hashlib.sha256(data).hexdigest()
def obj(name):return json.loads((OUT/name).read_bytes())
def raw(name):return gzip.decompress((OUT/name).read_bytes())
def save(name,value,compress=False):
    path=OUT/name;assert not path.exists();value=(json.dumps(value,indent=2,sort_keys=True)+'\n').encode();path.write_bytes(gzip.compress(value,mtime=0)if compress else value);return sha(value)
expected={'01-complete':(0,2884,2884,0),'02-history':(1,4,1,3),'03-permissions':(1,3,2,1),'04-identity':(1,5,4,1),'05-migration':(0,2,2,0),'06-originals':(0,44,44,0),'09-unit':(0,208,208,0),'10-health':(0,1,1,0),'12-replay-controls':(1,3,1,2),'13-new-retest':(1,17,10,7)}
captures=[]
for path in sorted(OUT.glob('*.status.json')):
    label=path.name.removesuffix('.status.json');status=obj(path.name);output=raw(label+'.stdout.log.gz');error=raw(label+'.stderr.log.gz')
    counts={key:int(matches[-1]) for key in ['tests','pass','fail','cancelled','skipped'] if(matches:=re.findall(r'(?:ℹ|#) '+key+r' (\d+)',output.decode()))}
    assert counts==status['counts'] and status['changedDuringRun']==[],label
    assert all(sha((ROOT/name).read_bytes())==digest for name,digest in status['inputs'].items()),label
    if label in expected:
        assert (status['exit'],counts['tests'],counts['pass'],counts['fail'])==expected[label],label
        assert counts['cancelled']==counts['skipped']==0,label
    else:assert status['exit']==0,label
    captures.append({'label':label,'counts':counts,'exit':status['exit'],'inputs':len(status['inputs']),'inputsUnchanged':True,'statusSha256':sha(path.read_bytes()),'stdoutSha256':sha(output),'stderrSha256':sha(error)})
assert len(captures)==16
phases=obj('01-phases.json');selection=obj('01-selection.json')['selected'];assert len(phases['phases'])==14
files=[name for phase in phases['phases']for name in phase['files']];assert len(files)==len(set(files))==184 and set(files)==set(selection)
cases=[];embedded=0
for phase_id,phase in enumerate(phases['phases'],1):
    output=raw(phase['stdout']).decode();counts={key:int(re.findall(r'(?:ℹ|#) '+key+r' (\d+)',output)[-1])for key in ['tests','pass','fail','cancelled','skipped']}
    assert counts==phase['counts'] and phase['exit']==0
    assert counts['tests']==counts['pass'] and counts['fail']==counts['cancelled']==counts['skipped']==0
    titles=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',output,re.M)
    if len(titles)!=counts['tests']:
        assert phase['files']==['postgres-h2-008-defects.test.ts'] and counts['tests']==1
        embedded+=len(titles)-1;titles=titles[-1:]
    for i,title in enumerate(titles,1):cases.append({'id':f'01/{phase_id:02d}/{i:04d}','name':title,'result':'PASS','files':phase['files'],'log':phase['stdout']})
assert len(cases)==2884 and embedded==54
prior=json.loads(gzip.decompress((ROOT/'tests/fixtures/h5-017-e/current-case-inventory.json.gz').read_bytes()))['cases']
assert Counter(x['name']for x in prior)==Counter(x['name']for x in cases)
new_output=raw('13-new-retest.stdout.log.gz').decode();body=new_output.split('ℹ tests ')[0]
new=re.findall(r'^\s*([✔✖]) (Q\d+ .*) \([0-9.]+ms\)$',body,re.M);assert len(new)==17
assert sum(mark=='✔'for mark,_ in new)==10
new_cases=[{'id':f'13/{i:02d}','name':title,'result':'PASS'if mark=='✔'else'FAIL','log':'13-new-retest.stdout.log.gz','normativeGroup':title.split()[0]}for i,(mark,title)in enumerate(new,1)]
assert len(set(x['name']for x in new_cases))==17
replica=obj('01-replica-preservation.json');assert replica['exit']==0 and replica['replicaRemoved'] and replica['workspaceProtectedOutputsNeverOverwritten']
for item in replica['regenerated']:
    assert sha(raw(item['capture']))==item['generatedSha256'];assert sha((ROOT/item['path']).read_bytes())==item['protectedWorkspaceSha256']
snapshot=json.loads(raw('01-copied-inputs.json.gz'));assert snapshot['allBytesVerified'] and not snapshot['originalWorkspaceWrites']
for name,meta in snapshot['files'].items():assert sha((ROOT/name).read_bytes())==meta['sha256'],name
audit=json.loads(raw('11-audit.stdout.log.gz'));assert all(x==0 for x in audit['metadata']['vulnerabilities'].values())
observations=[]
for label in ['02-history','03-permissions','04-identity','05-migration','12-replay-controls','13-new-retest']:
    for line in raw(label+'.stdout.log.gz').decode().splitlines():
        if line.startswith('Q') and ' {'in line:
            title,value=line.split(' {',1);observations.append({'capture':label,'label':title,'data':json.loads('{'+value)})
inventory_hash=save('current-case-inventory.json.gz',{'regression':cases,'new':new_cases,'historicalEmbeddedExcluded':embedded},True)
save('material-observations.json',observations)
coverage={'result':'FAIL','candidate':'H5-017-E','regression':{'tests':2884,'pass':2884,'fail':0,'files':184,'disjointPhases':14},'newIndependent':{'tests':17,'pass':10,'fail':7,'cancelled':0,'skipped':0},'combinedDisjoint':{'tests':2901,'pass':2894,'fail':7},'focalOriginal44':'PASS; overlaps complete, not added','retest17':'same cases repeated, not added','unit':208,'health':1,'productionVulnerabilities':0,'materialDefects':['H5-018-4-F01','H5-018-4-F02'],'historicalOutcomesReused':0,'caseInventoryContentSha256':inventory_hash,'replica':replica}
save('current-coverage.json',coverage);save('final-verification.json',{'result':'FAIL material product findings','captureIntegrity':'PASS','captures':captures,'coverage':coverage,'productModified':False,'H5017':'IN PROGRESS','H5018':'IN PROGRESS','DM-PENDING-005':'OPEN','recommendation':'Do not accept E; correct F01/F02 in separately authorized work','next':'STOP'})
print(json.dumps({'captureIntegrity':'PASS','captures':len(captures),'regression':2884,'newPass':10,'newFail':7,'materialDefects':2,'dictamen':'FAIL','caseInventoryContentSha256':inventory_hash}))
