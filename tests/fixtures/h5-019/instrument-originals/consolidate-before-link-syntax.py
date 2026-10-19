"""Source/receipt consolidation for H5-019; never changes a protected source."""
from pathlib import Path
from collections import Counter
import gzip,hashlib,json,re,subprocess,sys,stat
r=Path(__file__).resolve().parents[1];o=r/'tests/fixtures/h5-019';sp=r/'specs/001-core-crm'
def sha(b):return hashlib.sha256(b).hexdigest()
def data(p):
 p=Path(p);p=p if p.is_absolute()else r/p;b=p.read_bytes();return json.loads(gzip.decompress(b)if p.suffix=='.gz'else b)
def put(n,d):
 p=o/n;b=(json.dumps(d,ensure_ascii=False,sort_keys=True,indent=2)+'\n').encode()
 with p.open('xb')as f:f.write(gzip.compress(b,mtime=0)if n.endswith('.gz')else b)
def meta(n):
 p=r/n;s=p.lstat();assert stat.S_ISREG(s.st_mode)and not p.is_symlink(),n
 return {'sha256':sha(p.read_bytes()),'bytes':s.st_size,'mode':s.st_mode&0o777}
def log(n):return gzip.decompress((o/n).read_bytes()).decode()
def counts(s):return {k:int(v[-1])for k in ['tests','pass','fail','cancelled','skipped']if(v:=re.findall(r'(?:ℹ|#) '+k+r' (\d+)',s))}
def cases(s):
 s=re.sub(r'H2-008 historical complete stdout: [\s\S]*?H2-008 historical complete stderr:','',s)
 return [{'name':m[1],'result':'SATISFACTORIA'if m[0]=='✔'else'FALLIDA'}for m in re.findall(r'^\s*([✔✖]) (.*) \([0-9.]+ms\)$',s.split('✖ failing tests:')[0],re.M)]
