# CRM HUESCAVENTURA OS — H5-017/H5-018 — Correctivo G

Fecha: 2026-10-17, Europe/Madrid. Informe final A–O. Entorno local/aislado y datos exclusivamente sintéticos. Encargo íntegro: `tests/fixtures/h5-017-g/request.txt`.

## A. Dictamen

**PASS interno del correctivo G, exclusivamente de instrumentación temporal.** Completa20: **2.945/2.945 PASS**, cero FAIL/cancelados/omitidos, exit0 y postcheck íntegro. Se han conciliado los2.945 nombres y su cobertura, incluidos los303 que fallaron en quinta. No se reutilizan resultados históricos para este PASS.

El producto F permanece intacto y su rechazo anterior se conserva. La quinta auditoría continúa FAIL como hecho histórico. Este correctivo recomienda una nueva auditoría independiente H5-018; no acredita aceptación ni publicación y no declara H5-017/H5-018 COMPLETED.

## B. Identidad exacta

| Elemento | Identidad verificada |
|---|---|
| HEAD = main = origin/main | `9649a2773530ea8a43237b4e1f2034f80e34136f` |
| Fetch antes de editar y al cerrar / divergencia / índice | Completados;0/0; vacío |
| Producto/candidato F recibido |38.118 archivos, todos preservados |
| Artefactos quinta auditoría |153 archivos, todos preservados |
| Total recibido protegido por G |38.271 archivos,0 modificados,0 eliminados |
| InventarioF, SHA256 contenido descomprimido |`67a024e11fc7dc9c1336f463f372ccd5c90b4aebcca1fb14ba8c94340dbf7a9e` |
| SelloF, SHA256 archivo |`da14b2ba3cf0767b9b807c2cf12c8edbca0b0a221bc7c2f70e11d3f7a42dd9dd` |
| Sello quinta auditoría, SHA256 archivo |`dcd6a2ad70c72b6e22c52c95230155df76e775a47bb3b2a88d9fe3d025887dea` |

Preflight: tipos, modos, tamaños, rutas, hashes e inventarios contrastados antes de crear G. Los cuatro cambios seguidos recibidos (NEXT-STEPS, PROJECT-STATUS, Tasks y composition) permanecen idénticos; no son cambios de G. El conjunto resultante es F + quinta auditoría protegida + nuevas rutas G. Su identidad completa, conteos y hashes reproducibles constan en los metadatos finales de inventario/sello de §M.

## C. Causa raíz H5-018-5-F01

El fixture heredado `h4-cancellation-fixtures.ts` mantiene el acto y facts.at en `2026-10-17T10:00:00Z`, pero su attest por defecto usa conf.proof y la hora real de construcción de `confirmationFixture`. Tras ese instante produce evidencia posterior al acto. `payment_evidence` exige occurred_at<=at; `modification_proof` delega en esa comprobación y cancellation_apply rechaza E3. El producto actúa correctamente.

La captura01 del fixture original conserva29 PASS/74 FAIL de103; la02 conserva11 PASS/2 FAIL de13. Las trazas de solo lectura registran los instantes y rechazos reales. El diagnóstico no modifica reloj, datos de entrada, respuestas, aserciones ni plazos. Norma y consulta fuente-first: expectedG previo e inmutable, Tasks§2.2, Plan§§7.1/8/11.2, CHG006/008/009, HIST001/002, AC032/033/034/040/041/042 y D020. Hashes de las fuentes en `normative-sources.json`.

## D. Corrección mínima de instrumentación

El fixture original no se edita. La adaptación nueva `tests/support/h5-017-g-cancellation-fixtures.ts` conserva sus cuatro exports y cambia únicamente:

1. Evidencia principal y re-attest: instante predeterminado q.at; cualquier evidenceAt explícito se mantiene, incluido el inválido posterior.
2. Pruebas auxiliares de la familia cancellation: (base administrativa, aprobación y no reembolsable): instante sintético del acto predeterminado protegido. Las demás familias siguen delegando al proof original y su reloj previo.

No se desplaza el acto, no cambian fechas civiles, importes, términos, claim/hash/cobertura, identidades ni permisos. El diff independiente tiene11 líneas añadidas y3 retiradas en un solo bloque. No añade lecturas de Date ni intercepta el reloj. No hay refactor del producto.

