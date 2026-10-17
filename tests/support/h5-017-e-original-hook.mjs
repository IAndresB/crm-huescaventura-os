import {registerHooks} from 'node:module';
const parents={"postgres-h5-018-third-temporal.test.ts": "../support/h5-018-third-isolated.ts", "postgres-h5-018-third-parent-context.test.ts": "../support/h5-018-third-isolated.ts", "postgres-h5-018-second-correlation.test.ts": "../support/h5-diagnostic-corrected-isolated.ts", "postgres-h5-018-audit.test.ts": "../support/h5-018-audit-isolated.ts", "postgres-h5-018-causes.test.ts": "../support/h5-018-audit-isolated.ts"};
const targets=new Map(Object.entries(parents).map(([name,specifier])=>[new URL('../integration/'+name,import.meta.url).href,specifier]));
const replacement=new URL('./h5-diagnostic-e-isolated.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){if(targets.get(context.parentURL)===specifier)return nextResolve(replacement,context);return nextResolve(specifier,context);}});
