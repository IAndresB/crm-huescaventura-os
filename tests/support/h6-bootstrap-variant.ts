// Experimental exception authorized by the director. No catalog writes or OID forcing.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {hash,command,pgArgs,bin,nativeEvents,snapshot,type Cluster} from './h6-015-runtime.ts';

export async function snapshotVariant(db:any,bootstrap:string){
 const value=await snapshot(db,bootstrap);
 // NULL ACL means the engine's object default, not no privileges. Compare
 // every actual grantor/grantee/privilege/option; never rewrite a role name.
 value.catalog.relations=JSON.parse(JSON.stringify(await db.unsafe(`
 select n.nspname,c.relname,c.relkind,pg_get_userbyid(c.relowner) owner,
 case when c.relkind in('r','p','v','m','f','S') and cardinality(c.relacl)=0 then '[]'::jsonb
 when c.relkind in('r','p','v','m','f','S') then
  (select jsonb_agg(v.row order by v.row::text) from
   (select jsonb_build_array(pg_get_userbyid(a.grantor),case when a.grantee=0 then '@PUBLIC' else pg_get_userbyid(a.grantee) end,a.privilege_type,a.is_grantable) row
    from aclexplode(coalesce(c.relacl,acldefault(case when c.relkind='S' then 's'::"char" else 'r'::"char" end,c.relowner))) a) v)
 else to_jsonb(c.relacl) end acl,c.relrowsecurity,c.relforcerowsecurity,c.relpersistence,c.reloptions
 from pg_class c join pg_namespace n on n.oid=c.relnamespace
 where n.nspname !~ '^pg_' and n.nspname<>'information_schema' order by 1,2`)));
 return value;
}

export function bootstrapGlobals(original:string,bootstrap:string){
 assert.match(bootstrap,/^[a-z][a-z0-9_]{0,62}$/);
 const statement='CREATE ROLE '+bootstrap+';';
 const lines=original.split('\n'),matches=lines.flatMap((line,i)=>line===statement?[i]:[]);
 assert.equal(matches.length,1,'EXACTLY_ONE_BOOTSTRAP_CREATE_REQUIRED');
 assert.equal(lines.filter(line=>line.startsWith('CREATE ROLE ')&&line.includes(bootstrap)).length,1,'BOOTSTRAP_CREATE_VARIANT');
 const line=matches[0]!,start=Buffer.byteLength(lines.slice(0,line).join('\n')+'\n');
 // All bytes before/after the one exact statement are retained. The substitute
 // asserts the initdb-created role instead of ignoring duplicate_object.
 const assertion=`DO $h6015_bootstrap$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE oid=10 AND rolname='${bootstrap}' AND rolsuper) THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='H6015_BOOTSTRAP_PRECONDITION';
 END IF;
END $h6015_bootstrap$;`;
 const before=original.slice(0,original.indexOf(statement+'\n'));
 assert.equal(Buffer.byteLength(before),start,'EXACT_STATEMENT_POSITION');
 const after=original.slice(before.length+statement.length);
 const derived=before+assertion+after;
 assert.equal(derived.replace(assertion,statement),original,'LOSSLESS_GLOBALS_SUBSTITUTION');
 return {derived,receipt:{originalSHA256:hash(original),derivedSHA256:hash(derived),bootstrap,sourceStatementSHA256:hash(statement),replacementSHA256:hash(assertion),byteRange:[start,start+Buffer.byteLength(statement)],beforeSHA256:hash(before),afterSHA256:hash(after),changedStatements:1,unchangedRemainder:true,meaning:'One CREATE ROLE fulfilled by checked initdb provisioning; all following ALTER/SET/GRANT bytes retained'}};
}

export async function globalsSnapshot(db:any){
 const roles=await db`select rolname,rolsuper,rolinherit,rolcreaterole,rolcreatedb,rolcanlogin,rolreplication,rolbypassrls,rolconnlimit,rolvaliduntil::text,rolconfig from pg_roles order by rolname`;
 const memberships=await db`select pg_get_userbyid(roleid) role,pg_get_userbyid(member) member,pg_get_userbyid(grantor) grantor,admin_option,inherit_option,set_option from pg_auth_members order by 1,2,3`;
 const parameterACL=await db`select parname,paracl::text from pg_parameter_acl order by 1`;
 const tablespaces=await db`select spcname,pg_get_userbyid(spcowner) owner,spcacl::text,spcoptions from pg_tablespace order by 1`;
 const bootstrap=await db`select oid::text,rolname from pg_roles where oid=10`;
 return JSON.parse(JSON.stringify({roles,memberships,parameterACL,tablespaces,bootstrap}));
}

