// Independent audit oracles frozen in audit/h6-017/expected.json before execution.
// Historical fixtures are setup only. All counterexamples below are original.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid,createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {isolatedWork,read,write} from '../support/h6-current-isolated.ts';
import {observation} from '../support/h5-018-fourth-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {quantityFixture,nominalFixture} from '../support/h2-quantities-fixtures.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import type {ProjectionQuery} from '../../src/domain/coordinated-projection.ts';
import {isolatedAuth,totp} from '../support/h6017-independent-auth-isolated.ts';
import {SupabaseAuthProvider} from '../../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../../src/server/human-auth-session.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>,p:H5011ProjectionAdapter;
let authService:Awaited<ReturnType<typeof isolatedAuth>>,sessions:HumanAuthSessions,user:Awaited<ReturnType<Awaited<ReturnType<typeof isolatedAuth>>['createUser']>>;
const login=async()=>{const handle=await sessions.login(user.email,user.password,totp(user.secret));return {handle,auth:await verifyAuth(sessions,handle)};};
const results:unknown[]=[];
const observed=(id:string,value:unknown)=>{results.push({id,value});console.log(id,JSON.stringify(value));};
before(async()=>{assert.equal(process.env.H6015_PRIVATE_PARENT,undefined);h=await isolatedWork('audit_h6017',59791);
 const f1={...h.f1,allowedPurposes:[...h.f1.allowedPurposes,'h0-005-human-bridge','h0-013-auth-revocation']};await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;h={...h,f1};
 authService=await isolatedAuth(h,59791);user=await authService.createUser(h.subject);const provider=new SupabaseAuthProvider({endpoint:authService.gateway,issuer:authService.endpoint,allowLocalHttp:true});sessions=new HumanAuthSessions(provider,new H0005PostgresAdapter(h.runtime,h.f1,h.f2));
 const actual=await login();h={...h,sessionId:actual.auth.sessionId!,auth:()=>verifyAuth(sessions,actual.handle)};p=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);
 await assert.rejects(sessions.login(user.email,'synthetic-wrong-password',totp(user.secret)));const passwordOnly=await authService.request('/token?grant_type=password',{email:user.email,password:user.password});assert.equal((await provider.verify(passwordOnly.value.access_token)).mfaVerified,false);
 observed('AUTH',{version:'v2.197.0',actualPassword:true,actualTotp:true,wrongPasswordDenied:true,AAL1NotMFA:true,localPorts:[59791,59792,59793,59794,59795]});});
