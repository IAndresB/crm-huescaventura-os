# TSK-H5-018 — quinta auditoría independiente del candidato F

Fecha: 2026-10-17, Europe/Madrid. Entorno local/aislado; datos y credenciales sintéticos. Encargo íntegro conservado en `tests/fixtures/h5-018-fifth/request.txt`.

## A. Dictamen

**FAIL global de auditoría.** PostgreSQL completo: **2.630 PASS / 303 FAIL de 2.933**, exit1, sin cancelados ni omitidos. El candidato permanece íntegro. Los casos focales de procedencia, replay, referencias y seguridad, así como V-MIG68, pasan; eso no sustituye la puerta completa fallida.

Hallazgo abierto **H5-018-5-F01: cronología no reproducible del fixture heredado de cancelaciones**. Reproducido en el test original dos veces, aislado con controles sobre esquema histórico y68, y repetido. No se demuestra una regresión funcional causada por68. De303 fallos,295 incluyen el rechazo de evidencia de cancelación; otros7 de aserción y1 de bloqueo no observado permanecen sin causa individual concluyente. Véase el registro de hallazgos y el análisis de cronología.

La auditoría no modifica producto, migraciones, contratos, pruebas recibidas ni expected históricos. Crea únicamente instrumentos, contrapruebas y documentación propios. No hace commit, push ni deploy. Las auditorías anteriores conservan su FAIL sobre sus candidatos; el resultado presente corresponde exclusivamente a F.

## B. Identidad exacta del candidato

| Elemento | Identidad recibida y recalculada |
|---|---|
| HEAD / main / origin/main | `9649a2773530ea8a43237b4e1f2034f80e34136f` |
| Divergencia / índice | 0/0; vacío |
| Inventario F, SHA256 de contenido descomprimido | `67a024e11fc7dc9c1336f463f372ccd5c90b4aebcca1fb14ba8c94340dbf7a9e` |
| Archivo de sello F, SHA256 | `da14b2ba3cf0767b9b807c2cf12c8edbca0b0a221bc7c2f70e11d3f7a42dd9dd` |
| Migración68, SHA256 | `69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563` |
| ArchivosF | 38.118:37.874 recibidos por F y244 nuevosF |
| Diferencias sobre candidato recibido | Cero archivos modificados o eliminados |

El preflight recalculó rutas, tipo regular/no symlink, modo, tamaño y SHA256 de cada archivo. Comprobó el conjunto exacto obtenido de Git, incluidos inventario/sello autorreferenciales como dos metadatos separados. No se aceptó un sello únicamente por existir. El inventario recibido propio contiene los38.118 archivos con su metadata completa; el verificador independiente vuelve a contrastarlos al cerrar y después de sellar.

El perímetro es el recibido: archivos seguidos y no ignorados, excluidos `.git`, dependencias, compilados y datos temporales ignorados. Los cuatro archivos seguidos que ya estaban modificados —NEXT-STEPS, PROJECT-STATUS, tasks y composition— se conservan byte a byte; no son cambios de esta auditoría.

## C. Independencia normativa

[Matriz normativa independiente](matrix-TSK-H5-018-fifth.md), [expected congelado](expected-TSK-H5-018-fifth.md) y `normative-sources.json`. Lectura directa de Tasks fichas017/018, §2.2 y13 asignaciones §6; Plan B01/B07/B08/B10, C01/C04, §§7.1/8/11.2; SPEC historia, idempotencia, seguridad, incertidumbre, AC070/072/081, NFR009/010/014; DM-INV047, SM-FORB27 y P12. Se preservan también los dos pendientes transversales.

La norma precedió a los tests nuevos. Dos errores del instrumento V01/V03 se documentan en aclaraciones aditivas sin sobrescribir expected ni FAIL. La segunda precisión corrige incluso una descripción errónea de la primera: B07 directo exige contexto original exacto; la relación padre se acredita aparte. Véanse [hallazgos](defects-TSK-H5-018-fifth.md) y [aclaración definitiva](expected-TSK-H5-018-fifth-clarification-v2.md). No se convierte un resultado de implementación en norma.

## D. Migración68

[Revisión independiente detallada](migration-review-TSK-H5-018-fifth.md). Solo sustitución de cuerpos de `diagnostic_canonical_nodes`, `h5_diagnostic_record` y `h5_diagnostic_read`. Firmas, OID, owners, ACL, RLS/FORCE RLS, atributos y dependencias conservados. Fuera de las tres definiciones solo existen la transacción y el guard de autoridad; `migration-envelope-review.json` comprueba el texto completo restante.

