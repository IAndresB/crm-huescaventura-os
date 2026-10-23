from pathlib import Path
import json,hashlib,gzip,os,subprocess,re,datetime
root=Path('/tmp/h6-001-audit');repo=root/'replica';out=root/'compatibility-03';out.mkdir()
helper=(repo/'tests/support/h6-001-inherited-compatibility.ts').read_text()+"\nexport {assertHistoricalBytes,f10DependencyHashes,f12VerifierHashes,f12ManifestHashes} from './h5-017-c-dependency-preservation.ts';\n"
helperpath=repo/'tests/support/h6-001-inherited-compatibility-v3.ts';helperpath.write_text(helper);(out/'support.ts').write_text(helper)
oldchain=repo/'tests/support/h5-017-c-chain-counterexamples.mjs';c=oldchain.read_text().replace("from './h5-017-c-dependency-preservation.ts'","from './h6-001-inherited-compatibility-v3.ts'",1)
extra="""// New H6-001 compatibility supplement: accepted delta is exact, never a blanket exemption.
 for(const path of ['src/application/contracts.ts','src/infrastructure/postgres/h0-005-adapter.ts','src/infrastructure/postgres/persisted-work-executor.ts','src/server/human-postgres-composition.ts']){
  const original=await readFile(path),historical=digest(git('show','971c55d5ce5770c71284d106d3c0deecca9514b5:'+path));
  assertHistoricalHash(path,original,historical);
  assert.throws(()=>assertHistoricalHash(path,Buffer.concat([original,Buffer.from('UNAUTHORIZED_EXTRA_DELTA')]),historical));
  assert.throws(()=>assertHistoricalHash(path,original,'0'.repeat(64)));
  observations.push({path,rejectedAlteredCurrent:true,rejectedAlteredHistorical:true,guard:'exact base plus declared inherited bytes'});
 }
"""
assert c.count(' const after=')==1;c=c.replace(' const after=',extra+' const after=',1)
chainpath=repo/'tests/support/h6-001-chain-counterexamples-v3.mjs';chainpath.write_text(c);(out/'chain-counterexamples.mjs').write_text(c)
original=repo/'tests/integration/h6001compat-h5017c-preservation-postgres-h5-008-migration.test.ts';s=original.read_text().replace('h6-001-inherited-compatibility.ts','h6-001-inherited-compatibility-v3.ts').replace('tests/support/h5-017-c-chain-counterexamples.mjs','tests/support/h6-001-chain-counterexamples-v3.mjs');t=repo/'tests/integration/h6001compatv3-postgres-h5-008-migration.test.ts';t.write_text(s);(out/'source.test.ts').write_text(s)
selected='W53 W54 W56 expected45 rows56 cases, all56 published migration bytes, F10/F12 unchanged and scoped synthetic product'
env={'PATH':os.environ['PATH'],'TMPDIR':str(root/'runtime'),'LANG':'C','LC_ALL':'C','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','CI':'1','NODE_NO_WARNINGS':'1','NODE_OPTIONS':'--import=file:///tmp/h6-001-audit/replica/tests/support/h5-017-g-hook.mjs','H6001_AUDIT_PATTERN':'^'+re.escape(selected)+'$'}
sha=lambda b:hashlib.sha256(b).hexdigest()
inputs={'original':str(original),'originalSHA':sha(original.read_bytes()),'sourceSHA':sha(t.read_bytes()),'helperSHA':sha(helperpath.read_bytes()),'originalChainSHA':sha(oldchain.read_bytes()),'chainSHA':sha(chainpath.read_bytes()),'runnerSHA':sha((repo/'scripts/h6001-compatibility-runner.mjs').read_bytes()),'meaning':'Previous 33/1 FAIL kept. Nested old chain-counterexamples uses same explicit exact byte delta; all unrelated checks preserved; extra altered-current/historical denials for each modified product path.'};(out/'inputs.json').write_text(json.dumps(inputs,indent=2)+'\n')
cmd=['node','scripts/h6001-compatibility-runner.mjs',t.name];start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(cmd,cwd=repo,env=env,capture_output=True)
for name,data in [('stdout',p.stdout),('stderr',p.stderr)]:(out/(name+'.log.gz')).write_bytes(gzip.compress(data))
record={'command':cmd,'started':start,'finished':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exit':p.returncode,'summary':[s for s in p.stdout.decode().splitlines() if re.match(r'ℹ (?:tests|pass|fail|cancelled|skipped|duration_ms)',s)],'stdoutSHA':sha(p.stdout),'stderrSHA':sha(p.stderr)};(out/'run.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));print(p.stdout.decode()[-4500:]);print(p.stderr.decode()[-1000:])
