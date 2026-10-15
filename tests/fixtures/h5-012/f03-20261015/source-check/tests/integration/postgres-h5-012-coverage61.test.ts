// Independent supplements to C03/C05/C06. Literal civil dates come from frozen expected.
// Canonical synthetic records are written through existing authorized adapters.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedBoundaries,read,write} from '../support/h5-boundary-isolated.ts';
import {referenceFixture} from '../support/h5-012-reference-fixture.ts';
import {obligationFixture} from '../support/h3-obligation-fixtures.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H5001TaskAdapter} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
import {approvedTaskNeeds} from '../../src/domain/approved-task-needs.ts';
import {evaluateTaskDeadline} from '../../src/domain/pending-task.ts';
import {projectCivilReference} from '../../src/domain/coordinated-projection.ts';
import {civilReference,localDate,zoneEvidence,selectReference,type CivilReference} from '../../src/domain/civil-time.ts';
let h:Awaited<ReturnType<typeof isolatedBoundaries>>,p:H5011ProjectionAdapter,t:H5001TaskAdapter;
before(async()=>{h=await isolatedBoundaries('h512cov61',59456);for(const n of (await readdir('supabase/migrations')).filter(x=>x>='20261014003559'&&x.endsWith('.sql')).sort())await h.migration.unsafe(await readFile('supabase/migrations/'+n,'utf8'));p=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);t=new H5001TaskAdapter(h.runtime,h.f1,h.f2);});
after(async()=>{await h?.close();});
const get=async(id:string,surface:'calendar'|'timeline'='calendar')=>p.read(await h.auth(),read,{contextKind:'booking',contextId:id,surface,destination:'administrator'});
const rows=(x:any,kind:string)=>x.entries.filter((e:any)=>e.source==='crm_private.'+kind).map((e:any)=>e.data);
async function task(bid:string,reference:CivilReference,daysBefore=7){const need=approvedTaskNeeds({cause:'final_participants',causeId:uid(),contextKind:'booking',contextId:bid,scopeRef:reference.scopeId,sourceRef:reference.sourceRef,sourceVersion:reference.version,finalParticipants:{reference,daysBefore}})[0]!;const taskId=uid();await t.apply(await h.auth(),write,{...need,action:'receive',operationId:uid(),taskId,expectedRevision:0});return {taskId,need};}
const ref=(scope:CivilReference['scope'],id:string,date:string,source:string)=>civilReference({scope,scopeId:id},localDate(date),zoneEvidence('Europe/Madrid','SYNTHETIC explicit accepted zone','1'),source,'1');
const quantities=async(bid:string)=>Array.from(await h.observer`select to_jsonb(c) v from crm_private.b04_contributions c where booking_id=${bid}::uuid order by contribution_id`);

test('H5-012 C03 supplement: configured final-count Task is projected and retains complete seventh day',async()=>{
 const f=await referenceFixture(h);await h.booking.apply(await h.auth(),write,f.q);const before=await quantities(f.q.bookingId),n=await task(f.q.bookingId,ref('global',f.q.bookingId,'2026-11-20',f.q.versionId));
 const actual=rows(await get(f.q.bookingId),'b07_pending_tasks').find((x:any)=>x.task_id===n.taskId);assert.ok(actual);assert.equal(actual.state,'pending');assert.equal(actual.identity.causeKind,'final_participants');assert.equal(actual.material.deadline.daysBefore,7);assert.equal(actual.material.deadline.reference.date,'2026-11-20');
 for(const [date,overdue] of [['2026-11-13',false],['2026-11-14',true]] as const)assert.equal(evaluateTaskDeadline(actual.material.deadline,{date}).overdue,overdue);
 for(const at of ['2026-11-13T00:00:00+01:00','2026-11-13T23:59:59+01:00'])assert.equal(projectCivilReference(actual.material.deadline.reference,at).evaluation!.daysBefore,7);
 assert.equal((await t.read(await h.auth(),read,n.taskId,'booking',f.q.bookingId))!.state,'pending');assert.deepEqual(await quantities(f.q.bookingId),before);assert.ok(before.every(x=>x.v.certainty==='estimated'));
 console.log('C03 persisted final-count',JSON.stringify(actual));
});

