from pathlib import Path
import json,hashlib,re,datetime,copy,subprocess
root=Path('/tmp/h6-004-independent-audit')
candidate=Path('/Users/andres/.codex/worktrees/h6-004-local/crm-huescaventura-os')
evidence=candidate/'tests/fixtures/h6-004'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
now=lambda:datetime.datetime.now(datetime.timezone.utc).isoformat()
def save(name,obj):
 p=root/name;content=json.dumps(obj,ensure_ascii=False,indent=2)+'\n'
 if p.exists():assert p.read_text()==content,name
 else:p.write_text(content)
expected='6469303177ee16e1cee10b896dc5f49d8e5e6c866e4130791892e58ffea9622d'
assert sha(root/'expected-v1.md')==expected
for e in json.loads((root/'expected-seal-v1.json').read_text())['entries']:assert sha(root/e['path'])==e['sha256']
add=root/'executor-evidence-addendum-v2';add.mkdir(exist_ok=True)
copy_sources=['coverage-matrix-v3.json','verification-v3.json','supplement_temporal-2026-10-22T23-59-43-197Z','quality-2026-10-23T00-00-31-851Z']
for name in copy_sources:
 p=evidence/name
 for src in ([p] if p.is_file() else sorted(x for x in p.rglob('*') if x.is_file())):
  dest=add/src.relative_to(evidence);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(src.read_bytes());assert sha(dest)==sha(src)
def snapshot(path):
 rel=Path(path).relative_to('tests/fixtures/h6-004')
 for d in [add,root/'executor-evidence-snapshot']:
  if (d/rel).is_file():return d/rel
 raise AssertionError('Missing snapshot '+path)
m=json.loads((add/'coverage-matrix-v3.json').read_text());old=json.loads((root/'independent-AC-matrix-v1.json').read_text());rows=[]
for row in m['rows']:
 r=copy.deepcopy(row)
 for ref in r['executedReferences']:
  p=snapshot(ref['path']);assert sha(p)==ref['sha256'];line=p.read_text().splitlines()[ref['line']-1];assert ref['name'] in line and ('✔' in line or re.match(r'\s*ok\b',line)),(ref['name'],line)
  assert snapshot(ref['inputManifest']).is_file()
  ref.update(verifiedIndependent=True,snapshotPath=str(p.relative_to(root)))
 previous=next(x for x in old['rows'] if x['ac']==r['ac'])
 for k in ['boundary','independentStatus']:
  if k in previous:r[k]=previous[k]
 if r['ac']=='AC-032':
  r['boundary']='S02 independently repeated: actual synthetic provider payment200 precedes cancellation facts.at on same Booking/service and leaves right200 unchanged. S01 remains historical and does not establish economic chronology. Auxiliary provider identity differs; one supplier identity throughout supplement is not asserted. A/B provider chain has separate coverage.'
 rows.append(r)
assert len(rows)==19 and sum(len(x['executedReferences']) for x in rows)==210
save('independent-AC-matrix-v2.json',{'schema':'H6-004-independent-AC-matrix/v2','base':old['base'],'status':'PASS','principalAC':19,'referencePositions':210,'sourceMatrix':'coverage-matrix-v3.json','sourceMatrixSHA256':sha(add/'coverage-matrix-v3.json'),'predecessor':'independent-AC-matrix-v1.json','predecessorSHA256':sha(root/'independent-AC-matrix-v1.json'),'rows':rows})
# Read each old and new raw test result; preserve every historical FAIL and correlate exact titles with a later PASS.
phases=[];cases=[]
for folder in [root/'executor-evidence-snapshot',add]:
 for metadata in sorted(folder.glob('*/phase-*.json')):
  meta=json.loads(metadata.read_text());log=metadata.with_suffix('.stdout.log')
  if not log.is_file():continue
  text=log.read_text();counts={}
  for line in text.splitlines():
   match=re.match(r'^(?:ℹ|#) (tests|pass|fail|cancelled|skipped) (\d+)\s*$',line)
   if match:counts[match[1]]=int(match[2])
  if 'tests' not in counts:continue
  parsed=[]
  for num,line in enumerate(text.splitlines(),1):
   if re.match(r'^(?:ℹ|#) tests ',line):break
   match=re.match(r'^\s*([✔✖]) (.+) \(([\d.]+)ms\)$',line)
   if match:parsed.append({'name':match[2],'status':'PASS' if match[1]=='✔' else 'FAIL','path':str(log.relative_to(root)),'line':num,'sha256':sha(log),'startedAt':meta.get('startedAt',''),'file':meta.get('file','')})
  # Unit quality is recorded separately from integration historical totals.
  if 'quality-' in str(metadata):continue
  assert len(parsed)==counts['tests'],(str(log),len(parsed),counts)
  assert sum(x['status']=='FAIL' for x in parsed)==counts['fail']
  cases.extend(parsed);phases.append({'run':metadata.parent.name,'file':meta.get('file'),'status':meta.get('status'),'counts':counts,'logSHA256':sha(log),'snapshot':str(log.relative_to(root))})
