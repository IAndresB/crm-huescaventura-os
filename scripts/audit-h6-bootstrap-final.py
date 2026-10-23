"""Independent cold-copy acquisition after integration; no original resource is started."""
import ast,collections,datetime,hashlib,importlib.util,json,os,re,shutil,subprocess,sys,tempfile,time
from pathlib import Path
os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-bootstrap-independent';EXEC=Path('/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os')
spec=importlib.util.spec_from_file_location('reader',ROOT/'scripts/h6-bootstrap-audit-reader.py');r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
ns={'r':r};tree=ast.parse((ROOT/'scripts/audit-h6-bootstrap-checkpoint.py').read_text());defs=[x for x in tree.body if isinstance(x,ast.FunctionDef)and x.name in('globals','effective')];exec(compile(ast.Module(body=defs,type_ignores=[]),'<independent-reader>', 'exec'),ns)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
MUTABLE=['crm_f1.keys','crm_f2.keys','crm_ha.reservations','crm_private.b07_object_versions','crm_private.b08_attempts','crm_private.b08_executions','crm_private.b08_parts','crm_private.crm_actors','crm_private.crm_sessions','crm_private.identification_epochs','crm_private.identity_code_counters']
APPEND=['crm_f1.consumption','crm_ha.command_receipts','crm_ha.events','crm_private.b03_history','crm_private.b03_operations','crm_private.b03_opportunities','crm_private.b07_history','crm_private.b07_object_orphans','crm_private.b07_operations','crm_private.b08_command_results','crm_private.external_effect_records','crm_private.global_access_revocation_attempts','crm_private.global_access_revocations','crm_private.identity_codes','crm_private.identity_contexts','crm_private.identity_history','crm_private.identity_operations','crm_private.unit_attempts','crm_private.unit_history','crm_private.unit_operations','crm_private.unit_results','crm_private.unit_roots']
E=OUT/'final-expected-v1.json'
if not E.exists():E.write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenBeforeCurrentIntegratedObservation':True,'policy':'classifications derived from S06-S10 actions and existing SQL; no numeric row-count target inferred','mutableTables':MUTABLE,'appendOnlyTables':APPEND,'remainingTables':'byte/typed-data exact t0','requirements':['complete cold copy with SHA; originals stopped unchanged','globals/owners/schema/effective privileges no changes from t0','independent exact rows final equals final snapshot','all preexisting immutable rows retained with multiplicity','F1/F2 old rows remain with only enabled=false; one fresh distinct key each','old Core sessions revoked, epochs closed; prior Auth sessions absent','object metadata expected exact states including inconsistent wrong-media','all four work items paused and no fabricated t1 attempt','external durable witness count/hash unchanged','no S11/reentry/completion']},indent=2)+'\n')
if len(sys.argv)==1:print(json.dumps({'expected':str(E),'sha256':sha(E)}));sys.exit()
report_path=Path(sys.argv[1]);source_report=json.loads(report_path.read_text());p=Path(source_report['privateRoot']);private=Path(tempfile.mkdtemp(prefix='h6ba-final-',dir='/tmp'))
record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(E),'scriptSHA256':sha(Path(__file__)),'mutableFieldsExpectedSHA256':sha(OUT/'final-mutable-fields-expected-v1.json'),'sourceReportSHA256':sha(report_path),'sourceReport':str(report_path),'privateRoot':str(private),'checks':[],'failures':[],'rowClassifications':[],'S11':'NOT_EXECUTED','taskCompleted':False};active=[]
def check(name,ok,facts=None):
 record['checks'].append({'name':name,'status':'PASS'if ok else'FAIL','facts':facts})
 if not ok:raise ValueError(name)
def start(data,socket,port,bootstrap,database):
 socket.mkdir(mode=0o700);c={'data':data,'socket':socket,'port':port,'bootstrap':bootstrap,'database':database}
 r.command('pg_ctl',['-D',str(data),'-l','/dev/null','-o',f"-k '{socket}' -h '' -p {port}",'-w','start']);active.append(c);return c
def rows(c,table):
 schema,name=table.split('.');return r.query(c,'select to_jsonb(x)::text value from '+r.qident(schema)+'.'+r.qident(name)+' x')
def multiset(c,table):return collections.Counter(x['value']for x in rows(c,table))
def stable_rows(c,table,fields):
 schema,name=table.split('.');array='ARRAY['+','.join("'"+x+"'"for x in fields)+']::text[]';return collections.Counter(x['value']for x in r.query(c,'select (to_jsonb(x)-'+array+')::text value from '+r.qident(schema)+'.'+r.qident(name)+' x'))
