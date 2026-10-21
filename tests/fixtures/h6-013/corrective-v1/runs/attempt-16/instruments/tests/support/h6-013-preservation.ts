// Full preexisting-column comparison; hashes cover private key rows without exporting key material.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type postgres from 'postgres';
export interface PriorTable {schema:string;name:string;columns:string[]}
export type DataSnapshot=Record<string,{columns:string[];count:number;sha256:string}>;
const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
export async function priorTables(db:postgres.Sql|postgres.TransactionSql):Promise<PriorTable[]>{
 return [...await db.unsafe<PriorTable[]>(`select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns
 from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
 where n.nspname like 'crm%' and c.relkind='r' group by n.nspname,c.relname order by 1,2`)];
}
export async function dataSnapshot(db:postgres.Sql|postgres.TransactionSql,tables:PriorTable[]):Promise<DataSnapshot>{
 const result:DataSnapshot={};
 for(const t of tables){
  const rows=await db.unsafe('select to_jsonb(x) value from (select '+t.columns.map(quote).join(',')+' from '+quote(t.schema)+'.'+quote(t.name)+') x order by to_jsonb(x)::text');
  result[t.schema+'.'+t.name]={columns:t.columns,count:rows.length,sha256:createHash('sha256').update(JSON.stringify(rows)).digest('hex')};
 }
 return result;
}
export function verifyPreserved(before:DataSnapshot,after:DataSnapshot):void{assert.deepEqual(after,before,'H6013_ORIGINAL_CONTENT_CHANGED');}
export async function constraints(db:postgres.Sql|postgres.TransactionSql){
 return [...await db.unsafe(`select c.conrelid::regclass::text relation,c.conname,c.contype,c.convalidated,pg_get_constraintdef(c.oid) definition
 from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname like 'crm%' order by 1,2`)];
}
// Readable synthetic business facts accompany the full hashes. Authentication/key tables are excluded here.
export async function businessFacts(db:postgres.Sql|postgres.TransactionSql,tables:PriorTable[]){
 const facts:Record<string,unknown[]>={};
 for(const t of tables.filter(t=>t.schema==='crm_private'&&/^(identity_|catalog_|commercial_|b07_)/.test(t.name))){
  facts[t.schema+'.'+t.name]=[...await db.unsafe('select to_jsonb(x) value from (select '+t.columns.map(quote).join(',')+' from '+quote(t.schema)+'.'+quote(t.name)+') x order by to_jsonb(x)::text')];
 }
 return facts;
}
