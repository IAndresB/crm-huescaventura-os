# H5-017/H5-018 — Bloque C: candidato corregido F01–F03

**PASS de verificación propia del candidato corregido, preparado para nueva auditoría independiente H5-018. PostgreSQL completo2834/2834 PASS,0 fallos/cancelados/omitidos.** Candidato exclusivamente local/aislado, sin aceptación ni publicación. H5-017/H5-018 permanecen IN PROGRESS y requieren nueva auditoría independiente. La evidencia completa está cerrada; se conserva el FAIL original de H5-018.

## Identidad y autorización

Encargo expreso del director: Bloque C F01/F02/F03, incluida corrección técnica compatible de componentes heredados; prohibidos commits/push/despliegue/datos o servicios de negocio reales y tareas H5-019/H6. La normativa y expected anteriores no se reinterpretan.

Tras fetch, HEAD=main=origin/main=`9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia0/0 e índice vacío. Se verificaron36.952 archivos del candidato original, sus3 documentos modificados/174 nuevos, los75 añadidos por H5-018, su sello `0fcad235dbdbb869f72e616d49a9fc263ca29fbb80b7a67adc7df79c80ddf5f5` y456 inputs H5-016. El estado anterior C tenía37.027 archivos,3 modificados/249 nuevos sobre Git; era un árbol local legítimo, no una base limpia.

`tests/fixtures/h5-017-c/preflight.json.gz`: SHA256 `244d84c129ec85b25263922b455cfb4bd7027ba1f72e737252d08acf843b971d`. Overlay completo anterior `before-c-overlay.tar.gz`: `12bf14085a29f16a3382bc66412641e8c013f182e5ad95eb5ecf0da112088a5a`. Permiten reconstruir el rechazado y su auditoría sobre la base Git, sin limpiar ni sobrescribir el checkout. La congelación de H5-018 y su sello no se actualizan para incluir el correctivo.

Identidad técnica del producto probado:

| Archivo | SHA256 |
|---|---|
| `src/server/composition.ts` | `31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d` |
| Nueva migración65 `20261016174248_h5_diagnostic_context_reference_fix.sql` | `ff33bbe69239226f043a352379ad088556f78557943532110fd15638c479cdb0` |
| Expected propio C | `054ba768cc71a6157ced3d31e2773ae9073fe9b81c23f10fd52506075deac882` |

El inventario final del candidato completo y del delta C contiene rutas, tipos, tamaños, modos y hashes; la identidad no se atribuye a un commit inexistente. Migración64 original `d0074d82800cd51805c63be61cdfab6e392750d147884b62294e8cb12e5e3063` intacta.

## Fuentes y análisis de consumidores

Consultados Constitución/README/DECISIONS/estado, Tasks fichas H5-017/018, §2.2/§6/§7, SPEC HIST-001/ERR-001/ERR-002 y AC-070/072/081, Plan B01/B07/B08/B10/C01/C04/§§7.1/8/11.2, matrices/evidencias/defectos originales H5-017/H5-018, dependencias y reproductores exactos. La [matriz C](matrix-TSK-H5-017-C.md) mantiene las10 asignaciones de implementación y13 de auditoría; [expected C](expected-TSK-H5-017-C.md) sellado antes del primer correctivo.

Antes de modificar composición se localizaron sus consumidores: el wrapper público composeServer delegaba en invokeServerBoundary. Sus consumidores actuales son las pruebas de composición; los consumidores técnicos directos H0 invocan invokeServerBoundary, mientras las composiciones PostgreSQL/humanas mantienen sus contratos transaccionales propios. Dos pruebas históricas exigen E5 ante excepción técnica directa y no se modifican. La brecha F03 puede resolverse antes del catch técnico, conservando esas pruebas y los errores previos a iniciar negocio. No hace falta cambiar una decisión aprobada.

No se modificaron boundary.ts, contratos de aplicación, estados de negocio, reglas de pago/Acceptance/entrega/cierre, auth, dependencias ni arneses históricos. La documentación de Supabase orientó el control independiente de permisos y RLS; ninguna operación se dirigió a un proyecto real.

## F01 — aislamiento de contexto

Antes: `diagnostic_nodes` recogía B07/B08/tareas/alertas/eventos por UUID, omitiendo el tipo. El mismo UUID válido en contact y booking hacía aparecer en contact metadatos/enlace que B07 rechazaba leer desde allí.

Después: `diagnostic_contexts` representa pares tipo/UUID a partir del root y de relaciones canónicas booking→opportunity/proposal/booking_service existentes. `diagnostic_canonical_nodes` usa esos pares para cada selección. B07 conserva el mismo predicado de fuente scope/tipo/UUID; no hay nuevos roles ni permiso inferido por conocer un identificador. Se mantienen las expansiones legítimas y los documentos/objetos permanecen detrás de sus contratos autorizados.

Prueba individual: el reproductor original F01, con solo import de harness65, pasa con la misma aserción de ausencia. Las contrapruebas propias mezclan B07, ejecución, Task, Alert y B09 bajo UUID compartido; no devuelven metadatos, IDs ni nodos al consultar el tipo ajeno, también filtrando referencias concretas. El root propio sigue viendo sus fuentes y el servicio hijo legítimo conserva su evidencia.

## F02 — integridad de referencias

Antes: una observación en A admitía el operationId de un recibo canónico de B sin comprobar su dueño ni contexto.

Después: catálogo cerrado de29 registros de operaciones UUID existentes, contrastado bajo el mismo dueño con los nodos canónicos autorizados. La escritura rechaza referencia incompatible con DIAGNOSTIC_DENIED, sin observación persistida ni cambio del original. Se conservan operaciones de identidad/requisitos/incidencias vinculadas de forma verificable, además de las familias anteriores. Los registros técnicos H0 con IDs textuales y otra autoridad quedan fuera de ese catálogo, sin ampliación de privilegios.

Un ID aún no persistido puede registrarse como `operationReferenceState:unverified_attempt`; si corresponde a operación propia conocida se devuelve `canonical`. Son etiquetas de procedencia técnica, no estados nuevos de negocio. Ningún accepted técnico acredita hechos.

La consulta revalida observaciones contra los hechos canónicos de su snapshot actual. Si el ID era desconocido y luego se acredita una operación ajena, la asociación desaparece de la proyección, sin borrar ni alterar la observación original. No se intenta impedir toda escritura futura mediante bloqueo global, ni se duplica el registro canónico. Una prueba mantiene el evento sin commit en otra sesión, registra el intento todavía desconocido y después confirma el evento; tras ese commit no se devuelve la asociación falsa. Un intento propio confirmado después cambia su procedencia a canonical sin duplicar la observación. Replays se comprueban de nuevo y las escrituras concurrentes equivalentes conservan una sola fila.

Prueba individual: F02 original pasa sin modificar su expected. C04–C06 comprueban operaciones B09/B07/identidades/requisitos/incidencias, validación positiva/negativa, desconocidas, dos órdenes de persistencia, dos sesiones, inmutabilidad y ausencia de efectos tras rechazo.

## F03 — incertidumbre en composición

Antes: contrato produce efecto durable y lanza excepción → invokeServerBoundary captura E5/rejected/unchanged → el envoltorio diagnóstico recibe un resultado ya definitivo y no puede reconstruir E4.

Después: composeServer captura la excepción del contrato iniciado antes de delegar su resultado a la frontera técnica. Devuelve pending/E4/uncertain/reconcile-before-retry. No registra éxito, no afirma unchanged y no ejecuta retry. Los fallos conocidos de resolución previos al callback conservan E5; un rechazo E5 aportado explícitamente por un contrato sigue siendo E5. Los replays previous/conflict/uncertain se resuelven antes de invocar el contrato.

Prueba individual: F03 independiente ahora registra E4/pending con un efecto durable y una sola invocación. Las seis unitarias nuevas verifican composición y continuidad, incluidas las tres variantes de replay. El uso técnico directo H0 conserva sus expected; el punto soportado de composición de operaciones de negocio es composeServer.

## Migración y permisos

Migración65 generada con CLI fijado2.119.0 mediante migration new. No se editó ninguna de las64 anteriores. No crea tablas, cambia filas históricas, retención, scheduler o reglas de negocio. Reemplaza únicamente dos cuerpos: `diagnostic_nodes(text,text,uuid)` y `h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)`. Mantiene OID/firmas/owners/ACL/security/search_path/volatilidad; añade tres helpers privados de executor, sin EXECUTE de PUBLIC/runtime/API/TTE. La autoridad ordinaria conserva F1/F2 y revalidación final; RLS/FORCE RLS de la tabla diagnóstica siguen activas.

V-MIG ejecutado: instalación limpia65 y roles API creados después, upgrade64 poblada con observación incorrecta original, fallo antes de commit/rollback/reintento. Comparación de175 tablas/302 funciones previas: todas las filas y atributos anteriores intactos, salvo los dos cuerpos expresamente identificados. La observación incorrecta preexistente se conserva en la tabla y queda excluida de la vista. Advisors exclusivamente loopback: results vacío. No se ofrece down destructivo; recuperación del despliegue fallido es rollback transaccional y nuevo intento del mismo forward.

## Resultados y atribución

| Ejecución | Resultado | Alcance |
|---|---|---|
|01-original-reproduction|22 PASS/3 FAIL de25|Reproduce F01/F02/F03 antes del correctivo.|
|15-final-focal|68/68 PASS|25 contrapruebas independientes repetidas+29 regresiones H5-017+14 PostgreSQL propios C (12 negativos/positivos y2 migración).|
|17-dependencies|104/104 PASS|H4-024/H5-008/H5-009/H5-016 sobre65 y H5-012 actual; no pruebas nuevas.|
|18-unit|208/208 PASS|201 previas+6 composición+1 transición de preservación.|
|25-health-final|1/1 PASS|Health aislado separado de PostgreSQL/negocio.|
|26-frozen-final|PASS|Instalación efímera con lock congelado e ignore-scripts, mismas versiones, lock inmutable.|
|22-typecheck-final /23-lint-final|PASS|Incluyen tests/verificadores derivados finales.|
|19-build /20-audit|PASS;0 vulnerabilidades conocidas|Producto exacto probado, sin despliegue.|
|24-complete|2834/2834 PASS;0 fail/cancelled/skipped, sin cambios de inputs|Batería íntegra actual, no se suma a focal/regresiones solapadas.|

Los primeros FAIL de construcción se conservan en [defects C](defects-TSK-H5-017-C.md). La ejecución04 contiene cambios de inputs y no acredita aceptación.21 ejecuta once casos PASS pero captura98 por retirada de copias temporales ajenas; exige evidencia completa posterior estable. No se cambian esos recibos ni se presentan como gates limpios.

La suite completa mantiene una vez cada caso anterior y los14 nuevos PostgreSQL C. Se identifican15 suites sucesoras: cuatro cambian solo harness para ejecutar aserciones originales sobre65; una mantiene la migración histórica64 limitando a64 su censo; diez adaptan únicamente la comprobación de bytes de composition mediante la transición autorizada. Los siete consumidores del guard histórico y tres comparadores directos conservan sus fuentes originales. Los cinco controles históricos de medición H5-018 y sus dos pruebas de migración mantienen el objetivo64: no se usan para acreditar el nuevo comportamiento65. Ese comportamiento se acredita con los25 reproductores repetidos,29 regresiones diagnósticas y14 casos propios sobre65, más las104 regresiones de dependencias. Otros ensayos históricos de upgrade permanecen fijados a sus versiones para conservar su significado. El subproceso de contrapruebas F12 usa una copia idéntica con import de guard sucesor. `24-selection.json`, manifests de derivados y hashes permiten revisar cada sustitución; no se omiten filas normativas ni pruebas funcionales para lograr PASS.

El guard sucesor admite solo la ruta composition.ts y hashes histórico/corregido literales, comprobando base Git, archivo regular/mode644, bytes y recibo de autorización. La unitaria nueva rechaza tercera versión, historical hash falso y otra ruta. No hay excepción general a preservación ni modificación de manifests/expected congelados.

## Integridad y reproducibilidad

455 de456 inputs H5-016 permanecen idénticos; el restante es la transición de producto autorizada de composition.ts (`fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879`→`31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`). No se afirma que los456 bytes sigan iguales. Los36.775 históricos anteriores a H5-017 quedan iguales salvo esa única ruta de producto; los tres documentos de coordinación ya tenían cambios del candidato y se actualizan separadamente.

Sellos, inventarios,75 artefactos H5-018, expected,64 migraciones y evidencias anteriores se preservan exactamente. El FAIL H5-0172762 PASS/25 FAIL y el FAIL H5-01829 PASS/3 FAIL permanecen identificables. La captura01 añade una reproducción nueva de los tres fallos, sin sustituir las anteriores. La referencia original se reconstruye desde base+before-c-overlay, con sus propios modos y hashes.

Entorno real: Node24.21.0/pnpm11.19.0/PostgreSQL17.11, Storage oficial fijado a5def1dfc15ab7f08fe271c7d1e70542424524e4e con backendfile/loopback y credenciales sintéticas efímeras. Los secretos de prueba no se registran como evidencia. No Auth Hosted, datos personales reales ni proveedor externo de negocio.

Reproducción actual: `scripts/capture-h5-017-c.py` captura cada gate con etiqueta nueva e inputs/exit/stdout/stderr. `scripts/test-h5-017-c-complete.mjs` selecciona la batería actual y conserva/restaura exactamente las cuatro salidas históricas conocidas que ciertos verificadores regeneran. `scripts/verify-h5-017-c.py` verifica todos los archivos anteriores, la excepción autorizada, derivaciones y gates; no reescribe los sellos originales. Toda salida regenerada se archiva en C antes de restaurar bytes previos.

## Superficies para nueva auditoría y STOP

Revisar sin asumir la corrección: expansión tipada y parejas homónimas en cada familia; propietario/alcance en el catálogo de29 operaciones y sus matches; intentos desconocidos y hechos posteriores/concurrentes; trato de observaciones incorrectas heredadas; atributos y permisos de las dos funciones reemplazadas/tres helpers; orden de catch en composeServer frente a H0 técnico; resultados E5 explícitos y fallos previos; copias de tests, guard de transición y selección completa; preservación de originales y comparación de inputs del último gate.

DM-PENDING-005 permanece abierto; no retención/anonimización/borrado ni parámetros definitivos nuevos. H6-015/H6-017 no acreditados. Nueva auditoría independiente y publicación requieren instrucciones posteriores. Sin commits/push/merge/despliegue ni tareas H5-019/H6. La completa queda acreditada y el inventario corregido se sella separadamente. No se han identificado defectos materiales abiertos propios de F01–F03 en esta verificación interna. **Preparado para nueva auditoría H5-018. STOP: esperar esa auditoría y autorización expresa de publicación.**

## Cierre e inventario

La completa24 es una ejecución limpia de2834 casos, sin cambios de inputs. El verificador final compara todas las entradas de cada gate válido con los archivos actuales, los15 sucesores y los641 renglones normativos de Tasks§6. Las tres salidas históricas regeneradas se archivaron/restauraron con hashes; no hubo alteración residual de CLI.455 inputs H5-016 idénticos y la transición de composition verificada,75 artefactos de auditoría íntegros y64 migraciones anteriores intactas. Los únicos cuatro archivos anteriores C actualizados son composition.ts y los tres documentos de coordinación;37.023 de37.027 anteriores C permanecen iguales. Los36.952 del candidato rechazado siguen recuperables exactamente desde su copia sellada;36.948 permanecen idénticos en el checkout actual.

`tests/fixtures/h5-017-c/candidate-inventory.json.gz` identifica todo el candidato corregido; `delta-inventory.json` describe cambios/nuevos/eliminados desde el estado previo C y respecto a Git; `candidate-seal.json` sella ambos e indica las exclusiones de metadatos que evitan autorreferencia. `final-verification.json` enlaza resultados y preservación. Índice vacío, divergencia0/0 y ausencia de commits posteriores a la base se comprueban de nuevo al cierre.

**Inventario de salida:** delta C de4 archivos anteriores modificados,140 nuevos y0 eliminados. Árbol respecto a Git:4 modificados,389 nuevos y0 eliminados. corrected-overlay.tar.gz conserva todos los paths pendientes, incluidos los originales recibidos, excepto sus propios metadatos autorreferentes; el sello identifica esa copia. No se ha preparado ningún commit ni alterado el índice.
