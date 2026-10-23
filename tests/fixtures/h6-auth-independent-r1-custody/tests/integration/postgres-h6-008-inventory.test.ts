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
 provider=new SupabaseAuthProvider({endpoint:authService.gateway,issuer:authService.endpoint,allowLocalHttp:true});
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


test('I05: inventory live SQL functions and authority paths after all 68 migrations',async t=>{
 const fs=await import('node:fs/promises');
 const rows=await h.admin`select n.nspname schema,p.proname name,pg_get_function_identity_arguments(p.oid) arguments,pg_get_functiondef(p.oid) definition,p.prosecdef security_definer,r.rolname owner,has_function_privilege('crm_h0_runtime',p.oid,'execute') runtime_execute from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where n.nspname in ('crm_api','crm_f1','crm_f2') and p.prokind='f' order by n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)`;
 const out='tests/fixtures/h6-auth-independent-review/live-sql-functions.json';
 await fs.writeFile(out,JSON.stringify({migrations:68,functions:rows.map(r=>({...r}))},null,2)+'\n');
 assert.ok(rows.some(r=>r.schema==='crm_f2'&&r.name==='admit'));
 t.diagnostic(JSON.stringify({functions:rows.length,output:out}));
});
