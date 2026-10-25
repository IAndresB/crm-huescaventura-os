"""Read-only custody check: no SQL, runtime, jobs, Git mutation or external service.

Base blobs bind every inherited file. Historical manifests are verified at their
original documentary root or explicitly recorded Git snapshot, never against a
new product version. Outputs are confined to this new preservation directory.
"""

import datetime
import gzip
import hashlib
import json
import os
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parent
BASE = "0cd5f06d2efec9741906d4927318734451b01d4a"
TREE = "8b184d1d470a3bf190dee14499369fe9c665ab3d"


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args])


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_json(path):
    return json.loads(path.read_bytes())


def entries(obj):
    value = obj.get("files", obj.get("inputs", []))
    if isinstance(value, dict):
        return [{"path": path, **info} for path, info in value.items()]
    return value


def manifest_check(path, source=None, expected=None):
    raw = (ROOT / path).read_bytes()
    obj = json.loads(raw)
    rows = entries(obj)
    problems = []
    if expected and digest(raw) != expected:
        problems.append({"path": path, "problem": "manifest-sha256"})
    for row in rows:
        name = row["path"]
        if pathlib.PurePosixPath(name).is_absolute() or ".." in pathlib.PurePosixPath(name).parts:
            problems.append({"path": name, "problem": "unsafe-relative-path"})
            continue
        try:
            if source and source.startswith("snapshot:"):
                data = git("show", source[9:] + ":" + name)
                mode = None
            else:
                origin = pathlib.Path(source) if source else ROOT
                target = origin / name
                data = os.readlink(target).encode() if target.is_symlink() else target.read_bytes()
                mode = target.stat().st_mode & 0o777
            actual = digest(data)
            if row.get("sha256") and actual != row["sha256"]:
                problems.append({"path": name, "problem": "payload-sha256", "actual": actual, "expected": row["sha256"]})
            if isinstance(row.get("bytes"), int) and len(data) != row["bytes"]:
                problems.append({"path": name, "problem": "bytes"})
            recorded_mode = row.get("mode")
            if mode is not None and isinstance(recorded_mode, str):
                wanted = int(recorded_mode, 8) & 0o777
                if mode != wanted:
                    problems.append({"path": name, "problem": "mode", "actual": oct(mode), "expected": recorded_mode})
        except (OSError, subprocess.CalledProcessError) as error:
            problems.append({"path": name, "problem": type(error).__name__})
    return {"manifest": path, "manifestSHA256": digest(raw), "source": source or str(ROOT), "entries": len(rows), "problems": problems, "status": "PASS" if not problems else "FAIL"}