after(async()=>{await writeFile('audit/h6-017/observed.json',JSON.stringify(results,null,2)+'\n');sessions?.close();await authService?.close();await h?.close();});
const query=(contextId:string,extra:Partial<ProjectionQuery>={}):ProjectionQuery=>({contextKind:'booking',contextId,surface:'timeline',destination:'administrator',...extra});
const proof=async(subject=uid(),sessionId=h.sessionId)=>verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},uid());
const snapshot=async(tables:string[])=>{const out:Record<string,string>={};for(const t of tables)out[t]=(await h.observer.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(t)::text,E'\\n' order by to_jsonb(t)::text),''),'sha256'),'hex') hash from crm_private."${t}" t`))[0]!.hash;return out;};
const tableNames=async()=>(await h.observer`select tablename from pg_tables where schemaname='crm_private' order by tablename`).map(r=>String(r.tablename));

test('AUD01 original purpose, search and cursor counterexamples on all surfaces',async()=>{
 const a=await bookingFixture(h),b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,a.q);await h.booking.apply(await h.auth(),write,b.q);
 const marker='SYNTHETIC_PRIVATE_AUD017';const rec=h.req('evidence',{claim:marker,coverage:'private',certainty:'reviewed',source_kind:'manual'},a.q.bookingId,'booking');await h.evidence.apply(await h.auth(),write,rec);
 const before=await snapshot(['b04_bookings','b04_services','b07_records']);let outputs=0,searches=0,cursors=0;
 for(const destination of ['customer','provider','ai']as const)for(const surface of ['timeline','calendar','query','search','export','document','ai_context']as const){
  const q=query(a.q.bookingId,{destination,surface,pageSize:1}),r=await p.read(await h.auth(),read,q);assert.ok(r);assert.equal(r.entries.length,1);assert.equal(r.mutationAuthority,false);
  assert.deepEqual(Object.keys(r.entries[0] as object).sort(),['reference','finalPersonPrice','participants','included'].sort());assert.equal((r.entries[0]as any).finalPersonPrice,'100.01');outputs++;
  for(const needle of [marker,b.q.bookingId,a.f.accepterId,'cost_amount','700.00','commission','honorarios']){const found=await p.read(await h.auth(),read,{...q,search:needle});assert.equal(found!.entries.length,0);searches++;}
  if(r.nextPage){for(const changed of [{destination:'administrator' as const},{contextId:b.q.bookingId},{surface:surface==='timeline'?'document' as const:'timeline' as const}]){await assert.rejects(p.read(await h.auth(),read,{...q,...changed,after:r.nextPage}));cursors++;}}
 }
 const internal=await p.read(await h.auth(),read,query(a.q.bookingId));assert.ok(JSON.stringify(internal).includes(marker));assert.deepEqual(await snapshot(['b04_bookings','b04_services','b07_records']),before);
 observed('AUD01',{outputs,searches,cursors,authorizedInternalPositive:true,businessUnchanged:true});
});

test('AUD02 identity, future role, job, separate actor and protected attribute counterexamples',async()=>{
 const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);assert.ok(await p.read(await h.auth(),read,query(f.q.bookingId)));
 const plain={subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:true,role:'administrator',app_metadata:{role:'owner'}};
 for(const auth of [plain,await proof(),{...await h.auth(),role:'owner'}])await assert.rejects(p.read(auth as never,read,query(f.q.bookingId)));
 for(const event of ['polling','background','refresh']as const)await assert.rejects(async()=>p.read(await h.auth(),classifyServerEvent(event as never),query(f.q.bookingId)));
 const subject=uid(),actor=uid();await assert.rejects(h.migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,'audit-other-synthetic-scope')`,(e:any)=>e.code==='42501');
 const foreign=await proof(subject);await assert.rejects(p.read(foreign,read,query(f.q.bookingId)));
 await assert.rejects(h.booking.apply(foreign,write,{...f.q,operationId:uid()}));
 for(const sql of ['update crm_private.crm_actors set admin_scope=\'audit-other-synthetic-scope\'','update crm_private.crm_actors set enabled=true','update crm_f1.keys set enabled=true','select crm_api.provision_actor_mapping(null,null,null)'])await assert.rejects(h.runtime.unsafe(sql));
 observed('AUD02',{administrator:true,forgedDenied:3,jobsDenied:3,secondActorDenied:true,foreignSubjectDenied:true,foreignMutationDenied:true,protectedAttributeDenials:4});
});

test('AUD03 complete current private-table SQL exposure matrix with real SQLSTATE',async()=>{
 const tables=await tableNames();let denied=0;const codes=new Set<string>();
 for(const role of ['crm_h0_runtime','anon','authenticated']){const sql=h.connect(role);for(const table of tables){const col=String((await h.observer`select column_name from information_schema.columns where table_schema='crm_private' and table_name=${table} order by ordinal_position limit 1`)[0]!.column_name);for(const statement of [`select * from crm_private."${table}"`,`insert into crm_private."${table}" default values`,`update crm_private."${table}" set "${col}"="${col}"`,`delete from crm_private."${table}"`]){
  try{await sql.unsafe(statement);assert.fail('UNAUTHORIZED_SQL_SUCCESS '+role+' '+table);}catch(e){assert.notEqual((e as Error).message.startsWith('UNAUTHORIZED_SQL_SUCCESS'),true);assert.equal((e as any).code,'42501','real permission denial SQLSTATE');codes.add((e as any).code);denied++;}
 }}}
 observed('AUD03',{tables:tables.length,roles:3,denied,codes:[...codes]});
});

