import {before,after,test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID as uid,createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {isolatedBoundaries,boundaryFixture,read,write} from "../support/h5-boundary-isolated.ts";
import {bookingFixture} from "../support/h2-booking-fixtures.ts";
import {communicationFixture} from "../support/h5-communication-isolated.ts";
import {secondWorkActor} from "../support/h5-work-isolated.ts";
import {cancellationFixture} from "../support/h4-cancellation-fixtures.ts";
import {acceptanceFixture} from "../support/h2-acceptance-fixtures.ts";
import {invoiceFixture} from "../support/h3-invoice-fixtures.ts";
import {issueTrustedContext} from "../../src/application/trusted-context.ts";
import {canonicalCommercial} from "../../src/domain/commercial-progress.ts";
import {createF1Issuer,encodeF1Fields} from "../../src/infrastructure/postgres/f1-codec.ts";
import {createF2Issuer} from "../../src/infrastructure/postgres/f2-codec.ts";
import {postgresF1Binding,type PostgresTransaction} from "../../src/infrastructure/postgres/transaction.ts";
import {H5011ProjectionAdapter} from "../../src/infrastructure/postgres/h5-projection-adapter.ts";
import {H1003ResolutionAdapter} from "../../src/infrastructure/postgres/h1-resolution-adapter.ts";
import type {ProjectionQuery} from "../../src/domain/coordinated-projection.ts";

let h:Awaited<ReturnType<typeof isolatedBoundaries>>,reader:H5011ProjectionAdapter;
const migration="supabase/migrations/20261014003559_h5_authorized_projections.sql";
before(async()=>{h=await isolatedBoundaries("crm_h5011_coverage",59221);await h.migration.unsafe(await readFile(migration,"utf8"));reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);});
after(async()=>{await h?.close();});
const query=(contextId:string,extra:Partial<ProjectionQuery>={}):ProjectionQuery=>({contextKind:"booking",contextId,surface:"timeline",destination:"administrator",...extra});
const booking=async()=>{const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);return f;};
type FactEntry={source:string;data:Record<string,any>};
const facts=(result:Awaited<ReturnType<H5011ProjectionAdapter["read"]>>,source:string)=>
 (result!.entries as FactEntry[]).filter(e=>e.source===`crm_private.${source}`).map(e=>e.data);

