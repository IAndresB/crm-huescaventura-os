# Evidencia de cierre correctivo — TSK-H4-019/F06

COMPLETED exclusivamente local/aislado, 2026-10-06. F06 CLOSED tras reproducción, corrección mínima, matriz independiente y regresión completa. H4 IN PROGRESS; H4-001–019 COMPLETED local/aislado; H4-020+ y H5–H6 NOT STARTED. STOP tras esta publicación. Ningún efecto externo de negocio, dato real, hosted o Production.

## Base, expected y SHA exacto

Base original de H4-019 ae1f3c360624bb0fb3714ec3983a13b888a444a7. Base autorizada de continuación `f8318fad8bf8a7b6d8224330dc1b8840288dba60`, confirmada expresamente por el usuario; preflight main/origin/main/HEAD idénticos y árbol limpio. Expected original eb2dab9dcc7b7c0d09a8cec7677de5d745776f19 y sus bytes conservados. Suplemento independiente `6c1f060a560e28e513e87f186e16a54911a1a444`, publicado antes del producto; SHA256 `fd28964d9ae533ff79ae3370f374fd0bb4b95a11516f49a24bf97c9ca4451825`.

SHA exacto probado y publicado: `9799de20fcd4f2100f6918d28ffcbec46df203b0`. Producto SQL definitivo 620838e y verificador eba1bcd; 7d8bfc conservó streams. La regresión de 7d8bfc detectó F15 técnico del nuevo verificador: 9799de2 fijó la transacción del rechazo de migración, exige SQL 42501 real y cero backends abortados. Todos los gates se reejecutaron después de ese cambio. El cierre posterior añade exclusivamente evidencia/logs/coordinación y su SHA final se informa tras push/fetch; no se le atribuye una nueva ejecución de producto.

```
6c1f060a560e28e513e87f186e16a54911a1a444 docs(h4-019): freeze independent F06 authority and race expected
8e399f3ac5dbda8d19b3a6699424776a4a8cbe13 test(h4-019): preserve original F06 admission overlap reproduction
620838e5fe7157c33c903e4e753bd865789287b9 fix(h4-019): admit distinct sessions with compatible actor SHARE lock
eba1bcd0931d48e853b50334a8febdfd16c2b096 test(h4-019): prove business overlap and authority preservation on current49
95631c10d73331d2c71169febc55bba7ad26f051 docs(h4-019): preserve F06 development failures and retests before final freeze
7d8bfc970835bce1fcf05297e07bd97478038ae2 docs(h4-019): preserve raw streams losslessly and satisfy diff whitespace gate
9799de20fcd4f2100f6918d28ffcbec46df203b0 test(h4-019): pin migration-denial transaction and preserve F14/F15 evidence
```

## Reproducción y corrección

El hallazgo original era falta material de acreditación, no sobreconsumo probado. Original-F06 ejecutado sobre 48 por contratos ordinarios: primera unidad en barrera payment-root, segunda sesión válida del mismo actor bloqueada por actor FOR UPDATE. Resultado deliberadamente FAIL F06_EXPECTED_BUSINESS_OVERLAP_NOT_REACHED_ON_ORIGINAL48, con un solo efecto 80 sobre 100. Streams/status y reproducer originales recuperables en tests/fixtures/h4-019/f06/development y original-reproducer.test.ts.txt. Los 1995 PASS anteriores siguen siendo antecedentes de sus propios casos y SHA.

Migración 49 `20261006152658_h4_joint_funds_compatible_actor_admission.sql`, creada con CLI 2.119.0, invocación/help/stdout/stderr/status conservados. Únicamente cambia el cuerpo `crm_f2.admit(bytea,bytea,bytea,text,text)`: actor FOR UPDATE→FOR SHARE. Obtiene la definición vigente y exige exactamente una sustitución antes de CREATE OR REPLACE. Conserva ampliaciones previas de finalidades y toda guardia. Sesión/epoch FOR UPDATE, orden actor→sesión→epoch, duración transaccional, binding y final check TTE permanecen. Mutadores de autoridad mantienen exclusividad; mapping permanece único e inmutable. No KEY SHARE, admisión separada, liberación anticipada, actor adicional, privilegio, API nueva ni ejecutor sensible paralelo.

