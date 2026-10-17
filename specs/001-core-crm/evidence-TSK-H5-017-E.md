# H5-017/H5-018 — Correctivo E — informe para cuarta auditoría

Fecha: 2026-10-17, Europe/Madrid. Solo PostgreSQL/Auth/Storage local o aislado y datos sintéticos. **Estado global: PASS interno local/aislado. Candidato E preparado para cuarta auditoría independiente.**

H5-017 y H5-018 permanecen **IN PROGRESS**. DM-PENDING-005 permanece **OPEN**. Las tres auditorías anteriores conservan su dictamen **FAIL** y todos sus originales. Este informe acredita comprobaciones internas del implementador; la cuarta auditoría independiente está pendiente. No autoriza publicación.

## A–B. Estado e identidad

Base aprobada y verificada: `9649a2773530ea8a43237b4e1f2034f80e34136f`. HEAD, main y origin/main coinciden; divergencia 0/0 e índice vacío en el preflight y en la consulta remota final; evidencia en `tests/fixtures/h5-017-e/final-git.json`. El árbol recibido ya contenía cambios del candidato D y las auditorías: no se declara limpio frente a Git.

La identidad final de E se fija en [candidate-seal.json](../../tests/fixtures/h5-017-e/candidate-seal.json), mediante el SHA-256 del inventario completo, el del inventario comprimido y el del delta. El [inventario completo](../../tests/fixtures/h5-017-e/candidate-inventory.json.gz) incluye rutas, tipos, modos, tamaños y SHA-256. El [delta](../../tests/fixtures/h5-017-e/delta-inventory.json) identifica cada alta y la ausencia de modificaciones o eliminaciones respecto al estado recibido.

Candidato final: **37758 archivos = 37543 recibidos intactos + 215 altas E**. Las altas incluyen producto, pruebas, instrumentos, documentación, capturas y los tres metadatos de inventario/sello; no equivalen a215 cambios de producto. El inventario completo contiene37756 entradas y excluye únicamente sus dos metadatos circulares declarados. Frente al estado recibido: **0 archivos modificados y 0 eliminados**.

Único archivo nuevo de producto: [migración 67](../../supabase/migrations/20261016220850_h5_diagnostic_owned_references.sql), SHA-256 `45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5`. Se creó con la CLI Supabase fijada en 2.119.0. La fecha UTC del nombre corresponde al 17 de octubre en Madrid. Migraciones 1–66 intactas.

## C–E. Causas y correcciones

**H5-018-3-F01 — pareja operación/ejecución.** El escritor y la proyección vigente comprobaban que ambas referencias pertenecieran al contexto, sin acreditar que la operación fuera de esa ejecución. D solo comprobaba la pareja al recuperar historia. La confirmación tardía de una referencia desconocida podía promover una asociación falsa. E exige la fuente propietaria B08: `b07_operations.result_ref` junto con `b08_command_results`, identidad y ámbito, tanto al registrar como al volver a consultar. Un UUID compartido entre tipos no acredita propiedad. La asociación falsa antigua se suprime de la proyección; la observación almacenada permanece idéntica.

**H5-018-3-F02 — petición desde contexto padre.** La rama vigente expandía `diagnostic_contexts`, pero la histórica comparaba directamente el contexto del trabajo con la raíz consultada. Tras revisar el trabajo, el padre perdía el acceso diagnóstico al hijo aunque la observación y la historia persistieran. E aplica el recorrido canónico tipo+UUID a la recuperación histórica, manteniendo definición, versión y contexto históricos exactos, operación propietaria, historia y `b08_context`. La escritura de referencias explícitas desde un padre usa la ejecución vigente autorizada. Las observaciones no se trasladan ni se concede acceso general al destino.

No se concluye que ambos defectos tengan una única causa: uno omite una relación de propiedad; el otro omite un recorrido canónico autorizado. Comparten una validación incompleta de identidad/procedencia entre ramas. El [mapa previo](relations-TSK-H5-017-E.md) y su [addendum previo al ajuste derivado](relations-TSK-H5-017-E-addendum.md) identifican fuentes y restricciones de petición, operación, ejecución, evento, intento, trabajo, observación, contextos e historia.

Las contrapruebas transversales revelaron tres variantes materiales adicionales, reproducidas antes de corregirlas:

