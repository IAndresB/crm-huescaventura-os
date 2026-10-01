// Supplementary independent R13/R37: distinct service identities and prior H1 applied calculation sources.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {isolatedProposal,proposalMigration,read,write} from './h2-proposal-isolated.ts';
const h=await isolatedProposal('crm_h2_004_modalities',55473,true);
try {
 const person=await h.cat('unit',{name:'FORMAL participants',definition:'count of participating people'}),basis=await h.cat('pricing_form',{name:'FORMAL person basis',definition:'price per participant'});
 const configs={};
 for(const [key,price] of [['rafting','40.00'],['dinner','25.00'],['lodging','35.00']]){
  const service=await h.cat('service',{name:`FORMAL SYNTHETIC ${key}`,nature:'external'});
  const tariff=await h.com('tariff',{label:`FORMAL ${key}`,price_state:'confirmed',amount:price,cost_state:'unknown',vat_treatment:'included',unit_revision_id:person.revision,pricing_form_revision_id:basis.revision},service);
  configs[key]={service,tariff};
 }
 const opp=h.input();await h.adapter.apply(await h.auth(),write,opp);
 const applicationId=randomUUID();await h.commercial.apply(await h.auth(),write,{action:'fix_application',operationId:randomUUID(),targetId:applicationId,kind:'application',originRevisionId:opp.targetId,revisionIds:Object.values(configs).map(v=>v.tariff.revision),sourceRef:'FORMAL prior application',evidenceRef:'FORMAL synthetic source',reason:'FORMAL prior calculation refs',expectedVersion:0});
 const before=(await h.observer`select to_jsonb(t) d from crm_private.commercial_applications t where application_id=${applicationId}::uuid`)[0].d;
 await h.migration.unsafe(await readFile(new URL(`../../supabase/migrations/${proposalMigration}`,import.meta.url),'utf8'));
 assert.deepEqual((await h.observer`select to_jsonb(t) d from crm_private.commercial_applications t where application_id=${applicationId}::uuid`)[0].d,before);
 const line=(key,n,date=null,included=true)=>({id:randomUUID(),serviceRevisionId:configs[key].service.revision,unitRevisionId:person.revision,tariffRevisionId:configs[key].tariff.revision,quantity:String(n),included,independent:false,selectable:false,date,datePending:date===null,priceBasis:'quantity',costMaterial:false,sourceRef:`FORMAL quantity ${key}`});
 const modality=(name,participants,lines)=>({id:randomUUID(),name,participants,independent:true,selectable:true,conditions:'FORMAL different inclusions only',finalPersonPrice:name==='A'?'100.01':'70.00',manualReason:'FORMAL final commercial decision',definitive:true,lines});
 const content={scope:'FORMAL AC017 quantities only; no Booking',terms:{version:'FORMAL T1',text:'FORMAL synthetic conditions',sourceRef:'FORMAL terms'},pending:['availability','mandate'],modalities:[modality('A',10,[line('rafting',10),line('dinner',10),line('lodging',10,'2026-12-01'),line('lodging',10,'2026-12-02')]),modality('B',2,[line('rafting',2,null,false),line('dinner',2),line('lodging',2,'2026-12-01')])]};
 const p={action:'prepare',operationId:randomUUID(),proposalId:randomUUID(),opportunityId:opp.targetId,expectedRevision:0,expectedOpportunityRevision:1,sourceRef:'FORMAL distinct modalities',reason:'FORMAL exact scope',content};await h.proposal.apply(await h.auth(),write,p);
 const versionId=randomUUID();await h.proposal.apply(await h.auth(),write,{...p,action:'fix',content:undefined,operationId:randomUUID(),versionId,expectedRevision:1});
 const sum=async(key,date=null)=>(await h.observer`select sum(quantity)::text q from crm_private.b03_proposal_lines where version_id=${versionId}::uuid and service_revision_id=${configs[key].service.revision}::uuid and included and service_date is not distinct from ${date}::date`)[0].q;
 const observed={rafting:await sum('rafting'),dinner:await sum('dinner'),night1:await sum('lodging','2026-12-01'),night2:await sum('lodging','2026-12-02')};assert.deepEqual(observed,{rafting:'10',dinner:'12',night1:'12',night2:'10'});
 const v=await h.proposal.read(await h.auth(),read,p.proposalId,'internal');assert.equal(v.content.modalities[1].lines[0].included,false);assert.equal(v.economics[0].finalCalculation.output.amount,'1000.10');
 console.log(JSON.stringify({cases:['R13-distinct-services','R37-prior-H1-application'],expected:{rafting:'10',dinner:'12',night1:'12',night2:'10'},observed,priorApplication:'identical across migration',result:'PASS'}));
} finally {await h.close();}
