"""Protocol counterproofs, exclusively in a disposable clone; no database gates."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

PREFIX = 'tests/fixtures/h5-009/f09/closure-protocol-20261013/'
C12 = 'tests/fixtures/h5-009/f09/c12-20261013/'
F16 = 'tests/fixtures/h5-009/f09/f16-20261013/'
AUDITOR = 'scripts/verify-h5-008-evidence.mjs'
sha = lambda b: hashlib.sha256(b).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--seal', required=True)
    args = parser.parse_args()
    root, out = args.root.resolve(), args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    rows = []
    with tempfile.TemporaryDirectory(prefix='crm-closure-probes-') as temp:
        copy = Path(temp) / 'checkout'
        subprocess.run(['git', 'clone', '--quiet', '--no-hardlinks', str(root), str(copy)], check=True)
        shutil.copy2(root / AUDITOR, copy / AUDITOR)
        # The folder also exists in clean clones once this package is committed.
        (copy / PREFIX).mkdir(parents=True, exist_ok=True)
        shutil.copytree(root / PREFIX, copy / PREFIX, dirs_exist_ok=True)
        (copy / 'node_modules').mkdir()
        for dependency in (root / 'node_modules').iterdir():
            os.symlink(dependency, copy / 'node_modules' / dependency.name, target_is_directory=dependency.is_dir())
        command = ['python3', '-B', PREFIX+'verify.py', '--seal', args.seal]

        def run(name, expected=0, reason=None, cmd=None, env=None):
            started = datetime.datetime.now(datetime.timezone.utc).isoformat()
            result = subprocess.run(cmd or command, cwd=copy, env=env, capture_output=True)
            text = (result.stdout + result.stderr).decode()
            okay = result.returncode == expected and (reason is None or reason in text)
            streams = {}
            for label, data in [('stdout', result.stdout), ('stderr', result.stderr)]:
                path = out / (name+'.'+label+'.log')
                with path.open('xb') as sink:
                    sink.write(data)
                streams[label] = dict(path=path.name, bytes=len(data), sha256=sha(data))
            rows.append(dict(case=name, expectedExit=expected, exit=result.returncode,
                             expectedReason=reason, verified=okay, command=cmd or command,
                             startedAtUtc=started, endedAtUtc=datetime.datetime.now(datetime.timezone.utc).isoformat(), **streams))
            print(name, 'PASS' if okay else 'UNEXPECTED FAIL', flush=True)
            if not okay:
                raise AssertionError(text[-4000:])

        def change(name, path, operation, reason):
            file = copy / path
            data, mode = file.read_bytes(), file.stat().st_mode & 0o777
            try:
                if operation == 'byte':
                    file.write_bytes(data+b' ')
                elif operation == 'delete':
                    file.unlink()
                elif operation == 'symlink':
                    file.unlink()
                    os.symlink(root / path, file)
                elif operation == 'mode':
                    file.chmod(0o600)
                run(name, 1, reason)
            finally:
                if file.is_symlink():
                    file.unlink()
                file.write_bytes(data)
                file.chmod(mode)

        try:
            run('01-current-preservation')
            run('02-original-F16-context', cmd=command+['--historical-f16'])
            run('03-wrong-external-seal', 1, 'external protocol seal', cmd=command[:-1]+['0'*64])
            run('04-absent-external-seal', 2, '--seal', cmd=command[:-2])
            for name, path, operation, reason in [
                ('05-authorization-absent', PREFIX+'authorization.json', 'delete', 'unregistered protocol path'),
                ('06-authorization-altered', PREFIX+'authorization.json', 'byte', 'sealed bytes'),
                ('07-auditor-altered', AUDITOR, 'byte', 'sealed bytes'),
                ('08-verifier-altered', PREFIX+'verify.py', 'byte', 'sealed bytes'),
                ('09-C12-inventory-altered', C12+'final-inventory.json', 'byte', 'immutable predecessor dossier'),
                ('10-original-F16-verifier-altered', F16+'verify.py', 'byte', 'immutable predecessor dossier'),
                ('11-original-F16-trust-altered', F16+'trust.json', 'byte', 'immutable predecessor dossier'),
                ('12-protocol-symlink', PREFIX+'README.md', 'symlink', 'regular file'),
                ('13-protocol-mode', PREFIX+'README.md', 'mode', 'permissions'),
                ('14-expected-altered', 'specs/001-core-crm/expected-TSK-H5-009-010.md', 'byte', 'AssertionError'),
                ('15-manifest-altered', 'tests/fixtures/h2-011/raw-log-manifest.json', 'byte', 'AssertionError'),
                ('16-F01-altered', 'tests/fixtures/h2-011/reproducer-F01-corrected.log', 'byte', 'AssertionError'),
                ('17-F02-altered', 'tests/fixtures/h2-011/reproducer-F02-corrected.log', 'byte', 'AssertionError'),
                ('18-F16-altered', 'tests/fixtures/h4-012-f16/preservation.json', 'byte', 'AssertionError')]:
                change(name, path, operation, reason)
            unknown = copy / PREFIX / 'unlisted.txt'
            unknown.write_text('UNAUTHORIZED SYNTHETIC PROBE\n')
            try:
                run('19-unknown-protocol-route', 1, 'unregistered protocol path')
            finally:
                unknown.unlink()
            unknown = copy / 'tests/fixtures/h5-009/f09/unlisted-closure-probe.txt'
            unknown.write_text('UNAUTHORIZED SYNTHETIC PROBE\n')
            try:
                run('20-unknown-supplement-route', 1, 'unlisted posterior path')
            finally:
                unknown.unlink()
            for name, path in [('21-premature-task', 'specs/001-core-crm/tasks.md'), ('22-premature-environment', 'specs/001-core-crm/evidence-TSK-H5-009-010.md')]:
                file = copy / path
                original = file.read_bytes()
                try:
                    file.write_bytes(original+b'\nH5-011 COMPLETED; Hosted PASS; Production PASS\n')
                    run(name, 1, 'documentary change requires verified closure')
                finally:
                    file.write_bytes(original)
            # Exercise the ACTUAL new inventory validator in isolation. The 30
            # payloads below are synthetic protocol inputs, never gate evidence.
            source = (copy / AUDITOR).read_text()
            fragment = source[source.index('const closureInventoryPath='):source.index('let checkedClosure=null;')]
            harness = Path(temp) / 'inventory-unit.mjs'
            harness.write_text("import assert from 'node:assert/strict'; import {readFileSync,lstatSync,existsSync} from 'node:fs'; import {createHash} from 'node:crypto';\n" +
                "const c12Root='"+C12+"',closureProtocol={syntheticUnitOnly:true},sha256=b=>createHash('sha256').update(b).digest('hex');\n"+fragment+
                "assert.ok(verifyClosureInventory()); console.log('PASS SYNTHETIC INVENTORY VALIDATOR ONLY');\n")
            names = ['closure.json', 'closure-originals.tar.gz'] + ['gates/'+gate+suffix for gate in ['frozen','typecheck','lint','unit','build','audit','focal','postgres','health','historical','historical-negative','f01','f05','diff'] for suffix in ['.status.json','.log.gz']]
            entries = []
            for name in names:
                path = C12+name
                file = copy / path
                file.parent.mkdir(parents=True, exist_ok=True)
                with file.open('xb') as sink:
                    sink.write(b'SYNTHETIC PROTOCOL UNIT INPUT; NOT A GATE RESULT\n')
                file.chmod(0o644)
                entries.append(dict(path=path, type='regular', mode='0644', bytes=file.stat().st_size,
                                    sha256=sha(file.read_bytes()), provenance='Synthetic unit test', purpose='Inventory validation only'))
            inventory = copy / C12 / 'closure-inventory.json'
            content = json.dumps(dict(scope='H5-009/010 local/isolated', entries=entries)).encode()
            inventory.write_bytes(content)
            env = dict(os.environ, F09_CLOSURE_INVENTORY_SHA256=sha(content))
            unit = ['node', str(harness)]
            run('23-separate-inventory-exact', cmd=unit, env=env)
            run('24-closure-seal-wrong', 1, 'closure inventory independent seal', cmd=unit, env=dict(env,F09_CLOSURE_INVENTORY_SHA256='0'*64))
            absent = dict(env); absent.pop('F09_CLOSURE_INVENTORY_SHA256')
            run('25-closure-seal-absent', 1, 'closure inventory external seal required', cmd=unit, env=absent)
            file = copy / entries[0]['path']; data = file.read_bytes()
            for case, op, reason in [('26-closure-byte','byte','closure evidence hash'),('27-closure-absent','delete','ENOENT'),('28-closure-symlink','symlink','regular file'),('29-closure-mode','mode','permissions')]:
                try:
                    if op == 'byte': file.write_bytes(bytes([data[0]^1])+data[1:])
                    if op == 'delete': file.unlink()
                    if op == 'symlink':
                        file.unlink();os.symlink(inventory,file)
                    if op == 'mode': file.chmod(0o600)
                    run(case,1,reason,cmd=unit,env=env)
                finally:
                    if file.is_symlink(): file.unlink()
                    file.write_bytes(data);file.chmod(0o644)
            for case, altered in [('30-third-closure-route',entries+[dict(entries[0],path=C12+'third.txt')]),('31-missing-inventory-entry',entries[1:]),('32-duplicate-entry',entries+[entries[0]])]:
                raw=json.dumps(dict(scope='H5-009/010 local/isolated',entries=altered)).encode();inventory.write_bytes(raw)
                run(case,1,'closure exact literal evidence set',cmd=unit,env=dict(env,F09_CLOSURE_INVENTORY_SHA256=sha(raw)))
            inventory.write_bytes(content)
            # Real auditor must NOT accept the synthetic certificate, even though
            # the inventory validator accepts its exact sealed byte inventory.
            run('33-synthetic-is-not-a-closure',1,'SyntaxError',cmd=command+['--closure-seal',sha(content)])
            for name in names: (copy/C12/name).unlink()
            inventory.unlink()
            run('34-F10',cmd=['node','--experimental-strip-types','scripts/verify-h5-006-f10-preservation.mjs'])
            run('35-F12',cmd=['node','--experimental-strip-types','tests/fixtures/h5-006/f12/chain-counterexamples.mjs'])
            run('36-final-preservation')
        finally:
            (out/'result.json').write_text(json.dumps(dict(status='PASS' if len(rows)==36 and all(r['verified'] for r in rows) else 'STOP',
                baseCommit='a39c6062f9738441f8627f4ae88005846ac9ab9a', protocolSeal=args.seal,
                auditorSha256=sha((root/AUDITOR).read_bytes()), newPostgresExecution=False,
                syntheticInventoryTestsAreClosureEvidence=False, rows=rows),indent=2)+'\n')


if __name__ == '__main__':
    main()
