# TSK-H5-018 — cuarta auditoría independiente — candidato E

2026-10-17 Europe/Madrid. **Dictamen independiente: FAIL. No se recomienda aceptar H5-017-E.** Dos defectos materiales P2 nuevos, reproducidos sin modificar producto, contratos, expected ni pruebas anteriores. La regresión completa actual pasa 2.884/2.884; las 17 contrapruebas nuevas dan 10 PASS y 7 FAIL, reproducidos en una segunda ejecución. Los controles técnicos pasan. Los siete FAIL corresponden a dos defectos y bloquean la recomendación de aceptación.

H5-017/H5-018 permanecen **IN PROGRESS**. DM-PENDING-005 permanece **OPEN**. Ámbito exclusivamente local/aislado, con datos sintéticos. No se acreditan H6-015/H6-017 ni uso real/Hosted/Production.

## A–C. Dictamen, candidato y oráculo

Base aprobada: `9649a2773530ea8a43237b4e1f2034f80e34136f`. Preflight y comprobación final tras `git fetch origin`: HEAD = main = origin/main, divergencia 0/0 e índice vacío. Se preserva el árbol recibido con sus cuatro modificaciones rastreadas anteriores; no se declara limpio frente a la base Git. La comprobación final consta en `tests/fixtures/h5-018-fourth/final-git.json`.

Identidad E recalculada independientemente antes de escribir:

- Contenido de inventario: `0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191`.
- Archivo de sello E: `aae7a87dabf77380f83d05554ff53a495022f72dad8446d7a32bffd03b7fbbdb`.
- **37.758 archivos:** 37.543 recibidos por E y 215 altas E, incluidos sus metadatos.
- Migración 67: `supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql`, SHA-256 `45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5`.
- Comprobados ruta, tipo, modo, tamaño y hash de todas las entradas, metadatos excluidos por autorreferencia, delta, conjunto real de archivos y ausencia de altas ajenas antes de auditar.

El [expected independiente congelado](expected-TSK-H5-018-fourth.md) se deriva de las fuentes aprobadas, no de los resultados del implementador. Su sello y hashes de fuentes están en `tests/fixtures/h5-018-fourth/expected-seal.json` y `normative-sources.json`. Se consultan directamente Constitución, decisiones, Tasks §2.2/H5-017/H5-018/§6, Plan §§7.1/8/11.2/B01/B07/B08/B10/C01/C04, SPEC y reglas/invariantes aplicables. La [matriz independiente](matrix-TSK-H5-018-fourth.md) conserva las 13 asignaciones literales y las relaciona con precondiciones, transiciones, esperados, observados y logs.

## D–G. Propiedad, historia, autorización e identidad

**H5-018-4-F01, P2 — procedencia fuera del contexto tras A→B→A.** Una ejecución vuelve legítimamente al contexto A y su diagnóstico incorpora definición, aprobación, operación e historia de la versión intermedia B. El lector B07 deniega la evidencia B desde A. Se reproduce con raíz booking, servicio→reserva y servicio→reserva→oportunidad. Una cuarta contraprueba confirma que también se acepta una observación nueva en A con la operación histórica B y se presenta como canónica.

La causa está en la proyección vigente: autoriza la ejecución por su definición actual y después extiende ese conjunto a todas sus definiciones/aprobaciones y operaciones/historias, sin comprobar la procedencia de cada versión. Esa rama prevalece sobre la recuperación histórica más restrictiva. La propiedad correcta de una ejecución no demuestra el contexto de cada operación. No se atribuye una fuga entre usuarios o tenants que estas pruebas no demuestran; el defecto probado afecta a alcance, metadatos y procedencia de C01/C04.

**H5-018-4-F02, P2 — replay histórico exacto rechazado.** Tras revisar A→B, la observación O permanece íntegra y autorizada en la consulta histórica de A. Repetir exactamente O devuelve `DIAGNOSTIC_DENIED` cuando incluye operación, ejecución o ambas. Antes de revisar, el replay funciona; el control sin referencia opcional sigue funcionando después. Se reproduce también con una nueva sesión identificada del mismo actor. Las guardas de escritura actual se ejecutan antes de buscar el resultado previo y rechazan la repetición autorizada que Plan §7.1/V-AT exige recuperar.

