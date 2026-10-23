"""Read-only engine ACL semantic projection and adversarial values; no catalog writes."""
from pathlib import Path
import hashlib,json,os,subprocess,datetime,time
os.umask(0o077)
W=Path(__file__).resolve().parents[1];O=W/'tests/fixtures/h6-bootstrap-independent';P=Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin');R=Path('/tmp/h6ba-jn5c9n3l');E=O/'acl-expected-v1.json'
expected={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'positive':['NULL relation ACL equals explicit engine default for same owner','sequence default type s yields SELECT/UPDATE/USAGE'],'negative':['empty ACL','PUBLIC SELECT','different grantor','grant option','different owner','different grantee','uppercase S is foreign server, not sequence'],'preserve':['owner','grantor','grantee','privilege','is_grantable'],'defaultSource':'https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-ACLITEM'}
if not E.exists():E.write_text(json.dumps(expected,indent=2)+'\n')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();result={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(E),'scriptSHA256':sha(Path(__file__)),'privateRoot':str(R),'checks':[],'failures':[]}
def command(name,args,input=None):
 p=subprocess.run([str(P/name),*args],input=input,capture_output=True,env={'PATH':os.environ['PATH'],'LANG':'C','LC_ALL':'C'});assert p.returncode==0,'NATIVE_FAILURE';return p.stdout
args=['-X','-w','-h',str(R/'core/s'),'-p','59951','-U','h2_bootstrap','-d','crm_h6015_core','-qAt','-v','ON_ERROR_STOP=1']
def query(sql):return json.loads(command('psql',args,sql.encode()))
def project(acl,owner="'crm_h0_table_owner'::regrole",kind="'r'"):
 sql="select coalesce(jsonb_agg(x order by x::text),'[]'::jsonb) from (select jsonb_build_array(pg_get_userbyid(a.grantor),case when a.grantee=0 then '@PUBLIC'else pg_get_userbyid(a.grantee)end,a.privilege_type,a.is_grantable)x from aclexplode(coalesce("+acl+",acldefault("+kind+","+owner+")))a)t;"
 value="coalesce("+acl+",acldefault("+kind+","+owner+"))"
 sql="select case when cardinality("+value+")=0 then '[]'::jsonb else ("+sql.removesuffix(";")+ ") end;"
 return query(sql)
def check(name,ok):result['checks'].append({'id':name,'status':'PASS'if ok else'FAIL'});assert ok,name
started=False
try:
 command('pg_ctl',['-D',str(R/'core/data'),'-l','/dev/null','-o',f"-k '{R/'core/s'}' -h '' -p 59951",'-w','start']);started=True
 before=project('NULL::aclitem[]');explicit=project("acldefault('r','crm_h0_table_owner'::regrole)");check('null_equals_explicit_default',before==explicit)
 check('empty_acl_differs',project("'{}'::aclitem[]")!=before)
 check('public_addition_differs',project("acldefault('r','crm_h0_table_owner'::regrole)||makeaclitem(0,'crm_h0_table_owner'::regrole,'SELECT',false)")!=before)
 check('grantor_change_differs',project("ARRAY[makeaclitem('crm_h0_table_owner'::regrole,'h2_bootstrap'::regrole,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN',false)]")!=before)
 check('grant_option_differs',project("ARRAY[makeaclitem('crm_h0_table_owner'::regrole,'crm_h0_table_owner'::regrole,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN',true)]")!=before)
 check('owner_change_differs',project('NULL::aclitem[]',"'h2_bootstrap'::regrole")!=before)
 check('grantee_change_differs',project("ARRAY[makeaclitem('crm_h0_runtime'::regrole,'crm_h0_table_owner'::regrole,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN',false)]")!=before)
 seq=project('NULL::aclitem[]',kind="'s'");check('sequence_has_three_expected_privileges',{x[2]for x in seq}=={'SELECT','UPDATE','USAGE'})
 check('uppercase_S_not_sequence',project('NULL::aclitem[]',kind="'S'")!=seq)
 # Real source representation and restored relation both map to that same default.
 source=json.loads(Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17/h6015-KbfYWL/core-snapshot-t0.json').read_text())
 old=next(x['acl']for x in source['catalog']['relations']if x['nspname']=='crm_private'and x['relname']=='access_probe');literal="'"+old.replace("'","''")+"'::aclitem[]"
 actual=project("(select relacl from pg_class where oid='crm_private.access_probe'::regclass)");check('actual_historical_restore_relation_equal',actual==project(literal)==before)
 result['state']='PASS_ACL_SEMANTIC_PROJECTION'
except Exception as e:result['state']='FAIL_PRESERVED';result['failures'].append({'class':type(e).__name__})
finally:
 if started:command('pg_ctl',['-D',str(R/'core/data'),'-m','fast','-w','stop'])
 result['resourcesStopped']=not(R/'core/data/postmaster.pid').exists();(O/('acl-result-'+str(time.time_ns())+'.json')).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'state':result['state'],'checks':len(result['checks']),'failures':result['failures']}))
