// Retain F's exact provenance fixtures; adapt only the protected cancellation import.
import './h5-017-f-hook-v2.mjs';
import {registerHooks} from 'node:module';
const original=new URL('./h4-cancellation-fixtures.ts',import.meta.url).href;
const replacement=new URL('./h5-017-g-cancellation.ts',import.meta.url).href;
const preservedParents=new Set([
 new URL('./h5-017-g-cancellation.ts',import.meta.url).href,
 new URL('../integration/postgres-h5-018-fifth-chronology.test.ts',import.meta.url).href,
 new URL('../integration/postgres-h5-017-g-temporal.test.ts',import.meta.url).href,
]);
registerHooks({resolve(specifier,context,nextResolve){
 const result=nextResolve(specifier,context);
 if(result.url===original&&!preservedParents.has(context.parentURL))return nextResolve(replacement,context);
 return result;
}});
