# H6-015 — Auditoría integral y propuesta de cierre local

Fecha: 2026-10-22. **Estado efectivo: IN PROGRESS. Ningún cierre aplicado.** Base Git `971c55d5ce5770c71284d106d3c0deecca9514b5`, worktree `h6-c04-integration`. Documento local sin publicación.

## Dictamen técnico propuesto

Las obligaciones de la ficha **en alcance local/aislado y cuarentena** se consideran satisfechas, una vez completada la integración focal de diagnóstico. Se recomienda **COMPLETED — local/aislado**, con dictamen independiente final favorable, pendiente únicamente de decisión expresa del director para registrar el cierre. No equivale a completar H6 global, Production, recuperación operativa íntegra, S11 ni la conciliación de negocio de todos los efectos.

N01/N02, r4, C04→B07, C07, AC-073 local y la cobertura local AC-074 están aceptados por el director. No son decisiones pendientes. N03 es innecesario para AC-073 y no se introduce como dependencia.

## Matriz integral de aceptación

La [matriz íntegra JSON](../../tests/fixtures/h6-015-acceptance/acceptance-matrix-v1.json) conserva las 15 asignaciones extraídas literalmente de Tasks §6, las cuatro dependencias, las seis integraciones entrantes, las trece fases y los hashes de las 68 migraciones. Cada fila enlaza IDs de controles realmente ejecutados y hash del informe; no se asigna cobertura por mera coincidencia de nombres.

Referencias de prueba: **B** = restauración PG17 v2, run `2026-10-22T14-52-59-084Z`; **C** = integración C04 R2, run `2026-10-22T16-46-33.825Z`; **D** = focal diagnóstico, run `2026-10-22T20-48-23.484Z`. B y C se reutilizan con integridad actual comprobada; D es ejecución nueva. La aceptación es solo del tramo asignado a H6-015, nunca de una fuente global compartida.

