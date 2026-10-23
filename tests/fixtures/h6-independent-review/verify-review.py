"""Independent H6-006 custody and observed-state review, no TS verifier import."""
from pathlib import Path
import hashlib,json,re,subprocess,datetime
ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
FIX=ROOT/'tests/fixtures/h6-local-validation'
checks=[]
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def check(condition,label):
    if not condition: raise AssertionError(label)
    checks.append(label)
def read(path): return json.loads(path.read_text())
manifest=read(FIX/'delivery-manifest.json')
check(sha(FIX/'delivery-manifest.json')=='cea8c91910000d89a075401cbed60322ff71abccf5f7ba39569d188956bcd627','candidate manifest identity')
check(len(manifest['files'])==291,'291 delivered payloads')
for item in manifest['files']:
    path=ROOT/item['path']
    check(sha(path)==item['sha256'] and path.stat().st_size==item['bytes'],'payload '+item['path'])
for item in read(FIX/'normative-source-lock.json')['sources']:
    check(sha(ROOT/item['path'])==item['sha256'],'normative '+item['path'])
for item in read(FIX/'expected-freeze.json')['files']:
    check(sha(ROOT/item['path'])==item['sha256'],'freeze '+item['path'])
lines=(ROOT/'specs/001-core-crm/tasks.md').read_text().splitlines()
assignments=[re.search(r'\*\*(.*?)\*\*',line)[1] for line in lines if line.startswith('| **') and '[TSK-H6-006]' in line]
matrix=read(ROOT/'specs/001-core-crm/matrix-TSK-H6-006.json')
expected=read(ROOT/'specs/001-core-crm/expected-TSK-H6-006.json')
check(len(assignments)==11 and set(assignments)==set(expected['assignmentIds'])=={r['id'] for r in matrix['rows']},'11 exact task assignments')
for row in matrix['rows']:
    check(lines[row['sourceLine']-1]==row['sourceVerbatim'],'literal source '+row['id'])
check(subprocess.run(['git','diff','--quiet','HEAD'],cwd=ROOT).returncode==0,'tracked base unchanged')

# Explicit import closure plus spawned child entrypoints. No H6-008 test is used.
entries=['tests/integration/postgres-h6-006.test.ts','tests/integration/postgres-h6-006-regression.test.ts','tests/integration/postgres-h6-006-boundary.test.ts','tests/support/h6-durable-provider-child.ts','tests/support/h5-work-restart.ts']
pending=[ROOT/p for p in entries];closure=set()
while pending:
    path=pending.pop().resolve()
    if path in closure: continue
    closure.add(path)
    for ref in re.findall(r'''(?:from\s*|import\s*\(\s*)['"]([^'"]+)['"]''',path.read_text()):
        if ref.startswith('.'):
            target=(path.parent/ref).resolve()
            if target.is_file(): pending.append(target)
check(ROOT/'tests/integration/postgres-h6-008.test.ts' not in closure,'H6-008 not in H6-006 import closure')
runs=[];historical_mismatches=[]
for record in sorted(FIX.glob('*/run.json')):
    run=read(record)
    if run['group']!='h6-006': continue
    for stream in ['stdout','stderr']:
        check(sha(record.parent/(stream+'.log'))==run[stream+'Sha256'],'run log '+record.parent.name+' '+stream)
    runs.append({'path':str(record.relative_to(ROOT)),'exitCode':run['exitCode'],'status':run['status']})
    if run['exitCode']!=0: continue
    source={item['path']:item['sha256'] for item in read(record.parent/'source-manifest.json')['sources']}
    for path in closure:
        rel=str(path.relative_to(ROOT));check(rel in source and sha(path)==source[rel],'tested transitive source '+record.parent.name+' '+rel)
    mismatch=[p for p,h in source.items() if sha(ROOT/p)!=h]
    if record.parent.name=='h6-006-2026-10-21T22-25-23-170Z':
        check(mismatch==['tests/integration/postgres-h6-008.test.ts'],'only unrelated H6-008 historical source changed')
        historical_mismatches.append({'run':record.parent.name,'paths':mismatch,'interpretation':'not selected/imported; new independent run tests final candidate'})
    else: check(not mismatch,'all independent tested sources unchanged')
