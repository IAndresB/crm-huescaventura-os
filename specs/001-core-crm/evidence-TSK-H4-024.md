# TSK-H4-024 — salida de operación y cambios integrados

**COMPLETED exclusivamente local/aislado — 2026-10-07. H4 COMPLETED local/aislado. H5–H6 NOT STARTED.** Cero capacidades nuevas de producto, permisos, migraciones o dependencias. STOP tras publicar exclusivamente H4-024; continuidad al hilo de dirección H4.

## Base y cadena lineal

Preflight verificado en las herramientas: remoto `git@github.com:IAndresB/crm-huescaventura-os.git`, rama main, fetch, árbol limpio, divergencia 0/0 y HEAD = main = origin/main = `cfa635f87354bea7fd090a6890995b05130ad671`. Esa es la base exacta autorizada. No se reconstruye un stream de preflight que no fue archivado originalmente.

1. `ba9b9f7f25a44b3999fa9f609e26d696a829f449`: [expected independiente](expected-TSK-H4-024.md) publicado antes del verificador; 32 casos, 246 correspondencias auténticas de dependencias y 464 archivos protegidos por SHA256.
2. `1de362374f0b4eb120a2cb73d03cc36177647757`: verificador de recorridos y carreras sobre 52 migraciones, capturador y auditor. Primera regresión completa PASS, conservada; un error sintáctico del auditor exigió nuevo SHA y nueva regresión, sin cerrar por arrastre.
3. `a6e28cb099ce1ba0f13382b69d992adde25601e6`: corrección mínima de una línea del auditor. **SHA exacto probado y publicado de la regresión definitiva.** Producto, expected y lógica de recorridos PostgreSQL intactos. No cambio de producto/verificador después de este SHA.
4. Commit de cierre sucesor: exclusivamente esta evidencia, matriz, defectos, capturas y coordinación vigente. Su SHA final se identifica mediante Git y en el informe tras push/fetch; no se atribuye a ese commit posterior la ejecución de pruebas.

## Criterio de salida y trazabilidad

Leídos la ficha H4-024, Tasks §§2.1–2.3/3/6/7; Plan §§5.2/7.2/9–10; SPEC, SM, DM, BR y DECISIONS concretas de los recorridos. B04/B05/B06/B07/B08/B10; C01–C06; T04/T05/T06/T07/T08. Dependencias H3-015 y H4-001–023, incluidos F16, F23/F24/F30, F06 y cancelación/prestación corregidas.

Tasks §6 no tiene filas exclusivas de H4-024. Se consolidan su ficha, Plan §9 y las 246 correspondencias reales de dependencias, copiadas literalmente en `tests/fixtures/h4-024/normative-dependency-rows.json`. No se inventan filas normativas. Las fuentes globales conservan sus verificaciones futuras: acabar H4 no acredita una fuente íntegra con dependencias H5/H6 pendientes.

[La matriz](matrix-TSK-H4-024.md) compara 32/32 casos PASS con fuente, contratos, alcance, expected congelado, valores comprobados, SHA, gate/línea/texto PASS auténtico y limitaciones. `final/case-results.json.gz` contiene el índice recuperable. Observado recoge aserciones literales ejecutadas; cuando no existe snapshot completo emitido por el harness no se fabrica. El inventario de las 23 evidencias originales conserva hashes y enlaces; los commits históricos se consultan en las fuentes originales, sin reconstruir identificadores ausentes.

## Errata documental H4-024-F06 — referencia normativa de O01

Corrección exclusivamente documental del 2026-10-07, sobre la base autorizada `228f476b3b42106325481b88c320582f88ff1aa7`. O01 del [expected congelado](expected-TSK-H4-024.md), publicado en `ba9b9f7f25a44b3999fa9f609e26d696a829f449`, cita `SPEC-FR-DOC`, identificador inexistente en la SPEC. La misma referencia se trasladó a la matriz.

Las fuentes correctas, comprobadas en la [SPEC vigente](spec.md), son `SPEC-FR-COORD-005` (Required Document y revisión suficiente), `SPEC-FR-CAT-007` (reglas versionadas de documentación y bloqueo localizado) y `AC-051` (documento imprescindible S1 recibido sin revisar, independencia de S2 y reapertura solo del requisito afectado). Se conservan `SM-DO-01–05` y `SM-FORB-20` de [State Machines](../../docs/state-machines.md). La celda de fuentes de O01 en la matriz queda corregida; esta errata documenta la referencia incorrecta del expected sin editarlo.

`H4-024-F06 CLOSED` exclusivamente documental, por cotejo de fuentes y revisión del diff, sin regresión nueva. El expected congelado y los artefactos históricos de ejecución permanecen intactos; no cambian casos, resultados, contadores, alcance ni SHA probado. Se mantienen H4 COMPLETED local/aislado, H5–H6 NOT STARTED y todos los pendientes y límites existentes. Causa, corrección y comprobación en el [registro de defectos](defects-TSK-H4-024.md).

