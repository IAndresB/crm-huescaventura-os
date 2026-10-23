"""Read-only independent acquisition at the executor's S05 gate.
No executor snapshot or equality code is imported. Secrets stay private.
"""
import datetime, hashlib, importlib.util, json, os, re, subprocess, sys, tempfile, time
from pathlib import Path
os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-bootstrap-independent'
EXEC=Path('/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os')
module=ROOT/'scripts/h6-bootstrap-audit-reader.py';s=importlib.util.spec_from_file_location('reader',module);r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
E=OUT/'checkpoint-expected-v1.json'
if not E.exists():
 E.write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenBeforeObservation':True,'expected':'current candidate S05 must preserve all source authority attributes, full schema SQL, typed rows, exact grants and effective privileges; no S06 yet','priorExpectedSHA256':sha(OUT/'expected-v1.json'),'checks':['all checkpoint source locks unchanged in working and frozen files','all immutable norm source hashes exact','bootstrap10 same name; derivedglobals only one checked CREATE replacement','every dump schema byte exact source and restored, fixed restrict key','all typed rows equal independent t0 expectation','all roles including builtin, options, expiry, config, memberships, grantors, parameterACL, tablespaces equal live source','all database role settings logical identities equal','effective role/table/column/schema/function/sequence/database rights including grantoption same','query actual destination listener is socket-only','original dumps/globals receipts match','no S06 or S11']},indent=2)+'\n')
if len(sys.argv)==1:print(json.dumps({'expected':str(E),'sha256':sha(E)}));sys.exit()
checkpoint=Path(sys.argv[1]);cp=json.loads(checkpoint.read_text());private=Path(tempfile.mkdtemp(prefix='h6ba-current-',dir='/tmp'))
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checkpoint':str(checkpoint),'checkpointSHA256':sha(checkpoint),'expectedSHA256':sha(E),'scriptSHA256':sha(Path(__file__)),'readerSHA256':sha(module),'privateRoot':str(private),'checks':[],'failures':[],'S11':'NOT_EXECUTED','taskCompleted':False,'scope':'independent S05 read-only gate of current candidate; no S06-S10 acceptance'}
def check(name,ok,facts=None):
 report['checks'].append({'name':name,'status':'PASS'if ok else'FAIL','facts':facts})
 if not ok:raise ValueError(name)
def save(name,v):(private/name).write_text(json.dumps(v,sort_keys=True,indent=2)+'\n')
def globals(c):
 return {'bootstrap':r.query(c,'select oid::text,rolname from pg_roles where oid=10'),
 'roles':r.query(c,'select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,rolconfig from pg_roles order by 1'),
 'memberships':r.query(c,'select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3'),
 'parameterACL':r.query(c,'select parname,paracl::text from pg_parameter_acl order by 1'),
 'tablespaces':r.query(c,'select spcname,pg_get_userbyid(spcowner) owner,spcacl::text,spcoptions from pg_tablespace order by 1'),
 'settings':r.query(c,"select coalesce(d.datname,'*') database,coalesce(ro.rolname,'*') role,x.setconfig from pg_db_role_setting x left join pg_database d on d.oid=x.setdatabase left join pg_roles ro on ro.oid=x.setrole order by 1,2")}
