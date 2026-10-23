// Independent corrected-candidate regression; controlled adapter, not SQL evidence.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const candidate='/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os';
const out=path.join(root,'tests/fixtures/h6-c04-independent');
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const paths=['src/application/contracts.ts','src/server/b07-evidence-port.ts'];
const vectors=[{id:'candidate-add-review',review:false},{id:'candidate-replace-input',review:false},{id:'reviewed-delete-review',review:true},{id:'reviewed-replace-input',review:true},{id:'reviewed-mutate-nested',review:true},{id:'reviewed-replace-review',review:true}];
const stamp=Date.now(),freezePath=path.join(out,'mutable-v2-freeze-'+stamp+'.json');
const freeze={utc:new Date().toISOString(),criterion:'C07',expectedSha256:sha(path.join(out,'expected-v1.json')),instrumentSha256:sha(fileURLToPath(import.meta.url)),sources:paths.map(p=>({path:p,sha256:sha(path.join(candidate,p))})),vectors,expected:'Original registration and original returned state preserved despite caller mutation; captured input and nested verification immutable',SQLExecuted:false};
fs.writeFileSync(freezePath,JSON.stringify(freeze,null,2)+'\n',{flag:'wx'});
const {invokeC04}=await import(pathToFileURL(path.join(candidate,paths[0])));
const {verifyAuth}=await import(pathToFileURL(path.join(candidate,'src/application/verified-auth.ts')));
const {issueTrustedContext}=await import(pathToFileURL(path.join(candidate,'src/application/trusted-context.ts')));
const {createManualB07EvidencePort}=await import(pathToFileURL(path.join(candidate,paths[1])));
const subject='00000000-0000-4000-8000-000000000101',time='2026-10-22T00:02:00.000Z';
const auth=await verifyAuth({verify:async()=>({subject,sessionId:'00000000-0000-4000-8000-000000000102',passwordVerified:true,mfaVerified:true})},'synthetic-unit-proof');
const rows=[];
for(const v of vectors){
 const context=issueTrustedContext({identityId:subject,identityKind:'human',scope:'synthetic-audit',purpose:'audit-evidence',requestId:v.id,serverTime:time});
 let release,entered,submitted,capturedInput;
 const pending=new Promise(r=>release=r),called=new Promise(r=>entered=r);
 const adapter={apply:async(_a,_i,command)=>{submitted=command;entered();await pending;return {id:command.targetId,replayed:false};}};
 const binding={operationId:'00000000-0000-4000-8000-000000000103',evidenceId:'00000000-0000-4000-8000-000000000104',contextKind:'booking',contextId:'00000000-0000-4000-8000-000000000105',sourceReference:'synthetic-audit-witness',occurredAt:'2026-10-22T00:00:00.000Z',purpose:'audit-evidence',coverage:'unit-synthetic',claim:'Synthetic observation only',reason:'Independent C07 counterprobe'};
 const input={sourceReference:binding.sourceReference,receivedAt:'2026-10-22T00:01:00.000Z',preservation:'authorized-manual-record',...(v.review?{verification:{reviewerIdentityId:subject,reviewedAt:time}}:{})};
 const original=JSON.parse(JSON.stringify(input));
 const request={context,scope:'synthetic-audit',guards:{identityAndScope:'satisfied',materialTruth:'satisfied',sensitiveSupervision:'satisfied',conservation:'satisfied',independence:'satisfied',repetition:'new'},input};
 const basePort=createManualB07EvidencePort(adapter,auth,{},context,binding);
 const port={register:(ctx,registration)=>{capturedInput=registration;return basePort.register(ctx,registration);}};
 const promise=invokeC04(request,port);await called;
 if(v.id==='candidate-add-review')input.verification={reviewerIdentityId:subject,reviewedAt:time};
 if(v.id==='candidate-replace-input')request.input={...input,verification:{reviewerIdentityId:subject,reviewedAt:time}};
 if(v.id==='reviewed-delete-review')delete input.verification;
 if(v.id==='reviewed-replace-input')request.input={sourceReference:input.sourceReference,receivedAt:input.receivedAt,preservation:input.preservation};
 if(v.id==='reviewed-mutate-nested'){input.verification.reviewerIdentityId='untrusted';input.verification.reviewedAt='invalid';}
 if(v.id==='reviewed-replace-review')input.verification={reviewerIdentityId:'untrusted',reviewedAt:'invalid'};
 release();const result=await promise;
 const saved=JSON.parse(submitted.material.claim).registration;
 const expectedRegistration={receivedAt:original.receivedAt,preservation:original.preservation,...(original.verification?{verification:original.verification}:{})};
 const facts={stateMatches:result.status==='applied'&&result.value.state===(v.review?'verified':'candidate'),certaintyMatches:submitted.material.certainty===(v.review?'reviewed':'candidate'),registrationMatches:JSON.stringify(saved)===JSON.stringify(expectedRegistration),capturedInputDistinct:capturedInput!==input,capturedInputFrozen:Object.isFrozen(capturedInput),capturedReviewFrozen:!v.review||Object.isFrozen(capturedInput.verification)};
 rows.push({id:v.id,...facts,status:Object.values(facts).every(Boolean)?'PASS':'FAIL'});
}
const report={utc:new Date().toISOString(),freezeSha256:sha(freezePath),sources:freeze.sources,cases:rows,passed:rows.filter(x=>x.status==='PASS').length,failed:rows.filter(x=>x.status==='FAIL').length,SQLExecuted:false,realAuthExecuted:false,scope:'Unit checks only; not a provider or SQL claim'};
const target=path.join(out,'mutable-v2-result-'+stamp+'.json');fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({result:target,sha256:sha(target),passed:report.passed,failed:report.failed}));
if(report.failed)process.exitCode=1;
