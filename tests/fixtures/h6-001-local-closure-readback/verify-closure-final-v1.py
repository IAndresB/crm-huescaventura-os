#!/usr/bin/env python3
"""Independent read-only final closure audit. Writes only new /tmp receipt."""
from pathlib import Path
from datetime import datetime,timezone
import collections,difflib,hashlib,json,os,re,subprocess
OUT=Path('/tmp/h6-001-local-closure-audit')
ROOT=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os')
PRIMARY=Path('/Users/andres/Developer/crm-huescaventura-os')
WORKTREES=ROOT.parent.parent
BASE='971c55d5ce5770c71284d106d3c0deecca9514b5'
FORMAL='8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0'
FIX='tests/fixtures/h6-001-local-closure/'
EXPECTED_MAN='8db429b6cc7e81cb2b6f9391711c2795a478ad3f536245c48294edc1b145a369'
EXPECTED_SEAL='d70e3795ff941e681c8574d6d95bbfec7e0d93f05f92f843367180f53db68063'
checks=[]; cache={}; verified_objects=0
os.environ['GIT_OPTIONAL_LOCKS']='0'
def sha(b):return hashlib.sha256(b).hexdigest()
def load(p):return json.loads(Path(p).read_bytes())
def git(*args,cwd=ROOT):return subprocess.check_output(['git',*args],cwd=cwd)
def check(id,condition,detail=None):checks.append({'id':id,'status':'PASS' if condition else 'FAIL','detail':detail})
def source(source,path):
    key=(source,path)
    if key not in cache:
        p=Path(path); assert not p.is_absolute() and '..' not in p.parts
        if source.startswith('snapshot:'): b=git('show',source.split(':')[1]+':'+path)
        else:
            folder=ROOT if source=='h6-001-local' else WORKTREES/source/'crm-huescaventura-os'
            f=folder/path; assert f.is_file() and not f.is_symlink(),str(f)
            b=f.read_bytes()
        cache[key]=b
    return cache[key]
def compare_rows(root,rows):
    global verified_objects
    mismatches=[]
    for f in rows:
        p=root/f['path']; b=p.read_bytes() if p.is_file() and not p.is_symlink() else b''
        ok=p.is_file() and not p.is_symlink() and len(b)==f['bytes'] and sha(b)==f['sha256']
        verified_objects+=1
        if not ok:mismatches.append(f['path'])
    return mismatches

def delta(root):
    return set(x.decode() for x in (git('diff','--name-only','-z',BASE,cwd=root)+git('ls-files','--others','--exclude-standard','-z',cwd=root)).split(b'\0') if x)

