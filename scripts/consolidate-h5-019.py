"""Assemble an authenticated independent review; never infer AC coverage from names.

Original generator and original results remain preserved. This successor imports
historical local observations only; it cannot certify a new business execution.
The caller must supply the independent audit's externally published hash.
"""
import sys
sys.dont_write_bytecode = True
import argparse
from collections import Counter
from pathlib import Path
import re
from h5_019_integrity import (AUDIT_PIN, BASE, ORIGINAL_PIN, audit_reference,
                              digest, keys, load, meta, require, write_new)

ROOT = Path(__file__).resolve().parents[1]
PROVENANCE = {'kind': 'inherited-independent-audit', 'auditSealSha256': AUDIT_PIN,
              'candidateSealSha256': ORIGINAL_PIN, 'codeBase': BASE,
              'newBusinessExecution': False}
STATES = {'NO EJECUTADA', 'SATISFACTORIA', 'FALLIDA', 'BLOQUEADA'}


def normalized(text):
    return ' '.join(text.split()).casefold() if isinstance(text, str) else ''


def assemble_row(submitted, reviewed):
    """Missing/uncertain observations never become PASS. No regex coverage."""
    out = {'id': reviewed['id'], 'family': reviewed['family'],
           'expected': reviewed['expected'], 'observed': submitted.get('observed'),
           'localState': 'BLOQUEADA', 'cause': '', 'provenance': PROVENANCE,
           'developmentTasks': reviewed['developmentTasks'],
           'verificationTasks': reviewed['verificationTasks'],
           'futureH6': reviewed['futureH6'], 'globalPT': 'NO EJECUTADA',
           'assertionSourcesReviewed': reviewed['assertionSourcesReviewed'],
           'actualCaseLocators': submitted.get('actualCaseLocators', [])}
    state = submitted.get('localState')
    if state not in STATES:
        out['cause'] = 'Estado ausente o no admitido.'
    elif reviewed['id'] == 'AC-073':
        out.update(localState='NO EJECUTADA', cause='Restauración y conciliación H6-015 no ejecutadas; W41 es solo preventivo.')
    elif state in {'FALLIDA', 'BLOQUEADA', 'NO EJECUTADA'}:
        out.update(localState=state, cause='La entrada no acredita una observación satisfactoria; no se eleva su estado.')
    elif not normalized(submitted.get('observed')):
        out.update(localState='NO EJECUTADA', cause='Observado ausente, vacío o ambiguo.')
    elif normalized(submitted['observed']) == normalized(submitted.get('expected')):
        out.update(localState='NO EJECUTADA', cause='Expected copiado no es una observación independiente.')
    elif submitted != reviewed:
        out['cause'] = 'La atribución, casos, aserciones, fuente, esperado u observado difieren de la revisión independiente autenticada.'
    else:
        out.update(localState=reviewed['localState'], cause='Observación histórica revisada independientemente; identidad y ejecución contrastadas. No es un resultado nuevo del sucesor.')
    return out


