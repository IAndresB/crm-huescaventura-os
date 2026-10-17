# H5-017/H5-018 — Correctivo F — causas, correcciones y retests

2026-10-17. Alcance local/aislado y datos sintéticos. La cuarta auditoría y el candidato E mantienen su FAIL histórico. Este documento registra la corrección interna, sin sustituir la quinta auditoría independiente.

## H5-018-4-F01 — P2 — Procedencia de versiones intermedias

**Reproducción:** `02-before`, cuatro FAIL originales Q02: A→B→A con raíz booking, servicio→reserva, servicio→oportunidad, y nueva observación en A que usa la operación B. Los controles muestran que la fuente B07 de B no es consultable desde A; aun así, E proyecta definición/aprobación/operación/historia B y acepta la observación nueva como canónica.

**Causa:** `diagnostic_canonical_nodes` autorizaba la ejecución mediante la definición vigente y después incorporaba versiones y hechos mediante definitionId/executionId. Esa unión perdía el contexto histórico de cada hecho. La validación de escritura heredaba el conjunto canónico excesivo. No es una falsificación de UUID ni evidencia de una fuga entre tenants: es atribución incorrecta entre contextos bajo el ámbito probado.

**Corrección:** migración 68, `diagnostic_canonical_nodes`: comprobar cada definición, aprobación e intento con su versión, contexto tipado y `b08_context`; acreditar operaciones con B07 history, B08 command result, propietario, definición/version/context exactos del snapshot; proyectar solo partes del material vigente y referencias de intentos compatibles. El escritor conserva su control estricto para identidades nuevas sobre ese conjunto corregido. No se eliminan filas ni historia intermedia.

**Derivado F-P03:** `04-additional` detectó que la ejecución vigente aún incluía el UUID de su tarea original fuera de la raíz consultada. Corregido en la misma migración: taskId solo se proyecta si pertenece al conjunto de tareas autorizado de la raíz. Se conserva la consulta propia de la tarea original. El FAIL inicial queda registrado.

**Regresión encontrada R01:** `09-original-regressions` dio 43 PASS/1 FAIL. El primer filtro F suprimía también la consulta explícita de una operación histórica desde la ejecución actualmente autorizada, que el contrato previo y R01 conservan. Se corrigió `h5_diagnostic_read` con una rama exclusiva de consulta por operationId: revalida fuente original y ejecución actual; devuelve nodos mínimos con `historical`, `definitionVersion`, `originContextKind` y `originContextId`. El resultado histórico no entra en el conjunto canónico del escritor ni en la consulta general, y no mueve la petición original. F-P04/P05 contraprueban ambos límites. No se cambió R01 ni el expected congelado. `R01-correction.json` y el SQL anterior preservan la evolución.

**Retest final focal:** los cuatro Q02, F-P01–P05 y R01 PASS en `10-all-focal`; tres fuentes B quedan excluidas, nueva escritura B→A devuelve `DIAGNOSTIC_DENIED`, secuencia A→B→A→C→A conserva exactamente versiones A 1/3/5 y consultas propias B/C. Cierre interno sujeto a la verificación completa y a quinta auditoría.

## H5-018-4-F02 — P2 — Replay histórico exacto rechazado

**Reproducción:** `02-before`, tres FAIL Q04: operación+ejecución con nueva sesión, solo operación y solo ejecución. La observación A sigue íntegra y consultable después de A→B; repetirla devuelve `DIAGNOSTIC_DENIED`. El control sin referencias opcionales pasa.

**Causa:** el escritor evaluaba las referencias contra el contexto vigente como si toda llamada fuera una inserción, antes de reconocer la identidad ya persistida. El lector sí conservaba la autorización histórica. Comparte con F01 la distinción temporal, pero tiene una causa de código separada: orden del escritor frente a uniones de la proyección.

**Corrección:** después de autenticar y validar raíz/entrada, tomar el bloqueo transaccional de observationId, buscar la fila y comparar ámbito, actor, contexto tipado, petición, operación, ejecución, evento, resultado e issues. Si coincide, reautorizar la fila a través de la proyección histórica `diagnostic_nodes` y devolver el mismo id con `replayed:true`. Si la identidad no existe, aplicar los controles actuales de inserción. Mantener F1/F2 finales después de esperas. `diagnostic_nodes` y la política histórica de E no se modifican.

