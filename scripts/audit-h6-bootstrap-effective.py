"""Actual privilege negatives and transactional tampering in auditor-owned restores."""
import hashlib,importlib.util,json,os,re,subprocess,time,datetime
from pathlib import Path
os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-bootstrap-independent'
PG=Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
spec=importlib.util.spec_from_file_location('reader',ROOT/'scripts/h6-bootstrap-audit-reader.py');r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
base=json.loads((OUT/'restore-1792679399491683000.json').read_text());private=Path(base['privateRoot'])
record={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateRoot':str(private),'expectedSHA256':hashlib.sha256((OUT/'effective-expected-v1.json').read_bytes()).hexdigest(),'scriptSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'checks':[],'failures':[],'taskCompleted':False,'scope':'Auditor-owned restored databases only; no application/HTTP boundary acceptance'}
started=[]
def check(name,ok,facts=None):
 record['checks'].append({'id':name,'status':'PASS'if ok else'FAIL','facts':facts})
 assert ok,name
def run(c,sql,user=None,db=None):
 p=subprocess.run([str(PG/'psql'),*r.sql_args(c,user,db),'-q','-v','VERBOSITY=verbose'],input=sql.encode(),capture_output=True,env={'PATH':os.environ['PATH'],'LANG':'C','LC_ALL':'C'})
 m=re.search(r'ERROR:\s+([0-9A-Z]{5}):',p.stderr.decode(errors='replace'))
 return p.returncode,m.group(1)if m else None,p.stdout
def graph(c):return r.query(c,"select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3")
try:
 core={'data':private/'core/data','socket':private/'core/s','port':59951,'bootstrap':'h2_bootstrap','database':'crm_h6015_core'}
 store={'data':private/'storage/data','socket':private/'storage/s','port':59952,'bootstrap':'postgres','database':'postgres'}
 for c in [core,store]:
  r.command('pg_ctl',['-D',str(c['data']),'-l','/dev/null','-o',f"-k '{c['socket']}' -h '' -p {c['port']}",'-w','start']);started.append(c)
 for i,q in enumerate(['select secret from crm_f1.keys','select secret from crm_f2.keys','select * from crm_private.crm_actors','create table crm_private.unapproved_audit(id int)']):
  code,state,_=run(core,q+';','crm_h0_runtime');check('core_runtime_denial_'+str(i),code!=0 and state=='42501',{'sqlstate':state})
 code,state,_=run(core,'select * from auth.sessions;','crm_h0_runtime','crm_h6015_auth');check('runtime_auth_sessions_denied',code!=0 and state=='42501',{'sqlstate':state})
 positive=r.query(store,'select count(*)::int n from storage.objects')[0]['n'];check('storage_positive_private_rows',positive>0,{'rows':positive})
 for user in ['anon','authenticated']:
  # Provider roles are NOLOGIN; exercise their effective principal via SET ROLE.
  code,state,raw=run(store,'SET ROLE '+user+'; select count(*) from storage.objects;')
  check('storage_'+user+'_no_private_rows',state=='42501'if code else raw.strip()==b'0',{'sqlstate':state,'rows':0 if not code else None})
 for c,role in [(core,'crm_h0_runtime'),(store,'authenticated')]:
  before=graph(c);bootstrap=c['bootstrap']
  text=f"BEGIN; GRANT {bootstrap} TO {role} WITH ADMIN TRUE, INHERIT TRUE, SET TRUE; SELECT json_build_object('edge',(SELECT count(*) FROM pg_auth_members WHERE roleid='{bootstrap}'::regrole AND member='{role}'::regrole AND grantor='{bootstrap}'::regrole AND admin_option AND inherit_option AND set_option),'effectiveSet',pg_has_role('{role}','{bootstrap}','SET')); ROLLBACK;"
  code,state,raw=run(c,text);check(role+'_tamper_executes_in_transaction',code==0)
  evidence=json.loads(raw);check(role+'_extra_edge_and_authority_detected',evidence=={'edge':1,'effectiveSet':True},evidence)
  check(role+'_graph_exact_after_rollback',graph(c)==before)
 # Add and remove ACL in rollback transactions. The affected object really exists.
 before=r.query(core,"select relacl::text acl from pg_class where oid='crm_f1.keys'::regclass")
 before_priv=r.query(core,"select has_table_privilege('crm_h0_runtime','crm_f1.keys','SELECT') value")[0]['value'];check('no_baseline_key_read',before_priv is False)
 code,state,raw=run(core,"BEGIN; GRANT SELECT ON crm_f1.keys TO crm_h0_runtime; SELECT json_build_object('select',has_table_privilege('crm_h0_runtime','crm_f1.keys','SELECT'),'acl',(select relacl::text from pg_class where oid='crm_f1.keys'::regclass)); ROLLBACK;")
 check('added_acl_changes_effective_privilege',code==0 and json.loads(raw)['select']is True and json.loads(raw)['acl']!=before[0]['acl'])
 check('acl_and_effective_privilege_restored_after_rollback',r.query(core,"select relacl::text acl from pg_class where oid='crm_f1.keys'::regclass")==before and r.query(core,"select has_table_privilege('crm_h0_runtime','crm_f1.keys','SELECT') value")[0]['value']is False)
 # Storage authenticated normally has SELECT but RLS denies rows without identity.
 baseline=r.query(store,"select has_table_privilege('authenticated','storage.objects','SELECT') value")[0]['value'];check('storage_expected_select_acl_present',baseline is True)
 code,state,raw=run(store,"BEGIN; REVOKE SELECT ON storage.objects FROM authenticated; SELECT json_build_object('select',has_table_privilege('authenticated','storage.objects','SELECT')); ROLLBACK;")
 check('missing_acl_detected_by_effective_query',code==0 and json.loads(raw)['select']is False)
 check('missing_acl_probe_rolled_back',r.query(store,"select has_table_privilege('authenticated','storage.objects','SELECT') value")[0]['value']is True)
 record['state']='PASS_EFFECTIVE_PRIVILEGE_PROBES'
except Exception as e:
 record['state']='FAIL_PRESERVED';record['failures'].append({'class':type(e).__name__,'rule':str(e)if re.fullmatch('[A-Za-z0-9_]+',str(e))else'INSTRUMENT_FAILURE'})
finally:
 for c in reversed(started):
  try:r.command('pg_ctl',['-D',str(c['data']),'-m','fast','-w','stop'])
  except Exception:record['failures'].append({'stopFailed':str(c['data'])})
 record['resourcesStopped']=all(not(c['data']/'postmaster.pid').exists()for c in started)
 p=OUT/('effective-'+str(time.time_ns())+'.json');p.write_text(json.dumps(record,indent=2)+'\n');print(json.dumps({'report':str(p),'state':record['state'],'checks':len(record['checks']),'failures':record['failures']}))
