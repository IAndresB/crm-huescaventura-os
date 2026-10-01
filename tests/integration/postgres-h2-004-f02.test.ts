import assert from "node:assert/strict";
import {test} from "node:test";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {isolatedProposal,read,write} from "../support/h2-proposal-isolated.ts";
test('H2-004-F02 historical projection misses estimation label; current preserves it',async()=>{
 for(const historical of [true,false]){
  const h=await isolatedProposal(historical?'crm_h2_004_f02_old':'crm_h2_004_f02_new',historical?55469:55470,historical);
  try{
   if(historical)await h.migration.unsafe(await readFile(new URL('../fixtures/h2-004/proposal-69a0ef1.sql.txt',import.meta.url),'utf8'));
   const f=await h.fixtures(),t=await h.com('tariff',{...f.tariffDefinition,price_state:'estimated'},f.service),e=h.req('evidence',{claim:'BR-ECON-001:approved-hotel-estimation',coverage:'synthetic-scope',certainty:'reviewed',source_kind:'manual'},f.opp.targetId);await h.evidence.apply(await h.auth(),write,e);
   const c={...f.content,modalities:[{...f.content.modalities[0]!,definitive:false,lines:[{...f.content.modalities[0]!.lines[0]!,tariffRevisionId:t.revision,estimateRuleEvidenceId:e.targetId}]}]},p=f.command({content:c});await h.proposal.apply(await h.auth(),write,p);
   await h.proposal.apply(await h.auth(),write,{...p,action:'fix',content:undefined,operationId:randomUUID(),versionId:randomUUID(),expectedRevision:1});const data=await h.proposal.read(await h.auth(),read,p.proposalId,'commercial') as any[];
   if(historical)assert.equal(data[0].finalPersonPrice,'100.01');else assert.deepEqual(data[0].finalPersonPrice,{amount:'100.01',certainty:'estimated'});
  }finally{await h.close();}
 }
});