**Retest final focal:** tres Q04 y los doce F-R01–R05 PASS en `10-all-focal`. Cuatro modos de referencias, una fila inicial concurrente, seis replays y siete conflictos rechazados por modo, cero efectos laterales; sesión revocada y actor no autorizado denegados; propietario canónico tardío incompatible bloqueado; fuentes retiradas impiden replay y restauradas lo permiten. La revisión concurrente mientras se espera la identidad deja replay exacto autorizado y nueva escritura obsoleta denegada. La fila original permanece intacta.

## Incidencias propias de instrumentación y preservación

| Captura o instrumento | Observado y resolución | Clasificación |
|---|---|---|
| 01-before | 17 fallos de setup por omitir launcher de Storage aislado. 02 utiliza el launcher oficial y reproduce 10 PASS/7 FAIL. | Invocación, sin aserciones de producto. |
| 04-additional | 13 PASS/4 FAIL: F-P03 material; F-R02 precondición de segundo administrador denegada; dos F-R05 preparaban aprobación dentro de una espera incompatible. | Un defecto material derivado y tres fallos de instrumento. |
| 05-typecheck | Variable de test inferida como UUID template y asignación string; anotación explícita corregida. | Instrumento propio, sin cambio normativo. |
| 06-additional-retest | 15 PASS/2 FAIL. F2 bloquea la sesión admitida; una revisión con esa misma sesión no puede adelantarse. Segunda sesión legítima y aprobación previa permiten ordenar la concurrencia. | Dos fallos de instrumento. |
| 08-additional-final | 17/17 PASS; versión anterior a recuperar R01 y añadir F-P04/P05. | Retest intermedio, no resultado final independiente. |
| 09-original-regressions | 43 PASS/1 FAIL R01. Recuperación histórica explícita corregida y contrapruebas añadidas. | Regresión material propia, resuelta. |
| Cache CLI | La comprobación automática de versión de Supabase cambió `supabase/.temp/cli-latest`. La preservación lo detectó y se restauraron sus ocho bytes exactos `v2.120.0`, verificados contra el inventario recibido. | Incidente de integridad resuelto; cero delta final. |
| Preservación v1 | Comprobó bytes protegidos, pero omitió el fixture F en su allowlist de nuevos archivos. V2 agrega exactamente esa ruta. | Instrumento propio; v1 y explicación conservados. |
| 14-complete, E-I05 | Dos precondiciones del test histórico requieren D/66 antes de aplicar67; el fixture F uniforme cargaba67 y rechazaba correctamente el par falso de preparación. Nuevo fixture mixto exacto conserva previo66 para esos dos casos y actual68 para los funcionales del mismo archivo. | Error de adaptación del fixture; producto y tests originales intactos. |
| 14-complete, H4-023 | La comprobación original de progreso independiente en 2.000 ms y su caso padre fallan dentro de la fase de 179 archivos paralelos. El retest21 aislado pasa34/34 con el mismo plazo/aserción; V2 lo mantiene en fase independiente. | Incidencia temporal de ejecución; ningún cambio de producto ni de test. |
| 21/22/23 | H4 aislado34/34; identidad E con fixture mixto7/7; typecheck PASS. | Retests de instrumento, no se suman al completo24. |

Para finalizar los intentos de concurrencia mal instrumentados se cancelaron cuatro consultas bloqueadas, dos `h0_m04` y dos `b08_work_probe`, exclusivamente en la base sintética de F. Sus resultados se conservan como FAIL de instrumento, sin atribuirlos a producto ni contabilizarlos como PASS. No se cancelaron trabajos ajenos.

Las versiones propias previas de SQL y tests están en `tests/fixtures/h5-017-f/instrument-originals/`; los hashes de cada captura permiten reconstruirlas. No se reescribe ninguna salida FAIL ni se cambian pruebas independientes. La captura focal final `10-all-focal` fija 78/78 PASS sobre el SQL definitivo SHA-256 `69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563`. El estado global final y el cierre interno de los hallazgos se acreditan en el [informe A–Q](evidence-TSK-H5-017-F.md).
