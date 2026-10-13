"""Portable, offline F16 evidence audit. The reviewer supplies the trust seal.

No database is started. Archived comparisons are not new PostgreSQL executions.
All extraction and negative-probe writes occur in a fresh temporary directory.
"""
import argparse
import gzip
import hashlib
import importlib.util
import json
import os
from pathlib import Path, PurePosixPath
import stat
import subprocess
import sys
import tarfile
import tempfile

PREFIX = 'tests/fixtures/h5-009/f09/f16-20261013/'
C12 = 'tests/fixtures/h5-009/f09/c12-20261013/'
AUDITOR = 'scripts/verify-h5-008-evidence.mjs'
BEFORE = '6a744a03d5aa8598c4a3c5f7fdd90e5fa6c634012513f225341ca86f350b3afa'
PACKAGE = '0c6427cdc75dfba29c815140761cfc08ddb5522c376ec9f37e6f8a0124e9251a'
INVENTORY = '8d1bb36cc005406d88b716f98248db275f3e5e60b01e7d0b324e6f0816fa7255'
COMPARATOR = 'fd85642e0df6fd387781d813d0b0e2469efc5adb6ac95881b87430a82f80baf0'
C12_TRUST = 'eff6a0afc814707138913bdd3a2270e7458f5029d9569ce42d2b46bbe45f80f0'
C12_INVENTORY = '847ef52f945eb5eedf66f3ee58a07ccaf43967a40267b1d0097d58532e3c2ce9'
C12_ARCHIVE = '5c4c792a9580e78be0e4077598ddfe5196bc9974fce614db42653fe3eb8630db'
PRIOR_INPUT = 'e55e6b06fefcf3591eee71b02f96e5d2cafebbae8579fcbac93fce75908ed2c9'
BASE = 'eda8b0becb3daa2dff1baa02be53cec914750f13'
REQUIRED = {'authorization.json', 'auditor-before.mjs.gz', 'verification-evidence.tar.gz',
            'package-receipt.json', 'verify.py', 'README.md'}
OPTIONAL = {'portability-evidence.tar.gz'}
sha = lambda data: hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def regular(path):
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and not path.is_symlink(), 'regular file: ' + str(path))
    require(stat.S_IMODE(info.st_mode) == 0o644, 'permissions: ' + str(path))
    return path.read_bytes()


def matches(raw, entry):
    require(entry['type'] == 'regular' and entry['mode'] == '0644', 'declared type/mode')
    require(len(raw) == entry['bytes'] and sha(raw) == entry['sha256'], 'sealed bytes: ' + entry['path'])


