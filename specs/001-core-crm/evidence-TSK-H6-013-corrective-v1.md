# TSK-H6-013 — correctivo controlado v1

**PASS técnico propuesto exclusivamente local/aislado, pendiente de segunda auditoría independiente.** No es aceptación del director, cierre de tarea ni autorización de publicación. Este suplemento conserva el informe, expected, manifiestos, sellos y FAIL anteriores.

## Base y custodia

Base `8a5f1408777b81b760a02646fa414a34dc17983e`, árbol `758e871c7ad621dcbdb69516cccd175e529dbd6e`, rama main. Las38.702 rutas versionadas, contenido/tipo/modo e índice permanecen iguales. SHA-256 del índice: `dd9da263b778f8c5fe9966c98ea90cfdae994e91f6f0f301af62679b35e42b27`.

Antes de modificar instrumentos se contrastaron las9.658 rutas locales con el inventario independiente `0133a88529999eaada20798d088ecefc2b849875184d94c0a263189a23db9182`. El manifiesto original conserva SHA-256 `64bd0caf4f307404f325d9351c9545a60473cf24827b3cbda1d31aad1ff8f0fa`.

Custodia nueva, duradera y fuera del repositorio: `/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-precorrectivo-20261019T233427Z`. Conserva9.658 archivos del candidato,120.988.957 bytes, y53.211 archivos probatorios del auditor,854.123.938 bytes. Inventarios registran tipos, modos, tamaños y hashes. El recibo previo tiene SHA-256 `d5475c0f6e73fe372478844e6743b89d967d06deca8a2374232ca3af8fd712ac`. No es WORM ni tiene garantía externa. Se excluyeron explícitamente cachés, dependencias y directorios físicos desechables de PostgreSQL/Storage con credenciales sintéticas de runtime; se conservaron fuentes y resultados probatorios. No hubo cargas externas ni inclusión de credenciales reales.

El readback posterior detectó18 logs vacíos del auditor con modo0600 en esa copia frente a0644 inventariado. Tamaño, tipo y contenido siguen intactos; los ctime observados son posteriores al recibo inicial. No se atribuye una causa sin prueba. Las9.658 rutas de candidate-original siguen coincidiendo exactamente. Sin sobrescribir la custodia, se creó `/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-auditor-mode-recovery-20261020T003002Z`, con las18 copias originales aún disponibles, comprobadas contra el inventario previo. Recibo SHA-256 `15217e5be562832c0e794bee2bd61e4afda7417f7fcfa7b978d85cbfb7d9f654`. Ese primer suplemento recupera sus18 descriptores exactos; véase `corrective-v1/custody-mode-recovery.json`. Al observar después otro log vacío con la misma diferencia de modo, se creó además una custodia completa recuperable: `/Users/andres/Documents/CRM_HUESCAVENTURA_AUDIT_CUSTODY/H6-013-auditor-archive-recovery-20261020T003459Z`. Su TAR conserva explícitamente los53.211 modos/tipos/tamaños y contenidos originales, comprobados contra el inventario previo; las fuentes originales del auditor siguen coincidiendo íntegramente. SHA-256 del archivo: `0ce0d6f83f1affdd9002b23676bc7daf0fb7c160257d696cac8f287676449f0f`; recibo: `54d42264948cc97bbce3fe501abb88cb2ab44a5eb35da88e2cc6233ea52a61a8`. El TAR ocupa931.594.240 bytes y no se añade al repositorio. El readback final exige esta recuperación completa; no oculta la diferencia de permisos de la primera copia. Las custodias previas no se sobrescriben y la incidencia queda visible para el segundo auditor.

## Normativa y expected

Se leyeron nueve fuentes directamente desde la base oficial y se contrastaron con el workspace: Constitution, Decisions, Architecture, Domain Model, State Machines, Business Rules, SPEC, Plan y Tasks. Se mantuvieron las13 filas asignadas: SPEC-FR-HIST-002, AC-079, SPEC-NFR-004/005/012/015, DM-INV-028/051, ARCH-DEC-017, P13, PLAN-DEC-003, PLAN-B10 y G4. `corrective-v1/normative-recheck.json` conserva literales, líneas y hashes; los protocolos V-MIG/V-DAT/V-NEG/V-EVI y los límites originales siguen vigentes.

