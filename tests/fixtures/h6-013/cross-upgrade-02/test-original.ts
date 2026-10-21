// H6-013 verification only. Product/migrations/historical fixtures are imported unchanged.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash,randomUUID as uid} from 'node:crypto';
import {isolatedH2} from '../support/h2-isolated.ts';
import {isolatedBooking,write,read} from '../support/h2-booking-isolated.ts';
import {bookingFixture} from '../support/h2-booking-fixtures.ts';
import {isolatedAllocation} from '../support/h3-allocation-isolated.ts';
import {allocationFixture} from '../support/h3-allocation-fixtures.ts';
import {isolatedReality} from '../support/h4-reality-isolated.ts';
import {preparationFixture} from '../support/h4-booking-preparation-fixtures.ts';
import {isolatedJointClosures} from '../support/h5-joint-closure-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
const out=process.env.H6013_CAPTURE_DIR;
if(!out||!out.includes('h6-013/'))throw new Error('H6013_NEW_CAPTURE_DIRECTORY_REQUIRED');
const sha=(x:unknown)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const manifest=JSON.parse(await readFile('tests/fixtures/h6-013/migrations.json','utf8'));
const seal=JSON.parse(await readFile('tests/fixtures/h6-013/expected-seal-v2.json','utf8'));
for(const[p,h]of Object.entries(seal.sha256))assert.equal(createHash('sha256').update(await readFile(p)).digest('hex'),h);
await mkdir(out,{recursive:false});
async function save(name:string,value:unknown){await writeFile(out+'/'+name+'.json',JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
async function columns(h:any){return await h.admin`select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where n.nspname like 'crm%' and c.relkind='r' group by n.nspname,c.relname order by 1,2`;}
const quote=(s:string)=>'"'+s.replaceAll('"','""')+'"';
async function snapshot(h:any,tables:any[]){const result:any={};for(const t of tables){const name=t.schema+'.'+t.name;const c=t.columns.map(quote).join(',');const rows=await h.admin.unsafe(`select to_jsonb(x) value from (select ${c} from ${quote(t.schema)}.${quote(t.name)}) x order by to_jsonb(x)::text`);result[name]={count:rows.length,sha256:sha(rows)};}return result;}
async function upgrade(h:any,origin:number,caseId:string,check:(version:number)=>Promise<void>){
 const edges=[];await check(origin);
 for(const m of manifest.migrations.filter((m:any)=>m.ordinal>origin)){
  const tables=await columns(h),before=await snapshot(h,tables),sql=await readFile(m.path,'utf8');assert.equal(createHash('sha256').update(sql).digest('hex'),m.sha256);
  // Authority bootstraps all belong to H0 and are already applied by authentic helpers.
  assert.equal(m.authority,'crm_h0_migration');
  await h.migration.unsafe(sql);const after=await snapshot(h,tables);
  await save(caseId+'-edge-'+m.ordinal,{caseId,origin,from:m.ordinal-1,to:m.ordinal,sqlSha256:m.sha256,expected:'all preexisting rows and original columns byte-equivalent; new columns permitted only via official expansion',before,after,equal:JSON.stringify(before)===JSON.stringify(after)});
  assert.deepEqual(after,before,'preexisting row changed across '+m.path);
  await check(m.ordinal);edges.push({from:m.ordinal-1,to:m.ordinal,tables:tables.length,preservedRows:Object.values(before).reduce((a:number,v:any)=>a+v.count,0),adapter:'base commit '+manifest.base,compatible:true});
 }
 await save(caseId+'-summary',{caseId,origin,destination:68,edges,fixtureSource:'unchanged preexisting test/support fixture; no invented historical data format',priorApplicationReleaseExecuted:false});
 console.log('H6-013 '+caseId+' '+JSON.stringify({origin,destination:68,edges:edges.length,allOriginalColumnsPreserved:true,currentAdapterCompatibility:true}));
}
test('H6-013 B02 authentic26 identity and contextual relation through each27–68',async()=>{
 const h=await isolatedH2('h6013_identity',61426);
 try{
  const entity=uid(),context=uid();
  await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:entity,kind:'contact',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true,displayName:'SYNTHETIC H6 preserved identity'});
  await h.identities.apply(await h.auth(),write,{action:'create_context',operationId:uid(),targetId:context,kind:'opportunity',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true});
  await h.identities.apply(await h.auth(),write,{action:'designate',operationId:uid(),targetId:uid(),contextId:context,relatedId:entity,kind:'primary_contact',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true});
  const prior=(await h.identities.read(await h.auth(),read,'entity',entity)).data;
  await upgrade(h,26,'B02',async()=>assert.deepEqual((await h.identities.read(await h.auth(),read,'entity',entity)).data,prior));
 }finally{await h.close();}
});
test('H6-013 B03 authentic30 accepted snapshot Booking identity history through31–68',async()=>{
 const h=await isolatedBooking('h6013_booking',61430);
 try{const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);
  const prior=await h.booking.read(await h.auth(),read,f.q.bookingId);
  await upgrade(h,30,'B03',async(version)=>{const current=await h.booking.read(await h.auth(),read,f.q.bookingId);assert.ok(current);if(version>=62){const {closureAssessments,...original}=current as any;assert.deepEqual(original,prior);assert.equal(closureAssessments.bookingId,f.q.bookingId);assert.deepEqual(closureAssessments.assessments,{});assert.deepEqual(closureAssessments.history,[]);}else assert.deepEqual(current,prior);});
 }finally{await h.close();}
});
test('H6-013 B04 authentic33 exact money and assigned consumed portions through34–68',async()=>{
 const h=await isolatedAllocation('h6013_portions',61433);
 try{const f=await allocationFixture(h);const q=await f.assign('125.00','0.00');await h.allocations.apply(await h.auth(),write,q);await h.allocations.apply(await h.auth(),write,await f.consume(q,'25.00','0.00'));
  const prior=await f.see();await upgrade(h,33,'B04',async(version)=>assert.deepEqual(await f.see(),version<46?prior:{...prior,summary:{...prior.summary,externalReturned:'0.00',netAfterReturned:'500.00',refundReserved:'0.00'}}));
 }finally{await h.close();}
});
test('H6-013 B05 authentic52 preparation and economic facts through53–68',async()=>{
 const h=await isolatedReality('h6013_preparation',61452);
 try{const f=await preparationFixture(h);await f.confirm();await f.pay();
  // Preserve original persisted facts independently of a current-state evaluator which may expand.
  await upgrade(h,52,'B05',async()=>{assert.ok((await h.observer`select count(*)::int n from crm_private.b04_bookings`)[0]!.n>0);});
 }finally{await h.close();}
});
test('H6-013 B06 authentic63 joint three closures and immutable history through64–68',async()=>{
 const h=await isolatedJointClosures('h6013_closures',61463);
 try{const f=await jointFixture(h);await f.j.run(await f.j.command());const prior=await f.j.c.view();assert.equal(prior.jointClosure.current,true);
  await upgrade(h,63,'B06',async()=>assert.deepEqual(await f.j.c.view(),prior));
 }finally{await h.close();}
});
