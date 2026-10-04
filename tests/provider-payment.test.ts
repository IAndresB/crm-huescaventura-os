import {test} from 'node:test';import assert from 'node:assert/strict';
import {providerPaymentAmounts} from '../src/domain/provider-payment.ts';
import {reverseExact} from '../src/domain/exact-money.ts';
test('Provider Payment amounts preserve partials and exact odd-cent completion',()=>{
 assert.deepEqual(providerPaymentAmounts('500.00',['200.00']),{paid:'200.00',remaining:'300.00',excess:'0.00',complete:false});
 assert.deepEqual(providerPaymentAmounts('500.01',['200.00','300.01']),{paid:'500.01',remaining:'0.00',excess:'0.00',complete:true});
 assert.deepEqual(providerPaymentAmounts('500.00',['500.01']),{paid:'500.01',remaining:'0.00',excess:'0.01',complete:false});
 assert.throws(()=>providerPaymentAmounts('500.00',[200 as unknown as string]));
 assert.throws(()=>providerPaymentAmounts('500.00',['200.001']));
});
test('PM08 reuses H1 materialized reversal and retains original/cause',()=>{
 assert.equal(reverseExact('SYNTHETIC advance','500.01','SYNTHETIC correction').amount,'-500.01');
 assert.equal(reverseExact('SYNTHETIC outgoing','-20.00','SYNTHETIC correction').amount,'20.00');
});
