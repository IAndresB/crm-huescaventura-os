from pathlib import Path
import hashlib,json,datetime
root=Path('/tmp/h6-001-audit');sha=lambda b:hashlib.sha256(b).hexdigest()
dirs=['static-01','regression-01','focal-independent-01','independent-01','independent-02','integrated-68','freplay-isolated-01','compatibility-02','compatibility-03']
exclude={'audit-manifest-v1.json','audit-manifest-v1.sha256','audit-readback-v1.json'}
selected=[p for p in root.iterdir() if p.is_file() and p.name not in exclude]
for d in dirs:selected += [p for p in (root/d).rglob('*') if p.is_file()]
selected=sorted(set(selected),key=lambda p:str(p.relative_to(root)))
files=[]
for p in selected:
 assert not p.is_symlink(),p
 rel=str(p.relative_to(root));assert not any(x in rel.split('/') for x in ['replica','runtime','node_modules','.git','.next'])
 if p.suffix in ['.py','.mjs','.ts'] or p.name.endswith('.diff'):kind='audit-instrument-or-source'
 elif p.name in ['expected.md']:kind='frozen-independent-expected'
 elif p.suffix=='.md':kind='audit-report'
 else:kind='synthetic-test-evidence-or-provenance'
 b=p.read_bytes();files.append({'path':rel,'bytes':len(b),'sha256':sha(b),'classification':kind})
meta={'schema':'h6-001-independent-audit-v1','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'auditor':'/root/h6_001_auditor','scope':'Local isolated synthetic technical audit only. H6-001 IN PROGRESS pending director decision; H6 IN PROGRESS; H6-015 quarantined. No publication authorization.','base':'971c55d5ce5770c71284d106d3c0deecca9514b5','expectedSHA256':'ecaf8a7ffc942493c5d7fc7606f0c15a6af8d85aba766e1117d0cb901d544eb2','focalSourceSHA256':'8baba979531801a1dda47559a52026871b829e0ae36b6d8966a1c659019561bb','focalRunnerSHA256':'c7ff5edf5f0dd10c5cf0a53cb6d7a26024b1117fd722c3330c7c4a6c0847682a','verdict':'PASS_TECHNICAL_LOCAL_WITH_EXPLICIT_RECONCILED_REGRESSION','originalRegressionStatus':'FAIL 2899/2945; 46 original FAIL retained','reconciledFailures':46,'unresolvedMaterialFindings':0,'payloads':len(files),'payloadBytes':sum(x['bytes'] for x in files),'files':files,'excluded':['replica checkout','node_modules','runtime/database/dumps','private ephemeral configuration/keys','caches','manifest itself and separate hash/readback envelopes'],'publication':False,'selfExcluded':True,'outerCandidateSeal':'executor prepares after receiving this package; final readback delegated to independent custodian'}
manifest=root/'audit-manifest-v1.json';assert not manifest.exists();manifest.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n');h=sha(manifest.read_bytes());(root/'audit-manifest-v1.sha256').write_text(h+'  audit-manifest-v1.json\n')
checks=[{'path':x['path'],'pass':(root/x['path']).stat().st_size==x['bytes'] and sha((root/x['path']).read_bytes())==x['sha256']} for x in files];assert all(x['pass'] for x in checks)
readback={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'manifestSHA256':h,'status':'PASS','payloads':len(files),'payloadBytes':meta['payloadBytes'],'allPayloadHashesMatch':True,'manifestExcludedFromOwnMembers':True,'selectedDirectories':dirs,'replicaRuntimeAndPrivateDataExcluded':True,'checks':checks}
(root/'audit-readback-v1.json').write_text(json.dumps(readback,indent=2)+'\n');print(json.dumps({'manifest':str(manifest),'sha256':h,'payloads':len(files),'bytes':meta['payloadBytes'],'verdict':meta['verdict']}))
