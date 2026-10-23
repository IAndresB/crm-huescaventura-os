"""Seal only this variant's additive reviewable payloads. No Git writes."""
import datetime,hashlib,json,os,subprocess
from pathlib import Path
W=Path(__file__).resolve().parents[1];B=W/'tests/fixtures/h6-bootstrap-variant'
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=W,text=True).strip()=='971c55d5ce5770c71284d106d3c0deecca9514b5','BASE_IDENTITY_CHANGED'
assert not subprocess.check_output(['git','diff','--cached','--name-only'],cwd=W),'STAGING_NOT_AUTHORIZED'
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(p,v):
 with p.open('x') as f:json.dump(v,f,ensure_ascii=False,indent=2);f.write('\n')
inherit=set();historical=[]
for rel,seal in [('tests/fixtures/h6-015-execution/delivery-manifest-v1.json','tests/fixtures/h6-015-execution/delivery-seal-v1.json'),('tests/fixtures/h6-015-pg17-corrective/corrective-manifest-v1.json','tests/fixtures/h6-015-pg17-corrective/corrective-seal-v1.json')]:
 m=json.loads((W/rel).read_text());inherit.update(x['path'] for x in m['files']);inherit.update([rel,seal]);historical.append({'manifest':rel,'sha256':h(W/rel),'payloads':len(m['files'])})
 for row in m['files']:assert h(W/row['path'])==row['sha256'],'INHERITED_PAYLOAD_CHANGED'
raw=subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z'],cwd=W)
new=sorted(p.decode() for p in raw.split(b'\0') if p and p.decode() not in inherit and p.decode()!='node_modules')
for p in new:
 assert p.startswith(('scripts/h6-bootstrap-','scripts/run-h6-bootstrap-','scripts/seal-h6-bootstrap-','specs/001-core-crm/result-TSK-H6-015-bootstrap-','specs/001-core-crm/variant-TSK-H6-015-PG17-bootstrap-','specs/001-core-crm/custody-TSK-H6-015-bootstrap-','tests/fixtures/h6-bootstrap-variant/','tests/support/h6-bootstrap-')),'UNRELATED_UNTRACKED_FILE'
 assert (W/p).is_file() and not (W/p).is_symlink(),'ONLY_REGULAR_PAYLOADS'
report=B/'runs/2026-10-22T14-52-59-084Z/report.json';r=json.loads(report.read_text());assert len(r['checks'])==64 and not r['failures'] and r['resourcesStopped'] and not r['taskCompleted'] and not r['explicitReentry']
for row in r['sourceLock']:assert h(W/row['path'])==row['sha256'],'EXECUTED_CODE_CHANGED'
# Secret values remain private: scan locally and emit only aggregate result.
values=set()
def collect(v):
 if isinstance(v,dict):
  for k,x in v.items():
   if isinstance(x,str) and len(x)>=16 and any(t in k.lower() for t in ['secret','password','token','shandle','controlt0','encryptionkey']) or isinstance(x,str) and k=='key' and len(x)>=16:values.add(x.encode())
   collect(x)
 elif isinstance(v,list):
  for x in v:collect(x)
for p in (B/'runs').glob('*/report.json'):
 root=Path(json.loads(p.read_text())['privateRoot'])
 for name in ['source-configuration.json','destination-keys.json','t0-sensitive.json']:
  f=root/name
  if f.exists():collect(json.loads(f.read_text()))
for p in new:
 data=(W/p).read_bytes();assert not any(v in data for v in values),'PRIVATE_VALUE_IN_PUBLIC_PAYLOAD'
receipt=B/'publication-preflight-v2.json'
write(receipt,{'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','candidateFilesScanned':len(new),'privateValuesCheckedLocally':len(values),'secretValuesEmitted':False,'executedSourcesUnchanged':True,'historicalPayloadsUnchanged':True,'staging':False,'publication':False,'S11':False})
new.append(str(receipt.relative_to(W)));new.sort()
manifest=B/'delivery-manifest-v2.json'
audit=json.loads((B/'independent-review-reference-v2.json').read_text())
write(manifest,{'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseCommit':'971c55d5ce5770c71284d106d3c0deecca9514b5','scope':'Additive experimental bootstrap variant; no normative replacement, S11 or acceptance','taskState':'IN_PROGRESS','historical':historical,'independentReview':audit,'files':[{'path':p,'bytes':(W/p).stat().st_size,'sha256':h(W/p)}for p in new],'count':len(new),'staged':False,'commit':False,'push':False,'Drive':False,'privateMaterialExcluded':True,'excluded':['node_modules symlink and dependency tree','all /tmp/h6boot-* resources','all private custody roots','dumps, credentials, tokens, TOTP, key material, raw configs','independent auditor candidate stays separately sealed'],'selfAndSealExcluded':True})
seal=B/'delivery-seal-v2.json';write(seal,{'manifest':str(manifest.relative_to(W)),'sha256':h(manifest),'payloadCount':len(new),'scope':'local candidate only, no publication','taskState':'IN_PROGRESS'})
for row in json.loads(manifest.read_text())['files']:assert h(W/row['path'])==row['sha256']
print(json.dumps({'payloads':len(new),'manifestSHA256':h(manifest),'privateValuesAbsent':True,'historicalPayloadsVerified':sum(x['payloads']for x in historical)}))
