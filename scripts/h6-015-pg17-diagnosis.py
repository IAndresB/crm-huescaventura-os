"""PG17 diagnosis, not a revised recovery procedure. Private values never emitted."""
import copy
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time

os.umask(0o077)
WORK = Path(__file__).resolve().parents[1]
OUT = WORK / 'tests/fixtures/h6-015-pg17-corrective'
BIN = Path('/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin')
SOURCE = Path('/tmp/h6015-KbfYWL')
EXPECTED = OUT / 'expected-v1.json'
ENV = {'PATH': '/usr/bin:/bin', 'LC_ALL': 'C', 'LANG': 'C'}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Cluster:
    def __init__(self, root, label, port):
        self.path = root / label
        self.path.mkdir(mode=0o700)
        self.socket = self.path / 's'
        self.socket.mkdir(mode=0o700)
        self.data = self.path / 'data'
        self.user = 'h6015_pg17_' + label
        self.port = port
        self.started = False
        self.native('initdb', ['-D', str(self.data), '-U', self.user, '--auth=trust', '--locale-provider=libc', '--no-locale', '--encoding=UTF8'])
        self.native('pg_ctl', ['-D', str(self.data), '-l', '/dev/null', '-o', f"-k '{self.socket}' -h '' -p {port}", '-w', 'start'])
        self.started = True

    def native(self, name, args):
        p = subprocess.run([str(BIN / name), *args], env=ENV, capture_output=True)
        if p.returncode:
            raise RuntimeError('NATIVE_FAILURE_' + name)
        return p.stdout

    def sql(self, text=None, file=None):
        args = [str(BIN / 'psql'), '-X', '-h', str(self.socket), '-p', str(self.port), '-U', self.user, '-d', 'postgres', '-w', '-At', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose']
        if file:
            args += ['--single-transaction', '--file=' + str(file)]
        p = subprocess.run(args, input=text.encode() if text else None, env=ENV, capture_output=True)
        error = p.stderr.decode(errors='replace')
        match = re.search(r'ERROR:\s+([0-9A-Z]{5}):', error)
        location = re.search(r'LOCATION:\s+(\w+),\s+(\w+\.c):(\d+)', error)
        return {'exit': p.returncode, 'sqlstate': match.group(1) if match else None, 'location': list(location.groups()) if location else None}, p.stdout

    def query(self, text):
        result, raw = self.sql('SELECT coalesce(json_agg(q),\'[]\'::json) FROM (' + text + ') q;')
        assert result['exit'] == 0
        return json.loads(raw)

    def stop(self):
        if self.started:
            self.native('pg_ctl', ['-D', str(self.data), '-m', 'fast', '-w', 'stop'])
            self.started = False


def main():
    assert sha(EXPECTED) == '6901d4027685963fdd2e93eac2d009c64b2e44bac07dd366e0062f488aeec83f'
    expected = json.loads(EXPECTED.read_text())
    for item in expected['sourceLock']:
        assert sha(WORK / item['path']) == item['sha256']
    root = Path(tempfile.mkdtemp(prefix='h6pg-exec-', dir='/tmp'))
    record = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'privateRoot': str(root), 'expectedSHA256': sha(EXPECTED), 'scriptSHA256': sha(Path(__file__)), 'scope': 'Exact historical globals reproduction and isolated diagnostic; NOT Core/Storage restored acceptance', 'taskState': 'IN_PROGRESS', 'taskCompleted': False, 'S11': 'NOT_EXECUTED', 'checks': [], 'resources': [], 'inputHashes': {}, 'failures': []}
    clusters = []

    def check(name, condition, facts=None):
        record['checks'].append({'id': name, 'status': 'PASS' if condition else 'FAIL', 'facts': facts})
        assert condition, name

    try:
        for offset, kind in enumerate(['core', 'storage']):
            file = SOURCE / (kind + '-globals.sql')
            before = sha(file)
            record['inputHashes'][kind] = before
            snapshot = json.loads((SOURCE / (kind + '-snapshot-t0.json')).read_text())
            roles, graph = snapshot['catalog']['roles'], snapshot['catalog']['memberships']
            source_bootstrap = 'h2_bootstrap' if kind == 'core' else 'postgres'
            check(kind + '_source_graph_has_bootstrap_grantor', bool(graph) and all(x['grantor'] == source_bootstrap for x in graph), {'roles': len(roles), 'memberships': len(graph), 'grantor': source_bootstrap})
            check(kind + '_no_recorded_admin_edge_for_source_grantor', not any(x['member'] == source_bootstrap and x['admin_option'] for x in graph))
            c = Cluster(root, kind + '_full', 59861 + offset * 2)
            clusters.append(c)
            start = time.monotonic_ns()
            outcome, _ = c.sql(file=file)
            role_after = c.query("SELECT rolname,oid::text,rolsuper FROM pg_roles WHERE rolname !~ '^pg_' ORDER BY 1")
            check(kind + '_exact_globals_42501', outcome['sqlstate'] == '42501' and outcome['location'][0] == 'check_role_grantor', outcome)
            check(kind + '_single_transaction_rollback', role_after == [{'rolname': c.user, 'oid': '10', 'rolsuper': True}], {'remainingUserRoles': len(role_after), 'destinationBootstrapOID': '10'})
            record['resources'].append({'kind': kind, 'fullRestoreAttempt': outcome, 'elapsedMs': (time.monotonic_ns()-start)/1e6, 'databaseArchiveLoad': 'NOT_ATTEMPTED_AFTER_GLOBALS_FAILURE', 'cluster': str(c.path)})
            c.stop()

            # A different cluster receives only the literal pre-GRANT prefix for diagnosis.
            # It is never labelled a restore or used by later H6-015 phases.
            text = file.read_text()
            grant = re.search(r'^GRANT [^\n]+;', text, re.MULTILINE)
            assert grant and 'GRANTED BY' in grant.group()
            prefix = root / (kind + '-prefix-private.sql')
            prefix.write_text(text[:grant.start()])
            d = Cluster(root, kind + '_probe', 59862 + offset * 2)
            clusters.append(d)
            prefix_result, _ = d.sql(file=prefix)
            check(kind + '_diagnostic_prefix_load', prefix_result['exit'] == 0)
            identity = d.query("SELECT rolname,oid::text,rolsuper FROM pg_roles WHERE rolname IN ('" + source_bootstrap + "','" + d.user + "') ORDER BY 1")
            imported = next(x for x in identity if x['rolname'] == source_bootstrap)
            check(kind + '_same_name_not_bootstrap_identity', imported['oid'] != '10' and imported['rolsuper'], {'roles': identity, 'currentUser': d.user})
            explicit, _ = d.sql(grant.group())
            check(kind + '_explicit_original_grant_rejected', explicit['sqlstate'] == '42501' and explicit['location'][0] == 'check_role_grantor', explicit)
            check(kind + '_diagnostic_graph_remains_empty', d.query("SELECT roleid::text FROM pg_auth_members WHERE member IN (SELECT oid FROM pg_roles WHERE rolname !~ '^pg_')") == [])
            d.stop()

            # Canonical comparison preserves every captured role field and every membership field.
            canonical = lambda a: json.dumps(a, sort_keys=True, separators=(',', ':'))
            original = {'roles': roles, 'memberships': graph}
            for field in ['role', 'member', 'grantor', 'admin_option', 'inherit_option', 'set_option']:
                mutant = copy.deepcopy(original)
                value = mutant['memberships'][0][field]
                mutant['memberships'][0][field] = not value if isinstance(value, bool) else str(value) + '_tampered'
                check(kind + '_reject_mutated_' + field, canonical(mutant) != canonical(original))
            for variant in ['missing', 'extra']:
                mutant = copy.deepcopy(original)
                if variant == 'missing':
                    mutant['memberships'].pop()
                else:
                    mutant['memberships'].append(copy.deepcopy(graph[0]))
                check(kind + '_reject_' + variant + '_edge', canonical(mutant) != canonical(original))
            for field in ['rolsuper', 'rolbypassrls', 'rolcreaterole', 'rolcanlogin']:
                mutant = copy.deepcopy(original)
                mutant['roles'][0][field] = not mutant['roles'][0][field]
                check(kind + '_reject_mutated_' + field, canonical(mutant) != canonical(original))
            check(kind + '_original_globals_preserved', sha(file) == before)
        record['state'] = 'PASS_DIAGNOSIS_BLOCK_CONFIRMED_NOT_RESTORE'
    except Exception as error:
        record['state'] = 'FAIL_DIAGNOSTIC_PRESERVED'
        record['failures'].append({'exceptionClass': type(error).__name__})
    finally:
        for c in clusters:
            try:
                c.stop()
            except Exception:
                record['failures'].append({'stopFailed': str(c.path)})
        record['allOwnedClustersStopped'] = all(not c.started for c in clusters)
        path = OUT / ('diagnosis-' + str(time.time_ns()) + '.json')
        path.write_text(json.dumps(record, indent=2) + '\n')
        print(json.dumps({'report': str(path), 'state': record['state'], 'checks': len(record['checks']), 'failures': len(record['failures']), 'allOwnedClustersStopped': record['allOwnedClustersStopped']}))
    return 0 if not record['failures'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
