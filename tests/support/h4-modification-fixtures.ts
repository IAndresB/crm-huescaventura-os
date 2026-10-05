import {randomUUID as uid} from 'node:crypto';
import {confirmationFixture} from './h4-confirmation-fixtures.ts';
import {read,write,type isolatedModification} from './h4-modification-isolated.ts';
import type {ModificationCommand} from '../../src/domain/operational-modification.ts';
type H=Awaited<ReturnType<typeof isolatedModification>>;
export async function modificationFixture(h:H,existing?:Awaited<ReturnType<typeof confirmationFixture>>){
 const f=existing??await confirmationFixture(h),modificationId=uid(),bookingId=f.bookingId;
 const scope={kind:'service',id:f.service.id},partId=uid(),before=()=>h.observer`select to_jsonb(s) value from crm_private.b04_services s where service_id=${f.service.id}::uuid`;
 const see=async()=>h.modifications.read(await h.auth(),read,modificationId,bookingId);
 const attest=async(q:ModificationCommand)=>({...q,evidenceId:await f.proof(`modification:${q.action}:${await f.hash(Object.fromEntries(Object.entries(q).filter(([k,v])=>!['operationId','evidenceId'].includes(k)&&v!==undefined)))}`,modificationId)});
 const command=async(action:ModificationCommand['action'],data:Record<string,unknown>,changes:Partial<ModificationCommand>={})=>attest({action,operationId:uid(),modificationId,bookingId,expectedRevision:(await see())?.revision??0,sourceRef:'SYNTHETIC legitimate precise source',reason:'SYNTHETIC operational independent change',at:f.at,evidenceId:uid(),data,...changes});
 const request=async(parts?:unknown[])=>command('request',{requester:{kind:'internal',id:h.actorId},cause:'SYNTHETIC real scoped need',type:'change',recordId:await f.record(),parts:parts??[{id:partId,scope,expectedScopeRevision:1,desired:{date:'2026-10-22'},aspects:['date','capacity','conditions'],dependencies:[]}]});
 const evaluate=async()=>command('evaluate',{policy:{id:'SYNTHETIC accepted policy',version:'V1',terms:f.coverage.commercialBasis.terms},impacts:{commercial:'SYNTHETIC exact client change agreement needed',operational:'SYNTHETIC localized future coverage',economic:'pending'}});
 const approve=async(ids=[partId])=>{const v=(await see())!,proofs:Record<string,unknown>={};for(const id of ids){const p=v.parts.find(p=>p.id===id)!;const hash=await f.hash(Object.fromEntries(Object.entries(p).filter(([k])=>!['review','applied'].includes(k))));proofs[id]={client:await f.proof('modification:client:'+hash,bookingId),provider:await f.proof('modification:provider:'+hash,bookingId),constraints:await f.proof('modification:constraints:'+hash,bookingId)};}return command('approve',{partIds:ids,proofs});};
 const apply=async(ids=[partId])=>command('apply',{partIds:ids,approvalRevision:(await see())!.approval!.revision});
 return {f,modificationId,bookingId,partId,scope,see,before,attest,command,request,evaluate,approve,apply,run:async(q:ModificationCommand)=>h.modifications.apply(await h.auth(),write,q)};
}
