"""Independent documentary closure checks. Never starts services or executes SQL."""
from pathlib import Path
import datetime,difflib,hashlib,json,re,subprocess,time
A=Path(__file__).resolve().parents[1];O=A/'tests/fixtures/h6-015-formal-closure-independent';R=Path('/Users/andres/.codex/worktrees/h6-015-formal-closure/crm-huescaventura-os');E=Path('/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text());e=read(O/'expected-v1.json');checks=[]
def ck(rule,v,**d):
 checks.append({'id':rule,'status':'PASS' if v else 'FAIL',**d})
 if not v:raise ValueError(rule)
r={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'expectedSHA256':sha(O/'expected-v1.json'),'instrumentSHA256':sha(__file__),'candidateRoot':str(R),'checks':checks,'runtimeExecuted':False,'SQLExecuted':False,'resourcesCreated':False,'privateCustodyModified':False,'taskState':'COMPLETED_LOCAL_ISOLATED_QUARANTINE','H6Global':'IN_PROGRESS','S11':False,'N03':False,'publication':False}
try:
 ck('frozen-before-observation',sha(O/'expected-v1.json')=='657c9195becb3b64c26473d220ca3cf0933082ec48933a2d453fe58233176cdc' and e['executorClosureObserved'] is False)
 for p in e['acceptedPackages']:
  root=Path(p['root']);m=root/p['manifest'];ck('accepted-manifest-'+p['manifest'],sha(m)==p['sha256']);items=read(m)['files'];ck('accepted-count-'+p['manifest'],len(items)==p['count'])
  for x in items:ck('accepted-payload-'+x['path'],(root/x['path']).stat().st_size==x['bytes'] and sha(root/x['path'])==x['sha256'])
 for p,h in e['normativeSources'].items():ck('accepted-normative-'+p,sha(E/p)==h)
 for p,h in e['acceptedProductSources'].items():ck('accepted-product-'+p,sha(E/p)==h)
 base='971c55d5ce5770c71284d106d3c0deecca9514b5';ck('documentary-base',subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()==base)
 tracked=set(subprocess.check_output(['git','diff','--name-only'],cwd=R,text=True).splitlines());ck('only-three-tracked-coordination',tracked==set(e['coordinationSources']))
 ck('no-staging',subprocess.check_output(['git','diff','--cached','--name-only'],cwd=R)==b'')
 additions={}
 for p,h in e['coordinationSources'].items():
  old=(E/p).read_text().splitlines(keepends=True);new=(R/p).read_text().splitlines(keepends=True);ck('old-coordination-stable-'+p,sha(E/p)==h)
  matcher=difflib.SequenceMatcher(a=old,b=new,autojunk=False);inverse=[];added=[]
  for op,i,j,k,l in matcher.get_opcodes():
   ck('pure-addition-'+p+'-'+str(k),op in ['equal','insert'])
   if op=='equal':inverse+=new[k:l]
   else:added+=new[k:l]
  ck('inverse-byte-exact-'+p,''.join(inverse).encode()==(E/p).read_bytes());additions[p]=len(added)
  ck('current-coordination-scope-'+p,all(t in ''.join(added) for t in ['COMPLETED — exclusivamente local/aislado y en cuarentena','H6 global IN PROGRESS','ARCH-PENDING-002 y DM-PENDING-005 OPEN','S11 no autorizada/no ejecutada','N03 no implementada ni necesaria','NOT STARTED']))
 ck('minimal32-insertions',sum(additions.values())==32,additions=additions)
 # A documentation checkout intentionally contains base product. It is not the accepted executable successor.
 for p in e['acceptedProductSources']:
  exists=subprocess.run(['git','cat-file','-e',base+':'+p],cwd=R,capture_output=True).returncode==0
  if exists:
   expected=subprocess.check_output(['git','show',base+':'+p],cwd=R);ck('base-product-unchanged-'+p,hashlib.sha256(expected).hexdigest()==sha(R/p))
  else:ck('accepted-successor-not-imported-'+p,not (R/p).exists())
 prep=read(R/'tests/fixtures/h6-015-formal-closure/next-H6-preparation-v1.json');own=read(O/'h6-016-normative-extraction-v1.json')
 ck('H6016-six-exact-dependencies',list(prep['H6016Dependencies'])==e['expectedH6016Dependencies'])
 for id,state in e['dependencyStates'].items():ck('dependency-state-'+id,prep['H6016Dependencies'][id].replace(' ','_')==state)
 ck('H6001-one-complete-dependency',prep['H6001Dependencies']=={'TSK-H5-019':'COMPLETED_LOCAL'})
 rows=prep['tasks']['TSK-H6-016']['assignedRows'];ck('H6016-exact25-assignments',len(rows)==25 and {x['literal'] for x in rows}=={x['row'] for x in own['assignments']} and all(x['status']=='NOT_EXECUTED' for x in rows))
 tasks=(E/'specs/001-core-crm/tasks.md').read_text().splitlines();a=next(i for i,x in enumerate(tasks) if x.startswith('## 6.'));b=next(i for i,x in enumerate(tasks[a+1:],a+1) if x.startswith('## 7.'));h1=[x for x in tasks[a:b] if x.startswith('|') and '[TSK-H6-001]' in x]
 ck('H6001-exact3-assignments',len(h1)==3 and {x['literal'] for x in prep['tasks']['TSK-H6-001']['assignedRows']}==set(h1))
 for id in ['TSK-H6-001','TSK-H6-016']:
  ck('not-started-'+id,prep['tasks'][id]['state']=='NOT STARTED')
  definition=prep['tasks'][id]['definition'];original=e['taskDefinitions'][id]['definition']
  ck('definition-exact-'+id,all(x in definition.splitlines() for x in original if x.startswith('- ') or x.startswith('#### ')))
 plan=(E/'specs/001-core-crm/plan.md').read_text().splitlines();units=[x for x in plan if re.match(r'^\| PLAN-T(?:0[1-9]|1[01]) — ',x)];ck('11-unit-literals',len(units)==11 and prep['transactionUnits']==units)
 index=read(R/'tests/fixtures/h6-015-formal-closure/accepted-evidence-index-v1.json')
 for x in index:ck('exact-evidence-ref-'+Path(x['path']).name,sha(x['path'])==x['sha256'] and Path(x['path']).stat().st_size==x['bytes'])
 doc=(R/'specs/001-core-crm/closure-TSK-H6-015-local.md').read_text();nextdoc=(R/'specs/001-core-crm/preparation-next-H6-after-H6-015.md').read_text()
 ck('formal-scope-accurate',all(x in doc for x in ['Estado formal: COMPLETED','exclusivamente local/aislado y en cuarentena','H6 global IN PROGRESS','S11 no ejecutada y no autorizada','N03 es innecesario','ARCH-PENDING-002 y DM-PENDING-005 permanecen OPEN','No hay commit ni publicación nuevos']))
 ck('P02-candidate-identity-distinguished',all(x in doc for x in ['no incorpora su código no versionado','el commit por sí solo no contiene toda la implementación local aceptada']))
 ck('future-not-authorized',all(x in nextdoc for x in ['H6-016 y H6-001 NOT STARTED','Es orden sugerido de trabajo, no nuevas dependencias','Queda pendiente autorización del nuevo alcance funcional','no iniciar H6-001, H6-004, H6-007 ni H6-016']))
 ck('cross-reference-observation-no-normative-edit','Se conserva esa remisión sin corregir norma' in nextdoc)
 for relative in ['specs/001-core-crm/closure-TSK-H6-015-local.md','specs/001-core-crm/preparation-next-H6-after-H6-015.md']:
  text=(R/relative).read_text()
  for target in re.findall(r'\]\(([^)]+)\)',text):
   if target.startswith(('http:','https:','#')):continue
   p=Path(re.sub(r':\d+$','',target));p=p if p.is_absolute() else (R/relative).parent/p;ck('document-link-'+str(len(checks)),p.exists())
 ver=read(R/'tests/fixtures/h6-015-formal-closure/verification-v1.json');ck('executor-verification-boundaries',ver['status']=='PASS' and ver['taskState']==r['taskState'] and ver['H6Global']=='IN_PROGRESS' and all(ver[x] is False for x in ['functionalTestsRepeated','SQLExecuted','S11','N03','commit','push','Drive']))
 ck('no-diff-errors',subprocess.run(['git','diff','--check'],cwd=R,capture_output=True).returncode==0)
 r['reviewedFiles']={p:sha(R/p) for p in ['specs/001-core-crm/tasks.md','docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md','specs/001-core-crm/closure-TSK-H6-015-local.md','specs/001-core-crm/preparation-next-H6-after-H6-015.md',*[str(p.relative_to(R)) for p in (R/'tests/fixtures/h6-015-formal-closure').glob('*') if p.is_file()]]};r['state']='PASS'
except Exception as error:r['state']='FAIL_PRESERVED';r['failure']={'class':type(error).__name__,'rule':str(error) if re.fullmatch('[A-Za-z0-9_./-]+',str(error)) else 'DETAIL_OMITTED'}
p=O/('documentary-readback-'+str(time.time_ns())+'.json');p.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({'report':str(p),'sha256':sha(p),'state':r['state'],'checks':len(checks),'failure':r.get('failure')}))
if r['state']!='PASS':raise SystemExit(1)
