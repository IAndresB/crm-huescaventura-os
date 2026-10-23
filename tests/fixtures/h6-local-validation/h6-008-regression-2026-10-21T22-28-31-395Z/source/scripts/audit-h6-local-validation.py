"""Read-only independent evidence comparator; never imports the TS verifier.

Independence is instrumental (Python + persisted observations + frozen hashes),
not a claim of a second human/agent review. Mutation controls use in-memory copies.
"""
import copy
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / 'tests/fixtures/h6-local-validation'
checks = []

def require(condition, label):
    if not condition:
        raise AssertionError(label)
    checks.append(label)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def claim_invariant(value):
    assert len(value['snapshot']['attempts']) == 1
    assert sum(r['status'] == 'fulfilled' for r in value['results']) == 1
    assert len({r['pid'] for r in value['locks']}) == 2

def late_invariant(value):
    assert value['after']['parts'][0]['state'] == 'succeeded'
    assert value['after']['parts'][0]['result_ref'] == value['before']['parts'][0]['result_ref']

def uncertainty_invariant(value):
    assert value['parts'][0]['state'] == 'uncertain'
    assert len(value['attempts']) == 1

def negative(label, value, mutation, invariant):
    specimen = copy.deepcopy(value)
    mutation(specimen)
    try:
        invariant(specimen)
    except AssertionError:
        checks.append('NEGATIVE_DETECTED: '+label)
    else:
        raise AssertionError('TAMPER_NOT_DETECTED: '+label)

expected_hashes = {
    'specs/001-core-crm/expected-TSK-H6-006.json': '031dbfa4d9e3155a48ba909ebfe369d596acb9b020040cad3a24cd253e282809',
    'specs/001-core-crm/expected-TSK-H6-008.json': 'f1f7b53e5eaf4143dc3bec2da3de88fc38838e5de1322e7af168d0a92bd23703',
    'tests/fixtures/h6-local-validation/normative-source-lock.json': '4c183fc000c703b47b1ffae4df4ac1991e0107df31fd83c0b96085eb7dbfbd17',
}
for path, digest in expected_hashes.items():
    require(sha(ROOT/path) == digest, 'original freeze '+path)
lock = read(FIXTURE/'normative-source-lock.json')
for source in lock['sources']:
    require(sha(ROOT/source['path']) == source['sha256'], 'normative unchanged '+source['path'])
for task, count in [('TSK-H6-006',11),('TSK-H6-008',23),('TSK-H6-015',15)]:
    require(len(lock['tasks'][task]['assignments']) == count, 'assignment count '+task)
require(sha(ROOT/'tests/fixtures/h6-014-corrective/manifest.json') == '1352361f1bf22ffb3670d8a7f36ca15b583ccf11bef9d6c4bd0d94adf1b7c065', 'r3 unchanged')

runs = []
for path in sorted(FIXTURE.glob('*/run.json')):
    run = read(path)
    for name in ['stdout','stderr']:
        require(sha(path.parent/(name+'.log')) == run[name+'Sha256'], 'run log '+path.parent.name+' '+name)
    runs.append((path.parent,run))
successful = [(path,run) for path,run in runs if run['group']=='h6-006' and run['exitCode']==0]
require(bool(successful),'H6-006 command succeeded')
path,run = successful[-1]
text = (path/'stdout.log').read_text()
require(bool(re.search(r'(?:ℹ |# )pass 62\b',text)) and bool(re.search(r'(?:ℹ |# )fail 0\b',text)),'H6-006 observed counts 62/62')
observed=path/'observations'
require(len(list(observed.glob('*.json'))) == 40,'40 real observation files')
for order in [0,1]:
    value=read(observed/f'claim-race-{order}.json');claim_invariant(value);checks.append('one claim and two real waiters '+str(order))
    value=read(observed/f'recovery-result-race-{order}.json')
    require(value['snapshot']['parts'][0]['state']=='succeeded','recovery/result final '+str(order))
    require(len(value['snapshot']['attempts'])==1,'recovery/result no duplicate '+str(order))
    require(sum(e['event_kind'] in ['succeeded','reconciled-succeeded'] for e in value['events'])==1,'one consumption '+str(order))
    require(len({x['pid'] for x in value['locks']})==2,'recovery/result real overlap '+str(order))
late=read(observed/'old-generation-late-result.json');late_invariant(late);checks.append('stale result cannot overwrite successor')
uncertain=read(observed/'uncertain-recovery.json');uncertainty_invariant(uncertain);checks.append('uncertainty retained')
partial=read(observed/'partial.json');require([x['state'] for x in partial['parts']]==['succeeded','uncertain'],'parts remain independent')
stopped=read(observed/'stop-after-contact.json');require(stopped['reconciled']['execution']['control_state']=='stopped','late response does not resume stopped job')
for p in observed.glob('rollback-*.json'):
    value=read(p);require(value['preserved'] and value['retry']=='PASS','atomic rollback '+p.name)
value=read(observed/'commit-response-loss.json');require(value['withheldRealServerCommitAck'] and value['recoveredByIdentity'],'actual commit response withheld and identity recovery')
require(all(not row['rolsuper'] and not row['rolbypassrls'] for row in read(observed/'security.json')['roles']),'ordinary roles not privileged')
value=read(observed/'restore-barrier.json');require(value['integralH6RestoreAccredited'] is False and value['contactCount']==0,'pre-contact barrier is not H6-015 restore')
require('"providerEffects":1' in text and '"childKilled":true' in text and '"commercialFactUnchanged":true' in text,'independent durable provider and actual process death')

negative('duplicate claim',read(observed/'claim-race-0.json'),lambda x:x['snapshot']['attempts'].append(x['snapshot']['attempts'][0]),claim_invariant)
negative('stale result overwrites',late,lambda x:x['after']['parts'][0].update(result_ref='TAMPERED'),late_invariant)
negative('uncertainty silently becomes success',uncertain,lambda x:x['parts'][0].update(state='succeeded'),uncertainty_invariant)
negative('fake overlap same PID',read(observed/'claim-race-0.json'),lambda x:x['locks'][1].update(pid=x['locks'][0]['pid']),claim_invariant)

latest8=[(p,r) for p,r in runs if r['group']=='h6-008'][-1]
eight=(latest8[0]/'stdout.log').read_text()
require(latest8[1]['exitCode']==0,'H6-008 executed subset successful')
require(bool(re.search(r'(?:ℹ |# )skipped 1\b',eight)),'Auth real pending, not hidden')
require('"directSqlAttempts":1376' in eight and '"bytesReleased":false' in eight,'SQL and Storage late-response observations')
require('revocationFirst=false' in eight and 'revocationFirst=true' in eight,'both real projection lock orders executed')
require('"realAuthAccredited":true' not in eight,'no false real Auth accreditation')

print(json.dumps({'result':'PASS_EVIDENCE_COMPARISON','reviewIndependence':'separate comparator, same authoring agent; no second-reviewer claim','checks':checks,'H6006':'LOCAL_CANDIDATE_PASS; acceptance not fabricated','H6008':'IN_PROGRESS_PARTIAL; real Auth/HTTP unaccredited','H6015':'NOT_STARTED','historicalFailedRunsPreserved':[p.name for p,r in runs if r['exitCode']!=0]},ensure_ascii=False,indent=2))
