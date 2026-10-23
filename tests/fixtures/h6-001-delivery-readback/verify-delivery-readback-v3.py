import datetime,gzip,hashlib,json,os,re,subprocess
from pathlib import Path
OUT=Path('/tmp/h6-001-custody-audit');ROOT=Path('/Users/andres/.codex/worktrees/h6-001-local/crm-huescaventura-os');PRIMARY=Path('/Users/andres/Developer/crm-huescaventura-os');WTS=Path('/Users/andres/.codex/worktrees');BASE='971c55d5ce5770c71284d106d3c0deecca9514b5';ENV={**os.environ,'GIT_OPTIONAL_LOCKS':'0'}
MAN='tests/fixtures/h6-001/delivery-manifest-v1.json';MAN_SHA='d97ab86cd4d78c001f5a5e29f3ce501c0c6b44cf592a7b22e78589c26569c435';SEAL='tests/fixtures/h6-001/delivery-seal-v1.json';SEAL_SHA='17bda49a2b9a9d174024fe7d413b39f02b57c1e930be22c91a6cc09eb3d9bd99';AUD='tests/fixtures/h6-001/independent/audit-manifest-v1.json';AUD_SHA='dff39c22bde4a56e42af7d811df69a8438f8ed24b02f790e43360d13dc5d29e6';PUB='tests/fixtures/h6-001/publication-candidate-inventory.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()
def git(root,*args):return subprocess.check_output(['git',*args],cwd=root,env=ENV)
def data(rel,root=ROOT):
 p=root/rel
 if Path(rel).is_absolute() or '..' in Path(rel).parts or p.is_symlink() or not p.is_file():raise ValueError('Not a safe regular relative file: '+rel)
 return p.read_bytes()
def js(rel,root=ROOT):return json.loads(data(rel,root))
checks=[]
def check(name,ok,detail=None):checks.append({'id':name,'status':'PASS' if ok else 'FAIL','detail':detail})
def payloads(root,files):
 mismatches=[];actual=[]
 for f in files:
  try:
   b=data(f['path'],root);h=sha(b);actual.append({'path':f['path'],'bytes':len(b),'sha256':h})
   if h!=f['sha256'] or len(b)!=f['bytes']:mismatches.append({'path':f['path'],'actualSHA256':h,'actualBytes':len(b)})
  except Exception as e:mismatches.append({'path':f['path'],'error':str(e)})
 return {'entries':len(files),'verified':len(files)-len(mismatches),'bytes':sum(f['bytes'] for f in actual),'actualIdentityTableSHA256':sha(canonical(actual)),'mismatches':mismatches}
mb=data(MAN);sb=data(SEAL);m=json.loads(mb);s=json.loads(sb)
check('exterior-manifest-exact',sha(mb)==MAN_SHA,sha(mb));check('exterior-seal-exact',sha(sb)==SEAL_SHA,sha(sb));check('exterior-seal-binding',s['manifestPath']==MAN and s['manifestSHA256']==MAN_SHA and s['base']==BASE and s['payloads']==305 and s['payloadBytes']==52932020,s)
outer=payloads(ROOT,m['files']);ownpaths={f['path'] for f in m['files']};check('own-305-payloads',outer['verified']==305 and outer['entries']==305 and outer['bytes']==52932020 and m['payloads']==305 and m['payloadBytes']==52932020 and len(ownpaths)==305,outer)
check('own-envelope-separation',MAN not in ownpaths and SEAL not in ownpaths and not any(p.startswith('tests/fixtures/h6-001-delivery-readback/') for p in ownpaths),m['envelopesExcluded'])
check('formal-states-and-boundaries',m['base']==BASE and m['h6State']=='IN PROGRESS' and m['taskState'].startswith('IN PROGRESS') and 'pending director' in m['taskState'] and 'quarantine' in m['h6015State'] and all(m[k] is False for k in ['publicationAuthorized','publicationExecuted','externalBusinessEffects','realDataOrCredentials','s11Reentry','deploy']) and m['newProductChanges']==0 and m['newMigrations']==0,{'taskState':m['taskState'],'h6State':m['h6State'],'h6015State':m['h6015State']})
i=js(m['inheritedInputs']['path']);inh=i['files'];inhpaths={f['path'] for f in inh};inherited=[]
for f in inh:
 b=data(f['path']);src=Path(f['source']);same=sha(b)==f['sha256'] and len(b)==f['bytes'] and src.is_file() and not src.is_symlink() and sha(src.read_bytes())==f['sha256'];inherited.append({'path':f['path'],'sha256':sha(b),'pass':same})
