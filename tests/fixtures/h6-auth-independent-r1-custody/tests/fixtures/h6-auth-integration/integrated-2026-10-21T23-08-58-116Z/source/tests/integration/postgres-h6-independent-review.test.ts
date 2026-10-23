// Independent H6-006 review. Expectations frozen separately before this source.
import {before,after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,workFixture} from '../support/h6-current-isolated.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>;
before(async()=>{h=await isolatedWork('crm_h6006_independent',59606);});
after(async()=>{await h?.close();});
afterEach(async()=>{await h?.closeExecutors();});
const tables=['crm_private.b08_definitions','crm_private.b08_executions','crm_private.b08_parts','crm_private.b08_attempts','crm_private.b08_command_results','crm_private.b07_operations','crm_private.b07_history','crm_ha.reservations','crm_ha.events','crm_ha.command_receipts','crm_private.unit_roots','crm_private.unit_operations','crm_private.unit_history','crm_private.unit_results','crm_private.external_effect_records'];
async function snapshot(){const out:Record<string,unknown>={};for(const table of tables)out[table]=Array.from(await h.observer.unsafe(`select to_jsonb(x) value from ${table} x order by to_jsonb(x)::text`));return out;}

for(const field of ['executionId','attemptId','outcome','resultRef'])test(`IR01 independent tuple mismatch ${field} cannot consume or mutate history`,async t=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(),receipt=await f.run(claim);await f.run(f.start(claim,receipt.generation!));
 const proof=f.prove(claim.attemptId),exact=h.observations.get(claim.attemptId)!;
 const mismatch={...exact,[field]:field==='outcome'?'failed':field==='resultRef'?'foreign-reference':uid()};
 const bad=h.executor('synthetic-executor-a',{resultVerifier:{inspect:async()=>mismatch}});
 const before=await snapshot();await assert.rejects(f.run(proof,bad),/WORK_RESULT_EVIDENCE_REQUIRED/);assert.deepEqual(await snapshot(),before);
 assert.equal((await f.see())!.parts[0].state,'contacted');await f.run(proof);const calls=h.inspections();assert.equal((await f.run(proof)).replayed,true);assert.equal(h.inspections(),calls);
 const seen=(await f.see())!;assert.equal(seen.parts[0].state,'succeeded');assert.equal(seen.attempts.length,1);
 const events=await h.observer`select event_kind from crm_ha.events where reservation_id=${seen.parts[0].reservation_id}`;
 assert.equal(events.filter(x=>['succeeded','reconciled-succeeded'].includes(x.event_kind)).length,1);
 t.diagnostic(JSON.stringify({case:'IR01',field,rejected:true,tablesUnchanged:tables.length,correctProofConsumedOnce:true,replayInspections:0}));
});

for(const mode of ['uncertain','provider_absent','check_absent','observation_absent','exception'])test(`IR02 independent effect source ${mode} never creates contact or reserve`,async t=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(),receipt=await f.run(claim);
 const inspect=async()=>undefined;
 const resultVerifier=mode==='provider_absent'?undefined:mode==='check_absent'?{inspect}:{inspect,checkEffect:async(r:unknown)=>{
  if(mode==='exception')throw new Error('INDEPENDENT_PROVIDER_UNAVAILABLE');
  if(mode==='observation_absent')return undefined;
  return {...r as object,availability:'available',priorEffect:'uncertain',sourceKind:'simulated',verifierIdentity:'independent-provider',observationRef:'independent-uncertain'};
 }};
 const worker=h.executor('synthetic-executor-a',{resultVerifier}),before=await snapshot();await assert.rejects(f.run(f.start(claim,receipt.generation!),worker));assert.deepEqual(await snapshot(),before);
 const seen=(await f.see())!;assert.equal(seen.parts[0].state,'claimed');assert.equal(seen.attempts[0].state,'claimed');
 assert.equal((await h.observer`select count(*)::int n from crm_ha.reservations where proposal_id=${f.approval.proposalId}`)[0]!.n,0);
 t.diagnostic(JSON.stringify({case:'IR02',mode,rejected:true,tablesUnchanged:tables.length,reservations:0,contacted:false}));
});

test('IR03 independent same result identity different material rejects before reinspection',async t=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim(),receipt=await f.run(claim);await f.run(f.start(claim,receipt.generation!));const proof=f.prove(claim.attemptId);await f.run(proof);
 const before=await snapshot(),calls=h.inspections();await assert.rejects(f.run({...proof,resultRef:'different-material'}),/WORK_REPLAY_CONFLICT/);assert.equal(h.inspections(),calls);assert.deepEqual(await snapshot(),before);
 assert.equal((await f.see())!.parts[0].state,'succeeded');t.diagnostic(JSON.stringify({case:'IR03',conflict:true,tablesUnchanged:tables.length,additionalInspections:0}));
});
