"""Read-only successor verification requires a caller-supplied external seal SHA.

--prepare-seal only assembles UNVERIFIED metadata; it never authenticates itself.
The proposed hash must be copied to a separately reviewed handoff and provided
explicitly when verifying. This is integrity verification, not acceptance.
"""
import sys
sys.dont_write_bytecode = True
import argparse
from pathlib import Path
import json
from h5_019_integrity import (AUDIT_PIN, BASE, TREE, ORIGINAL_PIN, NEW, OLD,
    INVENTORY, SEAL, EXCLUDED, audit_reference, base_check, digest, keys, load,
    meta, pinned, require, universe, valid_meta, write_new)

ROOT = Path(__file__).resolve().parents[1]
FIXED = {
    'schema': 'H5-019-successor-seal/v1',
    'result': 'PASS interno propuesto local/aislado', 'base': BASE, 'tree': TREE,
    'originalSealSha256': ORIGINAL_PIN, 'independentAuditSealSha256': AUDIT_PIN,
    'protectedFiles': 38524, 'originalAdditions': 122,
    'criteria': {'reviewed': 26, 'inheritedLocalSatisfactory': 25, 'failed': 0,
                 'blocked': 0, 'reservedH6NotExecuted': ['AC-073']},
    'newBusinessExecutions': 0, 'materialOpen': 0,
    'findings': {'AI-019-01': 'CORREGIDA INTERNAMENTE',
                 'AI-019-02': 'CORREGIDA INTERNAMENTE',
                 'AI-019-03': 'RECONCILIADA; actualización publicada propuesta'},
    'DM-PENDING-005': 'OPEN', 'H5-019': 'IN PROGRESS pending independent delta audit and director acceptance',
    'H5': 'IN PROGRESS', 'H6': 'NOT STARTED', 'accepted': False,
    'independentSuccessorAudit': 'NO EJECUTADA', 'commit': False, 'push': False,
    'deploy': False, 'state': 'STOP',
}
DYNAMIC = {'inventorySha256', 'inventoryMetadata', 'resultsSha256',
           'successorAdditions', 'resultingFiles'}


def semantic(seal, inv):
    keys(seal, set(FIXED) | DYNAMIC, 'successor seal')
    # Compare JSON representations to distinguish false/0, true/1 and their types.
    for k, value in FIXED.items():
        require(json.dumps(seal[k], sort_keys=True) == json.dumps(value, sort_keys=True), 'SEAL_SEMANTIC: ' + k)
    keys(inv, {'schema', 'base', 'tree', 'scope', 'selfMetadataExcluded', 'files'}, 'inventory')
    require(inv['schema'] == 'H5-019-full-inventory/v1' and inv['base'] == BASE and inv['tree'] == TREE, 'INVENTORY_IDENTITY')
    require(inv['scope'] == 'published and all non-ignored candidate additions' and inv['selfMetadataExcluded'] == EXCLUDED, 'EXCLUSION_SCOPE')
    require(type(inv['files']) is dict, 'INVENTORY_FILES')
    require(not set(EXCLUDED) & set(inv['files']), 'CIRCULAR_METADATA')
    for n, m in inv['files'].items():
        from h5_019_integrity import relpath
        relpath(n); valid_meta(m)
    for k in ['successorAdditions', 'resultingFiles']:
        require(type(seal[k]) is int and seal[k] > 0, 'INVALID_COUNT: ' + k)
    require(seal['resultingFiles'] == len(inv['files']) + 2 and seal['successorAdditions'] == seal['resultingFiles'] - 38524, 'SEAL_COUNTS')
    valid_meta(seal['inventoryMetadata'])
    require(seal['inventoryMetadata']['mode'] == 0o644, 'INVENTORY_MODE_CONTRACT')


def evidence(root, audit_root, audit_pin):
    review = audit_reference(audit_root, audit_pin)
    assembly = load(root / (NEW + 'criteria-assembly.json'))
    require(assembly['auditSealSha256'] == AUDIT_PIN and assembly['newBusinessExecutions'] == 0 and assembly['independentSuccessorAudit'] == 'NO EJECUTADA', 'ASSEMBLY_SCOPE')
    require(assembly['counts'] == {'SATISFACTORIA': 25, 'NO EJECUTADA': 1} and len(assembly['rows']) == 26, 'ASSEMBLY_COUNTS')
    trusted = {r['id']: r for r in review['rows']}
    require(len({r['id'] for r in assembly['rows']}) == 26, 'DUPLICATE_CRITERION')
    for row in assembly['rows']:
        r = trusted[row['id']]
        require(all(row[k] == r[k] for k in ['expected', 'observed', 'localState', 'family', 'actualCaseLocators', 'assertionSourcesReviewed', 'developmentTasks', 'verificationTasks', 'futureH6']), 'ASSEMBLY_ATTRIBUTION: ' + row['id'])
        require(row['provenance']['auditSealSha256'] == AUDIT_PIN and row['provenance']['newBusinessExecution'] is False and row['globalPT'] == 'NO EJECUTADA', 'ASSEMBLY_PROVENANCE')
    result = load(root / (NEW + 'corrective-results.json'))
    require(result['verdict'] == 'PASS interno propuesto' and result['newBusinessExecutions'] == 0 and result['materialOpen'] == 0, 'CORRECTIVE_RESULT')
    require(result['countertests']['failed'] == 0 and result['countertests']['passed'] > 0, 'COUNTERTESTS_NOT_PASS')
    dep = load(root / (NEW + 'dependency-revalidation.json'))
    require(len(dep['dependencies']) == 19 and all(r['state'] == 'SATISFACTORIA' for r in dep['dependencies']), 'DEPENDENCIES')


