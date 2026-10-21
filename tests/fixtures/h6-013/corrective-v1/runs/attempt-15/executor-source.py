"""H6-only corrective runner. All execution in a private replica under a macOS write/network sandbox.
Original runtime/config is never used. Only new labelled evidence is copied back. No Git mutation commands.
Usage: python3 scripts/run-h6-013-corrective.py NEW_LABEL [all|focal|regression|quality]
"""
import pathlib,json,hashlib,subprocess,os,sys,tempfile,shutil,time,datetime,re
EXECUTED_SOURCE=pathlib.Path(__file__).read_bytes()
ROOT=pathlib.Path(__file__).resolve().parents[1];INPUT=ROOT/'tests/fixtures/h6-013';CORRECTIVE=INPUT/'corrective-v1'
label=sys.argv[1];mode=sys.argv[2] if len(sys.argv)>2 else 'all'
assert re.fullmatch(r'attempt-[0-9]{2}',label) and mode in ['all','focal','regression','quality']
OUT=CORRECTIVE/'runs'/label;OUT.mkdir(parents=True)
(OUT/'executor-source.py').write_bytes(EXECUTED_SOURCE)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):p.parent.mkdir(parents=True,exist_ok=True);p.open('x').write(json.dumps(v,indent=2)+'\n')
base=json.loads((INPUT/'base-inventory.json').read_text());expectedSeal=json.loads((CORRECTIVE/'expected-seal.json').read_text())
for p,h in expectedSeal['files'].items():assert sha(ROOT/p)==h,p
reuse=os.environ.get('H6013_REUSE_WORK')
if reuse:
 work=pathlib.Path(reuse).resolve();assert str(work).startswith('/private/tmp/h6013-corrective-') and mode in ['quality','focal','regression']
 replica=work/'repo';npmCache=work/'npm-cache'
 paths=list(base['files'])+[p.decode() for p in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}).split(b'\0') if p]
 restored=[]
 for p,v in base['files'].items():
  assert sha(ROOT/p)==v['sha256'],p
  if sha(replica/p)!=v['sha256']:
   assert p in ['supabase/.temp/cli-latest','tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'],p
   retained=OUT/'prior-replica-generated'/p;retained.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(replica/p,retained)
   restored.append({'path':p,'retainedSha256':sha(retained),'restoredBaseSha256':v['sha256']});shutil.copy2(ROOT/p,replica/p)
 save(OUT/'replica-baseline-restoration.json',restored)
 for p in paths:
  if 'h6-013' in p and '/runs/' not in p and '/regenerated-' not in p:
   target=replica/p;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/p,target)
 settings=json.loads((replica/'pnpm-workspace.yaml').read_text());settings={k:v for k,v in settings.items() if k not in ['dev','production','optional']}
 (replica/'pnpm-workspace.yaml').write_text(json.dumps(settings,indent=2)+'\n')
else:
 work=pathlib.Path(tempfile.mkdtemp(prefix='h6013-corrective-',dir='/private/tmp'));replica=work/'repo';replica.mkdir();(work/'tmp').mkdir();(work/'home').mkdir()
 paths=list(base['files']);new=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=ROOT,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}).split(b'\0')
 paths+= [p.decode() for p in new if p and not p.decode().startswith(str(OUT.relative_to(ROOT))+'/')]
 for p in paths:
  src=ROOT/p;dest=replica/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
  if p in base['files']:assert sha(src)==sha(dest)==base['files'][p]['sha256'],p
 # Independent indexes/refs and read-only access to already existing object database.
 (replica/'.git').mkdir()
 for p in ['HEAD','config','index','packed-refs','shallow']:
  if (ROOT/'.git'/p).exists():shutil.copy2(ROOT/'.git'/p,replica/'.git'/p)
 shutil.copytree(ROOT/'.git/refs',replica/'.git/refs');(replica/'.git/objects').symlink_to(ROOT/'.git/objects',target_is_directory=True)
 def clone(src,dest):
  assert not dest.exists();subprocess.run(['/bin/cp','-cR',str(src),str(dest)],check=True)
 clone(ROOT/'node_modules',replica/'node_modules')
 # Preserve the installed workspace settings and isolate pnpm's writable SQLite store.
 (work/'pnpm-store').mkdir();clone(pathlib.Path('/Users/andres/Library/pnpm/store/v11'),work/'pnpm-store/v11')
 settings=json.loads((ROOT/'node_modules/.pnpm-workspace-state-v1.json').read_text())['settings']
 settings={**{k:v for k,v in settings.items() if k not in ['dev','production','optional']},'storeDir':str(work/'pnpm-store'),'verifyDepsBeforeRun':False}
 (replica/'pnpm-workspace.yaml').write_text(json.dumps(settings,indent=2)+'\n')
 storage='crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e'
 candidates=[pathlib.Path(os.environ['H6013_STORAGE_CACHE'])] if os.environ.get('H6013_STORAGE_CACHE') else [pathlib.Path(tempfile.gettempdir())/storage,pathlib.Path('/private/tmp/audit-h6-013-fit2hbab/tmp')/storage]
 cache=next((p for p in candidates if (p/'dist/start/server.js').is_file()),None)
 assert cache is not None,'PINNED_STORAGE_RUNTIME_REQUIRED: prepare the official version or set H6013_STORAGE_CACHE; no implicit dependency rebuild'
 assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=cache).decode().strip()=='5def1dfc15ab7f08fe271c7d1e70542424524e4e'
 subprocess.run(['git','diff','--quiet'],cwd=cache,check=True,env={**os.environ,'GIT_OPTIONAL_LOCKS':'0'});clone(cache,work/'tmp'/storage)
 # Cached pinned real CLI; no installation/network required. npm's index and logs are private copies.
 npmCache=work/'npm-cache';npmCache.mkdir();(npmCache/'_npx').mkdir()
 clone(pathlib.Path('/Users/andres/.npm/_npx/c34c3565ecb5471d'),npmCache/'_npx/c34c3565ecb5471d')
 cli=npmCache/'_npx/c34c3565ecb5471d/node_modules/supabase/package.json';assert json.loads(cli.read_text())['version']=='2.119.0'
