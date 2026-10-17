# TSK-H5-018 — Sexta auditoría independiente — candidato G

## A. Dictamen

**PASS técnico independiente en local/aislado**, con datos sintéticos. Se recomienda al director aceptar exactamente el candidato G identificado en B y P. No se ejecuta la aceptación ni se autoriza publicación. Defectos materiales pendientes: 0. H5-017/H5-018 permanecen IN PROGRESS.

Resultados reconstruidos de ejecuciones nuevas, no del PASS del implementador. Expected propio congelado antes de ejecutar; contrapruebas propias, comparación original/G y verificación de cada input. Runners de aislamiento derivados de los recibidos, revisados y declarados; independencia técnica de procedimiento, sin atribuir una firma humana externa.

## B. Identidad exacta

| Elemento | Identidad acreditada |
| --- | --- |
| HEAD/main/origin/main | `9649a2773530ea8a43237b4e1f2034f80e34136f` |
| Divergencia / índice | 0/0; vacío, comprobado tras fetch inicial y final |
| Inventario G, contenido descomprimido SHA-256 | `fba4398a24834213c2fe08d2033663c08f5b26488ddfc49c5fd205a265d4f53b` |
| Inventario G, gzip SHA-256 | `90bac4abca517396b3d9182f06155553a0adf0c54f9bba0a56213fcf849ae29b` |
| Sello G SHA-256 | `6774c3335650a5adfbf32228a220cc9051b4def0715167866ff94a7893af4df6` |
| Recibidos F+quinta | 38.271 = 38.118 F + 153 de quinta |
| Altas G | 117 |
| Candidato G completo | 38.388 archivos; 0 modificados/eliminados por sexta |

Se recalcularon rutas, SHA, tamaños, tipos y modos. El inventario G excluye sus dos metadatos finales según su contrato; se verificaron e incorporaron al snapshot recibido de 38.388. Las cuatro modificaciones versionadas recibidas (`NEXT-STEPS`, `PROJECT-STATUS`, `tasks`, `composition`) conservan sus bytes exactos; esta auditoría añade únicamente su namespace. Ver `preflight.json`, `received-inventory.json.gz`, `final-git-check.json` y preservación final.

## C. Matriz normativa independiente

Ver [matriz](matrix-TSK-H5-018-sixth.md) y [expected congelado](expected-TSK-H5-018-sixth.md). Consulta directa: tasks §2.2 y fichas 017/018; Plan §§7.1, 8, 11.2 y B01/B07/B08/B10, C01/C04; SM §§2.4, 12.2, 18; BR-DOC/BR-HIST/BR-SEC; SPEC-FR-IDEMP/CONC/ERR/SEC; AC-070/072/081. Hashes de fuentes en `normative-sources.json`. Ningún resultado del implementador define el oráculo.

## D. Auditoría del fixture G

Original protegido SHA `dd2b851e5d2888f60f249af0bc3f9000edc160d88da58ffcd200bc2deb6ee15a`, idéntico a la base Git. Adaptación SHA `535dc0eced793ea71981d363162f03c1ecc9e197f2ec7bd1f031ef5805a359ae`.

Diff independiente: 1 hunk,11 líneas añadidas/3 retiradas; cuatro exports conservados. Solo cambia la procedencia del momento de evidencia de cancelación y de sus pruebas auxiliares. Acto fijo 17 de octubre, 10: 00Z, términos, fechas civiles, valores, hashes de claims, aserciones y plazos originales permanecen. El hook resuelve un módulo exacto y conserva tres excepciones de padre; no transforma código ni intercepta relojes. Otras familias de proof conservan la función original. `fixture-review.json`, diff y [análisis](analysis-TSK-H5-018-sixth.md) detallan consumidores y límites.

## E. Contrapruebas temporales

14 casos propios PASS en captura 05; 13 de ellos también pasaron en 02 antes del ajuste de tipos. Cubren A–N: antes/igual/después, fechas 2025/2026/2027, dos momentos reales, repetición, validez, historia/contexto ajeno, certeza, contradicción, ausencia de efectos e historia intacta. Evidencia principal +1 ms/+1 día sigue E3; auxiliar +1 ms también E3. Se verifican snapshots de 7 tablas y evidencia original exacta.

Límite explícito: auxiliares G por defecto pertenecen al acto fijo. Acto 13 de octubre con auxiliar 17 de octubre se rechaza dos veces; con evidencia auxiliar explícita 13 de octubre se acepta y hace replay conservando la anterior. No se atribuye a G una adaptación universal de todos los relojes. V09 quinta conserva su precondición de ejecución después del acto fijo.

## F. Los 303 fallos anteriores

