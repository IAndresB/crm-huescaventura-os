#!/usr/bin/env python3
"""Read-only closure verification. No database, runtime, remote or Git mutations."""
import difflib
import gzip
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'tests/fixtures/h6-001-local-closure'
AUDIT = ROOT / 'tests/fixtures/h6-001/independent'
BASE = '971c55d5ce5770c71284d106d3c0deecca9514b5'
checks = []


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(Path(path).read_text())


def check(name, ok, details=None):
    checks.append({'id': name, 'status': 'PASS' if ok else 'FAIL', 'details': details})


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def contents(path):
    p = Path(path)
    return gzip.decompress(p.read_bytes()) if p.suffix == '.gz' else p.read_bytes()


def counts(data):
    return {key: int(value) for key, value in re.findall(r'^[ℹ#] (tests|pass|fail|cancelled|skipped) (\d+)', data.decode(), re.M)}


def exact_files(directory, files, prefix):
    for item in files:
        path = Path(directory) / item['path']
        check(prefix + ':' + item['path'], path.is_file() and sha(path.read_bytes()) == item['sha256'] and path.stat().st_size == item['bytes'])


check('HEAD', git('rev-parse', 'HEAD').decode().strip() == BASE)
check('index', git('diff', '--cached', '--name-only') == b'')
check('diff-check', subprocess.run(['git', 'diff', '--check'], cwd=ROOT, capture_output=True).returncode == 0)
before = load(DIR / 'preflight-v1.json')
exact_files(ROOT, before['originalFiles'], 'original')
check('original-count', len(before['originalFiles']) == 331)
check('accepted-manifest', sha((ROOT / 'tests/fixtures/h6-001/delivery-manifest-v1.json').read_bytes()) == 'd97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435')
for f in before['normativeInputs']:
    check('normative-input:' + f['path'], sha((ROOT / f['path']).read_bytes()) == f['sha256'])
legacy = subprocess.run(['/Users/andres/.openclaw/bin/node', 'scripts/verify-h6-001.mjs', '--delivery'], cwd=ROOT, capture_output=True)
legacy_result = json.loads(legacy.stdout)
check('original-verifier', legacy.returncode == 0 and legacy_result['status'] == 'PASS' and legacy_result['checks'] == 557, legacy_result)
check('dependency-H5019', sha((ROOT / 'tests/fixtures/h5-019-corrective/candidate-seal.json').read_bytes()) == '31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619' and subprocess.run(['git', 'merge-base', '--is-ancestor', '8a5f1408777b81b760a02646fa414a34dc17983e', BASE], cwd=ROOT).returncode == 0)
receipt = load(DIR / 'decision-receipt.json')
check('decision', receipt['state'] == 'COMPLETED_LOCAL_ISOLATED' and receipt['h6Global'] == 'IN_PROGRESS' and not receipt['publicationAuthorized'] and not receipt['functionalChange'])
rows = [x for x in (ROOT / 'specs/001-core-crm/tasks.md').read_text().splitlines() if x.startswith('| **') and '[TSK-H6-001]' in x]
check('direct-assignments', rows == before['directAssignments'] and len(rows) == 3 and receipt['directAssignments'] == ['AC-089', 'SPEC-NFR-001', 'E2E-01'])

expected_counts = [('executor-focal', ROOT / 'tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/stdout.log', 22),
                   ('independent-focal', AUDIT / 'focal-independent-01/stdout.log.gz', 22),
                   ('unit', ROOT / 'tests/fixtures/h6-001/quality-r1/unit.stdout.log', 212),
                   ('countertests', AUDIT / 'independent-02/stdout.log.gz', 7),
                   ('H5019-additional', AUDIT / 'integrated-68/stdout.log.gz', 3)]
for name, path, total in expected_counts:
    got = counts(contents(path))
    check('historical:' + name, got == {'tests': total, 'pass': total, 'fail': 0, 'cancelled': 0, 'skipped': 0}, got)
