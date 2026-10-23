import {verifyAuth,type VerifiedAuthEvidence} from '../application/verified-auth.ts';
import {classifyServerEvent,type VerifiedServerInteraction} from '../application/verified-interaction.ts';
import type {GlobalAccessRevocationResult} from '../application/global-access-revocation.ts';
import {HumanAuthSessions} from './human-auth-session.ts';

export type HumanHttpOperation=Readonly<{
  event:'core-read'|'core-action';
  // Registry is composed inside the trusted server; neither function nor event
  // comes from the request. The underlying adapter performs same-TX F1/F2.
  execute(auth:VerifiedAuthEvidence,interaction:VerifiedServerInteraction,input:unknown):Promise<unknown>;
}>;
export function createHumanHttpBoundary(input:{origin:string;allowLocalHttp?:boolean;sessions:HumanAuthSessions;
  revokeAll(auth:VerifiedAuthEvidence):Promise<GlobalAccessRevocationResult>;
  operations:Readonly<Record<string,HumanHttpOperation>>;maxBodyBytes:number}) {
  const origin=new URL(input.origin);
  if(origin.origin!==input.origin||origin.username||origin.password||!Number.isSafeInteger(input.maxBodyBytes)||input.maxBodyBytes<1||
    (origin.protocol!=='https:'&&!(input.allowLocalHttp&&origin.protocol==='http:'&&origin.hostname==='127.0.0.1')))throw new Error('HTTP_CONFIGURATION_DENIED');
  const operations=new Map(Object.entries(input.operations));
  const response=(status:number,value:unknown)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  return async(request:Request):Promise<Response>=>{
    try {
      const url=new URL(request.url);
      if(url.origin!==origin.origin||url.search||request.method!=='POST'||request.headers.get('origin')!==origin.origin||
        (request.headers.has('sec-fetch-site')&&request.headers.get('sec-fetch-site')!=='same-origin')||
        request.headers.get('content-type')!=='application/json')return response(403,{error:'ACCESS_DENIED'});
      const reader=request.body?.getReader();if(!reader)return response(400,{error:'INVALID_INPUT'});
      const chunks:Uint8Array[]=[];let size=0;
      for(;;){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>input.maxBodyBytes){await reader.cancel();return response(413,{error:'INVALID_INPUT'});}chunks.push(value);}
      const body:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if(!body||typeof body!=='object'||Array.isArray(body))return response(400,{error:'INVALID_INPUT'});
      const keys=Object.keys(body),record=body as Record<string,unknown>;
      if(url.pathname==='/auth/login'){
        if(keys.sort().join(',')!=='code,email,password'||keys.some(k=>typeof record[k]!=='string'))return response(400,{error:'INVALID_INPUT'});
        return response(200,{handle:await input.sessions.login(record.email as string,record.password as string,record.code as string)});
      }
      const bearer=request.headers.get('authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
      if(!bearer)return response(403,{error:'ACCESS_DENIED'});
      if(url.pathname.startsWith('/auth/')){
        if(keys.length)return response(400,{error:'INVALID_INPUT'});
        if(url.pathname==='/auth/refresh'){await input.sessions.refresh(bearer);return response(200,{refreshed:true});}
        if(url.pathname==='/auth/logout')return response(200,await input.sessions.logout(bearer));
        if(url.pathname==='/auth/revoke-all')return response(200,await input.revokeAll(await verifyAuth(input.sessions,bearer)));
        return response(404,{error:'ACCESS_DENIED'});
      }
      const op=operations.get(url.pathname);if(!op)return response(404,{error:'ACCESS_DENIED'});
      const auth=await verifyAuth(input.sessions,bearer);
      return response(200,{value:await op.execute(auth,classifyServerEvent(op.event),body)});
    }catch{return response(403,{error:'ACCESS_DENIED'});}
  };
}
