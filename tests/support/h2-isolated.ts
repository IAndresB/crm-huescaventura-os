import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {randomBytes,randomUUID} from "node:crypto";
import {spawnSync} from "node:child_process";
import {mkdtemp,mkdir,readFile,readdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import postgres from "postgres";
import {verifyAuth} from "../../src/application/verified-auth.ts";
import {classifyServerEvent} from "../../src/application/verified-interaction.ts";
import {H0005PostgresAdapter} from "../../src/infrastructure/postgres/h0-005-adapter.ts";
import {H1001IdentityAdapter} from "../../src/infrastructure/postgres/h1-identity-adapter.ts";
import {H1013EvidenceAdapter,type B07Command} from "../../src/infrastructure/postgres/h1-evidence-adapter.ts";
import {H1017TaskAdapter} from "../../src/infrastructure/postgres/h1-task-adapter.ts";
import {H2001CommercialAdapter,type CommercialCommand} from "../../src/infrastructure/postgres/h2-commercial-adapter.ts";
import type {F1SigningConfiguration} from "../../src/infrastructure/postgres/f1-codec.ts";
import type {F2SigningConfiguration} from "../../src/infrastructure/postgres/f2-codec.ts";

export const h2Migration="20261001081941_h2_commercial_progress.sql";
export const read=classifyServerEvent("core-read"),write=classifyServerEvent("core-action");
const root=resolve(import.meta.dirname,"../.."),migrations=join(root,"supabase/migrations");
export async function isolatedH2(label:string,port:number,upgrade=false) {
 const bin=process.env.POSTGRES_H0_BIN;if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
 const temporary=await mkdtemp(join(tmpdir(),`crm-${label}-`)),socket=join(temporary,"socket");await mkdir(socket);
 const command=(name:string,args:string[])=>{const p=spawnSync(join(bin,name),args,{encoding:"utf8",env:{...process.env,LC_ALL:"C"}});if(process.env.H4014_CAPTURE_DIR){const dir=join(process.env.H4014_CAPTURE_DIR,"native");mkdirSync(dir,{recursive:true});const prefix=join(dir,label+"-"+name+"-"+randomUUID());writeFileSync(prefix+".stdout.log",p.stdout??"");writeFileSync(prefix+".stderr.log",p.stderr??"");writeFileSync(prefix+".status.json",JSON.stringify({cmd:join(bin,name),args,status:p.status,signal:p.signal,error:p.error?.message??null},null,2)+"\n");}assert.equal(p.status,0,p.stderr);};
 command("initdb",["-D",join(temporary,"data"),"--username=h2_bootstrap","--auth-local=trust","--auth-host=trust","--no-locale","--encoding=UTF8"]);
 command("pg_ctl",["-D",join(temporary,"data"),"-l",join(temporary,"postgres.log"),"-o",`-k '${socket}' -h '127.0.0.1' -p ${port}`,"-w","start"]);
 const connections:postgres.Sql[]=[];
 const connect=(user:string,db=label)=>{const sql=postgres({host:socket,port,database:db,user,max:user==="crm_h0_runtime"?4:1,prepare:false,onnotice:()=>{}});connections.push(sql);return sql;};
 const bootstrap=connect("h2_bootstrap","postgres");await bootstrap.unsafe(await readFile(join(migrations,"202609150000_h0_m01_roles.sql"),"utf8"));
 await bootstrap.unsafe(`create database ${label} owner crm_h0_migration`);
 const admin=connect("h2_bootstrap"),migration=connect("crm_h0_migration"),observer=connect("crm_h0_migration");
 await admin.unsafe("create role anon login; create role authenticated login");
 const applyChain=async(target:postgres.Sql,boot:postgres.Sql,until=h2Migration)=>{
  for(const file of (await readdir(migrations)).filter(x=>x.endsWith(".sql")&&x!=="202609150000_h0_m01_roles.sql"&&x<=until).sort()) {
   if(file.endsWith("_authorities.sql")) {if(!(await boot`select exists(select 1 from pg_roles where rolname='crm_h0_ha_tx') p`)[0]?.p) await boot.unsafe(await readFile(join(migrations,file),"utf8"));}
   else await target.unsafe(await readFile(join(migrations,file),"utf8"));
  }
 };
 await applyChain(migration,admin,upgrade?"20260930185257_h1_pending_business_tasks.sql":h2Migration);
 const subject=randomUUID(),actorId=randomUUID(),scope=`${label}-synthetic`;
 const f1:F1SigningConfiguration={key:randomBytes(32),keyId:randomUUID(),audience:label,generation:randomUUID(),allowedPurposes:["h1-evidence","h1-identities","h1-catalog"]};
 const f2:F2SigningConfiguration={key:randomBytes(32),keyId:randomUUID(),audience:label,generation:randomUUID(),allowedPurposes:["full-identification","core-human-access","session-revocation"]};
 await migration`insert into crm_f1.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values(${f1.keyId},${Buffer.from(f1.key)},${f1.audience},${f1.generation},${f1.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
 await migration`insert into crm_f2.keys(key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until) values(${f2.keyId},${Buffer.from(f2.key)},${f2.audience},${f2.generation},${f2.allowedPurposes},true,clock_timestamp()-interval '1 minute',clock_timestamp()+interval '2 hours')`;
 await migration`select crm_api.provision_actor_mapping(${actorId}::uuid,${subject}::uuid,${scope})`;
 const runtime=connect("crm_h0_runtime"),access=new H0005PostgresAdapter(runtime,f1,f2);
 const first=await verifyAuth({verify:async()=>({subject,passwordVerified:true,mfaVerified:true})},randomUUID());
 const sessionId=(await access.establish(first)).sessionId;
 const auth=()=>verifyAuth({verify:async()=>({subject,sessionId,passwordVerified:true,mfaVerified:true})},randomUUID());
 const adapter=new H2001CommercialAdapter(runtime,f1,f2),identities=new H1001IdentityAdapter(runtime,f1,f2),evidence=new H1013EvidenceAdapter(runtime,f1,f2),tasks=new H1017TaskAdapter(runtime,f1,f2);
 const req=(kind:B07Command["kind"],material:Record<string,unknown>,contextId:string,contextKind:B07Command["contextKind"]="opportunity"):B07Command=>({action:"create",operationId:randomUUID(),targetId:randomUUID(),kind,material,sourceRef:"synthetic-manual",purpose:"commercial-test",occurredAt:"2026-09-28T10:00:00Z",contextKind,contextId,coverage:"synthetic-scope",reason:"synthetic-register"});
 const input=(change:Partial<CommercialCommand>={}):CommercialCommand=>({action:"direct",operationId:randomUUID(),targetId:randomUUID(),expectedRevision:0,sourceRef:"synthetic-origin",reason:"synthetic-sale",
  material:{contact:{channel:"manual",address:"synthetic-client",sourceRef:"synthetic-check",valid:true},need:"synthetic-event",commercialPossible:true,pending:["date","participants","services","budget"]},...change});
 const close=async()=>{await Promise.allSettled(connections.map(x=>x.end({timeout:1})));command("pg_ctl",["-D",join(temporary,"data"),"-m","fast","-w","stop"]);await rm(temporary,{recursive:true,force:true});};
 return {temporary,bin,admin,migration,observer,runtime,connect,applyChain,auth,adapter,identities,evidence,tasks,req,input,actorId,subject,sessionId,scope,f1,f2,close};
}
