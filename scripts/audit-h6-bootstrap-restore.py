"""Independent experimental restore; no runtime services, S06 or business effects."""
import datetime, hashlib, importlib.util, json, os, re, subprocess, tempfile, time
from pathlib import Path

os.umask(0o077)
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests/fixtures/h6-bootstrap-independent'
PG=Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
CUSTODY=Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17/h6015-KbfYWL')
module=ROOT/'scripts/h6-bootstrap-audit-reader.py';spec=importlib.util.spec_from_file_location('reader',module);r=importlib.util.module_from_spec(spec);spec.loader.exec_module(r)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
env={'PATH':os.environ['PATH'],'LANG':'C','LC_ALL':'C'}
private=Path(tempfile.mkdtemp(prefix='h6ba-',dir='/tmp'))
report={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateRoot':str(private),'expectedSHA256':sha(OUT/'expected-v1.json'),'scriptSHA256':sha(Path(__file__)),'readerSHA256':sha(module),'scope':'Independent historical synthetic Core/Auth/Storage restore with authorized bootstrap exception only','checks':[],'resources':[],'failures':[],'taskCompleted':False,'S11':'NOT_EXECUTED'}
clusters=[]
def check(name,ok,facts=None):
 report['checks'].append({'name':name,'status':'PASS' if ok else 'FAIL','facts':facts})
 if not ok:raise ValueError(name)
def cmd(name,args):return r.command(name,args)
def psql(c,text=None,file=None,user=None,db=None):
 args=[*r.sql_args(c,user,db)]
 if file:args+=['--single-transaction','--file='+str(file)]
 p=subprocess.run([str(PG/'psql'),*args],input=text.encode()if text else None,capture_output=True,env=env)
 err=p.stderr.decode(errors='replace');m=re.search(r'ERROR:\s+([0-9A-Z]{5}):',err)
 return p.returncode,m.group(1)if m else None,p.stdout
def setup(kind,bootstrap,port):
 d=private/kind;d.mkdir();(d/'s').mkdir();c={'dir':str(d),'data':d/'data','socket':d/'s','port':port,'bootstrap':bootstrap,'database':'postgres'}
 cmd('initdb',['-D',str(c['data']),'-U',bootstrap,'--auth=trust','--locale-provider=libc','--no-locale','--encoding=UTF8'])
 cmd('pg_ctl',['-D',str(c['data']),'-l','/dev/null','-o',f"-k '{c['socket']}' -h '' -p {port}",'-w','start']);clusters.append(c)
 q=r.query(c,"select oid::text,rolname,rolsuper,rolcanlogin from pg_roles where rolname !~ '^pg_' order by 1")
 check(kind+'_initdb_bootstrap_only',q==[{'oid':'10','rolname':bootstrap,'rolsuper':True,'rolcanlogin':True}])
 check(kind+'_socket_only',r.query(c,"select current_setting('listen_addresses') value")==[{'value':''}])
 status,_,_=psql(c,'alter database postgres rename to h6015_maint_audit;',db='template1');check(kind+'_maintenance_reserved',status==0)
 c['database']='h6015_maint_audit';return c
def globals_restore(kind,c):
 original=CUSTODY/(kind+'-globals.sql');raw=original.read_bytes();needle=('CREATE ROLE '+c['bootstrap']+';\n').encode()
 check(kind+'_one_exact_bootstrap_create',raw.count(needle)==1)
 transformed=raw.replace(needle,b'',1);target=private/(kind+'-globals-derived.sql');target.write_bytes(transformed)
 check(kind+'_only_bootstrap_creation_discharged',transformed==raw[:raw.index(needle)]+raw[raw.index(needle)+len(needle):])
 code,_,_=psql(c,file=target);check(kind+'_globals_restore_success',code==0)
 source=json.loads((CUSTODY/(kind+'-snapshot-t0.json')).read_text())['catalog']
 # Earlier historical snapshot omitted expiration. Its globals are authoritative:
 # CREATE ROLE defaults to NULL and no ALTER VALID UNTIL appears in this fixture.
 if any('rolvaliduntil' not in x for x in source['roles']):
  check(kind+'_historic_expiry_from_full_globals',b'VALID UNTIL' not in raw)
  for x in source['roles']:x.setdefault('rolvaliduntil',None)
 cat=r.extra_catalog(c)
 check(kind+'_all_role_attributes_config_exact',cat['roles']==source['roles'],{'roles':len(cat['roles'])})
 check(kind+'_all_memberships_and_grantors_exact',cat['memberships']==source['memberships'],{'memberships':len(cat['memberships'])})
 check(kind+'_bootstrap_oid10_after_import',r.query(c,"select oid::text,rolname from pg_roles where oid=10")==[{'oid':'10','rolname':c['bootstrap']}])
 report.setdefault('globals',[]).append({'resource':kind,'originalSHA256':sha(original),'derivedSHA256':sha(target),'dischargedCreateSHA256':hashlib.sha256(needle).hexdigest(),'removedBytes':len(needle),'allRemainingBytesExact':True})
def restore_core(c):
 archive=CUSTODY/'core.dump';toc=cmd('pg_restore',['--list','--create',str(archive)]).decode();lines=[x for x in toc.splitlines()if x and not x.startswith(';')]
 groups={'database':[],'crypto':[],'content':[]}
 for line in lines:
  if re.match(r'^\d+; \d+ \d+ (?:(?:DATABASE(?: PROPERTIES)?) -|(?:ACL|COMMENT|SECURITY LABEL) - DATABASE) crm_h6015_core ',line):groups['database'].append(line)
  elif re.match(r'^\d+; \d+ \d+ SCHEMA - crm_crypto crm_h0_migration$',line):groups['crypto'].append(line)
  else:groups['content'].append(line)
 check('core_partition_complete_disjoint',len(groups['database'])==2 and len(groups['crypto'])==1 and sorted(sum(groups.values(),[]))==sorted(lines) and len({x.split(';')[0]for x in lines})==len(lines))
 for name,rows in groups.items():(private/(name+'.list')).write_text('\n'.join(rows)+'\n')
 base=r.common_args(c)
 cmd('pg_restore',[*base,'--dbname='+c['database'],'--create','--exit-on-error','--use-list='+str(private/'database.list'),str(archive)])
 c['database']='crm_h6015_core'
 cmd('pg_restore',[*base,'--dbname='+c['database'],'--exit-on-error','--single-transaction','--use-list='+str(private/'crypto.list'),str(archive)])
 code,_,_=psql(c,"BEGIN; SET LOCAL ROLE crm_h0_migration; CREATE EXTENSION pgcrypto WITH SCHEMA crm_crypto VERSION '1.3'; COMMIT;");check('core_pgcrypto_under_original_owner',code==0)
 cmd('pg_restore',[*base,'--dbname='+c['database'],'--exit-on-error','--single-transaction','--use-list='+str(private/'content.list'),str(archive)])
 check('core_archive_full_partition_loaded',True,{'entries':len(lines)})
def restore_full(kind,c,db):
 cmd('pg_restore',[*r.common_args(c),'--dbname=h6015_maint_audit','--create','--exit-on-error',str(CUSTODY/(kind+'.dump'))]);c['database']=db
 check(kind+'_full_archive_loaded',True)
def verify(kind,c):
 source=json.loads((CUSTODY/(kind+'-snapshot-t0.json')).read_text())
 data=r.data_hashes(c);(private/(kind+'-independent-data.json')).write_text(json.dumps(data,indent=2)+'\n')
 check(kind+'_every_table_row_exact_independent',data==source['data'],{'tables':len(data),'rows':sum(x['count']for x in data.values())})
 cat=r.extra_catalog(c);(private/(kind+'-independent-catalog.json')).write_text(json.dumps(cat,indent=2)+'\n')
 globals_kind='storage'if kind=='storage'else'core'
 if any('rolvaliduntil'not in x for x in source['catalog']['roles']):
  check(kind+'_historic_expiry_default_rechecked',b'VALID UNTIL'not in(CUSTODY/(globals_kind+'-globals.sql')).read_bytes())
  for x in source['catalog']['roles']:x.setdefault('rolvaliduntil',None)
 check(kind+'_roles_and_memberships_exact',cat['roles']==source['catalog']['roles'] and cat['memberships']==source['catalog']['memberships'])
 key='H6BootstrapIndependentFixedKey'
 expected=cmd('pg_restore',['--schema-only','--create','--restrict-key='+key,'--file=-',str(CUSTODY/(kind+'.dump'))])
 observed=cmd('pg_dump',[*r.common_args(c),'--dbname='+c['database'],'--schema-only','--create','--no-publications','--no-subscriptions','--restrict-key='+key])
 (private/(kind+'-schema-expected.sql')).write_bytes(expected);(private/(kind+'-schema-observed.sql')).write_bytes(observed)
 check(kind+'_full_schema_sql_byte_exact',expected==observed,{'archiveSHA256':hashlib.sha256(expected).hexdigest(),'restoredSHA256':hashlib.sha256(observed).hexdigest()})
 ext=r.query(c,"select e.extname,e.extversion,n.nspname,pg_get_userbyid(e.extowner) owner from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname<>'plpgsql' order by 1")
 check(kind+'_extension_identity_exact',ext==source['catalog']['extensions'])
 report['resources'].append({'kind':kind,'cluster':c['dir'],'database':c['database'],'socket':str(c['socket']),'port':c['port'],'bootstrap':c['bootstrap']})
try:
 check('custody_preflight_pass',json.loads((OUT/'custody-preflight-v1.json').read_text())['state']=='PASS_INDEPENDENT_PRIOR_CUSTODY')
 core=setup('core','h2_bootstrap',59951);globals_restore('core',core);restore_core(core);verify('core',core)
 restore_full('auth',core,'crm_h6015_auth');verify('auth',core)
 store=setup('storage','postgres',59952);globals_restore('storage',store);restore_full('storage',store,'postgres');verify('storage',store)
 report['state']='PASS_INDEPENDENT_HISTORICAL_RESTORE_ONLY'
except Exception as e:
 report['state']='FAIL_PRESERVED';report['failures'].append({'class':type(e).__name__,'rule':str(e)if re.fullmatch('[a-zA-Z0-9_]+',str(e))else'INSTRUMENT_FAILURE'})
finally:
 for c in reversed(clusters):
  try:cmd('pg_ctl',['-D',str(c['data']),'-m','fast','-w','stop'])
  except Exception:report['failures'].append({'stopFailed':c['dir']})
 report['resourcesStopped']=all(not(c['data']/'postmaster.pid').exists()for c in clusters)
 p=OUT/('restore-'+str(time.time_ns())+'.json');p.write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({'report':str(p),'state':report['state'],'checks':len(report['checks']),'failures':report['failures'],'privateRoot':str(private)}))
