# TSK-H6-013 — candidato técnico para revisión independiente

A. Resultado ejecutivo

**PASS técnico propuesto, exclusivamente local/aislado.** No es aceptación independiente ni declaración de TSK-H6-013 COMPLETED. H6 no se declara completada. El director decide su aceptación después de auditoría.

Base probada: `8a5f1408777b81b760a02646fa414a34dc17983e`; árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`; rama `main`. Antes de escribir ensayos: HEAD/árbol exactos, índice y working tree versionado limpios, README/instrucciones revisados, objetos Git y dependencias disponibles. No había cambios ajenos que preservar. El inventario inicial conserva 38.702 rutas versionadas y sus SHA-256. Ninguna ha cambiado.

Se ejecutaron dos instalaciones completas, verificación de cada SQL y su autoridad, fallo/reintento/reaplicación, cinco recorridos poblados hasta68, contratos históricos recuperados de Git, cinco pruebas negativas nuevas, permisos exhaustivos de tablas y regresión heredada completa. No se modificó producto, persistencia, SQL, RLS, contratos ni normativa aprobada.

B. Inventario de migraciones y versiones

| Paquete | Ordinales | SQL | Cobertura ejecutada |
|---|---:|---:|---|
| H0 | 1–18 | 18 | Bootstrap separado; dos fresh; probe desde2; fallos, orden incorrecto, rollback y reintento; suites F1/M02/F2/HA/TTE/M05/M06. |
| H1 | 19–25 | 7 | Dos fresh; suites históricas de identidades, archivo/fusión/códigos, catálogo, configuración, evidencia, objetos y Task; datos H1 conservados a través de27–68. |
| H2 | 26–30 | 5 | Suites históricas de cada módulo/predecesor y cinco pasos en la cadena; Booking/Acceptance/versiones/términos desde30 a68. |
| H3 | 31–37 | 7 | Suites históricas por módulo; importe500.00, asignación125.00 y consumo25.00 desde33, preservados34–68. |
| H4 | 38–52 | 15 | Suites focales, V-MIG, atomicidad, concurrencia y objetos privados; preparación y economía desde52, conservadas53–68. |
| H5 | 53–68 | 16 | Suites V-MIG heredadas, cierre63→68 y transición final67→68 poblada, rollback/reapply y ACL; S6 e integración H5-019 reejecutadas. |
| Total | 1–68 | **68** | Orden completo idéntico al inventario oficial. |

Identidad del conjunto: SHA-256 **`139c5cfb7bbfb94e18739e82af6f7d7eec0f7c4fb30ca39e5bc575611b945941`**, calculado sobre líneas ordenadas `sha256 + dos espacios + ruta + LF`. `migrations.json` contiene nombres, hashes, tamaños, orden, autoridad y cabeceras de los68 archivos. Las autoridades de bootstrap son1/3/6/15; el resto utiliza `crm_h0_migration`. Los68 objetos originales Git están disponibles.

`migration-provenance.json` distingue bytes actuales de primera introducción:21 archivos tuvieron correcciones históricas anteriores a esta tarea. **No se confunden con alteraciones realizadas por H6-013.** `version-origins.json` verifica los bytes de cada prefijo contra un árbol Git auténtico. Los prefijos1/3/6/15/59/60/64/65/66/67 son estados intermedios dentro de paquetes de varios SQL; no se presentan como releases Git separados. La transición67→68 usa el fixture histórico existente y el prefijo SQL versionado67, no un release67 inventado.

Entorno: PostgreSQL17.11 Postgres.app, Node24.21.0, pnpm11.19.0, dependencias fijadas en package.json/lockfile. Runtime actual de aplicación identificado por el commit base; `version=0.0.0` no se inventa como una versión de release. Configuración de Auth y proveedores simulada; PostgreSQL y Supabase Storage de backend de archivos son reales y locales. Storage fijado al commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e` por el runner histórico. Bases/socket/puertos y datos sintéticos separados.

Inventario observado final:175 tablas,309 índices,3 vistas,305 funciones (290 nombres distintos),332 políticas,1.037 restricciones y10 roles CRM; nueve membresías. Los atributos y dependencias se conservan en logs de catálogo y dumps; el inventario observado no fue usado para inventar el expected. Oráculo estructural: CREATE/DROP del SQL oficial, con175 tablas y265 nombres de funciones estáticamente exigibles; los objetos dinámicos se contrastan también con suites históricas.

C. Matriz normativa