def extract_regular(archive, destination):
    """Reject links, duplicates and escaping names; never use extractall."""
    with tarfile.open(archive, 'r:gz') as tar:
        seen = set()
        for member in tar:
            name = PurePosixPath(member.name)
            require(not name.is_absolute() and '..' not in name.parts, 'archive traversal')
            require(member.name not in seen, 'duplicate archive name')
            seen.add(member.name)
            require(member.isfile() and member.mode == 0o644, 'archive type/mode')
            target = destination.joinpath(*name.parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open('xb') as sink:
                sink.write(tar.extractfile(member).read())
            target.chmod(0o644)
    return seen


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[5])
    parser.add_argument('--seal', required=True, help='SHA-256 independently supplied by the reviewer')
    parser.add_argument('--auditor', action='store_true', help='also run the historical preservation auditor')
    args = parser.parse_args()
    root = args.root.resolve()
    folder = root / PREFIX
    raw = regular(folder / 'trust.json')
    require(len(args.seal) == 64 and sha(raw) == args.seal, 'external F16 trust seal')
    trust = json.loads(raw)
    require(trust['decision'] == 'AUTHORIZED REPRODUCIBLE F16 INCORPORATION', 'authorization decision')
    require(trust['scope'] == 'H5-009/010 local/isolated' and trust['baseCommit'] == BASE, 'scope/base')
    require(trust['priorCandidateInputSha256'] == PRIOR_INPUT, 'prior candidate identity')
    require(trust['c12TrustSha256'] == C12_TRUST, 'C12 trust reference')
    entries = trust['entries']
    names = [e['path'] for e in entries]
    require(len(names) == len(set(names)), 'unique supplemental paths')
    require({PREFIX+n for n in REQUIRED} <= set(names) <= {PREFIX+n for n in REQUIRED | OPTIONAL}, 'literal supplemental paths')
    actual = {p.name for p in folder.iterdir()}
    require(actual == {Path(n).name for n in names} | {'trust.json'}, 'unregistered supplemental path')
    for entry in entries:
        matches(regular(root / entry['path']), entry)
    auth = json.loads(regular(folder / 'authorization.json'))
    require(auth['decision'] == trust['decision'] and auth['scope'] == trust['scope'], 'human authorization record')
    require(trust['auditor']['path'] == AUDITOR and trust['auditor']['beforeSha256'] == BEFORE, 'one auditor transition')
    matches(regular(root / AUDITOR), trust['auditor'])
    before = gzip.decompress(regular(folder / 'auditor-before.mjs.gz'))
    require(len(before) == 48029 and sha(before) == BEFORE, 'frozen predecessor')
    require(sha(regular(root / C12 / 'trust.json')) == C12_TRUST, 'immutable C12 trust')
    require(sha(regular(root / C12 / 'final-inventory.json')) == C12_INVENTORY, 'immutable C12 inventory')
    c12trust = json.loads((root / C12 / 'trust.json').read_bytes())
    for entry in c12trust['entries']:
        data = before if entry['path'] == AUDITOR else regular(root / entry['path'])
        matches(data, entry)
        prior = subprocess.check_output(['git', 'show', BASE+':'+entry['path']], cwd=root)
        require(sha(prior) == entry['beforeSha256'], 'independent Git predecessor')
    candidate = json.loads(regular(root / C12 / 'candidate.json'))
    require(sha(json.dumps(candidate['inputs'], separators=(',', ':'), ensure_ascii=False).encode()) == PRIOR_INPUT, 'candidate input seal')
    for entry in candidate['inputs']:
        matches(before if entry['path'] == AUDITOR else regular(root / entry['path']), entry)
    require(sha(regular(folder / 'verification-evidence.tar.gz')) == PACKAGE, 'original F16 archive')
    require(sha(regular(root / C12 / 'verification-evidence.tar.gz')) == C12_ARCHIVE, 'original C12 archive')
    receipt = json.loads(regular(folder / 'package-receipt.json'))
    require(receipt['archiveSha256'] == PACKAGE and receipt['inventorySha256'] == INVENTORY, 'package receipt')
    with tempfile.TemporaryDirectory(prefix='crm-f16-portable-') as temporary:
        temp = Path(temporary)
        saved = temp / 'evidence'
        saved.mkdir()
        names = extract_regular(folder / 'verification-evidence.tar.gz', saved)
        require(sha(regular(saved / 'evidence-inventory.json')) == INVENTORY, 'original evidence inventory')
        inventory = json.loads((saved / 'evidence-inventory.json').read_bytes())
        require(names == {e['path'] for e in inventory['entries']} | {'evidence-inventory.json'}, 'exact archive inventory')
        for entry in inventory['entries']:
            matches(regular(saved / entry['path']), entry)
        require(sha(regular(saved / 'compare_f16.py')) == COMPARATOR, 'unchanged comparator')
        sys.dont_write_bytecode = True
        spec = importlib.util.spec_from_file_location('f16_archived', saved / 'compare_f16.py')
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        comparisons = {name: module.compare_run(root, saved / 'gates' / name / 'preservation')
                       for name in ['f16-focal', 'postgres-full']}
        # Run the ORIGINAL 43 probes unchanged. Their old relative input path is
        # materialized only inside this disposable sandbox from the sealed C12
        # archive; no private .git working files are read or required.
        sandbox = temp / 'probe-root'
        for name in ['tests/fixtures/h4-012-f16/preservation.json',
                     'tests/fixtures/h5-009/f09/f16-comparison-full-postgres.json',
                     'tests/integration/postgres-h4-012-f16.test.ts']:
            target = sandbox / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(regular(root / name))
        oldrun = sandbox / '.git/c12-authorized/20261012T233543Z'
        oldrun.mkdir(parents=True)
        extract_regular(root / C12 / 'verification-evidence.tar.gz', oldrun)
        probe = temp / 'probes'
        probe.mkdir()
        for name in ['compare_f16.py', 'counterproofs.py']:
            (probe / name).write_bytes(regular(saved / name))
        result = subprocess.run([sys.executable, '-B', str(probe / 'counterproofs.py')], cwd=sandbox, capture_output=True)
        require(result.returncode == 0, 'original counterproofs failed: ' + result.stderr.decode())
        probes = json.loads((probe / 'counterproofs.json').read_bytes())
        require(probes['status'] == 'PASS' and len(probes['rows']) == 43 and all(e['verified'] for e in probes['rows']), '43 expected probe outcomes')
        auditor = None
        if args.auditor:
            env = dict(os.environ, F16_TRUST_SHA256=args.seal, C12_TRUST_SHA256=C12_TRUST,
                       F09_INVENTORY_PATH=C12+'final-inventory.json', F09_INVENTORY_SHA256=C12_INVENTORY,
                       GIT_OPTIONAL_LOCKS='0')
            result = subprocess.run(['node', '--experimental-strip-types', AUDITOR], cwd=root, env=env, capture_output=True)
            require(result.returncode == 0, 'preservation auditor failed: ' + result.stderr.decode())
            output = result.stdout.decode()
            auditor = json.loads(output[output.index('{'):])
            require(auditor['f09OriginalLogs']['F09'] == 'OPEN' and auditor['f09OriginalLogs']['globalClosure'] == 'NOT VALIDATED', 'no closure accreditation')
        print(json.dumps(dict(status='PASS', scope=trust['scope'], trustSeal=args.seal,
                              originalPackageSha256=PACKAGE, comparatorSha256=COMPARATOR,
                              priorCandidateInputSha256=PRIOR_INPUT, currentAuditorSha256=trust['auditor']['sha256'],
                              priorExecutionsReattributed=False, newPostgresExecution=False,
                              comparisons=comparisons, counterproofs=probes,
                              independentPreservationAudit=auditor, F09='OPEN'), indent=2))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('STOP: ' + str(error), file=sys.stderr)
        sys.exit(1)