| Requisito | Resultado local y obligación | Evidencia concreta |
|---|---|---|
| SPEC-FR-HIST-004 ([Tasks:2706](tasks.md:2706)) | **SATISFACTORIA** — Objetos/metadatos incompletos visibles; recuperación con historia y permisos | B/download_after_reconcile_missing, B/storage_restore_exact_before_start, C/business_tables_unchanged |
| SPEC-FR-IDEMP-002 ([Tasks:2723](tasks.md:2723)) | **SATISFACTORIA** — Identidad/replay; recuperación no duplica ni libera efectos | B/no_duplicate_no_fabricated_attempts, C/replay_one_record, C/concurrent_replay_one_record, C/conflicting_replay_denied |
| SPEC-FR-ERR-002 ([Tasks:2733](tasks.md:2733)) | **SATISFACTORIA** — Incertidumbre preservada y bloqueo solo dependiente | B/uncertain_start_repeat_blocked, C/uncertain_registered_without_success, D/uncertain_exception_no_retry, D/diagnostic_unavailable_preserves_result |
| AC-073 ([Tasks:2824](tasks.md:2824)) | **SATISFACTORIA** — Restauración preefecto, cuarentena y evidencia trazable; N03 innecesario | B/t1_outside_restore, B/no_duplicate_no_fabricated_attempts, B/download_after_reconcile_missing, C/missing_attempt_still_absent, C/ledger_unchanged |
| AC-074 ([Tasks:2825](tasks.md:2825)) | **SATISFACTORIA** — Objetos y metadata separados, fallos visibles y acceso privado | B/download_after_reconcile_corrupt, B/download_after_reconcile_wrong-media, B/download_before_reconcile_incomplete, B/ordinary_auth_jwt_known_storage_url_denied, B/integrated_late_private_bytes_denied |
| SPEC-NFR-005 ([Tasks:2848](tasks.md:2848)) | **SATISFACTORIA** — Procedimiento/responsables/copia y restauración probada; mediciones parciales explícitas | B/core_restore_exact_before_start, B/auth_restore_exact_before_start, B/storage_restore_exact_before_start, B/auth_and_core_separate_real_revocation |
| SPEC-NFR-014 ([Tasks:2857](tasks.md:2857)) | **SATISFACTORIA** — E1–E8 distinguibles tras restauración, interrupción segura y parcialidad | D/E1, D/E2, D/E3, D/E4, D/E5, D/E6, D/E7, D/E8, D/uncertain_exception_no_retry, D/diagnostic_unavailable_preserves_result |
| SM-FORB-27 ([Tasks:3100](tasks.md:3100)) | **SATISFACTORIA** — Negativa efectiva a repetición sensible incierta; no éxito inventado | B/uncertain_start_repeat_blocked, B/uncertain_new_claim_blocked, C/uncertain_registered_without_success |
| ARCH-DEC-010 ([Tasks:3121](tasks.md:3121)) | **SATISFACTORIA** — Storage privado y metadata canónica, autoridad al entregar | B/ordinary_auth_jwt_known_storage_url_denied, B/integrated_late_private_bytes_denied, B/download_after_reconcile_missing |
| ARCH-DEC-017 ([Tasks:3128](tasks.md:3128)) | **SATISFACTORIA** — Clústeres y secretos sintéticos separados; red exterior denegada | B/external_network_denied, B/core_socket_private, B/storage_socket_private, D/cold_copy_exact |
| P13 ([Tasks:3142](tasks.md:3142)) | **SATISFACTORIA** — 68 migraciones preservadas; provisión/restore según r4; sin DDL de producto nuevo | B/core_restore_exact_before_start, B/independent_S05_gate_pass, D/business_unchanged |
| PLAN-DEC-008 ([Tasks:3162](tasks.md:3162)) | **SATISFACTORIA** — PG/Auth/Storage reales; dobles solo fronteras; expected anterior | B/actual_password_totp_fixture, B/integrated_real_concurrency_false, B/integrated_real_concurrency_true, D/real_auth |
| PLAN-B10 ([Tasks:3173](tasks.md:3173)) | **SATISFACTORIA** — Diagnóstico, evidencia, recuperación y límites de entrega | D/redacted_logs, D/business_unchanged, D/revoked_auth_denied |
| PT-12 ([Tasks:3207](tasks.md:3207)) | **SATISFACTORIA** — Tramo H6015 de restauración, objetos, continuidad y no duplicación | B/no_duplicate_no_fabricated_attempts, B/money_snapshots_history_restored_exact, D/quarantine_retained |
| D017 ([Tasks:3280](tasks.md:3280)) | **SATISFACTORIA** — Identidades e historia recuperadas sin borrado; trazabilidad de nuevos actos | B/core_restore_exact_before_start, B/auth_restore_exact_before_start, C/business_tables_unchanged, D/business_unchanged |

## Dependencias e integraciones

H5-019, H6-006, H6-008 y H6-014 mantienen actas COMPLETED local cuyos hashes se han revalidado. Sus referencias históricas a H6-015 NOT STARTED describen fechas anteriores; la decisión vigente del director y este registro conservan H6-015 IN PROGRESS. No se alteran actas selladas ni Tasks para maquillar esa cronología.

| Integración remitida a H6-015 | Resultado y alcance verificado |
|---|---|
| TSK-H0-009 — Tasks:433 | **SATISFACTORIA LOCAL** — Idempotencia/intenciones restauradas y replay sin duplicación |
| TSK-H1-013 — Tasks:822 | **SATISFACTORIA LOCAL** — Registro manual/evidencia contextual tras restauración |
| TSK-H1-015 — Tasks:857 | **SATISFACTORIA LOCAL** — Objetos privados, metadata y referencias restauradas |
| TSK-H5-007 — Tasks:2003 | **SATISFACTORIA LOCAL** — Trabajos/aprobación/resultado y reservas conservados |
| TSK-H5-009 — Tasks:2038 | **SATISFACTORIA LOCAL** — Fuente externa con estado independiente y verificación/conciliación sintética |
| TSK-H5-017 — Tasks:2181 | **SATISFACTORIA LOCAL** — Causas E1–E8/consulta protegida sobre candidato recuperado |

