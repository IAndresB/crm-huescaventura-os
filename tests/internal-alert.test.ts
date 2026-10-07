import {test} from 'node:test';
import assert from 'node:assert/strict';
import {internalChannels,missingAlertParameters} from '../src/domain/internal-alert.ts';
import {automation,alert} from './support/h5-alert-isolated.ts';
test('H5-AA/AB/AC D016 channels by urgency without email',()=>{
 assert.deepEqual(internalChannels('informative'),['crm']);
 for(const level of ['important','critical'] as const)assert.deepEqual(internalChannels(level),['crm','whatsapp']);
 assert.throws(()=>internalChannels('email' as never));
});
test('H5-AR/AS missing retry parameters never acquire defaults',()=>{
 const m=alert('important',automation()).material;
 assert.deepEqual(missingAlertParameters(m),['retryLimit','pauseSeconds']);
 assert.equal(m.automation?.retryLimit,null);assert.equal(m.automation?.pauseSeconds,null);
});
test('H5-AS extra dependent parameter omissions remain localized',()=>{
 const m=alert('critical',{...automation(),retryLimit:1,pauseSeconds:0,missingParameters:['frequency','advance','date']}).material;
 assert.deepEqual(missingAlertParameters(m),['frequency','advance','date']);
});
test('H5-AR independent manual need has no fabricated automation',()=>{
 assert.deepEqual(missingAlertParameters(alert().material),[]);
});
