import {beforeEach,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {database,read,write,uid,run,snapshot,injected,capture,immutableBooking,type H,type Unit} from '../support/h6-016-integrated.ts';
import {fixture,discrepancy} from '../support/h6-016-foundation.ts';
import {overlap,conflict} from '../support/h6-016-cross.ts';
import {acceptanceFixture} from '../support/h2-acceptance-fixtures.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {cancellationFixture,cancellationSchedule,cancellationApplication} from '../support/h5-017-g-cancellation-fixtures.ts';
import {refundFixture} from '../support/h6-016-refund-fixtures.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {jointCommands} from '../support/h5-joint-closure-fixtures.ts';
let h:H,n=0;beforeEach(async()=>{h=await database('h6016_cross_'+(++n)+'_'+process.pid);});afterEach(async()=>{await h?.close();});

for(const order of [0,1]as const)test(`H6-016 X01-T01/T02 fixed replacement versus explicit verification order ${order}`,async()=>{
 const f=await acceptanceFixture(h),r=await f.register(),old=await h.proposal.read(await h.auth(),read,f.proposalId,'internal',f.versionId);
 await h.proposal.apply(await h.auth(),write,{action:'prepare',operationId:uid(),proposalId:f.proposalId,opportunityId:f.opp.targetId,...await f.revisions(),content:{...f.content,terms:{...f.content.terms,version:'T2',text:'SYNTHETIC new offered conditions'}},baseVersionId:f.versionId,reviewed:true,sourceRef:'SYNTHETIC reviewed replacement',reason:'SYNTHETIC current terms'});
 const verify=await f.verification(r),fix={action:'fix',operationId:uid(),proposalId:f.proposalId,opportunityId:f.opp.targetId,...await f.revisions(),versionId:uid(),sourceRef:'SYNTHETIC reviewed replacement',reason:'SYNTHETIC current terms'};
 const rs=await overlap(h,'X01-'+order,f.opp.targetId,31,[a=>run(h,'acceptance',verify,a),a=>run(h,'proposal',fix,a)],order);
 assert.equal(rs[order]!.status,'fulfilled');conflict(rs[order?0:1]!);
 const rows=await h.observer`select(select count(*)from crm_private.b03_acceptance_verifications where acceptance_id=${r.acceptanceId}::uuid)+(select count(*)from crm_private.b03_proposal_versions where replaces_version_id=${f.versionId}::uuid)n`;assert.equal(Number(rows[0]!.n),1);assert.deepEqual(await h.proposal.read(await h.auth(),read,f.proposalId,'internal',f.versionId),old);
});

async function directChain(){
 const b=await bookingFixture(h,'total',false),proposalId=uid(),versionId=uid(),acceptanceId=uid(),at=new Date().toISOString(),o=b.q.expectedOpportunityRevision;
 const common={proposalId,opportunityId:b.q.opportunityId,sourceRef:'SYNTHETIC actual direct agreement',reason:'SYNTHETIC',expectedOpportunityRevision:o+1},proof=(claim:string)=>b.f.proof(claim,b.q.coverage,at);
 const prepare={...common,action:'prepare' as const,operationId:uid(),expectedRevision:0,expectedOpportunityRevision:o,content:b.f.content},fix={...common,action:'fix' as const,operationId:uid(),expectedRevision:1,versionId};
 const issue={...common,action:'issue' as const,operationId:uid(),expectedRevision:2,versionId,coverage:b.q.coverage,at,issuance:{issuedAt:at,limits:[]},evidenceId:await proof(`offer:issue:${versionId}:${at}:7`)};
 const register={...common,action:'register' as const,operationId:uid(),expectedRevision:3,versionId,acceptanceId,coverage:b.q.coverage,at,accepterId:b.f.accepterId,designationId:b.f.designationId,channel:'phone',terms:b.q.terms,authorityEvidenceId:await proof(`acceptance:authority:${versionId}:${b.f.accepterId}:${b.f.designationId}`),evidenceId:await proof(`acceptance:agree:${versionId}:${acceptanceId}:${b.f.accepterId}:phone`)};
 const reviewEvidence:Record<string,string>={};for(const aspect of ['prices','availability','conditions','capacity'])reviewEvidence[aspect]=await proof(`offer:review:${versionId}:${acceptanceId}:accept:${aspect}`);
 const verify={...common,action:'verify' as const,operationId:uid(),expectedRevision:4,versionId,acceptanceId,coverage:b.q.coverage,at,reviewEvidence,won:true};
 const hash=(await h.observer`select encode(crm_crypto.digest(convert_to(${JSON.stringify(b.detail)}::text::jsonb::text,'UTF8'),'sha256'),'hex')hash`)[0]!.hash;
 const q={...b.q,proposalId,versionId,acceptanceId,expectedRevision:5,expectedOpportunityRevision:o+2,evidenceId:await proof(`booking:detail:${acceptanceId}:${hash}`),route:'direct' as const};
 const stages:import('../../src/infrastructure/postgres/h2-booking-adapter.ts').DirectStage[]=[{kind:'proposal',command:prepare},{kind:'proposal',command:fix},{kind:'offer',command:issue},{kind:'acceptance',command:register},{kind:'acceptance',command:verify}];return{q,stages};
}
test('H6-016 X02-T01/T02/T03 direct chain rolls back all real stages at deferred boundary then recovers once',async()=>{
 const d=await directChain(),before=await snapshot(h),fault=await injected(h,{final:'b04_history'}as Unit,'F2');
 try{await assert.rejects(h.booking.direct(await h.auth(),write,d.stages,d.q));assert.equal(await fault.reached(),true);assert.deepEqual(await snapshot(h),before);}finally{await fault.clear();}
 await h.booking.direct(await h.auth(),write,d.stages,d.q);const after=await snapshot(h);assert.equal((await h.booking.direct(await h.auth(),write,d.stages,d.q)).id,d.q.bookingId);assert.deepEqual(await snapshot(h),after);assert.equal(Number((await h.observer`select count(*)n from crm_private.b04_bookings where opportunity_id=${d.q.opportunityId}::uuid`)[0]!.n),1);await capture('X02',{rollback:before,retry:after,witness:true});
});

for(const order of [0,1]as const)test(`H6-016 X03-T05 Refund uncertain reservation versus Allocation 80+80 from 100 order ${order}`,async()=>{
 const f=await refundFixture(h,'200.00','100.00');await f.run(await f.determine());await(await f.approval(await f.authorization('100.00'))).execute();
 const inc=await f.incident(),q=await f.command('uncertain',{incidentId:inc.incidentId,attempt:{id:uid(),sourceRef:'SYNTHETIC uncertain local outgoing attempt',portion:await f.portion('80.00')}}),a=await f.a.assign('80.00');
 assert.equal(Number((await h.observer`select count(*)n from crm_private.b05_allocations where payment_id=${f.a.paymentId}::uuid`)[0]!.n),0);
 const rs=await overlap(h,'X03-'+order,'payment-root:'+f.a.paymentId,0,[x=>run(h,'refunds',q,x),x=>run(h,'allocations',a,x)],order);assert.equal(rs[order]!.status,'fulfilled');conflict(rs[order?0:1]!,/CONFLICT|REVISION|VERSION|FUNDS/);
 const rf=await f.view(),fund=await f.a.see();assert.equal(Number(rf.uncertain)+Number(fund.summary.assigned),80);assert.equal(rf.executed,'0.00');await capture('X03-state-'+order,{refund:rf,funds:fund});
});

for(const order of [0,1]as const)test(`H6-016 X04-T07 same outgoing guarantee fact through Deposit and Refund has one canonical movement order ${order}`,async()=>{
 const f=await depositFixture(h);await f.initialize();await f.run(await f.delivery());await f.run(await f.evaluate());await(await f.approval(await f.determination())).execute();
 const q=await f.fact('return','30.00','20.00'),b=await f.attest({...q,operationId:uid()});const opp=String((await h.observer`select opportunity_id from crm_private.b04_bookings where booking_id=${f.bid}::uuid`)[0]!.opportunity_id);
 const rs=await overlap(h,'X04-'+order,opp,31,[a=>run(h,'deposits',q,a),a=>run(h,'refunds',b,a,'applyGuarantee')],order);assert.ok(rs.every(x=>x.status==='fulfilled'));assert.equal((rs[order?0:1]as PromiseFulfilledResult<any>).value.replayed,true);
 const p=await f.view(),rf=await h.refunds.read(await h.auth(),read,f.bid,p.refundId);assert.equal(p.amounts.returned,'30.00');assert.equal(rf.executed,'30.00');assert.equal(Number((await h.observer`select count(*)n from crm_private.b05_refund_movements where refund_id=${p.refundId}::uuid`)[0]!.n),1);assert.equal(Number((await h.observer`select count(*)n from crm_private.b05_customer_payments`)[0]!.n),0);await capture('X04-state-'+order,{deposit:p,refund:rf});
});

test('H6-016 X05-T04/T06 partial operational cancellation remains economically pending until explicit D019 attribution',async()=>{
 const f=await cancellationFixture(h,{scopeKind:'service'}),q=await f.command(),origin=await immutableBooking(h,f.b.bookingId),other=f.detail.services.filter(x=>x.id!==f.scope.id),before=await h.observer`select to_jsonb(s)v from crm_private.b04_services s where booking_id=${f.b.bookingId}::uuid and service_id<>${f.scope.id}::uuid order by service_id`;
 await f.applyOperational();const pending=await f.command({expectedModificationRevision:(await f.m.see())!.revision,expectedScopeToken:await f.token(),facts:{...q.facts!,base:await f.base(null)}});const r=await f.run(pending);
 assert.equal(r.result.computed.status,'pending');assert.equal(r.result.computed.right,null);assert.ok(r.result.computed.missing.includes('base:D019'));assert.equal(Number((await h.observer`select count(*)n from crm_private.b05_refunds where booking_id=${f.b.bookingId}::uuid`)[0]!.n),0);
 await f.run(await f.command({expectedRevision:1,facts:{...q.facts!,cause:'provider',base:await f.base('200.00')}}));assert.equal((await f.see()).computed.right,'200.00');assert.equal((await f.see()).history.length,2);assert.equal((await f.m.see())!.progress,'Aplicada');assert.equal((await f.m.see()as any).economic.status,'pending');
 assert.ok(other.length);assert.deepEqual(await h.observer`select to_jsonb(s)v from crm_private.b04_services s where booking_id=${f.b.bookingId}::uuid and service_id<>${f.scope.id}::uuid order by service_id`,before);assert.deepEqual(await immutableBooking(h,f.b.bookingId),origin);await capture('X05',{determination:await f.see(),modification:await f.m.see(),unaffectedServices:before});
});

test('H6-016 X06-T06 cancellation determination and obligation adjustment rollback together at final boundary',async()=>{
 const f=await cancellationFixture(h),s=await cancellationSchedule(h,f);await f.applyOperational();await f.run(await f.command());
 const original=(await h.obligations.read(await h.auth(),read,f.b.bookingId,s.sid))!.current.snapshot.parts,parts=original.map(p=>({...p,amount:p.slot==='initial'?'50.00':'100.01'})),q=await cancellationApplication(h,f,s.sid,parts),before=await snapshot(h),fault=await injected(h,{final:'b06_cancellation_operations'}as Unit,'F2');
 try{await assert.rejects(f.run(q));assert.equal(await fault.reached(),true);assert.deepEqual(await snapshot(h),before);}finally{await fault.clear();}
 await f.run(q);assert.equal((await f.see()).applied,true);const after=await snapshot(h);assert.equal((await f.run(q)).replayed,true);assert.deepEqual(await snapshot(h),after);await capture('X06',{before,after,determination:await f.see(),obligation:await h.obligations.read(await h.auth(),read,f.b.bookingId,s.sid)});
});

for(const kind of ['incident','refund','invoice','invoice-correction','payment']as const)for(const order of [0,1]as const)test(`H6-016 X07-T10 ${kind} versus joint close order ${order}`,async()=>{
 let bid:string,j:Awaited<ReturnType<typeof jointCommands>>,q:any,adapter:string,resolved=true,origin:any;
 if(kind==='invoice'||kind==='invoice-correction'){
  const f=await invoiceFixture(h);bid=f.bookingId;j=await jointCommands(h,bid);resolved=false;
  if(kind==='invoice-correction'){await h.invoices.apply(await h.auth(),write,await f.need());await h.invoices.apply(await h.auth(),write,await f.receive());await h.invoices.apply(await h.auth(),write,await f.review());await h.invoices.apply(await h.auth(),write,await f.link());}
  q=kind==='invoice'?await f.need():await f.correct();adapter='invoices';
 }else{
  const f=await fixture(h,false);bid=f.bookingId;j=f.j;
  if(kind==='incident'){const x=await incidentFixture(h,undefined,{bookingId:bid,serviceId:f.b.detail.services[0]!.id});q=await x.command('detect',{...x.data,severity:'Importante',impact:{...x.impact,effect:'economic-review'}});adapter='incidents';}
  else if(kind==='refund'){const x=await refundFixture(h);q=await x.command('request',{bookingId:bid,requesterId:f.b.f.accepterId,paymentIds:[f.payment.paymentId],cause:'voluntary',affectedScope:bid});adapter='refunds';}
  else{q=await discrepancy(h,f);adapter='payments';}
 }
 origin=await immutableBooking(h,bid);const prior=await j.c.view(),close=await j.command();
 const rs=await overlap(h,'X07-'+kind+'-'+order,'booking-preparation:'+bid,0,[a=>run(h,'closures',close,a,'close'),a=>run(h,adapter,q,a)],order);
 assert.equal(rs[1]!.status,'fulfilled');if(resolved&&order===0)assert.equal(rs[0]!.status,'fulfilled');else conflict(rs[0]!,resolved?/MATERIAL_CONFLICT/:order===0?/DIMENSION_PENDING/:/MATERIAL_CONFLICT/);
 const v=await j.c.view();assert.equal(v.jointClosure.current,false);assert.equal(v.jointClosure.history.length,resolved&&order===0?1:0);assert.deepEqual(await immutableBooking(h,bid),origin);
 if(resolved){assert.ok(v.invalidations.length);assert.deepEqual(v.assessments.commercial,prior.assessments.commercial);assert.deepEqual(v.assessments.operational,prior.assessments.operational);}
 await capture('X07-state-'+kind+'-'+order,{scope:resolved?'valid internal joint close':'pending external Booking; no claim of valid external joint close',before:prior,after:v,origin});
});

test('H6-016 X08-T11 human merge archive restore retains identities codes histories and independent Bookings',async()=>{
 const b=await bookingFixture(h),c=await bookingFixture(h);await h.booking.apply(await h.auth(),write,b.q);await h.booking.apply(await h.auth(),write,c.q);const before=await h.observer`select booking_id,opportunity_id,detail,chain_snapshot from crm_private.b04_bookings order by booking_id`,codes=await h.observer`select to_jsonb(c)v from crm_private.identity_codes c order by to_jsonb(c)::text`;
 const x=uid(),y=uid();for(const targetId of[x,y])await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId,kind:'contact',expectedVersion:0,sourceRef:'SYNTHETIC contact record',evidenceRef:'SYNTHETIC human verified',reason:'SYNTHETIC human record',verified:true,displayName:'SYNTHETIC H6016 contact'});
 const base={operationId:uid(),targetId:x,kind:'contact' as const,expectedVersion:0,sourceRef:'SYNTHETIC human resolution',evidenceRef:'SYNTHETIC corroboration',reason:'SYNTHETIC explicit human decision'};
 await run(h,'resolution',{...base,action:'merge',relatedId:y});await run(h,'resolution',{...base,operationId:uid(),targetId:y,action:'archive',expectedVersion:0});await run(h,'resolution',{...base,operationId:uid(),targetId:y,action:'restore',expectedVersion:1});
 assert.equal(Number((await h.observer`select count(*)n from crm_private.identity_entities where identity_id in(${x}::uuid,${y}::uuid)`)[0]!.n),2);assert.deepEqual(await h.observer`select booking_id,opportunity_id,detail,chain_snapshot from crm_private.b04_bookings order by booking_id`,before);assert.equal(before.length,2);assert.deepEqual(await h.observer`select to_jsonb(c)v from crm_private.identity_codes c order by to_jsonb(c)::text`,codes);await capture('X08',{entities:await h.observer`select to_jsonb(e)v from crm_private.identity_entities e where identity_id in(${x}::uuid,${y}::uuid)order by identity_id`,history:await h.observer`select to_jsonb(e)v from crm_private.identity_history e where subject_id in(${x}::uuid,${y}::uuid)order by to_jsonb(e)::text`,bookings:before});
});
