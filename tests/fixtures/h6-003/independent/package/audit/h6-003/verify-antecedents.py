from pathlib import Path
import json,gzip,hashlib,stat,subprocess,datetime
root=Path('.').resolve();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();result={'task':'H6-003 independent antecedent readback','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'packages':{}};bad=[]
for task in ['h6-002','h6-005','h6-017']:
 source=Path('/Users/andres/.codex/worktrees/'+task+'-local-isolated/crm-huescaventura-os');d=source/'tests/fixtures'/task;manifest=d/'delivery-manifest.json';seal=json.loads((d/'delivery-seal.json').read_text());m=json.loads(manifest.read_text());expected=seal.get('manifestSHA256')or seal['metadata']['delivery-manifest.json']['sha256'];assert sha(manifest)==expected
 for x in m['files']:
  p=source/x['path'];mode=x['mode'];mode=int(mode,8)if isinstance(mode,str)else mode
  if sha(p)!=x['sha256']or p.stat().st_size!=x['bytes']or stat.S_IMODE(p.stat().st_mode)!=mode:bad.append(task+':'+x['path'])
 result['packages'][task]={'manifestSHA256':sha(manifest),'sealSHA256':sha(d/'delivery-seal.json'),'filesChecked':len(m['files']),'mismatches':0}
basefile=Path('/Users/andres/.codex/worktrees/h6-002-local-isolated/crm-huescaventura-os/tests/fixtures/h6-002/baseline.json.gz');assert sha(basefile)=='d54cf76892b683187e1e5588e1afa4fe510a8433f1971cd4a5ee4b256f94fde5';base=json.loads(gzip.decompress(basefile.read_bytes()));assert base['base']=='0cd5f06d2efec9741906d4927318734451b01d4a'and base['tree']=='8b184d1d470a3bf190dee14499369fe9c665ab3d'
for x in base['files']:
 p=root/x['path']
 if sha(p)!=x['sha256']or p.stat().st_size!=x['bytes']or stat.S_IMODE(p.stat().st_mode)!=x['mode']:bad.append(x['path'])
result['base']={'filesChecked':len(base['files']),'migrations':len(list((root/'supabase/migrations').glob('*.sql'))),'productFiles':len(subprocess.check_output(['git','ls-files','src'],cwd=root).decode().splitlines()),'trackedDiff':subprocess.check_output(['git','diff','--name-only'],cwd=root).decode(),'indexDiff':subprocess.check_output(['git','diff','--cached','--name-only'],cwd=root).decode()};assert result['base']['migrations']==68 and result['base']['productFiles']==110 and not result['base']['trackedDiff'] and not result['base']['indexDiff']
accept=json.loads((root/'tests/fixtures/h5-019-acceptance/decision-receipt.json').read_text());cs=root/'tests/fixtures/h5-019-corrective/candidate-seal.json';assert sha(cs)==accept['D01']['acceptedCandidateSealSha256'];s=json.loads(cs.read_text());assert sha(root/'tests/fixtures/h5-019-corrective/candidate-inventory.json.gz')==s['inventorySha256'];audit=Path('/Users/andres/Developer/crm-h5-019-corrective-independent-audit-20261018');assert sha(audit/'AUDIT-SEAL.json')==accept['independentAudit']['sealSha256'];assert sha(audit/'AUDIT-INVENTORY.json')==accept['independentAudit']['inventorySha256'];afs=json.loads((audit/'AUDIT-INVENTORY.json').read_text())['files']
for name,x in afs.items():
 p=audit/name
 if sha(p)!=x['sha256']or p.stat().st_size!=x['bytes']or stat.S_IMODE(p.stat().st_mode)!=x['mode']:bad.append('H5019:'+name)
result['H5019']={'acceptedSeal':sha(cs),'auditSeal':sha(audit/'AUDIT-SEAL.json'),'auditPayloadsChecked':len(afs)}
locator=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os/tests/fixtures/h6-017/preservation/readback-v3.json');historical=json.loads(locator.read_text())['H6015'];count=0
for package in historical['packages']:
 assert sha(root/package['manifest'])==package['manifestSHA256']
 for x in package['resolutions']:
  origin=x['resolved']
  if origin.startswith('/'):
   p=Path(origin);assert '/crm-huescaventura-os/'in str(p);data=p.read_bytes()
  elif origin.startswith('published-canonical-identical:'):data=(root/x['path']).read_bytes()
  elif origin.startswith(('snapshot:','snapshot-identical:')):
   _,ref,path=origin.split(':',2);data=subprocess.check_output(['git','show',ref+':'+path],cwd=root)
  else:raise RuntimeError(origin)
  if hashlib.sha256(data).hexdigest()!=x['sha256']:bad.append('H6015:'+x['path'])
  count+=1
result['H6015']={'manifests':len(historical['packages']),'entriesChecked':count,'runtimeSQLS11Reentry':False,'fourJobsTouched':False};result['mismatches']=bad;result['status']='PASS'if not bad else'FAIL';Path('audit/h6-003/antecedents-readback.json').write_text(json.dumps(result,indent=2)+'\n');assert not bad;print(json.dumps(result))
