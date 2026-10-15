"""Reproduce a corrective gate on the exact disposable tree in tested-inputs.json."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time

evidence = Path(__file__).resolve().parent
manifest = evidence / "tested-inputs.final.json"
inputs = json.loads(manifest.read_text())
gates = {
    "focal-postgres": ["node", "scripts/test-postgres.mjs", "postgres-h5-012-independent.test.ts", "postgres-h5-012-f01-corrective.test.ts"],
    "focal-domain": ["node", "--test", "--experimental-strip-types", "tests/coordinated-projection-h5-011.test.ts", "tests/coordinated-projection-h5-011-coverage.test.ts", "tests/coordinated-projection-h5-012-f01.test.ts"],
    "postgres-regression": ["node", "scripts/test-postgres.mjs"],
    "unit-complete": ["pnpm", "test"],
    "typecheck": ["pnpm", "typecheck"],
    "lint": ["pnpm", "lint"],
    "build": ["pnpm", "build"],
    "audit": ["pnpm", "audit", "--prod", "--json"],
    "health": ["node", "--test", "tests/operations/supabase-health.test.mjs"],
}
gate = sys.argv[1]
command = gates[gate]
log_path = evidence / (gate + ".final.log")
receipt_path = evidence / (gate + ".final.status.json")
if log_path.exists() or receipt_path.exists():
    raise SystemExit("Evidence already exists; choose a separate explicit run, never overwrite")
copy = Path(inputs["copy"])
for item in inputs["inputs"]:
    assert hashlib.sha256((copy / item["path"]).read_bytes()).hexdigest() == item["sha256"]
env = dict(os.environ)
env["POSTGRES_H0_BIN"] = "/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin"
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
t0 = time.time()
with log_path.open("w") as output:
    result = subprocess.run(command, cwd=copy, env=env, stdout=output, stderr=subprocess.STDOUT)
receipt = {
    "gate": gate,
    "command": command,
    "cwd": str(copy),
    "POSTGRES_H0_BIN": env["POSTGRES_H0_BIN"],
    "started_utc": started,
    "elapsed_seconds": round(time.time() - t0, 3),
    "exit_code": result.returncode,
    "base_sha": inputs["base_sha"],
    "tested_inputs_sha256": hashlib.sha256(manifest.read_bytes()).hexdigest(),
    "log_sha256": hashlib.sha256(log_path.read_bytes()).hexdigest(),
}
receipt_path.write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps(receipt))
print("\n".join(log_path.read_text().splitlines()[-40:]))
sys.exit(result.returncode)
