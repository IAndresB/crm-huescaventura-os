// Local recovery instrumentation. Never prints SQL, tokens, dumps or provider logs.
import assert from 'node:assert/strict';
import {spawn,spawnSync,type ChildProcess} from 'node:child_process';
import {randomBytes,randomUUID,createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {mkdir,mkdtemp,writeFile,readFile,readdir,stat,cp,chmod} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {once} from 'node:events';
import postgres from 'postgres';
import {dataSnapshot,type PriorTable} from './h6-013-preservation.ts';
import {totp} from './h6-auth-provider-isolated.ts';
export const bin='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin';
export const storageSource='/tmp/crm-h6-local-0ca8f751d141/crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e';
export const hash=(b:Uint8Array|string)=>createHash('sha256').update(b).digest('hex');
export const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export const nativeEvents:any[]=[];
export function command(name:string,args:string[],extra:Record<string,string>={}){
 const start=performance.now(),r=spawnSync(join(bin,name),args,{encoding:'utf8',maxBuffer:64*1024*1024,env:{PATH:process.env.PATH,LANG:'C',LC_ALL:'C',NODE_ENV:'test',...extra}});
 nativeEvents.push({command:name,status:r.status,signal:r.signal,elapsedMs:performance.now()-start});
 if(r.status!==0){const e=new Error('NATIVE_'+name+'_FAILED');Object.assign(e,{nativeStatus:r.status});throw e;}
 return r.stdout;
}
export type Cluster={dir:string;socket:string;port:number;bootstrap:string;maintenance:string;connect:(db:string,user?:string)=>postgres.Sql;close:()=>Promise<void>};
export async function cluster(parent:string,label:string,bootstrap:string,port:number):Promise<Cluster>{
 const dir=await mkdtemp(join(parent,label+'-')),socket=join(dir,'socket');await mkdir(socket,{mode:0o700});
 command('initdb',['-D',join(dir,'data'),'--username='+bootstrap,'--auth=trust','--locale-provider=libc','--no-locale','--encoding=UTF8']);
 command('pg_ctl',['-D',join(dir,'data'),'-l','/dev/null','-o',`-k '${socket}' -h '' -p ${port}`,'-w','start']);
 const clients:postgres.Sql[]=[];
 const connect=(database:string,user=bootstrap)=>{const sql=postgres({host:socket,port,database,user,max:1,prepare:false,onnotice:()=>{}});clients.push(sql);return sql;};
 return {dir,socket,port,bootstrap,maintenance:'postgres',connect,close:async()=>{await Promise.allSettled(clients.map(x=>x.end({timeout:1})));command('pg_ctl',['-D',join(dir,'data'),'-m','fast','-w','stop']);}};
}
export const pgArgs=(c:Pick<Cluster,'socket'|'port'|'bootstrap'>)=>['--host='+c.socket,'--port='+c.port,'--username='+c.bootstrap,'--no-password'];
export async function filesInventory(root:string,prefix=''):Promise<any[]>{
 let rows:any[]=[];for(const d of (await readdir(join(root,prefix),{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const rel=join(prefix,d.name);if(d.isDirectory())rows.push(...await filesInventory(root,rel));else{assert.ok(d.isFile(),'NO_SYMLINK');const p=join(root,rel),s=await stat(p);rows.push({path:rel,bytes:s.size,sha256:hash(await readFile(p))});}}return rows;
}
const ns="n.nspname !~ '^pg_' and n.nspname<>'information_schema'";
export async function snapshot(db:postgres.Sql,bootstrap:string){
 const tables=await db.unsafe<PriorTable[]>(`select n.nspname schema,c.relname name,array_agg(a.attname order by a.attnum) columns from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum>0 and not a.attisdropped where ${ns} and c.relkind='r' group by 1,2 order by 1,2`);
 const data=await dataSnapshot(db,tables);
 const schemas=await db.unsafe(`select n.nspname,pg_get_userbyid(n.nspowner) owner,n.nspacl::text acl from pg_namespace n where ${ns} order by 1`);
 const relations=await db.unsafe(`select n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner) owner,c.relacl::text acl,c.relrowsecurity,c.relforcerowsecurity,c.relpersistence,c.reloptions from pg_class c join pg_namespace n on n.oid=c.relnamespace where ${ns} order by 1,2`);
 const columns=await db.unsafe(`select n.nspname,c.relname,row_number() over(partition by c.oid order by a.attnum)::int ordinal,a.attname,format_type(a.atttypid,a.atttypmod) type,a.attnotnull,a.attidentity,a.attgenerated,pg_get_expr(d.adbin,d.adrelid) default_expr,a.attacl::text acl,co.collname from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum left join pg_collation co on co.oid=a.attcollation where ${ns} and a.attnum>0 and not a.attisdropped order by 1,2,3`);
 const constraints=await db.unsafe(`select n.nspname,c.conrelid::regclass::text relation,c.conname,c.contype,c.convalidated,c.condeferrable,c.condeferred,pg_get_constraintdef(c.oid) definition from pg_constraint c join pg_namespace n on n.oid=c.connamespace where ${ns} order by 1,2,3`);
 const indexes=await db.unsafe(`select n.nspname,c.relname,pg_get_indexdef(i.indexrelid) definition,i.indisvalid,i.indisready from pg_index i join pg_class c on c.oid=i.indexrelid join pg_namespace n on n.oid=c.relnamespace where ${ns} order by 1,2`);
 const triggerRows=await db.unsafe(`select n.nspname,c.relname,t.tgname,t.tgenabled,t.tgisinternal,t.tgtype,t.tgdeferrable,t.tginitdeferred,t.tgfoid::regproc::text function,con.conname constraint_name,con.contype constraint_type,pg_get_triggerdef(t.oid) definition from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace left join pg_constraint con on con.oid=t.tgconstraint where ${ns} order by 1,2,3`);
 // A logical dump recreates internal FK trigger OIDs/names and removes physical
 // holes left by dropped columns. Normalize only those physical identifiers;
 // preserve FK identity, full definition, function, timing, event and enabled.
 const triggers=triggerRows.map(t=>{if(t.tgisinternal&&t.constraint_type==='f'&&/^RI_ConstraintTrigger_[ac]_[0-9]+$/.test(t.tgname as string)){
   const name=t.tgname as string;t.tgname='@internal-fk:'+t.constraint_name+':'+t.function+':'+t.tgtype;
   const prefix='CREATE CONSTRAINT TRIGGER "'+name+'" ';assert.ok(String(t.definition).startsWith(prefix),'INTERNAL_TRIGGER_SHAPE');t.definition=String(t.definition).replace(prefix,'CREATE CONSTRAINT TRIGGER "@internal-fk" ');
  }return t;}).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 const policies=await db.unsafe(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname !~ '^pg_' order by 1,2,3`);
 const functions=await db.unsafe(`select n.nspname,p.oid::regprocedure::text identity,pg_get_userbyid(p.proowner) owner,p.proacl::text acl,l.lanname language,p.prosecdef,p.proconfig,p.provolatile,p.proleakproof,p.proparallel,md5(pg_get_functiondef(p.oid)) definition_hash,exists(select 1 from pg_depend d join pg_extension e on e.oid=d.refobjid where d.objid=p.oid and d.classid='pg_proc'::regclass and d.deptype='e' and e.extname='pgcrypto') crypto_member from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_language l on l.oid=p.prolang where ${ns} and p.prokind<>'a' order by 1,2`);
 for(const f of functions)if(f.crypto_member){assert.equal(f.language,'c');assert.equal(f.prosecdef,false);assert.equal(f.acl,null);assert.equal(f.owner,bootstrap);f.owner='@verified-bootstrap-oid10-pgcrypto-c-default';}
 const extensions=await db.unsafe(`select e.extname,e.extversion,n.nspname,pg_get_userbyid(e.extowner) owner from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname<>'plpgsql' order by 1`);
 const sequences:any[]=[];for(const r of relations.filter(x=>x.relkind==='S')){const ident='"'+r.nspname+'"."'+r.relname+'"';sequences.push({identity:ident,rows:[...await db.unsafe('select last_value::text,is_called from '+ident)]});}
 const memberships=await db.unsafe(`select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members where pg_get_userbyid(member)!~'^pg_' order by 1,2,3`);
 const roles=await db.unsafe(`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolconfig from pg_roles where rolname !~ '^pg_' order by 1`);
 const defaults=await db.unsafe(`select pg_get_userbyid(d.defaclrole) role,n.nspname,d.defaclobjtype,d.defaclacl::text acl from pg_default_acl d left join pg_namespace n on n.oid=d.defaclnamespace order by 1,2,3`);
 const database=await db.unsafe(`select d.datname,pg_get_userbyid(d.datdba) owner,d.datacl::text acl,pg_encoding_to_char(d.encoding) encoding,d.datlocprovider,d.datcollate,d.datctype from pg_database d where d.datname=current_database()`);
 const settings=await db.unsafe(`select coalesce(d.datname,'@ALL') database,coalesce(r.rolname,'@ALL') role,s.setconfig from pg_db_role_setting s left join pg_database d on d.oid=s.setdatabase left join pg_roles r on r.oid=s.setrole where s.setdatabase in(0,(select oid from pg_database where datname=current_database())) order by 1,2`);
 return {data,catalog:JSON.parse(JSON.stringify({schemas,relations,columns,constraints,indexes,triggers,policies,functions,extensions,sequences,memberships,roles,defaults,database,settings}))};
}
export function compareSnapshot(source:any,dest:any,extraBootstrap?:string){
 const d=structuredClone(dest);if(extraBootstrap){const extra=d.catalog.roles.filter((x:any)=>x.rolname===extraBootstrap);assert.equal(extra.length,1);d.catalog.roles=d.catalog.roles.filter((x:any)=>x.rolname!==extraBootstrap);}
 assert.deepEqual(d,source,'RESTORED_SNAPSHOT_MISMATCH');
}
export async function stopChild(child?:ChildProcess){if(child&&child.exitCode===null){const done=once(child,'exit');child.kill('SIGTERM');await Promise.race([done,sleep(3000)]);if(child.exitCode===null){child.kill('SIGKILL');await done;}}}
export async function providerProcess(commandPath:string,args:string[],cwd:string,env:Record<string,string>,health:string){
 const child=spawn(commandPath,args,{cwd,env:{...env,NODE_ENV:'test'},stdio:'ignore'});for(let i=0;i<120;i++){if(child.exitCode!==null)throw new Error('PROVIDER_START_FAILED_'+child.exitCode);try{if((await fetch(health)).ok)return child;}catch{}await sleep(100);}await stopChild(child);throw new Error('PROVIDER_START_TIMEOUT');
}
export function jwtSigner(secret:string,issuer:string){return(claims:Record<string,unknown>)=>{const a=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),b=Buffer.from(JSON.stringify({aud:'authenticated',iss:issuer,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,...claims})).toString('base64url');return a+'.'+b+'.'+createHmac('sha256',secret).update(a+'.'+b).digest('base64url');};}
export async function authService(c:Pick<Cluster,'socket'|'port'>,secret:string,port:number,issuer:string,password:string){
 const endpoint='http://127.0.0.1:'+port,token=jwtSigner(secret,issuer),serviceToken=token({role:'service_role'});
 const env:Record<string,string>={PATH:process.env.PATH!,TMPDIR:process.env.TMPDIR??'/tmp',LANG:'C',GOTRUE_DB_DRIVER:'postgres',DB_NAMESPACE:'auth',DATABASE_URL:`postgres://h6015_auth@localhost:${c.port}/crm_h6015_auth?sslmode=disable&host=${encodeURIComponent(c.socket)}`,
 GOTRUE_API_HOST:'127.0.0.1',PORT:String(port),API_EXTERNAL_URL:issuer,GOTRUE_SITE_URL:issuer,GOTRUE_JWT_SECRET:secret,GOTRUE_JWT_ISSUER:issuer,GOTRUE_JWT_AUD:'authenticated',GOTRUE_JWT_EXP:'3600',GOTRUE_JWT_DEFAULT_GROUP_NAME:'authenticated',GOTRUE_JWT_ADMIN_ROLES:'service_role',GOTRUE_DISABLE_SIGNUP:'true',GOTRUE_EXTERNAL_EMAIL_ENABLED:'true',GOTRUE_MAILER_AUTOCONFIRM:'false',GOTRUE_SMTP_HOST:'127.0.0.1',GOTRUE_SMTP_PORT:'59799',GOTRUE_SMTP_ADMIN_EMAIL:'local@example.invalid',GOTRUE_EXTERNAL_PHONE_ENABLED:'false',GOTRUE_SMS_AUTOCONFIRM:'false',GOTRUE_MFA_PHONE_ENROLL_ENABLED:'false',GOTRUE_MFA_PHONE_VERIFY_ENABLED:'false',GOTRUE_MFA_TOTP_ENROLL_ENABLED:'true',GOTRUE_MFA_TOTP_VERIFY_ENABLED:'true',GOTRUE_MFA_WEB_AUTHN_ENROLL_ENABLED:'false',GOTRUE_MFA_WEB_AUTHN_VERIFY_ENABLED:'false',GOTRUE_MFA_RATE_LIMIT_CHALLENGE_AND_VERIFY:'10000',GOTRUE_RATE_LIMIT_TOKEN_REFRESH:'10000',GOTRUE_RATE_LIMIT_VERIFY:'10000',GOTRUE_INDEX_WORKER_ENSURE_USER_SEARCH_INDEXES_EXIST:'false',GOTRUE_INDEX_WORKER_MAX_USERS_THRESHOLD:'0',GOTRUE_LOG_LEVEL:'error',HTTP_PROXY:'http://127.0.0.1:59799',HTTPS_PROXY:'http://127.0.0.1:59799',NO_PROXY:'127.0.0.1,localhost'};
 let child:ChildProcess|undefined;
 const request=async(path:string,body?:unknown,bearer?:string,method=body===undefined?'GET':'POST')=>{const r=await fetch(endpoint+path,{method,headers:{'Content-Type':'application/json',...(bearer?{Authorization:'Bearer '+bearer}:{})},...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'error'});return {status:r.status,value:r.status===204?{}:await r.json()};};
 return {endpoint,issuer,env,serviceToken,request,
 migrate:()=>{const r=spawnSync('/tmp/crm-h6-auth-tools/binary/auth',['migrate'],{cwd:'/tmp/crm-h6-auth-tools/binary',env:{...env,NODE_ENV:'test'},stdio:'ignore'});assert.equal(r.status,0,'AUTH_MIGRATE_FAILED');},
 start:async()=>{child=await providerProcess('/tmp/crm-h6-auth-tools/binary/auth',['serve'],'/tmp/crm-h6-auth-tools/binary',env,endpoint+'/health');},stop:()=>stopChild(child),
 createUser:async(id:string)=>{const email=id+'@example.invalid';assert.equal((await request('/admin/users',{id,email,password,email_confirm:true},serviceToken)).status,200);const first=await request('/token?grant_type=password',{email,password});assert.equal(first.status,200);const f=await request('/factors',{factor_type:'totp',friendly_name:'Synthetic H6015'},first.value.access_token);assert.equal(f.status,200);const ch=await request(`/factors/${f.value.id}/challenge`,{},first.value.access_token);assert.equal(ch.status,200);const v=await request(`/factors/${f.value.id}/verify`,{challenge_id:ch.value.id,code:totp(f.value.totp.secret)},first.value.access_token);assert.equal(v.status,200);return {id,email,password,secret:f.value.totp.secret as string};},
 verifySignature:(jwt:string)=>{const [a,b,c]=jwt.split('.');return timingSafeEqual(createHmac('sha256',secret).update(a+'.'+b).digest(),Buffer.from(c!,'base64url'));}};
}
export async function storageService(c:Cluster,secret:string,port:number,objects:string,encryptionKey:string){
 await mkdir(objects,{recursive:true,mode:0o700});
 const env:Record<string,string>={PATH:process.env.PATH!,TMPDIR:process.env.TMPDIR??'/tmp',LANG:'C',NODE_ENV:'production',H6015_STORAGE_SOURCE:storageSource,SERVER_HOST:'127.0.0.1',SERVER_PORT:String(port),SERVER_ADMIN_PORT:String(port+100),DATABASE_URL:`postgresql://postgres@localhost:${c.port}/postgres?host=${encodeURIComponent(c.socket)}`,DB_INSTALL_ROLES:'true',AUTH_JWT_SECRET:secret,AUTH_ENCRYPTION_KEY:encryptionKey,STORAGE_BACKEND:'file',STORAGE_FILE_BACKEND_PATH:objects,STORAGE_S3_BUCKET:'synthetic-private',STORAGE_S3_REGION:'local',SERVER_REGION:'local',PG_QUEUE_ENABLE:'false',S3_PROTOCOL_ENABLED:'false',VECTOR_ENABLED:'false',ICEBERG_ENABLED:'false',IMAGE_TRANSFORMATION_ENABLED:'false',LOG_LEVEL:'silent'};
 const launcher=resolve('tests/support/h6-015-storage.cjs'),endpoint='http://127.0.0.1:'+port;let child:ChildProcess|undefined;
 return {env,endpoint,objects,migrate:()=>{const r=spawnSync(process.execPath,[launcher,'migrate'],{cwd:storageSource,env:{...env,NODE_ENV:'production'},stdio:'ignore'});assert.equal(r.status,0,'STORAGE_MIGRATE_FAILED');},start:async()=>{child=await providerProcess(process.execPath,[launcher,'serve'],storageSource,env,endpoint+'/status');},stop:()=>stopChild(child)};
}
