#!/usr/bin/env python3
"""Pure H6-015 audit instruments: files/in-memory inputs only, no SQL or services.

PASS means this instrument accepted the supplied comparison, never functional
acceptance. Runtime observations require independent acquisition and coverage.
Errors contain rule identifiers only, never source data or secret values.
"""
import argparse
from collections import Counter
import copy
from decimal import Decimal
import hashlib
import json
from pathlib import Path
import re
import stat
import sys


class RuleError(ValueError):
    pass


def require(condition, code):
    if not condition:
        raise RuleError(code)


def _pairs(pairs):
    out = {}
    for key, value in pairs:
        require(key not in out, "INPUT_JSON_DUPLICATE_KEY")
        out[key] = value
    return out


def decode(text):
    def no_constant(_value):
        raise RuleError("INPUT_JSON_NONFINITE")
    try:
        return json.loads(text, parse_float=Decimal, object_pairs_hook=_pairs,
                          parse_constant=no_constant)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise RuleError("INPUT_JSON_INVALID") from None


def numeric(value):
    value = Decimal(value) if isinstance(value, int) else value
    require(value.is_finite(), "INPUT_JSON_NONFINITE")
    sign, digits, exponent = value.as_tuple()
    digits = list(digits)
    while digits and digits[0] == 0:
        digits.pop(0)
    if not digits:
        return (0, (0,), 0)
    while digits[-1] == 0:
        digits.pop()
        exponent += 1
    return (sign, tuple(digits), exponent)


def canonical(value):
    # Never normalize Decimal through the finite-precision decimal context.
    if value is None:
        return ("null",)
    if isinstance(value, bool):
        return ("boolean", value)
    if isinstance(value, (int, Decimal)):
        return ("number", numeric(value))
    require(not isinstance(value, float), "INPUT_BINARY_FLOAT")
    if isinstance(value, str):
        return ("string", value)
    if isinstance(value, list):
        return ("array", tuple(canonical(x) for x in value))
    if isinstance(value, dict):
        require(all(isinstance(k, str) for k in value), "INPUT_OBJECT_KEY")
        return ("object", tuple((k, canonical(value[k])) for k in sorted(value)))
    raise RuleError("INPUT_TYPE")


def exact(before, after, code):
    require(canonical(before) == canonical(after), code)


def multiset(values):
    return Counter(canonical(x) for x in values)


def compare_rows(before, after):
    require(isinstance(before, list) and isinstance(after, list), "ROW_INPUT")
    left = [decode(x) for x in before]
    right = [decode(x) for x in after]
    for row in left + right:
        require(isinstance(row, dict) and set(row) == {"values", "sqlNulls"}, "ROW_SHAPE")
        require(isinstance(row["sqlNulls"], list)
                and all(isinstance(x, bool) for x in row["sqlNulls"]), "ROW_SQL_NULLS")
    require(multiset(left) == multiset(right), "ROW_MULTISET")


def compare_database_properties(before, after, kind):
    require(kind in {"core", "auth", "storage"}, "DATABASE_KIND")
    for obj in (before, after):
        require(isinstance(obj, dict) and set(obj) == {"database", "owner", "acl", "settings"},
                "DATABASE_SHAPE")
        require(isinstance(obj["database"], str) and obj["database"]
                and isinstance(obj["owner"], str) and obj["owner"], "DATABASE_IDENTITY")
        for acl in obj["acl"]:
            require(isinstance(acl, list) and len(acl) == 4
                    and isinstance(acl[0], str)
                    and (acl[1] is None or isinstance(acl[1], str))
                    and acl[2] in {"CONNECT", "CREATE", "TEMPORARY"}
                    and isinstance(acl[3], bool), "DATABASE_ACL_SHAPE")
        if kind == "core":
            require(not any(x[1] is None and x[2] in {"CONNECT", "TEMPORARY"}
                            for x in obj["acl"]), "CORE_PUBLIC_ACCESS")
    exact(before["database"], after["database"], "DATABASE_NAME")
    exact(before["owner"], after["owner"], "DATABASE_OWNER")
    require(multiset(before["acl"]) == multiset(after["acl"]), "DATABASE_ACL")
    require(multiset(before["settings"]) == multiset(after["settings"]), "DATABASE_SETTINGS")


