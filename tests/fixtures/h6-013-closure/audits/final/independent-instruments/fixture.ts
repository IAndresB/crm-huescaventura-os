import assert from 'node:assert/strict';import {readFile,writeFile} from 'node:fs/promises';import {spawnSync} from 'node:child_process';import postgres from '../repo/node_modules/postgres/src/index.js';
const receipt='/Users/andres/Documents/CRM_HUESCAVENTURA_AUDITS/H6-013-final-independent-20261020T175121Z/h6-013/candidate-h1/details/resource.json';
const r=JSON.parse(await readFile(receipt,'utf8'));assert.equal(r.stopped,true);assert.ok(r.temporary.startsWith('/private/tmp/h6013-final-audit-8f_a6_5a/tmp/crm-h6013-h1-'));
const bin=process.env.POSTGRES_H0_BIN!,native=(args:string[])=>{const p=spawnSync(bin+'/pg_ctl',args,{encoding:'utf8'});assert.equal(p.status,0,p.stderr);};let db:any;let started=false;const observations:any[]=[];
try{
 native(['-D',r.temporary+'/data','-l',r.temporary+'/auditor-fixture.log','-o',`-k ${r.temporary}/socket -h '' -p 61415`,'-w','start']);started=true;
 db=postgres({host:r.temporary+'/socket',port:61415,user:'bootstrap',database:'h6013_h1',max:1,prepare:false});
 const tables=await db`select table_schema,table_name from information_schema.tables where table_schema like 'crm%' and table_type='BASE TABLE' order by 1,2`;
 const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
 for(const table of tables){
  const rows=await db.unsafe(`select row_to_json(t)::text value from ${quote(table.table_schema)}.${quote(table.table_name)} t`);
  for(const row of rows)JSON.parse(row.value,(_k:string,v:any,c:any)=>{if(typeof v==='number')observations.push({table:table.table_schema+'.'+table.table_name,exact:c.source,legacy:String(v)});return v;});
 }
 for(const v of observations)assert.equal((await db`select ${v.exact}::text::numeric = ${v.legacy}::text::numeric equal`)[0].equal,true);
 assert.equal(tables.length,53);assert.equal(observations.length,55);
 const max=observations.filter(v=>/^-?\d+$/.test(v.exact)).reduce((a,v)=>{const n=BigInt(v.exact);return a>(n<0n?-n:n)?a:(n<0n?-n:n);},0n);assert.equal(max,2026n);
 await writeFile(process.env.AUDITOR_OUTPUT!,JSON.stringify({receipt,tables:tables.length,numericValues:observations.length,oracle:'PostgreSQL numeric equality between exact server token and legacy Number text; no candidate canonicalization',allEqual:true,maxIntegerMagnitude:max.toString(),observations},null,2)+'\n',{flag:'wx'});
}finally{if(db)await db.end({timeout:5});if(started)native(['-D',r.temporary+'/data','-m','fast','-w','stop']);}
