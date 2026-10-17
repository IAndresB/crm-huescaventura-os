# H5-018 — tercera auditoría: matriz independiente

**Dictamen FAIL; H5-018-3-F01 y H5-018-3-F02 OPEN.** Oráculo congelado: [expected](expected-TSK-H5-018-third.md). Las 13 filas literales asignadas por Tasks§6 y hashes de fuentes están en `tests/fixtures/h5-018-third/normative-sources.json`. Esta matriz no altera Tasks ni acredita obligaciones integradas H6.

| Fila normativa asignada | Evidencia independiente / contraprueba | Resultado local |
|---|---|---|
| SPEC-FR-HIST-001 | Original R01/R02; T01 A→B→C→A; T03/T04 propietarios; T07 relaciones padre/hijo; conservación de originales | FAIL: referencias contradictorias y recorrido histórico perdido; hechos originales conservados. |
| SPEC-FR-ERR-001 | Originales A01–A09, E1–E8 mediante contratos, composición pública tras efecto durable; unitarias | PASS de clasificación/efecto/continuidad, sin acreditar localización perdida de F02 temporal. |
| AC-070 | Regresión sobre 66 de H5-008, diagnóstico de fallos persistentes, avisos sin recursión ni email; selección completa | PASS local/sintético; umbrales definitivos y proveedor externo pendientes. |
| AC-072 | Reproductor F03 intacto, E4 tras excepción posterior al efecto; E5 antes de contrato, resultados explícitos y replay | PASS; sin retry ni doble efecto. |
| AC-081 | R01/R02: 2/2; T01/T02/T05/T06; negativos T03/T04 y T07 | FAIL: F01 y F02 nuevos impiden recomendación. |
| SPEC-NFR-009 | Historia y observaciones inmutables, actor/versión/antes-después; M01 upgrade/rollback | FAIL de reconstrucción diagnóstica por asociaciones/ruta; persistencia histórica PASS. |
| SPEC-NFR-010 | Referencias/minimización/paginación y recuperación tras revisiones | FAIL en recorridos canónicos incompatibles y petición desde padre. |
| SPEC-NFR-014 | E1–E8, callbacks con efecto durable y excepción, partes independientes, explícitos/replay | PASS del alcance de fallos probado; sin afirmar H6-015. |
| DM-INV-047 | B07/B08 propietario, T03/T04, T07; prohibición de ampliar permisos por timeline | FAIL de vínculos y reconstrucción; no filtración nueva demostrada en controles de acceso. |
| SM-FORB-27 | F03, work uncertain, ausencia de retry/duplicado, log técnico separado de negocio | PASS de negativos ejecutados; un diagnóstico no acredita pago/Acceptance/entrega. |
| P12 | Canarios sintéticos, validación de entradas, logs, roles API y helpers privados | PASS local; sin secretos/URLs/cuerpos reales. |
| PLAN-B08 | Trabajo versionado, aprobaciones nuevas, historia original, temporales directos y de padre, referencia de ejecución | FAIL en la integración diagnóstica identificada; ejecución/HA de los casos conservada. |
| PT-11 | Seguridad F1/F2, MFA, interacciones, actor/alcance, acceso directo, RLS/FORCE, revalidación final | PASS de controles asignados y ejecutados; no acredita PT-11 global ni H6-017. |

## Casos nuevos del auditor