Los tres sellos originales de expected, de21:25:18Z,21:28:33Z y21:29:44Z, permanecen sin cambios, incluida la corrección documentada tras los primeros FAIL. No se sustituyen sus resultados.

El nuevo expected ejecutable se creó a23:37:40Z y se selló a23:40:37Z, antes de la primera ejecución a23:41:16Z. SHA-256 expected: `2094317ceb94b729ce5d4e4892fb40cfaba553fea88fe19606f586568b084671`; sello: `910ca9c8efb252ff65c5eccc813fb8a930c7f2aa580dcc1b4aba345bebd38ddd`. El inventario132 procede del catálogo independiente previo del auditor, conservado y verificado; SHA del expected de funciones: `e938a5928e58b82df708c7b33504d60cc45aab7e2b2022087cbc3e1a55de6774`. No se deduce ese conjunto del resultado del nuevo test.

El suplemento temporal de un fixture ordinario descubierto en regresión se selló a00:16:32Z, antes de sus controles y repetición: expected SHA-256 `7305c6aaedc36cb67babc890783e5ae69b727e8086a6419379d3e7b567532a80`, sello `94863149b20ab4fb17bf5cdb27ef84f306115c13e465dc562fbf4e8c819e48ed`. Conserva la regla SQL y el FAIL anterior. Las etiquetas de intentos no implican orden temporal: consultar `execution-chronology.json`.

## Hallazgos y modificaciones autorizadas

Solo se modifica un archivo del candidato previo: `tests/integration/postgres-h6-013-negatives.test.ts`. Su original está en custodia. No cambia ninguna ruta de la base, SQL productivo, función, permiso, RLS, test H0–H5, evidencia anterior ni normativa.

Se añaden helpers H6 de catálogo/seguridad y preservación, el test H1, el test temporal, el adaptador temporal y el hook H6; tres scripts H6 de ejecución, sellado y readback; suplementos de expected/matriz/evidencia; entradas, snapshots, logs y recibos nuevos bajo `tests/fixtures/h6-013/corrective-v1/`. El manifiesto nuevo proporciona la lista exacta, incluidos archivos añadidos y el único modificado.

**AUD-H6013-01:** se descubren todas las SECURITY DEFINER de namespaces no pertenecientes al sistema, incluidos namespaces inesperados fuera de CRM. Se compara el conjunto exacto de firmas, esquemas, propietarios y EXECUTE efectivo contra inventario independiente. Cada función genera evidencia individual. Los propietarios no tienen SUPERUSER/BYPASSRLS/LOGIN/CREATEROLE/CREATEDB. Se incluyen expresamente:

- `crm_ha.check_evidence_at_end(text)`.
- `crm_ha.effect_record_allows(text,text,text,text,text,text,text)`.
- `crm_ha.evidence_commit_guard()`.
- `crm_internal.commit_internal_unit_core(bytea,bytea,bytea)`.

