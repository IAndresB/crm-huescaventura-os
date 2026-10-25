# Evidencia TSK-H6-016 — local/aislado

Estado técnico: PASS del ejecutor y dictamen técnico independiente PASS (138 repeticiones y 8 contrapruebas nuevas), sin hallazgos materiales abiertos. La custodia y el acto de aceptación se reciben como capa posterior; este expediente técnico todavía no formaliza COMPLETED. H6 global continúa IN PROGRESS.

Base efectivamente utilizada: `9c15e6d143822f7fcc84f29744194554630f4ac4`, árbol `fe7cabb05e44462121c70ad52405765e2c94fcd2`, remoto IAndresB/crm-huescaventura-os. Fetch y lectura remota previos corroboraron la identidad. Worktree nuevo detached `h6-016-local`; el checkout principal no se ha modificado ni limpiado. El candidato H6-007 se usa exclusivamente como dependencia local sellada, no como archivos implícitos de main.

## Alcance y dependencias

La ficha aprobada exige intercalaciones y fallos integrados de T01–T11. Sus 25 asignaciones directas y las once filas literales del Plan §7.2 están en [expected](../../tests/fixtures/h6-016/expected-v1.json), [matriz](matrix-TSK-H6-016.md) y [trazabilidad](../../tests/fixtures/h6-016/traceability-v1.json). Se contrastaron directamente Tasks, SPEC, Architecture, Plan, Constitución, decisiones y guardas transversales; no se cambió su contenido para obtener PASS.

H5-019, H6-013, H6-001, H6-004 y H6-006 cuentan con aceptación local en la base publicada. H5-019 conserva la salida formal y sus tres comprobaciones integradas; no se atribuye acreditación Hosted. H6-007 está COMPLETED local/aislado, no publicada: manifiesto de 138 archivos SHA `4aeb3d83e685bc1282ab1eb536c9665d2ab3e1243459214ace1ed2ed839c7e91`; manifiesto exterior de 455 archivos SHA `56dbe40105e6bc2b4f3d90dc0389ee6b50b1df696dd4a3f56694fd226502b493`. Ambos inventarios se verificaron íntegramente antes de derivar instrumentos. Su identidad permanece separada de H6-016 y del target de prepublicación H7.

## Implementación y recursos

No se ha modificado código de producto, permisos, autenticación, contratos, configuración de dependencias ni migraciones. Se añaden exclusivamente pruebas, fixtures derivados explícitos, orquestación de ensayo, evidencias y documentación propia. Los derivados conservan hashes de sus ancestros y transformaciones declaradas; las aserciones históricas que se reutilizan permanecen intactas donde se afirma.

Los comandos de negocio se ejecutan por adaptadores reales de aplicación sobre PostgreSQL 17.11 nuevo, con la cadena completa de 68 migraciones. Los gates, consultas administrativas y triggers de fallo son instrumentos exclusivos de esas bases efímeras; no simulan persistencia ni son migraciones de producto. Las carreras observan dos sesiones autorizadas distintas, backends, locks y bloqueadores; una raíz independiente progresa en la batería principal. Cada agente usa sus recursos, puertos y TMPDIR exclusivos. Storage se levanta como doble loopback con la versión de software fijada por el bootstrap publicado; no se activan conectores ni se heredan credenciales de otros entornos.

## Resultados efectivamente ejecutados

| Batería del integrador | Resultado | Identidad |
|---|---:|---|
| Composición focal y regresión dirigida, siete ejecutables | 165/165 PASS; 0 FAIL/skip/cancel | stdout `25ff111de23684d09509a6ea96d6d65f373f7befc08a02099796e41f7f61923b` |
| Suplemento Provider Payment, composición final exacta | 9/9 PASS; 0 FAIL/skip/cancel | stdout `939bc4a8de6e8fae4f0f864f42139c1124536103167782015671a995650fc49c` |
| Unitarias de producto | 212/212 PASS | final-02-quality |
| Typecheck, lint de límites y build | PASS | final-02-quality |

