// Historical reproducer. PASS reproduces the original defect at a5bbb06;
// current valid-contact rejection is tested separately by formal R01.
import assert from "node:assert/strict";
import {before,after,test} from "node:test";
import {execFileSync} from "node:child_process";
import {randomUUID} from "node:crypto";
import {isolatedH2,write} from "../support/h2-isolated.ts";
import {createF1Issuer,encodeF1Fields} from "../../src/infrastructure/postgres/f1-codec.ts";
import {createF2Issuer} from "../../src/infrastructure/postgres/f2-codec.ts";
import {issueTrustedContext} from "../../src/application/trusted-context.ts";
import {postgresF1Binding} from "../../src/infrastructure/postgres/transaction.ts";
let h:Awaited<ReturnType<typeof isolatedH2>>;
before(async()=>{
 h=await isolatedH2("crm_h2_f02_original",55465,true);
 const sql=execFileSync("git",["show","a5bbb06e323e897d853a5ea9527bc3a931a814fc:supabase/migrations/20261001081941_h2_commercial_progress.sql"],{encoding:"utf8"});await h.migration.unsafe(sql);
});
after(async()=>{await h?.close();});
test("F02 historical: malformed numeric contact accepted by SQL at a5bbb06",async()=>{
 const p=h.input(),input={...p,material:{...p.material!,contact:{...p.material!.contact!,address:123}}},auth=await h.auth();
 const f1=createF1Issuer(h.f1),f2=createF2Issuer(h.f2);
 await h.runtime.begin(async tx=>{
  const row=(await tx`select actor_id::text,admin_scope,access_generation::text,epoch_id::text from crm_api.f2_lookup(${auth.subject}::uuid,${auth.sessionId!}::uuid)`)[0]!;
  const binding=await postgresF1Binding(tx),identity={actorId:row.actor_id,scope:row.admin_scope,accessGeneration:row.access_generation,sessionId:auth.sessionId!,epochId:row.epoch_id};
  const ctx=(purpose:string)=>issueTrustedContext({identityId:"historical-verifier",identityKind:"technical",purpose,scope:identity.scope,requestId:randomUUID(),serverTime:new Date().toISOString()});
  const q=encodeF1Fields(["CRM-H2-COM-1",JSON.stringify(input)]),hf=f2(auth,identity,binding,"evidence_write",q,write),tf=f1(ctx("h1-evidence"),binding,"C03",q,{resource:"evidence",action:"write_evidence"});
  const cq=encodeF1Fields(["CRM-H1-RESOLVE1","assign_code",p.targetId,p.targetId,"","OP",p.sourceRef,p.sourceRef,p.reason,"0"]);
  const ch=f2(auth,identity,binding,"identity_write",cq,write),ct=f1(ctx("h1-identities"),binding,"C03",cq,{resource:"identities",action:"write_identity"});
  await tx.unsafe("select * from crm_api.b03_apply($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[hf.payload,hf.mac,tf.payload,tf.mac,q,ch.payload,ch.mac,ct.payload,ct.mac,cq]);
 });
 const row=(await h.observer`select state,material from crm_private.b03_opportunities where opportunity_id=${p.targetId}::uuid`)[0]!;
 assert.equal(row.state,"Nueva");assert.equal(row.material.contact.address,123);
});