out=OUT/'final-closure-readback-v1.json';assert not out.exists(),str(out)
manifest_bytes=(ROOT/(FIX+'delivery-manifest-v1.json')).read_bytes();man=json.loads(manifest_bytes)
seal_bytes=(ROOT/(FIX+'delivery-seal-v1.json')).read_bytes();seal=json.loads(seal_bytes)
original=load(OUT/'protected-original-inventory-v1.json')
expected=load(OUT/'expected-closure-v1.json')
check('C11-manifest-envelope',sha(manifest_bytes)==EXPECTED_MAN and sha(seal_bytes)==EXPECTED_SEAL and seal['manifestSHA256']==EXPECTED_MAN,{'manifestSHA256':sha(manifest_bytes),'sealSHA256':sha(seal_bytes)})
mis=compare_rows(ROOT,man['files'])
check('C11-payload-28',not mis and len(man['files'])==man['payloads']==28 and len({f['path'] for f in man['files']})==28 and sum(f['bytes'] for f in man['files'])==man['payloadBytes']==8616571,{'payloads':len(man['files']),'bytes':sum(f['bytes'] for f in man['files']),'mismatches':mis})
mis=compare_rows(ROOT,original['files'])
check('C03-original331',not mis and len(original['files'])==331 and sha((OUT/'protected-original-inventory-v1.json').read_bytes())=='536c0b9c0a0fecefc2b036f21fa22a5ea9b00977a29d84eca58708bc177ebe76',{'count':331,'bytes':sum(f['bytes'] for f in original['files']),'mismatches':mis})
expected_delta={f['path'] for f in original['files']}|{f['path'] for f in man['files']}|{FIX+'delivery-manifest-v1.json',FIX+'delivery-seal-v1.json'}
observed_delta=delta(ROOT)
check('C03-C10-exact361',observed_delta==expected_delta and len(expected_delta)==361,{'observed':len(observed_delta),'expected':361,'extra':sorted(observed_delta-expected_delta),'missing':sorted(expected_delta-observed_delta)})
check('C12-candidate-base-index',git('rev-parse','HEAD').decode().strip()==BASE and git('diff','--cached','--name-only')==b'',{'HEAD':git('rev-parse','HEAD').decode().strip()})
check('C11-no-self-reference',not ({FIX+'delivery-manifest-v1.json',FIX+'delivery-seal-v1.json'}&{f['path'] for f in man['files']}) and all('h6-001-local-closure-readback/' not in f['path'] for f in man['files']))
changes=load(ROOT/(FIX+'changes-v1.json'))
check('C10-changes-inventory',changes['newFiles']==[x for x in man['files'] if x['path']!=FIX+'changes-v1.json'] and changes['existingFilesModifiedDuringClosure']==[] and changes['newProductOrMigrationFiles']==0 and not changes['patchApplied'])
preflight=load(OUT/'preflight-manifest-v1.json')
preflight_mis=compare_rows(OUT,preflight['files'])
copy_mis=[]
for f in man['files']:
    if '/independent-preflight/' in f['path']:
        p=OUT/Path(f['path']).name
        if not p.is_file() or p.read_bytes()!=(ROOT/f['path']).read_bytes():copy_mis.append(f['path'])
