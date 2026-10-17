"""Read-only verification of the third audit and its unchanged D candidate."""
from pathlib import Path
import gzip
import hashlib
import json
import stat
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "tests/fixtures/h5-018-third"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def metadata(path):
    value = path.lstat()
    assert stat.S_ISREG(value.st_mode) and not path.is_symlink(), str(path)
    return {
        "type": "file",
        "bytes": value.st_size,
        "mode": oct(stat.S_IMODE(value.st_mode)),
        "sha256": sha(path.read_bytes()),
    }


seal = json.loads((AUDIT / "audit-seal.json").read_bytes())
raw_inventory = (AUDIT / "audit-inventory.json").read_bytes()
assert sha(raw_inventory) == seal["inventorySha256"]
inventory = json.loads(raw_inventory)
preflight = json.loads(gzip.decompress((AUDIT / "preflight.json.gz").read_bytes()))
assert seal["result"] == inventory["result"] == "FAIL"
assert seal["materialDefects"] == 2
assert seal["candidateFilesPreserved"] == len(preflight["files"]) == 37400
assert seal["candidateInventorySha256"] == preflight["candidateInventorySha256"]
assert seal["candidateSealSha256"] == preflight["candidateSealSha256"]
assert seal["auditorInventoriedFiles"] == len(inventory["files"])
assert seal["auditorFilesIncludingSelfMetadata"] == len(inventory["files"]) + 2
for name, expected in inventory["files"].items():
    assert metadata(ROOT / name) == expected, ("AUDIT_CHANGED", name)
names = set(subprocess.check_output(
    ["git", "ls-files", "-c", "-o", "--exclude-standard", "-z"], cwd=ROOT
).decode().strip("\0").split("\0"))
self_metadata = {str((AUDIT / name).relative_to(ROOT)) for name in
                 ["audit-inventory.json", "audit-seal.json"]}
assert not set(preflight["files"]) & set(inventory["files"])
assert names == set(preflight["files"]) | set(inventory["files"]) | self_metadata
subprocess.run([sys.executable, str(ROOT / "scripts/verify-h5-018-third-preservation.py")],
               cwd=ROOT, check=True)
print(json.dumps({"verification": "PASS integrity", "auditVerdict": "FAIL",
                  "candidateFilesPreserved": 37400,
                  "auditorFilesIncludingSelfMetadata": len(inventory["files"]) + 2,
                  "inventorySha256": seal["inventorySha256"]}))
