/** Historical minimal reproducers: assert original defects, never adapt normative expected. */
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedObligation,write,read} from '../support/h3-obligation-isolated.ts';
import {obligationFixture} from '../support/h3-obligation-fixtures.ts';
import {determineSchedule} from '../../src/domain/payment-obligation.ts';
import {createF1Issuer,encodeF1Fields} from '../../src/infrastructure/postgres/f1-codec.ts';
import {createF2Issuer} from '../../src/infrastructure/postgres/f2-codec.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {postgresF1Binding} from '../../src/infrastructure/postgres/transaction.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
let h:Awaited<ReturnType<typeof isolatedObligation>>;
before(async()=>{h=await isolatedObligation('crm_h3_002_defects',55675,true);await h.migration.unsafe(await readFile(new URL('../fixtures/h3-002/migration-e578241-original.sql.txt',import.meta.url),'utf8'));});after(async()=>{await h?.close();});
async function raw(input:unknown){const auth=await h.auth();return h.runtime.begin(async tx=>{
 const row=(await tx`select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup(${auth.subject}::uuid,${auth.sessionId!}::uuid)`)[0]!,binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,sessionId:auth.sessionId!,accessGeneration:row.access_generation,epochId:row.epoch_id};
 const q=encodeF1Fields(['CRM-H3-OBLIGATION1',canonicalCommercial(input)]),t=createF1Issuer(h.f1)(issueTrustedContext({identityId:'H3 historical reproducer',identityKind:'technical',purpose:'h1-evidence',scope:h.scope,requestId:uid(),serverTime:new Date().toISOString()}),binding,'C03',q,{resource:'evidence',action:'write_evidence'}),a=createF2Issuer(h.f2)(auth,identity,binding,'evidence_write',q,write);
 return tx`select crm_api.obligation_apply(${a.payload},${a.mac},${t.payload},${t.mac},${q}) r`;
});}
test('F01 reproduces original forbidden number JSON difference',async()=>{const f=await obligationFixture(h);await h.obligations.apply(await h.auth(),write,f.q);const q=await f.attest({action:'adjust',operationId:uid(),bookingId:f.q.bookingId,policyId:f.q.policyId,scheduleId:f.q.scheduleId,scope:f.q.scope,scopeId:f.q.scopeId,expectedRevision:1,sourceRef:'SYNTHETIC exact correction',reason:'SYNTHETIC authorized cause',at:f.q.at,evidenceId:uid(),slot:'initial',amount:'0.00',due:{kind:'at_confirmation'}});await h.obligations.apply(await h.auth(),write,q);const record=await h.obligations.read(await h.auth(),read,q.bookingId,q.scheduleId!),difference=(record!.history[0] as {difference:unknown}).difference;assert.equal(typeof difference,'number');assert.throws(()=>assert.equal(difference,'-500.01'));});
test('F02 reproduces original numeric amount acceptance against fail-closed expected',async()=>{const f=await obligationFixture(h);const q={...f.q,computed:determineSchedule(f.q.policy!,f.q.definition!)};(q.definition!.base as {amount:unknown}).amount=1000.01;const attested=await f.attest(q);await raw(attested);assert.equal((await h.observer`select count(*)::int n from crm_private.b05_payment_schedules where booking_id=${q.bookingId}::uuid`)[0]!.n,1);});
test('F03 reproduces original literal session activity equality failure',async()=>{const f=await obligationFixture(h);const before=(await h.observer`select to_jsonb(e) d from crm_private.identification_epochs e where session_id=${h.sessionId}::uuid`)[0]!.d;await h.obligations.apply(await h.auth(),write,f.q);const after=(await h.observer`select to_jsonb(e) d from crm_private.identification_epochs e where session_id=${h.sessionId}::uuid`)[0]!.d;assert.ok(after.last_human_activity_at>before.last_human_activity_at);assert.throws(()=>assert.deepEqual(after,before));});