Diseño, orden de locks y adaptaciones de runners están en tests/fixtures/h4-019/f06/design-and-runner-adaptations.md. Los tests históricos de bootstrap/DDL conservan sus fronteras; los casos funcionales F2/HA/TTE se ejecutan ahora en 49 sin cambiar aserciones. M03/M04/global/recovery: 149 casos se incluyen una sola vez en regresión. La suite joint exige ambas admisiones en advisory de negocio y añade J07/T08 en ambos órdenes.

## Resultado independiente

2010/2010 PostgreSQL, 138/138 unitarias y health-check independiente 1/1 separado. Incremento PostgreSQL:1995→2010, 13 nuevos casos de autoridad/preservación y 2 nuevos J07/T08. Matriz del bloque: 79 = 63 joint + 3 preservación histórica + 13 A; incluidos en total, no se suman de nuevo. Frente a base inicial 1931:79 adicionales. Cero FAIL/cancelled/skipped/todo actuales.

28 carreras observadas en ambos órdenes, 56 snapshots. 44 esperas payment-root y 12 Opportunity padre; PID/xid/sesión, granted/wait, raíz y pg_blocking_pids completos recuperables. J02 sin hijos previos muestra contención directa de fondos. Las esperas padres se explican expresamente, sin sustituirlas por contención de fondos ficticia. Grafos observados acíclicos; no garantía universal sobre deadlocks de SQL arbitrario.

Allocation 80/Refund 80, Refund/garantía, Provider Payment y consumos incompatibles nunca consumen 160 sobre 100. Disjuntos requieren versiones actuales y continúan tras reevaluación. Deposit–Refund conserva un movimiento canónico 20, también concurrente y por nueva operación/revisión técnica. E2 por material distinto. F13/F23/F24: parcial 20/pendiente 180/reserva 60; resto no ocurrido20/180/0; otra salida60→80/120/0. Reserva restante protegida, sin liberación por Incident/Task/timeout. Autorización no equivale a reserva ni salida. Derecho contractual no depende de fondos.

AC-040/SM-RC-02, guardas y prohibiciones asignadas, PM-08 y PM-11/12/13 exactos contrastados contra expected independiente. Fuentes y oráculos por J/A se documentan en tests/fixtures/h4-019/f06/matrix.md. No floats ni nuevo motor monetario/ledger/autoridad.

## Seguridad, atomicidad y V-MIG

F1/F2, revocación, inhabilitación, límites 7/30, sesión/epoch, binding, reautorización de replay, aprobación material exacta y D039/TTE conservados. Final check tras esperas bajo ejecutor exclusivo; runtime sin tx handle/callback/SQL arbitrario. RLS/FORCE/ACL/owners/search_path/helpers privados y proyecciones mínimas comprobados. No ampliación de permisos.

Seis fallos de escritura del vínculo/movimiento/porciones/historia/resultado y deferred COMMIT conservan snapshots completos; retry válido. Pérdida de respuesta solo tras COMMIT real: recuperación durable de un hecho 20 por ambos contratos. Atomicidad interna; ninguna promesa de rollback externo o exactly-once externo.

Fresh 49 y upgrade 48 poblado por contratos ordinarios, incluyendo Refund 20 con reserva 60 y Deposit retenido 20/devuelto 30. Inyección DDL en CREATE FUNCTION, rollback exacto y retry; runtime no migra. Todos los datos y atributos del catálogo se comparan: funciones incluidas crm_f2, firmas/OID/owner/ACL/config/atributos, relaciones/RLS, políticas, triggers, roles/membresías. Solo cuerpo admit cambia; no se afirma igualdad de sus bytes. Las 48 migraciones anteriores, fuentes aprobadas, expected históricos, dependencias y health-check/documentación intactos; hashes en final/f06-immutable.json y catálogo previo/actual en final/f06-preservation.json.