- **H5-017-E-F01:** el UUID de una ejecución ajena podía coincidir con una evidencia local y hacer visible su operación e historia. Las operaciones e historias de B08 se contrastan ahora contra el conjunto tipado de ejecuciones autorizadas.
- **H5-017-E-F02:** una evidencia restringida era denegada por el lector propietario, pero el diagnóstico vigente mantenía la ejecución. El conjunto vigente aplica ahora `b08_context`.
- **H5-017-E-F03:** observaciones con operación desconocida o ausente conservaban referencias opcionales cuya fuente había perdido autorización. Toda lectura revalida ejecución y evento; la fila original queda intacta y vuelve a ser visible cuando se restablece el permiso.

La migración sustituye únicamente los cuerpos de `crm_private.diagnostic_canonical_nodes`, `crm_private.diagnostic_nodes` y `crm_api.h5_diagnostic_record`. No crea objetos, fuentes de verdad, reglas de negocio o privilegios. El [diff por función](../../tests/fixtures/h5-017-e/product-body-diff.patch), la [revisión estructural](../../tests/fixtures/h5-017-e/structural-review.json) y el [registro de defectos](defects-TSK-H5-017-E.md) detallan el cambio mínimo y las incidencias de instrumentación.

## F–H. Reproducción, contrapruebas y regresiones

Captura 01, sobre D66 sin corregir: **12 casos, 7 PASS y 5 FAIL**. Tres fallos de T03/T04 reproducen la pareja falsa y dos T07 reproducen la pérdida desde padre, exactamente como la tercera auditoría. Se preservan entradas, resultados, fuentes y hashes.

Capturas 16 y 17: un FAIL material cada una para colisión de propietario y evidencia vigente. Captura 19: tres FAIL materiales para referencias opcionales restringidas. Captura 18 conserva dos FAIL materiales y un fallo de instrumento por longitud de ruta de socket; se repitió sin cambiar aserciones. Las incidencias 04/06/09 son instrumentos nuevos y están identificadas como tales.

Sobre la migración 67 final, captura 22: **63/63 PASS**, 0 fallos/cancelados/omitidos:

| Conjunto disjunto dentro de la focal | PASS |
|---|---:|
| Reproductores originales de tercera auditoría | 12/12 |
| F01/F02/F03 originales | 25/25 |
| H5-018-2-F01, originales R01/R02 | 2/2 |
| Nuevos E: identidad y propietario | 8/8 |
| Nuevos E: padres, revisiones, evidencia y tipo | 10/10 |
| Nuevos E: autorización de fuentes/referencias | 4/4 |
| Nuevos E: V-MIG | 2/2 |

Los 24 casos nuevos E prueban parejas correctas e incorrectas, UUID iguales y distintos entre tipos, referencias ausentes/desconocidas/inexistentes, confirmación tardía positiva y negativa, define/claim/start/result, asociaciones antiguas aceptadas por D, versiones sucesivas y vuelta al origen. Los recorridos cubren servicio→reserva, reserva→oportunidad, servicio→reserva→oportunidad y propuesta→oportunidad, con y sin ejecución explícita, petición anterior y posterior, paginación e identidad estable. Los negativos incluyen evidencia restringida y raíz con UUID igual pero tipo distinto.

Los reproductores protegidos mantienen exactamente sus bytes y aserciones. Los hooks nuevos sustituyen únicamente imports de fixtures enumerados por padre y specifier en [original-hook-map.json](../../tests/fixtures/h5-017-e/original-hook-map.json) y [full-hook-map.json](../../tests/fixtures/h5-017-e/full-hook-map.json). La regresión D10 que prepara intencionadamente una pareja inválida sigue fijada a 66; los casos E-I05 verifican el upgrade de ese estado y T04/T05 comprueban el rechazo final. No se presenta una prueba histórica fijada a otra base como prueba sobre 67.

## I–J. Ejecución completa y controles técnicos

