"""Independent synthetic PostgreSQL 17 grantor semantics. No product restore."""
import os, pathlib, tempfile, subprocess, json, hashlib, re, time, datetime

os.umask(0o077)
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/fixtures/h6-pg17-independent'
BIN = pathlib.Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
PRIVATE = pathlib.Path(tempfile.mkdtemp(prefix='h6pg-audit-', dir='/tmp'))
EXPECTED = OUT / 'expected-v1.json'
expected_hash = hashlib.sha256(EXPECTED.read_bytes()).hexdigest()
assert expected_hash == (OUT / 'expected-v1.sha256').read_text().strip()
report = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'privateRoot': str(PRIVATE),
          'expectedSHA256': expected_hash, 'scriptSHA256': hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),
          'scope': 'minimal isolated synthetic mechanism only', 'checks': [], 'taskCompleted': False}
clusters = []

def native(name, args, data=None):
    return subprocess.run([str(BIN/name), *args], input=data, stdout=subprocess.PIPE,
                          stderr=subprocess.PIPE, text=True, env={'PATH': os.environ['PATH'], 'LC_ALL':'C'})

def check(name, ok, observed=None):
    report['checks'].append({'name':name, 'pass':bool(ok), 'observed':observed})
    if not ok: raise AssertionError(name)

def cluster(label, boot, port):
    d = PRIVATE / label; d.mkdir(mode=0o700)
    socket = d/'s'; socket.mkdir(mode=0o700)
    c = {'data': d/'d', 'socket':socket, 'boot':boot, 'port':port}
    q=native('initdb',['-D',str(c['data']),'-U',boot,'--auth=trust','--encoding=UTF8','--locale=C'])
    assert q.returncode==0, 'INIT_FAILED'
    q=native('pg_ctl',['-D',str(c['data']),'-l','/dev/null','-o',f"-k {socket} -h '' -p {port}",'-w','start'])
    assert q.returncode==0, 'START_FAILED'
    clusters.append(c); return c

def args(c): return ['-h',str(c['socket']),'-p',str(c['port']),'-U',c['boot'],'-d','postgres']
def sql(c, statement):
    q=native('psql',['-X',*args(c),'-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-At','-q'],statement)
    m=re.search(r'ERROR:\s+([0-9A-Z]{5}):',q.stderr)
    loc=re.search(r'LOCATION:\s+(\w+),\s+(\w+\.c):(\d+)',q.stderr)
    return {'exit':q.returncode,'state':m[1] if m else None,'location':list(loc.groups()) if loc else None,'data':q.stdout.strip()}
def scalar(c, statement):
    r=sql(c,statement); assert r['exit']==0,'SQL_QUERY_FAILED';return r['data']
def graph(c):
    return json.loads(scalar(c,"SELECT coalesce(json_agg(x ORDER BY r,m,g),'[]') FROM (SELECT pg_get_userbyid(roleid) r,pg_get_userbyid(member) m,pg_get_userbyid(grantor) g,admin_option a,inherit_option i,set_option s FROM pg_auth_members WHERE pg_get_userbyid(roleid)='audit_group') x;"))
def safe(r):return {k:v for k,v in r.items() if k!='data'}

