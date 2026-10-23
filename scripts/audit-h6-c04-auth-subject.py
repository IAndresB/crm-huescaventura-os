"""Narrow provider logout readback: subject scope, not all Auth users."""
import datetime,hashlib,importlib.util,json,os,pathlib,re,sys,time
sys.dont_write_bytecode=True;os.umask(0o077)
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-c04-independent';sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
s=importlib.util.spec_from_file_location('r',ROOT/'scripts/h6-c04-independent-reader.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
priv=pathlib.Path('/tmp/h6c04-audit-db-sp4dd2vt');rows=json.loads(pathlib.Path('/tmp/h6c04-audit-final-ingy90f8/rows.json').read_text());subjects=[json.loads(x)['values']['auth_subject'] for x in rows['crm_private.crm_actors']['rows']]
report={'createdUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'instrumentSHA256':sha(__file__),'checks':[],'failures':[],'S11':False,'taskCompleted':False};st=[];observed={}
def ck(n,v):
 report['checks'].append({'id':n,'status':'PASS' if v else 'FAIL'})
 if not v:report['failures'].append(n)
try:
 for i,label in enumerate(['base','final']):
  data=priv/label/'data';socket=priv/label/'socket';port=59970+i;c={'socket':socket,'port':port,'bootstrap':'h2_bootstrap','database':'crm_h6015_auth'}
  r.command('pg_ctl',['-D',str(data),'-l','/dev/null','-o',f"-c listen_addresses='' -k {socket} -p {port}",'-w','start']);st.append(data)
  ck(label+'-readonly',r.query(c,"select current_setting('transaction_read_only') x")==[{'x':'on'}])
  observed[label]=r.query(c,'select s.* from auth.sessions s order by id')
  p=priv/(label+'-auth-sessions.json');p.write_text(json.dumps(observed[label],sort_keys=True,separators=(',',':'))+'\n');os.chmod(p,0o600)
  report.setdefault('privateFiles',[]).append({'path':str(p),'sha256':sha(p)})
 target=[x for x in observed['final'] if x['user_id'] in subjects];other=[x for x in observed['final'] if x['user_id'] not in subjects];oldother=[x for x in observed['base'] if x['user_id'] not in subjects]
 ck('provider-sessions-for-revoked-subject-zero',len(target)==0)
 ck('other-synthetic-subject-sessions-identical',other==oldother)
 report['counts']={'baselineTotal':len(observed['base']),'finalTotal':len(observed['final']),'finalRevokedSubject':len(target),'otherSubjectUnchanged':len(other)}
 report['state']='PASS' if not report['failures'] else 'FAIL_PRESERVED'
except Exception as ex:
 report['state']='FAIL_PRESERVED';m=str(ex);report['failures'].append({'class':type(ex).__name__,'rule':m if re.fullmatch('[A-Za-z0-9_.-]+',m) else 'PRIVATE_DETAILS_OMITTED'})
finally:
 for data in reversed(st):r.command('pg_ctl',['-D',str(data),'-m','fast','-w','stop'])
 report['allAuditResourcesStopped']=all(not(x/'postmaster.pid').exists() for x in st);p=OUT/('auth-subject-result-'+str(time.time_ns())+'.json');p.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(p),'sha256':sha(p),'state':report['state'],'checks':len(report['checks']),'failures':report['failures'],'counts':report.get('counts')}))