check('14-inherited-exact-excluded',len(inh)==14 and all(f['pass'] for f in inherited) and not (inhpaths&ownpaths) and sha(data(m['inheritedInputs']['path']))==m['inheritedInputs']['sha256'],inherited)
pub=js(PUB);pubpaths={f['path'] for f in pub['ownFiles']};manifestmap={f['path']:f for f in m['files']}
check('publication-inventory-path-equality',len(pub['ownFiles'])==304 and pubpaths|{PUB}==ownpaths and pub['ownPayloadFilesIncludingThisInventory']==305 and pub['inheritedFiles']==14 and len(pub['inherited'])==14,{'ownListed':len(pubpaths),'plusSelf':PUB,'inheritedCount':pub['inheritedFiles']})
check('publication-inventory-identities',all(all(f[k]==manifestmap[f['path']][k] for k in ['sha256','bytes']) for f in pub['ownFiles']) and {(f['path'],f['sha256'],f['bytes']) for f in pub['inherited']}=={(f['path'],f['sha256'],f['bytes']) for f in inh},'304 independent payload identity entries and 14 inherited entries match exactly')
check('publication-pending-five-separate-lots',pub['state']=='PREPARED_ONLY_NO_PUBLICATION_AUTHORIZATION' and pub['publicationExecuted'] is False and {f['lot'] for f in pub['accumulatedLots']}==set('ABCDE') and pub['newProductChanges']==0 and pub['newMigrations']==0,{'lots':pub['accumulatedLots'],'conflicts':pub['conflicts'],'excluded':pub['excluded']})
aroot=ROOT/'tests/fixtures/h6-001/independent';ab=data(AUD);a=json.loads(ab);audit=payloads(aroot,a['files']);check('functional-audit-manifest-exact',sha(ab)==AUD_SHA and m['independentAudit']['sha256']==AUD_SHA,sha(ab));check('functional-audit-173-payloads',audit['verified']==173 and audit['entries']==173 and audit['bytes']==14044516 and a['payloads']==173 and a['payloadBytes']==14044516,audit)
awrap=['audit-manifest-v1.json','audit-manifest-v1.sha256','audit-readback-v1.json'];check('functional-audit-three-envelopes',all('tests/fixtures/h6-001/independent/'+x in ownpaths for x in awrap) and data('audit-manifest-v1.sha256',aroot).decode().split()[0]==AUD_SHA and js('audit-readback-v1.json',aroot)['manifestSHA256']==AUD_SHA,awrap)
check('functional-audit-nested-paths',all('tests/fixtures/h6-001/independent/'+f['path'] in ownpaths for f in a['files']),'All 173 nested payloads also bound by exterior manifest')
check('functional-audit-current-sources',a['focalSourceSHA256']==sha(data('tests/integration/postgres-h6-001.test.ts')) and a['focalRunnerSHA256']==sha(data('scripts/run-h6-001.mjs')) and a['expectedSHA256']==sha(data('specs/001-core-crm/expected-TSK-H6-001-independent.md')),{'focalSourceSHA256':a['focalSourceSHA256'],'focalRunnerSHA256':a['focalRunnerSHA256'],'expectedSHA256':a['expectedSHA256']})
raw=js('regression-01/report.json',aroot);rec=js('reconciliation.json',aroot);expectedRaw={'tests':2945,'pass':2899,'fail':46,'cancelled':0,'skipped':0}
check('raw-regression-preserved-FAIL',raw['status']=='FAIL' and raw['total']==expectedRaw and rec['rawOutcome']==expectedRaw and m['originalRegression']=={'status':'FAIL','total':2945,'pass':2899,'fail':46,'all46HaveIdentifiedSuccessorPASS':True,'secondCompleteCleanRun':False},expectedRaw)
logcache={};rows=[]
for row in rec['rows']:
 obs={'id':row['id'],'title':row['title'],'cause':row['cause'],'refs':[],'pass':True}
 for role,expectedMark in [('original','✖'),('successor','✔')]:
  ref=row[role];p=ref['log']
  if p not in logcache:
   b=data(p,aroot);logcache[p]=(gzip.decompress(b) if p.endswith('.gz') else b).decode().splitlines()
  line=logcache[p][ref['logLine']-1];ok=line.lstrip().startswith(expectedMark) and row['title'] in line and ref['result']==('FAIL' if role=='original' else 'PASS');obs['pass']=obs['pass'] and ok;obs['refs'].append({'role':role,'path':p,'line':ref['logLine'],'lineSHA256':sha(line.encode()),'recordedResult':ref['result'],'matches':ok})
 rows.append(obs)
