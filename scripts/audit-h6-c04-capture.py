"""Auditor-only readonly capture. Full rows remain in a private local directory."""
import argparse
import datetime
import hashlib
import importlib.util
import json
import os
import pathlib
import re
import sys
import tempfile
import time

sys.dont_write_bytecode = True
os.umask(0o077)
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/fixtures/h6-c04-independent'
READER = ROOT / 'scripts/h6-c04-independent-reader.py'
spec = importlib.util.spec_from_file_location('c04_audit_reader', READER)
reader = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reader)
parser = argparse.ArgumentParser()
parser.add_argument('--socket', required=True)
parser.add_argument('--port', required=True, type=int)
parser.add_argument('--user', required=True)
parser.add_argument('--database', required=True)
parser.add_argument('--label', required=True)
args = parser.parse_args()
if not re.fullmatch('[a-z0-9-]+', args.label):
    raise SystemExit('INVALID_LABEL')
socket = pathlib.Path(args.socket).resolve()
if not socket.is_dir() or not (1024 <= args.port <= 65535):
    raise SystemExit('INVALID_PRIVATE_SOCKET')
c = {'socket': socket, 'port': args.port, 'bootstrap': args.user, 'database': args.database}
private = pathlib.Path(tempfile.mkdtemp(prefix='h6c04-audit-' + args.label + '-', dir='/tmp'))
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
report = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'label': args.label,
          'expectedSha256': sha(OUT / 'expected-v1.json'), 'readerSha256': sha(READER),
          'instrumentSha256': sha(pathlib.Path(__file__)), 'privateRoot': str(private),
          'connection': {'socket': str(socket), 'port': args.port, 'user': args.user, 'database': args.database},
          'readOnly': True, 'checks': [], 'failures': [], 'S11': False, 'taskCompleted': False}

def check(name, condition):
    report['checks'].append({'id': name, 'status': 'PASS' if condition else 'FAIL'})
    if not condition:
        raise ValueError(name)

def save(name, data):
    p = private / name
    p.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    os.chmod(p, 0o600)
    return {'path': name, 'sha256': sha(p), 'bytes': p.stat().st_size}

try:
    check('socket-only-postgres', reader.query(c, "select current_setting('listen_addresses') value") == [{'value': ''}])
    check('readonly-transactions', reader.query(c, "select current_setting('transaction_read_only') value") == [{'value': 'on'}])
    tables = reader.query(c, "select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns,array_agg(format_type(a.atttypid,a.atttypmod) order by a.attnum) types from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where " + reader.NS + " and c.relkind='r' group by 1,2 order by 1,2")
    rows = {}
    for table in tables:
        columns = table['columns']
        sql = "select jsonb_build_object('values',to_jsonb(x),'sqlNulls',jsonb_build_array(" + ','.join('x.' + reader.qident(col) + ' is null' for col in columns) + '))::text value from (select ' + ','.join(map(reader.qident, columns)) + ' from ' + reader.qident(table['schema']) + '.' + reader.qident(table['name']) + ') x'
        values = sorted(item['value'] for item in reader.query(c, sql))
        rows[table['schema'] + '.' + table['name']] = {'columns': columns, 'types': table['types'], 'rows': values}
    globals_ = {
        'bootstrap': reader.query(c, 'select oid::text,rolname from pg_roles where oid=10'),
        'roles': reader.query(c, 'select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,rolconfig from pg_roles order by 1'),
        'memberships': reader.query(c, 'select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3'),
        'parameterACL': reader.query(c, 'select parname,paracl::text from pg_parameter_acl order by 1'),
        'settings': reader.query(c, "select coalesce(d.datname,'*') database,coalesce(ro.rolname,'*') role,x.setconfig from pg_db_role_setting x left join pg_database d on d.oid=x.setdatabase left join pg_roles ro on ro.oid=x.setrole order by 1,2")}
    schema = reader.command('pg_dump', [*reader.common_args(c), '--dbname=' + args.database, '--schema-only', '--create', '--no-publications', '--no-subscriptions', '--restrict-key=H6C04IndependentSchemaFixedKey'])
    p = private / 'schema.sql'
    p.write_bytes(schema)
    os.chmod(p, 0o600)
    report['privateCaptures'] = [save('rows.json', rows), save('globals.json', globals_), {'path': 'schema.sql', 'sha256': sha(p), 'bytes': p.stat().st_size}]
    report['tables'] = len(rows)
    report['rowCount'] = sum(len(x['rows']) for x in rows.values())
    check('private-modes', (private.stat().st_mode & 0o777) == 0o700 and all((x.stat().st_mode & 0o777) == 0o600 for x in private.iterdir()))
    report['state'] = 'PASS_READONLY_ACQUISITION_ONLY'
except Exception as error:
    report['state'] = 'FAIL_PRESERVED'
    message = str(error)
    report['failures'].append({'class': type(error).__name__, 'rule': message if re.fullmatch('[A-Za-z0-9_-]+', message) else 'PRIVATE_DETAILS_OMITTED'})
finally:
    result = OUT / ('capture-' + args.label + '-' + str(time.time_ns()) + '.json')
    result.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'report': str(result), 'sha256': sha(result), 'state': report['state'], 'privateRoot': str(private), 'tables': report.get('tables'), 'rows': report.get('rowCount')}))
if report['failures']:
    raise SystemExit(1)