def effective(c):
 # Each identity is logical; grantors are compared separately without renaming.
 base="from pg_roles r cross join pg_class c join pg_namespace n on n.oid=c.relnamespace"
 ns="r.rolname !~ '^pg_' and n.nspname !~ '^pg_' and n.nspname<>'information_schema'"
 vals={
 'roles':r.query(c,"select r.rolname actor,t.rolname target,p.kind,pg_has_role(r.oid,t.oid,p.kind) allowed from pg_roles r cross join pg_roles t cross join unnest(array['MEMBER','USAGE','SET']) p(kind) where r.rolname !~ '^pg_' order by 1,2,3"),
 'schemas':r.query(c,"select r.rolname actor,n.nspname object,p.kind,has_schema_privilege(r.oid,n.oid,p.kind) allowed from pg_roles r cross join pg_namespace n cross join unnest(array['USAGE','CREATE','USAGE WITH GRANT OPTION','CREATE WITH GRANT OPTION']) p(kind) where "+ns+" order by 1,2,3"),
 'tables':r.query(c,"select r.rolname actor,n.nspname schema,c.relname object,p.kind,has_table_privilege(r.oid,c.oid,p.kind) allowed "+base+" cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN','SELECT WITH GRANT OPTION','INSERT WITH GRANT OPTION','UPDATE WITH GRANT OPTION','DELETE WITH GRANT OPTION','TRUNCATE WITH GRANT OPTION','REFERENCES WITH GRANT OPTION','TRIGGER WITH GRANT OPTION','MAINTAIN WITH GRANT OPTION']) p(kind) where "+ns+" and c.relkind in ('r','p','v','m','f') order by 1,2,3,4"),
 'columns':r.query(c,"select r.rolname actor,n.nspname schema,c.relname object,a.attname col,p.kind,has_column_privilege(r.oid,c.oid,a.attnum,p.kind) allowed "+base+" join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped cross join unnest(array['SELECT','INSERT','UPDATE','REFERENCES','SELECT WITH GRANT OPTION','INSERT WITH GRANT OPTION','UPDATE WITH GRANT OPTION','REFERENCES WITH GRANT OPTION']) p(kind) where "+ns+" and c.relkind in ('r','p','v','m','f') order by 1,2,3,4,5"),
 'functions':r.query(c,"select r.rolname actor,p.oid::regprocedure::text object,x.kind,has_function_privilege(r.oid,p.oid,x.kind) allowed from pg_roles r cross join pg_proc p join pg_namespace n on n.oid=p.pronamespace cross join unnest(array['EXECUTE','EXECUTE WITH GRANT OPTION']) x(kind) where "+ns+" order by 1,2,3"),
 'sequences':r.query(c,"select r.rolname actor,n.nspname schema,c.relname object,p.kind,has_sequence_privilege(r.oid,c.oid,p.kind) allowed "+base+" cross join unnest(array['SELECT','UPDATE','USAGE','SELECT WITH GRANT OPTION','UPDATE WITH GRANT OPTION','USAGE WITH GRANT OPTION']) p(kind) where "+ns+" and c.relkind='S' order by 1,2,3,4"),
 'database':r.query(c,"select r.rolname actor,p.kind,has_database_privilege(r.oid,current_database(),p.kind) allowed from pg_roles r cross join unnest(array['CONNECT','CREATE','TEMPORARY','CONNECT WITH GRANT OPTION','CREATE WITH GRANT OPTION','TEMPORARY WITH GRANT OPTION']) p(kind) where r.rolname !~ '^pg_' order by 1,2")}
 return vals
