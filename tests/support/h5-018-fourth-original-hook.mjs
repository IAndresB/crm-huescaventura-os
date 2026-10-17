import {registerHooks} from 'node:module';
const mapping={
 'postgres-h5-018-third-temporal.test.ts':'../support/h5-018-third-isolated.ts',
 'postgres-h5-018-third-parent-context.test.ts':'../support/h5-018-third-isolated.ts',
 'postgres-h5-018-second-correlation.test.ts':'../support/h5-diagnostic-corrected-isolated.ts',
 'postgres-h5-018-audit.test.ts':'../support/h5-018-audit-isolated.ts',
 'postgres-h5-018-causes.test.ts':'../support/h5-018-audit-isolated.ts',
 'postgres-h5-017-e-owner-collision.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-current-evidence.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-observation-access.test.ts':'../support/h5-diagnostic-e-isolated.ts',
};
const parents=new Map(Object.entries(mapping).map(([file,specifier])=>[new URL('../integration/'+file,import.meta.url).href,specifier]));
const replacement=new URL('./h5-018-fourth-original-isolated.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){if(parents.get(context.parentURL)===specifier)return nextResolve(replacement,context);return nextResolve(specifier,context);}});
