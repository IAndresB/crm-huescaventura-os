"""Read-only verification of published files and pre-existing independent evidence."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import stat
import subprocess

root = Path.cwd()
evidence = Path(__file__).resolve().parent
preflight = json.loads((evidence / "preflight.json").read_text())
inputs = json.loads((evidence / "tested-inputs.security.json").read_text())
allowed = {"src/domain/coordinated-projection.ts": next(x["sha256"] for x in inputs["inputs"] if x["path"] == "src/domain/coordinated-projection.ts")}
checked = 0
allowed_changes = []
unexpected = []
for raw in subprocess.check_output(["git", "ls-tree", "-rz", "HEAD"]).split(b"\0"):
    if not raw:
        continue
    meta, name = raw.split(b"\t", 1)
    mode, kind, oid = meta.split()
    if kind != b"blob":
        continue
    checked += 1
    relative = os.fsdecode(name)
    path = root / relative
    if not path.exists() and not path.is_symlink():
        unexpected.append({"path": relative, "problem": "missing"})
        continue
    data = os.fsencode(os.readlink(path)) if path.is_symlink() else path.read_bytes()
    blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest().encode()
    actual_mode = b"120000" if path.is_symlink() else b"100755" if stat.S_IMODE(path.stat().st_mode) & 0o111 else b"100644"
    if blob != oid or actual_mode != mode:
        change = {"path": relative, "sha256": hashlib.sha256(data).hexdigest(), "mode": actual_mode.decode()}
        if relative in allowed and allowed[relative] == change["sha256"] and actual_mode == mode:
            allowed_changes.append(change)
        else:
            unexpected.append(change)
previous_artifacts = []
for item in preflight["preexisting_untracked_preserved"]:
    path = root / item["path"]
    if item["path"] == "tests/integration/postgres-h5-012-independent.test.ts":
        original = (evidence / "independent-verifier.original.ts.txt").read_bytes()
        added = b' await h.migration.unsafe(await readFile("supabase/migrations/20261015172843_h5_calendar_current_nights.sql","utf8"));\n'
        assert path.read_bytes().count(added) == 1
        assert path.read_bytes().replace(added, b"") == original
        data = original
    else:
        data = path.read_bytes()
    assert hashlib.sha256(data).hexdigest() == item["sha256"], item["path"]
    assert len(data) == item["bytes"]
    assert oct(stat.S_IMODE(path.stat().st_mode)) == item["mode"]
    previous_artifacts.append(item["path"])
for item in inputs["inputs"]:
    assert hashlib.sha256((root / item["path"]).read_bytes()).hexdigest() == item["sha256"], item["path"]
norm = root / "specs/001-core-crm/expected-TSK-H5-011-012.md"
assert hashlib.sha256(norm.read_bytes()).hexdigest() == preflight["expected_sha256"]
assert len(norm.read_bytes()) == 67346
assert not unexpected, unexpected
assert len(allowed_changes) == 1
assert not subprocess.check_output(["git", "diff", "--cached", "--name-only"])
diff_check = subprocess.run(["git", "diff", "--check"], capture_output=True, text=True)
assert diff_check.returncode == 0, diff_check.stdout + diff_check.stderr
record = {
    "base_sha": preflight["base_sha"],
    "tracked_blobs_checked": checked,
    "tracked_blobs_unchanged": checked - len(allowed_changes),
    "literal_authorized_changes": allowed_changes,
    "unexpected_changes": unexpected,
    "previous_artifacts_preserved": previous_artifacts,
    "independent_verifier_transition": "one setup line only; original source archived byte-exact; all assertions identical",
    "expected_bytes": len(norm.read_bytes()),
    "expected_sha256": hashlib.sha256(norm.read_bytes()).hexdigest(),
    "head_main_origin": [subprocess.check_output(["git", "rev-parse", name], text=True).strip() for name in ["HEAD", "main", "origin/main"]],
    "divergence": subprocess.check_output(["git", "rev-list", "--left-right", "--count", "main...origin/main"], text=True).strip(),
    "index_empty": True,
    "tracked_diff_check": "PASS",
    "git_status": subprocess.check_output(["git", "status", "--short", "--branch"], text=True),
    "timestamp_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
}
assert len(set(record["head_main_origin"])) == 1
(evidence / "preservation-final.json").write_text(json.dumps(record, indent=2) + "\n")
print(json.dumps({"tracked": checked, "unchanged": checked - 1, "allowed": len(allowed_changes), "unexpected": len(unexpected), "previous_artifacts_preserved": len(previous_artifacts), "expected_intact": True}))
