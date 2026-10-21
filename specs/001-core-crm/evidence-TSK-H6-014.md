# TSK-H6-014 — candidato de preparación local/aislada

**Dictamen interno del candidato: PASS exclusivamente de preparación.** Fecha: 21/10/2026. Responsable humano: Andrés. Ejecutor técnico: ChatGPT Work. Auditoría independiente NO EJECUTADA; aceptación del director, cierre documental y publicación pendientes. Este documento no cambia la ficha formal de Tasks.

## A. Resultado ejecutivo

Se han materializado inventario, procedimiento, expected, matriz y comprobaciones puras. Ningún PostgreSQL/Storage se ha iniciado ni se han ejecutado consultas, migraciones o restauraciones. Los binarios PostgreSQL solo se invocaron con --version/--help. Bash solo analizó sintaxis con -n; los bloques del procedimiento no se ejecutaron. No hay datos reales, acceso operativo a Hosted/Production, commits, push, despliegue ni escritura en Drive.

Expected SHA-256: `aaab43534e34e4256406ef413167e409784d307253a3cf22be2708c7037554f1`. Fue creado y sellado antes de inventario, procedimiento y verificador. El sello registra tiempo local UTC, sin reloj externo, firma del director ni WORM. La instrucción humana autorizada tiene copia literal en [authorization.txt](../../tests/fixtures/h6-014/authorization.txt), con hash en expected/preflight.

## B. Identidad Git y preservación

Base/HEAD/main/origin/main y remoto consultado directamente: `07808f7d441452a8a2f251306824de3f8520b490`. Árbol: `f2482423116e9d09313edbc7d63bd397a92bddc8`. Divergencia inicial 0/0; índice y árbol versionado limpios. La verificación final vuelve a exigir identidad, limpieza versionada e índice idéntico. Solo se crean las once rutas declaradas en el expected; ninguna ruta histórica admite excepción nueva.

| Conjunto protegido | Rutas | Bytes | SHA-256 del conjunto de descriptores |
|---|---:|---:|---|
| Versionados de base | 39940 | 731158616 | `dd16c5b99a7e1de7b4834c8d834fdca015b54957e65b6153479a4fdb1db58e46` |
| Históricos H6-013 excluidos de Git | 14954 | 172003534 | `c87051517945709193252ae22a82c5dc599748304241523317b91f1fc4c33ca1` |

Cada descriptor cubre ruta, modo, tamaño y hash de contenido. La huella final debe coincidir exactamente. Las 68 migraciones se comparan además con el inventario aceptado H6-013. Los 14.954 excluidos coinciden con su lista y sus descriptores aceptados; no se borran, limpian, comprimen ni restauran archivos históricos. Los auxiliares ignorados node_modules/.next/tsbuildinfo no son fuente normativa ni se usan como acreditación de restauración.

Las dependencias H5-019 y H6-013 están aceptadas exclusivamente local/aislado, según sus recibos y cierres versionados. Sus PASS se heredan con identidad y límites; esta preparación no repite pruebas históricas ni las convierte en resultados nuevos.

## C. Entregables

| Ruta relativa al repositorio | Finalidad |
|---|---|
| [expected-TSK-H6-014.json](expected-TSK-H6-014.json) | Oráculo previo: fuentes, seis asignaciones literales, recursos, pasos, 22 comprobaciones y 18 contrapruebas |
| [inventory-TSK-H6-014.json](inventory-TSK-H6-014.json) | Quince recursos con autoridades, origen/destino, capacidad, copia, recuperación, integridad, riesgos y responsables |
| [procedure-TSK-H6-014.md](procedure-TSK-H6-014.md) | Trece pasos ejecutables en fase futura autorizada; controles, comandos, contratos y condiciones de parada |
| [matrix-TSK-H6-014.json](matrix-TSK-H6-014.json) | Seis filas normativas exactas y obligaciones de ficha, con recursos/pasos/checks/evidencias/límites |
| [evidence-TSK-H6-014.md](evidence-TSK-H6-014.md) | Este informe y propuesta focal de revisión/cierre |
| [scripts/verify-h6-014-preparation.py](../../scripts/verify-h6-014-preparation.py) | Validador de lectura y contrapruebas en memoria; salida opcional únicamente results.json de esta tarea |
| [authorization.txt](../../tests/fixtures/h6-014/authorization.txt) | Instrucción literal recibida, identificada por hash |
| [preflight.json](../../tests/fixtures/h6-014/preflight.json) | Identidad remota/local, protección histórica y versiones/ayuda de herramientas |
| [expected-seal.json](../../tests/fixtures/h6-014/expected-seal.json) | Integridad y anterioridad local del expected |
| [results.json](../../tests/fixtures/h6-014/results.json) | Expected/observado por check y contraprueba; historial de comprobaciones internas |
| [manifest.json](../../tests/fixtures/h6-014/manifest.json) | Integridad final de diez archivos, excluyendo su propio contenido |

