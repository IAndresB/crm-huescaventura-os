// Provider identity is checked online on every request. Decoding a JWT alone
// never authenticates it; /user first verifies signature, user and live session.
export type ProviderTokens = Readonly<{accessToken:string;refreshToken:string}>;
export type ProviderIdentity = Readonly<{subject:string;providerSessionId:string;
  passwordVerified:boolean;mfaVerified:boolean}>;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const denied=()=>new Error('AUTH_PROVIDER_DENIED');
type User={id:string;factors?:{id:string;factor_type:string;status:string}[]};

export class SupabaseAuthProvider {
  private readonly endpoint:string;
  private readonly issuer:string;
  constructor(input:{endpoint:string;issuer:string;allowLocalHttp?:boolean}) {
    const url=new URL(input.endpoint);
    if(url.username||url.password||url.search||url.hash||
      (url.protocol!=='https:'&&!(input.allowLocalHttp&&url.protocol==='http:'&&url.hostname==='127.0.0.1')))throw denied();
    this.endpoint=url.href.replace(/\/$/,'');this.issuer=input.issuer;
  }
  private async request(path:string,token?:string,body?:unknown):Promise<unknown> {
    try {
      const response=await fetch(this.endpoint+path,{method:body===undefined?'GET':'POST',
        headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(body===undefined?{}:{'Content-Type':'application/json'})},
        ...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(5000)});
      if(!response.ok)throw denied();
      return response.status===204?undefined:await response.json();
    } catch {throw denied();}
  }
  private tokens(value:unknown):ProviderTokens {
    const v=value as {access_token?:unknown;refresh_token?:unknown};
    if(!v||typeof v.access_token!=='string'||!v.access_token||typeof v.refresh_token!=='string'||!v.refresh_token)throw denied();
    return Object.freeze({accessToken:v.access_token,refreshToken:v.refresh_token});
  }
  async verify(accessToken:string):Promise<ProviderIdentity> {
    if(typeof accessToken!=='string'||accessToken.split('.').length!==3)throw denied();
    const user=await this.request('/user',accessToken) as User;
    try {
      // This is the exact token accepted by the fixed provider endpoint above.
      const c=JSON.parse(Buffer.from(accessToken.split('.')[1]!,'base64url').toString()) as {
        sub:string;session_id:string;aud:string;iss:string;role:string;exp:number;aal:string;amr?:{method:string}[];
      };
      if(!uuid.test(c.sub)||!uuid.test(c.session_id)||c.sub!==user.id||c.aud!=='authenticated'||c.role!=='authenticated'||
        c.iss!==this.issuer||!Number.isFinite(c.exp)||c.exp<=Date.now()/1000)throw denied();
      const methods=c.amr?.map(x=>x.method)??[];
      return Object.freeze({subject:c.sub,providerSessionId:c.session_id,passwordVerified:methods.includes('password'),
        mfaVerified:c.aal==='aal2'&&methods.includes('totp')&&!!user.factors?.some(f=>f.factor_type==='totp'&&f.status==='verified')});
    }catch{throw denied();}
  }
  async login(email:string,password:string,code:string):Promise<ProviderTokens> {
    // No arbitrary JWT-to-Core establishment endpoint: each new Core session
    // starts with a new password grant and a real provider TOTP challenge.
    let first:ProviderTokens|undefined;
    try {
      if(!email||!password||!/^\d{6}$/.test(code))throw denied();
      first=this.tokens(await this.request('/token?grant_type=password',undefined,{email,password}));
      const user=await this.request('/user',first.accessToken) as User;
      const factor=user.factors?.find(f=>f.factor_type==='totp'&&f.status==='verified');
      if(!factor||!uuid.test(factor.id))throw denied();
      const challenge=await this.request(`/factors/${factor.id}/challenge`,first.accessToken,{}) as {id:string};
      if(!uuid.test(challenge.id))throw denied();
      const tokens=this.tokens(await this.request(`/factors/${factor.id}/verify`,first.accessToken,{challenge_id:challenge.id,code}));
      const identity=await this.verify(tokens.accessToken);
      if(!identity.passwordVerified||!identity.mfaVerified)throw denied();
      return tokens;
    } catch {
      if(first)await this.logout(first.accessToken,'local').catch(()=>{});
      throw denied();
    }
  }
  async refresh(tokens:ProviderTokens):Promise<ProviderTokens> {
    return this.tokens(await this.request('/token?grant_type=refresh_token',undefined,{refresh_token:tokens.refreshToken}));
  }
  async logout(accessToken:string,scope:'local'|'global'):Promise<void> {
    await this.request('/logout?scope='+scope,accessToken,{});
  }
}
