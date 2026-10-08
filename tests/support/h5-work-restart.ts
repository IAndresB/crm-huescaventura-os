// Child process fixture. Signing material arrives only through private stdin,
// never an argv, file or captured output. All effects are explicitly simulated.
import {readFile,writeFile} from 'node:fs/promises';
import {createPersistedWorkExecutor} from '../../src/infrastructure/postgres/persisted-work-executor.ts';
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {classifyServerEvent} from '../../src/application/verified-interaction.ts';
let wire='';for await(const chunk of process.stdin)wire+=chunk.toString();const input=JSON.parse(wire);
const facts=async()=>{try{return JSON.parse(await readFile(input.providerFile,'utf8'));}catch{return undefined;}};
const resultVerifier={checkEffect:async(r:any)=>({...r,availability:'available' as const,priorEffect:(await facts())?'succeeded' as const:'none' as const,sourceKind:'simulated' as const,verifierIdentity:'synthetic-durable-provider',observationRef:'synthetic-file-observation'}),inspect:async()=>await facts()};
const executor=createPersistedWorkExecutor({...input.config,capability:{...input.config.capability,key:Uint8Array.from(input.config.capability.key)},humanAuthorization:{...input.config.humanAuthorization,key:Uint8Array.from(input.config.humanAuthorization.key)},resultVerifier});
try{
 const auth=await verifyAuth({verify:async()=>input.auth},'synthetic-child-process');
 const result=input.mode==='read'?await executor.read(auth,classifyServerEvent('core-read'),input.executionId,input.context):await executor.apply(auth,classifyServerEvent('core-action'),input.command);
 if(input.mode==='crash_after_effect')await writeFile(input.providerFile,JSON.stringify(input.fact)+'\n',{mode:0o600});
 await new Promise<void>(resolve=>process.stdout.write(JSON.stringify({mode:input.mode,result})+'\n',()=>resolve()));
 if(input.mode.startsWith('crash_'))process.exit(input.mode==='crash_before_contact'?71:input.mode==='crash_during_contact'?72:73);
}catch(e){process.stderr.write((e instanceof Error?e.message:'WORK_CHILD_FAILED')+'\n');process.exitCode=1;}finally{await executor.close();}
