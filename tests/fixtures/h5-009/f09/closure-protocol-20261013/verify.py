"""Independent closure-protocol audit; requires a reviewer-supplied external seal.

Authenticates the successor before executing it. Historical F16 runs unchanged
against authenticated Git predecessor bytes, never against projected new results.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
import tempfile

BASE = 'a39c6062f9738441f8627f4ae88005846ac9ab9a'
PREFIX = 'tests/fixtures/h5-009/f09/closure-protocol-20261013/'
C12 = 'tests/fixtures/h5-009/f09/c12-20261013/'
F16 = 'tests/fixtures/h5-009/f09/f16-20261013/'
AUDITOR = 'scripts/verify-h5-008-evidence.mjs'
BEFORE = '15278ae39c423e47645c5fd312b03580632254c433801e23ad4c8e1b04704387'
F16_SEAL = 'de7f4b38f061dccac0f6a290f0a555f1454e815cf16bf4941fdb0be0bf110e82'
C12_SEAL = 'eff6a0afc814707138913bdd3a2270e7458f5029d9569ce42d2b46bbe45f80f0'
C12_INVENTORY = '847ef52f945eb5eedf66f3ee58a07ccaf43967a40267b1d0097d58532e3c2ce9'
NAMES = ['authorization.json', 'verify.py', 'counterproofs.py', 'README.md']
sha = lambda data: hashlib.sha256(data).hexdigest()


def require(ok, message):
    if not ok:
        raise ValueError(message)


def regular(path):
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and not path.is_symlink(), 'regular file: ' + str(path))
    require(stat.S_IMODE(info.st_mode) == 0o644, 'permissions: ' + str(path))
    return path.read_bytes()


def authenticate(root, seal):
    raw = regular(root / PREFIX / 'trust.json')
    require(len(seal) == 64 and sha(raw) == seal, 'external protocol seal')
    proof = json.loads(raw)
    require(proof['decision'] == 'AUTHORIZED SEPARATE CLOSURE INVENTORY', 'authorization decision')
    require(proof['scope'] == 'H5-009/010 local/isolated' and proof['baseCommit'] == BASE, 'scope/base')
    require(sorted(e['path'] for e in proof['entries']) == sorted(PREFIX+n for n in NAMES), 'literal protocol paths')
    require({p.name for p in (root / PREFIX).iterdir()} == set(NAMES + ['trust.json']), 'unregistered protocol path')
    for entry in proof['entries'] + [proof['auditor']]:
        require(entry['type'] == 'regular' and entry['mode'] == '0644', 'entry type/mode')
        data = regular(root / entry['path'])
        require(len(data) == entry['bytes'] and sha(data) == entry['sha256'], 'sealed bytes: ' + entry['path'])
    require(proof['auditor']['path'] == AUDITOR and proof['auditor']['beforeSha256'] == BEFORE, 'exact auditor transition')
    original = subprocess.check_output(['git', 'show', BASE+':'+AUDITOR], cwd=root)
    require(sha(original) == BEFORE, 'Git predecessor')
    auth = json.loads(regular(root / PREFIX / 'authorization.json'))
    require(all(auth[k] == proof[k] for k in ['decision', 'scope', 'baseCommit']), 'authorization record')
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE, '--', C12, F16], cwd=root).decode().splitlines()
    for path in paths:
        old = subprocess.check_output(['git', 'show', BASE+':'+path], cwd=root)
        require(regular(root / path) == old, 'immutable predecessor dossier: ' + path)
    require(sha(regular(root / F16 / 'trust.json')) == F16_SEAL, 'original external F16 seal')
    require(sha(regular(root / C12 / 'final-inventory.json')) == C12_INVENTORY, 'original C12 inventory')
    return proof, paths


def historical_f16(root, dossier_paths):
    candidate = json.loads(regular(root / C12 / 'candidate.json'))
    paths = set(dossier_paths) | {e['path'] for e in candidate['inputs']} | {
        'tests/fixtures/h4-012-f16/preservation.json',
        'tests/fixtures/h5-009/f09/f16-comparison-full-postgres.json',
        'tests/integration/postgres-h4-012-f16.test.ts'}
    with tempfile.TemporaryDirectory(prefix='crm-closure-f16-history-') as temporary:
        target = Path(temporary)
        for path in sorted(paths):
            data = subprocess.check_output(['git', 'show', BASE+':'+path], cwd=root)
            if path != AUDITOR:
                require(regular(root / path) == data, 'historical input still preserved: ' + path)
            file = target / path
            file.parent.mkdir(parents=True, exist_ok=True)
            with file.open('xb') as sink:
                sink.write(data)
            file.chmod(0o644)
        env = dict(os.environ, GIT_DIR=subprocess.check_output(['git', 'rev-parse', '--absolute-git-dir'], cwd=root).decode().strip(), GIT_WORK_TREE=str(target), GIT_OPTIONAL_LOCKS='0')
        command = [sys.executable, '-B', F16+'verify.py', '--root', str(target), '--seal', F16_SEAL]
        result = subprocess.run(command, cwd=target, env=env, capture_output=True)
        require(result.returncode == 0, 'historical F16 verification: ' + result.stderr.decode())
        return {'context': 'Exact Git predecessor '+BASE, 'newPostgresExecution': False, 'result': json.loads(result.stdout)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[5])
    parser.add_argument('--seal', required=True, help='External reviewer seal; never derive from local trust.json')
    parser.add_argument('--historical-f16', action='store_true')
    parser.add_argument('--closure-seal', help='Separate external seal for the future closure inventory')
    args = parser.parse_args()
    root = args.root.resolve()
    proof, paths = authenticate(root, args.seal)
    history = historical_f16(root, paths) if args.historical_f16 else None
    env = dict(os.environ, GIT_OPTIONAL_LOCKS='0', F09_PROTOCOL_SHA256=args.seal,
               F16_TRUST_SHA256=F16_SEAL, C12_TRUST_SHA256=C12_SEAL,
               F09_INVENTORY_PATH=C12+'final-inventory.json', F09_INVENTORY_SHA256=C12_INVENTORY)
    env.pop('F09_CLOSURE_INVENTORY_SHA256', None)
    if args.closure_seal:
        env['F09_CLOSURE_INVENTORY_SHA256'] = args.closure_seal
    result = subprocess.run(['node', '--experimental-strip-types', AUDITOR], cwd=root, env=env, capture_output=True)
    require(result.returncode == 0, 'current preservation audit: ' + result.stderr.decode())
    output = result.stdout.decode()
    audit = json.loads(output[output.index('{'):])
    print(json.dumps({'status': 'PASS', 'scope': proof['scope'], 'protocolSeal': args.seal,
                      'auditorSha256': proof['auditor']['sha256'], 'historicalF16': history,
                      'currentPreservationAudit': audit, 'newPostgresExecution': False,
                      'resultsReattributed': False}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP: '+str(error), file=sys.stderr)
        sys.exit(1)