Las **13 filas literales** de Tasks§6 están congeladas con sus líneas en `normative-rows.json`; matriz previa en `matrix-TSK-H6-013.md`. Los nueve documentos de autoridad se leyeron directamente del commit oficial y coinciden byte a byte con el workspace. Se aplicaron Tasks2.2–2.3/6/7 y Plan5.4/10.1/11.4.

| Fila | Contraste ejecutado | Resultado del tramo H6-013 |
|---|---|---|
| SPEC-FR-HIST-002 | B03–B07, filas/columnas anteriores, versiones/términos, Acceptance, historia, replays; C03. | SATISFACTORIA local. |
| AC-079 | Dos clústeres nuevos, roles y recursos sintéticos; URLs loopback/socket; réplicas sin configuración productiva. | SATISFACTORIA local. |
| SPEC-NFR-004 | Separación de recursos/secretos; ningún recurso de negocio/Hosted/Production. | SATISFACTORIA local. |
| SPEC-NFR-005 | Fallos de migración, rollback íntegro, reparación hacia delante y reintento; dato original conservado. | SATISFACTORIA en recuperación de paquete. Restauración integral/objetos/RPO/RTO permanece en H6-014/015, no iniciadas. |
| SPEC-NFR-012 | Identidad, archivo/fusión y versiones históricas; B02–B07 y regresión correspondiente. | SATISFACTORIA local. Política de privacidad no resuelta por estos ensayos. |
| SPEC-NFR-015 | Expected sellados, incidencias conservadas, Git/preservación, versiones y evidencia auditable. | SATISFACTORIA local; aceptación pendiente. |
| DM-INV-028 | Catálogo/tarifas/términos/cálculos y snapshots exactos; B03/B04 y suites H1/H2/H3. | SATISFACTORIA local. |
| DM-INV-051 | Suite H1-004, archivo recuperable/fusión y no reutilización; B02 y seguridad directa. | SATISFACTORIA local. DM-PENDING-005 OPEN. |
| ARCH-DEC-017 | Recursos de ensayo separados, runtime local y dobles de fronteras. | SATISFACTORIA local; no Staging hosted. |
| P13 | Cadena versionada, SHA de cada SQL, fallos antes de COMMIT, recovery/reapply y cero edición histórica. | SATISFACTORIA local. |
| PLAN-DEC-003 | Relaciones reales/FK, IDs estables, snapshots y datos exactos, restricciones negativas. | SATISFACTORIA local. |
| PLAN-B10 | Inventario, trazabilidad, compatibilidad acotada, resultados y recuperación de migración. | SATISFACTORIA en H6-013; otras tareas H6 sin ejecutar. |
| G4 | Conservación exacta y rechazo de UPDATE/DELETE directos; contratos históricos. | SATISFACTORIA local. |

Las filas compartidas no se declaran globalmente cerradas. Esta tabla solo informa el tramo de migración verificable asignado a H6-013; no absorbe H6-014/015/017/018.

D. Instalación desde vacío

`chain-attempt-03/chain-result.json`: **410 comprobaciones PASS,0 FAIL**, separadas de los contadores de tests Node. Dos initdb nuevos; API roles presentes antes de la cadena en uno y creados después de68 en otro. Cadena completa1–68, mismo orden, autoridades realmente distintas. Se probaron66 fallos SQL previos a COMMIT y67 reaplicaciones: rechazo seguro o mismo estado sin duplicados. El fallo parcial de M01 sin BEGIN explícito se ensayó adicionalmente como un único mensaje SQL con PostgreSQL real; revierte todos sus statements y reintenta correctamente.

Ambos dumps normalizados coinciden byte a byte, SHA-256 `1f4af99b4ce68d749527239876b6b939110fb40534e2f5cc8ed1e57117f8dbb9`. La normalización solo elimina guardas aleatorias de transporte de pg_dump y metadatos de fecha/versión; conserva DDL, índices, restricciones, funciones, permisos y políticas. No basta exit0: se comprobaron objetos esperados, catálogo, permisos, RLS, filas y los resultados funcionales de las suites.

E. Actualización y compatibilidad

| Caso nuevo definitivo | Origen→destino | Pasos poblados | Evidencia |
|---|---|---:|---|
| B02 | 26→68 | 42 | Identidad y relación contextual H1; todas las tablas/columnas originales. |
| B03 | 30→68 | 38 | Booking, Acceptance, propuesta fijada, términos, IDs y referencias. |
| B04 | 33→68 | 35 | Recepción500.00, asignación125.00, consumo25.00; actos e historia. |
| B05 | 52→68 | 16 | Preparación, confirmaciones y hechos económicos anteriores. |
| B06 | 63→68 | 5 | Tres dimensiones de cierre, cierre conjunto e historia. |
| Total | | **136** | Cada paso guarda before/after por tabla con conteo y SHA-256 de todas las columnas preexistentes. |

