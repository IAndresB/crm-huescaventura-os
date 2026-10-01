import {randomUUID} from "node:crypto";
import {readFile} from "node:fs/promises";
import {isolatedH2,write,read} from "./h2-isolated.ts";
import {H2003ProposalAdapter,type ProposalCommand} from "../../src/infrastructure/postgres/h2-proposal-adapter.ts";
import {H1005CatalogAdapter,type CatalogCommand} from "../../src/infrastructure/postgres/h1-catalog-adapter.ts";
import {H1007CommercialAdapter,type CommercialCommand} from "../../src/infrastructure/postgres/h1-commercial-adapter.ts";
import type {ProposalContent} from "../../src/domain/proposal-version.ts";
export {write,read};
export const proposalMigration="20261001115235_h2_proposal_versions.sql";
export async function isolatedProposal(label:string,port:number,upgrade=false){
 const h=await isolatedH2(label,port);if(!upgrade) await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${proposalMigration}`,import.meta.url),"utf8"));
 const proposal=new H2003ProposalAdapter(h.runtime,h.f1,h.f2),catalog=new H1005CatalogAdapter(h.runtime,h.f1,h.f2),commercial=new H1007CommercialAdapter(h.runtime,h.f1,h.f2);
 const cat=async(kind:CatalogCommand["kind"],definition:Record<string,string>)=>{
  const targetId=randomUUID(),base={operationId:randomUUID(),targetId,kind,expectedVersion:0,sourceRef:"synthetic-catalog",evidenceRef:"synthetic-catalog",reason:"synthetic"};
  await catalog.apply(await h.auth(),write,{...base,action:"create_item"});
  const r=await catalog.apply(await h.auth(),write,{...base,operationId:randomUUID(),action:"publish_version",definition});return {id:targetId,revision:r.id};
 };
 const com=async(kind:CommercialCommand["kind"],definition:Record<string,unknown>,link?:{id:string;revision:string})=>{
  const targetId=randomUUID(),base={operationId:randomUUID(),targetId,kind,expectedVersion:0,sourceRef:"synthetic-commercial",evidenceRef:"synthetic-commercial",reason:"synthetic",...(link?{catalogItemId:link.id}:{})};
  await commercial.apply(await h.auth(),write,{...base,action:"create"});
  const r=await commercial.apply(await h.auth(),write,{...base,operationId:randomUUID(),action:"publish",definition,...(link?{catalogRevisionId:link.revision}:{})});return {id:targetId,revision:r.id};
 };
 const fixtures=async()=>{
  const service=await cat("service",{name:"Synthetic service",nature:"external"}),unit=await cat("unit",{name:"Synthetic fixed group",definition:"fixed group"}),form=await cat("pricing_form",{name:"Synthetic fixed",definition:"fixed"});
  const tariffDefinition={label:"synthetic tariff",price_state:"confirmed",amount:"900.00",cost_state:"confirmed",cost_amount:"700.00",vat_treatment:"included",unit_revision_id:unit.revision,pricing_form_revision_id:form.revision};
  const tariff=await com("tariff",tariffDefinition,service),pack=await com("custom_pack",{name:"Synthetic pack",components:[{service_revision_id:service.revision,unit_revision_id:unit.revision,quantity:"1",included:true}],conditions:"synthetic pack terms"});
  const opp=h.input();await h.adapter.apply(await h.auth(),write,opp);
  const content:ProposalContent={scope:"synthetic scope",terms:{version:"synthetic-terms-v1",text:"synthetic terms only; mandate pending",sourceRef:"synthetic-existing-terms"},pending:["mandate","availability"],modalities:[{id:randomUUID(),name:"Synthetic modality",participants:10,independent:true,selectable:true,packRevisionId:pack.revision,conditions:"synthetic modality",finalPersonPrice:"100.01",manualReason:"synthetic final decision",definitive:true,lines:[{id:randomUUID(),serviceRevisionId:service.revision,unitRevisionId:unit.revision,tariffRevisionId:tariff.revision,quantity:"1",included:true,independent:false,selectable:false,date:null,datePending:true,priceBasis:"fixed",costMaterial:true,sourceRef:"synthetic-line"}]}]};
  const command=(change:Partial<ProposalCommand>={}):ProposalCommand=>({action:"prepare",operationId:randomUUID(),proposalId:randomUUID(),opportunityId:opp.targetId,expectedRevision:0,expectedOpportunityRevision:1,sourceRef:"synthetic-proposal",reason:"synthetic-proposal",content:structuredClone(content),...change});
  return {service,unit,form,tariff,tariffDefinition,pack,opp,content,command};
 };
 return {...h,proposal,catalog,commercial,cat,com,fixtures};
}
