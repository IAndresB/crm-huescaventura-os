"""Read-only verification of the entire F candidate, delta and protected predecessors."""
from pathlib import Path
import gzip
import hashlib
import json
import stat
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests/fixtures/h5-017-f"
sha = lambda data: hashlib.sha256(data).hexdigest()
seal_bytes = (OUT / "candidate-seal.json").read_bytes()
seal = json.loads(seal_bytes)
compressed = (OUT / "candidate-inventory.json.gz").read_bytes()
raw = gzip.decompress(compressed)
assert sha(raw) == seal["candidateInventoryContentSha256"]
assert sha(compressed) == seal["candidateInventoryGzipSha256"]
inventory = json.loads(raw)
assert sha((OUT / "delta-inventory.json").read_bytes()) == seal["deltaInventorySha256"]
delta = json.loads((OUT / "delta-inventory.json").read_bytes())
received_raw = gzip.decompress((OUT / "received-inventory.json.gz").read_bytes())
received = json.loads(received_raw)
assert sha(received_raw) == seal["receivedInventoryContentSha256"]
assert seal["candidate"] == inventory["candidate"] == delta["candidate"] == "H5-017-F"
assert seal["base"] == inventory["base"] == delta["base"] == "9649a2773530ea8a43237b4e1f2034f80e34136f"
assert seal["result"] == "PASS internal local/isolated verification"
assert seal["fifthIndependentAudit"] == "PENDING"
assert seal["H5017"] == seal["H5018"] == "IN PROGRESS"
assert seal["DM-PENDING-005"] == "OPEN"
assert seal["candidateInventoriedFiles"] == len(inventory["files"])
assert seal["candidateTotalFiles"] == len(inventory["files"]) + 2
assert seal["predecessorFilesPreserved"] == len(received["files"]) == 37874
assert seal["materialDefectsPendingInternal"] == 0 and not seal["publicationAuthorized"]
for name, expected in inventory["files"].items():
    path = ROOT / name
    info = path.lstat()
    assert stat.S_ISREG(info.st_mode) and not path.is_symlink(), name
    actual = {"type": "file", "bytes": info.st_size,
              "mode": oct(stat.S_IMODE(info.st_mode)), "sha256": sha(path.read_bytes())}
    assert actual == expected, ("CANDIDATE_F_CHANGED", name)
for name, expected in received["files"].items():
    assert inventory["files"][name] == expected, ("PREDECESSOR_CHANGED", name)
for name, expected in delta["newContentFiles"].items():
    assert name not in received["files"] and inventory["files"][name] == expected
assert delta["modifiedExistingFiles"] == delta["deletedExistingFiles"] == []
names = set(subprocess.check_output(["git", "ls-files", "-c", "-o", "--exclude-standard", "-z"],
                                  cwd=ROOT).decode().strip("\0").split("\0"))
self_metadata = {"tests/fixtures/h5-017-f/candidate-inventory.json.gz",
                 "tests/fixtures/h5-017-f/candidate-seal.json"}
assert names == set(inventory["files"]) | self_metadata
assert names - set(received["files"]) == set(delta["newContentFiles"]) | set(delta["selfMetadataExcluded"])
assert seal["newFFiles"] == delta["newFilesIncludingSelfMetadata"] == len(names) - 37874
assert sha((ROOT / seal["migration68"]).read_bytes()) == seal["migration68Sha256"]
coverage = json.loads((OUT / "current-coverage.json").read_bytes())
assert coverage["complete"]["tests"] == coverage["complete"]["pass"] == seal["currentPostgresPass"] == 2920
assert coverage["complete"]["fail"] == coverage["complete"]["cancelled"] == coverage["complete"]["skipped"] == 0
assert coverage["historicalOutcomesReused"] == coverage["knownMaterialDefectsOpen"] == 0
subprocess.run([sys.executable, str(ROOT / "scripts/verify-h5-017-f-preservation-v2.py")], cwd=ROOT, check=True)
print(json.dumps({"verification": "PASS seal and predecessor integrity",
                  "candidateTotalFiles": seal["candidateTotalFiles"],
                  "candidateInventoryContentSha256": sha(raw),
                  "candidateInventoryGzipSha256": sha(compressed),
                  "candidateSealSha256": sha(seal_bytes),
                  "newFFiles": len(names) - 37874, "currentPostgres": 2920,
                  "fifthIndependentAudit": "PENDING", "state": "STOP"}))
