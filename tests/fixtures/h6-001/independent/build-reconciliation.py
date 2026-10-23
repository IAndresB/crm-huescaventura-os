from pathlib import Path
import json,gzip,re,hashlib,subprocess,datetime
root=Path('/tmp/h6-001-audit');repo=root/'replica';candidate=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os');sha=lambda b:hashlib.sha256(b).hexdigest()
inputs=json.loads((root/'compatibility-02/inputs.json').read_text());variants={x['original']:x for x in inputs['sources']};received=json.loads((root/'received-product.json').read_text());functional={x['path']:x for x in received['functional']}
rows=[]
for phase in [1,15]:
 path=root/f'regression-01/phase-{phase:02}.stdout.log.gz';lines=gzip.decompress(path.read_bytes()).decode().splitlines();start=lines.index('✖ failing tests:');blocks=[];b=[]
 for ln,l in enumerate(lines[start+1:],start+2):
  if l.startswith('test at '):
   if b:blocks.append(b)
   b=[(ln,l)]
  else:b.append((ln,l))
 if b:blocks.append(b)
 for b in blocks:
  if not b[0][1].startswith('test at '):continue
  loc=b[0][1].removeprefix('test at ');file,line,col=loc.rsplit(':',2)
  titleline=next((x for x in b if x[1].startswith('✖ ')),None);assert titleline
  title=re.sub(r' \([\d.]+ms\)$','',titleline[1][2:]);raw='\n'.join(l for _,l in b)
  if 'pg_ctl: could not start server' in raw: category='FIXED_PORT_COLLISION';folder='freplay-isolated-01';source=file
  elif 'Unexpected end of JSON input' in raw:category='CLI_OUTPUT_FORMAT';folder='compatibility-02';source=variants[file]['successor']
  elif 'Missing expected rejection' in raw:category='EXPIRED_RELATIVE_TIME_FIXTURE';folder='compatibility-02';source=variants[file]['successor']
  elif 'src/application/contracts.ts' in raw:
   category='PRE_INHERITED_BYTE_BASELINE';folder='compatibility-03' if title.startswith('W53 ') else 'compatibility-02';source='tests/integration/h6001compatv3-postgres-h5-008-migration.test.ts' if folder=='compatibility-03' else variants[file]['successor']
  else:raise Exception(('UNKNOWN',title,raw[:400]))
  succ=gzip.decompress((root/folder/'stdout.log.gz').read_bytes()).decode().splitlines();passes=[(ln+1,l) for ln,l in enumerate(succ) if re.match(r'^\s*✔ '+re.escape(title)+r' \([\d.]+ms\)$',l)];assert len(passes)==1,(title,folder)
  row={'id':'AF'+str(len(rows)+1).zfill(3),'title':title,'original':{'source':file,'sourceLine':int(line),'sourceSHA':sha((repo/file).read_bytes()),'log':str(path.relative_to(root)),'logLine':titleline[0],'result':'FAIL'},'cause':category,'successor':{'source':source,'sourceSHA':sha((repo/source).read_bytes()),'log':folder+'/stdout.log.gz','logLine':passes[0][0],'result':'PASS','run':folder},'interpretation':'Historical FAIL retained; current material control resolved by named successor. Not a clean full-suite rerun.'}
  if title.startswith('W53 '):row['intermediate']={'run':'compatibility-02','result':'FAIL','cause':'nested historical chain guard still pre-inherited; original nested checks preserved in explicit v3 successor'}
  rows.append(row)
assert len(rows)==46
counts={k:sum(x['cause']==k for x in rows) for k in sorted({x['cause'] for x in rows})}
result={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rawRun':'regression-01/report.json','rawOutcome':{'tests':2945,'pass':2899,'fail':46,'cancelled':0,'skipped':0},'classification':counts,'successorOutcomes':{'freplay-isolated-01':{'tests':12,'pass':12,'fail':0},'compatibility-02':{'tests':34,'pass':33,'fail':1},'compatibility-03':{'tests':1,'pass':1,'fail':0}},'reconciled':46,'unresolved':0,'uniqueCoverage':'2945 positions counted once in the exact196-file selection, including containers. The 46 failed positions have current passing successors; do not add repeated runs to this count, or claim 2945/2945 from a fresh complete execution. Counts are not unique business scenarios.','rows':rows}
(root/'reconciliation.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
lines=['# Reconciliación de 46 fallos originales','', 'El bruto conserva FAIL 2.899/2.945. Cada fallo tiene sucesor PASS; no hubo ejecución completa limpia posterior. No se suman repeticiones. Los filtros contaron solo los 34 títulos seleccionados, con 0 skips; el resto conserva su observación original.','','| ID | Caso original | Causa | Sucesor PASS |','|---|---|---|---|']
for x in rows:lines.append('| '+x['id']+' | '+x['title']+' — `'+x['original']['source']+'` | '+x['cause']+' | `'+x['successor']['log']+':'+str(x['successor']['logLine'])+'` |')
(root/'reconciliation.md').write_text('\n'.join(lines)+'\n')
checks=[]
for x in received['functional']:
 checks.append({'path':x['path'],'kind':'replica original input','sha256':sha((repo/x['path']).read_bytes()),'expected':x['sha256'],'pass':sha((repo/x['path']).read_bytes())==x['sha256']})
for x in received['inherited']:
 for label,p in [('candidate',candidate/x['path']),('inherited origin',Path(x['source']))]:checks.append({'path':str(p),'kind':label,'sha256':sha(p.read_bytes()),'expected':x['sha256'],'pass':sha(p.read_bytes())==x['sha256']})
for part in ['src','supabase/migrations']:
 for p in sorted((repo/part).rglob('*')):
  if not p.is_file():continue
  rel=p.relative_to(repo);other=candidate/rel;checks.append({'path':str(rel),'kind':'candidate vs replica product','sha256':sha(p.read_bytes()),'expected':sha(other.read_bytes()),'pass':p.read_bytes()==other.read_bytes()})
for relative,snapshot in [('tests/integration/postgres-h6-001.test.ts','focal-independent-01/source/postgres-h6-001.test.ts'),('scripts/run-h6-001.mjs','focal-independent-01/source/run-h6-001.mjs')]:
 a=candidate/relative;b=root/snapshot;checks.append({'path':relative,'kind':'frozen focal still current','sha256':sha(a.read_bytes()),'expected':sha(b.read_bytes()),'pass':a.read_bytes()==b.read_bytes()})
expected=Path('/tmp/h6-001-independent-expected.md');checks.append({'path':str(expected),'kind':'expected unchanged','sha256':sha(expected.read_bytes()),'expected':'ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2','pass':sha(expected.read_bytes())=='ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2'})
gits={}
for k,p in [('replica',repo),('candidate',candidate),('primary',Path('/Users/andres/Developer/crm-huescaventura-os'))]:
 def git(*args):
  v=subprocess.run(['git',*args],cwd=p,capture_output=True,text=True);assert v.returncode==0;return v.stdout
 gits[k]={'head':git('rev-parse','HEAD').strip(),'index':git('diff','--cached','--name-only').splitlines(),'trackedDiff':git('diff','--name-only').splitlines()}
 assert not gits[k]['index']
 assert gits[k]['head']==received['base']
assert not gits['primary']['trackedDiff']
assert all(x['pass'] for x in checks)
(root/'final-integrity.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','checks':checks,'count':len(checks),'git':gits,'limits':'primary untracked custody is delegated to custodian v2. No runtime or H6-015 query.'},indent=2)+'\n')
(root/'expected.md').write_bytes(expected.read_bytes())
print('reconciliation',len(rows),counts,'integrity',len(checks))
