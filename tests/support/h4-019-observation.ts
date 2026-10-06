import assert from 'node:assert/strict';
import type postgres from 'postgres';
const pause=(ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function observeFunds(h:{connect:(role:string)=>postgres.Sql;admin:postgres.Sql},paymentId:string,jobs:(()=>Promise<any>)[],order:number[],sessions:string[],original=false){
 const block=h.connect('crm_h0_migration');await block.unsafe('begin');
 await block`select pg_advisory_xact_lock(hashtextextended(${'payment-root:'+paymentId},0))`;
 const barrier=(await block`select pg_backend_pid() pid,pg_current_xact_id()::text xid,hashtextextended(${'payment-root:'+paymentId},0)::text key`)[0]!;
 const pending:Promise<any>[]=[];let reached:any[]=[];
 try{
  for(let i=0;i<order.length;i++){
   pending.push(jobs[order[i]!]!().then(value=>({ok:true,value}),error=>({ok:false,error:String(error)})));
   for(let n=0;n<250;n++){
    reached=await h.admin`select pid,backend_xid::text xid,usename,wait_event_type,wait_event,pg_blocking_pids(pid) blockers,query from pg_stat_activity where usename in('crm_h0_runtime','crm_h0_ha_tx') and wait_event_type='Lock' order by query_start`;
    if(reached.length>=i+1)break;await pause(10);
   }
   assert.equal(reached.length,i+1,'each ordinary unit reached an observed lock wait');
   const locks=await h.admin`select pid,locktype,relation::regclass::text relation,mode,granted,classid::text,objid::text,objsubid,transactionid::text,page,tuple from pg_locks where pid=any(${[Number(barrier.pid),...reached.map(x=>Number(x.pid))]}) order by pid,locktype,granted`;
   console.log('F06 OBSERVED',JSON.stringify({paymentId,barrier,order,queued:i+1,consumers:reached.map((x,n)=>({...x,session:sessions[order[n]!]!,frontier:x.wait_event==='advisory'?'business advisory after F2':'authority/row coordination: not economic proof'})),locks}));
   assert.ok(reached[0]!.blockers.includes(Number(barrier.pid)),'first waits on actual payment-root barrier');
   if(i===1){
    assert.notEqual(reached[0]!.pid,reached[1]!.pid);assert.notEqual(reached[0]!.xid,reached[1]!.xid);
    if(original){assert.equal(reached[1]!.wait_event,'transactionid','original F06 second session waits for actor transaction');console.log('F06 ORIGINAL LIMITATION REPRODUCED: no overconsumption claimed');}
    else assert.ok(reached.every(x=>x.wait_event==='advisory'),'both sessions must progress past F2 to business advisory roots');
   }
  }
  await block.unsafe('rollback');return await Promise.all(pending);
 }finally{await block.unsafe('rollback');await Promise.allSettled(pending);await block.end();}
}
