import {readFile} from "node:fs/promises";
import {randomUUID as uid} from "node:crypto";
import {isolatedWork,read,write} from "./h5-work-isolated.ts";
import {H5009ExternalEventAdapter} from "../../src/infrastructure/postgres/h5-external-event-adapter.ts";
import type {ExternalEventCommand} from "../../src/infrastructure/postgres/h5-external-event-adapter.ts";
export {read,write};
export const migration="supabase/migrations/20261008192000_h5_external_event_receipts.sql";
export async function isolatedBoundaries(label:string,port:number){
 const h=await isolatedWork(label,port);try{await h.migration.unsafe(await readFile(migration,"utf8"));}catch(e){await h.close();throw e;}
 const boundaries=new H5009ExternalEventAdapter(h.runtime,h.f1,h.f2);
 return {...h,boundaries};
}
export async function boundaryFixture(h:Awaited<ReturnType<typeof isolatedBoundaries>>,kind="other",contextId:string=uid()){
 const sourceId=uid(),coverage="service-synthetic-1",at="2026-10-08T10:00:00Z";
 const context={contextKind:"booking" as const,contextId,purpose:"external-boundary"};
 await h.evidence.apply(await h.auth(),write,{action:"create",operationId:uid(),targetId:sourceId,kind:"integration_source",
  material:{source_kind:kind,label:`Synthetic ${kind}`},sourceRef:`fixture:${kind}`,...context,coverage,reason:"Fixture sintético autorizado"});
 const base=()=>({operationId:uid(),eventId:uid(),sourceId,targetId:uid(),contextKind:context.contextKind,contextId,coverage,
  sourceRef:`fixture:${kind}`,purpose:context.purpose,reason:"Recepción sintética autorizada",occurredAt:at,
  externalKey:"external-event-1",material:{amount:"100.00",currency:"EUR"}} satisfies ExternalEventCommand);
 const run=async(input:ExternalEventCommand=base())=>h.auth().then(auth=>h.boundaries.receive(auth,write,input));
 return {contextId,sourceId,coverage,context,base,run};
}
