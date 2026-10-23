"""Copy only receipt-referenced synthetic resources; never emit payloads."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess

os.umask(0o077)
WORK = Path(__file__).resolve().parents[1]
OUTPUT = WORK / 'tests/fixtures/h6-015-pg17-corrective'
ROOT = Path('/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-pg17')
SOURCES = [
    Path('/Users/andres/.codex/worktrees/h6-restore-execution/crm-huescaventura-os/tests/fixtures/h6-015-execution'),
    Path('/Users/andres/.codex/worktrees/h6-restore-audit/crm-huescaventura-os/tests/fixtures/h6-015-execution'),
    Path('/Users/andres/.codex/worktrees/h6-restore-audit/crm-huescaventura-os/tests/fixtures/h6-015-independent-preparation'),
]


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def main():
    assert not ROOT.exists(), 'NEW_CUSTODY_DESTINATION_REQUIRED'
    roots = set()

    def walk(value):
        if isinstance(value, dict):
            for key, item in value.items():
                if key in ('privateRoot', 'sourceRoot', 'runtimeRoot') and isinstance(item, str) and item.startswith('/tmp/h6015-'):
                    roots.add(item)
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    for source in SOURCES:
        for file in source.rglob('*.json'):
            walk(json.loads(file.read_text()))
    for directory in [ROOT.parents[1], ROOT.parent, ROOT]:
        directory.mkdir(mode=0o700, exist_ok=directory != ROOT)
        assert directory.stat().st_uid == os.getuid() and not directory.is_symlink()
        os.chmod(directory, 0o700)
    assert 'CloudStorage' not in str(ROOT.resolve()) and ROOT.resolve() == ROOT
    private_rows, public_rows = [], []
    for raw in sorted(roots):
        source = Path(raw)
        assert source.exists() and not source.is_symlink()
        assert source.stat().st_uid == os.getuid()
        assert not list(source.rglob('postmaster.pid')), 'LIVE_RESOURCE_NOT_COPIED'
        destination = ROOT / source.name
        destination.mkdir(mode=0o700)
        count = total = 0
        for file in sorted(source.rglob('*')):
            info = file.lstat()
            assert not stat.S_ISLNK(info.st_mode), 'SYMLINK_NOT_COPIED'
            assert info.st_uid == os.getuid()
            target = destination / file.relative_to(source)
            if stat.S_ISDIR(info.st_mode):
                target.mkdir(mode=0o700)
            else:
                assert stat.S_ISREG(info.st_mode), 'SPECIAL_FILE_NOT_COPIED'
                before = digest(file)
                shutil.copyfile(file, target)
                os.chmod(target, 0o600)
                assert before == digest(target) == digest(file)
                assert target.stat().st_size == info.st_size
                private_rows.append({'source': str(file), 'destination': str(target), 'bytes': info.st_size, 'sha256': before})
                count += 1
                total += info.st_size
        public_rows.append({'sourceRoot': raw, 'custodyRoot': str(destination), 'files': count, 'bytes': total})
    inventory = ROOT / 'private-inventory.json'
    inventory.write_text(json.dumps(private_rows, indent=2) + '\n')
    os.chmod(inventory, 0o600)
    # No inherited or explicit allow ACLs: ordinary owner-only modes are insufficient otherwise.
    for file in [ROOT, *ROOT.rglob('*')]:
        info = file.lstat()
        assert info.st_uid == os.getuid()
        assert stat.S_IMODE(info.st_mode) == (0o700 if file.is_dir() else 0o600)
        acl = subprocess.run(['/bin/ls', '-lde', str(file)], capture_output=True, text=True, check=True).stdout
        assert not any(' allow ' in line for line in acl.splitlines()[1:]), 'ACL_REVIEW_REQUIRED'
    for row in private_rows:
        assert digest(Path(row['destination'])) == row['sha256'] == digest(Path(row['source']))
    receipt = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'state': 'PASS_PERSISTENT_LOCAL_CUSTODY', 'root': str(ROOT), 'privateInventorySHA256': digest(inventory), 'resources': public_rows, 'files': len(private_rows), 'bytes': sum(x['bytes'] for x in private_rows), 'directoriesMode': '0700', 'filesMode': '0600', 'allowACLs': False, 'originalsDeleted': False, 'privateValuesExported': False, 'scriptSHA256': digest(Path(__file__))}
    (OUTPUT / 'custody-receipt-v1.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({k: receipt[k] for k in ['state', 'files', 'bytes', 'privateInventorySHA256']}))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'state': 'FAIL_PRESERVED', 'exceptionClass': type(error).__name__}))
        raise SystemExit(1)
