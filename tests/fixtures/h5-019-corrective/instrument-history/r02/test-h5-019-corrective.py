"""Adversarial regression of H5-019 instruments, exclusively in an explicit copy.
No product tests or business effects. All stdout/stderr and failed trials persist.
"""
from pathlib import Path
import argparse
import copy
import gzip
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time

sys.dont_write_bytecode = True


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--copy', type=Path, required=True)
    p.add_argument('--audit-root', type=Path, required=True)
    p.add_argument('--output-directory', type=Path, required=True)
    args = p.parse_args()
    root = args.copy.resolve(); out = args.output_directory.resolve()
    original = Path(__file__).resolve().parents[1]
    if root == original or original in root.parents or out == root or root in out.parents:
        raise ValueError('Use a separate complete disposable copy and external outputs')
    out.mkdir(parents=True, exist_ok=False)
    new = root / 'tests/fixtures/h5-019-corrective'
    audit_pin = '649565d21191f585d57038c4ef1ee9c3f86f817db8c32dbc92d820285af8a2ab'
    common = ['--audit-root', str(args.audit_root), '--audit-seal-sha256', audit_pin]
    verify = [sys.executable, 'scripts/verify-h5-019.py']
    generate = [sys.executable, 'scripts/consolidate-h5-019.py', *common]
    trials = []

    def run(tag, command, expected_exit, oracle, inspect=None):
        started = time.time()
        r = subprocess.run(command, cwd=root, capture_output=True, env=dict(os.environ, PYTHONDONTWRITEBYTECODE='1'))
        (out / (tag + '.stdout')).write_bytes(r.stdout); (out / (tag + '.stderr')).write_bytes(r.stderr)
        correct = r.returncode == expected_exit if expected_exit == 0 else r.returncode != 0
        try:
            observed = inspect() if inspect else None
        except (ValueError, OSError, KeyError, StopIteration) as error:
            observed = {'correct': False, 'inspectionError': str(error)}
        if isinstance(observed, dict) and 'correct' in observed:
            correct = correct and observed['correct']
        trial = {'id': tag, 'command': command, 'cwd': str(root), 'started': started, 'finished': time.time(),
                 'expectedExit': expected_exit, 'actualExit': r.returncode, 'oracle': oracle,
                 'observed': observed, 'result': 'SATISFACTORIA' if correct else 'FALLIDA',
                 'stdoutSha256': sha(r.stdout), 'stderrSha256': sha(r.stderr)}
        trials.append(trial)
        (out / 'results.json').write_text(json.dumps({'trials': trials}, ensure_ascii=False, indent=2) + '\n')
        return r

    # Only this disposable copy gets a synthetic harness result to exercise seal
    # assembly. It is not a claimed run or a successor candidate for acceptance.
    fixture_result = new / 'corrective-results.json'
    if not fixture_result.exists():
        fixture_result.write_text(json.dumps({'verdict': 'PASS interno propuesto', 'newBusinessExecutions': 0,
            'materialOpen': 0, 'countertests': {'passed': 1, 'failed': 0}, 'harnessFixtureOnly': True}) + '\n')
    for n in ['candidate-inventory.json.gz', 'candidate-seal.json']:
        target = new / n
        if target.exists():
            target.unlink()  # disposable metadata only; source never touched
    prepared = run('prepare-fixture-seal', [*verify, *common, '--prepare-seal'], 0, 'UNVERIFIED metadata only, no self-authentication',
        lambda: {'correct': json.loads((out / 'prepare-fixture-seal.stdout').read_text())['state'] == 'UNVERIFIED metadata prepared'})
    if prepared.returncode != 0:
        raise RuntimeError('Fixture preparation failed; original stdout/stderr and trial retained')
    sealpath = new / 'candidate-seal.json'; invpath = new / 'candidate-inventory.json.gz'
    sealbytes = sealpath.read_bytes(); invbytes = invpath.read_bytes(); pin = sha(sealbytes)
    original_seal = json.loads(sealbytes)
    call = [*verify, *common, '--expected-seal-sha256', pin]
    run('intact-external-pin', call, 0, 'exact synthetic fixture identity must validate')
    run('absent-external-pin', [*verify, *common], 1, 'explicit external identity mandatory')
    run('wrong-external-pin', [*verify, *common, '--expected-seal-sha256', '0' * 64], 1, 'wrong root of trust rejected')

    def seal_trial(tag, change, repin):
        try:
            d = copy.deepcopy(original_seal); change(d)
            sealpath.write_text(json.dumps(d, sort_keys=True, indent=2) + '\n')
            chosen = sha(sealpath.read_bytes()) if repin else pin
            run(tag, [*verify, *common, '--expected-seal-sha256', chosen], 1,
                'Reject invalid semantic contract even with an independently supplied new digest' if repin else 'External pin detects any seal byte change')
        finally:
            sealpath.write_bytes(sealbytes)

    seal_trial('semantic-under-original-pin', lambda d: d.update(accepted=True, H6='COMPLETED', materialOpen=99), False)
    # Each mandatory field and each fixed semantic value, with a newly computed
    # test pin, so a successful rejection cannot be credited only to root hashing.
    dynamic = {'inventorySha256', 'inventoryMetadata', 'resultsSha256', 'successorAdditions', 'resultingFiles'}
    for key in sorted(original_seal):
        seal_trial('missing-field-' + key, lambda d, k=key: d.pop(k), True)
        if key not in dynamic:
            seal_trial('changed-field-' + key, lambda d, k=key: d.__setitem__(k, 'ALTERED'), True)
    seal_trial('unapproved-seal-field', lambda d: d.update(unapproved=True), True)
    seal_trial('replace-inventory-hash', lambda d: d.update(inventorySha256='0' * 64), True)
    seal_trial('replace-results-hash', lambda d: d.update(resultsSha256='0' * 64), True)
    seal_trial('boolean-for-count', lambda d: d.update(successorAdditions=True), True)

    def manifest_trial(tag, change):
        try:
            inv = json.loads(gzip.decompress(invbytes)); change(inv)
            invpath.write_bytes(gzip.compress((json.dumps(inv, sort_keys=True, indent=2) + '\n').encode(), mtime=0))
            s = copy.deepcopy(original_seal); s['inventorySha256'] = sha(invpath.read_bytes())
            s['inventoryMetadata'].update(bytes=invpath.stat().st_size, sha256=s['inventorySha256'])
            sealpath.write_text(json.dumps(s, sort_keys=True, indent=2) + '\n')
            run(tag, [*verify, *common, '--expected-seal-sha256', sha(sealpath.read_bytes())], 1,
                'Resealing malicious manifest cannot bypass semantic, file or scope checks')
        finally:
            invpath.write_bytes(invbytes); sealpath.write_bytes(sealbytes)
    target = 'scripts/capture-h5-019.py'
    manifest_trial('manifest-entry-hash', lambda d: d['files'][target].update(sha256='0' * 64))
    manifest_trial('manifest-entry-size', lambda d: d['files'][target].update(bytes=1))
    manifest_trial('manifest-entry-mode', lambda d: d['files'][target].update(mode=0o755))
    manifest_trial('manifest-entry-type', lambda d: d['files'][target].update(type='symlink'))
    manifest_trial('improper-exclusion', lambda d: d['selfMetadataExcluded'].append(target))
    manifest_trial('manifest-missing-entry', lambda d: d['files'].pop(target))
    manifest_trial('path-traversal', lambda d: d['files'].__setitem__('../outside', d['files'].pop(target)))
    manifest_trial('manifest-unknown-field', lambda d: d.update(allowExtra=True))

    path = root / target; before = path.read_bytes(); mode = path.stat().st_mode & 0o777
    for kind in ['content', 'missing', 'mode', 'symlink']:
        try:
            if kind == 'content':
                path.write_bytes(before + b'\n# tampered\n')
            elif kind == 'missing':
                path.unlink()
            elif kind == 'mode':
                path.chmod(mode ^ 0o100)
            else:
                path.unlink(); path.symlink_to('/etc/hosts')
            run('file-' + kind, call, 1, 'changed bytes, missing file, mode and unsafe type must reject')
        finally:
            if path.is_symlink():
                path.unlink()
            path.write_bytes(before); path.chmod(mode)
    for name in ['unexpected-evidence.txt', '.env-unexpected']:
        path = new / name
        try:
            path.write_text('SYNTHETIC EXTRA\n')
            run('extra-' + name.lstrip('.'), call, 1, 'no undeclared file, including ignored files inside evidence scope')
        finally:
            path.unlink()
    for name in ['candidate-inventory.json.gz', 'candidate-seal.json']:
        path = new / name
        try:
            path.chmod(0o600)
            run('metadata-mode-' + name, call, 1, 'self metadata has fixed 0644 regular-file contract')
        finally:
            path.chmod(0o644)

    request_path = new / 'assembly-request.json'; request_bytes = request_path.read_bytes(); request = json.loads(request_bytes)
    for tag in ['correct', 'foreign', 'missing-observed', 'copied-expected', 'failed-test', 'historical-misattributed', 'future-H6', 'missing-reference', 'ambiguous-observed', 'invented-observed', 'duplicate-AC']:
        trial_request = copy.deepcopy(request); row = next(r for r in trial_request['rows'] if r['id'] == 'AC-050')
        wanted = 'SATISFACTORIA'; wanted_exit = 0; criterion = 'AC-050'
        if tag == 'foreign':
            row['actualCaseLocators'] = next(r for r in trial_request['rows'] if r['id'] == 'AC-072')['actualCaseLocators']; wanted = 'BLOQUEADA'; wanted_exit = 1
        elif tag == 'missing-observed':
            row.pop('observed'); wanted = 'NO EJECUTADA'
        elif tag == 'copied-expected':
            row['observed'] = row['expected']; wanted = 'NO EJECUTADA'
        elif tag == 'failed-test':
            row['localState'] = 'FALLIDA'; wanted = 'FALLIDA'; wanted_exit = 1
        elif tag == 'historical-misattributed':
            trial_request['provenance']['newBusinessExecution'] = True; wanted = 'BLOQUEADA'; wanted_exit = 1
        elif tag == 'future-H6':
            row = next(r for r in trial_request['rows'] if r['id'] == 'AC-073'); row['localState'] = 'SATISFACTORIA'; wanted = 'NO EJECUTADA'; criterion = 'AC-073'
        elif tag == 'missing-reference':
            row['assertionSourcesReviewed'][0]['path'] = 'tests/integration/does-not-exist.ts'; wanted = 'BLOQUEADA'; wanted_exit = 1
        elif tag == 'ambiguous-observed':
            row['observed'] = '   '; wanted = 'NO EJECUTADA'
        elif tag == 'invented-observed':
            row['observed'] = 'fabricated independent observation'; wanted = 'BLOQUEADA'; wanted_exit = 1
        elif tag == 'duplicate-AC':
            trial_request['rows'][1] = copy.deepcopy(row); wanted = None; wanted_exit = 1
        req = out / ('generator-' + tag + '.request.json'); req.write_text(json.dumps(trial_request, ensure_ascii=False, indent=2) + '\n')
        result = out / ('generator-' + tag + '.result.json')
        def inspect():
            if wanted is None:
                return {'correct': not result.exists(), 'observed': 'request rejected before output'}
            d = json.loads(result.read_text()); actual = next(r for r in d['rows'] if r['id'] == criterion)['localState']
            return {'correct': actual == wanted, 'expectedState': wanted, 'observedState': actual}
        run('generator-' + tag, [*generate, '--request', str(req), '--output', str(result)], wanted_exit,
            'only unchanged applicable authenticated review can carry inherited SAT; missing/false/foreign/future never elevated', inspect)
    correct_output = out / 'generator-correct.result.json'; old_output = correct_output.read_bytes()
    run('generator-refuse-overwrite', [*generate, '--request', str(new / 'assembly-request.json'), '--output', str(correct_output)], 1,
        'no existing evidence overwritten', lambda: {'correct': correct_output.read_bytes() == old_output})
    run('restored-fixture-postcontrol', call, 0, 'all mutated bytes and modes restored; no leaked extra files')
    passed = sum(r['result'] == 'SATISFACTORIA' for r in trials)
    result = {'schema': 'H5-019-instrument-regression/v1', 'codeBase': '1e7822c11be817e4f2d4791338284aa825ad1a24',
              'instruments': {n: sha((root / 'scripts' / n).read_bytes()) for n in ['verify-h5-019.py', 'consolidate-h5-019.py', 'h5_019_integrity.py', 'test-h5-019-corrective.py']},
              'scope': 'synthetic instrumental fixture only; no new business execution', 'trials': trials,
              'passed': passed, 'failed': len(trials) - passed, 'newBusinessExecutions': 0}
    (out / 'results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: result[k] for k in ['passed', 'failed', 'newBusinessExecutions']}))
    return 1 if result['failed'] else 0


if __name__ == '__main__':
    sys.exit(main())