No se exige repetir el cierre completo de esas tareas. Se verifica su integración en recuperación. H6-016/H6-017/H6-018 son fichas distintas; no se convierten en dependencias directas nuevas.

## Procedimiento r4, integridad y trazabilidad

Se han recotejado r3 histórico, r4 propuesto, r4 adoptado y el registro de aprobación contra el sello de adopción. La cabecera vigente de r4 limita expresamente su adopción al alcance local. Las menciones internas a H6-014 no ejecutada son históricas, no resultados actuales ni un bloqueo contra las autorizaciones posteriores.

Core y Storage conservaron bootstrap original/OID10, grantors, atributos, membresías ADMIN/INHERIT/SET, propietarios y ACL sin autoridades adicionales. La aserción sobre el único CREATE ROLE satisfecho por initdb conserva el resto de globals. Las 68 migraciones actuales son byte a byte las de HEAD; no hay migración, contrato ni cambio de producto nuevo en este bloque. C07 conserva sus bytes auditados.

[Integridad de paquetes](../../tests/fixtures/h6-015-acceptance/packages-integrity-v1.json): **8 manifiestos / 4.390 entradas de payload verificadas**, sin discrepancias, leyendo cada candidato en su worktree histórico correcto. No es un recuento deduplicado de archivos únicos. Incluye candidatos FAIL y revisiones anteriores, PG17 v2, auditoría bootstrap, C04 R2 y resolución AC-073. No se sustituye un candidato antiguo con los bytes del sucesor.

Responsabilidades para este ensayo: Andrés autoriza recursos y decide aceptación; Codex ejecuta en el worktree identificado; el auditor trabaja en contexto/worktree separados con expected/instrumentos propios; la custodia local del material sintético la mantiene el ejecutor mediante permisos restrictivos. Esta asignación no designa un operador Production ni aprueba cadencias productivas.

## Fases y protocolos

- S01–S09: entradas, recursos, corte t0/testigo t1, copias, restore lógico, renovación F1/F2, Auth/revocación, objetos e integridad acreditados por B y su auditoría; C y D solo repiten controles afectados sobre copias frías nuevas.
- S10: contraste trazable de cuatro casos; éxito/ausencia acreditados se concilian donde existe intento. El intento t1 ausente conserva C04→B07 y suspensión; el efecto incierto permanece incierto. No se declaran conciliados completamente esos dos casos.
- **S11: no autorizada y no ejecutada.** Es puerta separada de reentrada; no requisito artificial para aceptar el comportamiento local en cuarentena.
- **S12: mediciones pre-S11 satisfechas.** No se declara recorrido completo del nodo JSON de r4, que requiere explicit_reentry. El requisito de Tasks de medir resultados del ensayo se acredita con corte, fases y pérdidas dentro de cobertura; no hay RTO operativo.
- **S13: expediente y STOP locales preparados.** No se afirma haber recorrido la cadena instrumental completa S11→S12→S13. r4 aclara que esos identificadores instrumentales no crean nuevos requisitos normativos; el alcance final no autoriza cambiar el grafo ni reentrar.

