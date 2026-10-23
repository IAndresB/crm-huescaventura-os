import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {verifyWorkEffect,verifyWorkResult} from '../src/application/work-result-verification.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'tests/fixtures/h6-adoption-independent');
const sha=b=>createHash('sha256').update(b).digest('hex');
const vectorsPath=path.join(dir,'port-vectors-v1.json');
const freezePath=path.join(dir,'port-freeze-v1.json');
const freeze=JSON.parse(fs.readFileSync(freezePath,'utf8'));
const vectors=JSON.parse(fs.readFileSync(vectorsPath,'utf8'));
if(sha(fs.readFileSync(vectorsPath))!==freeze.vectorsSha256)throw new Error('AUDIT_VECTORS_CHANGED');
if(sha(fs.readFileSync(fileURLToPath(import.meta.url)))!==freeze.instrumentSha256)throw new Error('AUDIT_INSTRUMENT_CHANGED');
const source=path.join(root,'src/application/work-result-verification.ts');
if(sha(fs.readFileSync(source))!==freeze.sourceSha256)throw new Error('AUDIT_SOURCE_CHANGED');
const rows=[];
for(const c of vectors.cases){
  const request={...(c.kind==='result'?vectors.resultRequest:vectors.effectRequest),...c.requestChange};
  const before=JSON.stringify(request);
  const observed={...request,sourceKind:'simulated',verifierIdentity:'audit-local-verifier',...(c.kind==='effect'?{availability:'available',priorEffect:'none',observationRef:'audit-observation-1'}:{}),...c.change};
  let calls=0,requestFrozen=null,distinct=null,resultFrozen=null,actual;
  const inspect=async supplied=>{
    calls++;requestFrozen=Object.isFrozen(supplied);distinct=supplied!==request;
    if(c.mode==='throw')throw new Error('AUDIT_SOURCE_UNAVAILABLE');
    return c.mode==='no-observation'?undefined:observed;
  };
  const provider=c.mode==='no-provider'?undefined:{inspect,...(c.mode==='no-check-effect'?{}:{checkEffect:inspect})};
  try{
    if(c.kind==='result'){const result=await verifyWorkResult(provider,request);resultFrozen=Object.isFrozen(result);}
    else await verifyWorkEffect(provider,request);
    actual='ACCEPT';
  }catch(e){actual=e instanceof Error?e.message:'UNCLASSIFIED_ERROR';}
  const unchanged=before===JSON.stringify(request);
  const pass=actual===c.expected&&unchanged&&(calls===0||requestFrozen&&distinct)&&(resultFrozen===null||resultFrozen);
  rows.push({id:c.id,expected:c.expected,actual,calls,providerRequestFrozen:requestFrozen,providerRequestDistinct:distinct,callerUnchanged:unchanged,resultFrozen,status:pass?'PASS':'FAIL'});
}
const report={utc:new Date().toISOString(),scope:vectors.scope,freezeSha256:sha(fs.readFileSync(freezePath)),sourceSha256:freeze.sourceSha256,cases:rows,passed:rows.filter(x=>x.status==='PASS').length,failed:rows.filter(x=>x.status==='FAIL').length,sqlExecuted:false,authExecuted:false,storageExecuted:false,persistenceExecuted:false,S11:false};
const target=path.join(dir,'ports-result-'+Date.now()+'.json');
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({file:path.relative(root,target),passed:report.passed,failed:report.failed,sha256:sha(fs.readFileSync(target))}));
if(report.failed)process.exitCode=1;
