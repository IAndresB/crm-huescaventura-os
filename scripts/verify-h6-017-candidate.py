#!/usr/bin/env python3
"""Read-only SHA-256 and scope verification for a frozen local H6-017 manifest."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "0cd5f06d2efec9741906d4927318734451b01d4a"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    manifest_path = Path(sys.argv[1]).resolve()
    manifest = json.loads(manifest_path.read_text())
    failures = []
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    if head != BASE:
        failures.append({"kind": "base", "observed": head})
    seen = set()
    for item in manifest["files"]:
        rel = Path(item["path"])
        if rel.is_absolute() or ".." in rel.parts or str(rel) in seen:
            failures.append({"kind": "path", "path": str(rel)})
            continue
        seen.add(str(rel))
        path = ROOT / rel
        if not path.is_file() or path.stat().st_size != item["bytes"] or sha(path) != item["sha256"]:
            failures.append({"kind": "integrity", "path": str(rel)})
    # A new test candidate cannot silently replace any historical tracked payload.
    tracked = subprocess.check_output(["git", "diff", "--name-only", "HEAD"], cwd=ROOT, text=True).splitlines()
    if tracked:
        failures.append({"kind": "protected-tracked-changes", "paths": tracked})
    check = subprocess.run(["git", "diff", "--check"], cwd=ROOT, capture_output=True, text=True)
    if check.returncode:
        failures.append({"kind": "diff-check", "observed": check.stdout})
    print(json.dumps({"task": "TSK-H6-017", "manifest": str(manifest_path),
                      "manifestSHA256": sha(manifest_path), "filesChecked": len(seen),
                      "status": "PASS" if not failures else "FAIL", "failures": failures,
                      "readOnly": True, "SQLExecuted": False}, ensure_ascii=False, indent=2))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