| Ruta | SHA256 |
|---|---|
| Original protegido `tests/support/h4-cancellation-fixtures.ts` |`dd2b851e5d2888f60f249af0bc3f9000edc160d88da58ffcd200bc2deb6ee15a` |
| Adaptación nueva `tests/support/h5-017-g-cancellation-fixtures.ts` |`535dc0eced793ea71981d363162f03c1ecc9e197f2ec7bd1f031ef5805a359ae` |

`instrumentation-transition.json`, `cancellation-fixture.diff` y `patch-review.json` documentan ruta, antes/derivado, justificación y alcance. El hook G carga el hookFv2 recibido y redirige únicamente la URL del fixture de cancelación. El puente mantiene modo original para comparación y trazas opcionales de solo lectura. Los V09 de quinta conservan el fixture original porque su expected exige reproducir el defecto; no se modifican ni omiten. G-T importa directamente la adaptación. Reproducir G requiere su runner/hook explícitos; los originales siguen siendo originales.

## E. Controles temporales

Diez casos nuevos G-T01–G-T08, incluidos dos pares parametrizados.04:10/10 PASS;08:repetición10/10 PASS; completa20:los mismos10 PASS, sin sumarlos otra vez. Cubren evidencia anterior1ms, igual, posterior1ms y1día, fecha de acto fija, re-attest, evidencia histórica, raíz/determinación incorrecta, pruebas auxiliares, momentos reales de construcción distintos y actos civiles13/10 y18/10.

Se preservan derechos/retenciones exactos, replay, historia y evidencia originales. El rechazo deja sin determinación/operación nueva y no mueve fondos. Se observa100.00 de derecho sobre base200 a3 días,200 a7 y0 a2; no se altera la regla civil para conseguir el resultado.

En04 y08, los instantes reales cambian de11:42:50Z a11:46:17Z; el instante sintético de cancelación permanece10:00Z. Las demás familias conservan su reloj real. La independencia acreditada corresponde al defecto corregido; las suites históricas de diagnóstico conservan sus precondiciones explícitas. Auth, F1/F2, recorded_at y reloj PostgreSQL/OS no se congelan. Observaciones actuales en `material-observations.json`.

## F. Análisis individual de los ocho fallos

Los ocho se reproducen y quedan clasificados como **consecuencia demostrada del fixture temporal**, con0 causas pendientes tras la comparación. Se mantienen ubicaciones exactas de test/aserción, esperado, observado, dependencia y trazas en `eight-failures-analysis.json` y en el [análisis detallado](analysis-TSK-H5-017-G.md).

| Caso | Test original | Observado con original | Esperado preservado y observado con G |
|---|---|---|---|
| G-R01 | H4-014 C27 competing determinations with actual independent PG sessions 0,1 | 0 éxitos; ambos E3 | 1 éxito / 1 conflicto de revisión; PASS focal y completa20. |
| G-R02 | H4-014 C27 competing determinations with actual independent PG sessions 1,0 | 0 éxitos; ambos E3 | 1 éxito / 1 conflicto de revisión; PASS focal y completa20. |
| G-R03 | H4-014 C27 equivalent concurrent replay independent sessions 0,1 | 0 respuestas válidas; ambos E3 | 2 respuestas válidas / 1 replay / 1 revisión; PASS focal y completa20. |
| G-R04 | H4-014 C27 equivalent concurrent replay independent sessions 1,0 | 0 respuestas válidas; ambos E3 | 2 respuestas válidas / 1 replay / 1 revisión; PASS focal y completa20. |
| G-R05 | H4-014 C28 determination versus applied actual service date change 0,1 | Determinación E3, modificación válida; r.every(ok)=false | Ambas escrituras válidas; después se invalida la determinación; PASS focal y completa20. |
| G-R06 | H4-014 C27 distinct identities competing overlapping participation rights 0,1 | 0 éxitos; ambos E3 | 1 éxito / 1 conflicto de porción; PASS focal y completa20. |
| G-R07 | H4-014 C27 distinct identities competing overlapping participation rights 1,0 | 0 éxitos; ambos E3 | 1 éxito / 1 conflicto de porción; PASS focal y completa20. |
| G-R08 | H5-016 A03 close has read material before cancellation writes | Falta segunda espera; escritor E3 antes de trigger | 2 esperas observadas; escritor válido; cierre pendiente; PASS focal y completa20. |

Los siete casos de aserción observan el solapamiento real de las sesiones. Con el original fallan antes de obtener los efectos que deben competir. En05 se mantienen conflictos, número de revisiones/replays y ambos órdenes originales:103/103 PASS en H4-013/014.

