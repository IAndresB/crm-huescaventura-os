#!/usr/bin/env python3
"""Independent acquisition on the auditor's own synthetic Auth trial only.

No Core/Storage restore, product migrations, provider edits or reentry. All row
values, configs and tokens stay in private memory/files. Public output has only
rule IDs, status/counts and digests. Invoke under the recorded network sandbox.
"""
import base64
from collections import Counter
import copy
from decimal import Decimal
import hashlib
import hmac
import importlib.util
import json
import os
from pathlib import Path
import re
import socket
import struct
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

os.umask(0o077)
ROOT = Path(__file__).resolve().parent.parent
PG = Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
TRIAL = ROOT / 'tests/fixtures/h6-015-execution/auth-runs/2026-10-22T11-56-40-867Z/report.json'
OUT = ROOT / 'tests/fixtures/h6-015-independent-preparation/auth-independent-runtime-r6.json'
assert not OUT.exists()
report = {'state': 'RUNNING', 'scope': 'Auth only; no Core/Storage restore or S11',
          'checks': [], 'failures': [], 'explicitReentry': False, 'taskCompleted': False}
phase = 'preflight'
sha = lambda b: hashlib.sha256(b).hexdigest()
module = ROOT / 'scripts/verify-h6-015-catalog-identity.py'
spec = importlib.util.spec_from_file_location('identity', module)
identity = importlib.util.module_from_spec(spec); spec.loader.exec_module(identity)

def need(ok, rule):
    if not ok:
        raise ValueError(rule)

def check(rule, **facts):
    report['checks'].append({'id': rule, 'status': 'PASS', 'facts': facts})

def command(name, args, env=None):
    result = subprocess.run([str(PG / name), *args], stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, env=env or {'PATH': os.environ['PATH'], 'LANG': 'C', 'LC_ALL': 'C'})
    if result.returncode:
        raise ValueError('NATIVE_' + name.upper() + '_FAILED')
    return result.stdout

def sql_args(cluster, user=None, db='crm_h6015_auth'):
    return ['-X', '--no-password', '--host=' + str(cluster['socket']), '--port=' + str(cluster['port']),
            '--username=' + (user or cluster['bootstrap']), '--dbname=' + db, '--set=ON_ERROR_STOP=1', '--tuples-only', '--no-align']

def query(cluster, sql):
    env = {'PATH': os.environ['PATH'], 'LANG': 'C', 'LC_ALL': 'C',
           'PGOPTIONS': '-c default_transaction_read_only=on -c search_path=pg_catalog'}
    body = 'select coalesce(jsonb_agg(to_jsonb(a)),\'[]\'::jsonb)::text from (' + sql + ') a'
    return json.loads(command('psql', [*sql_args(cluster), '--command=' + body], env))

def save_private(name, value):
    path = private / name
    with path.open('x') as file:
        json.dump(value, file, sort_keys=True, indent=2); file.write('\n')
    return {'name': name, 'sha256': sha(path.read_bytes()), 'bytes': path.stat().st_size}

def qident(text):
    return '"' + text.replace('"', '""') + '"'

NS = "n.nspname !~ '^pg_' and n.nspname<>'information_schema'"

def raw_identity(cluster):
    columns = query(cluster, f'''select n.nspname schema,c.relname relation,a.attnum,a.attisdropped,a.attname name,
        format_type(a.atttypid,a.atttypmod) type,a.attnotnull "notnull",a.attidentity identity,a.attgenerated generated,
        pg_get_expr(d.adbin,d.adrelid) "default",case when co.oid is not null then cn.nspname||'.'||co.collname end collation,a.attacl::text acl
        from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace
        left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
        left join pg_collation co on co.oid=a.attcollation left join pg_namespace cn on cn.oid=co.collnamespace
        where {NS} and a.attnum>0 and not a.attisdropped order by 1,2,3''')
    triggers = query(cluster, f'''select n.nspname schema,c.relname relation,t.oid::text oid,t.tgname name,
        t.tgisinternal internal,con.contype constraint_type,con.conrelid::regclass::text constraint_relation,
        con.conname constraint_name,t.tgfoid::regprocedure::text function,t.tgtype type,t.tgenabled enabled,
        t.tgdeferrable deferrable,t.tginitdeferred initially_deferred,encode(t.tgargs,'hex') arguments,
        array(select a.attname from unnest(t.tgattr::smallint[]) with ordinality z(num,ord)
        join pg_attribute a on a.attrelid=t.tgrelid and a.attnum=z.num order by z.ord) update_columns,
        pg_get_triggerdef(t.oid) definition from pg_trigger t join pg_class c on c.oid=t.tgrelid
        join pg_namespace n on n.oid=c.relnamespace left join pg_constraint con on con.oid=t.tgconstraint
        where {NS} order by 1,2,3''')
    return {'columns': columns, 'triggers': triggers}

