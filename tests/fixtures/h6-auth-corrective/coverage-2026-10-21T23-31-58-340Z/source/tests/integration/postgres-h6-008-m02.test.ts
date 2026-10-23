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

import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {ownEconomicsFixture} from '../support/h3-own-economics-fixtures.ts';
import {providerPaymentFixture} from '../support/h3-provider-payment-fixtures.ts';
import {refundFixture} from '../support/h6-refund-current-fixture.ts';
import {depositFixture} from '../support/h4-deposit-fixtures.ts';
import {preparationFixture} from '../support/h4-booking-preparation-fixtures.ts';
import {realityFixture} from '../support/h4-reality-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
import {modificationFixture} from '../support/h4-modification-fixtures.ts';
import {holdFixture} from '../support/h4-hold-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {availabilityFixture} from '../support/h4-availability-fixtures.ts';
import {invoiceFixture} from '../support/h3-invoice-fixtures.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {H1017TaskAdapter} from '../../src/infrastructure/postgres/h1-task-adapter.ts';
import {H5001TaskAdapter} from '../../src/infrastructure/postgres/h5-task-adapter.ts';
import {fingerprintHumanApprovalMaterial as mf,fingerprintHumanApprovalPart as pf} from '../../src/infrastructure/postgres/h0-011-adapter.ts';
import {alert} from '../support/h5-alert-isolated.ts';
import {observation} from '../support/h5-018-fifth-isolated.ts';
import {H1003ResolutionAdapter} from '../../src/infrastructure/postgres/h1-resolution-adapter.ts';

type Capture={instance?:any;name:string;call:(...args:any[])=>Promise<any>;args:any[];positiveUseful:boolean};
const captures=new Map<string,Capture>(),undos:(()=>void)[]=[];let depth=0,capture=false,real:VerifiedAuthEvidence,device:Awaited<ReturnType<typeof login>>;
const inventory=JSON.parse(await readFile('tests/fixtures/h6-auth-corrective/m02-input-inventory.json','utf8')).rows as {entrypoint:string;file:string}[];
const lifecycle=new Set(['H0005PostgresAdapter.establish','H0005PostgresAdapter.reidentify','H0005PostgresAdapter.revokeOne','H0005PostgresAdapter.revokeAll','H0013GlobalAccessRevocationAdapter.revokeAll']);
// Instrumentation only: unchanged methods receive actual provider-verified proof.
// Historical fixture closures otherwise retain their synthetic bootstrap proof.
for(const row of inventory){
 if(lifecycle.has(row.entrypoint)||row.entrypoint.startsWith('createPersisted'))continue;
 const [className,method]=row.entrypoint.split('.') as [string,string];
 const module=await import('../../'+row.file),prototype=module[className].prototype,original=prototype[method];
 prototype[method]=async function(...input:any[]){const args=capture?[real,...input.slice(1)]:input,outer=depth++===0;
  try{const value=await original.apply(this,args);
   // Never retain a nested adapter scoped to a transaction that has ended.
   if(capture&&outer){const previous=captures.get(row.entrypoint),useful=value!==null&&value!==undefined;
    if(!previous||useful)captures.set(row.entrypoint,{instance:this,name:row.entrypoint,call:original.bind(this),args:[args[0],args[1],...args.slice(2).map(x=>x instanceof Uint8Array?x:structuredClone(x))],positiveUseful:useful});}
   return value;
  }finally{depth--;}};undos.push(()=>{prototype[method]=original;});
}
after(()=>{for(const undo of undos.reverse())undo();});
const output=process.env.H5008_CAPTURE_DIR!;
async function summary(){await mkdir(output,{recursive:true});const missing=inventory.filter(x=>!lifecycle.has(x.entrypoint)&&!captures.has(x.entrypoint)).map(x=>x.entrypoint);
 const result={positive:[...captures.values()].map(x=>({entrypoint:x.name,useful:x.positiveUseful})).sort((a,b)=>a.entrypoint.localeCompare(b.entrypoint)),missing,lifecycle:[...lifecycle],newMetadataMethod:'H0005PostgresAdapter.identificationGeneration: F01 actual local Auth tests'};
 await writeFile(join(output,'m02-coverage.json'),JSON.stringify(result,null,2)+'\n');return result;}
