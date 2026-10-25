// Public development tool only. No Supabase project, credentials or deployment.
import {mkdir,readFile,writeFile,chmod,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root='/private/tmp/crm-h6017-audit-auth-tools',archive=root+'/auth.tar.gz',binary=root+'/binary/auth';
const archiveHash='3fb7998e7061e2c14f3f9555b1d94d447358c965395728e0d81eac82e0e5868b';
const binaryHash='54a5afe7997bd16ab5244ab12c02905048b270a8f76eebf95739a6d364ffe01f';
const hash=b=>createHash('sha256').update(b).digest('hex');
if(process.platform!=='darwin'||process.arch!=='arm64')throw new Error('PINNED_LOCAL_PLATFORM_REQUIRED');
await mkdir(root,{recursive:true,mode:0o700});await mkdir(root+'/binary',{recursive:true,mode:0o700});
let exists=true;try{await access(archive);}catch{exists=false;}
if(!exists){
 const r=await fetch('https://github.com/supabase/auth/releases/download/v2.197.0/auth-v2.197.0-darwin-arm64.tar.gz');
 if(!r.ok)throw new Error('PUBLIC_AUTH_DOWNLOAD_FAILED');const bytes=Buffer.from(await r.arrayBuffer());
 if(hash(bytes)!==archiveHash)throw new Error('PUBLIC_AUTH_DIGEST_MISMATCH');await writeFile(archive,bytes,{flag:'wx',mode:0o600});
}
if(hash(await readFile(archive))!==archiveHash)throw new Error('AUTH_CACHE_ARCHIVE_MISMATCH_PRESERVED');
exists=true;try{await access(binary);}catch{exists=false;}
if(!exists){
 // Extract exactly one regular executable to memory; no archive path/symlink writes.
 const extracted=spawnSync('/usr/bin/tar',['-xOf',archive,'auth'],{maxBuffer:128*1024*1024});
 if(extracted.status!==0||hash(extracted.stdout)!==binaryHash)throw new Error('AUTH_BINARY_DIGEST_MISMATCH');
 await writeFile(binary,extracted.stdout,{flag:'wx',mode:0o700});await chmod(binary,0o700);
}
if(hash(await readFile(binary))!==binaryHash)throw new Error('AUTH_CACHE_BINARY_MISMATCH_PRESERVED');
console.log(JSON.stringify({version:'v2.197.0',archiveSha256:archiveHash,binarySha256:binaryHash,verified:true}));