V08:175 tablas,487 relaciones,305 funciones,332 políticas y565 dependencias, además de constraints, namespaces, ACL/defaults, roles y membresías. Todas las filas CRM mantienen el hash antes/después. Instalación nueva68,67 poblada→68, error antes deCOMMIT y rollback, restauración de cuerpos67 y reaplicación68 comprobados. Dieciséis accesos directos denegados, roles sin elevación. No se crean objetos ni se amplían permisos. La recuperación de cuerpos es ensayo técnico local, no una orden de downgrade.

## E. Procedencia A→B→A

Los cuatro reproductores originales H5-018-4-F01 pasan en01. Las regresionesF-P01/P02 mantienen versiones A1/3/5, historiaB/C, intentos expirados y partes retiradas sin atribuirlas al contexto vigente. V01 agrega retorno con evidencia distinta y colisión de UUID operación/ejecución ajena: conserva propietario real, versiones1/3 y paginación; deniega el par falso. V02 ejecuta A→B→A→B y revalida fuentes de ambas épocas.

La historia autorizada permanece localizable. La consulta general no atribuye aB una operación originalA sin relación canónica. La consulta explícita conserva procedencia histórica, y esa lectura no concede permiso para insertar una nueva observación falsa.

## F. Idempotencia histórica

Los tres reproductores H5-018-4-F02 pasan en01, incluidos sesión nueva y referencias opcionales. V04/V05 añade cinco combinaciones: operación, ejecución, ambas, evento y todas. Primera identidad disputada por dos sesiones legítimas: una inserción; A→B→A; replay mismo id; contenido conflictivo denegado; sesión revocada denegada y nueva sesión válida autorizada. Cuatro repeticiones concurrentes por combinación no alteran observaciones, operaciones o historia.

V06 confirma tarde una operación antes desconocida: propietario correcto adquiere referencia canónica sin cambiar la fila; propietario diferente, aunque esté en la misma raíz, impide lectura/replay. Los F-R03/F-R05 recibidos comprueban además propietarios tardíos y revisión mientras se espera el bloqueo de identidad. Se reconoce el estado previo real, sin convertir E4 en éxito ni crear efectos de negocio.

## G. Referencias entre raíces

V01/V07 y originales A11/T04/T05/Q01/E-I04/E-I06: identidad tipo+UUID, propietario de operación, ejecución, tarea y evidencia permanecen separados. El traslado de la ejecución no traslada su tarea original. Una coincidencia de UUID entre operación, ejecución o evidencia no atribuye la operación ajena. Referencias desconocidas solo son intentos no verificados hasta confirmación compatible; no sustituyen fuente canónica.

V07 comprueba cuatro escrituras denegadas y cuatro consultas vacías. Las variantes de colisión con evidencia recibidas se incluyen en la selección08 y se distinguen de los casos nuevos.

## H. Recuperación histórica explícita

R01 original pasa en01. V02 comprueba operaciónA consultada explícitamente desde ejecución vigenteB con versión1 y contexto originalA; consulta general y petición histórica original no se trasladan por arrastre. El lector exige las fuentes original y actual; no acepta operación de trabajo ajeno ni autoriza escrituraB con operaciónA.

V03 ejecuta Servicio→Reserva→Oportunidad→Servicio dentro de una cadena existente. La oportunidad canónica forma parte de la procedencia comercial de su propia reserva; fuente original y relación se comprueban independientemente. Las observaciones originales de reserva y oportunidad sobreviven. Una reserva ajena no obtiene acceso. No se inventa una política que suprima relaciones legítimas para conseguir aislamiento.

## I. Seguridad y revocación

Originales A14/A15/Q04, variantesF y V02/V05/V08: autenticación, interacción, actor vigente, revokeOne/revokeAll, sesiones nuevas legítimas, acceso directo y revalidación de resultados. La retirada/restauración de enlaces se ensaya mediante perturbación privilegiada sintética declarada, no una API ordinaria inventada. D025 permanece: un administrador, varias sesiones; no se fabrica segundo administrador.

Canarios de secretos, cuerpos opacos y URLs no se proyectan en diagnósticos. Las referencias se autorizan antes de correlacionar. No se atribuye una fuga entre usuarios sin prueba. Los replay comprueban ausencia de nuevas observaciones y cambios a operaciones/historia, sin afirmar que no exista actividad técnica de autenticación/capacidades.

## J. Regresiones anteriores

Captura01:71/71 actuales, incluyendo originales de primera auditoría F01/F02/F03, R01/R02 de segunda, T01–T07 de tercera, quince funcionales de cuarta y diecisiete funcionalesF. Los siete FAIL originales de cuarta se identifican por nombre exacto en `original-seven-retest.json`; sus salidas antiguas no se alteran.