test("H5-011 H06/H07: merged identity retains both histories; archive is recoverable without closing bookings",async()=>{
 const a=uid(),b=uid(),createOps=[uid(),uid()];
 for(const [i,id] of [a,b].entries())await h.identities.apply(await h.auth(),write,{action:"create_entity",operationId:createOps[i]!,targetId:id,kind:"contact",expectedVersion:0,verified:true,displayName:`H5011 SYNTHETIC ${i}`,sourceRef:`synthetic-original-${i}`,evidenceRef:"synthetic-identity-proof",reason:"Synthetic fixture"});
 const resolver=new H1003ResolutionAdapter(h.runtime,h.f1,h.f2),base={kind:"contact" as const,sourceRef:"synthetic-human-resolution",evidenceRef:"synthetic-explicit-approval",reason:"Synthetic authorized resolution",expectedVersion:0};
 await resolver.apply(await h.auth(),write,{...base,action:"merge",operationId:uid(),targetId:a,relatedId:b});
 const q=query(b,{contextKind:"contact"}),result=await reader.read(await h.auth(),read,q);
 const history=facts(result,"identity_history");
 for(const operationId of createOps)assert.ok(history.some(row=>row.operation_id===operationId),`original history ${operationId}`);
 await resolver.apply(await h.auth(),write,{...base,action:"archive",operationId:uid(),targetId:b});
 assert.equal(await reader.read(await h.auth(),read,q),null);
 const before=await h.observer`select to_jsonb(x) value from crm_private.identity_entities x where identity_id in (${a}::uuid,${b}::uuid) order by identity_id`;
 const recovered=await reader.read(await h.auth(),read,{...q,includeArchived:true});
 for(const operationId of createOps)assert.ok(facts(recovered,"identity_history").some(row=>row.operation_id===operationId));
 assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.identity_entities x where identity_id in (${a}::uuid,${b}::uuid) order by identity_id`,before);
});

test("H5-011 H05/H04: original and derived communication remain distinct with pending review and provenance",async()=>{
 const f=await booking(),c=await communicationFixture(h,"incoming",f.q.bookingId),summary=c.derive("summary"),candidate=c.derive("candidate");await c.run(summary);await c.run(candidate);
 const result=await reader.read(await h.auth(),read,query(f.q.bookingId));
 assert.ok(facts(result,"b07_records").some(row=>row.record_id===c.originalId&&row.material.relation==="original"&&row.material.storage_state==="reference_only"));
 const derived=facts(result,"b07_communication_work").find(row=>row.work_id===summary.workId);
 assert.ok(derived);assert.equal(derived.original_id,c.originalId);assert.equal(derived.kind,"summary");assert.ok(derived.recorded_by);assert.ok(derived.recorded_at);
 const pending=(result!.entries as (FactEntry&{certainty:string})[]).find(e=>e.source==="crm_private.b07_communication_work"&&e.data.work_id===candidate.workId)!;
 assert.ok(pending);assert.equal(pending.data.material.reviewState,"pending");assert.equal(pending.certainty,"pending");
 assert.ok(facts(result,"b07_records").some(row=>row.record_id===c.confirmedId&&row.material.claim==="18"));
 assert.ok(facts(result,"b07_pending_tasks").some(row=>row.material.deadline.kind==="unknown"&&row.state==="pending"));
 assert.equal(JSON.stringify(await reader.read(await h.auth(),read,query(f.q.bookingId,{destination:"customer"}))).includes("Resumen sintético"),false);
});

test("H5-011 C09/C10/C12: review, duplicate and conflict receipts are visible without silent business changes",async()=>{
 const f=await booking(),external=await boundaryFixture(h,"other",f.q.bookingId),one=external.base();
 await external.run(one);
 const duplicate={...external.base(),targetId:uid(),sourceRef:"synthetic-redelivery"};assert.equal((await external.run(duplicate)).state,"duplicate");
 const conflict={...external.base(),targetId:uid(),material:{amount:"101.00",currency:"EUR"}};assert.equal((await external.run(conflict)).state,"conflict");
 const calendar=await boundaryFixture(h,"calendar",f.q.bookingId),critical=calendar.base();assert.equal((await calendar.run(critical)).state,"review");
 const avaibook=await boundaryFixture(h,"avaibook",f.q.bookingId),discrepancy=avaibook.base();assert.equal((await avaibook.run(discrepancy)).state,"review");
 const before=await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${f.q.bookingId}::uuid`;
 for(let i=0;i<2;i++){
  const result=await reader.read(await h.auth(),read,query(f.q.bookingId));const receipts=facts(result,"b09_event_receipts");
  for(const event of [one,duplicate,conflict,critical,discrepancy])assert.ok(receipts.some(row=>row.operation_id===event.operationId));
  assert.equal(receipts.find(row=>row.operation_id===duplicate.operationId)!.receipt_state,"duplicate");
  assert.equal(receipts.find(row=>row.operation_id===critical.operationId)!.receipt_state,"review");assert.equal(result!.mutationAuthority,false);
  const receipt=(result!.entries as (FactEntry&{recordedAt:string;occurredAt:string})[]).find(e=>e.source==="crm_private.b09_event_receipts"&&e.data.operation_id===critical.operationId)!;
  assert.equal(receipt.recordedAt,receipt.data.received_at);assert.equal(receipt.occurredAt,receipt.data.raw_event.occurred_at);
 }
 assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${f.q.bookingId}::uuid`,before);
});

test("H5-011 C01/C08: canonical calendar preserves unknown schedules and exposes their pending certainty",async()=>{
 const f=await booking(),result=await reader.read(await h.auth(),read,query(f.q.bookingId,{surface:"calendar"}));
 const services=(result!.entries as Record<string,any>[]).filter(e=>e.source==="crm_private.modification_scope");
 assert.equal(services.length,f.detail.services.length);
 for(const e of services){assert.equal(e.scope.schedule,null);assert.equal(e.certainty,"pending");assert.equal(e.phase,null);assert.equal(e.bookingId,f.q.bookingId);}
});

test("H5-011 A03/A06: second session is independently admitted; revoked session cannot reuse a prior response",async()=>{
 const f=await booking(),second=await secondWorkActor(h),auth=await second.auth();
 const first=await reader.read(await h.auth(),read,query(f.q.bookingId));assert.ok(first);
 assert.ok(await reader.read(auth,read,query(f.q.bookingId,{destination:"customer"})));
 await h.admin`update crm_private.crm_sessions set revoked_at=clock_timestamp() where session_id=${second.sessionId}::uuid`;
 await assert.rejects(reader.read(auth,read,query(f.q.bookingId)),/PROJECTION_DENIED/);
 assert.ok(await reader.read(await h.auth(),read,query(f.q.bookingId)));
});

test("H5-011 S08: canonical PACK 120/10 and 180/8 preserves fixed900 internally across external surfaces",async()=>{
 const service=await h.cat("service",{name:"H5011 SYNTHETIC included service",nature:"external"}),unit=await h.cat("unit",{name:"Synthetic fixed group",definition:"fixed"}),form=await h.cat("pricing_form",{name:"Synthetic fixed",definition:"fixed"});
 const tariff=await h.com("tariff",{label:"synthetic",price_state:"confirmed",amount:"900.00",cost_state:"confirmed",cost_amount:"700.00",vat_treatment:"included",unit_revision_id:unit.revision,pricing_form_revision_id:form.revision},service);
 const opp=h.input();await h.adapter.apply(await h.auth(),write,opp);
 const proposalId=uid(),versionId=uid(),content={scope:"H5011 exact synthetic PACK",terms:{version:"SYNTHETIC-T1",text:"PRIVATE-TERMS-NOT-FOR-EXTERNAL-CONTEXT",sourceRef:"synthetic accepted conditions"},pending:[],modalities:[{price:"120.00",participants:10,date:"2026-11-20"},{price:"180.00",participants:8,date:"2026-11-22"}].map((m,i)=>({id:uid(),name:i?"Synthetic B":"Synthetic A",participants:m.participants,independent:true,selectable:true,conditions:"Synthetic exact",finalPersonPrice:m.price,manualReason:"Synthetic manual final",definitive:true,lines:[{id:uid(),serviceRevisionId:service.revision,unitRevisionId:unit.revision,tariffRevisionId:tariff.revision,quantity:"1",included:true,independent:true,selectable:true,date:m.date,datePending:false,priceBasis:"fixed" as const,costMaterial:true,sourceRef:"synthetic inclusion"}]}))};
 const command={action:"prepare" as const,operationId:uid(),proposalId,opportunityId:opp.targetId,expectedRevision:0,expectedOpportunityRevision:1,sourceRef:"synthetic PACK",reason:"Synthetic manual preparation",content};
 await h.proposal.apply(await h.auth(),write,command);await h.proposal.apply(await h.auth(),write,{...command,action:"fix",operationId:uid(),versionId,content:undefined,expectedRevision:1});
 for(const destination of ["customer","provider","ai"] as const)for(const surface of ["query","search","export","document","timeline","ai_context"] as const){
  const q=query(opp.targetId,{contextKind:"opportunity",destination,surface}),result=await reader.read(await h.auth(),read,q);assert.ok(result);
  const expected=content.modalities.map(m=>({reference:versionId,finalPersonPrice:m.finalPersonPrice,participants:m.participants,included:[{service:"H5011 SYNTHETIC included service",quantity:1,date:m.lines[0]!.date}]}));
  assert.equal(result.entries.length,2);assert.deepEqual(new Set(result.entries),new Set(expected));
  for(const denied of ["900.00","700.00","PRIVATE-TERMS","commission","fee","margin","economics","email","phone"]){assert.equal(JSON.stringify(result).includes(denied),false);assert.equal((await reader.read(await h.auth(),read,{...q,search:denied}))!.entries.length,0);}
 }
 const internal=await reader.read(await h.auth(),read,query(opp.targetId,{contextKind:"opportunity"}));assert.ok(JSON.stringify(internal).includes("900.00"));assert.ok(JSON.stringify(internal).includes("economics"));
});

test("H5-011 A05/H05: shared original keeps only requested links and never combines independent Bookings",async()=>{
 const a=await booking(),b=await booking(),documentId=uid(),purpose="synthetic-authorized-original";
 await h.evidence.apply(await h.auth(),write,{action:"create",operationId:uid(),targetId:documentId,kind:"document",material:{relation:"original",content_ref:"synthetic-reference-only",content_kind:"transcript",storage_state:"reference_only"},contextKind:"booking",contextId:a.q.bookingId,purpose,sourceRef:"synthetic permitted original",coverage:"synthetic shared document",reason:"Synthetic authorized preservation"});
 await h.evidence.apply(await h.auth(),write,{action:"link",operationId:uid(),targetId:uid(),originalId:documentId,contextKind:"booking",contextId:b.q.bookingId,purpose,sourceRef:"synthetic second permitted link",coverage:"synthetic shared document",reason:"Synthetic explicit second link"});
 for(const [own,other] of [[a,b],[b,a]]){
  const result=await reader.read(await h.auth(),read,query(own!.q.bookingId));
  assert.equal(facts(result,"b04_bookings").some(row=>row.booking_id===other!.q.bookingId),false);
  const entry=(result!.entries as (FactEntry&{links:Record<string,any>[]})[]).find(e=>e.source==="crm_private.b07_records"&&e.data.record_id===documentId)!;
  assert.ok(entry);assert.equal(entry.links.length,1);assert.equal(entry.links[0]!.context_id,own!.q.bookingId);
  assert.equal(JSON.stringify(await reader.read(await h.auth(),read,query(own!.q.bookingId,{destination:"customer"}))).includes(documentId),false);
 }
});

test("H5-011 H08/A09/S09: stable code survives reads; queries cannot merge, erase or authorize fiscal effects",async()=>{
 const f=await booking();
 const code=(await h.observer`select human_code from crm_private.identity_codes where target_id=${f.q.bookingId}::uuid and code_kind='RES'`)[0]!.human_code;
 assert.ok(code);const before=await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${f.q.bookingId}::uuid`;
 for(let i=0;i<2;i++){const result=await reader.read(await h.auth(),read,query(f.q.bookingId));assert.ok(facts(result,"identity_codes").some(row=>row.human_code===code&&row.target_id===f.q.bookingId));assert.equal(result!.mutationAuthority,false);}
 for(const action of ["merge","erase","emit_invoice","confirm","create_avaibook"]){await assert.rejects(reader.read(await h.auth(),read,{...query(f.q.bookingId),action} as ProjectionQuery),/PROJECTION_INPUT_INVALID/);}
 assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.b04_bookings x where booking_id=${f.q.bookingId}::uuid`,before);
});

test("H5-011 C04/D020: service20 November projects all four accredited civil limits without economic writes",async()=>{
 for(const [day,right,retention] of [[13,"200.00","0.00"],[14,"100.00","100.00"],[17,"100.00","100.00"],[18,"0.00","200.00"]] as const)for(const hour of ["00:00:00","23:59:59"]){
  const f=await cancellationFixture(h,{amount:"200.00",scopeKind:"service",dates:["2026-11-20","2026-11-22"]}),q=await f.command(),at=`2026-11-${day}T${hour}+01:00`;
  await f.run(await f.command({at,facts:{...q.facts!,at,base:await f.base("200.00")}}));
  const before=await h.observer`select to_jsonb(x) value from crm_private.b06_cancellation_revisions x where determination_id=${f.did}::uuid order by revision`;
  const projected=await reader.read(await h.auth(),read,query(f.b.bookingId));
  const revision=facts(projected,"b06_cancellation_revisions").find(row=>row.determination_id===f.did)!;assert.ok(revision);
  assert.equal(revision.after_data.computed.right,right);assert.equal(revision.after_data.computed.retention,retention);
  assert.equal(revision.after_data.facts.reference.date,"2026-11-20");assert.equal(revision.after_data.scope.kind,"service");
  assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.b06_cancellation_revisions x where determination_id=${f.did}::uuid order by revision`,before);
 }
});