quality = load(ROOT / 'tests/fixtures/h6-001/quality-r1/results.json')
for q in quality['checks']:
    check('historical-quality:' + q['name'], q['status'] == 'PASS' and q['exitCode'] == 0)
    for stream in ['stdout', 'stderr']:
        b = (ROOT / 'tests/fixtures/h6-001/quality-r1' / (q['name'] + '.' + stream + '.log')).read_bytes()
        check('historical-quality-hash:' + q['name'] + ':' + stream, sha(b) == q[stream + 'SHA256'])
reg = load(AUDIT / 'regression-01/report.json')
totals = {key: sum(p['counts'][key] for p in reg['phases']) for key in ['tests', 'pass', 'fail', 'cancelled', 'skipped']}
check('historical-regression-FAIL-retained', totals == {'tests': 2945, 'pass': 2899, 'fail': 46, 'cancelled': 0, 'skipped': 0}, totals)
for phase in reg['phases']:
    for stream in ['stdout', 'stderr']:
        b = contents(AUDIT / f"regression-01/phase-{phase['index']:02d}.{stream}.log.gz")
        check(f"historical-phase-{phase['index']}:{stream}", sha(b) == phase[stream + 'SHA'])

def source_matches(ref, run):
    name = Path(ref['source']).name
    options = [ROOT / ref['source'], AUDIT / run / name, AUDIT / run / 'source.test.ts', AUDIT / run / 'source' / name]
    expected = ref.get('sourceSHA', ref.get('sourceSHA256'))
    return any(p.is_file() and sha(p.read_bytes()) == expected for p in options)


reconciliation = load(AUDIT / 'reconciliation.json')
check('reconciliation-46', len(reconciliation['rows']) == 46 and [r['id'] for r in reconciliation['rows']] == [f'AF{i:03d}' for i in range(1, 47)])
for row in reconciliation['rows']:
    for kind, mark in [('original', '✖'), ('successor', '✔')]:
        ref = row[kind]
        line = contents(AUDIT / ref['log']).decode().splitlines()[ref['logLine'] - 1]
        check(row['id'] + ':' + kind, mark in line and row['title'] in line and ref['result'] == ('FAIL' if kind == 'original' else 'PASS'), {'log': ref['log'], 'line': ref['logLine'], 'observed': line})
        check(row['id'] + ':' + kind + ':source', source_matches(ref, ref.get('run', 'regression-01')))
matrix = load(AUDIT / 'ac-matrix.json')
check('AC-matrix-34', len(matrix['rows']) == 34)
refs = [e for row in matrix['rows'] for e in row['evidence']]
check('AC-references-105', len(refs) == 105)
for i, ref in enumerate(refs):
    line = contents(AUDIT / ref['log']).decode().splitlines()[ref['logLine'] - 1]
    check('AC-reference:' + str(i + 1), '✔' in line and ref['test'] in line and ref['result'] == 'PASS' and source_matches(ref, ref['run']))