**Captura 30: 2884/2884 PASS, 0 fallos, 0 cancelados y 0 omitidos.** La selección final contiene 184 archivos, distribuidos en 14 fases disjuntas. El recuento reconstruido conserva los 2848 nombres de casos anteriores y añade 12 originales de la tercera auditoría y 24 nuevos E. Cada caso tiene identidad de ejecución, fase y log; no se reutilizan resultados anteriores. Los 54 resultados de subprocess históricos impresos por el reproductor H2-008 se excluyen del recuento de casos actuales: cuenta solo su test exterior.

Duración de la captura completa: 939,548 segundos. Todos sus inputs permanecen iguales durante la ejecución. La reconstrucción de 28 capturas, sus entradas/archivos de versiones propias y los logs termina PASS. SHA-256 del contenido del inventario de casos final: `92cd7615fab304349992d6c82ba7e03f5e4125eff8e8511df0e8fe4944c6260c`. Las correcciones finales de redacción de los documentos E se realizan después de las pruebas; no cambian migración, fuentes, tests, instrumentos ensayados ni expected.

Se ejecuta en una réplica desechable con archivos verificados por bytes y dependencias congeladas. Los tests históricos que regeneran tres salidas lo hacen en esa réplica; las salidas originales del workspace no se sobrescriben. El manifiesto de copia y el informe de preservación describen el alcance exacto. Las migraciones históricas conservan sus bases expresas; los fixtures funcionales afectados usan 67 mediante los hooks identificados.

| Control final | Captura | Resultado |
|---|---|---|
| Instalación `--frozen-lockfile` | 23 | PASS |
| Typecheck | 24 | PASS |
| Unitarias | 25 | 208/208 PASS |
| Health independiente | 26 | 1/1 PASS |
| Lint | 27 | PASS |
| Build | 28 | PASS |
| Auditoría de dependencias de producción | 29 | PASS; 0 vulnerabilidades |

La focal 63 solapa la completa y **no se suma** a ella. Las unitarias y health se informan separadamente. La completa 15 de la primera versión E obtuvo 2879/2879, pero no se reutiliza para acreditar la versión final. La propuesta 20 obtuvo 61/61 mediante un hook sobre `proposed67.sql`; sus bytes coinciden con la migración final, pero la evidencia final se obtiene de 22 y 30 sin ese hook de propuesta. Las versiones propias anteriores y sus logs quedan archivados.

## K–M. Protocolos, seguridad y migración

**V-DOM:** fuentes aprobadas, esperado congelado y trece asignaciones de Tasks§6 contrastados con casos positivos/negativos. La [matriz](matrix-TSK-H5-017-E.md) vincula HIST/ERR/AC-070/072/081, NFR, DM-INV-047, SM-FORB-27, P12, PLAN-B08 y PT-11. No se modifica ningún contrato normativo.

**V-DAT:** estado PostgreSQL real en clústeres aislados, actores/ámbitos separados, contratos ordinarios para crear hechos y fixtures adversariales explícitos para retirar/restablecer permisos. Observaciones, eventos y efectos canónicos originales conservados; incertidumbre E4, ausencia de retry automático y una sola invocación ante efecto durable/excepción comprobados por los originales.

**V-MIG:** E-M01/E-M02 sobre 67, en captura 22. Upgrade de 66 poblada con los dos defectos; instalación desde clúster vacío; roles API introducidos después de migrar; DDL abortado; recuperación de los tres cuerpos previos y reaplicación exacta de 67; DDL por rol ordinario denegado. Comparación de 175 tablas, 487 relaciones, 305 funciones, 332 políticas y 1037 restricciones: solo cambian los tres `prosrc` previstos, cero objetos nuevos. OID, firmas, propietarios, ACL, configuración y restantes atributos permanecen iguales. Hashes de filas iguales antes/después de cada DDL; las lecturas de control solo actualizan la marca de actividad humana esperada, diferenciada del efecto de migrar.

**Seguridad:** RLS/FORCE RLS y privilegios efectivos preservados; 8/8 accesos directos prohibidos en instalación limpia; roles propietarios sin LOGIN/SUPERUSER/BYPASSRLS. Los helpers privados conservan SECURITY INVOKER y el escritor API conserva su SECURITY DEFINER existente y `search_path` restringido. Advisors en loopback: `results: []`. Regresiones de F1/F2, MFA, actor revocado, interacción, ámbito y revalidación final; canarios de cuerpos, secretos y URL temporales ausentes. No se afirma seguridad de entornos no ensayados ni acreditación H6-015/H6-017.