CATALOG_SECTIONS = {"relations", "columns", "constraints", "indexes", "triggers",
                    "functions", "schemas", "extensions", "policies", "acl", "default_acl"}


def compare_catalog(before, after):
    require(isinstance(before, dict) and isinstance(after, dict), "CATALOG_SHAPE")
    require(CATALOG_SECTIONS <= set(before) and CATALOG_SECTIONS <= set(after), "SNAPSHOT_CATALOG")
    # No owner/schema/function exclusions. Bounded pgcrypto equivalence is a
    # separate instrument and must be recorded at exact paths in the audit.
    exact(before, after, "CATALOG_EXACT")


def compare_snapshot(before, after):
    required = {"kind", "stage", "database", "catalog", "tables", "migrations", "sequences", "globals"}
    require(set(before) == required and set(after) == required, "SNAPSHOT_SHAPE")
    require(before["stage"] == "t0_quiescent"
            and after["stage"] == "post_restore_before_services_or_security_writes", "SNAPSHOT_STAGE")
    exact(before["kind"], after["kind"], "SNAPSHOT_KIND")
    compare_database_properties(before["database"], after["database"], before["kind"])
    require(set(before["tables"]) == set(after["tables"]), "SNAPSHOT_TABLES")
    for side in (before, after):
        for table in side["tables"].values():
            require(set(table) == {"columns", "columnTypes", "count", "sha256"}, "SNAPSHOT_TABLE_DESCRIPTOR")
            require(len(table["columns"]) == len(table["columnTypes"])
                    and isinstance(table["count"], int) and not isinstance(table["count"], bool)
                    and table["count"] >= 0
                    and re.fullmatch(r"[0-9a-f]{64}", table["sha256"]), "SNAPSHOT_TABLE_DESCRIPTOR")
    exact(before["tables"], after["tables"], "SNAPSHOT_TABLE_CONTENT")
    exact(before["migrations"], after["migrations"], "SNAPSHOT_MIGRATIONS")
    exact(before["sequences"], after["sequences"], "SNAPSHOT_SEQUENCES")
    exact(before["globals"], after["globals"], "SNAPSHOT_GLOBALS")
    compare_catalog(before["catalog"], after["catalog"])


def compare_pgcrypto(before, after):
    for side in (before, after):
        require(set(side) == {"extension", "bootstrap", "members"}, "PGCRYPTO_SHAPE")
        exact(side["extension"], {"name": "pgcrypto", "version": "1.3", "schema": "crm_crypto",
              "owner": "crm_h0_migration", "schema_owner": "crm_h0_migration"}, "PGCRYPTO_EXTENSION")
        require(side["bootstrap"]["oid"] == 10 and isinstance(side["bootstrap"]["name"], str),
                "PGCRYPTO_BOOTSTRAP")
    left = {x["identity"]: x for x in before["members"]}
    right = {x["identity"]: x for x in after["members"]}
    require(len(left) == len(before["members"]) and len(right) == len(after["members"])
            and set(left) == set(right), "PGCRYPTO_MEMBERS")
    for identity, old in left.items():
        new = right[identity]
        # This specific exception never changes identity, definition, language,
        # ACL, dependency membership, schema or extension owner.
        permitted = all(x.get("kind") == "function" and x.get("language") == "c"
                        and x.get("security_definer") is False and x.get("acl") is None
                        and x.get("extension_member") is True and x.get("owner_oid") == 10
                        for x in (old, new))
        if permitted:
            require(old["owner"] == before["bootstrap"]["name"]
                    and new["owner"] == after["bootstrap"]["name"], "PGCRYPTO_MEMBER")
            a, b = copy.deepcopy(old), copy.deepcopy(new)
            a["owner"] = b["owner"] = "builtin-bootstrap-oid10"
            exact(a, b, "PGCRYPTO_MEMBER")
        else:
            exact(old, new, "PGCRYPTO_MEMBER")


