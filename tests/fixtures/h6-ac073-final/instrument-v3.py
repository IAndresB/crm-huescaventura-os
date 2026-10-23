"""Read-only reassessment of sealed, executed evidence; not a runtime test."""
from pathlib import Path
import copy, hashlib, json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h6-ac073-final'
AUDIT=Path('/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads(p.read_text())
expected=read(OUT/'expected-v1.json')
addendum=read(OUT/'expected-addendum-v2.json')
assert sha(OUT/'expected-v1.json')==(OUT/'expected-v1.sha256').read_text().strip()
referenceChecks=[]
for file, rows in expected['normative'].items():
 for line, phrase in rows.items():
  actual=int(line)
  if file.endswith('procedure-TSK-H6-014-r4.md'):
   erratum=read(OUT/'reference-erratum-v1.json');assert actual==erratum['originalLine'] and phrase==erratum['phrase'];actual=erratum['correctLine']
  assert phrase in (ROOT/file).read_text().splitlines()[actual-1],(file,actual)
  referenceChecks.append({'file':file,'line':actual,'matched':True})
packages=[]
for base,name in [(ROOT,'tests/fixtures/h6-bootstrap-variant/delivery-manifest-v2.json'),(ROOT,'tests/fixtures/h6-c04-integration/delivery-manifest-r2.json'),(AUDIT,'tests/fixtures/h6-c04-independent/delivery-manifest-v1.json')]:
 m=read(base/name)
 for item in m['files']:
  p=base/item['path'];assert p.stat().st_size==item['bytes'] and sha(p)==item['sha256'],str(p)
 packages.append({'manifest':str(base/name),'sha256':sha(base/name),'payloadsVerified':len(m['files'])})
b=read(ROOT/'tests/fixtures/h6-bootstrap-variant/runs/2026-10-22T14-52-59-084Z/report.json')
c=read(ROOT/'tests/fixtures/h6-c04-integration/runs/2026-10-22T16-46-33.825Z/report.json')
def assess(b,c):
 failures=[]
 def require(ok,label):
  if not ok:failures.append(label)
 for r,key in [(b,'requiredBootstrapChecks'),(c,'requiredC04Checks')]:
  index={x['id']:x['status'] for x in r['checks']}
  for test in expected[key]:require(index.get(test)=='PASS',test)
 require(b['state']==addendum['bootstrapState'],'bootstrap_run_state')
 require(c['status']==addendum['c04Status'],'C04_run_status')
 require(c['externalBusinessEffects'] is addendum['externalBusinessEffects'],'no_external_business_effects')
 require(not b['failures'] and not c['failures'],'no_unresolved_run_failure')
 states={x['kind']:x for x in b['conciliation']}
 require(len(states)==4 and all(x['paused'] for x in states.values()),'suspended')
 missing=states['absent-t0-attempt']
 require(missing['attempts']==0 and missing['notFabricated'] and missing['state']=='PENDING_LEGITIMATE_RECONCILIATION_UNAVAILABLE','missing_not_reconstructed')
 require(states['uncertain']['state']=='uncertain','uncertain_not_success_or_failure')
 require(states['executed']['state']=='succeeded' and states['executed']['replay'],'confirmed_existing_attempt_reconciled')
 require(states['absence-proven']['state']=='failed' and states['absence-proven']['replay'],'verified_absence_existing_attempt_reconciled')
 require(b['externalCountBeforeRestore']==b['externalCountAfterReconciliation']==3,'no_duplicate')
 require(next(x['state'] for x in b['objects'] if x['kind']=='missing')=='missing','missing_object')
 require(b['loss']['noRPOorRTOObjective'] is True,'no_invented_objectives')
 require(b['explicitReentry'] is False and c['S11'] is False,'no_reentry')
 require(c['N03'] is False,'no_N03')
 require(b['resourcesStopped'] and c['resourcesStopped'],'resources_stopped')
 return failures
assert not assess(b,c),assess(b,c)
mutations=[('remove required observation',lambda b,c:c['checks'].pop(next(i for i,x in enumerate(c['checks']) if x['id']=='ledger_unchanged'))),('duplicate external contact',lambda b,c:b.update(externalCountAfterReconciliation=4)),('release suspended job',lambda b,c:b['conciliation'][0].update(paused=False)),('invent missing attempt',lambda b,c:b['conciliation'][2].update(attempts=1)),('convert uncertainty to success',lambda b,c:b['conciliation'][1].update(state='succeeded')),('claim missing object recovered',lambda b,c:b['objects'][1].update(state='stored')),('invent RPO/RTO',lambda b,c:b['loss'].update(noRPOorRTOObjective=False)),('authorize S11',lambda b,c:c.update(S11=True)),('authorize N03',lambda b,c:c.update(N03=True))]
mutations += [('bootstrap status invalid',lambda b,c:b.update(state='FAILED')),('C04 status FAIL',lambda b,c:c.update(status='FAIL')),('C04 external business effects true',lambda b,c:c.update(externalBusinessEffects=True))]
assert [x[0] for x in mutations]==expected['countertests']+addendum['countertests']
negative=[]
for name,mutate in mutations:
 bb,cc=copy.deepcopy(b),copy.deepcopy(c);mutate(bb,cc);rejected=assess(bb,cc);assert rejected,name
 negative.append({'countertest':name,'detected':rejected,'status':'PASS'})
report={'type':'sealed evidence verification and in-memory falsification controls; no runtime rerun','status':'PASS','expectedAddendumSHA256':sha(OUT/'expected-addendum-v2.json'),'expectedSHA256':sha(OUT/'expected-v1.json'),'instrumentSHA256':sha(Path(__file__)),'packages':packages,'normativeReferences':referenceChecks,'requiredChecksVerified':len(expected['requiredBootstrapChecks'])+len(expected['requiredC04Checks']),'countertests':negative,'AC073':'PASS_LOCAL_QUARANTINE_OBLIGATIONS','businessReconciliationOfMissingAttempt':False,'unknownResolved':False,'N03RequiredForAC073':False,'S11':False,'taskState':'IN_PROGRESS','taskCompleted':False}
(OUT/'verification-v3.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'status':report['status'],'packages':[(p['payloadsVerified'],p['sha256']) for p in packages],'requiredChecksVerified':report['requiredChecksVerified'],'countertests':len(negative)}))
