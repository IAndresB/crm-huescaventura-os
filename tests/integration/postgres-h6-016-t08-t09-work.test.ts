// Selected H5-008 assertions retained; full68 bootstrap, live Booking context and independent resources are declared derivatives.
import {before,after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedWork,workFixture,secondWorkActor,write,read,capture,preserveBookings} from '../support/h6-016-t08-t09.ts';
let h:Awaited<ReturnType<typeof isolatedWork>>;
before(async()=>{h=await isolatedWork('h6016_work_author_'+process.pid);});after(async()=>{await h?.close();});afterEach(async()=>{await preserveBookings(h);await h?.closeExecutors();});
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
async function waitForExpiry(until:string){
 for(let i=0;i<400;i++){const [row]=await h.admin`select clock_timestamp()::text observed_at,${until}::timestamptz<=clock_timestamp() expired`;if(row!.expired)return row;await sleep(25);}
 throw new Error('NATURAL_POSTGRES_EXPIRY_NOT_REACHED');
}
async function waitForLease(attemptId:string){
 const [before]=await h.admin`select lease_until::text deadline,lease_until>clock_timestamp() still_valid from crm_private.b08_attempts where attempt_id=${attemptId}::uuid`;
 assert.equal(before!.still_valid,true);const elapsed=await waitForExpiry(before!.deadline);
 const [after]=await h.admin`select lease_until::text deadline from crm_private.b08_attempts where attempt_id=${attemptId}::uuid`;assert.equal(after!.deadline,before!.deadline);
 await capture('natural-lease-'+attemptId,{attemptId,deadline:before!.deadline,...elapsed,leaseValueUnmodified:true});
}
const rejection=(result:PromiseSettledResult<unknown>)=>result.status==='rejected'?{message:String(result.reason?.message),code:String(result.reason?.code)}:null;
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
const atomicTables=['crm_private.b08_definitions','crm_private.b08_executions','crm_private.b08_parts','crm_private.b08_attempts','crm_private.b08_command_results','crm_private.b07_operations','crm_private.b07_history','crm_private.b07_pending_tasks','crm_ha.reservations','crm_ha.events','crm_ha.command_receipts','crm_private.unit_roots','crm_private.unit_operations','crm_private.unit_history','crm_private.unit_results','crm_private.unit_attempts','crm_ha.evidence_revalidations','crm_private.external_effect_records','crm_private.identification_epochs','crm_f1.consumption'];
async function atomicSnapshot(){const result:Record<string,unknown>={};for(const t of atomicTables)result[t]=Array.from(await h.admin.unsafe(`select to_jsonb(x) value from ${t} x order by to_jsonb(x)::text`));return result;}
function assertAuthorizedReplayPreserved(before:Record<string,unknown>,after:Record<string,unknown>,sessionId:string){
 for(const table of atomicTables){
  if(table!=='crm_private.identification_epochs'){assert.deepEqual(after[table],before[table],table);continue;}
  const a=after[table]as{value:Record<string,any>}[],b=before[table]as{value:Record<string,any>}[];assert.equal(a.length,b.length);
  for(let i=0;i<b.length;i++){const old=b[i]!.value,next=a[i]!.value;if(old.session_id!==sessionId){assert.deepEqual(next,old);continue;}
   const {last_human_activity_at:oldActivity,...oldFields}=old,{last_human_activity_at:nextActivity,...nextFields}=next;
   assert.deepEqual(nextFields,oldFields);assert.ok(Date.parse(nextActivity)>=Date.parse(oldActivity),'current authorization may renew only its human activity timestamp');
  }
 }
}
for(const order of [0,1])test(`W03 real A/B competition order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);assert.equal((await f.see())!.attempts.length,0);await capture('absent-child-'+order,{executionId:f.executionId,attempts:0,bookingId:f.context.contextId});const other=h.executor('synthetic-executor-b'),workers=order?[other,f.worker]:[f.worker,other],commands=[f.claim(),f.claim()];
 const actorB=await secondWorkActor(h);const auths=order?[actorB.auth,h.auth]:[h.auth,actorB.auth];
 const r=await race('b08_attempts',"new.state='claimed'",()=>auths[0]!().then(a=>workers[0]!.apply(a,write,commands[0]!)),()=>auths[1]!().then(a=>workers[1]!.apply(a,write,commands[1]!)));
 assert.equal(r.results.filter(x=>x.status==='fulfilled').length,1);const loser=r.results.find(x=>x.status==='rejected')!;assert.equal(rejection(loser)!.message,'WORK_LEASE_HELD');assert.equal((await f.see())!.attempts.length,1);assert.equal((await f.see())!.execution.generation,1);await capture('claim-race-'+order,{...r,rejectedReason:rejection(loser),snapshot:await f.see()});
});

test('W04 W08 W39 expired before-contact claim recovers with fencing',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim(2)as any,one=await f.run(c);await waitForLease(c.attemptId);
 const two=f.claim()as any,r=await f.run(two);assert.equal(r.generation,2);
 await assert.rejects(f.run(f.start(c,one.generation!)),/WORK_FENCED/);
 await assert.rejects(f.run({...f.base(),action:'renew',attemptId:c.attemptId,generation:1,leaseUntil:new Date(Date.now()+90000).toISOString()}),/WORK_FENCED/);
 await assert.rejects(f.run(f.prove(c.attemptId)),/WORK_NO_CONTACT_ATTEMPT/);
 assert.equal((await f.see())!.attempts[0].state,'expired');await f.run(f.start(two,2));await f.run(f.prove(two.attemptId));await capture('fencing',await f.see());
});

test('W05 W07 W23 timeout retains uncertainty and reserve; manual retry cannot resend',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim(2)as any,r=await f.run(c);await f.run(f.start(c,r.generation!));await waitForLease(c.attemptId);
 assert.equal((await f.run({...f.base(),action:'recover'})).state,'uncertain');await assert.rejects(f.run(f.claim()),/WORK_NO_SAFE_PENDING_PART/);
 await f.run({...f.base(),action:'review'});await f.run({...f.base(),action:'resume'});await assert.rejects(f.run(f.claim()),{message:'WORK_NO_SAFE_PENDING_PART'});
 const s=(await f.see())!;assert.equal(s.parts[0].state,'uncertain');assert.equal((await h.admin`select state from crm_ha.reservations where reservation_id=${s.parts[0].reservation_id}`)[0]!.state,'uncertain');await capture('uncertain-recovery',s);
});

test('W26 W27 definition and claim replays; conflicting operation identity denied',async()=>{
 const f=await workFixture(h);await f.run(f.definition);assert.equal((await f.run(f.definition)).replayed,true);await assert.rejects(f.run({...f.definition,inputsRef:'different'}),/WORK_REPLAY_CONFLICT/);
 const c=f.claim(),r=await f.run(c);assert.deepEqual(await f.run(c),{...r,replayed:true});await assert.rejects(f.run({...c,reason:'different'}),/WORK_REPLAY_CONFLICT/);assert.equal((await f.see())!.attempts.length,1);
});

for(const order of [0,1])test(`W45 real pause versus start order ${order}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,claimed=await f.run(c),other=h.executor('synthetic-executor-a');const independent=await secondWorkActor(h);const start=()=>f.run(f.start(c,claimed.generation!),other),pause=()=>independent.auth().then(a=>f.worker.apply(a,write,{...f.base(),action:'pause'}));
 const r=await race(order?'b08_executions':'b08_attempts',order?"new.control_state='paused'":"new.state='contacted'",order?pause:start,order?start:pause);
 assert.equal(r.results[0]!.status,'fulfilled');assert.equal(r.results[1]!.status,order?'rejected':'fulfilled');if(order)assert.equal(rejection(r.results[1]!)!.message,'WORK_FENCED_OR_INAPPLICABLE');const s=(await f.see())!;assert.equal(s.parts[0].state,order?'claimed':'contacted');assert.equal(s.execution.control_state,'paused');await capture('pause-start-race-'+order,{...r,rejectedReason:rejection(r.results[1]!),snapshot:s});
});

