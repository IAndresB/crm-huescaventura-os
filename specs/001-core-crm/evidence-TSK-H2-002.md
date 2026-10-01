# TSK-H2-002 — Verificación independiente de captación y progreso comercial

Fecha: 2026-10-01. Base comprobada tras `git fetch origin`: main limpio, HEAD = origin/main = `056d77bee91fdf87ffd510559e36de115106dcc7`. H1-019 COMPLETED local/aislado; H2-001/002 NOT STARTED al inicio.

## Expected normativo congelado antes de código y observed

Autoridad: Tasks fichas H2-001/002, §§2.2/2.3, todas sus filas §6 y pendientes aplicables §7; Plan §4 B03, §7.1 C02, §7.2 T02 solo límite futuro, §7.3 y PT-01; SPEC COM-001–005, AC-001/004/005/006; BR-LEAD-001–005, BR-DIM-001/003, BR-CONV-001–004; DM-INV-005–007 y conceptos §§4/6–9/12; SM G1–G6, §§2.2/4/18 y SM-FORB-30; Constitución P08. E2E-01 solo contribución futura, integración H6 pendiente. H1-019 entrega identidades/contexto/historia, códigos OP H1-003/004 y B07 H1-013–018 reutilizables.

Los únicos mínimos comerciales son contacto válido, necesidad/evento identificable y posibilidad comercial real. Cada ausencia bloquea Opportunity; scoring, fecha definitiva, personas finales, servicios exactos y presupuesto cerrado no son requisitos. Desconocidos permanecen visibles. Lead incompleto conserva señal, contexto, origen y responsable; convertir conserva vínculo e historia. Opportunity directa del Administrador usa mismos mínimos, conserva actor/procedencia y reutiliza identidades; sin Lead, etapas, Communication ni Acceptance ficticios.

Estados aprobados: Nueva, En contacto, Necesidad definida, Propuesta en preparación, Propuesta enviada, Negociación / cambios, Aceptada / Ganada, Perdida, En pausa. Solo SM-OP-01–06/08–11 pertenecen a este bloque. Contacto intentado no implica respuesta. Negociación conserva intercambio/alcance y no cambia propuesta ni proveedor. SM-OP-04/05 y destino preparación SM-OP-10 requieren las capacidades reales de Proposal/Version de H2-003/005; hasta entonces su parte dependiente queda bloqueada explícitamente, sin mocks acreditativos ni creación futura. Las guardas comerciales se evalúan y su parte restante se conserva pendiente conforme Tasks §2.3. SM-OP-07 y Acceptance positiva pertenecen a H2-007/008. Ganada se deniega por escritura ordinaria, aprobación interna, comunicación enviada/leída, supuesto pago/proveedor o aceptación histórica.

Perdida requiere motivo y contexto; motivos mínimos representables: precio, fechas, falta de disponibilidad, cliente no responde, eligió otra empresa, canceló/cambió viaje, no encaja, otro, desconocido. No inferir causas desde silencio. Rechazo de una alternativa no pierde toda venta. Pausa exige decisión, motivo, contexto de seguimiento y estado previo. Reactivación requiere nuevo interés/decisión documentada, revisión comercial actual y destino actualmente sustentado; conserva pérdidas/pausas/motivos. Retroceso requiere cambio documentado y evaluación humana; conserva hechos/historia/versiones/envíos referenciados. Reactivar no revalida tarifas ni disponibilidad ni aceptación histórica.

P08/DM-INV-006: ninguna acción comercial crea Booking, Acceptance, fondos, conciliación, disponibilidad, proveedor confirmado, ejecución o Refund. Task pendiente nunca acredita un hecho. C02 devuelve permiso/bloqueo e IDs; dominio sin I/O. Persistencia, historia, resultado y OP H1 en una unidad atómica; rechazos sin parciales. Replay equivalente recupera resultado reautorizado, contenido distinto misma clave conflicto; concurrencia protege ausencia y revisión. V-DAT usa runtime no propietario/no BYPASSRLS, F1/F2 existentes; DML ordinario y contextos falsificados denegados. V-MIG cadena vacía y upgrade H1 con fixtures conserva todo H1 y permisos.

## Matriz formal previa

Cada R se ejecutará con fixtures sintéticos nuevos y PostgreSQL 17 efímero separado de focales; persisted-state desde conexión independiente. Expected de esta tabla precede implementación. Estado inicial de todas las filas: NO EJECUTADA.

