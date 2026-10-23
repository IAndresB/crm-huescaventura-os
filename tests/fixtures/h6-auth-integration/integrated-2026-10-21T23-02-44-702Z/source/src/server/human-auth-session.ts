import {randomBytes} from 'node:crypto';
import {verifyAuth,type AuthVerificationPort,type VerifiedAuthEvidence} from '../application/verified-auth.ts';
import type {AuthGlobalRevocationPort} from '../application/global-access-revocation.ts';
import {SupabaseAuthProvider,type ProviderTokens} from '../infrastructure/auth/supabase-auth-provider.ts';

type Binding={subject:string;providerSessionId:string;sessionId:string;tokens:ProviderTokens;closed:boolean;refresh?:Promise<void>};
type Access={establish(auth:VerifiedAuthEvidence):Promise<{sessionId:string;epochId:string}>;revokeOne(auth:VerifiedAuthEvidence):Promise<void>};

// Server-owned handles: clients cannot choose a Core session or import a JWT.
// Password/TOTP are never retained. Tokens live only in this process, never in
// Core, logs or responses. Loss of process state fails closed and requires a
// new full identification. Existing Core epochs remain immutable history.
export class HumanAuthSessions implements AuthVerificationPort,AuthGlobalRevocationPort {
  private readonly bindings=new Map<string,Binding>();
  private readonly provider:SupabaseAuthProvider;
  private readonly access:Access;
  constructor(provider:SupabaseAuthProvider,access:Access){this.provider=provider;this.access=access;}
  async login(email:string,password:string,code:string):Promise<string> {
    const tokens=await this.provider.login(email,password,code);
    try {
      const id=await this.provider.verify(tokens.accessToken);
      const proof=await verifyAuth({verify:async()=>({subject:id.subject,passwordVerified:id.passwordVerified,mfaVerified:id.mfaVerified})},tokens.accessToken);
      const core=await this.access.establish(proof),handle=randomBytes(32).toString('base64url');
      this.bindings.set(handle,{...id,sessionId:core.sessionId,tokens,closed:false});
      return handle;
    }catch{await this.provider.logout(tokens.accessToken,'local').catch(()=>{});throw new Error('AUTH_LOGIN_DENIED');}
  }
  private binding(handle:string):Binding {
    const b=this.bindings.get(handle);if(!b||b.closed)throw new Error('AUTH_SESSION_DENIED');return b;
  }
  private async identity(b:Binding){
    const id=await this.provider.verify(b.tokens.accessToken);
    if(b.closed||id.subject!==b.subject||id.providerSessionId!==b.providerSessionId||!id.passwordVerified||!id.mfaVerified)throw new Error('AUTH_SESSION_DENIED');
    return {subject:b.subject,sessionId:b.sessionId,passwordVerified:true,mfaVerified:true};
  }
  async verify(handle:string){try{return await this.identity(this.binding(handle));}catch{return undefined;}}
  async refresh(handle:string):Promise<void> {
    const b=this.binding(handle);
    // Serialize token rotation per device; no Core admission/activity here.
    if(b.refresh)return b.refresh;
    b.refresh=(async()=>{
      const next=await this.provider.refresh(b.tokens),id=await this.provider.verify(next.accessToken);
      if(b.closed||id.subject!==b.subject||id.providerSessionId!==b.providerSessionId||!id.passwordVerified||!id.mfaVerified)throw new Error('AUTH_REFRESH_DENIED');
      b.tokens=next;
    })();
    try{await b.refresh;}finally{b.refresh=undefined;}
  }
  async logout(handle:string):Promise<{auth:'revoked'|'uncertain'}> {
    const b=this.binding(handle),auth=await verifyAuth(this,handle);
    await this.access.revokeOne(auth); // durable Core closure precedes provider
    b.closed=true;
    try{await this.provider.logout(b.tokens.accessToken,'local');return {auth:'revoked'};}
    catch{return {auth:'uncertain'};}
  }
  async revokeAllSessions(auth:VerifiedAuthEvidence):Promise<'revoked'|'uncertain'> {
    // Called only by the existing coordinator AFTER durable Core generation change.
    const b=[...this.bindings.values()].find(x=>x.subject===auth.subject&&x.sessionId===auth.sessionId);
    if(!b)return 'uncertain';
    for(const session of this.bindings.values())if(session.subject===auth.subject)session.closed=true;
    try{await this.provider.logout(b.tokens.accessToken,'global');return 'revoked';}catch{return 'uncertain';}
  }
  close():void {for(const b of this.bindings.values())b.closed=true;this.bindings.clear();}
}
