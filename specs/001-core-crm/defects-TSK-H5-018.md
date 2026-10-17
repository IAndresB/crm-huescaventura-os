# TSK-H5-018 — hallazgos independientes

Dictamen: **FAIL del candidato congelado; correctivo requerido, no aplicado**. H5-017 y H5-018 no se declaran COMPLETED. Base `9649a2773530ea8a43237b4e1f2034f80e34136f`, manifiesto completo `a3a5aeebf70e5b92ce18a087aafc4b40c40dbf703b3b66a40db37280ef3568ac`. Las pruebas fallidas se conservan como fallidas.

## F01 — mezcla de tipos de contexto en la proyección

**Defecto material, OPEN, prioridad P1.** Fuente: PLAN-C01/C04, AC-081, P10, DM-INV-047 y ficha H5-018: los enlaces respetan el contexto autorizado y no amplían acceso.

Reproductor: `postgres-h5-018-audit.test.ts`, «A11 same UUID different context kind must not disclose another context record». Se crean mediante el contrato B07 una comunicación vinculada a `booking/X` y una evidencia vinculada a `contact/X`. Compartir UUID entre tipos no está prohibido por el contrato ni por el esquema; no depende de una colisión aleatoria. La lectura del original de la comunicación desde `contact/X` devuelve `data:null`. Sin embargo, la consulta diagnóstica de `contact/X` devuelve el registro de la comunicación, con identificador, tipo, actor, momentos y `authorizedEvidenceRef`.

Causa: migración64, `diagnostic_nodes`, línea83: selecciona `b07_links` por scope y UUID, omitiendo `context_kind`. La misma pérdida del tipo aparece en las selecciones siguientes de ejecuciones, tareas, alertas y recibos; el fallo ejecutado acredita específicamente B07, no todos esos caminos por inferencia.

Impacto probado: exposición de metadatos y enlace de un contexto que el lector original rechaza. No se ha demostrado filtración del cuerpo original, entre administradores o a un usuario no autenticado. El scope administrativo sí está filtrado; esto no elimina el defecto de contexto/finalidad.

Resultado: FAIL idéntico en capturas `01-independent` y `02-independent-repeat`, bases PostgreSQL nuevas. El stream registra UUID y nodo real devuelto. No corrección de producto. Correctivo mínimo recomendado: conservar identidad compuesta tipo/UUID en el grafo y en cada expansión permitida; revalidar el alcance de las referencias, con contrapruebas de raíces homónimas.

## F02 — operación canónica ajena admitida como relación local sin señalar contradicción

**Defecto material de integridad diagnóstica, OPEN, prioridad P2.** Fuente: SPEC §21, HIST-001, NFR-009, AC-081, DM-INV-047: relación reconstruible con hechos originales y alcance correcto.

Reproductor: `postgres-h5-018-audit.test.ts`, «A11 a known operation of another root must not be attached as this roots operation». Se recibe un evento real sintético por B09 en booking B y se registra una observación en booking A que utiliza su `operationId`. El registro es aceptado. El control adicional de `postgres-h5-018-controls.test.ts` consulta la fila canónica de B09, la observación persistida y el resultado de buscar ese ID desde A: raíz canónica B, raíz diagnosticada A, observación local devuelta sin advertencia de referencia contradictoria.

Causa: `h5_diagnostic_record` valida raíz, ejecución y evento, pero no comprueba la relación de una operación ya existente. `operation_id` es UUID libre y se inserta en la línea69; no hay distinción entre ID de intento aún no persistido y referencia que contradice un hecho canónico existente.

Matiz normativo: se permite representar operaciones intentadas sin hecho persistido; no se solicita una FK obligatoria para toda operación ni se considera que `technicalOnly:true` acredite un hecho de negocio. El defecto es admitir una referencia **conocida y contradictoria** sin distinguirla. La prueba exige rechazo; una corrección que conserve expresamente una alegación no verificada/contradictoria y evite presentarla como vínculo canónico también deberá contrastarse y aprobarse. La norma prescribe integridad y procedencia, no obliga a una forma SQL concreta.

