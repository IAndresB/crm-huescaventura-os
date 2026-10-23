"""Independent SQL acquisition derived from previously audited own Auth reader.
No executor snapshot code is imported. Values stay in memory/private files.
"""
from decimal import Decimal
import hashlib,json,os,subprocess
from pathlib import Path
PG=Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
sha=lambda b:hashlib.sha256(b).hexdigest()
NS="n.nspname !~ '^pg_' and n.nspname<>'information_schema'"
def need(ok, rule):
    if not ok:
        raise ValueError(rule)

def command(name, args, env=None):
    result = subprocess.run([str(PG / name), *args], stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE, env=env or {'PATH': os.environ['PATH'], 'LANG': 'C', 'LC_ALL': 'C'})
    if result.returncode:
        raise ValueError('NATIVE_' + name.upper() + '_FAILED')
    return result.stdout

def sql_args(cluster, user=None, db=None):
    db=db or cluster['database']
    return ['-X', '--no-password', '--host=' + str(cluster['socket']), '--port=' + str(cluster['port']),
            '--username=' + (user or cluster['bootstrap']), '--dbname=' + db, '--set=ON_ERROR_STOP=1', '--tuples-only', '--no-align']

def query(cluster, sql):
    env = {'PATH': os.environ['PATH'], 'LANG': 'C', 'LC_ALL': 'C',
           'PGOPTIONS': '-c default_transaction_read_only=on -c search_path=pg_catalog'}
    body = 'select coalesce(jsonb_agg(to_jsonb(a)),\'[]\'::jsonb)::text from (' + sql + ') a'
    return json.loads(command('psql', [*sql_args(cluster), '--command=' + body], env))

def qident(text):
    return '"' + text.replace('"', '""') + '"'

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

def common_args(cluster):
    return ['--host=' + str(cluster['socket']), '--port=' + str(cluster['port']), '--username=' + cluster['bootstrap'], '--no-password']
