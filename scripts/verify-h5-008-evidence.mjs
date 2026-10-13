// Read-only H5-007/008 evidence and published closure preservation audit.
import assert from 'node:assert/strict';
import {readFileSync,existsSync,lstatSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024}).trim(),root='tests/fixtures/h5-008/definitive/';
const report=JSON.parse(readFileSync(root+'verification.json','utf8'));
const preservationPath='tests/support/h5-006-dependency-preservation.ts';
const preservationHashes=['cd4d34c38fd3260858e9016d5bbc6370f2e7bc2b2aeefb0eec72cbac72be8612','29618809731de46f1958328cb062e1e0cb407da139a77fdbe401a51c94d0b824','d8f1fdacb3508dfe40a924e14ecda98cc01345de5bb3540fc9a24277704a292c'];
// Independently checked before importing the changed shared guard. The seal is
// supplied by the reviewing invocation, not read from the guard or its record.
const c12Path='tests/support/h4-cancellation-fixtures.ts',c12Root='tests/fixtures/h5-009/f09/c12-20261013/';
const c12Before={"tests/support/h4-cancellation-fixtures.ts":"1c3e91375632a520893f4a92d2ffd969ff17a2012776a9e7a1abdc3e51c6ec03","tests/support/h5-006-dependency-preservation.ts":"d8f1fdacb3508dfe40a924e14ecda98cc01345de5bb3540fc9a24277704a292c","scripts/verify-h5-008-evidence.mjs":"7a39b57837db8cbfecafc0cac825ac887548e36d6d26deeb0af4aedf3b628d3b"};
const sha256=b=>createHash('sha256').update(b).digest('hex');
// F16 publication preparation: exact supplemental files and one independently
// sealed auditor transition. C12 records and their original executions stay frozen.
// Closure protocol successor: the historical C12 inventory and F16 package stay
// immutable. This transition is checked by an independent launcher and external seal.
const closureProtocolRoot='tests/fixtures/h5-009/f09/closure-protocol-20261013/';
const closureProtocolBase='a39c6062f9738441f8627f4ae88005846ac9ab9a';
const closureProtocolNames=['authorization.json','verify.py','counterproofs.py','README.md'];
let closureProtocol=null;
if(existsSync(closureProtocolRoot)){
 const regular=path=>{const s=lstatSync(path);assert.ok(s.isFile()&&!s.isSymbolicLink(),'closure protocol regular file: '+path);assert.equal(s.mode&0o777,0o644,'closure protocol permissions: '+path);return readFileSync(path);};
 const raw=regular(closureProtocolRoot+'trust.json');assert.match(process.env.F09_PROTOCOL_SHA256??'',/^[a-f0-9]{64}$/,'closure protocol external seal required');assert.equal(sha256(raw),process.env.F09_PROTOCOL_SHA256,'closure protocol external seal');
 const proof=JSON.parse(raw);assert.equal(proof.scope,'H5-009/010 local/isolated');assert.equal(proof.decision,'AUTHORIZED SEPARATE CLOSURE INVENTORY');assert.equal(proof.baseCommit,closureProtocolBase);
 assert.equal(proof.auditor.path,'scripts/verify-h5-008-evidence.mjs');assert.equal(proof.auditor.beforeSha256,'15278ae39c423e47645c5fd312b03580632254c433801e23ad4c8e1b04704387');
 const original=execFileSync('git',['show',closureProtocolBase+':'+proof.auditor.path]);assert.equal(sha256(original),proof.auditor.beforeSha256,'closure protocol Git predecessor');
 const actual=regular(proof.auditor.path);assert.equal(actual.length,proof.auditor.bytes);assert.equal(sha256(actual),proof.auditor.sha256,'externally sealed closure auditor');
 assert.deepEqual(proof.entries.map(e=>e.path).sort(),closureProtocolNames.map(n=>closureProtocolRoot+n).sort(),'closure protocol literal paths');
 for(const entry of proof.entries){assert.equal(entry.type,'regular');assert.equal(entry.mode,'0644');assert.ok(entry.provenance?.length&&entry.purpose?.length);const bytes=regular(entry.path);assert.equal(bytes.length,entry.bytes);assert.equal(sha256(bytes),entry.sha256,'closure protocol sealed file: '+entry.path);}
 const authorization=JSON.parse(regular(closureProtocolRoot+'authorization.json'));assert.equal(authorization.decision,proof.decision);assert.equal(authorization.scope,proof.scope);assert.equal(authorization.baseCommit,closureProtocolBase);
 // Keep every byte of the two existing dossiers, including their original seals.
 for(const path of git('ls-tree','-r','--name-only',closureProtocolBase,'--',c12Root,'tests/fixtures/h5-009/f09/f16-20261013/').split('\n').filter(Boolean))assert.deepEqual(regular(path),execFileSync('git',['show',closureProtocolBase+':'+path],{maxBuffer:32*1024*1024}),'frozen predecessor dossier: '+path);
 closureProtocol={proof,original,paths:new Set([...proof.entries.map(e=>e.path),closureProtocolRoot+'trust.json'])};
}
const f16Root='tests/fixtures/h5-009/f09/f16-20261013/';
const f16Names=['authorization.json','auditor-before.mjs.gz','verification-evidence.tar.gz','package-receipt.json','verify.py','README.md'];
const f16OptionalNames=['portability-evidence.tar.gz'];
let f16Trust=null,f16AuditorBefore=null;
if(existsSync(f16Root)){
 const regular=path=>{const s=lstatSync(path);assert.ok(s.isFile()&&!s.isSymbolicLink(),'F16 regular file: '+path);assert.equal(s.mode&0o777,0o644,'F16 exact permissions: '+path);return readFileSync(path);};
 const raw=regular(f16Root+'trust.json');assert.match(process.env.F16_TRUST_SHA256??'',/^[a-f0-9]{64}$/,'F16 independent trust seal required');assert.equal(sha256(raw),process.env.F16_TRUST_SHA256,'F16 independent trust seal');
 const proof=JSON.parse(raw);assert.equal(proof.scope,'H5-009/010 local/isolated');assert.equal(proof.decision,'AUTHORIZED REPRODUCIBLE F16 INCORPORATION');
 assert.equal(proof.baseCommit,'eda8b0becb3daa2dff1baa02be53cec914750f13');assert.equal(proof.priorCandidateInputSha256,'e55e6b06fefcf3591eee71b02f96e5d2cafebbae8579fcbac93fce75908ed2c9');
 assert.equal(proof.c12TrustSha256,'eff6a0afc814707138913bdd3a2270e7458f5029d9569ce42d2b46bbe45f80f0');assert.equal(sha256(regular(c12Root+'trust.json')),proof.c12TrustSha256);
 assert.equal(proof.auditor.path,'scripts/verify-h5-008-evidence.mjs');assert.equal(proof.auditor.beforeSha256,'6a744a03d5aa8598c4a3c5f7fdd90e5fa6c634012513f225341ca86f350b3afa');
 const actual=closureProtocol?closureProtocol.original:regular(proof.auditor.path);assert.equal(actual.length,proof.auditor.bytes);assert.equal(sha256(actual),proof.auditor.sha256,'F16 externally sealed auditor');
 const paths=new Set();
 for(const e of proof.entries){
  assert.ok([...f16Names,...f16OptionalNames].some(n=>e.path===f16Root+n)&&!paths.has(e.path),'F16 literal unique path: '+e.path);paths.add(e.path);
  assert.equal(e.type,'regular');assert.equal(e.mode,'0644');assert.ok(e.provenance?.length&&e.purpose?.length,'F16 documented provenance');
  const bytes=regular(e.path);assert.equal(bytes.length,e.bytes);assert.equal(sha256(bytes),e.sha256,'F16 supplemental hash: '+e.path);
 }
 for(const n of f16Names)assert.ok(paths.has(f16Root+n),'F16 required path: '+n);
 assert.equal(sha256(regular(f16Root+'verification-evidence.tar.gz')),'0c6427cdc75dfba29c815140761cfc08ddb5522c376ec9f37e6f8a0124e9251a','original F16 package');
 const authorization=JSON.parse(regular(f16Root+'authorization.json'));assert.equal(authorization.decision,proof.decision);assert.equal(authorization.scope,proof.scope);
 f16AuditorBefore=gunzipSync(regular(f16Root+'auditor-before.mjs.gz'));assert.equal(f16AuditorBefore.length,48029);assert.equal(sha256(f16AuditorBefore),proof.auditor.beforeSha256,'exact C12 predecessor preserved');
 paths.add(f16Root+'trust.json');f16Trust={proof,paths};
}
let c12Trust=null;
const guardDigest=sha256(readFileSync(preservationPath));
if(!preservationHashes.includes(guardDigest)){
 const path=c12Root+'trust.json',metadata=lstatSync(path);assert.ok(metadata.isFile()&&!metadata.isSymbolicLink());assert.equal(metadata.mode&0o777,0o644);
 const raw=readFileSync(path);assert.match(process.env.C12_TRUST_SHA256??'',/^[a-f0-9]{64}$/,'C12 independent trust seal required');assert.equal(sha256(raw),process.env.C12_TRUST_SHA256,'C12 independent trust seal');
 const trust=JSON.parse(raw);assert.equal(trust.scope,'H5-009/010 local/isolated');assert.equal(trust.authorization,'Human-authorized C12 fixture and two guard corrections');assert.equal(trust.baseCommit,'eda8b0becb3daa2dff1baa02be53cec914750f13');
 assert.deepEqual(trust.entries.map(x=>x.path).sort(),Object.keys(c12Before).sort(),'only three authorized C12 paths');
 for(const entry of trust.entries){
  assert.equal(entry.beforeSha256,c12Before[entry.path]);assert.equal(sha256(execFileSync('git',['show',trust.baseCommit+':'+entry.path])),entry.beforeSha256,'independent Git predecessor');
  const stat=lstatSync(entry.path);assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'C12 trusted file type: '+entry.path);assert.equal(stat.mode&0o777,0o644,'C12 trusted permissions: '+entry.path);
  const bytes=f16Trust&&entry.path===f16Trust.proof.auditor.path?f16AuditorBefore:readFileSync(entry.path);assert.equal(bytes.length,entry.bytes);assert.equal(sha256(bytes),entry.sha256,'C12 externally sealed bytes: '+entry.path);
 }
 assert.equal(trust.entries.find(x=>x.path===c12Path).sha256,'dd2b851e5d2888f60f249af0bc3f9000edc160d88da58ffcd200bc2deb6ee15a','exact reviewed C12 fixture');c12Trust=trust;
}
assert.ok(preservationHashes.includes(guardDigest)||c12Trust,'exact independently authorized guard');
const {assertHistoricalHash}=await import('../tests/support/h5-006-dependency-preservation.ts');
const f07Paths=["tests/support/h4-availability-fixtures.ts", "tests/integration/postgres-h4-006.test.ts", "tests/integration/postgres-h4-021.test.ts"];
const r52Path='tests/integration/postgres-h3-006.test.ts',r52Evidence='tests/fixtures/h5-009/f09/r52-transition.json';
const preclosure=process.argv.includes('--preclosure');
const pendingSnapshotPath='tests/fixtures/h5-009/f09/recovery-20261012T202326Z/preflight-inventory.json';
// Exactly five human-authorized lossless representations. These hashes describe
// observed evidence, never the two unavailable historical original streams.
const losslessRepresentations=[
  {
    "path": "tests/fixtures/h5-009/f09/build.log",
    "bytes": 545,
    "sha256": "171ec560c336b2fb502bfe7b5481cbdef116da875eed2929026714fa4157d0a6",
    "compressedBytes": 347,
    "compressedSha256": "f5f5c23f2b64c42325060b910a15ff57bd5e47b28cde70bb32681d13caa42f67",
    "compressedPath": "tests/fixtures/h5-009/f09/build.log.gz"
  },
  {
    "path": "tests/fixtures/h5-009/f09/f02-diagnosis/byte-preserving-unified-diff.txt",
    "bytes": 746,
    "sha256": "f95ad637650cf4059684a34c520bc2db6ecec82e7e2473a4eb06bd1de6cf5fbf",
    "compressedBytes": 408,
    "compressedSha256": "071f12ebb5855d92d72dc4cd8263ee36cee2a9a41ba4d927fd85bba929a3a897",
    "compressedPath": "tests/fixtures/h5-009/f09/f02-diagnosis/byte-preserving-unified-diff.txt.gz"
  },
  {
    "path": "tests/fixtures/h5-009/f09/h2-011-regenerated/reproducer-F01-corrected.observed-61702280.log",
    "bytes": 906,
    "sha256": "61702280d96f95388e432ef0e3f60259778593ed06a661a59e8bd7d672640464",
    "compressedBytes": 519,
    "compressedSha256": "c9cc7fdac8b521ab716a8dd2e5b19447caa1119205a8173f56c185714411d03b",
    "compressedPath": "tests/fixtures/h5-009/f09/h2-011-regenerated/reproducer-F01-corrected.observed-61702280.log.gz"
  },
  {
    "path": "tests/fixtures/h5-009/f09/postgres-preservation/2026-10-12T194821-119Z-2e27d7aa-36a4-432d-a124-62340df3144b/postgres.stdout.log",
    "bytes": 6920640,
    "sha256": "b9af667e69ffaaa4fd89154ba49f07c4d252df973636a4efbebe7b9a44a6f19e",
    "compressedBytes": 440705,
    "compressedSha256": "d923aba759417a50ccd3fbcfd56e6168a2c72f0bb5653195c45f677c1d15fff1",
    "compressedPath": "tests/fixtures/h5-009/f09/postgres-preservation/2026-10-12T194821-119Z-2e27d7aa-36a4-432d-a124-62340df3144b/postgres.stdout.log.gz"
  },
  {
    "path": "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/build-overwritten.log",
    "bytes": 545,
    "sha256": "171ec560c336b2fb502bfe7b5481cbdef116da875eed2929026714fa4157d0a6",
    "compressedBytes": 347,
    "compressedSha256": "f5f5c23f2b64c42325060b910a15ff57bd5e47b28cde70bb32681d13caa42f67",
    "compressedPath": "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/build-overwritten.log.gz"
  }
];
const representationFor=path=>losslessRepresentations.find(item=>item.path===path);
const physicalPath=path=>representationFor(path)?.compressedPath??path;
function preservedBytes(path){
 const item=representationFor(path);
 if(!item)return readFileSync(path);
 assert.equal(lstatSync(path,{throwIfNoEntry:false}),undefined,'original representation must not coexist: '+path);
 const stat=lstatSync(item.compressedPath);assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'gzip regular file: '+path);assert.equal(stat.mode&0o777,0o644,'gzip permissions: '+path);
 const packed=readFileSync(item.compressedPath);assert.equal(packed.length,item.compressedBytes,'gzip byte count: '+path);assert.equal(createHash('sha256').update(packed).digest('hex'),item.compressedSha256,'exact gzip hash: '+path);
 const raw=gunzipSync(packed);assert.equal(raw.length,item.bytes,'decompressed bytes: '+path);assert.equal(createHash('sha256').update(raw).digest('hex'),item.sha256,'decompressed original hash: '+path);return raw;
}

