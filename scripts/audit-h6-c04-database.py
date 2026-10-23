"""Independent cold-copy SQL audit. Only aggregates leave private custody."""
import collections, datetime, hashlib, importlib.util, json, os, pathlib, re, shutil, subprocess, sys, tempfile, time
sys.dont_write_bytecode=True
os.umask(0o077)
ROOT=pathlib.Path(__file__).resolve().parents[1]; OUT=ROOT/'tests/fixtures/h6-c04-independent'
def module(name,path):
 s=importlib.util.spec_from_file_location(name,path);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
r=module('reader',ROOT/'scripts/h6-c04-independent-reader.py'); e=module('effective',ROOT/'scripts/h6-c04-independent-effective.py');e.r=r
sha=lambda p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
private=pathlib.Path(tempfile.mkdtemp(prefix='h6c04-audit-db-',dir='/tmp'))
report={'createdUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateRoot':str(private),'checks':[],'failures':[],'captures':{},'S11':False,'taskCompleted':False,'instrumentSHA256':sha(__file__),'policySHA256':sha(OUT/'data-policy-v1.json')}
started=[]; original=[];captures={};clusters={}
def check(name,ok,details=None):
 v={'id':name,'status':'PASS' if ok else 'FAIL'}
 if details is not None:v['details']=details
 report['checks'].append(v)
 if not ok:report['failures'].append(name)
 return ok
def require(name,ok):
 if not check(name,ok):raise ValueError(name)
def writepriv(name,value):
 p=private/name;p.write_text(json.dumps(value,sort_keys=True,separators=(',',':'))+'\n');os.chmod(p,0o600);return p
sources={
 'base':('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-bootstrap-variant','h6boot-0o5cEb/core-restored-6hcvKp/data','8fc4c53cbb8e8340865a7f0643eac6476c4b6fd5c02f391055c196c015f269e3'),
 'final':('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-c04-integration-r2','h6c04-mGM2NY/data','0d4ea99915d1a20edfe57670dfe250d0be3440dfc047cf975e054ac5cd82ec04')}
