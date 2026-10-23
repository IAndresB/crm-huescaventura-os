"""Re-execute official H5-019 selection in an isolated byte-verified replica.
No reset/checkout/commit/branch/network business connection. Historical outputs stay in replica.
"""
import pathlib,json,hashlib,tempfile,shutil,subprocess,os,gzip,re,time,sys
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-013'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,v):
 with p.open('x') as f:json.dump(v,f,indent=2);f.write('\n')
INPUT=OUT
if len(sys.argv)>1:
 OUT=INPUT/sys.argv[1];OUT.mkdir()
base=json.loads((INPUT/'base-inventory.json').read_text());seal=json.loads((INPUT/'expected-seal.json').read_text())
for p,h in seal['sha256'].items():assert sha(ROOT/p)==h
previous=json.loads((ROOT/'tests/fixtures/h5-017-f/25-selection.json').read_text())
selected=previous['selected']+['postgres-h5-018-fifth-sequences.test.ts','postgres-h5-018-fifth-migration.test.ts','postgres-h5-018-fifth-chronology.test.ts','postgres-h5-017-g-temporal.test.ts','postgres-h5-018-sixth-migration.test.ts','postgres-h5-019-integrated.test.ts']
assert len(selected)==len(set(selected))==198
replica=pathlib.Path(tempfile.mkdtemp(prefix='crm-h6013-regression-'))/'repo';replica.mkdir()
# Copy existing Git metadata, separate index/refs; object access is read-only. No Git mutation command.
(replica/'.git').mkdir()
for p in ['HEAD','config','index','packed-refs','shallow']:
 if (ROOT/'.git'/p).exists():shutil.copy2(ROOT/'.git'/p,replica/'.git'/p)
shutil.copytree(ROOT/'.git/refs',replica/'.git/refs');(replica/'.git/objects').symlink_to(ROOT/'.git/objects',target_is_directory=True)
for p,info in base['files'].items():
 assert sha(ROOT/p)==info['sha256'],p
 dest=replica/p;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/p,dest);assert sha(dest)==info['sha256'],p
(replica/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
save(OUT/'regression-selection.json',{'selected':selected,'source':'official H5-019 selection196 + S6 migration2 tests + H5-019 integrated3 tests','hook':'tests/support/h5-017-g-hook.mjs','replica':str(replica),'verifiedFiles':len(base['files']),'base':base['base'],'copiedGitMetadata':True,'objectsReadOnly':True,'noGitMutation':True})
env={k:v for k,v in os.environ.items() if not k.startswith(('H40','H50','STORAGE_H1','NODE_OPTIONS','PG','DATABASE','SUPABASE'))}
env['POSTGRES_H0_BIN']='/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin'
env['NODE_OPTIONS']='--import='+str(replica/'tests/support/h5-017-g-hook.mjs')
isolated=[n for n in selected if re.search(r'postgres-h2-.*(?:-f0[0-9]|-defects)\.test\.ts$',n) or n in ['postgres-h2-011.test.ts','h5017c-preservation-postgres-h5-008-migration.test.ts','h5017d-dependency-postgres-h5-008.test.ts','postgres-h4-023-concurrency.test.ts']]
phases=[[n] for n in isolated]+[['postgres-h2-008.test.ts'],[n for n in selected if n not in set(isolated+['postgres-h2-008.test.ts'])]]
results=[];total={k:0 for k in ['tests','pass','fail','cancelled','skipped']}
for i,files in enumerate(phases,1):
 print(f'phase {i}/{len(phases)} files={len(files)}',flush=True)
 start=time.time();prefix=OUT/f'regression-phase-{i:02}'
 with prefix.with_suffix('.stdout.log').open('xb') as o,prefix.with_suffix('.stderr.log').open('xb') as e:
  r=subprocess.run(['node','scripts/test-postgres.mjs',*files],cwd=replica,env=env,stdout=o,stderr=e)
 text=prefix.with_suffix('.stdout.log').read_text();counts={}
 for k in total:
  m=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',text);counts[k]=int(m[-1]) if m else None
  if m:total[k]+=counts[k]
 item={'phase':i,'files':files,'exit':r.returncode,'seconds':time.time()-start,'counts':counts}
 results.append(item)
 (OUT/'regression-progress.json').write_text(json.dumps({'phases':results,'total':total},indent=2)+'\n')
 print(json.dumps(item),flush=True)
# Preserve all changed original outputs in replica, list changes, do not overwrite originals.
changes=[];errors=[]
for p,v in base['files'].items():
 if sha(ROOT/p)!=v['sha256']:errors.append(p)
 if not (replica/p).exists() or sha(replica/p)!=v['sha256']:changes.append(p)
result={'phases':results,'total':total,'workspaceChanged':errors,'replicaChanged':changes,'retainedReplica':str(replica),'exit':int(bool(errors or any(x['exit'] for x in results)))}
save(OUT/'regression-result.json',result);print(json.dumps(result),flush=True)
raise SystemExit(result['exit'])