La completa08 añade el resto de la regresión recibida y variantes E/F. El hook recibido se inspeccionó: solo resuelve pares exactos de archivo/import a fixtures68; no cambia aserciones. El archivo mixto E mantiene66→67 para sus dos casos históricos de upgrade. Los ensayos históricos de migración siguen sus versiones correspondientes.

`selection-audit.json` concilia221 archivos físicos con194 seleccionados y27 históricos explicados: derivados existentes autorizados, instrumentos temporales con aclaración normativa anterior y auditoría histórica66 fuera de la selecciónF192. No se atribuye ejecución actual a un archivo omitido ni se afirma que todos los ensayos instalen68.

## K. Contrapruebas nuevas

Trece casos focales:11 secuencias funcionalesV01–V07 y2 V-MIGV08, todos PASS también dentro de08. Se añaden después2 casos diagnósticosV09, ejecutados y repetidos en16/19; se contabilizan separados de la completa y no cambian retroactivamente su selección. Expected/precondiciones y secuencia están en la matriz y en los dos archivos `postgres-h5-018-fifth-*.test.ts`; datos observados en logs y `material-observations.json`. La fábrica propia parte del soporte aislado anterior y aplica explícitamente64–68, fijando SHA68; no depende del expected del implementador.

Intentos02 y05 conservan respectivamente2 y1 fallos de instrumento; retest06 da11/11. La primera invocación equivocó finalidad; V03 confundió inicialmente oportunidad propia con raíz ajena y después invocó el lector B07 por el padre. Las preimágenesv1/v2 y las aclaraciones permanecen recuperables por hash. No hay cambio de producto para conseguir PASS.

## L. V-DOM / V-DAT / V-MIG

V-DOM: correspondencia normativa de identidad/procedencia/tiempo/efectos. V-DAT: PostgreSQL/Storage reales aislados, permisos y referencias negativas, filas inmutables. V-MIG: nuevo68 y67 poblado, rollback/recuperación/reaplicación y catálogo. V-AT: identidad concurrente, resultado previo y revisión mientras se espera; V-NEG: intentos adversariales reales; V-EVI: huellas, capturas append-only, fuente normativa y separación de resultados.

La captura04 acredita2/2 V-MIG independientes y06 acredita11/11 funcionales. No se sustituyen pruebas de PostgreSQL/ACL por dobles. Solo se simulan efectos externos de negocio.

## M. PostgreSQL completo

**FAIL08 confirmado; postcheck de integridad completo y correcto.** Selección ejecutada:2.920 casosF reejecutados más13 nuevos=2.933,194 archivos en15 fases disjuntas. Resultado:2.630 PASS,303 FAIL,0 cancelados,0 omitidos; exit1. Las primeras14 fases suman199 PASS; la fase15 tiene2.431 PASS y303 FAIL. Los13 nuevos y los7 reproductores originales de cuarta pasan dentro de08. No se suman71 focales,11 retest ni2 V-MIG porque solapan esta selección. Los57 casos históricos (55 PASS/2 FAIL esperados) ejecutados por un subprocess se excluyen del conteo actual.

El runner propio deriva del instrumentoF preservado y conserva su protección: copia de bytes verificados, índice/referencias de Git propios, dependencias congeladas compartidas; outputs históricos regenerados solo dentro de la réplica. Espera a todos los verificadores y retiene una réplica que falle; solo la retira tras postcheck completo. Las salidas regeneradas autorizadas se capturan separadamente. El verificador de resultados concilia nombres y estados exactos con el inventarioF anterior más13 nombres nuevos; compara fases y huellas de cada input. Su PASS significa conciliación correcta de la evidencia de una auditoría FAIL. Los57 resultados históricos incrustados (55 PASS/2 FAIL esperados) no son casos actuales.

Workspace y réplica:38.161 inputs verificados en cada uno,0 errores,0 alteraciones de outputs protegidos. Se conservan los3 outputs históricos regenerados solo en la réplica. La réplica fallida queda retenida en la ruta literal de `08-replica-preservation.json`; no se retira para encubrir el fallo. El diagnóstico posterior no modifica el runner completo ni su selección. No se repite la misma batería completa sin cambios: el test focal original vuelve a fallar en18/20 y el correctivo recibido queda fuera de esta auditoría.

## N. Unitarias, health y puertas técnicas

| Verificación actual | Resultado |
|---|---|
| Unitarias09 | 208/208 PASS |
| Health10 independiente | 1/1 PASS |
| Instalación07, lockfile congelado, scripts deshabilitados | PASS; dependencias ya actualizadas según lockfile |
| Typecheck11 y21 tras V09 | PASS |
| Lint12 y22 / fronteras | PASS |
| Build14 | PASS |
| Auditoría13, dependencias producción | 0 vulnerabilidades, exit0 |

