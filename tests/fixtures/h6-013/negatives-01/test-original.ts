// H6-013 negative verifier. Only a new Unix-socket cluster with synthetic rows.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash,randomUUID as uid} from 'node:crypto';
import postgres from 'postgres';
const out='tests/fixtures/h6-013/negatives-01',bin=process.env.POSTGRES_H0_BIN!;
if(!bin)throw new Error('POSTGRES_H0_BIN_REQUIRED');
const manifest=JSON.parse(await readFile('tests/fixtures/h6-013/migrations.json','utf8'));
const expected={M01:'Single server message: injected failure after first CREATE SCHEMA rolls back every statement. Retry original SQL succeeds.',order:'M02 before F1 schema fails; no hybrid catalog or changed probe. Apply missing F1 then M02, original row exact.',constraints:'Duplicate PK, negative CHECK, missing FK each reject with exact SQLSTATE and identical rows.',security:'Direct access and fake/absent capability denied after full68, forged GUC does not authorize, runtime cannot SET ROLE migration.'};
await mkdir(out);await writeFile(out+'/expected.json',JSON.stringify(expected,null,2)+'\n',{flag:'wx'});
let temporary='',socket='',started=false,admin:postgres.Sql,migration:postgres.Sql,runtime:postgres.Sql;
const connections:postgres.Sql[]=[];
const connect=(user:string,db='negative')=>{const c=postgres({host:socket,port:61414,user,database:db,max:1,prepare:false,onnotice:()=>{}});connections.push(c);return c;};
let serial=0;
function native(name:string,args:string[]){const p=spawnSync(join(bin,name),args,{encoding:'utf8',env:{PATH:process.env.PATH,LC_ALL:'C'}});const prefix=out+'/'+String(++serial).padStart(2,'0')+'-'+name;return Promise.all([writeFile(prefix+'.stdout.log',p.stdout??'',{flag:'wx'}),writeFile(prefix+'.stderr.log',p.stderr??'',{flag:'wx'}),writeFile(prefix+'.status.json',JSON.stringify({args,exit:p.status})+'\n',{flag:'wx'})]).then(()=>{assert.equal(p.status,0,p.stderr);});}
async function source(n:number){const m=manifest.migrations[n-1];const b=await readFile(m.path);assert.equal(createHash('sha256').update(b).digest('hex'),m.sha256);return b.toString();}
async function catalog(){return await admin`select n.nspname,c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,pg_get_userbyid(c.relowner) owner from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname like 'crm%' order by 1,2`;}
async function probe(){return await admin`select * from crm_private.access_probe order by probe_id`;}
before(async()=>{temporary=await mkdtemp(join(tmpdir(),'crm-h6013-negative-'));socket=join(temporary,'socket');await mkdir(socket);await native('initdb',['-D',join(temporary,'data'),'--username=bootstrap','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8']);await native('pg_ctl',['-D',join(temporary,'data'),'-l',join(temporary,'server.log'),'-o',`-k ${socket} -h '' -p 61414`,'-w','start']);started=true;const bootstrap=connect('bootstrap','postgres');await bootstrap.unsafe(await source(1));await bootstrap.unsafe('create database negative owner crm_h0_migration');admin=connect('bootstrap');migration=connect('crm_h0_migration');runtime=connect('crm_h0_runtime');});
after(async()=>{await Promise.allSettled(connections.map(c=>c.end({timeout:1})));if(started)await native('pg_ctl',['-D',join(temporary,'data'),'-m','fast','-w','stop']);await writeFile(out+'/resource.json',JSON.stringify({temporary,stopped:started,socketOnly:true,syntheticOnly:true})+'\n',{flag:'wx'});});
test('H6-013 D03 M01 implicit transaction partial statement failure and safe retry',async()=>{
 const original=await source(2),before=await catalog();const injected=original.replace('create schema crm_api','select 1/0;\ncreate schema crm_api');assert.notEqual(original,injected);let error:any;
 try{await migration.unsafe(injected);}catch(e){error=e;}assert.equal(error.code,'22012');assert.deepEqual(await catalog(),before);
 await migration.unsafe(original);await admin`insert into crm_private.access_probe values('synthetic-probe','scope-h6013','preserved','private-synthetic')`;
 await writeFile(out+'/M01-result.json',JSON.stringify({expected:expected.M01,observed:{sqlstate:error.code,rolledBack:true,retry:true},originalSha256:createHash('sha256').update(original).digest('hex'),instrumentedSha256:createHash('sha256').update(injected).digest('hex')},null,2)+'\n',{flag:'wx'});
});
test('H6-013 D03 wrong order rejects and forward repair preserves predecessor',async()=>{
 await admin.unsafe(await source(3));const before=await catalog(),rows=await probe();let error:any;
 try{await migration.unsafe(await source(5));}catch(e){error=e;}assert.ok(error);await migration.unsafe('rollback');assert.deepEqual(await catalog(),before);assert.deepEqual(await probe(),rows);
 await migration.unsafe(await source(4));await migration.unsafe(await source(5));assert.deepEqual(await probe(),rows);
 await writeFile(out+'/order-result.json',JSON.stringify({expected:expected.order,observed:{sqlstate:error.code,message:error.message,noHybrid:true,probePreserved:true,forwardRepair:true}},null,2)+'\n',{flag:'wx'});
});
test('H6-013 D02 real unique check foreign-key rejection with preserved originals on68',async()=>{
 for(const m of manifest.migrations.filter((x:any)=>x.ordinal>5)){const sql=await source(m.ordinal);await (m.authority==='cluster-bootstrap'?admin:migration).unsafe(sql);}
 await admin.unsafe('create role anon login;create role authenticated login');const before=await probe();
 const commands=[{q:"insert into crm_private.access_probe values('synthetic-probe','scope-h6013','duplicate','private-synthetic')",code:'23505'},{q:`insert into crm_private.identity_entities(identity_id,identity_kind,admin_scope,source_ref,estimated_size,size_source) values ('${uid()}','group','scope-h6013','synthetic',-1,'synthetic')`,code:'23514'},{q:`insert into crm_private.identity_organization_contacts(link_id,organization_id,contact_id,admin_scope,source_ref,evidence_ref) values('${uid()}','${uid()}','${uid()}','scope-h6013','synthetic','synthetic')`,code:'23503'}];const outcomes=[];
 for(const c of commands){let e:any;try{await admin.unsafe(c.q);}catch(error){e=error;}assert.equal(e.code,c.code);outcomes.push({expected:c.code,observed:e.code,constraint:e.constraint_name});assert.deepEqual(await probe(),before);}
 assert.equal((await admin`select count(*)::int n from crm_private.identity_entities`)[0]!.n,0);assert.equal((await admin`select count(*)::int n from crm_private.identity_organization_contacts`)[0]!.n,0);
 await writeFile(out+'/constraints-result.json',JSON.stringify({expected:expected.constraints,outcomes,originalsPreserved:true},null,2)+'\n',{flag:'wx'});
});
test('H6-013 C02 absent forged residual context direct history writes and escalation denied on68',async()=>{
 const before=await probe();const denied=[];for(const user of ['crm_h0_runtime','crm_h0_ha_tx','anon','authenticated']){const c=connect(user);for(const q of ["select * from crm_private.access_probe","update crm_private.access_probe set public_value='tampered'","delete from crm_private.unit_history","set role crm_h0_migration"]){let error:any;try{await c.unsafe(q);}catch(e){error=e;}assert.ok(error);assert.equal(error.code,'42501');denied.push({user,q,code:error.code});}}
 for(const bytes of [null,Buffer.from('forged-context')]){let error:any;try{await runtime`select * from crm_api.read_probe(${bytes},${Buffer.alloc(32)},${Buffer.from('forged-input')})`;}catch(e){error=e;}assert.ok(error);assert.match(error.message,/F1_/);denied.push({user:'crm_h0_runtime',context:bytes?'forged':'absent',code:error.code,message:error.message});}
 await runtime`select set_config('crm.identity_id','forged',false),set_config('crm.identity_kind','technical',false),set_config('crm.scope','scope-h6013',false),set_config('crm.f1','forged',false)`;
 await assert.rejects(runtime`select * from crm_api.read_probe(${Buffer.from('forged')},${Buffer.alloc(32)},${Buffer.from('forged')})`,/F1_/);assert.deepEqual(await probe(),before);
 await writeFile(out+'/security-result.json',JSON.stringify({expected:expected.security,denied,forgedSessionGucsDenied:true,originalsPreserved:true},null,2)+'\n',{flag:'wx'});
});
