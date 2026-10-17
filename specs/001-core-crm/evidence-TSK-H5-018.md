# TSK-H5-018 — informe independiente de H5-017

**Dictamen global: FAIL. No se recomienda aceptar el candidato.** Hay tres hallazgos materiales reproducibles: mezcla de tipos de contexto, asociación de operación canónica ajena y pérdida de E4 en la composición de servidor conservada. **No se ha corregido el producto.** H5-017 y H5-018 permanecen sin aceptación y no se declaran COMPLETED. Trabajo exclusivamente local/aislado, datos sintéticos, 2026-10-16.

## Identidad exacta y preflight

Tras `git fetch origin`, HEAD = main = origin/main = `9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia0/0 e índice vacío. Se verificaron individualmente ruta, bytes, modo y SHA256 del inventario H5-017; coincide su SHA256 `986cf1bc9a78d2bfc3383a8434a4c1f871a4107df556e3546497bd83276430bc`. Estado inicial exacto: **3 documentos modificados,174 archivos nuevos,0 eliminados**. Sin discrepancia material respecto al informe del implementador.

Se congelaron todos los **36.952 archivos** del candidato sin modificarlo:

| Artefacto | Identidad SHA256 |
|---|---|
| Contenido descomprimido de `candidate-manifest.json.gz` | `a3a5aeebf70e5b92ce18a087aafc4b40c40dbf703b3b66a40db37280ef3568ac` |
| Archivo `candidate-manifest.json.gz` | `2301d78fdc68e921baadde8d89c17c3a4ac184a6c821ecbcab9ffbd02ec2133a` |
| Copia de los177 paths cambiados `candidate-overlay.tar.gz` | `f9ab53d9965be6bb768884623b7cf02601ec8bef13568f29461621b2c77b23e0` |
| Migración64 auditada | `d0074d82800cd51805c63be61cdfab6e392750d147884b62294e8cb12e5e3063` |

Todos los artefactos están en `tests/fixtures/h5-018/`. La referencia reproducible es la base Git más el overlay; el manifiesto completo contiene rutas, tamaños, tipos, permisos y contenido por hash. No es un nuevo commit. El árbol temporal que menciona H5-017 se conserva como antecedente; esta auditoría identifica independientemente los bytes mediante su propio sello.

## Autoridad e independencia

Leídos Constitución, README, DECISIONS y documentos de estado, ficha H5-018, Tasks §§2.2/2.3/6/7, Plan §§4/7.1/8/10/11.2, SPEC §§14/19/20/21/24.4/25, DM-INV-047 y SM-FORB-27. Dependencia H4-024 revisada con su evidencia, expected y errata documental F06 conservada; H5-017 se trata como candidato no aceptado.

[Esperado independiente](expected-TSK-H5-018.md) escrito y sellado **antes de ejecutar los tests nuevos**, hash `d93d2046681681be23384a30e3a70df994319632270ef78f40166dd8a8c1e77c`. [Matriz](matrix-TSK-H5-018.md):13 filas exactas de Tasks §6,20 casos de evaluación A01–A20, protocolos y fuentes adicionales de ficha. No se copiaron las aserciones del implementador para producir los casos independientes. Se reutiliza preparación sintética anterior a H5-017 y el arranque aislado existente; las aserciones y oráculos nuevos son propios.

La independencia es metodológica y de instrumentos/expected; el trabajo se hizo en el mismo chat que la implementación, sin fingir un tercero humano ni una revisión por otro agente. La skill Supabase orientó el control de privilegios/RLS; no se accedió a un proyecto Supabase real.

## Hallazgos y recomendación

| ID | Clasificación / prioridad | Resultado demostrado | Recomendación concreta |
|---|---|---|---|
| F01 | Material, P1, OPEN | `contact/X` devuelve metadatos/enlace de una comunicación de `booking/X`, aunque B07 rechaza leer ese original desde contact. | Mantener tipo+UUID en las expansiones y validar contexto de cada referencia. |
| F02 | Material de integridad diagnóstica, P2, OPEN | Observación en A acepta `operationId` cuyo recibo canónico pertenece a B, sin marcar contradicción. | Validar operación conocida o distinguir expresamente alegación no verificada/contradictoria; conservar IDs de intentos aún no persistidos. |
| F03 | Material de integración heredada, P1, OPEN | Un efecto durable seguido de excepción en `composeServer` llega al diagnóstico como rejected/E5/unchanged. | Conectar la composición soportada para preservar incertidumbre antes de que otra frontera la pierda; mantener E5 de efecto conocido. |

[Defectos y reproductores](defects-TSK-H5-018.md) documentan investigar→reproducir→aislar→contrastar→repetir. F01/F02 se repiten en01/02; F03 en05/11. No se han aplicado correctivos ni modificado los tests originales. F03 ya existía en la frontera H0, pero queda sin resolver para la obligación examinada; no se atribuye como regresión causada por migración64. F02 no acredita pago/éxito de negocio: la falsedad afecta al vínculo de investigación. Incluso dejando F02 sujeto a revisión de severidad, F01 y F03 bloquean la aceptación.

## Resultados ejecutados, sin sumar solapamientos

| Grupo | Resultado | Evidencia y atribución |
|---|---|---|
| Nuevos tests independientes PostgreSQL/contratos | **32:29 PASS/3 FAIL** |01 (16:14/2),05 (9:8/1),04 (2/2),14 (5/5). |
| Repetición de contrapruebas | Mismos3 FAIL |02 repite16;11 repite9. No son25 casos nuevos. |
| Regresión original H5-017 repetida | **29/29 PASS** |10: tests funcionales y seguridad originales, bytes intactos. |
| Unitarias repetidas | **201/201 PASS** |08; no se suman a PostgreSQL. |
| Health independiente | **1/1 PASS** |09; local sintético, separado de suites. |
| Typecheck | PASS |06 y15;15 incluye los controles finales nuevos. |
| Lint/import boundaries | PASS |07. |
| Build | PASS |12; producto congelado idéntico. |
| Auditoría dependencias producción | PASS,0 vulnerabilidades conocidas |13, consulta nueva ejecutada. No es despliegue de Production. |
| V-MIG independiente | **2/2 PASS** |04;171 tablas previas,297 funciones y330 políticas comparadas; contenido, owners/ACL/config y RLS preservados. |
| Preservación candidato/histórica | PASS |`preservation.json`, verificador independiente, sello final. |

Los cinco controles de14 incluyen tres controles normativos y dos mediciones de F02/F03. El PASS de esas mediciones significa que se reprodujo/aisló la causa; **no convierte los tres tests negativos fallidos en PASS**. Los streams originales03 y16 conservan errores del auditor: consulta SQL ambigua/detección ACL y sustitución de imports al reconstruir evidencia. Solo se corrigieron esos instrumentos nuevos, con snapshots y retests04/17. No hubo problema de entorno nuevo ni prueba cancelada/skipped.

V-DOM **FAIL** por F02/F03. V-DAT **FAIL** por F01/F02. V-MIG **PASS**. Los resultados positivos parciales no elevan el dictamen global.

## Permisos, confidencialidad y efectos

Se ejecutaron rechazos con Auth falsificada, MFA ausente, interacción equivocada y actor inhabilitado, además de roles runtime/API/TTE y helpers SQL. RLS/FORCE RLS habilitadas, propietario sin superuser/BYPASSRLS; funciones acotadas, search_path fijado, sin EXECUTE de PUBLIC y roles API creados después sin privilegios. La regresión29 reejecuta además MAC/contexto F1/F2 alterado, replay transaccional, controles finales de autorización y consultas originales reautorizadas; se inspeccionó su implementación y no se presume independiente su origen.

Canarios sintéticos de tokens, secretos, credenciales, URL temporal, cuerpo, email e importe/coste se colocaron en evento canónico, externalKey, texto de excepción, issue prose y entrada denegada. Se comprobó que llegaron a la fuente autorizada donde correspondía y que no aparecen en páginas diagnósticas, sink, errores de adaptador ni persistencia mínima. También se inspeccionó el log PostgreSQL del caso de entrada denegada por valor, no solo ausencia de nombres de campo. **F01 sigue siendo exposición indebida de metadatos/enlaces entre tipos de contexto**; no se afirma confidencialidad integral ni filtración de cuerpos donde no se observó.

El accepted técnico deja idéntico el hash del contenido de133 tablas canónicas b0*: no crea pago, Acceptance, entrega ni cierre. Lectura de trabajo incompleto no cambia estados, libera reservas ni reintenta. Revisiones conservan versiones1/2 y dos aprobaciones; ejecución, responsable y ejecutor se distinguen. E1–E8 se prueban con estímulos de contratos y hechos persistidos, más combinaciones E4/E6. La matriz explicita que E7/E8 usan clasificación confiable aportada sobre candidatos/contradicciones; no hay un clasificador automático nuevo acreditado.

## Evidencia histórica reutilizada y preservación

No se repitió la suite integral: el candidato de producto no cambió y la nueva auditoría aporta contrapruebas distintas. `verify-h5-018-reuse.py` y `historical-reuse.json` verifican:

- **2788/2788** del run36 histórico:544/544 inputs idénticos actualmente, salida/counters, exit0 y ninguna entrada cambiada durante aquella ejecución. No contiene los32 casos nuevos.
- **104/104 sobre64** del run27 histórico:543 inputs idénticos y una versión preparatoria del antiguo verificador de integridad recuperada por su hash exacto. Los cuatro originales de regresión H4-024/H5-008/H5-009/H5-016 y sus copias temporales tienen hashes registrados; solo cambia import de harness, aserciones intactas. H5-012 también conserva cobertura en ese recorrido.
- Frozen install histórico32:548 entradas,543 idénticas y cinco recuperadas por hash exacto (verificador preparatorio más cuatro copias temporales); package/lock intactos y mismas versiones de Node/pnpm. No se presenta como instalación nueva.

Preservación comprobada independientemente: **36.775 archivos históricos**, **456 inputs sellados H5-016**,63 migraciones anteriores, fuentes aprobadas, expected y evidencias. La comparación de todo el candidato arroja36.952/36.952 sin cambios, incluidos los tres documentos de estado que ya formaban parte del candidato.

El FAIL original permanece **2762 PASS/25 FAIL**,2787 total. Su SQL previo tiene hash `6a31aacb744f37a98b2b6e79629474633769f20cca88175d88c00424cd28f2d1`, distinto de la migración64 corregida auditada. No se reescriben logs para convertirlo en PASS. La suite posterior2788 añade una prueba y acredita el candidato corregido, con sus propios inputs; la auditoría encuentra fallos adicionales no cubiertos por ella.

## Reproducción y archivos

Entorno comprobado: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 de Postgres.app. El runner usa el runtime Storage oficial fijado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, con backend local y credenciales sintéticas efímeras; todo destino de ensayo es loopback. No Auth Hosted, proveedor comercial, TOTP real ni datos de clientes.

Desde la raíz del repositorio, con `POSTGRES_H0_BIN` apuntando al binario PostgreSQL aislado, los cuatro ficheros nuevos son ejecutables mediante `node scripts/test-postgres.mjs` y sus nombres:

- `postgres-h5-018-audit.test.ts` — esperado actual14 PASS/2 FAIL.
- `postgres-h5-018-causes.test.ts` — esperado actual8 PASS/1 FAIL.
- `postgres-h5-018-migration.test.ts` —2 PASS.
- `postgres-h5-018-controls.test.ts` —5 PASS; dos controles de reproducción no aceptan F02/F03.

`capture-h5-018.py` registra comando, tiempos, entradas/hash, exit y streams gzip sin sobrescribir etiquetas. `verify-h5-018-preservation.py` verifica el candidato completo y preservación; `verify-h5-018-reuse.py` verifica la aplicabilidad histórica. `candidate-overlay.tar.gz` se aplica únicamente sobre una copia aparte de la base Git para reconstruir el candidato; no hace falta alterar este checkout. Los tests se distribuyen con este informe, junto a expected, matriz, defectos y capturas. El inventario final de auditoría identifica todos los archivos nuevos y sus hashes.

## Limitaciones y STOP

DM-PENDING-005 y pendientes de privacidad/retención siguen abiertos. No se inventaron conservación, anonimización, borrado, umbrales, SLA ni parámetros productivos. H6-015/H6-017, Auth real, Hosted y Production no acreditados. No se afirma que la batería sea prueba exhaustiva de ausencia de defectos.

Los documentos de coordinación dentro del candidato conservan sus bytes anteriores —incluido el texto histórico H5-018 NOT STARTED— para cumplir la congelación. **Este informe es la evidencia nueva de H5-018 ejecutada, IN PROGRESS y pendiente de correctivo/aceptación**, sin editar aquel snapshot ni declarar COMPLETED.

Recomendación: no aceptar H5-017; autorizar posteriormente un correctivo acotado de los hallazgos y repetir sus contrapruebas sobre un candidato nuevo, manteniendo este FAIL y su identidad. No se realizó commit, push, merge, despliegue ni modificación de producto. No se inició H5-019 ni H6. **STOP: se entrega el informe y se espera autorización del director del proyecto.**
