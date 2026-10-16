import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedJointClosures,write,read} from '../support/h5-joint-closure-isolated.ts';
import {jointFixture} from '../support/h5-joint-closure-fixtures.ts';
import {incidentFixture} from '../support/h4-incident-fixtures.ts';
let h:Awaited<ReturnType<typeof isolatedJointClosures>>;
before(async()=>{h=await isolatedJointClosures('h5016audit',59560);});after(async()=>{await h?.close();});
for(const field of ['action','operationId','bookingId','expectedRevision','expectedMaterial','expectedJointRevision','sourceRef','reason','at','evidenceId'])test(`H5-016 A01 null joint command ${field} rejects without closure`,async()=>{
 const f=await jointFixture(h),q=await f.j.command(),before=await f.j.c.view();await assert.rejects(f.j.run({...q,[field]:null} as never));assert.deepEqual(await f.j.c.view(),before);
});
for(const damaged of [null,{}])test(`H5-016 A01 corrupted final terms ${JSON.stringify(damaged)} cannot resolve or close`,async()=>{
 const f=await jointFixture(h,[]);
 await h.admin.unsafe('alter table crm_private.b04_bookings disable trigger user');
 try{await h.admin.unsafe(`update crm_private.b04_bookings set terms='${JSON.stringify(damaged)}'::jsonb where booking_id=$1`,[f.bookingId]);}finally{await h.admin.unsafe('alter table crm_private.b04_bookings enable trigger user');}
 await assert.rejects(f.j.resolve('commercial'),/CRITERION|INPUT|TERMS/);
 assert.equal((await f.j.c.view()).jointClosure.current,false);
});
for(const item of [
 {name:'missing deposit applicability',dimension:'economic',change:{deposits:[{sourceCurrent:true,amounts:{resolved:true},resolution:{},serviceId:'synthetic'}]},criterion:'deposits'},
 {name:'null deposit applicability',dimension:'economic',change:{deposits:[{applicability:null,sourceCurrent:true,amounts:{resolved:true},resolution:{}}]},criterion:'deposits'},
 {name:'missing deposit resolution',dimension:'economic',change:{deposits:[{applicability:'required',sourceCurrent:true,amounts:{resolved:true}}]},criterion:'deposits'},
 {name:'empty modification parts',dimension:'commercial',change:{modifications:[{progress:'Solicitada',parts:[]}]},criterion:'modifications'},
] as const)test('H5-016 A01 incomplete kernel inputs: '+item.name,async()=>{
 const f=await jointFixture(h),v=await f.j.c.view();const q=await f.j.c.command(item.dimension,{}, {serviceApplicability:await f.j.flags()});const input={...v.inputs,...item.change};const r=(await h.migration`select crm_private.closure_assess(${h.migration.json(input)},${h.migration.json(JSON.parse(JSON.stringify(q)))}) result`)[0]!.result;
 assert.equal(r.criteria.find((x:any)=>x.id===item.criterion).result,'pending');
});
test('H5-016 A08 nonmaterial incident and unrelated evidence preserve closed Booking',async()=>{
 const f=await jointFixture(h),q=await f.j.command();await f.j.run(q);const before=await f.j.c.view();const inc=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});
 await h.incidents.apply(await h.auth(),write,await inc.command('detect',{...inc.data,severity:'Leve',impact:{...inc.impact,material:false,effect:'preparation'}}));
 const after=await f.j.c.view();assert.equal(after.jointClosure.current,true);assert.deepEqual(after.invalidations,[]);assert.deepEqual(after.jointClosure.history,before.jointClosure.history);
});
test('H5-016 A04 explicit reopening changes only assessment history',async()=>{
 const f=await jointFixture(h);await f.j.run(await f.j.command());const inc=await incidentFixture(h,undefined,{bookingId:f.bookingId,serviceId:f.b.detail.services[0]!.id});await h.incidents.apply(await h.auth(),write,await inc.command('detect',{...inc.data,severity:'Importante',impact:{...inc.impact,effect:'economic-review'}}));
 const tables=['b04_bookings','b04_services','b05_payment_revisions','b05_invoice_revisions','b05_refund_revisions','b05_deposit_revisions','b07_incident_revisions','b07_requirement_revisions'];const snapshot=async()=>Promise.all(tables.map(async t=>({table:t,rows:await h.observer.unsafe(`select to_jsonb(x) v from crm_private.${t} x order by to_jsonb(x)::text`)})));
 const before=await snapshot(),old=(await f.j.c.view()).jointClosure.history;const q=await f.j.c.command('economic',{}, {action:'reopen',serviceApplicability:await f.j.flags()});await f.j.c.run(q);assert.deepEqual(await snapshot(),before);assert.deepEqual((await f.j.c.view()).jointClosure.history,old);assert.equal((await f.j.c.run(q)).replayed,true);
});
test('H5-016 A02 independent SQL dependency graph and immutability inventory',async()=>{
 const funcs=await h.observer`select n.nspname||'.'||p.proname name,pg_get_functiondef(p.oid) body from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in('crm_private','crm_api') and p.prokind='f'`;
 const rels=await h.observer`select n.nspname||'.'||c.relname name,c.relkind,c.relrowsecurity,c.relforcerowsecurity,case when c.relkind='v' then pg_get_viewdef(c.oid)else null end body from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='crm_private' and c.relkind in('r','v')`;
 const bodies=new Map<string,string>();for(const r of [...funcs,...rels.filter(r=>r.body)])bodies.set(r.name,(bodies.get(r.name)??'')+'\n'+r.body);const seen=new Set<string>(),todo=['crm_private.closure_inputs','crm_private.closure_basis','crm_private.closure_assess'];
 while(todo.length){const name=todo.pop()!;if(seen.has(name))continue;seen.add(name);for(const ref of (bodies.get(name)??'').matchAll(/crm_private\.[a-z0-9_]+/g)){if(!seen.has(ref[0]))todo.push(ref[0]);}}
 const sources=[];for(const r of rels.filter(r=>seen.has(r.name)&&r.relkind==='r')){const triggers=await h.observer`select tgname,pg_get_triggerdef(oid) definition from pg_trigger where tgrelid=${r.name}::regclass and not tgisinternal order by tgname`;const perms=await h.observer`select rolname,has_table_privilege(rolname,${r.name},'INSERT') ins,has_table_privilege(rolname,${r.name},'UPDATE') upd,has_table_privilege(rolname,${r.name},'DELETE') del from pg_roles where rolname in('crm_h0_runtime','crm_h0_f2_executor','crm_h0_migration')order by rolname`;sources.push({...r,body:undefined,triggers,perms});}
 assert.ok(sources.length>36);for(const s of sources)assert.equal(s.perms.find((p:any)=>p.rolname==='crm_h0_runtime')!.del,false);
 console.log('H5016 dependency graph',JSON.stringify({functions:[...seen].filter(x=>bodies.has(x)),sources}));
});
