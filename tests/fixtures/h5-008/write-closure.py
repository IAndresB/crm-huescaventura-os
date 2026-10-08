from pathlib import Path
import json,gzip,subprocess,re,hashlib
root=Path('tests/fixtures/h5-008/definitive');sha='5e3add4b2c82fc5b0e459b43ea0685393c495840'
pre=json.loads(gzip.decompress((root/'preclosure-audit.log.gz').read_bytes()).decode());assert pre['audit']=='PASS'and pre['testedSha']==sha
report=json.loads((root/'verification.json').read_text());assert report['status']=='READY_FOR_FINAL_AUDIT';report['status']='PASS';report['finalAuditor']='scripts/verify-h5-008-evidence.mjs'
case=next(x for x in report['cases']if x['id']=='W55');oldObserved=case['observed'];case['status']='PASS';case['observed']='Auditor preclosure PASS y diff-check PASS; cierre documental separa el SHA probado del commit posterior; auditor final revalidado antes de publicación'
(root/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
p=Path('specs/001-core-crm/matrix-TSK-H5-008.md');s=p.read_text();s=s.replace('auditor y cierre todavía pendientes. H5-007/008 IN PROGRESS.','auditor y cierre PASS. H5-007/008 COMPLETED exclusivamente local/aislado.');s=s.replace('PENDING — '+oldObserved,'PASS — '+case['observed']);p.write_text(s)
current=f'''**TSK-H5-007/008 COMPLETED exclusivamente local/aislado — 2026-10-08.** SHA definitivamente probado `{sha}`. Expected independiente publicado antes de producto en `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`,26.621 bytes/SHA256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d` intactos;45 filas literales y56 casos PASS. PostgreSQL2408+54=2462/2462, unit150+4=154/154, health1/1 independiente y focal54/54. Frozen/typecheck/lint-import boundaries/build/audit producción0 vulnerabilidades/V-MIG fresh56-upgrade55 poblado-rollback-retry/advisors loopback/RLS-FORCE RLS/12 carreras reales/reinicio de procesos/idempotencia/T08-T09/finalizador HA/preservación/diff/auditor PASS. F01–F08 CLOSED con originales conservados; solo guarda histórica F01/F03 autorizada. HA/TTE/D039, M02, B07/Task/reservas/operaciones/historia reutilizados. H0–H5-006 conservados; H5 global IN PROGRESS, H5-009/010 yH6 NOT STARTED. DM-PENDING-005, BR-PENDING-035 y parámetros scheduler/retry/pause/resume/capacidad pendientes. Solo sintéticos/contactos simulados; sin exactly-once externo, conectores, scheduler real, IA/PLAUD/audio/envíos/Hosted/Production. Cierre documental posterior al SHA probado; publicación mediante push normal condicionada a revalidación final. **STOP definitivo tras007/008; no preparar tareas posteriores.**'''
for path in ['docs/PROJECT-STATUS.md','docs/NEXT-STEPS.md']:
 p=Path(path);first,rest=p.read_text().split('\n',1);p.write_text(first+'\n\n'+current+'\n\n[Cierre verificable](../specs/001-core-crm/evidence-TSK-H5-007-008.md), [matriz45/56](../specs/001-core-crm/matrix-TSK-H5-008.md).\n\n### Antecedentes y checkpoints conservados\n'+rest)
p=Path('specs/001-core-crm/tasks.md');s=p.read_text()
for id in ['007','008']:
 anchor='<a id="tsk-h5-'+id+'"></a>';a,b=s.split(anchor,1);block,rest=b.split('<a id=',1)
 block=re.sub(r'- \[ \] \*\*Ejecución: IN PROGRESS\..*?\*\* Hito: H5\.',f'- [x] **Ejecución: COMPLETED local/aislado. Evidencia: PASS sobre `{sha}`; [cierre](evidence-TSK-H5-007-008.md).** Hito: H5.',block,count=1)
 block=re.sub(r'\*\*PARCIAL\*\*: expected publicado.*?\[Evidencia de continuación\]\(evidence-TSK-H5-007-008.md\)\.',f'**PASS local/aislado** sobre `{sha}`; expected45 filas/56 casos intacto, focal54/54, PostgreSQL2462/2462, unit154/154, health1/1 separado, gates completos y auditor PASS; [cierre](evidence-TSK-H5-007-008.md), [matriz](matrix-TSK-H5-008.md). F01–F08 CLOSED. Integraciones posteriores no acreditadas.',block,count=1)
 s=a+anchor+block+'<a id='+rest
first,rest=s.split('\n',1);p.write_text(first+'\n\n'+current+'\n\n### Antecedentes y checkpoints conservados\n'+rest)
p=Path('specs/001-core-crm/defects-TSK-H5-008.md')
with p.open('a')as f:f.write(f'''
## Cierre vigente F01–F08 — PASS en {sha}

El registro anterior es cronológico y conserva estados/FAIL de cada detección. Estado actual:

| Defecto | Estado vigente | Correctivo y contraprueba definitiva |
|---|---|---|
| F01 | CLOSED | Recuento histórico acotado55;56 posterior admitida y mutaciones históricas rechazadas. |
| F02 | CLOSED | Logs originales gzip, igualdad byte a byte, sin limpiar stdout. |
| F03 | CLOSED | Bytes55 publicados en187bb1bb;11 contrapruebas PASS, con7 rechazos negativos esperados; F10/F12 intactos. |
| F04 | CLOSED | Tipado/owners/helpers/M02/JSON/fixture/transporte/conexiones:54 focales y regresión íntegra PASS. |
| F05 | CLOSED | F2 original reserve revalidado inmediatamente antes de COMMIT; inyectar rechazo final revierte20 tablas y retry pasa. |
| F06 | CLOSED | Estados before/after sin historia anidada; ocho eventos71.394bytes en retest; historia y conciliación tras stop preservadas. |
| F07 | CLOSED | Tres outputs históricos generados archivados con hash y restaurados exactamente; diff-check definitivo PASS. |
| F08 | CLOSED | Captura completa del snapshot1.858.702bytes sin ENOBUFS; repeat global y health/diff PASS. |

Corridas0b88063 y3ae329d son antecedentes, no SHA de cierre. Todos los gates definitivos y el auditor corresponden a `{sha}`. Ningún material abierto; originales y retests recuperables en fixtures. No otras guardas, manifiestos F10/F12, dependencias, permisos anteriores ni migraciones1–55 cambiados.
''')
# Detailed self-contained evidence, followed by every earlier checkpoint unchanged.
p=Path('specs/001-core-crm/evidence-TSK-H5-007-008.md');first,rest=p.read_text().split('\n',1)
new=f'''\n\n{current}

## Cadena y expected independiente

Base previa publicada: `ff109036e3bb08a1d61e948693bc622bb10f240e`. Expected exclusivo publicado: `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, anterior a cualquier producto. Checkpoints419492b1 → bd683059 →640930a8 →eb739b15; correctivo F03/F01 `4da05b0f2e25ea13094e1ef06153a7aaed1d0aab`; producto0b88063a →correctivo F06/F07 3ae329df →captura F08/SHA definitivamente probado `{sha}`. Commit documental posterior identificado por Git; no se atribuyen sus cambios documentales al SHA de las pruebas. La publicación se realiza únicamente tras auditor final PASS y push normal; la igualdad HEAD/main/origin y0/0 se comprueba como recibo posterior, sin autoasignar un SHA propio en su contenido.

[Expected congelado](expected-TSK-H5-007-008.md):26.621bytes, SHA256 `39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d`. [Matriz](matrix-TSK-H5-008.md) entrega las45 filas literales de Tasks§6,56 expected/observados y trazabilidad fila→caso→fuente→prueba. [Reporte completo](../../tests/fixtures/h5-008/definitive/verification.json) y [hashes de capturas](../../tests/fixtures/h5-008/definitive/capture-preservation.json).

## Dominio y reutilización

Migración56 `20261008143617_h5_persisted_work_recovery.sql`, aditiva, crea Definition/version inmutable, Execution Record, partes, intentos/generaciones y recibos referidos a las operaciones B07 existentes. Cada ejecución conserva definición, contexto, permisos/inputs/afectados, responsable humano, ejecutor técnico, concesión explícita, Task e historial B07. Separación persistente: pending/claimed, contacted, uncertain, succeeded; control active/paused/stopped/review. Las definiciones no se modifican en sitio. No valores operativos de scheduler por defecto.

Se reutilizan proposals/decisions/parts/reservations/events de HA y ledger M02. No segunda aprobación/reserva/autorización de efectos. `withdraw_approval` retira la aplicabilidad del enlace exacto al trabajo y conserva la decisión histórica; resume no lo vuelve a aprobar. TTE/D039 es una fachada privada propietaria de BEGIN/F1/F2/escrituras/final check/COMMIT; sin SQL/issuers/callbacks/handles públicos. Proveedores de prueba se consultan fuera de transacciones. El batch final drena constraints, revalida trabajo y F2 original reserve/evidencia, y hace COMMIT en el mismo mensaje. Receipt durable solo después de conocer COMMIT; pérdida del acuse devuelve `WorkCommitUncertainError(operationId)` recuperable por identidad.

## Concurrencia, recuperación y seguridad observadas

Doce carreras PostgreSQL reales, ambos órdenes en seis pares: claim A/B, pausa/start, retirada HA/start, revisión de versión/start, recovery/resultado tardío y recovery/ejecutor antiguo. Sesiones reales distintas del único administrador V1, dos identidades técnicas cuando corresponde; PIDs, XID, espera Lock/advisory y blocking_pids recuperables en capturas. Un solo ganador por reclamación; reevalúa estado después del lock. No intercalación secuencial presentada como concurrencia.

Tres procesos hijo terminan realmente antes de contacto, durante contacto simulado y después de efecto simulado durable antes de resultado; otros procesos reiniciados leen estado PostgreSQL. Antes de contacto: intento expirado conservado y nueva generación segura. Tras contacto: uncertain y reserva retenida, sin reenvío por concesión, orden manual o resume. Después de efecto: archivo propio del proveedor simulado permite conciliar el intento original una vez, con replay sin consumo duplicado. Generación antigua no inicia/renueva ni sobrescribe resultado posterior. Prueba tardía contradictoria produce conflicto/revisión y mantiene hecho previo. Parcial: consumed solo para parte acreditada; resto pending o uncertain, sin repetir la consumida. Pausa/stop conservan historia; stop posterior concilia sin reactivación.

Pérdida de acuse: PostgreSQL hace COMMIT real, doble wire retiene su acuse y presenta error08 simulado; resultado durable visible y replay recupera sin otra comprobación externa. No se acredita desconexión TCP limpia ni exactly-once externo. Reinicios de procesos son reales; contactos/aceptaciones/timeouts son simulados. Restauración de línea temporal es una barrera simulada de conciliación, no ensayo integral de backup/restore H6.

Cambios de contenido/versión/destinatario/alcance/importe/condiciones/efecto, evidencia caducada y retirada aplicable bloquean contacto. Rechazo de evidencia de éxito inventada, idempotencia equivalente y claves conflictivas. RLS+FORCE RLS en cinco tablas, sin CRUD directo runtime/HA/anon/authenticated; owners sin BYPASSRLS. Actor inhabilitado, sesión revocada, contexto/finalidad/autoridad adulterados denegados también en lectura/replay. Fallos de T08/T09 en ocho puntos de escritura, constraints deferred y finalizadores comparan20 tablas completas antes/después y retry de misma identidad. Roles/ACL/config/functions/tables/policies anteriores preservados.

## Gates y versiones

PostgreSQL17.11/Postgres.app real, Node24.21.0, pnpm11.19.0, Next16.3.8 intacto, Supabase CLI2.119.0 y Storage oficial aislado pinned `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Datos sintéticos; conexiones loopback. Migración rol distinto de roles de ejecución ordinarios.

| Gate sobre `{sha}` | Observado |
|---|---|
| Focal H5-007/008 |54/54 PASS;51 funcionales+3 migración/preservación |
| PostgreSQL completo |2408 previos+54 nuevos una vez=2462/2462 PASS |
| Unitarias completas |150 previas+4 nuevas=154/154 PASS |
| Health independiente posterior |1/1 PASS, separado de PostgreSQL |
| Frozen install/typecheck/lint-import boundaries/build |PASS |
| Auditoría producción |PASS,0 vulnerabilidades; dependencias/lockfile anteriores intactos |
| V-MIG |Fresh56, upgrade55 poblado, falloDDL/rollback/retry PASS; datos/catálogo previo exactos |
| Advisors |CLI oficial loopback, exit0, results[] |
| Preservación |55 migraciones anteriores exactas; F10/F12 y800 entradas PASS; H0–H5-006 conservados |
| Diff-check y auditor |PASS; cierre documental posterior sin producto cambiado |

[Comandos, SHA, exits y logs completos comprimidos](../../tests/fixtures/h5-008/definitive/verification.json). Protocolos Tasks§2.2: V-DOM(W01–27,37–44,56), V-DAT(W31–36,50), V-MIG(W48–50), V-AT(W03,19,26–30,45–47), V-SM/SM-HA-03(W11–25,43–44), V-NEG/SM-FORB-22/27(W04–18,22–25,34,39–44), V-EVI(W51–56); contexto/B08, C02/C03/C05/C06, T08/T09. Las fuentes se mantienen; no se marcan globalmente satisfechas sus comprobaciones futuras.

## F03 histórico y defectos preservados

Preflight F03: HEAD `eb739b15bdd8a5cd2a6803cbdf4a041bc7a86013`, origin/main `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, main limpio4/0; expected intacto y55 reales intactas. Guarda conserva54 anteriores contra `7eac0d27b6b74331868a14bbc4ca967f8d2f6bb9` y exige bytes de55 obtenidos del cierre publicado `187bb1bb1de81c2bd4884f56de930d35acb93d26`:23.869bytes, SHA256 `f6b47fbfa260318b2af2fc48b9aab7b4ba2a431e6f44837d48f027d45fd00ab0`.

[F03 aplicado11/11](../../tests/fixtures/h5-008/f03-applied/result.json): intactas55/adición56/restauración PASS; alterar primera, eliminar intermedia, sustituir55/comentario55/whitespace55/eliminar55 y adicional dentro de protegido producen FAIL esperados; F10/F12 PASS sin modificaciones. Son contrapruebas filesystem separadas de los contadores. F01 y F03 CLOSED solo después de ese PASS. [Registro F01–F08](defects-TSK-H5-008.md) conserva FAIL originales, correctivos y retests;0b88063/3ae329d no se reutilizan para cierre. F06 corrigió únicamente snapshots nuevos; F07/F08 archivaron outputs generados y restauraron sus bytes históricos, sin nuevas excepciones ni guardas cambiadas.

## Límites y estado global

H0–H4 yH5-001–006 conservan cierres locales/aislados; H5-007/008 COMPLETED local/aislado; H5 global IN PROGRESS. DM-PENDING-005, BR-PENDING-035 y parámetros retry/pause/resume/schedulerCapacity siguen pendientes. Fallo persistente declarado por actor autorizado produce revisión visible en CRM Importante/Crítico y WhatsApp unavailable, sin umbral automático inventado. Sin scheduler externo, conectores reales, IA/PLAUD/audio/WhatsApp/email/cobros/envíos ni Hosted/Production. H5-010/H6-006/015/016 y E2E-06 integral no acreditados; fichas H5-009 en adelante yH6 intactas/NOT STARTED. **STOP definitivo tras H5-007/008.**

## Antecedentes originales conservados
'''
p.write_text(first+new+rest)
# Independent preservation receipt for approved sources and prior local closures.
base='ff109036e3bb08a1d61e948693bc622bb10f240e';sources=['docs/constitution.md','docs/business-rules.md','docs/domain-model.md','docs/state-machines.md','docs/architecture.md','docs/DECISIONS.md','specs/001-core-crm/plan.md','specs/001-core-crm/spec.md']
for p in sources:assert Path(p).read_bytes()==subprocess.check_output(['git','show',base+':'+p]),p
original=subprocess.check_output(['git','show',base+':specs/001-core-crm/tasks.md'],text=True);currentTasks=Path('specs/001-core-crm/tasks.md').read_text();a='<a id="tsk-h0-001"></a>';b='<a id="tsk-h5-007"></a>';assert currentTasks.split(a)[1].split(b)[0]==original.split(a)[1].split(b)[0]
(root/'normative-preservation.json').write_text(json.dumps({'testedSha':sha,'baseline':base,'normativeSourcesExact':sources,'priorH0ThroughH5006FichasExact':True,'futureFichasExact':True,'normativeRowsUnchanged':True},indent=2)+'\n')
print('Documentary closure prepared after preclosure audit PASS')