async function snapshotAll(){const tables=await h.admin`select tablename from pg_tables where schemaname='crm_private' order by tablename`,result:Record<string,string>={};
 for(const {tablename} of tables)result[String(tablename)]=(await h.admin.unsafe(`select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E'\n' order by to_jsonb(r)::text),''),'sha256'),'hex') h from crm_private."${tablename}" r`))[0]!.h;
 return result;}

test('M02 controls: actual Auth proof through existing complete-chain fixtures',async t=>{
 install({});device=await login();real=device.proof;h={...h,sessionId:device.sessionId,auth:async()=>real};capture=true;
 const stages:Record<string,()=>Promise<unknown>>={
  work:async()=>{const f=await workFixture(h);await f.run(f.definition);const seen=await f.see();assert.ok(seen);captures.set('createPersistedWorkExecutor.apply',{name:'createPersistedWorkExecutor.apply',call:f.worker.apply.bind(f.worker),args:[real,write,f.definition],positiveUseful:true});captures.set('createPersistedWorkExecutor.read',{name:'createPersistedWorkExecutor.read',call:f.worker.read.bind(f.worker),args:[real,read,f.executionId,f.context],positiveUseful:true});
   await h.tte.readProposal(real,read,f.approval.proposalId);const ap=await f.approve();await h.tte.reserve(real,write,'reserve-'+uid(),ap.proposalId,ap.decisionId,f.material.parts[0]!.partId,mf(f.material),pf(f.material.parts[0]!),f.material);await f.comm.run(f.comm.derive('summary'));await f.comm.see();await h.evidence.read(real,read,f.comm.recordId,f.comm.context.contextKind,f.comm.context.contextId);
   const prep={...f.comm.context,operationId:uid(),rootId:uid(),versionId:uid(),documentId:f.comm.originalId,expectedVersion:0,sourceRef:'synthetic-m02',reason:'Synthetic actual auth scope',digest:digest(Buffer.from('M02')),size:3,media:'application/octet-stream'};
   await objects.prepare(real,write,prep);await objects.upload(real,read,write,prep.versionId,f.comm.context,Buffer.from('M02'),uid());await objects.reconcile(real,read,write,prep.versionId,f.comm.context,uid());await objects.link(real,read,write,prep.versionId,f.comm.context,uid());await objects.download(real,read,prep.versionId,f.comm.context);const orphan=uid()+'/'+uid();await storage.put(orphan,Buffer.from('SYNTHETIC orphan'),'application/octet-stream');await objects.diagnoseOrphan(real,read,write,orphan,uid());
   await h.diagnostic.record(real,write,observation('booking',f.context.contextId));await h.diagnostic.read(real,read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100});
  },
  joint:async()=>{const f=await jointFixture(h);await f.j.run(await f.j.command());await new H5011ProjectionAdapter(h.runtime,h.f1,h.f2).read(real,read,{contextKind:'booking',contextId:f.bookingId,surface:'timeline',destination:'administrator'});},
  economics:async()=>{const f=await ownEconomicsFixture(h);await h.ownEconomics.apply(real,write,await f.command());await f.see();},
  provider:async()=>{const f=await providerPaymentFixture(h);await h.providerPayments.apply(real,write,await f.open());await(await f.approval(await f.schedule())).execute();await f.view();},
  refund:async()=>{const f=await refundFixture(h);await f.run(await f.request());await f.run(await f.determine());await(await f.approval(await f.authorization())).execute();await f.view();},
  deposit:async()=>{const f=await depositFixture(h);await f.initialize();await f.run(await f.delivery());await f.run(await f.evaluate());await(await f.approval(await f.determination())).execute();await f.view();await h.refunds.applyGuarantee(real,write,await f.fact('return','30.00','20.00'));await h.refunds.read(real,read,f.bid,(await f.view()).refundId);},
  reality:async()=>{const f=await realityFixture(h);await(await f.approval(await f.command('start',{origin:'ai'}))).execute();await f.see();const p=await preparationFixture(h);await p.confirm();await p.pay();await(await p.approval(await p.command('evaluate',{origin:'ai'}))).execute();},
  incident:async()=>{const f=await incidentFixture(h);await h.incidents.apply(real,write,await f.detect());const state=await f.state();await h.incidents.byCode(real,read,state.code,f.bookingId);await h.incidents.evaluate(real,read,f.bookingId,f.impact.scope,'preparation');},
  modification:async()=>{const f=await modificationFixture(h);await f.run(await f.request([{id:f.partId,scope:f.scope,expectedScopeRevision:1,desired:{date:'2026-12-22'},aspects:['date'],dependencies:[]}]));await f.run(await f.evaluate());await h.modifications.assess(real,read,f.modificationId,f.bookingId);},
  hold:async()=>{const f=await holdFixture(h,'2026-12-20T10:00:00Z');await f.apply(await f.grant());await h.holds.read(real,read,f.holdId,f.opportunityId);await f.assess();},
  requirement:async()=>{const f=await requirementFixture(h);await h.requirements.apply(real,write,await f.need());await h.requirements.read(real,read,f.requirementId,f.bookingId);await h.requirements.evaluate(real,read,f.bookingId,f.basis.scope,f.basis.rule.purpose);},
  alert:async()=>{const q=alert();await h.alerts.apply(real,write,q);await h.alerts.read(real,read,q.alertId);},
  resolution:async()=>{const f=await bookingFixture(h);await h.booking.apply(real,write,f.q);const r=new H1003ResolutionAdapter(h.runtime,h.f1,h.f2);await r.candidates(real,read,f.f.accepterId);await r.findCode(real,read,'RES','target',f.q.bookingId);await h.identities.read(real,read,'entity',f.f.accepterId);const version=Number((await h.observer`select version from crm_private.identity_entities where identity_id=${f.f.accepterId}::uuid`)[0]!.version);await r.apply(real,write,{action:'archive',targetId:f.f.accepterId,kind:'contact',operationId:uid(),expectedVersion:version,sourceRef:'synthetic',evidenceRef:'synthetic',reason:'M02 verified local fixture'});},
  availability:async()=>{const f=await availabilityFixture(h);await f.apply(await f.query());await f.state();await f.assess();},
  invoice:async()=>{const f=await invoiceFixture(h);await h.invoices.apply(real,write,await f.need());await f.state();},
  boundary:async()=>{const f=await boundaryFixture(h);await f.run(f.base());},
  direct:async()=>{const f=await bookingFixture(h);await h.booking.direct(real,write,[],{...f.q,route:'direct'});},
  task:async()=>{const tasks=new H5001TaskAdapter(h.runtime,h.f1,h.f2),q={action:'receive' as const,operationId:uid(),taskId:uid(),expectedRevision:0,identity:{causeKind:'document',causeId:uid(),contextKind:'booking',contextId:uid(),scopeRef:uid(),relatedKind:null,relatedId:null,effect:'document-review'},material:{title:'Revisar documento sintético',deadline:{kind:'unknown' as const,reason:'Fecha no verificada'},priority:{kind:'pending' as const,reason:'Sin configurar'},sourceRef:'SM-TA-01',sourceVersion:'1',triggerRef:'BR-TASK-005',triggerVersion:'1'},reason:'Prueba local'};await new H1017TaskAdapter(h.runtime,h.f1,h.f2).apply(real,write,q);await new H1017TaskAdapter(h.runtime,h.f1,h.f2).read(real,read,q.taskId,q.identity.contextKind,q.identity.contextId);await tasks.apply(real,write,q);await tasks.read(real,read,q.taskId,q.identity.contextKind,q.identity.contextId);await tasks.transition(real,write,{action:'complete',operationId:uid(),taskId:q.taskId,expectedRevision:1,reason:'Revisión',result:'Seguimiento realizado',references:['synthetic-record-1']});},
  reads:async()=>{for(const [cls,method,args]of [
   ['H1005CatalogAdapter','read',(q:any)=>['item',q.targetId]],['H1007CommercialAdapter','read',(q:any)=>['item',q.targetId]],
   ['H2007AcceptanceAdapter','read',(q:any)=>[q.proposalId,q.versionId]],['H2009BookingAdapter','read',(q:any)=>[q.bookingId]],
   ['H2001CommercialAdapter','read',(q:any)=>[q.targetId,'opportunity']],['H2005OfferAdapter','read',(q:any)=>[q.proposalId,q.versionId]],
   ['H2003ProposalAdapter','read',(q:any)=>[q.proposalId,'internal']],['H3001ObligationAdapter','read',(q:any)=>[q.bookingId,q.scheduleId]],
   ['H3001ObligationAdapter','evaluate',(q:any)=>[q.bookingId,q.scheduleId,new Date().toISOString()]],['H3003PaymentAdapter','read',(q:any)=>[q.paymentId]],
   ['H3009SuplidoAdapter','read',(q:any)=>[q.suplidoId,q.bookingId]],['H4009ConfirmationAdapter','assess',(q:any)=>[q.confirmationId,q.bookingId]]
  ]as const){const c=captures.get(cls+'.apply');assert.ok(c,cls);await c.instance[method](real,read,...args(c.args[2]));}
  const o=captures.get('H3001ObligationAdapter.apply')!.args[2];await new H5001TaskAdapter(h.runtime,h.f1,h.f2).balanceNeeds(real,read,o.bookingId,o.scheduleId);},
  coreProbe:async()=>{const id=uid();await access.applyCoreProbe(real,write,uid(),id,'SYNTHETIC M02');await access.readCoreProbe(real,read,id);}
 };
 const failures=[];for(const [name,run]of Object.entries(stages)){try{await run();}catch(e){failures.push({stage:name,error:String(e)});}await summary();}
 capture=false;const result=await summary();t.diagnostic(JSON.stringify({positive:result.positive.length,missing:result.missing,stageFailures:failures}));assert.deepEqual(failures,[]);
});

