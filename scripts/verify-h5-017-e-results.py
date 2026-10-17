"""Reconstruct captured results and provenance; write new E evidence only once."""
from pathlib import Path
from collections import Counter
import gzip
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests/fixtures/h5-017-e"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def obj(path):
    return json.loads(path.read_bytes())


def raw(path):
    return gzip.decompress(path.read_bytes())


def write(name, value, compressed=False):
    path = OUT / name
    assert not path.exists(), name
    data = (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()
    path.write_bytes(gzip.compress(data, mtime=0) if compressed else data)
    return sha(data)


archives = {
    "supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql": ["21-initial67.sql.gz"],
    "tests/integration/postgres-h5-017-e-migration.test.ts": ["04-migration-instrument-before.ts.gz", "21-migration-instrument-two-bodies.ts.gz"],
    "tests/integration/postgres-h5-017-e-parents.test.ts": ["06-parents-before-types.ts.gz"],
    "tests/integration/postgres-h5-017-e-observation-access.test.ts": ["18-observation-instrument-before.ts.gz"],
    "scripts/verify-h5-017-e.py": ["09-preservation-instrument-before.py.gz", "21-preservation-before-addendum.py.gz"],
    "scripts/test-h5-017-e-complete.mjs": ["21-full-runner-initial181.mjs.gz"],
}
versions = {name: {sha(raw(OUT / archive)): archive for archive in variants}
            for name, variants in archives.items()}
expected_counts = {
    "01-reproduce-d": (1, 12, 7, 5),
    "02-originals-e": (0, 39, 39, 0),
    "03-counterexamples": (0, 17, 17, 0),
    "04-migration": (1, 2, 1, 1),
    "05-migration": (0, 2, 2, 0),
    "10-unit": (0, 208, 208, 0),
    "11-health": (0, 1, 1, 0),
    "15-complete": (0, 2879, 2879, 0),
    "16-owner-collision": (1, 1, 0, 1),
    "17-current-evidence": (1, 1, 0, 1),
    "18-observation-access": (1, 3, 0, 3),
    "19-observation-access": (1, 3, 0, 3),
    "20-refined-proposal": (0, 61, 61, 0),
    "22-final-focal": (0, 63, 63, 0),
    "25-final-unit": (0, 208, 208, 0),
    "26-final-health": (0, 1, 1, 0),
    "30-final-complete": (0, 2884, 2884, 0),
}
captures = []
for path in sorted(OUT.glob("*.status.json")):
    label = path.name.removesuffix(".status.json")
    status = obj(path)
    stdout = raw(OUT / (label + ".stdout.log.gz"))
    stderr = raw(OUT / (label + ".stderr.log.gz"))
    counts = {key: int(matches[-1]) for key in ["tests", "pass", "fail", "cancelled", "skipped"]
              if (matches := re.findall(r"(?:ℹ|#) " + key + r" (\d+)", stdout.decode(errors="replace")))}
    assert counts == status["counts"], label
    assert status["changedDuringRun"] == [], label
    recovered = []
    for name, digest in status["inputs"].items():
        if sha((ROOT / name).read_bytes()) != digest:
            assert name in versions and digest in versions[name], (label, name, digest)
            recovered.append({"path": name, "sha256": digest, "archive": versions[name][digest]})
    if label in expected_counts:
        assert (status["exit"], counts["tests"], counts["pass"], counts["fail"]) == expected_counts[label], label
        assert counts["cancelled"] == counts["skipped"] == 0, label
    else:
        assert status["exit"] == (1 if label == "06-typecheck" else 0), label
    captures.append({"capture": label, "exit": status["exit"], "counts": counts,
                     "inputCount": len(status["inputs"]), "changedDuringRun": [],
                     "previousVersionsRecovered": recovered, "stdoutSha256": sha(stdout),
                     "stderrSha256": sha(stderr), "statusSha256": sha(path.read_bytes())})

phases = obj(OUT / "30-phases.json")
selection = obj(OUT / "30-selection.json")["selected"]
assert len(phases["phases"]) == 14
files = [name for phase in phases["phases"] for name in phase["files"]]
assert len(files) == len(set(files)) == 184 and set(files) == set(selection)
cases = []
embedded = []
for number, phase in enumerate(phases["phases"], 1):
    log = raw(OUT / phase["stdout"]).decode()
    counts = {key: int(re.findall(r"(?:ℹ|#) " + key + r" (\d+)", log)[-1])
              for key in ["tests", "pass", "fail", "cancelled", "skipped"]}
    assert counts == phase["counts"] and phase["exit"] == 0
    assert counts["tests"] == counts["pass"] and counts["fail"] == counts["cancelled"] == counts["skipped"] == 0
    titles = re.findall(r"^\s*✔ (.*) \([0-9.]+ms\)$", log, re.M)
    if len(titles) != counts["tests"]:
        assert phase["files"] == ["postgres-h2-008-defects.test.ts"] and counts["tests"] == 1
        assert titles[-1] == "H2-008 F01/F02 original15dbf11 reproduces normative FAIL without weakening expected"
        embedded.append({"phase": number, "excludedChildLines": len(titles) - 1})
        titles = titles[-1:]
    for ordinal, name in enumerate(titles, 1):
        cases.append({"id": f"30/{number:02d}/{ordinal:04d}", "name": name,
                      "selectedFiles": phase["files"], "stdout": phase["stdout"]})
assert len(cases) == len({case["id"] for case in cases}) == 2884
prior = json.loads(raw(ROOT / "tests/fixtures/h5-018-third/current-case-inventory.json.gz"))["cases"]
old_names = Counter(case["name"] for case in prior)
new_names = Counter(case["name"] for case in cases)
assert not old_names - new_names
additional = new_names - old_names
assert sum(additional.values()) == 36
assert sum(item["excludedChildLines"] for item in embedded) == 54
replica = obj(OUT / "30-replica-preservation.json")
assert replica["replicaRemoved"] and replica["workspaceProtectedOutputsNeverOverwritten"] and replica["exit"] == 0
for artifact in replica["regenerated"]:
    assert sha(raw(OUT / artifact["capture"])) == artifact["generatedSha256"]
    assert sha((ROOT / artifact["path"]).read_bytes()) == artifact["protectedWorkspaceSha256"]
snapshot = json.loads(raw(OUT / "30-copied-inputs.json.gz"))
assert snapshot["allBytesVerified"] and not snapshot["originalWorkspaceWrites"]
for name, meta in snapshot["files"].items():
    if name.startswith(("src/", "supabase/migrations/", "tests/support/", "tests/integration/", "scripts/")):
        assert sha((ROOT / name).read_bytes()) == meta["sha256"], name
sql = (ROOT / "supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql").read_bytes()
assert sha(sql) == sha((OUT / "proposed67.sql").read_bytes()) == "45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5"
audit = json.loads(raw(OUT / "29-final-audit.stdout.log.gz"))
assert all(value == 0 for value in audit["metadata"]["vulnerabilities"].values())
inventory_hash = write("current-case-inventory.json.gz", {"cases": cases, "executed": 2884,
                       "embeddedHistoricalResultsExcluded": embedded}, compressed=True)
write("current-coverage.json", {"result": "PASS local internal verification",
      "tests": 2884, "pass": 2884, "fail": 0, "cancelled": 0, "skipped": 0,
      "uniqueFiles": 184, "disjointPhases": 14, "reusedOutcomesForCurrentResult": 0,
      "caseInventorySha256": inventory_hash, "prior2848NamesPreserved": True,
      "additional36Cases": dict(additional), "newECases": 24, "thirdAuditOriginalCases": 12,
      "focal63": "22-final-focal, overlapping full; do not add", "unit": 208, "health": 1,
      "migration67Sha256": sha(sql), "historicalBases": "Pinned historical migration cases retain their explicit bases; affected runtime fixtures use67 via exact hook",
      "replica": replica, "copiedFiles": len(snapshot["files"])})
write("final-verification.json", {"result": "PASS internal local verification", "captures": captures,
      "materialFindingsPendingInternal": 0, "fourthIndependentAudit": "PENDING",
      "migration67Sha256": sha(sql), "currentPostgres": 2884, "newECases": 24,
      "focal": 63, "unit": 208, "health": 1, "vulnerabilities": 0,
      "historicalFailsPreserved": True, "historicalResultsReusedAsCurrent": False,
      "H5017": "IN PROGRESS", "H5018": "IN PROGRESS", "DM-PENDING-005": "OPEN",
      "publish": False, "next": "STOP; fourth independent audit"})
print(json.dumps({"verification": "PASS", "currentPostgres": 2884, "casesSha256": inventory_hash,
                  "capturesVerified": len(captures), "focal": 63, "newE": 24}))
