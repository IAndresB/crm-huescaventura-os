// Expected-v1 was frozen before this executable. All data below is synthetic.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {database,fixture,read,write,businessSnapshot,denyUnchanged,discrepancy,contradict,repair,fault,race,type H,type F} from '../support/h6-007-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
import {secondWorkActor} from '../support/h5-work-isolated.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
let h:H,main:F,spare:F,mainChange:any,oldView:any,oldOther:any,protectedBefore:any,staleClose:any;
const observed:any[]=[],commands:any[]=[];
const check=(id:string,title:string,body:()=>Promise<void>)=>test(`H6-007 ${id} ${title}`,async()=>{try{await body();observed.push({id,result:'PASS'});}catch(e){observed.push({id,result:'FAIL',error:String(e)});throw e;}});
before(async()=>{
 h=await database('h6007_execution_'+process.pid);
 for(const name of ['evidence','booking','payments','allocations','reality','ownEconomics','closures','invoices','suplidos','providerPayments'] as const){const original=h[name];(h as any)[name]=new Proxy(original,{get(target,key){const v=(target as any)[key];if(key!=='apply'&&key!=='close')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{const result=await v.apply(target,args);commands.push({port:name,method:key,command:structuredClone(args[2]),result:structuredClone(result)});return result;}catch(e){commands.push({port:name,method:key,command:structuredClone(args[2]),expectedOrObservedRejection:String(e)});throw e;}};}});}
});
after(async()=>{try{if(process.env.H6007_OUTPUT){await mkdir(process.env.H6007_OUTPUT,{recursive:true});await writeFile(join(process.env.H6007_OUTPUT,'observed.json'),JSON.stringify({base:'9c15e6d143822f7fcc84f29744194554630f4ac4',scope:'synthetic local E2E-07',performancePath:'exceptional reviewed AC-063, not ordinary start/finish',observed,commands},null,2)+'\n');}}finally{await h?.close();}});

