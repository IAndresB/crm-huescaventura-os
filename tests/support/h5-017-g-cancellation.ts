import {cancellationFixture as historical} from './h4-cancellation-fixtures.ts';
import {cancellationFixture as corrected} from './h5-017-g-cancellation-fixtures.ts';
export * from './h5-017-g-cancellation-fixtures.ts';

// Optional read-only diagnosis. Never changes a command or an adapter result.
export async function cancellationFixture(...args:Parameters<typeof historical>){
 const f=await(process.env.H5017G_FIXTURE==='original'?historical:corrected)(...args);
 if(process.env.H5017G_TRACE==='1'){
  const run=f.run,h=args[0];
  f.run=async q=>{
   const rows=await h.observer`select occurred_at from crm_private.b07_records where record_id=${q.evidenceId}::uuid`;
   const common={mode:process.env.H5017G_FIXTURE??'corrected',bookingId:q.bookingId,determinationId:q.determinationId,operationId:q.operationId,action:q.action,at:q.at,evidenceAt:rows[0]?.occurred_at??null};
   try{const value=await run(q);console.log('G cancellation trace '+JSON.stringify({...common,status:'fulfilled',replayed:value.replayed}));return value;}
   catch(error){console.log('G cancellation trace '+JSON.stringify({...common,status:'rejected',error:String(error)}));throw error;}
  };
 }
 return f;
}
