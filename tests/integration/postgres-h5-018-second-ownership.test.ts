import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isolatedCorrectedDiagnostics,read,write} from '../support/h5-diagnostic-corrected-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {randomUUID as id} from 'node:crypto';
import {semanticIssue} from '../../src/domain/semantic-error.ts';
test('O01 measure the original B08 owner historical authority after a typed same-UUID revision',async()=>{
 const h=await isolatedCorrectedDiagnostics('h5018secondowner',59921);
 try{
 const f=await workFixture(h);await f.run(f.definition);
 const o={contextKind:'booking' as const,contextId:f.context.contextId,observationId:id(),requestRef:diagnosticReference(id()),operationId:id(),executionId:f.executionId,outcome:'pending' as const,issues:[semanticIssue('E4','execution')]};await h.diagnostic.record(await h.auth(),write,o);
 const req=h.req('evidence',{claim:'Contacto sintético autorizado',coverage:'independent',certainty:'reviewed',source_kind:'manual'},f.context.contextId,'contact');await h.evidence.apply(await h.auth(),write,req);
 const context={recordId:req.targetId,contextKind:'contact',contextId:f.context.contextId,purpose:req.purpose},material={...f.material,content:'Cambio sintético autorizado'},approval=await f.approve(material);
 await f.run({...f.definition,...f.base(),action:'revise',version:2,context,material,...approval,affectedRefs:[req.targetId]});
 const owner=await f.worker.read(await h.auth(),read,f.executionId,context);await assert.rejects(f.see(),/WORK_DENIED/);
 const newNodes=(await h.diagnostic.read(await h.auth(),read,{contextKind:'contact',contextId:context.contextId,pageSize:100,reference:f.executionId})).nodes;
 const oldNodes=(await h.diagnostic.read(await h.auth(),read,{contextKind:'booking',contextId:f.context.contextId,pageSize:100,reference:o.requestRef})).nodes;
 console.log('O01 ownership comparison',JSON.stringify({ownerIncludesOldEvidence:JSON.stringify(owner).includes(f.comm.recordId),ownerIncludesOldApproval:JSON.stringify(owner).includes(f.definition.decisionId),ownerIncludesOldResponsibleActor:JSON.stringify(owner).includes(h.actorId),oldRootNodes:oldNodes,newRootDefinitions:newNodes.filter(n=>n.source==='b08_definitions'),currentNewEvidence:req.targetId,execution:f.executionId}));
 assert.ok(owner);assert.equal(oldNodes.some(n=>n.source==='b08_executions'),false);assert.equal(JSON.stringify(oldNodes).includes(req.targetId),false);
 }finally{await h.close();}
});
