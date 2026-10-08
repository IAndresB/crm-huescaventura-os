import {before,after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedWork,workFixture,secondWorkActor,write} from '../support/h5-work-isolated.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>;
before(async()=>{h=await isolatedWork('crm_h5008',59008);});after(async()=>{await h?.close();});afterEach(async()=>{await h?.closeExecutors();});
test('W01 W02 W11 W43 definition claim exact HA start result',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim() as any,r=await f.run(c);assert.equal(r.state,'claimed');assert.equal((await f.see())!.parts[0].state,'claimed');
 await f.run(f.start(c,r.generation!));assert.equal((await f.see())!.parts[0].state,'contacted');await f.run(f.prove(c.attemptId));const snapshot=(await f.see())!;assert.equal(snapshot.parts[0].state,'succeeded');
 for(const event of snapshot.history){assert.ok(!event.before_state||!('history'in event.before_state));assert.ok(!('history'in event.after_state));}
});
const capture=async(name:string,value:unknown)=>{if(process.env.H5008_CAPTURE_DIR){const{writeFile}=await import('node:fs/promises');await writeFile(`${process.env.H5008_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');}};
const expire=async(attemptId:string)=>h.admin`update crm_private.b08_attempts set lease_until=clock_timestamp()-interval '1 second' where attempt_id=${attemptId}::uuid`;
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function race(table:string,condition:string,first:()=>Promise<unknown>,second:()=>Promise<unknown>){
 if(table!=='@execution')await h.admin.unsafe(`create function crm_private.h5008_gate() returns trigger language plpgsql as $$begin if ${condition} then perform pg_advisory_xact_lock(7645008);end if;return new;end$$`);
 if(table!=='@execution')await h.admin.unsafe(`create trigger h5008_gate before insert or update on crm_private.${table} for each row execute function crm_private.h5008_gate()`);
 let release!:()=>void,ready!:()=>void;const done=new Promise<void>(r=>release=r),held=new Promise<void>(r=>ready=r);
 const holder=h.admin.begin(async tx=>{await tx.unsafe(table==='@execution'?`select pg_advisory_xact_lock(hashtextextended('${condition}',508))`:'select pg_advisory_xact_lock(7645008)');ready();await done;});await held;
 const watcher=h.connect('h2_bootstrap');
 const wait=async(n:number)=>{for(let i=0;i<150;i++){const rows=await watcher.unsafe("select pid,backend_xid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers,query from pg_stat_activity where usename='crm_h0_ha_tx' and wait_event_type='Lock' and query like '%b08_work%' order by pid");if(rows.length>=n)return Array.from(rows).map(({query:_query,...row})=>row);await sleep(20);}throw new Error('WORK_REAL_OVERLAP_MISSING');};
 const one=first();let two:Promise<unknown>|undefined,locks:unknown[]=[],results:PromiseSettledResult<unknown>[]=[];
 // Register handlers immediately so expected rejected commands are never unhandled.
 one.catch(()=>{});
 try{await wait(1);two=second();two.catch(()=>{});locks=await wait(2);}finally{release();await holder;results=await Promise.allSettled(two?[one,two]:[one]);if(table!=='@execution'){await h.admin.unsafe(`drop trigger h5008_gate on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5008_gate()');}await watcher.end({timeout:1});}
 assert.equal(locks.length,2);assert.notEqual((locks[0]as any).pid,(locks[1]as any).pid);return {locks,results};
}
for(const order of [0,1])test(`W03 real A/B competition order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const other=h.executor('synthetic-executor-b'),workers=order?[other,f.worker]:[f.worker,other],commands=[f.claim(),f.claim()];
 const actorB=await secondWorkActor(h);const auths=order?[actorB.auth,h.auth]:[h.auth,actorB.auth];
 const r=await race('b08_attempts',"new.state='claimed'",()=>auths[0]!().then(a=>workers[0]!.apply(a,write,commands[0]!)),()=>auths[1]!().then(a=>workers[1]!.apply(a,write,commands[1]!)));
 assert.equal(r.results.filter(x=>x.status==='fulfilled').length,1);assert.equal((await f.see())!.attempts.length,1);assert.equal((await f.see())!.execution.generation,1);await capture('claim-race-'+order,{...r,snapshot:await f.see()});
});
test('W04 W08 W39 expired before-contact claim recovers with fencing',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,one=await f.run(c);await expire(c.attemptId);
 const two=f.claim()as any,r=await f.run(two);assert.equal(r.generation,2);
 await assert.rejects(f.run(f.start(c,one.generation!)),/WORK_FENCED/);
 await assert.rejects(f.run({...f.base(),action:'renew',attemptId:c.attemptId,generation:1,leaseUntil:new Date(Date.now()+90000).toISOString()}),/WORK_FENCED/);
 await assert.rejects(f.run(f.prove(c.attemptId)),/WORK_NO_CONTACT_ATTEMPT/);
 assert.equal((await f.see())!.attempts[0].state,'expired');await f.run(f.start(two,2));await f.run(f.prove(two.attemptId));await capture('fencing',await f.see());
});
test('W05 W07 W23 timeout retains uncertainty and reserve; manual retry cannot resend',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));await expire(c.attemptId);
 assert.equal((await f.run({...f.base(),action:'recover'})).state,'uncertain');await assert.rejects(f.run(f.claim()),/WORK_NO_SAFE_PENDING_PART/);
 await f.run({...f.base(),action:'review'});await f.run({...f.base(),action:'resume'});await assert.rejects(f.run(f.claim()));
 const s=(await f.see())!;assert.equal(s.parts[0].state,'uncertain');assert.equal((await h.admin`select state from crm_ha.reservations where reservation_id=${s.parts[0].reservation_id}`)[0]!.state,'uncertain');await capture('uncertain-recovery',s);
});
test('W06 W09 W10 W30 late original evidence reconciles once; conflict never overwrites',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));const proof=f.prove(c.attemptId);
 // Simulated provider has accepted, but its response is lost before any result write.
 await expire(c.attemptId);await f.run({...f.base(),action:'recover'});await f.run(proof);const calls=h.inspections();
 assert.equal((await f.run(proof)).replayed,true);assert.equal(h.inspections(),calls);
 assert.equal((await f.run({...proof,operationId:(await import('node:crypto')).randomUUID()})).recognized,true);
 const before=(await f.see())!,oldRef=before.parts[0].result_ref;const contradictory=f.prove(c.attemptId,'failed');assert.equal((await f.run(contradictory)).state,'conflict');
 const after=(await f.see())!;assert.equal(after.parts[0].result_ref,oldRef);assert.equal(after.parts[0].state,'succeeded');
 const events=await h.admin`select event_kind,attempt_id from crm_ha.events where reservation_id=${after.parts[0].reservation_id}`;
 assert.equal(events.filter(x=>x.event_kind==='reconciled-succeeded').length,1);await capture('late-result',{before,after,events});
});
for(const action of ['pause','stop','review']as const)test(`W12 W20 W21 W22 W23 control ${action} preserves HA and attempts`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run({...f.base(),action});
 await assert.rejects(f.run(f.start(c,r.generation!)));await assert.rejects(f.run(f.claim()));
 const before=(await f.see())!;assert.equal(before.attempts.length,1);assert.ok(before.definition.proposal_id);assert.ok(before.execution.task_id);
 if(action==='stop'){
 await assert.rejects(f.run({...f.base(),action:'resume'}));
 // A distinct contacted job is then stopped: uncertainty and late evidence
 // remain attached to its original attempt, while control remains stopped.
 const late=await workFixture(h);await late.run(late.definition);const claimed=late.claim()as any,receipt=await late.run(claimed);await late.run(late.start(claimed,receipt.generation!));const contacted=(await late.see())!;
 await late.run({...late.base(),action:'stop'});assert.deepEqual((await late.see())!.attempts,contacted.attempts);
 await late.run({...late.base(),action:'result',attemptId:claimed.attemptId,outcome:'uncertain',resultRef:'simulated-stopped-timeout'});await assert.rejects(late.run(late.claim()));
 const proof=late.prove(claimed.attemptId);await late.run(proof);assert.equal((await late.run(proof)).replayed,true);const reconciled=(await late.see())!;
 assert.equal(reconciled.execution.control_state,'stopped');assert.equal(reconciled.parts[0].state,'succeeded');assert.equal(reconciled.attempts.length,1);await assert.rejects(late.run({...late.base(),action:'resume'}));await assert.rejects(late.run(late.claim()));
 const events=await h.admin`select event_kind,attempt_id from crm_ha.events where reservation_id=${reconciled.parts[0].reservation_id}`;assert.equal(events.filter(x=>x.event_kind==='reconciled-succeeded').length,1);await capture('stop-after-contact',{contacted,reconciled,events,simulated:true});
 }else{
 await f.run({...f.base(),action:'resume'});await f.run(f.start(c,r.generation!));await f.run({...f.base(),action});await f.run({...f.base(),action:'result',attemptId:c.attemptId,outcome:'uncertain',resultRef:'simulated-timeout'});
 await f.run(f.prove(c.attemptId));assert.equal((await f.see())!.parts[0].state,'succeeded');}
 await capture('control-'+action,await f.see());
});
for(const [name,change]of Object.entries({version:{contentVersion:'synthetic-2'},content:{content:'Cambio material'},recipient:{recipient:{state:'value',value:'synthetic-other'}},scope:{scope:'other'},amount:{amount:{state:'value',value:'30'}},conditions:{conditions:{state:'value',value:'another-condition'}},effect:{effect:'another-effect'}}))test(`W13 W14 W15 W16 W17 changed ${name} never starts`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),material={...f.material,...change,parts:f.material.parts.map(p=>({...p,...change}))};
 await assert.rejects(f.run({...f.start(c,r.generation!),material}as any),/WORK_FENCED_OR_INAPPLICABLE/);assert.equal((await f.see())!.parts[0].state,'claimed');
 assert.equal((await h.admin`select count(*)::int n from crm_ha.reservations where proposal_id=${f.approval.proposalId}`)[0]!.n,0);
});
test('W13 W36 current version change fences old attempt and preserves immutable version history',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),material={...f.material,contentVersion:'synthetic-2',parts:f.material.parts.map(p=>({...p,contentVersion:'synthetic-2'}))};const approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,material,...approval});await assert.rejects(f.run(f.start(c,r.generation!)));
 const versions=await h.admin`select version,material from crm_private.b08_definitions where definition_id=${f.definitionId}::uuid order by version`;assert.equal(versions.length,2);assert.deepEqual(versions[0]!.material,f.material);await capture('versions',versions);
});
test('W18 expired evidence denies before reservation',async()=>{
 const f=await workFixture(h);const material={...f.material,evidence:{reference:'simulated-stale',fingerprint:'f'.repeat(64),expiresAt:new Date(Date.now()-60000).toISOString()}};const approval=await f.approve(material);await f.run({...f.definition,material,...approval});const c=f.claim()as any,r=await f.run(c);
 const w=h.executor('synthetic-executor-a',{evidenceProvider:{revalidate:async()=>({reference:material.evidence.reference,fingerprint:material.evidence.fingerprint,checkedAt:new Date().toISOString(),validUntil:new Date(Date.now()+60000).toISOString(),verifierKind:'simulated',verifierIdentity:'synthetic-verifier',outcome:'verified'})}});
 await assert.rejects(f.run({...f.start(c,r.generation!),material}as any,w),/EVIDENCE_REVALIDATION_DENIED/);assert.equal((await f.see())!.parts[0].state,'claimed');
});
test('W19 W24 W25 two parts consume only accredited; rest pending or uncertain never repeats first',async()=>{
 const f=await workFixture(h,2);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));await f.run(f.prove(c.attemptId));let s=(await f.see())!;assert.deepEqual(s.parts.map(p=>p.state),['succeeded','pending']);
 const next=f.claim()as any,t=await f.run(next);assert.equal(t.partId,'part-2');await f.run(f.start(next,t.generation!));await f.run({...f.base(),action:'result',attemptId:next.attemptId,outcome:'uncertain',resultRef:'simulated-timeout'});
 await assert.rejects(f.run(f.claim()));s=(await f.see())!;assert.deepEqual(s.parts.map(p=>p.state),['succeeded','uncertain']);
 assert.deepEqual((await h.admin`select state from crm_ha.reservations where proposal_id=${f.approval.proposalId} order by part_id`).map(x=>x.state),['consumed','uncertain']);await capture('partial',s);
});
test('W26 W27 definition and claim replays; conflicting operation identity denied',async()=>{
 const f=await workFixture(h);await f.run(f.definition);assert.equal((await f.run(f.definition)).replayed,true);await assert.rejects(f.run({...f.definition,inputsRef:'different'}),/WORK_REPLAY_CONFLICT/);
 const c=f.claim(),r=await f.run(c);assert.deepEqual(await f.run(c),{...r,replayed:true});await assert.rejects(f.run({...c,reason:'different'}),/WORK_REPLAY_CONFLICT/);assert.equal((await f.see())!.attempts.length,1);
});
test('W31 W32 W33 W34 W35 W36 actor context purpose, corrupted authority and FORCE RLS',async()=>{
 const {verifyAuth}=await import('../../src/application/verified-auth.ts');const {read,write}=await import('../support/h5-work-isolated.ts');const f=await workFixture(h);await f.run(f.definition);
 await assert.rejects(f.worker.read(await h.auth(),read,f.executionId,{...f.context,purpose:'foreign-purpose'}));await assert.rejects(f.worker.read(await h.auth(),read,f.executionId,{...f.context,contextId:(await import('node:crypto')).randomUUID()}));
 await assert.rejects(f.worker.apply({}as any,write,f.claim()));await assert.rejects(f.worker.apply(await h.auth(),read,f.claim()));
 const foreign=await verifyAuth({verify:async()=>({subject:(await import('node:crypto')).randomUUID(),sessionId:h.sessionId,passwordVerified:true,mfaVerified:true})},'synthetic-foreign');await assert.rejects(f.worker.read(foreign,read,f.executionId,f.context));
 for(const field of ['capability','humanAuthorization']){const bad=h.executor('synthetic-executor-a',{[field]:{...(field==='capability'?h.f1:h.f2),key:new Uint8Array(32)}});await assert.rejects(f.run(f.claim(),bad));}
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;try{await assert.rejects(f.run(f.definition));await assert.rejects(f.see());}finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
 await h.admin`update crm_private.crm_sessions set revoked_at=clock_timestamp() where session_id=${h.sessionId}::uuid`;try{await assert.rejects(f.run(f.definition));await assert.rejects(f.see());}finally{await h.admin`update crm_private.crm_sessions set revoked_at=null where session_id=${h.sessionId}::uuid`;}
 const tables=['b08_definitions','b08_executions','b08_parts','b08_attempts','b08_command_results'];
 for(const table of tables){const [row]=await h.observer.unsafe(`select relrowsecurity,relforcerowsecurity from pg_class where oid='crm_private.${table}'::regclass`);assert.equal(row!.relrowsecurity,true);assert.equal(row!.relforcerowsecurity,true);
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){const sql=h.connect(role);await assert.rejects(sql.unsafe(`select * from crm_private.${table}`));await assert.rejects(sql.unsafe(`delete from crm_private.${table}`));await assert.rejects(sql.unsafe(`update crm_private.${table} set admin_scope='foreign'`));await sql.end({timeout:1});}
 await h.admin.begin(async tx=>{await tx.unsafe('set local role crm_h0_f2_owner');assert.equal((await tx.unsafe(`select count(*)::int n from crm_private.${table}`))[0]!.n,0);});}
 await assert.rejects(h.runtime.unsafe('select crm_api.b08_work_apply(null,null,null,null,null,null)'));
 const general=h.executor('synthetic-executor-a',{databaseUrl:'postgresql://crm_h0_runtime@127.0.0.1:59008/crm_h5008'});await assert.rejects(f.run(f.claim(),general));
 const roles=await h.admin`select rolname,rolsuper,rolbypassrls from pg_roles where rolname in ('crm_h0_runtime','crm_h0_ha_tx','crm_h0_f2_owner','crm_h0_f2_executor')`;assert.ok(roles.every(x=>!x.rolsuper&&!x.rolbypassrls));await capture('security',{tables,roles,snapshot:await f.see()});
});
test('W37 W38 W40 persistent failure uses existing CRM alert and unavailable WhatsApp with pending parameters',async()=>{
 const {randomUUID}=await import('node:crypto');const f=await workFixture(h);await f.run(f.definition);const alertId=randomUUID();await f.run({...f.base(),action:'persistent_failure',alertId,urgency:'critical'});
 const [a]=await h.observer`select * from crm_private.b07_alerts where alert_id=${alertId}::uuid`;assert.equal(a!.material.urgency,'critical');assert.equal(a!.responsible_actor,h.actorId);assert.ok(a!.missing_parameters.includes('retryLimit'));
 const notices=await h.observer`select channel,delivery_state from crm_private.b07_notifications where alert_id=${alertId}::uuid order by channel`;assert.deepEqual(notices.map(x=>[x.channel,x.delivery_state]),[['crm','visible'],['whatsapp','unavailable']]);await capture('failure-alert',{alert:a,notices});
});
test('W44 result request without verifiable attempt evidence cannot consume',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));
 await assert.rejects(f.run({...f.base(),action:'result',attemptId:c.attemptId,outcome:'succeeded',resultRef:'invented'}),/WORK_RESULT_EVIDENCE_REQUIRED/);assert.equal((await f.see())!.parts[0].state,'contacted');
});
for(const order of [0,1])test(`W45 real pause versus start order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,claimed=await f.run(c),other=h.executor('synthetic-executor-a');const start=()=>f.run(f.start(c,claimed.generation!),other),pause=()=>f.run({...f.base(),action:'pause'});
 const r=await race(order?'b08_executions':'b08_attempts',order?"new.control_state='paused'":"new.state='contacted'",order?pause:start,order?start:pause);
 assert.equal(r.results[0]!.status,'fulfilled');assert.equal(r.results[1]!.status,order?'rejected':'fulfilled');const s=(await f.see())!;assert.equal(s.parts[0].state,order?'claimed':'contacted');assert.equal(s.execution.control_state,'paused');await capture('pause-start-race-'+order,{...r,snapshot:s});
});
for(const order of [0,1])test(`W46 real recovery versus late result order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));await expire(c.attemptId);const proof=f.prove(c.attemptId),other=h.executor('synthetic-executor-b');
 const recovery=()=>f.run({...f.base(),action:'recover'},other),result=()=>f.run(proof);
 const seen=await race('b08_attempts',"new.state in ('uncertain','succeeded')",order?result:recovery,order?recovery:result);assert.equal(seen.results.filter(x=>x.status==='fulfilled').length,2);
 const s=(await f.see())!;assert.equal(s.parts[0].state,'succeeded');assert.equal(s.attempts.length,1);const events=await h.admin`select event_kind from crm_ha.events where reservation_id=${s.parts[0].reservation_id}`;assert.equal(events.filter(x=>['succeeded','reconciled-succeeded'].includes(x.event_kind)).length,1);await capture('recovery-result-race-'+order,{...seen,snapshot:s,events});
});
test('W12 exact approval applicability withdrawal survives resume, history remains approved',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run({...f.base(),action:'withdraw_approval',...f.approval});
 await assert.rejects(f.run(f.start(c,r.generation!)));await assert.rejects(f.run({...f.base(),action:'resume'}));
 assert.equal((await h.admin`select decision from crm_ha.decisions where decision_id=${f.approval.decisionId}`)[0]!.decision,'approved');assert.ok((await f.see())!.execution.approval_withdrawn_at);await capture('withdrawal',await f.see());
});
for(const order of [0,1])test(`W45 real exact approval withdrawal versus start order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),actor=await secondWorkActor(h),other=h.executor('synthetic-executor-a');
 const start=()=>f.run(f.start(c,r.generation!)),withdraw=()=>actor.auth().then(a=>other.apply(a,write,{...f.base(),action:'withdraw_approval',...f.approval}));
 const seen=await race(order?'b08_executions':'b08_attempts',order?"new.approval_withdrawn_at is not null":"new.state='contacted'",order?withdraw:start,order?start:withdraw);
 assert.equal(seen.results[0]!.status,'fulfilled');assert.equal(seen.results[1]!.status,order?'rejected':'fulfilled');assert.equal((await f.see())!.parts[0].state,order?'claimed':'contacted');await capture('withdrawal-start-race-'+order,{...seen,snapshot:await f.see()});
});
test('W40 unavailable simulated channel remains pending; no effect inferred',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);const w=h.executor('synthetic-executor-a',{resultVerifier:{checkEffect:async(request:any)=>({...request,availability:'unavailable',priorEffect:'none',sourceKind:'simulated',verifierIdentity:'synthetic-verifier',observationRef:'synthetic-unavailable'}),inspect:async()=>undefined}});
 await assert.rejects(f.run(f.start(c,r.generation!),w),/WORK_CHANNEL_UNAVAILABLE/);assert.equal((await f.see())!.parts[0].state,'claimed');
});
test('W41 restored pre-contact state suspends effects when durable simulated source says previous effect',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);
 // Pre-contact restored snapshot deliberately lacks a contact marker. The
 // independent simulated durable source remembers the accepted effect.
 const w=h.executor('synthetic-executor-a',{resultVerifier:{checkEffect:async(request:any)=>({...request,availability:'available',priorEffect:'succeeded',sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider',observationRef:'synthetic-previous-timeline-effect'}),inspect:async()=>undefined}});
 await assert.rejects(f.run(f.start(c,r.generation!),w),/WORK_PRIOR_EFFECT_REVIEW_REQUIRED/);assert.equal((await f.see())!.parts[0].state,'claimed');await capture('restore-barrier',{snapshot:await f.see(),providerRemembersEffect:true,contactCount:0,integralH6RestoreAccredited:false});
});
const atomicTables=['crm_private.b08_definitions','crm_private.b08_executions','crm_private.b08_parts','crm_private.b08_attempts','crm_private.b08_command_results','crm_private.b07_operations','crm_private.b07_history','crm_private.b07_pending_tasks','crm_ha.reservations','crm_ha.events','crm_ha.command_receipts','crm_private.unit_roots','crm_private.unit_operations','crm_private.unit_history','crm_private.unit_results','crm_private.unit_attempts','crm_ha.evidence_revalidations','crm_private.external_effect_records','crm_private.identification_epochs','crm_f1.consumption'];
async function atomicSnapshot(){const result:Record<string,unknown>={};for(const t of atomicTables)result[t]=Array.from(await h.admin.unsafe(`select to_jsonb(x) value from ${t} x order by to_jsonb(x)::text`));return result;}
for(const [action,table]of [['claim','b08_attempts'],['claim','b08_executions'],['claim','b07_operations'],['claim','b07_history'],['start','b08_attempts'],['start','b07_history'],['result','b08_parts'],['result','b07_operations']]as const)test(`W28 W29 W30 rollback ${action} at ${table}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any;let command:any=c;
 if(action!=='claim'){const r=await f.run(c);command=f.start(c,r.generation!);if(action==='result'){await f.run(command);command=f.prove(c.attemptId);}}
 const before=await atomicSnapshot();await h.admin.unsafe("create function crm_private.h5008_fail() returns trigger language plpgsql as $$begin raise exception 'WORK_INJECTED_ROLLBACK';end$$");await h.admin.unsafe(`create trigger h5008_fail before insert or update on crm_private.${table} for each row execute function crm_private.h5008_fail()`);
 try{await assert.rejects(f.run(command));}finally{await h.admin.unsafe(`drop trigger h5008_fail on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5008_fail()');}
 assert.deepEqual(await atomicSnapshot(),before);await f.run(command);await capture('rollback-'+action+'-'+table,{tables:atomicTables,preserved:true,retry:'PASS'});
});
test('W29 W47 deferred final work fails whole T08; retry same identity succeeds',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),command=f.start(c,r.generation!);const before=await atomicSnapshot();
 await h.admin.unsafe("create function crm_private.h5008_deferred() returns trigger language plpgsql as $$begin raise exception 'WORK_DEFERRED_COMMIT';end$$");await h.admin.unsafe('create constraint trigger h5008_deferred after update on crm_private.b08_attempts deferrable initially deferred for each row execute function crm_private.h5008_deferred()');
 try{await assert.rejects(f.run(command));}finally{await h.admin.unsafe('drop trigger h5008_deferred on crm_private.b08_attempts');await h.admin.unsafe('drop function crm_private.h5008_deferred()');}
 assert.deepEqual(await atomicSnapshot(),before);
 // A required final reauthorization must be reached after every delegated write.
 const [{definition}]=await h.admin.unsafe("select pg_get_functiondef('crm_api.b08_ha_finalize(bytea,bytea,bytea)'::regprocedure) definition");
 await h.admin.unsafe("create or replace function crm_api.b08_ha_finalize(f2p bytea,f2s bytea,q bytea) returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$begin raise exception 'WORK_ORIGINAL_RESERVE_FINAL_CHECK';end$$");
 try{await assert.rejects(f.run(command),/WORK_ORIGINAL_RESERVE_FINAL_CHECK/);}finally{await h.admin.unsafe(definition);}
 assert.deepEqual(await atomicSnapshot(),before);await f.run(command);await capture('deferred-rollback',{tables:atomicTables,preserved:true,originalReserveFinalCheckReached:true,retry:'PASS'});
});
test('W18 W29 W47 evidence expires during deferred wait; final check rolls back all T08',async()=>{
 const f=await workFixture(h);const until=new Date(Date.now()+5000).toISOString(),material={...f.material,evidence:{reference:'simulated-short-evidence',fingerprint:'a'.repeat(64),expiresAt:until}};const approval=await f.approve(material);await f.run({...f.definition,material,...approval});const c=f.claim()as any,r=await f.run(c),command={...f.start(c,r.generation!),material}as any;
 const w=h.executor('synthetic-executor-a',{evidenceProvider:{revalidate:async()=>({reference:material.evidence.reference,fingerprint:material.evidence.fingerprint,checkedAt:new Date().toISOString(),validUntil:until,verifierIdentity:'synthetic-verifier',verifierKind:'simulated',outcome:'verified'})}});const before=await atomicSnapshot();
 await h.admin.unsafe("create function crm_private.h5008_wait_end() returns trigger language plpgsql as $$begin perform pg_sleep(5.3);return new;end$$");await h.admin.unsafe('create constraint trigger h5008_wait_end after update on crm_private.b08_attempts deferrable initially deferred for each row execute function crm_private.h5008_wait_end()');
 try{await assert.rejects(f.run(command,w));}finally{await h.admin.unsafe('drop trigger h5008_wait_end on crm_private.b08_attempts');await h.admin.unsafe('drop function crm_private.h5008_wait_end()');}
 assert.deepEqual(await atomicSnapshot(),before);await capture('expired-final-check',{rollbackPreserved:true,deadline:until});
});
for(const phase of ['before_contact','during_contact','after_effect'])test(`W02 W04 W05 W06 W09 W42 real child process crash ${phase} and restart`,async()=>{
 const {mkdtemp,rm}=await import('node:fs/promises'),{tmpdir}=await import('node:os'),{join}=await import('node:path'),{spawnSync}=await import('node:child_process');
 const directory=await mkdtemp(join(tmpdir(),'crm-work-simulated-provider-')),providerFile=join(directory,'fact.json');const f=await workFixture(h);await f.run(f.definition);
 const config={databaseUrl:'postgresql://crm_h0_ha_tx@127.0.0.1:59008/crm_h5008',ssl:false,capability:{...h.f1,key:Array.from(h.f1.key)},humanAuthorization:{...h.f2,key:Array.from(h.f2.key)},executorId:'synthetic-executor-a'};
 const runChild=(mode:string,command?:unknown,fact?:unknown)=>{const r=spawnSync(process.execPath,['--experimental-strip-types','tests/support/h5-work-restart.ts'],{input:JSON.stringify({mode,command,fact,providerFile,config,auth:{subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:true},executionId:f.executionId,context:f.context}),encoding:'utf8',timeout:15000});assert.equal(r.error,undefined);return {status:r.status,stderr:r.stderr,data:r.stdout.trim()?JSON.parse(r.stdout):null};};
 try{
 const c=f.claim()as any;let generation:number;
 if(phase==='before_contact'){const child=runChild('crash_before_contact',c);assert.equal(child.status,71,child.stderr);generation=child.data.result.generation;
 const restarted=runChild('read');assert.equal(restarted.status,0,restarted.stderr);assert.equal(restarted.data.result.attempts[0].state,'claimed');await expire(c.attemptId);const next=f.claim()as any,r=await f.run(next);assert.ok(r.generation!>generation);await f.run(f.start(next,r.generation!));await capture('process-'+phase,{child,restarted,reclaimed:r});
 }else{
 const claimed=await f.run(c);generation=claimed.generation!;const proof=f.prove(c.attemptId);h.observations.delete(c.attemptId);
 const fact={executionId:f.executionId,attemptId:c.attemptId,outcome:'succeeded',resultRef:proof.resultRef,sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider'};
 const child=runChild('crash_'+phase,f.start(c,generation),fact);assert.equal(child.status,phase==='during_contact'?72:73,child.stderr);
 const restarted=runChild('read');assert.equal(restarted.status,0,restarted.stderr);assert.equal(restarted.data.result.attempts[0].state,'contacted');await expire(c.attemptId);await f.run({...f.base(),action:'recover'});await assert.rejects(f.run(f.claim()));
 if(phase==='after_effect'){const reconciled=runChild('apply',proof);assert.equal(reconciled.status,0,reconciled.stderr);assert.equal((await f.see())!.parts[0].state,'succeeded');const replay=runChild('apply',proof);assert.equal(replay.status,0,replay.stderr);assert.equal(replay.data.result.replayed,true);await capture('process-'+phase,{child,restarted,reconciled,replay});}
 else{assert.equal((await f.see())!.parts[0].state,'uncertain');await capture('process-'+phase,{child,restarted,snapshot:await f.see()});}
 }
 }finally{await rm(directory,{recursive:true,force:true});}
});
test('W08 W19 W39 safe accredited failure allows different executor; old late result cannot overwrite successor',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));await f.run(f.prove(c.attemptId,'failed'));
 const other=h.executor('synthetic-executor-b'),next=f.claim()as any,n=await f.run(next,other);await f.run(f.start(next,n.generation!),other);await f.run(f.prove(next.attemptId),other);const before=(await f.see())!;
 assert.equal((await f.run(f.prove(c.attemptId))).state,'conflict');const after=(await f.see())!;assert.equal(after.parts[0].result_ref,before.parts[0].result_ref);assert.equal(after.parts[0].state,'succeeded');assert.equal(after.attempts.length,2);await capture('old-generation-late-result',{before,after});
});
test('W30 W47 real PostgreSQL COMMIT acknowledgement withheld by simulated wire fault; identity recovers durable result',async()=>{
 const {commitResponseLoss}=await import('../support/h5-work-response-loss.ts');const {WorkCommitUncertainError}=await import('../../src/infrastructure/postgres/persisted-work-executor.ts');
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));const proof=f.prove(c.attemptId),relay=await commitResponseLoss(59008),w=h.executor('synthetic-executor-a',{databaseUrl:`postgresql://crm_h0_ha_tx@127.0.0.1:${relay.port}/crm_h5008`});
 try{await assert.rejects(f.run(proof,w),e=>e instanceof WorkCommitUncertainError&&e.operationId===proof.operationId);assert.equal(relay.dropped(),true);assert.equal((await f.see())!.parts[0].state,'succeeded');const checks=h.inspections();assert.equal((await f.run(proof,w)).replayed,true);assert.equal(h.inspections(),checks);await capture('commit-response-loss',{withheldRealServerCommitAck:true,simulatedWireFault:true,recoveredByIdentity:true,snapshot:await f.see()});}finally{await w.close();await relay.close();}
});
for(const order of [0,1])test(`W45 real version/content change versus start order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),material={...f.material,contentVersion:'synthetic-version-2',content:'Nuevo contenido',parts:f.material.parts.map(p=>({...p,contentVersion:'synthetic-version-2',content:'Nuevo contenido'}))};
 const approval=await f.approve(material),other=h.executor('synthetic-executor-a');const start=()=>f.run(f.start(c,r.generation!)),revise=()=>f.run({...f.definition,...f.base(),action:'revise',version:2,material,...approval},other);
 const seen=await race(order?'b08_executions':'b08_attempts',order?'new.version=2':"new.state='contacted'",order?revise:start,order?start:revise);
 assert.equal(seen.results[0]!.status,'fulfilled');assert.equal(seen.results[1]!.status,'rejected');const s=(await f.see())!;assert.equal(s.execution.version,order?2:1);assert.equal(s.attempts[0].state,order?'expired':'contacted');await capture('version-start-race-'+order,{...seen,snapshot:s});
});
for(const order of [0,1])test(`W46 real recovery versus expired old executor order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await expire(c.attemptId);const other=h.executor('synthetic-executor-a');
 const start=()=>f.run(f.start(c,r.generation!)),recover=()=>f.run({...f.base(),action:'recover'},other);
 const seen=await race('@execution',f.executionId,order?recover:start,order?start:recover);assert.equal(seen.results[order?0:1]!.status,'fulfilled');assert.equal(seen.results[order?1:0]!.status,'rejected');assert.equal((await f.see())!.attempts[0].state,'expired');const next=await f.run(f.claim());assert.equal(next.generation,2);await capture('recovery-old-executor-race-'+order,{...seen,reclaimed:next,snapshot:await f.see()});
});