## N–O. Preservación, inventario y reproducción

El preflight E inventaría exactamente **37543 archivos previos**: 37400 del candidato D y 143 de tercera auditoría. Se preservan ruta, tipo, modo, tamaño y hash, incluyendo todos los FAIL, expected, inventarios y sellos. Contenido D: `8fc37c4b13f114d3a689cac57d68a338df75b5602cb94cfc6b5211d9359b4912`.

Los 456 inputs H5-016 se contrastan: 455 idénticos y la transición previa autorizada de `src/server/composition.ts` intacta (`fd86f3f2246ce0988eb0393f256b7d5b25024f9a7ff58791210225850d1fc879` → `31d18d77cbbbe85d1e9ece965c6cdf098802fd114795095315d08f586716bd1d`). No es un cambio de E. Las diferencias históricas anteriores de coordinación se recuperan de sus overlays preservados; no se falsea que todas las generaciones sean iguales entre sí.

Las fuentes de coordinación recibidas se conservan byte a byte como antecedentes D. Este informe y los nuevos documentos E registran el correctivo vigente sin alterar esos archivos protegidos. Ningún archivo previo se modifica ni elimina; todas las altas E están enumeradas en el delta. La verificación final queda en `tests/fixtures/h5-017-e/31-final-preservation.json` y el verificador del sello repite esas comprobaciones sin escribir archivos.

El inventario completo incluye el delta; excluye únicamente su propio fichero comprimido y el sello para evitar hashes circulares. El delta excluye esos dos ficheros y a sí mismo. Los conteos incluyen expresamente esos metadatos. Serialización determinista: JSON UTF-8 con claves ordenadas, sangría 2 y salto final; gzip con mtime 0. El sello guarda los hashes de contenido y compresión y se verifica después de generarlo.

Verificación de solo lectura del candidato recibido: `python3 scripts/verify-h5-017-e-seal.py`. Contrasta inventario completo, delta, hashes, archivos previos, fuentes congeladas, bases Git e índice. Los logs y cada resultado actual se reconstruyen en `final-verification.json`, `current-coverage.json` y `current-case-inventory.json.gz`; los resultados históricos incrustados en un reproductor no se cuentan como casos actuales independientes. Las órdenes y hashes de entrada de cada captura están en sus archivos `.status.json`. Para reejecutar pruebas deben usarse una copia desechable y etiquetas nuevas, preservando todos los originales.

## P–Q. Pendientes y cuarta auditoría

**Cero defectos materiales detectados pendientes de corrección interna.** Los dos defectos originales y los tres derivados pasan sus comprobaciones focales y la completa final. La verificación de preservación, inventario y sello forma parte del cierre reproducible, y su comando de solo lectura queda incluido en el candidato. El pendiente material de aceptación es la cuarta auditoría independiente; DM-PENDING-005 sigue abierto. No se declara completada H5-017 ni H5-018.

Superficies recomendadas para la cuarta auditoría:

1. Repetir los originales T03/T04/T07, sin alterar expected, y comprobar parejas conocidas/desconocidas antes y después de confirmaciones y revisiones.
2. Contrastar propiedad B08 frente a alias de evidencias/tareas/avisos B07 y UUID iguales entre tipos, incluidos operación sola y observaciones heredadas de D.
3. Recorrer padres e hijos, versiones sucesivas, vuelta al origen, peticiones posteriores y paginación; comprobar que historia autorizada no expone hechos actuales de otro contexto.
4. Retirar/restablecer autorización de ejecución/evento en fixtures sintéticos, especialmente operación desconocida o ausente; verificar ausencia de metadatos y conservación exacta de la fila original.
5. Revisar los tres cuerpos SQL, permisos efectivos, migración limpia/poblada/rollback/recuperación y la selección completa; distinguir hooks explícitos, bases históricas y resultados actuales.
6. Recalcular sello/delta y las 37543 identidades previas, incluidos los dictámenes FAIL. Contrastar este resultado interno con un esperado independiente basado en las normas.

**Límite final: STOP tras documentar y verificar el sello.** Sin commit, push, despliegue, servicios de negocio reales, H5-019 o H6. La siguiente decisión corresponde a una nueva auditoría independiente.