fails=[x for x in cases if x['status']=='FAIL'];passes=[x for x in cases if x['status']=='PASS'];pairs=[]
for f in fails:
 matches=[p for p in passes if p['name']==f['name'] and (p['file']==f['file'] or (f['file'] in ['postgres-h4-012-supplement.test.ts','postgres-h4-012-f16.test.ts'] and p['file']=='h6004compat-'+f['file'])) and (p['startedAt']>f['startedAt'] or Path(p['path']).parts[-2]>Path(f['path']).parts[-2])]
 assert matches, f
 pairs.append({'original':f,'successor':sorted(matches,key=lambda x:x['path'])[-1]})
assert (len(cases),len(passes),len(fails),len(pairs))==(1123,1006,117,117),(len(cases),len(passes),len(fails))
save('executor-raw-reconciliation-v2.json',{'schema':'H6-004-independent-raw-results-reconciliation/v2','createdAt':now(),'status':'PASS','totalTestRecords':len(cases),'historicalPass':len(passes),'historicalFail':len(fails),'reconciledFailures':len(pairs),'phases':phases,'correspondences':pairs,'errors':[],'boundary':'Separate directed runs. S01 retained as historical; S02 replaces its selected AC032 scope. No complete clean regression claimed.'})
# Own execution readback and S02 economic chronology.
runs={}
for d in sorted((root/'runs').iterdir()):
 meta=json.loads((d/'run.json').read_text());rc=[]
 for i,phase in enumerate(meta['phases'],1):
  log=d/f'phase-{i:02}.stdout.log'
  assert sha(log)==phase['stdoutSHA256']
  for n,line in enumerate(log.read_text().splitlines(),1):
   if re.match(r'^(?:ℹ|#) tests ',line):break
   match=re.match(r'^\s*([✔✖]) (.+) \(([\d.]+)ms\)$',line)
   if match:rc.append({'name':match[2],'status':'PASS' if match[1]=='✔' else 'FAIL','path':str(log.relative_to(root)),'line':n,'sha256':sha(log)})
 runs[meta['group']]={'directory':str(d.relative_to(root)),'status':meta['status'],'cases':rc,'phases':meta['phases']}
assert [len(runs[x]['cases']) for x in ['focal','controls','controls-successor','supplement','supplement-temporal']]==[31,8,8,1,1]
assert all(runs[x]['status']=='PASS' for x in ['focal','controls-successor','supplement','supplement-temporal'])
s02dir=root/runs['supplement-temporal']['directory'];obs=json.loads((s02dir/'ac032-temporal-readback.json').read_text())
pay=obs['paymentBeforeCancellation'];movement=pay['movements'][0]['material'];facts=obs['determination']['facts'];computed=obs['determination']['computed']
dt=lambda s:datetime.datetime.fromisoformat(s.replace('Z','+00:00'))
assert dt(movement['occurredAt'])<=dt(facts['at'])
assert movement['serviceId']==obs['serviceId'] and pay['bookingId']==obs['bookingId']
assert movement['amount']==computed['right']==computed['baseTotal']=='200.00' and computed['retention']=='0.00'
assert obs['paymentBeforeCancellation']==obs['paymentAfterCancellation'] and obs['fundsBeforeCancellation']==obs['fundsAfterCancellation'] and obs['refundCount']==0
save('temporal-supplement-readback-v1.json',{'status':'PASS','createdAt':now(),'source':'supplement-temporal-source-v1/tests/integration/postgres-h6-004-ac032-temporal.test.ts','sourceSHA256':sha(root/'supplement-temporal-source-v1/tests/integration/postgres-h6-004-ac032-temporal.test.ts'),'ownCase':runs['supplement-temporal']['cases'][0],'observed':str((s02dir/'ac032-temporal-readback.json').relative_to(root)),'observedSHA256':sha(s02dir/'ac032-temporal-readback.json'),'paymentOccurredAt':movement['occurredAt'],'cancellationFactsAt':facts['at'],'sameBooking':True,'sameService':True,'paid':'200.00','right':'200.00','retention':'0.00','fundsAndProviderPaymentUnchanged':True,'refundCount':0,'S01':'Preserved historical PASS but not selected for economic chronology.','supplierIdentityLimit':'Auxiliary cancellation provider differs; same Booking/service is established.'})
integ=json.loads((root/'integrity-v2.json').read_text());integ.update(schema='H6-004-independent-integrity/v3',createdAt=now(),predecessor='integrity-v2.json',predecessorSHA256=sha(root/'integrity-v2.json'))
for item in integ['product']:
 assert sha(candidate/item['path'])==sha(root/'replica'/item['path'])==item['baseSha256']
