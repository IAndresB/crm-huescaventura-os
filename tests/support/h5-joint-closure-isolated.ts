import {readFile} from 'node:fs/promises';
import {isolatedClosures,read,write} from './h5-closure-isolated.ts';
export {read,write};
export const jointMigration='20261015233307_h5_joint_closure_reopening.sql';
export async function isolatedJointClosures(label:string,port:number,previous=false){
 const h=await isolatedClosures(label,port);
 try{if(!previous)await h.migration.unsafe(await readFile('supabase/migrations/'+jointMigration,'utf8'));}
 catch(e){await h.close();throw e;}
 return h;
}
