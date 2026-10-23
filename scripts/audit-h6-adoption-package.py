"""Read-only independent package validation; writes only an auditor receipt."""
import datetime
import difflib
import hashlib
import json
import pathlib
import subprocess

AUDIT = pathlib.Path(__file__).resolve().parents[1]
CANDIDATE = pathlib.Path('/Users/andres/.codex/worktrees/h6-adoption-reconciliation/crm-huescaventura-os')
PREVIOUS = pathlib.Path('/Users/andres/.codex/worktrees/h6-bootstrap-variant/crm-huescaventura-os')
OUT = AUDIT / 'tests/fixtures/h6-adoption-independent'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

checks = []

def check(name, condition):
    checks.append({'id': name, 'status': 'PASS' if condition else 'FAIL'})

changes_path = CANDIDATE / 'specs/001-core-crm/changes-TSK-H6-014-r4-proposed.json'
changes = load(changes_path)
original = CANDIDATE / changes['original']
successor = CANDIDATE / changes['successor']
check('original-r3-hash', digest(original) == changes['originalSHA256'] == digest(AUDIT / changes['original']))
check('successor-hash', digest(successor) == changes['successorSHA256'])
text = original.read_text()
for i, change in enumerate(changes['changes']):
    check(f'declared-replacement-{i+1}-count', text.count(change['before']) == change['count'])
    text = text.replace(change['before'], change['after'])
text = changes['prefix'] + text
check('successor-exact-reconstruction', text == successor.read_text())
patch = ''.join(difflib.unified_diff(original.read_text().splitlines(True), successor.read_text().splitlines(True), fromfile=original.name, tofile=successor.name))
check('complete-patch-exact', patch == (CANDIDATE / 'specs/001-core-crm/changes-TSK-H6-014-r4-proposed.patch').read_text())
check('proposed-not-approved', changes['state'] == 'PROPOSED_NOT_APPROVED')

preflight = load(OUT / 'preflight-source-seal-v1.json')
norms = [x for x in preflight['sources'] if x['path'].startswith(('docs/', 'specs/'))]
for entry in norms:
    check('normative-source:' + entry['path'], digest(CANDIDATE / entry['path']) == entry['sha256'])

focal = CANDIDATE / 'tests/fixtures/h6-adoption-reconciliation'
expected = load(focal / 'expected-v1.json')
run = focal / 'runs/2026-10-22T15-26-11.170Z/report.json'
report = load(run)
instrument = CANDIDATE / 'scripts/verify-h6-adoption-reconciliation.ts'
check('executor-expected-integrity', digest(focal / 'expected-v1.json') == report['expectedSHA256'] == (focal / 'expected-v1.sha256').read_text().strip())
check('executor-instrument-integrity', digest(instrument) == report['instrumentSHA256'])
check('executor-all-exact-12-results', len(report['checks']) == 12 and set(x['id'] for x in report['checks']) == set(expected['cases']) and all(x['status'] == 'PASS' and x['actual'] == x['expected'] == expected['cases'][x['id']] for x in report['checks']))
check('executor-states-limited', report['SQLExecuted'] is False and report['externalEffects'] == 0 and report['S11'] is False and report['taskState'] == 'IN_PROGRESS')
for source, sha in expected['sources'].items():
    check('executor-tested-source:' + source, digest(CANDIDATE / source) == sha)

initial = load(OUT / 'candidate-initial-review-v1.json')
check('previous-acquisition-valid', initial['inheritedPayloadCount'] == 4254 and not initial['mismatches'] and initial['trackedFilesComparedToAcceptedV2'] == 39970 and not initial['trackedDifferencesFromAcceptedV2'])
for m in initial['inheritedManifests']:
    check('historical-manifest-still-identical:' + m['manifest'], digest(CANDIDATE / m['manifest']) == m['sha256'])
tracked = subprocess.check_output(['git', 'diff', '--name-only'], cwd=CANDIDATE, text=True).splitlines()
for name in tracked:
    check('tracked-delta-inherited:' + name, (CANDIDATE / name).read_bytes() == (PREVIOUS / name).read_bytes())

def untracked(root):
    return set(subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z'], cwd=root).decode().strip('\0').split('\0'))

new_paths = sorted(untracked(CANDIDATE) - untracked(PREVIOUS))
check('no-new-product-paths', not any(x.startswith(('src/', 'supabase/')) for x in new_paths))
check('no-staged-changes', not subprocess.check_output(['git', 'diff', '--cached', '--name-only'], cwd=CANDIDATE, text=True).strip())
reviewed = [changes['original'], changes['successor'], str(changes_path.relative_to(CANDIDATE)), 'specs/001-core-crm/changes-TSK-H6-014-r4-proposed.patch', 'specs/001-core-crm/adoption-TSK-H6-015-PG17-v1.md', 'src/server/human-auth-session.ts', 'src/infrastructure/postgres/h0-013-adapter.ts', 'src/infrastructure/postgres/persisted-work-executor.ts', 'tests/support/h6-bootstrap-variant.ts', 'tests/support/h6-bootstrap-integration.ts', str(instrument.relative_to(CANDIDATE)), str(run.relative_to(CANDIDATE)), 'tests/fixtures/h6-adoption-reconciliation/final-integrity-v1.json', 'tests/fixtures/h6-adoption-reconciliation/findings-v1.json', 'tests/fixtures/h6-adoption-reconciliation/custody-recheck-v1.json']
result = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'scope': 'Independent documentation and package verification; no new SQL/Auth/Storage integration', 'expectedSha256': digest(OUT / 'expected-v1.json'), 'previousAcquisitionSha256': digest(OUT / 'candidate-initial-review-v1.json'), 'instrumentSha256': digest(pathlib.Path(__file__)), 'checks': checks, 'passed': sum(x['status'] == 'PASS' for x in checks), 'failed': sum(x['status'] == 'FAIL' for x in checks), 'newPathsAtAcquisition': new_paths, 'reviewedFiles': [{'path': name, 'sha256': digest(CANDIDATE / name)} for name in reviewed], 'findingsResolved': ['D01 exact filename', 'D02 explicit prefix', 'D03 explicit relacl acquisition'], 'initialReceiptTimingNote': 'The initial receipt retained findings from the first reading. Its file-hash acquisition completed after executor corrections; its successor hash already identifies the corrected document. This receipt separately verifies resolution without replacing that historical receipt.', 'SQLExecuted': False, 'servicesStarted': False, 'privatePayloadsRead': False, 'S11': False, 'taskCompleted': False}
target = OUT / 'candidate-final-review-v1.json'
with target.open('x') as f:
    json.dump(result, f, indent=2)
    f.write('\n')
print(json.dumps({'passed': result['passed'], 'failed': result['failed'], 'receiptSha256': digest(target)}))
if result['failed']:
    raise SystemExit(1)