V-DOM: expected originales más regresión histórica 210/210 y focal C07 22/22, sin cambios posteriores de producto. V-DAT: PostgreSQL/Auth/Storage reales en B y permisos/concurrencia reales en C; diagnóstico PostgreSQL/Auth real en D. V-MIG: cadena68 y catálogos restaurados íntegros; no cambio persistente nuevo que requiera otra migración. V-AT: replay/conflicto/concurrencia de C, conservación B08/HA de B/D y finalización ya acreditada de dependencias. V-NEG: intentos reales rechazados de claim/start incierto, acceso y respuesta tardía; no se infiere un negativo de la mera ausencia de contacto. V-SM: no hay filas SM-XX de transición nueva asignadas directamente a esta ficha; la prohibición asignada SM-FORB-27 sí se verifica. V-EVI: fuentes/expected/casos/observados/fallos/hashes/custodia diferenciados.

## Laguna corregida: diagnóstico tras recuperar

La matriz histórica dejaba SPEC-NFR-014 parcial y las 16 superficies HTTP no incluían el puerto diagnóstico. La focal D usa una copia fría íntegra del clúster final C04 R2, generaciones nuevas F1/F2, Auth/TOTP local real, rol runtime ordinario y H5017DiagnosticAdapter existente.

Resultado **20/20 PASS**: E1–E8 persistidos y consultables por referencia; excepción de resultado desconocido conserva E4 y no se repite; fallo del registrador no cambia la respuesta; logs minimizados; raíz inexistente/identidad inválida/revocada denegadas; nueve observaciones nuevas; **169 tablas comparadas sin cambios durante el lote diagnóstico**, después de la revocación inicial y antes de la revocación final, excluyendo expresamente la tabla de observaciones y actividad de sesiones del comparador. La comparación independiente cubre toda la focal desde la copia recibida hasta la revocación final: 175 tablas, 167 intactas y ocho con los cambios de diagnóstico/seguridad autorizados; no se confunden denominadores ni intervalos. Las filas diagnósticas previas también se comprueban conservadas (cero en este fixture). Cuatro trabajos siguen pausados, intento ausente sigue ausente, testigo externo sin cambios.

Límites: E6 usa un doble de canal no disponible; E7/E8 son entradas semánticas controladas al puerto diagnóstico, con fuentes restauradas unknown/inconsistent comprobadas como contexto. Se prueba su persistencia y diferenciación, no un clasificador automático ni la equivalencia unknown=E7. La semántica de las causas conserva las pruebas de dominio H5; no se presenta esta focal como repetición de ellas. No se emplean dobles para acreditar Auth, SQL o permisos. La focal no repite Storage ni la restauración lógica S05 y no amplía su cobertura.

FAIL inicial conservado: el instrumento esperaba página vacía al consultar una raíz inexistente; el contrato aprobado la deniega. Se corrigió la expectativa mediante adenda trazable y se repitió únicamente la focal. Ningún código de producto ni norma se modificó para obtener PASS. TypeScript, fronteras de importación y git diff --check PASS.

## Mediciones, cobertura y cuarentena

Restauración S05 observada: 3,023 s; total del ensayo B: 215,661 s, incluyendo 187,153 s de espera de auditoría. Corte/copia: 1,197 s (ventana interna de captura 1,152 s). Auth/revocación 2,305 s; objetos/permisos 0,301 s; integración HTTP 9,252 s; conciliación 0,178 s. No son objetivos ni garantías RPO/RTO.

El conjunto t0 capturado se restituye exactamente antes de servir; el intento t1 ausente y el efecto incierto se identifican por separado. La pérdida total fuera de la cobertura del testigo es **NO DETERMINADA**, no cero. 500,00 EUR sintéticos recibidos, 200,00 verificados y 300,00 pendientes se conservan sin doble cómputo. Objeto ausente sigue missing y sin descarga; la reparación del enlace incompleto no acredita el objeto ausente.

[Readback de cuarentena](../../tests/fixtures/h6-015-acceptance/quarantine-v1.json): clúster focal detenido, sin listener Auth en su puerto, cuatro trabajos pausados en foto final. Sin S11 ni proceso de negocio iniciado. El cierre documental eventual no libera trabajos, reservas ni autoridades; efecto incierto e intento ausente continúan bloqueando solo su continuación dependiente.