test("H5-011 A08 V-DAT: least privilege, authenticated guards, RLS and advisors on the new read function",async()=>{
 const meta=(await h.observer`select p.prosecdef,p.proconfig,r.rolname,r.rolsuper,r.rolbypassrls,r.rolcanlogin from pg_proc p join pg_roles r on r.oid=p.proowner where p.oid='crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure`)[0]!;
 assert.equal(meta.prosecdef,true);assert.equal(meta.rolname,"crm_h0_f2_executor");assert.equal(meta.rolsuper,false);assert.equal(meta.rolbypassrls,false);assert.equal(meta.rolcanlogin,false);assert.ok(meta.proconfig.includes("search_path=pg_catalog, pg_temp"));
 assert.equal((await h.observer`select count(*)::int n from pg_proc p cross join lateral aclexplode(p.proacl) a where p.oid='crm_api.h5_projection_read(bytea,bytea,bytea,bytea,bytea)'::regprocedure and a.grantee=0`)[0]!.n,0);
 assert.equal((await h.observer`select count(*)::int n from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind='r' and (not c.relrowsecurity or not c.relforcerowsecurity)`)[0]!.n,0);
 for(const v of ["null::bytea","'fake'::bytea"])await assert.rejects(h.runtime.unsafe(`select crm_api.h5_projection_read(${Array(5).fill(v).join(',')})`));
 for(const table of ["b04_bookings","b07_records","b09_event_receipts","identity_history"]){await assert.rejects(h.runtime.unsafe(`select * from crm_private.${table}`));await assert.rejects(h.runtime.unsafe(`delete from crm_private.${table}`));}
 const help=spawnSync("npx",["--yes","supabase@2.119.0","db","advisors","--help"],{encoding:"utf8",timeout:45000});assert.equal(help.status,0);assert.ok(help.stdout.includes("--db-url"));
 const advisors=spawnSync("npx",["--yes","supabase@2.119.0","db","advisors","--db-url","postgresql://crm_h0_migration@127.0.0.1:59221/crm_h5011_coverage?sslmode=disable","--type","all","--fail-on","error"],{encoding:"utf8",timeout:45000});assert.equal(advisors.status,0,advisors.stderr);assert.deepEqual(JSON.parse(advisors.stdout).results,[]);console.log("H5011 advisors: results=[] exclusively loopback");
});

