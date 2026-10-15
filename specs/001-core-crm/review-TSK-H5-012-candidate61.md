# TSK-H5-012 — Verificación consolidada del candidato61

2026-10-15. **PASS — READY FOR REVIEW**, exclusivamente local/aislado. No COMPLETED ni cierre formal. Este informe incorpora F03 y subsana C03/C05/C06; el dictamen FAIL anterior permanece como evidencia histórica y no se reescribe.

## Resultado y alcance

Los 41 casos independientes pasan, con sus aserciones originales intactas y suplementos persistidos para las tres lagunas. Las 34 filas se distinguen en 28 verificaciones propias y seis límites locales. [Matriz individual](matrix-TSK-H5-012-candidate61.md). [Correctivo F03](corrective-H5-012-F03.md).

F01/F02 permanecen íntegros y vuelven a pasar sobre el candidato61. La fecha operacional, cancelación de la noche, estado de servicio/Booking, snapshots aceptados, revisiones previas y trazabilidad están representados sin introducir una segunda fuente. No se modificaron las reglas económicas, D020 ni contratos aprobados.

## Pruebas ejecutadas sobre el candidato final

| Control | Resultado |
|---|---|
| 41 casos + complementos focales | 57/57 PASS: 41 casos, F01 3, F02 2, F03 4, C03/C05/C06 3, F01/V-MIG 2, seguridad1, cadena H04/S11 1 |
| Regresión PostgreSQL completa | 2600/2600 PASS; cero FAIL, skipped o cancelled |
| Unitarias | 197/197 PASS |
| Typecheck | PASS final; FAIL preliminar del verificador conservado |
| Lint / fronteras de imports | PASS |
| Build | PASS |
| Health independiente | 1/1 PASS |
| Dependencias de producción | 0 vulnerabilidades reportadas |
| V-MIG60→61 | PASS: fallo/rollback/retry/reaplicación; datos y privilegios intactos |
| Seguridad y advisors oficiales | PASS, results=[]; SQL directo/autoridad falsa denegados |
| Normativa y oráculo | 10 hashes intactos; 34 filas; 41 aserciones originales idénticas |
| Preservación | 36.408 archivos previos idénticos en bytes y modo; expected67.346 bytes intacto |

La regresión incluye H0–H5 y pruebas históricas con sus propios setups. Los 41 casos actuales y las pruebas focales se identifican inequívocamente en `final-focal.log` sobre61; no se confunden sus títulos repetidos en la regresión con casos adicionales. Las reproducciones intencionales de defectos históricos que imprimen FAIL dentro de un metatest se conservan: cuenta el resultado de su comprobación y el resumen nativo completo. Todos los resultados finales usan el mismo manifiesto de428 archivos fuente. [Recibos y logs](../../tests/fixtures/h5-012/f03-20261015/), [corroboración en regresión](../../tests/fixtures/h5-012/f03-20261015/full-corroboration.json).

Entorno: PostgreSQL17.11 real, Storage oficial fijado por el runner del repositorio, direcciones127.0.0.1 y datos sintéticos. Copia desechable `/tmp/h512f03-s28ze2i7/r`; las pruebas que históricamente regeneran fixtures escribieron únicamente allí. Sus nuevas salidas se conservan por separado. No se instalaron dependencias ni se alteró el lockfile. Auditoría de dependencias consulta metadatos del registro; no acredita ausencia universal de vulnerabilidades.

## Consistencia y seguridad

La migración añade solo campos derivados en la rama interna del calendario. No amplía la lista de salida externa ni concede permisos. Los joins exigen scope autorizado, servicios y Bookings autorizados. La fuente canónica resuelve la última revisión; calendario conserva el estado vigente y timeline conserva historia. La certeza verificada se refiere al estado canónico, incluida una cancelación verificada, y no significa que el servicio esté activo.

Se comprobaron cancelación parcial de noche, cancelación de servicio, cancelación de Booking, aprobación sin aplicación y secuencia de cambio de fecha/cancelación. Las pruebas preservan hermana, otra reserva, origen, revisiones y minimización. No se inventa una regla de cancelación agregada entre ámbitos; los estados se exponen separados, igual que el contrato operacional existente. No se demostró otro defecto de producto en el alcance auditado.

Las nuevas pruebas preservan las restricciones de identidad/sesión/MFA, sobres y binding de raíz/finalidad, revocación, aislamiento, consultas externas mínimas, originales reautorizados y ausencia de actividad humana por polling. V-MIG verifica que no cambian roles, políticas ni ACL. Las guardas y auditores existentes permanecen intactos.

## Delta y preservación

Inventario final: **257 archivos en el delta** (169 previos preservados y 88 adiciones de esta ejecución); 1 archivo seguido modificado y 256 sin seguimiento.

Base y HEAD/main/origin/main: `f063879d203330adb57d7e8fef3607ae796f52d5`; árbol publicado `104b4ecba9dd72aa166410470b362a956ed866e2`. Preflight con fetch y divergencia0/0. Índice vacío, sin commit ni push. El working tree contiene el candidato local previo y las adiciones de esta ejecución.

Cambio de producto de esta ejecución: una migración nueva61. F01/F02 y `src/domain/coordinated-projection.ts` conservan sus bytes iniciales. Se añaden seis suites de integración (41 casos sobre61; F01 sobre61; F03; cobertura; migración; seguridad) y un fixture sintético de referencias. Ninguna prueba histórica se reescribe. Se añaden estos tres informes, inventarios, fuentes y evidencias nuevas. [Inventario exacto completo frente a la base](../../tests/fixtures/h5-012/f03-20261015/inventory.json).

Expected congelado: 67.346 bytes, SHA256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`. FAIL originales F01/F02/F03, informes previos, snapshots, auditores, sellos y normativa preservados. [Control final](../../tests/fixtures/h5-012/f03-20261015/preservation-final.json). No staging para evitar alterar el índice reservado a publicación.

## Riesgos residuales y punto de parada

La acreditación es local/aislada: no prueba Hosted/Production, disponibilidad real de terceros, datos reales o despliegue. No se ejecutó prueba de carga de grandes históricos ni se acredita rendimiento de producción; la lectura añade resolución de tres scopes por noche. No hay defecto material abierto demostrado ni laguna C03/C05/C06 pendiente en este candidato.

Recomendación: aceptar el candidato técnico para revisión humana de cierre/publicación. La siguiente acción es revisar este informe, la matriz y el delta; la publicación y cierre requieren autorización expresa. No se declara COMPLETED, no se inicia H5-013 y no se ejecutan commit, push ni despliegue.

Reproducción aislada: `python3 tests/fixtures/h5-012/f03-20261015/reproduce.py focal` (o `full` / gates indicados en el script). Crea una copia nueva, verifica los inputs y produce logs nuevos en `/tmp`; no sobrescribe evidencias.
