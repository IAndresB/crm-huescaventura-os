import {test} from 'node:test';
import assert from 'node:assert/strict';
import {composeProjection,type CanonicalProjectionFrame,type ProjectionQuery} from '../src/domain/coordinated-projection.ts';
const id='a1111111-1111-4111-8111-111111111111';
const q:ProjectionQuery={contextKind:'booking',contextId:id,surface:'calendar',destination:'administrator'};
test('H5-012 F02 canonical documentary certainty requires review and preserves original state',()=>{
 for(const [status,review,wanted] of [['Pendiente',null,'pending'],['Recibido',null,'pending'],['Revisado',null,'pending'],['Revisado',{actorId:'synthetic-reviewer'},'verified'],['No aplica',null,'verified'],['Incidencia',null,'pending']] as const){
 const frame:CanonicalProjectionFrame={contextKind:'booking',contextId:id,calendar:[],commercial:[],facts:[{kind:'b07_requirement_revisions',data:{after_data:{status,review},revision:2}}]},before=structuredClone(frame);
 const r=composeProjection(frame,q);assert.equal((r.entries[0] as any).certainty,wanted);assert.deepEqual((r.entries[0] as any).data.after_data,{status,review});assert.deepEqual(frame,before);assert.equal(r.mutationAuthority,false);
 for(const destination of ['customer','provider','ai'] as const)assert.deepEqual(composeProjection(frame,{...q,destination}).entries,[]);
 }
});
test('H5-012 F02 unverified or disputed hold portions cannot inherit verified certainty',()=>{
 for(const [parts,wanted] of [[[],'pending'],[[{validity:'Creado',verified:null,review:null}],'pending'],[[{validity:'Vigente',verified:{at:'synthetic'},review:null}],'verified'],[[{validity:'Vigente',verified:{at:'synthetic'},review:{cause:'new discrepancy'}}],'pending'],[[{validity:'Vigente',verified:{at:'synthetic'},review:null},{validity:'No verificado',verified:null,review:null}],'pending']] as const){
 const frame:CanonicalProjectionFrame={contextKind:'booking',contextId:id,calendar:[],commercial:[],facts:[{kind:'b04_hold_revisions',data:{after_data:{parts}}}]};assert.equal((composeProjection(frame,q).entries[0] as any).certainty,wanted);
 }
});