Los cinco tests definitivos son5/5 PASS en `cross-upgrade-04`. Se reutilizan fixtures históricos sin editar; los nuevos datos se generan con sus APIs reales. No se toman resultados de aplicación como único oráculo: los hashes de datos anteriores, normativa y reglas monetarias independientes siguen mandando. El probe auténtico de H0-010 se conserva desde2 a través de toda la cadena en las dos instalaciones.

Compatibilidad de contratos históricos: se recupera `src/` íntegro de cada commit de `expected-applications.json`, se verifica SHA del adaptador, se ejecutan su Auth/interacción de la misma versión (incluidas sus marcas no serializables) y se usa el login ordinario. H1 `00cf358c…`, Booking `38793e67…`, Allocation `95538688…`, realidad `0363d9a5…`, cierres `9649a277…` funcionan en el esquema origen y después de cada expansión hasta68. Booking/Allocation prueban además replay con sus adaptadores históricos. Son identidades de código auténticas, algunas anteriores al correctivo final del SQL de su paquete; los prefijos de esquema utilizados se verifican separadamente contra sus árboles canónicos corregidos en `version-origins.json`.

La regresión conserva los fixtures fijados de predecesores de H0–H5 y prueba sus migraciones pobladas. `historical-migration-cases.json` enlaza títulos PASS reales con su fase/log, sin inferir cobertura simplemente por nombre de archivo. La transición67→68 está incluida mediante `postgres-h5-018-sixth-migration.test.ts`: tablas/datos, OID, owners/ACL, roles, políticas, dependencias, fallo inyectado, recuperación/reaplicación y replay.

Cobertura no acreditada: combinaciones arbitrarias de releases antiguos y esquemas, un release completo antiguo por cada uno de los68 prefijos, downgrade de esquema, tráfico hosted/poolers, restauración integral o uso real. El PASS corresponde a los contratos y recorridos explícitos; no convierte los cinco adaptadores históricos en una validación de todos los módulos de esos releases. H0-M01 anterior a F1 no es un fallback seguro: la evidencia histórica exige no habilitar runtime con actualización de seguridad incompleta.

F. Seguridad, historia y contexto

Migrador `crm_h0_migration`, runtime `crm_h0_runtime` y HA/TTE `crm_h0_ha_tx` son logins separados. Runtime/HA no son propietarios, superusuarios, BYPASSRLS, CREATEROLE ni CREATEDB, ni pueden adoptar el migrador. Los roles de bootstrap solo se utilizan para bootstrap/observación y fixtures administrativos.

`negatives-04`:5/5 PASS. Se intentaron **2.800** SELECT/INSERT/UPDATE/DELETE directos (175 tablas×4 roles×4 verbos) con runtime/HA/anon/authenticated: todos rechazados con42501. Se comprobaron128 funciones SECURITY DEFINER de esquemas de autoridad, propietarios NOLOGIN/no super/no bypass y search_path explícito. RLS+FORCE RLS se contrasta sobre todas las tablas privadas y en suites específicas; no se sustituye la identidad ordinaria por propietario o service_role.

Se intentaron contexto ausente, MAC/contexto falsificado, GUC falsificado persistente, escalada SET ROLE y escritura/borrado de historia. Estado original intacto. Las suites H0/H1–H5 reejecutan contextos autorizados, actor inhabilitado, sesión revocada, otras operaciones/alcances y no herencia en reutilización/concurrencia. La autoridad de Auth externa se simula: no acredita Auth hosted.

G. Fallos, reparaciones y regresión

| Evidencia conservada | Incidencia y resolución autorizada |
|---|---|
| chain-attempt-01 | Fixture nuevo usó admin_scope en vez de la forma histórica posicional access_probe. Error ordinario de instrumento; runner original/log conservados. |
| chain-attempt-02 | Dos FAIL del oráculo estático por exigir record_probe, eliminado expresamente por migración4. Expected original intacto; suplemento v2 incorpora DROP y exige ausencia. Nueva ejecución completa410/410. |
| cross-upgrade-01 | Dos FAIL por exigir respuesta de lectura idéntica a través de expansiones46/62. Filas originales intactas. Suplemento v2 exige los valores nuevos exactos y toda propiedad anterior, sin excepciones genéricas. |
| cross-upgrade-02 | 5/5, aún con adaptadores actuales; se amplió después para ejecutar bytes históricos. No se suma como cinco tests distintos. |
| cross-upgrade-03 | 4/5: fixture nuevo usó f.bookingId en lugar de f.bid para realidad. Corregido únicamente el fixture; original/log conservados; cross04 5/5. |
| quality-attempt-01 | Réplica incompleta sin fixtures TS/Git y symlink de node_modules externo rechazado por Turbopack. Réplica completa verificada y copia local de dependencias resolvieron tipos/unit/build. |
| typecheck-final | Tipo ProcessEnv requería NODE_ENV. Se añadió NODE_ENV=test solo al proceso nativo de ensayo. Logs originales conservados; tipos definitivos PASS. |
| negatives01–03 | Intentos anteriores conservados. Revisión del CHECK detectó que otro CHECK de group/context rechazaba antes que estimated_size. Se fortaleció el fixture con contexto válido y aserción del nombre exacto de la restricción; negatives04 es el definitivo. Ningún PASS previo se usa para atribuir ese CHECK concreto. |

