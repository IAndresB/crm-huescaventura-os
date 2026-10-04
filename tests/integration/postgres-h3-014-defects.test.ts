import {test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID as uid} from 'node:crypto';
import {isolatedOwnEconomics,write} from '../support/h3-own-economics-isolated.ts';import {ownEconomicsFixture,promotion} from '../support/h3-own-economics-fixtures.ts';
test('H3-014-F08 one promotion per Booking across economic scopes',async()=>{
 const h=await isolatedOwnEconomics('h3014_f08',55935);try{const f=await ownEconomicsFixture(h),q=await f.command();Object.assign(q.input,{promotion:{...promotion(f.b.f.mid),revisionId:f.promo.revision}});await h.ownEconomics.apply(await h.auth(),write,await f.attest(q));
 const otherId=uid(),other={...q,economyId:otherId,scope:'SYNTHETIC different scope',expectedRevision:0,operationId:uid()};
 // Separate real B07 evidence for a new root. An approval cannot bypass the one-gratuity invariant.
 const proof=async(claim:string)=>{const r=h.req('evidence',{claim,coverage:otherId,certainty:'reviewed',source_kind:'manual'},otherId,'other');await h.evidence.apply(await h.auth(),write,{...r,coverage:otherId,occurredAt:q.at});return r.targetId;};
 other.input=structuredClone(q.input);for(const c of [...other.input.fees,...other.input.costs]){const {approvalEvidenceId,...rule}=c.rule;Object.assign(c.rule,{approvalEvidenceId:await proof('own-rule:'+await f.digest(rule))});}
 const {operationId,evidenceId,...material}=other;other.evidenceId=await proof('own-economics:'+await f.digest(material));
 await assert.rejects(h.ownEconomics.apply(await h.auth(),write,other),/OWN_ECONOMICS_PROMOTION_ALREADY_APPLIED/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b05_own_economies`)[0]!.n,1);
 }finally{await h.close();}
});
test('H3-014-F09 equivalent economic material with a new technical key reuses snapshot',async()=>{
 const h=await isolatedOwnEconomics('h3014_f09',55936);try{const f=await ownEconomicsFixture(h),q=await f.command();await h.ownEconomics.apply(await h.auth(),write,q);const same=await f.attest({...q,operationId:uid(),expectedRevision:1});const r=await h.ownEconomics.apply(await h.auth(),write,same);assert.equal(r.result.revision,1);assert.equal((await f.see())!.history.length,1);}finally{await h.close();}
});
