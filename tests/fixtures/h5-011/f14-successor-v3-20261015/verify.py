"""F14 successor launcher. Requires an externally reviewed trust.json seal.

Before invoking this file, the reviewer must independently verify its own bytes
against the externally sealed trust record, as documented in README.md.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import stat
import subprocess
import sys

PREFIX = 'tests/fixtures/h5-011/f14-successor-v3-20261015/'
NAMES = {'README.md', 'guard-before.ts.txt', 'guard.candidate.ts.txt',
         'guard-transition.diff', 'transition.record.candidate.json',
         'manifest.json', 'verify.py', 'audit.py', 'counterproofs.mjs',
         'fixture-before.ts.txt', 'fixture.candidate.ts.txt', 'fixture-transition.diff'}
HEAD = '1346dd64ec2e9e804be23b17ea5f62f64515339c'
BASE = '71906987f9b74241cc4583e51498759829cded73'


def require(ok, message):
    if not ok:
        raise ValueError('AUTHENTICATION: ' + message)


def regular(root, name):
    path = PurePosixPath(name)
    require(not path.is_absolute() and str(path) == name and
            all(p not in ('', '.', '..') for p in path.parts), 'literal relative path')
    current = root
    for part in path.parts:
        current = current / part
        require(not current.is_symlink(), 'symlink: ' + name)
    info = current.lstat()
    require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644,
            'regular file mode0644: ' + name)
    return current.read_bytes()


def authenticate(root, seal):
    require(re.fullmatch('[a-f0-9]{64}', seal) is not None, 'external seal format')
    raw = regular(root, PREFIX + 'trust.json')
    require(hashlib.sha256(raw).hexdigest() == seal, 'external successor seal')
    proof = json.loads(raw)
    require(proof['decision'] == 'F14 EXACT SUCCESSOR SUBJECT TO EXTERNAL SEAL', 'decision')
    require(proof['scope'] == 'H5-011-F14 local/isolated', 'scope')
    require(proof['baseCommit'] == BASE and proof['headCommit'] == HEAD, 'predecessors')
    require(proof['auditorPath'] == PREFIX + 'audit.py' and
            proof['launcherPath'] == PREFIX + 'verify.py', 'auditor/launcher paths')
    require(len(proof['entries']) == len(NAMES), 'entry count')
    require(sorted(e['path'] for e in proof['entries']) ==
            sorted(PREFIX + n for n in NAMES), 'literal unique paths')
    require({p.name for p in (root / PREFIX).iterdir()} == NAMES | {'trust.json'},
            'unregistered dossier file')
    for entry in proof['entries']:
        require(entry['type'] == 'regular' and entry['mode'] == '0644', 'entry metadata')
        data = regular(root, entry['path'])
        require(len(data) == entry['bytes'] and
                hashlib.sha256(data).hexdigest() == entry['sha256'],
                'sealed bytes: ' + entry['path'])
    return proof


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[4])
    parser.add_argument('--seal', required=True, help='Seal supplied independently by the reviewer')
    parser.add_argument('--phase', choices=['preapply', 'applied'], default='preapply')
    args = parser.parse_args()
    root = args.root.resolve()
    proof = authenticate(root, args.seal)
    # No candidate import, execution or mutation occurs before authentication.
    result = subprocess.run([sys.executable, '-B', str(root / proof['auditorPath']),
                             '--root', str(root), '--phase', args.phase],
                            input=json.dumps({'trust': proof, 'externalSeal': args.seal}),
                            text=True, capture_output=True, cwd=root)
    require(result.returncode == 0, 'successor audit failed: ' + result.stderr)
    # Recheck all authenticated bytes after the child returns.
    require(authenticate(root, args.seal) == proof, 'dossier changed during audit')
    print(json.dumps({'status': 'PASS', 'phase': args.phase,
                      'externalSuccessorSeal': args.seal,
                      'audit': json.loads(result.stdout),
                      'newFunctionalRegression': False,
                      'H5_012_started': False}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP: ' + str(error), file=sys.stderr)
        sys.exit(1)
