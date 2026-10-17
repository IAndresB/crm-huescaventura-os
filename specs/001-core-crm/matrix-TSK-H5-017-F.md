# H5-017/H5-018 — Correctivo F — matriz de contraste

Fecha: 2026-10-17. Oráculo: fuentes aprobadas leídas directamente y [expected F congelado](expected-TSK-H5-017-F.md), anterior al cambio de producto. Las 13 asignaciones literales de Tasks §6, con líneas y hashes de fuentes, se conservan en `tests/fixtures/h5-017-f/normative-sources.json`. Los tests de las auditorías son objetos de contraste intactos; no sustituyen la norma.

| Asignación normativa | Comprobación actual | Evidencia y límite |
|---|---|---|
| SPEC-FR-HIST-001 | Q02/Q03/Q04; F-P01/P02; F-R01/R03/R05; originales R01/R02/T01/T07 | `10-all-focal`: versiones y raíces originales, replay exacto, fila inmutable, ninguna duplicación. PASS local. |
| SPEC-FR-ERR-001 | A01–A09 originales; Q05; F-R01 | `10-all-focal`: E1–E8 conservados; E4 no se convierte en rechazo ni éxito. PASS local. |
| AC-070 | A13, Q05 y regresión B08 | `10-all-focal`: fallo persistente y canal simulado indisponible; stop/withdraw impiden efecto. PASS local. |
| AC-072 | A04 de contrato, efecto durable y servidor compuesto | `10-all-focal`: excepción posterior al efecto conserva E4, una invocación e historia. PASS local. |
| AC-081 | Q01–Q04; F-P01/P04/P05; F-R01/R03/R04/R05 | `10-all-focal`: referencias tipadas, procedencia por versión, páginas 1/2, consulta histórica autorizada. PASS local. |
| SPEC-NFR-009 | F-P01/P02; F-R01; F-MIG poblada | `10-all-focal`: correlación, actor, contexto, historia y datos exactos conservados. PASS local. |
| SPEC-NFR-010 | Q02; A10; F-P03/P04/P05 | `10-all-focal`: referencias mínimas, tarea ajena excluida y consulta explícita marcada con contexto original. PASS local. |
| SPEC-NFR-014 | A01–A09; F-R01/R05 | `10-all-focal`: repetición sin efectos, incertidumbre y límites temporales. PASS local; no acredita H6-015. |
| DM-INV-047 | Q02/Q04; T01/T03/T04/T05; F-P01/P02; F-R03 | `10-all-focal`: dueño canónico, versión, contexto y original inmutable. PASS local. |
| SM-FORB-27 | Q05; A04; A16; F-R01/R05 | `10-all-focal`: aprobación retirada no autoriza ejecución; ninguna repetición indebida. PASS local. |
| P12 | A14/A15; F-P03/P04; F-MIG | `10-all-focal`: canarios y cuerpos opacos excluidos, referencias mínimas y privilegios efectivos. PASS local; no acredita H6-017. |
| PLAN-B08 | Q01/Q02/Q05; T01/T04; F-P01/P02/P04/P05 | `10-all-focal`: identidad y revisión ordinarias; no se cambia el ciclo de vida del trabajo. PASS local. |
| PT-11 | Q04 revokeOne/revokeAll; A15; F-R02/R04; F-MIG limpia | `10-all-focal`: sesión anterior denegada, nueva sesión legítima, F1/F2, 12/12 denegaciones directas. PASS local; auditoría integral futura pendiente. |

## Protocolos aplicables

