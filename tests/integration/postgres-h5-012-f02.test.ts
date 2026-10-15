// F02 independent reproducer: C01/C02/C07/C08, canonical holds and document needs.
import {before,after,test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {isolatedBoundaries,read,write} from '../support/h5-boundary-isolated.ts';
import {holdFixture} from '../support/h4-hold-fixtures.ts';
import {requirementFixture} from '../support/h4-requirement-fixtures.ts';
import {H5011ProjectionAdapter} from '../../src/infrastructure/postgres/h5-projection-adapter.ts';
let h:Awaited<ReturnType<typeof isolatedBoundaries>>,reader:H5011ProjectionAdapter;
before(async()=>{h=await isolatedBoundaries('h512f02',59421);for(const name of (await readdir('supabase/migrations')).filter(x=>x>='20261014003559'&&x.endsWith('.sql')).sort())await h.migration.unsafe(await readFile('supabase/migrations/'+name,'utf8'));reader=new H5011ProjectionAdapter(h.runtime,h.f1,h.f2);});
after(async()=>{await h?.close();});
async function get(id:string,contextKind:'booking'|'opportunity',surface:'calendar'|'timeline'='calendar',destination:'administrator'|'customer'='administrator'){return reader.read(await h.auth(),read,{contextId:id,contextKind,surface,destination});}
test('H5-012 F02 hold expiry and history follow canonical revision, not identity only',async()=>{
 const f=await holdFixture(h,'2026-11-13T13:15:00Z');await f.apply(await f.grant());const first=await get(f.opportunityId,'opportunity');
 console.log('F02 hold',JSON.stringify({canonical:await f.state(),projected:first}));
 assert.ok(JSON.stringify(first).includes('2026-11-13T13:15:00Z'),'calendar must retain the explicit canonical expiry');
 await f.apply(await f.extend({selections:[{...f.selection('12'),expiresAt:'2026-11-14T14:00:00Z',conditions:'SYNTHETIC explicit extension'}]}));
 const current=await get(f.opportunityId,'opportunity'),history=await get(f.opportunityId,'opportunity','timeline');
 const revisions=(current!.entries as any[]).filter(x=>x.source==='crm_private.b04_hold_revisions');assert.equal(revisions.length,1);assert.equal(revisions[0].data.revision,2);assert.equal(revisions[0].data.after_data.parts[0].terms.expiresAt,'2026-11-14T14:00:00Z');assert.equal((history!.entries as any[]).filter(x=>x.source==='crm_private.b04_hold_revisions').length,2);
 const before=await f.state();await get(f.opportunityId,'opportunity');assert.deepEqual(await f.state(),before);assert.equal(JSON.stringify(await get(f.opportunityId,'opportunity','calendar','customer')).includes(f.holdId),false);
});
test('H5-012 F02 documentary pending and received states never become reviewed by projection',async()=>{
 const f=await requirementFixture(h);await h.requirements.apply(await h.auth(),write,await f.need());const first=await get(f.bookingId,'booking');console.log('F02 requirement',JSON.stringify({canonical:await f.see(),projected:first}));
 assert.ok(JSON.stringify(first).includes('Pendiente'),'calendar must expose actual pending document state');
 await h.requirements.apply(await h.auth(),write,await f.receive());const current=await get(f.bookingId,'booking'),history=await get(f.bookingId,'booking','timeline'),rows=(current!.entries as any[]).filter(x=>x.source==='crm_private.b07_requirement_revisions');
 assert.equal(rows.length,1);assert.equal(rows[0].data.after_data.status,'Recibido');assert.equal(rows[0].certainty,'pending');assert.equal((history!.entries as any[]).filter(x=>x.source==='crm_private.b07_requirement_revisions').length,2);
 const before=await f.see();await get(f.bookingId,'booking');assert.deepEqual(await f.see(),before);assert.equal(JSON.stringify(await get(f.bookingId,'booking','calendar','customer')).includes(f.requirementId),false);
});
