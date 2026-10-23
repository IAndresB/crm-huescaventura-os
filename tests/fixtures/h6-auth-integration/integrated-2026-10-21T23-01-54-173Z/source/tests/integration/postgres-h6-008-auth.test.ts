import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {isolatedWork,workFixture,read,write} from '../support/h6-current-isolated.ts';
import {isolatedAuth,totp} from '../support/h6-auth-provider-isolated.ts';
import {verifyAuth,type VerifiedAuthEvidence} from '../../src/application/verified-auth.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../../src/infrastructure/postgres/h0-013-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {SupabasePrivateStorage,digest} from '../../src/infrastructure/storage/private-storage.ts';
import {SupabaseAuthProvider} from '../../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../../src/server/human-auth-session.ts';
import {createHumanHttpBoundary,type HumanHttpOperation} from '../../src/server/human-http-boundary.ts';
import type {ProjectionSurface} from '../../src/domain/coordinated-projection.ts';

const origin='http://127.0.0.1:59621',endpoint=process.env.STORAGE_H1_ENDPOINT!;
let h:Awaited<ReturnType<typeof isolatedWork>>,authService:Awaited<ReturnType<typeof isolatedAuth>>;
let provider:SupabaseAuthProvider,sessions:HumanAuthSessions,access:H0005PostgresAdapter,global:H0013GlobalAccessRevocationAdapter;
let user:Awaited<ReturnType<Awaited<ReturnType<typeof isolatedAuth>>['createUser']>>;
let storage:SupabasePrivateStorage,objects:H1015ObjectAdapter,bucket:string;
let handler:(r:Request)=>Promise<Response>=async()=>new Response(null,{status:503});
const http=createServer(async(req,res)=>{
 try{const chunks:Buffer[]=[];for await(const c of req)chunks.push(c);const response=await handler(new Request(origin+req.url,{method:req.method,headers:req.headers as Record<string,string>,...(req.method==='GET'?{}:{body:Buffer.concat(chunks)})}));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503);res.end();}
});
const install=(operations:Record<string,HumanHttpOperation>)=>{handler=createHumanHttpBoundary({origin,allowLocalHttp:true,sessions,
 revokeAll:a=>global.revokeAll(a),operations,maxBodyBytes:8192});};
const request=async(path:string,handle?:string,body:unknown={},headers:Record<string,string>={})=>{
 const r=await fetch(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(handle?{Authorization:`Bearer ${handle}`}:{ }),...headers},body:JSON.stringify(body)});
 return {status:r.status,body:await r.json(),headers:r.headers};
};
async function login(who=user){
 const r=await request('/auth/login',undefined,{email:who.email,password:who.password,code:totp(who.secret)});assert.equal(r.status,200,'real password/TOTP login');
 const handle=r.body.handle as string,proof=await verifyAuth(sessions,handle);
 const row=(await h.admin`select e.epoch_id::text from crm_private.identification_epochs e where e.session_id=${proof.sessionId!}::uuid and e.current_epoch`)[0]!;
 return {handle,proof,sessionId:proof.sessionId!,epochId:row.epoch_id as string};
}
before(async()=>{
 h=await isolatedWork('crm_h6008_http',59618);
 const f1={...h.f1,allowedPurposes:[...h.f1.allowedPurposes,'h0-005-human-bridge','h0-013-auth-revocation']};await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;h={...h,f1};
 authService=await isolatedAuth(h,59618);user=await authService.createUser(h.subject);
 provider=new SupabaseAuthProvider({endpoint:authService.endpoint,issuer:authService.endpoint,allowLocalHttp:true});
 access=new H0005PostgresAdapter(h.runtime,h.f1,h.f2);sessions=new HumanAuthSessions(provider,access);
 global=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2,sessions);install({});
 http.listen(59621,'127.0.0.1');await once(http,'listening');
 bucket='synthetic-h6008-http-'+uid();const created=await fetch(`${endpoint}/bucket`,{method:'POST',headers:{Authorization:`Bearer ${authService.serviceToken}`,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false})});assert.equal(created.status,200);
 storage=new SupabasePrivateStorage(endpoint,bucket,authService.serviceToken);objects=new H1015ObjectAdapter(h.runtime,storage,h.f1,h.f2);
});
after(async()=>{sessions?.close();http.closeAllConnections();await new Promise<void>(r=>http.close(()=>r()));await authService?.close();await h?.close();});