export async function restoreBootstrapGlobals(c:Cluster,file:string,source:any,privateRoot:string,kind:string){
 const db=c.connect(c.maintenance),pre=await globalsSnapshot(db);
 assert.deepEqual(pre.bootstrap,source.bootstrap,'SOURCE_DEST_BOOTSTRAP_IDENTITY');
 assert.deepEqual(pre.roles.filter((r:any)=>!r.rolname.startsWith('pg_')).map((r:any)=>r.rolname),[c.bootstrap]);
 const bytes=await readFile(file,'utf8'),variant=bootstrapGlobals(bytes,c.bootstrap);
 const derived=join(privateRoot,kind+'-globals-bootstrap-variant.sql');
 await writeFile(derived,variant.derived,{flag:'wx',mode:0o600});
 const started=performance.now(),loaded=spawnSync(join(bin,'psql'),['-X',...pgArgs(c),'--dbname='+c.maintenance,'--set=ON_ERROR_STOP=1','--set=VERBOSITY=verbose','--single-transaction','--file='+derived],{encoding:'utf8',env:{PATH:process.env.PATH,LC_ALL:'C',NODE_ENV:'test'}});
 nativeEvents.push({command:'psql-bootstrap-globals',status:loaded.status,elapsedMs:performance.now()-started});
 if(loaded.status!==0){const state=loaded.stderr.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1]??'UNKNOWN';throw Object.assign(new Error('BOOTSTRAP_GLOBALS_REJECTED'),{code:state});}
 assert.deepEqual(await globalsSnapshot(db),source,'GLOBALS_EXACT_WITHOUT_ADDED_ROLE');
 assert.equal(hash(await readFile(file)),variant.receipt.originalSHA256);
 return {...variant.receipt,bootstrapOID:'10',fullGlobalsEquality:true,additionalRoles:0,additionalMemberships:0};
}

export async function effectivePrivileges(db:any){
 const roles=await db`select r.rolname role,g.rolname target,pg_has_role(r.oid,g.oid,'MEMBER') member,pg_has_role(r.oid,g.oid,'USAGE') usage,pg_has_role(r.oid,g.oid,'SET') as can_set from pg_roles r cross join pg_roles g where r.rolname !~ '^pg_' and g.rolname !~ '^pg_' order by 1,2`;
 const schemas=await db`select r.rolname role,n.nspname schema,has_schema_privilege(r.oid,n.oid,'USAGE') usage,has_schema_privilege(r.oid,n.oid,'CREATE') as can_create from pg_roles r cross join pg_namespace n where r.rolname !~ '^pg_' and n.nspname !~ '^pg_' and n.nspname<>'information_schema' order by 1,2`;
 const tables=await db`select r.rolname role,n.nspname schema,c.relname as relation_name,p.privilege,has_table_privilege(r.oid,c.oid,p.privilege) allowed from pg_roles r cross join pg_class c join pg_namespace n on n.oid=c.relnamespace cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p(privilege) where r.rolname !~ '^pg_' and n.nspname !~ '^pg_' and n.nspname<>'information_schema' and c.relkind in('r','p','v','m','f') order by 1,2,3,4`;
 const functions=await db`select r.rolname role,p.oid::regprocedure::text as routine_identity,has_function_privilege(r.oid,p.oid,'EXECUTE') allowed from pg_roles r cross join pg_proc p join pg_namespace n on n.oid=p.pronamespace where r.rolname !~ '^pg_' and n.nspname !~ '^pg_' and n.nspname<>'information_schema' order by 1,2`;
 const sequences=await db`select r.rolname role,n.nspname schema,c.relname as sequence_name,p.privilege,has_sequence_privilege(r.oid,c.oid,p.privilege) allowed from pg_roles r cross join pg_class c join pg_namespace n on n.oid=c.relnamespace cross join unnest(array['SELECT','UPDATE','USAGE']) p(privilege) where r.rolname !~ '^pg_' and n.nspname !~ '^pg_' and n.nspname<>'information_schema' and c.relkind='S' order by 1,2,3,4`;
 return JSON.parse(JSON.stringify({roles,schemas,tables,functions,sequences}));
}
