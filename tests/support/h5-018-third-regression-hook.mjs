import {registerHooks} from 'node:module';
const parents=new Set(['postgres-h5-018-audit.test.ts','postgres-h5-018-causes.test.ts'].map(n=>new URL('../integration/'+n,import.meta.url).href));
const replacement=new URL('./h5-018-third-regression-fixture.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){
 if(parents.has(context.parentURL)&&specifier==='../support/h5-018-audit-isolated.ts')return nextResolve(replacement,context);
 return nextResolve(specifier,context);
}});
