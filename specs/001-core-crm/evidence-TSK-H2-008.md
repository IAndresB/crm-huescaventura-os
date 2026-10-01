# Evidencia TSK-H2-008 — verificación independiente

Base autorizada y comprobada: `d333f140abf63b900b7e6ffbfdcfc4869575cca5`. Primera implementación `15dbf11` (SHA completo consultable en Git); expected antes de código en [expected-TSK-H2-007-008.md](expected-TSK-H2-007-008.md). Solo H2-007/008 y sus integraciones expresamente asignadas; STOP tras008. H2-009+ y H3–H6 NOT STARTED.

## Expected, datos y entorno

El expected recuperable contiene todas las filas asignadas de Tasks §6 y matriz R01–R60, fijada antes de cada ejecución/ampliación. Oráculo: fuentes APPROVED, no respuestas del producto. Implementación focal no sustituye este ensayo. PostgreSQL17.11 nativo, cluster/data sintéticos nuevos e independientes de007; runtime `crm_h0_runtime` sin owner/superuser/BYPASSRLS; migración y observador separados. Deux sesiones sintéticas autorizadas del Administrador V1 para carreras; no introducir segundo Administrador (singleton aprobado H1). No hosted ni Auth reales.

Datos: identidades de contacto/designación H1, Opportunity directa y códigos OP/PR H1, dos modalidades A/B, fuentes catálogo/tarifa sintéticas conocidas, precio final100.01, condiciones sintéticas T1 sin mandato inventado; evidencias revisadas B07/candidatas, Communications concretas cuando hay canal escrito, llamada sin Communication ficticia, anticipo solo evidencia inequívoca sin Payment. Momentos reales y de registro diferenciados. Preupgrade incluye código/identidad/contexto, catálogo/comercial/propuesta fijada/issuance/evidencia/Communication/Task H1.

## Matriz formal y observed

`tests/integration/postgres-h2-008.test.ts`: R01–R60. `tests/fixtures/h2-008/tenth-formal.log`:60/60 PASS y1/1 reproducer histórico; cero FAIL/skipped/cancelled. V-DOM/DAT/MIG/AT/SM/NEG/EVI; SM-AC01–03, SM-PV07, SM-OP07; prohibiciones FORB01/02/03/31/32 y guards materiales. Se comprueba persisted state y rollback desde observador real. V-MIG cadena vacía y predecesor completo con fixtures, ACL/functions/policies y bytes de28 migraciones anteriores conservados. Toda prueba de SM-BK/Payment/proveedor queda fuera; E2E-01/02 no completados.

R01–R16: candidato/registro/verificación, guards de identidad/relaciones/términos/selección/evidencia/vigencia, registro tardío, parcialA sinB, no seleccionable pendiente, llamada. R17–R29: anticipo como prueba/no fondos; sustitutos internos/comunicación rechazados; historia contextual; versión sustituida/rechazada; revisión posterior no retroactiva; SQL directo/inmutabilidad; rectificación enlazada y sus guards. R30–R40: replay, contenido distinto, carrera, fallo temprano/tardío/historia, actor autorizado/observador, sin/falso contexto, inhabilitado/no provisionado/ordinario, ACL/RLS. R41–R46: migraciones/fixtures/IDs/códigos/B07 y ausencia de efectos externos/económicos/operativos; vigencia posterior no desacepta histórico. R47–R60: revisión previa exacta con originales inmutables; cada material review withdrawn; WhatsApp/email/form/web exactos; total y línea selectable; autoridad inválida; pérdida; revisiones tipadas directSQL; ACL/migraciones anteriores; dos sesiones; rechazo de alcance ya aceptado vsB; posterior Ganada sin segundaAcceptance; fix/verify solapados ambos órdenes; rectificación no verificada.

## Fallos históricos y correcciones

| Fxx | Expected previo / reproducer | Observed15dbf11 | Materialidad y corrección | Estado |
|---|---|---|---|---|
| F01 | R56: SM-PV08 admite rechazo solo de alcance no aceptado; A verificada no rechazable por ese contrato | Missing expected rejection; intento permitido | Integración comercial indebida. Trigger nuevo en migración007 bloquea intersección con Acceptance verificada usable; B sigue independiente | FIXED, cierre pendiente de regresión |
| F02 | R57: SM-AC02 habilita evaluación comercial posterior del mismo hecho, sin editar verificación ni duplicar Acceptance | ACCEPTANCE_ALREADY_DECIDED | Bloqueo de recorrido material. Actos anexos de evaluación/verificación, unicidad por Acceptance/solicitudGanada; conserva verificación inicial | FIXED, cierre pendiente de regresión |

Original: `acceptance-15dbf11.sql.txt`. Verifier normativo original de57 casos congelado `verifier-defects.ts.txt`; archivo no modifica expected, solo usa cluster/puerto histórico propio. `original-15dbf11-reproduced-fail.log`:55PASS/2FAIL exactos R56/R57. `postgres-h2-008-defects.test.ts` requiere exactamente ese FAIL y causas originales. Nueva matriz afectada completa60/60 PASS, mismo expected material; ninguna historia publicada amend/rebase.

Errores del harness conservados en first–ninth logs: Task previa con payload ajeno al contrato H1; campo/time type; snapshots que incluían creación de pruebas aún no preparadas; comparación de actividad humana H0 como si fuese hecho comercial; código humano consultado con nombre inexistente; acto R22 artificialmente1ms anterior a sustitución (diagnóstico recuperable, corrige origen); Communication y progress fixtures incompatibles con B07/H2-001; sintaxis al cambiar solo now; colisión de puertos con reproducer. Expected no relajado: cronología/fixture conforme fuentes. Replay comprueba monotonicidad de `last_human_activity_at` y conserva todos los restantes datos del epoch, además de todos los hechos comerciales. Raw logs originales con whitespace conservados comprimidos y hash en raw-log-manifest.json; presentación normalizada sin ocultar FAIL.

## Comando recuperable

```sh
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin \
node --test --experimental-strip-types \
 tests/integration/postgres-h2-008.test.ts tests/integration/postgres-h2-008-defects.test.ts
```

Regresión completa aún PENDIENTE en este commit; no cerrar007/008 hasta PASS. Commit de producto probado y resultados finales se anexarán tras ejecutar. Pendientes globales preservados: PLAN-AUTH001–006, PLAN-PENDING003 abierto, DM-PENDING005, BR-PENDING022/033; datos/políticas/catálogo/tarifas/costes/capacidades/prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada. Sin conectores/envíos/pagos/proveedores reales ni ampliación Booking/operación/economía.
