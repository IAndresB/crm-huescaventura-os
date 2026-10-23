# Dictamen independiente — variante bootstrap PostgreSQL 17

2026-10-22. Base `971c55d5ce5770c71284d106d3c0deecca9514b5`. Auditor: worktree separado `h6-bootstrap-audit`. Ejecutor: `h6-bootstrap-variant`. **PASS técnico local de la variante y revisión integrada, con límites expresos. H6-015 continúa IN PROGRESS. No autoriza S11, adopción normativa, cierre ni publicación.**

El dictamen corresponde a la ejecución `2026-10-22T14-52-59-084Z` y a las fuentes congeladas antes de ella. No altera r3 ni sus expected. Las dos excepciones experimentales son conservar nombre/OID 10 del bootstrap mediante `initdb` y acreditar su único CREATE ROLE ya satisfecho. No se añadieron permisos, grantors ni autoridades para que la restauración pasara. El cotejo íntegro posterior no elimina ningún rol auxiliar de la comparación.

## Independencia y resultados

El auditor escribió instrumentos Python/SQL separados, congeló expected propios, restauró archivos históricos en clústeres nuevos, adquirió los catálogos de origen y destino del candidato en vivo y reconstruyó t0 para cotejar copias completas de los destinos detenidos. No importó el comparador de snapshots del ejecutor. Para las pruebas negativas específicas de bootstrap sí invocó el helper real, como objeto de prueba, contrastándolo con expectativas independientes. No modificó código ni recursos del ejecutor.

| Comprobación | Evidencia y alcance |
|---|---|
| Custodia previa | 24 comprobaciones; 38.583 archivos / 1.415.326.681 bytes, ambos inventarios anteriores exactos. |
| Restauración propia histórica | 41 comprobaciones PASS de Core, Auth y Storage; schema SQL completo idéntico al archivo, filas tipadas y roles/membresías exactos. |
| Privilegios y contrapruebas SQL | 20 comprobaciones PASS: denegaciones nativas 42501, aislamiento Storage, grants añadidos y permiso retirado detectados; rollback exacto de cada manipulación sintética. |
| Semántica ACL | 10 comprobaciones PASS. NULL equivale únicamente al default del mismo dueño; ACL vacía, PUBLIC, grantor, grantee, owner y grant option alterados se distinguen. Secuencias usan `s`; `S` es otro tipo. |
| Transformación globals | 6 comprobaciones PASS: sustitución reversible exacta, offset Unicode, CREATE ausente/duplicado y nombres no admitidos rechazados. |
| Precondiciones reales | 8 comprobaciones PASS en PostgreSQL: OID/nombre incorrectos generan 42501; un rol preexistente adicional y bootstrap divergente bloquean antes de importar las demás sentencias. |
| Puerta S05 final | 44 comprobaciones PASS. Core: 175 tablas/529 filas; Auth: 27/120; Storage: 10/81. Schema SQL origen = archivo = destino byte a byte. Todos los globals y 301.280 celdas de privilegios efectivos coinciden, incluyendo columnas, GRANT OPTION, roles builtin y privilegios de base. |
| Auditoría posterior S06–S10 | 254 comprobaciones válidas de adquisición íntegra más 17 de continuación semántica. Se preservan 142 tablas sin cambio, 22 con adiciones conservando todas sus filas previas y 11 con cambios limitados a columnas expresamente justificadas. Son 175 tablas; 33 cambian tras las acciones de ensayo. |
| Frontera Storage específica | 4 comprobaciones PASS en copia propia: mismo objeto responde 200 con service_role antes y después; JWT ordinario firmado y no vencido recibe HTTP 400 legado con statusCode 404, `not_found`, sin bytes. Esto no se presenta como otra autenticación de identidad por Auth. |

Las cifras cuentan comprobaciones instrumentales, no criterios normativos independientes ni cobertura universal. Los tres controles S05 sucesivos conservan sus recibos; el final es `checkpoint-result-1792680857660495000.json`, SHA `4ab2583c7e9b2c90de451db661c4b0418d5162ee14e82c4841a999e7f837b258`.

El recibo definitivo de continuación es `final-completion-1792681299653539000.json`, SHA `264de0a69af80b46095a956f8e69234772829462025c2eef6d540714a358fb0e`. Incorpora por referencia la adquisición sellada `final-result-1792681051223735000.json` y conserva expresamente su FAIL instrumental. La prueba focal Storage está en `storage-http-result-v1.json`.

## Seguridad y conservación observadas

No cambian globals, schema, propietarios, ACL ni privilegios efectivos entre t0 y el estado final. Los registros originales F1/F2 conservan sus demás columnas y solo pasan a disabled; cada familia incorpora una única generación habilitada nueva. El material secreto solo se comparó en memoria y custodia privada.

Las tres sesiones Core restauradas conservan `revoked_at = NULL`; sus tres epochs pueden conservar `current_epoch = true`. **Están invalidadas por una generación de acceso anterior a la del actor**, conforme a `revoke_all_sessions` y a los controles efectivos de F2. La consulta real de autoridad para revocación global no devuelve autoridad para ellas. No se afirma un cierre físico que el contrato no implementa. Los cuatro identificadores de sesión Auth presentes en t0 ya no existen en el proveedor restaurado, comprobado separadamente.