test('AUD04 object binary, purpose, crossed context and revoked-session counterexamples',async()=>{
 const f=await invoiceFixture(h),doc=await f.document(),ctx={contextKind:'booking' as const,contextId:f.bookingId,purpose:'provider-invoice-documentary'};
 const bytes=await h.objects.download(await h.auth(),read,doc.objectVersionId,ctx);assert.ok(bytes.length);const hash=createHash('sha256').update(bytes).digest('hex');
 for(const context of [{...ctx,contextId:uid()},{...ctx,purpose:'third-party-download'},{...ctx,contextKind:'contact' as const}])await assert.rejects(h.objects.download(await h.auth(),read,doc.objectVersionId,context));
 await assert.rejects(h.objects.download(await proof(),read,doc.objectVersionId,ctx));
 const device=await login(),auth=device.auth;await sessions.logout(device.handle);await assert.rejects(h.objects.download(auth,read,doc.objectVersionId,ctx));await assert.rejects(p.read(auth,read,query(f.bookingId)));
 const fresh=await login();assert.equal(createHash('sha256').update(await h.objects.download(fresh.auth,read,doc.objectVersionId,ctx)).digest('hex'),hash);
 observed('AUD04',{privateBinaryBytes:bytes.length,sha256:hash,crossContextDenials:3,foreignIdentityDenied:true,revokedReadDenied:true,newSessionOriginalIdentical:true});
});

test('AUD05 originals, minimization, tentative identity and controlled rollback/retry',async()=>{
 const qty=await quantityFixture(h),nominal=await nominalFixture(h,qty,4);await h.booking.apply(await h.auth(),write,nominal);
 const people=await h.observer`select count(*)::int n from crm_private.b04_participants where booking_id=${nominal.bookingId}::uuid`;assert.equal(people[0]!.n,4);
 const external=await p.read(await h.auth(),read,query(nominal.bookingId,{destination:'customer'}));assert.equal(JSON.stringify(external).includes('SYNTHETIC Participant'),false);
 const f=await communicationFixture(h),original=(await h.evidence.read(await h.auth(),read,f.originalId,'booking',f.context.contextId)).data;
 const cmd=f.derive('candidate');const tables=['b07_records','b07_pending_tasks','b07_communication_work','b07_history','b07_operations'];const before=await snapshot(tables);
 await h.admin.unsafe("create function crm_private.audit_h6017_fail() returns trigger language plpgsql as $$begin raise exception 'AUDIT_CONTROLLED_FAILURE';end$$");await h.admin.unsafe('create constraint trigger audit_h6017_fail after insert on crm_private.b07_communication_work deferrable initially deferred for each row execute function crm_private.audit_h6017_fail()');
 try{await assert.rejects(f.run(cmd));}finally{await h.admin.unsafe('drop trigger audit_h6017_fail on crm_private.b07_communication_work');await h.admin.unsafe('drop function crm_private.audit_h6017_fail()');}
 assert.deepEqual(await snapshot(tables),before);await f.run(cmd);assert.equal((await f.run(cmd)).replayed,true);const s=await f.see();assert.equal(s.work.length,1);assert.equal(s.work[0].material.confirmedSnapshot.claim,'18');assert.equal(s.work[0].material.reviewState,'pending');assert.equal(s.work[0].original_id,f.originalId);
 for(const change of [{audio:'SYNTHETIC'},{retentionDays:0},{retention:'indefinite'},{consent:true},{deleteOriginal:true},{action:'record_audio'},{action:'delete'},{action:'anonymize'}])await assert.rejects(f.run({...f.derive(),...change} as never));
 assert.deepEqual((await h.evidence.read(await h.auth(),read,f.originalId,'booking',f.context.contextId)).data,original);
 const bad={...nominal,operationId:uid(),bookingId:uid(),detail:{...nominal.detail,participants:nominal.detail.participants.map(x=>({...x,contactId:uid()}))}};await assert.rejects(h.booking.apply(await h.auth(),write,bad));
 observed('AUD05',{nominalParticipants:4,noFictitiousParticipants:true,externalPersonalNamesAbsent:true,commitFailureRolledBack:true,retryExactlyOnce:true,confirmed18Unchanged:true,prohibitedPrivacyDenied:8,originalUnchanged:true,unverifiedContactDenied:true});
});