Los 165 comprenden 90 casos de T01–T07/T10/T11, 20 cruces X01–X08, 19 de T08/T09, 32 focales H7, una reconstrucción histórica H7 y tres integradas H5-019. Los nueve de proveedor se ejecutan aparte, después de recibir su fuente sellada; no existe una única ejecución de 174. Son 138 casos focales propios H6-016 y 36 repeticiones dirigidas de antecedentes. La batería de 90 y la de 19 también cuentan con repetición independiente; el dictamen incorporará su alcance completo.

T01/T02 contrastan fijar sustitución frente a verificación explícita en ambos órdenes, preservando versión previa. T03 prueba ausencia inicial de hijos y unicidad de Booking por Opportunity; la vía directa compone hechos reales de T01/T02/T03 y revierte todos en un fallo diferido, recuperando una única Booking al reintentar. Una nueva identidad de operación puede recuperar el Booking canónico existente con `existing:true` y `replayed:false` conforme al contrato; no se obliga artificialmente a otra semántica.

T04/T06 acreditan operación parcial autorizada y conservación de servicios no afectados. La cancelación sin base atribuible conserva economía pendiente y derecho nulo; la atribución D019/D020 posterior queda en una revisión nueva. No aparece Refund ni dinero por inferencia. La aplicación fundada a obligaciones revierte junto con determinación/historia/resultado cuando falla la finalización; el reintento exacto se aplica una vez.

T05 enfrenta Allocation80 con reserva incierta Refund80 sobre recepción100 y sin asignaciones hijas previas. La obligación contractual es200, inicial100, para que la Allocation80 sea válida antes de competir; autorización Refund100 y recepción100 se distinguen de ese importe contractual. Ambos órdenes conservan como máximo80 comprometidos y ninguna salida real inferida.

T07 diferencia derecho, aprobación prospectiva e importe ejecutado. El mismo hecho de salida de fianza recibido por Deposit y por Refund conserva un solo movimiento canónico. El suplemento Provider Payment añade referencias comunes, duplicados y conflictos en ambos órdenes, guardas, registro anómalo acreditado con Incident sin fabricar aprobación retroactiva y rollback tardío observado. Todos son hechos sintéticos registrados, no pagos/devoluciones externos.

T08/T09 prueban claims exclusivos y generaciones, permisos actuales en replay, vencimiento natural de leases, reserva conservada ante resultado incierto, rechazo del intento antiguo, dedupe de eventos y separación de recepción/aplicación/efecto. D039 se verifica en `SET CONSTRAINTS ALL IMMEDIATE → finalizadores → COMMIT`, bajo control del TTE. La evidencia debe ser válida en el final check posterior a esperas; no se promete que el commit durable termine antes del instante expiry. Hay supresión del ACK COMMIT auténtico de PostgreSQL y recuperación durable por identidad. Los casos L ordinarios se describen como replay después de éxito conocido; los Lwire son la pérdida real de acuse y no se confunden.

T10 hace competir cierre con factura, corrección de factura, Refund, Incident y pago, en ambos órdenes. Los casos internos parten de cierre válido de las tres dimensiones con ejecución excepcional revisada ya aprobada; las evidencias económicas retiran la condición actual y preservan historia y dimensiones no afectadas. El caso externo de factura parte de una Booking pendiente: acredita su bloqueo y conflicto material, no un cierre conjunto externo ficticio. T11 preserva identidades, históricos, códigos y Bookings/Opportunities independientes al resolver, archivar y restaurar de forma humana.

## Fallos, correcciones y evidencia original

Se conservan 128 posiciones FAIL de Node del integrador y cuatro canceladas en intentos anteriores: units-01 (15 PASS/6 FAIL/1 cancel), units-02 (51 PASS/12 FAIL), units-03 (0 PASS/90 FAIL de setup/1 cancel), cross-02 (19 PASS/1 FAIL) y cross-03 (20 PASS/19 FAIL de before-hook/2 cancel). Los 90 FAIL de units-03 proceden de nueve setups de familia fallidos, no de noventa defectos de dominio. Las 19 posiciones de cross-03 no ejecutaron los comandos work/events porque faltaba la variable de captura en la envoltura del integrador. Se cerraron solo esos recursos propios, conservando las incidencias.

