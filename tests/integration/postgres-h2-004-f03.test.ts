import assert from "node:assert/strict";
import {test} from "node:test";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {isolatedProposal,write} from "../support/h2-proposal-isolated.ts";
test('H2-004-F03 historical omission allows definitive price without eligibility; current blocks',async()=>{
 for(const historical of [true,false]){
  const h=await isolatedProposal(historical?'crm_h2_004_f03_old':'crm_h2_004_f03_new',historical?55471:55472,historical);
  try{
   if(historical)await h.migration.unsafe(await readFile(new URL('../fixtures/h2-004/proposal-69a0ef1.sql.txt',import.meta.url),'utf8'));
   const f=await h.fixtures();await h.com('eligibility_rule',{knowledge:'known',criterion:'FORMAL objective age limit unknown',purpose:'FORMAL restriction'},f.service);
   const p=f.command();await h.proposal.apply(await h.auth(),write,p);const fix={...p,action:'fix' as const,content:undefined,operationId:randomUUID(),versionId:randomUUID(),expectedRevision:1};
   if(historical)await h.proposal.apply(await h.auth(),write,fix);else await assert.rejects(h.proposal.apply(await h.auth(),write,fix),/PROPOSAL_DEPENDENT_PRICE_BLOCKED:AC-085/);
  }finally{await h.close();}
 }
});