Extracción propia del log original quinta 08: 295 rechazos de evidencia,7 aserciones y 1 bloqueo. Cada uno de los 303 tiene correspondencia única en la nueva completa y resultado PASS, con ruta original, hash de fuente intacta, ID y log actual en `recovered-303.json`. No se vuelve a declarar como actual la salida del implementador. No se ha reejecutado toda la batería con el fixture defectuoso: la reproducción diferencial actual usa 116 casos focales, incluidos los ocho especiales.

## G. Ocho casos especiales

Todos se reproducen como FAIL con original y PASS con G; fuente, aserciones y barreras intactas. Detalle por caso en `eight-causal-reproduction.json`.

| Caso original | Observado con fixture original | Observado con G |
| --- | --- | --- |
| C27 determinaciones 0,1 | 2 E3,0 éxitos | 1 éxito y 1 REVISION_CONFLICT: E2 |
| C27 determinaciones 1,0 | 2 E3,0 éxitos | 1 éxito y 1 REVISION_CONFLICT: E2 |
| C27 replay 0,1 | 2 E3 | 2 respuestas válidas, exactamente 1 replay y 1 revisión |
| C27 replay 1,0 | 2 E3 | 2 respuestas válidas, exactamente 1 replay y 1 revisión |
| C28 determinación/cambio de fecha 0,1 | E3 antes de decisión; aserción original falla | Se alcanza interleaving; decisiones/historia/referencia resultante originales PASS |
| C27 porciones solapadas 0,1 | 2 E3 | 1 éxito y 1 PORTION_CONFLICT: E2 |
| C27 porciones solapadas 1,0 | 2 E3 | 1 éxito y 1 PORTION_CONFLICT: E2 |
| H5-016 A03 cancelación tras lectura de cierre | Writer E3 antes del insert/trigger; no segunda espera | Writer válido, dos esperas reales, cierre rechazado por comercial pendiente y sin historia de cierre indebida |

Captura 21 original: 40 PASS/76 FAIL sobre 116; conserva fallo conocido del instrumento heredado. Captura 22 G: 116/116 PASS. No son casos adicionales a 2.945.

## H. Concurrencia y bloqueo

Los siete casos registran solapamiento PG real antes/después. Para A03, la guarda de evidencia ocurre antes de insertar la determinación; el trigger `closure_writer` alcanza `booking_preparation_lock` solo al superar dicha guarda. La captura G muestra dos locks advisory no concedidos y blockers reales: PID 57879 espera a 58090; 58090 espera a 58088. El escritor finaliza y el cierre obtiene `CLOSURE_DIMENSION_PENDING:E3:commercial`, como exige la aserción original. Plazo `Date.now()+15000` intacto; ningún control de concurrencia desactivado. La misma prueba pasa también en la completa 20.

## I. Regresión del producto F

Captura 23: 71/71 PASS con los 11 archivos originales protegidos y hook F/G recibido. Cubren F01 aislamiento, F02 referencias, F03 E4; temporal de auditoría 2; operación/ejecución y padres de 3; procedenciaA→B→A y replay histórico de 4, más variantes F. Nombres cotejados con focal protegido y completa: 71/71 presentes. `protected-reproducers-verification.json` conserva el contraste. Esta repetición no aumenta 2.945 ni reescribe los cinco FAIL.

## J. V-DOM/V-DAT/V-MIG

V-DOM: matriz temporal con importes exactos normativos y 208 unitarias, incluido E1–E8. V-DAT: PostgreSQL real, identidades técnicas separadas, roles ordinarios, negativas de contexto/autoridad y 20 intentos directos propios denegados.

V-MIG propia 03: 2/2 PASS. Cadena limpia 68 y 67 poblada → 68; 175 tablas,305 funciones,487 relaciones,332 políticas,565 dependencias. Solo cambian los tres cuerpos previstos de 68. Hashes por tabla, relaciones, ACL, propietarios, roles, membresías, políticas y dependencias quedan iguales. Fallo inyectado revierte; restauración de cuerpos previos y reaplicación conservan datos. Owners sin LOGIN/SUPER/BYPASS, search_path protegido, RLS/FORCE.

V-MIG F y quinta reejecutadas dentro 20 también PASS; advisors actual devuelve lista vacía. V-MIG histórica 66 adicional 12: 2/2 PASS; la actividad humana legítima de lectura solo cambia `last_human_activity_at`, separada de las comparaciones DDL exactas. No se presenta66 como 68. Observaciones en `material-observations.json`.

## K. PostgreSQL completo

**2.945/2.945 PASS**,196 archivos,15 fases disjuntas; 0 FAIL,0 cancelados,0 omitidos. Ejecución nueva 20,692,68 segundos (11 min 33 s), incluidos captura y postcheck. 196 = 192 F + 3 de quinta + 1 de G; 2.945 = 2.920 + 15 + 10. Casos propios y repeticiones se informan por separado.