def extra_catalog(cluster):
    return {
        'types': query(cluster, f'''select n.nspname,t.typname,t.typtype,pg_get_userbyid(t.typowner) owner,t.typacl::text acl,
          t.typcategory,t.typnotnull,t.typdefault,t.typbasetype::regtype::text basetype,t.typtypmod,
          t.typelem::regtype::text element,t.typrelid::regclass::text relation from pg_type t join pg_namespace n on n.oid=t.typnamespace
          where {NS} order by 1,2'''),
        'enums': query(cluster, f'''select n.nspname,t.typname,row_number() over(partition by t.oid order by e.enumsortorder)::int ordinal,e.enumlabel
          from pg_type t join pg_namespace n on n.oid=t.typnamespace join pg_enum e on e.enumtypid=t.oid where {NS} order by 1,2,3'''),
        'sequences': query(cluster, f'''select n.nspname,c.relname,format_type(s.seqtypid,null) type,s.seqstart::text,s.seqincrement::text,
          s.seqmax::text,s.seqmin::text,s.seqcache::text,s.seqcycle from pg_sequence s join pg_class c on c.oid=s.seqrelid
          join pg_namespace n on n.oid=c.relnamespace where {NS} order by 1,2'''),
        'views': query(cluster, f'''select n.nspname,c.relname,pg_get_viewdef(c.oid) definition from pg_class c
          join pg_namespace n on n.oid=c.relnamespace where {NS} and c.relkind in('v','m') order by 1,2'''),
        'rules': query(cluster, f'''select n.nspname,c.relname,r.rulename,pg_get_ruledef(r.oid) definition from pg_rewrite r
          join pg_class c on c.oid=r.ev_class join pg_namespace n on n.oid=c.relnamespace where {NS} order by 1,2,3'''),
        'roles': query(cluster, "select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,rolconfig from pg_roles where rolname !~ '^pg_' order by 1"),
        'memberships': query(cluster, "select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members where pg_get_userbyid(member)!~'^pg_' order by 1,2,3"),
        'unsupported': query(cluster, "select (select count(*) from pg_publication)::int publications,(select count(*) from pg_subscription)::int subscriptions,(select count(*) from pg_event_trigger)::int event_triggers,(select count(*) from pg_foreign_table)::int foreign_tables")
    }

def jsdump(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))

def tagged(value):
    if value is None: return ['null']
    if isinstance(value, bool): return ['boolean', value]
    if isinstance(value, Decimal):
        sign, digits, exponent = value.as_tuple(); digits = list(digits)
        while digits and digits[0] == 0: digits.pop(0)
        if not digits: return ['number', '0e0']
        while digits[-1] == 0: digits.pop(); exponent += 1
        return ['number', ('-' if sign else '') + ''.join(map(str, digits)) + 'e' + str(exponent)]
    if isinstance(value, str): return ['string', value]
    if isinstance(value, list): return ['array', list(map(tagged, value))]
    need(isinstance(value, dict), 'EXACT_JSON_TYPE')
    return ['object', [[key, tagged(value[key])] for key in sorted(value)]]

