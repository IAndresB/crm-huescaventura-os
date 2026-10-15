"""Validate final receipts and preserve generated outputs from the disposable checkout."""
from pathlib import Path
import datetime,hashlib,json,re,subprocess
r=Path(__file__).resolve().parents[4];e=Path(__file__).resolve().parent
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
gates={}
for tag,gate in [('final',x) for x in ['full','unit','typecheck','lint','build','health','audit']]+[('supplement','references'),('supplement','typecheck'),('run4','focal')]:
 receipt=e/f'{tag}-{gate}.json';d=json.loads(receipt.read_text());assert d['exit_code']==0,receipt
 log=e/f'{tag}-{gate}.log';assert h(log)==d['log_sha256'];assert h(e/f'inputs-{tag}.json')==d['manifest_sha256']
 counts={k:int(re.findall(r'ℹ '+k+r' (\d+)',log.read_text())[-1]) for k in ['tests','pass','fail','cancelled','skipped','todo'] if re.findall(r'ℹ '+k+r' (\d+)',log.read_text())}
 if counts:assert counts['tests']==counts['pass'] and not any(counts[k] for k in ['fail','cancelled','skipped','todo']),counts
 gates[tag+'-'+gate]={'receipt':receipt.name,**counts,'exit_code':0,'log_sha256':h(log)}
assert gates['final-full']['tests']==2545
assert gates['final-unit']['tests']==197
assert gates['supplement-references']['tests']==1
assert gates['run4-focal']['tests']==52
full=(e/'final-full.log').read_text();results=json.loads((e/'case-results.json').read_text())
for case in results['conceptual_cases']:
 matches=re.findall(r'✔ H5-012 '+case['id']+r' (.*) \([\d.]+ms\)',full)
 assert len(matches)==1,(case['id'],matches)
 case['evidence']='final-full.log';case['result']='PASS-local';case['observed_test']=matches[0]
results['status']='READY FOR REVIEW local/isolated only';results['full_regression']=gates['final-full'];results['supplement']=gates['supplement-references'];results['no_formal_closure']=True
(e/'case-results.json').write_text(json.dumps(results,indent=2,ensure_ascii=False)+'\n')
# Compare every tracked file in the disposable copy to the immutable base.
m=json.loads((e/'inputs-final.json').read_text());d=Path(m['copy']);tracked=subprocess.check_output(['git','ls-files','-z'],cwd=r).decode().split('\0')[:-1]
changes=[]
for p in tracked:
 if (r/p).is_file() and (d/p).is_file() and h(r/p)!=h(d/p):
  out=e/'generated-copy'/p;out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes((d/p).read_bytes());changes.append({'path':p,'main_sha256':h(r/p),'copy_sha256':h(d/p),'archive':str(out.relative_to(r))})
known={'supabase/.temp/cli-latest','tests/fixtures/h2-011/reproducer-F01-corrected.log','tests/fixtures/h2-011/reproducer-F02-corrected.log','tests/fixtures/h4-012-f16/preservation.json'}
assert all(x['path'] in known for x in changes),changes
(e/'generated-copy.json').write_text(json.dumps(changes,indent=2)+'\n')
# Final supplemental copy differs only by the additional test, not product.
sm=json.loads((e/'inputs-supplement.json').read_text());sd=Path(sm['copy'])
for x in sm['inputs']:assert h(r/x['path'])==x['sha256']==h(sd/x['path'])
for x in m['inputs']:assert h(r/x['path'])==x['sha256']==h(d/x['path'])
(e/'results-summary.json').write_text(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'READY FOR REVIEW','scope':'local/isolated/synthetic','gates':gates,'conceptual_cases_passed':41,'normative_rows':34,'normative_assigned_verifications':28,'normative_local_limits_only':6,'focal_counting':'52 included once in 2545; supplementary reference-chain test1 separate; health1 separate; unit197 separate','product_unchanged_since_focal':True,'defects':['F01 revalidated on60','F02 corrected and red/green preserved'],'original_evidence_untouched':True,'no_commit_push_deploy_formal_closure':True,'generated_copy_outputs_archived':len(changes)},indent=2)+'\n')
print(json.dumps({'status':'READY FOR REVIEW local/isolated','full':2545,'unit':197,'focal':52,'supplement':1,'health':1,'generated':changes},indent=2))