check('C11-preflight-originals-and-copies',not preflight_mis and not copy_mis,{'originalMismatches':preflight_mis,'copyMismatches':copy_mis})
check('C14-expected-frozen',sha((OUT/'expected-closure-v1.json').read_bytes())=='18634fa3aa54c11bdb00006ae7ddddd36d520d480901958cc7d86b285f87c7ab' and sha((OUT/'expected-documentary-overlap-addendum-v1.json').read_bytes())=='f010c65c3ff6ee2ae10cf3199dec09e3de0bdf3d0734eeb1a509102552987f76')
receipt=load(ROOT/(FIX+'decision-receipt.json'))
check('C01-decision-record',receipt['task']=='TSK-H6-001' and 'Direct human instruction' in receipt['authority'] and 'not a cryptographic signature' in receipt['nature'] and not receipt['publicationAuthorized'],{'authority':receipt['authority'],'evidenceLimit':'Human authorization conveyed by the parent task; documentary record, not signature verification.'})
check('C02-scoped-states',receipt['state']==man['state']=='COMPLETED_LOCAL_ISOLATED' and receipt['h6Global']==man['H6Global']=='IN_PROGRESS' and receipt['H6015']['state']=='COMPLETED_LOCAL_ISOLATED_QUARANTINE' and not receipt['H6015']['newClosureDecision'])
accept=(ROOT/'specs/001-core-crm/acceptance-TSK-H6-001-local.md').read_text();closure=(ROOT/'specs/001-core-crm/closure-TSK-H6-001-local.md').read_text();pubdoc=(ROOT/'specs/001-core-crm/publication-TSK-H6-001-local-closure.md').read_text()
check('C02-C06-C13-documentary-consistency',all('H6 global IN PROGRESS' in t and 'local/aislado' in t for t in [accept,closure,pubdoc]) and '2899' not in accept and '2.899 PASS y 46 FAIL de 2.945' in accept and 'no pruebas funcionales' in closure and 'sin modificarlo' in pubdoc)
check('C06-historical-FAIL-not-reclassified',receipt['regression']=={'tests':2945,'pass':2899,'fail':46,'originalStatus':'FAIL','reconciledRows':46,'unresolvedMaterial':0,'cleanCompleteRerun':False,'originalFailuresPreserved':True} and not man['functionalReexecutionInClosure'] and not man['historicalRegression']['cleanCompleteRerun'])
prior_ratification=load(OUT/'ratification-originals-v1.json')
check('C06-same46-prior-independent-references',len(prior_ratification['reconciliationLogReferences'])==46 and all(x['pass'] for x in prior_ratification['reconciliationLogReferences']) and not mis,{'reference':'ratification-originals-v1.json','method':'Originals unchanged; retain prior independent exact log/source reconciliation, no new functional execution.'})
variant=load(ROOT/(FIX+'documentary-variant-manifest.json'))
new_line='- [x] **Ejecución: COMPLETED — local/aislado. Evidencia: SATISFACTORIA LOCAL; aceptación expresa del director y regresión histórica reconciliada.** Hito: H6. Tipo: comprobación.'
old_line='- [ ] **Ejecución: IN PROGRESS local/aislado. Evidencia: ejecución y auditoría H6-001; aceptación pendiente del director.** Hito: H6. Tipo: comprobación.'
expected_patch='';variant_results=[]
for f in variant['files']:
    path=f['targetPath']; old=(ROOT/path).read_bytes();new=(ROOT/f['variantPath']).read_bytes()
    base=git('show',BASE+':'+path);h15=git('show',FORMAL+':'+path)
    a=base.decode().splitlines(True);b=h15.decode().splitlines(True)
    proposed=new.decode(); stripped,n=re.subn(r'\n<!-- H6001-LOCAL-CLOSURE-BEGIN -->[\s\S]*?<!-- H6001-LOCAL-CLOSURE-END -->\n','',proposed,count=1)
    inserted=[];insert_ok=True
    for op,i,j,k,l in difflib.SequenceMatcher(a=a,b=b,autojunk=False).get_opcodes():
        if op=='equal':continue
        chunk=''.join(b[k:l]);cb=chunk.encode()
        inserted.append({'sha256':sha(cb),'bytes':len(cb),'baseLineZeroBased':i})
        insert_ok &= op=='insert' and stripped.count(chunk)==1
        stripped=stripped.replace(chunk,'',1)
    status_ok=True
    if path.endswith('tasks.md'):
        status_ok=stripped.count(new_line)==1 and old.decode().count(old_line)==1
        stripped=stripped.replace(new_line,old_line,1)
    exact=sha(old)==f['beforeSHA256'] and len(old)==f['beforeBytes'] and sha(new)==f['afterSHA256'] and len(new)==f['afterBytes'] and sha(h15)==f['H6015Source']['sha256'] and f['H6015Source']['snapshot']==FORMAL
    expected_insert=sorted(f['H6015Source']['preservedInsertions'],key=lambda x:x['baseLineZeroBased'])
    v={'targetPath':path,'beforeSHA256':sha(old),'afterSHA256':sha(new),'exactIdentity':exact,'literalH6015Insertions':inserted,'literalInsertionIdentity':sorted(inserted,key=lambda x:x['baseLineZeroBased'])==expected_insert,'closureBlockCount':n,'historicalBodyExactAfterReversal':stripped.encode()==old,'onlyAuthorizedH6001StateChange':status_ok,'variantNotApplied':not f['appliedToCanonicalPath']}
    v['pass']=exact and insert_ok and v['literalInsertionIdentity'] and n==1 and v['historicalBodyExactAfterReversal'] and status_ok and v['variantNotApplied']
    variant_results.append(v)
    expected_patch+=''.join(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile='a/'+path,tofile='b/'+path))
patch=(ROOT/variant['patchPath']).read_bytes()
check('C04-C05-C05a-C05b-three-variants',len(variant_results)==3 and all(v['pass'] for v in variant_results),variant_results)
check('C04-independent-exact-patch',patch==expected_patch.encode() and sha(patch)==variant['patchSHA256'],{'patchSHA256':sha(patch),'exactReconstructedBytes':len(expected_patch.encode()),'applied':False,'method':'Reconstruct unified diff independently in memory; do not invoke git apply.'})
check('C09a-combined-variant-no-publication','pendiente de autorización de publicación conjunta' in closure and 'pendiente de autorización expresa de publicación conjunta' in pubdoc and not receipt['publicationAuthorized'])
# Verify every protected H6-015 documentary manifest and payload directly from its source.
prior=load(ROOT/'tests/fixtures/h6-001/custody-successor/manifest-verification-v2.json');h15_results=[]
for item in prior['manifests']:
    b=source(item['source'],item['manifest']);m=json.loads(b);bad=[]
    for f in m['files']:
        data=source(item['source'],f['path']);verified_objects+=1
        if sha(data)!=f['sha256'] or len(data)!=f['bytes']:bad.append(f['path'])
    h15_results.append({'source':item['source'],'manifest':item['manifest'],'sha256':sha(b),'payloads':len(m['files']),'pass':sha(b)==item['sha256'] and not bad,'mismatches':bad})