profile=work/'sandbox.sb';profile.write_text('(version 1)\n(allow default)\n(deny file-write*)\n(allow file-write* (subpath '+json.dumps(str(work))+') (literal "/dev/null") (literal "/dev/tty"))\n(deny network-outbound)\n(allow network-outbound (remote ip "localhost:*"))\n(allow network-outbound (remote unix-socket))\n')
env={'PATH':'/Users/andres/.openclaw/bin:/usr/bin:/bin:/usr/sbin:/sbin','HOME':str(work/'home'),'TMPDIR':str(work/'tmp'),'LC_ALL':'C','CI':'1','AI_AGENT':'codex','GIT_OPTIONAL_LOCKS':'0','COREPACK_HOME':'/Users/andres/.cache/node/corepack','COREPACK_ENABLE_NETWORK':'0','POSTGRES_H0_BIN':'/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin','npm_config_cache':str(npmCache),'npm_config_offline':'true','npm_config_update_notifier':'false'}
runout=replica/OUT.relative_to(ROOT);runout.mkdir(parents=True)
instruments=[p for p in paths if ('h6-013' in p and (p.endswith('.py') or p.endswith('.ts'))) and '/fixtures/' not in p]
for p in instruments:
 dst=runout/'instruments'/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/p,replica/p);shutil.copy2(replica/p,dst)
oracleInputs={}
for relative in ['expected.json','expected-seal.json','inputs/expected-definers.json','expected-temporal.json','expected-temporal-seal.json']:
 source=CORRECTIVE/relative
 if source.is_file():
  archive=runout/'oracle-inputs'/relative;archive.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,archive);oracleInputs[relative]=sha(archive)
