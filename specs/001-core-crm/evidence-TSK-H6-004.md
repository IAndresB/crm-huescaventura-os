# TSK-H6-004 — expediente de ejecución local/aislada

Fecha local: 2026-10-23. Base publicada: `971c55d5ce5770c71284d106d3c0deecca9514b5`. Worktree exclusivo `h6-004-local`, HEAD separado, sin adopción implícita de candidatos H6 no publicados. H6 global **IN PROGRESS**. **TSK-H6-004 COMPLETED — exclusivamente local/aislado**, según acceptance-TSK-H6-004.md y dictamen independiente definitivo PASS; recibo exterior de custodia separado.

## Norma y dependencia

Se consultaron directamente Tasks (ficha H6-004 y matriz §6), SPEC §9, Architecture §§3.1/5/6/12/13/16 y Plan §§9–10.1, además de Constitución, reglas, dominio, estados y decisiones. Las doce entradas normativas están identificadas por hash en `tests/fixtures/h6-004/preflight-v1.json` y permanecen intactas.

La asignación directa de H6-004 es **E2E-04**, con correspondencia SPEC **AC-029–043 y AC-060–063**, diecinueve AC primarios. No se trasladan las asignaciones AC-089/SPEC-NFR-001 de H6-001 a esta tarea. El alcance aprobado es petición → evaluación por parte → intervención del proveedor → acuerdo/aprobación → aplicación parcial → determinación D019/D020 → ajuste de obligaciones y Refund diferenciados → reevaluación de cierre afectado, preservando el resto y toda la historia. Bloques B01–B10, contratos C01–C06 y T04/T06/T07/T10 según su aplicabilidad; no implica desarrollar de nuevo todos esos bloques.

**H5-019 satisfecha**: cierre D01–D03 y candidato aceptado `31fd4ac89aea684f2155a4365cb5870a0c0163838cbfd543d2ad98d0db1ea619`, ancestro publicado `8a5f1408777b81b760a02646fa414a34dc17983e`. Las tres comprobaciones integradas se reejecutaron: **3/3 PASS**. H6-001 y H6-015 no son dependencias funcionales introducidas en la base.

## Implementación y escenarios

Se añaden fixture, recorrido, runner y verificadores de H6-004. Se reutilizan contratos y adaptadores de modificación, cancelación, obligaciones, cobros/fondos, Refund, evidencia B07, aprobación TTE, realidad y cierres. **Cero cambios en código de producto y cero migraciones nuevas.** Las 68 migraciones y los 106 archivos `src` de la base conservan sus bytes. Dos copias de pruebas históricas añaden exclusivamente formato JSON explícito al CLI; los originales y diffs están preservados.

El focal arranca PostgreSQL 17.11 real en recursos locales propios, aplica la cadena68 y utiliza los adaptadores ordinarios C01/C03, evidencia B07 y ejecutor TTE. El SQL privilegiado solo arranca la infraestructura sintética, lee para contraste independiente e instala temporalmente un fallo transaccional identificado. Node 24.21.0, dependencias fijadas con instalación offline. Autenticación sintética del contrato y sistemas externos dobles: no se acredita Auth Hosted ni actividad bancaria, proveedores o comunicaciones reales.

Cada escenario principal tiene una Booking de tres servicios: S1 cancelado, S2 con prestación anterior registrada y S3 vigente. S2 usa la vía existente de realidad excepcional con revisión explícita, conservando la ausencia de confirmación previa; no se fabrica aprobación retroactiva. La regresión de realidad verifica también el camino ordinario. Los expedientes auxiliares de fixtures no se presentan como partes de la misma Booking.

**A — determinación válida:** solicitud, petición acreditada al proveedor, respuesta ambigua pendiente y respuesta exacta; rechazo de aplicación prematura; aprobación separada de la aplicación; cancelación exclusivamente S1. D019 atribuye 200 y D020 mantiene la fecha civil y los tres días; por causa del proveedor, derecho 200 y retención 0. Obligación original 1.200,12 → 1.000,12, con tramo inicial 600,06 → 400,06 y saldo 600,06 intacto. El cobro bruto 400 permanece intacto. Determinación de Refund y autorización prospectiva TTE 200 no crean salida. Salida sintética acreditada 80 → pendiente 120; salida posterior 120 → pendiente 0. El criterio Refund se reevalúa expresamente; otros pendientes mantienen el cierre conjunto no actual.

**B — sin base atribuible:** misma aplicación operativa parcial, pero determinación económica `pending`, derecho `null` y ausencia de prorrateo/importe cero supuesto. Ajuste económico y Refund dependientes rechazados. Solo la determinación posterior explícita, fundada y reproducible de 200 permite continuar. La revisión pendiente anterior permanece en historia. Se repite el recorrido de autorización, 80/120 y reevaluación afectada.

