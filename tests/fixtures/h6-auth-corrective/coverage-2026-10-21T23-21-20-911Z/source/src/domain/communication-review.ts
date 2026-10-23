import {canonicalTask} from './pending-task.ts';
export type CommunicationContext=Readonly<{contextKind:string;contextId:string;purpose:string}>;
export type Composition=Readonly<{
 content:string;coverage:string;recipient:string;nature:'informative'|'sensitive';
 origin:'human'|'synthetic_automatic';pending:readonly string[];sourceRef:string;
}>;
export type CommunicationCommand=CommunicationContext & Readonly<{
 operationId:string;workId:string;recordId:string;reason:string;sourceRef:string;at:string;
}> & (
 Readonly<{action:'draft';previousId:string|null;material:Composition}>|
 Readonly<{action:'prepare';versionId:string}>|
 Readonly<{action:'derive';originalId:string;kind:'summary'|'note'|'candidate';content:string;
 origin:'human'|'synthetic_automatic';review:string;permissionRef:string;authorRef:string;
 confirmedId:string|null;confidence:number|null;field:string|null}>|
 Readonly<{action:'fact';versionId:string|null;fact:'sent'|'received'|'read'|'response';
 evidenceId:string;party:string;coverage:string;ambiguous:boolean;synthetic:true}>
);
export const canonicalCommunication=canonicalTask;
export function validateCommunication(input:CommunicationCommand):void {
 const common=['contextKind','contextId','purpose','operationId','workId','recordId','reason','sourceRef','at','action'];
 const extra=input.action==='draft'?['previousId','material']:input.action==='prepare'?['versionId']:
 input.action==='derive'?['originalId','kind','content','origin','review','permissionRef','authorRef','confirmedId','confidence','field']:
 input.action==='fact'?['versionId','fact','evidenceId','party','coverage','ambiguous','synthetic']:[];
 if(!extra.length||Object.keys(input).some(k=>![...common,...extra].includes(k))||
 [...common,...extra].some(k=>!Object.hasOwn(input,k)))throw new Error('COMM_INPUT_INVALID');
 if(!['contact','organization','opportunity','booking','booking_service','provider','proposal','other'].includes(input.contextKind)||
 ![input.contextId,input.operationId,input.workId,input.recordId].every(v=>/^[0-9a-f-]{36}$/i.test(v))||
 ![input.purpose,input.reason,input.sourceRef].every(v=>typeof v==='string'&&v.trim())||!Number.isFinite(Date.parse(input.at)))throw new Error('COMM_INPUT_INVALID');
 if(input.action==='draft') {
 const m=input.material;
 if(!m||Object.keys(m).sort().join(',')!=='content,coverage,nature,origin,pending,recipient,sourceRef'||
 ![m.content,m.coverage,m.recipient,m.sourceRef].every(v=>typeof v==='string'&&v.trim())||
 !['informative','sensitive'].includes(m.nature)||!['human','synthetic_automatic'].includes(m.origin)||
 !Array.isArray(m.pending)||m.pending.some(x=>typeof x!=='string'||!x.trim()))throw new Error('COMM_INPUT_INVALID');
 }
 if(input.action==='derive'&&(!['summary','note','candidate'].includes(input.kind)||
 ![input.content,input.review,input.permissionRef,input.authorRef].every(v=>typeof v==='string'&&v.trim())||
 !['human','synthetic_automatic'].includes(input.origin)||
 (input.confidence!==null&&(!Number.isFinite(input.confidence)||input.confidence<0||input.confidence>1))||
 (input.kind==='candidate'&&(!input.field||input.origin!=='synthetic_automatic'))))throw new Error('COMM_INPUT_INVALID');
 if(input.action==='fact'&&(!['sent','received','read','response'].includes(input.fact)||input.synthetic!==true||
 ![input.party,input.coverage].every(v=>typeof v==='string'&&v.trim())||typeof input.ambiguous!=='boolean'))throw new Error('COMM_INPUT_INVALID');
}
