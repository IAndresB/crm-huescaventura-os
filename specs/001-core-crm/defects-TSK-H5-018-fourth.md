# H5-018 — cuarta auditoría — defectos independientes

Dictamen funcional: **FAIL** del candidato H5-017-E, migración 67 SHA-256 `45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5`. Producto intacto. Hallazgos nuevos reproducidos con contratos ordinarios y datos sintéticos. No se implementa ningún correctivo. Los FAIL de auditorías anteriores conservan su significado histórico.

## H5-018-4-F01 — P2 — La ejecución vigente incorpora versiones de contextos ajenos

**Norma:** Plan C01/§7.1/§11.2; SPEC-FR-HIST-003/006, AC-081, NFR-009/010; DM-INV-047; BR-HIST-004; P10/P12. El alcance de la consulta y la procedencia de cada referencia no se sustituyen por el UUID de una ejecución. Una relación histórica no concede por sí misma acceso a su evidencia desde otra raíz.

**Precondiciones y transición:** crear trabajo legítimo en A, registrar petición en A, revisar mediante B08 a una evidencia distinta de B y volver mediante otra revisión autorizada a A. Cada revisión tiene aprobación y versión propias. Se prueba raíz booking, hijo servicio desde booking y servicio desde opportunity. Todas las transiciones usan adaptadores de producto; no hay alteraciones SQL de permisos o historia. Como control, B07 devuelve `null` al intentar leer la evidencia B desde la raíz A. La observación de B sigue localizable por su recorrido histórico propio.

**Esperado:** A conserva su petición, versiones y hechos autorizados; la reaparición de la ejecución no incorpora la evidencia, aprobación ni operación de la versión B al alcance canónico de A. Una escritura nueva en A no puede establecer como local la procedencia de esa operación de B.

**Observado:** los tres casos Q02 de `postgres-h5-018-fourth-history.test.ts` devuelven, en A, la definición versión 2 de B con su recordId, referencias de aprobación/propuesta, actor y fecha, y nodos de operación/historia B. El cuarto caso Q02, en `postgres-h5-018-fourth-identity.test.ts`, registra una nueva observación en A con la operación B y la presenta como `operationReferenceState: canonical`. No es un supuesto de UUID falsificado: la ejecución y las revisiones son reales y legítimas; falla la procedencia por versión/contexto. No se atribuye una fuga entre usuarios o tenants que estos casos no ensayan.

**Causa:** `diagnostic_canonical_nodes` valida el contexto de la definición vigente al formar `execs`, pero después selecciona todas las definiciones de esa ejecución por definitionId, sus aprobaciones y todas sus operaciones/historias por executionId. Esas ramas no revalidan la pertenencia de cada versión al recorrido consultado. `diagnostic_nodes` prioriza esos nodos vigentes sobre su rama histórica, que sí valida el contexto/versionado. El escritor acepta la operación porque ya aparece en la proyección canónica y pertenece a la ejecución, sin contrastar su contexto original.

Localización exacta en `supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql`: líneas 16, 25–28 y 38–40 (selección de ejecución/definiciones/aprobaciones); 103–110 (operación e historia); 157–159 (precedencia de proyección vigente); 222–227 (validación del escritor por esa proyección).

**Reproductores y evidencia:** capturas 02-history (3 FAIL/1 PASS) y 04-identity (1 FAIL/4 PASS), con entrada/IDs, fuente B07 denegada, salida exacta y fila original preservada en stdout. Los cuatro FAIL comparten esta causa; no se cuentan como cuatro defectos. Repetición conjunta en 13-new-retest, sin cambios de producto ni aserciones.

**Correctivo necesario, no implementado:** definir el conjunto autorizado de cada versión/operación/historia/aprobación a partir de su fuente propietaria y contexto histórico tipado; no extender automáticamente la autorización vigente a todas las versiones. Aplicar la misma coherencia a lectura y escritura, sin destruir antecedentes ni perder las referencias históricas autorizadas. Repetir A→B→A, secuencias de padres, consulta por petición y nuevas observaciones de operaciones históricas.