| Caso | Variante / resultado esperado | Observado y capturas |
|---|---|---|
| T01-known | Petición canónica con ejecución; A→B→C→A, petición posterior en B, historia inmutable | PASS 03/14. |
| T01-operation-only | Misma secuencia con operación y sin ejecución opcional | PASS 03/14. |
| T01-unknown | Intento con operación desconocida conserva su incertidumbre y ubicación original | PASS 03/14. |
| T01-no-operation | Petición sin operación opcional, con ejecución; secuencia y observación conservadas | PASS 03/14. |
| T02 | Igual UUID, tipo Contact frente a Booking; petición histórica no cruza tipo | PASS 03/14. |
| T03 | Operación inicialmente desconocida se confirma para otra ejecución; no canonizar asociación falsa | FAIL 03/14, F01. |
| T04-distinct | Operación de A y ejecución distinta de B en el mismo contexto; rechazar/no presentar asociación canónica | FAIL 03/14, F01. |
| T04-alias | UUID de operación A igual al de ejecución B; identidad tipada y propietario real | FAIL 03/14, F01. |
| T05 | La colisión anterior tras revisar A→B no autoriza recuperación con ejecución incorrecta | PASS 03/14; subcaso histórico D10 confirmado. |
| T06 | Ejecución inexistente o de otro expediente; rechazo sin observación nueva | PASS 03/14. |
| T07-service | Trabajo del servicio investigado legítimamente desde Booking; revisión conserva petición | FAIL 17/18, F02. El servicio no es raíz directa del diagnóstico; se comprueban padre, destino y lector B08. |
| T07-booking | Trabajo de Booking investigado desde Opportunity; revisión conserva petición | FAIL 16/17/18, F02. Historia por operación sigue en Booking; petición desaparece en todos los contextos soportados probados. |
| M01 | Upgrade65 poblado→66, catálogo/filas/ACL iguales excepto cuerpo declarado, DDL abortado/rollback/recuperación/reintento | PASS 15; anterior 05 conserva fallo del instrumento por actividad humana legítima posterior a lecturas. |
| M02 | Clúster vacío, cadena66, roles API creados después, intentos directos reales y dueño sin bypass | PASS 05/15. |

**14 casos nuevos únicos: 9 PASS/5 FAIL**, tomando14 (temporal), 18 (padres) y15 (migración). Repeticiones03/17/05 no se añaden al total. Las cinco variantes FAIL pertenecen a dos defectos materiales. Original R01/R02 y25 regresiones originales se informan aparte y están incluidos en la selección completa, sin sumarlos de nuevo.

## Protocolos y auditoría estructural

- **V-DOM:** fuente normativa previa; E1–E8 y transiciones sintéticas verificadas. FAIL de integridad/localización en T03/T04/T07.
- **V-DAT:** PostgreSQL17.11 real, Auth/Storage locales sintéticos; contratos ordinarios para reproducción, sin insertar asociaciones por rol de migración. Controles de permisos y confidencialidad PASS; comportamiento de diagnóstico FAIL.
- **V-MIG:** M01/M02 PASS independiente.175 tablas, 487 relaciones de catálogo, 305 funciones, 332 políticas y1037 restricciones; 0 objetos nuevos. Solo `diagnostic_nodes` cambia cuerpo. Igualdad de datos alrededor de cada DDL, ACL, RLS/FORCE, propiedades de función y derechos efectivos.
- **V-NEG:** intentos explícitos de referencias incorrectas, sin permiso/alcance/interacción válidos, SQL directo y referencias inexistentes. Los negativos T03/T04 son FAIL; acceso directo/roles/aislamiento ejecutados son PASS.
- **V-EVI:** ejecución, entradas/hash, stdout/stderr, conteos y fuentes precedentes conservados. Los instrumentos actuales no sobrescriben logs, expected o sellos protegidos.

## Cobertura y lectura de los totales

`prior-coverage-review.json` y `prior-case-inventory.json.gz` reconstruyen la declaración D desde logs: 2847 previos−206 afectados sustituidos+207 actuales=2848; 156 archivos reutilizados y20 afectados, sin solapamiento. La clausura independiente de importaciones contiene324 entradas byte-idénticas; los lectores dinámicos de migraciones se enumeran aparte y no se deducen únicamente de imports.54 resultados impresos por un subreproductor histórico se excluyen: solo su caso exterior cuenta.

La auditoría ejecuta de nuevo la selección completa de 176 archivos sobre el candidato final en una réplica con bytes verificados. Los casos que declaran bases históricas mantienen esas bases; no se afirma que todos carguen66. Resultado definitivo y conteo sin solapamientos en [informe](evidence-TSK-H5-018-third.md) y `current-coverage.json`.

Los límites de datos reales, privacidad, parámetros operativos, H5-019/H6, Hosted/Production y aceptación/publicación permanecen vigentes. DM-PENDING-005 abierto; H5-017/H5-018 IN PROGRESS.
