import {registerHooks} from 'node:module';
const wrapper=new URL('./oracle-wrapper.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){
 if(specifier.endsWith('/h6-013-preservation.ts'))return {url:wrapper,shortCircuit:true};
 return nextResolve(specifier,context);
}});