## Custodia y exclusiones

[Custodia focal](../../tests/fixtures/h6-015-acceptance/custody-v1.json): **5.219 archivos / 183.280.426 bytes**; copias rehasheadas frente a originales conservados, propietario comprobado, directorios0700/archivos0600, sin ACL permisivas. Inventario privado SHA-256 `d883811a8ec2ed9745585feb452398fddcd303237d2952f6d6b057a20ff9ae55`. No se afirma cifrado adicional ni WORM.

Dumps, configuración, claves/tokens/factores, snapshots privados y clústeres quedan fuera del paquete publicable y de Git/Drive. La comprobación de secretos sintéticos solo emite agregados. El inventario de este expediente es aditivo: informe, matriz, verificadores, expected/adendas, resultados saneados y referencias; nunca staging masivo ni material ajeno.

## Dictamen independiente final

El [dictamen independiente](/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os/specs/001-core-crm/audit-TSK-H6-015-acceptance-independent-v1.md) es **FAVORABLE**, sin hallazgos materiales ni obligaciones técnicas locales pendientes. SHA-256 `a8e3e65bf8bb408c5f73c85b82766643c1a19063842caac9b44e132a1a9be14e`. La condición de revisión independiente expresada en la matriz congelada queda satisfecha; la decisión de cierre sigue reservada al director.

Expected, instrumentos, worktree y adquisición SQL propios: 4.515 controles documentales/de integridad, con diez contrapruebas, y 2.834 controles de custodia/adquisición/SQL. Son controles de auditoría, no escenarios funcionales adicionales. La independencia es técnica y de contexto; se comparte máquina y familia de herramientas, sin atribuir una auditoría organizativa externa.

El [manifiesto auditor](/Users/andres/.codex/worktrees/h6-c04-audit/crm-huescaventura-os/tests/fixtures/h6-015-acceptance-independent/delivery-manifest-v1.json), **15 payloads / 804.666 bytes**, SHA-256 `047bf131fb54945409d03ed260eec3f0b754e8b866af3ead4f58db3ac5a3097e`, ha sido rehasheado desde el ejecutor. La custodia propia del auditor conserva 5.210 archivos / 179.876.380 bytes; originales y FAIL preservados, recursos detenidos. No se agregan esos archivos al inventario del ejecutor.

## Pendientes reales y propuesta al director

**Sin obligación técnica local pendiente identificada tras D y su auditoría independiente final.** Permanecen:

1. Decisión expresa del director para aceptar y registrar COMPLETED — local/aislado. Este expediente no cambia el estado.
2. Cuarentena obligatoria de los efectos no conciliados; S11 y cualquier continuación requieren autorización y guardas propias. La ausencia de objeto mantiene el acceso dependiente bloqueado.
3. N03 solo si se desea una capacidad futura de reconocimiento B08 sin intento original; innecesaria para AC-073 y no implementada. La incertidumbre requiere evidencia suficiente, no N03 por sí sola.
4. ARCH-PENDING-002: objetivos RPO/RTO, coste/complejidad, periodicidad/capacidad Production. DM-PENDING-005: tratamiento real de datos. Ambos OPEN; no bloquean la aceptación del ensayo local.
5. Publicación GitHub, Drive, despliegue y uso real: no autorizados y separados de la aceptación técnica.

Propuesta concreta: «Aceptar la matriz integral y su dictamen independiente y autorizar el registro de TSK-H6-015 como COMPLETED exclusivamente local/aislado y en cuarentena, manteniendo S11 no ejecutada, efectos pendientes suspendidos, N03 no implementada y ARCH-PENDING-002/DM-PENDING-005 OPEN. Esta aceptación no autoriza publicación, despliegue ni uso real.»

La recomendación no exige una nueva aprobación de N01/N02/r4/C04/C07/AC-073/AC-074. Únicamente propone la decisión final de cierre que el director ha reservado.