test('AUD06 external document lifecycle plus fiscal bypasses after internal approval',async()=>{
 const f=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await f.need());await h.invoices.apply(await h.auth(),write,await f.receive());await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());const state=await f.state();assert.equal(state!.status,'Vinculada');assert.equal(state!.document!.issuerRevisionId,f.basis.providerRevisionId);
 const comm=await communicationFixture(h,'outgoing',f.bookingId),d=comm.draft();await comm.run(d);await comm.prepare(d);await comm.approve(d);assert.equal((await comm.see()).externalSendEnabled,false);
 const before=await snapshot((await tableNames()).filter(t=>t.startsWith('b05_')||t.startsWith('b04_')));let denials=0;
 for(const action of ['emit_legal_invoice','assign_fiscal_number','create_fiscal_series','validate_vat','override_P16_with_human_approval','issue_invoice']){await assert.rejects(h.invoices.apply(await h.auth(),write,{...await f.command('review'),action}as never));denials++;}
 for(const extra of [{fiscalNumber:'SYNTHETIC-001'},{fiscalSeries:'SYNTHETIC'},{emit:true},{humanApproval:true},{vatRate:'21.00'}]){await assert.rejects(h.invoices.apply(await h.auth(),write,{...await f.command('review'),...extra}as never));denials++;}
 assert.deepEqual(await snapshot((await tableNames()).filter(t=>t.startsWith('b05_')||t.startsWith('b04_'))),before);
 observed('AUD06',{externalDocumentLinked:true,externalIssuerPreserved:true,internalApprovalNoSend:true,fiscalDenials:denials,economyBookingUnchanged:true});
});

test('AUD07 technical audit sanitization and indirect cross-root queries',async()=>{
 const b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);const o=observation('booking',b.q.bookingId),secret='SYNTHETIC_SECRET_AUDIT017';
 const input={...o,secret,url:'https://synthetic.invalid/token',economics:'700.00',issues:o.issues.map(i=>({...i,message:secret,rawBody:secret,token:secret}))};await h.diagnostic.record(await h.auth(),write,input);assert.equal((await h.diagnostic.record(await h.auth(),write,input)).replayed,true);
 const r=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:b.q.bookingId,pageSize:100,reference:o.requestRef});assert.ok(r.nodes.some(n=>n.id===o.observationId));for(const needle of [secret,'synthetic.invalid','700.00','rawBody'])assert.equal(JSON.stringify(r).includes(needle),false);
 const another=await bookingFixture(h);await h.booking.apply(await h.auth(),write,another.q);const other=await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:another.q.bookingId,pageSize:100,reference:o.requestRef});assert.equal(other.nodes.length,0);
 await assert.rejects(h.diagnostic.read(await proof(),read,{contextKind:'booking',contextId:b.q.bookingId,pageSize:100,reference:o.requestRef}));
 const stored=(await h.observer`select to_jsonb(t)::text value from crm_private.b10_diagnostic_observations t where observation_id=${o.observationId}::uuid`)[0]!.value;assert.equal(stored.includes(secret),false);
 observed('AUD07',{technicalCausesPreserved:true,idempotent:true,secretUrlEconomicBodyAbsent:true,crossRootNodes:other.nodes.length,foreignIdentityDenied:true,persistedSanitized:true});
});

test('AUD08 external received does not mean applied; original source/context counterexamples',async()=>{
 const b=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);const f=await boundaryFixture(h,'web',b.q.bookingId),q=f.base(),before=await snapshot(['b04_bookings','b04_services']);
 await f.run(q);const result=await f.run(q);assert.equal(result.replayed,true);const s=(await h.evidence.read(await h.auth(),read,q.eventId,'booking',b.q.bookingId)).data;assert.ok(s);assert.deepEqual(await snapshot(['b04_bookings','b04_services']),before);
 for(const change of [{sourceId:uid()},{purpose:'emit-fiscal-invoice'}])await assert.rejects(f.run({...q,operationId:uid(),eventId:uid(),externalKey:uid(),...change}as never));
 for(const change of [{apply:true},{confirmed:true},{action:'apply'}]){const cmd={...q,operationId:uid(),eventId:uid(),externalKey:uid(),...change};await f.run(cmd as never);const received=(await h.evidence.read(await h.auth(),read,cmd.eventId,'booking',b.q.bookingId)).data as any;assert.equal(received.record.material.review_state,'pending');assert.deepEqual(received.record.material.payload,q.material);}
 await assert.rejects(h.boundaries.receive(await proof(),write,{...q,operationId:uid(),eventId:uid(),externalKey:uid()}));assert.deepEqual(await snapshot(['b04_bookings','b04_services']),before);
 observed('AUD08',{receivedPersisted:true,deduplicated:true,bookingUnchanged:true,unverifiedSourceAndPurposeDenied:2,extraTopLevelStripped:3,pendingReview:true,foreignIdentityDenied:true});
});
