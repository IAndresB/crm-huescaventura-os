#!/usr/bin/env python3
"""H6-014: read-only validation; optional append-only history in one new report.

No database, Storage, network, package installation or application imports.
P/N identifiers are preparation checks, never new normative requirements.
"""
import argparse
import copy
import datetime
import hashlib
import io
import json
import os
from pathlib import Path
import re
import shlex
import stat
import subprocess
import tarfile
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
DOC = "specs/001-core-crm/"
FIX = "tests/fixtures/h6-014/"
COR = "tests/fixtures/h6-014-corrective/"
CRITERIA_SHA = "82a270c5c100fcddad9eb1374487e784e0f9fa830a661fc6f43d5146806c6f5e"
BASELINE_SHA = "8233383e1ac6ce44f595acaee771af75c5e314476fd7093bec6032eaad478bdb"
R2_SHA = "e9d933b93a1b29e9761cc0b6081ba4ffce23bd59ca8624c545ecb86c422b5fc3"
R3_SHA = "9cf7d7e0017e7031be2f8660b1d89060082d68d2a398b5b1facb9007cc915cad"
ENV = dict(os.environ, GIT_OPTIONAL_LOCKS="0")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def read_json(path):
    return json.loads((ROOT / path).read_bytes())


def git(*args):
    # Callers use only literal, read-only Git subcommands below; no shell.
    return subprocess.check_output(["git", *args], cwd=ROOT, env=ENV).decode().strip()


def safe_path(value):
    if not isinstance(value, str) or not value or "\\" in value:
        return False
    p = Path(value)
    return not p.is_absolute() and ".." not in p.parts and (ROOT / p).resolve().is_relative_to(ROOT)


def protected(paths):
    accumulator = hashlib.sha256()
    total = 0
    for name in sorted(paths):
        path = ROOT / name
        data = path.read_bytes()
        mode = oct(stat.S_IMODE(path.stat().st_mode))
        total += len(data)
        row = [name, mode, len(data), digest(data)]
        accumulator.update(json.dumps(row, ensure_ascii=False, separators=(",", ":")).encode() + b"\n")
    return {"count": len(paths), "bytes": total, "descriptor_set_sha256": accumulator.hexdigest()}


def secret_errors(text):
    # Reports record rule identifiers only; never echo a matched value.
    patterns = {
        "jwt": r"\beyJ[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b",
        "private-key": r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
        "dsn-password": r"postgres(?:ql)?://[^\s/@:]+:[^\s/@]+@",
        "bearer": r"(?i)\bBearer\s+[A-Za-z0-9_.-]{24,}",
        "temporary-url": r"(?i)https?://[^\s<>\"']+[?&](?:token|signature|sig|x-amz-signature|access_token)=",
        "serialized-secret": r'(?i)"(?:secret|password|private_key|service_role_key)"\s*:\s*"[A-Za-z0-9_+/=-]{24,}"',
    }
    return ["SECRET:" + name for name, pattern in patterns.items() if re.search(pattern, text)]


def procedure_control(text):
    found = re.search(r"```json\n(.*?)\n```", text, re.S)
    if not found:
        raise ValueError("PROCEDURE_CONTROL_ABSENT")
    return json.loads(found.group(1))


def document_checks(text, outputs):
    errors = []
    parsed_blocks = 0
    checked_links = 0
    checked_imports = 0
    for target in re.findall(r"\[[^\]]+\]\(([^)]+)\)", text):
        url = urlsplit(target)
        if url.scheme in {"https", "http"}:
            continue
        destination = (ROOT / DOC / unquote(url.path)).resolve()
        if not destination.is_relative_to(ROOT):
            errors.append("REFERENCES")
            continue
        name = str(destination.relative_to(ROOT))
        if not destination.is_file():
            if name not in outputs:  # The evidence report is written after results.
                errors.append("REFERENCES")
            continue
        checked_links += 1
        if url.fragment and destination.suffix == ".md":
            content = destination.read_text()
            anchors = set(re.findall(r'<a id="([^"]+)"', content))
            for heading in re.findall(r"^#+\s+(.*)$", content, re.M):
                anchors.add(re.sub(r"[^\w\- ]", "", heading.lower()).replace(" ", "-"))
            if unquote(url.fragment) not in anchors:
                errors.append("REFERENCES")
    for block in re.findall(r"```sh\n(.*?)\n```", text, re.S):
        result = subprocess.run(["/bin/bash", "--noprofile", "--norc", "-n"], input=block,
                                text=True, capture_output=True,
                                env={"PATH": "/usr/bin:/bin", "BASH_ENV": "/dev/null"})
        parsed_blocks += 1
        if result.returncode:
            errors.append("PROCEDURE_CONCRETENESS")
    for names, target in re.findall(r"import \{([^}]+)\} from ['\"]([^'\"]+)['\"]", text):
        destination = (ROOT / DOC / target).resolve()
        if not destination.is_relative_to(ROOT) or not destination.is_file():
            errors.append("REFERENCES")
            continue
        content = destination.read_text()
        for name in names.split(","):
            if not re.search(r"export (?:async )?(?:function|class|const|type|interface) " + re.escape(name.strip()) + r"\b", content):
                errors.append("PROCEDURE_CONCRETENESS")
            checked_imports += 1
    return {"errors": sorted(set(errors)), "shell_blocks_parsed_not_executed": parsed_blocks,
            "relative_links_checked": checked_links, "existing_exports_checked": checked_imports}


def descriptor_errors(data, descriptor):
    return [] if descriptor.get("sha256") == digest(data) and descriptor.get("bytes") == len(data) else ["MANIFEST"]


