# H5-018 — segunda auditoría independiente de H5-017-C

**Resultado observado: FAIL. No recomendado para aceptación. STOP.** Fecha: 2026-10-16. Alcance exclusivamente local/aislado, datos sintéticos. Un defecto material P2 abierto: pérdida de localización por petición tras revisión autorizada de un trabajo. Producto, pruebas y sellos anteriores sin modificaciones del auditor. H5-017/H5-018 continúan IN PROGRESS; aceptación/publicación pendientes.

| Etapa | Resultado propio |
|---|---|
| Primera auditoría H5-018 | FAIL histórico:29 PASS/3 FAIL de32 casos; originales conservados. |
| Correctivo H5-017-C | PASS interno declarado; PostgreSQL2834/2834, unitarias208/208 y gates verificados como evidencia histórica exacta. |
| Segunda auditoría actual | FAIL: reproductores originales corregidos, pero una nueva secuencia temporal reproduce pérdida de correlación autorizada. No convertir el PASS histórico C en aceptación. |

## Identidad auditada y preflight

Se ejecutó fetch y se verificó HEAD=main=origin/main=`9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia0/0, índice vacío y ausencia de commits nuevos. Antes de cualquier escritura del auditor, se contrastaron rutas, SHA256, bytes, tipo y modo de37165 entradas y los2 metadatos excluidos por autorreferencia:37167 archivos del candidato.

Inventario completo, contenido descomprimido SHA256:

`b44d4adadcb907340094b617ad8445c162daef4df21ae2d8b05c300b543e2602`

Delta C frente al estado anterior al correctivo: **4 modificados,140 nuevos,0 eliminados**. Acumulado frente al commit base: **4 modificados,389 nuevos,0 eliminados**. Los archivos nuevos de esta auditoría se inventarían aparte; no se atribuyen al candidato C.

Los4 anteriores modificados son `docs/NEXT-STEPS.md`, `docs/PROJECT-STATUS.md`, `specs/001-core-crm/tasks.md` y `src/server/composition.ts`. La identidad original A (36952 archivos), las75 evidencias de la primera auditoría y el preflight C (37027 archivos) se contrastaron sin reescribir sus manifiestos. Los4 bytes históricos distintos del candidato A son recuperables: documentos en el overlay previo y composition.ts en Git. El resto permanece idéntico en el árbol actual.

Sellos contrastados: inventario gzip `94f59299205c11f04b284b1d245e2de13487c0cb19e3f8eabdca37a575ea836e`, delta `792de851f927f8914cfbb3d2f08a48d459e17fdf7aec2592bed8e13fd3b36931`, overlay C `0c71ce3a61ce8d37e2926809c581d3fe3353502f9289d19fa8f77d9be3c14070`. El sello no se aceptó únicamente por existir.

## Oráculo e independencia

Consultados directamente README, Constitución, decisiones/estado y Tasks H5-017/018, §2.2/§6/§7; SPEC HIST-001/ERR-001, AC070/072/081 y NFR009/010/014; Plan §§4/7.1/8/11.2, B01/B07/B08/B10 y C01/C04; BR-HIST-001/002/004, DM-INV-047 y SM-FORB-27. La [matriz actual](matrix-TSK-H5-018-second.md) identifica resultados y límites. Las13 asignaciones literales de la primera auditoría se revalidaron contra Tasks actual; su esperado previo y su independencia por fuentes siguen vigentes, con actualización explícita del alcance64→65 y455+1 inputs.

El [esperado inicial de esta segunda auditoría](expected-TSK-H5-018-second.md) se congeló antes de sus pruebas. Una [precisión temporal separada](expected-TSK-H5-018-second-temporal-clarification.md), anterior a R01/R02, corrige una aserción demasiado restrictiva sin alterar ningún esperado congelado ni ocultar FAIL. Se distingue consulta histórica autorizada de pertenencia actual y se exige mantener localizable la petición legítima. Independencia metodológica por fuentes/esperado/contrapruebas; este mismo chat conserva historial del implementador, sin pretensión de autor humano o modelo distinto.

## F01 — aislamiento de contexto

**Reproductor original: PASS en C.** Contact/X no obtiene el registro de Booking/X cuya lectura B07 con ese contexto se deniega. C02/C03 repetidos añaden B07/B08/Task/Alert/B09, referencias indirectas, tipos distintos, contexto ajeno y servicio hijo legítimo; los9 negativos de seguridad y las denegaciones de A15 pasan. Migración65 usa pares tipo+UUID en el catálogo de contextos y selección actual. No se observó filtración de cuerpos, secretos, URLs temporales ni economía interna en estas pruebas.

Las primeras pruebas temporales S02/T03 fallaron al prohibir toda referencia a versiones de un contexto anterior. O01 contrastó el C01 propietario B08 y demostró que autoriza ese historial, con evidencia, aprobación y responsable previos, tras la revisión legal. Esos FAIL se conservan y se declaran excesos del instrumento: la denegación del lector B07 del original en otro contexto no basta para declarar ilícita la historia autorizada de B08. No se abre un defecto de confidencialidad a partir de esa inferencia.

## F02 — integridad y cambios posteriores

**Reproductor original: PASS en C; familia temporal: FAIL.** Se rechazan al registrar operaciones canónicas ajenas; se filtran al consultar asociaciones antiguas incompatibles. Referencias inexistentes de ejecución/evento y originales no evento se rechazan. Intentos desconocidos quedan explícitos, la confirmación canónica propia posterior resuelve su estado y una confirmación realmente ajena posterior oculta la asociación sin reescribir su fila. C06 reproduce también commit canónico posterior a la instantánea de observación mediante dos sesiones reales.

La nueva R01 parte de una operación canónica legítima en A y una observación inicialmente localizable. Tras una revisión autorizada del trabajo hacia B, con nueva versión y aprobación, la petición desaparece de las consultas de A y B. La observación sigue intacta; la operación original continúa disponible por operationId y en la historia autorizada B08. No es una operación que fuese ajena al registrar. **H5-018-2-F01, P2 OPEN**, reproducido dos veces, incumple AC-081 y la trazabilidad histórica. [Causa, IDs observados, reproducción e impacto](defects-TSK-H5-018-second.md).

La causa combina selección de ejecuciones por definición vigente, pertenencia de operaciones derivada de esos IDs actuales y supresión de la observación histórica por ausencia en la proyección actual. En el contexto nuevo tampoco se incluye la observación, que conserva correctamente el contexto original. R02 confirma que una referencia histórica de intento desconocido se conserva sin afirmar ni exponer hechos actuales del contexto B. Los primeros FAIL S01/T02, que prohibían cualquier referencia histórica, quedan diferenciados del defecto material de correlación R01.

## F03 — incertidumbre y composición real

**PASS observado en los recorridos locales probados.** La composición pública real conserva E4/pending cuando el contrato lanza después de comenzar, incluido un efecto durable real en PostgreSQL y una sola invocación. El fallo conocido de resolución anterior al contrato y el rechazo técnico explícito conservan E5/unchanged; rechazo y éxito explícitos no se convierten indiscriminadamente en E4. Causas coexistentes, trabajo incompleto y recorder/sink del envoltorio se verifican en los casos originales. Replay previo/conflicto/incierto y autorización ausente no vuelven a ejecutar; no se acredita pago, Acceptance ni entrega por éxito técnico.

La frontera técnica directa histórica permanece intacta; composeServer es el consumidor de negocio que intercepta la excepción antes de esa frontera. La modificación exacta se revisó junto con consumidores existentes y las guardas de preservación. No se prueban conectores reales ni se promete exactly-once externo.

## Migraciones, permisos y conservación

V-MIG independiente M01 **1/1 PASS**, además de los2 C12 repetidos dentro de48: instalación desde base aislada, actualización64→65 con datos y observaciones previas válidas/ajenas, aborto transaccional, rollback y reintento. M01 contrasta175 tablas,302 funciones anteriores,332 políticas y1037 restricciones; quedan intactas filas/ACL/propietarios/RLS/restricciones/políticas y atributos de funciones anteriores. Se sustituyen exactamente2 cuerpos, se añaden3 helpers (305 funciones), sin tabla nueva. La observación legacy incompatible se conserva físicamente y se filtra. Se conserva denegación efectiva de runtime/TTE/anon/authenticated, incluidos roles creados después; RLS/FORCE y revocación de CREATE temporal comprobadas. Advisors loopback repetido devuelve0 hallazgos. Ninguna nueva política normativa ni intervención Hosted.

Los64 SQL anteriores a65 permanecen idénticos; las63 migraciones publicadas también respecto a Git. Los456 inputs H5-016 se verifican como **455 idénticos y1 transición autorizada**, nunca456 identidades:

- composition.ts anterior: `fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879`.
- composition.ts C: `31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`.

El cambio se limita al tratamiento de excepción tras inicio del contrato, manteniendo E4 antes de la frontera técnica. Las copias sucesoras de pruebas originales solo sustituyen el harness; las aserciones originales se compararon byte a byte. Las10 sucesoras de preservación y su guardia admiten exclusivamente esta transición literal, verifican el hash histórico Git y rechazan terceras versiones; no se reescriben manifiestos históricos. Los demás contrastes permanecen iguales. Expected y FAIL originales intactos: H5-017 completo original2762 PASS/25 FAIL; primera H5-01829 PASS/3 FAIL.

## Ejecuciones y evidencia reutilizada

| Procedencia | Resultado | Uso y no solapamiento |
|---|---|---|
| Nueva repetición de25 originales H5-018 +12 C +9 seguridad +2 migración65 |48/48 PASS, captura02 | Incluye reproducciones F01/F02/F03 originales; no se suma al completo histórico. |
| Nuevos casos utilizables T01/T04/M01/O01/R01/R02 |5 PASS/1 FAIL de6 | T01/T04 en03; M01 en04; O01 en08; R01/R02 en10. R01 material abierto. |
| Repetición R01/R02 |1 PASS/1 FAIL de2, captura11 | Segunda reproducción, no2 casos nuevos. |
| Iniciales S01/S02/T02/T03 |4 FAIL conservados | Aserciones históricas excesivas explicadas y excluidas de defectos materiales; no se borran ni se hacen pasar. |
| Arranque09 |2 hook failures, sin escenarios | Socket Unix demasiado largo; etiqueta acortada en instrumento, original y log conservados. No fallo de producto. |
| Health independiente actual |1/1 PASS,07 | Separado de PostgreSQL funcional y unidades. |
| Typecheck/lint actuales finales |PASS,12/13 | Incluyen todos los instrumentos actuales. |
| PostgreSQL completo C reutilizado |2834/2834 PASS |170 archivos únicos,15 sustituciones verificadas,464 inputs idénticos; no incluye nuevas contrapruebas temporales. |
| Unitarias C reutilizadas |208/208 PASS |459 inputs exactos;201 anteriores+6 composición+1 guarda, sin sumar con funcionales. |
| Dependencias sobre65 reutilizadas |104/104 PASS |Entrada exacta, contexto65; solapadas con completo, no se suman. |
| Instalación congelada/build/auditoría dependencias reutilizados |PASS; auditoría0 vulnerabilidades |465/459/459 inputs exactos respectivamente. No se repite trabajo sin cambios en esas entradas. |

Todas las capturas útiles concluyen sin cancelados/skipped. Logs completos comprimidos, entradas, código de salida y cambios durante cada ejecución constan en `tests/fixtures/h5-018-second/`. Reutilización verificada independientemente en historical-reuse.json; los PASS amplios no cubren ni neutralizan R01. La corrección del instrumento de socket es la única diferencia entre una fuente capturada y la actual: bytes previos recuperables en09-instrument-before-socket-fix.ts.gz. No se modifica producto durante la auditoría.

## Entrega, límites y recomendación

Entregables: este informe, [matriz](matrix-TSK-H5-018-second.md), [hallazgo](defects-TSK-H5-018-second.md), dos documentos de esperado conservados, cinco suites nuevas y verificadores/capturas de segunda auditoría. `identity.json`, `final-preservation.json`, `audit-inventory.json` y `audit-seal.json` separan el candidato intacto de los archivos nuevos del auditor.

**Recomendación: no aceptar ni publicar H5-017-C con H5-018-2-F01 abierto.** La corrección necesaria debe preservar relaciones históricas autorizadas y permitir localizar la petición después de revisiones, sin aceptar operaciones originalmente ajenas, filtrar hechos actuales de otro contexto ni modificar observaciones originales. No se implementa aquí.

Limitaciones: evaluación local PostgreSQL17.11 con Auth/Storage sintéticos del harness; independencia metodológica dentro del mismo chat; la regresión completa y algunos gates se reutilizan con hashes exactos, no se presentan como ejecución nueva; los FAIL instrumentales y su precisión están documentados. No servicios de negocio reales, datos reales, pagos, envíos ni conectores. DM-PENDING-005 sigue abierto; no retención/anonimización/eliminación ni parámetros definitivos nuevos. No commits/push/deploy. No H5-019/H6 ni acreditación de H6-015/H6-017. Documentos de coordinación y tareas del candidato permanecen intactos, sin COMPLETED.

**STOP. Esperar autorización expresa del director.**