variant = load(DIR / 'documentary-variant-manifest.json')
check('patch-hash', sha((ROOT / variant['patchPath']).read_bytes()) == variant['patchSHA256'])
patch_check = subprocess.run(['git', 'apply', '--check', str(ROOT / variant['patchPath'])], cwd=ROOT, capture_output=True)
check('patch-not-applied-check', patch_check.returncode == 0, patch_check.stderr.decode())
old = '- [ ] **Ejecución: IN PROGRESS local/aislado. Evidencia: ejecución y auditoría H6-001; aceptación pendiente del director.** Hito: H6. Tipo: comprobación.'
new = '- [x] **Ejecución: COMPLETED — local/aislado. Evidencia: SATISFACTORIA LOCAL; aceptación expresa del director y regresión histórica reconciliada.** Hito: H6. Tipo: comprobación.'
for f in variant['files']:
    target = f['targetPath']
    original = (ROOT / target).read_text()
    proposed = (ROOT / f['variantPath']).read_text()
    check('variant-hash:' + target, sha(original.encode()) == f['beforeSHA256'] and sha(proposed.encode()) == f['afterSHA256'])
    check('variant-current-state:' + target, '**TSK-H6-001: COMPLETED — exclusivamente local/aislado**' in proposed and '**H6 global IN PROGRESS.**' in proposed)
    a = git('show', BASE + ':' + target).decode().splitlines(True)
    c = git('show', f['H6015Source']['snapshot'] + ':' + target).decode().splitlines(True)
    reverted = re.sub(r'\n<!-- H6001-LOCAL-CLOSURE-BEGIN -->[\s\S]*?<!-- H6001-LOCAL-CLOSURE-END -->\n', '', proposed, count=1)
    for op, i, j, k, l in difflib.SequenceMatcher(a=a, b=c, autojunk=False).get_opcodes():
        if op != 'equal':
            payload = ''.join(c[k:l])
            check('H6015-literal:' + target + ':' + str(i), op == 'insert' and payload in proposed)
            reverted = reverted.replace(payload, '', 1)
    if target.endswith('/tasks.md'):
        check('only-H6001-status', reverted.count(new) == 1)
        reverted = reverted.replace(new, old, 1)
    check('all-historical-body-preserved:' + target, reverted == original)

inventory = load(DIR / 'publication-paths-v1.json')
rebuilt = subprocess.run([sys.executable, 'scripts/prepare-h6-001-publication-inventory.py'], cwd=ROOT, capture_output=True)
check('deterministic-publication-inventory', rebuilt.returncode == 0 and rebuilt.stdout == (DIR / 'publication-paths-v1.json').read_bytes())
check('no-unresolved-byte-selection', not inventory['dispositionCounts'].get('BLOCKED_UNRESOLVED_BYTE_VARIANTS', 0))
for row in inventory['files']:
    if 'proposedSource' not in row:
        continue
    after = row['proposedSource']['sha256']
    known = row['acceptedPreimages']
    decide = lambda current: 'NO_OP' if current == after else ('PROPOSED_ONLY' if current in known else 'STOP')
    check('idempotent-plan:' + row['path'], decide(known[0]) in ['PROPOSED_ONLY', 'NO_OP'] and decide(after) == 'NO_OP' and decide('unrecognized-content') == 'STOP')
check('quarantine', receipt['H6015']['suspendedJobs'] == 4 and not receipt['H6015']['runtimeAccess'] and not receipt['H6015']['reactivation'])
check('AGENTS-additive-correction', sha(Path('/Users/andres/.codex/AGENTS.md').read_bytes()) == 'd1e8a26ea3d4d10c5674a2c2ea3bc7f0b5ef4b3618362eac07f0f3308f093721')

if '--delivery' in sys.argv:
    manifest = load(DIR / 'delivery-manifest-v1.json')
    seal = load(DIR / 'delivery-seal-v1.json')
    check('closure-seal', sha((DIR / 'delivery-manifest-v1.json').read_bytes()) == seal['manifestSHA256'])
    exact_files(ROOT, manifest['files'], 'closure-delivery')

failures = [c for c in checks if c['status'] == 'FAIL']
print(json.dumps({'at': datetime.now(timezone.utc).isoformat(), 'status': 'FAIL' if failures else 'PASS', 'base': BASE,
                  'scope': 'Read-only local closure verification; functional results reused as sealed historical evidence',
                  'checks': len(checks), 'failures': failures, 'historicalRegression': totals,
                  'historicalReconciledFailures': 46, 'cleanCompleteRerun': False, 'functionalReexecution': False,
                  'databaseOrRuntimeAccess': False, 'publication': False, 'normativeOrProductChanges': False,
                  'originalFiles': 331, 'directAssignments': receipt['directAssignments'],
                  'task': receipt['state'], 'h6Global': receipt['h6Global']}, ensure_ascii=False, indent=2))
sys.exit(1 if failures else 0)
