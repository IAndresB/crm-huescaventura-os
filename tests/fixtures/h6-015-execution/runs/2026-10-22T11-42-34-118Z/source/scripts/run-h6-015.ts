// Authorized synthetic S01-S10, partial S12-S13. S11 is deliberately absent.
import assert from 'node:assert/strict';
import {randomBytes,randomUUID as uid} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdir,mkdtemp,writeFile,readFile,cp,stat} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {createConnection,createServer as netServer} from 'node:net';
import {createServer} from 'node:http';
import {once} from 'node:events';
import postgres from 'postgres';
import {isolatedWork,workFixture,read,write} from '../tests/support/h6-current-isolated.ts';
import {paymentFixture} from '../tests/support/h3-payment-fixtures.ts';
import {totp} from '../tests/support/h6-auth-provider-isolated.ts';
import {bin,hash,command,cluster,pgArgs,filesInventory,snapshot,compareSnapshot,authService,storageService,nativeEvents,sleep,storageSource,type Cluster} from '../tests/support/h6-015-runtime.ts';
import {verifyAuth} from '../src/application/verified-auth.ts';
import {H0005PostgresAdapter} from '../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../src/infrastructure/postgres/h0-013-adapter.ts';
import {H2001CommercialAdapter} from '../src/infrastructure/postgres/h2-commercial-adapter.ts';
import {H1013EvidenceAdapter} from '../src/infrastructure/postgres/h1-evidence-adapter.ts';
import {H5011ProjectionAdapter} from '../src/infrastructure/postgres/h5-projection-adapter.ts';
import {H1015ObjectAdapter} from '../src/infrastructure/postgres/h1-object-adapter.ts';
import {H3003PaymentAdapter} from '../src/infrastructure/postgres/h3-payment-adapter.ts';
import {SupabasePrivateStorage,digest} from '../src/infrastructure/storage/private-storage.ts';
import {SupabaseAuthProvider} from '../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../src/server/human-auth-session.ts';
import {createHumanHttpBoundary} from '../src/server/human-http-boundary.ts';
import {createPersistedWorkExecutor} from '../src/infrastructure/postgres/persisted-work-executor.ts';

