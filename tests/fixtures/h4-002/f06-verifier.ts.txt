import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID as uid} from 'node:crypto';
import {isolatedRequirement,write,read,requirementTables} from '../support/h4-requirement-isolated.ts';import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {quantityFixture,nominalFixture} from '../support/h2-quantities-fixtures.ts';
import type {RequirementCommand} from '../../src/domain/document-requirement.ts';
test('H4-002 guard complement: indispensable-only, action/purpose, participant/night/booking scope, no personal extraction',async()=>{
 const h=await isolatedRequirement('crm_h4002_guards',56011);try{
 const f=await requirementFixture(h),apply=async(q:RequirementCommand)=>h.requirements.apply(await h.auth(),write,q);
 await apply(await f.need({basis:{...f.basis,rule:{...f.basis.rule,indispensable:false}}}));assert.equal((await h.requirements.evaluate(await h.auth(),read,f.bookingId,f.basis.scope,f.basis.rule.purpose)).allowed,true);
 const g=await requirementFixture(h,f.b);await apply(await g.need());assert.equal((await h.requirements.evaluate(await h.auth(),read,g.bookingId,{...g.basis.scope,action:'unrelated-action'},g.basis.rule.purpose)).allowed,true);assert.equal((await h.requirements.evaluate(await h.auth(),read,g.bookingId,g.basis.scope,'unrelated-purpose')).allowed,true);
 const b=await quantityFixture(h),q=await nominalFixture(h,b);await h.booking.apply(await h.auth(),write,q);const service=q.detail.services[2]!,night=service.nights[0]!,person=q.detail.participants[0]!;
 const p=await requirementFixture(h,f.b),basis={...p.basis,rule:{...p.basis.rule,scopeKind:'participant' as const},scope:{action:'prepare',serviceId:service.id,nightId:night.id,participantId:person.id}};
 await apply(await p.need({bookingId:q.bookingId,basis}));assert.equal((await h.requirements.read(await h.auth(),read,p.requirementId,q.bookingId))!.status,'Pendiente');
 await assert.rejects(apply(await p.need({requirementId:uid(),bookingId:q.bookingId,basis:{...basis,scope:{...basis.scope,nightId:service.nights[1]!.id}}})));
 const booking=await requirementFixture(h,f.b);await apply(await booking.need({basis:{...booking.basis,rule:{...booking.basis.rule,scopeKind:'booking'},scope:{action:'concrete-booking-effect'}}}));assert.equal((await h.requirements.evaluate(await h.auth(),read,booking.bookingId,{action:'concrete-booking-effect'},booking.basis.rule.purpose)).allowed,false);
 for(const field of ['names','rooms','dni','extractedData','audio','retentionDays','taskCompleted'])await assert.rejects(apply(await g.attest({...await g.need(),[field]:['SYNTHETIC']} as RequirementCommand)));
 const rows=await h.observer`select p.relname,r.rolname,has_table_privilege('crm_h0_runtime',p.oid,'SELECT') runtime from pg_class p join pg_roles r on r.oid=p.relowner where p.relname=any(${requirementTables})`;assert.ok(rows.every(x=>x.runtime===false));
 }finally{await h.close();}
});
test('H4-002-F05 material guard: unchanged original cannot reopen a reviewed requirement',async()=>{
 const h=await isolatedRequirement('crm_h4002_f05',56012);try{const f=await requirementFixture(h),apply=async(q:RequirementCommand)=>h.requirements.apply(await h.auth(),write,q);await apply(await f.need());await apply(await f.receive());await apply(await f.review());const s=(await f.see())!,d=s.document!;const q=await f.command('change',{basis:f.basis,document:{documentId:d.documentId,objectVersionId:d.objectVersionId,ruleVersion:d.ruleVersion,purpose:d.purpose,coverage:d.coverage}});await assert.rejects(apply(q));assert.deepEqual(await f.see(),s);}finally{await h.close();}
});
test('H4-002 authorization complement: existing foreign requirement, service, original and Booking UUIDs deny read/write',async()=>{
 const h=await isolatedRequirement('crm_h4002_foreign',56013);try{const f=await requirementFixture(h),apply=async(q:RequirementCommand)=>h.requirements.apply(await h.auth(),write,q);await apply(await f.need());const d=await f.document(),receive=await f.receive(d),scope='SYNTHETIC-foreign-scope';
 const move=async(table:string,column:string,id:string,foreign:boolean)=>{await h.admin.unsafe(`alter table crm_private.${table} disable trigger user`);await h.admin.unsafe(`update crm_private.${table} set admin_scope=$1 where ${column}=$2::uuid`,[foreign?scope:h.scope,id]);await h.admin.unsafe(`alter table crm_private.${table} enable trigger user`);};
 for(const [table,column,id] of [['b07_records','record_id',d.documentId],['b04_services','service_id',f.basis.scope.serviceId!],['b04_bookings','booking_id',f.bookingId]]){await move(table!,column!,id!,true);try{await assert.rejects(apply(receive));if(table==='b04_bookings')assert.equal(await f.see(),null);}finally{await move(table!,column!,id!,false);}}
 await move('b07_requirements','requirement_id',f.requirementId,true);try{assert.equal(await f.see(),null);await assert.rejects(apply(receive));}finally{await move('b07_requirements','requirement_id',f.requirementId,false);}
 assert.equal((await f.see())!.status,'Pendiente');
 }finally{await h.close();}
});
test('H4-002-F06 result contract: first effect applied is explicit false replay; repeated operation explicit true',async()=>{
 const h=await isolatedRequirement('crm_h4002_f06',56014);try{const f=await requirementFixture(h),q=await f.need();assert.equal((await h.requirements.apply(await h.auth(),write,q)).replayed,false);assert.equal((await h.requirements.apply(await h.auth(),write,q)).replayed,true);}finally{await h.close();}
});
