import assert from 'node:assert/strict';
import {randomBytes,randomUUID,createHmac,createHash,timingSafeEqual} from 'node:crypto';
import {spawn,type ChildProcess} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {once} from 'node:events';
import type {isolatedWork} from './h6-current-isolated.ts';

export function totp(secret:string,now=Date.now()):string {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';
  for(const char of secret.toUpperCase().replace(/=+$/,''))bits+=alphabet.indexOf(char).toString(2).padStart(5,'0');
  const key=Buffer.from(bits.match(/.{8}/g)!.map(b=>parseInt(b,2))),counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(now/30000)));
  const hash=createHmac('sha1',key).update(counter).digest(),offset=hash[19]!&15;
  return String((hash.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');
}
export async function isolatedAuth(h:Awaited<ReturnType<typeof isolatedWork>>,dbPort:number){
  const runtime='/tmp/crm-h6-auth-tools/binary',endpoint='http://127.0.0.1:59619';
  assert.equal(createHash('sha256').update(await readFile('/tmp/crm-h6-auth-tools/auth.tar.gz')).digest('hex'),'3fb7998e7061e2c14f3f9555b1d94d447358c965395728e0d81eac82e0e5868b');
  const secret=(await readFile(process.env.STORAGE_H1_CONFIG!,'utf8')).match(/^AUTH_JWT_SECRET=(.*)$/m)![1]!;
  // Same synthetic signing secret lets actual provider JWTs reach real Storage
  // authentication, then its ordinary-role ACL/RLS; never a production key.
  const token=(claims:Record<string,unknown>)=>{
    const head=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
    const payload=Buffer.from(JSON.stringify({aud:'authenticated',iss:endpoint,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,...claims})).toString('base64url');
    return `${head}.${payload}.${createHmac('sha256',secret).update(`${head}.${payload}`).digest('base64url')}`;
  };
  const adminToken=token({role:'service_role'}),password=randomBytes(24).toString('base64url');
  // Provider owns only its disposable database, not the CRM or F1/F2 keys.
  await h.admin.unsafe('create role h6008_auth_admin login nosuperuser nocreatedb nocreaterole nobypassrls');
  await h.admin.unsafe('alter role h6008_auth_admin set search_path to auth,public');
  await h.admin.unsafe('create database crm_h6008_auth owner h6008_auth_admin');
  const env={PATH:process.env.PATH!,TMPDIR:process.env.TMPDIR!,LANG:'C',NODE_ENV:'test' as const,
    GOTRUE_DB_DRIVER:'postgres',DB_NAMESPACE:'auth',DATABASE_URL:`postgres://h6008_auth_admin@127.0.0.1:${dbPort}/crm_h6008_auth?sslmode=disable`,
    GOTRUE_API_HOST:'127.0.0.1',PORT:'59619',API_EXTERNAL_URL:endpoint,GOTRUE_SITE_URL:'http://127.0.0.1:59621',
    GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_ISSUER:endpoint,GOTRUE_JWT_AUD:'authenticated',GOTRUE_JWT_EXP:'3600',GOTRUE_JWT_DEFAULT_GROUP_NAME:'authenticated',GOTRUE_JWT_ADMIN_ROLES:'service_role',
    GOTRUE_DISABLE_SIGNUP:'true',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',GOTRUE_MAILER_AUTOCONFIRM:'false',
    GOTRUE_SMTP_HOST:'127.0.0.1',GOTRUE_SMTP_PORT:'59622',GOTRUE_SMTP_ADMIN_EMAIL:'local@example.invalid',
    GOTRUE_EXTERNAL_PHONE_ENABLED:'false',GOTRUE_SMS_AUTOCONFIRM:'false',GOTRUE_MFA_PHONE_ENROLL_ENABLED:'false',GOTRUE_MFA_PHONE_VERIFY_ENABLED:'false',
    GOTRUE_MFA_TOTP_ENROLL_ENABLED:'true',GOTRUE_MFA_TOTP_VERIFY_ENABLED:'true',GOTRUE_MFA_WEB_AUTHN_ENROLL_ENABLED:'false',GOTRUE_MFA_WEB_AUTHN_VERIFY_ENABLED:'false',
    GOTRUE_MFA_RATE_LIMIT_CHALLENGE_AND_VERIFY:'10000',GOTRUE_RATE_LIMIT_TOKEN_REFRESH:'10000',GOTRUE_RATE_LIMIT_VERIFY:'10000',
    GOTRUE_LOG_LEVEL:'error',HTTP_PROXY:'http://127.0.0.1:59622',HTTPS_PROXY:'http://127.0.0.1:59622',NO_PROXY:'127.0.0.1,localhost',
  };
  let child:ChildProcess;let providerLog='';
  const start=async()=>{
    child=spawn(runtime+'/auth',['serve'],{cwd:runtime,env,stdio:['ignore','pipe','pipe']});
    child.stdout?.on('data',b=>{providerLog+=b;});child.stderr?.on('data',b=>{providerLog+=b;});
    for(let i=0;i<150;i++){
      if(child.exitCode!==null)throw new Error('AUTH_START_FAILED: '+providerLog.replaceAll(secret,'[REDACTED]').replaceAll(password,'[REDACTED]').slice(-2400));
      try{if((await fetch(endpoint+'/health')).ok)return;}catch{}
      await new Promise(r=>setTimeout(r,100));
    }throw new Error('AUTH_START_TIMEOUT');
  };
  const stop=async()=>{if(child&&child.exitCode===null){const exited=once(child,'exit');child.kill('SIGTERM');await exited;}};
  let mailAttempts=0;const sink=createServer((_req,res)=>{mailAttempts++;res.writeHead(503);res.end();});
  // Reject SMTP/HTTP attempts locally; neither email nor hook traffic can leave.
  sink.on('connection',socket=>{socket.setTimeout(1000,()=>socket.destroy());});sink.listen(59622,'127.0.0.1');await once(sink,'listening');
  const close=async()=>{await stop();sink.closeAllConnections();await new Promise<void>(r=>sink.close(()=>r()));};
  try{await start();}catch(e){await close();throw e;}
  const request=async(path:string,body?:unknown,bearer?:string,method=body===undefined?'GET':'POST')=>{
    const r=await fetch(endpoint+path,{method,headers:{...(bearer?{Authorization:`Bearer ${bearer}`}:{ }),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error'});
    const value=r.status===204?{}:await r.json();return {status:r.status,value};
  };
  const createUser=async(id=randomUUID(),withFactor=true)=>{
    const email=`${id}@example.invalid`;const result=await request('/admin/users',{id,email,password,email_confirm:true},adminToken);
    if(result.status!==200)throw new Error('SYNTHETIC_PROVISIONING_FAILED '+providerLog.replaceAll(secret,'[REDACTED]').replaceAll(password,'[REDACTED]').replaceAll(adminToken,'[REDACTED]').slice(-1600));
    const first=await request('/token?grant_type=password',{email,password});assert.equal(first.status,200,'actual password grant');
    if(!withFactor)return {id,email,password,secret:'',factorId:'',first:first.value};
    const factor=await request('/factors',{factor_type:'totp',friendly_name:'Synthetic isolated factor'},first.value.access_token);assert.equal(factor.status,200,'actual enrollment');
    const challenge=await request(`/factors/${factor.value.id}/challenge`,{},first.value.access_token);assert.equal(challenge.status,200);
    const verified=await request(`/factors/${factor.value.id}/verify`,{challenge_id:challenge.value.id,code:totp(factor.value.totp.secret)},first.value.access_token);assert.equal(verified.status,200,'actual TOTP verification');
    return {id,email,password,secret:factor.value.totp.secret as string,factorId:factor.value.id as string,first:verified.value};
  };
  return {endpoint,request,createUser,stop,start,close,mailAttempts:()=>mailAttempts,
    verifySignature:(jwt:string)=>{const [a,b,c]=jwt.split('.');return timingSafeEqual(createHmac('sha256',secret).update(`${a}.${b}`).digest(),Buffer.from(c!,'base64url'));},
    serviceToken:adminToken,
    // Adversarial fixtures only; ordinary application never receives signer.
    signAdversarial:token,
  };
}