const closurePaths=new Set(["docs/NEXT-STEPS.md", "docs/PROJECT-STATUS.md", "specs/001-core-crm/tasks.md", "specs/001-core-crm/evidence-TSK-H5-009-010.md", "specs/001-core-crm/matrix-TSK-H5-009-010.md", "specs/001-core-crm/defects-TSK-H5-009.md", "tests/fixtures/h5-009/verification.json"]);
const closureInventoryPath=c12Root+'closure-inventory.json';
const closureGateNames=['frozen','typecheck','lint','unit','build','audit','focal','postgres','health','historical','historical-negative','f01','f05','diff'];
const closureEvidencePaths=[c12Root+'closure.json',c12Root+'closure-originals.tar.gz',...closureGateNames.flatMap(n=>[c12Root+'gates/'+n+'.status.json',c12Root+'gates/'+n+'.log.gz'])];
let checkedClosureInventory=null;
function verifyClosureInventory(){
 if(checkedClosureInventory)return checkedClosureInventory;
 if(!existsSync(closureInventoryPath)){assert.ok(!existsSync(c12Root+'closure.json'),'closure requires separate inventory');return null;}
 assert.ok(closureProtocol,'closure requires independently trusted successor');
 const regular=path=>{const s=lstatSync(path);assert.ok(s.isFile()&&!s.isSymbolicLink(),'closure evidence regular file: '+path);assert.equal(s.mode&0o777,0o644,'closure evidence permissions: '+path);return readFileSync(path);};
 const raw=regular(closureInventoryPath);assert.match(process.env.F09_CLOSURE_INVENTORY_SHA256??'',/^[a-f0-9]{64}$/,'closure inventory external seal required');assert.equal(sha256(raw),process.env.F09_CLOSURE_INVENTORY_SHA256,'closure inventory independent seal');
 const inventory=JSON.parse(raw);assert.equal(inventory.scope,'H5-009/010 local/isolated');assert.deepEqual(inventory.entries.map(e=>e.path).sort(),[...closureEvidencePaths].sort(),'closure exact literal evidence set');
 for(const e of inventory.entries){assert.equal(e.type,'regular');assert.equal(e.mode,'0644');assert.ok(e.provenance?.length&&e.purpose?.length,'closure evidence provenance');const b=regular(e.path);assert.equal(b.length,e.bytes);assert.equal(sha256(b),e.sha256,'closure evidence hash: '+e.path);}
 checkedClosureInventory=inventory;return inventory;
}
let checkedClosure=null;
function verifyClosureCertificate(){
 if(checkedClosure)return checkedClosure;
 const path=recoveryRoot+'closure.json';if(!existsSync(path))return null;
 const inventory=verifyClosureInventory();assert.ok(inventory,'closure requires separate sealed inventory');
 const row=inventory.entries.find(x=>x.path===path);assert.ok(row,'registered closure certificate');
 const raw=readFileSync(path),metadata=lstatSync(path);assert.ok(metadata.isFile()&&!metadata.isSymbolicLink());assert.equal(metadata.mode&0o777,0o644);
 assert.equal(raw.length,row.bytes);assert.equal(createHash('sha256').update(raw).digest('hex'),row.sha256,'closure certificate hash');
 const proof=JSON.parse(raw);assert.equal(proof.status,'PASS');assert.equal(proof.scope,'H5-009/010 local/isolated');
 assert.equal(git('merge-base',proof.testedSha,'HEAD'),proof.testedSha,'closure tested candidate is an ancestor');
 assert.deepEqual(readFileSync('scripts/verify-h5-008-evidence.mjs'),execFileSync('git',['show',proof.testedSha+':scripts/verify-h5-008-evidence.mjs']),'closure exact tested auditor');
 assert.deepEqual(proof.transitions.map(x=>x.path).sort(),[...closurePaths].sort(),'only seven existing documentary closure paths');
 const snapshot=JSON.parse(readFileSync(pendingSnapshotPath));
 for(const entry of proof.transitions){
  const before=snapshot.pendingEntries.find(x=>x.path===entry.path);assert.ok(before);assert.equal(entry.beforeSha256,before.sha256,'closure original snapshot');
  const original=execFileSync('tar',['-xOf',recoveryRoot+'closure-originals.tar.gz',entry.path],{maxBuffer:16*1024*1024});assert.equal(original.length,before.bytes);assert.equal(createHash('sha256').update(original).digest('hex'),before.sha256,'closure original bytes preserved');
  const current=lstatSync(entry.path);assert.ok(current.isFile()&&!current.isSymbolicLink());assert.equal(current.mode&0o777,0o644);
  const bytes=readFileSync(entry.path);assert.equal(bytes.length,entry.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,'exact documentary closure version');assert.notEqual(entry.sha256,entry.beforeSha256);
 }
 for(const gate of ["frozen", "typecheck", "lint", "unit", "build", "audit", "focal", "postgres", "health", "historical", "historical-negative", "f01", "f05", "diff"]){
  const status=JSON.parse(readFileSync(recoveryRoot+'gates/'+gate+'.status.json'));assert.equal(status.sha,proof.testedSha);assert.equal(status.exit,0,'closure gate: '+gate);
  assert.equal(status.candidateInputSha256,proof.candidateInputSha256,'closure gate candidate: '+gate);
  const log=gunzipSync(readFileSync(recoveryRoot+'gates/'+gate+'.log.gz'));assert.equal(createHash('sha256').update(log).digest('hex'),status.sha256,'closure gate stream: '+gate);
 }
 const tasks=readFileSync('specs/001-core-crm/tasks.md','utf8');for(const id of ['009','010'])assert.ok(tasks.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0].includes('Ejecución: COMPLETED'),'closure task state');
 checkedClosure=proof;return proof;
}