El [registro de defectos](defects-TSK-H5-018-fourth.md) fija causa, norma, reproductores y correctivo necesario. **No se implementa ninguno.** Las observaciones originales permanecen idénticas; los FAIL iniciales y su repetición se conservan.

Los controles positivos comprueban UUID iguales y distintos entre evento/ejecución, pertenencia real de operación confirmada posteriormente, referencias múltiples, evento único vinculado mediante B07 a dos contextos, paginación 1/2 y petición pendiente sin operationId a través de revisiones sucesivas. Retirar aprobación B08 bloquea start/resume y conserva la decisión histórica y E4, sin retry ni efecto nuevo.

La revocación usa **contratos reales B01**: revokeOne y revokeAll; restaura acceso mediante una sesión nueva identificada y mantiene denegada la antigua. Se comprueban B07 evidencia/evento, B08 ejecución, observación, operación, padre/hijo, lectura/escritura/replay y metadatos. Ambos casos pasan. B07 solo ofrece create/link: **no existe una operación ordinaria de unlink/revocación individual de evidencia** en este alcance. No se inventa. Las alteraciones SQL privilegiadas de b07_links presentes en los tests E se repiten como regresiones adversariales de fuente, distinguidas de las transiciones autorizadas de esta auditoría.

## H–K. Migración, regresiones y contrapruebas

**V-MIG independiente: 2/2 PASS**, capturas 05 y 13. Base 66 poblada con una asociación falsa aceptada por D; clúster vacío con cadena 67; roles API posteriores; denegación de DDL ordinario; fallo DDL con rollback exacto; recuperación de los tres cuerpos 66 y reaplicación de 67. Comparación de 175 tablas, 487 relaciones, 305 funciones, 332 políticas y 1.037 restricciones: solo cambian los tres cuerpos previstos, cero cambios adicionales de catálogo/datos/privilegios. Filas comparadas por hash antes/después de cada DDL; asociación antigua preservada y suprimida de la proyección tras upgrade. Advisors loopback devuelve `results: []`.

Permisos efectivos: 12/12 intentos directos denegados; RLS/FORCE RLS activo. Los dos helpers conservan SECURITY INVOKER y el escritor API su SECURITY DEFINER previo; owners sin LOGIN/SUPERUSER/BYPASSRLS, search_path restringido y atributos/ACL preservados. Los roles de migración y consulta ordinaria permanecen separados.

**Regresión focal 06: 44/44 PASS**, ejecución nueva sobre 67:

| Conjunto | Resultado |
|---|---:|
| F01/F02/F03 originales | 25/25 PASS |
| H5-018-2-F01, R01/R02 | 2/2 PASS |
| Originales tercera auditoría, incluidos operación/ejecución y padre | 12/12 PASS |
| Tres variantes derivadas E | 5/5 PASS |

Los ocho archivos originales conservan bytes/aserciones. Un hook con pares padre/specifier exactos cambia solo el fixture a 67, con hash obligatorio del SQL y puertos locales distintos para no interferir con la completa. `original-hook-provenance.json` identifica cada hash. Los resultados anteriores son antecedentes; estos 44 resultados se han ejecutado de nuevo.

**Contrapruebas independientes: 17 casos distintos, 10 PASS/7 FAIL**, capturas 02/03/04/05/12. La repetición conjunta 13 reproduce exactamente **10 PASS/7 FAIL**, 0 cancelados y 0 omitidos. Cuatro FAIL corresponden a F01 y tres a F02; no son siete defectos distintos. Cada fila de la matriz señala normas, datos sintéticos, transición, esperado y salida. Ningún instrumento tuvo que corregirse ni se alteró un esperado para obtener PASS.

V-DOM/V-DAT/V-NEG: **FAIL funcional** localizado por F01/F02; controles de infraestructura y autorización pasan donde se indica. V-MIG: **PASS**. V-EVI: resultados/inputs/hash nuevos, preservación y sellado verificables. Un PASS de migración o de regresiones conocidas no sustituye los siete FAIL nuevos.

## L–N. Completa, controles técnicos y confidencialidad

**Regresión completa 01: 2.884/2.884 PASS; 0 FAIL, 0 cancelados y 0 omitidos.** Se han reejecutado los 184 archivos del candidato E en 14 fases disjuntas, con copia comprobada por bytes. El inventario de nombres de casos coincide con la selección E; los resultados proceden de esta ejecución nueva. La réplica desechable se ha retirado; las salidas que regeneran pruebas históricas se capturan separadamente y no sobrescriben evidencias del workspace. Las bases históricas de los fixtures permanecen expresas; los fixtures funcionales afectados usan 67. No se afirma que cada caso histórico instale 67.

