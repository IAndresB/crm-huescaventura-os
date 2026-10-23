// New H6-001 audit harness only. Historical tests/results remain unchanged.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertHistoricalHash as originalHash,assertAuthorizedPreservationChain} from './h5-017-c-dependency-preservation.ts';
export {assertAuthorizedPreservationChain};
const base='971c55d5ce5770c71284d106d3c0deecca9514b5';
const transitions:Record<string,{current:string;base:string|null}>={
  "src/application/contracts.ts": {
    "current": "59c0f969e0d83230dbbe16365f844beab6d7c6d4f0feb4f84c8076256547a66c",
    "base": "fa05f5400015423d541d5703271c4402ae7979eed3e5a87db4f61b004510022c"
  },
  "src/infrastructure/postgres/h0-005-adapter.ts": {
    "current": "eeb328bca74a0bb35678be592c315ad1417eec0b3159b77fedf6e5071ef180c6",
    "base": "e3f17742f35286fa18235a70cdda621c9d959762aa75ff35486f951729db8958"
  },
  "src/infrastructure/postgres/persisted-work-executor.ts": {
    "current": "e06c34763ac94f55fc7e12ee67cd2e5e5acd90e21e12d8657fb69638df6ea4a1",
    "base": "8285e190186749ef2118bfe73e70ff1d373bc4e70b503b29ee860eba6c030ed2"
  },
  "src/server/human-postgres-composition.ts": {
    "current": "79c638b3c0edc84ecadf14a633e69eef185408e4f0ef04dbf1b24ae1d6621cc5",
    "base": "2c051cdd5f0c69e9318c3f75c765798b8636c51f64653a3e5daaef4310ed4da5"
  },
  "tests/contracts.test.ts": {
    "current": "0cfcfb54467147588f58f376b4964e41c138012bc125b772dceafbdc4314ef48",
    "base": "3b73bf2df0554a729cf22f17d62578dd436c46fc68828d6757240b9656d6a8b4"
  },
  "tests/support/h2-isolated.ts": {
    "current": "ee1e4aa36337ead7a0d71af0048937363dd6820403bc66eb6fc25c9d66a8f94b",
    "base": "110c7344443a864708fbcc5c671687edddc77e86f9711ad2c8266421bc42f641"
  },
  "tests/support/h5-communication-isolated.ts": {
    "current": "862b8d4ca98bd0e1b8ba44f4770bc27c4b126c7d4714547f1b5b5adc43ba2047",
    "base": "3f7c09865a1458ea779820d2a1c2f5de2eb20a4dc440b7f2a33d4eff524872f8"
  },
  "tests/support/h5-work-isolated.ts": {
    "current": "21b4cd28445341f45756ed9b1c8c86e196c9c8f4c79252776780958d51918c96",
    "base": "1fa647a2909619085b5d34df36cd32d86fe081e8865544010fbe4e61f2df241c"
  },
  "src/infrastructure/auth/supabase-auth-provider.ts": {
    "current": "5bbd34da40f2e927b21917bd23ae8d0a24bbae9c645fc33c69d675ed326d0e9e",
    "base": null
  },
  "src/server/b07-evidence-port.ts": {
    "current": "09e03ee860db70177868a30f98f76a0e9d33b38da56895d6b046d13fa50f8fab",
    "base": null
  },
  "src/server/human-auth-session.ts": {
    "current": "4be67b2900b794f211df753d30520693b9aaeb93b4a7d8eca30f2b18d92b56ec",
    "base": null
  },
  "src/server/human-http-boundary.ts": {
    "current": "13f2e417f818102a9deee0eb1a0da0e8a6ccda128471e5cf040b37fbf916cf48",
    "base": null
  },
  "tests/support/h6-auth-provider-isolated.ts": {
    "current": "fa1b29c7d9d97e16d4164fdb613603aa5158c05de4dda7f0da6b031e9210844a",
    "base": null
  },
  "tests/support/h6-current-isolated.ts": {
    "current": "045867f756d3c78b5f7a3c74143eba7db477e36abc0cd1f14f6063c89b89b5e9",
    "base": null
  }
};
const digest=(v:Uint8Array|string)=>createHash('sha256').update(v).digest('hex');
function declared(path:string,current:Uint8Array|string,historicalHash:string):boolean{
 const t=transitions[path];if(!t)return false;
 assert.ok(t.base,path+': introduced path cannot masquerade as historical');
 assert.equal(historicalHash,t.base,path+': historical byteguard input equals accepted base');
 assert.equal(digest(execFileSync('git',['show',base+':'+path])),t.base,path+': base bytes');
 assert.equal(digest(current),t.current,path+': exact frozen inherited bytes');
 assert.equal(digest(readFileSync(path)),t.current,path+': actual file exact');
 return true;
}
export function assertInheritedOrHistorical(path:string,current:string,historical:string):void{
 if(declared(path,current,digest(historical)))return;
 assert.equal(current,historical,path);
}
export function assertHistoricalHash(path:string,current:Uint8Array,historicalHash:string,root:string='.'):void{
 if(declared(path,current,historicalHash))return;
 originalHash(path,current,historicalHash,root);
}