let pendingSnapshotStatus=null;
function verifyPendingSnapshot(){
 if(!existsSync(pendingSnapshotPath))return new Set();
 const metadata=lstatSync(pendingSnapshotPath),raw=readFileSync(pendingSnapshotPath);
 assert.ok(metadata.isFile()&&!metadata.isSymbolicLink(),'preexisting snapshot regular file');
 assert.equal(metadata.mode&0o777,0o644,'preexisting snapshot permissions');
 assert.equal(raw.length,78537,'preexisting snapshot bytes');
 assert.equal(createHash('sha256').update(raw).digest('hex'),'88eb5525fd94a586ad6aee2b0793be2ac3c9094cf13aba6daeca82c867e4873f','immutable preexisting snapshot');
 const snapshot=JSON.parse(raw),paths=new Set();
 assert.equal(snapshot.head,'8c1109426a8e85effeda6c2bb59c08ac0693c032');
 assert.equal(snapshot.originMain,'fdbd08bafdc6651d1ad6867242cd71791a25deb6');
 assert.equal(snapshot.pendingEntries.length,223);
 for(const entry of snapshot.pendingEntries){
  assert.ok(!paths.has(entry.path),'duplicate preexisting path');paths.add(physicalPath(entry.path));
  const current=lstatSync(physicalPath(entry.path));
  assert.equal(entry.type,'regular');assert.ok(current.isFile()&&!current.isSymbolicLink(),'preexisting file type: '+entry.path);
  assert.equal((current.mode&0o777).toString(8).padStart(4,'0'),entry.mode,'preexisting file permissions: '+entry.path);
  // Only this executable's bytes change under the current human-authorized corrective.
  if(entry.path==='scripts/verify-h5-008-evidence.mjs')continue;
  if(entry.path===preservationPath&&c12Trust){assert.equal(entry.sha256,c12Before[preservationPath]);assert.equal(sha256(readFileSync(entry.path)),c12Trust.entries.find(x=>x.path===entry.path).sha256);continue;}
  const bytes=preservedBytes(entry.path);if(closurePaths.has(entry.path)&&createHash('sha256').update(bytes).digest('hex')!==entry.sha256){assert.ok(verifyClosureCertificate(),'documentary change requires verified closure: '+entry.path);continue;}assert.equal(bytes.length,entry.bytes,'preexisting file bytes: '+entry.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,'preexisting snapshot hash: '+entry.path);
 }
 pendingSnapshotStatus={inventoried:223,exactlyPreserved:(checkedClosure?211:218)-(c12Trust?1:0),independentlyAuthorizedGuardTransition:Boolean(c12Trust),documentaryClosureTransitions:checkedClosure?7:0,losslessRepresentations:4,authorizedAuditorChange:'scripts/verify-h5-008-evidence.mjs',scope:'Working snapshot integrity; no historical hashes replaced'};
 paths.add(pendingSnapshotPath);return paths;
}
// The inventory digest is supplied by the reviewing invocation, never trusted from
// the inventory itself. This keeps evidence sealing separate from tested code.
const priorRecoveryRoot="tests/fixtures/h5-009/f09/recovery-validated-20261012/";
const recoveryRoot="tests/fixtures/h5-009/f09/c12-20261013/";
const recoveryPaths=new Set([
  "tests/fixtures/h5-009/f09/documentary-exception-20261012T204228Z-e1f88cb4/authorization.json",
  "tests/fixtures/h5-009/f09/documentary-exception-20261012T204228Z-e1f88cb4/created-routes.json",
  "tests/fixtures/h5-009/f09/documentary-exception-20261012T204228Z-e1f88cb4/loss-record.json",
  "tests/fixtures/h5-009/f09/documentary-exception-20261012T204228Z-e1f88cb4/report.md",
  "tests/fixtures/h5-009/f09/documentary-exception-20261012T204228Z-e1f88cb4/verification.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/build-overwritten.log",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/diagnosis.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/health-independent-overwritten.log",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/original-command-trace-metadata.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/original-command-trace.jsonl",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/postflight.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/recovery-created-routes.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/search-report.json",
  "tests/fixtures/h5-009/f09/recovery-20261012T202326Z/supplemental-inventory.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/authorization.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/substitution.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/candidate.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/build.log.gz",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/health-independent.log.gz",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/executions.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/supplemental-inventory.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/final-inventory.json",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/verification-evidence.tar.gz",
  "tests/fixtures/h5-009/f09/recovery-validated-20261012/report.md"
]);
for(const path of ["tests/fixtures/h5-009/f09/completion-20261012/authorization.json", "tests/fixtures/h5-009/f09/completion-20261012/substitution.json", "tests/fixtures/h5-009/f09/completion-20261012/candidate.json", "tests/fixtures/h5-009/f09/completion-20261012/build.log.gz", "tests/fixtures/h5-009/f09/completion-20261012/health-independent.log.gz", "tests/fixtures/h5-009/f09/completion-20261012/executions.json", "tests/fixtures/h5-009/f09/completion-20261012/supplemental-inventory.json", "tests/fixtures/h5-009/f09/completion-20261012/final-inventory.json", "tests/fixtures/h5-009/f09/completion-20261012/verification-evidence.tar.gz", "tests/fixtures/h5-009/f09/completion-20261012/report.md", "tests/fixtures/h5-009/f09/completion-20261012/representation.json"])recoveryPaths.add(path);
for(const path of ["tests/fixtures/h5-009/f09/completion-20261013/authorization.json", "tests/fixtures/h5-009/f09/completion-20261013/substitution.json", "tests/fixtures/h5-009/f09/completion-20261013/candidate.json", "tests/fixtures/h5-009/f09/completion-20261013/build.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/health-independent.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/executions.json", "tests/fixtures/h5-009/f09/completion-20261013/supplemental-inventory.json", "tests/fixtures/h5-009/f09/completion-20261013/final-inventory.json", "tests/fixtures/h5-009/f09/completion-20261013/verification-evidence.tar.gz", "tests/fixtures/h5-009/f09/completion-20261013/report.md", "tests/fixtures/h5-009/f09/completion-20261013/representation.json", "tests/fixtures/h5-009/f09/completion-20261013/closure.json", "tests/fixtures/h5-009/f09/completion-20261013/closure-originals.tar.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/frozen.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/frozen.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/typecheck.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/typecheck.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/lint.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/lint.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/unit.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/unit.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/build.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/build.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/audit.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/audit.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/focal.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/focal.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/postgres.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/postgres.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/health.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/health.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/historical.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/historical.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/historical-negative.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/historical-negative.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/f01.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/f01.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/f05.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/f05.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/diff.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/diff.status.json", "tests/fixtures/h5-009/f09/completion-20261013/gates/final.log.gz", "tests/fixtures/h5-009/f09/completion-20261013/gates/final.status.json"])recoveryPaths.add(path);
for(const path of ["tests/fixtures/h5-009/f09/c12-20261013/authorization.json", "tests/fixtures/h5-009/f09/c12-20261013/before.tar.gz", "tests/fixtures/h5-009/f09/c12-20261013/build.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/c12-transition.json", "tests/fixtures/h5-009/f09/c12-20261013/candidate.json", "tests/fixtures/h5-009/f09/c12-20261013/closure-originals.tar.gz", "tests/fixtures/h5-009/f09/c12-20261013/closure.json", "tests/fixtures/h5-009/f09/c12-20261013/executions.json", "tests/fixtures/h5-009/f09/c12-20261013/final-inventory.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/audit.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/audit.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/build.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/build.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/diff.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/diff.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/f01.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/f01.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/f05.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/f05.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/final.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/final.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/focal.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/focal.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/frozen.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/frozen.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/health.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/health.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/historical-negative.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/historical-negative.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/historical.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/historical.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/lint.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/lint.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/postgres.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/postgres.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/typecheck.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/typecheck.status.json", "tests/fixtures/h5-009/f09/c12-20261013/gates/unit.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/gates/unit.status.json", "tests/fixtures/h5-009/f09/c12-20261013/health-independent.log.gz", "tests/fixtures/h5-009/f09/c12-20261013/preflight.json", "tests/fixtures/h5-009/f09/c12-20261013/report.md", "tests/fixtures/h5-009/f09/c12-20261013/representation.json", "tests/fixtures/h5-009/f09/c12-20261013/substitution.json", "tests/fixtures/h5-009/f09/c12-20261013/supplemental-inventory.json", "tests/fixtures/h5-009/f09/c12-20261013/trust.json", "tests/fixtures/h5-009/f09/c12-20261013/verification-evidence.tar.gz", "tests/fixtures/h5-009/f09/c12-20261013/verify-trust.mjs"])recoveryPaths.add(path);
let recoveryStatus=null;
function verifyDocumentaryRecovery(){
 if(!pendingSnapshotStatus)return new Set(); // Intact published historical baseline.
 const inventoryPath=process.env.F09_INVENTORY_PATH??recoveryRoot+'supplemental-inventory.json';
 assert.ok([recoveryRoot+'supplemental-inventory.json',recoveryRoot+'final-inventory.json'].includes(inventoryPath),'literal recovery inventory path');
 const anchor=process.env.F09_INVENTORY_SHA256;
 assert.match(anchor??'',/^[a-f0-9]{64}$/,'independent recovery inventory digest required');
 const check=(path,expected)=>{
  const stat=lstatSync(physicalPath(path));assert.ok(stat.isFile()&&!stat.isSymbolicLink(),'supplement regular file: '+path);
  assert.equal(stat.mode&0o777,0o644,'supplement permissions: '+path);
  const raw=preservedBytes(path);
  if(expected){assert.equal(expected.type,'regular');assert.equal(expected.mode,'0644');assert.equal(raw.length,expected.bytes,'supplement bytes: '+path);assert.equal(createHash('sha256').update(raw).digest('hex'),expected.sha256,'supplement hash: '+path);}
  return raw;
 };
 const raw=check(inventoryPath);
 assert.equal(createHash('sha256').update(raw).digest('hex'),anchor,'sealed recovery inventory');
 const inventory=JSON.parse(raw);assert.equal(inventory.scope,'H5-009/010 local/isolated');
 const admitted=new Set([inventoryPath]);
 for(const item of inventory.entries){
  assert.ok(recoveryPaths.has(item.path)&&!admitted.has(item.path),'literal unique supplemental path: '+item.path);
  assert.ok(item.provenance?.length&&item.purpose?.length,'supplement provenance and purpose');
  check(item.path,item);admitted.add(physicalPath(item.path));
 }
 // Previous package remains immutable, with its original candidate/results kept
 // as previous executions rather than reattributed to the current auditor.
 const priorInventory=priorRecoveryRoot+'final-inventory.json';
 assert.ok(admitted.has(priorInventory),'previous recovery inventory preserved');
 const priorRaw=check(priorInventory);assert.equal(createHash('sha256').update(priorRaw).digest('hex'),'91e87bc9fd4b316dce8d14764291fc48eb9edd0c43a275e6fde91529ab53be5f','previous sealed recovery inventory');
 for(const entry of JSON.parse(priorRaw).entries){check(entry.path,entry);assert.ok(admitted.has(physicalPath(entry.path)),'previous evidence remains registered: '+entry.path);}
 for(const item of losslessRepresentations){preservedBytes(item.path);admitted.add(item.compressedPath);}
 const priorCompletion='tests/fixtures/h5-009/f09/completion-20261012/final-inventory.json';
 assert.ok(admitted.has(priorCompletion),'previous full validation inventory preserved');const priorCompletionRaw=check(priorCompletion);
 assert.equal(createHash('sha256').update(priorCompletionRaw).digest('hex'),'f35f7bd98bab4cc9958e8e2c15a125dcd2e85da4a58f2afd06598494cf104069','previous full validation seal');
 for(const entry of JSON.parse(priorCompletionRaw).entries){check(entry.path,entry);assert.ok(admitted.has(physicalPath(entry.path)),'previous validation remains registered: '+entry.path);}
 const c12Prior='tests/fixtures/h5-009/f09/completion-20261013/final-inventory.json';
 assert.ok(admitted.has(c12Prior),'pre-C12 STOP preserved');const c12PriorRaw=check(c12Prior);assert.equal(sha256(c12PriorRaw),'8a0feda291dcc69cf07c133cfe9f5fd7f353bad346807294a169794f392b0606','immutable pre-C12 STOP inventory');
 for(const entry of JSON.parse(c12PriorRaw).entries){check(entry.path,entry);assert.ok(admitted.has(physicalPath(entry.path)),'pre-C12 evidence remains registered: '+entry.path);}
 assert.ok(c12Trust,'C12 independent trust required in current context');assert.ok(admitted.has(c12Root+'trust.json')&&admitted.has(c12Root+'c12-transition.json'),'C12 records registered');
 const load=name=>{const path=recoveryRoot+name;assert.ok(admitted.has(path),'required recovery evidence: '+path);return JSON.parse(check(path));};
 const authorization=load('authorization.json'),loss=load('substitution.json'),candidate=load('candidate.json'),executions=load('executions.json'),representation=load('representation.json');
 assert.equal(representation.authorized,true);assert.equal(representation.scope,'Five exact lossless gzip substitutions approved by the human');assert.deepEqual(representation.items,losslessRepresentations);
 const historical=[{path:'tests/fixtures/h5-009/f09/build.log',bytes:545,sha256:'063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa'},
 {path:'tests/fixtures/h5-009/f09/health-independent.log',bytes:202,sha256:'2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30'}];
 assert.equal(authorization.decision,'AUTHORIZED DOCUMENTARY SUBSTITUTION');assert.equal(authorization.scope,inventory.scope);
 assert.deepEqual(authorization.historicalReferences,historical);assert.equal(authorization.originalRecoveryClaimed,false);
 assert.equal(loss.originalState,'ORIGINAL NO RECUPERADO');assert.deepEqual(loss.historicalReferences,historical);
 assert.equal(loss.authorization,recoveryRoot+'authorization.json');assert.equal(loss.originalRecoveryClaimed,false);
 assert.equal(loss.observedHashesAcceptedAsHistorical,false);
 assert.deepEqual(loss.substitutes,[recoveryRoot+'build.log.gz',recoveryRoot+'health-independent.log.gz']);
 assert.equal(candidate.baseCommit,'eda8b0becb3daa2dff1baa02be53cec914750f13');assert.equal(candidate.scope,inventory.scope);
 const canonical=JSON.stringify(candidate.inputs);assert.equal(createHash('sha256').update(canonical).digest('hex'),candidate.inputSha256,'candidate input fingerprint');
 const inputs=new Set();for(const item of candidate.inputs){assert.ok(!inputs.has(item.path),'duplicate candidate input');inputs.add(item.path);if(f16Trust&&item.path===f16Trust.proof.auditor.path){assert.equal(f16AuditorBefore.length,item.bytes);assert.equal(sha256(f16AuditorBefore),item.sha256,'prior candidate auditor; current version independently sealed');}else check(item.path,item);}
 for(const path of ['scripts/verify-h5-008-evidence.mjs','package.json','pnpm-lock.yaml','tests/operations/supabase-health.test.mjs'])assert.ok(inputs.has(path),'required candidate input: '+path);
 assert.deepEqual(executions.map(x=>x.name),['build','health-independent']);
 for(let i=0;i<executions.length;i++){
  const run=executions[i];assert.equal(run.candidateInputSha256,candidate.inputSha256);assert.equal(run.exitCode,0,'substitute execution failed');assert.equal(run.result,'PASS');
  assert.deepEqual(run.command,i===0?['pnpm','run','build']:['node','--test','--experimental-strip-types','tests/operations/supabase-health.test.mjs']);
  assert.ok(Number.isFinite(Date.parse(run.startedAtUtc))&&Date.parse(run.endedAtUtc)>=Date.parse(run.startedAtUtc),'execution dates');
  assert.equal(run.output.path,loss.substitutes[i]);assert.ok(admitted.has(run.output.path),'registered substitute');
  const bytes=gunzipSync(check(run.output.path));assert.equal(bytes.length,run.output.rawBytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),run.output.rawSha256,'substitute stream hash');
 }
 recoveryStatus={historicalOriginalIntegrity:'ORIGINAL NO RECUPERADO (2 logs)',preservedPaths:'VERIFIED',supplementalIntegrity:'VERIFIED',documentarySubstitution:'AUTHORIZED AND VERIFIED',newExecutions:executions.map(x=>({name:x.name,result:x.result,candidateInputSha256:x.candidateInputSha256})),inventoryPath,inventorySha256:anchor,F09:verifyClosureCertificate()?'CLOSED':'OPEN',globalClosure:checkedClosure?'PASS local/isolated':'NOT VALIDATED'};
 return admitted;
}