En ambos escenarios se comparan las filas originales de servicios, contribuciones y noches no afectados, el snapshot aceptado y la historia de la prestación previa. Se verifican reintentos equivalentes, conflictos materiales, exceso, cruce de Booking, permisos/SQL directo, pérdida de respuesta después de COMMIT y rollback íntegro por fallo diferido. Las fronteras 7/3/2 días usan fechas civiles y expected literal independiente.

## Pruebas y trazabilidad

Focal final `focal-2026-10-22T23-37-43-098Z`: **31/31 PASS** (29 hojas y dos padres). Expected propio congelado antes de implementar, SHA `7e58e15e77152a5e0c269f106b588bc7f389f0a7b9a3e2dca6cb2448d66b8171`.

Regresión dirigida seleccionada: **837/837 PASS** distribuida en 18 archivos; junto al focal y al suplemento, **869 resultados seleccionados** en 20 archivos, contando el suplemento AC-032 1/1. Es selección de ejecuciones satisfactorias identificadas, no una ejecución completa limpia de toda la suite. Incluye modificación 24+45+26, cancelación 102, Refund 88+39, fianza 96, realidad 87, cierres 22+14+24, H5-019 3, archivo/identidad 3+4, pagos a proveedor 101, economía/promoción 1+98 y vencimientos 60. Las versiones históricas y pruebas puras dentro de ciertas suites mantienen esa limitación; solo el focal se presenta como recorrido A/B integrado sobre cadena68.

Calidad final posterior al suplemento `quality-2026-10-23T00-00-31-851Z`: **210/210 unitarias**, typecheck, lint y build PASS. No se atribuyen aquí las 212 unitarias de H6-001, que usa otro candidato.

Historia PostgreSQL completa de esta ejecución: **1.006 PASS y 117 FAIL de 1.123 registros**, sin skipped/cancelled. Los 117 FAIL se preservan y relacionan individualmente con sucesores del mismo título: 42 de construcción del focal, 73 de compatibilidad de fixture y dos de formato CLI. Setup/typecheck/matriz fallidos se custodian aparte. Registro explicativo: `tests/fixtures/h6-004/corrective-register.md`. Verificación reproducible: `python3 scripts/verify-h6-004.py`; matriz: `coverage-matrix-v3.json`, **19 AC y 210 posiciones de referencia ejecutadas**, con log, línea, SHA y manifiesto de entradas. No se borran ni reclasifican los fallos originales.

AC-038, fianza, identidad/archivo, cambio de fecha y reapertura posterior tienen regresiones propias expresamente identificadas. No se afirma que esas ramas ocurran todas en la Booking A/B ni que se hayan completado E2E-01/03/05/07. La finalización del Refund no acredita por sí sola los tres cierres: permanecen las obligaciones y criterios ajenos al alcance cancelado. AC-062 se acredita por la rama de fusión/archivo/restauración de identidades con vínculos y códigos no reutilizados; no se afirma una API de archivo Opportunity/Booking ejecutada. S02 acredita la interacción pago/derecho en el mismo Booking/servicio, sin afirmar una única entidad proveedor en todos los auxiliares del fixture; la cadena de petición/respuesta del proveedor se acredita en A/B.

El auditor detectó una atribución insuficiente en AC-032 de la matriz v1. Se conserva como antecedente y se añade el suplemento S02, con pago proveedor200 previo y derecho200 posterior en la misma Booking/servicio, 1/1 PASS. La matriz v3 corrige esa atribución e incorpora la precisión temporal posterior; v1/v2 y S01 permanecen como antecedentes. Véase `tests/fixtures/h6-004/independent-finding-AC032.md`; cierre del hallazgo según la repetición y dictamen independientes definitivos.

## Custodia y exclusiones

El verificador contrasta doce fuentes normativas, 68 migraciones, 174 archivos producto/migración y los **376 archivos protegidos de H6-001** fijados antes de escribir. El expediente independiente de prepublicación verifica documentalmente H6-015 (16 manifiestos, 4.568 entradas), sin acceder a su runtime. Los cuatro trabajos suspendidos no se reactivan; su cuarentena permanece.

Se conserva por separado la historia H6-001 de **2.899 PASS y 46 FAIL de 2.945**, con su reconciliación original. Este trabajo no la convierte en una ejecución completa limpia ni modifica sus candidatos sellados.

Sin datos/credenciales reales, conectores activos, pagos/devoluciones/facturas/comunicaciones reales, Drive, deploy, staging, commit, push, merge o cambio de main/origin/main. Hosted/Production y S11 quedan fuera. No se introduce normativa ni cambio de seguridad. Los coordinadores documentales compartidos se preparan como variantes y parches exactos, preservando las fuentes y propuestas anteriores.
