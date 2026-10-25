// H6-016 cross-unit witnesses. Test-only gates; application effects use existing adapters.
import assert from 'node:assert/strict';
import {actor,capture,type Actor,type H} from './h6-016-integrated.ts';
import {waitFor} from './h6-016-foundation.ts';
export async function overlap(h:H,id:string,root:string,seed:number,actions:((a:Actor)=>Promise<any>)[],order:0|1){
 const a=await actor(h),b=await actor(h),guard=h.connect('crm_h0_migration'),monitor=h.connect('h2_bootstrap');
 let release!:()=>void,entered!:()=>void;const ready=new Promise<void>(r=>entered=r),unlock=new Promise<void>(r=>release=r);
 const held=guard.begin(async(tx:any)=>{await tx`select pg_advisory_xact_lock(hashtextextended(${root},${seed}))`;entered();await unlock;});await ready;
 const jobs:Promise<any>[]=[];let failure:any,locks:any;
 const count=async()=>Number((await monitor`select count(*)::int n from pg_stat_activity where datname=current_database()and usename='crm_h0_runtime'and wait_event_type='Lock'`)[0]!.n);
 try{for(const [i,which]of(order?[1,0]:[0,1]).entries()){jobs.push(actions[which]!(i?b:a));jobs[i]!.catch(()=>{});await waitFor(async()=>await count()>=i+1);}locks=await monitor`select pid,wait_event,pg_blocking_pids(pid)blockers from pg_stat_activity where datname=current_database()and wait_event_type='Lock' order by pid`;}
 catch(e){failure=e;}finally{release();await held;}
 const results=await Promise.allSettled(jobs);await Promise.all([a.close(),b.close(),guard.end({timeout:1}),monitor.end({timeout:1})]);
 await capture(id,{order,locks,results:results.map(r=>r.status==='fulfilled'?{status:r.status,result:r.value}:{status:r.status,error:String(r.reason)})});if(failure)throw failure;
 assert.equal(results.length,2);assert.ok(locks.length>=2);return order?[results[1]!,results[0]!]:results;
}
export function conflict(r:PromiseSettledResult<any>,pattern=/CONFLICT|REVISION|VERSION/){assert.equal(r.status,'rejected');assert.match(String((r as PromiseRejectedResult).reason),pattern);}
