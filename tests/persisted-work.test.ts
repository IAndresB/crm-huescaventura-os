import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {validateWork,canonicalWork} from '../src/domain/persisted-work.ts';
import {verifyWorkResult,verifyWorkEffect} from '../src/application/work-result-verification.ts';
const claim=()=>({action:'claim' as const,operationId:randomUUID(),executionId:randomUUID(),reason:'Ensayo sintético',attemptId:randomUUID(),leaseUntil:new Date(Date.now()+60000).toISOString()});
test('W38 leases explicit; no missing fields or unsupported scheduler/privacy/effect switches',()=>{
 const c=claim();validateWork(c);for(const extra of [{send:true},{schedulerCapacity:4},{leaseSeconds:30},{consent:true},{retryLimit:3},{outcome:'succeeded'}])assert.throws(()=>validateWork({...c,...extra}as any));
 for(const field of Object.keys(c)){const bad:any={...c};delete bad[field];assert.throws(()=>validateWork(bad));}
});
test('W26 W27 canonical work order is stable and materially different inputs differ',()=>{const c=claim();assert.equal(canonicalWork(c),canonicalWork(Object.fromEntries(Object.entries(c).reverse())));assert.notEqual(canonicalWork(c),canonicalWork({...c,attemptId:randomUUID()}));});
test('W44 caller success without trusted exact attempt proof never accredits',async()=>{
 const r={executionId:randomUUID(),attemptId:randomUUID(),outcome:'succeeded' as const,resultRef:'simulated-reference'};await assert.rejects(verifyWorkResult(undefined,r));
 for(const mismatch of [{attemptId:randomUUID()},{executionId:randomUUID()},{outcome:'failed'},{resultRef:'other'},{sourceKind:'real'},{verifierIdentity:''}])await assert.rejects(verifyWorkResult({inspect:async()=>({...r,sourceKind:'simulated',verifierIdentity:'synthetic-provider',...mismatch}as any)},r));
 assert.equal((await verifyWorkResult({inspect:async()=>({...r,sourceKind:'simulated',verifierIdentity:'synthetic-provider'})},r)).attemptId,r.attemptId);
});
test('W40 W41 unknown, unavailable or prior effect cannot authorize a new contact',async()=>{
 const request={executionId:randomUUID(),proposalId:'p-synthetic',partId:'part-1',materialFingerprint:'a'.repeat(64)};await assert.rejects(verifyWorkEffect(undefined,request));
 for(const state of [{availability:'unavailable',priorEffect:'none'},{availability:'available',priorEffect:'uncertain'},{availability:'available',priorEffect:'succeeded'}])await assert.rejects(verifyWorkEffect({inspect:async()=>undefined,checkEffect:async()=>({...request,...state,sourceKind:'simulated',verifierIdentity:'synthetic-provider',observationRef:'synthetic-observation'}as any)},request));
});