check('P01','application facts, three independent assessments and explicit close',async()=>{
 main=await fixture(h);spare=await fixture(h);oldView=await main.j.c.view();oldOther=await spare.j.c.view();
 assert.equal(main.beforeClose.jointClosure.current,false);for(const d of ['commercial','operational','economic'] as const){assert.equal(main.beforeClose.assessments[d]!.currentStatus,'Resuelto');assert.equal(oldView.assessments[d].currentStatus,'Resuelto');}
 assert.equal(oldView.jointClosure.current,true);assert.equal(oldView.jointClosure.history.length,1);assert.equal(oldView.jointClosure.latestClose.actorId,h.actorId);assert.ok(oldView.jointClosure.latestClose.evidenceId);
 assert.equal((await main.j.run(main.close)).replayed,true);
 const reality=await h.observer`select after_data,evidence_id::text from crm_private.b04_reality_events where booking_id=${main.bookingId}::uuid`;
 assert.ok(reality.some(x=>(x.after_data as any).data.exceptional===true));
 protectedBefore=await businessSnapshot(h,'^(b03_|b04_)');staleClose=await main.j.command();
 observed.push({id:'BASE',result:'PASS',bookingId:main.bookingId,paymentId:main.payment.paymentId,acceptanceId:main.b.q.acceptanceId,versionId:main.b.q.versionId,before:oldView,performance:reality});
});
check('A01','later material payment discrepancy invalidates economy only',async()=>{
 mainChange=(await contradict(h,main)).q;const v=await main.j.c.view();
 assert.equal(v.assessments.economic!.status,'Resuelto');assert.equal(v.assessments.economic!.currentStatus,'Pendiente');assert.equal(v.jointClosure.current,false);
 assert.deepEqual(v.assessments.commercial,oldView.assessments.commercial);assert.deepEqual(v.assessments.operational,oldView.assessments.operational);assert.deepEqual(v.jointClosure.history,oldView.jointClosure.history);
 assert.deepEqual(await businessSnapshot(h,'^(b03_|b04_)'),protectedBefore);assert.deepEqual(await spare.j.c.view(),oldOther);
 assert.equal(v.invalidations.length,1);const cause=v.invalidations[0]!.cause as any;assert.equal(cause.sourceTable,'b05_payment_revisions');
 const recorded=await h.observer`select recorded_at from crm_private.b05_payment_revisions where payment_id=${main.payment.paymentId}::uuid and revision=7`;
 const closed=await h.observer`select recorded_at from crm_private.b06_joint_closures where booking_id=${main.bookingId}::uuid`;
 assert.ok(new Date(recorded[0]!.recorded_at as any).getTime()>=new Date(closed[0]!.recorded_at as any).getTime());
 assert.ok(new Date(mainChange.at).getTime()>=new Date(main.close.at).getTime());observed.push({id:'CONTRADICTION',result:'PASS',command:mainChange,view:v});
});
check('A02','founded explicit reopen has one pending assessment and replay',async()=>{
 const q=await main.j.c.command('economic',{}, {action:'reopen',serviceApplicability:await main.j.flags()});const r=await main.j.c.run(q);assert.equal(r.result.status,'Pendiente');const before=await businessSnapshot(h);assert.equal((await main.j.c.run(q)).replayed,true);assert.deepEqual(await businessSnapshot(h),before);
 assert.deepEqual((await main.j.c.view()).jointClosure.history,oldView.jointClosure.history);
});
check('A03','historical basis, cause, actor, evidence and times reconstruct',async()=>{
 const v=await main.j.c.view(),rows=await h.observer`select state,command,actor_id::text,recorded_at from crm_private.b06_closure_assessments where booking_id=${main.bookingId}::uuid order by revision`;
 assert.equal(v.history.length,7);assert.equal(rows.length,7);assert.ok(rows.every(x=>x.actor_id===h.actorId));assert.ok(rows.every(x=>(x.state as any).reason&&(x.state as any).evidenceId));
 assert.deepEqual(v.jointClosure.latestClose,oldView.jointClosure.latestClose);assert.deepEqual(await businessSnapshot(h,'^(b03_|b04_)'),protectedBefore);
 const invalid=v.invalidations[0] as any;assert.ok(invalid.before_basis);assert.ok(invalid.after_basis);assert.notDeepEqual(invalid.before_basis,invalid.after_basis);assert.equal(invalid.cause.sourceRecord.payment_id,main.payment.paymentId);
 observed.push({id:'HISTORY',result:'PASS',view:v,rows});
});
check('A04','canonical projection reflects current and historical closure without mutation',async()=>{
 const before=await businessSnapshot(h);const b:any=await h.booking.read(await h.auth(),read,main.bookingId);assert.equal(b.closureAssessments.jointClosure.current,false);assert.deepEqual(b.closureAssessments.jointClosure.history,oldView.jointClosure.history);
 const adapter=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);for(const surface of ['timeline','calendar'] as const){const v=await adapter.read(await h.auth(),read,{contextKind:'booking',contextId:main.bookingId,surface,destination:'administrator'});assert.equal(v!.mutationAuthority,false);}assert.deepEqual(await businessSnapshot(h),before);
});
check('B01','new informational evidence preserves all closure conditions',async()=>{
 const f=await fixture(h),before=await f.j.c.view();const q=h.req('evidence',{claim:'SYNTHETIC noncontradictory archive note',coverage:f.bookingId,certainty:'reviewed',source_kind:'manual'},f.bookingId,'booking');await h.evidence.apply(await h.auth(),write,{...q,coverage:f.bookingId});assert.deepEqual(await f.j.c.view(),before);
});
check('B02','minor nonmaterial incident does not reopen',async()=>{
 const f=await fixture(h),before=await f.j.c.view(),i=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await i.command('detect',{...i.data,severity:'Leve',impact:{...i.impact,material:false,effect:'preparation'}}));assert.deepEqual(await f.j.c.view(),before);
});
check('C01','duplicate discrepancy replays without new mutation',async()=>{const before=await businessSnapshot(h);const r=await h.payments.apply(await h.auth(),write,mainChange);assert.equal(r.replayed,true);assert.deepEqual(await businessSnapshot(h),before);});
check('C02','same operation with changed material conflicts',async()=>{const q=await main.payment.attest({...mainChange,reason:'SYNTHETIC incompatible replacement'});await denyUnchanged(h,()=>h.auth().then(a=>h.payments.apply(a,write,q)),/REPLAY_CONFLICT/);});
check('C03','same evidence identity has one canonical fact',async()=>{
 const q=h.req('evidence',{claim:'SYNTHETIC exact duplicate note',coverage:main.bookingId,certainty:'reviewed',source_kind:'manual'},main.bookingId,'booking');await h.evidence.apply(await h.auth(),write,q);const before=await businessSnapshot(h);const r:any=await h.evidence.apply(await h.auth(),write,q);assert.equal(r.replayed,true);assert.deepEqual(await businessSnapshot(h),before);assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_id=${q.targetId}::uuid`)[0]!.n,1);
});
check('D01','unfounded explicit reopening rejects',async()=>{const f=await fixture(h),q=await f.j.c.command('economic',{}, {action:'reopen',serviceApplicability:await f.j.flags()});await denyUnchanged(h,()=>f.j.c.run(q),/REOPEN_UNFOUNDED/);});
check('D02','missing evidence cannot cause discrepancy',async()=>{const f=await fixture(h),q=await discrepancy(h,f);await denyUnchanged(h,()=>h.auth().then(a=>h.payments.apply(a,write,{...q,evidenceId:uid()})));});
check('D03','evidence from another root cannot support discrepancy',async()=>{const f=await fixture(h),q=await discrepancy(h,f),other=await discrepancy(h,spare);await denyUnchanged(h,()=>h.auth().then(a=>h.payments.apply(a,write,{...q,evidenceId:other.evidenceId})));});
check('D04','unsupported reviews cannot hide economic pending facts',async()=>{
 const q=await main.j.c.command('economic',{}, {action:'evaluate',serviceApplicability:await main.j.flags()});await main.j.c.run(q);const v=await main.j.c.view();assert.equal(v.assessments.economic!.currentStatus,'Pendiente');assert.equal(v.jointClosure.current,false);assert.deepEqual(v.jointClosure.history,oldView.jointClosure.history);
});
check('D05','stale closure material rejects after discrepancy',async()=>{await denyUnchanged(h,()=>main.j.run(staleClose),/CONFLICT|PENDING/);});
check('E01','copied auth proof is not authentic',async()=>{const f=await fixture(h),q=await discrepancy(h,f),auth=await h.auth();await denyUnchanged(h,()=>h.payments.apply({...auth},write,q),/AUTH_REQUIRED/);await assert.rejects(h.closures.read({...auth},read,f.bookingId),/AUTH_REQUIRED/);});
check('E02','read interaction cannot write',async()=>{const f=await fixture(h),q=await discrepancy(h,f);await denyUnchanged(h,()=>h.auth().then(a=>h.payments.apply(a,read,q)),/AUTH_REQUIRED/);});
check('E03','ordinary runtime cannot forge closure or history directly',async()=>{
 const f=await fixture(h);for(const table of ['b06_closure_assessments','b06_joint_closures','b06_closure_invalidations'])await denyUnchanged(h,()=>h.runtime.unsafe(`delete from crm_private.${table} where booking_id=$1`,[f.bookingId]));
 await denyUnchanged(h,()=>h.runtime.unsafe('select crm_api.closure_apply($1,$2,$3,$4,$5)',[Buffer.alloc(0),Buffer.alloc(32),Buffer.alloc(0),Buffer.alloc(32),Buffer.alloc(0)]));
});
check('E04','disabled actor cannot read, write or obtain committed replay',async()=>{
 const auth=await h.auth();const q=await discrepancy(h,spare);await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,false,'ready')`;
 try{await denyUnchanged(h,()=>h.payments.apply(auth,write,q));await assert.rejects(h.payments.apply(auth,write,mainChange));await assert.rejects(h.closures.read(auth,read,main.bookingId));}finally{await h.migration`select crm_api.set_actor_enabled(${h.actorId}::uuid,true,'ready')`;const fresh=await secondWorkActor(h);h.auth=fresh.auth;}
});
for(const [id,table,deferred] of [['F01','b05_payment_revisions',false],['F02','b05_payment_operations',false],['F03','b06_closure_invalidations',false],['F04','b06_closure_invalidations',true]] as const)check(id,'payment+invalidation rollback at '+table+(deferred?' deferred COMMIT':''),async()=>{
 const f=await fixture(h),q=await discrepancy(h,f),before=await businessSnapshot(h),gate=await fault(h,table,deferred);
 try{await assert.rejects(h.auth().then(a=>h.payments.apply(a,write,q)));assert.equal(await gate.reached(),true);assert.deepEqual(await businessSnapshot(h),before);}finally{await gate.clear();}
 assert.equal((await f.j.c.view()).jointClosure.current,true);const r=await h.payments.apply(await h.auth(),write,q);assert.equal(r.replayed,false);assert.equal((await h.payments.apply(await h.auth(),write,q)).replayed,true);assert.equal((await f.j.c.view()).invalidations.length,1);observed.push({id:id+'-BOUNDARY',result:'PASS',target:table,deferred,reached:true});
});
for(const [id,table,deferred] of [['F05','b06_closure_assessments',false],['F06','b06_closure_operations',false],['F07','b06_closure_operations',true]] as const)check(id,'explicit reopening rollback at '+table+(deferred?' deferred COMMIT':''),async()=>{
 const f=await fixture(h);await contradict(h,f);const q=await f.j.c.command('economic',{}, {action:'reopen',serviceApplicability:await f.j.flags()}),before=await businessSnapshot(h),gate=await fault(h,table,deferred);
 try{await assert.rejects(f.j.c.run(q));assert.equal(await gate.reached(),true);assert.deepEqual(await businessSnapshot(h),before);}finally{await gate.clear();}
 const r=await f.j.c.run(q);assert.equal(r.replayed,false);assert.equal((await f.j.c.run(q)).replayed,true);assert.equal((await f.j.c.view()).assessments.economic!.status,'Pendiente');
});
check('F08','lost response after real commit recovers durable result once',async()=>{
 const f=await fixture(h),q=await discrepancy(h,f);let durable:any;
 await assert.rejects(async()=>{durable=await h.payments.apply(await h.auth(),write,q);throw new Error('SYNTHETIC_ACK_LOST_AFTER_COMMIT');},/ACK_LOST/);
 const before=await businessSnapshot(h),replay=await h.payments.apply(await h.auth(),write,q);assert.equal(replay.replayed,true);assert.deepEqual(replay.result,durable.result);assert.deepEqual(await businessSnapshot(h),before);assert.equal((await f.j.c.view()).invalidations.length,1);
 observed.push({id:'ACK',result:'PASS',transport:'synthetic acknowledgement cut after actual PostgreSQL commit',operationId:q.operationId});
});
check('F09','close first and payment second queue on real Booking root',async()=>{const f=await fixture(h,false);observed.push({id:'RACE-CLOSE-FIRST',result:'PASS',data:await race(h,f,false)});});
check('F10','payment first makes queued stale close conflict',async()=>{const f=await fixture(h,false);observed.push({id:'RACE-SOURCE-FIRST',result:'PASS',data:await race(h,f,true)});});
check('F11','repair does not resurrect old close; reevaluate and close explicitly',async()=>{
 await repair(h,main,mainChange);let v=await main.j.c.view();assert.equal(v.jointClosure.current,false);assert.deepEqual(v.jointClosure.history,oldView.jointClosure.history);
 await main.j.resolve('economic');v=await main.j.c.view();assert.equal(v.assessments.economic!.currentStatus,'Resuelto');assert.equal(v.jointClosure.current,false);
 await main.j.run(await main.j.command());v=await main.j.c.view();assert.equal(v.jointClosure.current,true);assert.equal(v.jointClosure.history.length,2);assert.deepEqual(v.jointClosure.history.slice(0,1),oldView.jointClosure.history);observed.push({id:'RECLOSED',result:'PASS',view:v});
});
check('F12','independent Booking closes while target root is locked',async()=>{const f=await fixture(h,false),other=await fixture(h,false);observed.push({id:'RACE-OTHER',result:'PASS',data:await race(h,f,false,other)});});
check('X01','AC-046 provider paid before invoice, then documentary resolve and discrepancy',async()=>{
 const f=await providerPaymentFixture(h);await h.providerPayments.apply(await h.auth(),write,await f.open());const a=await f.assign();const approval=await f.approval(await f.schedule([await f.portion(a)]));await approval.execute();
 await h.providerPayments.apply(await h.auth(),write,await f.movement([await f.portion(a)],'500.00'));
 assert.equal((await f.view())!.paid,'500.00');assert.notEqual((await f.su.see())!.status,'Documentalmente resuelto');
 await h.suplidos.apply(await h.auth(),write,await f.su.attachInvoice());await h.suplidos.apply(await h.auth(),write,await f.su.command('evaluate'));
 const resolved=(await f.su.see())!;assert.equal(resolved.status,'Documentalmente resuelto');
 const {jointCommands}=await import('../support/h5-joint-closure-fixtures.ts');const j=await jointCommands(h,f.su.bookingId);assert.equal((await j.c.view()).jointClosure.current,false);
 const bad=await f.su.invoice.attest({...await f.su.invoice.correct(),bookingId:f.su.bookingId,expectedRevision:4,affectedServiceIds:[f.basis.serviceId],affectedRecipientId:f.su.basis.clientId,affectedAmount:'500.00'});
 await h.invoices.apply(await h.auth(),write,bad);await h.suplidos.apply(await h.auth(),write,await f.su.command('evaluate'));const pending=(await f.su.see())!;assert.notEqual(pending.status,'Documentalmente resuelto');assert.deepEqual(pending.history.slice(0,resolved.history.length),resolved.history);assert.equal((await f.view())!.paid,'500.00');assert.equal((await j.c.view()).jointClosure.current,false);
 observed.push({id:'SUPPLIER',result:'PASS',paid:'500.00',documentaryBefore:resolved,documentaryAfter:pending,limit:'separate external documentary case; not a fully settled external Booking sale'});
});
