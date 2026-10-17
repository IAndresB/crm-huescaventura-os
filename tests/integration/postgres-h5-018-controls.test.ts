import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id,createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {auditDatabase,read,write} from '../support/h5-018-audit-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {invokeDiagnosticOperation} from '../../src/server/diagnostic-operation.ts';
import {composeServer} from '../../src/server/composition.ts';
import {issueTrustedContext} from '../../src/application/trusted-context.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
let h:Awaited<ReturnType<typeof auditDatabase>>;
before(async()=>{h=await auditDatabase('h5018controls',59722);});after(async()=>{await h?.close();});
const query=(contextId:string)=>({contextKind:'booking' as const,contextId,pageSize:100});
const writer={record:async(o:any)=>h.diagnostic.record(await h.auth(),write,o)};

test('A16 accepted technical observation cannot create payment acceptance delivery or closure',async()=>{
 const f=await communicationFixture(h);const tables=await h.admin`select tablename from pg_tables where schemaname='crm_private' and tablename like 'b0%' order by tablename`;
 const snapshot=async()=>{const rows=[];for(const {tablename} of tables)rows.push([tablename,await h.admin.unsafe(`select to_jsonb(x) value from crm_private.${tablename} x order by to_jsonb(x)::text`)]);return createHash('sha256').update(JSON.stringify(rows)).digest('hex');};
 const before=await snapshot();const r=await invokeDiagnosticOperation({...query(f.context.contextId),operationId:id(),requestId:id()},writer,async()=>({status:'applied',value:{technical:true}}));
 assert.equal(r.diagnosticRecorded,true);assert.equal(await snapshot(),before);assert.equal((await h.diagnostic.read(await h.auth(),read,{...query(f.context.contextId),reference:r.requestRef})).technicalOnly,true);console.log('A16 canonical tables preserved',JSON.stringify({tables:tables.length,before,after:await snapshot()}));
});

test('A14 denied input and failed SQL keep canary absent from error and database log',async()=>{
 const f=await communicationFixture(h),canary='AUDIT_DENIED_SECRET_TOKEN_BODY_COST_018';
 const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:'https://temporary.invalid/?token='+canary,outcome:'accepted' as const,issues:[]};
 await assert.rejects(writer.record(o),(e:Error)=>e.message==='DIAGNOSTIC_INPUT_INVALID');
 const inaccessible=id();await assert.rejects(h.diagnostic.read(await h.auth(),read,query(inaccessible)),(e:Error)=>e.message==='DIAGNOSTIC_DENIED');
 assert.equal((await readFile(join(h.temporary,'postgres.log'),'utf8')).includes(canary),false);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b10_diagnostic_observations where observation_id=${o.observationId}::uuid`)[0]!.n,0);
});

test('A11 foreign administrative scope cannot be read or recorded even by current actor',async()=>{
 const rootId=id();await h.migration`insert into crm_private.identity_contexts(context_id,context_kind,admin_scope,source_ref,verified)values(${rootId}::uuid,'booking','independent-foreign-scope','synthetic-audit',false)`;
 await assert.rejects(h.diagnostic.read(await h.auth(),read,query(rootId)),/DIAGNOSTIC_DENIED/);
 await assert.rejects(writer.record({...query(rootId),observationId:id(),requestRef:diagnosticReference(id()),outcome:'accepted',issues:[]}),/DIAGNOSTIC_DENIED/);
});

test('F02 control exposes false root association while unknown attempted ID remains representable',async()=>{
 const a=await boundaryFixture(h),b=await boundaryFixture(h),event=b.base();await b.run(event);const observationId=id();
 await writer.record({...query(a.contextId),observationId,requestRef:diagnosticReference(id()),operationId:event.operationId,outcome:'accepted',issues:[]});
 const p=await h.diagnostic.read(await h.auth(),read,{...query(a.contextId),reference:event.operationId});
 const canonical=(await h.observer`select raw_event->>'context_id' context from crm_private.b09_event_receipts where operation_id=${event.operationId}::uuid`)[0]!.context;
 const stored=(await h.observer`select context_id::text,operation_id::text from crm_private.b10_diagnostic_observations where observation_id=${observationId}::uuid`)[0]!;
 assert.equal(canonical,b.contextId);assert.equal(stored.context_id,a.contextId);assert.equal(p.nodes.length,1);assert.equal(p.nodes[0]!.id,observationId);assert.equal(p.technicalOnly,true);
 console.log('F02 diagnostic association',JSON.stringify({claimedRoot:stored.context_id,canonicalRoot:canonical,operationId:event.operationId,returned:p.nodes,technicalOnly:p.technicalOnly}));
 // This is a reproducer measurement, not an assertion that the false association is correct.
});

test('F03 positive control placing diagnostic wrapper inside composition preserves uncertainty',async()=>{
 const f=await communicationFixture(h),c=issueTrustedContext({identityId:h.actorId,identityKind:'human',scope:h.scope,purpose:'audit',requestId:id(),serverTime:new Date().toISOString()});let calls=0;
 const server=composeServer({allowedOrigins:new Set(['audit']),contexts:{resolve:async()=>c},fingerprints:{fingerprint:()=>''},replay:{inspect:async()=>({status:'new'})},diagnostics:{record:()=>{}}});
 const result=await server.invoke({requestId:id(),kind:'mutation',origin:'audit',payload:{},operation:{id:id()}},async()=>{
 const r=await invokeDiagnosticOperation({...query(f.context.contextId),operationId:id(),requestId:id()},writer,async()=>{calls++;throw new Error('synthetic unknown effect');});return r.result;});
 assert.equal(calls,1);assert.equal(result.status,'pending');assert.ok(result.status==='pending'&&result.issues.some(x=>x.code==='E4'));
});