Casos negativos definitivos:22012 durante M01, orden incorrecto con3F000 y reparación hacia delante, duplicado23505, **identity_entities_estimated_size_check**23514 y FK23503; rollback y originales preservados. No se borra ningún dato ni se relaja una restricción para pasar. En SQL de expansión20/22/53 los nuevos campos/condiciones no justifican fabricar un estado previo inválido saltándose sus restricciones; se prueban predecesores válidos, incompatibilidades de entrada, orden/esquema no preparado y fallos DDL reales.

Regresión completa pertinente porque la nueva verificación integra todos los paquetes y permisos: **2.950/2.950 PASS**,0 fail/cancelled/skipped,198 archivos únicos en15 fases disjuntas. Selección oficial de H5-019196 archivos más S6-migración y H5-019-integrated. Hook oficial `h5-017-g-hook.mjs` explícito; assertions y fuentes históricas intactos; los ensayos de migración retienen sus predecesores fijados. Las cuatro salidas históricas regeneradas solo en réplica están copiadas en `regression-generated/`; originales del workspace intactos.

Unitarias208/208; instalación congelada offline con scripts de instalación deshabilitados, typecheck, lint/fronteras y build PASS. Typecheck definitivo incluye los dos nuevos tests. Health operativo no se reejecutó: no es la cadena funcional ni es necesario para este cambio de instrumentos. Auditoría de dependencias online no reejecutada; no se alteraron dependencias. No se suman2950,208,410,136 o2800 como si fueran una única población de tests:136 son pasos de cinco tests;2800 son intentos dentro de un test;410 son checks del runner SQL. Las repeticiones y los tests históricos no se cuentan como nuevas capacidades.

H. Cambios realizados

Solo rutas nuevas de H6-013:

- `scripts/prepare-h6-013.py`: preflight, inventario y expected inicial (rechaza sobrescribir evidencia).
- `scripts/verify-h6-013-chain.py`: clústeres propios, cadena, hashes, rollback/reapply y comparación.
- `scripts/verify-h6-013-regression.py`: réplica íntegra, selección/fases heredadas y protección de workspace; admite etiqueta nueva de salida para reproducir sin sobrescribir.
- `scripts/check-h6-013-quality.py`: comprobaciones en réplica completa con dependencias propias.
- `scripts/verify-h6-013-evidence.py`: verificador de solo lectura de fuentes, expected, logs, contadores y manifiesto; no sustituye auditor independiente.
- `tests/integration/postgres-h6-013-migration.test.ts`: cinco recorridos poblados con adaptadores actuales e históricos.
- `tests/integration/postgres-h6-013-negatives.test.ts`: cinco casos negativos/seguridad; ningún cambio productivo.
- `specs/001-core-crm/expected-TSK-H6-013.md`, `expected-TSK-H6-013-v2.md`, `matrix-TSK-H6-013.md`, `evidence-TSK-H6-013.md`: expected previo, corrección trazada, matriz e informe.
- `tests/fixtures/h6-013/`: inventarios, sellos, originales de instrumentos, before/after, logs, resultados y manifiesto. **La lista individual exacta de rutas y hashes está en candidate-manifest.json; git-state-final.json conserva el estado Git.**

Cero rutas versionadas modificadas. No se editaron cierres H0–H5, Tasks, decisiones ni otras tareas H6. Los cambios de instrumentos se justifican en G; no hay parche de producto que precise autorización.

I. Evidencia, integridad y reproducción

Raíz: `tests/fixtures/h6-013/`. Entradas: base-inventory/migrations/normative-rows/expected-structure[-v2]/expected-applications/version-origins/expected-seal[-v2/-v3]. Salidas definitivas: chain-attempt-03, cross-upgrade-04, negatives-04, regression-result y15 logs originales, quality-result y typecheck-final-03. Las revisiones originales se conservan completas.