No se crean nuevas normas, requisitos, tareas SDD, roles, APIs, migraciones o contratos de producto. Los identificadores R/S/P/N son etiquetas de este instrumento.

## D. Inventario: capacidades y ausencias

Cobertura: los once grupos exigidos por la autorización (R01–R11) y cuatro soportes indispensables R12–R15. Todas las fichas incluyen autoridad/propietario, origen/destino previsto, copia, disponibilidad acotada, recuperación, dependencias, integridad, riesgos y responsables de ejecución/verificación.

| Clasificación principal | Recursos | Interpretación precisa |
|---|---|---|
| DISPONIBLE Y ACREDITADO | R14, R15 | Fuentes/evidencia locales y herramientas comprobadas; no backups operativos |
| CAPACIDAD DOCUMENTADA | R01–R06, R08–R12 | Mecanismos de código y evidencia histórica, con límites por asset |
| NO DETERMINADO | R07 | Escrow/credenciales recuperables reales no inspeccionados ni acreditados |
| NO DISPONIBLE | R13 | No se ha materializado un testigo t0/t1 del futuro ensayo en este paquete |

Cada recurso diferencia además sus assets: definición disponible no convierte una copia futura en disponible. La ausencia de dump/testigo se limita al paquete H6-014; no se afirma que no exista ninguna copia en el Mac o en proveedores. No hay acreditación de backup/PITR, Auth real, plan contratado o garantías Hosted. El backend Storage puede tener base propia, además de bytes; no queda cubierto por el dump Core.

## E. Procedimiento

S01 autoridad e inputs → S02 cuarentena → S03 corte coherente/testigo independiente → S04 copias e integridad → S05 roles/base nueva → S06 configuración/secretos → S07 nueva identificación/revocación → S08 objetos → S09 integridad/permisos → S10 conciliación → S11 decisión explícita de reentrada → S12 mediciones observadas → S13 evidencia/STOP.

Los tres bloques Bash tienen parada ante primer error, parámetros obligatorios, destinos nuevos y descartado de salidas crudas. Sus flags se cotejan contra ayuda de herramientas 17.11. No se usa --clean, --no-owner, --no-privileges ni desactivación de triggers como atajo. El ejemplo local libc/C exige acreditar compatibilidad; otros locales/métodos requieren ajuste explícito del ensayo, no conversión silenciosa.

Los comandos y fragmentos TypeScript se preparan, no se ejecutan. El fragmento usa cuatro exports reales: verifyAuth, H0005PostgresAdapter, H0013GlobalAccessRevocationAdapter y createSyntheticAuthVerifier. Los flags password/MFA del fixture no acreditan identidad real. Si falta un intento posterior en Core t0, no se fabrica historia: se conserva evidencia/revisión y se mantiene el efecto suspendido si los contratos existentes no permiten conciliarlo legítimamente.

## F. Trazabilidad

Exactamente las filas AC-073, SPEC-NFR-005, ARCH-DEC-017, P13, PLAN-B10 y PT-12 de Tasks §6. La matriz conserva literalmente la asignación, referencia al archivo/posición y fuentes selladas; vincula recursos, pasos, checks, evidencia heredada y futura.

AC-073: se prepara suspensión/conciliación y objeto ausente; verificación integrada NO EJECUTADA. NFR-005: inventario y procedimiento con responsable y método de medición; restore y periodicidad futura no acreditados. ARCH-DEC-017: aislamiento local definido. P13: esquema/autoridades versionadas preservadas. B10/V-EVI: paquete recuperable con identidad y límites. PT-12: selección focal; no PASS de toda la familia.

## G. Verificaciones y resultados

Comando interno: `python3 -B scripts/verify-h6-014-preparation.py --output`. Lecturas Git con GIT_OPTIONAL_LOCKS=0, lectura/hash de archivos y sintaxis Bash sin ejecutar bloques. Solo se escribe el nuevo results.json de esta tarea, conservando cada entrada anterior. No se ejecutan test:postgres, typecheck, build, Storage, PostgreSQL de datos o suites históricas.

Resultado del candidato: **22/22 comprobaciones de preparación y 18/18 contrapruebas PASS**, cero errores en la entrada final. Las contrapruebas alteran únicamente copias en memoria: recurso omitido/duplicado, disponibilidad falsa, falta de revocación, resume automático, incertidumbre perdida, fuente/fila alteradas, traversal, crédito AC-073 falso, objetivo RPO inventado, Storage omitido, tres clases de material sensible, expected e integridad de manifest alterados. Cada una debe fallar por su código esperado, no solo por cualquier excepción. No se guardan ejemplos de credenciales como fixtures.

