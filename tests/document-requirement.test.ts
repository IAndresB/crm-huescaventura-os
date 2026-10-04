import {test} from 'node:test';import assert from 'node:assert/strict';
import {requirementSatisfied,documentaryMissing} from '../src/domain/document-requirement.ts';
test('document state has an explicit review gate and localized insufficiency',()=>{
 assert.equal(requirementSatisfied({status:'Recibido',review:null}),false);assert.equal(documentaryMissing({status:'Recibido',review:null}),'review');
 assert.equal(requirementSatisfied({status:'Revisado',review:null}),false);assert.equal(requirementSatisfied({status:'Revisado',review:{evidenceId:'synthetic'}}),true);
 assert.equal(documentaryMissing({status:'Pendiente',review:null}),'document');assert.equal(documentaryMissing({status:'No aplica',review:null}),null);assert.equal(documentaryMissing({status:'Incidencia',review:{differences:['scope']}}),'compliance');
});
