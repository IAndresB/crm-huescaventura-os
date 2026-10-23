#!/usr/bin/env python3
"""Adversarial PURE cases fixed in the independent expected before this runner.

All data below are deliberately fictional instrument inputs. No key is used for
cryptography; no source/destination, Auth, Storage, SQL or network is contacted.
"""
import argparse
import copy
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
SPEC = ROOT / "specs/001-core-crm/independent-expected-TSK-H6-015-v1.json"
SEAL = ROOT / "tests/fixtures/h6-015-independent-preparation/expected-seal.json"
module_spec = importlib.util.spec_from_file_location("independent", ROOT / "scripts/verify-h6-015-independent.py")
v = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(v)


def clone(value):
    return copy.deepcopy(value)


def properties():
    return {"database": "fixture_core", "owner": "fixture_owner", "acl": [
        ["fixture_owner", "fixture_runtime", "CONNECT", False],
        ["fixture_owner", "fixture_owner", "CREATE", False]],
        "settings": [[None, "application_name=fixture"], ["fixture_runtime", "statement_timeout=3s"]]}


def catalog():
    out = {name: [] for name in v.CATALOG_SECTIONS}
    out["relations"] = [{"name": "auth.users", "owner": "fixture_auth", "force_rls": False}]
    out["functions"] = [{"identity": "fixture.fn()", "owner": "fixture_owner", "search_path": "pg_catalog"}]
    return out


def snapshot(stage):
    table = {"columns": ["id"], "columnTypes": ["uuid"], "count": 1, "sha256": "a" * 64}
    return {"kind": "auth", "stage": stage, "database": properties(), "catalog": catalog(),
            "tables": {"auth.users": clone(table), "auth.mfa_factors": clone(table)},
            "migrations": [{"version": "fixture_001"}], "sequences": [],
            "globals": {"roles": [{"name": "fixture_auth", "superuser": False}]}}


def pgcrypto(bootstrap):
    return {"extension": {"name": "pgcrypto", "version": "1.3", "schema": "crm_crypto",
                          "owner": "crm_h0_migration", "schema_owner": "crm_h0_migration"},
            "bootstrap": {"oid": 10, "name": bootstrap}, "members": [
                {"identity": "crm_crypto.fixture_digest(bytea,text)", "kind": "function", "language": "c",
                 "security_definer": False, "acl": None, "extension_member": True,
                 "owner_oid": 10, "owner": bootstrap, "definition": "fixture_definition"}]}


def key(protocol, generation, offset):
    # Symbolic in-memory byte patterns, not generated or operational secrets.
    return {"protocol": protocol, "key_id": protocol + "_" + generation,
            "generation": generation, "audience": "fixture", "purposes": ["read"], "enabled": True,
            "valid_from": "fixture_start", "valid_until": "fixture_end", "secret": bytes([offset] * 32).hex()}


def rotation():
    old = [key("F1", "t0", 1), key("F2", "t0", 2)]
    t1 = [key("F1", "t1", 3), key("F2", "t1", 4)]
    new = [key("F1", "after", 5), key("F2", "after", 6)]
    final = [dict(x, enabled=False) for x in old] + new
    planned = [{k: val for k, val in x.items() if k != "secret"} for x in new]
    return old, t1, final, planned


def object_case():
    return {"metadata_present": True, "bytes_present": True, "digest_matches": True,
            "size_matches": True, "media_matches": True, "linked": True, "classified_state": "complete",
            "download_allowed": True, "authority_before": True, "authority_after": True}


def effect():
    identity = {"operation": "fixture_op", "effect": "fixture_effect", "part": "fixture_part", "attempt": "fixture_attempt"}
    return {"source_identity": clone(identity), "decision_identity": clone(identity), "source_state": "executed",
            "source_complete": True, "fabricated_attempt": False, "effects_before": 1, "effects_after": 1,
            "new_contact": False, "reentry": False, "attempt_exists_at_t0": True,
            "decision": "reconciled", "released_reservation": False}


def scope():
    return {"S11_executed": False, "explicit_reentry": False, "task_completed": False,
            "r3_complete_chain": False, "quarantine": True, "workers_started": False,
            "Hosted": False, "Production": False, "ARCH-PENDING-002": "OPEN", "DM-PENDING-005": "OPEN"}


def measurement():
    return {"rpo_target": None, "rto_target": None, "production_frequency": None, "production_cost": None,
            "phases": [{"start": "100.00001", "end": "100.99999"}],
            "loss_source_complete": False, "observed_loss": None}