def main():
    inventory = []
    problems = []
    tree = git("rev-parse", BASE + "^{tree}").decode().strip()
    if tree != TREE:
        problems.append({"problem": "base-tree"})
    for item in git("ls-tree", "-rz", BASE).split(b"\0"):
        if not item:
            continue
        metadata, raw_path = item.split(b"\t", 1)
        mode, kind, oid = metadata.decode().split()
        path = raw_path.decode()
        target = ROOT / path
        try:
            data = os.readlink(target).encode() if target.is_symlink() else target.read_bytes()
            actual = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            actual_mode = "120000" if target.is_symlink() else ("100755" if target.stat().st_mode & 0o111 else "100644")
            if actual != oid or mode != actual_mode:
                problems.append({"path": path, "problem": "base-content-or-mode", "expectedBlob": oid, "observedBlob": actual})
            inventory.append({"path": path, "gitMode": mode, "baseBlob": oid, "bytes": len(data), "sha256": digest(data)})
        except OSError as error:
            problems.append({"path": path, "problem": type(error).__name__})
    invraw = (json.dumps(inventory, ensure_ascii=False, indent=2) + "\n").encode()
    with gzip.GzipFile(filename=str(OUT / "base-inventory-v1.json.gz"), mode="wb", mtime=0) as stream:
        stream.write(invraw)
    old = read_json(ROOT / "tests/fixtures/h6-007-local-acceptance/core-custody-v1.json")
    historic = next(x for x in old["checks"] if x["id"] == "C10_H6015_16_4568")["detail"]["manifests"]
    packages = []
    for row in historic:
        source = row["source"]
        if not source.startswith("snapshot:"):
            source = str(pathlib.Path("/Users/andres/.codex/worktrees") / source / "crm-huescaventura-os")
        result = manifest_check(row["manifest"], source, row["sha256"])
        if result["entries"] != row["entries"]:
            result["problems"].append({"problem": "entry-count"})
            result["status"] = "FAIL"
        packages.append(result)
    later = [
        "tests/fixtures/h6-007/delivery-manifest-v1.json",
        "tests/fixtures/h6-007/independent/delivery-manifest-v1.json",
        "tests/fixtures/h6-007-local-acceptance/delivery-manifest-v1.json",
        "tests/fixtures/h6-016/technical-core-manifest-v1.json",
        "tests/fixtures/h6-016/local-closure-manifest-v1.json",
    ]
    candidates = [manifest_check(path) for path in later]
    # H6-008 R2 records its original sources; the current product may have
    # approved successor changes, so check its original root, not ROOT.
    r2_path = "tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json"
    r2 = read_json(ROOT / r2_path)
    dependencies = [manifest_check(r2_path, r2["root"], "23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f")]
    # Exact immutable H5-012 receipts and log identities, without rerunning them.
    validation = read_json(ROOT / "tests/fixtures/h5-012/publication-20261015/validation.json")
    receipts = []
    for row in validation["receipts_verified"]:
        raw = (ROOT / row["path"]).read_bytes()
        receipt = json.loads(raw)
        ok = digest(raw) == row["sha256"]
        candidates_logs = [p for p in (ROOT / row["path"]).parent.iterdir() if p.name.startswith(pathlib.Path(row["path"]).stem) and p.suffix in (".gz", ".log")]
        log_matches = []
        for path in candidates_logs:
            content = gzip.decompress(path.read_bytes()) if path.suffix == ".gz" else path.read_bytes()
            if digest(content) == row["log_sha256"]:
                log_matches.append(str(path.relative_to(ROOT)))
        receipts.append({"path": row["path"], "sha256": digest(raw), "expectedSHA256": row["sha256"], "exitCode": receipt.get("exit_code"), "logMatches": log_matches, "status": "PASS" if ok and log_matches else "FAIL"})
    report = {
        "schema": "h6017-read-only-antecedent-preservation-v1",
        "at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "base": BASE,
        "tree": tree,
        "baseFiles": len(inventory),
        "baseBytes": sum(x["bytes"] for x in inventory),
        "baseInventoryDecodedSHA256": digest(invraw),
        "baseProblems": problems,
        "productFiles": sum(x["path"].startswith("src/") for x in inventory),
        "migrations": sum(x["path"].startswith("supabase/migrations/") and x["path"].endswith(".sql") for x in inventory),
        "H6015": {"manifestCount": len(packages), "payloadEntries": sum(x["entries"] for x in packages), "packages": packages, "runtimeSQL": False, "S11": False, "reentry": False, "fourSuspendedJobs": "Not queried, started or modified"},
        "candidatePackages": candidates,
        "dependencyManifests": dependencies,
        "H5012ReceiptsAndLogs": receipts,
        "historicalMeaning": "Integrity verification of recorded bytes only; historical functional results are inherited at their exact version, not new functional PASS.",
        "H6": "IN PROGRESS",
        "H6015Quarantine": True,
        "noSourceWrites": True,
        "noSQL": True,
        "noRuntime": True,
    }
    report["status"] = "PASS" if not problems and all(x["status"] == "PASS" for x in packages + candidates + dependencies + receipts) else "FAIL"
    (OUT / "readback-v1.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "baseFiles": len(inventory), "baseProblems": len(problems), "packages": [{"manifest": x["manifest"], "status": x["status"], "problems": len(x["problems"])} for x in packages + candidates + dependencies], "receipts": receipts}, ensure_ascii=False))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
