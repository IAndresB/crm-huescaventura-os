"""Real PostgreSQL, Unix sockets only, two fresh isolated clusters.
Only versioned SQL; failing SQL copy is instrumented in memory, original untouched.
Logs, schema dumps and results persist; only owned temporary clusters are stopped.
"""
import pathlib,json,hashlib,tempfile,subprocess,os,re,gzip,time
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-013';BIN=pathlib.Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
manifest=json.loads((OUT/'migrations.json').read_text());seal=json.loads((OUT/'expected-seal.json').read_text())
sha=lambda b:hashlib.sha256(b).hexdigest()
for p,h in seal['sha256'].items():assert sha((ROOT/p).read_bytes())==h
expected=json.loads((OUT/'expected-structure.json').read_text());results=[];serial=0
ENV={k:v for k,v in os.environ.items() if not k.startswith(('PG','DATABASE','SUPABASE'))};ENV['LC_ALL']='C'
def run(args,input=None,label='native'):
 global serial
 serial+=1;prefix=f'{serial:04}-{label}'
 p=subprocess.run([str(x) for x in args],input=input,text=True,capture_output=True,env=ENV)
 for suffix,value in [('stdout',p.stdout),('stderr',p.stderr)]:
  with gzip.open(OUT/(prefix+'.'+suffix+'.log.gz'),'xt') as f:f.write(value)
 (OUT/(prefix+'.status.json')).write_text(json.dumps({'argv':[str(x) for x in args],'exit':p.returncode,'inputSha256':sha(input.encode()) if input else None})+'\n')
 return p
def check(case,ok,detail):
 results.append({'case':case,'pass':bool(ok),'detail':detail});(OUT/'chain-progress.json').write_text(json.dumps(results,indent=2)+'\n')
 if not ok:print('FAIL',case,str(detail)[:300],flush=True)
def sql(user,query,db='chain',success=True):
 p=run([BIN/'psql','-X','-v','ON_ERROR_STOP=1','-qAt','-h',socket,'-p','61413','-U',user,'-d',db],query,'sql')
 if success and p.returncode:raise RuntimeError(p.stderr)
 return p
schema_query="""select jsonb_build_object(
'roles',(select jsonb_agg(jsonb_build_object('name',rolname,'super',rolsuper,'createRole',rolcreaterole,'createDb',rolcreatedb,'bypass',rolbypassrls,'login',rolcanlogin,'inherit',rolinherit) order by rolname) from pg_roles where rolname like 'crm%'),
'classes',(select jsonb_agg(to_jsonb(c) order by c.oid) from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname like 'crm%'),
'columns',(select jsonb_agg(to_jsonb(a) order by a.attrelid,a.attnum) from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on c.relnamespace=n.oid where n.nspname like 'crm%' and a.attnum>0),
'functions',(select jsonb_agg(to_jsonb(p) order by p.oid) from pg_proc p join pg_namespace n on p.pronamespace=n.oid where n.nspname like 'crm%'),
'constraints',(select jsonb_agg(to_jsonb(c) order by c.oid) from pg_constraint c join pg_namespace n on c.connamespace=n.oid where n.nspname like 'crm%'),
'policies',(select jsonb_agg(to_jsonb(p) order by p.oid) from pg_policy p),
'defaults',(select jsonb_agg(to_jsonb(a) order by a.oid) from pg_default_acl a),
'memberships',(select jsonb_agg(to_jsonb(m) order by roleid,member) from pg_auth_members m));"""
def catalog():return sql('bootstrap',schema_query).stdout.strip()
def tables():return sql('bootstrap',"select n.nspname||'.'||c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by 1").stdout.splitlines()
def rows():
 ts=tables()
 if not ts:return {}
 q=' union all '.join(f"select '{t}' name,count(*)::text count,md5(coalesce(string_agg(to_jsonb(x)::text,E'\\n' order by to_jsonb(x)::text),'')) hash from {t} x" for t in ts)
 return {x.split('|')[0]:x.split('|')[1:] for x in sql('bootstrap',q).stdout.splitlines()}
def dump(label):
 p=run([BIN/'pg_dump','--schema-only','--no-comments','-h',socket,'-p','61413','-U','bootstrap','chain'],label='dump');assert p.returncode==0
 # pg_dump17 random \restrict tokens are transport guards, not schema content.
 s='\n'.join(x for x in p.stdout.splitlines() if not x.startswith(('\\restrict','\\unrestrict','-- Dumped','-- Started','-- Completed')))
 with gzip.open(OUT/(label+'.schema.sql.gz'),'xt') as f:f.write(s)
 return s