## H5-018-4-F02 — P2 — Se rechaza la repetición exacta de una observación histórica autorizada

**Norma:** Plan §7.1, Tasks §2.2 V-AT, SPEC-FR-HIST-001/006, AC-081, DM-INV-047. Una repetición equivalente recupera el resultado real persistido tras reautorizarlo; no constituye un nuevo efecto ni una nueva asociación.

**Precondiciones y transición:** registrar observación O en A y comprobar su replay. Revisar legítimamente el trabajo a B. O sigue autorizada y localizable en A por la consulta histórica; su fila permanece exacta. Repetir O con todos sus campos idénticos, tanto en la sesión original como en una sesión nueva identificada del mismo actor. Se aíslan referencias operación+ejecución, solo operación, solo ejecución y ninguna referencia opcional.

**Esperado:** el replay exacto autorizado devuelve el mismo id y `replayed: true`, sin insertar ni modificar la observación. Se mantienen las denegaciones a actores/sesiones revocados, referencias incompatibles y reutilización de identidad con contenido distinto.

**Observado:** operación+ejecución, operación sola y ejecución sola devuelven `DIAGNOSTIC_DENIED`. El control sin referencia opcional devuelve correctamente `replayed: true`. La lectura histórica permanece autorizada y la fila idéntica en todos los casos. La revocación real de sesiones se prueba separadamente y pasa; estos FAIL no son una denegación debida a sesión caducada/revocada.

**Causa:** `h5_diagnostic_record` valida primero ejecución/contexto vigente y operación contra `diagnostic_canonical_nodes`. Solo después toma el bloqueo de observationId, busca la observación previa y comprueba igualdad. Al revisar A→B, esas guardas de escritura nueva rechazan el replay antes de reconocer el resultado persistido, aunque `diagnostic_nodes` permita su recuperación histórica autorizada.

Localización exacta en la misma migración: líneas 217–219 (ejecución vigente), 222–227 (operación vigente) y 230–236 (bloqueo, búsqueda e igualdad del resultado previo, que no llega a alcanzarse en los tres FAIL).

**Reproductores y evidencia:** captura 03-permissions (1 FAIL/2 PASS) y 12-replay-controls (2 FAIL/1 PASS); logs `Q04 historical replay` y `Q04 replay guard isolation`. Repetición conjunta 13-new-retest. Tres FAIL, una causa.

**Correctivo necesario, no implementado:** distinguir el resultado previo exacto de la inserción nueva y reautorizar el primero contra su procedencia histórica vigente. Conservar comparación estricta de todos los campos/actor/ámbito, bloqueo, F1/F2 y comprobaciones finales. No basta mover el replay antes de cualquier autorización ni aceptar asociaciones heredadas inválidas. Repetir las cuatro combinaciones y los negativos de revocación/conflicto.

## Alcance y límites

Los reproductores previos F01/F02/F03, R01/R02, T01–T07 y las variantes derivadas E pasan en captura 06: 44/44, con sus fuentes intactas. Los casos nuevos no reetiquetan esos resultados ni convierten su PASS en aceptación global.

B07 ofrece `create`/`link`, no una operación ordinaria de unlink o cambio de ámbito por evidencia. Las perturbaciones privilegiadas de b07_links en las pruebas E se conservan y se repiten como regresiones adversariales históricas, pero no acreditan revocación normativa por evidencia. La cuarta auditoría usa revocación B01 individual/global y nueva identificación; no inventa políticas o mecanismos. La retirada de aprobación B08 se comprueba como permiso del efecto, no como borrado del historial.

H5-017/H5-018 IN PROGRESS, DM-PENDING-005 OPEN. **No recomendar aceptación del candidato E mientras F01/F02 permanezcan abiertos.** Continuar solo verificaciones seguras del encargo; STOP tras entregar informe, inventario y sello.
