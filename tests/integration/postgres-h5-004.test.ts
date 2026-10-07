import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {writeFile,readFile} from 'node:fs/promises';
import {isolatedAlerts,read,write,alert,attempt,automation} from '../support/h5-alert-isolated.ts';
import {H5003AlertAdapter} from '../../src/infrastructure/postgres/h5-alert-adapter.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {paymentFixture} from '../support/h3-payment-fixtures.ts';
let h:Awaited<ReturnType<typeof isolatedAlerts>>;
before(async()=>{h=await isolatedAlerts('crm_h5004',58801);});
after(async()=>{await h?.close();});
const see=async(p:ReturnType<typeof alert>)=>h.alerts.read(await h.auth(),read,p.alertId);
const apply=async(p:Parameters<typeof h.alerts.apply>[2])=>h.alerts.apply(await h.auth(),write,p);
const capture=async(name:string,value:unknown)=>{if(process.env.H5004_CAPTURE_DIR)await writeFile(`${process.env.H5004_CAPTURE_DIR}/${name}.json`,JSON.stringify(value,null,2)+'\n');};
for(const [urgency,cases] of [['informative','H5-AA'],['important','H5-AB'],['critical','H5-AC']] as const)
 test(`${cases}/AD/AE/AF/AG/AH D016 visibility and pending intent ${urgency}`,async()=>{
  const p=alert(urgency);await apply(p);const s=(await see(p))!;
  assert.deepEqual(s.material,p.material);assert.deepEqual(s.identity,p.identity);assert.equal(s.responsible_actor,h.actorId);
  assert.deepEqual(s.notifications.map(n=>n.channel),urgency==='informative'?['crm']:['crm','whatsapp']);
  for(const n of s.notifications){assert.equal(n.recipient_actor,h.actorId);assert.equal(n.delivery_state,n.channel==='crm'?'visible':'unavailable');assert.equal(n.last_synthetic_outcome,null);}
  assert.equal(s.history.length,1);assert.equal(s.attempts.length,0);await capture(urgency,s);
 });