La selección conserva 27 exclusiones heredadas explicadas,0 nuevas de G: 24 predecesores con derivada; 2 instrumentos con prohibición histórica excesiva aclarada; 1 V-MIG66 reejecutada adicionalmente. El parser excluye 57 casos del subproceso H2-008 de producto antiguo (55 PASS/2 FAIL intencionados); el padre actual PASS exige esa reproducción.

Réplica: 38.396 inputs copiados y verificados, todos rechecados en el workspace y réplica; 0 errores, postcheck completo. Tres outputs históricos se regeneraron únicamente en la réplica, conservados aparte. Solo después se retiró. `20-phases.json`, selección, copied-inputs,30 logs de fase y preservation acreditan conteos e identidad. Inventario de casos actual SHA de contenido: `0246c4b74e44859d6edaab21ed7a6ab0f7eb660c01107941f3b0d5d2cabed864`.

## L. Unitarias y health

208/208 unitarias y 1/1 health independiente PASS. Instalación congelada (`--frozen-lockfile --ignore-scripts`) ya actualizada; typecheck, lint, build PASS. Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11. Los casos no se suman a PostgreSQL. Capturas 07/08/13/06/09/11 y `environment.json`.

## M. Seguridad

0 vulnerabilidades de dependencias de producción en la captura 10. Las 20 denegaciones directas propias, junto a permisos/canarios de pruebas protegidas; observaciones e historia no mutadas por intentos denegados. Producto 106 archivos y 68 migraciones permanecen exactos. No se cambian objetos ni permisos mediante G. Toda información de ensayo es sintética y los servicios funcionales son locales/loopback; no se usan servicios de negocio reales. No se acredita Hosted/Production ni capacidad externa real.

## N. Preservación histórica

38.388 recibidos exactos; 38.271 anteriores a G y 117 altas G diferenciados. Cinco auditorías FAIL, inventarios/sellos, expected y reproducciones anteriores conservados. H5-016: 456 inputs; 455 exactos y transición autorizada única de composition, sin nuevo cambio. Preimágenes históricas de los cuatro archivos ya modificados siguen recuperables. La sexta solo crea archivos en su namespace.

## O. Defectos pendientes

0 defectos materiales abiertos. [Registro](defects-TSK-H5-018-sixth.md): dos errores propios de instrumentación resueltos y preservados (certainty inválida en 01; unión TypeScript en 04), límites auxiliares y de alcance explícitos. No se corrigió producto F, adaptación G, migración, aserción ni expected recibido. Las versiones propias anteriores están conservadas con su hash y se resuelven en la verificación de inputs.

## P. Recomendación de aceptación

Recomiendo aceptar técnicamente, dentro del alcance local/aislado, **el conjunto exacto G de 38.388 archivos identificado por los hashes de B**: producto F intacto + instrumentación G y su evidencia recibida. Esta sexta auditoría lo acompaña como evidencia adicional, no se integra silenciosamente en su inventario.

La decisión efectiva corresponde al director. Publicación requiere autorización expresa posterior; no se hace commit, push, merge ni deploy. DM-PENDING-005 permanece OPEN; H5-017/H5-018 IN PROGRESS. No iniciar H5-019/H6 ni acreditar H6-015/H6-017. No fijar políticas o parámetros pendientes. Los cinco dictámenes históricos mantienen FAIL; la recomendación se refiere solo a G.

## Q. Inventario, sello y reproducción

Inventario de altas sexta: `tests/fixtures/h5-018-sixth/audit-inventory.json`. Sello y recuento final: `audit-seal.json`. El inventario excluye únicamente sus dos metadatos finales para evitar autorreferencia; el sello vincula su SHA, el inventario y sello G suministrados, cobertura, conteos y STOP. Sus hashes finales se entregan después de la lectura final independiente de todos los archivos.

Comandos principales ejecutados desde la raíz:

```text
python3 scripts/capture-h5-018-sixth.py 20-complete node scripts/test-h5-018-sixth-complete.mjs 20
python3 scripts/capture-h5-018-sixth.py 05-temporal-repeat node scripts/test-postgres.mjs postgres-h5-018-sixth-temporal.test.ts postgres-h5-018-sixth-auxiliary.test.ts
python3 scripts/capture-h5-018-sixth.py 03-migration node scripts/test-postgres.mjs postgres-h5-018-sixth-migration.test.ts
python3 scripts/analyze-h5-018-sixth-races.py
python3 scripts/verify-h5-018-sixth-results.py
python3 scripts/verify-h5-018-sixth-preservation.py
python3 scripts/seal-h5-018-sixth.py --verify
```

Todos los comandos completos, entorno, hashes de inputs, stdout/stderr y exit están en sus capturas; `coverage.json` los reúne. La captura es append-only y rechaza reutilizar etiquetas. Una reproducción futura deberá crear una copia y namespace nuevos, conservando este sello y sus salidas. No normalizar logs históricos ni regenerarlos sobre el workspace protegido.

**STOP. Esperar autorización expresa del director del proyecto.**
