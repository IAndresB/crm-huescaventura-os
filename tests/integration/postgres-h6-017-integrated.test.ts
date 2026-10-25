// Frozen literal oracle: tests/fixtures/h6-017/functional-expected.json.
// Synthetic identities only; 68 approved migrations; real isolated PostgreSQL and Storage.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid,createHash,createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedWork,read,write} from '../support/h6-current-isolated.ts';
import {quantityFixture,nominalFixture} from '../support/h2-quantities-fixtures.ts';
import {fixture as fullClosedFixture} from '../support/h6-007-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {workFixture,secondWorkActor} from '../support/h5-work-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {ownEconomicsFixture} from '../support/h3-own-economics-fixtures.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
import {invokeDiagnosticOperation} from '../../src/server/diagnostic-operation.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
import {digest} from '../../src/infrastructure/storage/private-storage.ts';
import type {ProjectionQuery,ProjectionSurface} from '../../src/domain/coordinated-projection.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>,reader:H5011ProjectionAdapter,a:Awaited<ReturnType<typeof bookingFixture>>,b:typeof a,c:Awaited<ReturnType<typeof communicationFixture>>;
const markers=['SYNTHETIC_H6017_COST_759','SYNTHETIC_H6017_MARGIN_236','SYNTHETIC_H6017_PROFIT_381','SYNTHETIC_H6017_COMMISSION_542','SYNTHETIC_H6017_FEE_987','SYNTHETIC_H6017_PERSON_654'];
const secretCanary='SYNTHETIC_H6017_SECRET_BODY_CANARY';
const surfaces:ProjectionSurface[]=['timeline','calendar','query','search','export','document','ai_context'];
const oracle=JSON.parse(await readFile('tests/fixtures/h6-017/functional-expected.json','utf8'));
const q=(contextId:string,extra:Partial<ProjectionQuery>={}):ProjectionQuery=>({contextKind:'booking',contextId,surface:'timeline',destination:'administrator',...extra});
const get=async(contextId=a.q.bookingId,extra:Partial<ProjectionQuery>={})=>reader.read(await h.auth(),read,q(contextId,extra));
const book=async()=>{const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);return f;};
const bytes=Buffer.from('SYNTHETIC explicitly authorized original '+markers.join(' '));
let versionId:string;
const facts=(r:any,kind:string)=>r.entries.filter((e:any)=>e.source==='crm_private.'+kind).map((e:any)=>e.data);
const protectedTables=['b04_bookings','b04_services','b04_nights','b03_acceptances','b03_proposal_versions','b07_records','b07_history','b07_links','b07_object_versions','b08_executions','b08_attempts','b05_provider_invoices','b05_own_economies','b06_joint_closures'];
async function witness(){const out:Record<string,string>={};for(const table of protectedTables){if((await h.admin`select to_regclass(${'crm_private.'+table}) r`)[0]!.r)out[table]=(await h.admin.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E'\n' order by to_jsonb(r)::text),''),'sha256'),'hex') hash from crm_private.${table} r`))[0]!.hash;}return out;}
async function unchanged(action:()=>Promise<void>){const before=await witness();await action();assert.deepEqual(await witness(),before,'denial/projection must not mutate protected canonical state');}
before(async()=>{
 const expectedBytes=await readFile('tests/fixtures/h6-017/functional-expected.json');assert.equal(createHash('sha256').update(expectedBytes).digest('hex'),(await readFile('tests/fixtures/h6-017/functional-expected.json.sha256','utf8')).split(' ')[0]);
 assert.equal(new URL(process.env.STORAGE_H1_ENDPOINT!).hostname,'127.0.0.1');
 h=await isolatedWork('crm_h6017_functional',60617);reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);a=await book();b=await book();c=await communicationFixture(h,'incoming',a.q.bookingId);
 await c.run({...c.derive('summary'),content:markers.join(' ')});await c.run(c.derive('candidate'));
 const document=h.req('document',{relation:'original',content_ref:markers.join(' '),content_kind:'manual_record',storage_state:'reference_only'},a.q.bookingId,'booking');await h.evidence.apply(await h.auth(),write,document);
 versionId=uid();await h.objects.prepare(await h.auth(),write,{...c.context,operationId:uid(),versionId,rootId:uid(),expectedVersion:0,documentId:c.originalId,digest:digest(bytes),size:bytes.length,media:'text/plain',sourceRef:'SYNTHETIC explicit original',reason:'SYNTHETIC permitted purpose'});
 await h.objects.upload(await h.auth(),read,write,versionId,c.context,bytes,uid());await h.objects.reconcile(await h.auth(),read,write,versionId,c.context,uid());await h.objects.link(await h.auth(),read,write,versionId,c.context,uid());
});
after(async()=>{await h?.close();});
for(const surface of surfaces)test(`H6-017 F01 exact external ${surface} allowlist; reserved-field search has no oracle`,async t=>unchanged(async()=>{
 const internal=JSON.stringify(await get());assert.ok(internal.includes(markers[0]!));assert.ok(internal.includes('700.00'));
 for(const destination of ['customer','provider','ai'] as const){
  const out=await get(a.q.bookingId,{surface,destination});assert.ok(out);assert.equal(out.entries.length,2);assert.equal(out.mutationAuthority,false);
  for(const entry of out.entries as any[]){assert.deepEqual(Object.keys(entry).sort(),oracle.externalEntryKeys);assert.equal(entry.finalPersonPrice,'100.01');assert.equal(entry.participants,10);assert.equal(entry.reference,a.q.versionId);for(const item of entry.included)assert.deepEqual(Object.keys(item).sort(),oracle.externalIncludedKeys);}
  for(const token of [...markers,'700.00','900.00','economics',a.f.accepterId,b.q.bookingId,c.originalId,versionId,'private_ref','storage_state']){assert.equal(JSON.stringify(out).includes(token),false,token);assert.deepEqual((await get(a.q.bookingId,{surface,destination,search:token}))!.entries,[]);}
  await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId,{surface,destination}),includeOriginal:versionId,ownerOverride:true} as never),/PROJECTION_INPUT_INVALID/);
 }
 t.diagnostic(JSON.stringify({surface,destinations:3,expectedEntryFields:oracle.externalEntryKeys,canonicalStateUnchanged:true}));
}));
test('H6-017 F02 commercial relationship, future role and passive job do not grant authority',async()=>unchanged(async()=>{
 for(const subject of [a.f.accepterId,uid()]){const auth=await verifyAuth({verify:async()=>({subject,sessionId:uid(),passwordVerified:true,mfaVerified:true})},uid());for(const surface of surfaces)await assert.rejects(reader.read(auth,read,q(a.q.bookingId,{surface})),/DENIED/);await assert.rejects(h.objects.download(auth,read,versionId,c.context));}
 for(const role of ['customer','provider','collaborator','administrator','job']){const auth={...await h.auth(),role};await assert.rejects(reader.read(auth as never,read,q(a.q.bookingId)),/AUTH_REQUIRED/);}
 for(const event of ['polling','background-job','passive','token-refresh'] as const)await assert.rejects(reader.read(await h.auth(),classifyServerEvent(event),q(a.q.bookingId)),/AUTH_REQUIRED/);
 assert.ok(await get());
}));
test('H6-017 F03 root, context kind, search, cursor and shared original never widen access',async()=>{
 await h.evidence.apply(await h.auth(),write,{action:'link',operationId:uid(),targetId:uid(),originalId:c.originalId,contextKind:'booking',contextId:b.q.bookingId,purpose:c.context.purpose,sourceRef:'SYNTHETIC explicit link',coverage:'synthetic',reason:'SYNTHETIC approved second context'});
 await unchanged(async()=>{
  for(const [own,other] of [[a,b],[b,a]]){const out=await get(own!.q.bookingId);assert.equal(facts(out,'b04_bookings').some((x:any)=>x.booking_id===other!.q.bookingId),false);const original=out!.entries.find((x:any)=>x.data?.record_id===c.originalId) as any;assert.ok(original);assert.equal(original.links.length,1);assert.equal(original.links[0].context_id,own!.q.bookingId);}
  assert.equal((await h.evidence.read(await h.auth(),read,c.recordId,'contact',a.q.bookingId)).data,null);
  const first=await get(a.q.bookingId,{pageSize:1});assert.ok(first!.nextPage);for(const extra of [{contextId:b.q.bookingId},{destination:'customer'},{surface:'export'},{search:'SYNTHETIC'}])await assert.rejects(get(a.q.bookingId,{pageSize:1,after:first!.nextPage,...extra} as any));
  let after:string|undefined,all:unknown[]=[];do{const out=await get(a.q.bookingId,{pageSize:2,...(after?{after}:{})});all.push(...out!.entries);after=out!.nextPage;}while(after);assert.deepEqual(all,(await get())!.entries);
  assert.deepEqual((await get(a.q.bookingId,{search:b.q.bookingId}))!.entries,[]);
 });
});
test('H6-017 F04 original, derivative and candidate distinct; audio/retention/consent/deletion denied',async()=>unchanged(async()=>{
 const state=await c.see();assert.ok(state);assert.ok(JSON.stringify(state).includes('quizá 16'));assert.ok(JSON.stringify(state).includes(c.confirmedId));assert.ok(facts(await get(),'b07_communication_work').some((x:any)=>x.kind==='summary'));
 const confirmedBefore=(await h.evidence.read(await h.auth(),read,c.confirmedId,'booking',a.q.bookingId)).data;const original=(await h.evidence.read(await h.auth(),read,c.originalId,'booking',a.q.bookingId)).data;assert.ok(original);assert.equal((original as any).record.material.content_kind,'transcript');assert.equal((original as any).record.source_ref,'synthetic-PLAUD-authorized');assert.equal((original as any).record.recorded_by,h.actorId);assert.ok((original as any).record.occurred_at);assert.ok((original as any).record.recorded_at);const works=await h.observer`select to_jsonb(r) data from crm_private.b07_communication_work r where record_id=${c.recordId}::uuid`;assert.ok(works.some(x=>JSON.stringify(x.data).includes('summary')));assert.ok(works.some(x=>JSON.stringify(x.data).includes('synthetic-generator')));assert.ok(works.some(x=>JSON.stringify(x.data).includes('Revisión requerida')));assert.deepEqual((await h.evidence.read(await h.auth(),read,c.confirmedId,'booking',a.q.bookingId)).data,confirmedBefore);
 for(const key of ['includeAudio','consent','retentionDays','deleteOriginal','allContactData'])await assert.rejects(reader.read(await h.auth(),read,{...q(a.q.bookingId,{destination:'customer'}),[key]:true} as never),/INPUT_INVALID/);
 assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,versionId,c.context)),bytes);
}));
test('H6-017 F05 known private object URL, wrong purpose/root and revoked session refuse release',async()=>{
 const second=await secondWorkActor(h),auth=await second.auth(),metadata=await h.objects.metadata(auth,read,versionId,c.context);assert.ok(metadata);
 await unchanged(async()=>{
  for(const ctx of [{...c.context,contextId:uid()},{...c.context,purpose:'SYNTHETIC unauthorized'}])await assert.rejects(h.objects.download(auth,read,versionId,ctx));
  await assert.rejects(h.objects.download({...auth} as never,read,versionId,c.context));
  const endpoint=process.env.STORAGE_H1_ENDPOINT!,config=await readFile(process.env.STORAGE_H1_CONFIG!,'utf8'),secret=config.match(/^AUTH_JWT_SECRET=(.*)$/m)![1]!;
  const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),payload=Buffer.from(JSON.stringify({role:'authenticated',sub:a.f.accepterId,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url'),token=`${header}.${payload}.${createHmac('sha256',secret).update(`${header}.${payload}`).digest('base64url')}`;
  // Storage does not disclose bytes even when the actual private locator is known.
  const internals=h.storage as unknown as {bucket:string};const bucket=(h.storage as any).bucket;assert.equal(typeof bucket,'string');void internals;
  for(const headers of [new Headers(),new Headers({Authorization:`Bearer ${token}`})]){const response:Response=await fetch(`${endpoint}/object/authenticated/${bucket}/${metadata.private_ref}`,{headers});assert.equal(response.ok,false);assert.equal((await response.text()).includes(bytes.toString()),false);}
 });
 await new H0005PostgresAdapter(h.runtime,h.f1,h.f2).revokeOne(auth);await unchanged(async()=>{await assert.rejects(h.objects.download(auth,read,versionId,c.context));assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,versionId,c.context)),bytes);});
});
test('H6-017 F06 revocation committed while actual Storage download is paused prevents release',async()=>{
 const second=await secondWorkActor(h),auth=await second.auth();let ready!:()=>void,release!:()=>void;const fetched=new Promise<void>(r=>ready=r),gate=new Promise<void>(r=>release=r);
 const delayed=new H1015ObjectAdapter(h.connect('crm_h0_runtime'),{put:(...args)=>h.storage.put(...args),inventory:p=>h.storage.inventory(p),get:async p=>{const object=await h.storage.get(p);assert.ok(object);ready();await gate;return object;}},h.f1,h.f2);
 const pending=delayed.download(auth,read,versionId,c.context),denied=assert.rejects(pending,/OBJECT_DENIED/);await fetched;
 try{await new H0005PostgresAdapter(h.runtime,h.f1,h.f2).revokeOne(auth);}finally{release();}await denied;
 assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,versionId,c.context)),bytes);
});
test('H6-017 F07 real object upload metadata fault, repair, idempotence and corruption denial',async()=>{
 const version=uid(),context=c.context,prep={...context,operationId:uid(),versionId:version,rootId:uid(),expectedVersion:0,documentId:c.originalId,digest:digest(bytes),size:bytes.length,media:'text/plain',sourceRef:'SYNTHETIC interrupted upload',reason:'SYNTHETIC controlled fault'};
 await h.objects.prepare(await h.auth(),write,prep);assert.equal((await h.objects.prepare(await h.auth(),write,prep)).replayed,true);
 await h.admin.unsafe("create function crm_private.h6017_fault() returns trigger language plpgsql as $$begin if new.state='present_unverified' then raise exception 'SYNTHETIC_H6017_METADATA_FAULT';end if;return new;end$$;create trigger h6017_fault before update on crm_private.b07_object_versions for each row execute function crm_private.h6017_fault()");
 try{await assert.rejects(h.objects.upload(await h.auth(),read,write,version,context,bytes,uid()));}finally{await h.admin.unsafe('drop trigger h6017_fault on crm_private.b07_object_versions;drop function crm_private.h6017_fault()');}
 const row=await h.objects.metadata(await h.auth(),read,version,context);assert.ok(row);assert.notEqual(row.state,'stored');assert.ok(await h.storage.get(row.private_ref));await assert.rejects(h.objects.download(await h.auth(),read,version,context),/NOT_CONSERVED/);
 await h.objects.reconcile(await h.auth(),read,write,version,context,uid());await h.objects.link(await h.auth(),read,write,version,context,uid());assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,context)),bytes);
 const raw=h.storage as unknown as {endpoint:string;bucket:string;credential:string};const replace=async(data:Uint8Array)=>{const r=await fetch(`${raw.endpoint}/object/${raw.bucket}/${row.private_ref}`,{method:'PUT',headers:{Authorization:`Bearer ${raw.credential}`,'Content-Type':'text/plain'},body:Buffer.from(data)});assert.equal(r.ok,true);};await replace(Buffer.from('SYNTHETIC_CORRUPTION'));await assert.rejects(h.objects.download(await h.auth(),read,version,context),/INTEGRITY_FAILED/);await replace(bytes);assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,version,context)),bytes);
});
test('H6-017 F08 diagnostics and logs minimize hostile raw secret/body/economy and preserve E4 without retry',async()=>{
 const f=await boundaryFixture(h,'other',a.q.bookingId),event={...f.base(),material:{token:secretCanary,password:secretCanary,body:secretCanary,email:secretCanary,cost:secretCanary,url:'https://synthetic.invalid/?token='+secretCanary}};await f.run(event);
 const logs:unknown[]=[],writer={record:(o:any)=>h.diagnostic.record(hAuth,write,o)};const hAuth=await h.auth();let calls=0;
 const out=await invokeDiagnosticOperation({contextKind:'booking',contextId:a.q.bookingId,operationId:event.operationId,eventId:event.eventId,requestId:secretCanary},writer,async()=>{calls++;throw new Error(secretCanary);},{record:e=>logs.push(e)});
 assert.equal(calls,1);assert.equal(out.result.status,'pending');assert.equal(out.diagnosticRecorded,true);assert.equal(JSON.stringify({out,logs}).includes(secretCanary),false);
 const diagnostic=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:a.q.bookingId,reference:out.requestRef,pageSize:100});assert.ok(diagnostic.nodes.length);assert.equal(JSON.stringify(diagnostic).includes(secretCanary),false);
 const other=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:b.q.bookingId,reference:out.requestRef,pageSize:100});assert.deepEqual(other.nodes,[]);
 const source=(await h.evidence.read(await h.auth(),read,event.eventId,'booking',a.q.bookingId)).data;assert.ok(JSON.stringify(source).includes(secretCanary));
 const persisted=await h.admin`select to_jsonb(r) data from crm_private.b10_diagnostic_observations r where context_id=${a.q.bookingId}::uuid`;assert.equal(JSON.stringify(persisted).includes(secretCanary),false);
});
test('H6-017 F09 external invoice retains issuer; emission/numbering forbidden despite documentary state',async()=>{
 const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());const document=await f.document();await h.invoices.apply(await h.auth(),write,await f.receive(document));await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());
 const original=await f.state();assert.ok(JSON.stringify(original).includes(f.provider.revision));const base=await f.need();
 await unchanged(async()=>{
  for(const extra of [{emitInvoice:true},{fiscalNumber:'SYNTHETIC-123'},{humanApprovalFiscalOverride:true},{action:'issue_legal'}])await assert.rejects(h.invoices.apply(await h.auth(),write,{...base,...extra} as never));
  for(const key of ['emitInvoice','fiscalNumber','taxEngine'])await assert.rejects(reader.read(await h.auth(),read,{...q(f.bookingId,{surface:'document'}),[key]:true} as never));
  assert.equal(JSON.stringify(await get(f.bookingId,{surface:'document',destination:'customer'})).includes(f.invoiceId),false);
 });assert.deepEqual(await f.state(),original);
});
test('H6-017 F10 Approval is not execution or Acceptance/Confirmation, changed material cannot reuse decision',async()=>{
 const f=await workFixture(h),before=await witness();await f.run(f.definition);assert.equal((await h.observer`select * from crm_private.b08_attempts where execution_id=${f.executionId}::uuid`).length,0);
 const changed={...f.material,content:'SYNTHETIC changed content'},prior=await f.see();await assert.rejects(f.run({...f.definition,...f.base(),action:'revise',version:2,material:changed}));assert.deepEqual(await f.see(),prior);
 const commercialBefore=await h.observer`select (select count(*) from crm_private.b03_acceptances)::int acceptance,(select count(*) from crm_private.b04_confirmations)::int confirmation`;
 await assert.rejects(async()=>h.tte.decide({subject:'ai'} as never,write,'synthetic-ai',f.approval.proposalId,'synthetic-ai-decision','approved','SYNTHETIC untrusted', '0'.repeat(64)));
 assert.deepEqual(await h.observer`select (select count(*) from crm_private.b03_acceptances)::int acceptance,(select count(*) from crm_private.b04_confirmations)::int confirmation`,commercialBefore);assert.ok(before);
 const claim=f.claim(),claimed=await f.run(claim);await f.run(f.start(claim,claimed.generation!));assert.equal((await f.see())!.attempts.length,1);await h.closeExecutors();
});
test('H6-017 F11 hostile public/web/calendar payload is receipt-only, never Booking/payment/closure authority',async()=>{
 for(const source of ['web','calendar','avaibook']){const f=await boundaryFixture(h,source,a.q.bookingId),before=await witness(),event={...f.base(),material:{administrator:true,confirmBooking:true,emitInvoice:true,registerPayment:'1000.00',close:true,permissions:['all']}};const r=await f.run(event);assert.equal(r.state,'review');const after=await witness();for(const table of Object.keys(before).filter(x=>!['b07_records','b07_history','b07_links'].includes(x)))assert.equal(after[table],before[table],table);assert.ok((await h.evidence.read(await h.auth(),read,event.eventId,'booking',a.q.bookingId)).data);assert.equal((await f.run(event)).replayed,true);
  await assert.rejects(h.boundaries.receive({source,contextId:a.q.bookingId,subject:h.subject} as never,write,event));assert.ok(await get());
 }
});
test('H6-017 F12 SQL roles denied private data, protected attributes and self elevation',async()=>unchanged(async()=>{
 const tables=await h.admin`select n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('crm_private','crm_ha') and c.relkind='r' order by 1,2`;let checks=0;
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){const sql=h.connect(role),flags=(await h.admin`select rolsuper,rolbypassrls from pg_roles where rolname=${role}`)[0]!;assert.equal(flags.rolsuper,false);assert.equal(flags.rolbypassrls,false);
  for(const table of tables){assert.equal(table.relrowsecurity,true);assert.equal(table.relforcerowsecurity,true);await assert.rejects(sql.unsafe(`select * from ${table.nspname}.${table.relname} limit 1`));await assert.rejects(sql.unsafe(`delete from ${table.nspname}.${table.relname} where false`));checks+=2;}
  await assert.rejects(sql.unsafe('set role crm_h0_f2_executor'));await assert.rejects(sql.unsafe("update crm_private.crm_actors set enabled=true,admin_scope='OTHER'"));await assert.rejects(sql.unsafe('select crm_api.h5_projection_read(null,null,null,null,null)'));
 }console.log('H6017 SQL denial summary '+JSON.stringify({roles:4,tables:tables.length,attempts:checks+12}));
}));
test('H6-017 F13 economic facts keep pending fiscal treatment; approval/inference flags cannot authorize fiscal effect',async()=>{
 const f=await ownEconomicsFixture(h),command=await f.command(),result=await h.ownEconomics.apply(await h.auth(),write,command);assert.equal(result.result.computed.totals.real.profit,'80.00');const before=await f.see();
 await unchanged(async()=>{for(const key of ['legalInvoice','fiscalNumber','humanApprovalFiscalOverride','inferredVatRate','aiAutoApproved','mandate'])await assert.rejects(h.ownEconomics.apply(await h.auth(),write,{...command,[key]:true} as never),/INPUT_INVALID/);});assert.deepEqual(await f.see(),before);
 for(const destination of ['customer','provider','ai'] as const){const external=JSON.stringify(await get(f.bookingId,{destination,surface:'export'}));for(const token of [f.economyId,'profit','cost','commission','fee'])assert.equal(external.includes(token),false);}
});
test('H6-017 F14 local synthetic isolation and no hidden fiscal/audio/public surface',async()=>{
 assert.equal(new URL(process.env.STORAGE_H1_ENDPOINT!).hostname,'127.0.0.1');assert.equal((await h.admin`select current_database() db`)[0]!.db,'crm_h6017_functional');
 assert.equal((await h.admin`select count(*)::int n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='crm_api' and p.proname ~ '(emit_invoice|fiscal_number|legal_invoice|audio_capture)'`)[0]!.n,0);
 assert.ok(await get());
});
test('H6-017 F15 nominal need, verified Contact and independent night quantities persist without invented people',async()=>{
 const f=await quantityFixture(h),base=await nominalFixture(h,f),contact=uid();await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:contact,kind:'contact',expectedVersion:0,sourceRef:'SYNTHETIC verified identity',evidenceRef:'SYNTHETIC identity verification',reason:'SYNTHETIC scoped need',verified:true,displayName:'SYNTHETIC verified Participant'});
 const detail=structuredClone(base.detail);(detail.participants[0] as {contactId:string}).contactId=contact;const q={...base,detail,evidenceId:await f.detailProof(detail)};await h.booking.apply(await h.auth(),write,q);
 const house=detail.services[2]!,counts=await h.observer`select n.night_id,sum(c.attendees)::int n from crm_private.b04_nights n join crm_private.b04_night_occupancies o using(night_id) join crm_private.b04_contributions c using(contribution_id) where c.booking_id=${q.bookingId}::uuid group by n.night_id`;
 assert.equal(counts.find(x=>x.night_id===house.nights[0]!.id)!.n,12);assert.equal(counts.find(x=>x.night_id===house.nights[1]!.id)!.n,10);const people=await h.observer`select participant_id,contact_id from crm_private.b04_participants where booking_id=${q.bookingId}::uuid`;assert.equal(people.length,4);assert.ok(people.some(x=>x.contact_id===contact));assert.equal((await h.observer`select count(*)::int n from crm_private.b04_assignments where service_id=${house.id}::uuid and night_id=${house.nights[1]!.id}::uuid`)[0]!.n,0);
 for(const invalid of ['necessity','contact'] as const){const x=await quantityFixture(h),n=await nominalFixture(h,x),d=structuredClone(n.detail);if(invalid==='necessity')(d.assignments[0] as {necessity:string}).necessity='';else{const id=uid();await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:id,kind:'contact',expectedVersion:0,sourceRef:'SYNTHETIC unknown identity',evidenceRef:'SYNTHETIC unverified',reason:'SYNTHETIC negative',verified:false,displayName:'SYNTHETIC unknown'});(d.participants[0] as {contactId:string}).contactId=id;}
 const command={...n,detail:d,evidenceId:await x.detailProof(d)};await unchanged(async()=>{await assert.rejects(h.booking.apply(await h.auth(),write,command));});}
 for(const destination of ['customer','provider','ai'] as const){const out=JSON.stringify(await get(q.bookingId,{destination}));assert.equal(out.includes(contact),false);assert.equal(out.includes('SYNTHETIC verified Participant'),false);}
});
test('H6-017 F16 persisted Tarari approved figures, explicit VAT and no extrapolated cost or fiscal engine',async()=>{
 const f=await ownEconomicsFixture(h),base=await f.command(),serviceId=f.b.detail.services[0]!.id,input=structuredClone(base.input);(input as any).tarari=['included2','extra25','extra50'].map(kind=>({id:uid(),serviceId,unitRevisionId:f.unit.revision,pricingFormRevisionId:f.form.revision,kind}));
 for(const phase of Object.values(input.fees[0]!.phases))Object.assign(phase,{vat:'included',tax:{base:'80.00',tax:'20.00',total:'100.00',sourceRef:'SYNTHETIC explicit verified facts no inferred rate'}});
 const command=await f.attest({...base,input}),out=(await h.ownEconomics.apply(await h.auth(),write,command)).result.computed;
 assert.equal(out.currency,'EUR');assert.equal(out.fiscalValidation,false);assert.equal(out.mandateInferred,false);assert.deepEqual(out.tarari.map(t=>[t.quantity,t.commercial,t.cost]),[[2,'15.00','3.80'],[25,'175.00',null],[50,'325.00',null]]);
 for(const item of out.tarari){assert.equal(item.configurationVersion,'approved-initial-v1');assert.equal(item.provider,null);assert.equal(item.suplido,null);assert.equal(item.internalInvoice,null);assert.equal(item.costPhases.real,null);}
 assert.equal(out.fees[0]!.phases.real.fact.vat,'included');assert.deepEqual(out.fees[0]!.phases.real.fact.tax,{base:'80.00',tax:'20.00',total:'100.00',sourceRef:'SYNTHETIC explicit verified facts no inferred rate'});assert.equal(out.costs[0]!.phases.real.fact.vat,'unknown');assert.equal(out.costs[0]!.phases.real.fact.tax,null);assert.equal(out.totals.real.profit,null);
 assert.deepEqual((await f.see())!.computed,out);assert.equal((await h.ownEconomics.apply(await h.auth(),write,command)).replayed,true);
 const invented=structuredClone(command);Object.assign(invented.input.tarari[1]!,{inventedCost:'0.00'});await unchanged(async()=>{await assert.rejects(h.ownEconomics.apply(await h.auth(),write,invented));});
 for(const destination of ['customer','provider','ai'] as const){const serialized=JSON.stringify(await get(f.bookingId,{destination,surface:'ai_context'}));for(const token of ['3.80','fiscalValidation','tarari','costPhases',f.economyId])assert.equal(serialized.includes(token),false);}
});
test('H6-017 F17 runner refuses non-loopback input before any request',async()=>{
 const {spawnSync}=await import('node:child_process');const r=spawnSync(process.execPath,['scripts/test-h6-017-functional.mjs'],{cwd:process.cwd(),env:{PATH:process.env.PATH,NODE_ENV:'test',STORAGE_H1_ENDPOINT:'https://synthetic.invalid'},encoding:'utf8'});assert.notEqual(r.status,0);assert.ok(r.stderr.includes('H6017_LOOPBACK_REQUIRED'));assert.equal(r.stdout,'');
});

test('H6-017 F18 reconciled payment and joint closure never grant fiscal issuance or external economy',async()=>{
 const f=await fullClosedFixture(h),bid=f.bookingId,prior=await f.j.c.view();assert.ok(prior);const payment=await h.payments.read(await h.auth(),read,f.payment.paymentId);assert.ok(payment);assert.equal(payment.summary.base,'reconciled');
 const command=await f.j.command();await unchanged(async()=>{for(const key of ['emitInvoice','fiscalNumber','humanApprovalFiscalOverride']){await assert.rejects(reader.read(await h.auth(),read,{...q(bid,{surface:'document'}),[key]:true} as never));await assert.rejects(h.closures.close(await h.auth(),write,{...command,[key]:true} as never));}
 for(const destination of ['customer','provider','ai'] as const)for(const surface of surfaces){const out=JSON.stringify(await get(bid,{destination,surface}));for(const token of ['reconciliations','providerInvoice','costPhases','private_ref','fees','profit',f.payment.paymentId])assert.equal(out.includes(token),false);}
 });assert.deepEqual(await f.j.c.view(),prior);assert.deepEqual(await h.payments.read(await h.auth(),read,f.payment.paymentId),payment);
});