def validate(e, inv, control, matrix, sources, expected_bytes, seal, procedure_text):
    errors = []

    def require(condition, code):
        if not condition:
            errors.append(code)

    require(digest(expected_bytes) == seal["sha256"], "EXPECTED_SEAL")
    require(e["base_commit"] == "07808f7d441452a8a2f251306824de3f8520b490", "SOURCE_IDENTITY")
    for record in e["sources"].values():
        data = sources.get(record["path"], b"")
        excerpt = "\n".join(data.decode().splitlines()[record["start"] - 1:record["end"]]) + "\n"
        require(digest(data) == record["file_sha256"] and digest(excerpt.encode()) == record["excerpt_sha256"], "SOURCE_IDENTITY")
    rows = inv.get("resources", [])
    ids = [row.get("id") for row in rows]
    require(len(ids) == len(set(ids)) and set(ids) == set(e["resources"]), "INVENTORY_COVERAGE")
    for row in rows:
        require(all(row.get(key) for key in e["required_inventory_fields"]), "INVENTORY_FIELDS")
        require(row.get("name") == e["resources"].get(row.get("id")), "INVENTORY_COVERAGE")
        require(row.get("availability") in e["availability_labels"], "AVAILABILITY")
        for asset in row.get("assets", []):
            require(asset.get("availability") in e["availability_labels"] and bool(asset.get("evidence")) and bool(asset.get("limitation")), "AVAILABILITY")
            # No new operational backup is accredited by this preparation.
            if row.get("id") in {"R01", "R03", "R07", "R13"}:
                require(not (asset.get("kind") == "operational-backup" and asset.get("availability") == "DISPONIBLE Y ACREDITADO"), "AVAILABILITY")
        require(set(row.get("procedure_steps", [])) <= set(e["steps"]), "PROCEDURE_ORDER")
        require(set(row.get("dependencies", [])) <= set(e["resources"]), "REFERENCES")
        for reference in row.get("references", []):
            path = reference.get("path")
            if not safe_path(path):
                errors.append("REFERENCES")
                continue
            file = ROOT / path
            require(file.is_file(), "REFERENCES")
            if file.is_file():
                data = file.read_bytes()
                require(digest(data) == reference.get("sha256"), "REFERENCES")
                require(isinstance(reference.get("line"), int) and 0 < reference["line"] <= len(data.splitlines()), "REFERENCES")

    steps = control.get("steps", [])
    require([s.get("id") for s in steps] == e["steps"], "PROCEDURE_ORDER")
    require([s.get("establishes") for s in steps] == e["required_gates"], "PROCEDURE_ORDER")
    established = set()
    for step in steps:
        require(set(step.get("requires", [])) <= established, "PROCEDURE_ORDER")
        require(set(step.get("resources", [])) <= set(e["resources"]), "REFERENCES")
        require(step.get("executed") is False, "SCOPE")
        established.add(step.get("establishes"))
        match = re.search(r"^## " + re.escape(step.get("id", "")) + r" — (.*?)(?=^## |\Z)", procedure_text, re.M | re.S)
        require(bool(match) and all(word in match.group(0) for word in ["Entrada:", "Salida observable:", "Parada:"]), "PROCEDURE_CONCRETENESS")
    for row in rows:
        require(all(row["id"] in next((s.get("resources", []) for s in steps if s.get("id") == step_id), []) for step_id in row.get("procedure_steps", [])), "PROCEDURE_ORDER")

    q = control.get("quarantine", {})
    require(q.get("sensitive_effects_suspended") is True and q.get("workers_started") is False and q.get("automatic_resume") is False, "QUARANTINE")
    cut = control.get("source_cut", {})
    require(all(cut.get(k) is True for k in ["all_writers_frozen", "multi_database_cut", "objects_separate", "witness_outside_restore"]), "SOURCE_CUT")
    require(all(control.get("protected_copy", {}).get(k) is True for k in ["raw_backup_is_sensitive", "omit_role_passwords", "preserve_owner_acl", "separate_protected_escrow"]), "PROTECTED_COPY")
    session = control.get("sessions", {})
    require(session.get("global_revocation_contract") == "H0013GlobalAccessRevocationAdapter.revokeAll" and all(session.get(k) is True for k in ["fresh_identification", "require_completed_and_auth_revoked", "deny_old_read_mutation_replay_objects", "disabled_actor_stays_disabled", "failure_keeps_quarantine"]), "SESSION_SAFETY")
    require(all(control.get("objects", {}).get(k) is True for k in ["recover_separately", "check_digest_size_media", "missing_is_not_recovered", "reauthorize_download"]), "OBJECT_SAFETY")
    ext = control.get("external", {})
    require(ext.get("automatic_resume") is False and all(ext.get(k) is True for k in ["provider_outside_rollback", "uncertain_keeps_reservation", "retry_requires_verified_prior_effect", "incomplete_source_does_not_prove_no_effect", "historical_approval_does_not_reapprove"]), "EXTERNAL_SAFETY")
    measure = control.get("measurement", {})
    require(bool(measure.get("loss_method")) and bool(measure.get("duration_method")) and all(measure.get(k) is None for k in ["rpo_target", "rto_target", "production_frequency", "production_cost", "live_measurements"]), "MEASUREMENT")
    for payload in [inv, control]:
        require(payload.get("claims") == e["forbidden_credit"], "SCOPE")
        require(payload.get("pending", {}).get("ARCH-PENDING-002") == "OPEN/PENDING" and payload.get("pending", {}).get("DM-PENDING-005") == "OPEN", "PENDING")
    require(control.get("prepared_only") is True and control.get("controls_are_required_future_conditions_not_observed_execution") is True, "SCOPE")
    require(inv.get("responsible_human") == "Andrés" and inv.get("technical_executor") == "ChatGPT Work", "INVENTORY_FIELDS")

    expected_ids = [a["id"] for a in e["assignments"]]
    mrows = matrix.get("rows", [])
    require(len(mrows) == 6 and [r.get("requirement") for r in mrows] == expected_ids, "NORMATIVE_MATRIX")
    check_ids = {c["id"] for c in e["positive_checks"]}
    for row, assignment in zip(mrows, e["assignments"]):
        require(row.get("task_assignment") == assignment, "NORMATIVE_MATRIX")
        require(set(row.get("source_ids", [])) <= set(e["sources"]), "NORMATIVE_MATRIX")
        require(bool(row.get("source_ids")) and bool(row.get("preparation_expected")) and bool(row.get("future_verification")), "NORMATIVE_MATRIX")
        require(set(row.get("resources", [])) <= set(e["resources"]) and set(row.get("procedure_steps", [])) <= set(e["steps"]) and set(row.get("local_checks", [])) <= check_ids, "NORMATIVE_MATRIX")
        require(row.get("global_requirement_satisfied") is False and row.get("integrated_verification_state") == "NO EJECUTADA", "SCOPE")
        require(assignment["literal"] in sources[assignment["path"]].decode().splitlines(), "SOURCE_IDENTITY")
    for payload in [inv, control, matrix]:
        errors.extend(x.split(":")[0] for x in secret_errors(json.dumps(payload, ensure_ascii=False)))
    errors.extend(recovery_checks(inv, control, procedure_text))
    return sorted(set(errors))


def corrective_criteria(raw=None):
    """Supplemental criterion sealed before this revision; original expected unchanged."""
    raw = (ROOT / (COR + "criteria.json")).read_bytes() if raw is None else raw
    if digest(raw) != CRITERIA_SHA:
        raise ValueError("CORRECTIVE_CRITERIA")
    seal = read_json(COR + "criteria-seal.json")
    if seal.get("sha256") != CRITERIA_SHA or not seal.get("before_corrected_deliverables"):
        raise ValueError("CORRECTIVE_CRITERIA")
    result = json.loads(raw)
    revision = (ROOT / (COR + "revision-r2.json")).read_bytes()
    if digest(revision) != R2_SHA:
        raise ValueError("CORRECTIVE_CRITERIA")
    supplement = json.loads(revision)
    if supplement["parent_criteria_sha256"] != CRITERIA_SHA:
        raise ValueError("CORRECTIVE_CRITERIA")
    revision3 = (ROOT / (COR + "revision-r3.json")).read_bytes()
    if digest(revision3) != R3_SHA:
        raise ValueError("CORRECTIVE_CRITERIA")
    latest = json.loads(revision3)
    if latest["parent_revision_criteria_sha256"] != R2_SHA or latest["parent_criteria_sha256"] != CRITERIA_SHA:
        raise ValueError("CORRECTIVE_CRITERIA")
    for path, expected_hash in {**supplement["sources"], **latest["sources"]}.items():
        if not safe_path(path) or digest((ROOT / path).read_bytes()) != expected_hash:
            raise ValueError("SOURCE_IDENTITY")
    for key in ["contract", "commands", "command_order", "extra_outputs"]:
        result[key] = latest[key]
    result["revision"] = latest
    return result


