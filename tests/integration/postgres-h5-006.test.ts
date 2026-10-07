import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {isolatedCommunications,communicationFixture,read,write} from '../support/h5-communication-isolated.ts';
import {H5005CommunicationAdapter} from '../../src/infrastructure/postgres/h5-communication-adapter.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
let h:Awaited<ReturnType<typeof isolatedCommunications>>;
before(async()=>{h=await isolatedCommunications('crm_h5006',58901);});after(async()=>{await h?.close();});
const capture=async(name:string,value:unknown)=>{if(process.env.H5006_CAPTURE_DIR)await writeFile(`${process.env.H5006_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');};
test('H5-CA/CB/CC/CD/CE/CAA draft prepared exact HA approval does not send',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);let s=await f.see();assert.equal(s.work[0].kind,'draft');assert.equal(s.work[0].prepared,false);assert.equal(s.work[0].approval,null);
 await f.prepare(d);s=await f.see();assert.equal(s.work[0].prepared,true);assert.equal(s.work[0].approval,null);
 const a=await f.approve(d);s=await f.see();assert.equal(s.work[0].approval.proposalId,a.proposal);assert.equal(s.work[0].approval.actor,h.actorId);assert.ok(s.work[0].approval.at);
 assert.equal(s.work.some((x:any)=>x.kind==='sent'),false);assert.equal(s.externalSendEnabled,false);await capture('composition-ha',s);
});
test('H5-CF/CG/CAB changed version preserves historical approval and requires new review',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);await f.approve(d);
 const next={...d,operationId:uid(),workId:uid(),previousId:d.workId,material:{...d.material,content:'Contenido material diferente'}};await f.run(next);
 const s=await f.see();assert.ok(s.work.find((x:any)=>x.work_id===d.workId).approval);assert.equal(s.work.find((x:any)=>x.work_id===next.workId).approval,null);assert.equal(s.work.find((x:any)=>x.work_id===next.workId).prepared,false);
 await assert.rejects(f.run(await f.fact('sent',d.workId)),/COMM_APPROVAL_REQUIRED/);await f.prepare(next);assert.equal((await f.see()).work.find((x:any)=>x.work_id===next.workId).approval,null);await capture('changed-version',await f.see());
});
test('H5-CH/CI incoming starts received and original remains linked without draft',async()=>{
 const f=await communicationFixture(h,'incoming'),s=await f.see();assert.equal(s.record.material.initial_fact,'received');assert.equal(s.record.source_ref,f.originalId);assert.ok(s.record.occurred_at);assert.equal(s.record.material.sender_ref,'synthetic-person');assert.deepEqual(s.work,[]);
 await assert.rejects(f.run(f.draft()),/COMM_DIRECTION_INVALID/);await capture('incoming',s);
});
test('H5-CJ/CK/CL/CM/CAV/CAW/CAX/CAU specific synthetic send reception read response remain independent',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);await f.approve(d);
 const sent=await f.fact('sent',d.workId);await f.run(sent);let s=await f.see();assert.equal(s.work.filter((x:any)=>x.kind==='sent').length,1);assert.equal(s.work.some((x:any)=>x.kind==='received'),false);
 await assert.rejects(f.run({...sent,operationId:uid(),workId:uid(),fact:'received'}),/COMM_PROOF_REQUIRED/);
 for(const kind of ['received','read','response']as const)await f.run(await f.fact(kind));
 s=await f.see();const facts=s.work.filter((x:any)=>['sent','received','read','response'].includes(x.kind));assert.equal(facts.length,4);
 for(const fact of facts){assert.equal(fact.material.synthetic,true);assert.equal(fact.material.businessConfirmation,false);assert.ok(fact.original_id);}
 assert.equal(facts.find((x:any)=>x.kind==='response').material.reviewState,'pending');await capture('facts-independent',s);
});
test('H5-CN/CO/CP/CQ/CR/CT/CAI/CAL original synthetic PLAUD summary note remain distinct',async()=>{
 const f=await communicationFixture(h);for(const kind of ['summary','note']as const)await f.run(f.derive(kind));
 const s=await f.see();assert.equal(s.work.length,2);for(const w of s.work){assert.equal(w.original_id,f.originalId);assert.equal(w.material.origin,'synthetic_automatic');assert.ok(w.material.review);assert.ok(w.material.permissionRef);assert.ok(w.material.authorRef);assert.deepEqual(w.objectConservation,[]);}
 const second=uid();await h.evidence.apply(await h.auth(),write,{action:'link',operationId:uid(),targetId:uid(),originalId:f.originalId,sourceRef:'synthetic-link',purpose:f.context.purpose,contextKind:'contact',contextId:second,coverage:'same original',reason:'Segundo contexto autorizado'});
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where record_id=${f.originalId}::uuid`)[0]!.n,1);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_links where record_id=${f.originalId}::uuid`)[0]!.n,2);await capture('original-derivatives',s);
});
test('H5-CU/CV/CW/CX/CY/CZ/CAQ 18 remains confirmed against perhaps16 with Review Task and source identity',async()=>{
 const f=await communicationFixture(h),p=f.derive();const result=await f.run(p);assert.equal((await f.run(p)).replayed,true);
 assert.equal((await f.run({...p,operationId:uid(),workId:uid()})).id,result.id);
 for(const change of [{content:'quizá 17'},{sourceRef:'synthetic-other-source'}])await f.run({...p,...change,operationId:uid(),workId:uid()});
 const s=await f.see();assert.equal(s.work.length,3);assert.equal(new Set(s.work.map((x:any)=>x.task_id)).size,1);
 for(const w of s.work){assert.equal(w.material.confirmedSnapshot.claim,'18');assert.equal(w.material.reviewState,'pending');assert.ok(w.task_id);}
 assert.equal((await h.observer`select material->>'claim' value from crm_private.b07_records where record_id=${f.confirmedId}::uuid`)[0]!.value,'18');
 const task=(await h.observer`select * from crm_private.b07_pending_tasks where task_id=${s.work[0].task_id}::uuid`)[0]!;assert.equal(task.state,'pending');assert.equal(task.identity.causeKind,'review');
 await capture('candidate-confirmed-review-task',{state:s,task});
});
test('H5-CS manual call Evidence needs no audio or file',async()=>{
 const f=await communicationFixture(h);const id=await f.proof('Llamada sintética registrada');const record=(await h.evidence.read(await h.auth(),read,id,'booking',f.context.contextId)).data as any;
 assert.equal(record.record.material.source_kind,'manual');assert.equal(record.record.material.document_id,undefined);assert.equal(record.record.original_id,null);
});
test('H5-CAT SM-CO-01 guards individually reject absent context recipient source nature content',async()=>{
 const f=await communicationFixture(h);for(const key of ['content','coverage','recipient','nature','origin','sourceRef','pending']){
 const d=f.draft();const material={...d.material}as any;delete material[key];await assert.rejects(f.run({...d,material}));}
 for(const change of [{purpose:'unapproved'},{contextId:uid()},{contextKind:'invalid'},{sourceRef:''}])await assert.rejects(f.run({...f.draft(),...change}));assert.deepEqual((await f.see()).work,[]);
});
test('H5-CAT SM-CO-02 prepared requires current existing draft and visible pending list',async()=>{
 const f=await communicationFixture(h);await assert.rejects(f.run({...f.base(),action:'prepare',versionId:uid()}));
 const d=f.draft();await f.run({...d,material:{...d.material,pending:['Dato sintético pendiente visible']}});await f.prepare(d);
 assert.deepEqual((await f.see()).work[0].material.material.pending,['Dato sintético pendiente visible']);
});
test('H5-CAT SM-CO-03/04 missing exact HA proof recipient scope time prevent sent',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);const p=await f.fact('sent',d.workId);
 await assert.rejects(f.run(p),/COMM_APPROVAL_REQUIRED/);await f.approve(d);
 for(const change of [{evidenceId:uid()},{party:'other'},{coverage:'other'},{at:'2026-10-07T13:00:00Z'},{synthetic:false},{versionId:uid()}])await assert.rejects(f.run({...p,...change,operationId:uid(),workId:uid()}as never));
 assert.equal((await f.see()).work.some((x:any)=>x.kind==='sent'),false);
});
test('H5-CAT SM-CO-05/06 missing source author moment scope or original reject',async()=>{
 const f=await communicationFixture(h,'incoming');for(const kind of ['received','read','response']as const){const p=await f.fact(kind);
 for(const change of [{evidenceId:uid()},{party:''},{coverage:''},{sourceRef:''},{at:''},{recordId:uid()}])await assert.rejects(f.run({...p,...change,operationId:uid(),workId:uid()}));}
 assert.deepEqual((await f.see()).work,[]);
});
test('H5-CAC/CBA/CBB authorized context link never grants foreign actor original or derived permissions',async()=>{
 const f=await communicationFixture(h);const p=f.derive();await f.run(p);
 const foreign=await verifyAuth({verify:async()=>({subject:uid(),sessionId:h.sessionId,passwordVerified:true,mfaVerified:true})},uid());
 await assert.rejects(h.communications.apply(foreign,write,p));await assert.rejects(h.communications.read(foreign,read,f.recordId,f.context));
 assert.equal(await h.communications.read(await h.auth(),read,f.recordId,{...f.context,purpose:'third-party-export'}),null);
 await assert.rejects(f.run({...f.derive(),originalId:uid()}),/COMM_ORIGINAL_DENIED/);
 await assert.rejects(f.run({...f.derive(),confirmedId:uid()}),/COMM_CONFIRMATION_DENIED/);
});
test('H5-CAE/CAF authorized replay then disabled actor rejects read write and previous result',async()=>{
 const f=await communicationFixture(h),p=f.derive();await f.run(p);assert.equal((await f.run(p)).replayed,true);await assert.rejects(f.run({...p,content:'changed'}),/COMM_REPLAY_CONFLICT/);
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
 try{await assert.rejects(f.run(p));await assert.rejects(f.see());}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
});
test('H5-CAD FORCE RLS owners runtime anon authenticated direct SQL deny',async()=>{
 const t='b07_communication_work';const row=(await h.observer`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.b07_communication_work'::regclass`)[0]!;assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);
 for(const role of ['crm_h0_runtime','anon','authenticated']){const sql=h.connect(role);for(const query of [`select * from crm_private.${t}`,`delete from crm_private.${t}`,`update crm_private.${t} set material='{}'`,`insert into crm_private.${t}(material)values('{}')`])await assert.rejects(sql.unsafe(query));}
 await h.admin.begin(async tx=>{await tx.unsafe('set local role crm_h0_f2_owner');assert.equal((await tx.unsafe(`select count(*)::int n from crm_private.${t}`))[0]!.n,0);});
 await assert.rejects(h.runtime.unsafe('select crm_api.b07_communication_apply(null,null,null,null,null)'));
});
for(const table of ['b07_records','b07_pending_tasks','b07_communication_work','b07_history'])test(`H5-CAG internal candidate Review Task rollback at ${table}`,async()=>{
 const f=await communicationFixture(h),p=f.derive();const counts=async()=>{const out:Record<string,number>={};for(const t of ['b07_records','b07_pending_tasks','b07_communication_work','b07_history','b07_operations'])out[t]=(await h.observer.unsafe(`select count(*)::int n from crm_private.${t}`))[0]!.n;return out;};const before=await counts();
 await h.admin.unsafe("create function crm_private.h5006_fail() returns trigger language plpgsql as $$begin raise exception 'H5006_INJECTED';end$$");await h.admin.unsafe(`create trigger h5006_fail before insert on crm_private.${table} for each row execute function crm_private.h5006_fail()`);
 try{await assert.rejects(f.run(p));}finally{await h.admin.unsafe(`drop trigger h5006_fail on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5006_fail()');}
 assert.deepEqual(await counts(),before);await f.run(p);assert.equal((await f.see()).work.length,1);
});
test('H5-CAG deferred commit failure leaves no candidate or Task and retry succeeds',async()=>{
 const f=await communicationFixture(h),p=f.derive();await h.admin.unsafe("create function crm_private.h5006_fail() returns trigger language plpgsql as $$begin raise exception 'H5006_COMMIT';end$$");
 await h.admin.unsafe('create constraint trigger h5006_fail after insert on crm_private.b07_communication_work deferrable initially deferred for each row execute function crm_private.h5006_fail()');
 try{await assert.rejects(f.run(p));}finally{await h.admin.unsafe('drop trigger h5006_fail on crm_private.b07_communication_work');await h.admin.unsafe('drop function crm_private.h5006_fail()');}
 assert.deepEqual((await f.see()).work,[]);assert.equal((await h.observer`select count(*)::int n from crm_private.b07_pending_tasks where identity->>'causeId'=${f.confirmedId}`)[0]!.n,0);await f.run(p);
});
test('H5-CAG T08 existing D039 approval rollback preserves prepared content and no reservation',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);
 await h.admin.unsafe("create function crm_ha.h5006_fail() returns trigger language plpgsql as $$begin raise exception 'H5006_HA_COMMIT';end$$");
 await h.admin.unsafe('create constraint trigger h5006_fail after insert on crm_ha.decisions deferrable initially deferred for each row execute function crm_ha.h5006_fail()');
 try{await assert.rejects(f.approve(d));}finally{await h.admin.unsafe('drop trigger h5006_fail on crm_ha.decisions');await h.admin.unsafe('drop function crm_ha.h5006_fail()');}
 assert.equal((await f.see()).work[0].approval,null);assert.equal((await f.see()).work[0].prepared,true);await f.approve(d);assert.ok((await f.see()).work[0].approval);
 await assert.rejects(h.runtime.unsafe('select * from crm_api.h0_m04_command(null,null,null,null,null)'));
});
test('H5-CAY real two PostgreSQL sessions overlap both orders equivalent and distinct candidates',async()=>{
 const observations=[];
 for(const distinct of [false,true])for(const order of [0,1]){
 const f=await communicationFixture(h),one=f.derive(),two={...one,operationId:uid(),workId:uid(),...(distinct?{content:'quizá 17'}:{})};const commands=order?[two,one]:[one,two];
 await h.admin.unsafe("create function crm_private.h5006_wait() returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7643506);return new;end$$");await h.admin.unsafe('create trigger h5006_wait before insert on crm_private.b07_communication_work for each row execute function crm_private.h5006_wait()');
 let release!:()=>void,ready!:()=>void;const done=new Promise<void>(r=>release=r),held=new Promise<void>(r=>ready=r);
 const holder=h.admin.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock(7643506)');ready();await done;});await held;
 const watcher=h.connect('h2_bootstrap');const wait=async(n:number)=>{for(let i=0;i<120;i++){
 const rows=await watcher.unsafe("select pid,backend_xid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock' and query like '%b07_communication_apply%' order by pid");if(rows.length>=n)return Array.from(rows);await new Promise(r=>setTimeout(r,20));}throw new Error('H5006_OVERLAP_MISSING');};
 const first=f.run(commands[0]!);let second:ReturnType<typeof f.run>|undefined,waiting:unknown[]=[];let results:PromiseSettledResult<unknown>[]=[];
 try{await wait(1);second=f.run(commands[1]!);waiting=await wait(2);}finally{release();await holder;results=await Promise.allSettled(second?[first,second]:[first]);await h.admin.unsafe('drop trigger h5006_wait on crm_private.b07_communication_work');await h.admin.unsafe('drop function crm_private.h5006_wait()');}
 assert.equal(waiting.length,2);assert.equal(results.filter(x=>x.status==='fulfilled').length,2);const s=await f.see();assert.equal(s.work.length,distinct?2:1);assert.equal(new Set(s.work.map((x:any)=>x.task_id)).size,1);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_pending_tasks where identity->>'causeId'=${f.confirmedId}`)[0]!.n,1);observations.push({distinct,order,waiting,results,state:s});
 }await capture('concurrency',observations);
});
test('H5-CAC F1 F2 corruption and wrong interaction cannot write or replay',async()=>{
 const f=await communicationFixture(h),p=f.derive();for(const authority of ['f1','f2']){const bad=new H5005CommunicationAdapter(h.runtime,authority==='f1'?{...h.f1,key:new Uint8Array(32)}:h.f1,authority==='f2'?{...h.f2,key:new Uint8Array(32)}:h.f2);await assert.rejects(bad.apply(await h.auth(),write,p));await assert.rejects(bad.read(await h.auth(),read,f.recordId,f.context));}
 await assert.rejects(h.communications.apply(await h.auth(),read,p));await assert.rejects(h.communications.read(await h.auth(),write,f.recordId,f.context));assert.deepEqual((await f.see()).work,[]);
});
test('H5-CAN/CAM/CAI/CAJ/CAK/CAL/CAO/CAP/CAU forbidden inferred effects and unsupported privacy fields reject',async()=>{
 const f=await communicationFixture(h),p=f.derive();for(const extra of [{audio:'bytes'},{retentionDays:30},{consent:true},{deleteOriginal:true},{provider:'PLAUD'},{send:true},{confirmed:true},{acceptance:true},{providerConfirmation:true},{automaticOverwrite:true}])await assert.rejects(f.run({...p,...extra}as never));
 for(const action of ['send','accept','confirm','delete','anonymize','run_ai','record_audio'])await assert.rejects(f.run({...p,action}as never));assert.deepEqual((await f.see()).work,[]);
});
test('H5-CAH/CR original Storage object absence and missing metadata never become conserved evidence',async()=>{
 const f=await communicationFixture(h),p=f.derive('summary'),bytes=Buffer.from('Transcripción original PLAUD exclusivamente sintética.');
 const {createHash}=await import('node:crypto');const versionId=uid(),rootId=uid();
 await h.objects.prepare(await h.auth(),write,{...f.context,operationId:uid(),versionId,rootId,expectedVersion:0,documentId:f.originalId,digest:createHash('sha256').update(bytes).digest('hex'),size:bytes.length,media:'text/plain',sourceRef:'synthetic-PLAUD',reason:'Conservación autorizada sintética'});
 await f.run(p);let s=await f.see();assert.equal(s.work[0].objectConservation[0].state,'prepared');
 await assert.rejects(h.objects.download(await h.auth(),read,versionId,f.context));
 await h.objects.upload(await h.auth(),read,write,versionId,f.context,bytes,uid());await h.objects.reconcile(await h.auth(),read,write,versionId,f.context,uid());await h.objects.link(await h.auth(),read,write,versionId,f.context,uid());
 assert.deepEqual(Buffer.from(await h.objects.download(await h.auth(),read,versionId,f.context)),bytes);s=await f.see();assert.equal(s.work[0].objectConservation[0].state,'stored');await capture('storage-conservation',s);
});
test('H5-CV new discrepancy after Task closure reopens same need with closure history intact',async()=>{
 const {H5001TaskAdapter}=await import('../../src/infrastructure/postgres/h5-task-adapter.ts');const tasks=new H5001TaskAdapter(h.runtime,h.f1,h.f2);
 const f=await communicationFixture(h),p=f.derive();await f.run(p);const id=(await f.see()).work[0].task_id;
 await tasks.transition(await h.auth(),write,{action:'complete',operationId:uid(),taskId:id,expectedRevision:1,reason:'Revisión previa sintética',result:'Candidato revisado',references:[p.workId]});
 await f.run({...p,operationId:uid(),workId:uid(),content:'quizá 15'});const row=await tasks.read(await h.auth(),read,id,'booking',f.context.contextId);assert.equal(row!.state,'pending');assert.ok(row!.last_closure);assert.equal((await f.see()).work.length,2);
});
test('H5-CT/CAQ AC088 actual synthetic Contact Booking links preserve all canonical business facts',async()=>{
 const {invoiceFixture}=await import('../support/h3-invoice-fixtures.ts');const b=await invoiceFixture(h),f=await communicationFixture(h,'incoming',b.bookingId);
 await h.evidence.apply(await h.auth(),write,{action:'link',operationId:uid(),targetId:uid(),originalId:f.originalId,sourceRef:'synthetic-PLAUD',purpose:f.context.purpose,contextKind:'contact',contextId:b.b.f.accepterId,coverage:'synthetic caller',reason:'Original autorizado en dos contextos'});
 const tables=(await h.observer`select tablename from pg_tables where schemaname='crm_private' and tablename not in ('b07_communication_work','b07_records','b07_links','b07_pending_tasks','b07_operations','b07_history','crm_sessions','identification_epochs') and tablename not like 'f2_%'`).map(x=>x.tablename as string);
 const snapshot=async()=>{const out:Record<string,unknown>={};for(const t of tables)out[t]=await h.observer.unsafe(`select md5(coalesce(string_agg(x::text,',' order by x::text),'')) hash from crm_private."${t}" x`);return out;};
 const before=await snapshot();await f.run(f.derive('summary'));await f.run(f.derive());await f.run(await f.fact('response'));assert.deepEqual(await snapshot(),before);
 const s=await f.see();await capture('actual-contexts-preservation',{bookingId:b.bookingId,contactId:b.b.f.accepterId,tables,before,after:await snapshot(),state:s});
});
test('H5-CAF revoked session cannot replay candidate read derivative or approve content',async()=>{
 const f=await communicationFixture(h),p=f.derive(),d=f.draft();await f.run(p);await f.run(d);await f.prepare(d);const auth=await h.auth();
 await h.admin`update crm_private.crm_sessions set revoked_at=clock_timestamp() where session_id=${h.sessionId}::uuid`;
 try{await assert.rejects(h.communications.apply(auth,write,p));await assert.rejects(h.communications.read(auth,read,f.recordId,f.context));await assert.rejects(f.approve(d));await assert.rejects(h.evidence.read(auth,read,p.workId,'booking',f.context.contextId));}
 finally{await h.admin`update crm_private.crm_sessions set revoked_at=null where session_id=${h.sessionId}::uuid`;}
});
test('H5-CW/CAE identical derived summary replay does not duplicate Document or Review',async()=>{
 const f=await communicationFixture(h),p=f.derive('summary');const first=await f.run(p);assert.equal((await f.run({...p,operationId:uid(),workId:uid()})).id,first.id);assert.equal((await f.see()).work.length,1);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b07_records where original_id=${f.originalId}::uuid`)[0]!.n,1);
});
test('H5-CAA/CAB exact HA rejects other content recipient conditions amount action effect and destination',async()=>{
 const {communicationApproval}=await import('../../src/infrastructure/postgres/h5-communication-adapter.ts');const {fingerprintHumanApprovalMaterial}=await import('../../src/infrastructure/postgres/h0-011-adapter.ts');
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);const exact=communicationApproval(h.scope,f.recordId,d.workId,d.material,d.material.recipient);
 for(const change of [{action:'other'},{contentVersion:uid()},{content:'{}'},{recipient:{state:'value',value:'other'}},{conditions:{state:'value',value:'other'}},{amount:{state:'value',value:'1'}},{effect:'send'},{destination:{state:'value',value:'external'}}]){
 const m={...exact,...change}as typeof exact,p='p-'+uid();await h.tte.propose(await h.auth(),write,p,'ai',m);await h.tte.decide(await h.auth(),write,'d-'+uid(),p,'d-'+uid(),'approved','Otro contenido sintético',fingerprintHumanApprovalMaterial(m));assert.equal((await f.see()).work[0].approval,null);
 }await f.approve(d);assert.ok((await f.see()).work[0].approval);
});
test('H5-CAD/CAV H1 fact path cannot bypass exact approval of composed content',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.prepare(d);const p=await f.fact('sent',d.workId);
 const command={action:'create' as const,operationId:uid(),targetId:uid(),kind:'communication_fact' as const,material:{fact_kind:'sent',evidence_id:p.evidenceId,party_ref:p.party,coverage:p.coverage},originalId:f.recordId,sourceRef:'synthetic-proof',...f.context,occurredAt:p.at,coverage:p.coverage,reason:'Intento por superficie H1'};
 await assert.rejects(h.evidence.apply(await h.auth(),write,command));await f.approve(d);await f.run(p);
 const s=await f.see();assert.equal(s.registeredFacts.length,1);assert.equal(s.registeredFacts[0].record_kind,'communication_fact');assert.equal(s.registeredFacts[0].material.fact_kind,'sent');
});
test('H5-CB/CD/CAT HA before preparation is historical and does not retroactively approve',async()=>{
 const f=await communicationFixture(h),d=f.draft();await f.run(d);await f.approve(d);await f.prepare(d);assert.equal((await f.see()).work[0].approval,null);await assert.rejects(f.run(await f.fact('sent',d.workId)));await f.approve(d);assert.ok((await f.see()).work[0].approval);
});
test('H5-CAV informative human preparation accepts explicit synthetic proof without inventing universal HA',async()=>{
 const f=await communicationFixture(h),original=f.draft(),d={...original,material:{...original.material,nature:'informative' as const,origin:'human' as const}};
 await f.run(d);await f.prepare(d);await f.run(await f.fact('sent',d.workId));const s=await f.see();assert.equal(s.work[0].approval,null);assert.equal(s.work.filter((x:any)=>x.kind==='sent').length,1);assert.equal(s.externalSendEnabled,false);
});
test('H5-CU/CV/CZ normative18 is a real Core Provider Confirmation preserved against candidate16',async()=>{
 const {confirmationFixture}=await import('../support/h4-confirmation-fixtures.ts');const c=await confirmationFixture(h);await c.apply(await c.register({coverage:{...c.coverage,quantity:'18'},content:'SYNTHETIC manual confirmation exactly18'}));
 const before=await c.state();assert.equal(before!.fact.coverage.quantity,'18');const f=await communicationFixture(h,'incoming',c.bookingId);await f.run(f.derive());assert.deepEqual(await c.state(),before);
 const s=await f.see();assert.equal(s.work[0].material.content,'quizá 16');assert.ok(s.work[0].task_id);assert.equal(s.work[0].material.reviewState,'pending');assert.equal((await h.observer`select material->>'certainty' certainty from crm_private.b07_records where record_id=${s.work[0].work_id}::uuid`)[0]!.certainty,'candidate');
 await capture('normative-18',{confirmationBefore:before,confirmationAfter:await c.state(),candidate:s});
});