Impacto probado: asociación diagnóstica falsa, sin modificación del evento original ni divulgación de su contenido. FAIL en `01` y `02`; medida adicional en `14-controls`. El PASS del control de medida solo confirma reproducción y **no cierra F02**. Correctivo recomendado: comprobar operaciones conocidas mediante su dueño/contexto o señalar inequívocamente su carácter no verificado/contradictorio, preservando intentos sin registro canónico.

## F03 — composición existente degrada incertidumbre a E5 definitivo

**Defecto material de integración heredada no resuelta, OPEN, prioridad P1.** Fuente: SPEC §19 E4/E5, SPEC-FR-ERR-001/002, AC-072, SM-FORB-27; obligación expresa de H5-017/018.

Reproductor: `postgres-h5-018-causes.test.ts`, «A04 composed public server path after an effect must preserve E4 through diagnostics». Se utiliza `composeServer().invoke` con contexto emitido por servidor y una operación nueva. El callback registra una evidencia sintética durable en PostgreSQL y después lanza excepción. Se envuelve la llamada con `invokeDiagnosticOperation`. El callback se invoca una sola vez; la frontera existente convierte la excepción en `rejected / E5 / unchanged`, y el nuevo diagnóstico conserva y persiste exactamente ese resultado definitivo, sin E4.

Causa: `src/server/boundary.ts:165` captura toda excepción del callback como E5/rejected. `src/server/composition.ts:17` continúa delegando allí. La nueva envoltura solo convierte excepciones que llegan a su propio catch; no puede recuperar la incertidumbre ya perdida. La búsqueda en src encuentra la nueva API exportada, sin conexión automática en `composeServer`.

Es un comportamiento preexistente, no una regresión introducida por migración64. El informe H5-017 delimita su nueva frontera a un callback autorizado; esa delimitación no prueba que la composición pública conservada cumpla el requisito global de excepción con efecto desconocido. No se afirma que exista endpoint comercial desplegado: solo están expuestos los contratos internos probados.

Resultado: FAIL idéntico en `05-causes` y `11-causes-repeat`, con un efecto durable y observación E5 en el stream. Control positivo `14-controls`: colocando la envoltura diagnóstica **dentro** del callback de la composición, llega E4/pending. También pasan el caso de excepción directa y la clasificación E5 de fallo de resolución anterior a cualquier callback. Por tanto, no se propone sustituir todo E5 por E4.

Correctivo mínimo recomendado: definir y conectar la composición soportada para operaciones de negocio de modo que capture incertidumbre antes de perderla, y probar la entrada pública que realmente la utiliza; conservar E5 solo cuando el efecto es conocido. No se ha modificado ningún archivo histórico ni nuevo de producto.

## T01 — errores del instrumento de migración

**Defecto técnico no material del auditor, CLOSED.** `03-migrations`: columna `oid` no cualificada en una consulta con dos catálogos; después, búsqueda textual `=X/` confundía el permiso del rol nombrado con PUBLIC. Se corrigió únicamente el nuevo test: `c.oid` y reconocimiento del grantee vacío en ACL. Snapshot `03-original-auditor.test.ts.gz`, FAIL original conservado. `04-migrations-corrected`: 2/2 PASS. Producto y esperado intactos.

## T02 — reconstrucción de copias temporales históricas

**Problema de evidencia del instrumento, CLOSED.** El primer verificador de reutilización reemplazaba todas las apariciones de un import, mientras el preparador histórico sustituía solo la primera. Esto produjo un hash distinto del archivo temporal, sin alteración de la evidencia original. Captura `16-reuse-original`, snapshot `16-original-reuse.py.gz`; corrección mínima al verificador propio, `17-reuse-corrected` PASS. No se flexibilizó ningún hash de producto ni se omitió entrada discrepante.

No se encontraron problemas de entorno nuevos que impidieran ejecutar las pruebas. DM-PENDING-005 es un pendiente normativo preexistente, no resuelto por esta auditoría. F02 expresa el margen de solución permitido; F01 y F03 bastan por sí mismos para impedir aceptación, aun si dirección revisa la severidad de F02.
