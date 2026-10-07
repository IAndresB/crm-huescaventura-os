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