try:
 for i,(label,(root,relative,want)) in enumerate(sources.items()):
  root=pathlib.Path(root);source=root/relative;inv=root/'private-inventory.json'
  require(label+'-inventory-hash',sha(inv)==want)
  selected=[x for x in json.loads(inv.read_text()) if x['destination'].startswith(str(source)+'/')]
  require(label+'-nonempty-source-inventory',len(selected)>1000)
  bad=[]
  for x in selected:
   p=pathlib.Path(x['destination']);original.append(x)
   if p.is_symlink() or p.stat().st_size!=x['bytes'] or sha(p)!=x['sha256'] or p.stat().st_mode&0o777!=0o600:bad.append(p.name)
  require(label+'-source-files-hash-and-modes',not bad)
  require(label+'-stopped-original',not(source/'postmaster.pid').exists() and b'Database cluster state:               shut down' in r.command('pg_controldata',[str(source)]))
  dest=private/label/'data';dest.parent.mkdir(mode=0o700);shutil.copytree(source,dest)
  require(label+'-cold-copy-byte-exact',all(sha(dest/pathlib.Path(x['destination']).relative_to(source))==x['sha256'] for x in selected))
  socket=private/label/'socket';socket.mkdir(mode=0o700);port=59970+i
  c={'socket':socket,'port':port,'bootstrap':'h2_bootstrap','database':'crm_h6015_core'};clusters[label]=c
  r.command('pg_ctl',['-D',str(dest),'-l','/dev/null','-o',f"-c listen_addresses='' -k {socket} -p {port}",'-w','start']);started.append(dest)
  result=subprocess.run([sys.executable,str(ROOT/'scripts/audit-h6-c04-capture.py'),'--socket',str(socket),'--port',str(port),'--user','h2_bootstrap','--database',c['database'],'--label',label],capture_output=True)
  require(label+'-capture-process',result.returncode==0)
  capture=json.loads(result.stdout);captures[label]=pathlib.Path(capture['privateRoot']);report['captures'][label]=capture
  privileges=e.effective(c);p=writepriv(label+'-effective.json',privileges)
  report.setdefault('effective',{})[label]={'sha256':sha(p),'cells':sum(map(len,privileges.values()))}
  writepriv(label+'-catalog-extra.json',{'raw':r.raw_identity(c),'extra':r.extra_catalog(c)})
 require('globals-role-grantor-options-exact',sha(captures['base']/'globals.json')==sha(captures['final']/'globals.json'))
 check('schema-fixed-key-byte-exact',sha(captures['base']/'schema.sql')==sha(captures['final']/'schema.sql'))
 check('catalog-extra-exact',sha(private/'base-catalog-extra.json')==sha(private/'final-catalog-extra.json'))
 check('effective-privileges-exact',sha(private/'base-effective.json')==sha(private/'final-effective.json'))
 a=json.loads((captures['base']/'rows.json').read_text());b=json.loads((captures['final']/'rows.json').read_text());policy=json.loads((OUT/'data-policy-v1.json').read_text())
 require('all-table-identities-exact',a.keys()==b.keys())
 changes=[];new={}
 for table in a:
  aa=a[table];bb=b[table]
  check('types-'+table,aa['columns']==bb['columns'] and aa['types']==bb['types'])
  if aa['rows']!=bb['rows']:changes.append(table)
  if table in policy['baseToFinalAppendOnly']:
   ca=collections.Counter(aa['rows']);cb=collections.Counter(bb['rows']);check('prior-immutable-'+table,not(ca-cb))
   new[table]=[json.loads(row)['values'] for row in (cb-ca).elements()]
  elif table not in policy['baseToFinalMutable']:check('exact-rows-'+table,aa['rows']==bb['rows'])
 report['tables']=len(a);report['changedTables']=changes
 def values(table,side=b):return [json.loads(row)['values'] for row in side[table]['rows']]
 for table in ['crm_f1.keys','crm_f2.keys']:
  old=values(table,a);now=values(table);key='key_id'
  oldmap={x[key]:x for x in old};newmap={x[key]:x for x in now}
  check(table+'-original-only-disabled',all(k in newmap and {**v,'enabled':False}==newmap[k] for k,v in oldmap.items()))
  added=[v for k,v in newmap.items() if k not in oldmap]
  check(table+'-one-fresh-enabled-key',len(added)==1 and added[0]['enabled'] is True)
  report.setdefault('keyCounts',{})[table]={'old':len(old),'final':len(now)}
 old=values('crm_private.crm_actors',a);now=values('crm_private.crm_actors');by={x['actor_id']:x for x in now}
 check('actor-identities-exact',len(old)==len(now) and all(x['actor_id'] in by for x in old))
 rev=new['crm_private.global_access_revocations'];actorchanges=[]
 for x in old:
  y=by[x['actor_id']];allowed=policy['baseToFinalMutable']['crm_private.crm_actors']
  check('actor-fields-'+hashlib.sha256(x['actor_id'].encode()).hexdigest()[:10],all(x[k]==y[k] for k in x if k not in allowed))
  n=sum(v['actor_id']==x['actor_id'] for v in rev)
  check('actor-generation-'+hashlib.sha256(x['actor_id'].encode()).hexdigest()[:10],y['access_generation']-x['access_generation']==n)
  if x!=y:actorchanges.append(x['actor_id'])
 report['newRows']={k:len(v) for k,v in new.items()};report['changedActors']=len(actorchanges)
 for t in ['b07_records','b07_links','b07_operations','b07_history']:check('seven-'+t,len(new['crm_private.'+t])==7)
 report['privateAuditRows']=str(writepriv('new-rows.json',new))
 c=clusters['final'];auth={**c,'database':'crm_h6015_auth'}
 effective=r.query(c,"select count(*)::int n from crm_private.crm_sessions s join crm_private.crm_actors a on a.actor_id=s.actor_id where s.access_generation=a.access_generation and s.closed_at is null")
 check('final-effective-Core-sessions-zero',effective==[{'n':0}])
 authrows=r.query(auth,'select count(*)::int n from auth.sessions')
 check('final-Auth-provider-sessions-zero',authrows==[{'n':0}])
 report['state']='PASS' if not report['failures'] else 'FAIL_PRESERVED'
except Exception as error:
 report['state']='FAIL_PRESERVED';msg=str(error);report['failures'].append({'class':type(error).__name__,'rule':msg if re.fullmatch('[A-Za-z0-9_.-]+',msg) else 'PRIVATE_DETAILS_OMITTED'})
finally:
 stops=[]
 for dest in reversed(started):
  try:r.command('pg_ctl',['-D',str(dest),'-m','fast','-w','stop']);stops.append(True)
  except Exception:stops.append(False)
 report['allAuditResourcesStopped']=all(stops) and len(stops)==len(started)
 report['originalFilesStillExact']=all(sha(x['destination'])==x['sha256'] for x in original)
 report['finishedUTC']=datetime.datetime.now(datetime.timezone.utc).isoformat()
 result=OUT/('database-result-'+str(time.time_ns())+'.json');result.write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps({'report':str(result),'sha256':sha(result),'state':report['state'],'checks':len(report['checks']),'failures':report['failures'],'privateRoot':str(private),'stopped':report['allAuditResourcesStopped']}))
