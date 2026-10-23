"""Independent read-only acquisition in a new private cold clone; no business calls."""
from pathlib import Path
import datetime,hashlib,importlib.util,json,os,re,shutil,subprocess,sys,tempfile,time
sys.dont_write_bytecode=True;os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-015-acceptance-independent'
EXEC=Path('/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os')
CUST=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-acceptance-focal')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
spec=importlib.util.spec_from_file_location('independent_reader',ROOT/'scripts/h6-c04-independent-reader.py');r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(OUT/'expected-v1.json'),'scriptSHA256':sha(__file__),'checks':[],'failures':[],'S11':False,'N03':False,'taskState':'IN_PROGRESS','readOnly':True}
def ck(name,condition,**detail):
 report['checks'].append({'id':name,'status':'PASS' if condition else 'FAIL',**detail})
 if not condition:raise ValueError(name)
def load(p):return json.loads(Path(p).read_text())
def save(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':'))+'\n')
private=None;started=False;c=None
try:
 inventoryPath=CUST/'private-inventory.json';ck('custody-inventory-identity',sha(inventoryPath)=='d883811a8ec2ed9745585feb452398fddcd303237d2952f6d6b057a20ff9ae55')
 inv=load(inventoryPath);archive=CUST/'h6accept-N9Gbju';selected=[x for x in inv if x['destination'].startswith(str(archive)+'/')]
 total=0
 for item in selected:
  p=Path(item['destination']);st=p.stat();ck('protected-copy-'+str(len(report['checks'])),st.st_uid==os.getuid() and st.st_mode&0o777==0o600 and st.st_size==item['bytes'] and sha(p)==item['sha256']);total+=st.st_size
 ck('custody-tree-private',all(p.stat().st_mode&0o777==0o700 and p.stat().st_uid==os.getuid() for p in [archive,*[x for x in archive.rglob('*') if x.is_dir()]]))
 acl=subprocess.run(['/bin/ls','-leR',str(archive)],capture_output=True,text=True,check=True).stdout;ck('no-allow-acl',not re.search(r'^\s*\d+:.*\ballow\b',acl,re.M))
 ck('cold-source-shut-down',bool(re.search(r'Database cluster state:\s+shut down',r.command('pg_controldata',[str(archive/'data')]).decode())))
 private=Path(tempfile.mkdtemp(prefix='h6015-acceptance-audit-',dir='/tmp'));report['privateRoot']=str(private);shutil.copytree(archive/'data',private/'data');(private/'socket').mkdir(mode=0o700)
 for p in [private,*[x for x in private.rglob('*') if x.is_dir()]]:p.chmod(0o700)
 for p in [x for x in private.rglob('*') if x.is_file()]:p.chmod(0o600)
 files=[x for x in selected if x['destination'].startswith(str(archive/'data')+'/')]
 ck('own-clone-exact',all(sha(private/'data'/Path(x['destination']).relative_to(archive/'data'))==x['sha256'] for x in files),files=len(files))
 c={'socket':private/'socket','port':59840,'bootstrap':'h2_bootstrap','database':'crm_h6015_core'}
 r.command('pg_ctl',['-D',str(private/'data'),'-l','/dev/null','-o',"-k '"+str(c['socket'])+"' -h '' -p 59840",'-w','start']);started=True
 ck('private-socket-only',r.query(c,"select current_setting('listen_addresses') a,current_setting('transaction_read_only') b")==[{'a':'','b':'on'}])
 before=load(archive/'core-clone-received.json');after=load(archive/'core-after-diagnostic.json');tables=r.query(c,"select n.nspname schema,c.relname name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname !~ '^pg_' and n.nspname<>'information_schema' and c.relkind='r' order by 1,2")
 fresh={}
 for t in tables:
  name=t['schema']+'.'+t['name'];fresh[name]=sorted(x['v'] for x in r.query(c,'select to_jsonb(x)::text v from '+r.qident(t['schema'])+'.'+r.qident(t['name'])+' x'))
 ck('table-set-exact',set(fresh)==set(before)==set(after),tables=len(fresh))
 for name in fresh:ck('live-readback-'+name,sorted(after[name])==fresh[name])
 save(private/'independent-final-rows.json',fresh)
 changed=[n for n in before if sorted(before[n])!=sorted(after[n])]
 allowed=['crm_f1.keys','crm_f2.keys','crm_private.crm_actors','crm_private.crm_sessions','crm_private.identification_epochs','crm_private.global_access_revocations','crm_private.global_access_revocation_attempts','crm_private.b10_diagnostic_observations']
 ck('changed-tables-exact',set(changed)==set(allowed),changed=changed,unchanged=len(before)-len(changed))
 def rows(d,n):return [json.loads(x) for x in d[n]]
 for n in changed:
  if n in ['crm_f1.keys','crm_f2.keys','crm_private.crm_actors']:continue
  ck('all-prior-rows-preserved-'+n,set(before[n]).issubset(set(after[n])))
 for n in ['crm_f1.keys','crm_f2.keys']:
  b={x['key_id']:x for x in rows(before,n)};a={x['key_id']:x for x in rows(after,n)};new=set(a)-set(b)
  ck('keys-add-one-'+n,len(new)==1 and len(a)==len(b)+1 and sum(x['enabled'] for x in a.values())==1)
  ck('keys-prior-only-disabled-'+n,all(dict(a[k],enabled=b[k]['enabled'])==b[k] and a[k]['enabled']==False for k in b))
  k=a[next(iter(new))];ck('new-key-distinct-'+n,k['enabled'] and all(k['secret']!=v['secret'] and k['generation']!=v['generation'] for v in b.values()))
 b=rows(before,'crm_private.crm_actors')[0];a=rows(after,'crm_private.crm_actors')[0]
 ck('actor-only-two-revocations',a['access_generation']==b['access_generation']+2 and {k:v for k,v in a.items() if k not in ['updated_at','access_generation']}=={k:v for k,v in b.items() if k not in ['updated_at','access_generation']})
 for n in ['crm_private.crm_sessions','crm_private.identification_epochs','crm_private.global_access_revocations','crm_private.global_access_revocation_attempts']:ck('two-new-security-rows-'+n,len(after[n])==len(before[n])+2)
 ex=load(EXEC/'tests/fixtures/h6-015-acceptance/runs/2026-10-22T20-48-23.484Z/report.json');diag=rows(after,'crm_private.b10_diagnostic_observations');ck('exact-nine-new-diagnostics',len(diag)==len(before['crm_private.b10_diagnostic_observations'])+9)
 observed={x['observation_id']:x for x in diag};pair={'E1':('unchanged','correct-or-review'),'E2':('conflicting','reevaluate-current-state'),'E3':('pending','supply-required-evidence'),'E4':('uncertain','reconcile-before-retry'),'E5':('unchanged','retry-only-if-safe'),'E6':('pending','restore-dependency'),'E7':('pending','resolve-ambiguity'),'E8':('conflicting','review-discrepancy')}
 for o in ex['observations']:
  d=observed[o['id']];ck('diagnostic-references-'+o['code']+'-'+o['id'],d['request_ref']==o['requestRef'] and d['operation_id']==o['operationId'] and d['execution_id']==o['executionId'] and o['executionId'] in {x['execution_id'] for x in rows(after,'crm_private.b08_executions')})
  ck('diagnostic-issue-'+o['id'],[i['code'] for i in d['issues']]==[o['code']] and (o['knownState'],o['nextStep'])==pair[o['code']] and d['outcome']==('pending' if o['code'] in ['E4','E6','E7','E8'] else 'rejected'))
 ck('diags-no-extra-or-canary',all(set(x)=={'issues','outcome','actor_id','event_id','context_id','admin_scope','recorded_at','request_ref','context_kind','execution_id','operation_id','observation_id'} and 'SYNTHETIC_CANARY' not in json.dumps(x) for x in diag))
 ck('quarantine-four-paused',len(rows(after,'crm_private.b08_executions'))==4 and all(x['control_state']=='paused' for x in rows(after,'crm_private.b08_executions')))
 config=load(archive/'source-configuration.json');subject=config['user']['id']
 q=r.query(c,"select count(*)::int n from crm_private.crm_sessions s join crm_private.crm_actors a using(actor_id) join crm_private.identification_epochs e using(session_id) where s.auth_subject='"+subject+"'::uuid and s.access_generation=a.access_generation and s.revoked_at is null and e.closed_at is null and e.current_epoch and e.access_state='active'")
 ck('final-no-effective-core-session',q==[{'n':0}])
 authc=dict(c,database='crm_h6015_auth');ck('subject-auth-sessions-revoked',r.query(authc,"select count(*)::int n from auth.sessions where user_id='"+subject+"'::uuid")==[{'n':0}])
 schema=r.command('pg_dump',[*r.common_args(c),'--dbname='+c['database'],'--schema-only']);normalize=lambda b:'\n'.join(x for x in b.decode().split('\n') if not re.match(r'^\\(?:un)?restrict ',x))
 ck('schema-acl-exact-before-after',normalize(schema)==normalize((archive/'schema-before.sql').read_bytes()));(private/'independent-final-schema.sql').write_bytes(schema)
 oldGlobals=load('/tmp/h6c04-audit-final-ingy90f8/globals.json')
 globals_={'bootstrap':r.query(c,'select oid::text,rolname from pg_roles where oid=10'),'roles':r.query(c,'select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,rolconfig from pg_roles order by 1'),'memberships':r.query(c,'select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3'),'parameterACL':r.query(c,'select parname,paracl::text from pg_parameter_acl order by 1'),'settings':r.query(c,"select coalesce(d.datname,'*') database,coalesce(ro.rolname,'*') role,x.setconfig from pg_db_role_setting x left join pg_database d on d.oid=x.setdatabase left join pg_roles ro on ro.oid=x.setrole order by 1,2")}
 ck('roles-grantors-options-settings-exact',globals_==oldGlobals);save(private/'independent-final-globals.json',globals_)
 report['custodyVerified']={'files':len(selected),'bytes':total,'inventorySHA256':sha(inventoryPath)};report['snapshots']={n:sha(archive/n) for n in ['core-clone-received.json','core-after-diagnostic.json','schema-before.sql']};report['state']='PASS'
except Exception as e:
 report['state']='FAIL_PRESERVED';report['failures'].append({'class':type(e).__name__,'rule':str(e) if re.fullmatch('[A-Za-z0-9_.-]+',str(e)) else 'PRIVATE_DETAILS_OMITTED'})
finally:
 if started:r.command('pg_ctl',['-D',str(private/'data'),'-m','fast','-w','stop']);report['ownCloneStopped']=True
 if private:
  for p in private.rglob('*'):
   if p.is_file():p.chmod(0o600)
  report['privateCaptureHashes']={p.name:sha(p) for p in private.glob('independent-*')}
 dest=OUT/('focal-readback-'+str(time.time_ns())+'.json');dest.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'report':str(dest),'sha256':sha(dest),'state':report['state'],'checks':len(report['checks']),'failures':report['failures'],'privateRoot':str(private)}))
if report['failures']:raise SystemExit(1)