test("H5-011 V-MIG: populated57 to58 preserves all prior tables, functions, schemas, policies and roles on rollback/retry",async()=>{
 const previous=await isolatedBoundaries("crm_h5011_fullmig",59222),hash=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
 const catalog=async()=>({
  tables:Array.from(await previous.observer`select c.oid,c.relname,c.relowner,c.relacl,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' and c.relkind in ('r','p') order by c.oid`),
  functions:Array.from(await previous.observer`select p.oid,p.proname,p.proowner,p.proacl,p.proconfig,p.prosecdef,md5(pg_get_functiondef(p.oid)) body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname like 'crm%' and p.prokind='f' order by p.oid`),
  schemas:Array.from(await previous.observer`select oid,nspname,nspowner,nspacl from pg_namespace where nspname like 'crm%' order by oid`),
  policies:Array.from(await previous.observer`select oid,polrelid,polname,polroles,polqual::text,polwithcheck::text from pg_policy order by oid`),
  roles:Array.from(await previous.observer`select oid,rolname,rolsuper,rolcanlogin,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles order by oid`),
 });
 try{
  const f=await bookingFixture(previous);await previous.booking.apply(await previous.auth(),write,f.q);
  const tables=(await previous.observer`select schemaname,tablename from pg_tables where schemaname like 'crm%' order by schemaname,tablename`).map(x=>`${x.schemaname}.${x.tablename}`);
  const data=async()=>{const result:unknown[]=[];for(const table of tables)result.push({table,rows:Array.from(await previous.admin.unsafe(`select to_jsonb(x) value from ${table} x order by to_jsonb(x)::text`))});return hash(result);};
  const beforeData=await data(),before=await catalog(),sql=await readFile(migration,"utf8");
  await assert.rejects(previous.migration.unsafe(sql.replace(/commit;\s*$/,"select 1/0;commit;")));await previous.migration.unsafe("rollback");assert.equal(await data(),beforeData);assert.equal(hash(await catalog()),hash(before));
  await previous.migration.unsafe(sql);assert.equal(await data(),beforeData);const next=await catalog(),oldFunctions=new Set(before.functions.map(f=>f.oid));
  assert.deepEqual(next.functions.filter(f=>oldFunctions.has(f.oid)),before.functions);assert.equal(next.functions.length,before.functions.length+1);
  for(const key of ["tables","schemas","policies","roles"] as const)assert.deepEqual(next[key],before[key]);
  await assert.rejects(previous.migration.unsafe(sql));await previous.migration.unsafe("rollback");assert.equal(await data(),beforeData);assert.equal(hash(await catalog()),hash(next));
  console.log("H5011 V-MIG",JSON.stringify({tables:tables.length,priorFunctions:before.functions.length,newFunctions:1,dataSha256:beforeData,priorCatalogSha256:hash(before),finalCatalogSha256:hash(next),rollback:true,retry:true,reapplicationDenied:true}));
 }finally{await previous.close();}
});

