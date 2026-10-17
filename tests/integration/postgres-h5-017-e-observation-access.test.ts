import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsE,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {boundaryFixture} from '../support/h5-boundary-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';

for(const mode of ['unknown-operation','no-operation','event']as const)test('E-S02 unverified observation does not bypass source authorization '+mode,async()=>{
 const h=await isolatedDiagnosticsE('eobs'+['unknown-operation','no-operation','event'].indexOf(mode),59970);
 try{
  const f=await workFixture(h);await f.run(f.definition);let evidence=f.context.recordId,eventId:string|undefined;
  if(mode==='event'){const event=await boundaryFixture(h,'other',f.context.contextId),cmd=event.base();await event.run(cmd);eventId=cmd.eventId;evidence=cmd.eventId;}
  const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),...(mode==='no-operation'?{}:{operationId:id()}),...(eventId?{eventId}:{executionId:f.executionId}),outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};await h.diagnostic.record(await h.auth(),write,o);
  const q={contextKind:'booking' as const,contextId:o.contextId,reference:o.requestRef,pageSize:100};assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId));
  const original=(await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row;
  if(mode!=='event'){
   const dest=await communicationFixture(h),context={recordId:dest.recordId,...dest.context},material={...f.material,content:'E source control after revision'},approval=await f.approve(material);await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[context.recordId]});
   assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId));
  }
  await h.admin`update crm_private.b07_links set admin_scope='E-source-restricted-synthetic' where record_id=${evidence}::uuid`;
  try{const nodes=(await h.diagnostic.read(await h.auth(),read,q)).nodes;console.log('E-S02 permission',JSON.stringify({mode,observation:o.observationId,returned:nodes.some(n=>n.id===o.observationId)}));assert.equal(nodes.some(n=>n.id===o.observationId),false,'Unverified intent cannot override current access to its referenced source');}
  finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${evidence}::uuid`;}
  assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===o.observationId));assert.deepEqual((await h.observer`select to_jsonb(x) row from crm_private.b10_diagnostic_observations x where observation_id=${o.observationId}::uuid`)[0]!.row,original);
 }finally{await h.close();}
});
