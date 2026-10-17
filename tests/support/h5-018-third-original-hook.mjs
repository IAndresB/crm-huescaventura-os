import {registerHooks} from 'node:module';
const parent=new URL('../integration/postgres-h5-018-second-correlation.test.ts',import.meta.url).href;
const replacement=new URL('./h5-018-third-isolated.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){
 if(context.parentURL===parent&&specifier==='../support/h5-diagnostic-corrected-isolated.ts')return nextResolve(replacement,context);
 return nextResolve(specifier,context);
}});
