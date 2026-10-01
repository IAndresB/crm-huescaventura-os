import {test} from 'node:test';import assert from 'node:assert/strict';
import {decideConversion} from '../src/domain/booking-conversion.ts';
test('SM-BK-01 independent domain decision withdraws each material guard',()=>{
 const a={verifiedChain:true,rectified:false,exactScope:true,completeDetail:true,currentRevision:true,authorized:true,ai:false,exactHumanApproval:false};
 assert.equal(decideConversion(a).state,'Pendiente de preparación');
 for(const key of ['verifiedChain','exactScope','completeDetail','currentRevision','authorized'] as const)assert.equal(decideConversion({...a,[key]:false}).allowed,false);
 assert.equal(decideConversion({...a,rectified:true}).allowed,false);assert.equal(decideConversion({...a,ai:true}).allowed,false);
});