provenance={'startedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'label':label,'mode':mode,'requestedComponents':os.environ.get('H6013_COMPONENTS'),'requestedRegPhases':os.environ.get('H6013_REGRESSION_PHASES'),'workspace':str(work),'expectedSealSha256':sha(CORRECTIVE/'expected-seal.json'),'oracleInputs':oracleInputs,'executorSourceSha256':hashlib.sha256(EXECUTED_SOURCE).hexdigest(),'reusedPrivateWorkspace':bool(reuse),'instruments':{p:sha(replica/p) for p in instruments},'base':base['base'],'replicaOriginalFilesVerified':len(base['files']),'sandbox':profile.read_text(),'realCliVersion':'2.119.0','storageCommit':'5def1dfc15ab7f08fe271c7d1e70542424524e4e','dependenciesCopiedWithCopyOnWrite':True,'isolatedPnpmSettings':settings,'environmentKeys':sorted(env),'externalBusinessConnectionsAllowed':False,'cliOutputContext':{'AI_AGENT':'codex','purpose':'Native CLI structured output; no historical assertion or CLI result transformed'}}
save(OUT/'provenance.json',provenance);save(runout/'provenance.json',provenance);print(json.dumps({'workspace':str(work),'mode':mode}),flush=True)
installerProfile=work/'installer-sandbox.sb'
installerProfile.write_text('(version 1)\n(allow default)\n(deny file-write*)\n(allow file-write* (subpath '+json.dumps(str(work))+') (literal "/dev/null") (literal "/dev/tty"))\n')
results=[]
def run(name,args,extra=None):
 components=os.environ.get('H6013_COMPONENTS')
 if components and mode=='focal' and name not in components.split(','):return
 started=time.time();print('START '+name,flush=True)
 with (runout/(name+'.stdout.log')).open('xb') as o,(runout/(name+'.stderr.log')).open('xb') as e:
  executionProfile=installerProfile if name in ['frozen','cli-cache'] else profile
  executionEnv={**env,**(extra or {})}
  if name in ['frozen','cli-cache']:executionEnv['npm_config_offline']='false'
  p=subprocess.run(['sandbox-exec','-f',str(executionProfile),*args],cwd=replica,env=executionEnv,stdout=o,stderr=e)
 text=(runout/(name+'.stdout.log')).read_text(errors='replace');counts={}
 for k in ['tests','pass','fail','cancelled','skipped','todo']:
  matches=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',text);counts[k]=int(matches[-1]) if matches else None
 result={'name':name,'argv':args,'exit':p.returncode,'seconds':time.time()-started,'counts':counts};results.append(result);save(runout/(name+'.status.json'),result);print(json.dumps(result),flush=True)
if mode in ['all','quality']:
 for name,args in [('frozen',['pnpm','install','--frozen-lockfile','--registry','https://registry.npmjs.org/','--ignore-scripts','--prod=false','--store-dir',str(work/'pnpm-store')]),('typecheck',['pnpm','typecheck']),('lint',['pnpm','lint']),('unit',['pnpm','test']),('build',['pnpm','build'])]:run(name,args)
if mode in ['all','focal']:
 run('negatives',['node','--test','--experimental-strip-types','tests/integration/postgres-h6-013-negatives.test.ts'],{'H6013_NEGATIVE_DIR':str(runout/'negatives')})
 run('h1-preservation',['node','--test','--experimental-strip-types','tests/integration/postgres-h6-013-h1-preservation.test.ts'],{'H6013_H1_DIR':str(runout/'h1')})
 run('temporal-fixture',['node','scripts/test-postgres.mjs','postgres-h6-013-temporal-fixture.test.ts'],{'H6013_TEMPORAL_DIR':str(runout/'temporal')})
 run('chain',['python3','scripts/verify-h6-013-chain.py',str((runout/'chain').relative_to(replica/INPUT.relative_to(ROOT)))])
 run('cross-s6',['node','scripts/test-postgres.mjs','postgres-h6-013-migration.test.ts','postgres-h5-018-sixth-migration.test.ts'],{'H6013_CAPTURE_DIR':str(runout/'cross')})
if mode in ['all','regression']:
 run('cli-cache',['npm','cache','add','supabase@2.119.0','--ignore-scripts','--registry','https://registry.npmjs.org/'])
 selected=json.loads((INPUT/'regression-selection.json').read_text())['selected'];assert len(selected)==len(set(selected))==198
 prior=json.loads((INPUT/'regression-result.json').read_text())['phases'];assert sorted(n for x in prior for n in x['files'])==sorted(selected)
 save(runout/'regression-selection.json',{'files':selected,'phases':[x['files'] for x in prior],'hook':'tests/support/h6-013-regression-hook.mjs','executedPhases':[i for i in range(1,16) if not os.environ.get('H6013_REGRESSION_PHASES') or str(i) in os.environ['H6013_REGRESSION_PHASES'].split(',')],'testFilesSha256':{n:sha(replica/'tests/integration'/n) for n in selected}})
 for i,phase in enumerate(prior,1):
  if os.environ.get('H6013_REGRESSION_PHASES') and str(i) not in os.environ['H6013_REGRESSION_PHASES'].split(','):continue
  run(f'regression-phase-{i:02}',['node','scripts/test-postgres.mjs',*phase['files']],{'NODE_OPTIONS':'--import='+str(replica/'tests/support/h6-013-regression-hook.mjs')})
# Preserve regenerated outputs without touching historical originals.
changes=[];originalErrors=[]
for p,v in base['files'].items():
 if sha(ROOT/p)!=v['sha256']:originalErrors.append(p)
 if not (replica/p).exists() or sha(replica/p)!=v['sha256']:
  changes.append(p)
  if (replica/p).is_file():dest=runout/'regenerated-base-outputs'/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(replica/p,dest)
allowed=['supabase/.temp/cli-latest','tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json']
unexpected=[p for p in changes if p not in allowed]
active=[str(p) for p in (work/'tmp').rglob('postmaster.pid')]
result={'results':results,'originalBaseErrors':originalErrors,'replicaChangedBasePaths':changes,'unexpectedReplicaChanges':unexpected,'activePostgresPidFiles':active,'workspace':str(work),'exit':int(bool(originalErrors or unexpected or active or any(x['exit'] for x in results)))}
save(runout/'result.json',result)
for src in runout.rglob('*'):
 if src.is_file():
  dest=OUT/src.relative_to(runout);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():assert sha(dest)==sha(src)
  else:shutil.copy2(src,dest);assert sha(dest)==sha(src)
print(json.dumps({'completed':label,'result':str(OUT/'result.json'),'exit':result['exit']}),flush=True)
raise SystemExit(result['exit'])