for(const [action,table]of [['claim','b08_attempts'],['start','b07_history'],['result','b08_parts']]as const)test(`W28 W29 W30 rollback ${action} at ${table}`,async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any;let command:any=c;
 if(action!=='claim'){const r=await f.run(c);command=f.start(c,r.generation!);if(action==='result'){await f.run(command);command=f.prove(c.attemptId);}}
 const before=await atomicSnapshot();await h.admin.unsafe("create function crm_private.h5008_fail() returns trigger language plpgsql as $$begin raise exception 'WORK_INJECTED_ROLLBACK';end$$");await h.admin.unsafe(`create trigger h5008_fail before insert or update on crm_private.${table} for each row execute function crm_private.h5008_fail()`);
 try{await assert.rejects(f.run(command),{message:'WORK_INJECTED_ROLLBACK'});}finally{await h.admin.unsafe(`drop trigger h5008_fail on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5008_fail()');}
 assert.deepEqual(await atomicSnapshot(),before);await f.run(command);await capture('rollback-'+action+'-'+table,{tables:atomicTables,preserved:true,exactRejectedMessage:'WORK_INJECTED_ROLLBACK',retry:'PASS'});
});

test('W29 W47 deferred final work fails whole T08; retry same identity succeeds',async()=>{
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c),command=f.start(c,r.generation!);const before=await atomicSnapshot();
 await h.admin.unsafe("create function crm_private.h5008_deferred() returns trigger language plpgsql as $$begin raise exception 'WORK_DEFERRED_COMMIT';end$$");await h.admin.unsafe('create constraint trigger h5008_deferred after update on crm_private.b08_attempts deferrable initially deferred for each row execute function crm_private.h5008_deferred()');
 try{await assert.rejects(f.run(command),{message:'WORK_DEFERRED_COMMIT'});}finally{await h.admin.unsafe('drop trigger h5008_deferred on crm_private.b08_attempts');await h.admin.unsafe('drop function crm_private.h5008_deferred()');}
 assert.deepEqual(await atomicSnapshot(),before);
 // A required final reauthorization must be reached after every delegated write.
 const [{definition}]=await h.admin.unsafe("select pg_get_functiondef('crm_api.b08_ha_finalize(bytea,bytea,bytea)'::regprocedure) definition");
 await h.admin.unsafe("create or replace function crm_api.b08_ha_finalize(f2p bytea,f2s bytea,q bytea) returns void language plpgsql volatile security definer set search_path=pg_catalog,pg_temp as $$begin raise exception 'WORK_ORIGINAL_RESERVE_FINAL_CHECK';end$$");
 try{await assert.rejects(f.run(command),/WORK_ORIGINAL_RESERVE_FINAL_CHECK/);}finally{await h.admin.unsafe(definition);}
 assert.deepEqual(await atomicSnapshot(),before);await f.run(command);await capture('deferred-rollback',{tables:atomicTables,preserved:true,exactRejectedMessage:'WORK_DEFERRED_COMMIT',originalReserveFinalCheckReached:true,retry:'PASS'});
});

test('W18 W29 W47 evidence expires during deferred wait; final check rolls back all T08',async()=>{
 const f=await workFixture(h);const until=new Date(Date.now()+5000).toISOString(),material={...f.material,evidence:{reference:'simulated-short-evidence',fingerprint:'a'.repeat(64),expiresAt:until}};const approval=await f.approve(material);await f.run({...f.definition,material,...approval});const c=f.claim()as any,r=await f.run(c),command={...f.start(c,r.generation!),material}as any;
 const w=h.executor('synthetic-executor-a',{evidenceProvider:{revalidate:async()=>({reference:material.evidence.reference,fingerprint:material.evidence.fingerprint,checkedAt:new Date().toISOString(),validUntil:until,verifierIdentity:'synthetic-verifier',verifierKind:'simulated',outcome:'verified'})}});const before=await atomicSnapshot();
 await h.admin.unsafe("create sequence crm_private.h6016_wait_witness;create function crm_private.h5008_wait_end() returns trigger language plpgsql security definer set search_path=pg_catalog,pg_temp as $$begin perform nextval('crm_private.h6016_wait_witness');perform pg_sleep(5.3);return new;end$$");await h.admin.unsafe('create constraint trigger h5008_wait_end after update on crm_private.b08_attempts deferrable initially deferred for each row execute function crm_private.h5008_wait_end()');
 assert.ok(Date.now()<Date.parse(until),'evidence still valid before execution');try{await assert.rejects(f.run(command,w));assert.equal((await h.admin`select is_called from crm_private.h6016_wait_witness`)[0]!.is_called,true,'deferred wait reached');assert.ok(Date.now()>=Date.parse(until),'expired after actual deferred wait');}finally{await h.admin.unsafe('drop trigger h5008_wait_end on crm_private.b08_attempts');await h.admin.unsafe('drop function crm_private.h5008_wait_end();drop sequence crm_private.h6016_wait_witness');}
 assert.deepEqual(await atomicSnapshot(),before);await capture('expired-final-check',{rollbackPreserved:true,deadline:until});
});

test('W30 W47 real PostgreSQL COMMIT acknowledgement withheld by simulated wire fault; identity recovers durable result',async()=>{
 const {commitResponseLoss}=await import('../support/h5-work-response-loss.ts');const {WorkCommitUncertainError}=await import('../../src/infrastructure/postgres/persisted-work-executor.ts');
 const f=await workFixture(h);await f.run(f.definition);const c=f.claim()as any,r=await f.run(c);await f.run(f.start(c,r.generation!));const proof=f.prove(c.attemptId),relay=await commitResponseLoss(h.port),w=h.executor('synthetic-executor-a',{databaseUrl:`postgresql://crm_h0_ha_tx@127.0.0.1:${relay.port}/${h.label}`});
 try{await assert.rejects(f.run(proof,w),e=>e instanceof WorkCommitUncertainError&&e.operationId===proof.operationId);assert.equal(relay.dropped(),true);assert.equal((await f.see())!.parts[0].state,'succeeded');const checks=h.inspections();assert.equal((await f.run(proof,w)).replayed,true);assert.equal(h.inspections(),checks);await capture('commit-response-loss',{withheldRealServerCommitAck:true,simulatedWireFault:true,recoveredByIdentity:true,snapshot:await f.see()});}finally{await w.close();await relay.close();}
});

test('H6016 T08 committed start replays after evidence expiry without refresh or duplicate, requiring current session authority',async()=>{
 const {H0005PostgresAdapter}=await import('../../src/infrastructure/postgres/h0-005-adapter.ts');
 const f=await workFixture(h),actor=await secondWorkActor(h),auth=await actor.auth(),until=new Date(Date.now()+4000).toISOString();
 const material={...f.material,evidence:{reference:'simulated-start-replay-evidence',fingerprint:'c'.repeat(64),expiresAt:until}},approval=await f.approve(material);
 await f.run({...f.definition,material,...approval});const c=f.claim()as any,r=await f.run(c),command={...f.start(c,r.generation!),material}as any;
 let evidenceCalls=0;const w=h.executor('synthetic-executor-a',{evidenceProvider:{revalidate:async()=>{evidenceCalls++;return {reference:material.evidence.reference,fingerprint:material.evidence.fingerprint,checkedAt:new Date().toISOString(),validUntil:until,verifierIdentity:'synthetic-verifier',verifierKind:'simulated',outcome:'verified'};}}});
 assert.equal((await h.admin`select clock_timestamp()<${until}::timestamptz valid`)[0]!.valid,true);
 const first=await w.apply(auth,write,command);assert.equal(first.replayed,false);assert.equal(first.state,'contacted');assert.equal(evidenceCalls,1);
 const reserved=await h.admin`select to_jsonb(x) value from crm_ha.reservations x where reservation_id=${first.reservationId as string}`;assert.equal(reserved.length,1);
 const beforeReplay=await atomicSnapshot(),observedExpiry=await waitForExpiry(until);
 assert.deepEqual(await w.apply(auth,write,command),{...first,replayed:true});assert.equal(evidenceCalls,1);assertAuthorizedReplayPreserved(beforeReplay,await atomicSnapshot(),actor.sessionId);
 const beforeRevocation=await f.see(w);const access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2);await access.revokeOne(auth);
 const afterRevocation=await atomicSnapshot();await assert.rejects(w.apply(auth,write,command),{message:'F2_DENIED',code:'42501'});assert.equal(evidenceCalls,1);assert.deepEqual(await atomicSnapshot(),afterRevocation);
 assert.deepEqual(await f.see(w),beforeRevocation);assert.deepEqual(await f.run(command,w),{...first,replayed:true});assert.equal(evidenceCalls,1);assertAuthorizedReplayPreserved(afterRevocation,await atomicSnapshot(),h.sessionId);
 await capture('start-replay-expired-evidence',{first,observedExpiry,evidenceCalls,reservationRows:Array.from(reserved),atomicTablesPreserved:atomicTables,currentSessionReauthorized:true,authorizedHumanActivityMonotonic:true,otherEpochFieldsExact:true,revokedSessionDenied:'F2_DENIED',revokedSessionSQLState:'42501',observerSessionDistinct:actor.sessionId!==h.sessionId,noNewReservationOrEffectOrHistoryOrResult:true});
});

