import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID as uid} from 'node:crypto';
import {isolatedOffer,write} from '../support/h2-offer-isolated.ts';
test('H2-005 focal immutable issuance and intent without send',async()=>{
 const h=await isolatedOffer('crm_h2_005',55474);try{
 const f=await h.fixtures(),c=f.command();await h.proposal.apply(await h.auth(),write,c);
 const v=uid();await h.proposal.apply(await h.auth(),write,{...c,action:'fix',operationId:uid(),versionId:v,content:undefined,expectedRevision:1});
 const at=new Date(Date.now()-1000).toISOString(),e=h.req('evidence',{claim:`offer:issue:${v}:${at}:7`,coverage:f.content.scope,certainty:'reviewed',source_kind:'manual'},f.opp.targetId);await h.evidence.apply(await h.auth(),write,{...e,occurredAt:at,coverage:f.content.scope});
 const q={action:'issue' as const,operationId:uid(),proposalId:c.proposalId,opportunityId:f.opp.targetId,versionId:v,expectedRevision:2,expectedOpportunityRevision:2,sourceRef:'synthetic issuance',reason:'synthetic issuance',coverage:f.content.scope,at,issuance:{issuedAt:at,limits:[]},evidenceId:e.targetId};
 const r=await h.offer.apply(await h.auth(),write,q);assert.equal(r.result.days,7);
 assert.equal((await h.offer.apply(await h.auth(),write,q)).replayed,true);
 await h.offer.apply(await h.auth(),write,{...q,operationId:uid(),action:'intent',issuance:undefined,evidenceId:undefined,expectedRevision:3,recipientId:uid(),channel:'manual'});
 assert.equal((await h.observer`select state from crm_private.b03_opportunities where opportunity_id=${f.opp.targetId}::uuid`)[0]!.state,'Propuesta en preparación');
 }finally{await h.close();}
});
