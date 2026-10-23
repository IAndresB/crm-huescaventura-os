#!/usr/bin/env python3
"""Bounded logical projection; no network, database, services or mutations.

Raw acquisition must accompany this projection. Success never asserts coverage
of attributes not provided by the independent acquisition.
"""
from collections import Counter
import copy
import json
import re


class IdentityError(ValueError):
    pass


def need(ok, code):
    if not ok:
        raise IdentityError(code)


def encoded(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def live_columns(rows):
    result, seen, names, groups = [], set(), set(), {}
    required = {"schema", "relation", "attnum", "attisdropped", "name", "type",
                "notnull", "identity", "generated", "default", "collation", "acl"}
    for original in rows:
        row = copy.deepcopy(original)
        need(required <= set(row), "COLUMN_FIELDS")
        need(row["attisdropped"] is False, "COLUMN_LIVE_ONLY")
        n = row["attnum"]
        need(type(n) is int and n > 0, "COLUMN_ATTNUM")
        relation = (row["schema"], row["relation"])
        need((*relation, n) not in seen, "COLUMN_ATTNUM_UNIQUE")
        need((*relation, row["name"]) not in names, "COLUMN_NAME_UNIQUE")
        seen.add((*relation, n))
        names.add((*relation, row["name"]))
        groups.setdefault(relation, []).append(row)
    for relation in sorted(groups):
        for ordinal, row in enumerate(sorted(groups[relation], key=lambda x: x["attnum"]), 1):
            del row["attnum"]
            row["ordinal"] = ordinal
            result.append(row)
    return result


def trigger_multiset(rows):
    result = []
    required = {"schema", "relation", "oid", "name", "internal", "constraint_type",
                "constraint_relation", "constraint_name", "function", "type", "enabled",
                "deferrable", "initially_deferred", "arguments", "update_columns", "definition"}
    for original in rows:
        row = copy.deepcopy(original)
        need(required <= set(row), "TRIGGER_FIELDS")
        need(type(row["internal"]) is bool, "TRIGGER_INTERNAL")
        need(re.fullmatch(r"[1-9][0-9]*", str(row["oid"])) is not None, "TRIGGER_OID")
        match = re.fullmatch(r"RI_ConstraintTrigger_([ac])_([1-9][0-9]*)", row["name"])
        if row["internal"] and row["constraint_type"] == "f" and match:
            need(match.group(2) == str(row["oid"]), "TRIGGER_OID_SUFFIX")
            need(isinstance(row["constraint_relation"], str) and row["constraint_relation"]
                 and isinstance(row["constraint_name"], str) and row["constraint_name"],
                 "TRIGGER_RESOLVED_FK")
            prefix = 'CREATE CONSTRAINT TRIGGER "' + row["name"] + '" '
            need(row["definition"].startswith(prefix), "TRIGGER_DEFINITION_PREFIX")
            row["definition"] = 'CREATE CONSTRAINT TRIGGER "@internal-fk" ' + row["definition"][len(prefix):]
            row["name"] = "@internal-fk:" + match.group(1)
        del row["oid"]
        result.append(encoded(row))
    return Counter(result)


def compare_columns(before, after):
    need(live_columns(before) == live_columns(after), "COLUMN_LOGICAL_MISMATCH")


def compare_triggers(before, after):
    need(trigger_multiset(before) == trigger_multiset(after), "TRIGGER_LOGICAL_MISMATCH")
