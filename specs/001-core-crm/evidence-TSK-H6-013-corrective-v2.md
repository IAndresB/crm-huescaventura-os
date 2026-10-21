# TSK-H6-013 — Correctivo focalizado V2

Estado: **PASS técnico propuesto, local/aislado, pendiente de auditoría independiente focalizada y aceptación del director**. No cierra H6-013 ni H6. DM-PENDING-005, Hosted y Production no cambian. No autoriza publicación.

## A. Identidad y preservación previa

Base `8a5f1408777b81b760a02646fa414a34dc17983e`, árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`, rama main. Índice sin cambios. Se contrastaron por contenido y modo las 38.702 rutas versionadas y las 15.537 rutas de V1 contra el inventario independiente de la segunda auditoría. V1 sumaba 210.646.948 bytes.

Manifiesto V1 SHA-256 `6995c237e5e484cd1b2eabf1f2d8089ca620f7549f61e881973c1c140ea183e0`; sello y readback coinciden con los proporcionados. V1 incorporó 5.879 rutas respecto a las 9.658 originales y modificó únicamente el test negativo anterior. Esta historia no se reescribe.

Antes de editar se creó `/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-pre-v2-20261020T162705Z`: inventario completo, `candidate-v1.tar`, recibo y sello local. Los 15.537 miembros se leyeron y comprobaron por tipo, modo, tamaño y SHA-256. TAR: `3467890fc314517659eace66909d4147bff8d3573f9cc499fa0d611886a931bb`. Inventario: `d7a8c4f96185678eba6a19539805084ad1bdb0520d175c4b50936535249e66ed`. No se afirma WORM, custodia externa ni permanencia garantizada.

## B. AUD2-H6013-01: configuración efectiva

La causa era identificar el nombre de GUC mediante `startsWith('search_path=')`, sensible a mayúsculas. El helper ahora separa cada entrada por su primer `=`, normaliza el nombre completo a minúsculas, examina todas las entradas y exige exactamente una configuración del parámetro. Rechaza valores distintos de `pg_catalog, pg_temp` en ese orden. Las entradas mal formadas fallan de forma explícita.

Se conservan el descubrimiento mediante catálogo sin lista parcial de esquemas, comparación exacta con el inventario independiente, identidad, esquema, propietario, atributos privilegiados y EXECUTE efectivo de las cuatro identidades ordinarias. No se añade ni cambia una función o permiso del producto.

Once configuraciones se contrastaron además con `current_setting('search_path')` dentro de una función sintética SECURITY DEFINER: tres válidas, public, esquema adicional, orden inverso, ausencia y cuatro variantes de duplicación. El caso de distinta capitalización muestra valor efectivo `public` y rechazo del nuevo verificador. Un control adicional detecta una función en otro esquema, inventario truncado y propietario cambiado. Las mutaciones del catálogo solo se realizaron en transacciones del clúster desechable; el catálogo se comprobó restaurado después de cada control.

## C. AUD2-H6013-02: contenido numérico exacto

La primera pérdida estaba en `postgres` 3.4.9, `src/types.js`: el decodificador de JSON/JSONB utiliza `JSON.parse`. El comparador recibía ya un Number redondeado y después serializaba ese valor para calcular SHA-256.

Ahora PostgreSQL devuelve texto (`::text`) antes de que actúe ese decodificador. El parser usa obligatoriamente el contexto de origen de JSON.parse de Node 24 para conservar cada token numérico. No toma el Number intermedio como valor. Si el contexto no está disponible, rechaza la comparación. La representación usa coeficiente decimal textual y exponente BigInt; normaliza ceros finales, notación exponencial y cero con signo conforme a equivalencia numérica. Los nodos llevan etiquetas de tipo, evitando colisiones con cadenas, objetos o arrays aportados por los datos. Ordena claves y filas canónicas; conserva orden y multiplicidad de arrays. Incluye tipos SQL de las columnas seleccionadas y una máscara que distingue SQL NULL de un JSONB null presente.

Se mantiene la semántica JSONB de la proyección previa; no se convierte la comparación en una comprobación del formato léxico original de columnas JSON. Los tipos efectivamente ensayados incluyen bigint, numeric exacto y valores anidados JSONB. No hay nueva dependencia de paquetes ni cambio del driver/producto.

`dataSnapshot` y `businessFacts` usan esta ruta. El comparador duplicado de las cinco actualizaciones largas se sustituye por el helper compartido. La cadena Python conserva hashes calculados sobre texto en PostgreSQL y no usaba la conversión defectuosa. Los demás parses H6 revisados son manifiestos/configuración o fixtures acotados, no comparadores de contenido persistente mediante Number.

Contraprueba principal: `9007199254740992` y `9007199254740993`, con dos filas en ambos estados, producen respectivamente hashes `2cade93059c1c06f9d3f74cfc7f93647f1a0e492db0e81869c7f906d406c987f` y `dbe035d67b5ace3a6620cf1a19ab41a0fb27ae9cfc9b5aa81b0ac7221af9b102`. En V1 el mismo ensayo final no detecta el cambio. Se conservan ambos resultados.

Se ensayaron negativos, límites seguros/no seguros, extremos bigint, decimal que cambia una unidad en la fracción exacta, escala equivalente, cero, NULL, números y tipos anidados, estado idéntico, SQL NULL frente a JSON null, reordenación de filas y cambio de tipo SQL. Dos pruebas unitarias adicionales examinan exponentes grandes/pequeños, límites y colisiones con estructuras de usuario. Las modificaciones SQL deliberadas se revierten y se verifica el estado original.

Los 55 valores numéricos del fixture H1 original fueron releídos de la ejecución V2. En sus 53 tablas, la identidad canónica del texto exacto coincide con la del roundtrip anterior; no hay valores afectados, y el mayor entero es 2026. Se registra cada token numérico, sin exportar claves privadas sintéticas ni credenciales.

## D. AUD2-H6013-03: conciliación de custodia

El nuevo recibo `corrective-v2/custody-reconciliation-v2.json` conserva y enlaza los recibos anteriores. La lectura actual encuentra **20 diferencias de modo en candidate-original y 98 en auditor-original**, todas identificadas por ruta. No hay diferencias de contenido, tipo o tamaño. No se establece una causa ni se corrigen permisos en los originales.

Se leyó y verificó íntegro `H6-013-auditor-archive-recovery-20261020T003459Z/auditor-original.tar`, SHA-256 `0ce0d6f83f1affdd9002b23676bc7daf0fb7c160257d696cac8f287676449f0f`. Se recuperaron sus 53.211 miembros en un destino temporal nuevo y se compararon allí modo, tipo, tamaño y hash con el inventario original. Los 9.658 miembros del candidato original bajo `replica/` también coinciden exactamente. Los permisos solo se aplicaron a archivos nuevos en ese destino de recuperación.

Las discrepancias históricas siguen existiendo como hechos de las copias sueltas mutables. La recuperabilidad se acredita por el TAR íntegro, sin depender de que esas copias mantengan indefinidamente sus permisos. El recibo consigna ubicación, fechas locales, inventarios, hashes y resultado.

## E. Expected, cronología y FAIL

Expected nuevo: `tests/fixtures/h6-013/corrective-v2/expected.json`, SHA-256 `c7c65eb596bd9b2548b84177dd4ab9c066659123abf7219ea1f8c5f9c850b121`. Su sello se escribió antes de ejecutar cualquier caso V2. Deriva de V-MIG/V-DAT/V-EVI, Tasks §2.3, Plan §10.1 y los contraejemplos independientes; no de adaptar resultados del producto. Los expected anteriores y sus sellos siguen intactos.

`runs/*/start.json` registra antes de cada ejecución las identidades de los helpers y tests capturados; `status.json` recoge salida de proceso y hashes de logs. La hora es la del sistema local, no una certificación temporal externa. El inventario final identifica todos los artefactos.

Se conservan los fallos de preparación: un await en callback no async impidió el primer arranque; un fixture JSON fue inicialmente enviado por el driver como cadena JSON y se corrigió mediante bind textual y cast SQL explícito. No se cambió el expected. Se conserva la fuente defectuosa. Una versión intermedia se recuperó a partir de las ediciones registradas y se contrastó exactamente con el hash capturado antes de su ejecución.

El ensayo final contra V1 arroja 17 PASS y 12 FAIL del runner (incluye el padre), debido a defectos reproducidos; no es un PASS ni evidencia de un defecto del producto. El mismo test con los helpers V2 arroja 29/29. Los FAIL históricos de las dos versiones anteriores permanecen sin cambios. AUD2-H6013-04 sigue siendo observación histórica: no se modifica el hook ni el recolector anterior, ni se afirma cobertura retroactiva.

## F. Ejecuciones nuevas y selección de regresión

| Verificación nueva | Resultado | Interpretación |
|---|---:|---|
| Controles focales PostgreSQL | 29/29 | 28 casos hijos y su test padre; proceso 0 |
| Conservación H1 | 9/9 | 8 pasos 18→26 y padre; 23 alteraciones, 8 fallos DDL con recuperación |
| Seguridad/negativas | 13/13 | 132 funciones; 175 tablas × 4 roles × 4 operaciones = 2.800 rechazos 42501 |
| Actualizaciones largas | 5/5 | Orígenes 26,30,33,52,63; 42+38+35+16+5=136 transiciones |
| Relectura del fixture original | PASS | 55 tokens; 53 tablas; ninguna diferencia numérica |
| Unitarias | 210/210 | 208 históricas reejecutadas + 2 nuevas; sin omitidas |
| Generación de tipos + tsc | PASS | Comandos equivalentes al script typecheck, en copia |
| Lint / build | PASS / PASS | Procesos 0, en copia; no despliegue |

Se utilizó Node 24.21.0 y PostgreSQL 17.11, conexión Unix para los focales y recursos locales propios para el runner de actualizaciones. El runner de Storage conserva el código oficial previamente fijado; no se descargaron dependencias. El sandbox impidió escrituras fuera del workspace/evidencia propios y conexiones exteriores salvo loopback/Unix; HOME/TMP y entorno fueron específicos, sin configuración del negocio.

Se reejecutaron todos los consumidores de los helpers afectados. Los tests históricos H0–H5 no los importan. **No se reejecutaron como V2** los 410 resultados de cadena vacía, los 2.950 resultados PostgreSQL generales, los dos controles temporales ni los dos S6; se mantienen como evidencia anterior verificada y referenciada. La repetición independiente de fase 15 (2.751) sigue siendo de la segunda auditoría. No son contadores nuevos ni criterios de negocio independientes. La instalación congelada se hereda: package.json, lockfile y dependencias no cambiaron. Se evita repetir ensayos masivos ajenos al delta.

## G. Cambios exactos

Tres rutas V1 modificadas, con originales recuperables en la nueva custodia:

- `tests/support/h6-013-security.ts`: identidad GUC sin distinguir capitalización y examen de todas las entradas.
- `tests/support/h6-013-preservation.ts`: proyección textual exacta, canonicalización con tipos/NULL y hash estable.
- `tests/integration/postgres-h6-013-migration.test.ts`: usa el comparador común en los cinco recorridos.

Instrumentos nuevos: `tests/integration/postgres-h6-013-v2-controls.test.ts`, `tests/h6-013-v2-exact.test.ts`, `scripts/check-h6-013-v2-fixture.ts` y `scripts/verify-h6-013-v2.py` (readback de solo lectura). Se añaden este suplemento, expected/sello, recibos, fuentes de ejecución y logs V2. El manifiesto enumera exactamente el delta; no se copian de nuevo miles de archivos de V1. No se modifica normativa, producto, migraciones, H0–H5, Tasks, decisiones o evidencias previas.

## H. Identidad final, reproducción y límites

`candidate-manifest-corrective-v2.json` referencia la base Git, el inventario V1 custodiado y el delta con descriptores completos; permite reconstruir el conjunto actual. Excluye únicamente sus tres envolturas nuevas para evitar autorreferencia. El sello vincula el manifiesto y el readback verifica ambos junto al conjunto, Git y dependencias externas. La huella del readback se entrega fuera del propio documento.

V1 se valida en su custodia, no contra los tres instrumentos ahora modificados del workspace. No se sobrescriben sus manifiestos para ocultar esa diferencia. Los archivos y recibos de auditoría se referencian por identidad; el TAR de recuperación y el TAR V1 permanecen en ubicaciones locales duraderas. `corrective-v2/reproduction.md` detalla la reejecución en copia.

Las 68 migraciones mantienen sus bytes oficiales. La verificación final comprueba contenido/modo de la base, índice y todas las rutas V1 salvo las tres autorizadas. No quedan clústeres o procesos propios activos. Los archivos temporales de ensayo son sintéticos y están parados; su existencia no acredita servicios reales.

Se recomienda auditoría independiente focalizada de las tres correcciones y del nuevo readback. Este PASS técnico no sustituye esa auditoría ni la aceptación del director. No se ha preparado un conjunto autorizado para GitHub. STOP tras la entrega.
