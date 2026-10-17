import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as id} from 'node:crypto';
import {isolatedDiagnosticsE,read,write} from '../support/h5-diagnostic-e-isolated.ts';
import {workFixture} from '../support/h5-work-isolated.ts';
import {communicationFixture} from '../support/h5-communication-isolated.ts';
import {diagnosticReference} from '../../src/server/diagnostics.ts';
import {semanticIssue} from '../../src/domain/semantic-error.ts';

test('E-I06 a foreign work execution aliasing local evidence never lends its operation or history to that root',async()=>{
 const h=await isolatedDiagnosticsE('h5017eownercollision',59968);
 try{
  const local=await communicationFixture(h),foreign=await workFixture(h),execution=local.recordId;
  await foreign.run({...foreign.definition,executionId:execution});
  const q={contextKind:'booking' as const,contextId:local.context.contextId,reference:foreign.definition.operationId,pageSize:100};
  const initial=(await h.diagnostic.read(await h.auth(),read,q)).nodes;
  const o={contextKind:'booking' as const,contextId:local.context.contextId,operationId:foreign.definition.operationId,observationId:id(),requestRef:diagnosticReference(id()),outcome:'pending' as const,issues:[semanticIssue('E4','operation')]};
  let rejected=false;try{await h.diagnostic.record(await h.auth(),write,o);}catch(e){assert.match(String(e),/DIAGNOSTIC_DENIED/);rejected=true;}
  console.log('E-I06 typed owner collision',JSON.stringify({localRecord:local.recordId,foreignExecution:execution,foreignRoot:foreign.context.contextId,operation:foreign.definition.operationId,rejected,nodes:initial}));
  assert.equal(initial.some(n=>n.id===foreign.definition.operationId),false,'A work operation and its history belong to B08, not to an unrelated B07 record sharing its execution UUID');
  assert.equal(rejected,true,'No foreign work operation may be registered as a canonical local operation');
 }finally{await h.close();}
});
