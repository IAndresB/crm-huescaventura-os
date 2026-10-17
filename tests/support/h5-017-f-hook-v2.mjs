// Exact parent/specifier pairs only. Protected test source and assertions remain
// byte-identical. Historical migration tests keep their pinned fixtures.
import {registerHooks} from 'node:module';
const mapping={
 'postgres-h5-018-fourth-history.test.ts':'../support/h5-018-fourth-isolated.ts',
 'postgres-h5-018-fourth-permissions.test.ts':'../support/h5-018-fourth-isolated.ts',
 'postgres-h5-018-fourth-identity.test.ts':'../support/h5-018-fourth-isolated.ts',
 'postgres-h5-018-fourth-replay-controls.test.ts':'../support/h5-018-fourth-isolated.ts',
 'postgres-h5-018-third-temporal.test.ts':'../support/h5-018-third-isolated.ts',
 'postgres-h5-018-third-parent-context.test.ts':'../support/h5-018-third-isolated.ts',
 'postgres-h5-018-second-correlation.test.ts':'../support/h5-diagnostic-corrected-isolated.ts',
 'postgres-h5-018-audit.test.ts':'../support/h5-018-audit-isolated.ts',
 'postgres-h5-018-causes.test.ts':'../support/h5-018-audit-isolated.ts',
 'postgres-h5-017-e-identity.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-parents.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-owner-collision.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-current-evidence.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-e-observation-access.test.ts':'../support/h5-diagnostic-e-isolated.ts',
 'postgres-h5-017-d-017.test.ts':'../support/h5-diagnostic-d-isolated.ts',
 'postgres-h5-017-d-regression-security.test.ts':'../support/h5-diagnostic-d-isolated.ts',
 'postgres-h5-017-d-independent-audit.test.ts':'../support/h5-diagnostic-d-isolated.ts',
 'postgres-h5-017-d-independent-causes.test.ts':'../support/h5-diagnostic-d-isolated.ts',
 'postgres-h5-017-d-counterexamples.test.ts':'../support/h5-diagnostic-d-isolated.ts',
 'postgres-h5-017-d-temporal.test.ts':'../support/h5-diagnostic-d-isolated.ts',
};
const parents=new Map(Object.entries(mapping).map(([file,specifier])=>[new URL('../integration/'+file,import.meta.url).href,specifier]));
parents.set(new URL('./h5-diagnostic-d-regression.ts',import.meta.url).href,'./h5-diagnostic-d-isolated.ts');
const replacement=new URL('./h5-diagnostic-f-isolated.ts',import.meta.url).href;
const mixedEParent=new URL('../integration/postgres-h5-017-e-identity.test.ts',import.meta.url).href;
const mixedEFixture=new URL('./h5-017-f-e-legacy.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){if(parents.get(context.parentURL)===specifier)return nextResolve(context.parentURL===mixedEParent?mixedEFixture:replacement,context);return nextResolve(specifier,context);}});
