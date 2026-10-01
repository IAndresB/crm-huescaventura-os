// Historical reproducer: PASS means the original F01 defect was reproduced,
// never that the current implementation passes the normative positive case.
import assert from "node:assert/strict";
import {before,after,test} from "node:test";
import {execFileSync} from "node:child_process";
import {randomUUID} from "node:crypto";
import {isolatedH2,write} from "../support/h2-isolated.ts";
let h:Awaited<ReturnType<typeof isolatedH2>>;
before(async()=>{
 h=await isolatedH2("crm_h2_f01_original",55463,true);
 const sql=execFileSync("git",["show","00cf358c24829d21529893eaf846ad40ab931bec:supabase/migrations/20261001081941_h2_commercial_progress.sql"],{encoding:"utf8"});await h.migration.unsafe(sql);
});
after(async()=>{await h?.close();});
test("F01 historical: approved reviewed B07 contact incorrectly rejected at 00cf358",async()=>{
 const p=h.input();await h.adapter.apply(await h.auth(),write,p);
 const c=h.req("communication",{direction:"outgoing",channel:"manual",recipient_ref:"synthetic-client",coverage:"synthetic-scope",initial_fact:"none"},p.targetId);
 const e=h.req("evidence",{claim:"synthetic actual contact attempt, response unknown",coverage:"synthetic-scope",certainty:"reviewed",source_kind:"manual"},p.targetId);
 await h.evidence.apply(await h.auth(),write,c);await h.evidence.apply(await h.auth(),write,e);
 await assert.rejects(h.adapter.apply(await h.auth(),write,{action:"progress",operationId:randomUUID(),targetId:p.targetId,expectedRevision:1,sourceRef:"synthetic-manual",reason:"synthetic-contact",event:{type:"contact",sourceRef:"synthetic-manual",communicationId:c.targetId,evidenceId:e.targetId,outcome:"attempt, response unknown"}}),/COMMERCIAL_ACTUAL_EVIDENCE_REQUIRED/);
 assert.equal((await h.observer`select state from crm_private.b03_opportunities where opportunity_id=${p.targetId}::uuid`)[0]?.state,"Nueva");
 assert.equal((await h.observer`select count(*)::int n from crm_private.b03_history where subject_id=${p.targetId}::uuid`)[0]?.n,1);
});