rel=Path('tests/integration/postgres-h6-004-ac032-temporal.test.ts');frozen=root/'supplement-temporal-source-v1'/rel
assert sha(candidate/rel)==sha(frozen)==sha(root/'replica'/rel)
integ['temporalSupplementFrozenSource']={'path':str(rel),'sha256':sha(frozen),'candidateMatches':True,'replicaMatches':True}
for item in integ['candidateFrozenSource']:
 # The v2 schema contains stable snapshots and the exact candidate identity.
 if isinstance(item,dict) and 'path' in item:
  path=Path(item['path']); actual=path if path.is_absolute() else candidate/path
  target=item.get('sha256',item.get('candidateSha256'))
  if target and actual.is_file():assert sha(actual)==target
integ['status']='PASS';save('integrity-v3.json',integ)
control=json.loads((root/'independent-control-matrix-v1.json').read_text());control['schema']='H6-004-independent-control-matrix/v2';control['predecessorSHA256']=sha(root/'independent-control-matrix-v1.json')
for row in control['controls']:
 if row['id']=='IA04-07':row['independentSupplement']=runs['supplement-temporal']['cases'];row['boundary']='S02 proves temporal payment-before-cancellation facts on same Booking/service. S01 historical and different auxiliary provider identity expressly preserved.'
 if 'artifacts' in row:row['artifacts']=[p.replace('independent-AC-matrix-v1','independent-AC-matrix-v2').replace('executor-raw-reconciliation-v1','executor-raw-reconciliation-v2').replace('integrity-v2','integrity-v3') for p in row['artifacts']]
save('independent-control-matrix-v2.json',control)
summary=json.loads((root/'functional-verdict-v1.json').read_text());summary.update(schema='H6-004-independent-functional-verdict/v2',createdAt=now(),predecessor='functional-verdict-v1.json',predecessorSHA256=sha(root/'functional-verdict-v1.json'))
summary['ownSelected']['selectedSupplement']='S02';summary['ownHistorical'].update(records=49,additionalInstrumentVerifierFAIL=2,**{'pass':47});summary['executorHistorical'].update(records=1123,**{'pass':1006});summary['executorSelected']['selectedSupplement']='S02'
summary['historicalSupplement']='S01 retained but replaced by S02 for selected AC032 coverage; no unique count inflation.'
summary['findings'][0]['resolution']='S01 showed actual supplier payment on same Booking/service but had old cancellation fact date. S02 uses current facts.at and asserts payment occurredAt <= facts.at, preserving right200 and funds. S02 frozen and repeated independently PASS. Matrices v1/v2 preserved; v3 maps S02.'
summary['findings'].append({'id':'AI04-COV-02','control':'IA04-07 / AC-032','status':'CLOSED','initial':'Implementer self-review identified that S01 registered supplier payment before cancellation but used historical cancellation facts.at.','resolution':'Additive S02 explicitly establishes economic chronology with current facts.at; independent execution and raw readback PASS. S01 and prior independent verdict v1 preserved as superseded evidence.'})
summary['limits']=[s.replace('S01 proves same Booking/service with prior supplier payment','S02 proves same Booking/service with chronologically prior supplier payment').replace('throughout S01','throughout S02') for s in summary['limits']]
summary['findings'].append({'id':'AI04-INST-04','status':'CLOSED','scope':'Finalization reconciliation initially required identical filename for preserved compatibility harness successors. Explicit two-file alias allows only the already independently verified CLI-only delta, while retaining exact title and later timestamp. Failed attempt and source retained.'})
summary['sourceFilesFrozen']=4
summary['qualityReviewed']={'path':'executor-evidence-addendum-v2/quality-2026-10-23T00-00-31-851Z','unitTests':210,'typecheck':'PASS','lint':'PASS','build':'PASS','boundary':'Executor evidence reviewed; not claimed as separate independent quality execution.'}
save('functional-verdict-v2.json',summary)
save('own-execution-index-v2.json',{'runs':runs,'summary':summary['ownSelected'],'historical':summary['ownHistorical'],'selectedGroups':['focal','controls-successor','supplement-temporal'],'historicalGroups':['controls','supplement']})
print(json.dumps({'status':'PASS','ownSelected':summary['ownSelected'],'ownHistorical':summary['ownHistorical'],'executorHistorical':summary['executorHistorical'],'AC':19,'positions':210,'controls':34,'chronology':{'paidAt':movement['occurredAt'],'factsAt':facts['at']}},indent=2))