Se registran aparte de PostgreSQL. Versiones reales en `environment.json`; no se actualizan dependencias ni lockfile. Sintaxis de los instrumentos nuevos Python y del runner comprobada. La auditoría de dependencias corresponde a la respuesta obtenida en esta ejecución, no a una garantía futura.

## O. Preservación histórica

`verify-h5-018-fifth-preservation.py`:38.118 archivosF íntegros, migraciones1–68 intactas, sellos/inventarios históricos recalculados; cuatro auditorías siguen FAIL. Recuperación de preimágenes históricas autorizadas desde los overlays conservados o Gitbase, sin reescribir historia. H5-016:455 hashes exactos y transición autorizada única de composition `fd86f3f2…`→`31d18d77…`, sobre456 inputs.

ExpectedF y expected de esta auditoría sin cambios. Se preservan todos los FAIL recibidos y los fallos propios. El archivo vacío propio creado por error documental se retiró inmediatamente; el inventario final no admite rutas fuera del espacio de quinta auditoría. Ninguna discrepancia material de candidato fue observada en preflight, capturas o comprobaciones ya terminadas.

## P. Defectos materiales pendientes

**Un hallazgo material de verificación abierto: H5-018-5-F01.** El fixture de cancelación combina acto fijo17/10/2026 10:00Z con evidencia a la hora real, ya posterior. La guarda heredada exige evidencia no posterior al acto. El control explícito conserva derecho150.03, retención150.00, base300.03 y replay; un milisegundo posterior sigue denegado. Fixtures y guardas son idénticos a HEADbase.

No se confirma un nuevo defecto funcional del diagnósticoF; tampoco se descartan defectos adicionales detrás de los303 fallos. Los8 fallos sin rechazo explícito se mantienen pendientes, no se reclasifican como PASS ni se atribuyen automáticamente al reloj. El [registro de hallazgos](defects-TSK-H5-018-fifth.md) separa este bloqueo de aceptación, las incidencias propias y los límites del diagnóstico. Correctivo necesario: cronología sintética explícita y coherente para cada acto y sus pruebas, conservando negativos temporales, y después repetición completa con análisis de cualquier fallo residual. No se implementa.

## Q. Recomendación de aceptación

**NO recomendar aceptación ni publicación de F con esta evidencia.** La puerta PostgreSQL completa falla. Resolver mediante un correctivo separado y autorizado el hallazgo de verificación, conservar F y todos sus FAIL, y reauditar el conjunto resultante. El candidato exacto de este dictamen sigue siendo la base aprobada más los38.118 archivosF identificados arriba; el inventario propio no forma parte del producto. No se autoriza por inferencia ninguna modificación adicional, commit, push o deploy.

Cualquier aceptación técnica local o publicación posterior requiere decisión expresa del director y revalidación de ese conjunto exacto. DM-PENDING-005 permanece OPEN; no se fijan políticas de retención, anonimización/eliminación ni parámetros operativos. H5-017/H5-018 no se marcan COMPLETED; H5-019/H6 no se inician; H6-015/H6-017 y Hosted/Production no se acreditan.

## R. Inventario, sello y reproducción

Los artefactos nuevos se inventarían al cierre con rutas/tipos/modos/tamaños/hashes en `tests/fixtures/h5-018-fifth/audit-inventory.json`; el sello `audit-seal.json` vincula el candidatoF, inventario propio, cobertura y casos actuales. Solo inventario/sello propios se excluyen de la autorreferencia, y se incluyen en el total. Los hashes finales del inventario y sello se comunican tras su creación y verificación independiente de solo lectura.

Reproducción principal: `python3 scripts/capture-h5-018-fifth.py <etiqueta-nueva> node scripts/test-h5-018-fifth-complete.mjs <prefijo-nuevo>`. Requiere el PostgreSQL17 local declarado, Node/pnpm fijados y soporte Storage aislado verificado; el runner comparte node_modules congelado y no escribe resultados históricos en el workspace. Los comandos exactos de cada puerta están en sus `.status.json`.

Verificación sin ejecutar tests: `python3 scripts/verify-h5-018-fifth-preservation.py` y, después de sellar, `python3 scripts/verify-h5-018-fifth-seal.py`. El verificador de resultados y el sellador son append-only: no sobrescriben sus outputs; una reproducción debe usar nuevas rutas/etiquetas y preservar este cierre.

**Estado final tras sellar y verificar: STOP. Dictamen FAIL. Esperar autorización expresa del director.**