`candidate-manifest.json` enumera todas las rutas nuevas entregadas y sus SHA-256; `candidate-seal.json` identifica ese manifiesto. Se excluyen del propio manifiesto sus dos archivos de sellado y el recibo posterior de verificación para evitar referencias circulares. La base versionada completa tiene inventario independiente. No contiene credenciales, secretos de configuración ni datos personales reales; los hashes de tablas no vuelcan claves sintéticas.

Comandos desde esta raíz, siempre con etiquetas NUEVAS:

```sh
python3 scripts/verify-h6-013-evidence.py
python3 scripts/verify-h6-013-chain.py auditor-chain-01
H6013_CAPTURE_DIR="$PWD/tests/fixtures/h6-013/auditor-cross-01" POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node scripts/test-postgres.mjs postgres-h6-013-migration.test.ts
H6013_NEGATIVE_DIR=tests/fixtures/h6-013/auditor-negatives-01 POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test --experimental-strip-types tests/integration/postgres-h6-013-negatives.test.ts
python3 scripts/verify-h6-013-regression.py auditor-regression-01
```

Revisar efectos antes de ejecutarlos: initdb/pg_ctl propios y fuentes locales; la regresión utiliza Storage local y advisors CLI con DB URL loopback. El verificador es de solo lectura; los otros escriben únicamente pruebas/evidencia nuevas y recursos temporales. `prepare-h6-013.py` documenta el expected inicial y no debe usarse para reemplazar sellos existentes. Repetir quality en copia nueva de sus entradas; sus salidas fijas también rechazan sobreescritura. Los clústeres retenidos están detenidos; no se inicia servicio productivo. Las fuentes históricas se recuperan de Git local, sin fetch ni modificación de ramas.

J. Riesgos y límites pendientes

No hay defecto material reproducido de producto abierto en los casos ejecutados. Los errores de instrumentos están conservados y corregidos con reejecución. El auditor debe juzgar la suficiencia de los contratos/versiones muestreados para el alcance normativo; no se ofrece garantía universal para cualquier release antiguo. No se midieron ventanas de mantenimiento ni bloqueo/rendimiento productivo bajo carga real; los locks/carreras de seguridad se prueban en sus suites sintéticas. Ninguna medición local se vende como SLA.

Hosted/Production NO ACREDITADOS. Sin datos, servicios de negocio ni efectos externos reales, publicación o despliegue. DM-PENDING-005 OPEN; objetivos/política de restauración de Production pendientes; ninguna decisión cerrada. Auth/Storage local no acreditan proveedor hosted. La prueba técnica no habilita acceso real.

K. Dictamen y trabajo del auditor

**Candidato preparado para auditoría independiente; PASS técnico propuesto en el alcance ejecutado.** El auditor debe: verificar base/árbol y38.702 hashes; sellos y cronología de expected/suplemento; diferenciación de prefijos intermedios y versiones auténticas; comparar dos dumps; reejecutar casos elegidos sin aprender expected del observado; revisar136 before/after y hashes de adaptadores históricos; comprobar transición67→68 y cambios permitidos de cuerpos; intentar seguridad y constraints por su nombre; reconstruir2950 sin doble conteo desde15 logs; revisar fallos originales y restauración del workspace.

La aceptación definitiva requiere su revisión y la decisión del director. Ni este informe ni el verificador interno son una auditoría independiente. Si el auditor identifica un hueco exigible, debe delimitarlo sin convertirlo en PASS por las regresiones existentes. Si exige tocar producto/migraciones/seguridad, se preserva FAIL y se aplica STOP al cambio no autorizado.

L. Git final y STOP

Rama `main`; HEAD `8a5f1408777b81b760a02646fa414a34dc17983e`; árbol base `758e871c7ad621dcbdb69516cccd175e529dbd6e`; índice idéntico al árbol base, sin entradas staged. Todos los cambios son nuevas rutas H6-013, enumeradas en el manifiesto. Ninguna de las38.702 rutas base cambió, ni se borró/sobrescribió un cambio ajeno. La referencia origin/main local conservada coincide con HEAD; no se presenta como una consulta remota actual.

No se ejecutaron commit, tag, creación de rama, reset/clean/checkout, push, merge ni deploy. La reproducción usa copias de metadata Git e index separados y objetos de solo lectura; no crea commits/ramas en el repositorio. H6-014 y demás tareas no iniciadas. **STOP tras entrega: cualquier publicación GitHub o continuidad necesita autorización expresa posterior.**