schemas=[]
for passno,api_early in [(1,True),(2,False)]:
 temp=pathlib.Path(tempfile.mkdtemp(prefix='crm-h6013-chain-'));socket=str(temp/'socket');pathlib.Path(socket).mkdir();started=False
 try:
  assert run([BIN/'initdb','-D',temp/'data','--username=bootstrap','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8'],label='initdb').returncode==0
  assert run([BIN/'pg_ctl','-D',temp/'data','-l',temp/'server.log','-o',f"-k {socket} -h '' -p 61413",'-w','start'],label='start').returncode==0;started=True
  sql('bootstrap',(ROOT/manifest['migrations'][0]['path']).read_text(),'postgres')
  sql('bootstrap','create database chain owner crm_h0_migration','postgres')
  if api_early:sql('bootstrap','create role anon login;create role authenticated login')
  for m in manifest['migrations'][1:]:
   text=(ROOT/m['path']).read_text();assert sha(text.encode())==m['sha256'];n=m['ordinal'];user='bootstrap' if m['authority']=='cluster-bootstrap' else 'crm_h0_migration'
   before=catalog();data=rows()
   if passno==1 and re.search(r'commit;\s*$',text,re.I):
    injected=re.sub(r'commit;\s*$','select 1/0;commit;',text,flags=re.I)
    p=sql(user,injected,success=False)
    check(f'D01-{n}',p.returncode!=0 and 'division by zero' in p.stderr and catalog()==before and rows()==data,{'ordinal':n,'rollback':True,'expectedError':'division by zero','exit':p.returncode})
   p=sql(user,text,success=False)
   check(f'A0{passno}-{n}',p.returncode==0,{'ordinal':n,'path':m['path'],'authority':user,'exit':p.returncode,'stderrTail':p.stderr[-1500:] if p.returncode else None})
   if p.returncode:break
   if n==2:
    # Exact historical predecessor fixture shape from H0-010.
    sql('bootstrap',"insert into crm_private.access_probe(probe_id,admin_scope,public_value,private_value) values ('h6013-probe','scope-h6013','upgrade-preserved','private-synthetic')")
   probe=sql('bootstrap',"select public_value,private_value from crm_private.access_probe where probe_id='h6013-probe'").stdout.strip()
   check(f'B01-{passno}-{n}',probe=='upgrade-preserved|private-synthetic',{'ordinal':n,'fixtureOrigin':2})
   if passno==1:
    after=catalog();d=rows();replay=sql(user,text,success=False)
    check(f'A03-{n}',catalog()==after and rows()==d,{'ordinal':n,'replayExit':replay.returncode,'acceptedIdenticalOrRejected':True})
   print(f'chain{passno} {n}/68',flush=True)
  else:
   if not api_early:sql('bootstrap','create role anon login;create role authenticated login')
   actualTables=tables();actualFunctions=sql('bootstrap',"select distinct n.nspname||'.'||p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' order by 1").stdout.splitlines()
   missingT=sorted(set(expected['tables'])-set(actualTables));missingF=sorted(set(expected['functions'])-set(actualFunctions))
   check(f'A-structure-{passno}',not missingT and not missingF,{'tables':len(actualTables),'functionsByName':len(actualFunctions),'missingTables':missingT,'missingFunctions':missingF})
   role=sql('bootstrap',"select rolname,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole from pg_roles where rolname in ('crm_h0_runtime','crm_h0_ha_tx','crm_h0_migration') order by rolname").stdout
   check(f'C01-{passno}',len(role.splitlines())==3 and all(x.endswith('|f|f|f|f') for x in role.splitlines()),role)
   protected=sql('bootstrap',"select n.nspname||'.'||c.relname,relrowsecurity,relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind='r' order by 1").stdout
   (OUT/f'chain{passno}-rls-inventory.txt').write_text(protected)
   # RLS expectation applies protected private business data. Key/verifier internals have ACL isolation separately.
   bad=[x for x in protected.splitlines() if x.startswith('crm_private.') and not x.endswith('|t|t')]
   check(f'C02-rls-{passno}',not bad,{'withoutBoth':bad})
   attempts=[]
   for roleName in ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']:
    for q in ["set role crm_h0_migration","select * from crm_private.access_probe","update crm_private.access_probe set public_value='tampered'","delete from crm_private.access_probe","select * from crm_private.b07_history","update crm_private.b07_history set reason='tampered'","delete from crm_private.b07_history"]:
     p=sql(roleName,q,success=False);attempts.append({'role':roleName,'sql':q,'exit':p.returncode})
   check(f'C03-{passno}',all(x['exit'] for x in attempts),attempts)
   schemas.append(dump(f'chain{passno}'))
 finally:
  if started:run([BIN/'pg_ctl','-D',temp/'data','-m','fast','-w','stop'],label='stop')
  if (temp/'server.log').exists():
   with gzip.open(OUT/f'chain{passno}-server.log.gz','wb') as f:f.write((temp/'server.log').read_bytes())
  # Cluster is stopped; retain for independent recovery, no unrequested data deletion.
  (OUT/f'chain{passno}-resource.json').write_text(json.dumps({'path':str(temp),'stopped':started,'socketOnly':True,'containsOnlySyntheticData':True})+'\n')
if len(schemas)==2:check('A02-repeatable',schemas[0]==schemas[1],{'schemaSha256':[sha(s.encode()) for s in schemas]})
(OUT/'chain-result.json').write_text(json.dumps({'results':results,'pass':sum(x['pass'] for x in results),'fail':sum(not x['pass'] for x in results),'completeFreshInstalls':len(schemas)},indent=2)+'\n')
raise SystemExit(int(any(not x['pass'] for x in results)))