def validate_review(root, audit_root, reviewed):
    """Corroborate authenticated review with immutable source and executed cases."""
    cases = load(audit_root / 'evidence/independent-case-inventory.json')['cases']
    runs = load(audit_root / 'evidence/independent-full.json')
    require(runs['exit'] == 0 and len(cases) == 2945 and all(c['passed'] is True for c in cases), 'AUDIT_EXECUTION_NOT_PASS')
    phases = {p['tag']: p for p in runs['phases']}
    spec = (root / 'specs/001-core-crm/spec.md').read_text()
    tasks = (root / 'specs/001-core-crm/tasks.md').read_text()
    plan = (root / 'specs/001-core-crm/plan.md').read_text()
    normative = load(audit_root / 'evidence/normative-expected.json')
    require(len(reviewed['rows']) == 26, 'AC_COUNT')
    # Reconstruct PT assignment independently from Plan rather than own output.
    assigned = set()
    for family in ['PT-08', 'PT-09', 'PT-10', 'PT-12']:
        line = next(x for x in plan.splitlines() if x.startswith('| ' + family + ' |'))
        numbers = []
        for start, end in re.findall(r'AC-(\d{3})(?:–AC-(\d{3}))?', line.split('|')[2]):
            numbers.extend(range(int(start), int(end or start) + 1))
        actual = {r['id'] for r in reviewed['rows'] if r['family'] == family}
        require(actual == {f'AC-{n:03d}' for n in numbers}, 'PLAN_FAMILY_MISMATCH')
        assigned |= actual
    require(len(assigned) == 26, 'PLAN_AC_COUNT')
    for row in reviewed['rows']:
        require(row['sourceSpecRow'] in spec and row['sourceTasksRow'] in tasks, 'NORMATIVE_ROW_CHANGED: ' + row['id'])
        require(row['expected'] == row['sourceSpecRow'].split('|')[3].strip(), 'EXPECTED_NOT_SPEC')
        for source in row['assertionSourcesReviewed']:
            require(meta(root, source['path'])['sha256'] == source['sha256'], 'ASSERTION_SOURCE_CHANGED')
            phase = phases[source['phase']]
            require(Path(source['path']).name in phase['files'], 'ASSERTIONS_NOT_EXECUTED')
        require(row['actualCaseLocators'], 'NO_EXECUTED_CASES')
        for case in row['actualCaseLocators']:
            require(case in cases and case['passed'] is True, 'CASE_NOT_EXECUTED')
            phase = phases[case['phase']]
            require(phase['exit'] == 0 and phase['stdout'] == case['evidence'], 'CASE_RUN_MISMATCH')
            text = (audit_root / case['evidence']).read_text()
            require(re.search(r'^\s*✔ ' + re.escape(case['name']) + r' \([0-9.]+ms\)$', text, re.M), 'CASE_NOT_IN_RAW_OUTPUT')
    # This file is an independently sealed expected, never generated from observations.
    require(bool(normative), 'INDEPENDENT_EXPECTED_MISSING')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--audit-root', type=Path, required=True)
    p.add_argument('--audit-seal-sha256', required=True)
    p.add_argument('--request', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    reviewed = audit_reference(args.audit_root, args.audit_seal_sha256)
    validate_review(ROOT, args.audit_root, reviewed)
    request = load(args.request)
    keys(request, {'schema', 'provenance', 'rows'}, 'assembly request')
    require(request['schema'] == 'H5-019-assembly-request/v1', 'REQUEST_SCHEMA')
    trusted = {r['id']: r for r in reviewed['rows']}
    require(len(request['rows']) == 26 and {r['id'] for r in request['rows']} == set(trusted), 'REQUEST_AC_SET')
    rows = [assemble_row(row, trusted[row['id']]) for row in request['rows']]
    if request['provenance'] != PROVENANCE:
        for row in rows:
            row.update(localState='BLOQUEADA', cause='Procedencia histórica cambiada o atribuida como ejecución nueva.')
    result = {'schema': 'H5-019-assembly/v1', 'authority': 'documentary assembler; authenticated independent review is the authority for inherited observations',
              'auditSealSha256': args.audit_seal_sha256, 'requestSha256': digest(args.request.read_bytes()),
              'rows': rows, 'counts': dict(Counter(r['localState'] for r in rows)),
              'newBusinessExecutions': 0, 'independentSuccessorAudit': 'NO EJECUTADA'}
    write_new(args.output, result)
    print(__import__('json').dumps({'assembled': True, 'counts': result['counts'], 'newBusinessExecutions': 0}))
    return 1 if any(r['localState'] in {'FALLIDA', 'BLOQUEADA'} for r in rows) else 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (ValueError, OSError, KeyError, TypeError, StopIteration) as error:
        print('ASSEMBLY_REJECTED: ' + str(error), file=sys.stderr)
        sys.exit(1)
