"""Focused completion after preserved instrumentation failure; no recapture."""
import collections,datetime,hashlib,importlib.util,json,os,pathlib,re,sys,time
sys.dont_write_bytecode=True;os.umask(0o077)
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-c04-independent';sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('r',ROOT/'scripts/h6-c04-independent-reader.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
prior=OUT/'database-result-1792688185030978000.json';old=json.loads(prior.read_text());private=pathlib.Path(old['privateRoot']);c={'socket':private/'final/socket','port':59971,'bootstrap':'h2_bootstrap','database':'crm_h6015_core'};data=private/'final/data'
report={'createdUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'priorResult':str(prior),'priorSHA256':sha(prior),'instrumentSHA256':sha(__file__),'checks':[],'failures':[],'scope':'Independent sealed SQL acquisition reused; only corrected session query and Auth final readback executed','S11':False,'completed':False}
def check(name,ok,details=None):
 q={'id':name,'status':'PASS' if ok else 'FAIL'}
 if details is not None:q['details']=details
 report['checks'].append(q)
 if not ok:report['failures'].append(name)
def vals(table,side):return [json.loads(x)['values'] for x in side[table]['rows']]
def canonical(x):return json.dumps(x,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def instant(s):return datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
started=False
try:
 a=json.loads((pathlib.Path(old['captures']['base']['privateRoot'])/'rows.json').read_text());b=json.loads((pathlib.Path(old['captures']['final']['privateRoot'])/'rows.json').read_text());new=json.loads((private/'new-rows.json').read_text())
 for label,cap in old['captures'].items():
  cr=json.loads(pathlib.Path(cap['report']).read_text());check(label+'-sealed-capture-unchanged',sha(cap['report'])==cap['sha256'] and all(sha(pathlib.Path(cap['privateRoot'])/x['path'])==x['sha256'] for x in cr['privateCaptures']))
 root=pathlib.Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-c04-integration-r2/h6c04-mGM2NY');ledgerp=root/'durable-external-ledger.json';ledger=json.loads(ledgerp.read_text());ledgerhash=sha(ledgerp)
 baseledger=pathlib.Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-bootstrap-variant/h6boot-0o5cEb/durable-external-ledger.json');check('independent-ledger-original-byte-exact',baseledger.read_bytes()==ledgerp.read_bytes())
 actors=vals('crm_private.crm_actors',b);byactor={x['actor_id']:x for x in actors};defs={(x['definition_id'],x['version']):x for x in vals('crm_private.b08_definitions',b)};executions={x['execution_id']:x for x in vals('crm_private.b08_executions',b)}
 records=new['crm_private.b07_records'];links=new['crm_private.b07_links'];ops=new['crm_private.b07_operations'];hist=new['crm_private.b07_history'];reviews=0;candidates=0
 for i,row in enumerate(records):
  tag='record-'+str(i+1);material=row['material'];payload=json.loads(material['claim']);claim=json.loads(payload['claim']);registration=payload['registration'];obs=claim['observation'];actor=byactor[row['recorded_by']];linked=[x for x in links if x['record_id']==row['record_id']];operations=[x for x in ops if x['result_ref']==row['record_id']];history=[x for x in hist if x['subject_id']==row['record_id']]
  check(tag+'-ledger-exact',obs in ledger and obs['kind'] in ['absent-t0-attempt','uncertain'])
  check(tag+'-manual-source-no-result',row['record_kind']=='evidence' and material['source_kind']=='manual' and row['source_ref']=='local-custody:ledger-sha256:'+ledgerhash and claim['coreAttempt']=='not_reconstructed' and claim['businessResultApplied'] is False)
  check(tag+'-one-record-operation-history-link',len(linked)==len(operations)==len(history)==1)
  link=linked[0];op=operations[0];history=history[0];context=defs[(executions[obs['executionId']]['definition_id'],executions[obs['executionId']]['version'])]['context']
  check(tag+'-context-and-purpose',link['context_kind']==context['contextKind'] and link['context_id']==context['contextId'] and row['purpose']==context['purpose'])
  check(tag+'-coverage-exact',json.loads(material['coverage'])=={k:obs[k] for k in ['executionId','attemptId','partId','coverage']} and link['coverage']==material['coverage'])
  check(tag+'-history-and-actors',history['operation_id']==op['operation_id'] and op['actor_id']==history['actor_id']==link['linked_by']==row['recorded_by'] and history['after_state']['record']==row and history['after_state']['link']==link)
  check(tag+'-temporal-separation',instant(row['occurred_at'])==instant(obs['at']) and instant(row['recorded_at'])>=instant(registration['receivedAt'])>instant(row['occurred_at']))
  check(tag+'-preservation',registration['preservation']=='authorized-manual-record')
  if 'verification' in registration:
   reviews+=1;check(tag+'-review-correct',material['certainty']=='reviewed' and registration['verification']['reviewerIdentityId']==actor['auth_subject'] and instant(row['recorded_at'])>=instant(registration['verification']['reviewedAt'])>=instant(registration['receivedAt']))
  else:candidates+=1;check(tag+'-candidate-correct',material['certainty']=='candidate')
 check('reviewed-two-candidate-five',reviews==2 and candidates==5)
 missing=next(x for x in ledger if x['kind']=='absent-t0-attempt');unknown=next(x for x in ledger if x['kind']=='uncertain')
 check('absent-attempt-not-reconstructed',not any(x['attempt_id']==missing['attemptId'] for x in vals('crm_private.b08_attempts',b)))
 check('uncertain-witness-remains-unknown',unknown['observed']=='unknown')
 check('four-work-items-remain-paused',len(executions)==4 and all(x['control_state']=='paused' for x in executions.values()))
 f1=[x for x in vals('crm_f1.keys',b) if x['enabled']];f2=[x for x in vals('crm_f2.keys',b) if x['enabled']]
 check('F1-F2-independent-secrets-and-generations',len(f1)==len(f2)==1 and f1[0]['secret']!=f2[0]['secret'] and f1[0]['generation']!=f2[0]['generation'] and all(x['secret'] not in [v['secret'] for t in ['crm_f1.keys','crm_f2.keys'] for v in vals(t,a)] and x['generation'] not in [v['generation'] for t in ['crm_f1.keys','crm_f2.keys'] for v in vals(t,a)] for x in f1+f2))
 parent=json.loads((root/'core-after-c04.json').read_text());check('executor-final-snapshot-matches-independent-SQL',parent.keys()==b.keys() and all(collections.Counter(canonical(json.loads(x)) for x in parent[t])==collections.Counter(canonical(v) for v in vals(t,b)) for t in parent))
 check('all-new-revocations-Auth-completed',len(new['crm_private.global_access_revocations'])==5 and all(x['auth_state']=='revoked' and x['auth_revoked_at'] is not None for x in new['crm_private.global_access_revocations']))
 r.command('pg_ctl',['-D',str(data),'-l','/dev/null','-o',f"-c listen_addresses='' -k {c['socket']} -p {c['port']}",'-w','start']);started=True
 check('socket-only',r.query(c,"select current_setting('listen_addresses') x")==[{'x':''}])
 check('read-only',r.query(c,"select current_setting('transaction_read_only') x")==[{'x':'on'}])
 # Predicate is deliberately weaker than full F2 verification: generation alone
 # rejects every historical session; no requirement that revoked_at be rewritten.
 q=r.query(c,'select count(*)::int n from crm_private.crm_sessions s join crm_private.crm_actors a on a.actor_id=s.actor_id where s.access_generation=a.access_generation and s.revoked_at is null')
 check('Core-effective-sessions-zero-by-generation',q==[{'n':0}])
 auth={**c,'database':'crm_h6015_auth'};check('Auth-provider-sessions-zero',r.query(auth,'select count(*)::int n from auth.sessions')==[{'n':0}])
 report['state']='PASS' if not report['failures'] else 'FAIL_PRESERVED'
except Exception as ex:
 report['state']='FAIL_PRESERVED';m=str(ex);report['failures'].append({'class':type(ex).__name__,'rule':m if re.fullmatch('[A-Za-z0-9_.-]+',m) else 'PRIVATE_DETAILS_OMITTED'})
finally:
 if started:r.command('pg_ctl',['-D',str(data),'-m','fast','-w','stop'])
 report['allAuditResourcesStopped']=not(data/'postmaster.pid').exists();report['finishedUTC']=datetime.datetime.now(datetime.timezone.utc).isoformat();p=OUT/('completion-'+str(time.time_ns())+'.json');p.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(p),'sha256':sha(p),'state':report['state'],'checks':len(report['checks']),'failures':report['failures']}))
