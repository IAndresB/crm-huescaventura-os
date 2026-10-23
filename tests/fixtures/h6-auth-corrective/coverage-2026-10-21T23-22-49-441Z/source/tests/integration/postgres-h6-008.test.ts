import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid,createHmac} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedWork,workFixture,read,write} from '../support/h6-current-isolated.ts';
import {verifyAuth,type VerifiedAuthEvidence} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../../src/infrastructure/postgres/h0-013-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {SupabasePrivateStorage,digest} from '../../src/infrastructure/storage/private-storage.ts';
import type {ProjectionSurface} from '../../src/domain/coordinated-projection.ts';

let h:Awaited<ReturnType<typeof isolatedWork>>,access:H0005PostgresAdapter,objects:H1015ObjectAdapter,storage:SupabasePrivateStorage;
let bucket='',ordinaryJwt='';const endpoint=process.env.STORAGE_H1_ENDPOINT!;
const auth=(sessionId?:string,passwordVerified=true,mfaVerified=true,subject=h.subject)=>verifyAuth({verify:async()=>({subject,...(sessionId?{sessionId}:{}),passwordVerified,mfaVerified})},uid());
const session=async()=>{const s=await access.establish(await auth());return {...s,auth:await auth(s.sessionId)};};
const surfaces:ProjectionSurface[]=['timeline','calendar','query','search','export','document','ai_context'];
before(async()=>{
 assert.equal(new URL(endpoint).hostname,'127.0.0.1');h=await isolatedWork('crm_h6008',59608);
 const f1={...h.f1,allowedPurposes:[...h.f1.allowedPurposes,'h0-005-human-bridge','h0-013-auth-revocation']};
 await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;h={...h,f1};
 access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2);
 const secret=(await readFile(process.env.STORAGE_H1_CONFIG!,'utf8')).match(/^AUTH_JWT_SECRET=(.*)$/m)![1]!;
 const jwt=(role:string)=>{const header=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),payload=Buffer.from(JSON.stringify({role,sub:h.subject,aal:'aal2',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');return `${header}.${payload}.${createHmac('sha256',secret).update(`${header}.${payload}`).digest('base64url')}`;};
 const service=jwt('service_role');ordinaryJwt=jwt('authenticated');bucket='synthetic-h6008-'+uid();
 const created=await fetch(`${endpoint}/bucket`,{method:'POST',headers:{Authorization:`Bearer ${service}`,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false})});assert.equal(created.status,200);
 storage=new SupabasePrivateStorage(endpoint,bucket,service);objects=new H1015ObjectAdapter(h.runtime,storage,h.f1,h.f2);
});
after(async()=>{await h?.close();});

async function fixture(){
 const a=await session(),b=await session(),hh={...h,sessionId:a.sessionId,auth:async()=>a.auth},f=await workFixture(hh);
 await f.run(f.definition);const opportunity=h.input();await h.adapter.apply(a.auth,write,opportunity);
 const projection=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),context=f.comm.context,bytes=Buffer.from('SYNTHETIC H6-008 private object');
 const prep={...context,operationId:uid(),rootId:uid(),versionId:uid(),documentId:f.comm.originalId,expectedVersion:0,sourceRef:'synthetic-h6008',reason:'Synthetic isolated security verification',digest:digest(bytes),size:bytes.length,media:'application/octet-stream'};
 await objects.prepare(a.auth,write,prep);await objects.upload(a.auth,read,write,prep.versionId,context,bytes,uid());
 await objects.reconcile(a.auth,read,write,prep.versionId,context,uid());await objects.link(a.auth,read,write,prep.versionId,context,uid());
 const query=(surface:ProjectionSurface)=>({contextKind:'opportunity' as const,contextId:opportunity.targetId,surface,destination:'administrator' as const});
 const operations:{name:string;invoke:(proof:VerifiedAuthEvidence)=>Promise<unknown>}[]=[
  {name:'commercial.read',invoke:a=>h.adapter.read(a,read,opportunity.targetId,'opportunity')},
  {name:'commercial.mutate',invoke:a=>h.adapter.apply(a,write,h.input())},
  {name:'commercial.replay',invoke:a=>h.adapter.apply(a,write,opportunity)},
  {name:'work.read',invoke:a=>f.worker.read(a,read,f.executionId,f.context)},
  {name:'work.replay',invoke:a=>f.worker.apply(a,write,f.definition)},
  {name:'evidence.read',invoke:a=>h.evidence.read(a,read,f.comm.recordId,context.contextKind,context.contextId)},
  ...surfaces.map(surface=>({name:'projection.'+surface,invoke:(a:VerifiedAuthEvidence)=>projection.read(a,read,query(surface))})),
  {name:'object.metadata',invoke:a=>objects.metadata(a,read,prep.versionId,context)},
  {name:'object.download',invoke:a=>objects.download(a,read,prep.versionId,context)},
  {name:'object.replay',invoke:a=>objects.prepare(a,write,prep)},
 ];
 for(const op of operations){const value=await op.invoke(a.auth);assert.ok(value!==null&&value!==undefined,'positive control '+op.name);}
 assert.deepEqual(Buffer.from(await objects.download(a.auth,read,prep.versionId,context)),bytes);
 return {a,b,f,prep,context,bytes,operations,projection,query};
}
async function witness(){
 const result:Record<string,string>={};
 for(const table of ['crm_private.b03_opportunities','crm_private.b07_records','crm_private.b07_history','crm_private.b07_operations','crm_private.b08_parts','crm_private.b08_attempts','crm_private.b08_command_results','crm_ha.reservations','crm_ha.events','crm_private.identification_epochs']){
  result[table]=(await h.admin.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E'\n' order by to_jsonb(r)::text),''),'sha256'),'hex') h from ${table} r`))[0]!.h;
 }return result;
}
async function denied(f:Awaited<ReturnType<typeof fixture>>,proof=f.a.auth){
 const before=await witness();for(const op of f.operations)await assert.rejects(op.invoke(proof),/DENIED|AUTH_REQUIRED|AUTHORIZATION|AUTHORITY|VERIFICATION_REQUIRED/,op.name);
 assert.deepEqual(await witness(),before,'denial must not mutate history, effects or activity');
}
for(const invalid of ['idle7','absolute30','revoked-one','disabled','recovery','enrollment','missing-mfa','unmapped','forged','missing']as const)test(`H6-008 S01 S02 S06: ${invalid} across sixteen Core surfaces`,async t=>{
 const f=await fixture();let proof=f.a.auth;
 try{
  if(invalid==='idle7'||invalid==='absolute30')await h.admin`update crm_private.identification_epochs set identified_at=clock_timestamp()-${invalid==='idle7'?'29 days':'30 days'}::interval,last_human_activity_at=clock_timestamp()-${invalid==='idle7'?'7 days':'1 day'}::interval where epoch_id=${f.a.epochId}::uuid`;
  if(invalid==='revoked-one')await access.revokeOne(f.a.auth);
  if(invalid==='disabled')await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
  if(invalid==='recovery'||invalid==='enrollment')await h.admin`update crm_private.crm_actors set access_state=${invalid==='recovery'?'recovery_in_progress':'enrollment_required'} where actor_id=${h.actorId}::uuid`;
  if(invalid==='missing-mfa')proof=await auth(f.a.sessionId,true,false);
  if(invalid==='unmapped')proof=await auth(f.a.sessionId,true,true,uid());
  if(invalid==='forged')proof={...f.a.auth};if(invalid==='missing')proof=null as never;
  await denied(f,proof);
  if(invalid==='idle7'||invalid==='absolute30'||invalid==='revoked-one')assert.ok(await f.projection.read(f.b.auth,read,f.query('timeline')),'other device independent');
  t.diagnostic(JSON.stringify({invalid,positiveControls:f.operations.length,denied:f.operations.map(x=>x.name),durableStateUnchanged:true,auth:'synthetic-port'}));
 }finally{await h.admin`update crm_private.crm_actors set enabled=true,access_state='ready' where actor_id=${h.actorId}::uuid`;await h.closeExecutors();}
});

test('H6-008 S02 S03: controlled time boundaries, per-device activity, opaque human signal and password/TOTP',async t=>{
 const f=await fixture(),anchor='2026-10-22T12:00:00Z';
 for(const days of [7,30])for(const offset of [-1,0,1]){
  const row=(await h.admin`select crm_f2.within_limit(${anchor}::timestamptz+${offset}*interval '1 microsecond',${anchor}::timestamptz-${days}*interval '1 day',${days}) allowed`)[0]!;
  assert.equal(row.allowed,offset<0);
 }
 await h.admin`update crm_private.identification_epochs set identified_at=clock_timestamp()-interval '29 days',last_human_activity_at=clock_timestamp()-interval '6 days' where epoch_id=${f.a.epochId}::uuid`;
 const activity=async(id:string)=>(await h.admin`select last_human_activity_at::text v from crm_private.identification_epochs where epoch_id=${id}::uuid`)[0]!.v;
 const before=await activity(f.a.epochId);await f.projection.read(f.b.auth,read,f.query('timeline'));assert.equal(await activity(f.a.epochId),before);
 for(const event of ['token-refresh','polling','background-job','passive']as const)await assert.rejects(f.projection.read(f.a.auth,classifyServerEvent(event),f.query('timeline')),/AUTH_REQUIRED/);
 await assert.rejects(f.projection.read(f.a.auth,{interactionClass:'interactive_read'},f.query('timeline')),/AUTH_REQUIRED/);
 assert.equal(await activity(f.a.epochId),before);await f.projection.read(f.a.auth,read,f.query('timeline'));assert.notEqual(await activity(f.a.epochId),before);
 for(const [password,mfa]of [[false,true],[true,false],[false,false]])await assert.rejects(access.establish(await auth(undefined,password,mfa)),/FULL_IDENTIFICATION_REQUIRED/);
 t.diagnostic('6 exact microsecond boundary checks; passive and forged signals rejected; device A/B independent. Real HTTP origin and real Auth still pending.');
 await h.closeExecutors();
});

for(const outcome of ['revoked','failed','uncertain','throw']as const)test(`H6-008 S04 S05: global closure ${outcome} includes issuer across all surfaces`,async t=>{
 const f=await fixture();let calls=0;
 const coordinator=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2,{revokeAllSessions:async()=>{calls++;if(outcome==='throw')throw new Error('SYNTHETIC_AUTH_UNCERTAIN');return outcome;}});
 const result=await coordinator.revokeAll(f.b.auth,uid());assert.equal(calls,1);assert.equal(result.status,outcome==='revoked'?'completed':'partial');
 await denied(f,f.a.auth);await denied(f,f.b.auth);
 const fresh=await session();assert.ok(await f.projection.read(fresh.auth,read,f.query('timeline')));
 t.diagnostic(JSON.stringify({outcome,status:result.status,deniedOldSurfaces:f.operations.length*2,newSyntheticIdentification:true,realAuthAccredited:false}));await h.closeExecutors();
});

test('H6-008 S07: direct SQL roles and known private object path, still-live locally signed JWT',async t=>{
 const f=await fixture();const tables=await h.admin`select n.nspname,c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('crm_private','crm_ha') and c.relkind='r' order by 1,2`;
 let attempts=0;
 for(const role of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){
  const sql=h.connect(role);const flags=(await h.admin`select rolsuper,rolbypassrls from pg_roles where rolname=${role}`)[0]!;assert.equal(flags.rolsuper,false);assert.equal(flags.rolbypassrls,false);
  for(const row of tables){const table=`${row.nspname}.${row.relname}`;assert.equal(row.relrowsecurity,true);assert.equal(row.relforcerowsecurity,true);for(const q of [`select * from ${table} limit 1`,`delete from ${table} where false`]){await assert.rejects(sql.unsafe(q));attempts++;}}
  await assert.rejects(sql.unsafe('select crm_api.h5_projection_read(null,null,null,null,null)'));
 }
 const known=`${endpoint}/object/authenticated/${bucket}/${f.prep.rootId}/${f.prep.versionId}`;
 for(const headers of [new Headers(),new Headers({Authorization:`Bearer ${ordinaryJwt}`})]){const response=await fetch(known,{headers});assert.ok(!response.ok);assert.ok(!(await response.text()).includes(f.bytes.toString()));}
 t.diagnostic(JSON.stringify({directSqlAttempts:attempts,tables:tables.length,roles:4,privatePathDenied:true,syntheticUnexpiredJwtDenied:true,realAuthAccredited:false}));await h.closeExecutors();
});

test('H6-008 S08: actual Storage bytes arrive after global closure; final Core authorization denies release',async t=>{
 const f=await fixture();let ready!:()=>void,release!:()=>void;const fetched=new Promise<void>(r=>ready=r),gate=new Promise<void>(r=>release=r);
 const delayed=new H1015ObjectAdapter(h.connect('crm_h0_runtime'),{put:(...a)=>storage.put(...a),inventory:p=>storage.inventory(p),get:async p=>{const real=await storage.get(p);assert.ok(real);ready();await gate;return real;}},h.f1,h.f2);
 const pending=delayed.download(f.a.auth,read,f.prep.versionId,f.context);const rejected=assert.rejects(pending,/OBJECT_DENIED/);
 await fetched;
 try{const close=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2,{revokeAllSessions:async()=> 'revoked'});assert.equal((await close.revokeAll(f.b.auth,uid())).status,'completed');}finally{release();}
 await rejected;t.diagnostic(JSON.stringify({realStorageReadCompleted:true,revocationCommittedBeforeRelease:true,bytesReleased:false,auth:'synthetic-port'}));await h.closeExecutors();
});

for(const revocationFirst of [false,true])test(`H6-008 S09: real projection/revocation overlap; revocationFirst=${revocationFirst}`,async t=>{
 const f=await fixture(),holder=h.connect('h2_bootstrap'),watcher=h.connect('h2_bootstrap');
 let ready!:()=>void,release!:()=>void;const held=new Promise<void>(r=>ready=r),gate=new Promise<void>(r=>release=r);
 const locked=holder.begin(async tx=>{await tx.unsafe(`lock table crm_private.${revocationFirst?'global_access_revocations':'b03_opportunities'} in access exclusive mode`);ready();await gate;});await held;
 const wait=async(fragment:string)=>{for(let i=0;i<200;i++){
  const rows=await watcher`select pid,wait_event_type,pg_blocking_pids(pid) blockers from pg_stat_activity where datname=current_database() and wait_event_type='Lock' and query like ${'%'+fragment+'%'} and pid<>pg_backend_pid()`;
  if(rows.length)return rows.map(x=>({...x}));await new Promise(r=>setTimeout(r,20));
 }throw new Error('H6008_REAL_LOCK_NOT_OBSERVED');};
 const p=new H5011ProjectionAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2),c=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2,{revokeAllSessions:async()=> 'revoked'});
 const readProjection=()=>p.read(f.a.auth,read,f.query('timeline')).then(value=>({allowed:true,value}),()=>({allowed:false}));
 const revoke=()=>c.revokeAll(f.b.auth,uid());let operation:ReturnType<typeof readProjection>|undefined,closing:ReturnType<typeof revoke>|undefined;let first:unknown,second:unknown;
 try{
  if(revocationFirst){closing=revoke();closing.catch(()=>{});first=await wait('start_global_access_revocation');operation=readProjection();second=await wait('h5_projection_read');}
  else{operation=readProjection();first=await wait('h5_projection_read');closing=revoke();closing.catch(()=>{});second=await wait('start_global_access_revocation');}
 }finally{release();await locked;}
 assert.equal((await closing!).status,'completed');assert.equal((await operation!).allowed,!revocationFirst);await denied(f);
 t.diagnostic(JSON.stringify({revocationFirst,first,second,earlierAuthorizedReadAllowed:!revocationFirst,postClosureDenied:true}));await h.closeExecutors();
});

test('H6-008 S10: real Auth/provider and HTTP ingress remain unaccredited',{skip:'No production AuthVerificationPort/ingress adapter is implemented in the approved base; no real credentials or Hosted access authorized.'},()=>{});
