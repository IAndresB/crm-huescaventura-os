#!/usr/bin/env python3
"""Read-only archive/receipt audit. Never connects to a database or starts one.

COPY contents are parsed only in private memory. Public output contains counts,
hashes and rule names. The original source's post-t0 state is not independently
queried here; the exact limit is part of the report.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parent.parent
EXECUTOR = Path('/Users/andres/.codex/worktrees/h6-restore-execution/crm-huescaventura-os')
ADDENDUM = EXECUTOR / 'tests/fixtures/h6-015-execution/capture-audit-1792670472228/report.json'
PG_RESTORE = '/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin/pg_restore'
OUT = ROOT / 'tests/fixtures/h6-015-independent-preparation/capture-offline-review-v2.json'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def need(ok, code):
    if not ok: raise ValueError(code)

def archive(args):
    r = subprocess.run([PG_RESTORE, *args], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    need(r.returncode == 0, 'ARCHIVE_READ_FAILED')
    return r.stdout.decode()

def copy_value(value):
    if value == r'\N': return None
    mapping = {'b': '\b', 'f': '\f', 'n': '\n', 'r': '\r', 't': '\t', 'v': '\v', '\\': '\\'}
    return re.sub(r'\\([0-7]{1,3}|x[0-9a-fA-F]{1,2}|.)',
                  lambda m: chr(int(m[1], 16)) if m[1].startswith('x') else chr(int(m[1], 8)) if m[1][0].isdigit() else mapping.get(m[1], m[1]), value)

def copy_tables(sql, wanted):
    result, current, columns = {}, None, []
    for line in sql.splitlines():
        m = re.fullmatch(r'COPY ([a-z_][a-z_0-9]*\.[a-z_][a-z_0-9]*) \(([^\n]+)\) FROM stdin;', line)
        if m:
            current = m[1] if m[1] in wanted else None
            if current:
                need(current not in result, 'COPY_DUPLICATE_TABLE')
                result[current] = []; columns = [x.strip().strip('"') for x in m[2].split(',')]
        elif line == r'\.': current = None
        elif current is not None:
            values = list(map(copy_value, line.split('\t'))); need(len(values) == len(columns), 'COPY_COLUMN_ARITY')
            result[current].append(dict(zip(columns, values)))
    need(set(result) == wanted, 'COPY_COVERAGE')
    return result

r = {'scope': 'offline capture/addendum consistency only', 'state': 'RUNNING', 'checks': [],
     'noSQLExecuted': True, 'noDatabaseStarted': True, 'noRestorationClaim': True, 'explicitReentry': False, 'taskCompleted': False,
     'independentLimit': 'Post-t0 source state and late attempt work_start identity are reviewed through exact hashed acquisition code/receipt, not independently queried from its live database.'}
try:
    a = json.loads(ADDENDUM.read_text()); original = EXECUTOR / a['sourceReport']; o = json.loads(original.read_text()); private = Path(o['privateRoot'])
    need(sha(original) == a['sourceReportSHA256'], 'ORIGINAL_REPORT_HASH')
    need(sha(EXECUTOR / 'scripts/audit-h6-015-capture.ts') == a['instrumentSHA256'], 'CAPTURE_INSTRUMENT_HASH')
    need(sha(EXECUTOR / 'tests/support/h6-015-runtime.ts') == a['runtimeSHA256'], 'CAPTURE_RUNTIME_HASH')
    need(sha(ADDENDUM.parent / 'expected.json') == a['expectedSHA256'], 'CAPTURE_EXPECTED_HASH')
    need(sha(private / 'witness-t1.json') == o['witnessSHA256'] == a['witnessAddendum']['originalWitnessSHA256'], 'ORIGINAL_WITNESS_HASH')
    need(o['state'] == 'FAIL_PRESERVED' and a['sourceOnly'] is True, 'PRESERVE_RESTORE_FAIL')
    witness = json.loads((private / 'witness-t1.json').read_text())
    r['checks'].append('source_report_instrument_expected_original_witness_hashes')
    r['archives'] = []
    for kind in ['core', 'auth', 'storage']:
        dump = private / (kind + '.dump')
        expected = next(x['sha256'] for x in o['backups'] if x['path'] == kind + '.dump')
        need(sha(dump) == expected, 'FULL_DUMP_HASH')
        toc = archive(['--list', '--create', str(dump)])
        entries = [x for x in toc.splitlines() if x and not x.startswith(';')]
        need(len({x.split(';')[0] for x in entries}) == len(entries), 'TOC_ID_UNIQUENESS')
        tables = []
        for line in entries:
            if ' TABLE DATA ' in line:
                match = re.search(r' TABLE DATA ([a-z_][a-z_0-9]*) ([a-z_][a-z_0-9]*) ', line); need(match is not None, 'TOC_SIMPLE_ID_SCOPE')
                tables.append(match[1] + '.' + match[2])
        need(sorted(tables) == sorted(o['t0Tables'][kind]), 'ALL_TABLE_DATA_COVERAGE')
        claimed = next(x for x in a['archives'] if x['kind'] == kind)
        need(claimed['entries'] == len(entries) and claimed['dataTables'] == len(tables), 'TOC_ADDENDUM_AGREEMENT')
        r['archives'].append({'kind': kind, 'sha256': expected, 'entries': len(entries), 'dataTables': len(tables)})
    wanted = {'crm_private.b08_attempts', 'crm_ha.reservations', 'crm_private.b07_history',
              'crm_private.identification_epochs', 'crm_private.crm_sessions'}
    tables = copy_tables(archive(['--file=-', '--data-only', str(private / 'core.dump')]), wanted)
    ids = a['witnessAddendum']['identities']; need(len(ids) == len(witness['effects']) == 4, 'FOUR_EFFECT_IDENTITIES')
    proven, late = 0, 0
    for item in ids:
        prior = next(x for x in witness['effects'] if x['attemptId'] == item['attempt_id'])
        need(item['execution_id'] == prior['executionId'] and item['part_id'] == prior['partId'] and item['definitionOperationId'] == prior['operationId'], 'WITNESS_IDENTITY_LINK')
        attempts = [x for x in tables['crm_private.b08_attempts'] if x['attempt_id'] == item['attempt_id']]
        if not item['presentAtT0']:
            need(not attempts, 'LATE_ATTEMPT_NOT_IN_T0_ARCHIVE'); late += 1; continue
        need(len(attempts) == 1, 'T0_ATTEMPT_PRESENT_ONCE'); attempt = attempts[0]
        need(all(attempt[k] == item[k] for k in ['attempt_id', 'execution_id', 'part_id', 'reservation_id']), 'T0_ATTEMPT_IDENTITIES')
        reserves = [x for x in tables['crm_ha.reservations'] if x['reservation_id'] == item['reservation_id']]
        need(len(reserves) == 1 and all(reserves[0][k] == item[k] for k in ['effect_id', 'intent_id']), 'T0_RESERVATION_IDENTITIES')
        history = [x for x in tables['crm_private.b07_history'] if x['operation_id'] == item['startOperationId'] and x['action_kind'] == 'work_start']
        need(len(history) == 1 and history[0]['subject_id'] == item['execution_id'], 'T0_START_OPERATION_IDENTITIES')
        need(json.loads(history[0]['after_state'])['receipt']['attemptId'] == item['attempt_id'], 'T0_START_RECEIPT_ATTEMPT')
        proven += 1
    need((proven, late) == (3, 1), 'T0_AND_LATE_COUNTS')
    epochs = tables['crm_private.identification_epochs']; sessions = tables['crm_private.crm_sessions']
    claimed_epochs = a['witnessAddendum']['t0Sessions']
    need({x['epoch_id'] for x in epochs} == {x['epoch_id'] for x in claimed_epochs}, 'ALL_T0_EPOCHS_FROM_ARCHIVE')
    for item in claimed_epochs:
        e = next(x for x in epochs if x['epoch_id'] == item['epoch_id']); s = next(x for x in sessions if x['session_id'] == e['session_id'])
        need(e['session_id'] == item['session_id'] and s['actor_id'] == item['actor_id'] and s['access_generation'] == item['session_access_generation'], 'T0_SESSION_ACTOR_GENERATION')
    r['checks'] += ['all_archive_toc_and_table_coverage', 'three_t0_attempt_start_effect_intent_identities', 'one_late_attempt_absent_from_t0', 'all_three_t0_epochs_without_current_flag_inference']
    gate = json.loads((EXECUTOR / 'tests/fixtures/h6-015-execution/blocked-operations.json').read_text())
    need(gate['state'] == 'OPEN' and gate['explicitReentry'] is False and gate['taskCompleted'] is False, 'BLOCKING_GATE_OPEN')
    diagnoses = []
    for name in gate['reproducedInNewClusters']:
        p = EXECUTOR / 'tests/fixtures/h6-015-execution' / name; d = json.loads(p.read_text())
        need(d['sqlstate'] == '42501' and 'check_role_grantor' in d['sourceLocation'], 'GRANTOR_DIAGNOSIS')
        need(sha(Path(d['source'])) == d['sourceSHA256'], 'GRANTOR_DUMP_HASH')
        diagnoses.append({'path': str(p.relative_to(EXECUTOR)), 'sha256': sha(p), 'sqlstate': d['sqlstate']})
    r['diagnoses'] = diagnoses
    r['checks'].append('material_core_storage_block_preserved')
    r['state'] = 'PASS_OFFLINE_CAPTURE_ADDENDUM_CONSISTENCY_ONLY'
except Exception as error:
    r['state'] = 'FAIL_PRESERVED'; r['failure'] = {'type': type(error).__name__, 'rule': str(error) if re.fullmatch(r'[A-Z0-9_]+', str(error)) else 'OFFLINE_INSTRUMENT_OR_ASSERTION'}
finally:
    r['inputs'] = {'addendumSHA256': sha(ADDENDUM), 'instrumentSHA256': sha(Path(__file__))}
    with OUT.open('x') as file: json.dump(r, file, indent=2); file.write('\n')
    print(json.dumps({'state': r['state'], 'report': str(OUT), 'checks': len(r['checks']), 'failure': r.get('failure')}))
raise SystemExit(0 if r['state'].startswith('PASS_') else 1)
