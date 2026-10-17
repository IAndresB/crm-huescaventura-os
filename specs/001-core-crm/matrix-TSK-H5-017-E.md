# Correctivo E — matriz normativa y contrapruebas

Fuentes y expected congelados antes de corregir; [mapa transversal](relations-TSK-H5-017-E.md) y [variantes derivadas](relations-TSK-H5-017-E-addendum.md). Las trece asignaciones literales de Tasks§6 están en `tests/fixtures/h5-017-e/normative-sources.json`. Las fuentes y las filas previas no se modifican.

Resultado final de todas las filas: **PASS interno local/aislado**, capturas22 y30 sobre la migración67 definitiva. Focal 63/63; completa 2884/2884, 184 archivos/14 fases disjuntas, 0 fallos/cancelados/omitidos y 0 resultados reutilizados. La cuarta auditoría está pendiente. El inventario de cada caso y su log se encuentran en `tests/fixtures/h5-017-e/current-case-inventory.json.gz`; el recuento está reconstruido desde stdout, excluyendo los 54 resultados históricos incrustados en el reproductor H2-008.

| Obligación | Comprobación del correctivo |
|---|---|
| SPEC-FR-HIST-001 | Originales temporales, parejas propietarias, padre/hijo y fila original inmutable; E-I/E-P/E-S. |
| SPEC-FR-ERR-001 | Originales A01–A09 y causas E1–E8, incertidumbre E4 y resultados explícitos preservados. |
| AC-070 | Regresiones H5-008 afectadas sobre67 y selección PostgreSQL completa; avisos, detención y fallo persistente sintéticos. |
| AC-072 | F03 original, efecto durable/excepción, sin retry/duplicación, E4 frente a E5. |
| AC-081 | Original temporal R01/R02, tercera T01–T07, nuevos E-I01–06/E-P01–02/E-S01–02. |
| SPEC-NFR-009 | Versiones, historia propietaria, identidad y observaciones intactas; upgrade/rollback/retry. |
| SPEC-NFR-010 | Peticiones y referencias localizables, paginación, minimización y fuentes restringidas. |
| SPEC-NFR-014 | Regresiones de resultados explícitos, incertidumbre y continuidad; no acredita H6-015. |
| DM-INV-047 | Identidad completa, procedencia, propiedad, historia y permisos independientes. |
| SM-FORB-27 | No inferir éxito ni retry de un log; operaciones/intentos/resultados distintos. |
| P12 | Canarios sintéticos, sin cuerpos, secretos o URL temporales; permisos efectivos y roles separados. |
| PLAN-B08 | Define/revise/claim/start/result, versión/ejecución, resultados propietarios y evidencia de contexto. |
| PT-11 | F1/F2, MFA, actor/ámbito/interacción, acceso directo, revalidación final y RLS/FORCE; sin acreditar H6-017. |

| Conjunto | Casos únicos | Interpretación |
|---|---:|---|
| Reproductores tercera auditoría | 12 | 10 temporales/identidad y 2 padre/hijo; originales intactos. |
| Original temporal anterior | 2 | R01/R02; originales intactos. |
| Originales F01/F02/F03 | 25 | Dos fuentes protegidas, ejecutadas directamente con fixture67. |
| Nuevos E-I | 8 | 7 casos de identidad/upgrade y 1 colisión de propietario B07/B08. |
| Nuevos E-P | 10 | 8 recorridos/versiones + 2 negativos de evidencia/tipo. |
| Nuevos E-S | 4 | 1 fuente vigente + 3 observaciones con referencias opcionales restringidas. |
| V-MIG E | 2 | Base66 poblada y clúster vacío, catálogos, datos, ACL/RLS, rollback/recuperación/retry. |

Los conjuntos focales no se suman a la completa cuando ya están incluidos. Las repeticiones y la propuesta intermedia se registran con capturas propias; ningún resultado histórico se presenta como una ejecución final actual. El resultado definitivo por conjunto se encuentra en el informe y `current-coverage.json`.

V-DOM PASS: casos contrastados con las fuentes aprobadas. V-DAT PASS: PostgreSQL/Auth/Storage aislados, contratos ordinarios para datos y fixtures adversariales identificados para permisos. V-MIG PASS: E-M01/E-M02, tres cuerpos previstos y cero objetos/privilegios nuevos; instalación limpia, upgrade poblado, aborto, recuperación y reaplicación. V-NEG PASS: asociaciones falsas y acceso no autorizado rechazados/filtrados, con controles positivos y filas originales intactas. V-EVI PASS: 28 capturas reconstruidas, entradas/hash, stdout/stderr, FAIL y fases disjuntas preservados; sello final verificable con `scripts/verify-h5-017-e-seal.py`.

H5-017/H5-018 IN PROGRESS; DM-PENDING-005 abierto. Parámetros operativos, conservación/eliminación, Hosted/Production, H5-019 y H6 fuera del alcance.
