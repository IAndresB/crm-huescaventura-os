import {readFile,readdir} from 'node:fs/promises';
import {isolatedBoundaries,read,write} from './h5-boundary-isolated.ts';
import {H5013ClosureAdapter} from '../../src/infrastructure/postgres/h5-closure-adapter.ts';
export {read,write};
export const closureMigration='20261015204955_h5_booking_closure_assessments.sql';
export async function isolatedClosures(label:string,port:number,previous=false){
 const h=await isolatedBoundaries(label,port);
 try{for(const n of (await readdir('supabase/migrations')).filter(x=>x>='20261014003559'&&x<=closureMigration&&x.endsWith('.sql')&&(!previous||x!==closureMigration)).sort())await h.migration.unsafe(await readFile('supabase/migrations/'+n,'utf8'));}
 catch(e){await h.close();throw e;}
 return {...h,closures:new H5013ClosureAdapter({begin:async(options:any,work:any)=>h.runtime.begin(options,async(tx:any)=>work(new Proxy(tx,{get(target,key){const v=target[key];if(key!=='unsafe')return typeof v==='function'?v.bind(target):v;return async(...args:any[])=>{try{return await v.apply(target,args);}catch(e:any){console.log('H5013 SQL diagnostic',{message:e.message,where:e.where});throw e;}};}})))} as typeof h.runtime,h.f1,h.f2)};
}
