# Matriz independiente TSK-H4-023

**Cierre definitivo:** **TSK-H4-022/023 COMPLETED local/aislado — 2026-10-07.** Base exacta `9355da0cd23059128b724f212e1417a08ac2e95d`; expected previo `408a7f7caa39bdd18811104c9f03f40411185e55` intacto; producto `0363d9a562089f1c5ec9b6b9e40b56676757f42e`; verificador/SHA exacto probado y publicado `f99de8bad495c86021e91730bb69af81f69e44ec`. Matriz28filas; PostgreSQL2240/2240 (2105heredados+135nuevos incluidos una vez),138/138unitarias yhealth1/1 separado. Frozen/type/lint/imports/boundaries/build/audit/diff/V-MIG/advisors exclusivamente loopback PASS. Migración52 forward;51anteriores/89archivos protegidos intactos. Seis cuerpos yuna vista deliberadamente adaptados con OID/firmas/owners/ACL/config conservados, resto catálogo previo preservado.32intercalaciones ambosórdenes con2sesiones reales F2 compatibles, más Booking independiente;9fallos escritura/COMMIT/finalcheck yrecuperación durable manual/TTE PASS. F01–F23 técnicos yF24–F30 observaciones materiales estáticas CLOSED, originales ycampos ausentes declarados; cero material abierto/FAIL/skipped/cancelled definitivo. H0 técnico/local/aislado yH1–H3 local/aislado COMPLETED conservados; H4-001–023 COMPLETED local/aislado; H4 IN PROGRESS; H4-024 yH5–H6 NOT STARTED. AC-058 aquí solo finalización/pendientes, H5-014 integral futuro; E2E-01 solo tramo local, H6-001 integral futuro. Correctivo H4-020/021-F23 CLOSED conservado. Hosted H2/H3 no acreditados; Production NO autorizada; DM-PENDING-005 ypendientes globales abiertos. STOP tras publicar H4-023; continuidad exclusivamente al hilo de dirección H4.

---

Expected408a7f7 congelado antes de producto; producto0363d9a.135 casos Node nuevos (subtests incluidos), sin sumar focales a regresión. Ejecución definitiva PASS en SHA `f99de8bad495c86021e91730bb69af81f69e44ec`:2240PG/138unit/health1 separado; gates completos PASS. Oráculo: resultados literales derivados de SM/SPEC, no helpers de implementación. Lecturas de tokens/versiones permiten precondiciones actuales, no definen expected.

|Fila normativa (base)|Pruebas y resultado acreditable|
|---|---|
|SPEC-FR-BOOK-005|A–F/I/J/K; fases vigentes y finalización efectiva|
|SPEC-FR-SVC-009|A/B/C/H; normal, sobrevenida e interno sin economía ficticia|
|SPEC-FR-SVC-011|D/E/F/G; alcance prestado/cancelado/restante|
|SPEC-FR-CHG-005|E/F/G/K/M; Modification ordinaria, guardas y partes|
|SPEC-FR-HIST-001|K/L/HIST; replay, rectificación y B07 antes/después|
|AC-031|E/F/G/M; solo alcance aprobado/acreditado y proveedor|
|AC-058|J; Finalizada conserva factura/Refund/Deposit pendientes; H5-014 futuro|
|AC-063|C/H/I/L/HA; realidad verificada, revisión humana y sin confirmación retrospectiva|
|AC-091|B/M; fecha civil pasada, dinero, preparación y evidencia separadas|
|SPEC-NFR-009|L/HIST/MIG; originales, versiones y bytes privados|
|SM-BK-06|A/M; inicio normal y cada guarda retirada|
|SM-BK-07|C/I/M; inicio excepcional humano e Incident pertinente|
|SM-BK-08|D/F/G/J/M/L; >=una parte prestada, todas resueltas y base finalización|
|SM-BK-09|F/G/K/L/M + upgrade F23; cancelación solo alcance y realidad preservada|
|SM-BK-10|I; En curso/Finalizada, dos impactos y gravedad independiente|
|SM-BK-11|I/M; una resolución conserva otra, todas no restauran cobertura|
|SM-BS-07|B/D/F/G/M; parcial no todo Ejecutado, efectivo resuelto sí|
|SM-BS-08|C/H/I/M; Ejecución completa excepcional visible en lector ordinario|
|SM-BS-09|E/F/G/M; cancelación exacta/proveedor/interno, parte futura no borra prestado|
|SM-BS-11|I/M; servicio con condición y resolución localizada|
|SM-FORB-07|B/H/M; capacidad/confirmación/fecha no prestación|
|SM-FORB-13|E/F/G/M; solicitud/aprobación no aplicación del proveedor|
|P08|A/B/C/D/H/J/K; fase comercial/cobertura/realidad/economía independientes|
|PLAN-B04|A–M/MIG; Booking, servicios/noches/contribuciones y versiones actuales|
|PLAN-T04|ATOMIC/RACES; unidad SQL exclusiva y aplicación independiente|
|PT-03|A–M + RACES/MIG; tramo operativo local|
|E2E-01|A–M/H/J; solo recorrido local disponible, H6-001 integral futuro|
|D012|D/E/F/G/H/J; operación por servicio y cierres independientes|

