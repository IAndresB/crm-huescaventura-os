#!/usr/bin/env python3
"""Prepare exact documentary postimages only; never write canonical or protected paths."""
from pathlib import Path
import hashlib,json,difflib
R=Path(__file__).resolve().parent.parent
S=Path('/Users/andres/.codex/worktrees/h6-prepublication/crm-huescaventura-os')
O=R/'tests/fixtures/h6-004/documentary-variant'
sha=lambda b:hashlib.sha256(b).hexdigest()
expected={'docs/NEXT-STEPS.md':'e5cd7951fdb7b3cb26b595dae656a6342c0cdea396aa909a6768c3bb546a5105','docs/PROJECT-STATUS.md':'3905b1927ab095dc153b222da14a349090bc00a76423410d3f20a362d21eab43','specs/001-core-crm/tasks.md':'bec54a588ced8b95e066b7c299fc0eae55388fdb22ee927e44448ad4143a3ec2'}
# Direction explicitly permits local closure only after the final independent PASS.
verdict=R/'tests/fixtures/h6-004/independent/independent-verdict.md'
gate=json.loads((R/'tests/fixtures/h6-004/closure-gate-v1.json').read_text())
assert gate['status']=='PASS' and gate['independentVerdictSHA256']==sha(verdict.read_bytes()), 'Exact accepted independent verdict required'
assert all(gate[k] is True for k in ['normativeCriteriaSatisfied','pertinentTestsPASS','noOpenMaterialDefects','independentAuditPASS','directionConditionMet'])
header='''\n<!-- H6-004-LOCAL-CLOSURE-BEGIN -->
## Estado vigente H6-004 — cierre local/aislado, 2026-10-23

**TSK-H6-004: COMPLETED — exclusivamente local/aislado. H6 global: IN PROGRESS.** Cierre formalizado por la autorización condicionada del director, tras dictamen independiente PASS y resolución del hallazgo AC-032. Alcance E2E-04: modificación/cancelación parcial, D019/D020, Refund y reevaluación del cierre afectado; resto e historia preservados. H5-019 satisfecha. Focal31/31, suplemento1/1, regresión dirigida837/837, unitarias210/210; repetición independiente31/31+1/1 y contrapruebas8/8. No existe corrida global limpia nueva: historial propio PostgreSQL1.006 PASS/117 FAIL de1.123, todos los117 con sucesor; fallos independientes2 conservados con sucesor8/8.

Acta: `specs/001-core-crm/acceptance-TSK-H6-004.md`; evidencia: `specs/001-core-crm/evidence-TSK-H6-004.md`; auditoría: `tests/fixtures/h6-004/independent/independent-verdict.md`; candidato y custodia: `tests/fixtures/h6-004/delivery-manifest-v1.json` y sello separado. Esta cabecera y su ficha son una variante aislada del lote F; no se han aplicado a coordinadores protegidos ni publicado en GitHub.

H6-001 conserva COMPLETED local/aislado y sus candidatos sellados. H6-015 conserva COMPLETED formal local/aislado, cuarentena y cuatro trabajos suspendidos: ninguna reentrada ni runtime. Los46 FAIL históricos H6-001 (2.899 PASS/46 FAIL de2.945) siguen reconciliados en su expediente original, sin reinterpretarlos como corrida limpia. Hosted/Production NO ACREDITADOS. Sin datos/efectos reales, normativa nueva, Drive, deploy, stage, commit, push, merge o cambios en main/origin/main.

Siguiente acción: autorización expresa de publicación por lotes, rutas/hash y postimágenes compartidas. A–D2 permanece como candidato separado al corte temporal anterior; F-a contiene H6-004 propio y F-b propone estas tres postimágenes después de D2. La aceptación local no autoriza su publicación conjunta. Los bloques inferiores conservan hechos, autorizaciones y estados históricos de sus fechas; sus referencias a H6-004 IN PROGRESS/NOT STARTED quedan supersedidas exclusivamente por este cierre local.
<!-- H6-004-LOCAL-CLOSURE-END -->

'''
entries=[];patch=[]
for path,pre in expected.items():
 b=(S/path).read_bytes();assert sha(b)==pre
 s=b.decode();title,body=s.split('\n',1);out=title+'\n'+header+body
 if path.endswith('tasks.md'):
  start=out.index('#### TSK-H6-004 —');end=out.index('<a id="tsk-h6-005"',start);part=out[start:end]
  old='- [ ] **Ejecución: NOT STARTED. Evidencia: NO EJECUTADA.** Hito: H6. Tipo: comprobación.'
  assert part.count(old)==1
  part=part.replace(old,'- [x] **Ejecución: COMPLETED — local/aislado. Evidencia: SATISFACTORIA; auditoría independiente PASS; cierre condicionado autorizado por dirección formalizado 2026-10-23.** Hito: H6. Tipo: comprobación.')
  part=part.replace('no cambia el estado NOT STARTED.','el estado local vigente se acredita en acceptance-TSK-H6-004.md; acceso real sigue bloqueado.')
  part=part.replace('**Acción futura:**','**Acción ejecutada en local/aislado:**')
  part=part.replace('**NO EJECUTADA**: observado y resultado aún sin producir.','**SATISFACTORIA local/aislada**: esperado/observado, 19 AC y 210 referencias en coverage-matrix-v3.json; evidencia, auditoría y custodia enlazadas en la cabecera vigente. Sin ejecución global limpia nueva.')
  out=out[:start]+part+out[end:]
 data=out.encode();dest=O/path;dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==data,'Unknown existing postimage'
 else:dest.write_bytes(data)
 patch+=list(difflib.unified_diff(s.splitlines(True),out.splitlines(True),fromfile='a/'+path,tofile='b/'+path))
 entries.append({'path':path,'beforeSHA256':pre,'afterSHA256':sha(data),'bytes':len(data),'postimage':str(dest.relative_to(R)),'source':str(S/path),'action':'PREPARED_ONLY','normativeCriteriaChanged':False})
p=R/'tests/fixtures/h6-004/documentary-overlay-v1.patch';data=''.join(patch).encode()
if p.exists():assert p.read_bytes()==data
else:p.write_bytes(data)
m={'schema':'h6004-documentary-overlay-v1','state':'PREPARED_ONLY','lot':'F-b','requires':'Exact D2 shared postimages from target v2 cc5dc936c411500d8e2085ef613d4710a5c1ac95892b20ef56e1971cbc31ec69 and explicit later publication authorization','files':entries,'patch':str(p.relative_to(R)),'patchSHA256':sha(data),'idempotence':'Exact after hash NO_OP; exact before hash may be applied only to authorized destination; otherwise conflict; no overwrite','canonicalWrites':False,'protectedWrites':False,'publication':False}
p=R/'tests/fixtures/h6-004/documentary-overlay-v1.json';data=(json.dumps(m,indent=2,ensure_ascii=False)+'\n').encode()
if p.exists():assert p.read_bytes()==data
else:p.write_bytes(data)
print('PASS',len(entries),sha(data))
