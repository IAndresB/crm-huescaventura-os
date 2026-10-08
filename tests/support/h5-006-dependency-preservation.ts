import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

// Human-authorized H5-005/006-F10 exception, limited to these two exact files.
// Historical dependency bytes remain frozen; current security is audited separately.
export const f10DependencyHashes:Readonly<Record<string,Readonly<{historical:string;current:string}>>>={
 'package.json':{historical:'28b6223e2a3e8e414eaacc54c2f21cc73f3ceeb041dce1d3b3ebfe10201a1258',current:'135c5c52046f92d70fa6c77c9e5fc9014a7e24fa2d6d20867b0e325de490cb3c'},
 'pnpm-lock.yaml':{historical:'1380c6afde70f15ca12514a9989dd314b462de9cd4e87cfb92274e943083fcdf',current:'a97d77d529c30b46f5f6cd100d0ab8e2b8e2393e1365cdd0caad563e29044a15'}
};
const digest=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
export function assertHistoricalBytes(path:string,current:Uint8Array,historical:Uint8Array):void {
 const exception=Object.hasOwn(f10DependencyHashes,path)?f10DependencyHashes[path]:undefined;
 if(!exception){assert.deepEqual(Buffer.from(current),Buffer.from(historical),path);return;}
 assert.equal(digest(historical),exception.historical,path+': historical dependencies changed');
 assert.equal(digest(current),exception.current,path+': outside exact F10 dependency patch');
 console.log('H5-006 F10 exact dependency exception',JSON.stringify({path,...exception}));
}

// Human-authorized F12 transitions. Historical manifest contents are NOT updated.
// These literal hashes freeze the reviewed verifier bytes; no runtime hash discovery.
export const f12VerifierHashes:Readonly<Record<string,Readonly<{historical:string;current:string}>>>={
 "tests/integration/postgres-h4-018-migration.test.ts": {
  "historical": "e7e3d4a55c03c3b658be1a03c6f00eb041ba9f105058a8897c275480c1480495",
  "current": "8db373d47c06366158e75e365060b781d2616ccdc7f782421b7000b5ded531b9"
 },
 "tests/integration/postgres-h4-019-preservation.test.ts": {
  "historical": "9bc2f609b69600f267182c4b67ee5c5aa7c63fece8d95e922a359fac0631ced2",
  "current": "c842a602ad6be7f816fcead6409b4d2c59eee40ff4b5a5b508240e3b587ebb8f"
 },
 "tests/integration/postgres-h4-019-f06.test.ts": {
  "historical": "59680d864f05e27255fb72a2e0bc1197c89d5a9adb92544e41b3e22ec1472de2",
  "current": "7a8eb711d31209ecbaf75ff8d506aeae1fb1d7c3c4068f804914513fe405db15"
 },
 "tests/integration/postgres-h4-021-f23-migration.test.ts": {
  "historical": "48e155536451ace443c07584fe054091894f0c7c7388cbad86042a3b91ed62b2",
  "current": "fa89dd436303d54cf8bc258aee272c643faf4845d9d8a90a8089d762fea14640"
 },
 "tests/integration/postgres-h4-021-migration.test.ts": {
  "historical": "7e3fbea13c51af0d386eab36ff2aef4496e41edf95f57e7caa9352d02cc915b1",
  "current": "0c2f90a03531452a75fe56f1e0a62e9b9d25e85f2b32194dc61f87951b132466"
 },
 "tests/integration/postgres-h4-023-migration.test.ts": {
  "historical": "0cfff1dacc0875ba7cbb552acb39f887e7fecfaaf928c46d6fc104fd6307cfd5",
  "current": "96df97f6a68e09d66f7a492a1bab2f8f35ec95985422eb17a6f45241d109c230"
 },
 "tests/integration/postgres-h4-024.test.ts": {
  "historical": "ada14fe8628b5c0e9edf7854acac96cb2640aaa862a00981efb075200e672f70",
  "current": "de4fb78dab89745746fdc210f17149191f14e751b0f56aa07b380a1b1b363d4b"
 }
};
export const f12ManifestHashes:Readonly<Record<string,string>>={
 "tests/fixtures/h4-021-f23/base-preservation.json": "945db27514ae7ed42d98f24838367ad867c13d06f48f33f88981f747dc721db4",
 "tests/fixtures/h4-021/base-preservation.json": "60ca9ba5685772925a65e58869ecfd3d9314fae2947f86fcc0defe2af9ae5e04",
 "tests/fixtures/h4-023/protected-base.json": "f098ef65f2c91e45adedd13ad272a0066007f8b2f82dd195aa1f8df9210409db",
 "tests/fixtures/h4-024/protected-base.json": "59f2d6566a953ffc599a02d5fce41443af5d2f1db50cd109da97a2b51dfb7363"
};

export function assertHistoricalHash(path:string,current:Uint8Array,historicalHash:string):void {
 const transition=Object.hasOwn(f10DependencyHashes,path)?f10DependencyHashes[path]:
  Object.hasOwn(f12VerifierHashes,path)?f12VerifierHashes[path]:undefined;
 if(!transition){assert.equal(digest(current),historicalHash,path);return;}
 assert.equal(historicalHash,transition.historical,path+': immutable historical hash changed');
 assert.equal(digest(current),transition.current,path+': outside exact authorized transition');
}

// The four current guards each check all seven verifier versions, including themselves.
// This also prevents editing a protected snapshot to bless an unauthorized file.
export async function assertAuthorizedPreservationChain(root:string='.'):Promise<void> {
 for(const [path,transition]of Object.entries({...f10DependencyHashes,...f12VerifierHashes})){
  assertHistoricalHash(path,await readFile(resolve(root,path)),transition.historical);
 }
 for(const [path,hash]of Object.entries(f12ManifestHashes)){
  assert.equal(digest(await readFile(resolve(root,path))),hash,path+': historical manifest changed');
 }
}
