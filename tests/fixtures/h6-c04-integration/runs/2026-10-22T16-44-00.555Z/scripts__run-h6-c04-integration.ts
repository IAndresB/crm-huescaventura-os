import assert from 'node:assert/strict';
import {randomBytes,randomUUID as uid} from 'node:crypto';
import {readFile,writeFile,mkdir,mkdtemp,cp,stat} from 'node:fs/promises';
import {join,basename} from 'node:path';
import postgres from 'postgres';
import {hash,command,filesInventory,authService,sleep,pgArgs} from '../tests/support/h6-015-runtime.ts';
import {totp} from '../tests/support/h6-auth-provider-isolated.ts';
import {read,write} from '../tests/support/h6-current-isolated.ts';
import {invokeC04} from '../src/application/contracts.ts';
import {issueTrustedContext} from '../src/application/trusted-context.ts';
import {verifyAuth} from '../src/application/verified-auth.ts';
import {H0005PostgresAdapter} from '../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../src/infrastructure/postgres/h0-013-adapter.ts';
import {H1013EvidenceAdapter} from '../src/infrastructure/postgres/h1-evidence-adapter.ts';
import {SupabaseAuthProvider} from '../src/infrastructure/auth/supabase-auth-provider.ts';
import {HumanAuthSessions} from '../src/server/human-auth-session.ts';
import {createManualB07EvidencePort} from '../src/server/b07-evidence-port.ts';
const fixtures='tests/fixtures/h6-c04-integration',run=new Date().toISOString().replaceAll(':','-'),out=join(fixtures,'runs',run);
await mkdir(out,{recursive:true});
const expectedBytes=await readFile(join(fixtures,'expected-v1.json')),expected=JSON.parse(expectedBytes.toString());
assert.equal(hash(expectedBytes),(await readFile(join(fixtures,'expected-v1.sha256'),'utf8')).trim());
const report:any={run,expectedSHA256:hash(expectedBytes),state:'IN_PROGRESS',checks:[],failures:[],S11:false,N03:false,externalBusinessEffects:0};
const sources=['scripts/run-h6-c04-integration.ts','src/server/b07-evidence-port.ts','src/application/contracts.ts','src/infrastructure/postgres/h1-evidence-adapter.ts'];
report.sourceHashes={};for(const p of sources){const b=await readFile(p);report.sourceHashes[p]=hash(b);await writeFile(join(out,p.replaceAll('/','__')),b,{flag:'wx'});}
const save=()=>writeFile(join(out,'report.json'),JSON.stringify(report,null,2)+'\n');await save();
const check=(id:string,detail:any={})=>{assert.equal(expected.cases[id],'PASS');report.checks.push({id,status:'PASS',...detail});};
const root=await mkdtemp('/tmp/h6c04-');report.privateRoot=root;
const custody='/Users/andres/CRM-Huescaventura-PrivateCustody/H6-015/20261022-bootstrap-variant';
const prior=JSON.parse(await readFile('tests/fixtures/h6-bootstrap-variant/runs/2026-10-22T14-52-59-084Z/report.json','utf8'));
const archive=join(custody,basename(prior.privateRoot)),data=join(root,'data'),socket=join(root,'socket'),port=59810,label='crm_h6015_core',bootstrap='h2_bootstrap';
let started=false,auth:any,sessions:HumanAuthSessions|undefined;const clients:postgres.Sql[]=[];
const connect=(database=label,user=bootstrap)=>{const sql=postgres({host:socket,port,database,user,max:1,prepare:false,onnotice:()=>{},connect_timeout:3});clients.push(sql);return sql;};
const deny=async(fn:()=>Promise<any>,message:string)=>{await assert.rejects(fn,e=>e instanceof Error&&e.message===message);};
try{
 const invBytes=await readFile(join(custody,'private-inventory.json'));assert.equal(hash(invBytes),'8fc4c53cbb8e8340865a7f0643eac6476c4b6fd5c02f391055c196c015f269e3');
 const inventory=JSON.parse(invBytes.toString()),source=join(archive,basename(prior.resources.destCore),'data');
 const selected=inventory.filter((r:any)=>r.destination.startsWith(source+'/')||['source-configuration.json','durable-external-ledger.json'].some(n=>r.destination===join(archive,n)));
 for(const r of selected){const s=await stat(r.destination);assert.equal(s.mode&0o777,0o600);const b=await readFile(r.destination);assert.equal(b.length,r.bytes);assert.equal(hash(b),r.sha256);}
 assert.match(command('pg_controldata',[source]),/Database cluster state:\s+shut down/);assert.equal((await filesInventory(source)).length,selected.length-2);
 await cp(source,data,{recursive:true,errorOnExist:true,force:false});await mkdir(socket,{mode:0o700});assert.deepEqual(await filesInventory(data),await filesInventory(source));
 const config=JSON.parse(await readFile(join(archive,'source-configuration.json'),'utf8')),ledgerBytes=await readFile(join(archive,'durable-external-ledger.json')),ledger=JSON.parse(ledgerBytes.toString());
 await writeFile(join(root,'source-configuration.json'),JSON.stringify(config),{mode:0o600});await writeFile(join(root,'durable-external-ledger.json'),ledgerBytes,{mode:0o600});
 check('cold_copy_exact',{files:selected.length-2,sourceShutdown:true,sourceCustodyInventorySHA256:hash(invBytes)});
 command('pg_ctl',['-D',data,'-l','/dev/null','-o',`-k '${socket}' -h '' -p ${port}`,'-w','start']);started=true;
 const admin=connect(),runtime=connect(label,'crm_h0_runtime'),secondRuntime=connect(label,'crm_h0_runtime');
 const normalized=(s:string)=>s.split('\n').filter(x=>!/^\\(?:un)?restrict /.test(x)).join('\n');
 const beforeSchema=command('pg_dump',[...pgArgs({socket,port,bootstrap}),'-d',label,'--schema-only','--no-password']);
 await writeFile(join(root,'schema-before.sql'),beforeSchema,{mode:0o600});
 const fullSnapshot=async(name:string)=>{const ts=await admin`select schemaname,tablename from pg_tables where schemaname !~ '^pg_' and schemaname<>'information_schema' order by 1,2`;const result:any={};for(const t of ts)result[t.schemaname+'.'+t.tablename]=(await admin.unsafe('select to_jsonb(r)::text row from "'+t.schemaname+'"."'+t.tablename+'" r order by to_jsonb(r)::text')).map(x=>x.row);await writeFile(join(root,name),JSON.stringify(result),{mode:0o600});};
 await fullSnapshot('core-clone-received.json');
 const newF1={...config.f1,key:randomBytes(32),keyId:uid(),generation:uid()},newF2={...config.f2,key:randomBytes(32),keyId:uid(),generation:uid()};
 for(const [family,key]of [['crm_f1',newF1],['crm_f2',newF2]]as const){await admin.begin(async tx=>{await tx.unsafe('update '+family+'.keys set enabled=false where enabled');await tx.unsafe('insert into '+family+'.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values($1,$2,$3,$4,$5,true,clock_timestamp()-interval \'1 minute\',clock_timestamp()+interval \'2 hours\')',[key.keyId,key.key,key.audience,key.generation,key.allowedPurposes]);});const rows=await admin.unsafe('select key_id::text,secret,generation::text from '+family+'.keys where enabled');assert.equal(rows.length,1);assert.equal(rows[0]!.key_id,key.keyId);assert.deepEqual(rows[0]!.secret,key.key);}
 assert.notDeepEqual(newF1.key,newF2.key);await writeFile(join(root,'destination-keys.json'),JSON.stringify({F1:{...newF1,key:newF1.key.toString('hex')},F2:{...newF2,key:newF2.key.toString('hex')}}),{mode:0o600});check('new_generations_readback');
 auth=await authService({socket,port},config.secret,59812,config.auth.GOTRUE_JWT_ISSUER,config.user.password);await auth.start();
 const provider=new SupabaseAuthProvider({endpoint:auth.endpoint,issuer:auth.issuer,allowLocalHttp:true});
 sessions=new HumanAuthSessions(provider,new H0005PostgresAdapter(runtime,newF1,newF2));
 const login=async()=>{const handle=await sessions!.login(config.user.email,config.user.password,totp(config.user.secret));return {handle,proof:await verifyAuth(sessions!,handle)};};
 const revoker=new H0013GlobalAccessRevocationAdapter(connect(label,'crm_h0_runtime'),newF1,newF2,sessions);
 const revoke=async(proof:any)=>{const r=await revoker.revokeAll(proof);assert.equal(r.status,'completed');assert.equal(r.auth,'revoked');};
 let human=await login();check('real_auth_totp');await revoke(human.proof);assert.equal(await sessions.verify(human.handle),undefined);check('initial_global_revocation');human=await login();
 const adapter=new H1013EvidenceAdapter(runtime,newF1,newF2),secondAdapter=new H1013EvidenceAdapter(secondRuntime,newF1,newF2);
 const missing=ledger.find((x:any)=>x.kind==='absent-t0-attempt'),uncertain=ledger.find((x:any)=>x.kind==='uncertain');assert.ok(missing&&uncertain);
 const contexts=await admin`select e.execution_id::text,d.context from crm_private.b08_executions e join crm_private.b08_definitions d using(definition_id,version) order by e.execution_id`;
 const contextOf=(row:any)=>contexts.find(x=>x.execution_id===row.executionId)!.context as any;
 const mapping=(await admin`select actor_id::text,admin_scope from crm_private.crm_actors where auth_subject=${config.user.id}::uuid`)[0]!;
 const paused=async()=>{const rows=await admin`select control_state from crm_private.b08_executions`;assert.equal(rows.length,4);assert.ok(rows.every(x=>x.control_state==='paused'));};
 const absent=async()=>assert.equal((await admin`select count(*)::int n from crm_private.b08_attempts where attempt_id=${missing.attemptId}::uuid`)[0]!.n,0);
 await paused();await absent();check('paused_and_absent_baseline');
 const exceptions=['crm_actors','crm_sessions','identification_epochs','global_access_revocations','global_access_revocation_attempts','b07_records','b07_links','b07_history','b07_operations'];
 const tables=await admin`select schemaname,tablename from pg_tables where schemaname in ('crm_private','crm_ha') order by 1,2`;
 const hashes=async()=>{const result:any={};for(const t of tables){if(t.schemaname==='crm_private'&&exceptions.includes(t.tablename))continue;const name='"'+t.schemaname+'"."'+t.tablename+'"';result[t.schemaname+'.'+t.tablename]=(await admin.unsafe('select encode(crm_crypto.digest(coalesce(string_agg(to_jsonb(r)::text,E\'\\n\' order by to_jsonb(r)::text),\'\'),\'sha256\'),\'hex\') h from '+name+' r'))[0]!.h;}return result;};
 const businessBefore=await hashes();await fullSnapshot('core-before-c04.json');
 const historical:any={};for(const table of ['b07_records','b07_links','b07_history','b07_operations','global_access_revocations','global_access_revocation_attempts'])historical[table]=await admin.unsafe('select to_jsonb(r) row from crm_private.'+table+' r');
 const sourceRef='local-custody:ledger-sha256:'+hash(ledgerBytes),receivedAt=new Date().toISOString();
 const guards={identityAndScope:'satisfied',materialTruth:'satisfied',sensitiveSupervision:'satisfied',conservation:'satisfied',independence:'satisfied',repetition:'new'} as const;
 const make=(row=missing,review=false,a=human.proof,bindingOverrides:any={},chosen=adapter)=>{
  const business=contextOf(row),context=issueTrustedContext({identityId:a.subject,identityKind:'human',purpose:'recovery-evidence',scope:mapping.admin_scope,requestId:uid(),serverTime:new Date().toISOString()});
  const binding={operationId:uid(),evidenceId:uid(),contextKind:business.contextKind,contextId:business.contextId,sourceReference:sourceRef,occurredAt:row.at,purpose:business.purpose,coverage:JSON.stringify({executionId:row.executionId,attemptId:row.attemptId,partId:row.partId,coverage:row.coverage}),claim:JSON.stringify({observation:row,coreAttempt:'not_reconstructed',businessResultApplied:false}),reason:'Synthetic recovery evidence; no B08 result',...bindingOverrides};
  const registration={sourceReference:sourceRef,receivedAt,preservation:'authorized-manual-record' as const,...(review?{verification:{reviewerIdentityId:a.subject,reviewedAt:new Date().toISOString()}}:{})};
  const port=createManualB07EvidencePort(chosen,a,write,context,binding),request={context,scope:mapping.admin_scope,guards,input:registration};return {binding,port,request};
 };
 const apply=(p:ReturnType<typeof make>)=>invokeC04(p.request,p.port);
 const count=async(id:string)=>(await admin`select count(*)::int n from crm_private.b07_records where record_id=${id}::uuid`)[0]!.n;
 const readback=async(p:ReturnType<typeof make>,state:string)=>{const r=await adapter.read(human.proof,read,p.binding.evidenceId,p.binding.contextKind,p.binding.contextId);assert.ok(r.data);const row=(await admin`select * from crm_private.b07_records where record_id=${p.binding.evidenceId}::uuid`)[0]!;assert.equal(row.recorded_by,mapping.actor_id);assert.equal(row.material.certainty,state);const payload=JSON.parse(row.material.claim);assert.deepEqual(payload.registration,p.request.input.verification?{receivedAt,preservation:'authorized-manual-record',verification:p.request.input.verification}:{receivedAt,preservation:'authorized-manual-record'});assert.ok(new Date(row.recorded_at).getTime()>=Date.parse(receivedAt));assert.equal(new Date(row.occurred_at).toISOString(),new Date(p.binding.occurredAt).toISOString());return row;};
 const candidate=make();assert.equal((await apply(candidate)).status,'applied');await readback(candidate,'candidate');check('candidate_registration_readback');
 const reviewed=make(missing,true);const reviewedResult:any=await apply(reviewed);assert.equal(reviewedResult.value.state,'verified');await readback(reviewed,'reviewed');check('reviewed_registration_readback');
 await apply(candidate);assert.equal(await count(candidate.binding.evidenceId),1);check('replay_one_record');
 const parallel=make(),parallel2=make(missing,false,human.proof,parallel.binding,secondAdapter);parallel2.request.input=parallel.request.input;
 const parallelResults=await Promise.all([apply(parallel),apply(parallel2)]);assert.ok(parallelResults.every(x=>x.status==='applied'));assert.equal(await count(parallel.binding.evidenceId),1);check('concurrent_replay_one_record',{connections:2});
 const conflict=make(missing,false,human.proof,{...candidate.binding,claim:'altered'});await deny(()=>apply(conflict),'B07_REPLAY_CONFLICT');check('conflicting_replay_denied');
 assert.equal((await adapter.read(human.proof,read,candidate.binding.evidenceId,candidate.binding.contextKind,uid())).data,null);check('cross_context_read_denied');
 const changed=make();await deny(()=>invokeC04({...changed.request,input:{...changed.request.input,sourceReference:'wrong'}},changed.port),'C04_B07_EVIDENCE_DENIED');check('wrong_source_denied');
 await deny(()=>invokeC04({...changed.request,input:{...changed.request.input,preservation:'original'}},changed.port),'C04_B07_EVIDENCE_DENIED');check('original_bytes_claim_denied');
 await deny(()=>invokeC04({...changed.request,input:{...changed.request.input,verification:{reviewerIdentityId:uid(),reviewedAt:receivedAt}}},changed.port),'C04_B07_REVIEW_DENIED');check('false_reviewer_denied');
 await deny(()=>invokeC04({...changed.request,context:issueTrustedContext({...changed.request.context,requestId:uid()})},changed.port),'C04_B07_CONTEXT_DENIED');check('bound_context_denied');
 assert.equal((await invokeC04({...changed.request,guards:{...guards,repetition:'uncertain'}},changed.port)).status,'rejected');assert.equal(await count(changed.binding.evidenceId),0);check('guard_uncertain_denied');
 const pending=make(uncertain);await apply(pending);const pendingRow=await readback(pending,'candidate');assert.equal(JSON.parse(JSON.parse(pendingRow.material.claim).claim).observation.observed,'unknown');check('uncertain_registered_without_success');
 const stale=make();await revoke(human.proof);await deny(()=>apply(stale),'B07_DENIED');assert.equal(await count(stale.binding.evidenceId),0);human=await login();await readback(candidate,'candidate');check('old_session_denied',{positiveAfterDenial:true});
 function latch(){let resolve!:()=>void;const promise=new Promise<void>(r=>resolve=r);return {promise,resolve};}
 for(const revokeFirst of [true,false]){
  human=await login();const other=await login(),p=make(),held=latch(),release=latch(),holder=connect(),watcher=connect();
  const lock=holder.begin(async tx=>{await tx.unsafe('lock table crm_private.'+(revokeFirst?'global_access_revocations':'b07_records')+' in access exclusive mode');held.resolve();await release.promise;});await held.promise;
  const wait=async(fragment:string)=>{for(let i=0;i<200;i++){const rows=await watcher`select pid from pg_stat_activity where datname=${label} and wait_event_type='Lock' and query like ${'%'+fragment+'%'} and pid<>pg_backend_pid()`;if(rows.length)return;await sleep(20);}throw new Error('EXPECTED_DATABASE_LOCK_NOT_OBSERVED');};
  let op:any,closing:any;const operation=()=>apply(p).then(v=>({value:v}),e=>({error:e.message}));
  try{if(revokeFirst){closing=revoke(other.proof);await wait('start_global_access_revocation');op=operation();await wait('b07_apply');}else{op=operation();await wait('b07_apply');closing=revoke(other.proof);await wait('start_global_access_revocation');}}finally{release.resolve();await lock;}
  await closing;const result=await op;assert.equal(await count(p.binding.evidenceId),revokeFirst?0:1);if(revokeFirst)assert.equal(result.error,'B07_DENIED');else assert.equal(result.value.status,'applied');
  check(revokeFirst?'revocation_first_denies':'registration_first_then_revocation',{realSQLLocks:true});
 }
 assert.deepEqual(await hashes(),businessBefore);
 for(const [table,rows]of Object.entries(historical)){const after=(await admin.unsafe('select to_jsonb(r) row from crm_private.'+table+' r')).map(x=>JSON.stringify(x.row));for(const row of rows as any[])assert.ok(after.includes(JSON.stringify(row.row)),'HISTORICAL_B07_ROW_CHANGED');}
 const schema=command('pg_dump',[...pgArgs({socket,port,bootstrap}),'-d',label,'--schema-only','--no-password']);
 // PG17 dump emits random restrict tokens: compare after removing only those command lines.
 assert.equal(normalized(schema),normalized(beforeSchema),'SCHEMA_CHANGED');await writeFile(join(root,'schema-after.sql'),schema,{mode:0o600});
 report.schemaFinalSHA256=hash(normalized(schema));report.schemaBeforeSHA256=hash(normalized(beforeSchema));
 check('business_tables_unchanged',{tables:Object.keys(businessBefore).length,historicalB07RowsPreserved:true});
 await absent();check('missing_attempt_still_absent');await paused();check('all_jobs_still_paused');assert.equal(hash(await readFile(join(archive,'durable-external-ledger.json'))),hash(ledgerBytes));check('ledger_unchanged');
 human=await login();await revoke(human.proof);check('final_global_revocation');
 report.newEvidence=await admin`select record_id::text,record_kind,source_ref,recorded_by::text,occurred_at::text,recorded_at::text,material->>'certainty' certainty from crm_private.b07_records where source_ref=${sourceRef} order by record_id`;
 await fullSnapshot('core-after-c04.json');report.businessHashes=businessBefore;report.ledgerSHA256=hash(ledgerBytes);report.custodySource=archive;
 assert.deepEqual(report.checks.map((x:any)=>x.id).sort(),Object.keys(expected.cases).sort());report.status='PASS';
}catch(e:any){report.status='FAIL';report.failures.push({name:e.name,code:e.code??null,message:e instanceof assert.AssertionError?'ASSERTION_FAILED':e.message,frames:String(e.stack).split('\n').filter((s:string)=>s.trim().startsWith('at '))});process.exitCode=1;}
finally{sessions?.close();if(auth)await auth.stop();await Promise.allSettled(clients.map(c=>c.end({timeout:1})));if(started)command('pg_ctl',['-D',data,'-m','fast','-w','stop']);report.resourcesStopped=true;report.finishedUTC=new Date().toISOString();await save();console.log(JSON.stringify({out,status:report.status,checks:report.checks.length,failures:report.failures,privateRoot:root}));}