check(sum(r['exitCode']!=0 for r in runs)==3,'three historical failures preserved')
run_dir=FIX/'h6-006-2026-10-21T22-53-38-215Z'
log=(run_dir/'stdout.log').read_text()
check('pass 62' in log and 'fail 0' in log and 'skipped 0' in log,'62 reproduced PASS no skips')
obs=run_dir/'observations';check(len(list(obs.glob('*.json')))==40,'40 independent reproduced observations')
for order in [0,1]:
    claim=read(obs/f'claim-race-{order}.json')
    check(len(claim['snapshot']['attempts'])==1 and sum(v['status']=='fulfilled' for v in claim['results'])==1,'one surviving claim '+str(order))
    check(len({v['pid'] for v in claim['locks']})==2 and all(v['wait_event_type']=='Lock' for v in claim['locks']),'distinct locked claim PIDs '+str(order))
    recovery=read(obs/f'recovery-result-race-{order}.json')
    check(len(recovery['snapshot']['attempts'])==1 and recovery['snapshot']['parts'][0]['state']=='succeeded','recovery unique outcome '+str(order))
    check(sum(v['event_kind'] in ['succeeded','reconciled-succeeded'] for v in recovery['events'])==1,'one HA consumption '+str(order))
    check(len({v['pid'] for v in recovery['locks']})==2,'distinct recovery/result PIDs '+str(order))
uncertain=read(obs/'uncertain-recovery.json')
check(uncertain['parts'][0]['state']=='uncertain' and len(uncertain['attempts'])==1,'uncertainty retained')
late=read(obs/'old-generation-late-result.json')
check(late['after']['parts'][0]['result_ref']==late['before']['parts'][0]['result_ref'] and late['after']['parts'][0]['state']=='succeeded','late obsolete response cannot overwrite')
linked=read(obs/'late-result.json')['after']
check(linked['definition']['proposal_id'] and linked['definition']['decision_id'] and linked['definition']['responsible_actor']!=linked['attempts'][0]['executor_id'],'approval human and automatic executor distinct')
check(linked['attempts'][0]['execution_id']==linked['execution']['execution_id'] and linked['parts'][0]['attempt_id']==linked['attempts'][0]['attempt_id'] and linked['parts'][0]['reservation_id']==linked['attempts'][0]['reservation_id'],'approval execution attempt part reservation result linkage')
check([v['state'] for v in read(obs/'partial.json')['parts']]==['succeeded','uncertain'],'partial results stay independent')
check(read(obs/'stop-after-contact.json')['reconciled']['execution']['control_state']=='stopped','late response does not resume stopped execution')
check(read(obs/'commit-response-loss.json')['withheldRealServerCommitAck'] and read(obs/'commit-response-loss.json')['recoveredByIdentity'],'lost COMMIT response recovered by identity')
check('"childKilled":true' in log and '"providerEffects":1' in log and '"commercialFactUnchanged":true' in log,'actual kill and one independently stored simulated effect')
supplement=read(OUT/'supplemental-run.json')
check(supplement['exitCode']==0,'supplementary command succeeded')
for stream in ['stdout','stderr']:check(sha(OUT/('supplemental.'+stream+'.log'))==supplement[stream+'Sha256'],'supplement log '+stream)
check(sha(OUT/'independent-expected.json')==supplement['expectedSha256'],'supplement expected unchanged')
check(sha(ROOT/'tests/integration/postgres-h6-independent-review.test.ts')==supplement['sourceSha256'],'supplement test source unchanged')
check('pass 10' in (OUT/'supplemental.stdout.log').read_text() and 'fail 0' in (OUT/'supplemental.stdout.log').read_text(),'10 independent supplementary PASS')
result={'result':'PASS_INDEPENDENT_H6006_REVIEW','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'assignments':assignments,'runs':runs,'historicalSourceMismatches':historical_mismatches,'independentComparisonAttempt1':{'result':'REJECTED_OVERBROAD_SOURCE_EQUALITY','mismatch':'tests/integration/postgres-h6-008.test.ts','resolution':'Checked actual transitive closure and reproduced final entire candidate; no candidate modification'},'scope':'local isolated synthetic only; no global closure, real Auth, Hosted, restore or Production'}
(OUT/'integrity-review.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'result':result['result'],'checks':len(checks),'assignments':len(assignments),'reproduced':62,'supplementary':10},indent=2))
