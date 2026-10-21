// H6 verification only: disposable Unix-socket PostgreSQL, synthetic rows, rollback controls.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import postgres from 'postgres';
import {discoverDefiners,verifyDefiners,type DefinerExpected} from '../support/h6-013-security.ts';
import {priorTables,dataSnapshot,businessFacts,verifyPreserved} from '../support/h6-013-preservation.ts';

const out=process.env.H6013_V2_DIR,bin=process.env.POSTGRES_H0_BIN;
if(!out||!bin)throw new Error('NEW_V2_OUTPUT_AND_LOCAL_POSTGRES_REQUIRED');
await mkdir(out);
const seal=JSON.parse(await readFile('tests/fixtures/h6-013/corrective-v2/expected-seal.json','utf8'));
const bytes=await readFile(seal.path);
assert.equal(createHash('sha256').update(bytes).digest('hex'),seal.sha256);
const expected=JSON.parse(bytes.toString());
const save=async(name:string,value:unknown)=>writeFile(join(out,name+'.json'),JSON.stringify(value,null,2)+'\n',{flag:'wx'});

test('H6 V2 exact numeric content and case-insensitive effective configuration',async t=>{
 const temporary=await mkdtemp(join(tmpdir(),'crm-h6013-v2-')),socket=join(temporary,'s');await mkdir(socket);
 let started=false;let db:postgres.Sql|undefined;
 const native=(name:string,args:string[])=>{const r=spawnSync(join(bin,name),args,{encoding:'utf8'});assert.equal(r.status,0,r.stderr);};
 try{
  native('initdb',['-D',temporary+'/data','--username=bootstrap','--auth-local=trust','--auth-host=reject','--no-locale','--encoding=UTF8']);
  native('pg_ctl',['-D',temporary+'/data','-l',temporary+'/server.log','-o',`-k ${socket} -h '' -p 61416`,'-w','start']);started=true;
  db=postgres({host:socket,port:61416,user:'bootstrap',database:'postgres',max:1,prepare:false,onnotice:()=>{}});
  const sql=db;
  await sql.unsafe(`create role crm_h0_runtime;create role crm_h0_ha_tx;create role anon;create role authenticated;
   create role v2_owner nologin;create schema crm_audit_v2;create schema crm_private;
   create function crm_audit_v2.path() returns text language sql security definer set search_path=pg_catalog,pg_temp as $$select current_setting('search_path')$$;
   alter function crm_audit_v2.path() owner to v2_owner;revoke all on function crm_audit_v2.path() from public;
   create table crm_private.identity_v2_probe(id integer primary key,v bigint,n numeric,j jsonb,txt text);
   insert into crm_private.identity_v2_probe values(1,0,0,'{}','synthetic'),(2,-1,1.0,'[true,null]','synthetic-second');`);
  const policy:DefinerExpected={searchPath:expected.searchPath,functions:[{signature:'crm_audit_v2.path()',schema:'crm_audit_v2',owner:'v2_owner',ordinaryExecute:{runtime:false,tte:false,anon:false,authenticated:false}}]};
  const baseline=await discoverDefiners(sql);verifyDefiners(baseline,policy);
  for(const c of expected.securityCases)await t.test('configuration '+c.id,async()=>{
   // Deliberate direct catalogue mutations are restricted to this newly-created disposable cluster.
   await assert.rejects(sql.begin(async tx=>{
    await tx`update pg_proc set proconfig=${c.config}::text[] where oid='crm_audit_v2.path()'::regprocedure`;
    const actual=await discoverDefiners(tx);
    const effective=(await tx`select crm_audit_v2.path() value`)[0]!.value;
    if(c.effective!==undefined)assert.equal(effective,c.effective,'POSTGRES_EFFECTIVE_CONFIG');
    if(c.accept)verifyDefiners(actual,policy);
    else assert.throws(()=>verifyDefiners(actual,policy),/DEFINER_SEARCH_PATH_(UNSAFE|MISSING_OR_AMBIGUOUS)/);
    await save('config-'+c.id,{expected:c,observed:actual,effective,detected:!c.accept});
    throw new Error('V2_ROLLBACK');
   }),/V2_ROLLBACK/);
   assert.deepEqual(await discoverDefiners(sql),baseline,'CONFIGURATION_RESTORED');
  });
  await t.test('unexpected function outside original schemas and unsafe owner',async()=>{
   await assert.rejects(sql.begin(async tx=>{
    await tx.unsafe(`create schema another_v2;create function another_v2.extra() returns int language sql security definer set search_path=pg_catalog,pg_temp as $$select 1$$;`);
    const actual=await discoverDefiners(tx);
    assert.equal(actual.length,2);
    assert.throws(()=>verifyDefiners(actual,policy),/DEFINER_INVENTORY_MISMATCH/);
    assert.throws(()=>verifyDefiners(baseline,{...policy,functions:[]}),/DEFINER_INVENTORY_MISMATCH/);
    await tx.unsafe('alter function crm_audit_v2.path() owner to bootstrap');
    assert.throws(()=>verifyDefiners((await discoverDefiners(tx)).filter(f=>f.schema==='crm_audit_v2'),policy),/DEFINER_OWNER/);
    await save('unexpected-owner',{unexpectedSignature:'another_v2.extra()',discovered:actual.map(f=>f.signature),inventoryRejected:true,unsafeOwnerRejected:true});
    throw new Error('V2_ROLLBACK');
   }),/V2_ROLLBACK/);
   assert.deepEqual(await discoverDefiners(sql),baseline);
  });
  const tables=await priorTables(sql),original=await dataSnapshot(sql,tables);
  for(const c of expected.numericCases)await t.test('numeric '+c.id,async()=>{
   await assert.rejects(sql.begin(async tx=>{
    assert.ok(['v','n','j'].includes(c.column));
    const set=async(value:string|null)=>tx.unsafe(`update crm_private.identity_v2_probe set ${c.column}=$1 where id=1`,[value]);
    await set(c.a);const before=await dataSnapshot(tx,tables),factsBefore=await businessFacts(tx,tables);
    const serverBefore=(await tx.unsafe(`select ${c.column}::text value from crm_private.identity_v2_probe where id=1`))[0]!.value;
    await set(c.b);const after=await dataSnapshot(tx,tables),factsAfter=await businessFacts(tx,tables);
    const serverAfter=(await tx.unsafe(`select ${c.column}::text value from crm_private.identity_v2_probe where id=1`))[0]!.value;
    assert.equal(before['crm_private.identity_v2_probe']!.count,after['crm_private.identity_v2_probe']!.count);
    if(c.equal){verifyPreserved(before,after);assert.deepEqual(factsBefore,factsAfter);}
    else{assert.throws(()=>verifyPreserved(before,after),/H6013_ORIGINAL_CONTENT_CHANGED/);assert.notDeepEqual(factsBefore,factsAfter);}
    await save('numeric-'+c.id,{expected:c,serverBefore,serverAfter,before,after,factsBefore,factsAfter,restoration:'transaction rolled back after capture'});
    throw new Error('V2_ROLLBACK');
   }),/V2_ROLLBACK/);
   verifyPreserved(original,await dataSnapshot(sql,tables));
  });
  await t.test('stable row order and SQL type distinction',async()=>{
   await assert.rejects(sql.begin(async tx=>{
    const before=await dataSnapshot(tx,tables);
    await tx.unsafe('create temp table reverse_copy as select * from crm_private.identity_v2_probe order by id desc;delete from crm_private.identity_v2_probe;insert into crm_private.identity_v2_probe select * from reverse_copy');
    verifyPreserved(before,await dataSnapshot(tx,tables));
    await tx.unsafe('alter table crm_private.identity_v2_probe alter column v type numeric using v::numeric');
    const changed=await dataSnapshot(tx,tables);
    assert.throws(()=>verifyPreserved(before,changed),/H6013_ORIGINAL_CONTENT_CHANGED/);
    await save('order-and-types',{before,changed,stableOrder:true,typeChangeDetected:true});
    throw new Error('V2_ROLLBACK');
   }),/V2_ROLLBACK/);
  });
  await save('resource',{temporary,listenAddresses:'',port:61416,syntheticOnly:true});
 }finally{if(db)await db.end({timeout:5});if(started)native('pg_ctl',['-D',temporary+'/data','-m','fast','-w','stop']);await save('cleanup',{stopped:started,temporary});}
});