**AUD-H6013-02:** se exige un search_path explícito único, leído de pg_proc.proconfig y analizado completo, exactamente `pg_catalog, pg_temp` en ese orden. Se rechazan ausencia, public, orden inverso y ambigüedad.132 es la fotografía verificada de esta base, no una constante normativa universal. La recomendación técnica de fijar un search_path seguro y situar pg_temp al final se contrasta con [PostgreSQL17 CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html#SQL-CREATEFUNCTION-SECURITY).

Siete controles transaccionales reales: propietario inseguro en función antes omitida; public; pg_temp,pg_catalog; configuración ausente; inventario deliberadamente128; función nueva fuera de CRM; grant ordinario inesperado. Todos son detectados por su causa concreta; rollback devuelve el catálogo completo a su estado anterior. El conjunto legítimo132 pasa después. No se cambia producto para acomodar el instrumento.

**AUD-H6013-03:** nuevos ensayos H6 cubren19→20,20→21,21→22,22→23 y cuatro enlaces adicionales relevantes18→19,23→24,24→25,25→26. Se usan bytes SQL auténticos de Git con SHA verificado y fixtures poblados mediante contratos reales. Cada paso conserva todas las columnas anteriores, registros, IDs, relaciones, restricciones y lecturas legítimas. Los snapshots ordenados contienen conteos, columnas y SHA completos; los hechos de negocio se leen también de forma explícita. Los valores de claves técnicas no se vuelcan.

| Transición | Tablas previas | Tablas pobladas | Filas previas |
|---|---:|---:|---:|
|18→19|23|6|6|
|19→20|29|12|24|
|20→21|31|14|30|
|21→22|36|18|48|
|22→23|41|22|54|
|23→24|45|26|58|
|24→25|48|27|61|
|25→26|49|28|64|

Se detectan23 alteraciones deliberadas:8 cambios de valor con igual conteo,8 pérdidas de fila y7 cambios de referencia válida. Todos se revierten y se compara el contenido restaurado. Ocho fallos DDL inyectados antes de COMMIT prueban rollback y reintento del SQL original. Se prueban FK23503, UNIQUE23505, RLS/FORCE RLS, denegación directa y acceso legítimo. Los campos nuevos de archivo/fusión comienzan nulos conforme al SQL; los actos de preparación posteriores se distinguen de la migración. La metadata24 está prepared y Task25 pending. Este ensayo no acredita contenido binario de Storage. Los cuatro resultados externos del auditor permanecen separados en su custodia, sin mezclar sus ejecuciones con las nuevas.

## Ejecuciones nuevas y contadores

Selección exacta por componente en `corrective-v1/verification-summary.json`, con stdout/stderr/status originales y procedencia por intento. No se atribuye PASS global al intento03, que conserva fallos de entorno; se reutilizan únicamente sus componentes completos que sí pasaron en esta ejecución del correctivo.

| Verificación | Resultado nuevo | Procedencia |
|---|---|---|
|Catálogo completo, CRUD y controles de seguridad|13/13 entradas Node PASS;132 funciones;7 mutantes;2.800 SQLSTATE42501|attempt-12/negatives|
|Preservación H1|9/9 entradas Node PASS;8 pasos;23 mutantes de datos;8 rollback/retry|attempt-12/h1|
|Cadena68 SQL, dos instalaciones vacías|410/410 checks PASS; dumps normalizados idénticos|attempt-03/chain|
|Actualizaciones26/30/33/52/63→68|5/5 PASS;42+38+35+16+5=136 transiciones|attempt-03/cross|
|Recorrido67→68 con fixture histórico|PASS; junto con5 recorridos anteriores,7 entradas Node|attempt-03/cross-s6 logs|
|Regresión PostgreSQL198 archivos únicos|2.950/2.950 entradas PASS;0 fail/cancelled/skipped/todo|fase1 attempt-10; fases2–14 attempt-03; fase15 attempt-16|
|Controles temporales antes/después|2/2 PASS|attempt-15/temporal|
|Unitarias|208/208 PASS|attempt-13|
|Frozen install, typecheck, lint y build|PASS los cinco comandos incluyendo unitarias|attempt-13|

Los2.800 intentos son175 tablas×4 roles×4 verbos; runtime, TTE, anon y authenticated existen y reciben42501, no errores de conexión o tabla inexistente. Se mantienen además pruebas de contexto ausente/forjado/residual y denegación de SET ROLE migrador. Las rutas API legítimas pasan en fixtures y regresión. No se infiere corrección simplemente de denegar todo.

El SHA-256 de ambos esquemas normalizados sigue siendo `1f4af99b4ce68d749527239876b6b939110fb40534e2f5cc8ed1e57117f8dbb9`. Se conserva estructura, constraints, funciones, grants, triggers y políticas, además de las aserciones de catálogo y comportamiento. Los cinco contratos históricos y sus fuentes Git siguen delimitados por el informe original; las ejecuciones chain/cross y regresión aquí citadas son nuevas. No se inventan releases para prefijos internos ni se acredita una matriz arbitraria de versiones.

**AUD-H6013-04:**2.950 son resultados del runner Node, que incluyen contenedores/subtests y etiquetas históricas. No equivalen a2.950 criterios de negocio independientes. Se conservan R091/R092 y sus pruebas reales en `postgres-h3-014.test.ts`: actualización poblada36→37 y fallo/rollback de migración. No se suman2950,208,410,136,132 y2800 como una población homogénea; tampoco se suman repeticiones. Los FAIL históricos continúan siendo FAIL históricos.

## Incidencias de instrumento y entorno conservadas

`instrument-incidents.json` y los16 intentos conservan errores de canonicalización macOS, instalación/caché privada, tipos de fixture nuevos y formato del CLI nativo. El CLI real2.119.0 se comprobó contra salida JSON explícita; AI_AGENT=codex restituye su formato estructurado nativo, sin transformar resultados ni editar assertions. Las28 fallas JSON y el ENOTCACHED del intento03 se preservan. Las fases completas afectadas se repitieron.

Tras medianoche UTC, el intento10 registró2.750 PASS/1 FAIL en fase15: F12 contenía un hecho fijo00:00Z que ya no era futuro respecto de la acción por defecto. Un adaptador H6 usa el options.at de dominio existente exclusivamente para ese fixture y conserva el hook oficial, fuentes y aserciones históricas. No reemplaza el reloj del servidor ni Auth/F1/F2. Controles reales antes/después validan tanto rechazo cronológico como acceso legítimo. La fase15 repetida termina2.751/2.751 PASS; el FAIL sin adaptar permanece FAIL.

El recolector inicial omitía.mjs en los snapshots de fuentes. El hook exacto ejecutado se leyó dos veces durante la ejecución, a00:19:53Z y00:22:02Z, antes del marcador F12, y coincide con el candidato por SHA. No se presenta como archivo previo al inicio. El recolector ya incluye.mjs para futuras ejecuciones. La colisión de nombres entre esos dos recibos hizo que el driver exterior rechazara sobrescritura: exit1 de recogida, mientras el proceso de tests dio exit0. Ambos recibos y el error se conservan; `attempt-16/collection-recovery.json` verifica33 salidas recuperadas byte a byte, sin reescribir resultados ni alterar el test.

## Aislamiento, calidad y readback

Se inspeccionaron runners y efectos antes de ejecutarlos. Todas las pruebas usan réplicas privadas, PostgreSQL17 propio y datos sintéticos, con sandbox de escritura limitado a su workspace y red de tests limitada a loopback/Unix. Frozen install usa lockfile original, --ignore-scripts y store privado; se permite únicamente preparación de dependencias públicas, sin conexiones de negocio. No se reutiliza un HOME con credenciales. CLI y Storage están fijados; Storage procede del commit oficial5def1dfc15ab7f08fe271c7d1e70542424524e4e y se registra su identidad.

Las salidas históricas regeneradas existen solamente en las réplicas y se conservan separadas. Los originales del repositorio no se han sustituido. Cada ejecución seleccionada confirma cero errores de base, cero cambios inesperados y cero postmaster.pid activos al terminar. AST de Python, sintaxis del hook y hashes de las fuentes TypeScript contrastadas con la calidad final completan las comprobaciones del instrumento. No se repite health operativo ni auditoría online de vulnerabilidades; no se atribuye PASS a esas verificaciones.

El volumen conserva historia, fallos, snapshots de instrumentos y logs por intento; no incluye node_modules, almacenes de paquetes ni clústeres físicos en el candidato. No se elimina ni compacta evidencia. La publicación exige revisión y autorización separadas de su inventario completo.

Nueva identidad: `candidate-manifest-corrective-v1.json`, `candidate-seal-corrective-v1.json` y `final-readback-corrective-v1.json`. El manifiesto incluye el conjunto actual y las tres envolturas originales; excluye únicamente sus tres archivos finales para un sellado acíclico explícito. El readback interno reconstruye rutas, tipos/modos/tamaños/hashes, originales, Git/índice, catálogos, mutantes y contadores; no sustituye una segunda auditoría independiente. Los hashes finales se entregan en la conversación tras el sellado.

**Límites:** no Hosted/Production, datos reales, downgrade, publicación, restauración integral, combinaciones históricas no ejecutadas ni cierre global de otras tareas. DM-PENDING-005 y Tasks permanecen intactos. El director y el segundo auditor deben evaluar la nueva identidad, la recuperación de metadatos de custodia y la procedencia explícita del hook y recogida. No se declara H6-013 COMPLETED ni se inicia H6-014. STOP documental y operativo tras la entrega.