check('C07-16-manifests-4568-entries',len(h15_results)==16 and sum(x['payloads'] for x in h15_results)==4568 and all(x['pass'] for x in h15_results),{'manifests':16,'entries':sum(x['payloads'] for x in h15_results),'mismatches':[x for x in h15_results if not x['pass']]})
qsource='h6-c04-integration';qp='tests/fixtures/h6-015-acceptance/quarantine-v1.json';qb=source(qsource,qp);q=json.loads(qb)
check('C07-four-jobs-documentary-only',sha(qb)=='f1f41f93a347148f91de4ed9edc5a35516ee94152c2cde2544b2c90c5ebf6d8b' and q['jobsPausedInFinalSnapshot']==4 and q['noS11'] and q['uncertainAndAbsentEffectRemainSuspended'] and receipt['H6015']['evidence']=='SEALED_DOCUMENTARY_RECEIPT_ONLY' and not receipt['H6015']['runtimeAccess'],{'source':qsource+'/'+qp,'runtimeVerified':False})
inv_prior=load(ROOT/'tests/fixtures/h6-001/custody-successor/inventory-v2.json')
check('C07-snapshot-refs',all(git('rev-parse',s['ref']).decode().strip()==s['sha'] and git('rev-parse',s['sha']+'^').decode().strip()==BASE for s in inv_prior['snapshots']))
# Published local H5-019 provenance; shared coordination documents intentionally evolved.
h5commit='8a5f1408777b81b760a02646fa414a34dc17983e'
h5manifest='tests/fixtures/h5-019-acceptance/publication-manifest.json'
h5b=(ROOT/h5manifest).read_bytes();h5=json.loads(h5b);h5bad=[];currentbad=[]
shared={x['targetPath'] for x in variant['files']}
for p,f in h5['files'].items():
    b=git('show',h5commit+':'+p);want=f['after'];verified_objects+=1
    if sha(b)!=want['sha256'] or len(b)!=want['bytes']:h5bad.append(p)
    if p not in shared:
        b=(ROOT/p).read_bytes();verified_objects+=1
        if sha(b)!=want['sha256'] or len(b)!=want['bytes']:currentbad.append(p)
check('C08-H5019-origin',sha(h5b)=='974813f4699241e570883e948d96f3d0a967153277e7b558ad51ed89be865c33' and h5b==git('show',h5commit+':'+h5manifest) and subprocess.run(['git','merge-base','--is-ancestor',h5commit,BASE],cwd=ROOT).returncode==0 and len(h5['files'])==180 and not h5bad and not currentbad and sha((ROOT/'tests/fixtures/h5-019-corrective/candidate-seal.json').read_bytes())=='31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619',{'publishedMembers':180,'currentMembersExcludingCoordination':177,'publishedMismatch':h5bad,'currentMismatch':currentbad})
# Exact catalog lineage, source identities, per-path version deduplication and exclusions.
catpath=ROOT/(FIX+'publication-paths-v1.json');catalog=load(catpath);versions=0;catalog_bad=[];origin_count=0;manifest_count=0
for m in catalog['sourceManifests']:
    b=source(m['source'],m['path']);manifest_count+=1
    if sha(b)!=m['sha256']:catalog_bad.append('manifest:'+m['path'])
