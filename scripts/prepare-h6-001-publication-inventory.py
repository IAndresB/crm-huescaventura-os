#!/usr/bin/env python3
"""Read-only literal publication proposal. Prints JSON; never stages or copies code."""
import collections
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
WORKTREES = ROOT.parent.parent
BASE = '971c55d5ce5770c71284d106d3c0deecca9514b5'
FIXTURE = 'tests/fixtures/h6-001-local-closure'


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read(source, path):
    p = Path(path)
    assert not p.is_absolute() and '..' not in p.parts
    if source.startswith('snapshot:'):
        return subprocess.check_output(['git', 'show', source.split(':')[1] + ':' + path], cwd=ROOT)
    directory = ROOT if source == 'h6-001-local' else WORKTREES / source / 'crm-huescaventura-os'
    return (directory / path).read_bytes()


def exists(source, path):
    if source.startswith('snapshot:'):
        return subprocess.run(['git', 'cat-file', '-e', source.split(':')[1] + ':' + path], cwd=ROOT,
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0
    return ((ROOT if source == 'h6-001-local' else WORKTREES / source / 'crm-huescaventura-os') / path).is_file()


positions = {}
manifests = []
local_only = set()


def add(source, path, lot, provenance, expected=None):
    data = read(source, path)
    actual = digest(data)
    if expected:
        assert actual == expected['sha256'] and len(data) == expected['bytes'], (source, path)
    versions = positions.setdefault(path, {})
    row = versions.setdefault(actual, {'sha256': actual, 'bytes': len(data), 'origins': []})
    origin = {'source': source, 'lot': lot, 'provenance': provenance}
    if origin not in row['origins']:
        row['origins'].append(origin)


prior = json.loads((ROOT / 'tests/fixtures/h6-001/custody-successor/manifest-verification-v2.json').read_text())
for item in prior['manifests']:
    source, path = item['source'], item['manifest']
    raw = read(source, path)
    assert digest(raw) == item['sha256']
    manifest = json.loads(raw)
    lot = 'C' if 'formal-closure' in path else 'B'
    manifests.append({'lot': lot, 'source': source, 'path': path, 'sha256': digest(raw), 'payloads': len(manifest['files'])})
    local_only.update(manifest.get('localOnlyPreservationMetadata', []))
    for file in manifest['files']:
        add(source, file['path'], lot, path, file)
    add(source, path, lot, 'manifest-envelope')
    for wrapper in [path.replace('manifest', 'seal'), str(Path(path).with_suffix('.sha256'))]:
        if wrapper != path and exists(source, wrapper):
            add(source, wrapper, lot, 'separate-envelope')

source = 'h6-auth-corrective'
path = 'tests/fixtures/h6-local-closure/publication-inventory.json'
raw = read(source, path)
assert digest(raw) == '8d0f443747cdb1d66f9cd9af0945fc5df12e81bf16cf25cf9f4e2060fdbb7982'
manifest = json.loads(raw)
manifests.append({'lot': 'A', 'source': source, 'path': path, 'sha256': digest(raw), 'payloads': len(manifest['payload']), 'wrappers': len(manifest['wrappers'])})
for file in manifest['payload']:
    add(source, file['path'], 'A', path, file)
for wrapper in manifest['wrappers']:
    add(source, wrapper, 'A', 'separate-envelope')

before = json.loads((ROOT / FIXTURE / 'preflight-v1.json').read_text())
inherited = {f['path']: f for f in json.loads((ROOT / 'tests/fixtures/h6-001/inherited-inputs.json').read_text())['files']}
for file in before['originalFiles']:
    if file['path'] not in inherited:
        add('h6-001-local', file['path'], 'D1', 'accepted-candidate-and-readback', file)
    else:
        assert file['path'] in positions and file['sha256'] in positions[file['path']]

variants = {f['targetPath']: f for f in json.loads((ROOT / FIXTURE / 'documentary-variant-manifest.json').read_text())['files']}
base_paths = set(subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', BASE], cwd=ROOT).decode().splitlines())
rows = []
for path in sorted(positions):
    versions = positions[path]
    base_hash = digest(subprocess.check_output(['git', 'show', BASE + ':' + path], cwd=ROOT)) if path in base_paths else None
    row = {'path': path, 'versions': sorted(versions.values(), key=lambda x: x['sha256']), 'baseSHA256': base_hash,
           'inheritedFunctional': path in inherited, 'publicationAuthorized': False}
    if path in variants:
        v = variants[path]
        row.update(disposition='ISOLATED_DOCUMENTARY_SELECTION_REQUIRES_LATER_AUTHORIZATION',
                   proposedSource={'source': 'h6-001-local', 'path': v['variantPath'], 'sha256': v['afterSHA256'], 'bytes': v['afterBytes']},
                   acceptedPreimages=sorted(set(versions) | {base_hash}),
                   idempotentRule='Exact proposed postimage: already applied. Exact known preimage: proposed replacement. Any other bytes: STOP only this path.')
    elif path in local_only or '/custody-initial/' in path or '/custody-successor/' in path:
        row.update(disposition='EXCLUDED_LOCAL_PRESERVATION_METADATA', reason='Custody inventory is not permission to publish local metadata.')
    elif len(versions) == 1:
        value = next(iter(versions.values()))
        source = sorted(value['origins'], key=lambda x: (x['source'], x['provenance']))[0]
        row.update(disposition='ALREADY_IN_BASE' if value['sha256'] == base_hash else 'PROPOSED_EXACT_FILE_PENDING_AUTHORIZATION',
                   proposedSource={'source': source['source'], 'path': path, 'sha256': value['sha256'], 'bytes': value['bytes']},
                   acceptedPreimages=[base_hash],
                   idempotentRule='Postimage match: no-op. Expected base preimage or absent new path: proposed write. Otherwise STOP, never overwrite unknown content.')
    else:
        row.update(disposition='BLOCKED_UNRESOLVED_BYTE_VARIANTS', reason='No unverified precedence or automatic flattening.')
    rows.append(row)

history = json.loads((ROOT / 'tests/fixtures/h6-001/custody-successor/publication-candidates-v2.json').read_text())
auth = []
for path, versions in history['productVariants'].items():
    for expected, sources in versions.items():
        actual_sources = []
        for source in sources:
            assert digest(read(source, path)) == expected
            actual_sources.append(source)
        auth.append({'path': path, 'sha256': expected, 'sources': actual_sources,
                     'version': 'R2_ACCEPTED_LOCAL' if inherited[path]['sha256'] == expected else 'R1_HISTORICAL_EXCLUDED',
                     'selectedForPublication': False})

result = {
    'schema': 'h6-001-deterministic-publication-proposal-v1', 'base': BASE,
    'state': 'PREPARED_ONLY_NO_PUBLICATION_OR_MAIN_INTEGRATION', 'taskState': 'COMPLETED_LOCAL_ISOLATED',
    'h6Global': 'IN_PROGRESS', 'sourceManifests': manifests, 'priorManifestEntriesVerified': sum(x['verifiedCount'] for x in prior['manifests']),
    'files': rows, 'uniqueCandidatePaths': len(rows), 'pathHashVersions': sum(len(x['versions']) for x in rows),
    'dispositionCounts': dict(sorted(collections.Counter(x['disposition'] for x in rows).items())),
    'overlappingPaths': [x['path'] for x in rows if sum(len(v['origins']) for v in x['versions']) > 1],
    'differentBytePaths': [x['path'] for x in rows if len(x['versions']) > 1],
    'authenticationVariants': auth,
    'inheritedFunctionalFiles': [{'path': p, 'sha256': inherited[p]['sha256'], 'category': 'product' if p.startswith('src/') else 'test-support'} for p in sorted(inherited)],
    'newClosureLot': {'lot': 'D2', 'manifest': FIXTURE + '/delivery-manifest-v1.json', 'receiptManifest': 'tests/fixtures/h6-001-local-closure-readback/receipt-manifest-v1.json',
                     'reason': 'New closure payload and final readback are enumerated by separate envelopes after this proposal is frozen; no recursive self-hash.'},
    'historicalExclusions': {'lot': 'E', 'primaryUntracked': 14954, 'exactIndex': 'tests/fixtures/h6-001/custody-successor/inventory-v2.json',
                            'exactIndexSHA256': digest((ROOT / 'tests/fixtures/h6-001/custody-successor/inventory-v2.json').read_bytes()),
                            'indexSelector': 'worktrees[name=primary].files', 'disposition': 'EXCLUDE_PRESERVE_NO_BULK_SELECTION'},
    'order': [{'lot': 'A', 'dependsOn': ['base'], 'includes': 'H6-006/H6-008 exact accepted R2; no R1'},
              {'lot': 'B', 'dependsOn': ['A'], 'includes': 'H6-015 technical and declared exact inherited components; no runtime'},
              {'lot': 'C', 'dependsOn': ['B'], 'includes': 'H6-015 formal historical closure and independent custody; shared docs handled only by isolated selection'},
              {'lot': 'D1', 'dependsOn': ['A', 'B'], 'includes': 'H6-001 own original payload and historical readback; original shared docs preserved as sealed history'},
              {'lot': 'D2', 'dependsOn': ['C', 'D1'], 'includes': 'H6-001 local closure and isolated chronological document proposal'},
              {'lot': 'E', 'dependsOn': [], 'includes': 'Excluded historical custody; no publication by default'}],
    'separateAuthorizationPerSelectedLot': True, 'implicitAntecedentInclusion': False, 'productCopied': False,
    'procedure': 'publication-TSK-H6-001-local-closure.md defines review, minimum verification and non-destructive rollback. This script reads only and never stages, writes targets, commits, pushes, restores runtime or contacts network.'
}
print(json.dumps(result, ensure_ascii=False, indent=2))