def data_hashes(cluster):
    tables = query(cluster, f'''select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns,
       array_agg(format_type(a.atttypid,a.atttypmod) order by a.attnum) types from pg_class c join pg_namespace n on n.oid=c.relnamespace
       join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where {NS} and c.relkind='r' group by 1,2 order by 1,2''')
    result = {}
    for table in tables:
        names = table['columns']; relation = qident(table['schema']) + '.' + qident(table['name'])
        sql = "select jsonb_build_object('values',to_jsonb(x),'sqlNulls',jsonb_build_array(" + ','.join('x.' + qident(c) + ' is null' for c in names) + '))::text value from (select ' + ','.join(map(qident, names)) + ' from ' + relation + ') x'
        # Outer JSON retains each row as text; all inner JSON numeric tokens are
        # parsed as Decimal before independent typed canonical serialization.
        rows = [jsdump(tagged(json.loads(row['value'], parse_int=Decimal, parse_float=Decimal))) for row in query(cluster, sql)]
        rows.sort(key=lambda s: s.encode('utf-16be', errors='surrogatepass'))
        digest = sha(jsdump({'columnTypes': table['types'], 'rows': rows}).encode())
        result[table['schema'] + '.' + table['name']] = {'columns': names, 'columnTypes': table['types'], 'count': len(rows), 'sha256': digest}
    return result

def schema_sql(cluster):
    return command('pg_dump', [*common_args(cluster), '--dbname=crm_h6015_auth', '--schema-only', '--create',
                              '--no-publications', '--no-subscriptions', '--restrict-key=H6015IndependentFixedKey'])

def common_args(cluster):
    return ['--host=' + str(cluster['socket']), '--port=' + str(cluster['port']), '--username=' + cluster['bootstrap'], '--no-password']

def start(cluster):
    command('pg_ctl', ['-D', str(cluster['data']), '-l', str(private / (cluster['bootstrap'] + '.log')), '-o',
                      "-k '" + str(cluster['socket']) + "' -h '' -p " + str(cluster['port']), '-w', 'start'])
    started.append(cluster)