check('46-reconciliation-row-log-references',len(rows)==46 and len({r['id'] for r in rows})==46 and all(r['pass'] for r in rows),{'verifiedRows':sum(r['pass'] for r in rows),'total':len(rows)})
check('reconciled-not-new-clean-full-run',rec['reconciled']==46 and rec['unresolved']==0 and a['reconciledFailures']==46 and a['unresolvedMaterialFindings']==0 and a['verdict']==m['technicalVerdict']=='PASS_TECHNICAL_LOCAL_WITH_EXPLICIT_RECONCILED_REGRESSION' and 'do not' in rec['uniqueCoverage'],rec['uniqueCoverage'])
focal=[]
for label,root,rel,stdout,stderr,exitkey,outkey,errkey in [('executor',ROOT,'tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/run.json','tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/stdout.log','tests/fixtures/h6-001/focal-2026-10-22T22-00-10-476Z/stderr.log','exitCode','stdoutSHA256','stderrSHA256'),('independent',aroot,'focal-independent-01/run.json','focal-independent-01/stdout.log.gz','focal-independent-01/stderr.log.gz','exit','stdoutSHA','stderrSHA')]:
 run=js(rel,root);ob=data(stdout,root);eb=data(stderr,root);ob=gzip.decompress(ob) if stdout.endswith('.gz') else ob;eb=gzip.decompress(eb) if stderr.endswith('.gz') else eb;summary=run['summary'];ok=run[exitkey]==0 and all(x in summary for x in ['ℹ tests 22','ℹ pass 22','ℹ fail 0','ℹ cancelled 0','ℹ skipped 0']) and sha(ob)==run[outkey] and sha(eb)==run[errkey];focal.append({'source':label,'pass':ok,'summary':summary,'logHashesMatch':sha(ob)==run[outkey] and sha(eb)==run[errkey]})
check('focal-executor-and-independent-22',all(x['pass'] for x in focal),focal)
fi=js('final-integrity.json',aroot);check('functional-integrity822-receipt',fi['status']=='PASS' and fi['count']==822 and len(fi['checks'])==822 and all(x['pass'] for x in fi['checks']),{'status':fi['status'],'count':fi['count'],'scope':'Existing signed-by-hash receipt, not reexecution of its 822 controls'})
# Revalidate all protected H6-015 package identities, including archived Git objects.
prior=js('manifest-verification-v2.json',OUT);custody=[]
for old in prior['manifests']:
 source=old['source'];rel=old['manifest']
 if source.startswith('snapshot:'):
  ref=source.split(':',1)[1];read=lambda p:git(PRIMARY,'show',ref+':'+p)
 else:
  base=WTS/source/'crm-huescaventura-os';read=lambda p,base=base:data(p,base)
 b=read(rel);j=json.loads(b);errors=[];size=0
 for f in j['files']:
  q=read(f['path']);size+=len(q)
  if sha(q)!=f['sha256'] or len(q)!=f['bytes']:errors.append(f['path'])
 custody.append({'source':source,'manifest':rel,'sha256':sha(b),'payloads':len(j['files']),'bytes':size,'pass':sha(b)==old['sha256'] and not errors,'mismatches':errors})
