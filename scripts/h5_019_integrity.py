"""Integrity primitives for the H5-019 documentary successor. No business authority."""
from pathlib import Path, PurePosixPath
import gzip
import hashlib
import json
import os
import re
import stat
import subprocess

BASE = '1e7822c11be817e4f2d4791338284aa825ad1a24'
TREE = 'bbc8b1f1219201a8425e55a5cde6ce873cdc4006'
ORIGINAL_PIN = 'aefd0f129e57e3324b5bc4a2ea0dd485bb340f1d57ff8810f209c0871bc00626'
AUDIT_PIN = '649565d21191f585d57038c4ef1ee9c3f86f817db8c32dbc92d820285af8a2ab'
OLD = 'tests/fixtures/h5-019/'
NEW = 'tests/fixtures/h5-019-corrective/'
INVENTORY = NEW + 'candidate-inventory.json.gz'
SEAL = NEW + 'candidate-seal.json'
EXCLUDED = [INVENTORY, SEAL]
META_KEYS = {'bytes', 'mode', 'sha256', 'type'}


def require(condition, cause):
    if not condition:
        raise ValueError(cause)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def pairs(items):
    out = {}
    for key, value in items:
        require(key not in out, 'DUPLICATE_JSON_KEY: ' + key)
        out[key] = value
    return out


def load(path):
    data = path.read_bytes()
    if path.suffix == '.gz':
        data = gzip.decompress(data)
    return json.loads(data, object_pairs_hook=pairs)


def write_new(path, value):
    data = (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + '\n').encode()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        stream.write(gzip.compress(data, mtime=0) if path.suffix == '.gz' else data)


def relpath(name):
    require(isinstance(name, str) and name and '\\' not in name and '\0' not in name, 'INVALID_PATH')
    p = PurePosixPath(name)
    require(not p.is_absolute() and str(p) == name and '..' not in p.parts and '.' not in p.parts, 'UNSAFE_PATH: ' + name)
    return p


def regular(root, name):
    relpath(name)
    p = root / name
    # No symlink is followed, even if its resolved destination is internal.
    for q in [p, *p.parents]:
        require(not q.is_symlink(), 'SYMLINK: ' + str(q))
        if q == root:
            break
    require(p.resolve().is_relative_to(root.resolve()) if hasattr(p, 'is_relative_to') else os.path.commonpath([p.resolve(), root.resolve()]) == str(root.resolve()), 'OUTSIDE_ROOT')
    require(stat.S_ISREG(p.lstat().st_mode), 'NOT_REGULAR: ' + name)
    return p


def meta(root, name):
    p = regular(root, name)
    before = p.stat()
    data = p.read_bytes()
    after = p.stat()
    require((before.st_ino, before.st_size, before.st_mtime_ns, before.st_mode) == (after.st_ino, after.st_size, after.st_mtime_ns, after.st_mode), 'WRITE_RACE: ' + name)
    return {'bytes': len(data), 'mode': stat.S_IMODE(after.st_mode), 'type': 'regular', 'sha256': digest(data)}


def keys(obj, expected, label):
    require(type(obj) is dict and set(obj) == set(expected), 'SCHEMA_KEYS: ' + label)


def valid_meta(m):
    keys(m, META_KEYS, 'file metadata')
    require(type(m['bytes']) is int and m['bytes'] >= 0, 'INVALID_SIZE')
    require(type(m['mode']) is int and 0 <= m['mode'] <= 0o777, 'INVALID_MODE')
    require(m['type'] == 'regular' and type(m['sha256']) is str and re.fullmatch('[0-9a-f]{64}', m['sha256']), 'INVALID_TYPE_OR_HASH')


def pinned(root, name, pin):
    require(type(pin) is str and re.fullmatch('[0-9a-f]{64}', pin), 'EXTERNAL_PIN_REQUIRED')
    path = regular(root, name)
    require(digest(path.read_bytes()) == pin, 'EXTERNAL_HASH_MISMATCH: ' + name)
    return load(path)


def audit_reference(audit_root, external_pin):
    require(external_pin == AUDIT_PIN, 'AUDIT_NOT_RECOGNIZED')
    seal = pinned(audit_root, 'AUDIT-SEAL.json', external_pin)
    inv = pinned(audit_root, 'AUDIT-INVENTORY.json', seal['inventorySha256'])
    require(seal['candidateSealSha256'] == ORIGINAL_PIN and seal['verdict'] == 'PASS' and seal['auditArtifactsIncludingSelf'] == 152, 'AUDIT_IDENTITY')
    require(inv['selfMetadataExcluded'] == ['AUDIT-INVENTORY.json', 'AUDIT-SEAL.json'] and len(inv['files']) == 150, 'AUDIT_SCOPE')
    for n, m in inv['files'].items():
        actual = meta(audit_root, n)
        require({k: actual[k] for k in m} == m, 'AUDIT_CHANGED: ' + n)
    return load(audit_root / 'evidence/independent-normative-matrix.json')


def git(root, *args):
    return subprocess.check_output(['git', *args], cwd=root).decode().strip()


def universe(root):
    raw = subprocess.check_output(['git', 'ls-files', '-c', '-o', '--exclude-standard', '-z'], cwd=root)
    return set(filter(None, raw.decode().split('\0')))


def base_check(root):
    require(all(git(root, 'rev-parse', n) == BASE for n in ['HEAD', 'main', 'origin/main']), 'GIT_BASE')
    require(git(root, 'rev-parse', 'HEAD^{tree}') == TREE and git(root, 'branch', '--show-current') == 'main', 'GIT_TREE_BRANCH')
    require(not git(root, 'diff', '--name-only') and not git(root, 'diff', '--cached', '--name-only'), 'GIT_DIRTY_PUBLISHED_OR_INDEX')
    require(git(root, 'rev-list', '--left-right', '--count', 'main...origin/main').split() == ['0', '0'], 'GIT_DIVERGENCE')
    # The original seal is an independent immutable predecessor, not the successor seal.
    old_seal = pinned(root, OLD + 'candidate-seal.json', ORIGINAL_PIN)
    old_inv = pinned(root, OLD + 'candidate-inventory.json', old_seal['inventorySha256'])
    baseline = pinned(root, OLD + 'received-inventory.json.gz', old_seal['receivedInventoryGzipSha256'])
    require(len(baseline['files']) == 38524 and baseline['base'] == BASE and baseline['tree'] == TREE, 'BASELINE_SCOPE')
    changed = {'scripts/verify-h5-019.py', 'scripts/consolidate-h5-019.py'}
    for n, m in {**baseline['files'], **old_inv['files']}.items():
        path = n
        if n in changed:
            path = NEW + 'original-instruments/' + Path(n).name
        actual = meta(root, path)
        require({k: actual[k] for k in m} == m, 'PROTECTED_PREDECESSOR_CHANGED: ' + n)
    require(len(old_inv['files']) == 120, 'ORIGINAL_122_SCOPE')
    # Git raw objects independently establish published bytes and executable bit.
    for item in filter(None, subprocess.check_output(['git', 'ls-tree', '-rz', 'HEAD'], cwd=root).split(b'\0')):
        head, name = item.split(b'\t'); mode, kind, oid = head.decode().split(); n = name.decode()
        data = (root / n).read_bytes()
        require(kind == 'blob' and hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == oid, 'PUBLISHED_BLOB_CHANGED: ' + n)
        require(bool(int(mode, 8) & 0o111) == bool((root / n).stat().st_mode & 0o111), 'PUBLISHED_EXECUTABLE_BIT')
    return baseline, old_inv
