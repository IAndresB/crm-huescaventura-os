#!/usr/bin/env python3
"""Pure expected-driven tests for the bounded identity projection."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
module = root / "scripts/verify-h6-015-catalog-identity.py"
spec = importlib.util.spec_from_file_location("identity", module)
identity = importlib.util.module_from_spec(spec)
spec.loader.exec_module(identity)
expected_path = root / "specs/001-core-crm/independent-identity-addendum-TSK-H6-015-v1.json"
expected = json.loads(expected_path.read_text())
assert hashlib.sha256(expected_path.read_bytes()).hexdigest() == "6f51bf48d40b3a7ef280de4afed8735327ea46c386aaa071ec5bdea2e8653f12"

def column(n, name):
    return {"schema": "auth", "relation": "synthetic", "attnum": n, "attisdropped": False,
            "name": name, "type": "text", "notnull": False, "identity": "", "generated": "",
            "default": None, "collation": "pg_catalog.default", "acl": None}

def trigger(oid):
    name = "RI_ConstraintTrigger_c_" + str(oid)
    return {"schema": "auth", "relation": "synthetic", "oid": str(oid), "name": name,
            "internal": True, "constraint_type": "f", "constraint_relation": "auth.synthetic",
            "constraint_name": "synthetic_fk", "function": "pg_catalog.RI_FKey_check_ins()",
            "type": 5, "enabled": "O", "deferrable": False, "initially_deferred": False,
            "arguments": "", "update_columns": [],
            "definition": 'CREATE CONSTRAINT TRIGGER "' + name + '" AFTER INSERT ON auth.synthetic FROM auth.target NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()'}

cols = [column(1, "id"), column(4, "value")]
target_cols = [column(1, "id"), column(2, "value")]
triggers = [trigger(123)]
target_triggers = [trigger(456)]
cases = {}

def add(code, left, right, fn):
    # Always deep-copy both inputs so a mutation cannot corrupt expected.
    a, b = copy.deepcopy(left), copy.deepcopy(right)
    cases[code] = lambda: fn(a, b)

add("N01", cols, target_cols, identity.compare_columns)
for code, field, value in [("N02", "attnum", 9), ("N04", "type", "uuid"),
 ("N05", "notnull", True), ("N06", "default", "'changed'::text"), ("N07", "identity", "a"),
 ("N08", "generated", "s"), ("N09", "collation", "public.changed"),
 ("N10", "acl", "{ordinary=r/owner}"), ("N11", "attnum", 2), ("N12", "attisdropped", True)]:
    bad = copy.deepcopy(target_cols); bad[0][field] = value
    add(code, cols, bad, identity.compare_columns)
add("N03", cols, target_cols[:-1], identity.compare_columns)
add("N13", triggers, target_triggers, identity.compare_triggers)
for code, field, value in [("N14", "oid", "457"), ("N15", "internal", False),
 ("N16", "constraint_type", "u"), ("N17", "constraint_relation", None),
 ("N18", "constraint_name", "other_fk"), ("N19", "function", "other_function()"),
 ("N20", "enabled", "D"), ("N21", "type", 9), ("N22", "deferrable", True),
 ("N23", "arguments", "01"), ("N24", "update_columns", ["other_column"]),
 ("N25", "definition", target_triggers[0]["definition"] + ' /* change */'),
 ("N27", "definition", 'CREATE CONSTRAINT TRIGGER "DIFFERENT" AFTER INSERT'),
 ("N28", "name", "RI_ConstraintTrigger_a_456")]:
    bad = copy.deepcopy(target_triggers); bad[0][field] = value
    if code == "N28": bad[0]["definition"] = bad[0]["definition"].replace("RI_ConstraintTrigger_c_456", "RI_ConstraintTrigger_a_456")
    add(code, triggers, bad, identity.compare_triggers)
add("N26", triggers, target_triggers * 2, identity.compare_triggers)

results = []
assert set(cases) == {x[0] for x in expected["pureCases"]}
for code, description, wanted in expected["pureCases"]:
    accepted, reason = True, None
    try:
        cases[code]()
    except identity.IdentityError as error:
        accepted, reason = False, str(error)
    results.append({"id": code, "description": description, "expectedAccepted": wanted,
                    "observedAccepted": accepted, "status": "PASS" if wanted == accepted else "FAIL", "rule": reason})
report = {"scope": "pure projection only", "functionalAcceptance": False,
          "expectedSHA256": hashlib.sha256(expected_path.read_bytes()).hexdigest(),
          "sources": [{"path": str(p.relative_to(root)), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}
                      for p in [module, Path(__file__)]], "results": results}
out = root / "tests/fixtures/h6-015-independent-preparation/catalog-identity-pure-r1.json"
with out.open("x") as file:
    json.dump(report, file, indent=2); file.write("\n")
failed = sum(x["status"] != "PASS" for x in results)
print(json.dumps({"report": str(out), "cases": len(results), "failed": failed}))
raise SystemExit(1 if failed else 0)
