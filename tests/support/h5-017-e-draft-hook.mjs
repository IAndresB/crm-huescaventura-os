import {registerHooks} from 'node:module';
const target=new URL('./h5-diagnostic-e-isolated.ts',import.meta.url).href;
registerHooks({load(url,context,nextLoad){const result=nextLoad(url,context);if(url!==target)return result;const source=String(result.source);const old='supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql';if(source.split(old).length!==2)throw new Error('E_DRAFT_FIXTURE_MISMATCH');return {...result,source:source.replace(old,'tests/fixtures/h5-017-e/proposed67.sql')};}});