Las 17 contrapruebas de esta auditoría son adicionales a esa selección: **2.901 casos distintos, 2.894 PASS y 7 FAIL** en el conjunto disjunto. La focal de 44 solapa la completa y no se suma. La repetición de 17 tampoco añade casos. Unitarias y health se presentan separadamente. Los 54 nombres de casos históricos incrustados en subprocess se excluyen del inventario de casos actuales. `current-case-inventory.json.gz` conserva el listado y la clasificación; SHA-256 del contenido descomprimido: `8ce4138ce81c416b90cd4009f049872ae24d7857d7060949547286430a32350d`.

| Control nuevo | Captura | Resultado |
|---|---|---|
| Instalación congelada | 07 | PASS |
| Typecheck final, incluidos todos los tests nuevos | 14 | PASS |
| Unitarias | 09 | 208/208 PASS |
| Health independiente | 10 | 1/1 PASS |
| Lint/import boundaries | 15 | PASS |
| Build | 16 | PASS |
| Auditoría de dependencias de producción | 11 | 0 vulnerabilidades |

Los controles de secretos, URL temporales, cuerpos y economía innecesaria se reejecutan con los originales; no se detecta exposición de esas categorías en los casos probados. **F01 sí expone metadatos y referencias fuera del alcance de la raíz consultada**, por lo que no procede declarar confidencialidad global PASS. La revocación normativa probada no inventa permisos finos futuros ni una política de privacidad.

## O–R. Preservación, pendientes, recomendación y sello

Los **37.758 archivos E** permanecen byte a byte, con el mismo tipo/modo/tamaño/ruta. Se verifican migraciones 1–67, expected congelados, tres dictámenes FAIL anteriores, inventarios/sellos y las versiones históricas recuperables en sus overlays. H5-016: 456 inputs contrastados, 455 idénticos y la transición previa autorizada de composition.ts intacta:

`fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879` → `31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`.

La auditoría no modifica ninguno de esos archivos. Sus únicos cambios son altas en namespaces nuevos `h5-018-fourth`/`TSK-H5-018-fourth`. Los documentos de coordinación recibidos siguen como antecedentes, sin reescribirlos. Preservación independiente y revalidación final constan en los informes propios y se repiten al verificar el sello.

**Recomendación: no aceptar E.** Quedan abiertos H5-018-4-F01 y H5-018-4-F02. Los correctivos propuestos en el registro requieren una instrucción posterior; deben conservar originales, aplicar coherencia de contexto/versionado por nodo y distinguir replay autorizado de inserción nueva, manteniendo F1/F2, igualdad estricta e integridad. Después será necesaria otra verificación independiente de los correctivos.

Inventario exacto y sello propios: [audit-inventory.json](../../tests/fixtures/h5-018-fourth/audit-inventory.json) y [audit-seal.json](../../tests/fixtures/h5-018-fourth/audit-seal.json). **116 altas de auditoría: 114 archivos inventariados y dos metadatos autorreferentes declarados; 37.874 archivos totales con los 37.758 recibidos intactos.** El inventario incluye rutas, hashes, tamaños, tipos y modos, y referencia la identidad E sin reemplazar su sello. Serialización determinista JSON UTF-8 ordenado, sangría 2 y salto final. La entrega requiere ejecutar el verificador de solo lectura después de crear el sello. El SHA-256 del inventario queda en el sello; su inclusión en este mismo informe produciría una dependencia circular.

Verificación de solo lectura: `python3 scripts/verify-h5-018-fourth-seal.py`. Reproducción de contrapruebas en una copia aislada: ejecutar el comando de `13-new-retest.status.json` mediante una etiqueta nueva; el resultado esperado sobre este candidato es 17 casos/10 PASS/7 FAIL. Las entradas y órdenes de las 16 capturas quedan registradas, y `current-case-inventory.json.gz`/`current-coverage.json` reconstruyen el recuento desde stdout, sin reutilizar resultados históricos.

**STOP.** Sin commit, push, despliegue, datos o servicios de negocio reales, H5-019/H6 ni políticas/umbrales nuevos. Esperar autorización expresa del director del proyecto. H5-017/H5-018 no se declaran COMPLETED.
