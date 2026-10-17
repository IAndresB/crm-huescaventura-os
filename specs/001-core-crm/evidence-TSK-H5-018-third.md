# TSK-H5-018 — tercera auditoría independiente del candidato D

**Dictamen: FAIL. Dos defectos materiales P2 OPEN. No se recomienda aceptar ni publicar el candidato D.** H5-017/H5-018 permanecen IN PROGRESS y DM-PENDING-005 abierto. Auditoría local/aislada con datos sintéticos; producto y antecedentes protegidos sin modificar. No commits, push, despliegues, servicios de negocio reales, H5-019/H6 ni acreditación H6-015/H6-017.

## Identidad exacta y preservación

Base comprobada tras fetch al comienzo y al cierre: `HEAD = main = origin/main = 9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia 0/0, índice vacío. El árbol tenía cambios locales autorizados acumulados; no se declara un árbol Git limpio. Sus4 archivos modificados y622 nuevos ya pertenecían al candidato recibido.

Se verificaron los **37400 archivos del candidato D** por ruta, tipo, tamaño, modo y SHA256. De ellos 37398 están en el inventario de contenido; los otros2 son ese inventario comprimido y su sello. SHA256 del inventario descomprimido:

`8fc37c4b13f114d3a689cac57d68a338df75b5602cb94cfc6b5211d9359b4912`

El sello D conserva SHA256 `661316ffd0e1f8077cf33824ad7448b29f81b10ecb0991b2c1e22b58289f1226`. La migración 66 auditada es `supabase/migrations/20261016192425_h5_diagnostic_temporal_trace.sql`, 4602 bytes, SHA256 `dff04069aac713b87cd07b82e69d7ca5811a9ef1290dd6599605dd1eced1600c`.

`tests/fixtures/h5-018-third/preflight.json.gz` inventaría el conjunto completo recibido, incluidos los 2 metadatos. El verificador independiente comprueba además los inventarios/sellos del original H5-017, primera auditoría, C, segunda auditoría y D. Versiones de los 3 documentos de coordinación se recuperan de los overlays protegidos; composition.ts original se recupera de la base Git aprobada. Sus transiciones no se confunden con modificaciones actuales del auditor.

Preservados: 65 migraciones anteriores; 641 filas normativas de Tasks§6; 75 archivos de primera auditoría y62 de segunda; expected, reproductores, sellos y FAIL históricos. H5-016: 456 entradas comprobadas, 455 idénticas y única transición autorizada composition.ts `fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879`→`31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`. La auditoría añade únicamente archivos nuevos de su propio espacio. Los documentos de coordinación D se conservan sin actualizar su declaración interna anterior; este informe contiene el dictamen nuevo.

## Independencia normativa y método

Se consultaron directamente Constitución, decisiones, Tasks§2.2/H5-017/H5-018/§6, Plan B01/B07/B08/B10/C01/C04/§§5.4/7.1/8/10.1/11.2, SPEC HIST001/ERR001/AC070/072/081, NFR009/010/014, DM-INV047, BR-HIST y SM-FORB27. Las 13 asignaciones literales y hashes están en `normative-sources.json`. [Oráculo independiente](expected-TSK-H5-018-third.md) congelado antes de inspeccionar SQL66 y de ejecutar casos nuevos; las pruebas del implementador no definen el esperado. [Matriz independiente](matrix-TSK-H5-018-third.md).

Se utilizan contratos de aplicación reales sobre PostgreSQL17.11, Node24.21.0 y pnpm11.19.0; Auth y Storage sintéticos locales, runtime Storage fijado en `5def1dfc15ab7f08fe271c7d1e70542424524e4e`. Los roles de migración solo preparan bases desechables y ensayos de migración; las asociaciones defectuosas se registran por el adaptador ordinario y se consultan con autorización real F1/F2. Ningún cliente/reserva/pago/envío real ni proyecto Hosted interviene.

La independencia es metodológica: oráculo nuevo de fuentes aprobadas, contrapruebas nuevas y ejecución actual separada; no se pretende acreditar una firma externa ni independencia personal de este mismo chat. La identidad entregada por el director se verifica por bytes, no se acepta un PASS porque exista un sello.

## Resultados de los defectos anteriores y nuevos

- **H5-018-2-F01 original:** R01/R02 intactos, 2/2 PASS sobre 66 en captura 02. El hook independiente está limitado al padre/especificador exactos y solo sustituye el fixture65 por66; no transforma fuente ni aserciones. SHA original `4b0ce2736081c46807abc8c53e759d5701255bd5c52976039d4cad748dc2a5c4`. A→B→C→A y peticiones anteriores/posteriores pasan en T01. No se declara cerrada toda la superficie temporal: T07 revela F02 nuevo.
- **F01/F02/F03 originales:**25/25 PASS en captura 06 ejecutando directamente los 2 archivos protegidos originales sobre 66, sin modificar sus bytes. E1–E8, efecto durable seguido de excepción, E4/pending frente a E5 conocido, no retry, explícitos y separación de diagnóstico/negocio comprobados. Las mismas superficies están incluidas en la regresión completa mediante sucesores de fixture, sin sumarlas de nuevo.
- **Ambigüedad operación/ejecución histórica D10:** PASS en su escenario original y en T05 nuevo. **H5-018-3-F01** demuestra una brecha distinta: la rama canónica actual y la canonización tardía admiten una operación de A asociada a ejecución B, con UUID iguales o distintos. T03/T04 fallan dos veces. La recuperación histórica comprueba el subject; la rama actual no comprueba esa relación.
- **H5-018-3-F02:** una petición válida sobre un trabajo hijo visible desde su padre pierde su recorrido tras una revisión autorizada. Dos variantes repetidas: servicio→reserva y reserva→oportunidad. La recuperación66 exige igualdad exacta de raíz, mientras la proyección canónica anterior expande relaciones padre/hijo autorizadas. Observación y historia permanecen; consulta por petición queda vacía.

Los 14 casos nuevos únicos del auditor arrojan **9 PASS/5 FAIL**: 10 temporales (7/3), 2 padres (0/2), 2 V-MIG (2/0). Se usan las capturas 14/18/15 respectivamente; no se suman sus repeticiones03/17/05. Cinco variantes FAIL corresponden a **dos defectos materiales**, detallados con causas, normas y correctivos necesarios no implementados en [registro de defectos](defects-TSK-H5-018-third.md).

## Migración 66, permisos y confidencialidad

V-MIG independiente M01/M02: **2/2 PASS**. Comparación de catálogo 65→66: 175 tablas, 487 relaciones, 305 funciones, 332 políticas, 1037 restricciones; 0 objetos nuevos. Solo cambia `prosrc` de `crm_private.diagnostic_nodes(text,text,uuid)`; OID, firma, owner, ACL, estabilidad, invoker, search_path y restantes propiedades permanecen. Datos iguales inmediatamente antes/después del DDL. No grants, políticas, índices, tablas o permisos nuevos.

Se verifican instalación en clúster vacío, upgrade poblado con el defecto original visible antes, aborto transaccional/rollback, rechazo de DDL por runtime, restauración de la función anterior en la base desechable y reintento forward con 66 exacta. Introducir roles API después de 66 no otorga acceso; 8 intentos directos reales son denegados. RLS/FORCE RLS preservados; propietario sin login, superuser ni BYPASSRLS; helper invoker con search_path fijo.

Los controles de aislamiento de contexto/tipo, ámbitos administrativos, MFA/interacción/actor, MAC/transacción, revocación final, evidencia restringida y canarios pasan en las regresiones actuales. No se demuestra una nueva filtración de datos ajenos en estos casos. F01 nuevo es de integridad de asociaciones dentro del contexto autorizado; F02 nuevo es pérdida de localización, no eliminación de datos. Esta distinción no reduce su carácter material. Advisors loopback se ejecutan en V-MIG del completo; no representan una auditoría Hosted.

V-DOM/V-DAT detectan los defectos funcionales señalados; sus controles de permisos e inmutabilidad pasan. No se etiqueta todo V-DAT como PASS si contiene esos negativos fallidos. La modificación C de composition.ts mantiene E4 tras iniciar un contrato y conserva resultados explícitos; no hay otros consumidores en src fuera de su definición y las pruebas de composición verifican sus rutas.

## Auditoría de reutilización y ejecución completa actual

Se reconstruyó la declaración anterior de D a partir de logs crudos y selecciones: **2847−206+207=2848**, con 156 archivos reutilizados y20 afectados, sin solapamiento de archivos ni ambigüedad en los títulos sustituidos. El inventario individual de resultados está en `prior-case-inventory.json.gz`; `prior-coverage-review.json` y `migration-loader-review.json` conservan la clausura independiente de 324 entradas y56 lectores dinámicos revisados. Los fixtures indirectos se contrastan también contra el manifiesto completo de copia, no solo contra status.inputs.

El único input de producto que cambió entre las capturas 20/22 de D fue66. Se identifican los loaders abiertos H0-013/014/016/017 y H5-012-coverage61/f02/reference-chain incluidos entre los 207 afectados, y límites históricos explícitos de H1. La igualdad de imports por sí sola no se usa como prueba suficiente del comportamiento SQL dinámico.

Para acreditar el resultado actual, esta auditoría **vuelve a ejecutar los 176 archivos de la selección completa sobre la identidad final**, sin reutilizar resultados anteriores como ejecuciones actuales. Las 14 fases son disjuntas y reproducen las bases históricas expresamente exigidas por ciertos tests; no se afirma que todos los casos carguen66. Se trabaja en réplica temporal con cada archivo verificado; los tests que regeneran evidencias antiguas lo hacen allí. Los originales del workspace permanecen exactos. Los 54 resultados impresos por un subreproductor histórico se excluyen del total y se cuenta únicamente su caso exterior.

**PostgreSQL completo actual: 2848/2848 PASS**, 0 FAIL/0 cancelados/0 skipped, 176 archivos en 14 fases disjuntas, captura 04. El multiconjunto de casos coincide exactamente con la consolidación anterior; 0 resultados reutilizados para este resultado actual. SHA y catálogo de casos en `current-coverage.json`/`current-case-inventory.json.gz`. Los 14 casos independientes nuevos se informan por separado: 9 PASS/5 FAIL; no se suman reejecuciones de reproductores o baterías solapadas. La réplica se ha eliminado y sus 3 salidas históricas regeneradas se conservan separadas de los originales.

| Control | Resultado actual |
|---|---|
| Reproductor temporal original |2/2 PASS, 02; incluido en la selección completa. |
| Regresiones originales F01/F02/F03 |25/25 PASS, 06; no se suman al completo. |
| Casos nuevos del auditor |9 PASS/5 FAIL de 14, capturas 14/18/15. |
| Unitarias |208/208 PASS, 07. |
| Health independiente |1/1 PASS, 08; separado. |
| Instalación congelada |PASS 09; lockfile y versiones conservados. |
| Typecheck final |PASS 19. |
| Lint/boundaries final |PASS 20. |
| Build final |PASS 21. |
| Dependencias de producción |0 vulnerabilidades, 13; versiones fijadas. |
| Preservación histórica |PASS; 37400 archivos del candidato intactos, detalle en verificaciones de preservación. |

Los fallos de instrumentos01/05/16 y del verificador inicial se conservan con su diagnóstico y versiones anteriores; no se atribuyen al producto. Los FAIL materiales03/14/17/18 no se corrigen ni se sustituyen. Los resultados de todas las capturas están separados por identidad de entradas y propósito.

## Dictamen, inventario y recomendación

**FAIL; rechazar aceptación/publicación de este candidato D.** Se requieren correctivos de pertenencia operación→ejecución en todas las ramas y coherencia del recorrido histórico con relaciones padre/hijo ya autorizadas. No se implementa ninguno. Conservar todos los reproductores y FAIL para la próxima verificación, con autorización expresa del director.

El conjunto exacto auditado es el inventario D indicado arriba, sin alteraciones. Los instrumentos y evidencias nuevos se inventarían separadamente en `tests/fixtures/h5-018-third/audit-inventory.json`, con rutas, tipos, tamaños, modos y hashes, y se sellan en `audit-seal.json`. La identidad del candidato y la del auditor no se confunden. `final-verification.json` contrasta las 21 capturas, sus entradas, los logs crudos y los conteos; `final-git.json` conserva las referencias y el estado local. El verificador de solo lectura `python3 scripts/verify-h5-018-third-seal.py` comprueba el sello nuevo y repite la preservación completa del candidato y sus antecedentes. La preservación final comprueba ausencia de modificaciones/eliminaciones de los 37400 archivos recibidos, índice vacío y base 0/0.

DM-PENDING-005 permanece abierto. No se han creado políticas de conservación, anonimización/eliminación ni parámetros operativos definitivos. Sin servicios reales ni acciones productivas. **H5-017/H5-018 IN PROGRESS. STOP; esperar autorización expresa del director.**