def recovery_checks(inv, control, text):
    """Validate a bounded, reviewed command model, not arbitrary shell/SQL semantics.

    Actual catalog, globals and effective-privilege evidence is a future H6-015 gate.
    Nothing here executes commands from the procedure or claims runtime equivalence.
    """
    criterion = corrective_criteria()
    errors = []
    contract = criterion["contract"]
    if control.get("database_recovery") != contract or inv.get("database_recovery") != contract:
        errors.append("RECOVERY_MECHANISM")
    for field, key in [("environment_generation_recovery", "renewal"), ("extension_recovery", "extension"), ("storage_database_recovery", "storage")]:
        if control.get(field) != criterion["revision"][key] or inv.get(field) != criterion["revision"][key]:
            errors.append({"renewal": "ENVIRONMENT_RENEWAL", "extension": "EXTENSION_RECOVERY", "storage": "RECOVERY_MECHANISM"}[key])
    extension_sql = re.search(r"<!-- H6014-EXTENSION-SQL -->\n```sql\n(.*?)\n```", text, re.S)
    if not extension_sql or extension_sql.group(1) + "\n" != criterion["revision"]["extension_sql"]:
        errors.append("EXTENSION_RECOVERY")
    parsed = []
    observed = []
    name_guards = [["test", "$H6015_SOURCE_DB", "=", "$H6015_ARCHIVE_DB"],
                   ["test", "$H6015_ARCHIVE_DB", "=", "$H6015_DEST_DB"],
                   ["test", "$H6015_DEST_DB", "!=", "$H6015_MAINT_DB"],
                   ["test", "$H6015_DEST_DB", "!=", "template0"],
                   ["test", "$H6015_DEST_DB", "!=", "template1"]]
    tools = {"pg_dumpall", "pg_dump", "pg_restore", "psql", "createdb", "initdb", "pg_ctl", "cmp"}
    for block in re.findall(r"```sh\n(.*?)\n```", text, re.S):
        lines = block.splitlines()
        marker = None
        guards = []
        block_tools = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("# H6014-CMD "):
                if marker is not None:
                    errors.append("RECOVERY_BINDING")
                marker = stripped.removeprefix("# H6014-CMD ")
                continue
            if not stripped or stripped.startswith("#"):
                continue
            try:
                tokens = shlex.split(stripped)
            except ValueError:
                errors.append("RECOVERY_BINDING")
                continue
            # The permitted shell is a fixed preparation recipe: no computed command
            # names, substitutions, eval, sourcing, compound commands or pipelines.
            if any(x in stripped for x in ["`", "$(", ";", "&&", "||"]) or (tokens and tokens[0] in {"eval", "source", "."}):
                errors.append("RECOVERY_BINDING")
            if tokens and Path(tokens[0]).name in tools:
                tool = Path(tokens[0]).name
                if ["set", "+x"] not in guards or ["set", "-euo", "pipefail"] not in guards:
                    errors.append("RECOVERY_BINDING")
                # Credit only guards already encountered, before their consumer.
                if tool == "pg_restore" and not all(item in guards for item in name_guards):
                    errors.append("RECOVERY_BINDING")
                if tool == "initdb" and ["[[", "$H6015_MAINT_DB", "=~", contract["maintenance_name_pattern"], "]]"] not in guards:
                    errors.append("RECOVERY_BINDING")
                block_tools.append(tool)
                # shlex normalizes quoting; separately require expansion inside
                # double quotes, so matching token text cannot hide unquoted argv.
                quote = None
                for pos, char in enumerate(stripped):
                    if char == '"' and quote != "'":
                        quote = None if quote == '"' else '"'
                    elif char == "'" and quote != '"':
                        quote = None if quote == "'" else "'"
                    elif char == "$" and quote != '"':
                        errors.append("RECOVERY_BINDING")
                if "\\" in stripped:
                    errors.append("RECOVERY_BINDING")
                if marker is None:
                    errors.append("RECOVERY_BINDING")
                else:
                    parsed.append(marker)
                    observed.append((marker, tokens))
                    if tokens != criterion["commands"].get(marker):
                        errors.append("RECOVERY_BINDING")
                if tool in {"pg_restore", "pg_dump", "pg_dumpall"}:
                    flags = set()
                    for token in tokens[1:]:
                        if token.startswith("--"):
                            flags.add(token.split("=", 1)[0])
                        elif token.startswith("-"):
                            # Command binding above rejects every unsupported token;
                            # these aliases additionally identify the security cause.
                            flags.update({"O": "--no-owner", "x": "--no-acl", "1": "--single-transaction", "C": "--create", "c": "--clean"}.get(ch, "") for ch in token[1:])
                    if flags & {"--no-owner", "--no-acl", "--no-privileges", "--disable-triggers", "--clean"}:
                        errors.append("RECOVERY_OPTIONS")
                    if tool == "pg_restore":
                        creates = marker in {"restore-database", "restore-storage"}
                        if ("--create" in flags) != creates or creates and "--single-transaction" in flags:
                            errors.append("RECOVERY_MECHANISM")
                        if not creates and "--single-transaction" not in flags:
                            errors.append("RECOVERY_MECHANISM")
            elif marker is not None:
                errors.append("RECOVERY_BINDING")
            elif tokens:
                if tokens[0] not in {"set", "umask", ":", "test", "[["}:
                    errors.append("RECOVERY_BINDING")
                if tokens[0] == "set" and tokens not in [["set", "+x"], ["set", "-euo", "pipefail"]]:
                    errors.append("RECOVERY_BINDING")
                if tokens[0] == "umask" and tokens != ["umask", "077"]:
                    errors.append("RECOVERY_BINDING")
                guards.append(tokens)
            marker = None
        if marker is not None:
            errors.append("RECOVERY_BINDING")
        if ["set", "+x"] not in guards or ["set", "-euo", "pipefail"] not in guards:
            errors.append("RECOVERY_BINDING")
        if "initdb" in block_tools and ["[[", "$H6015_MAINT_DB", "=~", contract["maintenance_name_pattern"], "]]"] not in guards:
            errors.append("RECOVERY_BINDING")
    if parsed != criterion["command_order"]:
        errors.append("RECOVERY_MECHANISM")
    # Inspect the actual parsed argv: maintenance is a connection DB, never a
    # destination-name override. No precreated business database is permitted.
    creates = [argv for key, argv in observed if key in {"restore-database", "restore-storage"}]
    if len(creates) != 2 or any('--dbname=$H6015_MAINT_DB' not in argv for argv in creates) or any(Path(argv[0]).name == "createdb" for _, argv in observed):
        errors.append("RECOVERY_MECHANISM")
    sql = re.search(r"<!-- H6014-DATABASE-PROPERTIES-SQL -->\n```sql\n(.*?)\n```", text, re.S)
    if not sql or digest((sql.group(1) + "\n").encode()) != contract["property_snapshot_sql_sha256"]:
        errors.append("RECOVERY_MECHANISM")
    # Availability is a typed claim anchored to the audited registry and immutable
    # source hashes. This correction creates no operational backup, on any resource.
    for row in inv.get("resources", []):
        prior = criterion["availability_registry"].get(row.get("id"))
        if prior is None or row.get("availability") != prior["availability"]:
            errors.append("AVAILABILITY")
            continue
        assets = row.get("assets", [])
        if len(assets) != len(prior["assets"]):
            errors.append("AVAILABILITY")
        for asset, original in zip(assets, prior["assets"]):
            fields = {"name", "availability", "evidence", "limitation", "evidence_class", "operational_backup"}
            expected_class = ("installed-tool" if row["id"] == "R15" else "repository-source") if original["availability"] == "DISPONIBLE Y ACREDITADO" else "not-accredited"
            if (set(asset) != fields or any(asset.get(k) != v for k, v in original.items())
                    or asset.get("evidence_class") != expected_class or asset.get("operational_backup") is not False):
                errors.append("AVAILABILITY")
    return sorted(set(errors))