| R | Expected / protocolos / fuente |
|---|---|
| R01 | Tres mínimos → Nueva; cada mínimo ausente → rechazo/cero Opportunity. V-DOM/DAT/SM OP-01, AC-004 |
| R02 | Omitir separadamente scoring/fecha/personas/servicios/presupuesto → permitido, desconocidos conservados. COM-001, AC-001/004 |
| R03 | Lead incompleto y conversión conserva origen/vínculo/responsable/identidades; directa sin Lead/comunicación/Acceptance ficticios. OP-01 |
| R04 | Replay y equivalente coherentes, OP único H1; distinta misma clave conflicto; permisos reautorizados. V-AT, G6 |
| R05 | Nueva → En contacto con actuación/canal/destinatario/resultado; cada guarda ausente deniega; intento no respuesta. OP-02 |
| R06 | Nueva o En contacto → Necesidad definida con necesidad/alcance/fuente/pendientes; cada guarda ausente deniega. OP-03 |
| R07 | Orígenes OP-04, alcance suficiente/alternativa/pendientes evaluados; Proposal no disponible → bloqueo limitado H2-003; cada guarda retirada bloquea. OP-04 |
| R08 | Activa, versión fijada/envío exacto real/guardas §5; capacidad no disponible → bloqueo H2-005; datos supuestos no acreditan envío. OP-05 |
| R09 | Necesidad definida → Negociación con intercambio y alcance; otros orígenes dependientes quedan pendientes; cada guarda ausente deniega, sin modificar oferta/proveedor. OP-06 |
| R10 | Activa o En pausa → Perdida con motivo/contexto; sin cada guarda deniega; todos los motivos, desconocido explícito/silencio; alternativa rechazada no inferencia. OP-08, AC-005 |
| R11 | Activa → En pausa con decisión/motivo/seguimiento; cada ausencia deniega; estado anterior conservado. OP-09 |
| R12 | Perdida/En pausa → contacto/necesidad sustentados actuales; preparación pendiente H2-003; cada guarda ausente deniega, pérdida/pausa/motivo intactos. OP-10, AC-006 |
| R13 | Activa → contacto/necesidad con cambio/evaluación humana/destino sustentado; cada ausencia deniega; historia/hechos anteriores intactos. OP-11 |
| R14 | Ganada por siete sustitutos (estado, aprobación, envío, lectura, pago, proveedor, aceptación histórica) denegada; cero Acceptance/Booking/pago/confirmación. COM-003 |
| R15 | Ejecutar pérdida sin motivo, borrar pérdida al reactivar, renovar tarifa y disponibilidad: rechazo/independencia, historia intacta. V-NEG SM-FORB-30 |
| R16 | Admin autorizado, sin contexto, falsificado, inhabilitado, ordinario/directo, RLS/ACL mínimos y escritura directa contra inmutabilidad. V-DAT, G1 |
| R17 | Historia visible en conexión independiente, identidad/código/contexto H1 conservados; ningún efecto operativo/económico ni hecho inventado. V-DAT, G4/G5, P08 |
| R18 | Fallo antes/durante escrituras → cero parciales, respuesta perdida/replay, misma clave distinta, dos actores/raíces sin hijos en ambos órdenes/solapamiento, revisión concurrente. V-AT |
| R19 | Migración desde vacía, upgrade inmediato H1 completo y fixtures identidades/códigos/historia/B07/Tasks/permisos idénticos. V-MIG |
| R20 | Independencia dominio/aplicación, IDs normativos y unknown/bloqueo dependiente; regresión completa H0/H1/H2 sin debilitar. V-DOM/EVI |

## Observed

Pendiente. No se acredita todavía ninguna fila ni se cierra H2-001/002.

## F01 — integración B07, descubierto por primera matriz ejecutable

Estado inicial: OPEN, material. Commit de implementación observado `00cf358c24829d21529893eaf846ad40ab931bec`. Expected: Evidence manual revisada, Communication contextual y resultado conocido permiten OP-02; intercambio revisado permite OP-06. Fuente H1 B07: `202609300001_h1_evidence_communications.sql`, `b07_valid_material`, certeza persistida `candidate`/`reviewed`, distinta de proyección C01 `verified`.