test('H5-012 C05 supplement: authorized global modality service and night references survive projection without propagation',async()=>{
 const f=await referenceFixture(h);await h.booking.apply(await h.auth(),write,f.q);const bid=f.q.bookingId,night=f.detail.services[2]!.nights.find(x=>x.date==='2026-11-23')!,before=await quantities(bid);
 const scopes=[['global',bid,'2026-11-20',2],['modality',f.modalities[1]!.id,'2026-11-22',4],['service',f.detail.services[0]!.id,'2026-11-20',2],['night',night.id,'2026-11-23',5]] as const;
 const canonical=await get(bid,'timeline');assert.ok(rows(canonical,'b04_modalities').some((x:any)=>x.modality_id===scopes[1][1]));assert.ok(rows(canonical,'b04_nights').some((x:any)=>x.night_id===night.id&&x.night_date==='2026-11-23'));
 const created=[];for(const [scope,id,date] of scopes)created.push(await task(bid,ref(scope,id,date,f.q.versionId)));
 const projected=rows(await get(bid),'b07_pending_tasks');
 for(let i=0;i<scopes.length;i++){const [scope,id,date,days]=scopes[i]!,actual=projected.find((x:any)=>x.task_id===created[i]!.taskId);assert.ok(actual);assert.equal(actual.identity.scopeRef,id);assert.equal(actual.material.deadline.reference.scope,scope);assert.equal(actual.material.deadline.reference.scopeId,id);assert.equal(actual.material.deadline.reference.date,date);assert.equal(actual.material.deadline.reference.sourceRef,f.q.versionId);assert.equal(projectCivilReference(actual.material.deadline.reference,'2026-11-18T12:00:00+01:00').evaluation!.daysBefore,days);assert.deepEqual(actual.material,(await t.read(await h.auth(),read,actual.task_id,'booking',bid))!.material);}
 const n=created[3]!,material={...n.need.material,deadline:{...n.need.material.deadline,daysBefore:3}};
 await t.apply(await h.auth(),write,{...n.need,material,taskId:n.taskId,action:'update',operationId:uid(),expectedRevision:1});const next=rows(await get(bid),'b07_pending_tasks');
 for(const c of created.slice(0,3))assert.deepEqual(next.find((x:any)=>x.task_id===c.taskId),projected.find((x:any)=>x.task_id===c.taskId));assert.equal(next.find((x:any)=>x.task_id===n.taskId).material.deadline.daysBefore,3);assert.deepEqual(await quantities(bid),before);
 const other=await referenceFixture(h);await h.booking.apply(await h.auth(),write,other.q);assert.equal(JSON.stringify(await get(other.q.bookingId)).includes(n.taskId),false);await assert.rejects(t.read({} as never,read,n.taskId,'booking',bid));
 console.log('C05 scoped references',JSON.stringify(next.filter((x:any)=>created.some(c=>c.taskId===x.task_id))));
});

test('H5-012 C06 supplement: persisted suggested unverified reference cannot override valid contract',async()=>{
 const o=await obligationFixture(h,'1000.00','2026-11-12T10:00:00Z',['2026-11-20','2026-11-22']),normal=o.q.definition!.reference,contract=civilReference({scope:'global',scopeId:o.b.bookingId},localDate('2026-11-25'),normal.zone,'SYNTHETIC expressly valid contract','2','express_contract');
 const chosen=selectReference([normal,contract],{scope:'global',scopeId:o.b.bookingId});await h.obligations.apply(await h.auth(),write,await o.attest({...o.q,definition:{...o.q.definition!,reference:chosen}}));
 const original=rows(await get(o.b.bookingId,'timeline'),'b05_schedule_revisions');const suggested=civilReference({scope:'global',scopeId:o.b.bookingId},localDate('2026-11-28'),normal.zone,'SYNTHETIC unverified suggestion','3','express_contract');
 const cmd={...o.q,operationId:uid(),expectedRevision:1,definition:{...o.q.definition!,reference:suggested}};
 const value=Object.fromEntries(Object.entries(cmd).filter(([k,v])=>!['operationId','evidenceId','computed'].includes(k)&&v!==undefined));const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(value)}::text::jsonb::text,'UTF8'),'sha256'),'hex') hash`)[0]!.hash;
 const evidenceId=uid();await h.evidence.apply(await h.auth(),write,{action:'create',operationId:uid(),targetId:evidenceId,kind:'evidence',material:{claim:`obligation:${cmd.action}:${hash}`,coverage:o.b.coverage,certainty:'candidate',source_kind:'manual'},sourceRef:JSON.stringify(suggested),purpose:'SYNTHETIC suggested unverified reference',contextKind:'booking',contextId:o.b.bookingId,coverage:o.b.coverage,reason:'SYNTHETIC negative authorization',occurredAt:cmd.at});
 await assert.rejects(h.obligations.apply(await h.auth(),write,{...cmd,evidenceId}));const result=await get(o.b.bookingId,'timeline'),candidate=(result!.entries as any[]).find(x=>x.data?.record_id===evidenceId);assert.ok(candidate);assert.equal(candidate.data.material.certainty,'candidate');assert.equal(candidate.certainty,'pending');assert.ok(JSON.stringify(candidate).includes('2026-11-28'));assert.deepEqual(rows(result,'b05_schedule_revisions'),original);assert.ok(JSON.stringify(original).includes('2026-11-25'));assert.equal(JSON.stringify(original).includes('2026-11-28'),false);assert.equal(normal.date,'2026-11-20');
 console.log('C06 persisted negative record',JSON.stringify({candidate,retained:original}));
});