def validate(root, external_pin, audit_root, audit_pin):
    # Authenticate the last node before interpreting any seal-controlled field.
    seal = pinned(root, SEAL, external_pin)
    inv = pinned(root, INVENTORY, seal['inventorySha256'])
    semantic(seal, inv)
    require(meta(root, INVENTORY) == seal['inventoryMetadata'], 'INVENTORY_METADATA')
    require(meta(root, SEAL)['mode'] == 0o644, 'SEAL_MODE_CONTRACT')
    current = universe(root)
    require(current == set(inv['files']) | set(EXCLUDED), 'UNDECLARED_OR_MISSING_PATH')
    # Ignored files inside the evidence scope are not an escape hatch.
    for folder in [OLD, NEW]:
        for p in (root / folder).rglob('*'):
            if p.is_file() or p.is_symlink():
                require(str(p.relative_to(root)) in current, 'UNDECLARED_SCOPED_FILE')
    for n, m in inv['files'].items():
        require(meta(root, n) == m, 'FILE_METADATA_OR_BYTES: ' + n)
    require(digest((root / (NEW + 'corrective-results.json')).read_bytes()) == seal['resultsSha256'], 'RESULT_HASH')
    base_check(root)
    evidence(root, audit_root, audit_pin)
    # A second pass catches modifications while the first pass was in progress.
    require(universe(root) == current, 'UNIVERSE_WRITE_RACE')
    require(meta(root, INVENTORY) == seal['inventoryMetadata'] and digest((root / SEAL).read_bytes()) == external_pin, 'METADATA_WRITE_RACE')
    for n, m in inv['files'].items():
        require(meta(root, n) == m, 'POSTCONTROL_CHANGED: ' + n)
    return {'result': 'SATISFACTORIA', 'identityOnly': True,
            'sealSha256ExternallySupplied': external_pin, 'protectedFiles': 38524,
            'successorAdditions': seal['successorAdditions'], 'state': 'STOP',
            'accepted': False, 'independentSuccessorAudit': 'NO EJECUTADA'}


def prepare(root, audit_root, audit_pin):
    require(not (root / INVENTORY).exists() and not (root / SEAL).exists(), 'REFUSE_OVERWRITE')
    base_check(root); evidence(root, audit_root, audit_pin)
    current = universe(root) - set(EXCLUDED)
    inv = {'schema': 'H5-019-full-inventory/v1', 'base': BASE, 'tree': TREE,
           'scope': 'published and all non-ignored candidate additions',
           'selfMetadataExcluded': EXCLUDED, 'files': {n: meta(root, n) for n in sorted(current)}}
    write_new(root / INVENTORY, inv)
    seal = dict(FIXED, inventorySha256=digest((root / INVENTORY).read_bytes()),
                inventoryMetadata=meta(root, INVENTORY),
                resultsSha256=digest((root / (NEW + 'corrective-results.json')).read_bytes()),
                successorAdditions=len(current) + 2 - 38524, resultingFiles=len(current) + 2)
    semantic(seal, inv)
    write_new(root / SEAL, seal)
    return {'state': 'UNVERIFIED metadata prepared', 'proposedSealSha256': digest((root / SEAL).read_bytes()),
            'instruction': 'Transfer the proposed hash to a separately reviewed handoff; verification requires an explicit --expected-seal-sha256. This is not independent acceptance.'}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--expected-seal-sha256')
    p.add_argument('--prepare-seal', action='store_true')
    p.add_argument('--audit-root', type=Path, required=True)
    p.add_argument('--audit-seal-sha256', required=True)
    args = p.parse_args()
    require(bool(args.expected_seal_sha256) != args.prepare_seal, 'SUPPLY_EXTERNAL_PIN_OR_PREPARE_ONLY')
    out = prepare(ROOT, args.audit_root, args.audit_seal_sha256) if args.prepare_seal else validate(ROOT, args.expected_seal_sha256, args.audit_root, args.audit_seal_sha256)
    print(json.dumps(out, sort_keys=True))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        print('INTEGRITY_REJECTED: ' + str(error), file=sys.stderr)
        sys.exit(1)