for(const invalid of ['idle7','absolute30','disabled','recovery','enrollment','global'] as const)test(`M02 all captured entrypoints, preverified real proof denied: ${invalid}`,async t=>{
 capture=false;const original=await h.admin`select identified_at::text,last_human_activity_at::text from crm_private.identification_epochs where epoch_id=${device.epochId}::uuid`;
 try{
  if(invalid==='idle7'||invalid==='absolute30')await h.admin`update crm_private.identification_epochs set identified_at=clock_timestamp()-${invalid==='idle7'?'29 days':'30 days'}::interval,last_human_activity_at=clock_timestamp()-${invalid==='idle7'?'7 days':'1 day'}::interval where epoch_id=${device.epochId}::uuid`;
  if(invalid==='disabled')await h.admin`update crm_private.crm_actors set enabled=false where actor_id=${h.actorId}::uuid`;
  if(invalid==='recovery'||invalid==='enrollment')await h.admin`update crm_private.crm_actors set access_state=${invalid==='recovery'?'recovery_in_progress':'enrollment_required'} where actor_id=${h.actorId}::uuid`;
  if(invalid==='global'){authService.failLogout(true);assert.equal((await request('/auth/revoke-all',device.handle)).body.status,'partial');}
  const before=await snapshotAll(),errors=[];for(const row of captures.values()){try{await row.call(...row.args);errors.push({entrypoint:row.name,error:'UNAUTHORIZED_SUCCESS'});}catch(e){if(!/DENIED|AUTHORIZATION|SESSION_REQUIRED|AUTH_REQUIRED|FORBIDDEN|AUTH/.test(String(e)))errors.push({entrypoint:row.name,error:String(e)});}}
  assert.deepEqual(await snapshotAll(),before);t.diagnostic(JSON.stringify({invalid,preverifiedProof:true,denied:captures.size,unexpected:errors}));assert.deepEqual(errors,[]);
 }finally{authService.failLogout(false);await h.admin`update crm_private.crm_actors set enabled=true,access_state='ready' where actor_id=${h.actorId}::uuid`;await h.admin`update crm_private.identification_epochs set identified_at=${original[0]!.identified_at}::timestamptz,last_human_activity_at=${original[0]!.last_human_activity_at}::timestamptz where epoch_id=${device.epochId}::uuid`;}
});