def copy_cluster(source,label):
 data=Path(source)/'data';check(label+'_original_stopped',not(data/'postmaster.pid').exists());target=private/label/'data';target.mkdir(mode=0o700,parents=True);entries=[]
 for here,dirs,files in os.walk(data,followlinks=False):
  here=Path(here);d=target/here.relative_to(data);d.mkdir(mode=0o700,parents=True,exist_ok=True)
  for n in dirs:check(label+'_no_symlink_dir_'+str(len(entries)),not(here/n).is_symlink())
  for n in files:
   a=here/n;b=d/n;assert a.is_file()and not a.is_symlink();h=sha(a);shutil.copyfile(a,b);os.chmod(b,0o600);assert h==sha(a)==sha(b);entries.append({'source':str(a),'destination':str(b),'sha256':h,'bytes':a.stat().st_size})
 (private/(label+'-cold-copy.json')).write_text(json.dumps(entries,indent=2)+'\n');check(label+'_coldcopy_all_bytes_exact',True,{'files':len(entries),'bytes':sum(x['bytes']for x in entries)});return target,entries
try:
 check('executor_no_failures_and_stopped',source_report['state']=='TECHNICAL_SCOPE_EXECUTED_REVIEW_PENDING'and not source_report['failures']and source_report['resourcesStopped'])
 check('no_S11_task_close',source_report['taskCompleted']is False and source_report['explicitReentry']is False and'S11'in source_report['unexecuted'])
 check('code_unchanged_from_executed',all(sha(EXEC/x['path'])==x['sha256']for x in source_report['sourceLock']))
 # Reconstruct t0 independently with our previously verified restore instrument.
 result=subprocess.run([sys.executable,str(ROOT/'scripts/audit-h6-bootstrap-current-reconstruct.py'),str(p)],capture_output=True,text=True)
 summary=json.loads(result.stdout);check('independent_t0_reconstruction',summary['state']=='PASS_INDEPENDENT_CURRENT_T0_RECONSTRUCTION');record['t0Reconstruction']=summary
 t0root=Path(summary['privateRoot'])
 basecore=start(t0root/'core/data',private/'s-t0core',59951,'h2_bootstrap','crm_h6015_core');basestore=start(t0root/'storage/data',private/'s-t0store',59952,'postgres','postgres')
 dcore,corefiles=copy_cluster(source_report['resources']['destCore'],'core-final');dstore,storefiles=copy_cluster(source_report['resources']['destStorage'],'storage-final')
 finalcore=start(dcore,private/'s-finalcore',59956,'h2_bootstrap','crm_h6015_core');finalstore=start(dstore,private/'s-finalstore',59957,'postgres','postgres')
 for kind,base,final in [('core',basecore,finalcore),('auth',{**basecore,'database':'crm_h6015_auth'},{**finalcore,'database':'crm_h6015_auth'}),('storage',basestore,finalstore)]:
  check(kind+'_all_globals_final_equal_t0',ns['globals'](base)==ns['globals'](final))
  args=['--schema-only','--create','--no-publications','--no-subscriptions','--restrict-key=H6IndependentFinalFixedKey']
  a=r.command('pg_dump',[*r.common_args(base),'--dbname='+base['database'],*args]);b=r.command('pg_dump',[*r.common_args(final),'--dbname='+final['database'],*args]);check(kind+'_full_schema_byte_exact_t0',a==b)
  ea,eb=ns['effective'](base),ns['effective'](final);check(kind+'_all_effective_privileges_final_equal_t0',ea==eb,{'cells':sum(len(v)for v in ea.values())})
  (private/(kind+'-effective-final.json')).write_text(json.dumps(eb,indent=2)+'\n')
 final_data=r.data_hashes(finalcore);captured=json.loads((p/'core-snapshot-final.json').read_text())['data'];check('all_final_core_rows_independent_equal_capture',final_data==captured,{'tables':len(final_data),'rows':sum(x['count']for x in final_data.values())})
 t0=json.loads((p/'core-snapshot-t0.json').read_text())['data'];check('all_t0_tables_still_present',set(t0)==set(final_data))
 for table,before in t0.items():
  after=final_data[table]
  if table in MUTABLE:classification='authorized_state_change_fields_only';fields=json.loads((OUT/'final-mutable-fields-expected-v1.json').read_text())['allowedFields'][table];ok=not(stable_rows(basecore,table,fields)-stable_rows(finalcore,table,fields))
  elif table in APPEND:classification='append_only_existing_rows_exact';ok=not(multiset(basecore,table)-multiset(finalcore,table))
  else:classification='unchanged';ok=before==after
  check('rows_'+table,ok);record['rowClassifications'].append({'table':table,'classification':classification,'changed':before!=after,'before':before['count'],'after':after['count']})
 for family in ['crm_f1','crm_f2']:
  before=r.query(basecore,'select to_jsonb(x) value from '+family+'.keys x');after=r.query(finalcore,'select to_jsonb(x) value from '+family+'.keys x');new={x['value']['key_id']:x['value']for x in after};old={x['value']['key_id']:x['value']for x in before}
  check(family+'_old_key_rows_only_disabled',all({**v,'enabled':False}==new[k]for k,v in old.items()))
  added=[v for k,v in new.items()if k not in old];check(family+'_one_fresh_enabled_generation',len(added)==1 and added[0]['enabled']is True and added[0]['generation']not in{v['generation']for v in old.values()}and len([v for v in new.values()if v['enabled']])==1)
 old_sessions=r.query(basecore,'select session_id::text from crm_private.crm_sessions');final_sessions={x['session_id']:x for x in r.query(finalcore,'select session_id::text,revoked_at is not null revoked from crm_private.crm_sessions')}
 check('all_restored_core_sessions_revoked',all(final_sessions[x['session_id']]['revoked']for x in old_sessions))
 old_epochs=r.query(basecore,'select epoch_id::text from crm_private.identification_epochs');closed={x['epoch_id']:x for x in r.query(finalcore,'select epoch_id::text,current_epoch,closed_at is not null closed from crm_private.identification_epochs')}
 check('all_restored_epochs_closed',all(not closed[x['epoch_id']]['current_epoch']and closed[x['epoch_id']]['closed']for x in old_epochs))
 authbase={**basecore,'database':'crm_h6015_auth'};authfinal={**finalcore,'database':'crm_h6015_auth'}
 old_auth={x['id']for x in r.query(authbase,'select id::text from auth.sessions')};new_auth={x['id']for x in r.query(authfinal,'select id::text from auth.sessions')};check('all_t0_provider_sessions_absent',not(old_auth&new_auth))
 obj={x['kind']:x['state']for x in source_report['objects']};check('object_expected_states_exact',obj=={'complete':'stored','missing':'missing','incomplete':'verified_unlinked','corrupt':'inconsistent','wrong-media':'inconsistent'})
 check('four_workitems_paused_without_fabrication',len(source_report['conciliation'])==4 and all(x['paused']for x in source_report['conciliation'])and any(x['kind']=='absent-t0-attempt'and x['attempts']==0 and x['notFabricated']for x in source_report['conciliation']))
 check('simulated_external_count_no_increase',source_report['externalCountBeforeRestore']==source_report['externalCountAfterReconciliation'])
 for e in corefiles+storefiles:assert sha(Path(e['source']))==e['sha256']
 check('original_coldcopy_sources_remained_unchanged',True)
 check('report_and_code_unchanged_after_review',sha(report_path)==record['sourceReportSHA256']and all(sha(EXEC/x['path'])==x['sha256']for x in source_report['sourceLock']))
 record['state']='PASS_INDEPENDENT_INTEGRATED_REVIEW_LOCAL_ONLY';record['verdict']='PASS'
except Exception as e:
 record['state']='FAIL_PRESERVED';record['verdict']='FAIL';record['failures'].append({'class':type(e).__name__,'rule':str(e)if re.fullmatch('[A-Za-z0-9_.-]+',str(e))else'INSTRUMENT_FAILURE'})
finally:
 for c in reversed(active):
  try:r.command('pg_ctl',['-D',str(c['data']),'-m','fast','-w','stop'])
  except Exception:record['failures'].append({'stopFailed':str(c['data'])})
 record['resourcesStopped']=all(not(c['data']/'postmaster.pid').exists()for c in active)
 dest=OUT/('final-result-'+str(time.time_ns())+'.json');dest.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'report':str(dest),'sha256':sha(dest),'state':record['state'],'checks':len(record['checks']),'failures':record['failures'],'privateRoot':str(private)}))
