// Reuse accepted R2 interfaces on the newly restored destination. No migrations.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomUUID as uid} from 'node:crypto';
import {totp} from './h6-auth-provider-isolated.ts';
import {read,write} from './h6-current-isolated.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../../src/infrastructure/postgres/h0-013-adapter.ts';
import {H2001CommercialAdapter} from '../../src/infrastructure/postgres/h2-commercial-adapter.ts';
import {H1013EvidenceAdapter} from '../../src/infrastructure/postgres/h1-evidence-adapter.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {SupabaseAuthProvider} from '../../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../../src/server/human-auth-session.ts';
import {createHumanHttpBoundary,type HumanHttpOperation} from '../../src/server/human-http-boundary.ts';
import type {ProjectionSurface} from '../../src/domain/coordinated-projection.ts';

function latch(){let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return {promise,resolve};}
const close=async(s:ReturnType<typeof createServer>)=>{s.closeAllConnections();await new Promise<void>(r=>s.close(()=>r()));};
export async function verifyRestoredIntegration(c:any){
 const {cluster,label,f1,f2,user,auth,storage,complete,worker,work,opportunity,input,oldProof,record}=c;
 const connect=()=>cluster.connect(label,'crm_h0_runtime'),admin=cluster.connect(label),runtime=connect();
 const origin='http://127.0.0.1:59724',gateway='http://127.0.0.1:59725';
 let failLogout=false,refreshGate:any,handler:(r:Request)=>Promise<Response>=async()=>new Response(null,{status:503});
 const proxy=createServer(async(req,res)=>{try{
  if(failLogout&&req.url?.startsWith('/logout')){res.writeHead(503);res.end('{}');return;}
  const chunks:Buffer[]=[];for await(const b of req)chunks.push(b);
  const upstream=await fetch(auth.endpoint+req.url,{method:req.method,headers:req.headers as Record<string,string>,...(req.method==='GET'?{}:{body:Buffer.concat(chunks)}),redirect:'error'});
  const bytes=Buffer.from(await upstream.arrayBuffer());
  if(refreshGate&&req.url==='/token?grant_type=refresh_token'){const g=refreshGate;refreshGate=undefined;g.reached.resolve();await g.release.promise;}
  res.writeHead(upstream.status,{'Content-Type':'application/json'});res.end(bytes);
 }catch{res.writeHead(503);res.end('{}');}});
 const http=createServer(async(req,res)=>{try{const chunks:Buffer[]=[];for await(const b of req)chunks.push(b);
  const response=await handler(new Request(origin+req.url,{method:req.method,headers:req.headers as Record<string,string>,...(req.method==='GET'?{}:{body:Buffer.concat(chunks)})}));
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(503);res.end('{}');}});
 proxy.listen(59725,'127.0.0.1');await once(proxy,'listening');http.listen(59724,'127.0.0.1');await once(http,'listening');
 const provider=new SupabaseAuthProvider({endpoint:gateway,issuer:auth.issuer,allowLocalHttp:true}),access=new H0005PostgresAdapter(runtime,f1,f2);
 let sessions=new HumanAuthSessions(provider,access);const allSessions=[sessions];
 const commercial=new H2001CommercialAdapter(runtime,f1,f2),evidence=new H1013EvidenceAdapter(runtime,f1,f2),projection=new H5011ProjectionAdapter(runtime,f1,f2),objects=new H1015ObjectAdapter(runtime,storage,f1,f2);
 const operations:Record<string,HumanHttpOperation>={},context=complete.context,prep=complete.prep,f=work;
 const add=(name:string,event:HumanHttpOperation['event'],execute:HumanHttpOperation['execute'])=>{operations['/core/'+name]={event,execute:async(a,i,b)=>{if(Object.keys(b as object).length)throw new Error('INPUT_DENIED');return execute(a,i,b);}};};
 add('commercial.read','core-read',(a,i)=>commercial.read(a,i,opportunity.targetId,'opportunity'));
 add('commercial.mutate','core-action',(a,i)=>commercial.apply(a,i,input()));
 add('commercial.replay','core-action',(a,i)=>commercial.apply(a,i,opportunity));
 add('work.read','core-read',(a,i)=>worker.read(a,i,f.executionId,f.context));
 add('work.replay','core-action',(a,i)=>worker.apply(a,i,f.definition));
 add('evidence.read','core-read',(a,i)=>evidence.read(a,i,f.comm.recordId,context.contextKind,context.contextId));
 for(const surface of ['timeline','calendar','query','search','export','document','ai_context'] as ProjectionSurface[])add('projection.'+surface,'core-read',(a,i)=>projection.read(a,i,{contextKind:'opportunity',contextId:opportunity.targetId,surface,destination:'administrator'}));
 add('object.metadata','core-read',(a,i)=>objects.metadata(a,i,prep.versionId,context));
 add('object.download','core-read',async(a,i)=>Buffer.from(await objects.download(a,i,prep.versionId,context)).toString());
 add('object.replay','core-action',(a,i)=>objects.prepare(a,i,prep));assert.equal(Object.keys(operations).length,16);
 const install=(s=sessions,ops=operations)=>{sessions=s;const global=new H0013GlobalAccessRevocationAdapter(connect(),f1,f2,s);handler=createHumanHttpBoundary({origin,allowLocalHttp:true,sessions:s,revokeAll:a=>global.revokeAll(a),operations:ops,maxBodyBytes:8192});};install();
 const request=async(path:string,handle?:string,body:unknown={},headers:Record<string,string>={})=>{const r=await fetch(origin+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(handle?{Authorization:'Bearer '+handle}:{}),...headers},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
 const login=async()=>{const r=await request('/auth/login',undefined,{email:user.email,password:user.password,code:totp(user.secret)});assert.equal(r.status,200,'RESTORED_HTTP_LOGIN');return {handle:r.body.handle as string,proof:await verifyAuth(sessions,r.body.handle)};};
 const witness=async()=>{const v:Record<string,string>={};for(const t of ['b03_opportunities','b07_records','b07_history','b07_operations','b08_parts','b08_attempts','b08_command_results','identification_epochs'])v[t]=(await admin.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E'\n' order by to_jsonb(r)::text),''),'sha256'),'hex') h from crm_private.${t} r`))[0]!.h;return v;};
 const denied=async(handle:string)=>{const before=await witness();for(const path of Object.keys(operations)){const r=await request(path,handle);assert.equal(r.status,403,'DENIED '+path);assert.deepEqual(r.body,{error:'ACCESS_DENIED'});}assert.deepEqual(await witness(),before);};
 const directDenied=async(proof:any)=>{
  const control=await login();const positive=async()=>{for(const op of Object.values(operations)){const value=await op.execute(control.proof,op.event==='core-read'?read:write,{});assert.ok(value!==undefined&&value!==null,'POSITIVE_SAME_OPERATION');}};await positive();
  assert.equal((await runtime`select 1 as live`)[0]!.live,1);const before=await witness();
  for(const [path,op]of Object.entries(operations)){let error:any;try{await op.execute(proof,op.event==='core-read'?read:write,{});}catch(e){error=e;}
   const family=path.split('/')[2]!.split('.')[0]!,expected=({commercial:'COMMERCIAL_DENIED',work:'WORK_DENIED',evidence:'B07_DENIED',projection:'PROJECTION_DENIED',object:'OBJECT_DENIED'} as Record<string,string>)[family];
   assert.ok(error,'EXPECTED_CORE_DENIAL');assert.ok(error.message===expected||error.code==='42501','EXACT_CORE_DENIAL_CLASS');
  }
  assert.deepEqual(await witness(),before);assert.equal((await runtime`select 1 as live`)[0]!.live,1);await positive();
 };
 const revoke=async(handle:string,expected='completed')=>{const r=await request('/auth/revoke-all',handle);assert.equal(r.status,200);assert.equal(r.body.status,expected);assert.equal(r.body.auth,expected==='completed'?'revoked':'uncertain');return r;};
 try{
  await directDenied(oldProof);record('integrated_old_t0_preverified_proof_16_denied',{surfaces:16,noMutation:true});
  let a=await login(),b=await login();
  for(const path of Object.keys(operations)){const r=await request(path,a.handle);assert.equal(r.status,200,'POSITIVE '+path);assert.ok(r.body.value!==null&&r.body.value!==undefined);}assert.equal((await request('/core/object.download',a.handle)).body.value,complete.bytes.toString());record('integrated_HTTP_16_positive',{surfaces:16});
  const epoch=async()=>(await admin`select identified_at::text,last_human_activity_at::text,current_epoch from crm_private.identification_epochs where session_id=${a.proof.sessionId}::uuid`)[0]!;
  const before=await epoch();const parallel=await Promise.all([request('/auth/refresh',a.handle),request('/auth/refresh',a.handle)]);parallel.forEach(r=>assert.equal(r.status,200));assert.deepEqual(await epoch(),before);record('integrated_concurrent_refresh_no_core_activity',{requests:2});
  const raw=await provider.login(user.email,user.password,totp(user.secret));await denied(raw.accessToken);
  assert.equal((await request('/auth/login',undefined,{email:user.email,password:'invalid-synthetic-password',code:totp(user.secret)})).status,403);
  const badCode=String((Number(totp(user.secret))+1)%1000000).padStart(6,'0');assert.equal((await request('/auth/login',undefined,{email:user.email,password:user.password,code:badCode})).status,403);
  for(const body of [{human:true},{sessionId:b.proof.sessionId},{subject:user.id,role:'administrator'}])assert.equal((await request('/core/projection.timeline',a.handle,body)).status,403);
  assert.equal((await request('/core/projection.timeline',a.handle,{}, {Origin:'https://attacker.invalid'})).status,403);record('integrated_identity_HTTP_ingress_denials',{rawJWTsurfaces:16,invalidPassword:true,invalidTotp:true,clientAuthorityRejected:true});
  assert.equal((await request('/auth/logout',a.handle)).body.auth,'revoked');await denied(a.handle);assert.equal((await request('/core/projection.timeline',b.handle)).status,200);record('integrated_local_logout_other_session_preserved',{surfaces:16});
  await revoke(b.handle);await denied(b.handle);await directDenied(b.proof);record('integrated_global_revocation_issuer_and_preverified',{http:16,direct:16});
  // Actual SQL locks prove both serialization orders on the restored cluster.
  for(const revocationFirst of [false,true]){
   a=await login();b=await login();const holder=cluster.connect(label),watcher=cluster.connect(label),held=latch(),release=latch();
   const locked=holder.begin(async(tx:any)=>{await tx.unsafe(`lock table crm_private.${revocationFirst?'global_access_revocations':'b03_opportunities'} in access exclusive mode`);held.resolve();await release.promise;});await held.promise;
   const wait=async(fragment:string)=>{for(let i=0;i<200;i++){const rows=await watcher`select pid,wait_event_type,pg_blocking_pids(pid) blockers from pg_stat_activity where datname=current_database() and wait_event_type='Lock' and query like ${'%'+fragment+'%'} and pid<>pg_backend_pid()`;if(rows.length)return rows.map((r:any)=>({...r}));await new Promise(r=>setTimeout(r,20));}throw new Error('REAL_LOCK_NOT_OBSERVED');};
   let operation:any,closing:any,first:any,second:any;
   try{if(revocationFirst){closing=request('/auth/revoke-all',b.handle);first=await wait('start_global_access_revocation');operation=request('/core/projection.timeline',a.handle);second=await wait('h5_projection_read');}else{operation=request('/core/projection.timeline',a.handle);first=await wait('h5_projection_read');closing=request('/auth/revoke-all',b.handle);second=await wait('start_global_access_revocation');}}
   finally{release.resolve();await locked;}
   assert.equal((await closing).body.status,'completed');assert.equal((await operation).status,revocationFirst?403:200);await denied(a.handle);record('integrated_real_concurrency_'+String(revocationFirst),{first,second,expectedHTTP:revocationFirst?403:200,postRevocationDenied:16});
  }
  a=await login();b=await login();const fetched=latch(),releaseBytes=latch();
  const delayed=new H1015ObjectAdapter(connect(),{put:(...args:any[])=>storage.put(...args),inventory:(p:any)=>storage.inventory(p),get:async(p:any)=>{const value=await storage.get(p);assert.ok(value);fetched.resolve();await releaseBytes.promise;return value;}},f1,f2);
  install(sessions,{...operations,'/core/object.download':{event:'core-read',execute:async(a,i)=>Buffer.from(await delayed.download(a,i,prep.versionId,context)).toString()}});
  const pendingBytes=request('/core/object.download',a.handle);await fetched.promise;try{await revoke(b.handle);}finally{releaseBytes.resolve();}
  assert.equal((await pendingBytes).status,403);install();record('integrated_late_private_bytes_denied',{fetched:true,released:false});
  a=await login();b=await login();const refresh={reached:latch(),release:latch()};refreshGate=refresh;const pendingRefresh=request('/auth/refresh',a.handle);await refresh.reached.promise;
  try{await revoke(b.handle);}finally{refresh.release.resolve();}assert.equal((await pendingRefresh).status,403);await denied(a.handle);record('integrated_real_late_refresh_denied',{providerCompleted:true,lateHTTP:403});
  // Two independent app instances: real provider, intercepted logout failure only.
  for(const stage of ['before-totp','before-establish','after-establish']){
   const original=sessions;a=await login();b=await login();const reached=latch(),release=latch();let armed=true;
   const delayedAccess={identificationGeneration:async(...args:Parameters<typeof access.identificationGeneration>)=>{const v=await access.identificationGeneration(...args);if(armed&&stage==='before-totp'){armed=false;reached.resolve();await release.promise;}return v;},
    establish:async(...args:Parameters<typeof access.establish>)=>{if(armed&&stage==='before-establish'){armed=false;reached.resolve();await release.promise;}const v=await access.establish(...args);if(armed&&stage==='after-establish'){armed=false;reached.resolve();await release.promise;}return v;},
    revokeOne:(...args:Parameters<typeof access.revokeOne>)=>access.revokeOne(...args)};
   const independent=new HumanAuthSessions(provider,delayedAccess);allSessions.push(independent);install(independent);
   const pending=request('/auth/login',undefined,{email:user.email,password:user.password,code:totp(user.secret)});await reached.promise;
   failLogout=true;install(original);let count:number;
   try{await revoke(b.handle,'partial');await directDenied(a.proof);count=(await admin`select count(*)::int n from crm_private.crm_sessions`)[0]!.n;release.resolve();const late=await pending;assert.equal(late.status,stage==='after-establish'?200:403);assert.equal((await admin`select count(*)::int n from crm_private.crm_sessions`)[0]!.n,count);
    install(independent);if(stage==='after-establish'){await denied(late.body.handle);await directDenied(await verifyAuth(independent,late.body.handle));}
    const fresh=await login();assert.equal((await request('/core/projection.timeline',fresh.handle)).status,200);
    record('integrated_F01_'+stage,{independentServers:2,realProvider:true,logoutHTTP503:true,lateHTTP:late.status,noNewCoreSessionAfterClosure:true,freshIdentification:200});
   }finally{release.resolve();failLogout=false;original.close();install(independent);}
  }
  const outsider=await auth.createUser(uid());assert.equal((await request('/auth/login',undefined,{email:outsider.email,password:outsider.password,code:totp(outsider.secret)})).status,403);record('integrated_unmapped_real_identity_denied');
  const fresh=await login();await revoke(fresh.handle);record('integrated_final_quarantine_no_reentry');
 }finally{refreshGate?.release.resolve();for(const s of allSessions)s.close();await close(http);await close(proxy);}
}
