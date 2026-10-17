import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeServer} from '../src/server/composition.ts';
import {issueTrustedContext} from '../src/application/trusted-context.ts';
import {semanticIssue} from '../src/domain/semantic-error.ts';
import type {BoundaryDependencies,ReplayInspection} from '../src/server/boundary.ts';
const context=issueTrustedContext({identityId:'synthetic-c-actor',identityKind:'human',purpose:'synthetic-c',scope:'synthetic-c-scope',requestId:'c-request',serverTime:'2026-10-16T12:00:00Z'});
const raw={requestId:'synthetic-c-request',origin:'synthetic-c-origin',kind:'mutation',operation:{id:'synthetic-c-op'},payload:{}};
function setup(replay:'new'|'previous'|'conflict'|'uncertain'='new'){
 const logs:unknown[]=[];const deps:BoundaryDependencies={allowedOrigins:new Set([raw.origin]),contexts:{resolve:async()=>context},fingerprints:{fingerprint:()=> 'synthetic-c'},replay:{inspect:async<T>()=>replay==='previous'?{status:'previous',value:{original:true} as T}:{status:replay} as ReplayInspection<T>},diagnostics:{record:e=>logs.push(e)}};return{deps,logs};
}
test('C08 public composition exception after callback starts preserves E4 and never retries or leaks',async()=>{
 const {deps,logs}=setup();let effects=0;const r=await composeServer(deps).invoke(raw,async()=>{effects++;throw new Error('SYNTHETIC_C_SECRET');});
 assert.deepEqual(r,{status:'pending',issues:[semanticIssue('E4','operation')]});assert.equal(effects,1);assert.equal(JSON.stringify({r,logs}).includes('SYNTHETIC_C_SECRET'),false);
});
test('C09 resolver failure before callback is known E5 with no effects',async()=>{
 const {deps}=setup();deps.contexts.resolve=async()=>{throw new Error('SYNTHETIC_C_SECRET');};let effects=0;const r=await composeServer(deps).invoke(raw,async()=>{effects++;return{status:'applied',value:{}};});assert.equal(effects,0);assert.deepEqual(r,{status:'rejected',issues:[semanticIssue('E5','access')]});
});
test('C09 explicit known E5 from business contract is retained',async()=>{
 const {deps}=setup(),known={status:'rejected' as const,issues:[semanticIssue('E5','operation')]};assert.deepEqual(await composeServer(deps).invoke(raw,async()=>known),known);
});
for(const replay of ['previous','conflict','uncertain']as const)test('C09 '+replay+' replay never invokes or duplicates the contract',async()=>{
 const {deps}=setup(replay);let calls=0;const r=await composeServer(deps).invoke(raw,async()=>{calls++;return{status:'applied',value:{}};});assert.equal(calls,0);assert.equal(r.status,replay==='previous'?'previous':replay==='conflict'?'rejected':'pending');
});
