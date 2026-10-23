// Full preexisting-column comparison; hashes cover private key rows without exporting key material.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import type postgres from 'postgres';
export interface PriorTable {schema:string;name:string;columns:string[]}
export type DataSnapshot=Record<string,{columns:string[];columnTypes:string[];count:number;sha256:string}>;
const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
// A decimal token never becomes a JavaScript Number. The JSON.parse source
// context is mandatory (Node 24 is pinned); absence fails closed.
class DecimalToken {
 value:string;
 constructor(source:string){
  const m=/^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(source);
  assert.ok(m,'H6013_INVALID_EXACT_NUMBER');
  let digits=(m[2]!+(m[3]??'')).replace(/^0+/,'');
  if(!digits){this.value='0e0';return;}
  const zeros=digits.length-digits.replace(/0+$/,'').length;
  digits=digits.slice(0,digits.length-zeros);
  const exponent=BigInt(m[4]??'0')-BigInt((m[3]??'').length)+BigInt(zeros);
  this.value=m[1]+digits+'e'+exponent.toString();
 }
}
// Tagged containers prevent collisions with strings or user JSON shaped like
// an internal numeric token. JSONB-equivalent scale/key order are normalized;
// array order, duplicates, NULL, primitive types and exact digits are retained.
export function canonicalPgJson(text:string):string{
 const parsed:unknown=JSON.parse(text,(_key:string,value:unknown,context?:{source?:string})=>{
  if(typeof value!=='number')return value;
  assert.equal(typeof context?.source,'string','H6013_LOSSLESS_JSON_CONTEXT_REQUIRED');
  return new DecimalToken(context!.source!);
 });
 const tagged=(v:unknown):unknown=>{
  if(v instanceof DecimalToken)return ['number',v.value];
  if(v===null)return ['null'];
  if(typeof v==='string'||typeof v==='boolean')return [typeof v,v];
  if(Array.isArray(v))return ['array',v.map(tagged)];
  assert.ok(typeof v==='object'&&v!==null,'H6013_UNTAGGED_VALUE');
  return ['object',Object.keys(v).sort().map(k=>[k,tagged((v as Record<string,unknown>)[k])])];
 };
 return JSON.stringify(tagged(parsed));
}
async function exactRows(db:postgres.Sql|postgres.TransactionSql,t:PriorTable):Promise<string[]>{
 // Casting to text bypasses postgres.js's JSON.parse decoder. The NULL bitmap
 // also distinguishes SQL NULL from a present JSONB literal null.
 const rows=await db.unsafe<{value:string}[]>('select jsonb_build_object(\'values\',to_jsonb(x),\'sqlNulls\',jsonb_build_array('+
  t.columns.map(c=>'x.'+quote(c)+' is null').join(',')+'))::text value from (select '+
  t.columns.map(quote).join(',')+' from '+quote(t.schema)+'.'+quote(t.name)+') x');
 return rows.map(row=>canonicalPgJson(row.value)).sort();
}
export async function priorTables(db:postgres.Sql|postgres.TransactionSql):Promise<PriorTable[]>{
 return [...await db.unsafe<PriorTable[]>(`select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns
 from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped
 where n.nspname like 'crm%' and c.relkind='r' group by n.nspname,c.relname order by 1,2`)];
}
export async function dataSnapshot(db:postgres.Sql|postgres.TransactionSql,tables:PriorTable[]):Promise<DataSnapshot>{
 const result:DataSnapshot={};
 for(const t of tables){
  const metadata=await db`select a.attname name,format_type(a.atttypid,a.atttypmod) type
   from pg_attribute a where a.attrelid=${quote(t.schema)+'.'+quote(t.name)}::regclass
   and a.attnum>0 and not a.attisdropped`;
  const columnTypes=t.columns.map(name=>{
   const column=metadata.find(c=>c.name===name);assert.ok(column,'H6013_MISSING_COLUMN:'+name);return column.type as string;
  });
  const rows=await exactRows(db,t);
  result[t.schema+'.'+t.name]={columns:t.columns,columnTypes,count:rows.length,
   sha256:createHash('sha256').update(JSON.stringify({columnTypes,rows})).digest('hex')};
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
  facts[t.schema+'.'+t.name]=await exactRows(db,t);
 }
 return facts;
}
