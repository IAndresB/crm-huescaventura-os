// E2E-01: one continuous synthetic sale, through ordinary application ports.
// Expected values are frozen independently before this executable was written.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fifthDatabase,read,write} from '../support/h5-018-fifth-isolated.ts';
import {quantityFixture} from '../support/h2-quantities-fixtures.ts';
import {confirmationFixture} from '../support/h4-confirmation-fixtures.ts';
import {preparationCommands} from '../support/h4-booking-preparation-fixtures.ts';
import {closureCommands} from '../support/h5-closure-fixtures.ts';
import {jointCommands,conclusions} from '../support/h5-joint-closure-fixtures.ts';
import {syntheticOwnInput} from '../support/h3-own-economics-fixtures.ts';
import {isolatedAuth,totp} from '../support/h6-auth-provider-isolated.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {SupabaseAuthProvider} from '../../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../../src/server/human-auth-session.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {digest} from '../../src/infrastructure/storage/private-storage.ts';
import {civilReference,localDate,zoneEvidence} from '../../src/domain/civil-time.ts';

test('H6-001 E2E-01 continuous local sale, ordinary permissions and evidence',async t=>{
 const port=59638;
 let h:any=await fifthDatabase('h6001_e2e',port),authService:any,sessions:HumanAuthSessions|undefined;
 const recorded:any[]=[],observed:any[]=[];
 const at=()=>new Date().toISOString();
 const hash=async(x:unknown)=>String((await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(x)}::text::jsonb::text,'UTF8'),'sha256'),'hex') h`)[0].h);
 const snapshot=async()=>{
  const rows=await h.observer`select tablename from pg_tables where schemaname='crm_private' and tablename ~ '^(b0[2-9]_|b10_|catalog_|commercial_|identity_)' order by tablename`;
  const result:Record<string,string>={};for(const {tablename} of rows)result[tablename]=String((await h.observer.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(x)::text,E'\n' order by to_jsonb(x)::text),''),'sha256'),'hex') h from crm_private.${tablename} x`))[0].h);return result;
 };
 const step=async(id:string,body:()=>Promise<unknown>)=>{let passed=false;await t.test(id,async()=>{await body();passed=true;observed.push({id,result:'PASS'});});assert.ok(passed,'stop dependent chain after '+id);};
 try{
  const f1={...h.f1,allowedPurposes:[...h.f1.allowedPurposes,'h0-005-human-bridge']};
  await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;h={...h,f1};
  authService=await isolatedAuth(h,port);const user=await authService.createUser(h.subject);
  sessions=new HumanAuthSessions(new SupabaseAuthProvider({endpoint:authService.gateway,issuer:authService.endpoint,allowLocalHttp:true}),new H0005PostgresAdapter(h.runtime,f1,h.f2));
  const handle=await sessions.login(user.email,user.password,totp(user.secret));
  h={...h,auth:()=>verifyAuth(sessions!,handle)};
  // Capture exact application commands. Never serialize auth proofs or keys.
  for(const name of ['adapter','identities','evidence','proposal','offer','acceptance','booking','obligations','payments','allocations','confirmations','preparation','requirements','reality','ownEconomics','closures']){
   const original=h[name];h[name]=new Proxy(original,{get(target,key){const v=target[key];if(key!=='apply'&&!(name==='closures'&&key==='close'))return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{const r=await v.apply(target,args);recorded.push({port:name,method:key,command:structuredClone(args[2]),result:structuredClone(r)});return r;};}});
  }
  const contactId=uid(),groupId=uid(),leadId=uid(),opportunityId=uid();
  const material={contact:{channel:'manual',address:'client@example.invalid',sourceRef:'SYNTHETIC verified enquiry',valid:true},need:'SYNTHETIC group activity and two nights',commercialPossible:true,pending:[],contactId,groupId};
  await step('P01 context and Lead via ordinary contracts',async()=>{
   await h.identities.apply(await h.auth(),write,{action:'create_context',operationId:uid(),targetId:opportunityId,kind:'opportunity',expectedVersion:0,sourceRef:'SYNTHETIC enquiry context',evidenceRef:'SYNTHETIC context',reason:'SYNTHETIC',verified:true});
   for(const [kind,id] of [['contact',contactId],['group',groupId]])await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:id,kind,...(kind==='group'?{contextId:opportunityId}:{}),expectedVersion:0,sourceRef:'SYNTHETIC enquiry',evidenceRef:'SYNTHETIC contextual record',reason:'SYNTHETIC consent-free fixture',verified:true,displayName:'SYNTHETIC '+kind});
   await h.adapter.apply(await h.auth(),write,h.input({action:'lead',targetId:leadId,material:{...material,groupId:null}}));
   assert.ok(await h.adapter.read(await h.auth(),read,leadId,'lead'));
  });
  let b:any;
  await step('P02 Lead conversion versions modalities and exact Acceptance',async()=>{
   // Reuse input builders only. All internal service/catalog and commercial facts
   // still pass through existing adapters; no direct SQL business-state seed.
   const hh={...h,input:()=>h.input({action:'convert',targetId:opportunityId,leadId,material}),cat:(kind:any,definition:any)=>h.cat(kind,kind==='service'?{...definition,nature:'internal',name:'SYNTHETIC own '+definition.name}:definition)};
   b=await quantityFixture(hh);
   const d=structuredClone(b.detail);for(const s of d.services)s.nature='internal';
   b={...b,detail:d,q:{...b.q,detail:d,evidenceId:await b.detailProof(d)}};
   const opp=await h.observer`select lead_id::text,material from crm_private.b03_opportunities where opportunity_id=${opportunityId}::uuid`;
   assert.equal(opp[0].lead_id,leadId);assert.equal(opp[0].material.contactId,contactId);
   assert.equal((await h.observer`select count(*)::int n from crm_private.b03_proposal_versions where proposal_id in(select proposal_id from crm_private.b03_proposals where opportunity_id=${opportunityId}::uuid)`)[0].n,2);
   assert.equal((await h.observer`select state from crm_private.b03_opportunities where opportunity_id=${opportunityId}::uuid`)[0].state,'Aceptada / Ganada');
   assert.equal((await h.observer`select count(*)::int n from crm_private.b04_bookings where opportunity_id=${opportunityId}::uuid`)[0].n,0,'Acceptance is not Booking');
  });
  const bid=b.q.bookingId;
  const proof=async(claim:string,target=bid,moment=at())=>{const q=h.req('evidence',{claim,coverage:target,certainty:'reviewed',source_kind:'manual'},target,'other');await h.evidence.apply(await h.auth(),write,{...q,coverage:target,occurredAt:moment});return q.targetId;};
  const attest=async(prefix:string,q:any,target=bid,omit:string[]=[])=>{const claim=prefix+await hash(Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId',...omit].includes(k)&&v!==undefined)));return {...q,evidenceId:prefix.startsWith('obligation:')?await b.proof(claim,q.at):await proof(claim,target,q.at)};};
  const base=()=>({operationId:uid(),bookingId:bid,expectedRevision:0,sourceRef:'SYNTHETIC explicit known source',reason:'SYNTHETIC authorized local test',at:at(),evidenceId:uid()});
  await step('N01 conversion without acceptance and forged identity have no side effects',async()=>{
   const before=await snapshot();await assert.rejects(h.booking.apply(await h.auth(),write,{...b.q,operationId:uid(),acceptanceId:uid()}));
   await assert.rejects(h.booking.apply({...await h.auth()},write,b.q));assert.deepEqual(await snapshot(),before);
  });
  await step('P03 one Booking immutable accepted snapshots quantities and nights',async()=>{
   await h.booking.apply(await h.auth(),write,b.q);
   assert.equal((await h.booking.apply(await h.auth(),write,b.q)).replayed,true);
   const view:any=await h.booking.read(await h.auth(),read,bid);assert.ok(view);
   const counts=await h.observer`select (select count(*) from crm_private.b04_bookings where opportunity_id=${opportunityId}::uuid)::int bookings,(select count(*) from crm_private.b04_services where booking_id=${bid}::uuid)::int services,(select count(*) from crm_private.b04_nights where service_id in(select service_id from crm_private.b04_services where booking_id=${bid}::uuid))::int nights`;
   assert.deepEqual(counts[0],{bookings:1,services:3,nights:2});
   const nights=await h.observer`select n.night_date::text,sum(c.attendees)::int people from crm_private.b04_nights n join crm_private.b04_night_occupancies nc using(night_id) join crm_private.b04_contributions c using(contribution_id) where c.booking_id=${bid}::uuid group by n.night_date order by n.night_date`;
   assert.deepEqual(nights.map((x:any)=>x.people),[12,10]);
   const attendees=await h.observer`select service_id::text,sum(attendees)::int people from crm_private.b04_contributions where booking_id=${bid}::uuid group by service_id`;
   assert.equal(attendees.find((x:any)=>x.service_id===b.detail.services[0].id).people,10);
   assert.equal(attendees.find((x:any)=>x.service_id===b.detail.services[1].id).people,12);
  });
  const beforeSnapshots=await h.observer`select to_jsonb(x) row from crm_private.b03_proposal_versions x where proposal_id in(select proposal_id from crm_private.b03_proposals where opportunity_id=${opportunityId}::uuid) order by version_id`;
  const preparation=await preparationCommands(h,bid);
  const critical=await Promise.all(b.detail.services.flatMap((s:any)=>s.nights.length?s.nights.map((n:any)=>preparation.classify(s.id,n.id)): [preparation.classify(s.id)]));
  await step('N02 won and dates alone do not confirm or perform Booking',async()=>{
   await preparation.run(await preparation.command(critical));
   assert.notEqual((await preparation.read())!.phase,'Confirmada operativamente');
   assert.notEqual((await h.reality.read(await h.auth(),read,bid)).phase,'Finalizada');
  });
  const policyId=uid(),scheduleId=uid(),paymentId=uid(),reconciliationId=uid();
  await step('P04 approved ordinary payment rule fixes exact obligation',async()=>{
   await h.obligations.apply(await h.auth(),write,await attest('obligation:publish_policy:',{...base(),action:'publish_policy',policyId,policyVersion:1,selectors:{}},bid,['computed']));
   const time=at();await h.obligations.apply(await h.auth(),write,await attest('obligation:determine:',{...base(),at:time,action:'determine',policyId,scheduleId,scope:'global',scopeId:bid,policy:{id:policyId,version:1,rule:'ordinary_50_50'},definition:{base:{amount:'1200.12',sourceRef:b.q.versionId,version:'1'},reference:civilReference({scope:'global',scopeId:bid},localDate('2026-10-20'),zoneEvidence('Europe/Madrid','SYNTHETIC contractual zone','1'),b.q.versionId,'1'),at:time}},bid,['computed']));
   const schedule=await h.obligations.read(await h.auth(),read,bid,scheduleId);assert.equal(schedule.current.snapshot.parts[0].amount,'1200.12');
  });
  const identity={sourceRef:'SYNTHETIC-BANK',externalId:uid()},paybase={...base(),bookingId:undefined,paymentId,sourceEvidenceId:await proof('payment-source:SYNTHETIC-BANK',paymentId)};
  const pay=(q:any)=>attest('payment:'+q.action+':',q,paymentId,['sourceEvidenceId','paymentId']);
  let assign:any;
  await step('P05 received verified and assigned funds remain distinct',async()=>{
   await h.payments.apply(await h.auth(),write,await pay({...paybase,action:'detect',detection:{amount:'1200.12',payerRef:'SYNTHETIC client',date:at().slice(0,10),method:'bank_transfer',reference:'SYNTHETIC booking',bookingId:bid,identity}}));
   assert.equal((await h.payments.read(await h.auth(),read,paymentId)).summary.grossReceived,null);
   assert.equal((await h.allocations.read(await h.auth(),read,paymentId)).paymentRevision,1);
   await h.payments.apply(await h.auth(),write,await pay({...paybase,operationId:uid(),action:'receive',expectedRevision:1,amount:'1200.12',identity}));
   assert.equal((await h.payments.read(await h.auth(),read,paymentId)).summary.verifiedCorrespondence,'0.00');
   await h.payments.apply(await h.auth(),write,await pay({...paybase,operationId:uid(),action:'propose',sourceEvidenceId:undefined,expectedRevision:2,reconciliationId,start:'0.00',amount:'1200.12',bookingId:bid,scheduleId,slot:'initial'}));
   await h.payments.apply(await h.auth(),write,await pay({...paybase,operationId:uid(),action:'verify',expectedRevision:3,reconciliationId}));
   const funds=await h.allocations.read(await h.auth(),read,paymentId);
   assert.equal(funds.summary.assigned,'0.00');
   assign=await attest('allocation:assign:',{...base(),bookingId:undefined,action:'assign',paymentId,expectedRevision:funds.revision,expectedPaymentRevision:funds.paymentRevision,allocationId:uid(),reconciliationId,expectedReconciliationRevision:2,start:'0.00',amount:'1200.12',destination:{bookingId:bid,purpose:'obligation',reference:'SYNTHETIC exact obligation',scheduleId,slot:'initial'},expectedScheduleRevision:1},paymentId,['calculation']);
   await h.allocations.apply(await h.auth(),write,assign);
   await preparation.run(await preparation.command(critical));assert.notEqual((await preparation.read())!.phase,'Confirmada operativamente','funds alone do not confirm critical services');
  });
  await step('N03 duplicated and overallocated funds denied without second movement',async()=>{
   const replayBefore=await snapshot();assert.equal((await h.allocations.apply(await h.auth(),write,assign)).replayed,true);assert.deepEqual(await snapshot(),replayBefore);
   const funds=await h.allocations.read(await h.auth(),read,paymentId),bad=await attest('allocation:assign:',{...assign,operationId:uid(),allocationId:uid(),expectedRevision:funds.revision},paymentId,['calculation']);
   const before=await snapshot();await assert.rejects(h.allocations.apply(await h.auth(),write,bad));assert.deepEqual(await snapshot(),before);
  });
  const confirmations:any[]=[];
  await step('P06 responsible confirmations cover every service and night',async()=>{
   for(let index=0;index<b.detail.services.length;index++){
    const s=b.detail.services[index];for(const night of s.nights.length?s.nights:[null]){
     const cf=await confirmationFixture(h,{b:{detail:b.detail},bookingId:bid,provider:{id:uid(),revision:uid()}} as any,index,'internal');
     const coverage={...cf.coverage,nightId:night?.id??null,date:night?.date??'2026-10-20',quantity:String(night?s.contributions.filter((c:any)=>night.contributionIds.includes(c.id)).reduce((a:number,c:any)=>a+c.attendees,0):s.contributions.reduce((a:number,c:any)=>a+Number(c.quantity),0)),commercialBasis:{...cf.coverage.commercialBasis,contributions:cf.coverage.commercialBasis.contributions.filter((c:any)=>!night||night.contributionIds.includes(c.id))}};
     await cf.apply(await cf.register({coverage}));await cf.apply(await cf.evaluate());confirmations.push(cf);
    }
   }
   assert.equal(confirmations.length,4);
  });
  const requirementId=uid(),docId=uid(),objectId=uid(),ctx={contextKind:'booking' as const,contextId:bid,purpose:'activity-preparation'};
  const scope={serviceId:b.detail.services[0].id,action:'prepare'};
  const requirement=async(action:string,changes:any={})=>attest('requirement:'+action+':',{...base(),action,requirementId,expectedRevision:(await h.requirements.read(await h.auth(),read,requirementId,bid))?.revision??0,...changes},requirementId);
  await step('P07 document need blocks only its dependent preparation',async()=>{
   await h.requirements.apply(await h.auth(),write,await requirement('need',{basis:{rule:{id:uid(),version:'SYNTHETIC-V1',sourceRef:'SYNTHETIC stipulated permission',purpose:ctx.purpose,documentType:'permission',scopeKind:'service',indispensable:true,conditionKey:'variant',equals:'regulated',requiredFields:[]},scope,context:{conditionKey:'variant',value:'regulated',sourceRef:'SYNTHETIC applicable condition',version:'1'}}}));
   await preparation.run(await preparation.command(critical));assert.notEqual((await preparation.read())!.phase,'Confirmada operativamente');
  });
  const bytes=Buffer.from('SYNTHETIC H6-001 retained original; no real person, fiscal or legal validity');
  await step('P08 private original received linked and reviewed independently',async()=>{
   await h.evidence.apply(await h.auth(),write,{...h.req('document',{relation:'original',content_ref:'SYNTHETIC permission',content_kind:'synthetic-text',storage_state:'reference_only'},bid,'booking'),targetId:docId,purpose:ctx.purpose,occurredAt:at()});
   await h.objects.prepare(await h.auth(),write,{...ctx,documentId:docId,rootId:uid(),versionId:objectId,expectedVersion:0,operationId:uid(),sourceRef:'SYNTHETIC original',reason:'SYNTHETIC private evidence',digest:digest(bytes),size:bytes.length,media:'application/octet-stream'});
   await h.objects.upload(await h.auth(),read,write,objectId,ctx,bytes,uid());await h.objects.reconcile(await h.auth(),read,write,objectId,ctx,uid());await h.objects.link(await h.auth(),read,write,objectId,ctx,uid());
   await h.requirements.apply(await h.auth(),write,await requirement('receive',{document:{documentId:docId,objectVersionId:objectId,ruleVersion:'SYNTHETIC-V1',purpose:ctx.purpose,coverage:[scope]}}));
   assert.equal((await h.requirements.read(await h.auth(),read,requirementId,bid)).status,'Recibido');
   await preparation.run(await preparation.command(critical));assert.notEqual((await preparation.read())!.phase,'Confirmada operativamente');
   await h.requirements.apply(await h.auth(),write,await requirement('review',{checks:{content:true,version:true,scope:true,purpose:true}}));
   assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,objectId,ctx)),bytes);
  });
  await step('P09 full preparation joins funds critical scopes and reviewed documents',async()=>{
   await preparation.run(await preparation.command(critical));assert.equal((await preparation.read())!.phase,'Confirmada operativamente');
  });
  const realityOriginal=uid();await h.evidence.apply(await h.auth(),write,{...h.req('document',{relation:'original',content_ref:'SYNTHETIC internal record of actual performance',content_kind:'manual_record',storage_state:'reference_only'},bid,'booking'),targetId:realityOriginal,occurredAt:at()});
  const reality=async(action:string,changes:any={})=>{const v=await h.reality.read(await h.auth(),read,bid);const scopes=v.scopes.map((s:any)=>({serviceId:s.serviceId,nightId:s.nightId,contributionId:s.contributionId,dimension:s.dimension,start:'0',amount:s.current}));return attest('reality:'+action+':',{...base(),action,factId:uid(),expectedRevision:v.revision,expectedMaterial:v.material,data:{scopes:action==='finish'?[]:scopes,moment:{kind:'civil',value:'2026-10-22'},source:action==='finish'?{kind:'internal',id:h.actorId}:confirmations[0].source,responsibleId:h.actorId,originalId:realityOriginal,certainty:'verified',exceptional:false,review:null,correctsFactId:null,correctsRevision:null,...changes}});};
  await step('N04 date and confirmation cannot substitute recorded actual execution',async()=>{
   const q=await reality('finish'),before=await snapshot();await assert.rejects(h.reality.apply(await h.auth(),write,q));assert.deepEqual(await snapshot(),before);
  });
  await step('P10 normal start performed quantities and factual finish',async()=>{
   await h.reality.apply(await h.auth(),write,await reality('start'));assert.equal((await h.reality.read(await h.auth(),read,bid)).phase,'En curso');
   await h.reality.apply(await h.auth(),write,await reality('perform'));await h.reality.apply(await h.auth(),write,await reality('finish'));assert.equal((await h.reality.read(await h.auth(),read,bid)).phase,'Finalizada');
  });
  const economyId=uid();
  await step('P11 own economy has sources independent of customer receipts',async()=>{
   const input:any=structuredClone(syntheticOwnInput()),line=b.detail.services[0].contributions[0];
   const version=(await h.observer`select content from crm_private.b03_proposal_versions where version_id=${b.q.versionId}::uuid`)[0].content;
   const l=version.modalities.flatMap((m:any)=>m.lines).find((x:any)=>x.id===line.lineId);
   const form=await h.cat('pricing_form',{name:'SYNTHETIC own fixed',definition:'fixed'});
   input.fees=b.detail.services.map((s:any,index:number)=>({...structuredClone(input.fees[0]),id:'fee-'+index,serviceId:s.id}));
   input.costs=b.detail.services.map((s:any,index:number)=>({...structuredClone(input.costs[0]),id:'cost-'+index,serviceId:s.id}));
   for(const c of [...input.fees,...input.costs]){if(c.id==='fee')c.serviceId=b.detail.services[0].id;Object.assign(c,{unitRevisionId:l.unitRevisionId,pricingFormRevisionId:form.revision});const {approvalEvidenceId,...rule}=c.rule;Object.assign(c.rule,{approvalEvidenceId:await proof('own-rule:'+await hash(rule),economyId)});}
   await h.ownEconomics.apply(await h.auth(),write,await attest('own-economics:',{...base(),economyId,scope:'SYNTHETIC explicitly attributable own service economy',expectedBookingRevision:1,input},economyId));
  });
  const c=await closureCommands(h,bid),joint=await jointCommands(h,bid);
  const changes={documentDependencies:[{requirementId,dimensions:['operational'] as const,reason:'SYNTHETIC permission affects preparation/performance only'}],serviceApplicability:b.detail.services.map((s:any)=>({serviceId:s.id,suplido:false,deposit:false,ownEconomics:true,reason:'SYNTHETIC internal own service without third-party funds or deposit'}))};
  await step('N05 performance does not implicitly close any dimension',async()=>{const v=await c.view();assert.equal(v.jointClosure.current,false);assert.deepEqual(v.assessments,{});const q=await joint.command(),before=await snapshot();await assert.rejects(joint.run(q));assert.deepEqual(await snapshot(),before);});
  await step('P12 commercial operational economic reviews resolve independently',async()=>{
   for(const dimension of ['commercial','operational','economic'] as const){const conclusion={...conclusions[dimension],...(dimension==='operational'?{documents:'satisfied' as const}:{})};await c.run(await c.command(dimension,conclusion,changes));await c.run(await c.command(dimension,conclusion,{...changes,action:'evaluate'}));assert.equal((await c.view()).assessments[dimension]!.currentStatus,'Resuelto');assert.equal((await c.view()).jointClosure.current,false);}
  });
  await step('P13 explicit joint closure and response-loss replay preserve history',async()=>{
   const q=await joint.command();await joint.run(q);const before=await snapshot();assert.equal((await joint.run(q)).replayed,true);assert.deepEqual(await snapshot(),before);assert.equal((await c.view()).jointClosure.current,true);
   const bad=await joint.attest({...q,reason:'SYNTHETIC conflicting material'}),beforeConflict=await snapshot();await assert.rejects(joint.run(bad),/REPLAY_CONFLICT/);assert.deepEqual(await snapshot(),beforeConflict);
  });
  await step('P14 reconstruct one closed Booking to every original and decision',async()=>{
   assert.deepEqual(await h.observer`select to_jsonb(x) row from crm_private.b03_proposal_versions x where proposal_id in(select proposal_id from crm_private.b03_proposals where opportunity_id=${opportunityId}::uuid) order by version_id`,beforeSnapshots);
   const view:any=await h.booking.read(await h.auth(),read,bid);assert.equal(view.closureAssessments.jointClosure.current,true);
   const sources=await h.observer`select to_jsonb(b) booking,to_jsonb(a) acceptance,to_jsonb(o) opportunity,to_jsonb(l) lead from crm_private.b04_bookings b join crm_private.b03_acceptances a using(acceptance_id) join crm_private.b03_opportunities o on o.opportunity_id=b.opportunity_id join crm_private.b03_leads l on l.lead_id=o.lead_id where b.booking_id=${bid}::uuid`;
   assert.equal(sources.length,1);assert.equal(sources[0].booking.version_id,b.q.versionId);assert.equal(sources[0].lead.lead_id,leadId);
   const history=await h.observer`select action_kind,operation_id::text,actor_id::text from crm_private.b07_history where actor_id=${h.actorId}::uuid order by recorded_at,history_id`;
   assert.ok(history.length>30);assert.ok(history.some((x:any)=>x.action_kind==='reality_finish'));
   const v=await c.view();assert.equal(v.jointClosure.history.length,1);for(const d of ['commercial','operational','economic'] as const){assert.equal(v.assessments[d]!.currentStatus,'Resuelto');assert.ok(v.assessments[d]!.evidenceId);}
   const roots=await h.observer`select a.allocation_id::text,a.payment_id::text,a.reconciliation_id::text,a.schedule_id::text,a.amount::text,pr.source_evidence_id::text from crm_private.b05_allocations a join crm_private.b05_reconciliations r using(reconciliation_id) join crm_private.b05_payment_receipts pr on pr.payment_id=a.payment_id where a.booking_id=${bid}::uuid and r.booking_id=a.booking_id and r.schedule_id=a.schedule_id`;
   assert.equal(roots.length,1);assert.equal(roots[0].allocation_id,assign.allocationId);assert.equal(roots[0].payment_id,paymentId);assert.equal(roots[0].reconciliation_id,reconciliationId);assert.equal(roots[0].schedule_id,scheduleId);assert.equal(roots[0].amount,'1200.12');assert.equal(roots[0].source_evidence_id,paybase.sourceEvidenceId);
   const funds=await h.allocations.read(await h.auth(),read,roots[0].payment_id);assert.equal(funds.summary.received,'1200.12');assert.equal(funds.summary.assigned,'1200.12');assert.equal(funds.summary.consumed,'0.00');assert.equal(funds.allocations.length,1);
   const confRoots=await h.observer`select c.confirmation_id::text,f.material,f.evidence_id::text from crm_private.b04_confirmations c join crm_private.b04_confirmation_facts f using(confirmation_id) where c.booking_id=${bid}::uuid`;
   assert.equal(confRoots.length,4);for(const row of confRoots){assert.ok(confirmations.some(c=>c.confirmationId===row.confirmation_id));assert.equal(row.material.source.kind,'internal');assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records r join crm_private.b07_links l using(record_id) where r.record_id=${row.material.recordId}::uuid and l.context_id=${bid}::uuid`)[0].n,1);}
   const requirement=await h.requirements.read(await h.auth(),read,requirementId,bid),object=await h.objects.metadata(await h.auth(),read,objectId,ctx);
   assert.equal(requirement.status,'Revisado');assert.equal(object.document_id,docId);assert.equal(object.state,'stored');assert.equal(object.expected_digest,digest(bytes));assert.equal(Number(object.expected_size),bytes.length);
   const i:any=v.inputs;assert.equal(i.agreement.acceptanceId,b.q.acceptanceId);assert.equal(i.agreement.versionId,b.q.versionId);assert.equal(i.schedules.length,1);assert.equal(i.schedules[0].id,scheduleId);assert.ok(i.schedules[0].coverage.every((x:any)=>Number(x.remaining)===0));assert.equal(i.requirements[0].id,requirementId);assert.equal(i.requirements[0].state.status,'Revisado');assert.equal(i.ownEconomics[0].id,economyId);assert.equal(i.ownEconomics[0].computed.totals.real.fee,'300.00');assert.equal(i.ownEconomics[0].computed.totals.real.cost,'60.00');assert.equal(i.ownEconomics[0].computed.totals.real.profit,'240.00');assert.equal(i.ownEconomics[0].computed.fiscalValidation,false);
   for(const d of ['commercial','operational','economic'] as const){const assessment=v.assessments[d]!;assert.ok(assessment.criteria.every(x=>x.result!=='pending'&&x.review.conclusion===x.result));assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_id=${assessment.evidenceId}::uuid`)[0].n,1);}
   const actual=await h.observer`select action_kind,after_data,evidence_id::text from crm_private.b04_reality_events where booking_id=${bid}::uuid order by recorded_at`;assert.deepEqual(actual.map((r:any)=>r.action_kind),['start','perform','finish']);assert.ok(actual.every((r:any)=>r.after_data.data.originalId===realityOriginal&&r.after_data.data.exceptional===false));
   const p=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),before=await snapshot();for(const surface of ['timeline','calendar'] as const){const result=await p.read(await h.auth(),read,{contextKind:'booking',contextId:bid,surface,destination:'administrator'});assert.equal(result!.mutationAuthority,false);}assert.deepEqual(await snapshot(),before);
   observed.push({id:'TRACE',result:'PASS',bookingId:bid,opportunityId,leadId,contactId,groupId,versionId:b.q.versionId,acceptanceId:b.q.acceptanceId,scheduleId,paymentId,reconciliationId,allocationId:assign.allocationId,requirementId,documentId:docId,objectId,historyRows:history.length,sources,fundRoots:roots,funds,confirmations:confRoots,requirement,object,actual,closures:v});
  });
  await step('N06 ordinary runtime and anonymous roles cannot bypass guards',async()=>{
   const before=await snapshot();for(const role of ['crm_h0_runtime','anon','authenticated']){const sql=h.connect(role);await assert.rejects(sql.unsafe(`update crm_private.b04_bookings set state='Finalizada' where booking_id='${bid}'`));await assert.rejects(sql.unsafe('select * from crm_private.b07_records'));}assert.deepEqual(await snapshot(),before);
  });
  await step('N07 disabled actor and stale authenticated evidence cannot read replay or mutate',async()=>{
   const auth=await h.auth();await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;const before=await snapshot();
   try{await assert.rejects(h.booking.read(auth,read,bid));await assert.rejects(h.booking.apply(auth,write,b.q));await assert.rejects(h.objects.download(auth,read,objectId,ctx));assert.deepEqual(await snapshot(),before);}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
   await sessions!.logout(handle);await assert.rejects(h.booking.read(auth,read,bid));await assert.rejects(h.booking.apply(auth,write,b.q));assert.deepEqual(await snapshot(),before);
  });
  assert.equal(authService.mailAttempts(),0);
 }finally{
  if(process.env.H6001_OUTPUT){await mkdir(process.env.H6001_OUTPUT,{recursive:true});await writeFile(join(process.env.H6001_OUTPUT,'observed.json'),JSON.stringify({scope:'synthetic local E2E-01 only',auth:'Supabase Auth v2.197.0 actual password and TOTP',postgres:'17.11',observed,commands:recorded},null,2)+'\n');}
  sessions?.close();await authService?.close();await h.close();
 }
});
