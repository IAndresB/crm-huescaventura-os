"""Reconstruct current F runs and retain every earlier FAIL without double counting."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h5-017-f'
sha=lambda data:hashlib.sha256(data).hexdigest()
def obj(name):return json.loads((OUT/name).read_bytes())
def raw(name):return gzip.decompress((OUT/name).read_bytes())
def save(name,value,compress=False):
    path=OUT/name;assert not path.exists();data=(json.dumps(value,indent=2,sort_keys=True)+'\n').encode();path.write_bytes(gzip.compress(data,mtime=0)if compress else data);return sha(data)
expected={'01-before':(1,17,0,17),'02-before':(1,17,10,7),'03-originals-after':(0,15,15,0),'04-additional':(1,17,13,4),'06-additional-retest':(1,17,15,2),'08-additional-final':(0,17,17,0),'09-original-regressions':(1,44,43,1),'10-all-focal':(0,78,78,0),'14-complete':(1,2920,2916,4),'21-h4-isolated':(0,34,34,0),'22-e-mixed-retest':(0,7,7,0),'24-complete':(1,2920,2920,0),'25-complete':(0,2920,2920,0),'15-unit':(0,208,208,0),'16-health':(0,1,1,0)}
archives={sha(p.read_bytes()):str(p.relative_to(ROOT))for p in(OUT/'instrument-originals').iterdir()if p.is_file()}
captures=[]
for path in sorted(OUT.glob('*.status.json')):
    label=path.name.removesuffix('.status.json');status=obj(path.name);output=raw(label+'.stdout.log.gz');error=raw(label+'.stderr.log.gz')
    counts={key:int(matches[-1])for key in ['tests','pass','fail','cancelled','skipped']if(matches:=re.findall(r'(?:ℹ|#) '+key+r' (\d+)',output.decode()))}
    assert counts==status['counts']and not status['changedDuringRun'],label
    recovered=[]
    for name,digest in status['inputs'].items():
        if sha((ROOT/name).read_bytes())!=digest:
            assert digest in archives,('UNRECOVERED_INPUT',label,name,digest)
            recovered.append({'input':name,'historicalSha256':digest,'archive':archives[digest]})
    if label in expected:
        assert(status['exit'],counts['tests'],counts['pass'],counts['fail'])==expected[label],label
        assert counts['cancelled']==counts['skipped']==0,label
    else:assert status['exit']==(1 if label=='05-typecheck'else 0),label
    captures.append({'label':label,'counts':counts,'exit':status['exit'],'inputs':len(status['inputs']),'priorInputVersionsPreserved':recovered,'statusSha256':sha(path.read_bytes()),'stdoutSha256':sha(output),'stderrSha256':sha(error)})
assert len(captures)==23,len(captures)
for name,digest in obj('candidate-inputs-final-v3.json')['files'].items():assert sha((ROOT/name).read_bytes())==digest,name
phases=obj('25-phases.json');selection=obj('25-selection.json')['selected'];assert len(phases['phases'])==15
files=[name for phase in phases['phases']for name in phase['files']];assert len(files)==len(set(files))==192 and set(files)==set(selection)
cases=[];embedded=0
for phase_id,phase in enumerate(phases['phases'],1):
    output=raw(phase['stdout']).decode();counts={key:int(re.findall(r'(?:ℹ|#) '+key+r' (\d+)',output)[-1])for key in ['tests','pass','fail','cancelled','skipped']}
    assert counts==phase['counts']and phase['exit']==0
    assert counts['tests']==counts['pass']and counts['fail']==counts['cancelled']==counts['skipped']==0
    titles=re.findall(r'^\s*✔ (.*) \([0-9.]+ms\)$',output,re.M)
    if len(titles)!=counts['tests']:
        assert phase['files']==['postgres-h2-008-defects.test.ts']and counts['tests']==1
        embedded+=len(titles)-1;titles=titles[-1:]
    for i,title in enumerate(titles,1):cases.append({'id':f'25/{phase_id:02d}/{i:04d}','name':title,'result':'PASS','files':phase['files'],'log':phase['stdout']})
assert len(cases)==2920 and embedded==54
prior=json.loads(gzip.decompress((ROOT/'tests/fixtures/h5-017-e/current-case-inventory.json.gz').read_bytes()))['cases']
fourth=json.loads(gzip.decompress((ROOT/'tests/fixtures/h5-018-fourth/current-case-inventory.json.gz').read_bytes()))['new']
focal=raw('10-all-focal.stdout.log.gz').decode().split('ℹ tests ')[0]
additional=re.findall(r'^\s*✔ (F-[A-Z0-9]+ .*) \([0-9.]+ms\)$',focal,re.M);assert len(additional)==len(set(additional))==19
assert Counter(x['name']for x in cases)==Counter(x['name']for x in prior)+Counter(x['name']for x in fourth)+Counter(additional)
before=raw('02-before.stdout.log.gz').decode().split('ℹ tests ')[0]
fails=re.findall(r'^\s*✖ (Q\d+ .*) \([0-9.]+ms\)$',before,re.M);assert len(fails)==7
assert set(fails)=={x['name']for x in fourth if x['result']=='FAIL'}
for title in fails:assert title in {x['name']for x in cases}and re.search(r'^\s*✔ '+re.escape(title)+r' \(',focal,re.M)
replica=obj('25-replica-preservation.json');assert replica['exit']==0 and replica['replicaRemoved']and replica['workspaceProtectedOutputsNeverOverwritten']
assert replica['verificationComplete'] and not replica['verificationErrors'] and not replica['fatal']
assert replica['workspaceChecked']==replica['replicaChecked']==replica['expectedFiles']
for item in replica['regenerated']:
    assert sha(raw(item['capture']))==item['generatedSha256'];assert sha((ROOT/item['path']).read_bytes())==item['protectedWorkspaceSha256']
documentationFinalized=[]
allowedDocs={f'specs/001-core-crm/{name}-TSK-H5-017-F.md' for name in ['evidence','matrix','defects']}
allowedInstrumentRepairs={'scripts/verify-h5-017-f-results.py','scripts/seal-h5-017-f.py','scripts/verify-h5-017-f-seal.py'}
for tag in ['14','24','25']:
    snapshot=json.loads(raw(tag+'-copied-inputs.json.gz'));assert snapshot['allBytesVerified']and not snapshot['originalWorkspaceWrites']
    for name,meta in snapshot['files'].items():
        if sha((ROOT/name).read_bytes())!=meta['sha256']:
            assert (name in allowedDocs and tag in ['24','25'] or name in allowedInstrumentRepairs and tag=='24') and meta['sha256'] in archives,('COPIED_INPUT_CHANGED',tag,name)
            documentationFinalized.append({'path':name,'run':tag,'snapshotSha256':meta['sha256'],'preservedSnapshot':archives[meta['sha256']],'finalSha256':sha((ROOT/name).read_bytes()),'reason':'Final result reporting after execution, or archived postcheck verification repair after24; product and protected tests unchanged'})
priorReplica=obj('14-replica-preservation.json');assert priorReplica['exit']==1 and priorReplica['replicaRemoved']and priorReplica['workspaceProtectedOutputsNeverOverwritten']
for item in priorReplica['regenerated']:
    assert sha(raw(item['capture']))==item['generatedSha256'];assert sha((ROOT/item['path']).read_bytes())==item['protectedWorkspaceSha256']
audit=json.loads(raw('19-audit.stdout.log.gz'));assert all(x==0 for x in audit['metadata']['vulnerabilities'].values())
observations=[]
for label in ['02-before','04-additional','06-additional-retest','08-additional-final','09-original-regressions','10-all-focal']:
    for line in raw(label+'.stdout.log.gz').decode().splitlines():
        if line.startswith(('F-','Q','R','T'))and' {'in line:
            title,value=line.split(' {',1)
            try:parsed=json.loads('{'+value)
            except json.JSONDecodeError:continue
            observations.append({'capture':label,'label':title,'data':parsed})
inventory_hash=save('current-case-inventory.json.gz',{'cases':cases,'previousESelection':2884,'fourthAuditCases':17,'additionalFcases':19,'historicalEmbeddedExcluded':embedded},True)
save('material-observations.json',observations)
coverage={'result':'PASS internal','candidate':'H5-017-F','complete':{'tests':2920,'pass':2920,'fail':0,'cancelled':0,'skipped':0,'files':192,'disjointPhases':15},'previousSelection':2884,'fourthCases':17,'newFcases':19,'focal78':'PASS; overlaps complete, not added','sevenOriginalFailures':'Reproduced02;7/7 PASS10 and25','unit':208,'health':1,'productionVulnerabilities':0,'knownMaterialDefectsOpen':0,'historicalOutcomesReused':0,'caseInventoryContentSha256':inventory_hash,'replica':replica,'initialComplete':{'capture':'14','tests':2920,'pass':2916,'fail':4,'preserved':True},'instrumentRetests':{'H4isolated':34,'Eidentity':7},'documentationFinalizedAfterRun':documentationFinalized,'secondComplete':{'capture':'24','tests':2920,'pass':2920,'fail':0,'processExit':1,'postcheckIncomplete':True,'preserved':True}}
save('current-coverage.json',coverage)
save('final-verification.json',{'result':'PASS internal; fifth independent audit pending','captureIntegrity':'PASS','captures':captures,'coverage':coverage,'onlyProductDelta':'migration68;three existing function bodies','receivedFilesPreserved':37874,'H5017':'IN PROGRESS','H5018':'IN PROGRESS','DM-PENDING-005':'OPEN','next':'STOP; fifth independent audit required'})
print(json.dumps({'captureIntegrity':'PASS','captures':len(captures),'complete':2920,'originalFailuresNowPass':7,'newFcases':19,'knownMaterialDefectsOpen':0,'result':'PASS internal','caseInventoryContentSha256':inventory_hash}))