La revisión documental comprueba orden de S01–S13, inputs/salidas/paradas, coherencia de referencias, tres bloques Bash parseados y cuatro exports existentes. Los metadatos exactos de cada entrada están en results.json. Las comprobaciones intermedias se conservan y no se suman como requisitos nuevos ni se presentan como paquetes sellados independientes; el candidato final se identifica por el manifest y el hash vigente del verificador.

La verificación final de manifest es de lectura: `python3 -B scripts/verify-h6-014-preparation.py --check-manifest`. Recalcula descriptores y preservación sin reescribir resultados sellados. El manifest excluye su propio hash; su identidad se entrega externamente en la respuesta del ejecutor.

Los checks automáticos prueban reglas explícitas, estructura, fuentes, sintaxis, integridad y rechazo de mutaciones acotadas. No demuestran comprensión semántica completa del lenguaje natural, ejecución satisfactoria de comandos, validez de Auth/Storage real ni recuperación temporal integrada. No se repite una batería general de H6-013.

## H. Hallazgos

**Bloqueantes de la preparación:** ninguno abierto tras la revisión interna. No se ha encontrado necesidad de modificar normativa, producto o permisos.

**Correcciones técnicas internas cerradas antes del sello final:** uso de exports/firmas reales en fragmento de revocación; creación explícita de base tras roles; cuarentena ante intento posterior ausente; bloques fail-fast y ausencia de logs crudos con material sensible; comprobación de enlaces, flags CLI y sintaxis. Se revisaron/reverificaron los entregables nuevos afectados; expected permanece idéntico.

**Observaciones:** el desfase histórico «publicación pendiente» en documentos H6-013 permanece intacto; no cambia la identidad remota actual ni la definición aprobada. Comparador H6-013 filtra crm%; el futuro ensayo debe cubrir Auth/Storage/globals aparte. La preparación no aporta sello temporal externo o custodia WORM. Ninguna observación autoriza debilitar un control para obtener PASS.

## I. Riesgos y puertas futuras

| Riesgo | Protección preparada y condición pendiente |
|---|---|
| Revocaciones perdidas por rollback | Testigo independiente, identificación nueva, revokeAll coordinado y denegación efectiva por superficies; prueba real en H6-015/H6-008 |
| Secretos en dump/roles/configuración | Material íntegro protegido fuera de evidencia; jamás valores en logs; STDOUT/STDERR crudos descartados; custodio y escrow futuros por acreditar |
| Objetos ausentes/corruptos | Recuperación separada, digest/tamaño/media y reautorización; ausencias visibles sin declarar original íntegro |
| Pago/envío ya ocurrido | Fuente simulada fuera del rollback, identidad exacta, reserva/uncertainty conservadas y ninguna repetición por ausencia de receipt |
| Instrumentación estática | Revisión focal posterior; no inferir funcionamiento integrado de un documento coherente |
| Infraestructura futura | Origen/destino y configuración propios; no hay un destino restaurado ni capacidad Hosted acreditada |

ARCH-PENDING-002 y DM-PENDING-005 permanecen abiertos. Sin objetivos RPO/RTO, cadencia, coste o garantías productivas. Las dependencias H6-006/H6-008 de H6-015 no se adelantan ni se inventan como prerrequisitos circulares de H6-014.

## J. Propuesta de auditoría independiente

Pendiente de autorización posterior y fuera de esta ejecución. Alcance focal propuesto: leer expected primero y contrastar seis fuentes/asignaciones; revisar inventario y sus cuatro estados; comprobar seguridad de corte/secretos/revocación/efectos; verificar que los comandos y contratos existen y que no hay aperturas automáticas; ejecutar el verificador puro y contrapruebas; recalcular manifest y huellas históricas. El auditor aportará sus propias comprobaciones focales; no basta repetir el mismo instrumento para llamarlo independiente.

Corpus suficiente: once artefactos nuevos y fuentes del commit base, más referencias de dependencias H5-019/H6-013. No se justifica repetir PostgreSQL general o cadena 68 mientras no aparezca una discrepancia concreta. Cualquier ejecución de restore o prueba persistente requiere H6-015 y su autorización propia. No crear ni subir evidencias a Drive durante esta preparación.

## K. Propuesta de cierre y STOP

Satisfecho para el candidato: cobertura y responsables, expected previo, inventario con estados acotados, procedimiento con recuperación/seguridad/conciliación/medición, matriz de seis asignaciones, verificaciones puras, contrapruebas e integridad/preservación.

Pendiente: evaluación del director; auditoría independiente focal si se autoriza; aceptación y cierre documental expresos. La ficha de Tasks y los estados formales se mantienen sin editar. AC-073 global, H6-015, H6 completo, Hosted y Production siguen sin acreditarse. Ningún PASS de preparación concede autorización de acceso real o de reanudar efectos.

**STOP obligatorio antes de auditoría independiente, cierre documental y publicación.** Los once artefactos se conservan localmente, sin commit, push, despliegue, carpeta o subida a Drive.