test("H5-011 H03: registered call, historical verification and explicit rectification are all reconstructible",async()=>{
 const f=await acceptanceFixture(h),r=await f.register();await h.acceptance.apply(await h.auth(),write,await f.verification(r));
 const original=await h.observer`select to_jsonb(x) value from crm_private.b03_acceptances x where acceptance_id=${r.acceptanceId}::uuid`;
 const at=new Date().toISOString(),evidenceId=await f.proof(`acceptance:error:${r.acceptanceId}`,r.coverage,at),reviewId=await f.proof(`acceptance:reevaluate:${r.acceptanceId}:Necesidad definida`,r.coverage,at);
 await h.acceptance.apply(await h.auth(),write,await f.q({action:"rectify",acceptanceId:r.acceptanceId,coverage:r.coverage,at,evidenceId,humanReviewed:true,reevaluation:{destination:"Necesidad definida",evidenceId:reviewId,dependentEffects:["verification","commercial"]}}));
 const result=await reader.read(await h.auth(),read,query(f.opp.targetId,{contextKind:"opportunity"}));
 assert.ok(facts(result,"b03_acceptances").some(row=>row.acceptance_id===r.acceptanceId));assert.ok(facts(result,"b03_acceptance_verifications").some(row=>row.acceptance_id===r.acceptanceId));assert.ok(facts(result,"b03_acceptance_rectifications").some(row=>row.acceptance_id===r.acceptanceId));
 assert.deepEqual(await h.observer`select to_jsonb(x) value from crm_private.b03_acceptances x where acceptance_id=${r.acceptanceId}::uuid`,original);
});