## Resultado definitivo y contadores

|Comprobación real|Resultado en a6e28cb|
|---|---|
|`pnpm install --frozen-lockfile`|PASS|
|`pnpm typecheck`|PASS|
|`pnpm lint` — imports/boundaries del repositorio|PASS|
|`pnpm build`|PASS|
|`pnpm audit --prod`|PASS; sin vulnerabilidades conocidas|
|`pnpm test:postgres`|2321/2321; fail/skipped/cancelled = 0|
|`pnpm test`|138/138; fail/skipped/cancelled = 0|
|Health independiente `node --test tests/operations/supabase-health.test.mjs`|1/1 separado; fail/skipped/cancelled = 0|
|V-MIG/advisors oficiales, solo PostgreSQL loopback|PASS en suites acreditadas reejecutadas|
|Diff-check desde base, preservación y auditor de evidencias|PASS|

Baseline 2240 PostgreSQL + 81 nuevos = 2321. Nuevos: 63 casos conjuntos reutilizados con instalación 52 y 18 casos de rutas/preservación (17 rutas + una preservación). Las 28 intercalaciones económicas nuevas están incluidas en esos 63; no se suman otra vez. Los 32 ensayos operacionales y nueve puntos de fallo H4-023 siguen incluidos en el baseline y se reejecutan. Focales, subtests internos, regresión anterior y health no incrementan nuevamente el total. Los FAIL deliberados de reproducciones históricas quedan íntegros dentro del stream; el resumen final del runner es 2321 PASS/0 FAIL.

Versiones realmente capturadas: Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 Postgres.app, CLI Supabase 2.119.0, Next 16.3.6, TypeScript 7.0.2 y postgres 3.4.9. `source-map-js` 1.2.2 y lock congelado intactos. El runner usa Storage oficial aislado con la revisión fijada y comprobada por su código existente; no acredita Storage/Auth hosted. Variables exclusivamente de ensayo: `POSTGRES_H0_BIN` y `H4014_CAPTURE_DIR`; sin configuración de acceso real.

## Salida operativa y económica

Requisitos personales/Required Document, Incident localizado, Availability, Capacity Hold, Confirmation, revalidación/Modification, D019/D020/Cancellation Right, Refund y Deposit se consolidan desde contratos reales. Documento Recibido sin revisión conserva S1 pendiente y S2 válido; disponibilidad 12 no cubre 16 ni otro alcance. Hold, confirmación, preparación y ejecución conservan hechos distintos. Cambio reabre únicamente dependencias afectadas; cancelación parcial conserva el resto, prestación e historia.

Las rutas H4-023 sobre 52 conservan Booking/servicio/noche/contribución, rafting 10 frente a grupo 14, N1=12/N2=10 y cuatro nominales N1 sin doble cómputo. Preparación usa economía H3 real sintética; fecha prevista, Task, pago o aprobación no acreditan prestación. En curso/Finalizada/Cancelada no retroceden por preparación; replay histórico no altera fase actual. Finalizada mantiene factura, Refund y fianza pendientes. Incident tiene condición independiente: resolver una conserva otras y resolver todas no restaura confirmación perdida. Rectificaciones enlazadas conservan originales; finalización histórica y aplicabilidad actual se distinguen.

PM-04/05: derecho 50,01/retención 50,00 y tres participaciones derecho 150,03/retención 150,00; retenciones verificadas por unidades con literales y derechos/bases por PostgreSQL 52. PM-06: salida 20,00 deja 30,01; segunda 30,01 agota derecho 50,01. PM-07: fijo 900,00 sin dividir asistentes. PM-08: inversos −500,01 y +20,00 enlazados a +500,01/−20,00. Base/modalidad/política/aceptación/fuente/versiones conservadas. Fondos no redefinen derecho; base/referencia civil desconocidas dejan únicamente el efecto dependiente pendiente.

Allocation 80/Refund 80 sobre 100 nunca consumen 160. Provider Payment, Refund y garantía interna comparten protección de fondos. Custodia externa no crea CustomerPayment ni consume fondos internos. Deposit/Refund tienen restitución canónica única, sin Cancellation Right fabricado para garantía. Entrega 40 sobre exigencia 100 deja 60; entrega 100/retención 20/restitución 30 deja 50; completar restitución 80 deja cero. Incertidumbre 80/salida 20 conserva reserva restante 60, ejecutado 20 y derecho pendiente 180; resolver no ocurrido libera solo reserva restante; acreditar otros 60 conserva salida original 20 y acumula 80. F13/F24 mantienen rechazos; salida sobrevenida se registra con Incident/revisión, sin autorización retroactiva.

## Seguridad, concurrencia y recuperación

F1/F2, HA exacta y TTE/D039 reejecutados: replay reautorizado, revocación/inhabilitación, contexto/guardas, RLS/FORCE RLS, owners/ACL, helpers privados y search_path. Runtime sin CRUD directo ni privilegios de migración. Referencias ajenas no dan lectura/enumeración; originales privados y proyecciones mínimas por finalidad, sin economía reservada o personales innecesarios.