def compare_database_properties(source, destination, resource_kind="core"):
    """Pure comparison of protected catalog snapshots; return codes, never values.

    Input is produced independently by the documented SQL, not this validator.
    PUBLIC/ALL use JSON null, avoiding ambiguous role names and physical OIDs.
    """
    def normalized(value):
        if not isinstance(value, dict) or set(value) != {"database", "owner", "acl", "settings"}:
            raise ValueError("PROPERTY_SNAPSHOT")
        if not all(isinstance(value[k], str) and value[k] for k in ["database", "owner"]):
            raise ValueError("PROPERTY_SNAPSHOT")
        if not isinstance(value["acl"], list) or not isinstance(value["settings"], list):
            raise ValueError("PROPERTY_SNAPSHOT")
        for row in value["acl"]:
            if (not isinstance(row, list) or len(row) != 4 or not isinstance(row[0], str) or not row[0]
                    or not (row[1] is None or isinstance(row[1], str) and row[1])
                    or row[2] not in {"CONNECT", "CREATE", "TEMPORARY"} or type(row[3]) is not bool):
                raise ValueError("PROPERTY_SNAPSHOT")
        for row in value["settings"]:
            if (not isinstance(row, list) or len(row) != 2 or not (row[0] is None or isinstance(row[0], str) and row[0])
                    or not isinstance(row[1], str) or "=" not in row[1] or not row[1].split("=", 1)[0]):
                raise ValueError("PROPERTY_SNAPSHOT")
        return {"database": value["database"], "owner": value["owner"],
                "acl": sorted(json.dumps(row, ensure_ascii=False) for row in value["acl"]),
                "database_settings": sorted(row[1] for row in value["settings"] if row[0] is None),
                "role_database_settings": sorted(json.dumps(row, ensure_ascii=False) for row in value["settings"] if row[0] is not None)}
    try:
        left, right = normalized(source), normalized(destination)
    except (ValueError, TypeError):
        return ["PROPERTY_SNAPSHOT"]
    errors = []
    for key, code in {"database": "DATABASE_NAME", "owner": "DATABASE_OWNER", "acl": "DATABASE_ACL", "database_settings": "DATABASE_SETTINGS", "role_database_settings": "ROLE_DATABASE_SETTINGS"}.items():
        if left[key] != right[key]:
            errors.append(code)
    if resource_kind not in {"core", "storage"}:
        errors.append("PROPERTY_SNAPSHOT")
    if resource_kind == "core" and any(row[1] is None and row[2] in {"CONNECT", "TEMPORARY"} for value in [source, destination] for row in value["acl"]):
        errors.append("PUBLIC_DATABASE_PRIVILEGE")
    return sorted(set(errors))


def partition_restore_toc(text, database, owner="crm_h0_migration", resource_kind="core"):
    """Pure bounded TOC partition, preserving every entry exactly once.

    The H6-015 independent receipt must bind names/owner and inspect the actual
    archive/catalog. Unsupported identifier/TOC variants fail, never guess.
    """
    if not all(re.fullmatch(r"[a-z_][a-z0-9_]*", x) for x in [database, owner]):
        raise ValueError("TOC_IDENTITY")
    if resource_kind not in {"core", "storage"} or resource_kind == "storage" and (database, owner) != ("postgres", "postgres"):
        raise ValueError("TOC_IDENTITY")
    groups = {"database": [], "crypto-schema": [], "content": []} if resource_kind == "core" else {"archive": []}
    ids = set()
    schemas = extensions = databases = storage_schemas = 0
    for line in text.splitlines():
        if not line or line.startswith(";"):
            continue
        match = re.fullmatch(r"(\d+);\s+\d+\s+\d+\s+(.+)", line)
        if not match or match[1] in ids:
            raise ValueError("TOC_FORMAT")
        ids.add(match[1])
        tail = match[2].rstrip()
        if resource_kind == "storage":
            if tail == f"DATABASE - {database} {owner}":
                databases += 1
            elif tail == f"DATABASE PROPERTIES - {database} {owner}" or any(tail == f"{kind} - DATABASE {database} {owner}" for kind in ["ACL", "COMMENT", "SECURITY LABEL"]):
                pass
            elif tail.startswith("DATABASE ") or re.match(r"(?:ACL|COMMENT|SECURITY LABEL) - DATABASE ", tail):
                raise ValueError("TOC_IDENTITY")
            if tail.startswith("EXTENSION ") or re.match(r"SCHEMA - crm_crypto(?: |$)", tail):
                raise ValueError("STORAGE_UNREVIEWED_VARIANT")
            if re.match(r"SCHEMA - storage [a-z_][a-z0-9_]*$", tail):
                storage_schemas += 1
            groups["archive"].append(line)
            continue
        if tail == f"DATABASE - {database} {owner}":
            group = "database"
            databases += 1
        elif tail == f"DATABASE PROPERTIES - {database} {owner}" or any(tail == f"{kind} - DATABASE {database} {owner}" for kind in ["ACL", "COMMENT", "SECURITY LABEL"]):
            group = "database"
        elif tail == f"SCHEMA - crm_crypto {owner}":
            group = "crypto-schema"
            schemas += 1
        else:
            if tail.startswith("DATABASE ") or re.match(r"(?:ACL|COMMENT|SECURITY LABEL) - DATABASE ", tail):
                raise ValueError("TOC_IDENTITY")
            group = "content"
            if tail in {"EXTENSION - pgcrypto", "EXTENSION - pgcrypto -"}:
                extensions += 1
        groups[group].append(line)
    if resource_kind == "storage":
        if databases != 1 or storage_schemas != 1:
            raise ValueError("TOC_COVERAGE")
        return {"archive": "\n".join(groups["archive"]) + "\n"}
    if databases != 1 or schemas != 1 or extensions != 1 or not groups["content"]:
        raise ValueError("TOC_COVERAGE")
    return {key: "\n".join(lines) + "\n" for key, lines in groups.items()}


def compare_pgcrypto_properties(source, destination, bootstrap):
    """Compare independently captured extension catalog, not caller assertions.

    Only the documented builtin bootstrap owner of default-ACL native C members
    may correspond across clusters; extension/schema/CRM ownership stays exact.
    """
    try:
        if set(bootstrap) != {"source_role", "source_oid", "destination_role", "destination_oid"}:
            return ["EXTENSION_BOOTSTRAP"]
        if type(bootstrap["source_oid"]) is not int or type(bootstrap["destination_oid"]) is not int or bootstrap["source_oid"] != 10 or bootstrap["destination_oid"] != 10:
            return ["EXTENSION_BOOTSTRAP"]
        results = []
        for obj in [source, destination]:
            if set(obj) != {"name", "schema", "version", "owner", "members"} or not isinstance(obj["members"], list) or not obj["members"]:
                return ["EXTENSION_SNAPSHOT"]
            if (obj["name"], obj["schema"], obj["version"], obj["owner"]) != ("pgcrypto", "crm_crypto", "1.3", "crm_h0_migration"):
                results.append("EXTENSION_OWNER_VERSION")
        def normalized(obj, role):
            rows = []
            for member in obj["members"]:
                if set(member) != {"identity", "kind", "owner", "language", "security_definer", "acl_default", "extension_member"}:
                    raise ValueError("EXTENSION_SNAPSHOT")
                if (member["kind"] != "function" or member["language"] != "c" or member["security_definer"] is not False
                        or member["acl_default"] is not True or member["extension_member"] is not True or member["owner"] != role
                        or not isinstance(member["identity"], str) or not member["identity"].startswith("crm_crypto.")):
                    raise ValueError("EXTENSION_MEMBER_AUTHORITY")
                # Logical identity, multiplicity and all other member properties
                # remain exact; no blanket owner normalization is performed.
                rows.append(member["identity"])
            if len(rows) != len(set(rows)):
                raise ValueError("EXTENSION_SNAPSHOT")
            return sorted(rows)
        if normalized(source, bootstrap["source_role"]) != normalized(destination, bootstrap["destination_role"]):
            results.append("EXTENSION_MEMBERS")
        return sorted(set(results))
    except (KeyError, TypeError, ValueError) as error:
        return [str(error) if isinstance(error, ValueError) else "EXTENSION_SNAPSHOT"]