check('H6015-sixteen-manifests4568',len(custody)==16 and sum(x['payloads'] for x in custody)==4568 and all(x['pass'] for x in custody),{'manifests':16,'payloadEntries':4568,'mismatches':sum(len(x['mismatches']) for x in custody)})
qroot=WTS/'h6-c04-integration/crm-huescaventura-os';qb=data('tests/fixtures/h6-015-acceptance/quarantine-v1.json',qroot);q=json.loads(qb);check('four-suspended-documentary-only',sha(qb)=='f1f41f93a347148f91de4ed9edc5a35516ee94152c2cde2544b2c90c5ebf6d8b' and q['jobsPausedInFinalSnapshot']==4 and q['noS11'] and q['uncertainAndAbsentEffectRemainSuspended'],{'sourceReceiptSHA256':sha(qb),'jobsPausedInFinalSnapshot':q['jobsPausedInFinalSnapshot'],'runtimeRechecked':False})
for ref,h in [('refs/codex/snapshots/7e4fd5a822682f8084c66e10e9dfe5c6c96c558b','8ec91602a3bf813cf01ffbc6b2ac1a2862fe10d0'),('refs/codex/snapshots/5dd45c051bdda86d56e55b9732678692fc2eb919','fc68a90cd555a83388d5b166ff86adeda70110b8')]:check('snapshot:'+h,git(PRIMARY,'rev-parse',ref).decode().strip()==h,ref)
oldinv=js('inventory-v1.json',OUT);oldprimary=next(w for w in oldinv['worktrees'] if w['name']=='primary');oldfiles={f['path']:f.get('bytes') for f in oldprimary['files']};current=[p for p in git(PRIMARY,'ls-files','--others','--exclude-standard','-z').decode().split('\0') if p];sizes={p:(PRIMARY/p).stat().st_size for p in current};legacy=js('tests/fixtures/h6-local-closure/excluded-root-untracked.json',qroot)['paths'];check('primary14954-history-inventory',len(current)==14954 and set(current)==set(legacy) and sizes==oldfiles,{'paths':len(current),'sameSizesAsV1':sizes==oldfiles,'limitation':'Names and sizes compared; no nonexistent prior full-content hash is asserted.'})
for root,label in [(PRIMARY,'primary'),(ROOT,'candidate')]:check('git:'+label,git(root,'rev-parse','HEAD').decode().strip()==BASE and git(root,'diff','--cached','--name-only')==b'' and (label!='primary' or git(root,'diff','--name-only')==b''),{'head':git(root,'rev-parse','HEAD').decode().strip(),'indexEmpty':git(root,'diff','--cached','--name-only')==b''})
basefiles=git(PRIMARY,'ls-tree','-r','--name-only',BASE,'src','supabase/migrations').decode().splitlines();actual=sorted(str(p.relative_to(ROOT)) for prefix in ['src','supabase/migrations'] for p in (ROOT/prefix).rglob('*') if p.is_file());ih={f['path']:f for f in inh};expectedpaths=set(basefiles)|{p for p in ih if p.startswith('src/')};bad=[]
for p in actual:
 expected=ih[p]['sha256'] if p in ih else sha(git(PRIMARY,'show',BASE+':'+p))
 if sha(data(p))!=expected:bad.append(p)
check('source-and-68-migrations-unchanged',set(actual)==expectedpaths and not bad and len([p for p in actual if p.startswith('supabase/migrations/')])==68,{'files':len(actual),'migrations':68,'mismatches':bad,'basePlusExactInherited':True})
header=re.compile(r'<!-- H6001-LOCAL-STATUS-BEGIN -->\n.*?<!-- H6001-LOCAL-STATUS-END -->\n\n',re.S);newstatus='- [ ] **Ejecución: IN PROGRESS local/aislado. Evidencia: ejecución y auditoría H6-001; aceptación pendiente del director.** Hito: H6. Tipo: comprobación.';oldstatus='- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.'
for rel in ['docs/NEXT-STEPS.md','docs/PROJECT-STATUS.md','specs/001-core-crm/tasks.md']:
 text=data(rel).decode();body,n=header.subn('',text)
 if rel.endswith('tasks.md'):body=body.replace(newstatus,oldstatus,1)
 check('current-states-historical-body:'+rel,n==1 and body.encode()==git(PRIMARY,'show',BASE+':'+rel) and all(x in text[:6000] for x in ['TSK-H6-001 IN PROGRESS','H6 global IN PROGRESS','aceptación local pendiente','cuatro trabajos suspendidos','no se reentra en S11']),sha(text.encode()))
