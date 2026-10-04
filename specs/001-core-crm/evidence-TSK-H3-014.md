# Evidencia TSK-H3-014 — Verificación normativa independiente

**Resultado: COMPLETED local/aislado.**

Base exacta `287392bf932567a8c7e0ad6f44fcf0eed8252644` tras fetch/main/árbol limpio/HEAD==origin/main. Producto y verificación probados en `fee9d9b0a35ee2b2dbbb57592a728014fb11c218`; el SHA final publicado es el commit documental sucesor, identificado por separado en el informe Git final. Expected [R001–R093](expected-TSK-H3-013-014.md) congelado antes del producto en `14a1aa84b3af8b60438e34cd8137144e7c391ca8`,35 filas Tasks§6; byteidéntico, no adaptado al producto.

Entorno local/aislado: Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo; CLI Supabase2.118.0 `migration new`. Storage oficial H1 fuente `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, file loopback privado y credenciales efímeras. Fixtures exclusivamente sintéticos. Preflight: H0 técnico/local/aislado,H1/H2 local/aislado COMPLETED; H3 IN PROGRESS,H3-001–012 COMPLETED;013+ yH4–H6 NOT STARTED antes del bloque; H3-012-F01–F07 CLOSED,cero materiales abiertos,36 migraciones,health-check independiente intacto; hosted H2/H3 no acreditado,Production no autorizada.

93 casos normativos +4 adicionales seguridad/lectura/concurrencia/Unicode +3 reproducers explícitos +1 focal = **101 casos lógicos PASS;102 tests Node con un agrupador. PostgreSQL completo1215/1215 y unitarias117/117 PASS;0 FAIL/skipped/cancelled/todo/materiales abiertos.** Instalación congelada/typecheck/lint-boundaries-imports/build/audit producción0 vulnerabilidades conocidas/diff-check/V-MIG/preservación PASS. [Manifiesto](../../tests/fixtures/h3-014/closure-verification.json), [PostgreSQL](../../tests/fixtures/h3-014/closure-postgres.log), [unitarias](../../tests/fixtures/h3-014/closure-unit.log), [defectos originales](../../tests/fixtures/h3-014/defects.md).

## Comparación por caso

Las observaciones corresponden a aserciones literales derivadas del expected congelado. R001–R070 combinan C02 exacto aislado y C03 PostgreSQL donde corresponde; R071–R093 prueban persistencia/seguridad/unidades/migración reales. Los archivos de verificación no utilizan resultados del producto para construir el expected. [Verificador](../../tests/integration/postgres-h3-014.test.ts), [aserciones normativas C02](../../tests/support/h3-own-economics-normative.ts), [reproducers](../../tests/integration/postgres-h3-014-defects.test.ts), [focal](../../tests/integration/postgres-h3-013.test.ts).

|ID|Observado/contraste ejecutado|Resultado|
|---|---|---|
|R001|Fee100.00/coste20.00/rentabilidad80.00; fondos ajenos separados|PASS|
|R002|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R003|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R004|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R005|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R006|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R007|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R008|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R009|Rechazo localizado sin Fee/snapshot válido inventado|PASS|
|R010|100.00; base/regla/versiones conservadas|PASS|
|R011|15 × 10.00 =150.00; base/regla/versiones conservadas|PASS|
|R012|1 × 100.00 =100.00; base/regla/versiones conservadas|PASS|
|R013|base100.00 × 5% =5.00 con regla sintética aprobada; base/regla/versiones conservadas|PASS|
|R014|Rechazo; no inventar porcentaje o comisión|PASS|
|R015|Unknown permanece null/no definitiva|PASS|
|R016|Cero conocido conservado; resultado calculable|PASS|
|R017|Tres valores/fuentes separados; historia previa intacta|PASS|
|R018|Estados y fuentes separados; sin sobrescritura|PASS|
|R019|Rentabilidad real115.00; previsto/confirmado diferenciados|PASS|
|R020|Solo Fee propio explícito cuenta; gestión/Suplido no son ingreso/coste|PASS|
|R021|Rechazo; hechos externos/economía anterior intactos|PASS|
|R022|Respetar Unit Definition/Pricing Basis; no multiplicar por personas por defecto|PASS|
|R023|Helper H1 conserva calculado140.00/final150.00/actor/momento/motivo; snapshot productivo retiene cadena económica H2 sin inferir margen.|PASS|
|R024|Rechazo sin ajustar costes o Suplidos|PASS|
|R025|Gratuidad150.00;15 asistentes/14 pagadores; cantidades/deudas intactas|PASS|
|R026|Gratuidad120.00 por modalidad concreta|PASS|
|R027|15 reales/14 pagadores; servicio conserva15|PASS|
|R028|16 reales/15 pagadores; servicio conserva16|PASS|
|R029|17 reales/16 pagadores; servicio conserva17|PASS|
|R030|Candidata/pendiente; importe definitivo unknown, otras operaciones válidas continúan|PASS|
|R031|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R032|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R033|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R034|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R035|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R036|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R037|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R038|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R039|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R040|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R041|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R042|No elegible/sin descuento; asistentes/cantidades originales|PASS|
|R043|Rechazo; hechos originales intactos|PASS|
|R044|Rechazo; hechos originales intactos|PASS|
|R045|Rechazo; hechos originales intactos|PASS|
|R046|Rechazo; hechos originales intactos|PASS|
|R047|Rechazo; hechos originales intactos|PASS|
|R048|Rechazo; hechos originales intactos|PASS|
|R049|Rechazo; hechos originales intactos|PASS|
|R050|Cantidad2/comercial TOTAL15.00/coste TOTAL3.80, interno|PASS|
|R051|Comercial175.00/costeunknown/rentabilidad definitivaunknown|PASS|
|R052|Comercial325.00/costeunknown/rentabilidad definitivaunknown|PASS|
|R053|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R054|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R055|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R056|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R057|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R058|Rechazo; configuración aprobada y ausencia conservadas|PASS|
|R059|Primer componente conservado; segundo fiscalunknown sin tipo inventado ni ajuste comercial|PASS|
|R060|EUR/componentes/base/impuestos/total y tratamiento conservados, sin validación fiscal legal|PASS|
|R061|Rechazo; no fiscalidad/mandato inventados|PASS|
|R062|Rechazo; no fiscalidad/mandato inventados|PASS|
|R063|Rechazo; no fiscalidad/mandato inventados|PASS|
|R064|Rechazo; no fiscalidad/mandato inventados|PASS|
|R065|Rechazo; no fiscalidad/mandato inventados|PASS|
|R066|Lectura histórica byteidéntica tras nuevas versiones unidad/pricing/promotion; unknown intacto, replay original. Nueva fase/versiónR073 e histórico H1/H2 conservados en regresión completa.|PASS|
|R067|Lectura histórica byteidéntica tras nuevas versiones unidad/pricing/promotion; unknown intacto, replay original. Nueva fase/versiónR073 e histórico H1/H2 conservados en regresión completa.|PASS|
|R068|1000.10 exacto sin floats ni redondeo comercial|PASS|
|R069|−10.01; precisión/diferencia conservadas|PASS|
|R070|33.34/33.33/33.33; fuente/pesos/orden/residuos conservados, no derecho inventado|PASS|
|R071|Mismo resultado sin Fee/coste/promoción/snapshot duplicados|PASS|
|R072|Conflicto, original intacto|PASS|
|R073|Nueva revisión enlazada; anterior intacta|PASS|
|R074|Rechazo sin overwrite|PASS|
|R075|Resultado durable sin nuevo efecto|PASS|
|R076|Denegación/null sin enumeración|PASS|
|R077|Una aplicación vigente/replay o conflicto, no doble gratuidad|PASS|
|R078|Una revisión coherente; no híbrido|PASS|
|R079|Revisión conjunta; no overwrite silencioso|PASS|
|R080|Nuevos maestros publicados antes de materialización; referencias originales aplicadas, versión1,gratuidad150.00; no snapshot híbrido.|PASS|
|R081|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R082|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R083|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R084|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R085|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R086|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R087|Rollback del conjunto; sin snapshot/importe/historia huérfanos|PASS|
|R088|Economía accesible solo a Administrador autorizado; proyección cliente sin Fee/costes/margen|PASS|
|R089|Denegación; no enumeración porID/referencia/importe|PASS|
|R090|Owners/ACL/FORCE RLS/policies/functions/triggers/roles mínimos;36 previas intactas|PASS|
|R091|Upgrade real desde36 poblado con fondos/Allocation/Invoice/Suplido/Provider Payment500; tablas anteriores byteidénticas; snapshot nuevo válido.|PASS|
|R092|Fallo1/0 antes COMMIT revierte tablas/funciones nuevas; base anterior intacta; retry válido.|PASS|
|R093|Expected intacto;0 FAIL/skipped/cancelled/material abierto;H3 IN PROGRESS;H3-015+ yH4–6 NOT STARTED;STOP|PASS|

Cuatro ensayos adicionales: F1/F2/scope/roles/append-only,lectura concurrente antes COMMIT,misma clave concurrente,Unicode y rechazo sobre límiteF1. Tres reproducers explícitos F08/F09/F11; restantes defectos reproducidos por focal/matriz/typecheck. **12 defectos encontrados/12 CLOSED/0 abiertos**; FAIL originales conservados en fixtures, sin cambiar expected. G1–G6 yV-DOM/V-DAT/V-MIG/V-AT/V-NEG/V-EVI/PT07 aplicados; E2E05 solo economía propia autorizada.

Fee/Honorarium e Internal Cost por alcance/Booking/servicio con regla,mecanismo/base,fuente,versión,Unit Definition/Pricing Form H1 y fases previsto/confirmado/real independientes. Solo material explícito aprobado: B07 revisado vinculado a raíz y hash exacto de regla; evidencia separada de decisión/material del snapshot. Actor y contexto F1/F2 verificados. Ausencia/desconocimiento permanece null;0.00 explícito es conocido. Cada fase conserva input,cálculo H1,traza,versión,IVA incluido/excluido/desconocido y datos fiscales explícitos cuando conocidos; no tipo inferido ni validación fiscal.

Snapshot append-only por raíz/Booking/alcance con revisión,before/after,actor,momento real de registro y momento del hecho,motivo,fuente,evidencia,historia y componentes. Retiene cadena H2,modalidades,precios calculados/finales comerciales,cuantías/unidades/tarifas/versiones aplicadas y promoción. Precio manual conserva calculado/final/actor/momento/motivo mediante H1/H2; no margen inferido del total comercial. R001 Fee100.00−coste20.00=80.00; fases Fee200/220/230 y coste100/110/115 separadas; rentabilidad real115.00 cuando suficientemente conocidas. Fondos gestionados/Suplido/Invoice externa/Provider Payment jamás se incluyen automáticamente como ingreso/coste propio. AC044: Allocation300 Suplido/200 Fee separada y snapshot propio200; asignaciones intactas.

Promoción automática única H1 novia/o gratis: despedida,>=15 asistentes,pack completo,alojamiento/actividad/restaurante y2 copas. Fuente y modalidad concretas; A10×150/B5×120/novi@A →150.00 (B→120.00). Sin modalidad: pending/importe null; públicos y contextos inelegibles: sin aplicación.15/16/17 reales →14/15/16 pagadores; cantidades de servicio y deuda externa intactas. No media,elección automática ni prorrateo. Serializa Booking y evita dos gratuidades vigentes en scopes distintos; mismo material/clave o nueva clave equivalente reutiliza snapshot.

Tararí propio/interno:2 copas son un conjunto,total comercial15.00/coste estándar total3.80; nunca precio unitario por copa. El estándar se conserva como previsto, sin fabricar confirmado/real. Extra25×7.00=175.00; Extra50×6.50=325.00; costes null/rentabilidad definitiva null, sin extrapolación. Provider/Suplido/factura interna permanecen ausentes. EUR/núcleo H1 exacto,D023/D028/D029; PM02 100.01×10=1000.10,−10.005→−10.01,D02933.34/33.33/33.33. Sin floats/doble redondeo ni otro motor.

PM09/AC085: snapshots y unknown originales intactos tras versiones futuras de unidad/pricing/promotion; fases/versiones posteriores son nuevas revisiones. Lectura recupera importes materializados, no recalcula desde maestro actual. Regresión H1/H2 completa conserva además la reproducción histórica de catálogo/tarifas/costes/pack. Privacidad P11: C01 interno autenticado y mínimo por identidad/Booking/scope; proyección cliente cerrada con modalidad/precio comercial/promoción, sin Fee/costes/margen/historia interna. Payloads fiscales/mandato/HA override/IA autoaprobada rechazados; P16 no se levanta.

Una migración forward `20261004201022_h3_own_economics_fee_cost_promotion_tarari.sql`:4 tablas propias append-only,8 policies,4 triggers,3 APIs estrechas +1 helper privado. Owners f2_owner/f2_executor; RLS+FORCE RLS; executor SELECT/INSERT solo dentro de APIs; runtime sin DML/SELECT directo; PUBLIC/anon/authenticated/HA sin acceso. SECURITY DEFINER conserva patrón F1/F2 aprobado,search_path explícito,revisiones,scope cerrado y autoridad separada; no nuevos roles. C02 H1 calcula; C03 revalida fuentes inmutables y material firmado, persiste atómicamente. F1 fragmentado UTF-8 sin aumentar16KiB por campo/64KiB total; fuentes viajan una vez y C03 restaura la proyección idéntica sin recalcular economía.

V-MIG fresh37,upgrade poblado36→37 con fondos/Allocation/factura/Suplido/pago saliente500 sintéticos,rollback de migración inyectado,owners/ACL/RLS/policies/functions/triggers/roles y preservación PASS. Sesiones PostgreSQL independientes: promociones/snapshots/actualizaciones Fee-coste concurrentes,revisión obsoleta,misma clave,lectura antes deCOMMIT. Un único efecto vigente;sin overwrite/historia parcial. Inyección antes raíz,tras componentes,durante Fee/coste/promotion/snapshot y fallo diferido COMMIT revierte conjunto. Respuesta tras COMMIT descartada por consumidor: replay durable sin duplicación. No funds/Payment Allocation/Provider Payment/cobertura afectados por economía propia.

## Pendiente posterior y no acreditado

Implementado y verificado únicamente el dominio/persistencia local de H3-013/014. H0–H3-012,catálogo/versiones H1,Proposal/Booking H2,Payment Allocation,Suplido,Provider Invoice,Provider Payment y B07 conservados. Las36 migraciones anteriores y otros30 archivos protegidos son byteidénticos. Única adaptación histórica de verificador: H3-012 R095 conserva su frontera36 mediante el nombre de su última migración; expected/producto/migraciones anteriores intactos. Los dos logs H2 regenerados por la suite se restauraron byteidénticos a su versión histórica.

**Pendiente posterior / no acreditado:** H3-015+,H6-017,H6-005,costes reales de upsells Tararí,tipos fiscales no verificados,fiscalidad profesional,mandato real,facturación legal,Refund/fianza completos,hosted/Production. Todos los pendientes globales anteriores conservados; no conectores,fondos/datos reales ni nuevos efectos externos. H0 técnico/local/aislado y H1/H2 local/aislado COMPLETED. H3 IN PROGRESS; H3-013/014 COMPLETED local/aislado; H3-015+ yH4–H6 NOT STARTED. STOP obligatorio tras H3-014; continuidad exige nueva autorización humana.