test("H5-011 S10: external issuer documentary invoice stays internal and cannot become a CRM fiscal action",async()=>{
 const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());await h.invoices.apply(await h.auth(),write,await f.receive());
 const result=await reader.read(await h.auth(),read,query(f.bookingId)),invoices=facts(result,"b05_provider_invoices");
 assert.ok(invoices.some(row=>row.invoice_id===f.invoiceId));assert.ok(JSON.stringify(invoices).includes(f.provider.revision));
 const outside=await reader.read(await h.auth(),read,query(f.bookingId,{surface:"document",destination:"customer"}));assert.equal(JSON.stringify(outside).includes(f.invoiceId),false);assert.equal(outside!.mutationAuthority,false);
 await assert.rejects(reader.read(await h.auth(),read,{...query(f.bookingId),fiscalNumber:"SYNTHETIC-UNAUTHORIZED"} as ProjectionQuery),/PROJECTION_INPUT_INVALID/);
});

test("H5-011 A02/A05/C02: genuine F1/F2 permit the exact query; each forged MAC or changed Booking is denied",async()=>{
 const a=await booking(),b=await booking(),f1=createF1Issuer(h.f1),f2=createF2Issuer(h.f2);
 const call=async(mode:"valid"|"f1"|"f2"|"binding")=>h.runtime.begin("isolation level read committed",async(tx:PostgresTransaction)=>{
  const auth=await h.auth(),row=(await tx.unsafe<{actor_id:string;admin_scope:string;access_generation:string;epoch_id:string}[]>("select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup($1::uuid,$2::uuid)",[auth.subject,auth.sessionId!]))[0]!,binding=await postgresF1Binding(tx);
  const input=encodeF1Fields(["CRM-H5-PROJECTION-READ1",canonicalCommercial(query(a.q.bookingId))]),changed=encodeF1Fields(["CRM-H5-PROJECTION-READ1",canonicalCommercial(query(b.q.bookingId))]);
  const human=f2(auth,{actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id},binding,"evidence_read",input,read);
  const context=issueTrustedContext({identityId:"h5-projection-server",identityKind:"technical",purpose:"h1-evidence",scope:row.admin_scope,requestId:uid(),serverTime:new Date().toISOString()}),technical=f1(context,binding,"C01",input,{resource:"evidence",action:"read_evidence"});
  const bad=(mac:Buffer)=>{const copy=Buffer.from(mac);copy[0]=copy[0]!^1;return copy;};
  return (await tx.unsafe<{data:{contextId:string}}[]>("select crm_api.h5_projection_read($1,$2,$3,$4,$5) data",[human.payload,mode==="f2"?bad(human.mac):human.mac,technical.payload,mode==="f1"?bad(technical.mac):technical.mac,mode==="binding"?changed:input]))[0]!.data;
 });
 assert.equal((await call("valid")).contextId,a.q.bookingId);
 for(const attack of ["f1","f2","binding"] as const)await assert.rejects(call(attack));
 assert.equal((await reader.read(await h.auth(),read,query(a.q.bookingId.toUpperCase())))!.contextId,a.q.bookingId);
 assert.ok(await reader.read(await h.auth(),read,query(b.q.bookingId)));
});