`final/current52-economic-observations.json.gz` conserva frames auténticos de 28 intercalaciones nuevas en ambos órdenes, mismo administrador/dos sesiones F2, PID/xid distintos, raíces/locks/cadena. Ambas admisiones alcanzan advisory de negocio; el primero espera payment-root y el segundo la raíz pertinente/cadena identificada por locks. No se presenta actor SHARE como protección económica. Primeras asignaciones sin hijos, disjuntos/solapados, refund/garantía/pago/T08 y Bookings independientes según suites actuales. No se crean actores operativos adicionales.

Efecto/historia/resultado/seguimiento aplicable juntos o ninguno. Fallos reales de escrituras y COMMIT, aborto/reintento y pérdida de respuesta después de COMMIT real conservados. Replay recupera resultado durable sin duplicar movimiento/reserva/ejecución; material distinto con la misma clave conserva conflicto. TTE mantiene conexión/BEGIN/secuencia/final check/COMMIT exclusivos, sin SQL/callback/handle del solicitante. No esperas humanas/proveedor/Storage dentro de transacción.

## Migraciones, preservación y archivos

Las 52 migraciones coinciden byte a byte con la base; no migración 53. Los 464 archivos protegidos —producto, migraciones, fuentes aprobadas, expected/evidencias/defectos, harness históricos, dependencias y health— coinciden con SHA256 congelado. Los demás archivos históricos se preservan además mediante diff Git y restauración de las tres únicas salidas regeneradas. No se modifican el health independiente ni su documentación.

V-MIG reutilizado: fresh52, upgrade51 poblado, fallo DDL real/rollback/reintento, datos/objetos privados/catálogos y upgrades anteriores en sus fronteras originales. Los seis cuerpos y una vista adaptados deliberadamente por la migración 52 previa mantienen atributos/OID/firmas/owners/ACL/config; no se afirma identidad de sus cuerpos adaptados. Esta tarea no adapta ningún cuerpo. No todos los harness históricos instalan 52; los recorridos de salida nuevos y H4-023 sí usan esa cadena.

El runner regeneró dos logs H2-011 y `h4-012-f16/preservation.json`. Se archivaron los bytes nuevos y se restauraron exactamente los originales del SHA probado; `final/generated-preservation.json` registra hash original/generado/restaurado. Caché CLI `.temp` generada archivada fuera de árbol fuente. Status conserva honestamente el árbol antes/después de cada comando; no se reconstruye un árbol limpio falso.

Archivos de lógica añadidos: dos suites `tests/integration/postgres-h4-024*.test.ts` y `tests/support/h4-exit-{capture,audit}.py`. Documentación: expected/matrix/evidence/defects H4-024; solo secciones vigentes de Tasks/PROJECT-STATUS/NEXT-STEPS. Fixtures: expected/filas/hashes y evidencia nueva bajo `tests/fixtures/h4-024`. Inventario exacto en `changed-files.json`. Cero cambios en `src`, `supabase`, `package.json` o `pnpm-lock.yaml`; cero archivo histórico de código/expected/evidencia modificado.

## Capturas, defectos y límites

Capturas definitivas bajo `tests/fixtures/h4-024/final`: argumentos, SHA/árbol inicial/final, tiempos Unix, stdout/stderr/status/error/signal y versiones. Streams gzip, manifest con hashes comprimidos/descomprimidos; native.tar.gz con manifest por miembro. Development completo en development.tar.gz, manifest por miembro y hash del tar comprimido/descomprimido. Compresión verificada byte a byte, sin pérdida.

[Registro Fxx](defects-TSK-H4-024.md): F01–F05 técnicos CLOSED, originales y retests preservados; cero defecto material de producto. Los dos primeros comandos no tenían status nativo/error/signal/timestamps/versiones capturados; esa ausencia está declarada y no se reconstruye. Reproducción de sintaxis F05 y primera regresión conservadas; el informe derivado con auditor corregido aún sin commit no se presenta como prueba del auditor original ni cierre definitivo. La regresión final pertenece exactamente a a6e28cb.

AC-058 integral permanece en H5-014; E2E-01 integral en H6-001. Sin Closure Assessment ni cierres conjuntos, nueva Task/avisos/calendario/jobs/conectores/supervisión, UI/diseño, costes Tararí reales, fiscalidad/mandato/factura legal/banco/PSD2/fondos reales. Hosted H2/H3 no acreditados; Hosted H4/Production no autorizados. Solo datos sintéticos y hechos externos simulados; sin audio ni políticas personales inventadas. DM-PENDING-005 y demás pendientes de Tasks §7 permanecen abiertos en su ámbito.

**H0 técnico/local/aislado y H1–H3 local/aislado COMPLETED conservados. H4-001–024 y H4 COMPLETED local/aislado. H5–H6 NOT STARTED. STOP tras publicar exclusivamente H4-024; continuidad vuelve al hilo de dirección H4.**