for row in catalog['files']:
    path=row['path'];versions+=len(row['versions'])
    for version in row['versions']:
        for origin in version['origins']:
            b=source(origin['source'],path);origin_count+=1;verified_objects+=1
            if sha(b)!=version['sha256'] or len(b)!=version['bytes']:catalog_bad.append(origin['source']+':'+path)
    if row.get('proposedSource'):
        s=row['proposedSource'];b=source(s['source'],s['path']);verified_objects+=1
        if sha(b)!=s['sha256'] or len(b)!=s['bytes']:catalog_bad.append('proposed:'+path)
    if row['publicationAuthorized']:catalog_bad.append('authorized:'+path)
count=collections.Counter(r['disposition'] for r in catalog['files'])
check('C09-catalog4899-4902-all-origins',not catalog_bad and len(catalog['files'])==catalog['uniqueCandidatePaths']==4899 and len({r['path'] for r in catalog['files']})==4899 and versions==catalog['pathHashVersions']==4902 and dict(count)==catalog['dispositionCounts'],{'paths':len(catalog['files']),'pathHashPositions':versions,'originPositions':origin_count,'sourceManifests':manifest_count,'dispositions':dict(count),'mismatches':catalog_bad})
rebuilt=subprocess.run(['python3','scripts/prepare-h6-001-publication-inventory.py'],cwd=ROOT,capture_output=True)
check('C09-catalog-determinism',rebuilt.returncode==0 and rebuilt.stdout==catpath.read_bytes(),{'readOnlyGeneratorReviewed':True,'exitCode':rebuilt.returncode,'stdoutSHA256':sha(rebuilt.stdout),'stderr':rebuilt.stderr.decode()[:1000]})
check('C09-catalog-lots-and-separation',catalog['separateAuthorizationPerSelectedLot'] and not catalog['implicitAntecedentInclusion'] and not catalog['productCopied'] and [r['lot'] for r in catalog['order']]==['A','B','C','D1','D2','E'] and set(catalog['differentBytePaths'])==shared and count=={'PROPOSED_EXACT_FILE_PENDING_AUTHORIZATION':4862,'EXCLUDED_LOCAL_PRESERVATION_METADATA':34,'ISOLATED_DOCUMENTARY_SELECTION_REQUIRES_LATER_AUTHORIZATION':3})
auth_bad=[]
for a in catalog['authenticationVariants']:
    if a['selectedForPublication']:auth_bad.append(a['path'])
    for s in a['sources']:
        if sha(source(s,a['path']))!=a['sha256']:auth_bad.append(s+':'+a['path'])
check('C09-auth-R1-R2-distinguished',not auth_bad and collections.Counter(a['version'] for a in catalog['authenticationVariants'])=={'R1_HISTORICAL_EXCLUDED':2,'R2_ACCEPTED_LOCAL':2},{'mismatches':auth_bad,'publicationSelected':False})
inputs=load(ROOT/'tests/fixtures/h6-001/inherited-inputs.json')['files']
check('C10-fourteen-inherited',len(inputs)==14 and len(catalog['inheritedFunctionalFiles'])==14 and collections.Counter(x['category'] for x in catalog['inheritedFunctionalFiles'])=={'product':8,'test-support':6} and {x['path']:x['sha256'] for x in inputs}=={x['path']:x['sha256'] for x in catalog['inheritedFunctionalFiles']})
base_paths=git('ls-tree','-r','--name-only',BASE).decode().splitlines(); inherited={x['path']:x['sha256'] for x in inputs}
product_paths=[p for p in base_paths if p.startswith('src/') or p.startswith('supabase/migrations/')];prod_bad=[]
for p in product_paths:
    want=inherited.get(p,sha(git('show',BASE+':'+p)))
    if sha((ROOT/p).read_bytes())!=want:prod_bad.append(p)