En A03, el primer wait se obtiene y el segundo (:27:222) no: la cancelación rechaza la evidencia antes del insert y del trigger closure_material_lock que toma booking_preparation_lock. Por eso el escritor no alcanza el bloqueo esperado. En07 se observan al menos dos advisory waits, escritor válido y cierre rechazado por commercial pending, sin historia conjunta;13/13 PASS. El deadline15s permanece intacto. Se acredita la causalidad mediante el orden SQL guard105→insert143→trigger, traza de rechazo, waits reales y repetición con la adaptación, sin atribución automática por asociación.

## G. PostgreSQL completo actual

| Métrica | Resultado20 |
|---|---|
| Archivos seleccionados |196 |
| Fases disjuntas |15 |
| Casos |2.945 |
| PASS / FAIL |2.945 /0 |
| Cancelados / omitidos |0 /0 |
| Exit / duración total con postcheck |0 /1163.08s,19min23s |
| Primeras14 fases / fase15 |199 PASS /2.746 PASS |
| Archivos verificados en workspace y réplica |38.331 en cada uno |
| Errores de integridad / fatal |0 /ninguno |

Cobertura:2.920 casos de la selección recibidaF +15 de quinta (incluidos sus2 diagnósticos V09, antes separados) +10 G =2.945. F192 +quinta3 archivos +G1 =196. Entre223 archivos físicos permanecen27 exclusiones históricas documentadas,0 nuevas; `selection-audit.json` las concilia. Los21 archivos que contenían los303 FAIL están incluidos. El resultado no implica que cada ensayo histórico de migración instale68: conservan sus versiones de predecessor correspondientes.

El verificador compara los nombres exactos con el inventario previo más12 incorporaciones a la completa y confirma los303 anteriores PASS, los8 diagnosticados PASS y los71 focales originales PASS. No suma05/07/04/08, unitarias ni health a2945. Un subprocess comprueba57 casos sobre producto histórico (55 PASS/2 FAIL esperados); su único test exterior sí cuenta. Los57 no se suman ni se confunden con fallos actuales.

Logs completos:20-complete.stdout/stderr.log.gz y30 logs de fase, más20-phases.json,20-selection.json,20-copied-inputs.json.gz y20-replica-preservation.json. La réplica se retiró solo después del postcheck completo. Tres outputs antiguos se regeneraron exclusivamente allí y se capturan aparte; sus originales del workspace no se sobrescribieron. Esta es una ejecución nueva y no el PASS del implementador ni el FAIL anterior.

## H. Regresiones anteriores

La completa incluye las regresiones F01/F02/F03, R01/R02 de trazabilidad, propiedad operación/ejecución, contexto padre, A→B→A, replay histórico, referencias entre raíces y recuperación histórica explícita, con sus derivados E/F. Los cuatro reproductores H5-018-4-F01 y los tres H5-018-4-F02 están dentro de los71 focales originales comprobados PASS. También vuelven a ejecutarse las15 contrapruebas de quinta, incluidas V-MIG y V09. Los resultados FAIL originales de las cinco auditorías permanecen intactos.

## I. V-DOM / V-DAT / V-MIG

V-DOM: relaciones temporales existentes, cálculo civil y error E3 preservados. V-DAT: PostgreSQL real aislado, permisos, enlaces y filas exactas; las pruebas ajenas y posteriores fallan sin efectos indebidos. V-AT: competencia real, identidad/replay, historia y ausencia de duplicaciones. V-EVI: capturas nuevas append-only, SHA de cada input y conciliación por nombre.

V-MIG68 independiente reejecutado en20:2/2 PASS. Instalación limpia68 y actualización poblada67→68; error/rollback, restauración y reaplicación, datos, ACL, owners, RLS/FORCE RLS y dependencias. Observación actual:175 tablas,305 funciones,487 relaciones,332 políticas y565 dependencias; solo tres cuerpos previstos cambian entre67 y68. Datos idénticos antes/después,16 accesos directos denegados y owners sin login ni bypass. Estos ensayos no introducen una migraciónG ni ordenan un downgrade.

## J. Unitarias, health y puertas complementarias

| Captura | Verificación | Resultado |
|---|---|---|
|09 |Instalación congelada, ignore-scripts |PASS; ya actualizada según lockfile |
|10 |Unitarias |208/208 PASS |
|11 |Health independiente |1/1 PASS |
|06 |Typecheck |PASS |
|12 |Lint / fronteras |PASS |
|14 |Build |PASS |
|13 |Dependencias de producción |0 vulnerabilidades, exit0 |