def verify_generation_transition(before, after):
    """Pure metadata check. Key custody/randomness/parameterized SQL need real proof."""
    try:
        for family in ["F1", "F2"]:
            previous = before[family]
            final = after[family]
            if not previous or not final:
                return ["ENVIRONMENT_RENEWAL"]
            for old in previous:
                if not any(row["key_id"] == old["key_id"] and row["generation"] == old["generation"] and row["enabled"] is False for row in final):
                    return ["ENVIRONMENT_RENEWAL"]
            active = [row for row in final if row["enabled"] is True]
            if len(active) != 1 or not active[0]["generation"] or active[0]["generation"] in {row["generation"] for row in previous} or active[0]["key_id"] in {row["key_id"] for row in previous}:
                return ["ENVIRONMENT_RENEWAL"]
        return []
    except (KeyError, TypeError):
        return ["ENVIRONMENT_RENEWAL"]


def original_candidate_check():
    baseline_bytes = (ROOT / (COR + "baseline.json")).read_bytes()
    if digest(baseline_bytes) != BASELINE_SHA:
        return {"errors": ["ORIGINAL_CANDIDATE"]}
    baseline = json.loads(baseline_bytes)
    archive = (ROOT / baseline["archive"]["path"]).read_bytes()
    errors = []
    if digest(archive) != baseline["archive"]["sha256"] or len(archive) != baseline["archive"]["bytes"]:
        errors.append("ORIGINAL_CANDIDATE")
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as bundle:
        if set(bundle.getnames()) != set(baseline["original_candidate_files"]):
            errors.append("ORIGINAL_CANDIDATE")
        for path, descriptor in baseline["original_candidate_files"].items():
            member = bundle.getmember(path)
            data = bundle.extractfile(member).read()  # in memory, never extractall
            if descriptor_errors(data, descriptor) or oct(member.mode) != descriptor["mode"]:
                errors.append("ORIGINAL_CANDIDATE")
            if path not in {DOC + "procedure-TSK-H6-014.md", DOC + "inventory-TSK-H6-014.json", "scripts/verify-h6-014-preparation.py"}:
                if (ROOT / path).read_bytes() != data:
                    errors.append("ORIGINAL_CANDIDATE")
    if digest((ROOT / (COR + "authorization.txt")).read_bytes()) != baseline["corrective_authorization_sha256"]:
        errors.append("ORIGINAL_CANDIDATE")
    return {"errors": sorted(set(errors)), "files_reconstructible": len(baseline["original_candidate_files"]),
            "archive_sha256": digest(archive), "original_manifest_sha256": baseline["original_manifest_sha256"],
            "original_results_untouched": not errors}


def counterexamples(e, inv, control, matrix, sources, expected_bytes, seal, text):
    observations = []
    for case in e["negative_cases"]:
        i, c, m, s, b = copy.deepcopy(inv), copy.deepcopy(control), copy.deepcopy(matrix), dict(sources), expected_bytes
        name = case["mutation"]
        if name == "omit-resource":
            i["resources"] = [r for r in i["resources"] if r["id"] != "R05"]
        elif name == "duplicate-resource":
            i["resources"].append(copy.deepcopy(i["resources"][0]))
        elif name == "unknown-availability":
            i["resources"][0]["availability"] = "ASSUMED"
        elif name == "unproved-backup":
            i["resources"][0]["assets"].append({"kind": "operational-backup", "availability": "DISPONIBLE Y ACREDITADO", "evidence": "not-observed", "limitation": "counterexample"})
        elif name == "missing-revocation-gate":
            c["sessions"]["require_completed_and_auth_revoked"] = False
        elif name == "automatic-resume":
            c["external"]["automatic_resume"] = True
        elif name == "lost-uncertainty":
            c["external"]["uncertain_keeps_reservation"] = False
        elif name == "source-tamper":
            path = next(iter(e["sources"].values()))["path"]
            s[path] = s[path] + b"\nchanged\n"
        elif name == "normative-row-tamper":
            m["rows"][0]["task_assignment"]["literal"] += " changed"
        elif name == "path-traversal":
            i["resources"][0]["references"][0]["path"] = "../outside-allowed-root"
        elif name == "integrated-credit":
            c["claims"]["AC-073_global"] = True
        elif name == "invented-rpo":
            c["measurement"]["rpo_target"] = 1
        elif name == "storage-omission":
            c["objects"]["recover_separately"] = False
        elif name == "jwt-material":
            i["resources"][0]["risks"].append("eyJ" + "a" * 25 + "." + "b" * 25 + "." + "c" * 25)
        elif name == "private-key-material":
            i["resources"][0]["risks"].append("-----BEGIN " + "PRIVATE KEY-----")
        elif name == "dsn-password":
            i["resources"][0]["risks"].append("postgresql://" + "synthetic:never-a-real-password@127.0.0.1/test")
        elif name == "expected-tamper":
            b += b"\n"
        elif name == "manifest-tamper":
            observed = descriptor_errors(b"synthetic-nonsecret-payload", {"bytes": 0, "sha256": "0" * 64})
        else:
            raise ValueError("UNKNOWN_COUNTEREXAMPLE")
        if name != "manifest-tamper":
            observed = validate(e, i, c, m, s, b, seal, text)
        observations.append({"id": case["id"], "mutation": name, "expected_error": case["expected_error"], "observed_errors": observed, "result": "PASS" if case["expected_error"] in observed else "FAIL", "in_memory_only": True})
    return observations


def manifest_check(e):
    manifest = read_json(COR + "manifest.json")
    files = manifest.get("files", {})
    expected_paths = (set(e["outputs"]) | set(corrective_criteria()["extra_outputs"])) - {COR + "manifest.json"}
    errors = []
    if set(files) != expected_paths or manifest.get("base_commit") != e["base_commit"]:
        errors.append("MANIFEST")
    for path, desc in files.items():
        if path not in expected_paths or not safe_path(path):
            errors.append("MANIFEST")
            continue
        file = ROOT / path
        if not file.is_file():
            errors.append("MANIFEST")
            continue
        errors.extend(descriptor_errors(file.read_bytes(), desc))
        if desc.get("mode") != oct(stat.S_IMODE(file.stat().st_mode)):
            errors.append("MANIFEST")
    if manifest.get("original_manifest_sha256") != "5dea28d050d8c8fb194cdc03929baaf3a3196a058204d26c8025520ae7990db4":
        errors.append("MANIFEST")
    return {"result": "PASS" if not errors else "FAIL", "files_checked": len(files), "errors": sorted(set(errors)), "manifest_sha256": digest((ROOT / (COR + "manifest.json")).read_bytes()), "self_excluded": True}


