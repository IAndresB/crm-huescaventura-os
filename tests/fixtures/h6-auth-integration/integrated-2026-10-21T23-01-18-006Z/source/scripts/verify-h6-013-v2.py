"""Read-only independent readback of the V2 delta, base, envelopes and dependencies."""
import datetime
import hashlib
import json
import os
import pathlib
import stat
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
PREFIX = "tests/fixtures/h6-013/"


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def descriptor(path):
    info = path.lstat()
    assert stat.S_ISREG(info.st_mode), str(path)
    return {"type": "file", "mode": oct(stat.S_IMODE(info.st_mode)),
            "bytes": info.st_size, "sha256": digest(path)}


def git(*args):
    return subprocess.check_output(
        ["git", *args], cwd=ROOT,
        env={**os.environ, "GIT_OPTIONAL_LOCKS": "0"}).decode()


def main():
    manifest_path = ROOT / (PREFIX + "candidate-manifest-corrective-v2.json")
    seal_path = ROOT / (PREFIX + "candidate-seal-corrective-v2.json")
    manifest = json.loads(manifest_path.read_text())
    seal = json.loads(seal_path.read_text())
    assert seal["manifestSha256"] == digest(manifest_path)
    for dependency in manifest["externalDependencies"]:
        assert descriptor(pathlib.Path(dependency["path"])) == dependency["descriptor"], dependency["path"]
    previous = json.loads(pathlib.Path(manifest["previous"]["inventoryPath"]).read_text())
    expected = dict(previous)
    for path, delta in manifest["modified"].items():
        assert expected[path] == delta["before"], path
        expected[path] = delta["after"]
    for path, desc in manifest["added"].items():
        assert path not in expected, path
        expected[path] = desc
    exclusions = set(manifest["exclusions"])
    assert exclusions == {
        PREFIX + "candidate-manifest-corrective-v2.json",
        PREFIX + "candidate-seal-corrective-v2.json",
        PREFIX + "final-readback-corrective-v2.json",
    }
    actual_paths = set(filter(None, git("ls-files", "--others", "--exclude-standard", "-z").split("\0")))
    # The readback envelope does not yet exist on the first verification.
    readback_path = PREFIX + "final-readback-corrective-v2.json"
    actual_exclusions = exclusions if (ROOT / readback_path).exists() else exclusions - {readback_path}
    assert actual_paths == set(expected) | actual_exclusions, sorted(actual_paths ^ (set(expected) | actual_exclusions))
    observed = {path: descriptor(ROOT / path) for path in sorted(expected)}
    assert observed == expected, [p for p in expected if observed[p] != expected[p]][:20]
    canonical = json.dumps(observed, sort_keys=True, separators=(",", ":")).encode()
    assert hashlib.sha256(canonical).hexdigest() == manifest["payload"]["inventorySha256"]
    assert len(observed) == manifest["payload"]["files"]
    assert sum(d["bytes"] for d in observed.values()) == manifest["payload"]["bytes"]
    assert git("branch", "--show-current").strip() == "main"
    assert git("rev-parse", "HEAD", "origin/main").split() == [manifest["base"]["commit"]] * 2
    assert git("rev-parse", "HEAD^{tree}").strip() == manifest["base"]["tree"]
    assert not git("diff", "--raw") and not git("diff", "--cached", "--raw")
    assert digest(ROOT / ".git/index") == manifest["base"]["indexSha256"]
    tracked = 0
    for entry in filter(None, git("ls-tree", "-rz", "HEAD").split("\0")):
        attrs, path = entry.split("\t")
        mode, kind, blob = attrs.split()
        content = (ROOT / path).read_bytes()
        assert kind == "blob"
        assert hashlib.sha1(b"blob " + str(len(content)).encode() + b"\0" + content).hexdigest() == blob, path
        actual = (ROOT / path).lstat()
        expected_mode = manifest["base"]["modeExceptions"].get(path, "0o755" if mode == "100755" else "0o644")
        assert stat.S_ISREG(actual.st_mode) and oct(stat.S_IMODE(actual.st_mode)) == expected_mode, path
        tracked += 1
    assert tracked == 38702
    if (ROOT / readback_path).exists():
        previous_readback = json.loads((ROOT / readback_path).read_text())
        assert previous_readback["manifestSha256"] == digest(manifest_path)
        assert previous_readback["sealSha256"] == digest(seal_path)
        assert previous_readback["payloadInventorySha256"] == manifest["payload"]["inventorySha256"]
    print(json.dumps({
        "verifiedUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "result": "PASS_READBACK", "manifestSha256": digest(manifest_path),
        "sealSha256": digest(seal_path), "payloadInventorySha256": manifest["payload"]["inventorySha256"],
        "trackedPreserved": tracked, "payloadFiles": len(observed),
        "totalCandidateFilesIncludingThreeEnvelopes": len(observed) + 3,
        "payloadBytes": sum(d["bytes"] for d in observed.values()),
        "modifiedFromV1": sorted(manifest["modified"]), "addedPayloadFiles": len(manifest["added"]),
        "externalDependenciesVerified": len(manifest["externalDependencies"]),
        "indexUnchanged": True, "gitUnchanged": True,
        "limitations": "Local readback, no WORM or independent acceptance. Self hash deliberately excluded."
    }, indent=2))


if __name__ == "__main__":
    main()
