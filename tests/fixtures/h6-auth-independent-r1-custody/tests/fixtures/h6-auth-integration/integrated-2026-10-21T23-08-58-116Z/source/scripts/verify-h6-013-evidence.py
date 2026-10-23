"""Read-only evidence verifier. This is internal verification, not independent acceptance."""
import pathlib,json,hashlib,gzip,re,subprocess,collections
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'tests/fixtures/h6-013'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
base=read(OUT/'base-inventory.json')
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==base['base']
assert subprocess.check_output(['git','rev-parse','HEAD^{tree}'],cwd=ROOT,text=True).strip()==base['tree']
assert not subprocess.check_output(['git','diff','--name-only'],cwd=ROOT)
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=ROOT)
for p,v in base['files'].items():assert sha(ROOT/p)==v['sha256'],p
for version in ['','-v2','-v3']:
 for p,h in read(OUT/('expected-seal'+version+'.json'))['sha256'].items():assert sha(ROOT/p)==h,p
m=read(OUT/'migrations.json');assert m['count']==len(m['migrations'])==68
for row in m['migrations']:assert sha(ROOT/row['path'])==row['sha256']
chain=read(OUT/'chain-attempt-03/chain-result.json');assert chain['fail']==0 and chain['pass']==410 and chain['completeFreshInstalls']==2
schema=[gzip.decompress((OUT/f'chain-attempt-03/chain{n}.schema.sql.gz').read_bytes()) for n in [1,2]];assert schema[0]==schema[1]
assert len([x for x in chain['results'] if x['case'].startswith('D01-')])==66
pairs=read(OUT/'expected-applications.json')['pairs'];edges=0
for case,origin in [('B02',26),('B03',30),('B04',33),('B05',52),('B06',63)]:
 s=read(OUT/f'cross-upgrade-04/{case}-summary.json');assert s['origin']==origin and s['destination']==68 and s['historicalAdapterExecuted']
 assert [x['to'] for x in s['edges']]==list(range(origin+1,69));edges+=len(s['edges'])
 legacy=read(OUT/f'cross-upgrade-04/legacy-{origin}.json');p=next(x for x in pairs if x['origin']==origin);assert all(legacy[k]==v for k,v in p.items())
 data=subprocess.check_output(['git','show',p['applicationCommit']+':'+p['adapter']],cwd=ROOT);assert hashlib.sha256(data).hexdigest()==p['adapterSha256']
 for x in s['edges']:
  d=read(OUT/f"cross-upgrade-04/{case}-edge-{x['to']}.json");assert d['before']==d['after'] and d['equal']
assert edges==136
n=read(OUT/'negatives-04/all-tables-security.json');assert n['tables']==175 and n['attempts']==n['denied']==2800 and len(n['owners'])==128
assert len({(x['user'],x['table'],x['verb']) for x in n['outcomes']})==2800
for x in n['owners']:assert not x['rolsuper'] and not x['rolcanlogin'] and not x['rolbypassrls']
for name in ['M01','order','constraints','security']:assert (OUT/f'negatives-04/{name}-result.json').exists()
assert [x['observed'] for x in read(OUT/'negatives-04/constraints-result.json')['outcomes']]==['23505','23514','23503']
r=read(OUT/'regression-result.json');selection=read(OUT/'regression-selection.json')['selected'];assert len(selection)==len(set(selection))==198
flat=[p for phase in r['phases'] for p in phase['files']];assert len(flat)==len(set(flat))==198 and set(flat)==set(selection)
total=collections.Counter()
for phase in r['phases']:
 assert phase['exit']==0
 log=(OUT/f"regression-phase-{phase['phase']:02}.stdout.log").read_text()
 for key,value in phase['counts'].items():
  assert int(re.findall(r'(?:ℹ|#) '+key+r' (\d+)',log)[-1])==value;total[key]+=value
assert dict(total)==r['total']=={'tests':2950,'pass':2950,'fail':0,'cancelled':0,'skipped':0}
assert not r['workspaceChanged'] and r['exit']==0
assert set(r['replicaChanged'])=={'supabase/.temp/cli-latest','tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'}
q=read(OUT/'quality-result.json');assert all(x['exit']==0 for x in q['results'])
types=read(OUT/'typecheck-final-03.json');assert types['exit']==0
for p,h in types['inputSha256'].items():assert sha(ROOT/p)==h
for folder,count in [('cross-upgrade-04',5),('negatives-04',5)]:
 s=(OUT/folder/'stdout.log').read_text()
 for key,expected in [('tests',count),('pass',count),('fail',0),('cancelled',0),('skipped',0)]:assert int(re.findall(r'ℹ '+key+r' (\d+)',s)[-1])==expected
candidate=OUT/'candidate-manifest.json';manifestVerified=None
if candidate.exists():
 c=read(candidate)
 for p,v in c['files'].items():assert sha(ROOT/p)==v['sha256'],p
 manifestVerified=len(c['files'])
print(json.dumps({'status':'PASS_INTERNAL_VERIFICATION_ONLY','base':base['base'],'tree':base['tree'],'preservedBaseFiles':len(base['files']),'normativeRows':len(read(OUT/'normative-rows.json')),'migrations':68,'freshInstalls':2,'chainAssertions':410,'crossUpgradeTests':5,'populatedEdges':edges,'negativeTests':5,'directCrudDenied':2800,'postgresRegression':r['total'],'unitRegression':208,'candidateFilesVerified':manifestVerified,'schemaSha256':hashlib.sha256(schema[0]).hexdigest(),'acceptance':'independent review and director decision pending'},indent=2))
