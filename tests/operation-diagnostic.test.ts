import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {diagnosticIssues,validateDiagnosticObservation,validateDiagnosticQuery} from '../src/domain/operation-diagnostic.ts';
import {errorCodes,semanticIssue} from '../src/domain/semantic-error.ts';
import {invokeDiagnosticOperation} from '../src/server/diagnostic-operation.ts';
const root={contextKind:'booking' as const,contextId:uid()};
test('H5-017 D01 normative known states and continuity preserved for all eight causes',()=>{
 const known=['unchanged','conflicting','pending','uncertain','unchanged','pending','pending','conflicting'];
 const next=['correct-or-review','reevaluate-current-state','supply-required-evidence','reconcile-before-retry','retry-only-if-safe','restore-dependency','resolve-ambiguity','review-discrepancy'];
 for(const [i,code]of errorCodes.entries()){const issue=diagnosticIssues([semanticIssue(code,'operation')])[0]!;assert.equal(issue.knownState,known[i]);assert.equal(issue.nextStep,next[i]);}
});
test('H5-017 D05 diagnostic scopes are closed, issue prose and extra properties dropped',()=>{
 assert.deepEqual(diagnosticIssues([{...semanticIssue('E4','canary'),knownState:'unchanged',nextStep:'correct-or-review',secret:'CANARY'}as never]),[semanticIssue('E4','operation')]);
 for(const c of ['unknown','E9','token'])assert.throws(()=>diagnosticIssues([{code:c}as never]));
});
test('H5-017 D01 invalid outcomes references and page inputs rejected',()=>{
 const q={...root,observationId:uid(),requestRef:'ref-'+'a'.repeat(16),outcome:'pending' as const,issues:[semanticIssue('E4','operation')]};
 validateDiagnosticObservation(q);for(const c of [{outcome:'rejected'},{outcome:'accepted'},{issues:[]},{observationId:'CANARY'},{requestRef:'https://CANARY.invalid'}])assert.throws(()=>validateDiagnosticObservation({...q,...c}as never));
 for(const pageSize of [0,101,1.2,NaN])assert.throws(()=>validateDiagnosticQuery({...root,pageSize}));validateDiagnosticQuery({...root,pageSize:1});
});
test('H5-017 D02 unknown effect E4; no automatic retry; sink failure never masks known result',async()=>{
 let calls=0;const logs:unknown[]=[];const r=await invokeDiagnosticOperation({...root,operationId:uid(),requestId:'SECRET'}, {record:async e=>{logs.push(e);}},async()=>{calls++;throw new Error('SECRET');},{record:e=>logs.push(e)});
 assert.equal(calls,1);assert.deepEqual(r.result,{status:'pending',issues:[semanticIssue('E4','operation')]});assert.equal(r.diagnosticRecorded,true);assert.equal(JSON.stringify({r,logs}).includes('SECRET'),false);
 const result={status:'previous' as const,value:{business:'original'}};const v=await invokeDiagnosticOperation({...root,operationId:uid(),requestId:uid()},{record:async()=>{throw new Error('SECRET');}},async()=>result);assert.equal(v.result,result);assert.equal(v.diagnosticRecorded,false);
});