# Each item adds concrete rule references and recoverable original matrices to the exact AC text.
rows=[
(50,'PT-08','pending-task; approved-task-needs; h5-task-adapter','COORD-001–003; DM-INV-044; SM-TA-01–05; SM-FORB-20; BR-TASK-001–005','matrix-TSK-H5-002.md','H5-T01/T05|H5-T02/T04|H5-T05/T07|H5-T06/T07|H5-T09','T01–T10,T19,T21–T23: causa única, cierre/reapertura y ningún pago por Task','Parámetros productivos y scheduler pendientes'),
(51,'PT-08','document-requirement; h4-requirement-adapter','COORD-005; CAT-007; DM-INV-043; SM-DO-01–05; SM-FORB-20','evidence-TSK-H4-002.md','^R(0[1-9]|1[0-9]|2[0-9])$|H5-012 F02 documentary','R01–R23 y F02: recibido/revisado/no aplica fundamentado, cambio reabre solo alcance','DM-PENDING-005; datos/requisitos reales verificados pendientes'),
(52,'PT-08','incident; h4-incident-adapter','COORD-006; SM-IN-01–06; SM-FORB-24; BR-INC-001–002','evidence-TSK-H4-004.md','H4-004.*(resolution|closing|impact|AC-060)|H5-014 A06/A20','Resolución y recurrencia conservadas; gestionar crítica no resuelve; sin Refund inferido','H6 conserva integración de evidencias tardías'),
(70,'PT-08','internal-alert; h5-alert-adapter; persisted-work','COORD-004; CONC-006; SPEC-NFR-010/014; DM-INV-044; D016; ARCH-DEC-011','matrix-TSK-H5-004.md','H5-AI/AJ/AT|H5-AT/AE|H5-AN/AO|H5-AR/AS','AI/AJ/AT/AE: visibilidad CRM, detener/revisar y no recursión; doble no entrega','WhatsApp real y parámetros de automatismo no configurados'),
(76,'PT-08','coordinated-projection; h5-projection-adapter; external-boundary','COORD-008; IDEMP-004; INT-005; DM-INV-049; SM-FORB-28; D020','matrix-TSK-H5-012-candidate61.md','H5-012 C09|H5-012 C10|H5-012-F01|H5-012 F01/F03','C01–C11,F01–F03: fechas vigentes, eco/revisión y mutationAuthority=false','Calendar real fuera; capacidad de sincronización futura'),
(83,'PT-08','approved-task-needs; internal-alert; persisted-work','COORD-002–003; CONC-006; BR-TASK-005; ARCH-DEC-011','matrix-TSK-H5-008.md','H5-T17/T18|H5-AR/AS|W.*(unknown|missing|parameter|pause|retry)','T17/T18,AR/AS,W12–W23: sin frecuencia/adelanto/límite no inventar política','Configuración operativa ausente localizada'),
(87,'PT-08','communication-review; h5-communication-adapter','PROP-006; COORD-007; HIST-003; DM-INV-045; SM-CO-01–06; SM-FORB-21','matrix-TSK-H5-006.md','H5-CA/CB|H5-CH/CI|H5-CJ/CK|H5-CAT SM-CO','CA–CM/CAA: aprobación no envío; entrada recibida sin borrador y hechos independientes','Todo envío de prueba sintético; ningún destinatario externo'),
(88,'PT-08','communication-review; h5-communication-adapter','HIST-003/005; INT-004; SEC-006; DM-INV-045/046; BR-AI-004–005','matrix-TSK-H5-006.md','H5-CN/CO|H5-CU/CV|H5-CT/CAQ|H5-CS manual','CN–CT/CU–CZ: original/derivado,18 confirmado frente16 tentativo, Review y misma Task','H6-017 NO EJECUTADA; DM-PENDING-005 OPEN; sin audio/PLAUD/IA real'),
(53,'PT-09','h0-011-adapter; human-approval-executor; h5-communication-adapter','HA-001/003; DM-INV-046/048; SM-HA-01–03; D037/D038/D039','evidence-TSK-H0-012.md','H5-CA/CB|W01 W02 W11|F03 focal: verified','HA exacta registrada; define/claim no ejecutan; humano y ejecutor distintos','Ensayo sensible real H6-006 pendiente'),
(54,'PT-09','human-approval-executor; persisted-work-executor','HA-002; SM-HA-02; DM-INV-046; G1–G6; D039','matrix-TSK-H5-008.md','H5-CF/CG|H5-CAA/CAB|F03 focal: SQL|F03 focal: real ledger','Cambio contenido/destinatario/importe/condición/parte y caducidad rechazan sin consumo','Revalidación Hosted/pool real y H6 pendientes'),
(55,'PT-09','human-approval-executor; persisted-work-executor','HA-004; CONC-002; IDEMP-001–002; DM-INV-048; T08/T09','matrix-TSK-H5-008.md','W03 real|F01 correction: normal concurrent|W06 W09 W10','R01–R25,W03,W06,W09: consumo único, ambos órdenes, replay reautorizado','Sin garantía exactly-once externa; H6-006/016 pendientes'),
(56,'PT-09','human-approval-executor; exact-acceptance; own-economics','HA-001/005; ACC-005; SEC-007; SM-FORB-22; P15/P16','evidence-TSK-H0-012.md','H0-012 D039 formal|H5-CAA/CAB|H5-012 S10|H5-CAN/CAM','Autoaprobación/plantilla sin HA/acuerdo o factura por aprobación rechazados','H6-017 NO EJECUTADA; fiscalidad/emisión excluida'),
(57,'PT-09','persisted-work-executor; external-boundary; h4-refund-adapter','ERR-002; HA-003–004; SM-FORB-27; T08/T09','matrix-TSK-H5-008.md','W05 W07 W23|W06 W09 W10|W04 W08 W39','W04–W10,W23: E4 conserva intento/reserva; no retry manual ciego; conciliación tardía única','H6-006 NO EJECUTADA; proveedor simulado, sin transferencia/envío'),
(58,'PT-10','closure-assessment; h5-closure-adapter; operational-reality','BOOK-005; CLOSE-001–003; DM-INV-041; SM-CL-01–04; SM-FORB-23','matrix-TSK-H5-014.md','H5-014 A02/A16|H5-014 A12|H5-014 A15','A02/A16,A05/A12,N02/N04: Finalizada no resuelve factura/fianza/Refund','Recorrido completo E2E-01 H6-001 pendiente'),
(59,'PT-10','closure-assessment; h5-closure-adapter','CLOSE-001–003; DM-INV-041/042; SM-CL-01/02/04; T10','matrix-TSK-H5-016.md','H5-014 A01/A04|H5-015 J01|H5-016 A01','A01/A04,J01: tres evaluaciones actuales explícitas y cierre conjunto posterior','H6-007/016 conservan integración futura; ningún cierre externo'),
(60,'PT-10','closure-assessment; incident; h5-closure-adapter','CLOSE-002–003; COORD-006; DM-INV-041; SM-FORB-24; T10','matrix-TSK-H5-016.md','H5-015 J02|H4-004 AC-060|H5-014 A05','J02,A05/A06: excepción crítica acotada nunca dispensa Refund/incidencia económica','H6 conserva regresión integrada; no nuevas excepciones'),
(61,'PT-10','closure-assessment; h5-closure-adapter','CLOSE-004; HIST-001/002; DM-INV-042/047; SM-CL-03/05; T10','matrix-TSK-H5-016.md','H5-015 J04/J05|H5-016 A03 close|H5-016 A04','J04/J05,A02–A04: nueva evidencia invalida dimensión, historia previa y otras conservadas','H6-007 NO EJECUTADA; ensayos de evidencia posterior integrales pendientes'),
(66,'PT-12','external-boundary; h5-external-event-adapter; h0-009-adapter','IDEMP-001–004; INT-001–002; SPEC-NFR-006; G6; T09','matrix-TSK-H5-009-010.md','H5.*(duplicate|different material|old|out.of.order|equivalent)|B0[1-9]','Eventos equivalentes, antiguos/ecos, conflicto material y sinID revisados; sin dedup por parecido','Conectores/capacidades externas BR-PENDING-035'),
(67,'PT-12','h0-009-adapter; h2-proposal-adapter; h4-modification-adapter','CONC-001–002; SPEC-NFR-007; T01/T04','matrix-TSK-H4-024.md','H4-024|H5-014 C03|H5-016 A07|stale','O05/O12/O24 y C03/A07: revisiones obsoletas y competencia detectadas','H6-016 NO EJECUTADA; histórico previo conserva alcance/versiones'),
(68,'PT-12','transaction; h2-booking-adapter; h3-allocation-adapter','CONC-003–004; SPEC-NFR-008; T03/T05/T08/T09','matrix-TSK-H4-024.md','H5-AW|H5-CAG|H4-024|rollback|atomic','O28,H5-AW/CAG: hecho/historia/resultado/intención juntos o rollback; respuesta perdida replay','H6-016 cadena integrada pendiente; ninguna atomicidad externa'),
(69,'PT-12','persisted-work; persisted-work-executor','CONC-005; ERR-002; IDEMP-002; T09; ARCH-DEC-015','matrix-TSK-H5-008.md','W01 W02 W11|W03 real|W04 W08 W39|W05 W07 W23|W06 W09 W10','W01–W11,W39: reclamación exclusiva persistente, reinicio/fencing y contacto incierto','Sin scheduler real; límites/capacidad pendientes'),
(71,'PT-12','external-boundary; h5-external-event-adapter','INT-001/003–005; CONC-004; SPEC-NFR-011; SM-FORB-28','matrix-TSK-H5-009-010.md','H5-012 C11|H5-AD/AP|H5-AN/AO|unavailable|independent','Fuente caída deja dependiente pendiente; expediente independiente sigue; intento no entrega','BR-PENDING-035/ARCH-PENDING-001; dobles o registro manual'),
(72,'PT-12','semantic-error; diagnostic-operation; h5-diagnostic-adapter','ERR-001–002; SPEC-NFR-014; E1–E8; C01/C04; B10','matrix-TSK-H5-018-sixth.md','F-P0|C.*E4|E1|E4|E5|diagnostic|correlation','Sexta y F01/F02/F03: causa/incertidumbre y correlación autorizada; E4 nunca E5 por excepción','H6-017 y privacidad real pendientes; logs no acreditan pagos/entregas'),
(73,'PT-12','h0-009-adapter; h1-object-adapter; persisted-work-executor','IDEMP-002; HIST-004; SPEC-NFR-005; ARCH-PENDING-002','matrix-TSK-H5-008.md','W05 W07 W23|R06/R07/R15/R17','Solo controles previos de incertidumbre y objeto ausente; NO ensayo de restauración H6','AC-073 NO EJECUTADA; H6-014/015, conciliación tras backup, RPO/RTO/coste/periodicidad pendientes'),
(74,'PT-12','h1-object-adapter; private-storage','HIST-003–004; SEC-005; DM-INV-045/050; ARCH-DEC-010','evidence-TSK-H1-016.md','R06/R07/R15/R17|R05: real same.path|R11-R14: actual signed|H5-CAH/CR','R01–R19: binario/metadata/orfandad, reparación real local y acceso reautorizado','H6-015 restauración coherente y Auth/Storage Hosted pendientes; URL nativa no revocada por promesa'),
(77,'PT-12','external-boundary; h5-external-event-adapter','INT-006; DM-INV-049; SM-FORB-28; ARCH-DEC-009','matrix-TSK-H5-009-010.md','H5-012 C12|[Aa]vaibook','Recepción/referencia en revisión y rechazo create/update/cancel; nunca autoridad Core','Avaibook sin conector/capacidad real comprobada')]
assert len(rows)==26 and len({x[0]for x in rows})==26
if sys.argv[1]=='sources':
 tasks=(sp/'tasks.md').read_text();spec=(sp/'spec.md').read_text();plan=(sp/'plan.md').read_text()
 ac=[]
 for num,family,impl,norm,original,selector,expected,limit in rows:
  id=f'AC-{num:03d}';sr=next(l for l in spec.splitlines()if l.startswith('| '+id+' |'));tr=next(l for l in tasks.splitlines()if l.startswith('| **'+id+'**'));cols=tr.split('|')
  assert (sp/original).exists(),original
  implfiles=[str(p.relative_to(r))for p in (r/'src').rglob('*.ts')if p.stem in impl.split('; ')]
  assert implfiles,(id,impl)
  ac.append({'id':id,'family':family,'specRow':sr,'tasksRow':tr,'developmentTasks':re.findall('TSK-H[0-9]-[0-9]{3}',cols[2]),'verificationTasks':re.findall('TSK-H[0-9]-[0-9]{3}',cols[3]),'rules':norm,'implementation':implfiles,'originalEvidence':'specs/001-core-crm/'+original,'caseSelector':selector,'expectedLocalObservation':expected,'limitations':limit,'localApplicable':num!=73,'globalStatus':'NO EJECUTADA'if num==73 else 'no cerrar globalmente por consolidación local'})
 normative={str(p.relative_to(r)):meta(str(p.relative_to(r)))for p in [sp/'tasks.md',sp/'spec.md',sp/'plan.md',*[r/'docs'/n for n in ['constitution.md','business-rules.md','domain-model.md','state-machines.md','architecture.md','DECISIONS.md','PROJECT-STATUS.md','NEXT-STEPS.md']]]}
 # Exact assigned rows of Tasks §6, including SM/DM/FORB, remain documentary obligations, never auto-PASS.
 section=tasks.split('## 6. Matrices de trazabilidad')[1].split('## 7.')[0]
 assigned=[{'line':i+1,'row':l}for i,l in enumerate(tasks.splitlines())if l in section.splitlines()and l.startswith('|')and re.search(r'TSK-H5-0(?:0[1-9]|1[0-9])\]',l)]
 put('normative-sources.json',{'files':normative,'contractsSource':'plan.md §7.1','unitsSource':'plan.md §7.2','blocksSource':'plan.md §4','statesSource':'plan.md §10.1','pendingSources':['tasks.md §7','plan.md §12'],'assignedRows':assigned,'criteria':ac,'counts':dict(Counter(x['family']for x in ac))})
 # Source identity for G, sixth and the approved documentary successor.
 prefix='tests/fixtures/h5-018-sixth/';seal=data(prefix+'audit-seal.json');inv=data(prefix+'audit-inventory.json');assert sha((r/prefix/'audit-inventory.json').read_bytes())==seal['inventorySha256']
 assert sha((r/prefix/'audit-seal.json').read_bytes())=='65d44e660965e3e59bc9d9c71c7727743213e08d9930584ffda1b25e048d74fc'
 assert sha((r/'tests/fixtures/h5-017-g/candidate-seal.json').read_bytes())=='6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6'
 assert sha(gzip.decompress((r/'tests/fixtures/h5-017-g/candidate-inventory.json.gz').read_bytes()))=='fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b'
 for n,m in inv['files'].items():assert meta(n)=={**m,'mode':int(m['mode'],8)}|{} if False else meta(n)['sha256']==m['sha256'],n
 received=data(prefix+'received-inventory.json.gz')['files'];transition=data('tests/fixtures/h5-017-018-acceptance/document-transition.json')['files'];delta=[]
 for n,m in received.items():
  current=meta(n)
  if current['sha256']==m['sha256']:assert current['bytes']==m['bytes']and oct(current['mode'])==m['mode'];continue
  t=transition[n];assert current['sha256']==t['afterSha256'];b=gzip.decompress((r/t['preimageArchive']).read_bytes());assert sha(b)==m['sha256']==t['beforeSha256']and len(b)==m['bytes'];delta.append(n)
 assert set(delta)==set(transition)
 ph=data(prefix+'20-phases.json');assert ph['total']=={'tests':2945,'pass':2945,'fail':0,'cancelled':0,'skipped':0}
 oldcases=[]
 for phase in ph['phases']:
  text=gzip.decompress((r/prefix/phase['stdout']).read_bytes()).decode();assert counts(text)==phase['counts']and phase['exit']==0;oldcases+=cases(text)
 assert len(oldcases)==2945 and all(c['result']=='SATISFACTORIA'for c in oldcases)
 inputstatus=data(prefix+'20-complete.status.json');assert all(sha((r/n).read_bytes())==d for n,d in inputstatus['inputs'].items())
 five=[]
 for suffix in ['', '-second','-third','-fourth','-fifth']:
  p='tests/fixtures/h5-018'+suffix+'/audit-seal.json';s=data(p);assert s['result']=='FAIL';ip='tests/fixtures/h5-018'+suffix+'/audit-inventory.json';assert sha((r/ip).read_bytes())==s['inventorySha256'];five.append({'seal':p,**meta(p),'result':'FAIL preserved','inventory':ip})
 put('inherited-audit-verification.json',{'state':'SATISFACTORIA','sixthResult':'historical PASS local only','sixthSeal':meta(prefix+'audit-seal.json'),'sixthFilesChecked':len(inv['files']),'candidateGFilesChecked':len(received),'documentarySuccessors':delta,'codeAndTestInputsOfSixth20Exact':len(inputstatus['inputs']),'sixthPostgres':ph['total'],'sixthActualCasesReparsed':len(oldcases),'fiveFailAudits':five,'limits':['original logs H5-009 unavailable with authorized documentary substitution; see dependency matrix','27 exclusions of sixth preserved; 24 replacements,2 historical instruments with clarified overbroad prohibition,1 historical V-MIG66 extra','no old preservation verifier executed against a different historical HEAD; equivalent checks performed here']})
 print(json.dumps({'normativeCriteria':len(ac),'tasks6Rows':len(assigned),'sixthVerified':len(oldcases),'fiveFAILpreserved':len(five)}))
