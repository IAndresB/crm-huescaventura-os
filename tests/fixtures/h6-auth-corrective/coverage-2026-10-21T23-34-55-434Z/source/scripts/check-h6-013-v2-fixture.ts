// Reopens ONLY the disposable, already stopped H6 H1 fixture identified by its receipt.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import postgres from 'postgres';
import {canonicalPgJson,priorTables} from '../tests/support/h6-013-preservation.ts';
const receipt=process.env.H6013_H1_RESOURCE,output=process.env.H6013_FIXTURE_OUTPUT,bin=process.env.POSTGRES_H0_BIN;
assert.ok(receipt&&output&&bin,'EXPLICIT_LOCAL_FIXTURE_PATHS_REQUIRED');
const resource=JSON.parse(await readFile(receipt,'utf8'));
assert.equal(resource.stopped,true);assert.equal(resource.socketOnly,true);assert.equal(resource.syntheticOnly,true);
const temporary=resolve(resource.temporary);
assert.ok(temporary.startsWith(resolve(tmpdir())+'/crm-h6013-h1-'),'OWN_TEMPORARY_FIXTURE_REQUIRED');
const seal=JSON.parse(await readFile('tests/fixtures/h6-013/corrective-v2/expected-seal.json','utf8'));
const bytes=await readFile(seal.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),seal.sha256);
const expected=JSON.parse(bytes.toString()).originalFixture;
let started=false,db:postgres.Sql|undefined;
const native=(name:string,args:string[])=>{const r=spawnSync(join(bin,name),args,{encoding:'utf8'});assert.equal(r.status,0,r.stderr);};
const observations:{table:string;source:string;legacyNumber:string}[]=[];
try{
 native('pg_ctl',['-D',temporary+'/data','-l',temporary+'/v2-precision.log','-o',`-k ${temporary}/socket -h '' -p 61415`,'-w','start']);started=true;
 db=postgres({host:temporary+'/socket',port:61415,user:'bootstrap',database:'h6013_h1',max:1,prepare:false,onnotice:()=>{}});
 const tables=await priorTables(db),quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
 for(const table of tables){
  const rows=await db.unsafe<{value:string}[]>('select to_jsonb(x)::text value from '+quote(table.schema)+'.'+quote(table.name)+' x');
  for(const row of rows){
   assert.equal(canonicalPgJson(row.value),canonicalPgJson(JSON.stringify(JSON.parse(row.value))),'ORIGINAL_FIXTURE_LEGACY_PRECISION_CHANGED');
   JSON.parse(row.value,(_key:string,value:unknown,context?:{source?:string})=>{
    if(typeof value==='number'){
     assert.ok(context?.source);
     observations.push({table:table.schema+'.'+table.name,source:context.source,legacyNumber:String(value)});
    }
    return value;
   });
  }
 }
 assert.equal(tables.length,expected.tables);assert.equal(observations.length,expected.numericValues);
 const integerMagnitude=observations.filter(v=>/^-?\d+$/.test(v.source)).map(v=>{const n=BigInt(v.source);return n<0n?-n:n;});
 const maximum=integerMagnitude.reduce((a,b)=>a>b?a:b,0n);
 assert.equal(maximum.toString(),String(expected.maxIntegerMagnitude));
 await writeFile(output,JSON.stringify({expected,numericValues:observations.length,tables:tables.length,maxIntegerMagnitude:maximum.toString(),allOldValuesSemanticallyUnchanged:true,observations,sourceReceipt:receipt,sourceReceiptSha256:createHash('sha256').update(await readFile(receipt)).digest('hex')},null,2)+'\n',{flag:'wx'});
}finally{if(db)await db.end({timeout:5});if(started)native('pg_ctl',['-D',temporary+'/data','-m','fast','-w','stop']);}