## Gates y entorno

Node 24.21.0; pnpm 11.19.0; PostgreSQL 17.11 Postgres.app; CLI 2.119.0. Sin cambio de versiones/dependencias; source-map-js 1.2.2 conservado. Frozen install, typecheck, lint/imports/boundaries, build, audit producción cero vulnerabilidades, tree producción, PostgreSQL, unitarias, health separado, V-MIG/advisors y diff-check PASS sobre SHA indicado. Advisors actuales 49 y fronteras históricas explícitas únicamente 127.0.0.1, stdout/stderr/status íntegros, results[]. La frase CLI «remote database» corresponde al db-url loopback capturado; no proyecto hosted.

Los gates anteriores de 7d8bfc se conservan como antecedentes en interrupted-final-1, sin atribuir PASS a su PostgreSQL incompleto. F15 cambió lógica del verificador: producto/verificador se congelaron de nuevo en 9799de20fcd4f2100f6918d28ffcbec46df203b0 y TODOS los gates se reejecutaron en final. Su summary/status/instantes son independientes. Resultados y comandos completos en final/regression-summary.json.

## Defectos y límites de captura

F06 material CLOSED. F07 material: borrador no publicado copió definición M03 y perdió finalidades posteriores; FAIL original, corrección a definición vigente y retest completos. F08–F12/F15 técnicos del nuevo verificador/fixture: oid ambiguo, generación legítima invalidó fixture reutilizado, prototipo Result/Array, buffer inventario, obligación de Allocation ilegítima; originales y equivalencia normativa conservados. F13 documental de empaquetado: streams initdb verbatim tenían blanco final; gzip sin pérdida y hashes preservan bytes originales y satisfacen diff. F14 técnico de entorno: interrupción dejó PostgreSQL temporal propio en 55422; retry status 1/15FAIL de before H0-012, limpieza identificada pg_ctl status 0, nuevo retry del mismo SHA superó F14 pero falló A10 por F15: 2009/2010 PASS. Reproducer con pool 4 mostró UNSAFE_TRANSACTION, rollback en otro PID y lectura 25P02; unidad fijada obtiene 42501 real y ocho lecturas técnicas posteriores PASS, sin residual. Verificador corregido y SHA nuevo con regresión completa PASS. Todos CLOSED tras regresión.

La primera ejecución exacta interrumpida no capturó status/signal/error finales; no se reconstruyen. Su archivo interruption.json declara el límite. El postgres.log del nuevo arranque fallido F14 fue eliminado por el after histórico y no se inventa. Algunos helpers históricos y arranque Storage usan captura limitada/stdio ignore; sus streams internos ausentes no se presentan como recuperables. Los streams del proceso invocado, nuevos observadores, CLI/advisors y status efectivamente capturados se conservan completos. Artifacts de catálogo de desarrollo con nombre fijo reflejan último retest, no se atribuye recuperación individual a versiones anteriores no guardadas; sus FAIL stdout/stderr/status sí están conservados.

Logs de desarrollo, intento interrumpido, retry fallido y definitivo separados. gzip sin pérdida con SHA256 original/almacenado y recuperación comprobada por manifest. Los artefactos históricos regenerados se archivan como esta nueva ejecución y se restauran byte a byte al publicado. No se sobrescriben final3, FAIL históricos ni expected.

## Coordinación y STOP

Se actualizan exclusivamente estados vigentes de tasks.md, PROJECT-STATUS.md y NEXT-STEPS.md y esta evidencia; registros históricos conservados. H4-019 COMPLETED local/aislado; H4 IN PROGRESS; H4-020+ y H5–H6 NOT STARTED. Fuentes con otras comprobaciones futuras no se acreditan globalmente. DM-PENDING-005 y demás pendientes conservan ámbitos; hosted H2/H3 no acreditados, Production no autorizada. STOP inequívoco, continuidad al hilo de dirección H4. Ninguna preparación posterior ni dato/efecto externo real.