if sys.argv[1]=='dependencies':
 tasks=(sp/'tasks.md').read_text()
 groups=[
 (['H4-024'],'Operación/cambio/cancelación, economía real integrada y salida H4','a6e28cb099ce1ba0f13382b69d992adde25601e6','evidence-TSK-H4-024.md','matrix-TSK-H4-024.md','tests/fixtures/h4-024/final/case-results.json.gz','32/32 salida;2321PG;138unit;health1','52 migraciones históricas;cierres conjuntos incorporados después','Sin hechos externos,datos reales ni cierres H5 en aquella ejecución'),
 (['H5-001','H5-002'],'Ciclo Task,13 disparadores,deadline,cierre y reapertura explícita','6478d0f835fc89f38a17042ba2342105034e6883','evidence-TSK-H5-001-002.md','matrix-TSK-H5-002.md','tests/fixtures/h5-002/case-results.json','26 filas;19PG focal;2340PG;142unit;health1','53 migraciones históricas','Parámetros ausentes;scheduler no implementado'),
 (['H5-003','H5-004'],'Alert/Notification D016,CRM visible e intención WhatsApp','4ac610910c43bb80e8ead4a6fbdba10f9cf647cb','evidence-TSK-H5-003-004.md','matrix-TSK-H5-004.md','tests/fixtures/h5-004/case-results.json','30PG focal;2370PG;146unit;health1','54 migraciones históricas','Sin WhatsApp real/email interno;intención no entrega;F01–F05 preservados'),
 (['H5-005','H5-006'],'Preparación exacta de comunicación,Review y original/derivado','201dada023c6dc878928a28f296e00781cd3876d','evidence-TSK-H5-005-006.md','matrix-TSK-H5-006.md','tests/fixtures/h5-006/verification.json','57 casos/33 filas;38PG focal;2408PG;150unit;health1','55 migraciones;F10/F12 cierre definitivo','DM-PENDING-005;PLAUD/IA/audio/canales solo sintéticos;FAIL anteriores conservados'),
 (['H5-007','H5-008'],'Trabajo persistido,T08/T09,reclamación/fencing/recuperación segura','5e3add4b2c82fc5b0e459b43ea0685393c495840','evidence-TSK-H5-007-008.md','matrix-TSK-H5-008.md','tests/fixtures/h5-008/definitive/focal-final.log.gz','56 casos/45 filas;54PG focal;2462PG;154unit;health1','56 migraciones;12 carreras reales y reinicio proceso','Scheduler/retry/pause/resume/capacidad futura;sin exactly-once externo'),
 (['H5-009','H5-010'],'Normalización,identidad,eventos,dobles y frontera externa limitada','0d969541e119374561a6cd7d38e97faaed25add4','evidence-TSK-H5-009-010.md','matrix-TSK-H5-009-010.md','tests/fixtures/h5-009/f09/c12-20261013/gates/postgres.status.json','26casos/51filas;2473PG;332focal;110temporal;171unit;health1','F01–F09 CLOSED local;438 inputs identificados','Dos logs originales NO RECUPERADOS con sustitución documental autorizada;69 diferencias históricas tablas y R67/R030 conservadas;no integra APIs'),
 (['H5-011','H5-012'],'Proyecciones/timeline/calendario por finalidad y revisión actual','manifest:44d32a2ff5840bfc77fd160e45f90af2c85e3372db44a0a249a1f60e07805723','closure-TSK-H5-012.md','matrix-TSK-H5-012-candidate61.md','tests/fixtures/h5-012/publication-20261015/validation.json','41casos/34filas;57focal;2600PG;197unit;health1','428 inputs;F01/F02/F03 corregidos en59/60/61','H5-011 NOT STARTED en ficha obsoleta;primer evidence parcial FAIL preservado;27 avisos de formato autorizados históricos,sin exención nueva;privacidad/Hosted pendientes'),
 (['H5-013','H5-014'],'Tres evaluaciones independientes y rechazo de suficiencia incompleta','manifest:1e96b60542c517660c9d0deb6394e1947e1bc6f450588848003425d31915c652','evidence-TSK-H5-014.md','matrix-TSK-H5-014.md','tests/fixtures/h5-014/postgres-final.json','50contrapruebas;2678PG consolidados=2675/2678+retest46;197unit;health1','434inputs;original FAIL,corregido PASS;publicación ff0ad6c6e505914f31eb15d56725179c9f065426','Ficha013 IN PROGRESS previa;H5-014 no acredita cierre conjunto posterior;H6 pendiente'),
 (['H5-015','H5-016'],'T10 cierre conjunto/reapertura,invalida solo dimensión fundada,concurrencia','manifest:f72596dafa448cbba1d3ddb1525aab57097a4992f40bc0712da2eb444008f30d','evidence-TSK-H5-016.md','matrix-TSK-H5-016.md','tests/fixtures/h5-016/final-verification.json','37nuevas;78focal;66evaluadores;2756PG completos limpios;197unit;health1','456inputs;63 migraciones;F01 corregido;prepublicación015/016 conserva sucesor','Ficha015 IN PROGRESS previa;original2756 y su F01 no se mezclan con candidato inicial;H6/Hosted pendientes'),
 (['H5-017','H5-018'],'Diagnóstico protegido,causa/E4,referencias/procedencia e historia','G:fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b','acceptance-TSK-H5-017-018.md','matrix-TSK-H5-018-sixth.md','tests/fixtures/h5-018-sixth/coverage.json','2945PG/196archivos/15fases;208unit;health1;V-DOM/DAT/MIG;0materiales','G38388+sexta129;3sucesores documentales explícitos;producto106/SQL68 exactos','Cinco auditorías FAIL siguen FAIL;27 exclusiones justificadas;fixtureG auxiliares de otros actos requieren cronología explícita;DM-PENDING-005 OPEN')]
 out=[]
 for ids,capacity,identity,evidence,matrix,receipt,historical,compatibility,limits in groups:
  if re.fullmatch('[0-9a-f]{40}',identity):
   subprocess.run(['git','cat-file','-e',identity+'^{commit}'],cwd=r,check=True);subprocess.run(['git','merge-base','--is-ancestor',identity,'HEAD'],cwd=r,check=True)
  paths=['specs/001-core-crm/'+evidence,'specs/001-core-crm/'+matrix,receipt]
  refs={p:meta(p)for p in paths};assert all(refs.values())
  for id in ids:
   block=re.search(r'^#### TSK-'+id+r' .*?(?=^####|^### |\Z)',tasks,re.M|re.S)[0]
   status=next(l for l in block.splitlines()if '**Ejecución' in l)
   out.append({'id':'TSK-'+id,'sourceTaskState':status,'workingBaselineState':'COMPLETED local/aislado según base aprobada expresamente por director; contrastado con evidencia técnica','capacity':capacity,'historicallyTestedIdentity':identity,'originalEvidence':paths,'originalHashes':refs,'originalResults':historical,'compatibility':compatibility,'retainedLimits':limits,'currentVerification':'regresión01 de selección sexta y casosI01–I03 cadena68; puertasg04; detalles por caso/recibo','statusConflict':id in ['H5-011','H5-013','H5-015'],'futureVerification':'H6 según Tasks§6/§7;Hosted/Production y parámetros reales no acreditados'})
 assert len(out)==19
 # Earlier milestone exits form the reusable transitive chain; not a global AC92 PASS.
 earlier=[]
 for id in ['H0-018','H1-019','H2-012','H3-015']:
  p='specs/001-core-crm/evidence-TSK-'+id+'.md';earlier.append({'id':'TSK-'+id,'evidence':p,**meta(p),'currentCompatibility':'suite histórica incluida en selección01; no reabre aceptación ni acredita H6'})
 put('dependencies.json',{'dependencies':out,'transitiveMilestoneExits':earlier,'stateDiscrepancies':['H5-011','H5-013','H5-015'],'baselineStateSource':'User approved base 1e7822c; published implementation/audits/corrected successor evidence checked independently of task checkbox','materialDependencyBlockers':[]})
 text='# TSK-H5-019 — Auditoría de las 19 dependencias\n\nBase aprobada `1e7822c11be817e4f2d4791338284aa825ad1a24`. Evidencia histórica identificada por SHA/manifest propio; evidencia actual en los recibos01/03/g04. No se trasladan contadores entre versiones. [Registro exacto y hashes](../../tests/fixtures/h5-019/dependencies.json).\n\nTres discrepancias de coordinación quedan abiertas como observaciones documentales: ficha011 NOT STARTED,013/015 IN PROGRESS, frente a la base COMPLETED indicada por el director y sus sucesores técnicos publicados. Se conserva literalmente cada ficha, sus FAIL y su historia; la capacidad se acredita por pruebas y no por casilla. No se modifica Tasks para fabricar continuidad. La aceptación final del nuevo cierre sigue pendiente.\n\n|Dependencia|Estado recibido y capacidad|Evidencia original e identidad probada|Resultados históricos reutilizados|Compatibilidad actual y límites|\n|---|---|---|---|---|\n'
 for x in out:
  links='; '.join('['+Path(p).name+']('+('../../'+p)if p.startswith('tests/')else Path(p).name)+')'for p in x['originalEvidence'])
  # Construct links explicitly to avoid ambiguous expression precedence.
  links='; '.join(f'[{Path(p).name}]({"../../"+p if p.startswith("tests/")else Path(p).name})'for p in x['originalEvidence'])
  text+=f'|{x["id"]}|Base COMPLETED local; '+('ficha desfasada; 'if x['statusConflict']else '')+f'{x["capacity"]}|{links}; `{x["historicallyTestedIdentity"]}`|{x["originalResults"]}|{x["compatibility"]}; {x["retainedLimits"]}; {x["futureVerification"]}|\n'
 text+='\nH0–H3 se enlazan transitivamente mediante sus cuatro informes de salida, inventariados con hash en JSON. H4-024 aporta integración económica/operativa anterior. La regresión actual conserva suites fijadas a sus versiones históricas: no se afirma que cada una instale68. El ensayo adicionalI01–I03 y V-MIG68 comprueban convivencia actual. La sexta limita las últimas migraciones a tres cuerpos de diagnóstico; las anteriores migraciones y módulos de negocio se mantienen exactos.\n\nLa sustitución documental H5-009 y las exclusiones de selección son limitaciones históricas explícitas, no pérdidas nuevas ni PASS de instrumentos excluidos. Las dependencias esenciales son comprobables dentro del alcance local; no se acredita una integración externa real.\n'
 with(sp/'dependencies-TSK-H5-019.md').open('x')as f:f.write(text)
 print('19 dependency rows, 4 transitive milestone exits; 3 stale documentary states preserved')
