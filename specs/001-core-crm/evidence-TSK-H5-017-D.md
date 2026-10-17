# H5-017/H5-018 — candidato D: trazabilidad temporal

**Estado global: PASS interno. Verificación interna local/aislada; tercera auditoría independiente y aceptación pendientes.** H5-017/H5-018 IN PROGRESS. C conserva el FAIL de la segunda auditoría. No se corrige ni reescribe ninguno de sus informes/sellos. DM-PENDING-005 abierto; sin commits/push/despliegue ni servicios de negocio reales. STOP al entregar D.

## Identidad y preflight

Fetch y comprobación de HEAD=main=origin/main=`9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia0/0, índice vacío, sin commits nuevos. Se acreditó antes de modificar el producto el estado anterior completo: **37229 archivos**, separado como candidato C **37167** y segunda auditoría **62**. Rutas, tipos, tamaños, modos y hashes verificados. El inventario C descomprimido conserva SHA256 `b44d4adadcb907340094b617ad8445c162daef4df21ae2d8b05c300b543e2602`; inventario de segunda auditoría `b2b5576c400110964c24a4a6af931b31fd1be285886f81bd282ab40d27a5b489`.

La identidad exacta D se resuelve en `tests/fixtures/h5-017-d/candidate-seal.json` y `candidate-inventory.json.gz`, inventario completo reproducible de archivos/versiones locales. El contenido del inventario se sella externamente para evitar autorreferencia: excluye únicamente el propio gzip y el sello. El overlay y delta tienen sus hashes en ese mismo sello. No es un commit publicado.

Delta propio D frente al preflight con segunda auditoría: **3 documentos de coordinación modificados, 171 archivos nuevos,0 eliminados**. Ningún archivo anterior de producto, test, expected, migración o evidencia cambia. Los3 documentos son `docs/PROJECT-STATUS.md`, `docs/NEXT-STEPS.md` y `specs/001-core-crm/tasks.md`: se añade coordinación D y se conserva íntegro el cuerpo anterior. Sus bytes precedentes son recuperables en before-d-overlay.tar.gz. Frente a C, los nuevos incluyen también los62 archivos de segunda auditoría, distinguidos en delta-inventory.json. El acumulado Git conserva4 modificados porque composition.ts ya era una modificación C; D no lo cambia.

## Fuentes y causa demostrada

Consultados directamente README/Constitución/decisiones/estado, Tasks H5-017/018 y §§2.2/6/7, SPEC HIST-001/ERR-001, AC070/072/081, Plan B01/B07/B08/B10, C01/C04 y §§7.1/8/11.2, BR-HIST-001/002/004, DM-INV-047 y SM-FORB-27. Se revalidaron las10 asignaciones de implementación y13 de auditoría, además de la conservación literal de641 filas normativas. [Expected D](expected-TSK-H5-017-D.md) sellado antes de cambiar código; fuentes y filas registradas en normative.json/assigned-rows.json. La precisión temporal independiente de la segunda auditoría se conserva como autoridad de los casos históricos autorizados, sin usar sus cuatro aserciones exploratorias excesivas como regla nueva.

Se ejecutó **sin modificarlo** el reproductor original R01/R02 de la segunda auditoría antes del correctivo: captura01, **1 PASS/1 FAIL**. Definir trabajo en Booking A y registrar una petición con operación canónica localizable; revisar legalmente a B mediante nueva versión/aprobación; buscar por petición en A/B devuelve vacía/vacía, mientras la observación es idéntica y la historia B08 sigue autorizada. Referencias y tiempos observados conservados en el log y [registro del defecto](defects-TSK-H5-017-D.md).

La causa es filtrado por ubicación vigente y desacoplamiento entre revisión e investigación histórica:65 selecciona las ejecuciones del contexto de la definición actual y deriva de ellas operaciones/historia. Después del traslado, la operación histórica legítima ya no está en la proyección A, el validador la clasifica incompatible y oculta la observación antes de recorrer sus referencias. En B no se selecciona esa observación porque conserva correctamente A. No hay pérdida física de la fila.

## Corrección mínima

Nueva migración66 final SHA256 `dff04069aac713b87cd07b82e69d7ca5811a9ef1290dd6599605dd1eced1600c`,4602 bytes, generada con Supabase CLI2.119.0: `supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql`. Cambia **solo el cuerpo de `crm_private.diagnostic_nodes(text,text,uuid)`**; conserva OID/firma/owner/ACL/search_path/seguridad/volatilidad y todos los demás atributos. Sin funciones/tablas/índices/políticas/grants nuevos ni cambios a65 SQL anteriores.

La consulta añade operaciones e historia B08 mínimas de la **versión original** cuyo contexto tipo+UUID coincide y cuyo vínculo de evidencia sigue autorizado. Exige concordancia entre B07 Operation/History, B08 Command Result, Execution y Definition/version/contexto inmutables, dentro del scope admitido. Una observación no demuestra pertenencia. Conserva la validación global de operación canónica; la recuperación comprueba además ejecución opcional y evento original autorizado. No altera el registro ni permite escribir nuevas observaciones con referencias obsoletas.

El recorrido corregido permanece en **A**, con procedencia `historical:true`, versión original y `historicalOperationReference:true` cuando corresponde. No se copia la observación a B ni se devuelve en A la ejecución/definición/evidencia actual de B. Las marcas son metadata diagnóstica, no estados de negocio. F1/F2 y la revalidación final C01 posterior a materializar el resultado permanecen intactas. Sin duplicación de eventos, reasignación de IDs, corrección retroactiva, retry ni persistencia adicional.

## Reproductor, contrapruebas y regresiones

R01/R02 originales sobre66: **2/2 PASS**, captura02 y repetición final19. El archivo original conserva exactamente SHA256 `4b0ce2736081c46807abc8c53e759d5701255bd5c52976039d4cad748dc2a5c4`. Un hook de test con allowlist de un único padre/especificador cambia solo la preparación de base65 por66; no transforma fuente, aserciones ni esperado. El original se ejecuta también una vez en la selección completa.

Casos propios D01–D09: **9/9 PASS** (captura07); repetición19 reúne esos9 y R01/R02, **11/11 PASS**. D10 añade una colisión entre UUID de operación y una ejecución distinta; tras reproducir el defecto interno D-F01 en21 se corrigió un único predicado. La captura final22 incluye todos los10 propios y los recorridos afectados: **207/207 PASS**. Cubren petición sin revisión, A→B→C y regresoA con aprobaciones reales sintéticas, Booking/Contact con mismo UUID, búsqueda asimétrica por contexto, operación sin executionId, evento original autorizado y canario de cuerpo restringido, referencias inexistentes/obsoletas y rechazo sin incrementar observaciones, intento desconocido canonizado en otro trabajo, Auth/MFA/interacción/actor vigentes, legado64 falso y conservación de las filas originales. La [matriz D](matrix-TSK-H5-017-D.md) mapea A–N del encargo y las obligaciones normativas.

Repeticiones originales F01/F02/F03, funcionales H5-017, contrapruebas C y seguridad: **66/66 PASS** sobre la primera66 (captura03), repetidos sobre66 final dentro de22 (207/207). Las5 suites sucesoras cambian solo el import del harness; los originales quedan intactos y se registran hashes origen/sucesor. Aislamiento tipo+UUID, referencias canónicas ajenas y tardías, incertidumbre E4/pending tras efecto durable y E5 conocido siguen pasando. Ninguna observación técnica acredita pago/Acceptance/entrega. No hay llamada externa ni reintento automático.

Cuatro dependencias (H4-024, H5-008, H5-009 y H5-016) se ejecutan sobre66 mediante sucesores con aserciones conservadas; cuando procede usan la guarda C de la transición composition.ts ya autorizada, sin ampliar esa excepción. Se incluyen una sola vez en el completo, sustituyendo sus versiones previas. Otras pruebas de migración/versiones históricas mantienen sus bases expresas; no se afirma que todas las pruebas históricas carguen66.

## V-MIG, seguridad y confidencialidad

D08/D09 **2/2 PASS**: instalación desde clúster aislado vacío mediante cadena, upgrade65 poblado que reproduce R01 antes y lo corrige después, fallo transaccional inyectado/rollback/reintento y rechazo de autoridad ordinaria. **175 tablas,305 funciones,332 políticas y1037 restricciones**; filas, IDs, snapshots, relaciones, propietarios, ACL, RLS/FORCE RLS, políticas y restricciones anteriores iguales. Solo cambia el cuerpo declarado;0 objetos nuevos. Usuarios API creados después de66 mantienen denegación. Advisors exclusivamente loopback:0 hallazgos.

Scope servidor y datos originales autorizados, sin contextos falsificados ni facultades del cliente. Roles runtime/TTE/anon/authenticated no obtienen acceso directo a tablas/helpers; no nuevos grants ni bypass. D06 revalida la lectura histórica frente a actor inhabilitado y los negativos de interacción/MFA/identidad. Los9 negativos heredados sobre66 comprueban MAC, transacción, scope y revocación final. Proyección mínima sin cuerpos, secretos, URLs temporales ni economía interna; el evento restringido permanece en su lector original. Una referencia histórica no habilita acceso universal ni al estado actual de otro contexto.

## PostgreSQL completo y controles

**Cobertura completa final: 2848/2848 PASS de cobertura única consolidada:2641 no afectados reutilizados +207 actuales.** La completa20 ejecutó2847/2847 en175 archivos, cada uno una vez, sin añadir originales y sucesores simultáneamente. Después se detectó D-F01 interno mediante D10 y se ajustó la igualdad del subject en66. Se repitieron todas las19 suites que cargan66 o usan su diagnóstico, más D10:207/207 en20 archivos. Se reutilizan solo2641 casos de156 suites no afectadas, excluyendo los206 casos previos repetidos:2847−206+207=2848 casos únicos en176 archivos. **No se afirma una única ejecución2848 después del último predicado.** Fuentes, selección, closures y loaders abiertos H0/H5-012 revisados en scope-reuse-analysis.json y complete-coverage.json; la selección actual del orquestador incluye176 archivos para reproducirla íntegramente en otra réplica. El orquestador hace una copia temporal de todos los archivos registrados, verifica bytes/modos, usa un clon Git con índice/refs separados y objetos compartidos solo para lectura, y el mismo node_modules congelado. Los tests que regeneran3 evidencias antiguas lo hacen solo en esa réplica. Sus nuevos resultados se capturan aparte; los archivos históricos del workspace nunca se sobrescriben. La réplica se elimina al cerrar.

El completo se divide en fases disjuntas: padres de reproductores históricos que reutilizan puertos, H2-008 aislado y el resto de suites. Se conservan stdout/stderr, exit y conteos por fase; el resumen cuenta únicamente casos del runner exterior y175 archivos únicos en la completa20, sin sumar los FAIL intencionados de subreproductores. No cambia ningún test, helper o transición de negocio para controlar concurrencia del instrumento.

Primera completa09 conservada: **2806 PASS/41 FAIL de2847**,0 cancelados/skipped. Dos arranques H2 colisionaron en55466/55467 con subreproductores históricos; logs nativos prueban Address already in use. Esos errores arrastraron40 casos. El restante R46 H2-008 falló en la comprobación de evidencia temporal: su fixture obtiene dos Date.now independientes para un instante material. Sin modificarlo, las3 suites pasan aisladas **102/102** en16. No se atribuye ese fallo al producto D: esas bases antiguas no cargan66. La ejecución final separa esos procesos y conserva todo el FAIL anterior.

| Control | Resultado / procedencia |
|---|---|
| PostgreSQL completo D | 2848/2848 PASS de cobertura única consolidada:2641 no afectados reutilizados +207 actuales; complete-coverage.json;20 completo previo y22 cohorte actual, sin solapamiento. |
| Reproductor original + D01–D09 |11/11 PASS,19; reemplazado en cobertura por22 actual. |
| Regresión F01/F02/F03 y H5-017/C/seguridad |66/66 PASS,03; repetida en22 y no sumada dos veces. |
| Unitarias |208/208 PASS actual,10; separadas de PostgreSQL. |
| Health independiente |1/1 PASS actual,11; separado de funcionales. |
| Instalación congelada |PASS actual,12; copia temporal, package/lock idénticos. |
| Typecheck |PASS actual final,23. |
| Lint/boundaries |PASS actual final,25. |
| Build |PASS actual final,24. |
| Auditoría dependencias producción |0 vulnerabilidades, actual15. |
| Preservación |PASS; final-verification.json y delta-inventory.json. |

Errores instrumentales propios preservados en04/05/08/13: comparación de edad variable entre páginas, transacción explícita sobre pool en negativo de autoridad, buffer al listar37k rutas y dos anotaciones de tipo demasiado estrechas. Se corrigen solo instrumentos nuevos y se conservan sus versiones/capturas. Las correcciones de tipos generan código ejecutable exactamente idéntico, con hashes y fuente anterior en type-only-transition.json. El completo20 utiliza los instrumentos entonces actuales;22 utiliza el predicado final. Las fuentes/inputs previos se verifican o recuperan de versiones propias identificadas, incluida la migración66 inicial conservada como producto sustituido. Sus resultados anteriores no acreditan las rutas afectadas de D final: para ellas se usa exclusivamente22. Unitarias/health/frozen/audit no ejecutan ese predicado y conservan sus entradas efectivas. No se modifica expected congelado ni se sustituye un FAIL anterior por PASS.

## Preservación e inventario

Todos los37229 archivos previos se contrastan contra preflight.json.gz: **37226 idénticos y3 documentos de coordinación con adición explícita**, cuyos bytes antiguos permanecen recuperables. Las75 evidencias de primera auditoría y62 de segunda, los informes C, todos los expected y65 migraciones anteriores conservan bytes/modos. Los FAIL originales H5-0172762/25, H5-01829/3 y segunda auditoría R01 siguen en sus sellos; se añade la reproducción01 D, sin reescribirlos.

H5-016:455 inputs idénticos; composition.ts mantiene exclusivamente la transición C ya autorizada, `fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879`→`31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`. **D no cambia composition.ts ni ningún src anterior.** El manifiesto H5-016 no se reescribe.641 filas normativas Tasks§6 idénticas; actualizaciones de coordinación posteriores a las pruebas no alteran fuentes normativas ni ejecución.

El sello D identifica conjunto completo, delta propio, delta frente a C y acumulado Git, con tamaños, modos, tipos y SHA256. before-d-overlay permite recuperar el preflight; corrected-overlay reconstruye los pendientes D sobre la base exacta, añadiendo los metadatos externos excluidos por autorreferencia. Ningún archivo eliminado. Inventarios/sellos anteriores intactos. Índice vacío y base/divergencia comprobados al cierre.

## Dictamen interno, límites y tercera auditoría

**Defectos materiales pendientes en D: 0.** H5-018-2-F01 queda corregido únicamente para esta identidad en verificación interna; el OPEN/FAIL de la segunda auditoría no se altera. No se acredita una auditoría nueva ni aceptación/publicación. [Registro D](defects-TSK-H5-017-D.md), [matriz](matrix-TSK-H5-017-D.md) y sellos entregan las superficies para esa revisión.

D-F01 interno y la versión inicial66, junto con sus FAIL/capturas, quedan preservados; cierre interno respaldado por D10 y207 casos actuales. Tercera auditoría debería contrastar independientemente pertenencia histórica tipada con versión y fuente originales, control de referencias opcionales, revisiones sucesivas, denegaciones actuales y finales, datos legacy falsos, identidad del original R01 y su único hook de fixture, equivalencia de sucesores y selección/fases únicas del completo. No existe política nueva de negocio o privacidad que deba aceptarse para esta corrección.

Limitaciones: PostgreSQL17.11/Node24.21.0 y Auth/Storage sintéticos aislados; dependencias congeladas; verificaciones internas en el mismo chat, sin independencia personal/modelo. Ninguna disponibilidad real, pago, envío, proveedor, cliente o conector acreditado. DM-PENDING-005 y pendientes globales abiertos; sin política de retención/anonimización/borrado, parámetros productivos, Hosted/Production, H5-019/H6 ni acreditación H6-015/H6-017.

**STOP tras candidato D implementado, probado y documentado. Esperar tercera auditoría independiente y autorización posterior.**