Los objetos finales son dos `stored`, uno `missing` y dos `inconsistent`. Se verificó por SQL una discordancia real de MIME y otra de digest; los cinco archivos capturados, 110 bytes sintéticos, permanecen idénticos. La reparación del enlace incompleto queda trazada. El objeto ausente continúa ausente y el huérfano no se elimina ni recibe un propietario inventado.

Las cuatro ejecuciones quedan pausadas. Los tres identificadores de intento que existían en t0 se conservan exactamente; el intento nacido después del corte no se fabrica. La ausencia acreditada produce `failed` pero conserva la referencia al intento, según el SQL aprobado. El efecto incierto sigue protegido y la conciliación no incrementa el contador del testigo externo simulado.

La integración del ejecutor contiene 64 comprobaciones PASS, con Auth real, TOTP, renovación, logout, revocaciones, dieciséis superficies, ambos órdenes de concurrencia PostgreSQL y respuestas tardías. El auditor revisó independientemente sus fuentes y resultados y comprobó el estado final por otro instrumento. **No afirma haber repetido íntegramente la ejecución HTTP de Auth en un segundo harness**. La reproducción propia de restauración y la adquisición SQL/Storage sí se ejecutaron separadamente.

## Fallos conservados y correcciones instrumentales

El auditor conserva todas sus incidencias: comparación histórica que no contemplaba el campo de expiración omitido en la captura antigua; intento de conectar como rol NOLOGIN en vez de SET ROLE; `aclexplode` sobre ACL vacía; errata sintáctica de custodia antes de copiar; expectativa incorrecta de `revoked_at`/cierre físico de epochs; y expectativa incorrecta de dos referencias de intento NULL. Cada corrección se justificó contra la fuente o contrato correspondiente. No cambió el candidato para satisfacer esas expectativas. Los expected y resultados anteriores permanecen disponibles.

La revisión del ejecutor señaló además el código `s` de secuencias, la clasificación de denegaciones y la representación ACL. El ejecutor detectó y corrigió el caso MIME que no estaba ejercitado; el antiguo PASS de 63 comprobaciones conserva el hallazgo que invalida esa cobertura. El resultado final no hereda ese PASS incorrecto.

## Normativa y límites

La Constitución y las demás fuentes superiores mantienen los hashes congelados. La excepción no cambia las autoridades CRM: reproduce su grafo original en infraestructura sintética, mediante mecanismos soportados. La ACL NULL/default es una cuestión de adquisición del instrumento; r3 ya define la descomposición semántica de ACL de base. El cambio de `relacl` se limita a preservar grantor, grantee, privilegio y opción; no autoriza omitir ACL.

La copia física de auditoría se realizó con el servidor detenido y todos los archivos del clúster, coherente con la [documentación PostgreSQL 17](https://www.postgresql.org/docs/17/backup-file.html). La interpretación de ACL se contrastó con la [documentación de funciones de información de PostgreSQL 17](https://www.postgresql.org/docs/17/functions-info.html).

AC-073 conserva evidencia local parcial: el intento t1 no representado y el efecto incierto siguen pendientes; no hay aceptación de continuidad Production ni RPO/RTO aprobados. AC-074 dispone de los escenarios sintéticos concretos anteriores, sin generalización a datos reales. ARCH-PENDING-002 y DM-PENDING-005 continúan OPEN. Permanecen reservados el cambio normativo definitivo, S11, cierre, commit/push, publicación, Drive, despliegue y cualquier recurso real.

## Custodia y entrega

Todos los clústeres y servicios propios están parados; no se borró ningún original. Tres paquetes nuevos independientes, con permisos 0700/0600, propietario actual, sin enlaces ni ACL allow y rehash de cada copia:

| Carpeta bajo custodia privada H6-015 | Archivos | Bytes | SHA-256 del inventario privado |
|---|---:|---:|---|
| `20261022-bootstrap-independent-probes` | 4.905 | 181.922.641 | `7e585c463b712284ad0933f7529bc05045bd1c61b90bf178f4c6580f80549dba` |
| `20261022-bootstrap-independent-final` | 9.879 | 783.916.124 | `ac176454df2e0a546d8bf0c1447d7a12cfdb26e082c58ae154057f6d154e4a1d` |
| `20261022-bootstrap-independent-storage-http` | 1.328 | 49.107.335 | `71af9a61be4a4fd50b82df3552df8a29d29357a29e08651606eb95d9f7225d83` |

Los scripts del auditor, expected, recibos saneados, este dictamen y el manifiesto son el inventario local revisable. Los archivos de clúster, dumps, SQL global, configuración y materiales sintéticos sensibles permanecen fuera de Git y de herramientas externas. No hubo commit, staging, push, publicación ni subida a Drive.

**STOP: dictamen técnico local entregado; ninguna adopción normativa, reentrada ni cierre.**