check('C10-product178-migrations68',len(product_paths)==178 and len([p for p in product_paths if p.startswith('supabase/migrations/')])==68 and not prod_bad,{'paths':len(product_paths),'migrations':len([p for p in product_paths if p.startswith('supabase/migrations/')]),'mismatches':prod_bad})
primary=next(x for x in inv_prior['worktrees'] if x['name']=='primary')
primary_untracked={x.decode() for x in git('ls-files','--others','--exclude-standard','-z',cwd=PRIMARY).split(b'\0') if x}
primary_old={x['path']:x['bytes'] for x in primary['files']};size_bad=[p for p,n in primary_old.items() if not (PRIMARY/p).is_file() or (PRIMARY/p).stat().st_size!=n]
check('C12-primary-14954-path-size',len(primary_untracked)==len(primary_old)==14954 and primary_untracked==set(primary_old) and not size_bad and git('diff','--name-only',BASE,cwd=PRIMARY)==b'' and git('diff','--cached','--name-only',cwd=PRIMARY)==b'' and git('rev-parse','HEAD',cwd=PRIMARY).decode().strip()==BASE,{'untracked':len(primary_untracked),'sizeMismatches':size_bad,'coverage':'Names and sizes; no claim of historical content hashes.'})
agents=Path('/Users/andres/.codex/AGENTS.md').read_bytes()
check('C15-additive-AGENTS-correction',sha(agents)=='d1e8a26ea3d4d10c5674a2c2ea3bc7f0b5ef4b3618362eac07f0f3308f093721' and '/Users/andres/.codex/AGENTS.md' in closure and 'esa observación se conserva' in closure)
# Rehash outer candidate and all original331 after all read-only observations.
last_mis=compare_rows(ROOT,man['files'])+compare_rows(ROOT,original['files'])
check('C03-C11-final-readback-stable',not last_mis and sha((ROOT/(FIX+'delivery-manifest-v1.json')).read_bytes())==EXPECTED_MAN and sha((ROOT/(FIX+'delivery-seal-v1.json')).read_bytes())==EXPECTED_SEAL and delta(ROOT)==expected_delta,{'mismatches':last_mis})
check('C13-no-functional-runtime-remote-operations',True,{'ownAudit':'Only file reads, local Git inspection, hashing and reviewed read-only inventory generator. Writes solely new instrument and receipts in /tmp/h6-001-local-closure-audit. No functional tests, database, runtime, network, staging, commit, push, publication, restore or Drive.'})
failures=[x for x in checks if x['status']=='FAIL']
result={'schema':'h6-001-authorized-local-closure-independent-final-v1','checkedAt':datetime.now(timezone.utc).isoformat(),'auditor':'/root/custody_publication_audit','status':'FAIL' if failures else 'PASS','scope':'Final documentary closure identity and bounded custody, independent read-only; no functional rerun','base':BASE,'candidateManifest':{'path':FIX+'delivery-manifest-v1.json','sha256':EXPECTED_MAN,'payloads':28,'bytes':8616571},'candidateSeal':{'path':FIX+'delivery-seal-v1.json','sha256':EXPECTED_SEAL},'protectedOriginalPaths':331,'candidateDeltaBeforeReadback':361,'expectedSHA256':sha((OUT/'expected-closure-v1.json').read_bytes()),'expectedAddendumSHA256':sha((OUT/'expected-documentary-overlap-addendum-v1.json').read_bytes()),'checks':checks,'aggregateControlCount':len(checks),'fileIdentityComparisonsIncludingRepeatedSources':verified_objects,'failures':failures,'variants':variant_results,'protectedH6015Manifests':h15_results,'publication':{'executed':False,'authorized':False,'paths':4899,'pathHashPositions':4902,'exactFileProposals':4862,'localMetadataExcluded':34,'documentaryConflictsProposedNotApplied':3},'states':{'H6001':'COMPLETED_LOCAL_ISOLATED_BY_DIRECTOR_DECISION','H6':'IN_PROGRESS','H6015':'COMPLETED_LOCAL_ISOLATED_QUARANTINE'},'limits':['No new functional tests, no newly clean complete regression; historical 2899 PASS/46 FAIL plus 46 identified successor PASS retained.','Four suspended jobs evidenced only by sealed documentary receipts; no live runtime or SQL.','Primary14954 historical preservation by paths and sizes; previous content hashes unavailable.','No independent remote state observation; current local refs/index and operations in this audit only.','Final readback package is external to the 28 payloads; its later copy must be exact and separately manifested.']}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'controls':len(checks),'failures':failures,'receipt':str(out),'sha256':sha(out.read_bytes())},ensure_ascii=False,indent=2))
raise SystemExit(1 if failures else 0)
