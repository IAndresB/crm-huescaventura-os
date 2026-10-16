#!/usr/bin/env python3
"""Verify the sealed local candidate; build two trees in disposable Git stores.

Read-only for the working tree and real Git index/objects. No fetch, commit,
push, database access or functional tests. Run from any current directory.
The tree and inventory digests are returned externally to avoid self-reference.
"""

import gzip
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
BASE = "ff0ad6c6e505914f31eb15d56725179c9f065426"
PREFIX = "tests/fixtures/h5-016/prepublication-20261016/"
SELF = PREFIX + "inventory.json"
INPUT_PATH = "tests/fixtures/h5-016/final-inputs.json"
INPUT_HASH = "f72596dafa448cbba1d3ddb1525aab57097a4992f40bc0712da2eb444008f30d"
RECEIVED_PATH = "tests/fixtures/h5-016/candidate-inventory.json"
RECEIVED_HASH = "b794a70d60ed68f4b07f275287c24b5a6588bad7b4657e819a6a4725d960d555"
ENV = os.environ | {"GIT_OPTIONAL_LOCKS": "0"}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(*args, env=None):
    return subprocess.check_output(
        ["git", *args], cwd=ROOT, env=env or ENV
    )


def read_json(path):
    return json.loads((ROOT / path).read_bytes())


def file_record(path):
    target = ROOT / path
    require(not Path(path).is_absolute() and ".." not in Path(path).parts, path)
    require(stat.S_ISREG(target.lstat().st_mode), "Not regular: " + path)
    data = target.read_bytes()
    return {
        "bytes": len(data),
        "sha256": sha(data),
        "mode": "100755" if target.stat().st_mode & 0o111 else "100644",
    }


def verify_records(records):
    for path, expected in records.items():
        actual = file_record(path)
        require(all(actual[k] == expected[k] for k in actual), "Mismatch: " + path)


def build_tree(paths, expected_status):
    objects = Path(git("rev-parse", "--git-path", "objects").decode().strip())
    if not objects.is_absolute():
        objects = ROOT / objects
    with tempfile.TemporaryDirectory(prefix="crm-prepublication-tree-") as tmp:
        isolated = Path(tmp)
        (isolated / "objects").mkdir()
        env = ENV | {
            "GIT_INDEX_FILE": str(isolated / "index"),
            "GIT_OBJECT_DIRECTORY": str(isolated / "objects"),
            "GIT_ALTERNATE_OBJECT_DIRECTORIES": str(objects.resolve()),
        }
        git("read-tree", BASE, env=env)
        pathfile = isolated / "paths"
        pathfile.write_bytes(b"\0".join(p.encode() for p in sorted(paths)) + b"\0")
        git("add", "--pathspec-from-file=" + str(pathfile), "--pathspec-file-nul", env=env)
        # This is the full proposed index, including its inventory and receipts.
        git("diff", "--cached", "--check", env=env)
        delta = git("diff", "--cached", "--name-status", "-z", BASE, env=env).split(b"\0")[:-1]
        observed = {delta[n + 1].decode(): delta[n].decode() for n in range(0, len(delta), 2)}
        require(observed == expected_status, "Unexpected staged paths or statuses")
        staged = {}
        for item in git("ls-files", "--stage", "-z", env=env).split(b"\0"):
            if item:
                metadata, path = item.split(b"\t")
                mode, oid, stage = metadata.decode().split()
                require(stage == "0", "Unmerged index")
                staged[path.decode()] = (mode, oid)
        for path in paths:
            data = (ROOT / path).read_bytes()
            blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
            require(staged[path] == (file_record(path)["mode"], blob), "Filtered or mode-altered staged bytes: " + path)
        return git("write-tree", env=env).decode().strip()


def main():
    real_index = Path(git("rev-parse", "--git-path", "index").decode().strip())
    if not real_index.is_absolute():
        real_index = ROOT / real_index
    index_before = real_index.read_bytes()
    require(git("branch", "--show-current").decode().strip() == "main", "Wrong branch")
    for ref in ("HEAD", "main", "origin/main"):
        require(git("rev-parse", ref).decode().strip() == BASE, "Wrong base: " + ref)
    require(git("rev-list", "--left-right", "--count", "HEAD...origin/main").split() == [b"0", b"0"], "Divergence")
    require(not git("diff", "--cached", "--name-only"), "Real index is not empty")
    require(sha((ROOT / INPUT_PATH).read_bytes()) == INPUT_HASH, "Changed input manifest")
    require(sha((ROOT / RECEIVED_PATH).read_bytes()) == RECEIVED_HASH, "Changed received inventory")
    inputs = read_json(INPUT_PATH)["inputs"]
    require(len(inputs) == 456, "Wrong input count")
    for path, digest in inputs.items():
        require(file_record(path)["sha256"] == digest, "Changed tested input: " + path)
    received = read_json(RECEIVED_PATH)
    transitions = read_json(PREFIX + "document-transition.json")["files"]
    require(set(transitions) == {"docs/PROJECT-STATUS.md", "docs/NEXT-STEPS.md", "specs/001-core-crm/tasks.md"}, "Unexpected documentary scope")
    for path, record in transitions.items():
        before = gzip.decompress((ROOT / (PREFIX + record["archive"])).read_bytes())
        require(sha(before) == received["files"][path]["sha256"] == record["beforeSha256"], "Original document lost: " + path)
        require(sha((ROOT / path).read_bytes()) == record["afterSha256"], "Document transition drift: " + path)
    verify_records({p: r for p, r in received["files"].items() if p not in transitions})
    inventory = read_json(SELF)
    require(inventory["selfExcluded"] == SELF, "Self exclusion mismatch")
    require(SELF not in inventory["files"], "Self-referential inventory")
    verify_records(inventory["files"])
    paths = set(inventory["files"]) | {SELF}
    actual_paths = set(git("ls-files", "--modified", "--others", "--exclude-standard", "-z").decode().split("\0")[:-1])
    require(paths == actual_paths, "Missing or unexpected working-tree paths")
    require(len(paths) == inventory["totalFiles"], "Incorrect total")
    expected_status = {p: r["gitStatus"] for p, r in inventory["files"].items()} | {SELF: "A"}
    require(set(expected_status.values()) <= {"A", "M"}, "Deletion or unexpected status")
    first = build_tree(paths, expected_status)
    second = build_tree(paths, expected_status)
    require(first == second, "Non-reproducible tree")
    require(real_index.read_bytes() == index_before, "Real index bytes changed")
    require(not git("diff", "--cached", "--name-only"), "Real index mutated")
    print(json.dumps({
        "verdict": "PASS", "base": BASE, "inputCount": len(inputs),
        "inputManifestSha256": INPUT_HASH, "receivedInventorySha256": RECEIVED_HASH,
        "publicationInventorySha256": sha((ROOT / SELF).read_bytes()),
        "totalFiles": len(paths), "gitTreeSha1": first,
        "independentTreeBuilds": 2, "fullIndexDiffCheckExit": 0,
        "stagedPathsModesRawBytesVerified": True, "realIndexUnchanged": True,
        "commitCreated": False, "persistentGitObjectsWritten": False,
    }, indent=2))


if __name__ == "__main__":
    main()