Node24.21.0, pnpm11.19.0, PostgreSQL17.11; versiones actuales en environment.json. No se actualizan dependencias/lockfile. Sintaxis de scripts nuevos y hook/runner comprobada; diffcheck PASS. Los conteos complementarios se mantienen separados de PostgreSQL.

## K. Seguridad

No se modifican producto, migraciones, roles, ACL ni RLS. El contraste estático de174 archivos de producto/migraciones y la preservación recibida lo acreditan. Los negativos actuales verifican evidencia posterior, alcance ajeno y ausencia de efectos; los controles de revocación, propietarios, identidad tipada, evidencia restringida y metadatos mínimos de F/quinta pasan en20. Los16 accesos directos del V-MIG actual se deniegan.

Solo identidades y datos sintéticos, PostgreSQL y Storage loopback. Sin llamadas a servicios de negocio, publicación o despliegue. No se atribuye una fuga entre usuarios ni se acreditan Hosted/Production o H6-015/H6-017.

## L. Preservación histórica

`verify-h5-017-g-preservation.py`:38.118 archivosF y153 artefactos de quinta intactos, incluidas todas las migraciones1–68, expected congelados y FAIL/seals/inventarios. Rutas, tipos, modos, tamaños y SHA verificados. Los cuatro sellos de auditorías previas siguen FAIL y el quinto conserva su FAIL. H5-016:455 inputs exactos y la única transición de composition ya autorizada, sobre456; G no añade ninguna transición recibida.

Se preservan las capturas01/02 FAIL y la03 fallida por coordinación de puertos:103 fallos de inicialización, sin acreditar dominio.05 corrigió solo la coordinación y obtuvo103 PASS. No se retocan las salidas originales ni los plazos/aserciones para resolver la incidencia. El estado Git final mantiene los mismos cuatro cambios recibidos, índice vacío, referencias/base aprobadas y divergencia0/0.

## M. Inventario, hashes y reproducción

`tests/fixtures/h5-017-g/candidate-inventory.json.gz` inventaría el conjunto resultante completo; `delta-inventory.json` identifica exclusivamente rutas nuevas G. Cada entrada contiene ruta, tipo, modo, tamaño y SHA256. El inventario completo excluye únicamente su propio archivo y candidate-seal.json, incluidos en el total declarado. El delta declara también su autorreferencia excluida. `candidate-seal.json` vincula SHA de contenido y archivo gzip, delta, cobertura, inventario de casos, identidadF, quinta y condiciones de STOP.

`instrumentation-transition.json` distingue original intacto de derivado nuevo. El manifest recibido G preserva38.271 inputs. Los hashes finales y conteos G de los metadatos se entregan después de generarlos y comprobarlos con el verificador independiente de solo lectura; no se incorporan aquí como una autorreferencia circular.

Para verificar el cierre: `python3 scripts/verify-h5-017-g-seal.py`. Para reproducir, usar una copia completa y verificada del conjunto sellado, nuevas etiquetas y el runnerG explícito: `python3 scripts/capture-h5-017-g.py <etiqueta-nueva> node scripts/test-h5-017-g-complete.mjs <prefijo-nuevo>`. No sobrescribir20 ni las capturas actuales. El runner mantiene la réplica e integridad y espera todos los workers antes de dar éxito.

## N. Defectos pendientes

Cero defectos materiales de instrumentación G pendientes tras la verificación actual. H5-018-5-F01 queda **resuelto en la instrumentaciónG, pendiente de auditoría independiente**. Los ocho fallos quedan causalmente clasificados y pasan también en20. No se ha identificado una regresión funcional del producto que requiera correctivo en este encargo.

El rechazoF y la quinta auditoría FAIL no se reescriben. Persisten la nueva auditoría independiente y decisión humana de aceptación. DM-PENDING-005 OPEN; no se inventan retención, anonimización, eliminación ni parámetros productivos definitivos.

## O. Recomendación y STOP

**Recomendar nueva auditoría independiente H5-018 sobre el conjuntoG exacto sellado**, con productoF intacto y esta instrumentación, expected, trazas y resultados. Esa auditoría debe verificar la identidad, las dos modificaciones temporales, los8 casos y su causa, la negativa posterior y la completa reproducible; no asumir PASS por este informe.

No se recomienda aceptación/publicación antes de esa auditoría. H5-017/H5-018 continúan IN PROGRESS. Sin commit, push o deploy. H5-019/H6 no iniciados, H6-015/H6-017 no acreditados. **STOP tras verificar el sello; esperar nueva auditoría independiente.**