test('H6016 T08 pooled executor rejects foreign authority and context without leaking authority',async()=>{
 const {verifyAuth}=await import('../../src/application/verified-auth.ts');const f=await workFixture(h);await f.run(f.definition);const c=f.claim(),r=await f.run(c);await f.run(f.start(c,r.generation!));
 const before=await f.see();assert.deepEqual(Object.keys(f.worker).sort(),['apply','close','read']);
 const foreign=await verifyAuth({verify:async()=>({subject:uid(),sessionId:h.sessionId,passwordVerified:true,mfaVerified:true})},'synthetic-foreign');
 await assert.rejects(f.worker.read(foreign,read,f.executionId,f.context));
 await assert.rejects(f.worker.read(await h.auth(),read,f.executionId,{...f.context,contextId:uid()}));
 await assert.rejects(f.worker.read(await h.auth(),read,f.executionId,{...f.context,purpose:'foreign-purpose'}));
 assert.deepEqual(await f.see(),before);const proof=f.prove(c.attemptId);await f.run(proof);assert.equal((await f.run(proof)).replayed,true);
 await capture('pool-context',{sameSingleConnectionExecutor:true,foreignAuthorityRejected:true,foreignContextRejected:true,foreignPurposeRejected:true,authorizedRecovered:true,facade:Object.keys(f.worker).sort()});
});
