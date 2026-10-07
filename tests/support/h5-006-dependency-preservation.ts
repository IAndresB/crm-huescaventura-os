import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

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