test('H5-AD/AP reject email, different recipient and forged real delivery',async()=>{
 const p=alert();for(const extra of [{channel:'email'},{recipient:uid()},{delivery_state:'delivered'}])await assert.rejects(apply({...p,...extra} as never),/ALERT_INPUT_INVALID/);
 assert.equal(await see(p),null);
});
test('H5-AE missing material and identity guards reject without persistence',async()=>{
 for(const key of Object.keys(alert().identity)){
  const p=alert();await assert.rejects(apply({...p,identity:{...p.identity,[key]:null}} as never));assert.equal(await see(p),null);
 }
 for(const key of Object.keys(alert().material)){
  const p=alert();const material={...p.material} as Record<string,unknown>;delete material[key];
  await assert.rejects(apply({...p,material} as never));assert.equal(await see(p),null);
 }
});
test('H5-AI/AJ/AT/AY persistent automation and failed WhatsApp are visible without recursion',async()=>{
 const p=alert('critical',automation());await apply(p);const q=attempt(p);await apply(q);
 for(let i=0;i<5;i++){assert.equal((await apply(q)).replayed,true);assert.equal((await apply({...q,operationId:uid()})).replayed,true);}
 const s=(await see(p))!;assert.equal(s.notifications.length,2);assert.equal(s.history.length,2);assert.equal(s.attempts.length,1);
 assert.equal(s.notifications[1]!.last_synthetic_outcome,'failed');assert.equal(s.notifications[1]!.delivery_state,'unavailable');
 assert.deepEqual(s.material,p.material);assert.equal(s.attempts[0]!.source_version,'1');assert.equal(s.attempts[0]!.simulated,true);
 assert.deepEqual(s.missing_parameters,['retryLimit','pauseSeconds']);await capture('persistent-failure',s);
});
test('H5-AK/AX lost-response replay and equivalent cause reuse once',async()=>{
 const p=alert();const a=await apply(p);assert.equal((await apply(p)).replayed,true);
 const b=await apply({...p,operationId:uid(),alertId:uid()});assert.equal(b.id,a.id);assert.equal(b.replayed,true);
 const s=(await see(p))!;assert.equal(s.history.length,1);assert.equal(s.notifications.length,2);
});
test('H5-AM same identifier with different material conflicts',async()=>{
 const p=alert();await apply(p);const old=await see(p);
 await assert.rejects(apply({...p,material:{...p.material,risk:'Material distinto'}}),/ALERT_REPLAY_CONFLICT/);
 await assert.rejects(apply({...p,operationId:uid(),material:{...p.material,risk:'Material distinto'}}),/ALERT_IDENTITY_CONFLICT/);
 assert.deepEqual(await see(p),old);
});
test('H5-AAA distinct cause scope and effect are never collapsed by similar text',async()=>{
 const p=alert();await apply(p);const ids=new Set([p.alertId]);
 for(const key of ['causeId','scopeRef','effect']){const q={...p,operationId:uid(),alertId:uid(),identity:{...p.identity,[key]:uid()}};
  ids.add((await apply(q)).id);}
 assert.equal(ids.size,4);
});
test('H5-AR/AS absent parameters block only dependent retry',async()=>{
 const omissions=[{retryLimit:null,pauseSeconds:0},{retryLimit:2,pauseSeconds:null},
  {retryLimit:2,pauseSeconds:0,missingParameters:['frequency','advance','date']}];
 for(const missing of omissions){const p=alert('important',{...automation(),...missing});await apply(p);await apply(attempt(p));
  await assert.rejects(apply({...attempt(p,2),reviewRef:'synthetic-review'}),/ALERT_PARAMETERS_MISSING/);
  const s=(await see(p))!;assert.equal(s.attempts.length,1);assert.equal(s.notifications[0]!.delivery_state,'visible');
  assert.ok(s.missing_parameters.length>0);assert.deepEqual(s.material,p.material);
 }
});
test('H5-AT/AE manual stop review retry limit and uncertainty retain history',async()=>{
 const p=alert('critical',{...automation(),retryLimit:1,pauseSeconds:0});await apply(p);await apply(attempt(p,1,'uncertain'));
 await assert.rejects(apply(attempt(p,2)),/ALERT_REVIEW_REQUIRED/);
 await apply({action:'stop',operationId:uid(),alertId:p.alertId,expectedRevision:2,reason:'Detención sintética',reviewRef:'synthetic-stop'});
 await assert.rejects(apply({...attempt(p,3),reviewRef:'synthetic-review'}),/ALERT_STOPPED/);
 await apply({action:'review',operationId:uid(),alertId:p.alertId,expectedRevision:3,reason:'Conciliación del doble',reviewRef:'synthetic-reconciliation'});
 await apply({...attempt(p,4),reviewRef:'synthetic-reconciliation'});
 await assert.rejects(apply({...attempt(p,5),reviewRef:'synthetic-review'}),/ALERT_RETRY_LIMIT/);
 const s=(await see(p))!;assert.equal(s.attempts.length,2);assert.equal(s.history.length,5);
 assert.deepEqual(s.attempts.map(x=>x.outcome),['uncertain','failed']);await capture('stop-review',s);
});
test('H5-AE configured pause is respected without scheduler',async()=>{
 const p=alert('important',{...automation(),retryLimit:1,pauseSeconds:3600});await apply(p);await apply(attempt(p));
 await assert.rejects(apply({...attempt(p,2),reviewRef:'synthetic-review'}),/ALERT_PAUSE_PENDING/);
 assert.equal((await see(p))!.attempts.length,1);
});
test('H5-AN/AO synthetic delivery never modifies origin or accredits external delivery',async()=>{
 const b=await invoiceFixture(h);await h.invoices.apply(await h.auth(),write,await b.need());
 const inc=await incidentFixture(h,b);await h.incidents.apply(await h.auth(),write,await inc.detect());
 const req=await requirementFixture(h,b);await h.requirements.apply(await h.auth(),write,await req.need());
 const pay=await paymentFixture(h);await h.payments.apply(await h.auth(),write,pay.detect);
 const p=alert();p.identity.contextId=b.bookingId;
 await h.tasks.apply(await h.auth(),write,{action:'receive',operationId:uid(),taskId:uid(),expectedRevision:0,
 identity:{causeKind:'document',causeId:req.requirementId,contextKind:'booking',contextId:b.bookingId,scopeRef:b.bookingId,relatedKind:null,relatedId:null,effect:'review'},
 material:{title:'Revisar documentación',deadline:{kind:'unknown',reason:'Pendiente'},priority:{kind:'pending',reason:'Sin configurar'},sourceRef:'synthetic-task',sourceVersion:'1',triggerRef:'manual',triggerVersion:'1'},reason:'Seguimiento independiente'});
 const tables=(await h.observer`select tablename from pg_tables where schemaname='crm_private' and tablename not in ('b07_alerts','b07_notifications','b07_notification_attempts','b07_operations','b07_history') and tablename not like 'f2_%'`).map(x=>x.tablename as string);
 const snap=async()=>{const out:Record<string,unknown>={};for(const t of tables)out[t]=await h.observer.unsafe(`select md5(coalesce(string_agg(x::text,',' order by x::text),'')) hash from crm_private."${t}" x`);return out;};
 const before=await snap();await apply(p);await apply(attempt(p,1,'simulated_delivered'));const after=await snap();
 // F2 tracks legitimate interactive use; all business tables must remain identical.
 for(const t of tables.filter(t=>!['crm_sessions','identification_epochs'].includes(t)))assert.deepEqual(after[t],before[t],t);
 await capture('origin-preservation',{tables:tables.filter(t=>!['crm_sessions','identification_epochs'].includes(t)),before,after,bookingId:b.bookingId,incidentId:inc.incidentId,requirementId:req.requirementId,paymentId:pay.paymentId});
 const s=(await see(p))!;assert.equal(s.notifications[1]!.delivery_state,'unavailable');assert.equal(s.attempts[0]!.simulated,true);await capture('non-origin',s);
});
test('H5-AU invalid and cross-subject authority cannot read write or replay',async()=>{
 const p=alert();await apply(p);
 await assert.rejects(h.alerts.apply({} as never,write,p));await assert.rejects(h.alerts.apply(await h.auth(),read,p));
 await assert.rejects(h.alerts.read({} as never,read,p.alertId));await assert.rejects(h.alerts.read(await h.auth(),write,p.alertId));
 const foreign=await verifyAuth({verify:async()=>({subject:uid(),sessionId:h.sessionId,passwordVerified:true,mfaVerified:true})},uid());
 await assert.rejects(h.alerts.apply(foreign,write,p));await assert.rejects(h.alerts.read(foreign,read,p.alertId));
});
test('H5-AU/AX disabled actor cannot retrieve or replay persisted outcome',async()=>{
 const p=alert();await apply(p);
 await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
 try{await assert.rejects(apply(p));await assert.rejects(see(p));}
 finally{await h.admin`update crm_private.crm_actors set enabled=true where actor_id=${h.actorId}::uuid`;}
});
test('H5-AV direct roles denied and FORCE RLS includes owner',async()=>{
 for(const t of ['b07_alerts','b07_notifications','b07_notification_attempts']){
  const row=(await h.observer.unsafe(`select relrowsecurity,relforcerowsecurity,pg_get_userbyid(relowner) owner from pg_class where oid='crm_private.${t}'::regclass`))[0]!;
  assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);assert.equal(row.owner,'crm_h0_f2_owner');
  for(const r of ['crm_h0_runtime','anon','authenticated']){const conn=h.connect(r);
   await assert.rejects(conn.unsafe(`select * from crm_private.${t}`));
   await assert.rejects(conn.unsafe(`delete from crm_private.${t}`));
   await assert.rejects(conn.unsafe(`update crm_private.${t} set admin_scope='unauthorized'`));
   await assert.rejects(conn.unsafe(`insert into crm_private.${t}(admin_scope) values('unauthorized')`));}
  await h.admin.begin(async tx=>{await tx.unsafe('set local role crm_h0_f2_owner');assert.equal((await tx.unsafe(`select count(*)::int n from crm_private.${t}`))[0]!.n,0);});
 }
 await assert.rejects(h.runtime.unsafe('select * from crm_api.b07_alert_apply(null,null,null,null,null)'));
});
for(const table of ['b07_alerts','b07_notifications','b07_history'])test(`H5-AW receive rollback at ${table}`,async()=>{
 const p=alert();await h.admin.unsafe("create function crm_private.h5004_fail() returns trigger language plpgsql as $$begin raise exception 'H5004_INJECTED';end$$");
 await h.admin.unsafe(`create trigger h5004_fail before insert on crm_private.${table} for each row execute function crm_private.h5004_fail()`);
 try{await assert.rejects(apply(p));}finally{await h.admin.unsafe(`drop trigger h5004_fail on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5004_fail()');}
 assert.equal(await see(p),null);assert.equal((await h.observer`select count(*)::int n from crm_private.b07_operations where operation_id=${p.operationId}::uuid`)[0]!.n,0);
 await apply(p);assert.equal((await see(p))!.history.length,1);
});
for(const table of ['b07_notification_attempts','b07_notifications','b07_history'])test(`H5-AW attempt rollback at ${table}`,async()=>{
 const p=alert();await apply(p);const old=await see(p);const q=attempt(p);
 await h.admin.unsafe("create function crm_private.h5004_fail() returns trigger language plpgsql as $$begin raise exception 'H5004_INJECTED';end$$");
 await h.admin.unsafe(`create trigger h5004_fail before ${table==='b07_notifications'?'update':'insert'} on crm_private.${table} for each row execute function crm_private.h5004_fail()`);
 try{await assert.rejects(apply(q));}finally{await h.admin.unsafe(`drop trigger h5004_fail on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5004_fail()');}
 assert.deepEqual(await see(p),old);await apply(q);assert.equal((await see(p))!.attempts.length,1);
});
test('H5-AW deferred COMMIT failure rolls back complete T09',async()=>{
 const p=alert();await h.admin.unsafe("create function crm_private.h5004_fail() returns trigger language plpgsql as $$begin raise exception 'H5004_COMMIT';end$$");
 await h.admin.unsafe('create constraint trigger h5004_fail after insert on crm_private.b07_history deferrable initially deferred for each row execute function crm_private.h5004_fail()');
 try{await assert.rejects(apply(p));}finally{await h.admin.unsafe('drop trigger h5004_fail on crm_private.b07_history');await h.admin.unsafe('drop function crm_private.h5004_fail()');}
 assert.equal(await see(p),null);await apply(p);assert.equal((await see(p))!.notifications.length,2);
});
test('H5-AAF same attempt conflict and stale results cannot overwrite',async()=>{
 const p=alert();await apply(p);const q=attempt(p);await apply(q);const old=await see(p);
 await assert.rejects(apply({...q,operationId:uid(),outcome:'simulated_delivered'}),/ALERT_ATTEMPT_CONFLICT/);
 await assert.rejects(apply({...attempt(p),reviewRef:'synthetic-review'}),/ALERT_REVISION_CONFLICT/);assert.deepEqual(await see(p),old);
});
test('H5-AL/AAF real overlap both orders absent identity and competing results',async()=>{
 const observations=[];
 for(const mode of ['receive','result'] as const)for(const order of [0,1]){
  const p=alert('critical',{...automation(),retryLimit:1,pauseSeconds:0});if(mode==='result')await apply(p);
  const one=mode==='receive'?p:attempt(p,1,'failed'),two=mode==='receive'?{...p,operationId:uid(),alertId:uid()}:attempt(p,1,'uncertain');
  const commands=order?[two,one]:[one,two];const table=mode==='receive'?'b07_alerts':'b07_notification_attempts';
  await h.admin.unsafe("create function crm_private.h5004_wait() returns trigger language plpgsql as $$begin perform pg_advisory_xact_lock(7643504);return new;end$$");
  await h.admin.unsafe(`create trigger h5004_wait before insert on crm_private.${table} for each row execute function crm_private.h5004_wait()`);
  let release!:()=>void,ready!:()=>void;const done=new Promise<void>(r=>release=r),held=new Promise<void>(r=>ready=r);
  const holder=h.admin.begin(async tx=>{await tx.unsafe('select pg_advisory_xact_lock(7643504)');ready();await done;});await held;
  const watcher=h.connect('h2_bootstrap');
  const wait=async(n:number)=>{let rows:Record<string,unknown>[]=[];for(let i=0;i<120;i++){
   rows=await watcher.unsafe("select pid,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where usename='crm_h0_runtime' and wait_event_type='Lock' and query like '%b07_alert_apply%' order by pid");
   if(rows.length>=n)return rows;await new Promise(r=>setTimeout(r,20));}throw new Error('H5004_OVERLAP_MISSING');};
  const first=apply(commands[0]!);let second:ReturnType<typeof apply>|undefined;let waiting:Record<string,unknown>[]=[];let results:PromiseSettledResult<unknown>[]=[];
  try{await wait(1);second=apply(commands[1]!);waiting=await wait(2);}
  finally{release();await holder;results=await Promise.allSettled(second?[first,second]:[first]);await h.admin.unsafe(`drop trigger h5004_wait on crm_private.${table}`);await h.admin.unsafe('drop function crm_private.h5004_wait()');}
  assert.equal(new Set(waiting.map(x=>x.pid)).size,2);assert.equal(results.filter(x=>x.status==='fulfilled').length,mode==='receive'?2:1);
  const id=mode==='receive'?(results[0] as PromiseFulfilledResult<{id:string}>).value.id:p.alertId;
  const s=(await h.alerts.read(await h.auth(),read,id))!;assert.equal(s.notifications.length,2);assert.equal(s.history.length,mode==='receive'?1:2);
  assert.equal(s.attempts.length,mode==='receive'?0:1);
  if(mode==='receive')assert.equal((results[1] as PromiseFulfilledResult<{id:string}>).value.id,id);
  observations.push({mode,order,waiting,results,observed:s});
 }
 await capture('concurrency',observations);
});
test('H5-AU signed technical capability mismatch rejects without business writes',async()=>{
 const p=alert(),bad=new H5003AlertAdapter(h.runtime,{...h.f1,key:new Uint8Array(32)},h.f2);
 await assert.rejects(bad.apply(await h.auth(),write,p));assert.equal(await see(p),null);
 await apply(p);await assert.rejects(bad.apply(await h.auth(),write,p));await assert.rejects(bad.read(await h.auth(),read,p.alertId));
});
test('H5-AW failure between CRM and WhatsApp intent rolls back both',async()=>{
 const p=alert();await h.admin.unsafe("create function crm_private.h5004_fail() returns trigger language plpgsql as $$begin raise exception 'H5004_SECOND_INTENT';end$$");
 await h.admin.unsafe("create trigger h5004_fail before insert on crm_private.b07_notifications for each row when (new.channel='whatsapp') execute function crm_private.h5004_fail()");
 try{await assert.rejects(apply(p));}finally{await h.admin.unsafe('drop trigger h5004_fail on crm_private.b07_notifications');await h.admin.unsafe('drop function crm_private.h5004_fail()');}
 assert.equal(await see(p),null);assert.equal((await h.observer`select count(*)::int n from crm_private.b07_notifications where alert_id=${p.alertId}::uuid`)[0]!.n,0);
 await apply(p);assert.equal((await see(p))!.notifications.length,2);
});