Cada posición tiene nombre original, causa, SHA del log y sucesor PASS exacto en `fail-successors-v1.json` dentro de la cápsula del ejecutor. Las causas fueron visibilidad del observador, comparación demasiado amplia de vistas que debían cambiar, acumulación de fixtures, mayúsculas en identificador de base, obligación de fixture insuficiente para Allocation80 y variable requerida omitida. Se corrigió instrumentación, sin cambio de producto. Dos errores TypeScript y un nombre de ejecutable incorrecto se conservan por separado; no se cuentan como pruebas de negocio. El coautor T08/T09 conserva además dos FAIL instrumentales y sus sucesores; el auditor documentará sus propios intentos, sin mezclarlos con los del integrador.

No se sustituye la historia H6-001 (2.899 PASS/46 FAIL de2.945) ni H6-004 (1.006 PASS/117 FAIL de1.123), ni los fallos originales sellados de H6-007. Sus reconciliaciones no son una regresión completa limpia. Esta ejecución tampoco se presenta como batería global de todo el proyecto.

## Custodia y límites

Las cápsulas son capturas sin pérdida, con inventario interno de rutas/modos/tamaños/SHA y relectura de cada miembro. Se mantienen también logs originales fuera de Git. No incluyen bases, runtimes, claves, runtime.env, cachés ni node_modules. El manifiesto técnico y el final de aceptación se sellarán separadamente; el recibo independiente comprobará los antecedentes y los documentos compartidos.

Se preservan los 110 archivos de producto, las 68 migraciones, los candidatos H6-001/H6-004/H6-007 y la cuarentena H6-015. Su comprobación es documental por los manifiestos custodiados: no se consulta runtime, SQL, procesos ni los cuatro trabajos suspendidos de H6-015. No hay S11, datos reales, efectos de negocio, Hosted/Production, publicación ni Drive.

Tasks, PROJECT-STATUS y NEXT-STEPS canónicos permanecen intactos. Tras cumplir las condiciones se prepararán variantes y parches exactos: overlay posterior a G-b de H7 y alternativa contra la base publicada, no intercambiables. H7 prepublicación se mantiene separado y no incorpora esta ejecución H16. Ningún índice, staging, commit, push o merge está autorizado.

## Dictamen y controles independientes finales

[Dictamen original independiente](../../tests/fixtures/h6-016/independent/independent-verdict.md) y JSON del mismo agente, conservados literalmente. Matriz propia25/11,88 posiciones de cobertura —no88 pruebas adicionales— y15 obligaciones transversales. Las138 repeticiones y8 contrapruebas se acreditan por ejecuciones y títulos exactos; no por nombres de suite. Sus36 regresiones dirigidas del integrador se leyeron, no se cuentan como ejecuciones adicionales del auditor.

Las8 contrapruebas incluyen normal/directa sobre Booking inicialmente ausente, fallos y acuse real perdido, fondos comunes, noche realmente confirmada con reevaluación localizada, replay de start sin refresco tras expiry, caída real de proceso propio tras efecto simulado durable, cierre/Incidencia con otra Booking independiente y códigos no vacíos/no reutilizados sobre mismo PID físico del pool. El auditor conserva159PASS/3FAIL en162 posiciones históricas: las3 incidencias de oráculo/instrumentación y sus sucesores8/8, además de errores instrumentales separados. No queda defecto material abierto.

La revisión estática de secretos identificó cuatro URI de ejemplo de la documentación pública de Supabase con `[YOUR-PASSWORD]`, `[PROJECT-REF]` y `[POOLER-HOST]`. Las cuatro alertas iniciales se conservan y resuelven individualmente por hash literal; no son credenciales operativas. La calibración de formato distinguió `diff --no-index` exit1 por diferencias de exit3 con defecto de espacios; no hay excepciones genéricas ni normalización de evidencias.