def corrective_counterexamples(e, inv, control, matrix, sources, expected_bytes, seal, text):
    observations = []

    def observe(name, expected_code, errors):
        observations.append({"id": name, "expected_error": expected_code,
                             "observed_errors": errors,
                             "result": "PASS" if (expected_code in errors if expected_code else not errors) else "FAIL",
                             "in_memory_only": True})

    def mutate_command(content, command_id, change):
        pattern = r"(# H6014-CMD " + re.escape(command_id) + r"\n)([^\n]+)"
        return re.sub(pattern, lambda match: match.group(1) + change(match.group(2)), content)

    def mutated(name, code, change):
        i, c = copy.deepcopy(inv), copy.deepcopy(control)
        changed_text = change(i, c, text)
        observe(name, code, validate(e, i, c, matrix, sources, expected_bytes, seal, changed_text))

    archive = (ROOT / (COR + "original-candidate.tar.gz")).read_bytes()
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:gz") as bundle:
        old_text = bundle.extractfile(DOC + "procedure-TSK-H6-014.md").read().decode()
        old_inv = json.loads(bundle.extractfile(DOC + "inventory-TSK-H6-014.json").read())
    observe("original-M1", "RECOVERY_MECHANISM", validate(e, old_inv, procedure_control(old_text), matrix, sources, expected_bytes, seal, old_text))
    for name, option in [("long-no-owner", "--no-owner"), ("short-no-owner", "-O"), ("no-acl", "--no-privileges"), ("short-no-acl", "-x")]:
        mutated(name, "RECOVERY_OPTIONS", lambda i, c, t, flag=option: mutate_command(t, "restore-database", lambda line: line.replace("--exit-on-error", flag + " --exit-on-error")))
    mutated("missing-create", "RECOVERY_MECHANISM", lambda i, c, t: mutate_command(t, "restore-database", lambda line: line.replace("--create ", "")))
    mutated("create-in-transaction", "RECOVERY_MECHANISM", lambda i, c, t: mutate_command(t, "restore-database", lambda line: line.replace("--exit-on-error", "--single-transaction --exit-on-error")))
    mutated("wrong-maintenance", "RECOVERY_MECHANISM", lambda i, c, t: mutate_command(t, "restore-database", lambda line: line.replace('$H6015_MAINT_DB', '$H6015_DEST_DB')))
    mutated("unmarked-command", "RECOVERY_BINDING", lambda i, c, t: t.replace("# H6014-CMD restore-database\n", ""))
    mutated("name-remapping", "RECOVERY_MECHANISM", lambda i, c, t: (c["database_recovery"].update(name_policy="rename-with-sed"), t)[1])
    mutated("missing-property-query", "RECOVERY_MECHANISM", lambda i, c, t: t.replace("COALESCE(db.datacl, acldefault('d', db.datdba))", "db.datacl"))
    mutated("invented-R02-backup", "AVAILABILITY", lambda i, c, t: (i["resources"][1]["assets"].append({"kind": "operational-backup", "availability": "DISPONIBLE Y ACREDITADO", "evidence": "not-observed", "limitation": "in-memory"}), t)[1])
    mutated("changed-main-availability", "AVAILABILITY", lambda i, c, t: (i["resources"][0].update(availability="DISPONIBLE Y ACREDITADO"), t)[1])
    mutated("capacity-promoted-to-backup", "AVAILABILITY", lambda i, c, t: (i["resources"][1]["assets"][0].update(operational_backup=True), t)[1])
    mutated("inventory-contract-conflict", "RECOVERY_MECHANISM", lambda i, c, t: (i["database_recovery"].update(resume_on_exit_zero=True), t)[1])
    mutated("disabled-comparison", "RECOVERY_MECHANISM", lambda i, c, t: re.sub(r"# H6014-CMD compare-properties\n[^\n]+\n?", "", t))
    mutated("lost-witness", "SOURCE_CUT", lambda i, c, t: (c["source_cut"].update(witness_outside_restore=False), t)[1])
    try:
        corrective_criteria((ROOT / (COR + "criteria.json")).read_bytes() + b"\n")
        tamper_errors = []
    except ValueError:
        tamper_errors = ["CORRECTIVE_CRITERIA"]
    observe("corrective-criteria-tamper", "CORRECTIVE_CRITERIA", tamper_errors)

    synthetic = {"database": "h6015_synthetic", "owner": "crm_h0_migration",
                 "acl": [["crm_h0_migration", "crm_h0_migration", "CREATE", True],
                         ["crm_h0_migration", "crm_h0_runtime", "CONNECT", False]],
                 "settings": [[None, "search_path=crm_api, pg_catalog"], ["crm_h0_runtime", "statement_timeout=5s"]]}
    # Values are test-only, not new product defaults or an observed DB catalog.
    changes = {
        "owner-drift": ("DATABASE_OWNER", lambda d: d.update(owner="other_synthetic_owner")),
        "public-connect": ("PUBLIC_DATABASE_PRIVILEGE", lambda d: d["acl"].append(["crm_h0_migration", None, "CONNECT", False])),
        "public-temp": ("PUBLIC_DATABASE_PRIVILEGE", lambda d: d["acl"].append(["crm_h0_migration", None, "TEMPORARY", False])),
        "database-setting-loss": ("DATABASE_SETTINGS", lambda d: d.update(settings=[row for row in d["settings"] if row[0] is not None])),
        "role-database-setting-loss": ("ROLE_DATABASE_SETTINGS", lambda d: d.update(settings=[row for row in d["settings"] if row[0] is None])),
        "grant-option-drift": ("DATABASE_ACL", lambda d: d["acl"][1].__setitem__(3, True)),
        "name-drift": ("DATABASE_NAME", lambda d: d.update(database="different_synthetic_database")),
        "equal-properties": (None, lambda d: None),
        "acl-order-only": (None, lambda d: d["acl"].reverse()),
    }
    for name, (code, change) in changes.items():
        destination = copy.deepcopy(synthetic)
        change(destination)
        observe(name, code, compare_database_properties(synthetic, destination))
    if [o["id"] for o in observations] != corrective_criteria()["countertests_expected"]:
        raise ValueError("CORRECTIVE_TEST_INVENTORY")
    # Additional focused guard regressions; supplement the sealed 27 cases without
    # changing that criterion or the original expected.
    mutated("missing-name-guard", "RECOVERY_BINDING", lambda i, c, t: t.replace('test "$H6015_SOURCE_DB" = "$H6015_ARCHIVE_DB"\n', ""))
    mutated("missing-fail-fast", "RECOVERY_BINDING", lambda i, c, t: t.replace("set -euo pipefail\n", "", 1))
    mutated("unquoted-connection", "RECOVERY_BINDING", lambda i, c, t: mutate_command(t, "restore-database", lambda line: line.replace('"$H6015_DEST_SOCKET"', '$H6015_DEST_SOCKET')))
    mutated("unmodeled-command", "RECOVERY_BINDING", lambda i, c, t: t.replace("# H6014-CMD restore-database", "echo unmodeled-command\n# H6014-CMD restore-database"))
    for name, command in [("late-disable-errexit", "set +e"), ("late-enable-xtrace", "set -x"),
                          ("late-disable-nounset", "set +u"), ("late-disable-pipefail", "set +o pipefail"),
                          ("late-relax-umask", "umask 000")]:
        mutated(name, "RECOVERY_BINDING", lambda i, c, t, cmd=command: t.replace("set -euo pipefail\n", "set -euo pipefail\n" + cmd + "\n"))
    mutated("restored-environment-generation", "ENVIRONMENT_RENEWAL", lambda i, c, t: (c["environment_generation_recovery"].update(fresh_F1_F2_generation_keys=False), t)[1])
    mutated("extension-as-bootstrap", "EXTENSION_RECOVERY", lambda i, c, t: t.replace("SET LOCAL ROLE crm_h0_migration;", "SET LOCAL ROLE temporary_bootstrap;"))
    before = {k: [{"key_id": k + "-old", "generation": k + "-old-generation", "enabled": True}] for k in ["F1", "F2"]}
    after = {k: [{**before[k][0], "enabled": False}, {"key_id": k + "-new", "generation": k + "-new-generation", "enabled": True}] for k in before}
    observe("generation-renewal-positive", None, verify_generation_transition(before, after))
    observe("generation-renewal-omitted", "ENVIRONMENT_RENEWAL", verify_generation_transition(before, before))
    source_extension = {"name": "pgcrypto", "schema": "crm_crypto", "version": "1.3", "owner": "crm_h0_migration",
                        "members": [{"identity": "crm_crypto.hmac(bytea,bytea,text)", "kind": "function", "owner": "source_bootstrap", "language": "c", "security_definer": False, "acl_default": True, "extension_member": True}]}
    destination_extension = copy.deepcopy(source_extension)
    destination_extension["members"][0]["owner"] = "destination_bootstrap"
    bootstrap = {"source_role": "source_bootstrap", "source_oid": 10, "destination_role": "destination_bootstrap", "destination_oid": 10}
    observe("extension-builtin-correspondence", None, compare_pgcrypto_properties(source_extension, destination_extension, bootstrap))
    wrong = copy.deepcopy(destination_extension)
    wrong["owner"] = "destination_bootstrap"
    observe("extension-owner-drift", "EXTENSION_OWNER_VERSION", compare_pgcrypto_properties(source_extension, wrong, bootstrap))
    wrong = copy.deepcopy(destination_extension)
    wrong["members"][0]["security_definer"] = True
    observe("extension-definer-mapping-denied", "EXTENSION_MEMBER_AUTHORITY", compare_pgcrypto_properties(source_extension, wrong, bootstrap))
    observe("extension-bootstrap-unproved", "EXTENSION_BOOTSTRAP", compare_pgcrypto_properties(source_extension, destination_extension, {**bootstrap, "source_oid": 11}))
    toc = "1; 1262 100 DATABASE - synthetic crm_h0_migration\n2; 0 0 DATABASE PROPERTIES - synthetic crm_h0_migration\n3; 0 0 ACL - DATABASE synthetic crm_h0_migration\n4; 2615 110 SCHEMA - crm_crypto crm_h0_migration\n5; 3079 120 EXTENSION - pgcrypto \n6; 1259 130 TABLE crm_private sample crm_h0_table_owner\n7; 0 130 TABLE DATA crm_private sample crm_h0_table_owner\n"
    partitions = partition_restore_toc(toc, "synthetic")
    original_lines = toc.splitlines()
    partition_lines = [line for value in partitions.values() for line in value.splitlines()]
    observe("toc-complete-disjoint", None, [] if sorted(original_lines) == sorted(partition_lines) else ["TOC_COVERAGE"])
    for name, changed in [("toc-missing-database", "\n".join(toc.splitlines()[1:]) + "\n"), ("toc-duplicate-id", toc + toc.splitlines()[0] + "\n")]:
        try:
            partition_restore_toc(changed, "synthetic")
            result = []
        except ValueError:
            result = ["TOC_REJECTED"]
        observe(name, "TOC_REJECTED", result)
    storage_toc = "1; 1262 5 DATABASE - postgres postgres\n2; 0 0 DATABASE PROPERTIES - postgres postgres\n3; 0 0 ACL - DATABASE postgres postgres\n4; 2615 220 SCHEMA - storage postgres\n5; 1259 230 TABLE storage objects supabase_storage_admin\n6; 0 230 TABLE DATA storage objects supabase_storage_admin\n"
    storage = partition_restore_toc(storage_toc, "postgres", "postgres", "storage")
    observe("storage-complete-without-core-objects", None, [] if storage == {"archive": storage_toc} else ["TOC_COVERAGE"])
    for name, changed, database, owner, kind in [
        ("core-rejects-storage-toc", storage_toc, "postgres", "postgres", "core"),
        ("storage-rejects-core-toc", toc, "postgres", "postgres", "storage"),
        ("storage-rejects-added-extension", storage_toc + "7; 3079 240 EXTENSION - pgcrypto \n", "postgres", "postgres", "storage"),
        ("storage-rejects-wrong-owner", storage_toc, "postgres", "other_owner", "storage"),
        ("storage-rejects-wrong-name", storage_toc, "other_database", "postgres", "storage"),
    ]:
        try:
            partition_restore_toc(changed, database, owner, kind)
            result = []
        except ValueError:
            result = ["TOC_REJECTED"]
        observe(name, "TOC_REJECTED", result)
    for name, change in [
        ("storage-missing-create", lambda line: line.replace("--create ", "")),
        ("storage-create-in-transaction", lambda line: line.replace("--exit-on-error", "--single-transaction --exit-on-error")),
        ("storage-partial-archive", lambda line: line.replace("--exit-on-error", '--use-list="$H6015_PRIVATE_DIR/content.list" --exit-on-error')),
    ]:
        mutated(name, "RECOVERY_BINDING", lambda i, c, t, change=change: mutate_command(t, "restore-storage", change))
    def late_guard(content, guard):
        content = content.replace(guard + "\n", "", 1)
        return mutate_command(content, "compare-properties", lambda line: line + "\n" + guard)
    for index, guard in enumerate([
        'test "$H6015_SOURCE_DB" = "$H6015_ARCHIVE_DB"',
        'test "$H6015_ARCHIVE_DB" = "$H6015_DEST_DB"',
        'test "$H6015_DEST_DB" != "$H6015_MAINT_DB"',
        'test "$H6015_DEST_DB" != template0',
        'test "$H6015_DEST_DB" != template1',
    ], 1):
        mutated("late-name-guard-" + str(index), "RECOVERY_BINDING", lambda i, c, t, guard=guard: late_guard(t, guard))
    maintenance_guard = '[[ "$H6015_MAINT_DB" =~ ^h6015_maint_[a-z0-9_]{1,40}$ ]]'
    mutated("late-maintenance-guard", "RECOVERY_BINDING", lambda i, c, t: mutate_command(t.replace(maintenance_guard + "\n", ""), "init-cluster", lambda line: line + "\n" + maintenance_guard))
    mutated("storage-core-contract-conflict", "RECOVERY_MECHANISM", lambda i, c, t: (c["storage_database_recovery"].update(crm_extension_recipe_applicable=True), t)[1])
    return observations


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", action="store_true", help="Append only to h6-014-corrective/results.json; historical results are immutable")
    parser.add_argument("--check-manifest", action="store_true", help="Read-only final integrity check; never rewrite a sealed report")
    args = parser.parse_args()
    if args.output and args.check_manifest:
        parser.error("manifest verification cannot write results")
    expected_bytes = (ROOT / (DOC + "expected-TSK-H6-014.json")).read_bytes()
    e = json.loads(expected_bytes)
    seal = read_json(FIX + "expected-seal.json")
    inv = read_json(DOC + "inventory-TSK-H6-014.json")
    text = (ROOT / (DOC + "procedure-TSK-H6-014.md")).read_text()
    control = procedure_control(text)
    matrix = read_json(DOC + "matrix-TSK-H6-014.json")
    pre = read_json(FIX + "preflight.json")
    sources = {row["path"]: (ROOT / row["path"]).read_bytes() for row in e["sources"].values()}
    errors = validate(e, inv, control, matrix, sources, expected_bytes, seal, text)
    negatives = counterexamples(e, inv, control, matrix, sources, expected_bytes, seal, text)
    document = document_checks(text, e["outputs"] + corrective_criteria()["extra_outputs"])
    errors.extend(document["errors"])
    original = original_candidate_check()
    errors.extend(original["errors"])
    corrective_tests = corrective_counterexamples(e, inv, control, matrix, sources, expected_bytes, seal, text)
    if any(case["result"] != "PASS" for case in corrective_tests):
        errors.append("CORRECTIVE_COUNTEREXAMPLES")

    tracked = [p for p in git("ls-files", "-z").split("\0") if p]
    excluded = read_json("tests/fixtures/h6-013-closure/publication-inventory.json")["excludedAccepted"]
    tracked_now = protected(tracked)
    excluded_now = protected(list(excluded))
    preserve = all(all(now[k] == prior[k] for k in now) for now, prior in [(tracked_now, pre["tracked_protection"]), (excluded_now, pre["historical_excluded_protection"])])
    preserve = preserve and digest((ROOT / ".git/index").read_bytes()) == pre["index_sha256"] and not git("status", "--porcelain=v2", "--untracked-files=no")
    preserve = preserve and git("rev-parse", "HEAD") == e["base_commit"] and git("rev-parse", "HEAD^{tree}") == e["base_tree"]
    others = {p for p in git("ls-files", "--others", "--exclude-standard", "-z").split("\0") if p}
    unexpected_new = others - set(excluded) - set(e["outputs"]) - set(corrective_criteria()["extra_outputs"])
    preserve = preserve and not unexpected_new and set(excluded) <= others
    migrations = read_json("tests/fixtures/h6-013/migrations.json")["migrations"]
    preserve = preserve and len(migrations) == 68 and all(digest((ROOT / row["path"]).read_bytes()) == row["sha256"] for row in migrations)
    if not preserve:
        errors.append("PRESERVATION")
    if digest((ROOT / (FIX + "authorization.txt")).read_bytes()) != e["authority"]["authorization_sha256"]:
        errors.append("EXPECTED_SEAL")
    if not seal.get("before_deliverables") or datetime.datetime.fromisoformat(seal["sealed_utc"]) > datetime.datetime.fromisoformat(pre["checked_utc"]):
        errors.append("EXPECTED_SEAL")
    capabilities = pre.get("tools", {})
    if not all("17.11" in capabilities.get(name, {}).get("version", "") for name in ["postgres", "psql", "pg_dump", "pg_restore", "pg_dumpall"]):
        errors.append("CAPABILITIES")
    for block in re.findall(r"```sh\n(.*?)\n```", text, re.S):
        for command in block.splitlines():
            match = re.search(r'/((?:pg_dumpall|pg_dump|pg_restore|psql|createdb|initdb|pg_ctl))" (.*)', command)
            if match:
                flags = set(re.findall(r"--[a-z][a-z-]*", match.group(2)))
                if not flags <= set(capabilities.get(match.group(1), {}).get("cli_flags", [])):
                    errors.append("CAPABILITIES")
    for path in e["outputs"] + corrective_criteria()["extra_outputs"]:
        file = ROOT / path
        if file.is_file() and file.suffix != ".gz":
            errors.extend(x.split(":")[0] for x in secret_errors(file.read_text()))
    if not all(n["result"] == "PASS" for n in negatives):
        errors.append("COUNTEREXAMPLES")

    # Explicit check-to-error coverage: failures are never presented as 22 PASS.
    codes = {
        "P01": {"SOURCE_IDENTITY"}, "P02": {"INVENTORY_COVERAGE"}, "P03": {"INVENTORY_FIELDS"},
        "P04": {"AVAILABILITY"}, "P05": {"REFERENCES"}, "P06": {"PROCEDURE_ORDER", "RECOVERY_BINDING"},
        "P07": {"QUARANTINE"}, "P08": {"SOURCE_CUT"}, "P09": {"PROTECTED_COPY", "RECOVERY_MECHANISM", "RECOVERY_OPTIONS", "ENVIRONMENT_RENEWAL", "EXTENSION_RECOVERY"},
        "P10": {"SESSION_SAFETY"}, "P11": {"OBJECT_SAFETY"}, "P12": {"EXTERNAL_SAFETY"},
        "P13": {"MEASUREMENT"}, "P14": {"NORMATIVE_MATRIX"}, "P15": {"SCOPE"},
        "P16": {"SECRET"}, "P17": {"PRESERVATION", "ORIGINAL_CANDIDATE"}, "P18": {"EXPECTED_SEAL", "CORRECTIVE_CRITERIA"},
        "P19": {"CAPABILITIES"}, "P20": {"COUNTEREXAMPLES", "CORRECTIVE_COUNTEREXAMPLES"}, "P21": {"PROCEDURE_CONCRETENESS", "RECOVERY_MECHANISM", "RECOVERY_BINDING", "RECOVERY_OPTIONS", "ENVIRONMENT_RENEWAL", "EXTENSION_RECOVERY"}, "P22": {"PENDING"},
    }
    checks = [{"id": c["id"], "expected": c["expected"], "result": "FAIL" if codes[c["id"]] & set(errors) else "PASS"} for c in e["positive_checks"]]
    report = {
        "schema": "h6-014-verification-v1", "task": "TSK-H6-014", "checked_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "base_commit": git("rev-parse", "HEAD"), "base_tree": git("rev-parse", "HEAD^{tree}"),
        "verifier_sha256": digest(Path(__file__).read_bytes()), "expected_sha256": digest(expected_bytes),
        "positive_checks": checks, "counterexamples": negatives, "errors": sorted(set(errors)),
        "document_checks": document,
        "candidate_revision": "H6-014-M1-m1-r3",
        "revision_criteria_sha256": R3_SHA,
        "input_sha256": {path: digest((ROOT / path).read_bytes()) for path in [DOC + "procedure-TSK-H6-014.md", DOC + "inventory-TSK-H6-014.json", DOC + "matrix-TSK-H6-014.json"]},
        "original_candidate": original,
        "supplemental_criteria_sha256": CRITERIA_SHA,
        "corrective_tests": corrective_tests,
        "protected": {"tracked": tracked_now, "historical_excluded": excluded_now, "index_sha256": digest((ROOT / ".git/index").read_bytes()), "unchanged": preserve, "unexpected_new_paths": sorted(unexpected_new), "migrations": len(migrations)},
        "result": "PASS" if not errors else "FAIL", "claims": e["forbidden_credit"],
        "limits": e["limitations"] + ["Estructura, referencias y reglas explícitas; no prueba semántica completa del lenguaje natural ni ejecución de comandos del procedimiento."]
    }
    if args.check_manifest:
        report["manifest"] = manifest_check(e)
        if report["manifest"]["result"] != "PASS":
            report["result"] = "FAIL"
    if args.output:
        path = ROOT / (COR + "results.json")
        previous = path.read_bytes() if path.is_file() else None
        old = json.loads(previous) if previous else {"schema": "h6-014-run-history-v1", "runs": []}
        if old.get("schema") != "h6-014-run-history-v1":
            raise ValueError("UNEXPECTED_REPORT_FORMAT")
        report["previous_report_sha256"] = digest(previous) if previous else None
        old["runs"].append(report)
        path.write_bytes(encoded(old))
    print(json.dumps({"result": report["result"], "positive": {"pass": sum(c["result"] == "PASS" for c in checks), "total": len(checks)}, "negative": {"pass": sum(c["result"] == "PASS" for c in negatives), "total": len(negatives)}, "corrective": {"pass": sum(c["result"] == "PASS" for c in corrective_tests), "total": len(corrective_tests)}, "errors": report["errors"], "protected_unchanged": preserve, "manifest": report.get("manifest"), "report_written": args.output}, ensure_ascii=False))
    return 0 if report["result"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