const surfaces:ProjectionSurface[]=['timeline','calendar','query','search','export','document','ai_context'];
async function fixture(){
 install({});const a=await login(),b=await login(),hh={...h,sessionId:a.sessionId,auth:async()=>a.proof},f=await workFixture(hh);
 await f.run(f.definition);const opportunity=h.input();await h.adapter.apply(a.proof,write,opportunity);
 const projection=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2),context=f.comm.context,bytes=Buffer.from('SYNTHETIC H6-008 Auth private object');
 const prep={...context,operationId:uid(),rootId:uid(),versionId:uid(),documentId:f.comm.originalId,expectedVersion:0,sourceRef:'synthetic-h6008-auth',reason:'Local integrated security verification',digest:digest(bytes),size:bytes.length,media:'application/octet-stream'};
 await objects.prepare(a.proof,write,prep);await objects.upload(a.proof,read,write,prep.versionId,context,bytes,uid());await objects.reconcile(a.proof,read,write,prep.versionId,context,uid());await objects.link(a.proof,read,write,prep.versionId,context,uid());
 const query=(surface:ProjectionSurface)=>({contextKind:'opportunity' as const,contextId:opportunity.targetId,surface,destination:'administrator' as const});
 const operations:Record<string,HumanHttpOperation>={};
 const add=(name:string,event:HumanHttpOperation['event'],execute:HumanHttpOperation['execute'])=>{operations['/core/'+name]={event,execute:async(a,i,b)=>{if(Object.keys(b as object).length)throw new Error('INPUT_DENIED');return execute(a,i,b);}};};
 add('commercial.read','core-read',(a,i)=>h.adapter.read(a,i,opportunity.targetId,'opportunity'));
 add('commercial.mutate','core-action',(a,i)=>h.adapter.apply(a,i,h.input()));
 add('commercial.replay','core-action',(a,i)=>h.adapter.apply(a,i,opportunity));
 add('work.read','core-read',(a,i)=>f.worker.read(a,i,f.executionId,f.context));
 add('work.replay','core-action',(a,i)=>f.worker.apply(a,i,f.definition));
 add('evidence.read','core-read',(a,i)=>h.evidence.read(a,i,f.comm.recordId,context.contextKind,context.contextId));
 for(const surface of surfaces)add('projection.'+surface,'core-read',(a,i)=>projection.read(a,i,query(surface)));
 add('object.metadata','core-read',(a,i)=>objects.metadata(a,i,prep.versionId,context));
 add('object.download','core-read',async(a,i)=>Buffer.from(await objects.download(a,i,prep.versionId,context)).toString('utf8'));
 add('object.replay','core-action',(a,i)=>objects.prepare(a,i,prep));install(operations);
 for(const path of Object.keys(operations)){const r=await request(path,a.handle);assert.equal(r.status,200,'positive '+path);assert.ok(r.body.value!==null&&r.body.value!==undefined);}
 assert.equal((await request('/core/object.download',a.handle)).body.value,bytes.toString());
 return {a,b,f,prep,context,bytes,operations,projection,query};
}
async function witness(){
 const result:Record<string,string>={};
 for(const table of ['b03_opportunities','b07_records','b07_history','b07_operations','b08_parts','b08_attempts','b08_command_results','identification_epochs'])result[table]=(await h.admin.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E'\n' order by to_jsonb(r)::text),''),'sha256'),'hex') h from crm_private.${table} r`))[0]!.h;
 return result;
}
async function denied(f:Awaited<ReturnType<typeof fixture>>,handle=f.a.handle){
 const before=await witness();for(const path of Object.keys(f.operations)){const r=await request(path,handle);assert.equal(r.status,403,'denied '+path);assert.deepEqual(r.body,{error:'ACCESS_DENIED'});}
 assert.deepEqual(await witness(),before,'no data/history/activity changes after denied HTTP');
}
const epoch=async(id:string)=>(await h.admin`select identified_at::text,last_human_activity_at::text,current_epoch from crm_private.identification_epochs where epoch_id=${id}::uuid`)[0]!;

test('A01 A11: actual provider password, TOTP, identity, signup and forged claims',async t=>{
 const f=await fixture();
 const badPassword=await request('/auth/login',undefined,{email:user.email,password:'invalid-synthetic-password',code:totp(user.secret)});assert.equal(badPassword.status,403);
 const badCode=String((Number(totp(user.secret))+1)%1000000).padStart(6,'0');assert.equal((await request('/auth/login',undefined,{email:user.email,password:user.password,code:badCode})).status,403);
 assert.ok((await authService.request('/signup',{email:'public@example.invalid',password:user.password})).status>=400);
 const aal1=await authService.request('/token?grant_type=password',{email:user.email,password:user.password});assert.equal(aal1.status,200);
 const id=await provider.verify(aal1.value.access_token);assert.equal(id.passwordVerified,true);assert.equal(id.mfaVerified,false);
 await denied(f,aal1.value.access_token);
 const valid=user.first.access_token as string,parts=valid.split('.');const claim=JSON.parse(Buffer.from(parts[1]!,'base64url').toString());
 for(const changes of [{sub:uid()},{aal:'aal2',role:'service_role'},{session_id:uid()}]){
  const altered=[parts[0],Buffer.from(JSON.stringify({...claim,...changes})).toString('base64url'),parts[2]].join('.');await assert.rejects(provider.verify(altered));
 }
 const expired=authService.signAdversarial({...claim,exp:Math.floor(Date.now()/1000)-1});await assert.rejects(provider.verify(expired));
 t.diagnostic(JSON.stringify({realProvider:'v2.197.0',actualPassword:true,actualTOTP:true,publicSignupDenied:true,AAL1CannotEnterCore:true,forgedClaims:3,expiredTokenDenied:true}));await h.closeExecutors();
});

for(const invalid of ['idle7','absolute30','disabled','recovery','enrollment','logout']as const)test(`A03 A04 A12: ${invalid} across sixteen HTTP surfaces`,async t=>{
 const f=await fixture();
 try{
  if(invalid==='idle7'||invalid==='absolute30')await h.admin`update crm_private.identification_epochs set identified_at=clock_timestamp()-${invalid==='idle7'?'29 days':'30 days'}::interval,last_human_activity_at=clock_timestamp()-${invalid==='idle7'?'7 days':'1 day'}::interval where epoch_id=${f.a.epochId}::uuid`;
  if(invalid==='disabled')await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
  if(invalid==='recovery'||invalid==='enrollment')await h.admin`update crm_private.crm_actors set access_state=${invalid==='recovery'?'recovery_in_progress':'enrollment_required'} where actor_id=${h.actorId}::uuid`;
  if(invalid==='logout')assert.equal((await request('/auth/logout',f.a.handle)).body.auth,'revoked');
  await denied(f);
  if(['idle7','absolute30','logout'].includes(invalid))assert.equal((await request('/core/projection.timeline',f.b.handle)).status,200);
  if(invalid==='idle7'||invalid==='absolute30'){
   const before=await epoch(f.a.epochId);assert.equal((await request('/auth/refresh',f.a.handle)).status,200);assert.deepEqual(await epoch(f.a.epochId),before);await denied(f);
   const fresh=await login();assert.notEqual(fresh.sessionId,f.a.sessionId);assert.notEqual(fresh.epochId,f.a.epochId);assert.equal((await request('/core/projection.timeline',fresh.handle)).status,200);assert.deepEqual(await epoch(f.a.epochId),before);
  }
  t.diagnostic(JSON.stringify({invalid,positive:16,denied:16,realAuth:true,realHTTP:true,noMutationOnDenial:true}));
 }finally{await h.admin`update crm_private.crm_actors set enabled=true,access_state='ready' where actor_id=${h.actorId}::uuid`;await h.closeExecutors();}
});

test('A02 A05 A11: refresh, independent devices and server-classified HTTP interaction',async t=>{
 const f=await fixture();await h.admin`update crm_private.identification_epochs set last_human_activity_at=clock_timestamp()-interval '6 days' where epoch_id=${f.a.epochId}::uuid`;
 const before=await epoch(f.a.epochId);const both=await Promise.all([request('/auth/refresh',f.a.handle),request('/auth/refresh',f.a.handle)]);both.forEach(r=>assert.equal(r.status,200));
 assert.deepEqual(await epoch(f.a.epochId),before);assert.equal((await verifyAuth(sessions,f.a.handle)).sessionId,f.a.sessionId);
 assert.equal((await request('/core/projection.timeline',f.b.handle)).status,200);assert.deepEqual(await epoch(f.a.epochId),before);
 for(const body of [{human:true},{sessionId:f.b.sessionId},{subject:h.subject,role:'administrator'},{interactionClass:'interactive_read'}])assert.equal((await request('/core/projection.timeline',f.a.handle,body)).status,403);
 for(const path of ['/polling','/background-job','/passive'])assert.equal((await request(path,f.a.handle)).status,404);
 for(const headers of [{Origin:'https://attacker.invalid'},{Origin:''},{'sec-fetch-site':'cross-site'},{'Content-Type':'text/plain'}] as Record<string,string>[])assert.equal((await request('/core/projection.timeline',f.a.handle,{},headers)).status,403);
 assert.equal((await request('/core/projection.timeline',f.a.handle,{padding:'x'.repeat(9000)})).status,413);
 assert.equal((await fetch(origin+'/core/projection.timeline',{headers:{Origin:origin,Authorization:'Bearer '+f.a.handle}})).status,403);
 assert.deepEqual(await epoch(f.a.epochId),before);assert.equal((await request('/core/projection.timeline',f.a.handle)).status,200);assert.notEqual((await epoch(f.a.epochId)).last_human_activity_at,before.last_human_activity_at);
 t.diagnostic(JSON.stringify({refreshConcurrent:2,sameCoreSession:true,epochUnchangedByRefresh:true,deviceBDoesNotExtendA:true,invalidIngressDenied:true}));await h.closeExecutors();
});

test('A06 A07: real provider logout semantics, global closure including issuer and fresh login',async t=>{
 const f=await fixture();const raw=await provider.login(user.email,user.password,totp(user.secret));
 assert.equal(authService.verifySignature(raw.accessToken),true);await provider.logout(raw.accessToken,'local');
 assert.equal(authService.verifySignature(raw.accessToken),true,'logout does not change cryptographic signature');
 const claims=JSON.parse(Buffer.from(raw.accessToken.split('.')[1]!,'base64url').toString());assert.ok(claims.exp>Date.now()/1000);
 await assert.rejects(provider.verify(raw.accessToken));await assert.rejects(provider.refresh(raw));
 const generation=(await h.admin`select access_generation::text from crm_private.crm_actors where actor_id=${h.actorId}::uuid`)[0]!.access_generation;
 const closed=await request('/auth/revoke-all',f.b.handle);assert.equal(closed.status,200);assert.equal(closed.body.status,'completed');assert.equal(closed.body.auth,'revoked');assert.equal(BigInt(closed.body.accessGeneration),BigInt(generation)+1n);
 await denied(f);await denied(f,f.b.handle);assert.equal((await request('/auth/refresh',f.a.handle)).status,403);assert.equal((await request('/auth/refresh',f.b.handle)).status,403);
 const fresh=await login();assert.equal((await request('/core/projection.timeline',fresh.handle)).status,200);
 t.diagnostic(JSON.stringify({oldJWTSignatureStillValid:true,oldJWTNotExpired:true,providerUserAndRefreshRejected:true,globalIncludesIssuer:true,newFullLogin:true}));await h.closeExecutors();
});

test('A10: actual Auth JWT against private Storage and late bytes after Core revocation',async t=>{
 const f=await fixture(),raw=await provider.login(user.email,user.password,totp(user.secret));
 const known=`${endpoint}/object/authenticated/${bucket}/${f.prep.rootId}/${f.prep.versionId}`;
 const deniedDirect=await fetch(known,{headers:{Authorization:`Bearer ${raw.accessToken}`}});assert.ok(!deniedDirect.ok);assert.ok(!(await deniedDirect.text()).includes(f.bytes.toString()));
 let ready!:()=>void,release!:()=>void;const fetched=new Promise<void>(r=>ready=r),gate=new Promise<void>(r=>release=r);
 const delayed=new H1015ObjectAdapter(h.connect('crm_h0_runtime'),{put:(...a)=>storage.put(...a),inventory:p=>storage.inventory(p),get:async p=>{const real=await storage.get(p);assert.ok(real);ready();await gate;return real;}},h.f1,h.f2);
 install({...f.operations,'/core/object.download':{event:'core-read',execute:async(a,i)=>Buffer.from(await delayed.download(a,i,f.prep.versionId,f.context)).toString()}});
 const pending=request('/core/object.download',f.a.handle);await fetched;
 try{assert.equal((await request('/auth/revoke-all',f.b.handle)).body.status,'completed');}finally{release();}
 const late=await pending;assert.equal(late.status,403);assert.deepEqual(late.body,{error:'ACCESS_DENIED'});
 t.diagnostic(JSON.stringify({realProviderJWTPrivateStorageDenied:true,storageBytesFetched:true,revocationBeforeRelease:true,bytesReleased:false}));await h.closeExecutors();
});

for(const revocationFirst of [false,true])test(`A09: HTTP and actual PG overlap; revocationFirst=${revocationFirst}`,async t=>{
 const f=await fixture(),holder=h.connect('h2_bootstrap'),watcher=h.connect('h2_bootstrap');
 let ready!:()=>void,release!:()=>void;const held=new Promise<void>(r=>ready=r),gate=new Promise<void>(r=>release=r);
 const locked=holder.begin(async tx=>{await tx.unsafe(`lock table crm_private.${revocationFirst?'global_access_revocations':'b03_opportunities'} in access exclusive mode`);ready();await gate;});await held;
 const wait=async(fragment:string)=>{for(let i=0;i<200;i++){const rows=await watcher`select pid,wait_event_type,pg_blocking_pids(pid) blockers from pg_stat_activity where datname=current_database() and wait_event_type='Lock' and query like ${'%'+fragment+'%'} and pid<>pg_backend_pid()`;if(rows.length)return rows.map(x=>({...x}));await new Promise(r=>setTimeout(r,20));}throw new Error('REAL_LOCK_NOT_OBSERVED');};
 let operation:ReturnType<typeof request>|undefined,closing:ReturnType<typeof request>|undefined,first:unknown,second:unknown;
 try{
  if(revocationFirst){closing=request('/auth/revoke-all',f.b.handle);first=await wait('start_global_access_revocation');operation=request('/core/projection.timeline',f.a.handle);second=await wait('h5_projection_read');}
  else{operation=request('/core/projection.timeline',f.a.handle);first=await wait('h5_projection_read');closing=request('/auth/revoke-all',f.b.handle);second=await wait('start_global_access_revocation');}
 }finally{release();await locked;}
 assert.equal((await closing!).body.status,'completed');assert.equal((await operation!).status,revocationFirst?403:200);await denied(f);
 t.diagnostic(JSON.stringify({revocationFirst,first,second,readAllowed:!revocationFirst,postClosureDenied:true,realHTTP:true,realProvider:true}));await h.closeExecutors();
});

test('A12: unmapped actual identity, incomplete factor and editable metadata cannot grant authority',async t=>{
 const f=await fixture(),outsider=await authService.createUser();
 const attempt=await request('/auth/login',undefined,{email:outsider.email,password:outsider.password,code:totp(outsider.secret)});assert.equal(attempt.status,403);
 const incomplete=await authService.createUser(uid(),false);assert.equal((await request('/auth/login',undefined,{email:incomplete.email,password:incomplete.password,code:'000000'})).status,403);
 const changed=await authService.request('/user',{data:{role:'administrator',actor_id:h.actorId,session_id:f.a.sessionId}},outsider.first.access_token,'PUT');assert.equal(changed.status,200);
 assert.equal((await request('/auth/login',undefined,{email:outsider.email,password:outsider.password,code:totp(outsider.secret)})).status,403);
 t.diagnostic(JSON.stringify({actualUnmappedSubjectDenied:true,incompleteMFADenied:true,userMetadataGrantsNothing:true}));await h.closeExecutors();
});

test('A02: restart loses only server handles and requires new full identification',async t=>{
 const f=await fixture(),before=await epoch(f.a.epochId);sessions.close();sessions=new HumanAuthSessions(provider,access);global=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),h.f1,h.f2,sessions);install(f.operations);
 await denied(f);assert.equal((await request('/auth/refresh',f.a.handle)).status,403);assert.deepEqual(await epoch(f.a.epochId),before);
 const fresh=await login();assert.notEqual(fresh.sessionId,f.a.sessionId);assert.equal((await request('/core/projection.timeline',fresh.handle)).status,200);
 t.diagnostic(JSON.stringify({oldHandleRejected:true,oldEpochUnchanged:true,newPasswordAndTOTPRequired:true}));await h.closeExecutors();
});
