// F09 controlled PostgreSQL runner. It verifies the pinned historical blobs,
// snapshots the complete tracked worktree, captures test outputs separately,
// and restores every tracked path changed by the child before returning.
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { chmod, lstat, mkdir, readFile, readlink, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { constants as osConstants } from 'node:os';
import { gzipSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const evidenceRoot = resolve(dirname(fileURLToPath(import.meta.url)), 'postgres-preservation');
const artifacts = new Map([
  ['tests/fixtures/h2-011/reproducer-F01-corrected.log', { bytes: 904, sha256: '3d123ac41cf6a9da845dd89518fff92c4012db3ede9da6b90f44e69839821ccc', mode: 0o644 }],
  ['tests/fixtures/h2-011/reproducer-F02-corrected.log', { bytes: 1917, sha256: 'e5edcf607bde904fc25e5f9665dc45922a96443f7762f97ce6bac4484d54b8ae', mode: 0o644 }],
  ['tests/fixtures/h2-011/preservation.log', { bytes: 312, sha256: '3bc0004daa86ad07d66a3081190b23dfd89049397f12dab34418a9caa15eb9d9', mode: 0o644 }],
  ['tests/fixtures/h4-012-f16/preservation.json', { bytes: 1858702, sha256: '8b6c0298b17b7ede0fabb58a264953f0ccfa5e880e89a8d472b3644e870003d7', mode: 0o644 }],
]);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => {
  const result = spawnSync('git', args, { cwd: root, encoding: 'buffer', maxBuffer: 128 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout;
};
const stateOf = async path => {
  try {
    const stat = await lstat(path);
    if (stat.isSymbolicLink()) return { type: 'symlink', mode: stat.mode & 0o777, target: await readlink(path) };
    if (stat.isFile()) {
      const bytes = await readFile(path);
      return { type: 'regular', mode: stat.mode & 0o777, bytes, sha256: sha256(bytes) };
    }
    return { type: 'other', mode: stat.mode & 0o777, size: stat.size };
  } catch (error) {
    if (error.code === 'ENOENT') return { type: 'missing' };
    throw error;
  }
};
const stateKey = state => state.type === 'regular'
  ? `regular:${state.mode}:${state.bytes.length}:${state.sha256}`
  : state.type === 'symlink' ? `symlink:${state.mode}:${state.target}`
    : state.type === 'other' ? `other:${state.mode}:${state.size}` : 'missing';
const trackedPaths = () => git('ls-files', '-z').toString('utf8').split('\0').filter(Boolean);
const captureTracked = async paths => {
  const map = new Map();
  for (const path of paths) map.set(path, await stateOf(resolve(root, path)));
  return map;
};
const restoreState = async (path, state) => {
  const absolute = resolve(root, path);
  await rm(absolute, { recursive: true, force: true });
  if (state.type === 'missing') return;
  await mkdir(dirname(absolute), { recursive: true });
  if (state.type === 'regular') {
    await writeFile(absolute, state.bytes, { mode: state.mode });
    await chmod(absolute, state.mode);
  } else if (state.type === 'symlink') {
    await symlink(state.target, absolute);
  } else {
    throw new Error(`cannot restore tracked non-regular path: ${path}`);
  }
};
const asRecord = state => state.type === 'regular'
  ? { type: 'regular file', bytes: state.bytes.length, sha256: state.sha256, mode: state.mode.toString(8).padStart(4, '0') }
  : state.type === 'symlink' ? { type: 'symlink', target: state.target, mode: state.mode.toString(8).padStart(4, '0') }
    : { type: state.type, mode: state.mode?.toString(8).padStart(4, '0') ?? null, size: state.size ?? null };

const runId = `${new Date().toISOString().replaceAll(':', '').replaceAll('.', '-')}-${randomUUID()}`;
const out = resolve(evidenceRoot, runId);
await mkdir(out, { recursive: true });
const report = {
  scope: 'F09 H5-009/010 local/isolated', runId, testedHead: null,
  command: null, result: { exitCode: null, signal: null, error: null },
  interruptedBy: null, artifacts: [], unexpectedTrackedChanges: [],
  restorationComplete: false, preflightPassed: false, executionStarted: false,
};
let child;
let snapshots = new Map();
let tracked = [];
let interrupted = null;
const onSignal = signal => {
  interrupted ??= signal;
  report.interruptedBy = interrupted;
  if (child?.pid) {
    try { process.kill(-child.pid, signal); } catch { child.kill(signal); }
  }
};
process.on('SIGINT', onSignal);
process.on('SIGTERM', onSignal);

try {
  report.testedHead = git('rev-parse', 'HEAD').toString('utf8').trim();
  tracked = trackedPaths();
  snapshots = await captureTracked(tracked);
  for (const [path, expected] of artifacts) {
    const state = snapshots.get(path);
    report.artifacts.push({ path, expectedBytes: expected.bytes, expectedSha256: expected.sha256, expectedMode: '0644', initial: asRecord(state), generated: null, restored: null });
  }
  for (const [path, expected] of artifacts) {
    const state = snapshots.get(path);
    const tree = git('ls-tree', 'HEAD', '--', path).toString('utf8').trim();
    const blob = git('cat-file', 'blob', `HEAD:${path}`);
    if (!tree.startsWith('100644 blob ') || blob.length !== expected.bytes || sha256(blob) !== expected.sha256) {
      throw new Error(`pinned historical baseline mismatch in HEAD: ${path}`);
    }
    if (state?.type !== 'regular' || state.mode !== expected.mode || state.bytes.length !== expected.bytes || state.sha256 !== expected.sha256) {
      throw new Error(`worktree is not the exact historical regular file (including mode): ${path}`);
    }
  }
  report.preflightPassed = true;

  const separator = process.argv.indexOf('--');
  const command = separator >= 0 ? process.argv.slice(separator + 1) : [process.execPath, 'scripts/test-postgres.mjs'];
  if (command.length === 0) throw new Error('missing child command after --');
  report.command = command;
  const stdoutPath = resolve(out, 'postgres.stdout.log');
  const stderrPath = resolve(out, 'postgres.stderr.log');
  const stdout = createWriteStream(stdoutPath, { flags: 'wx' });
  const stderr = createWriteStream(stderrPath, { flags: 'wx' });
  report.executionStarted = true;
  child = spawn(command[0], command.slice(1), { cwd: root, env: process.env, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.pipe(stdout);
  child.stderr.pipe(stderr);
  child.once('error', error => { report.result.error = error.message; });
  await new Promise(resolveClose => child.once('close', (code, signal) => {
    report.result.exitCode = code;
    report.result.signal = signal;
    resolveClose();
  }));
  child = null;
  await Promise.all([new Promise(resolveEnd => stdout.end(resolveEnd)), new Promise(resolveEnd => stderr.end(resolveEnd))]);
} catch (error) {
  report.result.error = String(error?.stack ?? error);
} finally {
  const changed = [];
  for (const path of tracked) {
    try {
      const before = snapshots.get(path);
      const after = await stateOf(resolve(root, path));
      if (before && stateKey(before) !== stateKey(after)) changed.push({ path, before, after });
    } catch (error) {
      changed.push({ path, before: snapshots.get(path), after: { type: 'inspection-error', error: String(error) } });
    }
  }

  for (const delta of changed) {
    const { path, after } = delta;
    const isAuthorizedArtifact = artifacts.has(path);
    const destination = resolve(out, isAuthorizedArtifact ? 'generated' : 'unexpected-tracked', `${path}.gz`);
    const row = isAuthorizedArtifact ? report.artifacts.find(item => item.path === path) : { path };
    row.generated = asRecord(after);
    if (after.type === 'regular') {
      try {
        await mkdir(dirname(destination), { recursive: true });
        const compressed = gzipSync(after.bytes, { mtime: 0 });
        await writeFile(destination, compressed, { flag: 'wx' });
        row.generated.evidencePath = destination.slice(out.length + 1);
        row.generated.gzipSha256 = sha256(compressed);
      } catch (error) { row.captureError = String(error?.stack ?? error); }
    }
    if (!isAuthorizedArtifact) report.unexpectedTrackedChanges.push(row);
  }

  const restoreErrors = [];
  for (const delta of changed) {
    try { await restoreState(delta.path, delta.before); }
    catch (error) { restoreErrors.push({ path: delta.path, error: String(error?.stack ?? error) }); }
  }
  report.restoreErrors = restoreErrors;
  for (const item of report.artifacts) {
    try {
      const actual = await stateOf(resolve(root, item.path));
      item.restored = asRecord(actual);
      item.restoredExact = actual.type === 'regular' && actual.bytes.length === item.expectedBytes && actual.sha256 === item.expectedSha256 && actual.mode === 0o644;
    } catch (error) { item.restored = { type: 'inspection-error', error: String(error) }; item.restoredExact = false; }
  }
  const remaining = [];
  for (const path of tracked) {
    try {
      const before = snapshots.get(path);
      const after = await stateOf(resolve(root, path));
      if (before && stateKey(before) !== stateKey(after)) remaining.push(path);
    } catch { remaining.push(path); }
  }
  report.remainingTrackedDifferences = remaining;
  report.restorationComplete = restoreErrors.length === 0 && remaining.length === 0
    && (!report.executionStarted || (report.artifacts.length === artifacts.size && report.artifacts.every(item => item.restoredExact)));
  try {
    const outputHashes = {};
    for (const name of ['postgres.stdout.log', 'postgres.stderr.log']) {
      try { const bytes = await readFile(resolve(out, name)); outputHashes[name] = { bytes: bytes.length, sha256: sha256(bytes) }; }
      catch { outputHashes[name] = null; }
    }
    report.outputHashes = outputHashes;
    report.interruptedBy = interrupted;
    await writeFile(resolve(out, 'status.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  } catch (error) {
    report.result.error ??= String(error?.stack ?? error);
    console.error('F09 preservation status could not be written:', report.result.error);
  }
  process.removeListener('SIGINT', onSignal);
  process.removeListener('SIGTERM', onSignal);
  if (!report.preflightPassed || !report.restorationComplete || report.unexpectedTrackedChanges.length || interrupted || report.result.error) {
    process.exitCode = 1;
  } else if (report.result.signal) {
    process.exitCode = 128 + (osConstants.signals[report.result.signal] ?? 1);
  } else if (report.result.exitCode !== 0) {
    process.exitCode = report.result.exitCode ?? 1;
  }
}
