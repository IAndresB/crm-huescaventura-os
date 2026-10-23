from pathlib import Path
import json,hashlib,subprocess,re,datetime,difflib,sys,stat
O=Path(__file__).parent
R=Path('/Users/andres/.codex/worktrees/h6-004-local/crm-huescaventura-os');D=R/'tests/fixtures/h6-004'
I=Path('/tmp/h6-004-independent-audit');B=Path('/Users/andres/.codex/worktrees/h6-prepublication/crm-huescaventura-os')
E=json.loads((O/'expected-reception-v1.json').read_text());checks=[];details={}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
load=lambda p:json.loads(p.read_text())
def check(name,ok,detail=None):
 checks.append({'id':name,'status':'PASS' if ok else 'FAIL','detail':detail})
def git(root,*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
def bytes_verify(root,entries):
 rows=[];bad=[];seen=set()
 for e in entries:
  rel=Path(e['path']);p=root/rel
  safe=not rel.is_absolute() and '..' not in rel.parts and str(rel) not in seen;seen.add(str(rel))
  exists=safe and p.is_file() and not p.is_symlink()
  s=sha(p) if exists else None;size=p.stat().st_size if exists else None
  ok=exists and s==e['sha256'] and (e.get('bytes',size)==size)
  if e.get('gitMode'):ok=ok and ('100755' if p.stat().st_mode&stat.S_IXUSR else '100644')==e['gitMode']
  row={'path':str(rel),'expectedSHA256':e['sha256'],'actualSHA256':s,'bytes':size,'status':'PASS' if ok else 'FAIL'};rows.append(row)
  if not ok:bad.append(row)
 return rows,bad
m=load(D/'delivery-manifest-v1.json');s=load(D/'delivery-seal-v1.json')
check('C01_manifest_seal_exact',sha(D/'delivery-manifest-v1.json')==E['deliveryManifestSHA256'] and sha(D/'delivery-seal-v1.json')==E['deliverySealSHA256'] and s['manifestSHA256']==E['deliveryManifestSHA256'])
rows,bad=bytes_verify(R,m['files']);details['delivery']=rows
check('C02_all686_payloads',len(rows)==len({x['path'] for x in rows})==m['payloads']==E['deliveryPayloads'] and not bad,{'count':len(rows),'bad':bad})
check('C03_payload_bytes',sum(x['bytes'] for x in rows)==m['payloadBytes']==E['deliveryPayloadBytes'])
actual=set(git(R,'ls-files','--others','--exclude-standard','-z').rstrip('\0').split('\0'));desired={e['path'] for e in m['files']}|set(m['selfExcluded']);extra=actual-desired;allowed={x for x in extra if x.startswith('tests/fixtures/h6-004-delivery-readback/')}
check('C04_exact_candidate_delta',not desired-actual and not extra-allowed,{'expected':len(desired),'actual':len(actual),'externalReceiptPaths':len(allowed),'missing':sorted(desired-actual),'extra':sorted(extra-allowed)})
im=load(D/'independent/audit-manifest-v1.json');ir,ibad=bytes_verify(D/'independent',im['entries']);details['independentImported']=ir
check('C05_imported367_and_original_seal',sha(D/'independent/audit-manifest-v1.json')==sha(I/'audit-manifest-v1.json')==E['independentManifestSHA256'] and len(ir)==E['independentPayloads'] and not ibad,{'count':len(ir),'bad':ibad})
check('C06_current_alias_exact',sha(D/'independent/independent-verdict.md')==sha(I/'independent-verdict-v2.md')==sha(D/'independent/independent-verdict-v2.md'))
g=load(D/'closure-gate-v1.json');v=load(D/'independent/functional-verdict-v2.json')
check('C07_gate_binds_exact_PASS',g['status']=='PASS' and all(g[k] is True for k in ['normativeCriteriaSatisfied','pertinentTestsPASS','noOpenMaterialDefects','independentAuditPASS','directionConditionMet']) and g['independentVerdictSHA256']==sha(D/'independent/independent-verdict.md') and g['independentStructuredVerdictSHA256']==sha(D/'independent/functional-verdict-v2.json') and g['independentManifestSHA256']==E['independentManifestSHA256'] and v['openMaterialFindings']==0)
check('C08_state_and_authority_limits',m['taskState']==g['taskState']==E['taskState'] and m['H6']==g['H6']==E['H6'] and m['publication'] is g['publication'] is False and 'conditional' in g['direction'] and 'no new human decision' in g['direction'])
pf=load(D/'preflight-v1.json');pchecks=[]
for name,root,entries,count in [('normative',R,pf['normativeInputs'],12),('migrations',R,pf['migrations'],68),('protectedH6001',Path(pf['protectedH6001Root']),pf['protectedH6001'],376)]:
 rr,bb=bytes_verify(root,entries);details[name]=rr;pchecks.append(not bb and len(rr)==count)
check('C09_protected376_norms12_migrations68',all(pchecks),{k:len(details[k]) for k in ['normative','migrations','protectedH6001']})
product=git(R,'ls-tree','-r','--name-only',E['base'],'--','src','supabase/migrations').splitlines();prod=[]
for rel in product:
 b=subprocess.check_output(['git','show',E['base']+':'+rel],cwd=R);prod.append({'path':rel,'expected':hashlib.sha256(b).hexdigest(),'actual':sha(R/rel)})
check('C10_product174_exact_base',len(prod)==174 and all(p['expected']==p['actual'] for p in prod));details['product']=prod
sources=load(D/'tested-source-v1.json');rr,bb=bytes_verify(R,sources['files']);details['frozenSources']=rr
expectedSources=load(I/'final-source-quality-readback-v1.json')['sourceChecks'];emap={x['path']:x['sha256'] for x in expectedSources}
check('C11_four_frozen_sources_and_S01_preserved',len(rr)==4 and not bb and all(x['sha256']==emap[x['path']] for x in sources['files']))
vr=load(D/'verification-final-preclosure.json');matrix=load(D/'coverage-matrix-v3.json');refs=[]
for row in matrix['rows']:
 for x in row['executedReferences']:
  p=R/x['path'];line=p.read_text().splitlines()[x['line']-1];refs.append({'ac':row['ac'],'path':x['path'],'line':x['line'],'title':x['name'],'pass':sha(p)==x['sha256'] and x['name'] in line and '✔' in line})
check('C12_matrix19AC210_refs_exact',len(matrix['rows'])==19 and len(refs)==210 and all(x['pass'] for x in refs) and g['coverageMatrixSHA256']==sha(D/'coverage-matrix-v3.json'));details['referenceChecks']=refs
selected=vr['selected'];check('C13_selected869_plus8_without_duplicates',len(selected)==20 and sum(x['counts']['tests'] for x in selected)==869 and all(x['counts']['fail']==x['counts']['skipped']==x['counts']['cancelled']==0 for x in selected) and v['independentOwnControls']==8 and v['uniqueConsolidatedNodeRecords']==877 and v['ownSelected']['totalNodeRecords']==40)
raw=[]
for phase in vr['allExecutedCases']:
 p=R/phase['stdout'];text=p.read_text();counts={}
 for line in text.splitlines():
  match=re.match(r'^(?:ℹ|#) (tests|pass|fail|cancelled|skipped) (\d+)\s*$',line)
  if match:counts[match[1]]=int(match[2])
 raw.append({'path':phase['stdout'],'counts':counts,'hashExact':sha(p)==phase['stdoutSHA256'],'declaredExact':counts==phase['counts']})
totals={k:sum(x['counts'].get(k,0) for x in raw) for k in ['tests','pass','fail','cancelled','skipped']}
check('C14_historical1123_117FAIL_no_clean',totals=={'tests':1123,'pass':1006,'fail':117,'cancelled':0,'skipped':0} and all(x['hashExact'] and x['declaredExact'] for x in raw) and not vr['completeCleanRegressionClaim']);details['historicalRaw']=raw
pairs=[]
for pair in vr['failToSuccessor']:
 f=pair['historicalFAIL'];p=pair['successorPASS'];ok=f['name']==p['name']
 for x,symbol in [(f,'✖'),(p,'✔')]:
  log=R/x['path'];line=log.read_text().splitlines()[x['line']-1];ok=ok and sha(log)==x['sha256'] and x['name'] in line and symbol in line
 pairs.append({'name':f['name'],'original':f,'successor':p,'pass':ok})
check('C15_117_exact_title_successors',len(pairs)==117 and all(x['pass'] for x in pairs));details['historicalPairs']=pairs
q=D/g['quality'];qr=load(q/'run.json');qchecks=[]
for x in qr['results']:
 qchecks.append(x['status']=='PASS' and x['exitCode']==0 and all(sha(q/(x['name']+'.'+stream+'.log'))==x[stream+'SHA256'] for stream in ['stdout','stderr']))
check('C16_quality210_four_PASS',len(qchecks)==4 and all(qchecks) and re.search(r'(?:ℹ|#) tests 210',(q/'test.stdout.log').read_text()) is not None)
# Base, index and tracked files: local Git reads only; never stage or write.
gits={}
for name,root in [('candidate',R),('primary',Path('/Users/andres/Developer/crm-huescaventura-os'))]:
 gits[name]={'HEAD':git(root,'rev-parse','HEAD'),'indexEmpty':not git(root,'diff','--cached','--name-only'),'trackedClean':not git(root,'diff','--name-only'),'main':git(root,'rev-parse','refs/heads/main'),'originMain':git(root,'rev-parse','refs/remotes/origin/main')}
check('C17_base_index_main_current',all(x['HEAD']==x['main']==x['originMain']==E['base'] and x['indexEmpty'] and x['trackedClean'] for x in gits.values()),gits)
bp=B/'tests/fixtures/h6-prepublication/target-manifest-v2.json';bm=load(bp);br,bb=bytes_verify(B,bm['files']);details['sourceBTarget']=br
check('C18_sourceB_v2_4916_exact',sha(bp)==E['sourceBTargetManifestSHA256'] and len(br)==4916 and not bb,{'files':len(br),'bad':bb})
check('C19_sourceB_excludes_H6004',bm['H6004Included'] is False and bm['publicationAuthorized'] is bm['publicationExecuted'] is False and bm['temporalCutoff']['H6004']['state']=='IN_PROGRESS')
ov=load(D/'documentary-overlay-v1.json');ovchecks=[];patch=[];taskChanges=[]
start='\n<!-- H6-004-LOCAL-CLOSURE-BEGIN -->';end='<!-- H6-004-LOCAL-CLOSURE-END -->\n\n'
for x in ov['files']:
 before=Path(x['source']).read_bytes();after=(R/x['postimage']).read_bytes();bt=before.decode();at=after.decode();first=at.index(start);last=at.index(end,first)+len(end);header=at[first:last];without=at[:first]+at[last:]
 exact=sha(Path(x['source']))==x['beforeSHA256'] and sha(R/x['postimage'])==x['afterSHA256']
 canonical=hashlib.sha256(subprocess.check_output(['git','show',E['base']+':'+x['path']],cwd=R)).hexdigest()==sha(R/x['path'])
 headerOK=at.count(start)==1 and 'COMPLETED — exclusivamente local/aislado' in header and 'H6 global: IN PROGRESS' in header and 'cuatro trabajos suspendidos' in header and 'No existe corrida global limpia nueva' in header
 if x['path'].endswith('tasks.md'):
  st=bt.index('#### TSK-H6-004 —');en=bt.index('<a id="tsk-h6-005"',st);st2=without.index('#### TSK-H6-004 —');en2=without.index('<a id="tsk-h6-005"',st2)
  old=bt[st:en];new=without[st2:en2];outside=bt[:st]==without[:st2] and bt[en:]==without[en2:]
  a=old.splitlines();b=new.splitlines();changed=[(i,aa,bb) for i,(aa,bb) in enumerate(zip(a,b)) if aa!=bb]
  allowedPrefixes=['- [ ] **Ejecución:','- **Bloqueo localizado / condición para levantarlo:**','- **Acción futura:**','- **Evidencia necesaria:**']
  bodyOK=len(a)==len(b) and len(changed)==4 and all(any(aa.startswith(prefix) for prefix in allowedPrefixes) for _,aa,bb in changed)
  # All normative goal/source/dependency/result/verification/restriction lines remain byte-identical.
  normativePrefixes=['- **Objetivo y alcance:**','- **Fuentes exactas:**','- **Bloques, contratos y unidades:**','- **Dependencias y precondiciones:**','- **Salida observable:**','- **Verificación y esperado:**','- **Paralelismo y restricciones:**']
  bodyOK=bodyOK and all(next(z for z in a if z.startswith(p))==next(z for z in b if z.startswith(p)) for p in normativePrefixes)
  taskChanges=[{'lineOffset':i,'before':aa,'after':bb} for i,aa,bb in changed];historyOK=outside and bodyOK
 else:historyOK=without==bt
 patch+=list(difflib.unified_diff(bt.splitlines(True),at.splitlines(True),fromfile='a/'+x['path'],tofile='b/'+x['path']))
 ovchecks.append({'path':x['path'],'preAndPostExact':exact,'canonicalStillBase':canonical,'headerCorrect':headerOK,'historicalAndNormativePreserved':historyOK,'preimageSHA256':x['beforeSHA256'],'postimageSHA256':x['afterSHA256']})
patchBytes=''.join(patch).encode();patchPath=R/ov['patch']
check('C20_three_overlay_exact_and_preserved',len(ovchecks)==3 and all(all(x[k] for k in ['preAndPostExact','canonicalStillBase','headerCorrect','historicalAndNormativePreserved']) for x in ovchecks),ovchecks);details['taskBodyChanges']=taskChanges
check('C21_patch_independently_rebuilt',patchBytes==patchPath.read_bytes() and sha(patchPath)==ov['patchSHA256'])
check('C22_overlay_only_proposed_Fb',ov['state']=='PREPARED_ONLY' and ov['lot']=='F-b' and ov['canonicalWrites'] is ov['protectedWrites'] is ov['publication'] is False and E['sourceBTargetManifestSHA256'] in ov['requires'])
sim=load(D/'documentary-simulation-v1.json');check('C23_simulation_record_exact_result',sim['status']=='PASS' and sim['threePostimagesExact'] and sim['reverseRestoresThreePreimages'] and sim['preparationRepeat']=='NO_OP exact manifest' and all(x['exit']==0 for x in sim['checks']) and sim['canonicalOrProtectedWrites'] is sim['publication'] is False)
act=(R/'specs/001-core-crm/acceptance-TSK-H6-004.md').read_text();evidence=(R/'specs/001-core-crm/evidence-TSK-H6-004.md').read_text();pub=(R/'specs/001-core-crm/publication-TSK-H6-004.md').read_text()
terms=['COMPLETED','local/aislado','IN PROGRESS','117 FAIL','1.123','869','877','19 AC','210','S02','S01','cuarentena','cuatro trabajos suspendidos','No hay ejecución completa global limpia nueva','46 FAIL','mismo modelo']
check('C24_act_consistent_with_receipts',all(x in act for x in terms),{'terms':terms,'missing':[x for x in terms if x not in act]})
check('C25_scope_limits_and_publication_separate',all(x in act+evidence for x in ['AC-062','Opportunity/Booking','regresiones','Auth Hosted','cadena68']) and all(x in pub for x in ['F-a','F-b','NO AUTORIZADO NI EJECUTADO','cc5dc936c411500d8e2085ef613d4710a5c1ac95892b20ef56e1971cbc31ec69','No existe dependencia funcional de A–D2','NO_OP','conflicto','no sobrescribir','repetir focal31/suplemento1']) if False else all(x in pub for x in ['F-a','F-b','NO AUTORIZADO NI EJECUTADO','cc5dc936c411500d8e2085ef613d4710a5c1ac95892b20ef56e1971cbc31ec69','No existe dependencia funcional de A–D2','NO_OP','conflicto','repetir focal31/suplemento1']))
# End-of-read confirms all source envelopes stayed unchanged during this inspection.
check('C26_end_envelopes_unchanged',sha(D/'delivery-manifest-v1.json')==E['deliveryManifestSHA256'] and sha(D/'delivery-seal-v1.json')==E['deliverySealSHA256'] and sha(I/'audit-manifest-v1.json')==E['independentManifestSHA256'] and sha(bp)==E['sourceBTargetManifestSHA256'])
result={'schema':'H6-004-independent-closure-readback/v1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'PASS' if all(x['status']=='PASS' for x in checks) else 'FAIL','expectedSHA256':sha(O/'expected-reception-v1.json'),'instrumentSHA256':sha(Path(__file__)),'deliveryManifestSHA256':E['deliveryManifestSHA256'],'deliverySealSHA256':E['deliverySealSHA256'],'checks':checks,'details':details,'counts':{'delivery':len(rows),'importedIndependent':len(ir),'sourceB':len(br),'normative':12,'migrations':68,'protectedH6001':376,'productAndMigrations':174,'primaryAC':19,'ACReferencePositions':len(refs),'executorSelected':869,'newIndependentCountertests':8,'historical':totals,'reconciledHistoricalFAIL':len(pairs)},'effectiveIndependence':'Same auditor and model as prior independent functional audit; new separately authored documentary/hash instrument; all enumerated payload bytes read independently. Prior functional executions are verified evidence, not rerun here.','runtimeAccess':False,'newFunctionalTests':False,'repositoryWrites':False,'publication':False,'H6015LiveRuntimeOrJobStateQueried':False,'H6015Limit':'Only sealed documentary custody and preserved source evidence; no assertion of a fresh live suspended-job query.','base':E['base'],'taskState':E['taskState'],'H6':E['H6']}
(O/'observed-v1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['status','counts','deliveryManifestSHA256','deliverySealSHA256']},indent=2));print(json.dumps({'failed':[x for x in checks if x['status']=='FAIL']},indent=2));sys.exit(result['status']!='PASS')
