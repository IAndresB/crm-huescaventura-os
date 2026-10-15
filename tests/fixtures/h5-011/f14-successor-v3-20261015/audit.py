"""F14 internal preservation auditor; execute only through authenticated verify.py.

Direct output is not an independent authentication receipt. The launcher owns
authentication and supplies an already externally authenticated record on stdin.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile

PREFIX = 'tests/fixtures/h5-011/f14-successor-v3-20261015/'
GUARD = 'tests/support/h5-006-dependency-preservation.ts'
FIXTURE = 'tests/support/h4-modification-fixtures.ts'
RECORD = 'tests/fixtures/h5-011/f14-v3-applied-20261015/transition.authorized.json'
PARENT_FIXTURE = '5cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2'
PARENT_GUARD = '722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2'
PARENT_SEAL = 'bfc239e6f462d9aaef0a8700ef4e4777504efedb781aebe0a70be68cdb44f17d'
EXPECTED = 'specs/001-core-crm/expected-TSK-H5-011-012.md'
BASE = '71906987f9b74241cc4583e51498759829cded73'
HEAD = '1346dd64ec2e9e804be23b17ea5f62f64515339c'
OLD_FIXTURE = '7739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed'
NEW_FIXTURE = '1dd453597648051e727efd2d394f2e248ab50fed3ed81e046ef7ba95fbe8d01b'
OLD_GUARD = '8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5'
NEW_GUARD = '8c0aeab42167b9a6f8c819d35311de2455ca70040754a8a93b77120abbeb7ade'
EXPECTED_HASH = '669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b'
INFORMATION = {
    'tests/fixtures/h5-011/f14-successor-review-20261015/preflight.json',
    'tests/fixtures/h5-011/f14-successor-review-20261015/preparation.json',
    'tests/fixtures/h5-011/f14-successor-review-20261015/preparation.log',
    'tests/fixtures/h5-011/f14-successor-review-20261015/approval-request.md',
    'tests/fixtures/h5-011/f14-successor-review-20261015/delivery-inventory.json',
}
sha = lambda data: hashlib.sha256(data).hexdigest()


def require(ok, message):
    if not ok:
        raise ValueError(message)


def regular(root, name, mode='0644'):
    path = PurePosixPath(name)
    require(not path.is_absolute() and str(path) == name and
            all(p not in ('', '.', '..') for p in path.parts), 'invalid relative path')
    current = root
    for part in path.parts:
        current = current / part
        require(not current.is_symlink(), 'symlink: ' + name)
    info = current.lstat()
    require(stat.S_ISREG(info.st_mode), 'not regular: ' + name)
    require(stat.S_IMODE(info.st_mode) == int(mode, 8), 'mode: ' + name)
    return current.read_bytes()


def git(root, *args):
    return subprocess.check_output(['git', *args], cwd=root)


def tree(root):
    result = []
    for row in git(root, 'ls-tree', '-r', '-z', HEAD).split(b'\0'):
        if row:
            meta, path = row.split(b'\t', 1)
            mode, kind, oid = meta.decode().split()
            require(kind == 'blob' and mode in ('100644', '100755'), 'unsupported tracked type')
            result.append({'path': path.decode(), 'gitMode': mode, 'gitBlob': oid})
    return result


def current_preservation(root, proof, phase):
    manifest_entry = next(e for e in proof['entries'] if e['path'] == PREFIX + 'manifest.json')
    raw = regular(root, manifest_entry['path'])
    require(sha(raw) == manifest_entry['sha256'], 'authenticated manifest changed')
    manifest = json.loads(raw)
    require(manifest['headCommit'] == HEAD and manifest['baseCommit'] == BASE, 'manifest predecessors')
    require(git(root, 'rev-parse', 'HEAD').decode().strip() == HEAD, 'HEAD changed')
    require(git(root, 'branch', '--show-current').decode().strip() == 'main', 'branch changed')
    require(git(root, 'rev-parse', 'origin/main').decode().strip() == BASE, 'published origin/main changed')
    require(git(root, 'rev-list', '--left-right', '--count', 'HEAD...origin/main').decode().split() == ['1', '0'], 'divergence changed')
    require(git(root, 'remote', 'get-url', 'origin').decode().strip() in ('git@github.com:IAndresB/crm-huescaventura-os.git', 'https://github.com/IAndresB/crm-huescaventura-os.git'), 'origin repository changed')
    require(git(root, 'diff', '--cached', '--name-only') == b'', 'index is not empty')
    require(git(root, 'merge-base', BASE, HEAD).decode().strip() == BASE, 'published base ancestry')
    require([{k: e[k] for k in ('path', 'gitMode', 'gitBlob')} for e in manifest['tracked']] ==
            tree(root), 'tracked inventory does not match authenticated Git HEAD')
    require(sha(git(root, 'show', BASE + ':' + FIXTURE)) == OLD_FIXTURE, 'fixture Git predecessor')
    require(sha(git(root, 'show', BASE + ':' + GUARD)) == OLD_GUARD, 'guard Git predecessor')
    require(sha(regular(root, PREFIX + 'guard-before.ts.txt')) == PARENT_GUARD, 'guard V2 predecessor archive')
    require(sha(regular(root, PREFIX + 'guard.candidate.ts.txt')) == NEW_GUARD, 'guard candidate archive')
    for entry in manifest['tracked']:
        data = regular(root, entry['path'], entry['mode'])
        if entry['path'] == FIXTURE:
            require(entry['sha256'] == OLD_FIXTURE, 'immutable original fixture hash')
            require(sha(data) == (NEW_FIXTURE if phase == 'applied' else PARENT_FIXTURE), 'fixture phase/exact hash')
        elif entry['path'] == GUARD:
            require(entry['sha256'] == OLD_GUARD, 'immutable original guard hash')
            require(sha(data) == (NEW_GUARD if phase == 'applied' else PARENT_GUARD), 'guard phase/hash')
        else:
            require(len(data) == entry['bytes'] and sha(data) == entry['sha256'],
                    'historical tracked bytes changed: ' + entry['path'])
        # Cross-check each historical manifest digest with its actual Git blob ID.
        if entry['path'] not in (FIXTURE, GUARD):
            blob = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
            require(blob == entry['gitBlob'], 'Git blob identity: ' + entry['path'])
    expected = regular(root, EXPECTED)
    require(len(expected) == 67346 and sha(expected) == EXPECTED_HASH, 'frozen expected changed')
    for entry in manifest['untracked']:
        data = regular(root, entry['path'], entry['mode'])
        if entry.get('appendOnly'):
            require(len(data) >= entry['bytes'] and sha(data[:entry['bytes']]) == entry['sha256'],
                    'historical evidence document overwritten: ' + entry['path'])
        else:
            require(len(data) == entry['bytes'] and sha(data) == entry['sha256'],
                    'H5-011 input/evidence changed: ' + entry['path'])
    literal = regular(root, PREFIX + 'transition.record.candidate.json')
    require(proof['fixtureTransition'] == json.loads(literal), 'sealed transition metadata differs')
    require(proof['guardTransition'] == {'path': GUARD, 'historicalSha256': OLD_GUARD, 'previousSha256': PARENT_GUARD, 'candidateSha256': NEW_GUARD}, 'sealed guard metadata differs')
    require(sha(regular(root, 'tests/fixtures/h5-011/f14-successor-20261015/trust.json')) == PARENT_SEAL, 'V2 externally accepted predecessor seal')
    require(sha(regular(root, PREFIX + 'fixture-before.ts.txt')) == PARENT_FIXTURE, 'fixture V2 archive')
    require(sha(regular(root, PREFIX + 'fixture.candidate.ts.txt')) == NEW_FIXTURE, 'fixture V3 archive')
    if phase == 'applied':
        require(regular(root, RECORD) == literal, 'exact F14 authorization record')
    else:
        require(not (root / RECORD).exists(), 'premature F14 authorization record')
    permitted = {e['path'] for e in manifest['tracked'] + manifest['untracked']}
    permitted |= {e['path'] for e in proof['entries']} | {PREFIX + 'trust.json'}
    if phase == 'applied':
        permitted.add(RECORD)
    information = set(manifest['informationalPaths'])
    require(information == INFORMATION, 'informational paths must be literal reports')
    runs_prefix = 'tests/fixtures/h5-011/f14-v3-runs/'
    for path in git(root, 'ls-files', '--cached', '--others', '--exclude-standard', '-z').decode().split('\0'):
        if not path or path in permitted:
            continue
        # These are non-executable reports only, never authentication inputs.
        if path in information or (path.startswith(runs_prefix) and
                re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*\.(?:json|log|log\.gz)', path[len(runs_prefix):])):
            regular(root, path)
            continue
        raise ValueError('unlisted current path: ' + path)
    if phase == 'preapply':
        for patch in ('fixture-transition.diff', 'guard-transition.diff'):
            checked = subprocess.run(['git', 'apply', '--check', '--', str(root / PREFIX / patch)], cwd=root, capture_output=True)
            require(checked.returncode == 0, 'exact patch preapply: ' + patch)
    return {'trackedPreservedOrExactTransition': len(manifest['tracked']),
            'H5_011InputsAndPriorEvidence': len(manifest['untracked']),
            'phase': phase, 'expectedIntact': True,
            'functionalAcceptance': 'NOT ESTABLISHED BY PRESERVATION AUDIT'}


def historical(root, proof):
    previous = proof['historical']
    for name, key in [('tests/fixtures/h5-009/f09/closure-protocol-20261013/trust.json', 'protocolSeal'),
                      ('tests/fixtures/h5-009/f09/c12-20261013/closure-inventory.json', 'closureSeal')]:
        require(sha(git(root, 'show', BASE + ':' + name)) == previous[key], 'published historical seal')
    with tempfile.TemporaryDirectory(prefix='crm-f14-historical-') as temporary:
        target = Path(temporary) / 'repo'
        env = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
        for key in ('GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR'):
            env.pop(key, None)
        subprocess.run(['git', 'clone', '--shared', '--quiet', '--no-checkout', '--', str(root), str(target)],
                       check=True, env=env, capture_output=True)
        subprocess.run(['git', 'checkout', '--quiet', '--detach', BASE], cwd=target,
                       check=True, env=env, capture_output=True)
        require(git(target, 'rev-parse', 'HEAD').decode().strip() == BASE, 'historical snapshot HEAD')
        # Physical dependency directory: the published node_modules/ ignore rule
        # does not cover a directory symlink. Preserve internal package symlinks.
        require((root / 'node_modules').is_dir(), 'historical auditor dependencies unavailable')
        shutil.copytree(root / 'node_modules', target / 'node_modules', symlinks=True)
        command = [sys.executable, '-B', 'tests/fixtures/h5-009/f09/closure-protocol-20261013/verify.py',
                   '--seal', previous['protocolSeal'], '--closure-seal', previous['closureSeal'], '--historical-f16']
        result = subprocess.run(command, cwd=target, env=env, text=True, capture_output=True)
        require(result.returncode == 0, 'historical F09/F16 audit failed: ' + result.stderr)
        return {'snapshot': BASE, 'newPostgresExecution': False,
                'resultsReattributed': False, 'report': json.loads(result.stdout)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', required=True, type=Path)
    parser.add_argument('--phase', required=True, choices=['preapply', 'applied'])
    args = parser.parse_args()
    context = json.load(sys.stdin)
    proof = context['trust']
    root = args.root.resolve()
    require(proof['baseCommit'] == BASE and proof['headCommit'] == HEAD, 'authenticated context')
    current = current_preservation(root, proof, args.phase)
    negatives = history = None
    if args.phase == 'applied':
        env = dict(os.environ, F14_PYTHON_EXECUTABLE=sys.executable)
        result = subprocess.run(['node', '--experimental-strip-types', PREFIX + 'counterproofs.mjs',
                                 str(root), context['externalSeal']], cwd=root, env=env,
                                text=True, capture_output=True)
        require(result.returncode == 0, 'F14 counterproofs failed: ' + result.stderr)
        negatives = json.loads(result.stdout)
        history = historical(root, proof)
    # Detect accidental mutations by historical verification or counterproofs.
    require(current_preservation(root, proof, args.phase) == current, 'inputs changed during audit')
    print(json.dumps({'status': 'INTERNAL PRESERVATION CHECKS PASS',
                      'requiresAuthenticatedLauncherReceipt': True,
                      'current': current, 'counterproofs': negatives,
                      'historicalF09F16': history, 'newFunctionalRegression': False}, indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP: ' + str(error), file=sys.stderr)
        sys.exit(1)
