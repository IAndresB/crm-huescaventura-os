import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedDiagnostics,read,write} from '../support/h5-diagnostic-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {canonicalCommercial} from '../../src/domain/commercial-progress.ts';
import {createF1Issuer,encodeF1Fields} from '../../src/infrastructure/postgres/f1-codec.ts';
import {createF2Issuer} from '../../src/infrastructure/postgres/f2-codec.ts';
import {postgresF1Binding} from '../../src/infrastructure/postgres/transaction.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
let h:Awaited<ReturnType<typeof isolatedDiagnostics>>;
before(async()=>{h=await isolatedDiagnostics('h5017security',59618);});after(async()=>{await h?.close();});
const query=(id:string)=>({contextKind:'booking' as const,contextId:id,pageSize:100});
async function obs(id:string){return{...query(id),observationId:uid(),requestRef:diagnosticReference(uid()),operationId:uid(),outcome:'pending' as const,issues:[semanticIssue('E4','operation')]};}
test('H5-017 D06 verified auth, correct interaction and current session required',async()=>{
 const f=await communicationFixture(h),q=query(f.context.contextId),o=await obs(q.contextId);
 for(const a of [{} as never,{subject:h.subject,sessionId:h.sessionId,mfaVerified:true}as never]){
  await assert.rejects(h.diagnostics.read(a,read,q),/^Error: DIAGNOSTIC_DENIED$/);await assert.rejects(h.diagnostics.record(a,write,o));
 }
 for(const i of [write,classifyServerEvent('polling')])await assert.rejects(h.diagnostics.read(await h.auth(),i,q));
 await assert.rejects(h.diagnostics.record(await h.auth(),read,o));
 const auth=await h.auth();await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;
 try{await assert.rejects(h.diagnostics.read(auth,read,q));await assert.rejects(h.diagnostics.record(auth,write,o));}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;}
 const fresh=await secondWorkActor(h);h.auth=fresh.auth;assert.ok(await h.diagnostics.read(await h.auth(),read,q));
});
test('H5-017 D06 raw SQL and every low privilege role denied table and helper access',async()=>{
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){
  for(const p of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'])assert.equal((await h.observer`select has_table_privilege(${role},'crm_private.b10_diagnostic_observations',${p}) ok`)[0]!.ok,false);
  for(const helper of ['crm_private.diagnostic_ref(text)','crm_private.diagnostic_root(text,text,uuid)','crm_private.diagnostic_nodes(text,text,uuid)'])assert.equal((await h.observer`select has_function_privilege(${role},${helper},'EXECUTE') ok`)[0]!.ok,false);
 }
 for(const sql of ['select * from crm_private.b10_diagnostic_observations',"select crm_private.diagnostic_nodes('synthetic','booking',null)",'select crm_api.h5_diagnostic_read(null,null,null,null,null)','select crm_api.h5_diagnostic_record(null,null,null,null,null)'])await assert.rejects(h.runtime.unsafe(sql));
 const table=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b10_diagnostic_observations'::regclass`)[0]!;assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);
 const functions=await h.observer`select p.oid::regprocedure::text f,p.proconfig,p.prosecdef,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.proname in('h5_diagnostic_record','h5_diagnostic_read','diagnostic_nodes','diagnostic_ref','diagnostic_root')`;
 assert.equal(functions.length,5);for(const f of functions){assert.equal(f.rolsuper,false);assert.equal(f.rolbypassrls,false);assert.equal(f.rolcanlogin,false);assert.ok(f.proconfig.includes('search_path=pg_catalog, pg_temp'));}
});
async function signed(input:unknown,mode:string,writeMode=false):Promise<any>{return h.runtime.begin('isolation level read committed',async tx=>{
 const auth=await h.auth(),r=(await tx.unsafe<any[]>('select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)',[auth.subject,auth.sessionId!]))[0]!,binding=await postgresF1Binding(tx);
 const q=encodeF1Fields([writeMode?'CRM-H5-DIAGNOSTIC1':'CRM-H5-DIAGNOSTIC-READ1',canonicalCommercial(input)]);
 const human=createF2Issuer(h.f2)(auth,{actorId:mode==='actor'?uid():r.actor_id,scope:r.admin_scope,accessGeneration:r.access_generation,sessionId:auth.sessionId!,epochId:r.epoch_id},binding,writeMode?'evidence_write':'evidence_read',q,writeMode?write:read);
 const tech=createF1Issuer(h.f1)(issueTrustedContext({identityId:'synthetic-audit',identityKind:'technical',purpose:'h1-evidence',scope:mode==='scope'?'foreign-synthetic':r.admin_scope,requestId:uid(),serverTime:new Date().toISOString()}),binding,writeMode?'C03':'C01',q,{resource:'evidence',action:writeMode?'write_evidence':'read_evidence'});
 const bad=(b:Buffer)=>{const c=Buffer.from(b);c[0]=c[0]!^1;return c;};const args=[human.payload,mode==='f2'?bad(human.mac):human.mac,tech.payload,mode==='f1'?bad(tech.mac):tech.mac,q];
 if(mode==='reuse')return args;return(await tx.unsafe<any[]>(`select crm_api.h5_diagnostic_${writeMode?'record':'read'}($1,$2,$3,$4,$5) v`,args))[0]!.v;
});}
test('H5-017 D06 signed actor scope MAC and transaction replay attacks rejected',async()=>{
 const f=await communicationFixture(h),q=query(f.context.contextId);for(const m of ['actor','scope','f1','f2'])await assert.rejects(signed(q,m));const args=await signed(q,'reuse');await assert.rejects(h.runtime.unsafe('select crm_api.h5_diagnostic_read($1,$2,$3,$4,$5)',args));assert.equal((await signed(q,'valid')).technicalOnly,true);
});
test('H5-017 D05 direct signed SQL cannot persist secret keys free text invalid states or foreign links',async()=>{
 const f=await communicationFixture(h),q=await obs(f.context.contextId);const {pageSize,...o}=q;
 for(const change of [{secret:'CANARY'},{issues:[{code:'E4',affectedScope:'operation',message:'CANARY'}]},{issues:[{code:'E4',affectedScope:'canary'}]},{issues:[{code:'E9',affectedScope:'operation'}]},{outcome:'accepted'},{outcome:'rejected'},{executionId:uid()},{eventId:uid()},{requestRef:'https://CANARY.invalid'}])await assert.rejects(signed({...o,...change},'valid',true));
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${o.observationId}::uuid`)[0]!.n,0);
});
test('H5-017 D07 observations immutable to executor, owner and runtime and parallel replay unique',async()=>{
 const f=await communicationFixture(h),q=await obs(f.context.contextId),auth=await h.auth();const out=await Promise.all([h.diagnostics.record(auth,write,q),h.diagnostics.record(auth,write,q)]);assert.deepEqual(out.map(x=>x.replayed).sort(),[false,true]);
 for(const role of ['crm_h0_f2_executor','crm_h0_runtime'])for(const action of ['update','delete'])await assert.rejects(h.admin.begin(async tx=>{await tx.unsafe('set local role '+role);await tx.unsafe(action==='update'?'update crm_private.b10_diagnostic_observations set outcome=outcome':'delete from crm_private.b10_diagnostic_observations');}));
 for(const action of ['update','delete']){const result=await h.admin.begin(async tx=>{await tx.unsafe('set local role crm_h0_f2_owner');return tx.unsafe(action==='update'?'update crm_private.b10_diagnostic_observations set outcome=outcome returning observation_id':'delete from crm_private.b10_diagnostic_observations returning observation_id');});assert.equal(result.length,0);}
 assert.equal((await h.diagnostics.read(await h.auth(),read,{...query(f.context.contextId),reference:q.requestRef})).nodes.length,1);
});
test('H5-017 D06 final revalidation failure rolls back diagnostic write',async()=>{
 const f=await communicationFixture(h),q=await obs(f.context.contextId);
 const original=String((await h.observer`select pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure) body`)[0]!.body);
 const body=original.replace(/\bbegin\b/i,"begin if current_setting('h5017.persisted',true)='yes'then raise exception 'CANARY_FINAL_AUTH';end if;");assert.notEqual(body,original);
 await h.admin.unsafe("create function crm_private.h5017_checkpoint()returns trigger language plpgsql as $$begin perform set_config('h5017.persisted','yes',true);return new;end$$;create trigger h5017_checkpoint after insert on crm_private.b10_diagnostic_observations for each row execute function crm_private.h5017_checkpoint()");
 await h.admin.unsafe(body);try{await assert.rejects(h.diagnostics.record(await h.auth(),write,q),/^Error: DIAGNOSTIC_DENIED$/);}finally{await h.admin.unsafe(original);await h.admin.unsafe('drop trigger h5017_checkpoint on crm_private.b10_diagnostic_observations;drop function crm_private.h5017_checkpoint()');}
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${q.observationId}::uuid`)[0]!.n,0);await h.diagnostics.record(await h.auth(),write,q);
});
test('H5-017 D04 uncertain work has E4 and read never releases reservations or infers failure',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const claim=f.claim();await f.run(claim);await f.run(f.start(claim,1));await f.run({...f.base(),action:'result',attemptId:claim.attemptId,outcome:'uncertain',resultRef:'synthetic-timeout'});const before=await f.see();
 const v=await h.diagnostics.read(await h.auth(),read,{...query(f.context.contextId),reference:f.executionId});assert.equal(v.nodes.find(x=>x.source==='b08_attempts')!.state,'uncertain');assert.deepEqual(v.nodes.find(x=>x.source==='b08_attempts')!.issues,[semanticIssue('E4','execution')]);assert.deepEqual(await f.see(),before);
});

