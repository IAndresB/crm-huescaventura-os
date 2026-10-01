import assert from "node:assert/strict";
import {before,after,test} from "node:test";
import {randomUUID} from "node:crypto";
import {isolatedH2,write,read} from "../support/h2-isolated.ts";
let h:Awaited<ReturnType<typeof isolatedH2>>;
before(async()=>{h=await isolatedH2("crm_h2_001",55461);});after(async()=>{await h?.close();});
test("H2 focal: direct creation, H1 OP and atomic replay",async()=>{
 const p=h.input();await h.adapter.apply(await h.auth(),write,p);
 const row=await h.adapter.read(await h.auth(),read,p.targetId,"opportunity") as {state:string;human_code:string};
 assert.equal(row.state,"Nueva");assert.match(row.human_code,/^OP-2026-[0-9]{4,}$/);
 assert.equal((await h.adapter.apply(await h.auth(),write,p)).replayed,true);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b03_history where subject_id=${p.targetId}::uuid`)[0]?.n,1);
});
test("H2 focal: incomplete lead converts preserving source and owner",async()=>{
 const l=h.input({action:"lead",material:{contact:null,need:null,commercialPossible:null,pending:["contact","need","possibility"]}});await h.adapter.apply(await h.auth(),write,l);
 const p=h.input({action:"convert",leadId:l.targetId});await h.adapter.apply(await h.auth(),write,p);
 const row=(await h.observer`select lead_id::text,source_ref,responsible_actor::text from crm_private.b03_opportunities where opportunity_id=${p.targetId}::uuid`)[0]!;
 assert.equal(row.lead_id,l.targetId);assert.equal(row.responsible_actor,h.actorId);assert.equal(row.source_ref,l.sourceRef);
});
test("H2 focal: loss/pause/reactivate and forbidden Ganada preserve history",async()=>{
 const p=h.input();await h.adapter.apply(await h.auth(),write,p);
 for(const [rev,event] of [[1,{type:"pause",sourceRef:"manual",decision:"pause",context:"pending",followup:"review"}],
  [2,{type:"reactivate",sourceRef:"manual",interest:"new",review:"current",destination:"En contacto",support:{contact:"current"}}]] as const)
  await h.adapter.apply(await h.auth(),write,{action:"progress",operationId:randomUUID(),targetId:p.targetId,expectedRevision:rev,sourceRef:"manual",reason:"change",event});
 await assert.rejects(h.adapter.apply(await h.auth(),write,{action:"progress",operationId:randomUUID(),targetId:p.targetId,expectedRevision:3,sourceRef:"manual",reason:"change",event:{type:"win",sourceRef:"manual"}}),/COMMERCIAL_BLOCKED/);
 assert.equal((await h.observer`select count(*)::int n from crm_private.b03_history where subject_id=${p.targetId}::uuid`)[0]?.n,3);
});
test("H2 focal: runtime has no direct DML",async()=>{
 await assert.rejects(h.runtime`select * from crm_private.b03_opportunities`,/permission denied/);
 await assert.rejects(h.runtime`update crm_private.b03_opportunities set state='Aceptada / Ganada'`,/permission denied/);
});