Observed: `COMMERCIAL_ACTUAL_EVIDENCE_REQUIRED` en R05, R06, R09, R13; H2 comparaba certeza persistida con `verified`. Primera matriz ejecutable 15/20 PASS, 5 FAIL, 6535.187042 ms. El quinto fallo R18 era del harness: intentaba provisionar segundo CRM Actor contra singleton H0; no defecto de producto. Las primeras preparaciones de harness fallaron antes de ejecutar R por `expectedVersion`/momento B07 omitidos y valor de certeza inválido; no acreditaron nada. Se corrigieron los fixtures para respetar los contratos H1.

Reproducer original y observed preservados: `tests/fixtures/h2-002/f01-original-verifier.ts.txt`, `tests/fixtures/h2-002/f01-first-run.txt`; migración original recuperable con `git show 00cf358:supabase/migrations/20261001081941_h2_commercial_progress.sql`. Copiar verifier al path original y ejecutar contra ese estado reproduce el bloqueo de R05/R09. Expected original en esta evidencia permanece intacto. Corrección mínima: H2 consulta `reviewed`, sin cambiar ni reinterpretar B07/H1. Harness V-AT preserva singleton: dos sesiones autorizadas del Administrador más actor/subject no provisionado, ambos órdenes y solapamiento. No se amplían roles.

Reejecución completa tras corrección: R01–R20 **20/20 PASS**, cero fail/skipped/cancelled, 4109.93725 ms, en cluster nuevo. Incluye tarifa H1 publicada sintética `100` con vigencia final `2026-09-10` y Evidence histórica de disponibilidad caducada; precio/vigencia/referencia conservados al reactivar. Snapshot upgrade incluye catálogo/tarifas/Applications previos. F01 **CLOSED localmente** por esta ejecución completa; verificación final del commit de corrección y regresión pendientes.

Reproducer ejecutable independiente añadido: `tests/integration/postgres-h2-002-f01.test.ts` carga la migración original mediante `git show 00cf358c24829d21529893eaf846ad40ab931bec:…` en cluster propio y comprueba el rechazo original de contacto revisado. Su PASS significa defecto histórico reproducido; no acredita el expected positivo, que pertenece únicamente a R05/R09 actuales. No requiere cambiar checkout ni reescribir migraciones. La corrección modifica exclusivamente la migración H2 aún no publicada; H0/H1 permanecen intactas.

## Primera reverificación completa del commit de corrección F01

Commit probado exacto: `a5bbb06e323e897d853a5ea9527bc3a931a814fc`. PostgreSQL 17.11 (Postgres.app), Node 24.21.0, pnpm 11.19.0, Postgres.js 3.4.9. Fixtures creados por el verifier, sin datos personales/comerciales reales; cluster `crm_h2_002` efímero distinto de `crm_h2_001`, credenciales y claves aleatorias no conservadas. Migración/inspección mediante `crm_h0_migration`, preparación de roles mediante bootstrap; actuaciones comerciales exclusivamente `crm_h0_runtime`, no propietario/no BYPASSRLS. C01/C03 verifican F1/F2 y actor/sesión/alcance actuales; dominio no recibe SQL/framework.

Comando formal: `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h2-002.test.ts`. Resultado: **R01–R20 20/20 PASS**, cero fail/skipped/cancelled, 3670.954333 ms. Transcript: `tests/fixtures/h2-002/post-f01-formal.txt`; casos/fixtures/assertions recuperables en el verifier. La consulta `observer` independiente comprueba snapshots persistidos y rechazos sin cambios, no mocks PostgreSQL.

