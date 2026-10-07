import assert from'node:assert/strict';
import type {H}from'./h4-booking-preparation-fixtures.ts';
export async function observeReality(h:H,bid:string,jobs:(()=>Promise<unknown>)[],order:number[],sessions:string[],rootKind='preparation'){
 const root=rootKind==='opportunity'?String((await h.observer`select opportunity_id::text id from crm_private.b04_bookings where booking_id=${bid}::uuid`)[0]!.id):'booking-preparation:'+bid,seed=rootKind==='opportunity'?31:0;const barrier=h.connect('crm_h0_migration');await barrier.unsafe('begin');await barrier`select pg_advisory_xact_lock(hashtextextended(${root},${seed}))`;
 const b=(await barrier`select pg_backend_pid() pid,pg_current_xact_id()::text xid,hashtextextended(${root},${seed})::text root`)[0]!;
 const pending:Promise<{ok:boolean;value?:unknown;error?:string}>[]=[];
 try{for(let i=0;i<order.length;i++){
  pending.push(jobs[order[i]!]!().then(value=>({ok:true,value}),error=>({ok:false,error:String(error)})));
  let rows:any[]=[];for(let n=0;n<250;n++){rows=await h.admin`select pid,backend_xid::text xid,usename,wait_event_type,wait_event,pg_blocking_pids(pid) blockers from pg_stat_activity where usename in('crm_h0_runtime','crm_h0_ha_tx')and wait_event_type='Lock'order by query_start`;if(rows.length>=i+1)break;await new Promise(r=>setTimeout(r,10));}
  assert.equal(rows.length,i+1,'independent units both reached real lock waits');assert.ok(rows.every(x=>x.wait_event==='advisory'),'both admitted through F2 to business roots');
  const locks=await h.admin`select pid,locktype,relation::regclass::text relation,mode,granted,classid::text,objid::text,objsubid,transactionid::text from pg_locks where pid=any(${[Number(b.pid),...rows.map(x=>Number(x.pid))]})order by pid,locktype,granted`;
  console.log('H4-023 OBSERVED',JSON.stringify({rootKind,root,seed,bookingId:bid,order,queued:i+1,barrier:b,consumers:rows.map((x,n)=>({...x,session:sessions[order[n]!]!})),locks}));
  if(i===1){assert.notEqual(rows[0]!.pid,rows[1]!.pid);assert.notEqual(rows[0]!.xid,rows[1]!.xid);}
 }
 await barrier.unsafe('rollback');return await Promise.all(pending);
 }finally{await barrier.unsafe('rollback');await Promise.allSettled(pending);await barrier.end();}
}
