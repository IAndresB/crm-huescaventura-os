"""Follow-up to preserved final audit FAIL: verify real generation revocation semantics.
Reuses sealed successful acquisitions, no hiding or replacing historical failures.
"""
import datetime,hashlib,importlib.util,json,os,re,subprocess,time
from pathlib import Path
os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-bootstrap-independent';EXEC=Path('/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os')
sp=importlib.util.spec_from_file_location('reader',ROOT/'scripts/h6-bootstrap-audit-reader.py');r=importlib.util.module_from_spec(sp);sp.loader.exec_module(r)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
priorpath=OUT/'final-result-1792681051223735000.json';prior=json.loads(priorpath.read_text());sourcepath=Path(prior['sourceReport']);source=json.loads(sourcepath.read_text());p=Path(source['privateRoot']);private=Path(prior['privateRoot']);t0root=Path(prior['t0Reconstruction']['privateRoot']);E=OUT/'final-revocation-adendum-expected-v1.json'
assert not E.exists(),'EXPECTED_MUST_BE_NEW'
E.write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'preservedPriorFAIL':str(priorpath),'reason':'original auditor incorrectly demanded physical revoked_at and epoch closure; migration revokes by incrementing actor access_generation','approvedSource':'supabase/migrations/202609260002_h0_m03_revoke_all_authority_fix.sql:63-66','sourceSHA256':sha(EXEC/'supabase/migrations/202609260002_h0_m03_revoke_all_authority_fix.sql'),'expected':['old Core session generation strictly below current actor and cannot obtain revoke-all authority','old epochs can remain current physically but bound session cannot satisfy current actor generation','all old provider Auth sessions absent independently','actual object states 2 stored/1 missing/2 inconsistent; real MIME mismatch remains inconsistent','all four executions paused, only original three attempts remain','all t0 objects byte-identical after integrated checks','prior successful schema, privileges, typed-row and immutable-history checks remain sealed','no S11, closure or external effects']},indent=2)+'\n')
record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(E),'priorReport':str(priorpath),'priorReportSHA256':sha(priorpath),'preservedPriorFAIL':True,'sourceReportSHA256':sha(sourcepath),'privateRoot':str(private),'scriptSHA256':sha(Path(__file__)),'checks':[],'failures':[],'taskCompleted':False,'S11':'NOT_EXECUTED','independence':'independent S05 live acquisition, own t0 reconstruction, own final cold copies and SQL verification; Auth HTTP integrated results independently reviewed, not claimed as a second provider execution'}
active=[]
def check(name,ok,facts=None):
 record['checks'].append({'name':name,'status':'PASS'if ok else'FAIL','facts':facts})
 if not ok:raise ValueError(name)
def start(data,socket,port,db):
 c={'data':data,'socket':socket,'port':port,'bootstrap':'h2_bootstrap','database':db};r.command('pg_ctl',['-D',str(data),'-l','/dev/null','-o',f"-k '{socket}' -h '' -p {port}",'-w','start']);active.append(c);return c
def inventory(root):
 entries=[]
 for here,dirs,files in os.walk(root):
  for n in files:
   q=Path(here)/n;assert q.is_file()and not q.is_symlink();entries.append((str(q.relative_to(root)),q.stat().st_size,sha(q)))
 return sorted(entries)
