import test from 'node:test';
import assert from 'node:assert/strict';
import {decideOfferValidity} from '../src/domain/offer-lifecycle.ts';
test('offer defaults seven days and applies earlier material evidence',()=>{
 const i={issuedAt:'2026-10-01T10:00:00Z',limits:[]};
 assert.equal(decideOfferValidity(i,i.issuedAt).effectiveUntil,'2026-10-08T10:00:00.000Z');
 const limit={aspect:'availability' as const,until:'2026-10-03T10:00:00Z',evidenceId:'synthetic'};
 assert.equal(decideOfferValidity({...i,limits:[limit]},'2026-10-04T10:00:00Z').allowed,false);
 assert.deepEqual(i,{issuedAt:'2026-10-01T10:00:00Z',limits:[]});
});
test('offer guards invalidity and explicit configured duration',()=>{
 assert.equal(decideOfferValidity({issuedAt:'unknown',limits:[]},'unknown').allowed,false);
 assert.equal(decideOfferValidity({issuedAt:'2026-10-01T10:00:00Z',days:2,limits:[]},'2026-10-02T10:00:00Z').effectiveUntil,'2026-10-03T10:00:00.000Z');
});