function verifyPublishedClosure(){
 const closure='fdbd08bafdc6651d1ad6867242cd71791a25deb6',product='1c86e695144509fff0254c4d7a076dbb3921f777';
 const bytes=(ref,path)=>execFileSync('git',['show',ref+':'+path],{maxBuffer:32*1024*1024});
 // Exact product versions, including the separately authorized F01 guard and type-only fixture correction.
 const productPaths=['src/domain/external-boundary.ts','src/infrastructure/postgres/h5-external-event-adapter.ts',
  'supabase/migrations/20261008192000_h5_external_event_receipts.sql','tests/h5-009.test.ts',
  'tests/integration/postgres-h5-008-migration.test.ts','tests/integration/postgres-h5-009-migration.test.ts',
  'tests/integration/postgres-h5-009.test.ts','tests/support/h5-boundary-isolated.ts','tests/support/h5-work-isolated.ts'];
 const expectedPath='specs/001-core-crm/expected-TSK-H5-009-010.md';
 const documents=['specs/001-core-crm/evidence-TSK-H5-009-010.md','specs/001-core-crm/matrix-TSK-H5-009-010.md','specs/001-core-crm/defects-TSK-H5-009.md'];
 const fixture='tests/fixtures/h5-009/';
 const evidenceNames=['audit-production.json','build.log.gz','channel-boundary-original-fail.log.gz','channel-boundary-original-fail.status.json','f01-preservation.mjs',
  'focal-final.log','h5-008-preservation-gate-f01.log.gz','health-independent-missing-postgres-env.fail.log','health-independent-ret-test.log','lint.log',
  'postgres-full-final.log.gz','typecheck-final.log','typecheck-retest.log','typecheck.log','unit-final.log','verify-h5-008-evidence.log',
  'f05-counterexamples.mjs','f05-initial-revalidation.tar.gz','f05-development-deletion.log.gz','f05-precommit.tar.gz','f05-preflight.json','f05-diagnosis.md','f05-development-fails.json','f05-development-copy.log.gz','f05-development-buffer.log.gz','f05-development-scope.log.gz','verification.json'];
 const f01Names=['01-intact-56','02-valid-57','03-alter-first','04-alter-middle','05-alter-55','06-alter-56','07-delete-historical','08-comment-replacement','09-whitespace-56','10-unauthorized-within-protected-prefix','11-F10-F12-chain','12-prior-preservation-verifier'];
 const f05Names=['01-intact-closure','02-authorized-delta','03-historical-code','04-historical-migration','05-historical-expected','06-historical-evidence','07-unlisted-change','08-premature-h5011','09-premature-h5012','10-premature-h6','11-hosted','12-production','13-F10-F12','14-H5006-preservation','15-H5008-preservation','16-intact-historical-deletion','17-historical-symlink','18-historical-mode'];
 const gates=['frozen','typecheck','lint','unit','build','audit','focal','postgres','health','historical','historical-negative','f01','f05','diff','final'];
 const allowed=new Set([...productPaths,...f07Paths,preservationPath,r52Path,r52Evidence,c12Path,expectedPath,...documents,'docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md',
  ...['f09/r52-counterexamples.mjs','f09/r52-counterexamples.json','f09/r52-development-fail.log','f09/r52-interrupted-focal.log','f09/r52-focal.log','f09/r52-debug-2.log','f09/r52-focal-2.log'].map(p=>fixture+p),
  'scripts/verify-h5-008-evidence.mjs',...evidenceNames.map(p=>fixture+p),fixture+'f01/result.json',...f01Names.map(p=>fixture+'f01/'+p+'.log.gz'),
  fixture+'revalidation/generated/archive.json',fixture+'f05/result.json',...f05Names.map(p=>fixture+'f05/'+p+'.log.gz'),...gates.flatMap(p=>[fixture+'revalidation/'+p+'.log.gz',fixture+'revalidation/'+p+'.status.json',fixture+'f06/gates/'+p+'.log.gz',fixture+'f06/gates/'+p+'.status.json']),
  ...['compression.json','preflight.json','original-diff.log.gz','original-diff.status.json','counterproofs.json','f05-retest.tar.gz','final-source.txt','generated/archive.json'].map(p=>fixture+'f06/'+p),
  ...['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'].map(p=>fixture+'f06/generated/'+p+'.gz'),
  ...['tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'].map(p=>fixture+'revalidation/generated/'+p+'.gz')]);
 const entries=git('ls-tree','-r','-z',closure).split('\0').filter(Boolean).map(e=>{const [meta,path]=e.split('\t');return {path,hash:meta.split(' ')[2]};});
 const historical=new Set(entries.map(e=>e.path));
 const preexisting=verifyPendingSnapshot();
 const supplements=verifyDocumentaryRecovery();
 if(f16Trust)for(const path of f16Trust.paths)supplements.add(path);
 if(closureProtocol)for(const path of closureProtocol.paths)supplements.add(path);
 if(verifyClosureInventory()){assert.ok(verifyClosureCertificate(),'no orphan closure evidence');for(const path of [closureInventoryPath,...closureEvidencePaths])supplements.add(path);}
 const current=git('ls-files','--cached','--others','--exclude-standard','-z').split('\0').filter(Boolean);
 for(const path of current){
  assert.ok(historical.has(path)||allowed.has(path)||preexisting.has(path)||supplements.has(path),'unlisted posterior path: '+path);
  if(!historical.has(path)&&existsSync(path)){const metadata=lstatSync(path);assert.ok(metadata.isFile(),'posterior file type: '+path);assert.equal(metadata.mode&0o111,0,'posterior file mode: '+path);}
 }
 for(const {path,hash}of entries){
  const metadata=lstatSync(path);assert.ok(metadata.isFile(),'historical file type: '+path);assert.equal(metadata.mode&0o111,0,'historical file mode: '+path);
  if(allowed.has(path))continue;
  const raw=readFileSync(path);
  assert.equal(createHash('sha1').update('blob '+raw.length+'\0').update(raw).digest('hex'),hash,'published closure bytes: '+path);
 }
 for(const path of f07Paths){const metadata=lstatSync(path);assert.ok(metadata.isFile()&&!metadata.isSymbolicLink(),'F07 regular file: '+path);assert.equal(metadata.mode&0o777,0o644,'F07 exact permissions: '+path);assertHistoricalHash(path,readFileSync(path),createHash('sha256').update(bytes(closure,path)).digest('hex'));}
 assertHistoricalHash(c12Path,readFileSync(c12Path),sha256(bytes(closure,c12Path)));
 const posterior=existsSync(expectedPath)||productPaths.some(p=>!historical.has(p)&&existsSync(p));
 const r52Original=bytes(closure,r52Path),r52OriginalHash=createHash('sha256').update(r52Original).digest('hex');
 assert.equal(r52OriginalHash,'49b382e6781bfed7a8685d74d34ccd5b5b4ca48c95726dcc217e795e6b7ff128','F09 original R52 hash');
 const r52Metadata=lstatSync(r52Path);assert.ok(r52Metadata.isFile()&&!r52Metadata.isSymbolicLink(),'F09 R52 regular file');assert.equal(r52Metadata.mode&0o777,0o644,'F09 R52 exact permissions');
 if(posterior){
  assertHistoricalHash(r52Path,readFileSync(r52Path),r52OriginalHash);
  assert.deepEqual(JSON.parse(readFileSync(r52Evidence,'utf8')),{path:r52Path,historicalSha256:r52OriginalHash,correctedSha256:'4719b89eb0d38d951ca9380b79b330fbb758dfc4a6ce794e72a2c66f1e66584e',reason:'F09 R52 two-root concurrency barrier correction',scope:'H5-009/010 local/isolated'});
  const r52Cases=JSON.parse(readFileSync(fixture+'f09/r52-counterexamples.json','utf8'));
  assert.equal(r52Cases.status,'PASS');assert.equal(r52Cases.testedSha,'4719b89eb0d38d951ca9380b79b330fbb758dfc4a6ce794e72a2c66f1e66584e');assert.equal(r52Cases.historicalSha256,r52OriginalHash);assert.equal(r52Cases.caseCount,14);
  assert.deepEqual(r52Cases.cases.map(x=>x.status),['PASS','PASS','FAIL','FAIL','FAIL','FAIL','FAIL','PASS','PASS','PASS','PASS','PASS','PASS','FAIL']);
 }else assert.deepEqual(readFileSync(r52Path),r52Original,'historical R52 test bytes');
 for(const path of productPaths)if(posterior){
  assert.deepEqual(readFileSync(path),bytes(product,path),'authorized product bytes: '+path);
 }else if(existsSync(path)){
  // The intact historical copy may still contain its original versions or lack the additions.
  const original=historical.has(path)?bytes(closure,path):null,currentBytes=readFileSync(path);
  assert.ok((original&&currentBytes.equals(original))||currentBytes.equals(bytes(product,path)),'authorized product bytes: '+path);
 }
 if(posterior){
  const raw=readFileSync(expectedPath);assert.equal(raw.length,24417);assert.equal(createHash('sha256').update(raw).digest('hex'),'b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639');
  assert.deepEqual(raw,bytes('e8b38fa45b0170689784dd3af6ef6cba93e46ae1',expectedPath));
  // F06 changes representation only. Original byte hashes remain independent of the gzip manifest.
  const originals=[
   ['build.log',545,'de300c33e16b8696f67db33e94f6e4d50541fc2afed4c325ad0641a79c75cc75'],
   ['channel-boundary-original-fail.log',3182,'c61fff4777eeebd01f87e700855847f8b14beeecaeebe76f457c56fa2f5cf690'],
   ['h5-008-preservation-gate-f01.log',2235,'e0fc40862757cdb6cc821cc8efd6c0f4449e7aa8882d8d33eefe4f4d850d8ac4'],
   ['postgres-full-final.log',6920965,'89c8ca9a0af2ff8ea02e37c2d9fdd0308c53ef5890f2f647e9e2c9e7e8584a2d']];
  const compression=JSON.parse(readFileSync(fixture+'f06/compression.json','utf8'));
  assert.equal(compression.format,'gzip');assert.equal(compression.lossless,true);assert.equal(compression.items.length,4);
  assert.deepEqual(compression.items.map(x=>x.path),originals.map(([name])=>fixture+name));
  for(const [name,size,hash]of originals){
   const item=compression.items.find(x=>x.path===fixture+name);assert.equal(item.compressedPath,fixture+name+'.gz');
   const packed=readFileSync(item.compressedPath),unpacked=gunzipSync(packed),digest=b=>createHash('sha256').update(b).digest('hex');
   assert.equal(packed.length,item.compressedBytes);assert.equal(digest(packed),item.compressedSha256);
   assert.equal(unpacked.length,size);assert.equal(digest(unpacked),hash);
   assert.equal(item.bytes,size);assert.equal(item.sha256,hash);assert.equal(item.decompressedBytes,size);assert.equal(item.decompressedSha256,hash);
  }
 }
 const taskPath='specs/001-core-crm/tasks.md',originalTasks=bytes(closure,taskPath).toString(),actualTasks=readFileSync(taskPath,'utf8');
 const block=(text,id)=>text.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0];
 let normalized=actualTasks;
 for(const id of ['009','010']){
  const before=block(originalTasks,id),after=block(actualTasks,id);
  const beforeLines=before.split('\n'),afterLines=after.split('\n');assert.equal(afterLines.length,beforeLines.length);
  for(let i=0;i<beforeLines.length;i++)if(afterLines[i]!==beforeLines[i]){
   assert.ok(beforeLines[i].startsWith('- [ ] **Ejecución:')||beforeLines[i].startsWith('- **Evidencia necesaria:'),'unchanged task contract '+id+':'+i);
   assert.ok(after.includes('local/aislado')||after.includes('locales'),'isolated task claim '+id);
  }
  normalized=normalized.replace(after,before);
 }
 assert.equal(normalized,originalTasks,'only H5-009/010 status and evidence may progress');
 const progress=[...documents.filter(existsSync).map(p=>readFileSync(p,'utf8')),block(actualTasks,'009'),block(actualTasks,'010')];
 for(const path of ['docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md']){
  const original=bytes(closure,path).toString(),actual=readFileSync(path,'utf8');
  if(actual===original)continue;
  const title=original.slice(0,original.indexOf('\n')+1);assert.ok(actual.startsWith(title));
  const rest=original.slice(title.length),end=actual.indexOf(rest,title.length);assert.ok(end>=title.length);
  assert.equal(actual.slice(end),rest,'historical document preserved '+path);
  const addition=actual.slice(title.length,end);assert.ok(addition.trim().startsWith('**TSK-H5-009/010 '));assert.ok(addition.includes('local/aislado'));
  progress.push(addition);
 }
 for(const text of progress){
  assert.doesNotMatch(text.replaceAll('sin Hosted/Production','').replaceAll('Hosted/Production no acreditados',''),/\b(?:Hosted|Production)\b/,'no Hosted/Production accreditation');
  assert.doesNotMatch(text,/\b(?:H5-011|H5-012|H6)\b[^\n.]{0,50}\b(?:COMPLETED|PASS)\b/,'no later task accreditation');
 }
 if(['009','010'].some(id=>block(actualTasks,id).includes('Ejecución: COMPLETED'))){
  const proof=JSON.parse(readFileSync(fixture+'verification.json','utf8'));assert.equal(proof.status,'PASS');assert.equal(proof.scope,'local/isolated');
  assert.equal(git('merge-base',proof.testedSha,'HEAD'),proof.testedSha,'tested correction is an ancestor');
  for(const path of ['scripts/verify-h5-008-evidence.mjs',fixture+'f05-counterexamples.mjs'])assert.deepEqual(readFileSync(path),bytes(proof.testedSha,path),'tested F05 executable bytes: '+path);
  assert.deepEqual(proof.cases,['P01','P02','P03','P04','P05','P06','P07','P08','N01','N02','N03','N04','N05','N06','N07','N08','N09','N10','N11','N12','N13','N14','N15','N16','N17','N18']);assert.equal(proof.normativeRows,51);
  const gateDirectory=proof.gateDirectory??'revalidation';assert.ok(['revalidation','f06/gates','f09/completion-20261013/gates','f09/c12-20261013/gates'].includes(gateDirectory));
  for(const gate of gates.filter(p=>p!=='final')){
   const status=JSON.parse(readFileSync(fixture+gateDirectory+'/'+gate+'.status.json','utf8'));assert.equal(status.sha,proof.testedSha);assert.equal(status.exit,0,gate);
   const raw=gunzipSync(readFileSync(fixture+gateDirectory+'/'+gate+'.log.gz'));assert.equal(createHash('sha256').update(raw).digest('hex'),status.sha256,gate);
  }
 }
 return current.filter(p=>!historical.has(p)||allowed.has(p));
}
const frozen=readFileSync('specs/001-core-crm/expected-TSK-H5-007-008.md');
assert.equal(frozen.length,26621);assert.equal(createHash('sha256').update(frozen).digest('hex'),'39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d');
assert.equal(frozen.toString(),execFileSync('git',['show','ae7f3b02745f3011bf3b324f2a5b3420f22a0a79:specs/001-core-crm/expected-TSK-H5-007-008.md'],{encoding:'utf8'}));
assert.equal(report.expectedPublication,'ae7f3b02745f3011bf3b324f2a5b3420f22a0a79');assert.equal(report.status,preclosure?'READY_FOR_FINAL_AUDIT':'PASS');
assert.equal(report.newPostgres,54);assert.equal(report.newUnit,4);assert.deepEqual(report.migrations,{before:55,after:56});assert.equal(report.sourceRows.length,45);
for(const gate of ['frozen','typecheck','lint','unit','build','audit','historical','historical-negative','focal','postgres','health','diff']){
 const status=JSON.parse(readFileSync(root+gate+'-final.status.json','utf8'));assert.equal(status.sha,report.testedSha);assert.equal(status.exit,0,gate);
}
for(const [gate,count]of [['focal',54],['postgres',2462],['unit',154],['health',1]]){
 const log=gunzipSync(readFileSync(root+gate+'-final.log.gz')).toString();for(const [label,n]of [['tests',count],['pass',count],['fail',0],['cancelled',0],['skipped',0]]){const found=[...log.matchAll(new RegExp('ℹ '+label+' (\\d+)','g'))];assert.equal(Number(found.at(-1)?.[1]),n,gate+':'+label);}
}
const rows=frozen.toString().split('\n').filter(x=>/^\| W\d\d \|/.test(x));assert.equal(report.cases.length,56);
const matrix=readFileSync('specs/001-core-crm/matrix-TSK-H5-008.md','utf8');
for(const line of rows){const cols=line.split('|').map(x=>x.trim()),id=cols[1],observed=report.cases.find(x=>x.id===id);assert.ok(observed,id);assert.equal(observed.source,cols[3]);assert.equal(observed.expected,cols[4]);assert.equal(observed.status,preclosure&&id==='W55'?'PENDING':'PASS');assert.ok(observed.evidence.length);for(const p of observed.evidence)assert.ok(existsSync(p),p);assert.ok(matrix.includes('| '+id+' |'));}
const inventory=frozen.toString().split('\n').filter(x=>x.startsWith('| **')).map(x=>x.match(/\*\*(.*?)\*\*/)[1]);assert.deepEqual(report.sourceRows,inventory);
for(const id of report.sourceRows){assert.ok(matrix.includes(id),id);const trace=report.normativeCoverage.find(x=>x.id===id);assert.ok(trace?.cases.length,id);assert.ok(trace.cases.every(c=>report.cases.some(x=>x.id===c)),id);}
for(const item of JSON.parse(readFileSync(root+'generated-historical/archive.json','utf8'))){const raw=gunzipSync(readFileSync(root+'generated-historical/'+item.file+'.gz'));assert.equal(raw.length,item.generatedBytes);assert.equal(createHash('sha256').update(raw).digest('hex'),item.generatedSha256);assert.equal(createHash('sha256').update(readFileSync(item.file)).digest('hex'),item.baselineSha256);}
const delta=verifyPublishedClosure();
const base='ff109036e3bb08a1d61e948693bc622bb10f240e';
for(const file of git('ls-tree','-r','--name-only',base,'src','scripts','tests/integration','tests/support','tests/operations','package.json','pnpm-lock.yaml').split('\n')){
 if(file==='tests/integration/postgres-h5-006-migration.test.ts'||file===preservationPath)continue;
 if(f07Paths.includes(file)||file===r52Path||file===c12Path){assertHistoricalHash(file,readFileSync(file),createHash('sha256').update(execFileSync('git',['show',base+':'+file])).digest('hex'));continue;}
 assert.deepEqual(readFileSync(file),execFileSync('git',['show',base+':'+file]),file);
}
const guard='tests/integration/postgres-h5-006-migration.test.ts';assert.deepEqual(readFileSync(guard),execFileSync('git',['show','4da05b0f2e25ea13094e1ef06153a7aaed1d0aab:'+guard]));
execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures/h5-006/f12/chain-counterexamples.mjs'],{stdio:'pipe'});
const tasks=readFileSync('specs/001-core-crm/tasks.md','utf8');for(const id of ['007','008']){const block=tasks.split('<a id="tsk-h5-'+id+'"></a>')[1].split('<a id=')[0];assert.ok(block.includes('Ejecución: '+(preclosure?'IN PROGRESS':'COMPLETED')));}
const baseTasks=execFileSync('git',['show','fdbd08bafdc6651d1ad6867242cd71791a25deb6:specs/001-core-crm/tasks.md'],{encoding:'utf8'});assert.equal(tasks.slice(tasks.indexOf('<a id="tsk-h5-011">')),baseTasks.slice(baseTasks.indexOf('<a id="tsk-h5-011">')));
console.log(JSON.stringify({audit:recoveryStatus?'PRESERVATION VERIFIED WITH AUTHORIZED DOCUMENTARY LOSS':'PASS',documentaryRecovery:recoveryStatus,mode:preclosure?'preclosure':'final',testedSha:report.testedSha,head:git('rev-parse','HEAD'),rows:45,cases:56,postgres:2462,unit:154,health:1,migrations:56,documentaryDelta:delta,
 preexistingSnapshot:pendingSnapshotStatus,
 f16Supplement:f16Trust?{status:'INDEPENDENTLY SEALED SUPPLEMENT',priorCandidateInputSha256:f16Trust.proof.priorCandidateInputSha256,auditorSha256:f16Trust.proof.auditor.sha256,priorExecutionsReattributed:false,scope:f16Trust.proof.scope}:null,
 f09OriginalLogs:pendingSnapshotStatus?{status:'ORIGINAL NO RECUPERADO',logs:[
  {path:'tests/fixtures/h5-009/f09/build.log',bytes:545,sha256:'063f7ffad5445d9b2a45a17aceb16a01a6dfbbe70032787c0fdd02ea690fd0fa'},
  {path:'tests/fixtures/h5-009/f09/health-independent.log',bytes:202,sha256:'2794076bee6b763f2a15c62a692735addf3e6b08e4fa296266b92953489f6f30'}],documentaryException:recoveryStatus?.documentarySubstitution??'OPEN',F09:checkedClosure?'CLOSED':'OPEN',globalClosure:checkedClosure?'PASS local/isolated':'NOT VALIDATED'}:null},null,2));