try:
 check('prior_failure_only_incorrect_physical_revocation_expectation',prior['failures']==[{'class':'ValueError','rule':'all_restored_core_sessions_revoked'}]and len([x for x in prior['checks']if x['status']=='FAIL'])==1)
 passed=[x for x in prior['checks']if x['status']=='PASS'];record['inheritedVerifiedChecks']=len(passed)
 check('source_report_same_as_prior_acquisition',sha(sourcepath)==prior['sourceReportSHA256'])
 check('executed_code_unchanged',all(sha(EXEC/x['path'])==x['sha256']for x in source['sourceLock']))
 base=start(t0root/'core/data',private/'s-t0core',59951,'crm_h6015_core');final=start(private/'core-final/data',private/'s-finalcore',59956,'crm_h6015_core')
 current=r.data_hashes(final);check('final_core_all_tables_still_exact_to_capture',current==json.loads((p/'core-snapshot-final.json').read_text())['data'])
 old=r.query(base,'select session_id::text from crm_private.crm_sessions');ids=[x['session_id']for x in old];assert all(re.fullmatch('[a-f0-9-]{36}',x)for x in ids)
 inlist=','.join("'"+x+"'::uuid"for x in ids)
 rows=r.query(final,'select s.session_id::text,s.access_generation<a.access_generation stale,s.revoked_at is not null physically_revoked,(select count(*) from crm_api.f2_lookup_revoke_all_authority(s.auth_subject,s.session_id))::int authority from crm_private.crm_sessions s join crm_private.crm_actors a using(actor_id) where s.session_id in('+inlist+')')
 check('all_t0_core_sessions_effectively_revoked_by_generation',len(rows)==len(ids)and all(x['stale']and x['authority']==0 for x in rows),{'oldSessions':len(rows),'generationInvalidated':sum(x['stale']for x in rows),'physicallyMarkedRevoked':sum(x['physically_revoked']for x in rows)})
 epochs=r.query(final,'select e.current_epoch,e.closed_at is not null closed,s.access_generation<a.access_generation stale from crm_private.identification_epochs e join crm_private.crm_sessions s using(session_id)join crm_private.crm_actors a using(actor_id)where s.session_id in('+inlist+')')
 check('all_old_epoch_bindings_invalidated',len(epochs)==len(ids)and all(x['stale']for x in epochs),{'oldEpochs':len(epochs),'physicalCurrent':sum(x['current_epoch']for x in epochs),'generationInvalidated':sum(x['stale']for x in epochs)})
 ab={**base,'database':'crm_h6015_auth'};af={**final,'database':'crm_h6015_auth'}
 olda={x['id']for x in r.query(ab,'select id::text from auth.sessions')};newa={x['id']for x in r.query(af,'select id::text from auth.sessions')};check('all_t0_provider_auth_sessions_absent',not(olda&newa),{'oldProviderSessions':len(olda),'intersection':len(olda&newa)})
 states=r.query(final,'select state,count(*)::int n from crm_private.b07_object_versions group by state order by state');check('live_final_object_state_counts',states==[{'state':'inconsistent','n':2},{'state':'missing','n':1},{'state':'stored','n':2}],states)
 mismatches=r.query(final,"select count(*)filter(where state='inconsistent'and expected_media<>observed_media)::int wrong_media,count(*)filter(where state='inconsistent'and expected_digest<>observed_digest)::int corrupt from crm_private.b07_object_versions")[0];check('live_mime_and_corruption_inconsistent',mismatches=={'wrong_media':1,'corrupt':1},mismatches)
 check('reported_object_states_exact',{x['kind']:x['state']for x in source['objects']}=={'complete':'stored','missing':'missing','incomplete':'verified_unlinked','corrupt':'inconsistent','wrong-media':'inconsistent'})
 work=r.query(final,"select(select count(*)from crm_private.b08_executions)::int total,(select count(*)from crm_private.b08_executions where control_state='paused')::int paused,(select count(*)from crm_private.b08_attempts)::int attempts,(select count(*)from crm_private.b08_parts where attempt_id is null)::int no_attempt")[0]
 check('actual_work_paused_no_attempt_fabricated',work=={'total':4,'paused':4,'attempts':3,'no_attempt':2},work)
 # The known-absence reconciliation also clears its resolved part's active attempt;
 # durable attempts table keeps exactly the three original identities.
 old_attempts={x['attempt_id']for x in r.query(base,'select attempt_id::text from crm_private.b08_attempts')};new_attempts={x['attempt_id']for x in r.query(final,'select attempt_id::text from crm_private.b08_attempts')};check('durable_attempt_identity_exact_t0',old_attempts==new_attempts)
 before=inventory(p/'bytes-t0');after=inventory(p/'restored-objects');check('all_restored_object_bytes_exact_t0',before==after,{'files':len(before),'bytes':sum(x[1]for x in before)})
 check('all_four_conciliation_paths_paused',len(source['conciliation'])==4 and all(x['paused']for x in source['conciliation'])and any(x['kind']=='absent-t0-attempt'and x['attempts']==0 and x['notFabricated']for x in source['conciliation']))
 check('simulated_external_effect_count_preserved',source['externalCountBeforeRestore']==source['externalCountAfterReconciliation'])
 check('no_S11_or_task_close',source['taskCompleted']is False and source['explicitReentry']is False and'S11'in source['unexecuted'])
 check('source_report_remained_sealed',sha(sourcepath)==record['sourceReportSHA256'])
 record['state']='PASS_INDEPENDENT_INTEGRATED_REVIEW_LOCAL_ONLY';record['verdict']='PASS'
except Exception as e:
 record['state']='FAIL_PRESERVED';record['verdict']='FAIL';record['failures'].append({'class':type(e).__name__,'rule':str(e)if re.fullmatch('[A-Za-z0-9_.-]+',str(e))else'INSTRUMENT_FAILURE'})
finally:
 for c in reversed(active):r.command('pg_ctl',['-D',str(c['data']),'-m','fast','-w','stop'])
 record['resourcesStopped']=all(not(c['data']/'postmaster.pid').exists()for c in active)
 dest=OUT/('final-completion-'+str(time.time_ns())+'.json');dest.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'report':str(dest),'sha256':sha(dest),'state':record['state'],'checks':len(record['checks']),'failures':record['failures']}))
