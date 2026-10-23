// H6-013 verification only. Product/migrations/historical fixtures are imported unchanged.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,mkdtemp,symlink} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
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
import {priorTables,dataSnapshot,type PriorTable} from '../support/h6-013-preservation.ts';
const out=process.env.H6013_CAPTURE_DIR;
if(!out||!out.includes('h6-013/'))throw new Error('H6013_NEW_CAPTURE_DIRECTORY_REQUIRED');
const manifest=JSON.parse(await readFile('tests/fixtures/h6-013/migrations.json','utf8'));
const seal=JSON.parse(await readFile('tests/fixtures/h6-013/expected-seal-v3.json','utf8'));
for(const[p,h]of Object.entries(seal.sha256))assert.equal(createHash('sha256').update(await readFile(p)).digest('hex'),h);
await mkdir(out,{recursive:false});
const applications=JSON.parse(await readFile('tests/fixtures/h6-013/expected-applications.json','utf8'));
async function legacy(h:any,origin:number){
 const pair=applications.pairs.find((p:any)=>p.origin===origin);assert.ok(pair);
 const temporary=await mkdtemp(join(tmpdir(),'crm-h6013-app-'+origin+'-'));
 const archive=execFileSync('git',['archive',pair.applicationCommit,'src'],{maxBuffer:16*1024*1024});
 execFileSync('tar',['-xf','-','-C',temporary],{input:archive});await symlink(join(process.cwd(),'node_modules'),join(temporary,'node_modules'));
 assert.equal(createHash('sha256').update(await readFile(join(temporary,pair.adapter))).digest('hex'),pair.adapterSha256);
 const old=await import(pathToFileURL(join(temporary,pair.adapter)).href),authModule=await import(pathToFileURL(join(temporary,'src/application/verified-auth.ts')).href),interactionModule=await import(pathToFileURL(join(temporary,'src/application/verified-interaction.ts')).href);
 await save('legacy-'+origin,{...pair,archiveSha256:createHash('sha256').update(archive).digest('hex'),retainedSourceDirectory:temporary});
 return {adapter:new old[pair.class](h.runtime,h.f1,h.f2),auth:()=>authModule.verifyAuth({verify:async()=>({subject:h.subject,sessionId:h.sessionId,passwordVerified:true,mfaVerified:true})},uid()),read:interactionModule.classifyServerEvent('core-read'),write:interactionModule.classifyServerEvent('core-action')};
}
async function save(name:string,value:unknown){await writeFile(out+'/'+name+'.json',JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
async function columns(h:any){return priorTables(h.admin);}
async function snapshot(h:any,tables:PriorTable[]){return dataSnapshot(h.admin,tables);}
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
 await save(caseId+'-summary',{caseId,origin,destination:68,edges,fixtureSource:'unchanged preexisting test/support fixture; no invented historical data format',historicalAdapterExecuted:true,wholeHistoricalReleaseExecuted:false});
 console.log('H6-013 '+caseId+' '+JSON.stringify({origin,destination:68,edges:edges.length,allOriginalColumnsPreserved:true,currentAdapterCompatibility:true}));
}
test('H6-013 B02 authentic26 identity and contextual relation through each27–68',async()=>{
 const h=await isolatedH2('h6013_identity',61426);
 try{
  const entity=uid(),context=uid();
  await h.identities.apply(await h.auth(),write,{action:'create_entity',operationId:uid(),targetId:entity,kind:'contact',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true,displayName:'SYNTHETIC H6 preserved identity'});
  await h.identities.apply(await h.auth(),write,{action:'create_context',operationId:uid(),targetId:context,kind:'opportunity',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true});
  await h.identities.apply(await h.auth(),write,{action:'designate',operationId:uid(),targetId:uid(),contextId:context,relatedId:entity,kind:'primary_contact',sourceRef:'synthetic-H6013',evidenceRef:'synthetic-reviewed',reason:'synthetic-before-upgrade',expectedVersion:0,verified:true});
  const prior=(await h.identities.read(await h.auth(),read,'entity',entity)).data;const old=await legacy(h,26);assert.deepEqual((await old.adapter.read(await old.auth(),old.read,'entity',entity)).data,prior);
  await upgrade(h,26,'B02',async()=>{assert.deepEqual((await h.identities.read(await h.auth(),read,'entity',entity)).data,prior);assert.deepEqual((await old.adapter.read(await old.auth(),old.read,'entity',entity)).data,prior);});
 }finally{await h.close();}
});
test('H6-013 B03 authentic30 accepted snapshot Booking identity history through31–68',async()=>{
 const h=await isolatedBooking('h6013_booking',61430);
 try{const f=await bookingFixture(h);await h.booking.apply(await h.auth(),write,f.q);
  const prior=await h.booking.read(await h.auth(),read,f.q.bookingId);const old=await legacy(h,30);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.q.bookingId),prior);
  await upgrade(h,30,'B03',async(version)=>{const current=await h.booking.read(await h.auth(),read,f.q.bookingId);assert.ok(current);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.q.bookingId),current);assert.equal((await old.adapter.apply(await old.auth(),old.write,f.q)).replayed,true);if(version>=62){const {closureAssessments,...original}=current as any;assert.deepEqual(original,prior);assert.equal(closureAssessments.bookingId,f.q.bookingId);assert.deepEqual(closureAssessments.assessments,{});assert.deepEqual(closureAssessments.history,[]);}else assert.deepEqual(current,prior);});
 }finally{await h.close();}
});
test('H6-013 B04 authentic33 exact money and assigned consumed portions through34–68',async()=>{
 const h=await isolatedAllocation('h6013_portions',61433);
 try{const f=await allocationFixture(h);const q=await f.assign('125.00','0.00');await h.allocations.apply(await h.auth(),write,q);await h.allocations.apply(await h.auth(),write,await f.consume(q,'25.00','0.00'));
  const prior=await f.see();const old=await legacy(h,33);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.paymentId),prior);await upgrade(h,33,'B04',async(version)=>{const current=await f.see();assert.deepEqual(current,version<46?prior:{...prior,summary:{...prior.summary,externalReturned:'0.00',netAfterReturned:'500.00',refundReserved:'0.00'}});assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.paymentId),current);assert.equal((await old.adapter.apply(await old.auth(),old.write,q)).replayed,true);});
 }finally{await h.close();}
});
test('H6-013 B05 authentic52 preparation and economic facts through53–68',async()=>{
 const h=await isolatedReality('h6013_preparation',61452);
 try{const f=await preparationFixture(h);await f.confirm();await f.pay();const old=await legacy(h,52);const originalReality=await old.adapter.read(await old.auth(),old.read,f.bid);assert.ok(originalReality);
  // Preserve original persisted facts independently of a current-state evaluator which may expand.
  await upgrade(h,52,'B05',async()=>{assert.ok((await h.observer`select count(*)::int n from crm_private.b04_bookings`)[0]!.n>0);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.bid),originalReality);});
 }finally{await h.close();}
});
test('H6-013 B06 authentic63 joint three closures and immutable history through64–68',async()=>{
 const h=await isolatedJointClosures('h6013_closures',61463);
 try{const f=await jointFixture(h);await f.j.run(await f.j.command());const prior=await f.j.c.view();assert.equal(prior.jointClosure.current,true);const old=await legacy(h,63);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.bookingId),prior);
  await upgrade(h,63,'B06',async()=>{assert.deepEqual(await f.j.c.view(),prior);assert.deepEqual(await old.adapter.read(await old.auth(),old.read,f.bookingId),prior);});
 }finally{await h.close();}
});