## Ensayos y guardas

`postgres-h4-023.test.ts`: A–M, casos cuantitativos rafting10 confirmado/grupo14 estimado; tres servicios/noches12/10/cuatro nominales; interno con capacidad/confirmación/preparación/ejecución separadas; pendientes económicos; Incident En curso/Finalizada; original cancelación/rectificación/B07; terminales sin reactivación. M retira individualmente fuente/responsable/momento/original/certeza/material/versión/hecho/alcance/evidencia/revisión/enlace, aprobación material IA, client/provider/constraints/parts/revision de cancelación y detector/momento/hecho/impacto/resultado/alcance/efectos de Incident. Positivos y negativos ejecutan APIs ordinarias y lectores existentes. Sin Task/fecha/agenda/pago como evidencia de ejecución.

`postgres-h4-023-concurrency.test.ts`:16 tipos por2órdenes =32 intercalaciones reales: identidad equivalente, misma clave material distinto, partes disjuntas/solapadas, prestación-cancelación, final-pendiente, final-cambio, inicio-pérdida confirmación, sobrevenida HA-preparación, preparación-inicio, Incident-resolución-inicio, nuevo requisito imprescindible-inicio, preparación-final, preparación-cancelación, HA-cambio, resolución de uno de dos impactos-prestación. Una prueba adicional acredita progreso BookingB mientras raízA sigue bloqueada. PID/xid/sesiones/locks/cadena observados; F2 admite ambas antes del negocio. Barrera Opportunity para rechazo previo a escritura final-cambio, preparación para demás; no actor exclusivo. Relectura/reintento disjunto conserva ambos, solape E2 no suma.

`postgres-h4-023-atomicity.test.ts`:8 inyecciones de escritura/COMMIT (fact/history/result/followup y HA) más fallo de finalizador TTE real;9 puntos. Recuperación manual y TTE tras descartar respuesta después de COMMIT real. Unidad completa, aprobación no consumida parcialmente, replay reautorizado y actor inhabilitado sin efectos. SQL privilegiado identificado solo inyección/observación/instalación.

`postgres-h4-023-migration.test.ts`:fresh52 con permisos/privacidad/actor y advisors oficial loopback; upgrade51 poblado confirmado/canceladoF23/Modification parcialmente aplicada/fondos/Refund/Deposit/documentos privados. DDLfallo22012, rollback/reintento, datosbytes/catálogo/OID/firma/owners/ACL/config/policies/triggers/roles; seis cuerpos y una vista deliberadamente adaptados, resto idéntico. Protected-base51/históricos/fuentes/health/dependencias intactos.

V-DOM/V-DAT/V-SM/V-NEG: A–M. V-EVI: oráculo/matriz28, capturas íntegras/hash/SHA exacto y límites. V-MIG: archivo migration. V-GATE/V-DEP/V-BUILD: frozen/type/lint/imports/boundaries/build/audit; PostgreSQL completo y138unitarias; health1 separado. La regresión conserva los límites de instalación históricos de los harness anteriores, y los135 casos nuevos prueban el producto52; no se afirma que cada prueba histórica instale52. No H5/H6 integral ni hosted/Production.
