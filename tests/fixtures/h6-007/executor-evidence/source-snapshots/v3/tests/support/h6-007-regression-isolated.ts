// Compatibility is confined to bootstrap: execute historical assertions unchanged
// against the published 68 migrations, with fresh databases and dynamic ports.
import {database,unusedPort,read,write} from './h6-007-fixtures.ts';
import {isolatedClosures as historicalClosures} from './h5-closure-isolated.ts';
export {read,write};
export {closureMigration} from './h5-closure-isolated.ts';
export async function isolatedClosures(label:string,_port:number,previous=false){
 if(previous)return historicalClosures('h6007_prior_'+label+'_'+process.pid,await unusedPort(),true);
 return database('h6007_reg_'+label+'_'+process.pid);
}
export const isolatedJointClosures=isolatedClosures;
