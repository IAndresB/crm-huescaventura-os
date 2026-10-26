from pathlib import Path
import hashlib,json,subprocess,tarfile,re,gzip,stat
root=Path.cwd();impl=Path('/Users/andres/.codex/worktrees/h6-005-local-isolated/crm-huescaventura-os');o=root/'audit/h6-005';errors=[]
sha=lambda b:hashlib.sha256(b).hexdigest()
manifest=impl/'tests/fixtures/h6-005/technical-manifest.json';m=json.loads(manifest.read_text());assert sha(manifest.read_bytes())=='7fc5d0f1447a00ba9568586b7d54dea7691fef8bfa17813c69714fcd730363ed'
for e in m['files']:
 p=impl/e['path'];b=p.read_bytes()
 if sha(b)!=e['sha256'] or len(b)!=e['bytes'] or oct(p.stat().st_mode&511)!=e['mode']:errors.append(e['path'])
archive=impl/'tests/fixtures/h6-005/custody/h6-005-technical-v1.tar.gz';assert sha(archive.read_bytes())=='18b6128edc0085384d88255084ef4a8eb7e2878fc9694cc0a46ff403c6e63980'
with tarfile.open(archive) as tar:
 members=tar.getmembers();d={x.name:x for x in members};assert len(members)==404 and len(d)==404
 for e in m['files']:
  member=d[e['path']];b=tar.extractfile(member).read();assert sha(b)==e['sha256'] and len(b)==e['bytes'] and oct(member.mode)==e['mode'],e['path']
 extras=set(d)-{x['path'] for x in m['files']};assert extras=={'tests/fixtures/h6-005/technical-manifest.json'},extras;assert tar.extractfile(d[next(iter(extras))]).read()==manifest.read_bytes()
# Git baseline is an independent oracle. Verify Git blob IDs, modes and bytes independently of implementer baseline.
ls=subprocess.check_output(['git','ls-tree','-rz','HEAD'],cwd=root).split(b'\0');protected=[]
for row in ls:
 if not row:continue
 meta,path=row.split(b'\t');mode,typ,blob=meta.split();p=path.decode();own=root/p;target=impl/p;b=own.read_bytes();actual=target.read_bytes();gitid=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();assert gitid==blob.decode(),p
 if actual!=b:errors.append('PROTECTED:'+p)
 protected.append({'path':p,'bytes':len(b),'sha256':sha(b),'mode':mode.decode()})
assert len(protected)==45783;assert len([x for x in protected if x['path'].startswith('supabase/migrations/') and x['path'].endswith('.sql')])==68
(o/'protected-git-baseline.json').write_text(json.dumps(protected,indent=2)+'\n')
# Verify independently every 39 original failed case name is a final successor PASS and original assertions intact.
f=impl/'tests/fixtures/h6-005';initial=(f/'regression-launch-v1.log').read_text();success=(f/'regression-successor-h4019-v2.log').read_text();name=lambda line:re.sub(r' \([0-9.]+ms\)$','',line[2:].strip());failed=[name(l) for l in initial.splitlines() if l.startswith('✖ ') and ' failing tests' not in l];failed=list(dict.fromkeys(failed));passed=[name(l) for l in success.splitlines() if l.startswith('✔ ')];assert len(failed)==39,(len(failed),failed);assert len(passed)==63
mapping=json.loads((f/'findings-regression39-successors.json').read_text());assert {x['failedCase'] for x in mapping}==set(failed);assert all(n in passed for n in failed)
original=(root/'tests/integration/postgres-h4-019.test.ts').read_text();derivative=(impl/'tests/integration/h6005-regression-postgres-h4-019.test.ts').read_text();ports=json.loads((f/'regression-selection.json').read_text())['portMap'];expected=original
for a,b in ports.items():expected=re.sub(r'\b'+a+r'\b',b,expected)
expected=expected.replace('../support/h4-joint-refund-fixtures.ts','../support/h6005-joint-refund-fixtures.ts');assert derivative=='// H6005 isolated port-only derivative; normative assertions preserved.\n'+expected
fixture=(root/'tests/support/h4-joint-refund-fixtures.ts').read_text().replace("'./h4-cancellation-fixtures.ts'","'./h5-017-g-cancellation-fixtures.ts'");assert (impl/'tests/support/h6005-joint-refund-fixtures.ts').read_text()=='// H6005 current temporal evidence variant; historical source intact.\n'+fixture
(o/'regression39-independent.json').write_text(json.dumps({'status':'PASS','initial551':{'pass':512,'fail':39},'successor63':{'pass':63,'fail':0},'uniqueFinal':551,'assertionsBytePreserved':True,'fixtureOnlyChange':'use published h5-017-g chronology fixture; exact import replacement','mapping':[{'originalFailedName':n,'successorPassedName':n} for n in failed]},indent=2)+'\n')
# H5-019 external original audit payloads414, no delegated reports substituted.
audit=Path('/Users/andres/Developer/crm-h5-019-corrective-independent-audit-20261018');inv=json.loads((audit/'AUDIT-INVENTORY.json').read_text())
for p,e in inv['files'].items():b=(audit/p).read_bytes();assert sha(b)==e['sha256'] and len(b)==e['bytes'],p
assert len(inv['files'])==414
# H6-017 sealed199 payloads, metadata all206? no mutation, read only.
h17=Path('/Users/andres/.codex/worktrees/h6-017-local-isolated/crm-huescaventura-os');delivery=json.loads((h17/'tests/fixtures/h6-017/delivery-manifest.json').read_text());n17=0
for e in delivery['files']:
 b=(h17/e['path']).read_bytes();assert sha(b)==e['sha256'] and len(b)==e['bytes'],e['path'];n17+=1
seal=json.loads((h17/'tests/fixtures/h6-017/delivery-seal.json').read_text());assert sha((h17/'tests/fixtures/h6-017/delivery-manifest.json').read_bytes())==seal['manifestSHA256'];assert sha(Path(seal['archive']).read_bytes())==seal['archiveSHA256']
# H6-015 documentary manifest references within Git-tracked baseline only, never runtime.
h15=[x for x in protected if 'h6-015' in x['path'].lower() and 'manifest' in x['path'].lower()];(o/'h6015-documentary-manifest-paths.json').write_text(json.dumps(h15,indent=2)+'\n')
result={'status':'PASS' if not errors else 'FAIL','errors':errors,'candidateManifestSHA256':sha(manifest.read_bytes()),'archiveSHA256':sha(archive.read_bytes()),'candidatePayloads':len(m['files']),'archiveFullStreamReadbackMembers':len(members),'gitProtectedFiles':len(protected),'migrations':68,'H5-019OriginalAuditPayloads':414,'H6-017SealedPayloads':n17,'H6-015':'Git/documentary bytes only; no runtime/SQL/S11/reentry or suspended job interaction','regression39':'PASS; exact names and unchanged assertions','productChanges':False};(o/'candidate-readback.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));assert not errors
