from pathlib import Path
import hashlib,json,datetime,subprocess,sys
r=Path(__file__).parent
excludedDirs={'replica','private-runtime','node_modules'}
excludedFiles={'audit-manifest-v1.json','audit-delivery-v1.json'}
entries=[]
for p in sorted(r.rglob('*')):
 rel=p.relative_to(r)
 if any(x in excludedDirs for x in rel.parts) or str(rel) in excludedFiles:continue
 if p.is_symlink():raise ValueError('Symlink forbidden '+str(rel))
 if not p.is_file():continue
 if p.name.startswith('.env') or p.suffix in {'.dump','.db','.sqlite','.sqlite3'}:raise ValueError('Runtime file forbidden '+str(rel))
 b=p.read_bytes();entries.append({'path':str(rel),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
manifest={'schema':'H6-004-independent-audit-selective-manifest/v1','sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base':'971c55d5ce5770c71284d106d3c0deecca9514b5','result':'PASS TECNICO LOCAL/AISLADO','currentVerdict':'independent-verdict-v2.md','currentStructuredVerdict':'functional-verdict-v2.json','currentACMatrix':'independent-AC-matrix-v2.json','currentControlMatrix':'independent-control-matrix-v2.json','expectedSHA256':'6469303177ee16e1cee10b896dc5f49d8e5e6c866e4130791892e58ffea9622d','selection':'All listed paths only; original FAILs, superseded reports and sources retained. S02 replaces S01 in selected scope; no inflated unique count.','excluded':{'directories':sorted(excludedDirs),'files':sorted(excludedFiles),'reason':'No replica, dependencies, private runtimes, caches, DB files, dumps or ephemeral credentials. Manifest excludes itself and detached delivery receipt to avoid self reference.'},'independence':'Frozen own expected before candidate, separate process/database/runtime, same model; authored eight own controls. Producer raw regressions reviewed, not all rerun.','finalDocumentaryReadback':'PENDING SEPARATE RECEPTION','H6':'IN PROGRESS','entryCount':len(entries),'payloadBytes':sum(e['bytes'] for e in entries),'entries':entries}
p=r/'audit-manifest-v1.json';assert not p.exists();p.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
result=subprocess.run([sys.executable,str(r/'verify-audit-manifest.py'),str(p)],capture_output=True,text=True)
assert result.returncode==0,result.stdout+result.stderr
readback=json.loads(result.stdout)
delivery={'schema':'H6-004-independent-audit-delivery/v1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS','packageRoot':str(r),'manifest':'audit-manifest-v1.json','manifestSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'readback':readback,'copyInstruction':'Copy exact paths from manifest entries preserving relative paths, plus audit-manifest-v1.json. The detached audit-delivery-v1.json may be copied separately. Never copy replica/private-runtime/node_modules. Do not mutate existing payloads; later documentary readback must be a separate addendum.','currentReport':'independent-verdict-v2.md','currentVerdict':'functional-verdict-v2.json','finalDocumentaryReadback':'PENDING SEPARATE RECEPTION'}
(r/'audit-delivery-v1.json').write_text(json.dumps(delivery,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':'PASS','manifest':str(p),'sha256':delivery['manifestSHA256'],'entries':len(entries),'bytes':manifest['payloadBytes'],'verdict':'independent-verdict-v2.md'},indent=2))