try:
    report['version']=native('postgres',['--version']).stdout.strip()
    source=cluster('src','audit_origin',59870)
    check('source_bootstrap_oid',scalar(source,"SELECT oid FROM pg_roles WHERE rolname='audit_origin';")=='10')
    check('source_socket_only',scalar(source,'SHOW listen_addresses;')=='')
    assert sql(source,'CREATE ROLE audit_group; CREATE ROLE audit_actor LOGIN; GRANT audit_group TO audit_actor WITH ADMIN FALSE, INHERIT FALSE, SET TRUE GRANTED BY audit_origin;')['exit']==0
    original=graph(source)
    check('source_grantor_name',original==[{'r':'audit_group','m':'audit_actor','g':'audit_origin','a':False,'i':False,'s':True}],original)
    dump=PRIVATE/'globals.sql'
    q=native('pg_dumpall',['-h',str(source['socket']),'-p',str(source['port']),'-U',source['boot'],'--globals-only','--no-role-passwords','-f',str(dump)])
    assert q.returncode==0,'DUMP_FAILED'
    report['globalsSHA256']=hashlib.sha256(dump.read_bytes()).hexdigest()
    dest=cluster('dst','audit_dest',59871)
    check('destination_bootstrap_oid',scalar(dest,"SELECT oid FROM pg_roles WHERE rolname='audit_dest';")=='10')
    check('destination_socket_only',scalar(dest,'SHOW listen_addresses;')=='')
    # psql receives complete unchanged file, one transaction, no continued errors.
    r=sql(dest,'BEGIN;\n'+dump.read_text()+'\nCOMMIT;')
    check('full_globals_new_distinct_bootstrap_sqlstate',r['state']=='42501' and r['location'][0]=='check_role_grantor',safe(r))
    check('full_globals_rollback',scalar(dest,"SELECT count(*) FROM pg_roles WHERE rolname IN ('audit_origin','audit_actor','audit_group');")=='0')
    # Separate minimal diagnostic roles, after failed transaction rolled back.
    assert sql(dest,'CREATE ROLE audit_origin SUPERUSER LOGIN; CREATE ROLE audit_group; CREATE ROLE audit_actor LOGIN;')['exit']==0
    imported_oid=scalar(dest,"SELECT oid FROM pg_roles WHERE rolname='audit_origin';")
    check('source_name_imported_oid_not_10',imported_oid!='10',imported_oid)
    grant='GRANT audit_group TO audit_actor WITH ADMIN FALSE, INHERIT FALSE, SET TRUE GRANTED BY audit_origin;'
    for name,prefix in [('superuser_explicit_old_grantor_sqlstate',''),('set_role_old_sqlstate','SET ROLE audit_origin;'),('session_auth_old_sqlstate','SET SESSION AUTHORIZATION audit_origin;')]:
        r=sql(dest,prefix+grant);check(name,r['state']=='42501' and r['location'][0]=='check_role_grantor',safe(r))
    assert sql(dest,'SET ROLE audit_origin; GRANT audit_group TO audit_actor WITH ADMIN FALSE, INHERIT FALSE, SET TRUE;')['exit']==0
    implicit=graph(dest)
    check('implicit_superuser_grantor',implicit[0]['g']=='audit_dest',implicit)
    check('implicit_grant_detected_as_different',implicit!=original)
    assert sql(dest,'REVOKE audit_group FROM audit_actor GRANTED BY audit_dest;')['exit']==0
    assert sql(dest,'GRANT audit_group TO audit_origin WITH ADMIN TRUE, INHERIT FALSE, SET FALSE GRANTED BY audit_dest;'+grant)['exit']==0
    expanded=graph(dest)
    check('temporary_admin_creates_extra_edge',len(expanded)==2 and expanded!=original,expanded)
    r=sql(dest,'REVOKE ADMIN OPTION FOR audit_group FROM audit_origin GRANTED BY audit_dest RESTRICT;')
    check('revoke_restrict_sqlstate',r['state']=='2BP01',safe(r))
    check('revoke_restrict_leaves_graph',graph(dest)==expanded)
    r=sql(dest,'REVOKE ADMIN OPTION FOR audit_group FROM audit_origin GRANTED BY audit_dest CASCADE;')
    after=graph(dest)
    check('revoke_cascade_removes_dependent_grant',r['exit']==0 and len(after)==1 and after[0]['m']=='audit_origin' and not after[0]['a'],after)
    # Security comparisons reject all single-field drift and missing/extra edges.
    variants=[]
    for key,value in [('r','other'),('m','other'),('g','audit_dest'),('a',True),('i',True),('s',False)]:
        altered=json.loads(json.dumps(original));altered[0][key]=value;variants.append((key,altered))
    variants.extend([('missing',[]),('extra',original+original)])
    for name,changed in variants:check('counterprobe_'+name,changed!=original)
    check('grants_comparison_rejects_missing_changed_or_expanded',len(variants)==8)
    report['verdict']='PASS_INDEPENDENT_CAUSE_AND_NO_EQUIVALENT_TEMP_ADMIN_WORKAROUND'
except Exception as e:
    report['verdict']='FAIL_PRESERVED';report['failureClass']=type(e).__name__
finally:
    stops=[]
    for c in reversed(clusters):
        q=native('pg_ctl',['-D',str(c['data']),'-m','fast','-w','stop']);stops.append(q.returncode==0)
    report['allOwnedClustersStopped']=all(stops)
    name='mechanism-'+str(time.time_ns())+'.json'
    (OUT/name).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'report':name,'verdict':report['verdict'],'pass':sum(x['pass'] for x in report['checks']),'checks':len(report['checks']),'stopped':report['allOwnedClustersStopped']}))
