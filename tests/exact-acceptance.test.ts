import {test} from 'node:test';
import assert from 'node:assert/strict';
import {decideAcceptance} from '../src/domain/exact-acceptance.ts';
test('T02 exact guarded decision with normative IDs',()=>{
 const a={identified:true,selectable:true,evidence:true,attributable:true,actValidity:true,materialVerified:true,requestedWon:true,active:true,rectified:false};
 assert.equal(decideAcceptance(a).won,true);
 for(const k of ['identified','selectable','evidence','attributable','actValidity','materialVerified','active'] as const){assert.equal(decideAcceptance({...a,[k]:false}).allowed,false,k);}
 assert.equal(decideAcceptance({...a,rectified:true}).allowed,false);
 assert.equal(decideAcceptance({...a,requestedWon:false}).won,false);
});