def http(path, body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token: headers['Authorization'] = 'Bearer ' + token
    request = urllib.request.Request(endpoint + path, data=None if body is None else json.dumps(body).encode(), headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=5) as response:
            status, raw = response.status, response.read()
    except urllib.error.HTTPError as error:
        status, raw = error.code, error.read()
    # Network, parser and 5xx failures never count as an Auth denial.
    return status, json.loads(raw) if raw else {}

def jwt_valid(token):
    a, b, c = token.split('.')
    signature = hmac.new(secret.encode(), (a + '.' + b).encode(), hashlib.sha256).digest()
    need(hmac.compare_digest(signature, base64.urlsafe_b64decode(c + '=' * (-len(c) % 4))), 'JWT_SIGNATURE')
    claims = json.loads(base64.urlsafe_b64decode(b + '=' * (-len(b) % 4)))
    need(claims['exp'] > time.time() and claims['iss'] == config['env']['GOTRUE_JWT_ISSUER'], 'JWT_LIVE_CLAIMS')
    return claims

def otp():
    seed = config['user']['secret']; key = base64.b32decode(seed + '=' * (-len(seed) % 8))
    digest = hmac.new(key, struct.pack('>Q', int(time.time()) // 30), hashlib.sha1).digest()
    offset = digest[-1] & 15
    return str((int.from_bytes(digest[offset:offset + 4], 'big') & 0x7fffffff) % 1000000).zfill(6)

def login():
    code, first = http('/token?grant_type=password', {'email': config['user']['email'], 'password': config['user']['password']})
    need(code == 200, 'PASSWORD_POSITIVE')
    initial = jwt_valid(first['access_token'])
    need(initial['aal'] == 'aal1', 'PASSWORD_ONLY_AAL1')
    code, user = http('/user', token=first['access_token']); need(code == 200, 'USER_PASSWORD_POSITIVE')
    factor = next(x['id'] for x in user['factors'] if x['factor_type'] == 'totp' and x['status'] == 'verified')
    code, challenge = http('/factors/' + factor + '/challenge', {}, first['access_token']); need(code == 200, 'TOTP_CHALLENGE')
    code, second = http('/factors/' + factor + '/verify', {'challenge_id': challenge['id'], 'code': otp()}, first['access_token'])
    need(code == 200, 'TOTP_VERIFY')
    final = jwt_valid(second['access_token'])
    need(final['aal'] == 'aal2' and final['session_id'] == initial['session_id'] and final['sub'] == config['user']['id'], 'TOTP_IDENTITY')
    need({'password', 'totp'} <= {x['method'] for x in final['amr']}, 'TOTP_METHODS')
    return second

started, provider = [], None
private = Path(tempfile.mkdtemp(prefix='h6015-independent-auth-', dir='/tmp'))
report['privateRoot'] = str(private)
report['sourceHashes'] = [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes())} for p in [Path(__file__), module]]
report['expectedSHA256'] = '6f51bf48d40b3a7ef280de4afed8735327ea46c386aaa071ec5bdea2e8653f12'
try:
    frozen = json.loads(TRIAL.read_text()); original = Path(frozen['privateRoot'])
    need(original == Path('/tmp/h6015-auth-MDocov'), 'OWN_TRIAL_PATH')
    for item in frozen['backups']: need(sha((original / item['name']).read_bytes()) == item['sha256'], 'BACKUP_HASH')
    need(sha(Path('/tmp/crm-h6-auth-tools/binary/auth').read_bytes()) == '54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f', 'OFFICIAL_AUTH_HASH')
    source_dir, = [p for p in original.glob('source-*') if p.is_dir()]
    source = {'data': source_dir / 'data', 'socket': source_dir / 'socket', 'port': 59740, 'bootstrap': 'h6015_auth_source'}
    need(not (source['data'] / 'postmaster.pid').exists(), 'OWN_SOURCE_STOPPED')
    phase = 'source_schema_readonly'
    start(source)
    source_schema = schema_sql(source)
    archive_schema = command('pg_restore', ['--file=-', '--schema-only', '--create', '--restrict-key=H6015IndependentFixedKey', str(original / 'auth.dump')])
    (private / 'source-schema.sql').write_bytes(source_schema); (private / 'archive-schema.sql').write_bytes(archive_schema)
    need(source_schema == archive_schema, 'ARCHIVE_SOURCE_SCHEMA_EXACT')
    source_identity = raw_identity(source); source_extra = extra_catalog(source)
    report['privateEvidence'] = [save_private('source-identity.json', source_identity), save_private('source-extra.json', source_extra)]
    check('archive_matches_source_schema_exact', sha256=sha(source_schema))
    phase = 'new_auth_restore'
    target_dir = private / 'destination'; target_dir.mkdir(); (target_dir / 'socket').mkdir(mode=0o700)
    target = {'data': target_dir / 'data', 'socket': target_dir / 'socket', 'port': 59746, 'bootstrap': 'h6015_independent_restore'}
    command('initdb', ['-D', str(target['data']), '--username=' + target['bootstrap'], '--auth=trust', '--locale-provider=libc', '--no-locale', '--encoding=UTF8'])
    start(target)
    command('psql', [*sql_args(target, db='template1'), '--command=alter database postgres rename to h6015_independent_maint'])
    command('psql', [*sql_args(target, db='h6015_independent_maint'), '--single-transaction', '--file=' + str(original / 'globals.sql')])
    command('pg_restore', [*common_args(target), '--dbname=h6015_independent_maint', '--create', '--exit-on-error', str(original / 'auth.dump')])
    target_schema = schema_sql(target); (private / 'target-schema.sql').write_bytes(target_schema)
    need(source_schema == target_schema, 'RESTORED_SCHEMA_EXACT')
    target_identity = raw_identity(target); target_extra = extra_catalog(target)
    report['privateEvidence'] += [save_private('target-identity-before-serve.json', target_identity), save_private('target-extra-before-serve.json', target_extra)]
    identity.compare_columns(source_identity['columns'], target_identity['columns'])
    identity.compare_triggers(source_identity['triggers'], target_identity['triggers'])
    check('bounded_live_columns_fk_identity', liveColumns=len(target_identity['columns']), triggers=len(target_identity['triggers']))
    extra_role = next(x for x in target_extra['roles'] if x['rolname'] == target['bootstrap'])
    need(extra_role == {'rolname': target['bootstrap'], 'rolsuper': True, 'rolinherit': True, 'rolcreaterole': True, 'rolcreatedb': True,
          'rolcanlogin': True, 'rolreplication': True, 'rolbypassrls': True, 'rolconnlimit': -1, 'rolvaliduntil': None, 'rolconfig': None}, 'EXTRA_BOOTSTRAP_ONLY')
    no_extra = copy.deepcopy(target_extra); no_extra['roles'].remove(extra_role)
    need(source_extra == no_extra, 'EXTENDED_CATALOG_EXACT')
    need(all(v == 0 for v in source_extra['unsupported'][0].values()), 'SOURCE_VARIANT_COVERAGE')
    before_data = data_hashes(target); need(before_data == frozen['t0Tables'], 'INDEPENDENT_EXACT_ROW_HASHES')
    report['privateEvidence'].append(save_private('target-data-before-serve.json', before_data))
    check('full_schema_and_extended_catalog', types=len(target_extra['types']), enumLabels=len(target_extra['enums']), sequences=len(target_extra['sequences']))
    check('independent_decimal_null_multiset_hashes', tables=len(before_data), rows=sum(x['count'] for x in before_data.values()))
    phase = 'official_serve_without_migrate'
    config = json.loads((original / 'source-configuration.json').read_text()); secret = config['env']['GOTRUE_JWT_SECRET']
    env = dict(config['env']); env['DATABASE_URL'] = 'postgres://h6015_auth@localhost:59746/crm_h6015_auth?sslmode=disable&host=' + urllib.parse.quote(str(target['socket']), safe='')
    endpoint = 'http://127.0.0.1:59745'; env['PORT'] = '59745'
    provider = subprocess.Popen(['/tmp/crm-h6-auth-tools/binary/auth', 'serve'], cwd='/tmp/crm-h6-auth-tools/binary', env=env,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(120):
        need(provider.poll() is None, 'AUTH_PROCESS_START')
        try:
            if http('/health')[0] == 200: break
        except (urllib.error.URLError, ConnectionError): pass
        time.sleep(.1)
    else: raise ValueError('AUTH_HEALTH_TIMEOUT')
    need(schema_sql(target) == target_schema, 'SERVE_SCHEMA_UNCHANGED')
    need(raw_identity(target) == target_identity, 'SERVE_RAW_IDENTITY_UNCHANGED')
    need(extra_catalog(target) == target_extra, 'SERVE_EXTENDED_CATALOG_UNCHANGED')
    need(data_hashes(target) == before_data, 'SERVE_ALL_ROWS_LEDGER_UNCHANGED')
    check('official_serve_all_data_schema_ledger_unchanged')
    phase = 'direct_auth_http_controls'
    old = config['rawT0']; jwt_valid(old['accessToken'])
    need(http('/user', token=old['accessToken'])[0] == 200, 'RESTORED_T0_SESSION_PRESENT')
    late = json.loads((original / 't1-private.json').read_text())['rawT1']; jwt_valid(late['accessToken'])
    late_status, late_error = http('/user', token=late['accessToken']); need(late_status == 403 and late_error.get('error_code') == 'session_not_found', 'T1_SESSION_ABSENT_DIRECT_FORBIDDEN')
    late_refresh = http('/token?grant_type=refresh_token', {'refresh_token': late['refreshToken']})[0]
    need(late_refresh in (400, 401), 'T1_REFRESH_ABSENT_DIRECT_4XX')
    wrong_status = http('/token?grant_type=password', {'email': config['user']['email'], 'password': 'SYNTHETIC_WRONG_PASSWORD'})[0]
    need(wrong_status in (400, 401), 'WRONG_PASSWORD_DIRECT_4XX')
    control = login(); need(http('/logout?scope=global', {}, control['access_token'])[0] == 204, 'GLOBAL_LOGOUT_204')
    status_facts = []
    for name, access, refresh in [('t0', old['accessToken'], old['refreshToken']), ('issuer', control['access_token'], control['refresh_token'])]:
        jwt_valid(access)
        user_status, user_error = http('/user', token=access)
        refresh_status = http('/token?grant_type=refresh_token', {'refresh_token': refresh})[0]
        need(user_status == 403 and user_error.get('error_code') == 'session_not_found' and refresh_status in (400, 401), 'REVOKED_DIRECT_HTTP_4XX')
        status_facts.append({'identity': name, 'userHTTP': user_status, 'refreshHTTP': refresh_status, 'signatureStillValid': True})
    fresh = login(); code, refreshed = http('/token?grant_type=refresh_token', {'refresh_token': fresh['refresh_token']})
    need(code == 200 and jwt_valid(refreshed['access_token'])['session_id'] == jwt_valid(fresh['access_token'])['session_id'], 'FRESH_REFRESH_REAL')
    need(http('/user', token=refreshed['access_token'])[0] == 200, 'POSITIVE_CONTROL_AFTER_DENIALS')
    need(http('/logout?scope=local', {}, refreshed['access_token'])[0] == 204, 'LOCAL_LOGOUT_204')
    local_status, local_error = http('/user', token=refreshed['access_token']); need(local_status == 403 and local_error.get('error_code') == 'session_not_found', 'LOCAL_LOGOUT_DIRECT_FORBIDDEN')
    check('direct_live_password_totp_revocation_refresh', t1HTTP=late_status, t1RefreshHTTP=late_refresh, wrongPasswordHTTP=wrong_status, revoked=status_facts)
    phase = 'own_counterprobes'
    altered = copy.deepcopy(target_extra); altered['enums'][0]['enumlabel'] += '_corrupt'
    need(altered != target_extra, 'ENUM_NEGATIVE_CONTROL'); check('enum_label_mutation_detected')
    altered = copy.deepcopy(target_extra); altered['sequences'][0]['seqincrement'] = '999'
    need(altered != target_extra, 'SEQUENCE_NEGATIVE_CONTROL'); check('sequence_increment_mutation_detected')
    need(schema_sql(target) == target_schema, 'SCHEMA_UNCHANGED_AFTER_AUTH_ACTIONS')
    need(schema_sql(source) == source_schema, 'SOURCE_READ_ONLY_SCHEMA_UNCHANGED')
    report['state'] = 'PASS_AUTH_ONLY_INDEPENDENT_RESTORE_AND_DIRECT_HTTP'
except Exception as error:
    report['state'] = 'FAIL_PRESERVED'
    report['failures'].append({'phase': phase, 'type': type(error).__name__,
                               'rule': str(error) if re.fullmatch(r'[A-Z0-9_]+', str(error)) else 'INDEPENDENT_INSTRUMENT_OR_ASSERTION'})
finally:
    if provider is not None and provider.poll() is None:
        provider.terminate()
        try: provider.wait(timeout=5)
        except subprocess.TimeoutExpired: provider.kill(); provider.wait(timeout=5)
    stop_errors = []
    for cluster in reversed(started):
        try:
            command('pg_ctl', ['-D', str(cluster['data']), '-m', 'fast', '-w', 'stop'])
            need(not (cluster['data'] / 'postmaster.pid').exists(), 'POSTMASTER_STOPPED')
        except Exception:
            stop_errors.append(cluster['bootstrap'])
    report['resourcesStopped'] = not stop_errors and (provider is None or provider.poll() is not None)
    if stop_errors:
        report['state'] = 'FAIL_PRESERVED'; report['failures'].append({'phase': 'cleanup', 'rule': 'RESOURCE_STOP_FAILED', 'clusters': stop_errors})
    report['finishedUTC'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    with OUT.open('x') as file:
        json.dump(report, file, indent=2); file.write('\n')
    print(json.dumps({'report': str(OUT), 'state': report['state'], 'checks': len(report['checks']), 'failures': report['failures'], 'resourcesStopped': report['resourcesStopped']}))
raise SystemExit(0 if report['state'].startswith('PASS_') else 1)
