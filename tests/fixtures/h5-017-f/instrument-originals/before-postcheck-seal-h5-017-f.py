"""Create append-only F inventories only after current checks and preservation pass."""
from pathlib import Path
import gzip
import hashlib
import json
import stat
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests/fixtures/h5-017-f"
BASE = "9649a2773530ea8a43237b4e1f2034f80e34136f"
MIGRATION = "supabase/migrations/20261017004525_h5_diagnostic_version_provenance_replay.sql"
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
subprocess.run([sys.executable, str(ROOT / "scripts/verify-h5-017-f-preservation-v2.py")], cwd=ROOT, check=True)
received = json.loads(gzip.decompress((OUT / "received-inventory.json.gz").read_bytes()))
coverage = json.loads((OUT / "current-coverage.json").read_bytes())
final = json.loads((OUT / "final-verification.json").read_bytes())
assert len(received["files"]) == 37874
assert coverage["complete"] == {"tests": 2920, "pass": 2920, "fail": 0, "cancelled": 0,
                                "skipped": 0, "files": 192, "disjointPhases": 15}
assert coverage["historicalOutcomesReused"] == coverage["knownMaterialDefectsOpen"] == 0
assert final["result"] == "PASS internal; fifth independent audit pending"
assert len(final["captures"]) == 22
assert final["H5017"] == final["H5018"] == "IN PROGRESS"
assert final["DM-PENDING-005"] == "OPEN"
names = set(subprocess.check_output(["git", "ls-files", "-c", "-o", "--exclude-standard", "-z"], cwd=ROOT).decode().strip("\0").split("\0"))
files = {name: metadata(ROOT / name) for name in sorted(names)}
assert set(received["files"]) <= names
assert all(files[name] == value for name, value in received["files"].items())
inputs = json.loads((OUT / "candidate-inputs-final-v2.json").read_bytes())["files"]
assert all(files[name]["sha256"] == digest for name, digest in inputs.items())
assert files[MIGRATION]["sha256"] == "69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563"
migrations = sorted(name for name in files if name.startswith("supabase/migrations/") and name.endswith(".sql"))
assert len(migrations) == 68 and migrations[-1] == MIGRATION
new = {name: value for name, value in files.items() if name not in received["files"]}
excluded = ["tests/fixtures/h5-017-f/" + name for name in
            ["delta-inventory.json", "candidate-inventory.json.gz", "candidate-seal.json"]]
delta = {"candidate": "H5-017-F", "base": BASE,
         "comparison": "Exact received candidate E plus fourth independent audit",
         "predecessorFiles": 37874, "modifiedExistingFiles": [], "deletedExistingFiles": [],
         "newContentFiles": new, "selfMetadataExcluded": excluded,
         "newFilesIncludingSelfMetadata": len(new) + 3,
         "newMigrations": [MIGRATION], "existingProductFilesEdited": [],
         "newProductFiles": [MIGRATION],
         "metadataRule": "Delta excludes itself and final inventory/seal. Full inventory includes delta and excludes only inventory/seal to avoid a circular hash."}
delta_bytes = encoded(delta)
write_new("delta-inventory.json", delta_bytes)
files[excluded[0]] = metadata(OUT / "delta-inventory.json")
inventory_bytes = encoded({"candidate": "H5-017-F", "base": BASE,
                           "predecessorFiles": 37874, "files": files,
                           "selfMetadataExcluded": excluded[1:]})
compressed = gzip.compress(inventory_bytes, mtime=0)
write_new("candidate-inventory.json.gz", compressed)
seal = {"candidate": "H5-017-F", "dateEuropeMadrid": "2026-10-17", "base": BASE,
        "result": "PASS internal local/isolated verification",
        "candidateInventoryContentSha256": sha(inventory_bytes),
        "candidateInventoryGzipSha256": sha(compressed), "deltaInventorySha256": sha(delta_bytes),
        "candidateInventoriedFiles": len(files), "candidateTotalFiles": len(files) + 2,
        "predecessorFilesPreserved": 37874, "candidateEFilesPreserved": 37758,
        "fourthAuditFilesPreserved": 116, "newFFiles": len(new) + 3,
        "modifiedExistingFiles": 0, "deletedExistingFiles": 0,
        "candidateEContentSha256": "0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191",
        "fourthAuditInventorySha256": "b921a9a6f4cf2e48723112267e8b6aa589411a69833aee3fea6bdb395d701e58",
        "receivedInventoryContentSha256": sha(gzip.decompress((OUT / "received-inventory.json.gz").read_bytes())),
        "migration68": MIGRATION, "migration68Sha256": files[MIGRATION]["sha256"],
        "migrations1to67Preserved": True, "productChanges": "3 existing function bodies only",
        "currentPostgresPass": 2920, "currentPostgresFail": 0,
        "currentPostgresCancelled": 0, "currentPostgresSkipped": 0,
        "currentPostgresFiles": 192, "currentPostgresDisjointPhases": 15,
        "reusedOutcomesForCurrentResult": 0, "focalPass": 78,
        "focalOverlapsFull": True, "newFCases": 19, "sevenOriginalFailuresNowPass": 7,
        "unitPass": 208, "healthPass": 1,
        "productionDependencyVulnerabilities": 0, "materialDefectsPendingInternal": 0,
        "fifthIndependentAudit": "PENDING", "H5017": "IN PROGRESS", "H5018": "IN PROGRESS",
        "DM-PENDING-005": "OPEN", "publicationAuthorized": False,
        "committed": False, "pushed": False, "deployed": False, "indexEmpty": True,
        "data": "Synthetic local/isolated only", "state": "STOP; await fifth independent audit",
        "verificationCommand": "python3 scripts/verify-h5-017-f-seal.py",
        "reproducibility": "UTF-8 sorted JSON with two-space indentation and final newline; gzip mtime=0; exact paths, types, modes, sizes and SHA-256. Only self metadata excluded as declared.",
        "integrityIncident": "Supabase CLI version-cache refresh restored to exact received bytes; cli-cache-restoration.json preserves event. No final predecessor delta."}
write_new("candidate-seal.json", encoded(seal))
print(json.dumps({"created": "H5-017-F", "files": seal["candidateTotalFiles"],
                  "newFFiles": seal["newFFiles"], "contentSha256": sha(inventory_bytes),
                  "verificationRequired": True}))