| R | Observed frente al expected previo | Resultado |
|---|---|---|
| R01 | Nueva con los tres mínimos; SQL firmado independiente deniega contacto ausente/inválido, necesidad ausente y posibilidad falsa; snapshot completo idéntico tras cada rechazo | PASS |
| R02 | Cinco altas separadas omiten scoring/fecha/personas/servicios/presupuesto; otra conserva null explícito; ninguno se infiere | PASS |
| R03 | Lead incompleto intacto tras conversión, vínculo/origen/responsable/contactId preservados; directa reutiliza contexto y OP H1 ya asignado, sin Lead ficticio | PASS |
| R04 | Resultado de commit descartado y replay equivalente sin mutación; misma clave/material distinto denegada; nueva clave/conversión equivalente recupera misma Opportunity/OP | PASS |
| R05 | Contacto B07 real contextual con Evidence manual reviewed y resultado conocido permite En contacto; retirada de fuente/Communication/Evidence/resultado y referencias inexistentes/cruzadas deniega; cero hecho respuesta | PASS |
| R06 | Ambos orígenes Nueva/En contacto llegan a Necesidad definida; fuente/necesidad/alcance/pendientes individualmente ausentes deniegan; datos finales desconocidos conservados | PASS |
| R07 | Todos los orígenes comerciales y guardas de OP-04 evaluados; SQL real conserva todo y bloquea exclusivamente capacidad Proposal H2-003; cada guarda ausente bloquea | PASS local, positivo integrado pendiente H2-004 |
| R08 | OP-05 no puede acreditar versión/envío inexistentes; cada guarda ausente deniega; con referencias sintéticas mantiene dependencia exacta H2-005 sin fabricar versión o envío | PASS local, positivo integrado pendiente H2-006 |
| R09 | Intercambio Evidence reviewed contextual y alcance desde Necesidad definida permiten Negociación; cada guarda/ref inválida deniega; material previo idéntico. Orígenes Proposal dependientes quedan evaluados en dominio, sin acreditar Proposal | PASS local |
| R10 | Nueve motivos aprobados persistidos literalmente; cada guarda ausente deniega, desconocido explícito no causa inferida; pérdida desde pausa conserva historia; rechazo de alternativa conserva Nueva | PASS |
| R11 | Orígenes activos y guardas evaluados; pausa persistida conserva Nueva como anterior; cada ausencia deniega; pausa repetida deniega | PASS |
| R12 | Cuatro combinaciones pérdida/pausa → contacto/necesidad actuales; retirada de cada guarda y soporte material deniega; preparación permanece pendiente. Historia/motivos/referencias/vigencia de tarifa H1 caducada idénticos | PASS local |
| R13 | Negociación → contacto → necesidad con cambio/evaluación humana/soporte; cada guarda retirada deniega; antes/después e historia íntegros | PASS |
| R14 | Siete sustitutos de Ganada intentados mediante SQL firmado; todos denegados, igual que DML directo; aceptación histórica no habilita Ganada | PASS |
| R15 | Cuatro intentos explícitos SM-FORB-30: pérdida sin motivo, eraseLoss, renewTariff, renewAvailability; todos denegados y snapshots idénticos | PASS |
| R16 | Admin válido, API sin contexto/GUC falso/MAC manipulado/alcance falsificado/actor inhabilitado/anon/authenticated/runtime directo; denegaciones reales. FORCE RLS y ACL/inmutabilidad comprobadas | PASS |
| R17 | Historia y estados consultados desde otra conexión; ninguna tabla/registro Acceptance, Booking, pagos, Refund o confirmación creada; ningún código RES/PR/INC ni contexto Booking por arrastre | PASS |
| R18 | Trigger de fallo durante historia revierte Opportunity/contexto/OP/contador/operación; revisión concurrente admite una sola. Dos sesiones Admin compiten sin hijos, conversión/replay y revisiones en ambos órdenes; actor no provisionado pierde ambos órdenes. Singleton H0 conservado | PASS |
| R19 | Cadena vacía nueva y upgrade H1 inmediato; snapshots H1 previos exactamente iguales tras migración, históricos conservados tras actuaciones; identidades, OP previo, B07/Tasks, catálogo/tarifa y permisos conservados | PASS |
| R20 | Vocabulario exacto, mínimos/unknown y decisiones C02 con IDs normativos/bloqueos; Ganada denegada desde cada estado | PASS |

R19 complementario: `POSTGRES_H0_BIN=… node --experimental-strip-types tests/support/h2-migration-permissions.mjs`, cluster propio `crm_h2_permissions`. Expected: relaciones/columnas/ACL/propietarios/RLS/políticas/definiciones H0/H1, privilegios de schemas, roles y membresías idénticos antes/después. Observed idéntico: **42 relaciones, 73 políticas, 56 funciones**, PASS; transcript `tests/fixtures/h2-002/migration-permissions.txt`. No se usan claves ni datos sensibles en los snapshots publicados; funciones comparadas por digest. El script es evidencia suplementaria R19, separada del conteo del runner.

