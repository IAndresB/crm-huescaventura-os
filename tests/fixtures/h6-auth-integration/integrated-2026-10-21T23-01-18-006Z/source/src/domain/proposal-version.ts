import {captureCalculation,selectManualFinalPrice,moneyDifference,requireKnownMoneyFacts,MONEY_ALGORITHM_VERSION,type CalculationRecord} from "./exact-money.ts";
import {canonicalCommercial} from "./commercial-progress.ts";
export interface ProposalLine {
 readonly id:string;readonly serviceRevisionId:string;readonly unitRevisionId:string;readonly tariffRevisionId?:string;
 readonly quantity:string|null;readonly included:boolean;readonly independent:boolean;readonly selectable:boolean;
 readonly date:string|null;readonly datePending:boolean;readonly priceBasis:"fixed"|"quantity";
 readonly costMaterial:boolean;readonly sourceRef:string;readonly estimateRuleEvidenceId?:string;readonly eligibilityEvidenceId?:string;
}
export interface ProposalModality {
 readonly id:string;readonly name:string;readonly participants:number|null;readonly independent:boolean;readonly selectable:boolean;
 readonly packRevisionId?:string;readonly conditions:string;readonly finalPersonPrice:string|null;readonly manualReason:string;
 readonly definitive:boolean;readonly lines:readonly ProposalLine[];
}
export interface ProposalContent {
 readonly scope:string;readonly terms:Readonly<{version:string;text:string;sourceRef:string}>;
 readonly pending:readonly string[];readonly modalities:readonly ProposalModality[];
}
export interface ProposalSource {readonly id:string;readonly kind:string;readonly definition:Readonly<Record<string,unknown>>;readonly sourceRef:string;readonly version:string;readonly serviceRevisionId?:string}
export interface ProposalDecision {readonly allowed:boolean;readonly ids:readonly string[];readonly blockers:readonly string[]}
const text=(s:unknown):s is string=>typeof s==="string"&&s.trim().length>0&&!s.includes("\0");
const id=(s:unknown)=>typeof s==="string"&&/^[0-9a-f-]{36}$/.test(s);
const keys=(v:object,list:string[])=>Object.keys(v).every(k=>list.includes(k));
export function decideProposal(content:ProposalContent,fix:boolean):ProposalDecision {
 const blockers:string[]=[];
 if(!content||!keys(content,["scope","terms","pending","modalities"])||!text(content.scope)||!Array.isArray(content.pending)||content.pending.some(x=>!text(x))) blockers.push("scope-sources-pending");
 if(!content?.terms||!keys(content.terms,["version","text","sourceRef"])||![content.terms.version,content.terms.text,content.terms.sourceRef].every(text)) blockers.push("terms-reproducible");
 if(!Array.isArray(content?.modalities)||!content.modalities.length) blockers.push("composition-required");
 const seen=new Set<string>();
 for(const m of content?.modalities??[]) {
  if(!keys(m,["id","name","participants","independent","selectable","packRevisionId","conditions","finalPersonPrice","manualReason","definitive","lines"])||!id(m.id)||seen.has(m.id)||!text(m.name)||![m.independent,m.selectable,m.definitive].every(x=>typeof x==="boolean")||m.selectable&&!m.independent||!text(m.conditions)||!text(m.manualReason)||m.packRevisionId!==undefined&&!id(m.packRevisionId)||!Array.isArray(m.lines)||!m.lines.length) blockers.push("modality-invalid");
  seen.add(m.id);
  if(m.participants!==null&&(!Number.isSafeInteger(m.participants)||m.participants<=0)||fix&&m.participants===null) blockers.push("participants-required");
  if(m.finalPersonPrice!==null&&(typeof m.finalPersonPrice!=="string"||!/^\d+\.\d{2}$/.test(m.finalPersonPrice))) blockers.push("final-price-invalid");
  for(const l of m.lines??[]) {
   if(!keys(l,["id","serviceRevisionId","unitRevisionId","tariffRevisionId","quantity","included","independent","selectable","date","datePending","priceBasis","costMaterial","sourceRef","estimateRuleEvidenceId","eligibilityEvidenceId"])||![l.id,l.serviceRevisionId,l.unitRevisionId].every(id)||seen.has(l.id)||!text(l.sourceRef)||![l.included,l.independent,l.selectable,l.datePending,l.costMaterial].every(x=>typeof x==="boolean")||l.selectable&&!l.independent||!["fixed","quantity"].includes(l.priceBasis)||l.tariffRevisionId!==undefined&&!id(l.tariffRevisionId)||l.estimateRuleEvidenceId!==undefined&&!id(l.estimateRuleEvidenceId)||l.eligibilityEvidenceId!==undefined&&!id(l.eligibilityEvidenceId)) blockers.push("line-source-invalid");
   seen.add(l.id);
   if(l.quantity!==null&&(typeof l.quantity!=="string"||!/^\d+(?:\.\d+)?$/.test(l.quantity)||Number(l.quantity)<=0)||fix&&l.included&&l.quantity===null) blockers.push("quantity-required");
   if(l.date!==null&&!/^\d{4}-\d{2}-\d{2}$/.test(l.date)||l.date===null&&!l.datePending) blockers.push("date-known-or-pending");
  }
 }
 return {allowed:blockers.length===0,ids:[fix?"SM-PV-02":"SM-PV-01","DM-INV-008","G2"],blockers};
}
export function proposalReferences(c:ProposalContent):string[] {
 return [...new Set(c.modalities.flatMap(m=>[...(m.packRevisionId?[m.packRevisionId]:[]),...m.lines.flatMap(l=>[l.serviceRevisionId,l.unitRevisionId,...(l.tariffRevisionId?[l.tariffRevisionId]:[]),...(l.estimateRuleEvidenceId?[l.estimateRuleEvidenceId]:[]),...(l.eligibilityEvidenceId?[l.eligibilityEvidenceId]:[])])]))];
}
export interface ModalityEconomics {
 readonly modalityId:string;readonly calculation:CalculationRecord|null;readonly finalCalculation:CalculationRecord|null;
 readonly calculated:string|null;readonly final:string|null;readonly difference:string|null;
 readonly manual:ReturnType<typeof selectManualFinalPrice>|null;readonly blockers:readonly string[];
 readonly components:readonly Readonly<{lineId:string;amount:string|null;quantity:string|null;cost:string|null;priceState:string;costState:string}>[];
}
export function calculateProposal(c:ProposalContent,sources:readonly ProposalSource[],actor:string,at:string,fix:boolean):readonly ModalityEconomics[] {
 const decision=decideProposal(c,fix);if(!decision.allowed) throw new Error(`PROPOSAL_BLOCKED:${decision.ids[0]}:${decision.blockers.join(",")}`);
 const lookup=(ref:string,kind:string)=>{const s=sources.find(s=>s.id===ref);if(!s||s.kind!==kind) throw new Error("PROPOSAL_SOURCE_INVALID");return s;};
 return c.modalities.map(m=>{
  if(m.packRevisionId) {const p=sources.find(s=>s.id===m.packRevisionId);if(!p||!["pack","custom_pack"].includes(p.kind)) throw new Error("PROPOSAL_SOURCE_INVALID");}
  const blockers:string[]=[],components=m.lines.filter(l=>l.included).map(l=>{
   lookup(l.serviceRevisionId,"service");lookup(l.unitRevisionId,"unit");
   const t=l.tariffRevisionId?lookup(l.tariffRevisionId,"tariff").definition:null;
   if(t?.unit_revision_id!==undefined&&t.unit_revision_id!==l.unitRevisionId) throw new Error("PROPOSAL_SOURCE_INVALID");
   const priceState=String(t?.price_state??"unknown"),costState=String(t?.cost_state??"unknown");
   if(priceState==="estimated"&&!l.estimateRuleEvidenceId) throw new Error("PROPOSAL_ESTIMATION_RULE_REQUIRED");
   if(l.estimateRuleEvidenceId) {const e=lookup(l.estimateRuleEvidenceId,"evidence");if(e.definition.certainty!=="reviewed"||e.definition.claim!=="BR-ECON-001:approved-hotel-estimation") throw new Error("PROPOSAL_ESTIMATION_RULE_REQUIRED");}
   for(const rule of sources.filter(s=>s.kind==="eligibility_rule"&&s.serviceRevisionId===l.serviceRevisionId)) {
    const evidence=l.eligibilityEvidenceId?sources.find(s=>s.id===l.eligibilityEvidenceId):null;
    if(rule.definition.knowledge!=="known"||!evidence||evidence.kind!=="evidence"||evidence.definition.certainty!=="reviewed"||evidence.definition.claim!==`eligible:${rule.id}`) blockers.push(`eligibility:${l.id}`);
   }
   const amount=priceState==="unknown"?null:String(t?.amount),cost=costState==="unknown"?null:String(t?.cost_amount);
   const known=requireKnownMoneyFacts([{name:`price:${l.id}`,value:amount},...(l.costMaterial?[{name:`cost:${l.id}`,value:cost}]:[])]);
   blockers.push(...known.blockers);
   if(m.definitive&&(priceState==="estimated"||l.costMaterial&&costState==="estimated")) blockers.push(`unconfirmed:${l.id}`);
   if(m.definitive&&t?.vat_treatment==="unknown") blockers.push(`vat:${l.id}`);
   return {lineId:l.id,amount,quantity:l.priceBasis==="fixed"?"1":l.quantity,cost,priceState,costState};
  });
  const trace={sourceRef:c.terms.sourceRef,calculationRef:m.id,configurationVersions:sources.map(s=>({kind:s.kind,id:s.id,version:s.version})),reason:m.manualReason};
  const calculable=m.participants!==null&&components.length>0&&components.every(x=>x.amount!==null&&x.quantity!==null);
  const calculation=calculable?captureCalculation({kind:"composition",components:components.map(x=>({amount:x.amount!,quantity:x.quantity!})),participants:m.participants!},trace):null;
  const calculated=calculation?(calculation.output as {amount:string}).amount:null;
  if(m.definitive&&(!calculable||m.finalPersonPrice===null||blockers.length)&&fix) throw new Error("PROPOSAL_DEPENDENT_PRICE_BLOCKED:AC-010");
  const manual=calculated!==null&&m.finalPersonPrice!==null?selectManualFinalPrice(calculated,m.finalPersonPrice,actor,at,m.manualReason,trace):null;
  // H1 materialization and exact subtraction; never adjust components or their costs.
  const difference=manual?moneyDifference(manual.final,manual.calculated):null;
  const finalCalculation=m.finalPersonPrice!==null&&m.participants!==null?captureCalculation({kind:"per_person",finalPersonPrice:m.finalPersonPrice,participations:m.participants},trace):null;
  return {modalityId:m.id,calculation,finalCalculation,calculated,final:m.finalPersonPrice,difference,manual,blockers,components};
 });
}
export function materiallyDifferent(before:ProposalContent,after:ProposalContent):boolean {return canonicalCommercial(before)!==canonicalCommercial(after);}
export const proposalMoneyVersion=MONEY_ALGORITHM_VERSION;
