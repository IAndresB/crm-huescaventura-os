"""Focal evidence matrix: no execution, restoration, status change or publication."""
from pathlib import Path
import hashlib,json,re,subprocess,datetime
R=Path(__file__).resolve().parents[1];O=R/'tests/fixtures/h6-015-acceptance'
read=lambda p:json.loads((R/p).read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
e=read('tests/fixtures/h6-015-acceptance/expected-v1.json');assert sha(O/'expected-v1.json')==(O/'expected-v1.sha256').read_text().strip()
reports={'B':'tests/fixtures/h6-bootstrap-variant/runs/2026-10-22T14-52-59-084Z/report.json','C':'tests/fixtures/h6-c04-integration/runs/2026-10-22T16-46-33.825Z/report.json','D':'tests/fixtures/h6-015-acceptance/runs/2026-10-22T20-48-23.484Z/report.json'}
r={k:read(p) for k,p in reports.items()}
for k,d in r.items():assert not d['failures'] and d['resourcesStopped'];assert all(c['status']=='PASS' for c in d['checks'])
def evidence(ref):
 k,check=ref.split('/',1);assert any(c['id']==check and c['status']=='PASS' for c in r[k]['checks']),ref
 return {'report':reports[k],'sha256':sha(R/reports[k]),'check':check}
entries=[
('SPEC-FR-HIST-004','Objetos/metadatos incompletos visibles; recuperación con historia y permisos',['B/download_after_reconcile_missing','B/storage_restore_exact_before_start','C/business_tables_unchanged']),
('SPEC-FR-IDEMP-002','Identidad/replay; recuperación no duplica ni libera efectos',['B/no_duplicate_no_fabricated_attempts','C/replay_one_record','C/concurrent_replay_one_record','C/conflicting_replay_denied']),
('SPEC-FR-ERR-002','Incertidumbre preservada y bloqueo solo dependiente',['B/uncertain_start_repeat_blocked','C/uncertain_registered_without_success','D/uncertain_exception_no_retry','D/diagnostic_unavailable_preserves_result']),
('AC-073','Restauración preefecto, cuarentena y evidencia trazable; N03 innecesario',['B/t1_outside_restore','B/no_duplicate_no_fabricated_attempts','B/download_after_reconcile_missing','C/missing_attempt_still_absent','C/ledger_unchanged']),
('AC-074','Objetos y metadata separados, fallos visibles y acceso privado',['B/download_after_reconcile_corrupt','B/download_after_reconcile_wrong-media','B/download_before_reconcile_incomplete','B/ordinary_auth_jwt_known_storage_url_denied','B/integrated_late_private_bytes_denied']),
('SPEC-NFR-005','Procedimiento/responsables/copia y restauración probada; mediciones parciales explícitas',['B/core_restore_exact_before_start','B/auth_restore_exact_before_start','B/storage_restore_exact_before_start','B/auth_and_core_separate_real_revocation']),
('SPEC-NFR-014','E1–E8 distinguibles tras restauración, interrupción segura y parcialidad',['D/'+x for x in ['E1','E2','E3','E4','E5','E6','E7','E8','uncertain_exception_no_retry','diagnostic_unavailable_preserves_result']]),
('SM-FORB-27','Negativa efectiva a repetición sensible incierta; no éxito inventado',['B/uncertain_start_repeat_blocked','B/uncertain_new_claim_blocked','C/uncertain_registered_without_success']),
('ARCH-DEC-010','Storage privado y metadata canónica, autoridad al entregar',['B/ordinary_auth_jwt_known_storage_url_denied','B/integrated_late_private_bytes_denied','B/download_after_reconcile_missing']),
('ARCH-DEC-017','Clústeres y secretos sintéticos separados; red exterior denegada',['B/external_network_denied','B/core_socket_private','B/storage_socket_private','D/cold_copy_exact']),
('P13','68 migraciones preservadas; provisión/restore según r4; sin DDL de producto nuevo',['B/core_restore_exact_before_start','B/independent_S05_gate_pass','D/business_unchanged']),
('PLAN-DEC-008','PG/Auth/Storage reales; dobles solo fronteras; expected anterior',['B/actual_password_totp_fixture','B/integrated_real_concurrency_false','B/integrated_real_concurrency_true','D/real_auth']),
('PLAN-B10','Diagnóstico, evidencia, recuperación y límites de entrega',['D/redacted_logs','D/business_unchanged','D/revoked_auth_denied']),
('PT-12','Tramo H6015 de restauración, objetos, continuidad y no duplicación',['B/no_duplicate_no_fabricated_attempts','B/money_snapshots_history_restored_exact','D/quarantine_retained']),
('D017','Identidades e historia recuperadas sin borrado; trazabilidad de nuevos actos',['B/core_restore_exact_before_start','B/auth_restore_exact_before_start','C/business_tables_unchanged','D/business_unchanged'])]
assert {x[0] for x in entries}=={x['id'] for x in e['assignments']}
rows=[]
for id,expected,refs in entries:
 a=next(x for x in e['assignments'] if x['id']==id)
 assert (R/'specs/001-core-crm/tasks.md').read_text().splitlines()[a['tasksLine']-1]==a['literal']
 rows.append({'id':id,'tasksLine':a['tasksLine'],'expectedSummaryNotNewRequirement':expected,'result':'SATISFACTORIA_LOCAL','evidence':[evidence(x) for x in refs],'scope':'H6-015 local quarantine only; no global satisfaction of shared source'})
deps=read('tests/fixtures/h6-local-closure/dependencies-H6-015.json')['directDependencies']
assert {d['id'] for d in deps}==set(e['directDependencies'])
for d in deps:assert sha(R/d['evidence'])==d['sha256']
adoption=read('tests/fixtures/h6-c04-integration/adoption-seal-v1.json')
for f,h in adoption['files'].items():assert sha(R/'specs/001-core-crm'/f)==h
migrations=[]
for p in sorted((R/'supabase/migrations').glob('*.sql')):
 rel=str(p.relative_to(R));base=subprocess.check_output(['git','show','HEAD:'+rel],cwd=R);assert hashlib.sha256(base).hexdigest()==sha(p);migrations.append({'path':rel,'sha256':sha(p)})
assert len(migrations)==68
integrations=[{'task':task,'tasksLine':row['tasksLine'],'result':'SATISFACTORIA_LOCAL','scope':scope,'evidence':[evidence(x) for x in refs]} for task,scope,refs in [
('TSK-H0-009','Idempotencia/intenciones restauradas y replay sin duplicación',['B/no_duplicate_no_fabricated_attempts']),('TSK-H1-013','Registro manual/evidencia contextual tras restauración',['C/reviewed_registration_readback','C/cross_context_read_denied']),('TSK-H1-015','Objetos privados, metadata y referencias restauradas',['B/download_after_reconcile_missing','B/integrated_late_private_bytes_denied']),('TSK-H5-007','Trabajos/aprobación/resultado y reservas conservados',['B/paused_claim_executed','B/uncertain_new_claim_blocked']),('TSK-H5-009','Fuente externa con estado independiente y verificación/conciliación sintética',['B/t1_outside_restore','B/no_duplicate_no_fabricated_attempts']),('TSK-H5-017','Causas E1–E8/consulta protegida sobre candidato recuperado',['D/E1','D/E8','D/uncertain_exception_no_retry','D/redacted_logs'])] for row in e['integrations'] if row['sourceTask']==task]
assert len(integrations)==6
phases=[]
for i in range(1,14):
 phase='S%02d'%i
 if i==11:status='RESERVADA_NO_EJECUTADA';detail='No requisito para aceptar protección local en cuarentena; ninguna autorización implícita.'
 elif i==12:status='MEDICION_PRE_S11_SATISFACTORIA';detail='Tiempos/pérdidas del ensayo medidos; no ejecución íntegra del nodo JSON que requiere explicit_reentry ni RTO operativo.'
 elif i==13:status='EXPEDIENTE_LOCAL_SATISFACTORIO';detail='Evidencia local y STOP; no se afirma recorrido completo de la cadena JSON posterior a S11.'
 elif i==10:status='SATISFACTORIA_LOCAL';detail='Contraste por efecto; applied solo donde hay intento; ausente/incierto protegidos, no conciliación íntegra.'
 else:status='SATISFACTORIA_LOCAL';detail='Restore lógico PG17 v2 y controles afectados C04/R2; nuevas copias frías focales no son nuevo S05.'
 phases.append({'id':phase,'result':status,'detail':detail})
summary={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'task':'TSK-H6-015','taskState':'IN_PROGRESS','closureApplied':False,'rows':rows,'dependencies':deps,'additionalIntegrations':integrations,'phases':phases,'migrations':migrations,'r4AdoptionVerified':True,'responsibilities':{'director':'Andrés; authorized synthetic resources and acceptance scope','executor':'Codex main context in h6-c04-integration','independentAuditor':'bootstrap_variant_audit in h6-c04-audit with own expected/instruments','custodian':'local executor; private persistent custody, no shared secrets'},'measurements':{'cut':r['B']['cut'],'phases':r['B']['phases'],'totalElapsedMs':r['B']['totalElapsedMs'],'loss':r['B']['loss'],'outsideWitnessLoss':'NO_DETERMINADA','notRPOorRTO':True},'reserved':['S11','N03 if future B08 recognition without original attempt','ARCH-PENDING-002 Production recovery objectives/cadence/cost','DM-PENDING-005 real data','formal local closure decision','publication/deploy/Drive'],'recommendation':'COMPLETED — local/aislado; subject to independent final matrix review and explicit director closure decision','newProductChanges':False}
(O/'acceptance-matrix-v1.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'assignments':len(rows),'dependencies':len(deps),'additionalIntegrations':len(integrations),'migrations':len(migrations),'r4':'verified','taskState':'IN_PROGRESS'}))
