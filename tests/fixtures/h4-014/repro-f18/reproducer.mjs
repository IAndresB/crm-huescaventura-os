import assert from 'node:assert/strict';
import {determineCancellation} from '/Users/andres/Developer/crm-huescaventura-os/src/domain/cancellation-right.ts';
const facts={cause:'voluntary',policy:{id:'D011',version:'1',rule:'D011',terms:{version:'SYNTHETIC accepted'}},base:{kind:'participation',amount:'100.01',count:1,start:0,modalityId:'SYNTHETIC B',components:[]},reference:{scope:'modality',scopeId:'SYNTHETIC B',date:'2026-10-20',zone:null,sourceRef:'SYNTHETIC accepted date, zone unresolved',version:'1',basis:'default'},nonRefundable:null,at:'2026-10-17T10:00:00Z'};
const result=determineCancellation(facts);assert.equal(result.status,'pending');assert.equal(result.right,null);assert.ok(result.missing.includes('zone:D020'));console.log('PASS G07 unknown zone localized E3');