test('H5-017 D06 foreign administrative scope remains denied despite valid current administrator',async()=>{
 const id=uid();await h.migration`insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,verified)values(${id}::uuid,'booking','synthetic-foreign-scope','synthetic',false)`;
 await assert.rejects(h.diagnostics.read(await h.auth(),read,query(id)),/^Error: DIAGNOSTIC_DENIED$/);await assert.rejects(h.diagnostics.record(await h.auth(),write,await obs(id)),/^Error: DIAGNOSTIC_DENIED$/);
});
test('H5-017 D06 last authorization check after materializing read cannot return revoked content',async()=>{
 const f=await communicationFixture(h),original=String((await h.observer`select pg_get_functiondef('crm_f2.verify(bytea,bytea,bytea,text,text,text)'::regprocedure) body`)[0]!.body),nodes=String((await h.observer`select pg_get_functiondef('crm_private.diagnostic_nodes(text,text,uuid)'::regprocedure) body`)[0]!.body);
 const guard=original.replace(/\bbegin\b/i,"begin if current_setting('h5017.read_done',true)='yes'then raise exception 'CANARY_FINAL_READ_AUTH';end if;");const after=nodes.replace('return nodes;',"perform set_config('h5017.read_done','yes',true);return nodes;");assert.notEqual(after,nodes);
 await h.admin.unsafe(guard);await h.admin.unsafe(after);try{await assert.rejects(h.diagnostics.read(await h.auth(),read,query(f.context.contextId)),/^Error: DIAGNOSTIC_DENIED$/);}finally{await h.admin.unsafe(original);await h.admin.unsafe(nodes);}
 assert.ok(await h.diagnostics.read(await h.auth(),read,query(f.context.contextId)));
});
