"""Independent documentary acceptance validation. No executor generator imported."""
from pathlib import Path
import copy,datetime,hashlib,json,re,subprocess,time
A=Path(__file__).resolve().parents[1];O=A/'tests/fixtures/h6-015-acceptance-independent';R=Path('/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os');F=R/'tests/fixtures/h6-015-acceptance'
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();load=lambda p:json.loads(p.read_text())
e=load(O/'expected-v1.json');m=load(F/'acceptance-matrix-v1.json');checks=[]
def ck(rule,v,**d):
 checks.append({'id':rule,'status':'PASS' if v else 'FAIL',**d})
 if not v:raise AssertionError(rule)
def required(v,rule):
 if not v:raise AssertionError(rule)
reports={}
for x in m['rows']:
 for ev in x['evidence']:reports[ev['report']]=load(R/ev['report'])
def verify_matrix(x,rs):
 required(x['taskState']=='IN_PROGRESS' and x['closureApplied'] is False and x['newProductChanges'] is False,'scope')
 required(len(x['rows'])==15 and {z['id'] for z in x['rows']}=={z['id'] for z in e['normativeAssignments']},'all15-exact')
 for z in x['rows']:
  norm=next(a for a in e['normativeAssignments'] if a['id']==z['id']);required(z['tasksLine']==norm['line'] and z['result']=='SATISFACTORIA_LOCAL' and bool(z['evidence']),'normative-map')
  for ev in z['evidence']:
   required(sha(R/ev['report'])==ev['sha256'],'report-hash')
   required(any(c['id']==ev['check'] and c['status']=='PASS' for c in rs[ev['report']]['checks']),'case-PASS')
 for path,r in rs.items():
  required(r['failures']==[] and r['resourcesStopped'] is True and all(c['status']=='PASS' for c in r['checks']),'runtime-scope')
  if 'bootstrap-variant' in path:required(r['state']=='TECHNICAL_SCOPE_EXECUTED_REVIEW_PENDING' and r['explicitReentry'] is False and r['taskCompleted'] is False and r['externalCountAfterReconciliation']==r['externalCountBeforeRestore'],'bootstrap-status')
  else:
   required(r['status']=='PASS' and r['S11'] is False and r['N03'] is False,'runtime-state')
   required(type(r['externalBusinessEffects']) is int and r['externalBusinessEffects']==0,'external-count')
 required(len(x['dependencies'])==4 and {z['id'] for z in x['dependencies']}==set(e['directDependencies']),'deps')
 for d in x['dependencies']:required(d['state']=='COMPLETED_LOCAL_ISOLATED' and sha(R/d['evidence'])==d['sha256'],'dep-identity')
 required(len(x['additionalIntegrations'])==6 and {z['task'] for z in x['additionalIntegrations']}=={z['sourceTask'].split(' — ')[0] for z in e['additionalIntegrations']},'integrations')
 required([z['id'] for z in x['phases']]==['S%02d'%i for i in range(1,14)],'phases')
 required(x['phases'][10]['result']=='RESERVADA_NO_EJECUTADA' and x['phases'][11]['result']=='MEDICION_PRE_S11_SATISFACTORIA' and x['phases'][12]['result']=='EXPEDIENTE_LOCAL_SATISFACTORIO','phase-limit')
 required(x['measurements']['outsideWitnessLoss']=='NO_DETERMINADA' and x['measurements']['notRPOorRTO'] is True,'loss-limit')
 return True
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(O/'expected-v1.json'),'matrixSHA256':sha(F/'acceptance-matrix-v1.json'),'scriptSHA256':sha(__file__),'checks':checks,'newRuntimeTests':False,'taskState':'IN_PROGRESS','S11':False,'closureApplied':False}
try:
 ck('expected-still-frozen',sha(O/'expected-v1.json')=='38fd8f1c7858a9aaa2317116840b311478974e355c9c8a77da1ded31ac68d5bd')
 for p,h in e['sourceHashes'].items():ck('norm-source-'+p,sha(R/p)==h)
 tasks=(R/'specs/001-core-crm/tasks.md').read_text().splitlines()
 for a in e['normativeAssignments']:ck('source-row-'+a['id'],tasks[a['line']-1]==a['normativeRow'])
 ck('matrix-positive',verify_matrix(m,reports))
 for t in m['migrations']:
  base=subprocess.check_output(['git','show','971c55d5ce5770c71284d106d3c0deecca9514b5:'+t['path']],cwd=R)
  ck('unchanged-versioned-migration-'+t['path'],sha(R/t['path'])==t['sha256']==hashlib.sha256(base).hexdigest())
 ck('all68-migrations',len(m['migrations'])==68 and {z['path'] for z in m['migrations']}=={str(z.relative_to(R)) for z in (R/'supabase/migrations').glob('*.sql')})
 count=0
 for p in load(F/'packages-integrity-v1.json')['packages']:
  root=Path(p['worktree']);manifest=root/p['manifest'];ck('manifest-'+p['manifest'],sha(manifest)==p['sha256']);items=load(manifest)['files'];ck('manifest-count-'+p['manifest'],len(items)==p['count'])
  for item in items:
   f=root/item['path'];ck('historic-payload-'+str(count),f.stat().st_size==item['bytes'] and sha(f)==item['sha256']);count+=1
 ck('4390-historical-payloads',count==4390)
 bootstrap=next(v for k,v in reports.items() if 'bootstrap-variant' in k);meas=m['measurements']
 ck('measurement-copy-exact',all(meas[k]==bootstrap[k] for k in ['cut','phases','totalElapsedMs','loss']))
 ck('phase-monotonic',all(z['status']=='PASS' and z['elapsedMs']>=0 and z['startMs']>=0 for z in meas['phases']) and all(meas['phases'][i]['startMs']+meas['phases'][i]['elapsedMs']<=meas['phases'][i+1]['startMs'] for i in range(len(meas['phases'])-1)))
 ck('total-includes-audit-wait',meas['totalElapsedMs']>=sum(z['elapsedMs'] for z in meas['phases']) and next(z for z in meas['phases'] if z['name']=='S05_independent_audit_gate')['elapsedMs']==187152.72899999996)
 ck('runtime-versions-recorded',bootstrap['postgresql']=='postgres (PostgreSQL) 17.11 (Postgres.app)' and bootstrap['resources']['authVersion']=='v2.197.0' and bool(bootstrap['resources']['storageCommit']))
 report['volumes']={'databases':{k:{'tables':len(v),'rows':sum(t['count'] for t in v.values())} for k,v in bootstrap['t0Tables'].items()},'copiedObjects':len(bootstrap['t0Bytes']),'copiedObjectBytes':sum(x['bytes'] for x in bootstrap['t0Bytes']),'dumpBytes':sum(x['bytes'] for x in bootstrap['backups'] if x['path'].endswith('.dump'))}
 # Distinct in-memory falsifications exercise the verifier, never source evidence.
 mutants=[]
 q=copy.deepcopy(m);q['rows'].pop();mutants.append(('missing-assignment',q,reports))
 q=copy.deepcopy(m);q['rows'][0]=q['rows'][1];mutants.append(('duplicate-assignment',q,reports))
 q=copy.deepcopy(m);q['rows'][0]['evidence'][0]['sha256']='0'*64;mutants.append(('report-hash-altered',q,reports))
 q=copy.deepcopy(m);q['rows'][0]['evidence'][0]['check']='NOT_EXECUTED';mutants.append(('invented-case',q,reports))
 q=copy.deepcopy(m);q['closureApplied']=True;mutants.append(('closure-applied',q,reports))
 q=copy.deepcopy(m);q['phases'][10]['result']='SATISFACTORIA_LOCAL';mutants.append(('S11-PASS',q,reports))
 q=copy.deepcopy(m);q['measurements']['outsideWitnessLoss']=0;mutants.append(('unknown-loss-zero',q,reports))
 focal=next(p for p in reports if '/h6-015-acceptance/' in p)
 for name,value in [('zero-as-bool',False),('external-effect',1)]:
  rr=copy.deepcopy(reports);rr[focal]['externalBusinessEffects']=value;mutants.append((name,m,rr))
 rr=copy.deepcopy(reports);rr[focal]['status']='FAIL';mutants.append(('runtime-status-fail',m,rr))
 for name,q,rs in mutants:
  denied=False
  try:verify_matrix(q,rs)
  except AssertionError:denied=True
  ck('counterexample-'+name,denied)
 report['counterexamples']=len(mutants);report['historicalPayloads']=count;report['state']='PASS'
except Exception as error:report['state']='FAIL_PRESERVED';report['failure']={'kind':type(error).__name__,'rule':str(error) if re.fullmatch('[A-Za-z0-9_./-]+',str(error)) else 'DETAIL_OMITTED'}
dest=O/('matrix-readback-'+str(time.time_ns())+'.json');dest.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(dest),'sha256':sha(dest),'state':report['state'],'checks':len(checks),'counterexamples':report.get('counterexamples'),'failure':report.get('failure')}))
if report['state']!='PASS':raise SystemExit(1)