| Protocolo | Verificación y resultado |
|---|---|
| V-DOM | PASS focal: relación petición/observación/operación/ejecución/versión/contexto acreditada por fuentes canónicas; consulta histórica distinguida de nueva escritura. |
| V-DAT | PASS focal: replay no altera filas, historia ni operaciones; identidad conflictiva y referencias incompatibles denegadas; catálogo y datos anteriores conservados. |
| V-NEG | PASS focal: originales Q02/Q04 y negativos F-R01–R05, F-P03–P05, roles y sesiones. |
| V-AT | PASS focal: una primera fila bajo concurrencia; seis replays y siete conflictos por cada modo de referencias; revisión mientras se espera el bloqueo de identidad. |
| V-MIG | PASS: dos casos propios sobre 68, instalación limpia y upgrade 67 poblada; rollback abortado, restauración de tres cuerpos y reaplicación; 175 tablas, 487 relaciones, 305 funciones, 332 políticas y 1.037 constraints comparados. |
| V-EVI | PASS:23 capturas reconstruidas, expected y FAIL/versiones anteriores conservados; completo25 y postcheck38.070 archivos por árbol sin discrepancias inesperadas. Inventario/sello y verificación posterior según el informe A–Q. |

## Contabilidad y ejecución

La captura `02-before` reproduce los 17 casos originales de cuarta auditoría sobre 67: **10 PASS/7 FAIL**. Los FAIL son cuatro de procedencia (F01) y tres de replay (F02). La captura `10-all-focal` ejecuta **78/78 PASS** sobre el código final: 15 funcionales originales de cuarta auditoría + 44 regresiones anteriores + 19 casos propios F. Los dos originales Q06 siguen anclados a la migración 67 y están en la selección completa; los dos F-MIG propios validan 68.

La selección completa contiene 192 archivos: 2.884 casos anteriores + 17 de cuarta auditoría + 19 propios F = **2.920 casos seleccionados**. La ejecución 14 conserva 2.916 PASS/4 FAIL: dos precondiciones históricas E-I05 mal cargadas en 67 y el subcaso temporal H4-023 junto con su padre. V2 conserva el SQL exacto, prepara E-I05 en 66 y aísla H4 en una fase propia: 15 fases disjuntas. El resultado final es **2.920/2.920 PASS, exit0**, acreditado en `25-complete.status.json`, `25-phases.json`, `current-coverage.json` y el informe A–Q; postcheck completo y satisfactorio. Los 78 focales y retests 21/22 solapan esa selección y no se suman. Unitarias 208/208 y health 1/1 se registran aparte. No se reutilizan PASS de tareas anteriores como resultados actuales. Los 54 nombres históricos incrustados en un subprocess de H2 se excluyen del conteo actual.

El hook `tests/support/h5-017-f-hook.mjs` cambia únicamente la resolución exacta de fixtures de los casos funcionales afectados a una base 68, sin editar aserciones ni archivos originales. Su procedencia y hashes están en `hook-provenance.json`; el resto de fixtures y pruebas históricas de migración conserva sus versiones correspondientes. El runner completo verifica bytes de la copia y del workspace, y conserva las salidas históricas que se regeneran exclusivamente en la réplica.

El hook V2 conserva ese mapa y agrega la excepción exacta de E-I05 mediante `h5-017-f-e-legacy.ts`: en el archivo mixto E identidad, la fábrica por defecto usa68 y `previous=true` usa la fábrica original E con previo66. Su aplicación de 67 no cambia. Los dos F-MIG propios cubren la actualización posterior 67→68. `candidate-inputs-final-v2.json` y `complete-instrument-correction.json` fijan los hashes y el motivo; ningún FAIL previo se elimina.

La ejecución24 completó 2.920/2.920 PASS, pero su postcheck de réplica falló con ENOENT y exit1 global. Su informe parcial de preservación no acredita el cierre. El original del workspace y37.874 archivos recibidos se verificaron de nuevo íntegros. El runnerV3 conserva el mismo mapa y selección, espera a todos los verificadores y retiene una réplica fallida; la ejecución25 acredita2.920/2.920 PASS y postcheck completo de38.070 archivos en cada árbol, exit0 y cero errores. No se cambia producto ni se amplía la allowlist. `postcheck-24-incident.json` conserva la limitación de24.

Q04 prueba revocación real de B01. F-R04/F-P05 y variantes E que retiran enlaces mediante SQL se identifican como perturbaciones privilegiadas de fuentes sintéticas. No existe ni se inventa un flujo ordinario B07 unlink. F-R02 respeta D025 y la cardinalidad vigente de administrador: una segunda vinculación de actor es denegada; no se fabrica un segundo administrador autorizado.