def compare_rotation(before, witness, after, expected_new):
    """Key inputs are PRIVATE, in memory. No secret hashes/values are returned."""
    def index(rows):
        out = {(x["protocol"], x["key_id"]): x for x in rows}
        require(len(out) == len(rows), "ROTATION_DUPLICATE")
        return out
    old, t1, final, planned = map(index, (before, witness, after, expected_new))
    require(set(old) <= set(final), "ROTATION_OLD_SET")
    for key, original in old.items():
        expected = dict(original, enabled=False)
        exact(expected, final[key], "ROTATION_OLD_STATE")
    new_ids = set(final) - set(old)
    require(new_ids == set(planned) and new_ids.isdisjoint(t1), "ROTATION_NEW_SET")
    require({final[k]["protocol"] for k in new_ids} == {"F1", "F2"}, "ROTATION_PROTOCOLS")
    historic_secrets = {x["secret"] for x in before + witness}
    new_secrets = set()
    for key in new_ids:
        row = final[key]
        require(row["protocol"] in {"F1", "F2"} and row["enabled"] is True, "ROTATION_NEW_STATE")
        require(row["generation"] not in {x["generation"] for x in before + witness
                                          if x["protocol"] == row["protocol"]}, "ROTATION_GENERATION")
        metadata = {k: v for k, v in row.items() if k != "secret"}
        exact(metadata, planned[key], "ROTATION_NEW_DESCRIPTOR")
        secret = row["secret"]
        require(isinstance(secret, str) and re.fullmatch(r"[0-9a-f]{64}", secret), "ROTATION_KEY_LENGTH")
        require(secret not in historic_secrets and secret not in new_secrets, "ROTATION_KEY_REUSE")
        new_secrets.add(secret)


def object_check(obj):
    if obj["metadata_present"]:
        if not obj["bytes_present"]:
            expected = "missing"
        elif not all(obj[x] for x in ("digest_matches", "size_matches", "media_matches", "linked")):
            expected = "inconsistent"
        else:
            expected = "complete"
    else:
        expected = "orphan" if obj["bytes_present"] else "absent"
    require(obj["classified_state"] == expected, "OBJECT_STATE")
    if obj["download_allowed"]:
        require(expected == "complete" and obj["authority_before"] and obj["authority_after"], "OBJECT_ACCESS")


def effect_check(item):
    identity = ["operation", "effect", "part", "attempt"]
    require(all(item["source_identity"].get(k) for k in identity), "EFFECT_IDENTITY")
    exact(item["source_identity"], item["decision_identity"], "EFFECT_IDENTITY")
    require(item["source_state"] in {"executed", "none", "uncertain", "unknown"}, "EFFECT_STATE")
    if item["source_state"] == "none":
        require(item["source_complete"], "EFFECT_COVERAGE")
    require(item["fabricated_attempt"] is False, "EFFECT_FABRICATED")
    require(item["effects_before"] == item["effects_after"], "EFFECT_COUNTER")
    require(item["new_contact"] is False, "EFFECT_RETRY")
    require(item["reentry"] is False, "S11_PROHIBITED")
    if not item["attempt_exists_at_t0"]:
        require(item["decision"] == "pending" and not item["released_reservation"], "EFFECT_MISSING_ATTEMPT")
    if item["source_state"] in {"uncertain", "unknown"} or not item["source_complete"]:
        require(not item["released_reservation"], "EFFECT_RESERVATION")
        require(item["decision"] == "pending", "EFFECT_UNCERTAIN")


def scope_check(scope):
    require(scope["S11_executed"] is False and scope["explicit_reentry"] is False, "S11_PROHIBITED")
    require(scope["task_completed"] is False and scope["r3_complete_chain"] is False, "TASK_COMPLETION_PROHIBITED")
    require(scope["quarantine"] is True and scope["workers_started"] is False, "QUARANTINE_REQUIRED")
    require(scope["Hosted"] is False and scope["Production"] is False, "ENVIRONMENT_SCOPE")
    require(scope["ARCH-PENDING-002"] == scope["DM-PENDING-005"] == "OPEN", "PENDING_PRESERVED")


