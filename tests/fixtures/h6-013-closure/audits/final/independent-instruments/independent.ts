import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import postgres from '../repo/node_modules/postgres/src/index.js';
import {discoverDefiners,verifyDefiners} from '../repo/tests/support/h6-013-security.ts';
import {dataSnapshot,businessFacts,canonicalPgJson} from '../repo/tests/support/h6-013-preservation.ts';
import {verifyDefiners as v1verify} from './v1-security.ts';
import {dataSnapshot as v1snapshot} from './v1-preservation.ts';
const expectedPath=process.env.AUDITOR_EXPECTED!,out=process.env.AUDITOR_OUTPUT!,bin=process.env.POSTGRES_H0_BIN!;
const bytes=await readFile(expectedPath),seal=JSON.parse(await readFile(expectedPath.replace('.json','-seal.json'),'utf8'));
assert.equal(createHash('sha256').update(bytes).digest('hex'),seal.sha256);
const expected=JSON.parse(bytes.toString()),report:any={expectedSha256:seal.sha256,startedUtc:new Date().toISOString(),search:[],json:[],mutations:[],native:[]};
const temp=await mkdtemp(process.env.TMPDIR+'/auditor-own-'),socket=temp+'/s';await mkdir(socket);
const native=(name:string,args:string[])=>{const r=spawnSync(bin+'/'+name,args,{encoding:'utf8'});report.native.push({name,args,status:r.status,stdout:r.stdout,stderr:r.stderr});assert.equal(r.status,0,r.stderr);};
const connections:any[]=[];let started=false;
const conn=(user:string,database='independent')=>{const db=postgres({host:socket,port:61418,user,database,max:1,prepare:false,onnotice:()=>{}});connections.push(db);return db;};
const rollback=async(db:any,fn:any)=>{await assert.rejects(db.begin(async(tx:any)=>{await fn(tx);throw new Error('AUDITOR_ROLLBACK');}),/AUDITOR_ROLLBACK/);};
const digest=(x:string)=>createHash('sha256').update(x).digest('hex');
try{
 native('initdb',['-D',temp+'/data','--username=bootstrap','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8']);
 native('pg_ctl',['-D',temp+'/data','-l',temp+'/server.log','-o',`-k ${socket} -h '' -p 61418`,'-w','start']);started=true;
 const m=JSON.parse(await readFile('tests/fixtures/h6-013/migrations.json','utf8'));
 const git=spawnSync('git',['ls-tree','-r','--name-only','HEAD','supabase/migrations'],{encoding:'utf8'});assert.equal(git.status,0);
 const paths=git.stdout.trim().split('\n').filter((p:string)=>p.endsWith('.sql')).sort();assert.deepEqual(paths,m.migrations.map((x:any)=>x.path));
 const sources=[];for(const path of paths){const b=await readFile(path);const g=spawnSync('git',['show','HEAD:'+path],{maxBuffer:20*1024*1024});assert.equal(g.status,0);assert.ok(b.equals(g.stdout));sources.push(b.toString());}
 const boot=conn('bootstrap','postgres');await boot.unsafe(sources[0]!);await boot.unsafe('create database independent owner crm_h0_migration');
 const db=conn('bootstrap'),migration=conn('crm_h0_migration');
 for(let i=1;i<paths.length;i++)await(m.migrations[i].authority==='cluster-bootstrap'?db:migration).unsafe(sources[i]!);
 await db.unsafe('create role anon;create role authenticated');
 report.migrations=paths.map((path:string,i:number)=>({path,sha256:digest(sources[i]!)}));
 // No namespace filter: compare the candidate discovery with the entire real catalogue.
 const global=await db.unsafe(`select p.oid::regprocedure::text signature,n.nspname schema,r.rolname owner,
 r.rolsuper,r.rolbypassrls,r.rolcanlogin,r.rolcreaterole,r.rolcreatedb,r.rolreplication,p.proconfig,
 exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and privilege_type='EXECUTE') public_execute
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner where p.prosecdef order by 1`);
 const actual=await discoverDefiners(db),policy=JSON.parse(await readFile('tests/fixtures/h6-013/corrective-v1/inputs/expected-definers.json','utf8'));
 assert.deepEqual(global.map((x:any)=>x.signature),actual.map(x=>x.signature));verifyDefiners(actual,policy);
 for(const f of global){for(const k of ['rolsuper','rolbypassrls','rolcanlogin','rolcreaterole','rolcreatedb','rolreplication','public_execute'])assert.equal(f[k],false,f.signature+':'+k);assert.deepEqual(f.proconfig,['search_path=pg_catalog, pg_temp']);}
 const membership=await db.unsafe(`select a.rolname ordinary,b.rolname owner,pg_has_role(a.oid,b.oid,'MEMBER') member,pg_has_role(a.oid,b.oid,'SET') can_set from pg_roles a cross join pg_roles b where a.rolname in ('crm_h0_runtime','crm_h0_ha_tx','anon','authenticated') and b.oid in(select proowner from pg_proc where prosecdef) order by 1,2`);
 for(const row of membership){assert.equal(row.member,false);assert.equal(row.can_set,false);}report.catalog={global,actual,membership,complete:true};
 await db.unsafe(`create role audit_owner nologin;create schema audit_outside;
 create function audit_outside.path() returns text language sql security definer set search_path=pg_catalog,pg_temp as $$select current_setting('search_path')$$;
 alter function audit_outside.path() owner to audit_owner;revoke all on function audit_outside.path() from public;`);
 const extra=(await discoverDefiners(db)).filter(x=>x.schema==='audit_outside');
 const ep={searchPath:['pg_catalog','pg_temp'],functions:extra.map(x=>({signature:x.signature,schema:x.schema,owner:x.owner,ordinaryExecute:x.ordinaryExecute}))};
 assert.throws(()=>verifyDefiners(awaitSyncNever(),policy));
 function awaitSyncNever(){return [...actual,...extra];}
 report.unexpected={signature:extra[0]!.signature,globalCount:global.length+1,rejected:true};
 for(const [id,config,accept]of expected.search){
  await rollback(db,async(tx:any)=>{
   await tx`update pg_proc set proconfig=${config}::text[] where oid='audit_outside.path()'::regprocedure`;
   const found=(await discoverDefiners(tx)).filter(x=>x.schema==='audit_outside');
   const effective=(await tx`select audit_outside.path() value`)[0].value;
   let rejection:string|null=null;try{verifyDefiners(found,ep);}catch(e){rejection=(e as Error).message;}
   assert.equal(rejection===null,accept,id);if(!accept)assert.match(rejection!,/DEFINER_SEARCH_PATH_/);
   let v1accept=null;if(id==='original-defect'){v1verify(found,ep);v1accept=true;assert.equal(effective,'public');}
   report.search.push({id,config,accept,effective,rejection,v1accept});
  });assert.deepEqual((await discoverDefiners(db)).filter(x=>x.schema==='audit_outside'),extra);
 }
 for(const [a,b]of expected.jsonPairs){
  const r=(await db`select ${a}::text::jsonb is not distinct from ${b}::text::jsonb equal,${a}::text::jsonb::text a,${b}::text::jsonb::text b`)[0];
  const ca=canonicalPgJson(r.a),cb=canonicalPgJson(r.b);assert.equal(ca===cb,r.equal);assert.equal(digest(ca)===digest(cb),r.equal);report.json.push({a,b,sqlEqual:r.equal,sha256a:digest(ca),sha256b:digest(cb)});
 }
 await db.unsafe(`create table audit_outside.parents(id uuid primary key);
 insert into audit_outside.parents values('00000000-0000-0000-0000-000000000001'),('00000000-0000-0000-0000-000000000002');
 create table crm_private.identity_audit_precision(id integer,ref uuid references audit_outside.parents,version bigint,amount numeric,document jsonb,label text);
 insert into crm_private.identity_audit_precision values(1,'00000000-0000-0000-0000-000000000001',9007199254740992,1.000000000000000000001,'{"x":[9007199254740992]}',null),(2,'00000000-0000-0000-0000-000000000002',-9007199254740992,1.2000,null,'second');
 create table audit_outside.original as table crm_private.identity_audit_precision;`);
 const tables=[{schema:'crm_private',name:'identity_audit_precision',columns:['id','ref','version','amount','document','label']}];
 const equal=(tx:any,baseline='audit_outside.original')=>tx.unsafe(`select not exists((select * from crm_private.identity_audit_precision except all select * from ${baseline}) union all(select * from ${baseline} except all select * from crm_private.identity_audit_precision)) equal`);
 const mutations:Record<string,string>={
 'positive-bigint':'update crm_private.identity_audit_precision set version=9007199254740993 where id=1',
 'negative-bigint':'update crm_private.identity_audit_precision set version=-9007199254740993 where id=2',
 'decimal-exact':'update crm_private.identity_audit_precision set amount=1.000000000000000000002 where id=1',
 'nested-json':`update crm_private.identity_audit_precision set document='{"x":[9007199254740993]}' where id=1`,
 'null-present':"update crm_private.identity_audit_precision set label='' where id=1",
 'json-null-present':"update crm_private.identity_audit_precision set document='null'::jsonb where id=2",
 'reference-valid':"update crm_private.identity_audit_precision set ref='00000000-0000-0000-0000-000000000002' where id=1",
 'same-count-duplicate-row':'delete from crm_private.identity_audit_precision where id=2;insert into crm_private.identity_audit_precision select * from crm_private.identity_audit_precision where id=1',
 'row-order':'delete from crm_private.identity_audit_precision;insert into crm_private.identity_audit_precision select * from audit_outside.original order by id desc',
 'decimal-scale':'update crm_private.identity_audit_precision set amount=1.2 where id=2'};
 const original=await dataSnapshot(db,tables);
 for(const [id,sql]of Object.entries(mutations))await rollback(db,async(tx:any)=>{
  const before=await dataSnapshot(tx,tables),beforeFacts=await businessFacts(tx,tables),oldBefore=await v1snapshot(tx,tables);
  await tx.unsafe(sql);const oracle=(await equal(tx))[0].equal,after=await dataSnapshot(tx,tables),factsAfter=await businessFacts(tx,tables),oldAfter=await v1snapshot(tx,tables);
  assert.equal(oracle,expected.mutations[id],id);assert.equal(JSON.stringify(before)===JSON.stringify(after),oracle,id);assert.equal(JSON.stringify(beforeFacts)===JSON.stringify(factsAfter),oracle,id);
  assert.equal(before['crm_private.identity_audit_precision']!.count,after['crm_private.identity_audit_precision']!.count);
  const v1Equal=JSON.stringify(oldBefore)===JSON.stringify(oldAfter);if(id==='positive-bigint')assert.equal(v1Equal,true);
  report.mutations.push({id,sql,typedMultisetEqual:oracle,before,after,v1Equal});
 });
 assert.equal((await equal(db))[0].equal,true);assert.deepEqual(await dataSnapshot(db,tables),original);report.restored=true;report.pass=true;
}catch(e){report.pass=false;report.error={message:(e as Error).message,stack:(e as Error).stack};process.exitCode=1;}
finally{await Promise.allSettled(connections.map(db=>db.end({timeout:5})));if(started)native('pg_ctl',['-D',temp+'/data','-m','fast','-w','stop']);report.resource={temp,unixSocket:socket,stopped:started};report.finishedUtc=new Date().toISOString();await writeFile(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({pass:report.pass,search:report.search.length,json:report.json.length,mutations:report.mutations.length,error:report.error}));}
