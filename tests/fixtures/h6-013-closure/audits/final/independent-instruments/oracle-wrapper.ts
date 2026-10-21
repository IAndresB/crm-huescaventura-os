import assert from 'node:assert/strict';
import {appendFileSync} from 'node:fs';
import * as candidate from '../repo/tests/support/h6-013-preservation.ts?unwrapped';
export {businessFacts,canonicalPgJson,constraints,verifyPreserved} from '../repo/tests/support/h6-013-preservation.ts?unwrapped';
const q=(s:string)=>'"'+s.replaceAll('"','""')+'"';
const trace=(x:unknown)=>appendFileSync(process.env.AUDITOR_SQL_TRACE!,JSON.stringify({utc:new Date().toISOString(),...x as object})+'\n');
export async function priorTables(db:any){
 const found=await candidate.priorTables(db);
 const independent=await db.unsafe(`select t.table_schema schema,t.table_name name,array_agg(c.column_name order by c.ordinal_position) columns
 from information_schema.tables t join information_schema.columns c on c.table_schema=t.table_schema and c.table_name=t.table_name
 where t.table_schema like 'crm%' and t.table_type='BASE TABLE' group by 1,2 order by 1,2`);
 assert.deepEqual(JSON.parse(JSON.stringify(found)),JSON.parse(JSON.stringify(independent)),'AUDITOR_TABLE_COLUMN_COVERAGE');
 trace({kind:'coverage',tables:found});return found;
}
export async function dataSnapshot(db:any,tables:any[]){
 const snapshot=await candidate.dataSnapshot(db,tables),oracle:Record<string,unknown>={};
 for(const t of tables){
  const sql=`select count(*)::text count,encode(sha256(convert_to(coalesce(string_agg(v,E'\n' order by v),''),'UTF8')),'hex') sha256 from
  (select row_to_json(x)::text||'|'||json_build_array(${t.columns.map((c:string)=>'x.'+q(c)+' is null').join(',')})::text v
  from (select ${t.columns.map(q).join(',')} from ${q(t.schema)}.${q(t.name)}) x) encoded`;
  const result=(await db.unsafe(sql))[0];
  (snapshot[t.schema+'.'+t.name] as any).auditorSqlTextHash=result.sha256;
  (snapshot[t.schema+'.'+t.name] as any).auditorSqlCount=result.count;
  oracle[t.schema+'.'+t.name]=result;
 }
 trace({kind:'snapshot',oracle});return snapshot;
}