process.umask(0o077);
const root=resolve('.'),base='tests/fixtures/h6-015-execution',stamp=new Date().toISOString().replaceAll(':','-').replaceAll('.','-');
const out=join(base,'runs',stamp);await mkdir(out,{recursive:true});
const privateRoot=await mkdtemp('/tmp/h6015-');
process.env.H6015_PRIVATE_PARENT=privateRoot;process.env.POSTGRES_H0_BIN=bin;delete process.env.H4014_CAPTURE_DIR;
const started=performance.now(),report:any={version:1,run:stamp,utc:new Date().toISOString(),privateRoot,scope:'local synthetic quarantine',state:'RUNNING',explicitReentry:false,taskCompleted:false,phases:[],checks:[],failures:[],unexecuted:['S11'],pending:['ARCH-PENDING-002','DM-PENDING-005']};
let phaseName='initialization';const cleanups:(()=>Promise<unknown>)[]=[];
const save=()=>writeFile(join(out,'report.json'),JSON.stringify({...report,nativeEvents,totalElapsedMs:performance.now()-started},null,2)+'\n');
async function phase(name:string,fn:()=>Promise<void>){phaseName=name;const p:any={name,startUTC:new Date().toISOString(),startMs:performance.now()-started};report.phases.push(p);await save();try{await fn();p.status='PASS';}catch(e){p.status='FAIL';throw e;}finally{p.elapsedMs=performance.now()-started-p.startMs;p.endUTC=new Date().toISOString();await save();}}
function check(id:string,facts:unknown=true){report.checks.push({id,status:'PASS',facts});}
const priv=async(name:string,value:unknown)=>writeFile(join(privateRoot,name),JSON.stringify(value,null,2)+'\n',{mode:0o600});
const evidence=async(name:string,value:unknown)=>writeFile(join(out,name),JSON.stringify(value,null,2)+'\n');
const deny=async(id:string,fn:()=>Promise<unknown>,code?:string)=>{let e:any;try{await fn();}catch(x){e=x;}assert.ok(e,id+'_EXPECTED_DENIAL');if(code)assert.equal(e.code,code,id+'_AUTHORITY_CODE');check(id,{rejected:true,code:typeof e.code==='string'?e.code:null});};
let h:any,sourceCore:Cluster,sourceStore:Cluster,destCore:Cluster,destStore:Cluster,as:any,ss:any,da:any,ds:any;
let sessions:HumanAuthSessions,dsessions:HumanAuthSessions,user:any,sourceProvider:SupabaseAuthProvider,dprovider:SupabaseAuthProvider;
let shandle:string,sourceProof:any,rawT0:any,rawT1:any,controlT0:any,freshProof:any;
let secret:string,encryptionKey:string,password:string,bucket:string,objects:H1015ObjectAdapter,store:SupabasePrivateStorage;
let f1:any,f2:any,newF1:any,newF2:any,work:any[]=[],objectCases:any[]=[],orphan:string,payment:any,paymentExpected:any,opportunity:any;
let t0:any={},t1:any={},cut:any={},beforeKeys:any,witness:any,ledger:any[],initialFiles:any[],sourceMetadata:any,canonicalSQL:string;
const label='crm_h6015_core',corePort=59710,storagePort=59711,issuer='http://127.0.0.1:59712';
const keyMetadata=async(db:any)=>({F1:[...await db`select key_id::text,generation::text,enabled from crm_f1.keys order by key_id`],F2:[...await db`select key_id::text,generation::text,enabled from crm_f2.keys order by key_id`]});
const connectCore=(c:Cluster,user='crm_h0_runtime')=>c.connect(label,user);
const provider=(a:any)=>new SupabaseAuthProvider({endpoint:a.endpoint,issuer:a.issuer,allowLocalHttp:true});
const login=async(s:HumanAuthSessions)=>s.login(user.email,user.password,totp(user.secret));
const dumpName=(kind:string)=>join(privateRoot,kind+'.dump');
async function properties(c:Cluster,db:string,target:string){const value=command('psql',['-X',...pgArgs(c),'--dbname='+db,'--set=ON_ERROR_STOP=1','--tuples-only','--no-align','--file='+join(privateRoot,'database-properties.sql')]);const parsed=JSON.parse(value);assert.equal(parsed.database,db);await writeFile(join(privateRoot,target),value,{flag:'wx',mode:0o600});return parsed;}
async function reserve(c:Cluster){await c.connect('template1').unsafe('alter database postgres rename to h6015_maint_new');c.maintenance='h6015_maint_new';}
async function restoreGlobals(c:Cluster,file:string){command('psql',['-X',...pgArgs(c),'--dbname='+c.maintenance,'--set=ON_ERROR_STOP=1','--single-transaction','--file='+file]);}
async function capture(c:Cluster,db:string,kind:string){command('pg_dump',[...pgArgs(c),'--dbname='+db,'--format=custom','--no-publications','--no-subscriptions','--file='+dumpName(kind)]);await properties(c,db,kind+'-source-properties.json');}
async function restore(c:Cluster,db:string,kind:string){assert.equal((await c.connect(c.maintenance)`select count(*)::int n from pg_database where datname=${db}`)[0]!.n,0);command('pg_restore',[...pgArgs(c),'--dbname='+c.maintenance,'--create','--exit-on-error',dumpName(kind)]);const a=await readFile(join(privateRoot,kind+'-source-properties.json'),'utf8'),b=await properties(c,db,kind+'-destination-properties.json');assert.deepEqual(b,JSON.parse(a));}
async function newWorker(c:Cluster,observations:Map<string,any>,a=f1,b=f2){const w=createPersistedWorkExecutor({databaseUrl:`postgresql://crm_h0_ha_tx@localhost:${c.port}/${label}`,socketDirectory:c.socket,ssl:false,capability:a,humanAuthorization:b,executorId:'synthetic-executor-a',resultVerifier:{checkEffect:async(r:any)=>({...r,availability:'available',priorEffect:'none',sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider',observationRef:'pre-contact-synthetic'}),inspect:async(r:any)=>observations.get(r.attemptId)}});cleanups.push(()=>w.close());return w;}
try{
 await phase('S01_identity_expected',async()=>{
  assert.equal(hash(await readFile(join(base,'expected-v1.json'))),'44bddf8210f3f01295a0d60c251e1546b32bcb2623cf9929a1a803aad7e44e20');
  assert.equal(hash(await readFile('tests/fixtures/h6-auth-corrective/delivery-manifest-r2.json')),'23419baa5d5ddb985ce4ac42d1d408d510ffad89959b1154fb0e6f147e30f14f');
  const sourcePaths=['scripts/run-h6-015.ts','tests/support/h6-015-runtime.ts','tests/support/h6-015-storage.cjs','tests/support/h2-isolated.ts','tests/support/h5-work-isolated.ts','src/infrastructure/postgres/persisted-work-executor.ts'];
  const sourceLock=[];for(const p of sourcePaths){const bytes=await readFile(p);sourceLock.push({path:p,bytes:bytes.length,sha256:hash(bytes)});await mkdir(join(out,'source',p,'..'),{recursive:true});await writeFile(join(out,'source',p),bytes);}
  report.sourceLock=sourceLock;report.expectedSHA256=hash(await readFile(join(base,'expected-v1.json')));report.base='971c55d5ce5770c71284d106d3c0deecca9514b5';report.postgresql=command('postgres',['--version']).trim();
  assert.equal(hash(await readFile('/tmp/crm-h6-auth-tools/binary/auth')),'54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f');
  const st=spawnSync('git',['rev-parse','HEAD'],{cwd:storageSource,encoding:'utf8'});assert.equal(st.stdout.trim(),'5def1dfc15ab7f08fe271c7d1e70542424524e4e');
  const procedure=await readFile('specs/001-core-crm/procedure-TSK-H6-014.md','utf8');canonicalSQL=procedure.split('<!-- H6014-DATABASE-PROPERTIES-SQL -->')[1]!.match(/```sql\n([\s\S]*?)```/)![1]!;assert.equal(hash(canonicalSQL),'2d31aa842bf246642ffb36c7964e57c0b582972c85011a43d17a32177672fab5');await writeFile(join(privateRoot,'database-properties.sql'),canonicalSQL,{mode:0o600});check('frozen_expected_and_source_identity');
 });
 await phase('S02_private_resources',async()=>{
  const deniedCode=await new Promise<string>(resolve=>{const s=createConnection({host:'192.0.2.1',port:9});s.once('error',(e:any)=>resolve(e.code));s.setTimeout(1000,()=>{s.destroy();resolve('TIMEOUT');});});assert.equal(deniedCode,'EPERM');check('external_network_denied',{code:deniedCode});
  h=await isolatedWork(label,corePort);cleanups.push(()=>h.close());
  sourceCore={dir:h.temporary,socket:join(h.temporary,'socket'),port:corePort,bootstrap:'h2_bootstrap',maintenance:'postgres',connect:(db,user='h2_bootstrap')=>h.connect(user,db),close:()=>h.close()};
  f1={...h.f1,allowedPurposes:[...new Set([...h.f1.allowedPurposes,'h0-005-human-bridge','h0-013-auth-revocation'])]};f2=h.f2;await h.migration`update crm_f1.keys set purposes=${f1.allowedPurposes} where key_id=${f1.keyId}`;
  secret=randomBytes(32).toString('hex');encryptionKey=randomBytes(16).toString('hex');password=randomBytes(24).toString('base64url');
  await h.admin.unsafe('create role postgres nologin nosuperuser nocreatedb nocreaterole nobypassrls; create role h6015_auth login nosuperuser nocreatedb nocreaterole nobypassrls; alter role h6015_auth set search_path to auth,public');await h.admin.unsafe('create database crm_h6015_auth owner h6015_auth');await sourceCore.connect('crm_h6015_auth','h6015_auth').unsafe('create schema auth authorization h6015_auth');
  as=await authService(sourceCore,secret,59712,issuer,password);as.migrate();await as.start();cleanups.push(()=>as.stop());user=await as.createUser(h.subject);
  sourceProvider=provider(as);const access=new H0005PostgresAdapter(h.runtime,f1,f2);sessions=new HumanAuthSessions(sourceProvider,access);cleanups.push(async()=>sessions.close());shandle=await login(sessions);sourceProof=await verifyAuth(sessions,shandle);h={...h,auth:()=>verifyAuth(sessions,shandle)};
  sourceStore=await cluster(privateRoot,'storage-source','postgres',storagePort);cleanups.push(()=>sourceStore.close());ss=await storageService(sourceStore,secret,59713,join(privateRoot,'source-objects'),encryptionKey);ss.migrate();await ss.start();cleanups.push(()=>ss.stop());
  bucket='h6015-'+uid();const created=await fetch(ss.endpoint+'/bucket',{method:'POST',headers:{Authorization:'Bearer '+as.serviceToken,'Content-Type':'application/json'},body:JSON.stringify({id:bucket,name:bucket,public:false})});assert.equal(created.status,200);store=new SupabasePrivateStorage(ss.endpoint,bucket,as.serviceToken);objects=new H1015ObjectAdapter(h.runtime,store,f1,f2);
  for(const [name,c,db]of [['core',sourceCore,label],['storage',sourceStore,'postgres']]as const){assert.equal((await c.connect(db)`show listen_addresses`)[0]!.listen_addresses,'');assert.equal((await stat(c.socket)).mode&0o777,0o700);check(name+'_socket_private');}
  await priv('source-configuration.json',{auth:as.env,storage:ss.env,user,secret,encryptionKey,f1:{...f1,key:Buffer.from(f1.key).toString('hex')},f2:{...f2,key:Buffer.from(f2.key).toString('hex')}});
  report.resources={sourceCore:sourceCore.dir,sourceStorage:sourceStore.dir,authVersion:'v2.197.0',storageCommit:'5def1dfc15ab7f08fe271c7d1e70542424524e4e',postgresSocketOnly:true,httpLoopbackOnly:true,networkSandbox:true,syntheticOnly:true};
 });
 await phase('S03_prepare_real_sources',async()=>{
  for(const kind of ['executed','uncertain','absent-t0-attempt','absence-proven']){const f=await workFixture(h);await f.run(f.definition);let claim:any,started:any;if(kind!=='absent-t0-attempt'){claim=f.claim(1000);const r=await f.run(claim);started=await f.run(f.start(claim,r.generation));assert.equal(started.state,'contacted');}work.push({kind,f,claim,started});}
  opportunity=h.input();await h.adapter.apply(sourceProof,write,opportunity);
  const context=work[0].f.comm.context,documentId=work[0].f.comm.originalId;
  for(const kind of ['complete','missing','corrupt','wrong-media','incomplete']){const bytes=Buffer.from('SYNTHETIC H6015 '+kind),prep={...context,operationId:uid(),rootId:uid(),versionId:uid(),documentId,expectedVersion:0,sourceRef:'synthetic-h6015',reason:'Authorized isolated restore fixture',digest:digest(bytes),size:bytes.length,media:'application/octet-stream'};await objects.prepare(sourceProof,write,prep);
   if(kind==='complete'){await objects.upload(sourceProof,read,write,prep.versionId,context,bytes,uid());await objects.reconcile(sourceProof,read,write,prep.versionId,context,uid());await objects.link(sourceProof,read,write,prep.versionId,context,uid());}
   if(kind==='corrupt'||kind==='wrong-media')await store.put(prep.rootId+'/'+prep.versionId,kind==='corrupt'?Buffer.from('CORRUPT SYNTHETIC'):bytes,kind==='wrong-media'?'text/plain':prep.media);
   if(kind==='incomplete')await store.put(prep.rootId+'/'+prep.versionId,bytes,prep.media);
   objectCases.push({kind,prep,bytes,context});
  }
  orphan=uid()+'/'+uid();await store.put(orphan,Buffer.from('SYNTHETIC ORPHAN'),'application/octet-stream');
  payment=await paymentFixture(h);await h.payments.apply(sourceProof,write,payment.detect);await h.payments.apply(sourceProof,write,await payment.receive());const p=await payment.propose();await h.payments.apply(sourceProof,write,p);await h.payments.apply(sourceProof,write,await payment.verify(p));paymentExpected=await h.payments.read(sourceProof,read,payment.paymentId);assert.deepEqual([paymentExpected.summary.grossReceived,paymentExpected.summary.verifiedCorrespondence,paymentExpected.summary.unreconciled],['500.00','200.00','300.00']);check('exact_money_and_portions',{currency:'EUR',gross:'500.00',verified:'200.00',unreconciled:'300.00'});
  rawT0=await sourceProvider.login(user.email,user.password,totp(user.secret));controlT0=await login(sessions);beforeKeys=await keyMetadata(h.admin);ledger=[];await priv('durable-external-ledger.json',ledger);await priv('t0-sensitive.json',{rawT0,shandle,controlT0});check('actual_password_totp_fixture');
 });
 await phase('S03_S04_coherent_cut_backups',async()=>{
  await as.stop();await ss.stop();cut={startUTC:new Date().toISOString(),startMs:performance.now()-started,authStopped:true,storageStopped:true,businessCallsSuspended:true};
  for(const [kind,c,db]of [['core',sourceCore,label],['auth',sourceCore,'crm_h6015_auth'],['storage',sourceStore,'postgres']]as const){const sql=c.connect(db);const active=await sql`select count(*)::int n from pg_stat_activity where datname=current_database() and pid<>pg_backend_pid() and (state<>'idle' or xact_start is not null)`;assert.equal(active[0]!.n,0);const replication=await sql`select (select count(*) from pg_publication)::int publications,(select count(*) from pg_subscription)::int subscriptions`;assert.equal(replication[0]!.publications,0);assert.equal(replication[0]!.subscriptions,0);t0[kind]=await snapshot(sql,c.bootstrap);await priv(kind+'-snapshot-t0.json',t0[kind]);}
  initialFiles=await filesInventory(ss.objects);await cp(ss.objects,join(privateRoot,'bytes-t0'),{recursive:true,errorOnExist:true,force:false});assert.deepEqual(await filesInventory(join(privateRoot,'bytes-t0')),initialFiles);
  command('pg_dumpall',[...pgArgs(sourceCore),'--globals-only','--no-role-passwords','--file='+join(privateRoot,'core-globals.sql')]);command('pg_dumpall',[...pgArgs(sourceStore),'--globals-only','--no-role-passwords','--file='+join(privateRoot,'storage-globals.sql')]);
  await capture(sourceCore,label,'core');await capture(sourceCore,'crm_h6015_auth','auth');await capture(sourceStore,'postgres','storage');
  for(const [kind,c,db]of [['core',sourceCore,label],['auth',sourceCore,'crm_h6015_auth'],['storage',sourceStore,'postgres']]as const)compareSnapshot(t0[kind],await snapshot(c.connect(db),c.bootstrap));assert.deepEqual(await filesInventory(ss.objects),initialFiles);
  cut.endUTC=new Date().toISOString();cut.elapsedMs=performance.now()-started-cut.startMs;report.cut=cut;report.t0Tables=Object.fromEntries(Object.entries(t0).map(([k,v]:any)=>[k,v.data]));report.t0Bytes=initialFiles;
  const artifacts=[];for(const name of ['core.dump','auth.dump','storage.dump','core-globals.sql','storage-globals.sql','source-configuration.json']){const b=await readFile(join(privateRoot,name));artifacts.push({path:name,bytes:b.length,sha256:hash(b),private:true});}report.backups=artifacts;await priv('backups-receipt.json',artifacts);check('coherent_full_cut_no_changes',{resources:3,objects:initialFiles.length});
 });
 await phase('S03_t1_independent_witness',async()=>{
  await as.start();await ss.start();
  for(const w of work){const f=w.f;if(w.kind==='absent-t0-attempt'){w.claim=f.claim(1000);const r=await f.run(w.claim);w.started=await f.run(f.start(w.claim,r.generation));}
   const row={kind:w.kind,executionId:f.executionId,attemptId:w.claim.attemptId,operationId:w.started?f.definition.operationId:null,partId:'part-1',proposalId:f.approval.proposalId,recipient:'synthetic-recipient',version:'synthetic-version-1',count:w.kind==='absence-proven'?0:1,coverage:w.kind==='uncertain'?'incomplete':'complete',observed:w.kind==='uncertain'?'unknown':w.kind==='absence-proven'?'none':'succeeded',resultRef:'t1-synthetic-'+uid(),at:new Date().toISOString()};ledger.push(row);await priv('durable-external-ledger.json',ledger);
   if(w.kind==='executed')await f.run(f.prove(w.claim.attemptId,'succeeded',row.resultRef));
   if(w.kind==='uncertain')await f.run({...f.base(),action:'result',attemptId:w.claim.attemptId,outcome:'uncertain',resultRef:'response-lost-external-outcome-unknown'});
  }
  const revoke=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),f1,f2,sessions);const closed=await revoke.revokeAll(await verifyAuth(sessions,controlT0));assert.equal(closed.status,'completed');assert.equal(closed.auth,'revoked');await deny('t1_old_auth_revoked',()=>sourceProvider.verify(rawT0.accessToken));
  shandle=await login(sessions);rawT1=await sourceProvider.login(user.email,user.password,totp(user.secret));sourceProof=await verifyAuth(sessions,shandle);
  witness={version:1,at:new Date().toISOString(),source:'actual local Auth/Core plus durable simulated business provider',coverage:'all four deliberately created work identities; uncertain result coverage explicitly incomplete',revocation:closed,knownKeys:await keyMetadata(h.admin),sessions:{t0Core:(await h.admin`select session_id::text from crm_private.identification_epochs where not current_epoch`).map((r:any)=>r.session_id),t1Core:sourceProof.sessionId},effects:ledger.map(({count,...r}:any)=>r),privateDurableCount:ledger.reduce((s:any,r:any)=>s+r.count,0)};
  const witnessBytes=JSON.stringify(witness,null,2)+'\n';await writeFile(join(privateRoot,'witness-t1.json'),witnessBytes,{flag:'wx'});await evidence('witness-t1.json',witness);report.witnessSHA256=hash(witnessBytes);report.externalCountBeforeRestore=witness.privateDurableCount;
  for(const[k,c,db]of [['core',sourceCore,label],['auth',sourceCore,'crm_h6015_auth']]as const)t1[k]=await snapshot(c.connect(db),c.bootstrap);
  await priv('t1-sensitive.json',{rawT1,shandle});await as.stop();await ss.stop();check('t1_outside_restore',{effects:4,counter:witness.privateDurableCount,coreRevocation:closed.status,authRevocation:closed.auth});
 });
 await phase('S05_new_destinations_and_restore',async()=>{
  for(const a of report.backups){assert.equal(hash(await readFile(join(privateRoot,a.path))),a.sha256);}
  destCore=await cluster(privateRoot,'core-restored','h6015_restore',59720);cleanups.push(()=>destCore.close());destStore=await cluster(privateRoot,'storage-restored','h6015_store_restore',59721);cleanups.push(()=>destStore.close());await reserve(destCore);await reserve(destStore);await restoreGlobals(destCore,join(privateRoot,'core-globals.sql'));await restoreGlobals(destStore,join(privateRoot,'storage-globals.sql'));
  for(const kind of ['core','auth','storage'])await writeFile(join(privateRoot,kind+'.toc'),command('pg_restore',['--list','--create',dumpName(kind)]));
  const py=`import importlib.util,pathlib,sys,json\np=pathlib.Path(sys.argv[1]);s=importlib.util.spec_from_file_location('v','scripts/verify-h6-014-preparation.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)\ng=m.partition_restore_toc((p/'core.toc').read_text(),'crm_h6015_core');\nfor k,v in g.items():(p/(k+'.list')).write_text(v)\nm.partition_restore_toc((p/'storage.toc').read_text(),'postgres','postgres',resource_kind='storage')\nlines=[x for x in (p/'auth.toc').read_text().splitlines() if x and not x.startswith(';')];assert len(lines)==len(set(x.split(';')[0] for x in lines));assert sum('DATABASE - crm_h6015_auth h6015_auth' in x for x in lines)==1;assert any('SCHEMA - auth h6015_auth' in x for x in lines);assert not any('EXTENSION ' in x for x in lines)\nprint(json.dumps({'core':{k:len(v.splitlines()) for k,v in g.items()},'authEntries':len(lines),'authFullArchive':True,'storageFullArchive':True}))`;
  const p=spawnSync('/usr/bin/python3',['-c',py,privateRoot],{encoding:'utf8'});assert.equal(p.status,0,'TOC_VARIANT_VALIDATION');report.restoreTOC=JSON.parse(p.stdout);
  command('pg_restore',[...pgArgs(destCore),'--dbname='+destCore.maintenance,'--create','--use-list='+join(privateRoot,'database.list'),'--exit-on-error',dumpName('core')]);command('pg_restore',[...pgArgs(destCore),'--dbname='+label,'--single-transaction','--use-list='+join(privateRoot,'crypto-schema.list'),'--exit-on-error',dumpName('core')]);
  const extensionSQL=(await readFile('specs/001-core-crm/procedure-TSK-H6-014.md','utf8')).split('<!-- H6014-EXTENSION-SQL -->')[1]!.match(/```sql\n([\s\S]*?)```/)![1]!;await writeFile(join(privateRoot,'provision-extension.sql'),extensionSQL,{mode:0o600});command('psql',['-X',...pgArgs(destCore),'--dbname='+label,'--set=ON_ERROR_STOP=1','--file='+join(privateRoot,'provision-extension.sql')]);command('pg_restore',[...pgArgs(destCore),'--dbname='+label,'--single-transaction','--use-list='+join(privateRoot,'content.list'),'--exit-on-error',dumpName('core')]);assert.deepEqual(await properties(destCore,label,'core-destination-properties.json'),JSON.parse(await readFile(join(privateRoot,'core-source-properties.json'),'utf8')));
  await restore(destCore,'crm_h6015_auth','auth');await restore(destStore,'postgres','storage');await cp(join(privateRoot,'bytes-t0'),join(privateRoot,'restored-objects'),{recursive:true,errorOnExist:true,force:false});assert.deepEqual(await filesInventory(join(privateRoot,'restored-objects')),initialFiles);
  for(const[k,c,db]of [['core',destCore,label],['auth',destCore,'crm_h6015_auth'],['storage',destStore,'postgres']]as const){const s=await snapshot(c.connect(db),c.bootstrap);await priv(k+'-snapshot-restored-before-start.json',s);compareSnapshot(t0[k],s,c.bootstrap);check(k+'_restore_exact_before_start',{tables:Object.keys(s.data).length,rows:Object.values(s.data).reduce((a:number,b:any)=>a+b.count,0),catalogEqual:true});}
  report.resources.destCore=destCore.dir;report.resources.destStorage=destStore.dir;report.beforeStartEquality=true;
 });
 await phase('S06_environment_generations',async()=>{
  const admin=connectCore(destCore,destCore.bootstrap);assert.deepEqual(await keyMetadata(admin),beforeKeys);
  newF1={...f1,key:randomBytes(32),keyId:uid(),generation:uid()};newF2={...f2,key:randomBytes(32),keyId:uid(),generation:uid()};assert.notDeepEqual(newF1.key,newF2.key);
  await admin.begin(async tx=>{for(const[family,key]of [['crm_f1',newF1],['crm_f2',newF2]]as const){await tx.unsafe('update '+family+'.keys set enabled=false where enabled');await tx.unsafe('insert into '+family+'.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values($1,$2,$3,$4,$5,true,clock_timestamp()-interval \'1 minute\',clock_timestamp()+interval \'2 hours\')',[key.keyId,key.key,key.audience,key.generation,key.allowedPurposes]);}});
  const after=await keyMetadata(admin);for(const family of ['F1','F2']){const key=family==='F1'?newF1:newF2;for(const old of beforeKeys[family])assert.ok(after[family].some((x:any)=>x.key_id===old.key_id&&x.generation===old.generation&&!x.enabled));assert.equal(after[family].filter((x:any)=>x.enabled).length,1);assert.ok(!witness.knownKeys[family].some((x:any)=>x.key_id===key.keyId||x.generation===key.generation));const rows=await admin.unsafe('select secret from '+(family==='F1'?'crm_f1':'crm_f2')+'.keys where key_id=$1',[key.keyId]);assert.deepEqual(rows[0]!.secret,key.key);}
  report.generations={before:beforeKeys,after,readbackBeforeSigners:true,separateKeys:true};await priv('destination-keys.json',{F1:{...newF1,key:newF1.key.toString('hex')},F2:{...newF2,key:newF2.key.toString('hex')}});check('F1_F2_all_old_disabled_new_read_back');
 });
 await phase('S07_real_auth_recovery_and_revocation',async()=>{
  da=await authService(destCore,secret,59722,issuer,password);ds=await storageService(destStore,secret,59723,join(privateRoot,'restored-objects'),encryptionKey);cleanups.push(()=>da.stop());cleanups.push(()=>ds.stop());await da.start();await ds.start();
  for(const[k,c,db]of [['auth',destCore,'crm_h6015_auth'],['storage',destStore,'postgres']]as const){const s=await snapshot(c.connect(db),c.bootstrap);compareSnapshot(t0[k],s,c.bootstrap);check(k+'_serve_without_migration_or_writes');}
  dprovider=provider(da);assert.equal((await dprovider.verify(rawT0.accessToken)).subject,user.id);check('restored_auth_t0_session_was_present_before_invalidation');
  const access=new H0005PostgresAdapter(connectCore(destCore),newF1,newF2);dsessions=new HumanAuthSessions(dprovider,access);cleanups.push(async()=>dsessions.close());const control=await login(dsessions);const global=new H0013GlobalAccessRevocationAdapter(connectCore(destCore),newF1,newF2,dsessions);const revoked=await global.revokeAll(await verifyAuth(dsessions,control));assert.equal(revoked.status,'completed');assert.equal(revoked.auth,'revoked');assert.equal(await dsessions.verify(control),undefined);
  assert.equal(da.verifySignature(rawT0.accessToken),true);assert.ok(JSON.parse(Buffer.from(rawT0.accessToken.split('.')[1],'base64url').toString()).exp>Date.now()/1000);await deny('restored_auth_old_session_rejected',()=>dprovider.verify(rawT0.accessToken));await deny('restored_auth_old_refresh_rejected',()=>dprovider.refresh(rawT0));
  await as.start();const sourceControl=await login(sessions),sourceGlobal=new H0013GlobalAccessRevocationAdapter(h.connect('crm_h0_runtime'),f1,f2,sessions);const revokedT1=await sourceGlobal.revokeAll(await verifyAuth(sessions,sourceControl));assert.equal(revokedT1.status,'completed');assert.equal(revokedT1.auth,'revoked');assert.equal(as.verifySignature(rawT1.accessToken),true);await deny('independent_t1_auth_old_session_rejected',()=>sourceProvider.verify(rawT1.accessToken));await deny('independent_t1_auth_old_refresh_rejected',()=>sourceProvider.refresh(rawT1));await as.stop();
  await deny('restored_core_old_preverified_proof',()=>access.readCoreProbe(sourceProof));
  const fresh=await login(dsessions);freshProof=await verifyAuth(dsessions,fresh);await access.readCoreProbe(freshProof);await dsessions.refresh(fresh);assert.equal((await verifyAuth(dsessions,fresh)).sessionId,freshProof.sessionId);report.revocation={restored:revoked,independentT1:revokedT1,oldJWTSignatureStillValid:true,oldJWTStillWithinExpiry:true,newPasswordTotp:true};check('auth_and_core_separate_real_revocation');
 });
 await phase('S08_objects_money_and_permissions',async()=>{
  const runtime=connectCore(destCore),storeNew=new SupabasePrivateStorage(ds.endpoint,bucket,da.serviceToken);objects=new H1015ObjectAdapter(runtime,storeNew,newF1,newF2);
  const objectResults=[];for(const o of objectCases){if(o.kind==='complete')assert.deepEqual(Buffer.from(await objects.download(freshProof,read,o.prep.versionId,o.context)),o.bytes);else await deny('download_before_reconcile_'+o.kind,()=>objects.download(freshProof,read,o.prep.versionId,o.context));await objects.reconcile(freshProof,read,write,o.prep.versionId,o.context,uid());const meta=await objects.metadata(freshProof,read,o.prep.versionId,o.context);objectResults.push({kind:o.kind,state:meta!.state});if(['missing','corrupt','wrong-media'].includes(o.kind)){assert.notEqual(meta!.state,'stored');await deny('download_after_reconcile_'+o.kind,()=>objects.download(freshProof,read,o.prep.versionId,o.context));}if(o.kind==='incomplete'){await objects.link(freshProof,read,write,o.prep.versionId,o.context,uid());assert.deepEqual(Buffer.from(await objects.download(freshProof,read,o.prep.versionId,o.context)),o.bytes);}}
  await objects.diagnoseOrphan(freshProof,read,write,orphan,uid());assert.ok(await storeNew.get(orphan));report.objects=objectResults;
  const paid=await new H3003PaymentAdapter(runtime,newF1,newF2).read(freshProof,read,payment.paymentId);assert.deepEqual(paid,paymentExpected);check('money_snapshots_history_restored_exact',{gross:paid!.summary.grossReceived,verified:paid!.summary.verifiedCorrespondence,unreconciled:paid!.summary.unreconciled});
  const raw=await dprovider.login(user.email,user.password,totp(user.secret)),complete=objectCases[0];const known=ds.endpoint+'/object/authenticated/'+bucket+'/'+complete.prep.rootId+'/'+complete.prep.versionId;const rr=await fetch(known,{headers:{Authorization:'Bearer '+raw.accessToken}});assert.ok(!rr.ok);assert.ok(!(await rr.text()).includes(complete.bytes.toString()));check('ordinary_auth_jwt_known_storage_url_denied');
  for(const q of ['select secret from crm_f1.keys','select secret from crm_f2.keys','select * from crm_private.crm_actors','create table crm_private.unapproved_h6015(id int)'])await deny('ordinary_privilege_'+hash(q).slice(0,10),()=>runtime.unsafe(q),'42501');const authRuntime=destCore.connect('crm_h6015_auth','crm_h0_runtime');await deny('ordinary_auth_tables_denied',()=>authRuntime.unsafe('select * from auth.sessions'),'42501');
  const attrs=await connectCore(destCore,destCore.bootstrap)`select rolsuper,rolbypassrls,rolcreaterole,rolcreatedb from pg_roles where rolname='crm_h0_runtime'`;assert.deepEqual(Object.values(attrs[0]!),[false,false,false,false]);check('ordinary_role_not_privileged');
  const oldF1=new H1015ObjectAdapter(runtime,storeNew,f1,newF2),oldF2=new H1015ObjectAdapter(runtime,storeNew,newF1,f2);await deny('old_F1_new_binding_rejected',()=>oldF1.metadata(freshProof,read,complete.prep.versionId,complete.context));await deny('old_F2_new_binding_rejected',()=>oldF2.metadata(freshProof,read,complete.prep.versionId,complete.context));
 });
 await phase('S09_S10_reconciliation_without_reentry',async()=>{
  const observations=new Map<string,any>(),worker=await newWorker(destCore,observations,newF1,newF2),results=[];
  for(const w of work){const f=w.f,row=ledger.find((r:any)=>r.kind===w.kind);if(w.kind==='absent-t0-attempt'){const prior=await worker.read(freshProof,read,f.executionId,f.context);assert.equal(prior!.attempts.length,0);results.push({kind:w.kind,state:'PENDING_LEGITIMATE_RECONCILIATION_UNAVAILABLE',attempts:0,notFabricated:true});continue;}
   const outcome=w.kind==='executed'?'succeeded':w.kind==='absence-proven'?'failed':'uncertain';if(outcome!=='uncertain')observations.set(w.claim.attemptId,{executionId:f.executionId,attemptId:w.claim.attemptId,outcome,resultRef:row.resultRef,sourceKind:'simulated',verifierIdentity:'synthetic-durable-provider'});
   const q={...f.base(),action:'result' as const,attemptId:w.claim.attemptId,outcome:outcome as any,resultRef:row.resultRef};const r=await worker.apply(freshProof,write,q);assert.equal(r.state,outcome);const replay=await worker.apply(freshProof,write,q);assert.equal(replay.replayed,true);
   if(w.kind==='uncertain'){await deny('uncertain_start_repeat_blocked',()=>worker.apply(freshProof,write,f.start(w.claim,w.started.generation)));await deny('uncertain_new_claim_blocked',()=>worker.apply(freshProof,write,f.claim()));}
   await worker.apply(freshProof,write,{...f.base(),action:'pause'});results.push({kind:w.kind,state:r.state,replay:true,paused:true});
  }
  const bytes=await readFile(join(privateRoot,'durable-external-ledger.json'),'utf8');assert.deepEqual(JSON.parse(bytes),ledger);assert.equal(ledger.reduce((s:any,r:any)=>s+r.count,0),report.externalCountBeforeRestore);report.conciliation=results;report.externalCountAfterReconciliation=report.externalCountBeforeRestore;check('no_duplicate_no_fabricated_attempts',{count:report.externalCountBeforeRestore,states:results});
 });
 // Further race and independent checks are deliberately separate from the restore equality gate.
 await phase('S12_partial_measurements_S13_evidence',async()=>{
  const after=await snapshot(connectCore(destCore,destCore.bootstrap),destCore.bootstrap);await priv('core-snapshot-final.json',after);report.finalTables=after.data;
  report.loss={baseline:'t0 exact all captured tables and bytes before start',restoredDatabaseLossRows:0,restoredBytesLoss:0,t1AttemptAbsentInT0:1,uncertainEffects:1,externalWitnessPreserved:true,unreconciledCurrency:'EUR',unreconciledPayment:'300.00',noRPOorRTOObjective:true,measurementEndsBeforeS11:true};
  report.state='TECHNICAL_SCOPE_EXECUTED_REVIEW_PENDING';report.acceptance='NOT_COMPLETED_S11_UNAUTHORIZED';check('quarantine_retained_no_S11');
 });
}catch(e:any){report.state='FAIL_PRESERVED';report.failures.push({phase:phaseName,name:e?.name,code:e?.code??e?.nativeStatus??null,reason:/^[A-Z0-9_]+$/.test(e?.message??'')?e.message:'ASSERTION_OR_INSTRUMENT_FAILURE',stack:String(e?.stack??'').split('\n').filter((x:string)=>x.trimStart().startsWith('at ')).slice(0,8)});process.exitCode=1;}
finally{for(const c of cleanups.reverse()){try{await c();}catch(e:any){report.failures.push({phase:'cleanup',name:e?.name,code:e?.code??null});process.exitCode=1;}}report.finishedUTC=new Date().toISOString();report.resourcesStopped=true;await save();console.log(JSON.stringify({report:join(out,'report.json'),state:report.state,checks:report.checks.length,failures:report.failures,privateRoot}));}