try:
 check('checkpoint_waits_before_S06',cp['noS06']and cp['state']=='WAITING_INDEPENDENT_AUDIT')
 for x in cp['sourceLock']:
  check('source_lock_'+x['path'].replace('/','_'),sha(EXEC/x['path'])==x['sha256']==sha(checkpoint.parent/'source'/x['path']))
 for x in json.loads((OUT/'expected-v1.json').read_text())['sourceLock']:
  check('norm_lock_'+x['path'].replace('/','_'),sha(EXEC/x['path'])==x['sha256'])
 check('executor_expected_locked',sha(EXEC/'tests/fixtures/h6-bootstrap-variant/expected-v1.json')==cp['expectedSHA256'])
 p=Path(cp['privateRoot']);prior=json.loads((checkpoint.parent/'report.json').read_text())
 check('backups_original_hashes',all(sha(p/x['path'])==x['sha256'] for x in prior['backups']))
 for kind in ['core','storage']:
  boot='h2_bootstrap'if kind=='core'else'postgres';a=(p/(kind+'-globals.sql')).read_bytes();b=(p/(kind+'-globals-bootstrap-variant.sql')).read_bytes()
  needle=('CREATE ROLE '+boot+';').encode();pattern=rb'DO \$h6015_bootstrap\$ BEGIN\n IF NOT EXISTS \(SELECT 1 FROM pg_roles WHERE oid=10 AND rolname=\''+boot.encode()+rb"' AND rolsuper\) THEN\n  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='H6015_BOOTSTRAP_PRECONDITION';\n END IF;\nEND \$h6015_bootstrap\$;"
  matches=list(re.finditer(pattern,b));check(kind+'_one_checked_create_replacement',len(matches)==1 and a.count(needle+b'\n')==1)
  m=matches[0];check(kind+'_all_other_globals_bytes_exact',b[:m.start()]+needle+b[m.end():]==a)
 for kind,src,dst,sp,dp,boot,db in [('core','sourceCore','destCore',59710,cp['corePort'],'h2_bootstrap','crm_h6015_core'),('auth','sourceCore','destCore',59710,cp['corePort'],'h2_bootstrap','crm_h6015_auth'),('storage','sourceStorage','destStorage',59711,cp['storagePort'],'postgres','postgres')]:
  cs={'socket':Path(cp['resources'][src])/'socket','port':sp,'bootstrap':boot,'database':db};cd={'socket':Path(cp['resources'][dst])/'socket','port':dp,'bootstrap':boot,'database':db}
  check(kind+'_socket_only',r.query(cd,"select current_setting('listen_addresses') value")==[{'value':''}])
  gs,gd=globals(cs),globals(cd);save(kind+'-globals-source.json',gs);save(kind+'-globals-dest.json',gd)
  check(kind+'_globals_all_equal_live',gs==gd,{'roles':len(gs['roles']),'memberships':len(gs['memberships'])})
  check(kind+'_bootstrap_oid10_name',gs['bootstrap']==[{'oid':'10','rolname':boot}])
  data=r.data_hashes(cd);t0=json.loads((p/(kind+'-snapshot-t0.json')).read_text());save(kind+'-independent-data.json',data)
  check(kind+'_typed_data_t0_exact',data==t0['data'],{'tables':len(data),'rows':sum(x['count']for x in data.values())})
  key='H6BootstrapIndependentFixedKey'
  ex=r.command('pg_restore',['--schema-only','--create','--restrict-key='+key,'--file=-',str(p/(kind+'.dump'))])
  ob=r.command('pg_dump',[*r.common_args(cd),'--dbname='+db,'--schema-only','--create','--no-publications','--no-subscriptions','--restrict-key='+key])
  so=r.command('pg_dump',[*r.common_args(cs),'--dbname='+db,'--schema-only','--create','--no-publications','--no-subscriptions','--restrict-key='+key])
  (private/(kind+'-schema-archive.sql')).write_bytes(ex);(private/(kind+'-schema-restored.sql')).write_bytes(ob);(private/(kind+'-schema-source.sql')).write_bytes(so)
  check(kind+'_full_schema_SQL_byte_equal',ex==ob==so,{'sha256':hashlib.sha256(ex).hexdigest()})
  es,ed=effective(cs),effective(cd);save(kind+'-effective-source.json',es);save(kind+'-effective-dest.json',ed)
  check(kind+'_independent_effective_exact_including_grantoptions',es==ed,{'cells':{k:len(v)for k,v in es.items()}})
 check('checkpoint_unchanged_after_audit',sha(checkpoint)==report['checkpointSHA256'])
 check('source_unchanged_after_audit',all(sha(EXEC/x['path'])==x['sha256']for x in cp['sourceLock']))
 check('no_S06_during_audit',json.loads((checkpoint.parent/'report.json').read_text())['state']=='WAITING_INDEPENDENT_S05_AUDIT')
 report['state']='PASS_INDEPENDENT_CURRENT_S05_ONLY';report['verdict']='PASS'
except Exception as e:
 report['state']='FAIL_PRESERVED';report['verdict']='FAIL';report['failures'].append({'class':type(e).__name__,'rule':str(e)if re.fullmatch('[A-Za-z0-9_.-]+',str(e))else'INSTRUMENT_FAILURE'})
finally:
 dest=OUT/('checkpoint-result-'+str(time.time_ns())+'.json');dest.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(dest),'sha256':sha(dest),'verdict':report['verdict'],'checks':len(report['checks']),'failures':report['failures'],'privateRoot':str(private)}))