for version,subdir in [('v1','custody-initial'),('v2','custody-successor')]:
 rel='audit-delivery-'+version+'.json';ps=js(rel,OUT);bad=[]
 for f in ps['files']:
  original=data(f['path'],OUT);copied=data('tests/fixtures/h6-001/'+subdir+'/'+f['path'])
  if sha(original)!=f['sha256'] or len(original)!=f['bytes'] or copied!=original:bad.append(f['path'])
 if data('tests/fixtures/h6-001/'+subdir+'/'+rel)!=data(rel,OUT):bad.append(rel)
 check('previous-custody-original-and-copy:'+version,not bad,{'payloads':len(ps['files']),'mismatches':bad,'sealSHA256':sha(data(rel,OUT))})
# A second end-of-readback hash pass binds the exact outer contents after all reads.
outerend=payloads(ROOT,m['files']);check('end-of-readback305-stable',outerend==outer and sha(data(MAN))==MAN_SHA and sha(data(SEAL))==SEAL_SHA,{'payloads':outerend['verified'],'bytes':outerend['bytes'],'manifestUnchanged':sha(data(MAN))==MAN_SHA,'sealUnchanged':sha(data(SEAL))==SEAL_SHA})
receipt={'schema':'h6-001-independent-exterior-readback-v3','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'auditor':'/root/custody_publication_audit','status':'PASS' if all(c['status']=='PASS' for c in checks) else 'FAIL','scope':'Read-only exterior custody and exact-byte readback. No functional rerun or acceptance decision.','base':BASE,'candidateManifest':{'path':MAN,'sha256':MAN_SHA,'payloads':305,'payloadBytes':52932020},'candidateSeal':{'path':SEAL,'sha256':SEAL_SHA},'publicationInventory':{'path':PUB,'sha256':sha(data(PUB)),'ownPayloadsIncludingSelf':305,'inheritedFiles':14,'publicationExecuted':False},'functionalAudit':{'path':AUD,'sha256':AUD_SHA,'payloads':173,'payloadBytes':14044516,'envelopes':3,'verdict':a['verdict']},'checks':checks,'controlCount':len(checks),'failures':[c for c in checks if c['status']=='FAIL'],'reconciliationLogReferences':rows,'protectedH6015Manifests':custody,'focalReadback':focal,'states':{'H6001':'IN_PROGRESS_DIRECTOR_ACCEPTANCE_PENDING','H6':'IN_PROGRESS','H6015':'COMPLETED_LOCAL_ISOLATED_QUARANTINE','suspendedJobs':4,'suspensionEvidence':'DOCUMENTARY_ONLY'},'operationsPerformed':{'fileReadsAndHashes':True,'writes':'Only auditor instruments and receipts under /tmp/h6-001-custody-audit','runtime':False,'SQL':False,'restore':False,'regressionExecution':False,'S11':False,'stage':False,'commit':False,'push':False,'remoteAccess':False,'Drive':False},'limits':['No fresh runtime verification of H6-015 suspension.','Historical primary 14954 files checked by paths and sizes; no prior unrecorded full hash is invented.','Original wide regression remains FAIL 2899/2945 with 46 identified successor PASS; no new complete clean execution.','Technical independence of context and instruments on shared machine, not external organizational certification.'],'instrumentIncidents':[{'stage':'Initial read-only schema display','result':'TYPEERROR_LEN_INTEGER','cause':'Display assumed inheritedFiles was a list; it is count 14. Type-aware reread used.','effect':'No files or evidence modified; final verifier uses actual schema.'}],'nextAction':'Director may assess local acceptance. This receipt does not mark COMPLETED or authorize publication.'}
output=OUT/'final-delivery-readback-v3.json'
if output.exists():raise SystemExit('Refusing to overwrite final v3 receipt')
output.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':receipt['status'],'checks':len(checks),'failures':receipt['failures'],'outer':outer,'functional':audit,'reconciliationRowsVerified':sum(x['pass'] for x in rows)},ensure_ascii=False,indent=2))