def measurement_check(measurement):
    require(all(measurement[k] is None for k in ("rpo_target", "rto_target", "production_frequency", "production_cost")),
            "PRODUCTION_TARGET")
    for phase in measurement["phases"]:
        require(isinstance(phase["start"], str) and isinstance(phase["end"], str), "MEASUREMENT_CLOCK")
        a, b = Decimal(phase["start"]), Decimal(phase["end"])
        require(a.is_finite() and b.is_finite() and b >= a, "MEASUREMENT_CLOCK")
    if not measurement["loss_source_complete"]:
        require(measurement["observed_loss"] is None, "LOSS_UNKNOWN")


def startup_check(startup):
    auth = startup["auth"]
    require(auth["subcommand"] == "serve" and auth["migrate_invoked"] is False, "AUTH_STARTUP_MIGRATION")
    require(auth["index_worker_ensure"] is False and auth["index_worker_threshold"] == 0, "AUTH_INDEX_WORKER")
    storage = startup["storage"]
    require(storage["entrypoint"] == "official_app_builder" and storage["migrate_invoked"] is False,
            "STORAGE_STARTUP_MIGRATION")
    require(storage["is_multitenant"] is False, "STORAGE_MULTITENANT")
    require(storage["queue_enabled"] is False and storage["vector_enabled"] is False
            and storage["vector_migrations_enabled"] is False and storage["iceberg_enabled"] is False,
            "STORAGE_OPTIONAL_SERVICES")


def manifest_check(root, manifest):
    root = Path(root).resolve()
    require(isinstance(manifest, dict) and isinstance(manifest.get("files"), list), "MANIFEST_SHAPE")
    names = set()
    for entry in manifest["files"]:
        name = entry.get("path")
        require(isinstance(name, str) and name and "\\" not in name, "MANIFEST_PATH")
        relative = Path(name)
        require(not relative.is_absolute() and ".." not in relative.parts and name not in names, "MANIFEST_PATH")
        names.add(name)
        target = root / relative
        require(target.resolve().is_relative_to(root) and not target.is_symlink(), "MANIFEST_PATH")
        require(target.is_file(), "MANIFEST_FILE")
        data = target.read_bytes()
        require(len(data) == entry["bytes"] and hashlib.sha256(data).hexdigest() == entry["sha256"],
                "MANIFEST_CONTENT")
        if "mode" in entry:
            require(stat.S_IMODE(target.stat().st_mode) == int(entry["mode"], 8), "MANIFEST_MODE")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("family", choices=["rows", "properties", "catalog", "snapshot", "pgcrypto", "rotation",
                                           "object", "effect", "scope", "measurement", "startup", "manifest"])
    parser.add_argument("input", type=Path, help="JSON envelope; private material must remain outside the repository")
    args = parser.parse_args()
    try:
        value = decode(args.input.read_bytes())
        functions = {"rows": compare_rows, "properties": compare_database_properties, "catalog": compare_catalog,
                     "snapshot": compare_snapshot, "pgcrypto": compare_pgcrypto, "rotation": compare_rotation,
                     "object": object_check, "effect": effect_check, "scope": scope_check,
                     "measurement": measurement_check, "startup": startup_check, "manifest": manifest_check}
        require(isinstance(value, dict) and set(value) == {"arguments"}
                and isinstance(value["arguments"], list), "INPUT_ENVELOPE")
        functions[args.family](*value["arguments"])
        result = {"status": "PASS_INSTRUMENTAL_ONLY", "family": args.family,
                  "functional_acceptance": False, "independent_runtime_observation": False}
        exit_code = 0
    except RuleError as error:
        result = {"status": "FAIL", "rule": str(error), "functional_acceptance": False}
        exit_code = 1
    except Exception:
        result = {"status": "FAIL", "rule": "INPUT_OR_INSTRUMENT_ERROR", "functional_acceptance": False}
        exit_code = 1
    print(json.dumps(result, sort_keys=True))
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
