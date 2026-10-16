import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID as uid} from 'node:crypto';
import {isolatedJointClosures,jointMigration,write,read} from '../support/h5-joint-closure-isolated.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {createF1Issuer,encodeF1Fields} from '../../src/infrastructure/postgres/f1-codec.ts';
import {createF2Issuer} from '../../src/infrastructure/postgres/f2-codec.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {postgresF1Binding} from '../../src/infrastructure/postgres/transaction.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
let h:Awaited<ReturnType<typeof isolatedJointClosures>>;
before(async()=>{h=await isolatedJointClosures('h5016security',59562);});after(async()=>{await h?.close();});
test('H5-016 A05 signed joint write rejects forged actor scope MAC command and reused transaction',async()=>{
 const f=await jointFixture(h),q=await f.j.command();
 const signed=async(mode:string):Promise<any>=>h.runtime.begin('isolation level read committed',async tx=>{
  const auth=await h.auth(),r=(await tx.unsafe<any[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]))[0]!,binding=await postgresF1Binding(tx),input=encodeF1Fields(['CRM-H5-CLOSURE1',canonicalCommercial(q)]);
  const human=createF2Issuer(h.f2)(auth,{actorId:mode==='actor'?uid():r.actor_id,scope:r.admin_scope,accessGeneration:r.access_generation,sessionId:auth.sessionId!,epochId:r.epoch_id},binding,'evidence_write',input,write);
  const tech=createF1Issuer(h.f1)(issueTrustedContext({identityId:'h5016-audit',identityKind:'technical',purpose:'h1-evidence',scope:mode==='scope'?'synthetic-foreign':r.admin_scope,requestId:uid(),serverTime:new Date().toISOString()}),binding,'C03',input,{resource:'evidence',action:'write_evidence'});
  const bad=(x:Buffer)=>{const b=Buffer.from(x);b[0]=b[0]!^1;return b;};const args=[human.payload,mode==='mac2'?bad(human.mac):human.mac,tech.payload,mode==='mac1'?bad(tech.mac):tech.mac,mode==='command'?encodeF1Fields(['CRM-H5-CLOSURE1',canonicalCommercial({...q,bookingId:uid()})]):input];
  if(mode==='reuse')return args;return(await tx.unsafe<any[]>('select crm_api.closure_joint_apply($1,$2,$3,$4,$5) v',args))[0]!.v;
 });
 for(const mode of ['actor','scope','mac1','mac2','command'])await assert.rejects(signed(mode));const args=await signed('reuse');await assert.rejects(h.runtime.unsafe('select crm_api.closure_joint_apply($1,$2,$3,$4,$5)',args));assert.equal((await f.j.c.view()).jointClosure.history.length,0);assert.equal((await signed('valid')).result.status,'Cerrada / Histórico');
});
test('H5-016 A05 final F2 revalidation failure rolls back closure and operation',async()=>{
 const f=await jointFixture(h),q=await f.j.command(),before=await f.j.c.view();const original=String((await h.observer`select pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure) body`)[0]!.body);
 const body=original.replace(/\bbegin\b/i,"begin if current_setting('h5016.persisted',true)='yes' then raise exception 'H5016_FINAL_AUTH_REVOKED';end if;");assert.notEqual(body,original);
 await h.admin.unsafe("create sequence crm_private.h5016_checkpoint;grant usage on sequence crm_private.h5016_checkpoint to crm_h0_f2_executor;create function crm_private.h5016_checkpoint()returns trigger language plpgsql as $$begin perform nextval('crm_private.h5016_checkpoint');perform set_config('h5016.persisted','yes',true);return new;end$$;create trigger h5016_checkpoint after insert on crm_private.b06_joint_closures for each row execute function crm_private.h5016_checkpoint()");
 await h.admin.unsafe(body);try{await assert.rejects(f.j.run(q));assert.equal((await h.admin`select is_called from crm_private.h5016_checkpoint`)[0]!.is_called,true);}finally{await h.admin.unsafe(original);await h.admin.unsafe('drop trigger h5016_checkpoint on crm_private.b06_joint_closures;drop function crm_private.h5016_checkpoint();drop sequence crm_private.h5016_checkpoint');}
 assert.deepEqual(await f.j.c.view(),before);assert.equal((await h.observer`select count(*)::int n from crm_private.b06_closure_operations where operation_id=${q.operationId}::uuid`)[0]!.n,0);await f.j.run(q);
});
test('H5-016 A02/A08 source reference reassignment and deletion denied to executor and runtime',async()=>{
 const a=await jointFixture(h),b=await jointFixture(h);await a.j.run(await a.j.command());const before=await a.j.c.view();
 for(const table of ['b04_services','b04_contributions','b05_payment_schedules','b04_bookings'])for(const action of ['update','delete']){
  const sql=action==='delete'?`delete from crm_private.${table} where booking_id=$1`:`update crm_private.${table} set booking_id=$2 where booking_id=$1`;
  await assert.rejects(h.admin.begin(async(tx:any)=>{await tx.unsafe('set local role crm_h0_f2_executor');await tx.unsafe(sql,action==='delete'?[a.bookingId]:[a.bookingId,b.bookingId]);}));
  await assert.rejects(h.runtime.unsafe(sql,action==='delete'?[a.bookingId]:[a.bookingId,b.bookingId]));
 }
 assert.deepEqual(await a.j.c.view(),before);assert.equal((await b.j.c.view()).jointClosure.current,false);
});
test('H5-016 A06 upgrade62 with three resolved dimensions preserves history and rollback midway',async()=>{
 const old=await isolatedJointClosures('h5016upgrade',59563,true);
 try{
  const f=await jointFixture(old),before=await f.j.c.view(),sql=await readFile('supabase/migrations/'+jointMigration,'utf8');
  const functions=()=>old.observer`select p.oid,md5(pg_get_functiondef(p.oid)) hash,p.proowner,p.proacl,p.proconfig,p.prosecdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`;
  const catalog=await functions();await assert.rejects(old.migration.unsafe(sql.replace('create function crm_private.closure_joint_view','select 1/0;create function crm_private.closure_joint_view')));await old.migration.unsafe('rollback');assert.deepEqual(await functions(),catalog);assert.deepEqual(await f.j.c.view(),before);
  await old.migration.unsafe(sql);const after=await f.j.c.view();assert.deepEqual(after.history,before.history);assert.equal(after.jointClosure.current,false);for(const d of ['commercial','operational','economic']as const)assert.equal(after.assessments[d]!.currentStatus,'Resuelto');await f.j.run(await f.j.command());assert.equal((await f.j.c.view()).jointClosure.history.length,1);
  const constraints=await old.observer`select conrelid::regclass::text relation,contype,pg_get_constraintdef(oid) definition from pg_constraint where conrelid in('crm_private.b06_joint_closures'::regclass,'crm_private.b06_closure_invalidations'::regclass)order by conrelid,conname`;
  const indexes=await old.observer`select tablename,indexdef from pg_indexes where schemaname='crm_private' and tablename in('b06_joint_closures','b06_closure_invalidations')order by indexname`;
  assert.ok(constraints.filter(c=>c.contype==='f').length>=5);assert.equal(indexes.length,3);console.log('H5016 constraints and indexes',JSON.stringify({constraints,indexes}));
 }finally{await old.close();}
});
test('H5-016 A05 closed replay is denied after actor revocation',async()=>{
 const f=await jointFixture(h),q=await f.j.command();await f.j.run(q);const auth=await h.auth();await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;
 try{await assert.rejects(h.closures.close(auth,write,q));await assert.rejects(h.closures.read(auth,read,f.bookingId));}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;}
 const fresh=await secondWorkActor(h);h.auth=fresh.auth;assert.equal((await f.j.c.view()).jointClosure.history.length,1);
});
