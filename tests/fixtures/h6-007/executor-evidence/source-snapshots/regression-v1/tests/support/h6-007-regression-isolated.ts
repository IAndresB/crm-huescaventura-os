// Compatibility is confined to bootstrap: execute historical assertions unchanged
// against the published 68 migrations, with fresh databases and dynamic ports.
import assert from 'node:assert/strict';
import {database,read,write} from './h6-007-fixtures.ts';
export {read,write};
export {closureMigration} from './h5-closure-isolated.ts';
export async function isolatedClosures(label:string,_port:number,previous=false){assert.equal(previous,false,'Upgrade/downgrade is outside this directed regression');return database('h6007_reg_'+label+'_'+process.pid);}
export const isolatedJointClosures=isolatedClosures;