F01 histórico ejecutable: `POSTGRES_H0_BIN=… node --test --experimental-strip-types tests/integration/postgres-h2-002-f01.test.ts`, **1/1 PASS de reproducción**, transcript `tests/fixtures/h2-002/f01-reproduced.txt`. Matriz actual positiva completa PASS acredita cierre F01; reproducir su rechazo histórico no se suma a las 20 filas normativas actuales.

## Límites y pendientes conservados

**SM-OP-07 no implementada ni acreditada.** No Acceptance ficticia/positiva, Human Approval como sustituto, Proposal/Version/modalidades/precios de propuestas, Booking, pago/conciliación/Refund, disponibilidad real ni confirmación/ejecución de proveedor. SM-OP-04/05 y destino preparación OP-10 preparados solo como decisión/guarda comercial; sus dependencias positivas esperan H2-003/005 y las verificaciones asignadas. Integración con Acceptance espera H2-008; E2E-01 total espera H6-001. No se declara satisfecha globalmente una fila compartida ni el hito H2.

H2-003 y posteriores, H3–H6 **NOT STARTED**. PLAN-AUTH-001–006 pendientes globales, PLAN-PENDING-003 parcialmente abierto, DM-PENDING-005, BR-PENDING-022 y demás pendientes vigentes. Datos personales/comerciales, catálogo/tarifas/costes/capacidades, prioridades/plazos reales no acreditados. Hosted H2 no acreditado; Production no autorizada. Sin conectores, envíos, pagos ni proveedores reales. El ensayo de tarifas usa configuración H1 sintética; Evidence de disponibilidad histórica no equivale a Availability H4 real. La Task H1 fixture prueba conservación, nunca un hecho comercial.

Regresión acumulada y coordinación final: pendientes de resultado, no sustituidas por este PASS focal/formal.

## F02 — integridad tipada del método de contacto al invocar SQL

Expected previo: contacto válido y fuente textual conforme BR-LEAD-002/DM-INV-005/SM-OP-01; ningún acceso fuera de UI puede saltarse el contrato validado de contacto. Nuevo caso adversarial R01 retira la validez material sustituyendo dirección/canal/fuente por un valor JSON numérico, sin cambiar los otros dos mínimos.

Observed contra producto `a5bbb06e323e897d853a5ea9527bc3a931a814fc`: SQL firmado aceptó `contact.address: 123` con `valid: true` y creó Opportunity. Dominio/adaptador lo rechazaban; la guarda SQL convertía número a texto al comprobar solo no vacío. Matriz reforzada **19/20 PASS, 1 FAIL**, 3897.309458 ms, R01 `Missing expected rejection`. F02 material por inconsistencia de integridad del contrato en acceso SQL independiente. Reproducer/verifier y transcript conservados en `tests/fixtures/h2-002/f02-original-verifier.ts.txt` / `f02-first-run.txt`; SQL original inmutable recuperable con `git show a5bbb06:…`.

La regresión anterior de a5bbb06 había pasado 355/355 PostgreSQL (397975.205125 ms), 75/75 unitarias, instalación congelada/typecheck/lint/build/audit/diff check. Esa regresión no se hereda para cerrar F02 ni sustituye el caso adicional.

Corrección mínima: comprobar tipo JSON string de channel/address/sourceRef de contacto y procedencia/motivo del comando, además de presencia/validez existentes. No se añade formato de teléfono/email ni vocabulario de canales no aprobado. Cambio exclusivamente en migración H2 todavía no publicada; H0/H1 intactas. Estado F02 OPEN hasta nueva matriz completa PASS y regresión del nuevo estado.


F02: corrección implementada también en validación del adaptador para devolver rechazo explícito ante procedencia/motivo numéricos. Reejecución completa R01–R20 tras corrección PASS, incluyendo los tres campos de contacto numéricos y procedencia/motivo vacíos o numéricos, con snapshots idénticos. El reproducer `tests/integration/postgres-h2-002-f02.test.ts` carga SQL histórico a5bbb06 en cluster propio y reproduce exactamente el alta incorrecta; **1/1 PASS de reproducción**, 1250.427542 ms, `tests/fixtures/h2-002/f02-reproduced.txt`. Expected actual positivo/negativo permanece en R01 del verifier actual. Matriz exacta del commit de corrección y regresión nueva pendientes; F02 todavía no se cierra por la regresión anterior.
