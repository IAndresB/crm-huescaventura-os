"""Authenticate the four formal dependencies using immutable receipts and bytes."""

import datetime
import gzip
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parent
checks = []


def sha(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def bind(label, path, expected, decoded=False):
    data = path.read_bytes()
    if decoded:
        data = gzip.decompress(data)
    actual = sha(data)
    checks.append({"id": label, "path": str(path), "expectedSHA256": expected, "actualSHA256": actual, "decodedGzip": decoded, "status": "PASS" if actual == expected else "FAIL"})


def payloads(label, origin, inventory):
    errors = []
    for name, row in inventory["files"].items():
        path = origin / name
        try:
            data = path.read_bytes()
            if sha(data) != row["sha256"] or len(data) != row["bytes"]:
                errors.append({"path": name, "problem": "content"})
        except OSError as error:
            errors.append({"path": name, "problem": type(error).__name__})
    checks.append({"id": label, "payloadCount": len(inventory["files"]), "origin": str(origin), "errors": errors, "status": "PASS" if not errors else "FAIL"})


acceptance = load(ROOT / "tests/fixtures/h5-019-acceptance/decision-receipt.json")
bind("H5-019_accepted_candidate_seal", ROOT / acceptance["D01"]["candidatePath"], acceptance["D01"]["acceptedCandidateSealSha256"])
external = pathlib.Path("/Users/andres/Developer/crm-h5-019-corrective-independent-audit-20261018")
audit = acceptance["independentAudit"]
for filename, field in [("AUDIT-SEAL.json", "sealSha256"), ("AUDIT-INVENTORY.json", "inventorySha256"), ("AUDIT-REPORT.md", "reportSha256"), ("NORMATIVE-MATRIX.md", "matrixSha256")]:
    bind("H5-019_external_" + filename, external / filename, audit[field])
payloads("H5-019_external_original_audit_payloads", external, load(external / "AUDIT-INVENTORY.json"))
seal = load(ROOT / "tests/fixtures/h5-019-corrective/candidate-seal.json")
bind("H5-019_candidate_inventory", ROOT / "tests/fixtures/h5-019-corrective/candidate-inventory.json.gz", seal["inventorySha256"], True)

bind("H5-012_frozen_expected", ROOT / "specs/001-core-crm/expected-TSK-H5-011-012.md", "669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b")
bind("H5-012_tested_428_inputs", ROOT / "tests/fixtures/h5-012/f03-20261015/inputs-final.json", "44d32a2ff5840bfc77fd160e45f90af2c85e3372db44a0a249a1f60e07805723")
preservation = load(OUT / "readback-v3.json")
checks.append({"id": "H6-008_R2_original_4055_payloads", **preservation["dependencyManifests"][0]})
checks.append({"id": "H5-012_eight_original_receipts_and_logs", "receipts": preservation["H5012ReceiptsAndLogs"], "status": "PASS" if len(preservation["H5012ReceiptsAndLogs"]) == 8 and all(x["status"] == "PASS" for x in preservation["H5012ReceiptsAndLogs"]) else "FAIL"})

sixth = ROOT / "tests/fixtures/h5-018-sixth"
audit_seal = load(sixth / "audit-seal.json")
bind("H5-018_G_candidate_inventory", ROOT / "tests/fixtures/h5-017-g/candidate-inventory.json.gz", "fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b", True)
bind("H5-018_G_candidate_seal", ROOT / "tests/fixtures/h5-017-g/candidate-seal.json", "6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6")
bind("H5-018_sixth_inventory", sixth / "audit-inventory.json", "a13850e3316a2b39106d5a5bb7a0814c9516bb19b84cf18bf367f7f08c90bfdf")
bind("H5-018_sixth_seal", sixth / "audit-seal.json", "65d44e660965e3e59bc9d9c71c7727743213e08d9930584ffda1b25e048d74fc")
payloads("H5-018_sixth_original_127_payloads", ROOT, load(sixth / "audit-inventory.json"))
phases = load(sixth / "20-phases.json")
counts = {key: sum(phase["counts"][key] for phase in phases["phases"]) for key in ["tests", "pass", "fail", "cancelled", "skipped"]}
logs = []
for phase in phases["phases"]:
    for channel in ["stdout", "stderr"]:
        path = sixth / phase[channel]
        raw = gzip.decompress(path.read_bytes())
        logs.append({"path": str(path.relative_to(ROOT)), "decodedBytes": len(raw), "decodedSHA256": sha(raw)})
checks.append({"id": "H5-018_15_disjoint_phases_and_30_original_logs", "counts": counts, "phases": len(phases["phases"]), "selectedFiles": phases["selectedFiles"], "logs": logs, "status": "PASS" if counts == {"tests": 2945, "pass": 2945, "fail": 0, "cancelled": 0, "skipped": 0} and len(phases["phases"]) == 15 and phases["disjoint"] and all(p["exit"] == 0 for p in phases["phases"]) else "FAIL"})
report = {"schema": "h6017-four-formal-dependencies-authentication-v1", "at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "dependencies": ["H5-019", "H6-008", "H5-012", "H5-018"], "checks": checks, "status": "PASS" if all(x["status"] == "PASS" for x in checks) else "FAIL", "meaning": "Fresh authentication of historical local/synthetic evidence at its sealed version; no new functional run, production claim or release authorization", "historicalLimits": ["H5-019 AC-073 reserved at its historical date", "H5-012 exact authorized format exception remains NO PASS globally", "H5-018 five previous audits remain FAIL", "H6-008 R1 retained; R2 accepted successor", "DM-PENDING-005 OPEN; fiscal restrictions unchanged"]}
(OUT / "dependencies-readback-v1.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"status": report["status"], "checks": len(checks), "failures": [x for x in checks if x["status"] != "PASS"]}, ensure_ascii=False))