def startup():
    return {"auth": {"subcommand": "serve", "migrate_invoked": False,
                     "index_worker_ensure": False, "index_worker_threshold": 0},
            "storage": {"entrypoint": "official_app_builder", "migrate_invoked": False, "is_multitenant": False,
                        "queue_enabled": False, "vector_enabled": False, "vector_migrations_enabled": False,
                        "iceberg_enabled": False}}


def row(value, null="false"):
    return '{"values":[' + value + '],"sqlNulls":[' + null + ']}'


def run_case(scenario):
    row_cases = {
        "row_order": ([row("1"), row("2")], [row("2"), row("1")]),
        "row_multiplicity": ([row("1"), row("1")], [row("1")]),
        "number_vs_string": ([row("1")], [row('"1"')]),
        "number_vs_boolean": ([row("1")], [row("true")]),
        "large_integer": ([row("9007199254740993")], [row("9007199254740992")]),
        "decimal_exact": ([row("100.000000000000000000000000000001")], [row("100.000000000000000000000000000002")]),
        "decimal_scale_equivalent": ([row("1.00")], [row("1e0")]),
        "array_order": ([row("[1,2]")], [row("[2,1]")]),
        "sql_null_vs_json_null": ([row("null", "true")], [row("null", "false")]),
    }
    if scenario in row_cases:
        return v.compare_rows(*row_cases[scenario])
    if scenario == "duplicate_json_key":
        return v.decode('{"fixture":1,"fixture":2}')
    if scenario == "json_duplicate_even_equal":
        return v.decode('{"fixture":1,"fixture":1}')
    if scenario.startswith("database_") or scenario.startswith("acl_") or scenario in {"core_public_connect", "storage_original_public_acl"}:
        a, b, kind = properties(), properties(), "core"
        if scenario == "database_acl_order":
            b["acl"].reverse()
        elif scenario == "database_owner":
            b["owner"] = "other_owner"
        elif scenario == "acl_grantor":
            b["acl"][0][0] = "other_grantor"
        elif scenario == "acl_grant_option":
            b["acl"][0][3] = True
        elif scenario == "database_setting":
            b["settings"][0][1] = "application_name=other"
        elif scenario in {"core_public_connect", "storage_original_public_acl"}:
            a["acl"].append(["fixture_owner", None, "CONNECT", False]); b = clone(a)
            if scenario == "storage_original_public_acl":
                kind = "storage"
        return v.compare_database_properties(a, b, kind)
    if scenario.startswith("catalog_"):
        a, b = catalog(), catalog()
        if scenario == "catalog_object_absent":
            b["functions"] = []
        else:
            b["relations"][0]["force_rls"] = True
        return v.compare_catalog(a, b)
    if scenario in {"auth_factor_table_absent", "migration_ledger_changed", "snapshot_late_capture", "snapshot_catalog_omission"}:
        a, b = snapshot("t0_quiescent"), snapshot("post_restore_before_services_or_security_writes")
        if scenario == "auth_factor_table_absent":
            del b["tables"]["auth.mfa_factors"]
        elif scenario == "migration_ledger_changed":
            b["migrations"].append({"version": "fixture_extra"})
        elif scenario == "snapshot_late_capture":
            b["stage"] = "after_auth_serve"
        else:
            del b["catalog"]["constraints"]
        return v.compare_snapshot(a, b)
    if scenario.startswith("pgcrypto_"):
        a, b = pgcrypto("old_bootstrap"), pgcrypto("new_bootstrap")
        if scenario == "pgcrypto_crm_owner_changed":
            b["extension"]["owner"] = "new_bootstrap"
        elif scenario == "pgcrypto_security_definer_normalized":
            a["members"][0]["security_definer"] = b["members"][0]["security_definer"] = True
        elif scenario == "pgcrypto_explicit_acl_normalized":
            a["members"][0]["acl"] = b["members"][0]["acl"] = []
        elif scenario == "pgcrypto_nonmember_normalized":
            a["members"][0]["extension_member"] = b["members"][0]["extension_member"] = False
        return v.compare_pgcrypto(a, b)
    if scenario.startswith("rotation_"):
        a, t1, b, planned = rotation()
        if scenario == "rotation_old_enabled":
            b[0]["enabled"] = True
        elif scenario == "rotation_old_deleted":
            b.pop(0)
        elif scenario == "rotation_reuses_t1_generation":
            b[2]["generation"] = "t1"
        elif scenario == "rotation_reuses_old_secret":
            b[2]["secret"] = a[0]["secret"]
        elif scenario == "rotation_f1_f2_same_secret":
            b[3]["secret"] = b[2]["secret"]
        elif scenario == "rotation_purpose_broadened":
            b[2]["purposes"].append("write")
        return v.compare_rotation(a, t1, b, planned)
    if scenario.startswith("object_") or scenario == "late_revoked_download":
        obj = object_case()
        if scenario == "object_missing_claimed_complete":
            obj["bytes_present"] = False; obj["download_allowed"] = False
        elif scenario == "object_orphan":
            obj.update(metadata_present=False, classified_state="orphan", download_allowed=False)
        elif scenario == "object_corrupt":
            obj.update(digest_matches=False, classified_state="inconsistent", download_allowed=False)
        elif scenario == "object_unauthorized_download":
            obj["authority_before"] = False
        elif scenario == "late_revoked_download":
            obj["authority_after"] = False
        return v.object_check(obj)
    if scenario.startswith("witness_") or scenario in {"t1_attempt_fabricated", "duplicate_effect_count", "identity_by_amount"}:
        item = effect()
        if scenario == "witness_uncertain_releases_reservation":
            item.update(source_state="uncertain", decision="pending", released_reservation=True)
        elif scenario == "witness_incomplete_claims_no_effect":
            item.update(source_state="none", source_complete=False, decision="pending")
        elif scenario == "t1_attempt_fabricated":
            item.update(attempt_exists_at_t0=False, fabricated_attempt=True)
        elif scenario == "duplicate_effect_count":
            item["effects_after"] += 1
        elif scenario == "identity_by_amount":
            item["decision_identity"]["attempt"] = "other_attempt"
        return v.effect_check(item)
    if scenario.startswith("scope_"):
        value = scope()
        if scenario == "scope_s11_claimed":
            value["S11_executed"] = True
        elif scenario == "scope_completed_claimed":
            value["task_completed"] = True
        return v.scope_check(value)
    if scenario.startswith("measurement_"):
        value = measurement()
        if scenario == "measurement_unknown_zero":
            value["observed_loss"] = 0
        elif scenario == "measurement_negative_duration":
            value["phases"][0]["end"] = "99"
        elif scenario == "measurement_target_invented":
            value["rto_target"] = 30
        return v.measurement_check(value)
    if scenario in {"auth_root_entrypoint", "auth_index_worker_enabled", "storage_standard_entrypoint",
                    "storage_freeze_not_skip", "storage_builder_single_tenant", "storage_multitenant_builder"}:
        value = startup()
        if scenario == "auth_root_entrypoint":
            value["auth"]["subcommand"] = ""
        elif scenario == "auth_index_worker_enabled":
            value["auth"]["index_worker_threshold"] = 1
        elif scenario in {"storage_standard_entrypoint", "storage_freeze_not_skip"}:
            value["storage"]["entrypoint"] = "dist/start/server.js"
            if scenario == "storage_freeze_not_skip":
                value["storage"]["freeze_at"] = "fixture_last_migration"
        elif scenario == "storage_multitenant_builder":
            value["storage"]["is_multitenant"] = True
        return v.startup_check(value)
    if scenario.startswith("manifest_"):
        raw = SPEC.read_bytes()
        record = {"path": str(SPEC.relative_to(ROOT)), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        if scenario == "manifest_path_escape":
            record["path"] = "../outside"
        else:
            record["sha256"] = "0" * 64
        return v.manifest_check(ROOT, {"files": [record]})
    raise RuntimeError("CASE_NOT_IMPLEMENTED")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True, help="New output only; prior FAILs never overwritten")
    args = parser.parse_args()
    seal = json.loads(SEAL.read_bytes())
    v.manifest_check(ROOT, {"files": seal["files"]})
    expected = json.loads(SPEC.read_bytes())
    results = []
    for case in expected["pure_properties"]:
        try:
            run_case(case["scenario"])
            observed = "ACCEPT"
        except v.RuleError as error:
            observed = str(error)
        except Exception:
            observed = "INSTRUMENT_ERROR"
        results.append({**case, "observed_code": observed,
                        "result": "PASS" if observed == case["expected_code"] else "FAIL"})
    report = {"schema": "h6015-independent-pure-results-v1",
              "created_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "expected_sha256": hashlib.sha256(SPEC.read_bytes()).hexdigest(),
              "instrument_sha256": hashlib.sha256((ROOT / "scripts/verify-h6-015-independent.py").read_bytes()).hexdigest(),
              "test_runner_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              "scope": "Pure fabricated instrument cases only; no SQL, provider, restore or executor evidence tested",
              "functional_independent_verdict": "NOT_EXECUTED", "results": results,
              "passed": sum(x["result"] == "PASS" for x in results),
              "failed": sum(x["result"] == "FAIL" for x in results)}
    with args.output.open("x") as target:
        json.dump(report, target, ensure_ascii=False, indent=2); target.write("\n")
    print(json.dumps({k: report[k] for k in ("passed", "failed", "functional_independent_verdict")}))
    return 1 if report["failed"] else 0


if __name__ == "__main__":
    sys.exit(main())
