import './h5-017-e-original-hook.mjs';
import {registerHooks} from 'node:module';
const parents={"../integration/postgres-h5-017-d-017.test.ts": "../support/h5-diagnostic-d-isolated.ts", "../integration/postgres-h5-017-d-regression-security.test.ts": "../support/h5-diagnostic-d-isolated.ts", "../integration/postgres-h5-017-d-independent-audit.test.ts": "../support/h5-diagnostic-d-isolated.ts", "../integration/postgres-h5-017-d-independent-causes.test.ts": "../support/h5-diagnostic-d-isolated.ts", "../integration/postgres-h5-017-d-counterexamples.test.ts": "../support/h5-diagnostic-d-isolated.ts", "../integration/postgres-h5-017-d-temporal.test.ts": "../support/h5-diagnostic-d-isolated.ts", "./h5-diagnostic-d-regression.ts": "./h5-diagnostic-d-isolated.ts"};
const targets=new Map(Object.entries(parents).map(([name,specifier])=>[new URL(name,import.meta.url).href,specifier]));
const replacement=new URL('./h5-diagnostic-e-isolated.ts',import.meta.url).href;
registerHooks({resolve(specifier,context,nextResolve){if(targets.get(context.parentURL)===specifier)return nextResolve(replacement,context);return nextResolve(specifier,context);}});
