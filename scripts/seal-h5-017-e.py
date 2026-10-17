"""Create deterministic, append-only E metadata after all current checks pass."""
from pathlib import Path
import gzip
import hashlib
import json
import stat
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests/fixtures/h5-017-e"
BASE = "9649a2773530ea8a43237b4e1f2034f80e34136f"
MIGRATION = "supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql"
sha = lambda data: hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()


def write_new(name, data):
    with (OUT / name).open("xb") as stream:
        stream.write(data)


def metadata(path):
    info = path.lstat()
    assert stat.S_ISREG(info.st_mode) and not path.is_symlink(), path
    return {"type": "file", "mode": oct(stat.S_IMODE(info.st_mode)),
            "bytes": info.st_size, "sha256": sha(path.read_bytes())}


for name in ["delta-inventory.json", "candidate-inventory.json.gz", "candidate-seal.json"]:
    assert not (OUT / name).exists(), ("NO_OVERWRITE", name)
preflight = json.loads(gzip.decompress((OUT / "preflight.json.gz").read_bytes()))
coverage = json.loads((OUT / "current-coverage.json").read_bytes())
final = json.loads((OUT / "final-verification.json").read_bytes())
assert preflight["base"] == BASE
assert len(preflight["files"]) == 37543
assert coverage["tests"] == coverage["pass"] == 2884
assert coverage["fail"] == coverage["cancelled"] == coverage["skipped"] == 0
assert coverage["reusedOutcomesForCurrentResult"] == 0
assert final["result"] == "PASS internal local verification"
assert final["materialFindingsPendingInternal"] == 0
assert final["fourthIndependentAudit"] == "PENDING"
for ref in ["HEAD", "main", "origin/main"]:
    assert subprocess.check_output(["git", "rev-parse", ref], cwd=ROOT).decode().strip() == BASE
assert subprocess.check_output(["git", "rev-list", "--left-right", "--count", "main...origin/main"], cwd=ROOT).decode().split() == ["0", "0"]
assert not subprocess.check_output(["git", "diff", "--cached", "--name-only"], cwd=ROOT)
subprocess.run(["git", "diff", "--check"], cwd=ROOT, check=True)
names = set(subprocess.check_output(["git", "ls-files", "-c", "-o", "--exclude-standard", "-z"], cwd=ROOT).decode().strip("\0").split("\0"))
files = {name: metadata(ROOT / name) for name in sorted(names)}
assert set(preflight["files"]) <= names
assert all(files[name] == value for name, value in preflight["files"].items())
assert files[MIGRATION]["sha256"] == coverage["migration67Sha256"] == "45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5"
new = {name: value for name, value in files.items() if name not in preflight["files"]}
excluded = ["tests/fixtures/h5-017-e/" + name for name in
            ["delta-inventory.json", "candidate-inventory.json.gz", "candidate-seal.json"]]
delta = {"candidate": "H5-017-E", "base": BASE,
         "comparison": "Exact received candidate D plus third independent audit",
         "predecessorFiles": 37543, "modifiedExistingFiles": [], "deletedExistingFiles": [],
         "newContentFiles": new, "selfMetadataExcluded": excluded,
         "newFilesIncludingSelfMetadata": len(new) + 3,
         "newMigrations": [MIGRATION], "existingProductFilesEdited": [],
         "newProductFiles": [MIGRATION],
         "metadataRule": "Delta excludes itself and final inventory/seal. Full inventory includes delta and excludes only inventory/seal to avoid a circular hash."}
delta_bytes = encoded(delta)
write_new("delta-inventory.json", delta_bytes)
files[excluded[0]] = metadata(OUT / "delta-inventory.json")
inventory_bytes = encoded({"candidate": "H5-017-E", "base": BASE,
                           "predecessorFiles": 37543, "files": files,
                           "selfMetadataExcluded": excluded[1:]})
compressed = gzip.compress(inventory_bytes, mtime=0)
write_new("candidate-inventory.json.gz", compressed)
seal = {"candidate": "H5-017-E", "dateEuropeMadrid": "2026-10-17", "base": BASE,
        "result": "PASS internal local/isolated verification",
        "candidateInventoryContentSha256": sha(inventory_bytes),
        "candidateInventoryGzipSha256": sha(compressed), "deltaInventorySha256": sha(delta_bytes),
        "candidateInventoriedFiles": len(files), "candidateTotalFiles": len(files) + 2,
        "predecessorFilesPreserved": 37543, "candidateDFilesPreserved": 37400,
        "thirdAuditFilesPreserved": 143, "newEFiles": len(new) + 3,
        "modifiedExistingFiles": 0, "deletedExistingFiles": 0,
        "candidateDContentSha256": "8fc37c4b13f114d3a689cac57d68a338df75b5602cb94cfc6b5211d9359b4912",
        "migration67": MIGRATION, "migration67Sha256": files[MIGRATION]["sha256"],
        "currentPostgresPass": 2884, "currentPostgresFail": 0,
        "currentPostgresCancelled": 0, "currentPostgresSkipped": 0,
        "currentPostgresFiles": 184, "currentPostgresDisjointPhases": 14,
        "reusedOutcomesForCurrentResult": 0, "focalPass": 63,
        "focalOverlapsFull": True, "newECases": 24, "unitPass": 208, "healthPass": 1,
        "productionDependencyVulnerabilities": 0, "materialDefectsPendingInternal": 0,
        "fourthIndependentAudit": "PENDING", "H5017": "IN PROGRESS", "H5018": "IN PROGRESS",
        "DM-PENDING-005": "OPEN", "publicationAuthorized": False,
        "committed": False, "pushed": False, "deployed": False, "indexEmpty": True,
        "data": "Synthetic local/isolated only", "state": "STOP; await fourth independent audit",
        "verificationCommand": "python3 scripts/verify-h5-017-e-seal.py",
        "reproducibility": "UTF-8 sorted JSON with two-space indentation and final newline; gzip mtime=0; exact paths, types, modes, sizes and SHA-256. Only self metadata excluded as declared."}
write_new("candidate-seal.json", encoded(seal))
print(json.dumps({"created": "H5-017-E", "files": seal["candidateTotalFiles"],
                  "newEFiles": seal["newEFiles"], "contentSha256": sha(inventory_bytes),
                  "verificationRequired": True}))
