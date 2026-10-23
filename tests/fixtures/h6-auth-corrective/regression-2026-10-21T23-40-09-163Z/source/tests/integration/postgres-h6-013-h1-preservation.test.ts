// New H6-only instruments. No historical test or migration source is rewritten.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash,randomUUID as uid,randomBytes} from 'node:crypto';
import postgres from 'postgres';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H1001IdentityAdapter,type IdentityCommand} from '../../src/infrastructure/postgres/h1-identity-adapter.ts';
import {H1003ResolutionAdapter} from '../../src/infrastructure/postgres/h1-resolution-adapter.ts';
import {H1005CatalogAdapter} from '../../src/infrastructure/postgres/h1-catalog-adapter.ts';
import {H1007CommercialAdapter} from '../../src/infrastructure/postgres/h1-commercial-adapter.ts';
import {H1013EvidenceAdapter} from '../../src/infrastructure/postgres/h1-evidence-adapter.ts';
import {H1015ObjectAdapter} from '../../src/infrastructure/postgres/h1-object-adapter.ts';
import {H1017TaskAdapter} from '../../src/infrastructure/postgres/h1-task-adapter.ts';
import type {F1SigningConfiguration} from '../../src/infrastructure/postgres/f1-codec.ts';
import type {F2SigningConfiguration} from '../../src/infrastructure/postgres/f2-codec.ts';
import {priorTables,dataSnapshot,verifyPreserved,constraints,businessFacts} from '../support/h6-013-preservation.ts';
const out=process.env.H6013_H1_DIR,bin=process.env.POSTGRES_H0_BIN;
if(!out||!bin)throw new Error('H6013_H1_NEW_OUTPUT_AND_POSTGRES_REQUIRED');
await mkdir(out);
const manifest=JSON.parse(await readFile('tests/fixtures/h6-013/migrations.json','utf8'));
const plan=JSON.parse(await readFile('tests/fixtures/h6-013/corrective-v1/expected.json','utf8'));
const seal=JSON.parse(await readFile('tests/fixtures/h6-013/corrective-v1/expected-seal.json','utf8'));
for(const[p,h]of Object.entries(seal.files))assert.equal(createHash('sha256').update(await readFile(p)).digest('hex'),h);
const save=async(name:string,data:unknown)=>writeFile(out+'/'+name+'.json',JSON.stringify(data,null,2)+'\n',{flag:'wx'});
const read=classifyServerEvent('core-read'),write=classifyServerEvent('core-action');
const ids={a:uid(),b:uid(),organization:uid(),context:uid(),designation:uid(),link:uid(),catalog:uid(),tariff:uid(),document:uid(),object:uid(),root:uid(),task:uid(),unit:uid(),basis:uid(),serviceRevision:'',unitRevision:'',basisRevision:''};
const scope='h6013-corrective-synthetic',subject=uid(),actor=uid();
const input=(action:IdentityCommand['action'],targetId:string,extra:Partial<IdentityCommand>={}):IdentityCommand=>({action,targetId,operationId:uid(),kind:'contact',sourceRef:'synthetic-h6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-preservation',expectedVersion:0,verified:true,...extra});
test('H6-013 corrective populated adjacent18–26 preserve every old column, relations and permissions',async t=>{
 const temporary=await mkdtemp(join(tmpdir(),'crm-h6013-h1-')),socket=join(temporary,'socket');await mkdir(socket);let started=false,serial=0;
 const connections:postgres.Sql[]=[];
 const connect=(user:string,db='h6013_h1')=>{const c=postgres({host:socket,port:61415,user,database:db,max:1,prepare:false,onnotice:()=>{}});connections.push(c);return c;};
 const native=async(name:string,args:string[])=>{const r=spawnSync(join(bin!,name),args,{encoding:'utf8',env:{PATH:process.env.PATH,LC_ALL:'C',NODE_ENV:'test'}});await save('native-'+String(++serial),{name,args,status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stderr);};
 const source=async(n:number)=>{const m=manifest.migrations[n-1];const bytes=await readFile(m.path);const official=execFileSync('git',['show',manifest.base+':'+m.path]);assert.deepEqual(bytes,official);assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);return bytes.toString();};
 try{
  await native('initdb',['-D',temporary+'/data','--username=bootstrap','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8']);
  await native('pg_ctl',['-D',temporary+'/data','-l',temporary+'/server.log','-o',`-k ${socket} -h '' -p 61415`,'-w','start']);started=true;
  const boot=connect('bootstrap','postgres');await boot.unsafe(await source(1));await boot.unsafe('create database h6013_h1 owner crm_h0_migration');
  const admin=connect('bootstrap'),migration=connect('crm_h0_migration'),runtime=connect('crm_h0_runtime');
  await admin.unsafe('create role anon login;create role authenticated login');
  for(let n=2;n<=18;n++)await (manifest.migrations[n-1].authority==='cluster-bootstrap'?admin:migration).unsafe(await source(n));
  const f1:F1SigningConfiguration={key:randomBytes(32),keyId:uid(),audience:'h6013',generation:uid(),allowedPurposes:['h1-identities','h1-catalog','h1-evidence']};
  const f2:F2SigningConfiguration={key:randomBytes(32),keyId:uid(),audience:'h6013',generation:uid(),allowedPurposes:['full-identification','core-human-access','session-revocation']};
  await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
  await migration`select crm_api.provision_actor_mapping(${actor}::uuid,${subject}::uuid,${scope})`;
  const access=new H0005PostgresAdapter(runtime,f1,f2);const session=(await access.establish(await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},uid()))).sessionId;
  const auth=()=>verifyAuth({verify:async()=>({subject,sessionId:session,passwordVerified:true,mfaVerified:true})},uid());
  const identity=new H1001IdentityAdapter(runtime,f1,f2),resolution=new H1003ResolutionAdapter(runtime,f1,f2),catalog=new H1005CatalogAdapter(runtime,f1,f2),commercial=new H1007CommercialAdapter(runtime,f1,f2),evidence=new H1013EvidenceAdapter(runtime,f1,f2),tasks=new H1017TaskAdapter(runtime,f1,f2);
  await admin`insert into crm_private.access_probe values('h6013-preserve',${scope},${plan.H1.fixtureValues.probe},'synthetic-private')`;
  // Preparing metadata uses the real PostgreSQL application contract, with no Storage operation.
  const storageUnused={put:async()=>{throw new Error('STORAGE_NOT_IN_H1_METADATA_SCOPE');},get:async()=>{throw new Error('STORAGE_NOT_IN_H1_METADATA_SCOPE');},inventory:async()=>{throw new Error('STORAGE_NOT_IN_H1_METADATA_SCOPE');}};
  const objects=new H1015ObjectAdapter(runtime,storageUnused,f1,f2);
  const roles=['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated'];const ordinary=roles.map(role=>connect(role));
  const seed=async(n:number)=>{
   if(n===19){
    await identity.apply(await auth(),write,input('create_entity',ids.a,{displayName:plan.H1.fixtureValues.contact,email:'synthetic@example.invalid'}));
    await identity.apply(await auth(),write,input('create_entity',ids.b,{displayName:'SYNTHETIC H6 contact B'}));
    await identity.apply(await auth(),write,input('create_entity',ids.organization,{kind:'organization',displayName:'SYNTHETIC H6 organization'}));
    await identity.apply(await auth(),write,input('create_context',ids.context,{kind:'opportunity'}));
    await identity.apply(await auth(),write,input('designate',ids.designation,{kind:'primary_contact',contextId:ids.context,relatedId:ids.a}));
    await identity.apply(await auth(),write,input('link_organization_contact',ids.link,{kind:'organization_contact',contextId:ids.organization,relatedId:ids.a}));
   }
   if(n===20){
    await resolution.apply(await auth(),write,{action:'assign_code',targetId:ids.context,operationId:uid(),kind:'OP',sourceRef:'synthetic',evidenceRef:'synthetic',reason:'synthetic-code',expectedVersion:0});
    await resolution.apply(await auth(),write,{action:'archive',targetId:ids.b,operationId:uid(),kind:'contact',sourceRef:'synthetic',evidenceRef:'synthetic',reason:'synthetic-archive',expectedVersion:0});
   }
   if(n===21){
    const catalogueFixtures:{kind:'service'|'unit'|'pricing_form';id:string;definition:Record<string,string>;key:'serviceRevision'|'unitRevision'|'basisRevision'}[]=[
     {kind:'service' as const,id:ids.catalog,definition:{name:plan.H1.fixtureValues.catalog,nature:'internal'},key:'serviceRevision' as const},
     {kind:'unit' as const,id:ids.unit,definition:{name:'SYNTHETIC Person',definition:'A participant'},key:'unitRevision' as const},
     {kind:'pricing_form' as const,id:ids.basis,definition:{name:'SYNTHETIC Per person',definition:'Person basis'},key:'basisRevision' as const},
    ];
    for(const item of catalogueFixtures){
     const common={kind:item.kind,targetId:item.id,sourceRef:'synthetic',evidenceRef:'synthetic',reason:'synthetic-catalog',expectedVersion:0};
     await catalog.apply(await auth(),write,{...common,action:'create_item',operationId:uid()});
     ids[item.key]=(await catalog.apply(await auth(),write,{...common,action:'publish_version',operationId:uid(),definition:item.definition})).id;
    }
   }
   if(n===22){
    const common={kind:'tariff' as const,targetId:ids.tariff,catalogItemId:ids.catalog,sourceRef:'synthetic',evidenceRef:'synthetic',reason:'synthetic-tariff',expectedVersion:0};
    await commercial.apply(await auth(),write,{...common,action:'create',operationId:uid()});
    await commercial.apply(await auth(),write,{...common,action:'publish',operationId:uid(),catalogRevisionId:ids.serviceRevision,definition:{...plan.H1.fixtureValues.tariff,vat_treatment:'unknown',unit_revision_id:ids.unitRevision,pricing_form_revision_id:ids.basisRevision}});
   }
   if(n===23)await evidence.apply(await auth(),write,{action:'create',operationId:uid(),targetId:ids.document,kind:'document',material:{relation:'original',content_ref:plan.H1.fixtureValues.documentRef,content_kind:'synthetic-binary',storage_state:'reference_only'},sourceRef:'synthetic',purpose:'synthetic-case',occurredAt:'2026-09-28T10:00:00Z',contextKind:'opportunity',contextId:ids.context,coverage:'synthetic',reason:'synthetic-original'});
   if(n===24)await objects.prepare(await auth(),write,{operationId:uid(),rootId:ids.root,versionId:ids.object,documentId:ids.document,expectedVersion:0,sourceRef:'synthetic',reason:'synthetic-metadata',digest:createHash('sha256').update('synthetic object').digest('hex'),size:16,media:'application/octet-stream',contextKind:'opportunity',contextId:ids.context,purpose:'synthetic-case'});
   if(n===25)await tasks.apply(await auth(),write,{action:'receive',operationId:uid(),taskId:ids.task,expectedRevision:0,identity:{causeKind:'review',causeId:ids.document,contextKind:'opportunity',contextId:ids.context,scopeRef:'synthetic',relatedKind:null,relatedId:null,effect:'review-only'},material:{title:'SYNTHETIC H6 task',deadline:{kind:'unknown',reason:'synthetic unknown'},priority:{kind:'pending',reason:'synthetic pending'},sourceRef:'synthetic',sourceVersion:'v1',triggerRef:'manual',triggerVersion:'synthetic'},reason:'synthetic-followup'});
   if(n===21){const rows=await admin`select definition from crm_private.catalog_revisions where item_id=${ids.catalog}::uuid`;assert.equal(rows[0]!.definition.name,plan.H1.fixtureValues.catalog);await save('seed-values-21',{catalogue:rows});}
   if(n===22){const rows=await admin`select definition,catalog_snapshot from crm_private.commercial_revisions where item_id=${ids.tariff}::uuid`;assert.equal(rows[0]!.definition.label,plan.H1.fixtureValues.tariff.label);assert.equal(rows[0]!.definition.price_state,'unknown');assert.equal(rows[0]!.definition.cost_state,'unknown');await save('seed-values-22',{commercial:rows});}
   if(n===23){const rows=await admin`select record_id::text,material from crm_private.b07_records where record_id=${ids.document}::uuid`;assert.equal(rows[0]!.material.content_ref,plan.H1.fixtureValues.documentRef);await save('seed-values-23',{document:rows});}
   if(n===24){const metadata=await objects.metadata(await auth(),read,ids.object,{contextKind:'opportunity',contextId:ids.context,purpose:'synthetic-case'});assert.ok(metadata);assert.equal(metadata.state,plan.H1.fixtureValues.objectState);assert.equal(metadata.document_id,ids.document);assert.equal(metadata.expected_digest,createHash('sha256').update('synthetic object').digest('hex'));assert.equal(Number(metadata.expected_size),16);await save('seed-values-24',{metadata});}
   if(n===25){const task=await tasks.read(await auth(),read,ids.task,'opportunity',ids.context);assert.ok(task);assert.equal(task.state,plan.H1.fixtureValues.taskState);assert.equal(task.identity.contextId,ids.context);assert.equal(task.material.title,'SYNTHETIC H6 task');await save('seed-values-25',{task});}
  };
  const snapshots:{from:number;to:number;tables:number;nonempty:number;rows:number;pass:boolean}[]=[];
  for(let to=19;to<=26;to++)await t.test((to-1)+'->'+to,async()=>{
   const old=await priorTables(admin),before=await dataSnapshot(admin,old),oldConstraints=await constraints(admin),beforeFacts=await businessFacts(admin,old),sql=await source(to);
   assert.ok(Object.values(before).some(x=>x.count>0));
   await save('edge-'+to+'-before',{from:to-1,to,ids,columns:old,rows:before,businessValuesAndRelations:beforeFacts,constraints:oldConstraints,sqlSha256:manifest.migrations[to-1].sha256,recordedBeforeApply:true});
   // Real DDL rollback then retry; instrument a copy in memory only.
   const injected=sql.replace(/commit;\s*$/i,'select 1/0;commit;');assert.notEqual(injected,sql);
   await assert.rejects(migration.unsafe(injected),{code:'22012'});await migration.unsafe('rollback');
   assert.deepEqual(await priorTables(admin),old);verifyPreserved(before,await dataSnapshot(admin,old));assert.deepEqual(await constraints(admin),oldConstraints);
   await migration.unsafe(sql);const after=await dataSnapshot(admin,old);verifyPreserved(before,after);const afterFacts=await businessFacts(admin,old);assert.deepEqual(afterFacts,beforeFacts);
   const nowConstraints=await constraints(admin);for(const c of oldConstraints)assert.deepEqual(nowConstraints.find(x=>x.relation===c.relation&&x.conname===c.conname),c);
   const permissionOutcomes=[];
   for(const [i,c]of ordinary.entries())for(const table of await priorTables(admin)){
    let e:any;try{await c.unsafe('select * from "'+table.schema+'"."'+table.name+'" limit 0');}catch(error){e=error;}
    assert.equal(e?.code,'42501');permissionOutcomes.push({role:roles[i],table:table.schema+'.'+table.name,code:e.code});
   }
   const unsafeRls=await admin`select c.oid::regclass::text name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind='r' and not(c.relrowsecurity and c.relforcerowsecurity)`;assert.equal(unsafeRls.length,0);
   // Deliberate content change and row loss are detected in actual SQL transactions and rolled back.
   for(const control of ['changed-value','deleted-row','changed-reference']){
    if(control==='changed-reference'&&to<20)continue;
    let detected=false;
    try{await admin.begin(async tx=>{
     if(control==='changed-value'){if(to>=20)await tx`update crm_private.identity_entities set display_name='SYNTHETIC altered' where identity_id=${ids.a}::uuid`;else await tx`update crm_private.access_probe set public_value='SYNTHETIC altered' where probe_id='h6013-preserve'`;}
     if(control==='deleted-row')await tx`delete from crm_private.access_probe where probe_id='h6013-preserve'`;
     if(control==='changed-reference')await tx`update crm_private.identity_designations set party_id=${ids.b}::uuid where designation_id=${ids.designation}::uuid`;
     const changed=await dataSnapshot(tx,old);
     try{verifyPreserved(before,changed);}catch(e){detected=true;assert.match((e as Error).message,/H6013_ORIGINAL_CONTENT_CHANGED/);}
     assert.equal(detected,true,'DELIBERATE_LOSS_NOT_DETECTED');
     await save('edge-'+to+'-control-'+control,{control,detected,before,changed});throw new Error('H6013_H1_CONTROL_ROLLBACK');
    });}catch(e){assert.equal((e as Error).message,'H6013_H1_CONTROL_ROLLBACK');}
    verifyPreserved(before,await dataSnapshot(admin,old));
   }
   if(to>=20){
    const a=(await admin`select identity_id::text,display_name from crm_private.identity_entities where identity_id=${ids.a}::uuid`)[0]!;assert.equal(a.display_name,plan.H1.fixtureValues.contact);
    assert.equal((await admin`select party_id::text from crm_private.identity_designations where designation_id=${ids.designation}::uuid`)[0]!.party_id,ids.a);
    if(to===20){const expanded=await admin`select archived_at,merged_into_id from crm_private.identity_entities`;assert.ok(expanded.every(x=>x.archived_at===null&&x.merged_into_id===null));}
    await assert.rejects(admin`insert into crm_private.identity_organization_contacts(link_id,organization_id,contact_id,admin_scope,source_ref,evidence_ref) values(${uid()}::uuid,${uid()}::uuid,${uid()}::uuid,${scope},'synthetic','synthetic')`,{code:'23503'});
   }
   await assert.rejects(admin`insert into crm_private.access_probe values('h6013-preserve',${scope},'duplicate','synthetic')`,{code:'23505'});
   verifyPreserved(before,await dataSnapshot(admin,old));
   await save('edge-'+to+'-after',{from:to-1,to,after,businessValuesAndRelations:afterFacts,equal:true,permissions:permissionOutcomes,rollbackRetry:true,controlsRestored:true,oldConstraintsPreserved:true});
   snapshots.push({from:to-1,to,tables:old.length,nonempty:Object.values(before).filter(x=>x.count>0).length,rows:Object.values(before).reduce((n,v)=>n+v.count,0),pass:true});
   await seed(to);
   if(to>=19)assert.equal((await identity.read(await auth(),read,'entity',ids.a)).data!==null,true);
  });
  await save('summary',{edges:snapshots,expectedOrigins:plan.H1.origins,mandatoryFourCovered:true,additionalFourCovered:true,allOriginalColumnsPreserved:true,deliberateLossDetected:true});
 }finally{
  await Promise.allSettled(connections.map(c=>c.end({timeout:1})));if(started)await native('pg_ctl',['-D',temporary+'/data','-m','fast','-w','stop']);
  await save('resource',{temporary,stopped:started,socketOnly:true,syntheticOnly:true});
 }
});
