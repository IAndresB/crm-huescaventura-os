// Isolated integration runner: official Supabase Storage, native file backend,
// ephemeral PostgreSQL and synthetic credentials. No hosted configuration.
import {spawn,spawnSync} from "node:child_process";
import {randomBytes} from "node:crypto";
import {mkdtemp,mkdir,access,writeFile,readdir,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {createServer} from "node:net";
import {once} from "node:events";

const storageCommit="5def1dfc15ab7f08fe271c7d1e70542424524e4e";
const root=resolve(import.meta.dirname,"..");
const bin=process.env.POSTGRES_H0_BIN;
if(!bin) throw new Error("POSTGRES_H0_BIN_REQUIRED");
function run(command,args,cwd=root) {
 const result=spawnSync(command,args,{cwd,stdio:"inherit",env:process.env});
 if(result.status!==0) throw new Error("ISOLATED_RUNTIME_SETUP_FAILED");
}
async function unusedPort() {
 const server=createServer();server.listen(0,"127.0.0.1");await once(server,"listening");
 const port=server.address().port;await new Promise(resolve=>server.close(resolve));return port;
}
let temporary,storageServer,pgStarted=false;
let environment={...process.env};
try {
 if(!environment.STORAGE_H1_ENDPOINT) {
  const cache=join(tmpdir(),`crm-supabase-storage-${storageCommit}`);
  try {await access(join(cache,"dist/start/server.js"));}
  catch {
   await mkdir(cache,{recursive:true});run("git",["init","--quiet"],cache);
   run("git",["fetch","--quiet","--depth","1","https://github.com/supabase/storage.git",storageCommit],cache);
   run("git",["checkout","--quiet","--detach","FETCH_HEAD"],cache);
   run("npm",["ci","--no-audit","--no-fund"],cache);run("npm",["run","build"],cache);
  }
  const head=spawnSync("git",["rev-parse","HEAD"],{cwd:cache,encoding:"utf8"});
  const diff=spawnSync("git",["diff","--quiet"],{cwd:cache});
  if(head.status!==0||head.stdout.trim()!==storageCommit||diff.status!==0) throw new Error("ISOLATED_STORAGE_SOURCE_MISMATCH");
  temporary=await mkdtemp(join(tmpdir(),"crm-private-storage-test-"));
  await mkdir(join(temporary,"socket"));const dbPort=await unusedPort(),port=await unusedPort(),adminPort=await unusedPort();
  run(join(bin,"initdb"),["-D",join(temporary,"data"),"--username=postgres","--auth-local=trust","--auth-host=trust","--no-locale","--encoding=UTF8"]);
  run(join(bin,"pg_ctl"),["-D",join(temporary,"data"),"-l",join(temporary,"postgres.log"),"-o",`-k '${join(temporary,"socket")}' -h 127.0.0.1 -p ${dbPort}`,"-w","start"]);pgStarted=true;
  const config={SERVER_HOST:"127.0.0.1",SERVER_PORT:String(port),SERVER_ADMIN_PORT:String(adminPort),
   DATABASE_URL:`postgresql://postgres@127.0.0.1:${dbPort}/postgres`,DB_INSTALL_ROLES:"true",
   AUTH_JWT_SECRET:randomBytes(32).toString("hex"),AUTH_ENCRYPTION_KEY:randomBytes(16).toString("hex"),
   STORAGE_BACKEND:"file",STORAGE_FILE_BACKEND_PATH:join(temporary,"objects"),STORAGE_S3_BUCKET:"synthetic-private",
   STORAGE_S3_REGION:"local",SERVER_REGION:"local",PG_QUEUE_ENABLE:"false",S3_PROTOCOL_ENABLED:"false",
   VECTOR_ENABLED:"false",ICEBERG_ENABLED:"false",IMAGE_TRANSFORMATION_ENABLED:"false",LOG_LEVEL:"silent"};
  const configPath=join(temporary,"runtime.env");await writeFile(configPath,Object.entries(config).map(([k,v])=>`${k}=${v}`).join("\n"),{mode:0o600});
  storageServer=spawn(process.execPath,["dist/start/server.js"],{cwd:cache,
   env:{PATH:process.env.PATH,TMPDIR:process.env.TMPDIR,LANG:"C",...config,NODE_ENV:"production"},stdio:"ignore"});
  const endpoint=`http://127.0.0.1:${port}`;let ready=false;
  for(let i=0;i<100;i++) {
   if(storageServer.exitCode!==null) throw new Error("ISOLATED_STORAGE_START_FAILED");
   try {ready=(await fetch(`${endpoint}/status`)).ok;} catch {}
   if(ready) break;await new Promise(resolve=>setTimeout(resolve,100));
  }
  if(!ready) throw new Error("ISOLATED_STORAGE_NOT_READY");
  environment={...environment,STORAGE_H1_RUNTIME:cache,STORAGE_H1_CONFIG:configPath,STORAGE_H1_ENDPOINT:endpoint};
 } else if(new URL(environment.STORAGE_H1_ENDPOINT).hostname!=="127.0.0.1") throw new Error("ISOLATED_LOOPBACK_REQUIRED");
 const files=(await readdir(join(root,"tests/integration"))).filter(x=>x.endsWith(".test.ts")).sort().map(x=>join(root,"tests/integration",x));
 const test=spawn(process.execPath,["--test","--experimental-strip-types",...files],{cwd:root,env:environment,stdio:"inherit"});
 const [code]=await once(test,"exit");process.exitCode=code??1;
} finally {
 if(storageServer && storageServer.exitCode===null) {
  const stopped=once(storageServer,"exit");storageServer.kill("SIGTERM");
  await Promise.race([stopped,new Promise(resolve=>setTimeout(resolve,5000))]);
  if(storageServer.exitCode===null) {storageServer.kill("SIGKILL");await stopped;}
 }
 if(pgStarted) run(join(bin,"pg_ctl"),["-D",join(temporary,"data"),"-m","fast","-w","stop"]);
 if(temporary) await rm(temporary,{recursive:true,force:true});
}
