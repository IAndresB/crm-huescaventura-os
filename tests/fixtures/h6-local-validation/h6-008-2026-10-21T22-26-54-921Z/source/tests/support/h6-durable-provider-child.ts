// External double only. Core is real PostgreSQL. Private signing material enters
// through stdin, never argv, evidence or provider storage. Process death is real.
import {readFile,appendFile} from 'node:fs/promises';
import {createPersistedWorkExecutor} from '../../src/infrastructure/postgres/persisted-work-executor.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
let wire='';for await(const chunk of process.stdin)wire+=chunk.toString();
const input=JSON.parse(wire);
const ledger=async()=>{try{return (await readFile(input.providerFile,'utf8')).trim().split('\n').filter(Boolean).map(x=>JSON.parse(x));}catch(e:any){if(e.code==='ENOENT')return [];throw e;}};
const resultVerifier={
 checkEffect:async(r:any)=>({...r,availability:'available' as const,priorEffect:(await ledger()).some(x=>x.executionId===r.executionId&&x.partId===r.partId)?'succeeded' as const:'none' as const,sourceKind:'simulated' as const,verifierIdentity:'h6-durable-provider',observationRef:'synthetic-provider-ledger'}),
 inspect:async(r:any)=>(await ledger()).find(x=>x.executionId===r.executionId&&x.attemptId===r.attemptId),
};
const executor=createPersistedWorkExecutor({...input.config,capability:{...input.config.capability,key:Uint8Array.from(input.config.capability.key)},humanAuthorization:{...input.config.humanAuthorization,key:Uint8Array.from(input.config.humanAuthorization.key)},resultVerifier});
try{
 const auth=await verifyAuth({verify:async()=>input.auth},'synthetic-h6-child');
 const result=input.mode==='read'?await executor.read(auth,classifyServerEvent('core-read'),input.executionId,input.context):await executor.apply(auth,classifyServerEvent('core-action'),input.command);
 if(input.mode==='effect_then_crash'){
  const snapshot=await executor.read(auth,classifyServerEvent('core-read'),input.executionId,input.context);
  const attempt=snapshot!.attempts.find(x=>x.attempt_id===input.command.attemptId);
  if(!attempt||attempt.state!=='contacted')throw new Error('PROVIDER_CONTACT_NOT_PREPARED');
  // One independently persisted simulated effect, even though no reply reaches Core.
  await appendFile(input.providerFile,JSON.stringify({executionId:input.executionId,attemptId:input.command.attemptId,partId:attempt.part_id,outcome:'succeeded',resultRef:'synthetic-effect-'+input.command.attemptId,sourceKind:'simulated',verifierIdentity:'h6-durable-provider'})+'\n',{mode:0o600});
  process.kill(process.pid,'SIGKILL');
 }
 process.stdout.write(JSON.stringify({pid:process.pid,result})+'\n');
}catch(e){process.stderr.write((e instanceof Error?e.message:'H6_CHILD_FAILED')+'\n');process.exitCode=1;}finally{await executor.close();}
