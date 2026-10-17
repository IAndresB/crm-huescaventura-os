import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedDiagnosticsE,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';

test('E-S01 current work projection revalidates evidence just like its owner and historical projection',async()=>{
 const h=await isolatedDiagnosticsE('h5017ecurrentevidence',59969);
 try{
  const f=await workFixture(h);await f.run(f.definition);const q={contextKind:'booking' as const,contextId:f.context.contextId,reference:f.definition.operationId,pageSize:100};
  assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===f.executionId));
  await h.admin`update crm_private.b07_links set admin_scope='E-restricted-current-synthetic' where record_id=${f.context.recordId}::uuid`;
  try{
   await assert.rejects(f.see(),/WORK_DENIED/);
   const nodes=(await h.diagnostic.read(await h.auth(),read,q)).nodes;
   console.log('E-S01 owner vs diagnostic',JSON.stringify({ownerDenied:true,execution:f.executionId,operation:f.definition.operationId,nodes}));
   assert.equal(nodes.some(n=>n.id===f.executionId||n.id===f.definition.operationId),false,'Diagnostic projection cannot expose work whose owning reader denies its evidence context');
  }finally{await h.admin`update crm_private.b07_links set admin_scope=${h.scope} where record_id=${f.context.recordId}::uuid`;}
  assert.ok((await h.diagnostic.read(await h.auth(),read,q)).nodes.some(n=>n.id===f.executionId));
 }finally{await h.close();}
});
