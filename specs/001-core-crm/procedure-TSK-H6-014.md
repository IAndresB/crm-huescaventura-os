# TSK-H6-014 — Procedimiento preparado de restauración aislada

Estado del entregable: CORRECTIVO M1/m1 PREPARADO PARA REVISIÓN DEL DIRECTOR. Candidato auditado original preservado; véase [correctivo](corrective-TSK-H6-014-M1-m1.md). Responsable humano: Andrés. Ejecutor de la preparación: ChatGPT Work. Base: `07808f7d441452a8a2f251306824de3f8520b490`.

Este documento contiene instrucciones para una ejecución futura específicamente autorizada. Ningún paso S01–S13 se ha ejecutado como restauración en H6-014. Los controles del bloque JSON son condiciones que deberá cumplir el futuro ensayo, no observados de funcionamiento. R/S/P/N son identificadores instrumentales de este paquete, sin valor de nuevos requisitos normativos.

Fuentes: [Tasks H6-014](tasks.md#tsk-h6-014), [Tasks H6-015](tasks.md#tsk-h6-015), [Plan §11.3](plan.md#113-recuperación), [Architecture §15](../../docs/architecture.md#15-backup-y-recuperación), [AC-073/074](spec.md#244-controles-técnicos-y-fronteras), [P12/P13](../../docs/constitution.md#p12-secretos-fuera-de-git). Asignaciones y hashes exactos: [expected](expected-TSK-H6-014.json). Recursos y capacidades: [inventario](inventory-TSK-H6-014.json). Comprobaciones y evidencia: [matriz](matrix-TSK-H6-014.json) e [informe](evidence-TSK-H6-014.md).

## Controles legibles por el verificador

```json
{
  "task": "TSK-H6-014",
  "prepared_only": true,
  "controls_are_required_future_conditions_not_observed_execution": true,
  "steps": [
    {
      "id": "S01",
      "title": "Autoridad e inputs",
      "resources": [
        "R06",
        "R07",
        "R12",
        "R14",
        "R15"
      ],
      "requires": [],
      "establishes": "authorization",
      "executed": false
    },
    {
      "id": "S02",
      "title": "Cuarentena del destino",
      "resources": [
        "R06",
        "R11"
      ],
      "requires": [
        "authorization"
      ],
      "establishes": "quarantine",
      "executed": false
    },
    {
      "id": "S03",
      "title": "Corte y testigo independiente",
      "resources": [
        "R01",
        "R03",
        "R04",
        "R05",
        "R13"
      ],
      "requires": [
        "quarantine"
      ],
      "establishes": "source_cut",
      "executed": false
    },
    {
      "id": "S04",
      "title": "Copias e integridad",
      "resources": [
        "R01",
        "R02",
        "R03",
        "R07",
        "R12",
        "R13",
        "R14",
        "R15"
      ],
      "requires": [
        "source_cut"
      ],
      "establishes": "copy_integrity",
      "executed": false
    },
    {
      "id": "S05",
      "title": "Restauración de roles y bases",
      "resources": [
        "R01",
        "R02",
        "R08",
        "R09",
        "R10",
        "R11",
        "R12",
        "R15"
      ],
      "requires": [
        "copy_integrity"
      ],
      "establishes": "privileges",
      "executed": false
    },
    {
      "id": "S06",
      "title": "Configuración y secretos",
      "resources": [
        "R04",
        "R06",
        "R07"
      ],
      "requires": [
        "privileges"
      ],
      "establishes": "protected_secrets",
      "executed": false
    },
    {
      "id": "S07",
      "title": "Identificación y revocación",
      "resources": [
        "R04",
        "R05",
        "R07",
        "R13"
      ],
      "requires": [
        "protected_secrets"
      ],
      "establishes": "revoked_sessions_denied",
      "executed": false
    },
    {
      "id": "S08",
      "title": "Objetos y metadata",
      "resources": [
        "R03",
        "R08"
      ],
      "requires": [
        "revoked_sessions_denied"
      ],
      "establishes": "objects_coherent",
      "executed": false
    },
    {
      "id": "S09",
      "title": "Integridad y permisos",
      "resources": [
        "R01",
        "R02",
        "R03",
        "R05",
        "R08",
        "R09",
        "R10",
        "R11",
        "R12"
      ],
      "requires": [
        "objects_coherent"
      ],
      "establishes": "data_coherent",
      "executed": false
    },
    {
      "id": "S10",
      "title": "Conciliación de efectos",
      "resources": [
        "R03",
        "R09",
        "R10",
        "R11",
        "R13"
      ],
      "requires": [
        "data_coherent"
      ],
      "establishes": "external_reconciled",
      "executed": false
    },
    {
      "id": "S11",
      "title": "Decisión de reentrada",
      "resources": [
        "R04",
        "R05",
        "R06",
        "R09",
        "R10",
        "R11"
      ],
      "requires": [
        "external_reconciled"
      ],
      "establishes": "explicit_reentry",
      "executed": false
    },
    {
      "id": "S12",
      "title": "Medición observada",
      "resources": [
        "R13"
      ],
      "requires": [
        "explicit_reentry"
      ],
      "establishes": "observed_measurement",
      "executed": false
    },
    {
      "id": "S13",
      "title": "Evidencia y STOP",
      "resources": [
        "R14",
        "R15"
      ],
      "requires": [
        "observed_measurement"
      ],
      "establishes": "evidence_stop",
      "executed": false
    }
  ],
  "quarantine": {
    "sensitive_effects_suspended": true,
    "workers_started": false,
    "automatic_resume": false,
    "isolation": "unix-socket-only Core; Storage loopback y sin conectores; mismos datos/secretos solo del ensayo"
  },
  "source_cut": {
    "all_writers_frozen": true,
    "multi_database_cut": true,
    "objects_separate": true,
    "witness_outside_restore": true
  },
  "protected_copy": {
    "raw_backup_is_sensitive": true,
    "omit_role_passwords": true,
    "preserve_owner_acl": true,
    "separate_protected_escrow": true
  },
  "sessions": {
    "fresh_identification": true,
    "global_revocation_contract": "H0013GlobalAccessRevocationAdapter.revokeAll",
    "require_completed_and_auth_revoked": true,
    "deny_old_read_mutation_replay_objects": true,
    "disabled_actor_stays_disabled": true,
    "failure_keeps_quarantine": true
  },
  "objects": {
    "recover_separately": true,
    "check_digest_size_media": true,
    "missing_is_not_recovered": true,
    "reauthorize_download": true
  },
  "external": {
    "provider_outside_rollback": true,
    "uncertain_keeps_reservation": true,
    "retry_requires_verified_prior_effect": true,
    "incomplete_source_does_not_prove_no_effect": true,
    "historical_approval_does_not_reapprove": true,
    "automatic_resume": false
  },
  "measurement": {
    "loss_method": "Diferencia de hechos/IDs entre corte coherente, testigo posterior completo y destino; importes por moneda sin doble conteo; desconocido si cobertura insuficiente.",
    "duration_method": "Reloj monotónico inicio/fin por fase y total, con UTC de corte/observación; no incluir pausas sin declararlas.",
    "rpo_target": null,
    "rto_target": null,
    "production_frequency": null,
    "production_cost": null,
    "live_measurements": null
  },
  "claims": {
    "integrated_restore": false,
    "AC-073_global": false,
    "hosted": false,
    "production": false,
    "task_closed": false,
    "independent_audit": false
  },
  "pending": {
    "ARCH-PENDING-002": "OPEN/PENDING",
    "DM-PENDING-005": "OPEN"
  },
  "database_recovery": {
    "mechanism": "postgres17-custom-archive-create",
    "global_scope": "globals-only-no-role-passwords",
    "global_policy": "new-exclusive-cluster-default-tablespaces-only",
    "name_policy": "source-equals-archive-equals-destination",
    "maintenance_policy": "rename-only-empty-initdb-postgres-before-import",
    "maintenance_name_pattern": "^h6015_maint_[a-z0-9_]{1,40}$",
    "archive_target_must_not_exist": true,
    "create_transaction": "none-exit-on-error-discard-failed-destination",
    "owner_acl_settings": "resource-specific-core-partitioned-storage-complete-archive",
    "property_snapshot_sql_sha256": "2d31aa842bf246642ffb36c7964e57c0b582972c85011a43d17a32177672fab5",
    "equivalence_fields": [
      "database",
      "owner",
      "acl-grantor-grantee-privilege-grant-option",
      "database-settings",
      "role-in-database-settings"
    ],
    "core_public_connect_temp": "source-and-destination-denied",
    "post_restore_gate": "private-exact-snapshot-equality-and-independent-effective-privilege-review",
    "runtime_evidence": "NO EJECUTADA; required in authorized H6-015",
    "resume_on_exit_zero": false,
    "extension_create_is_not_owner_restore": true
  },
  "environment_generation_recovery": {
    "normative_source": "docs/DECISIONS.md D037.5 and D038.6",
    "stage": "S06-before-S07-any-capability-or-service",
    "authority": "protected-administrative-provisioning-never-runtime",
    "distinct_from_actor_access_generation": true,
    "fresh_F1_F2_generation_keys": true,
    "all_restored_enabled_keys_disabled_retained": true,
    "protected_parameterized_transaction": true,
    "new_signers_only_after_commit_and_readback": true,
    "old_capabilities_and_old_generation_denied": true,
    "failure_keeps_quarantine": true,
    "observed_state": "NO EJECUTADA"
  },
  "extension_recovery": {
    "name": "pgcrypto",
    "schema": "crm_crypto",
    "version": "1.3",
    "extension_owner": "crm_h0_migration",
    "phases": [
      "database",
      "crypto-schema",
      "provision-extension",
      "content"
    ],
    "partition_complete_disjoint": true,
    "bootstrap_member_equivalence": "only-non-definer-C-functions-pgcrypto-members-default-ACL-owner-OID10-to-OID10",
    "crm_owners_acl_no_normalization": true,
    "source_receipt_and_independent_catalog_check_required": true,
    "observed_state": "NO EJECUTADA",
    "resource_kind": "core"
  },
  "storage_database_recovery": {
    "resource_kind": "storage",
    "source_runner": "scripts/test-postgres.mjs",
    "upstream_commit": "5def1dfc15ab7f08fe271c7d1e70542424524e4e",
    "database": "postgres",
    "owner": "postgres",
    "archive_policy": "full-custom-create-no-use-list",
    "globals_once_per_cluster": true,
    "crm_extension_recipe_applicable": false,
    "nonbuiltin_extensions": "must-be-absent-or-stop-unreviewed-variant",
    "platform_baseline": "builtin-initdb-objects-independent-platform-proof-not-restored-CRM-objects",
    "catalog_and_effective_privileges": "source-destination-exact-no-core-PUBLIC-assumption",
    "actual_catalog_receipt_required": true,
    "observed_state": "NO EJECUTADA"
  }
}
```

## S01 — Autoridad e inputs

**Entrada:** autorización de H6-015; H5-019, H6-014, H6-006 y H6-008 satisfechas en sus ámbitos; responsable humano y técnico designados; inventario R01–R15 y copias del punto elegido identificadas. H6-006/008 y cierre de H6-014 siguen pendientes al preparar este documento. No avanzar desde este paso por el PASS de la preparación.

El tercero autorizado debe fijar en un recibo nuevo: commit/árbol y 68 migraciones, identidad de origen y destino, versión real de motor/cliente/Storage, dueño del recurso, configuración de red, corte, archivos, hashes, tamaño y referencias protegidas. Leer `tests/fixtures/h6-014/preflight.json` solo acredita herramientas de preparación, no crea ese recibo futuro.

Separar responsabilidades: Andrés autoriza recursos y acepta límites; técnico ejecuta; verificador distinto revisa evidencias cuando su auditoría esté autorizada; el custodio de secretos entrega únicamente el material del ensayo por canal protegido. No trasladar a Git, Drive o contexto IA datos del vault, contraseñas, F1/F2, QR/TOTP, JWT o enlaces temporales. No copiar Production.

**Salida observable:** recibo de inputs completo, no secreto, con todos los recursos y autoridades. **Parada:** falta un input material, dependencia, permiso o copia; mantener pendiente solo la parte dependiente y conservar lo investigado. No inventar endpoints, helpers ni recursos.

## S02 — Cuarentena del destino

**Entrada:** autorización e identidad de destino nuevo, exclusivo y vacío. La restauración de este procedimiento es lógica local, no un restore in-place ni replay sobre una base en uso.

Antes de cargar datos, el destino no tiene UI, listener público, workers, scheduler, handlers de eventos ni conectores con efectos. PostgreSQL debe ser accesible solo mediante socket Unix en directorio privado del ensayo; Storage solo loopback y sin egress hacia proveedores. El usuario local del cluster y su directorio deben ser exclusivos del ensayo. La infraestructura de ensayo debe aportar evidencia de esa configuración; una etiqueta `development` no basta. No se cambia la política de seguridad del producto para conseguir aislamiento.

Durante captura/restauración de payload sensible, tanto el origen exclusivo como el destino deben impedir logs de valores: servidor sin persistencia de stdout/stderr de datos, ningún echo SQL/parámetro/cuerpo, cliente sin xtrace ni captura cruda. El harness conserva únicamente fase, tiempos, exit code y comprobaciones redactadas. Si no se garantiza esa configuración, parar antes de manejar claves. El logfile de arranque del destino del ejemplo es /dev/null; la evidencia de proceso la genera el harness sin texto SQL ni errores crudos. No asumir que un log privado permite incluir secretos.

La suspensión preventiva es de procesos/red/canales del ensayo, no se presume un interruptor global CRM inexistente. `pause/stop` de B08 son controles por trabajo; no sustituyen la cuarentena. No se arrancan ejecutores de negocio para validar un restore. Los adaptadores se invocan únicamente desde el harness local autorizado y con destinatarios simulados.

**Salida observable:** conexiones y procesos inventariados; canal sensible suspendido; endpoints ajenos inaccesibles según prueba futura. **Parada:** destino compartido, conexión externa no autorizada o imposibilidad de mantener la suspensión. No liberar la cuarentena por timeout o por restauración exitosa del archivo.

## S03 — Corte y testigo independiente

**Entrada:** origen exclusivamente sintético, fuentes disponibles y cuarentena activa. El operador detiene todos los escritores del origen: Core, puertos Auth de prueba, Storage y dobles que formen parte del corte, sin borrar estados.

Fijar `t0` como corte coherente. La base Core y el Storage local pueden tener PostgreSQL distintos, tal como muestra `scripts/test-postgres.mjs`; no existe una transacción única que haga atómicos ambos motores y sus bytes. Mantener escritores detenidos mientras se capturan todas las bases, sus objetos y configuración. Registrar inicio/fin UTC y reloj monotónico del corte, sin presentar un intervalo de captura como instante exacto si no lo es. Si no puede congelarse todo, rediseñar el ensayo autorizado o documentar la inconsistencia y parar el restore.

Construir antes del rollback un testigo independiente `t1` fuera del destino restaurado. Debe conservar IDs de sesiones y revocaciones posteriores a t0, subject/actor/generación sin tokens, e identidad de efecto, operación, intento, destinatario simulado, versión, importe/moneda cuando corresponda, momentos y evidencia de pago/envío ejecutado o incierto. Debe indicar cobertura, fuente, versión y completitud; un registro vacío incompleto no acredita que no ocurrió un efecto.

El doble externo conserva su estado t1 mientras Core se restaura a t0. No restaurar ambos a t0. El testigo es material sintético protegido, con hash y copia separada. Los fixtures históricos W41 orientan el caso pero no son un nuevo testigo temporal ni un restore real.

**Salida observable:** identidad de corte coherente y testigo fuera del rollback. **Parada:** corte inconsistente, testigo perdido o sin cobertura suficiente; desconocido sigue desconocido.

## S04 — Copias e integridad

**Entrada:** corte con escritores detenidos y directorio protegido nuevo del ensayo fuera del repositorio y fuera de carpetas de evidencia compartida. Modo privado y control de acceso son necesarios; no equivalen por sí solos a cifrado o disponibilidad futura.

Los nombres `H6015_*` de los bloques siguientes son parámetros del futuro ensayo: se rellenan desde el recibo S01, no son configuración existente. `H6015_BIN` se comprueba contra Postgres.app 17.11 y versión del origen. `H6015_SOURCE_SOCKET/PORT/BOOTSTRAP` identifican el cluster exclusivo; los parámetros de destino deben ser distintos. No contienen contraseñas. Para herramientas que las requieran, el custodio prepara un mecanismo libpq protegido; nunca un DSN con contraseña en argumentos, documentos o logs.

Los bloques son Bash con parada ante el primer error y salidas crudas descartadas. El harness autorizado registra solo fase/exit code/tiempo; no activa xtrace ni almacena stderr SQL. No continuar manualmente después de un código no cero.

**Bloque de captura futuro, no ejecutado en H6-014:**

```sh
set +x
set -euo pipefail
umask 077
: "${H6015_BIN:?ruta PostgreSQL comprobada}"
: "${H6015_PRIVATE_DIR:?directorio privado nuevo}"
: "${H6015_SOURCE_SOCKET:?socket Unix del origen sintético}"
: "${H6015_SOURCE_PORT:?puerto del origen}"
: "${H6015_SOURCE_BOOTSTRAP:?autoridad de copia autorizada}"
: "${H6015_SOURCE_DB:?base exacta del recibo}"
test ! -e "$H6015_PRIVATE_DIR/globals.sql"
test ! -e "$H6015_PRIVATE_DIR/database.dump"
test ! -e "$H6015_PRIVATE_DIR/source-properties.json"
test -f "$H6015_PRIVATE_DIR/database-properties.sql"
# H6014-CMD capture-globals
"$H6015_BIN/pg_dumpall" --host="$H6015_SOURCE_SOCKET" --port="$H6015_SOURCE_PORT" --username="$H6015_SOURCE_BOOTSTRAP" --no-password --globals-only --no-role-passwords --file="$H6015_PRIVATE_DIR/globals.sql" >/dev/null 2>&1
# H6014-CMD capture-database
"$H6015_BIN/pg_dump" --host="$H6015_SOURCE_SOCKET" --port="$H6015_SOURCE_PORT" --username="$H6015_SOURCE_BOOTSTRAP" --no-password --dbname="$H6015_SOURCE_DB" --format=custom --no-publications --no-subscriptions --file="$H6015_PRIVATE_DIR/database.dump" >/dev/null 2>&1
# H6014-CMD source-properties
"$H6015_BIN/psql" -X --host="$H6015_SOURCE_SOCKET" --port="$H6015_SOURCE_PORT" --username="$H6015_SOURCE_BOOTSTRAP" --no-password --dbname="$H6015_SOURCE_DB" --set=ON_ERROR_STOP=1 --tuples-only --no-align --file="$H6015_PRIVATE_DIR/database-properties.sql" >"$H6015_PRIVATE_DIR/source-properties.json" 2>/dev/null
```

Repetir la captura de base con archivo distinto por cada base independiente, incluido Storage cuando corresponda. No sobrescribir una captura anterior. Publications/subscriptions quedan fuera del dump para evitar activaciones de red: inventariar previamente sus nombres/definiciones no secretas, declarar ausencia si es real y conservar configuración protegida separada si existen. La reactivación queda prohibida en este procedimiento. No ejecutar SQL que exporte `pg_authid`, secretos ni `subconninfo` hacia evidencia.

El volcado completo incluye `crm_f1.keys.secret` y `crm_f2.keys.secret`. **El archivo entero es sensible** y solo puede residir en custodia protegida del ensayo. `--no-role-passwords` no elimina los secretos de tablas ni toda configuración sensible de roles. `globals.sql` y la configuración también se mantienen protegidos. Los logs nunca guardan valores secretos: las salidas crudas de herramientas se descartan y el harness registra solo metadatos de fase y códigos de salida; no se copian errores de COPY, parámetros o sentencias a evidencias. No listar datos del archivo en consola ni copiar payloads a Git/Drive.

Antes de restaurar, calcular SHA-256 y tamaño de todos los archivos por lectura de bytes, registrar tipo y orden; comparar con el recibo de captura independiente. `pg_restore --list --create archivo` permite inspeccionar la TOC sin conectar; su salida se revisa dentro del área protegida y solo se exporta una síntesis mínima. El tercero debe comprobar que los schemas CRM, Auth/Storage metadata del origen real, extensiones, constraints, funciones y grants necesarios están incluidos. Un dump schema-only de H6-013 no vale como copia de datos.

Copiar bytes del backend de archivos de Storage, con escritores detenidos, junto con manifest privado de referencias/digest/tamaño/media; no modificar metadatos a mano. El backend de archivo y su metadata propia deben apuntar al mismo corte. Configuración y escrow de claves quedan en archivos protegidos separados, con inventario sin valores. **No se crean estas copias durante H6-014.**

**Salida observable:** manifest privado de copias y testigo, integridad verificada, compatibilidad y cobertura explícitas. **Parada:** cualquier hash, tamaño, formato, versión, corte o cobertura discordantes. No regenerar la copia o el esperado a partir del destino para obtener igualdad.

## S05 — Restauración de roles y bases

**Entrada:** destino nuevo, vacío y en cuarentena, con PostgreSQL compatible, locale/encoding/extensiones documentados y bootstrap del destino distinto de todos los roles del origen capturado. La preparación del cluster corresponde al harness H6-015 autorizado: directorio privado propio, `listen_addresses` vacío y socket exclusivo. Si no existe ese recurso, no apuntar a una base compartida por conveniencia. El bloque de aprovisionamiento que sigue se ejecuta solo en esa fase autorizada, antes del bloque de restauración.

Inspeccionar `globals.sql` en área protegida. Contiene únicamente globals del origen sintético autorizado; no importar roles de otros proyectos o de un cluster compartido. Crear/restaurar atributos y memberships antes de objetos que los referencian. El bootstrap temporal distinto evita colisión con el rol bootstrap del origen; ninguna colisión se resuelve borrando un rol o ignorando errores. Owners, ACL y FORCE RLS deben conservarse. No usar `--no-owner`, `--no-privileges`, `--clean`, `--disable-triggers`, filtros de tabla o modo de continuar con errores para que el restore pase.

**Aprovisionamiento futuro del cluster exclusivo, no ejecutado en H6-014:**

Elegir directorios nuevos dentro del área privada propia. El recibo exige paths absolutos sin comillas/apóstrofos ni caracteres de control, bootstrap con identificador SQL simple y puerto válido; nombres distintos de cualquier recurso/origen existente. La configuración locale-provider/encoding/collation debe corresponder al origen; si es ICU o builtin, aportar además sus parámetros específicos documentados o parar por incompatibilidad, sin convertirlo silenciosamente a libc. Este bloque solo aplica al origen local libc/C de los fixtures cuando esa compatibilidad se haya comprobado.

```sh
set +x
set -euo pipefail
: "${H6015_DEST_DATA:?directorio de datos nuevo}"
: "${H6015_DEST_SOCKET:?socket nuevo en directorio privado ya creado}"
: "${H6015_DEST_BOOTSTRAP:?rol temporal distinto de todos los roles del origen}"
: "${H6015_DEST_PORT:?puerto identificado en recibo}"
: "${H6015_ENCODING:?encoding comprobado}"
: "${H6015_LC_COLLATE:?collation comprobada}"
: "${H6015_LC_CTYPE:?ctype comprobado}"
test ! -e "$H6015_DEST_DATA"
: "${H6015_MAINT_DB:?nombre de mantenimiento nuevo del recibo}"
[[ "$H6015_MAINT_DB" =~ ^h6015_maint_[a-z0-9_]{1,40}$ ]]
# H6014-CMD init-cluster
"$H6015_BIN/initdb" --pgdata="$H6015_DEST_DATA" --username="$H6015_DEST_BOOTSTRAP" --auth=trust --encoding="$H6015_ENCODING" --locale-provider=libc --lc-collate="$H6015_LC_COLLATE" --lc-ctype="$H6015_LC_CTYPE" >/dev/null 2>&1
# H6014-CMD start-cluster
"$H6015_BIN/pg_ctl" -D "$H6015_DEST_DATA" -l /dev/null -o "-k '$H6015_DEST_SOCKET' -h '' -p $H6015_DEST_PORT" -w start >/dev/null 2>&1
# H6014-CMD reserve-maintenance
"$H6015_BIN/psql" -X --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname=template1 --set=ON_ERROR_STOP=1 --command="ALTER DATABASE postgres RENAME TO $H6015_MAINT_DB" >/dev/null 2>&1
```

El trust local reproduce únicamente el mecanismo del cluster efímero privado de los fixtures: sin listener TCP, directorio socket con acceso exclusivo del usuario del ensayo y ningún servicio de aplicación expuesto. Si esos límites no se acreditan, detener el proceso propio antes de cargar datos; no trasladar esta configuración a otro entorno. Tras terminar el ensayo se detendrá solo este cluster por su identidad y directorio; no borrar sus archivos/logs hasta la autorización de disposición de evidencia.

**Carga común de globals, una sola vez por cluster exclusivo, no ejecutada en H6-014:**

Usar el globals.sql de ese cluster y su área privada; no cargar globals de Core en el cluster Storage. Tras esta carga, seleccionar SOLO la variante Core o Storage correspondiente a la base capturada. El orden de marcadores del instrumento describe su aparición en el documento, no ordena ejecutar ambas variantes sobre la misma base.

```sh
set +x
set -euo pipefail
: "${H6015_DEST_SOCKET:?socket Unix del destino exclusivo}"
: "${H6015_DEST_PORT:?puerto del destino}"
: "${H6015_DEST_BOOTSTRAP:?bootstrap temporal exclusivo}"
: "${H6015_MAINT_DB:?base de mantenimiento aislada}"
# H6014-CMD restore-globals
"$H6015_BIN/psql" -X --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_MAINT_DB" --set=ON_ERROR_STOP=1 --single-transaction --file="$H6015_PRIVATE_DIR/globals.sql" >/dev/null 2>&1
```

**Variante Core únicamente, no ejecutada en H6-014:**

```sh
set +x
set -euo pipefail
: "${H6015_DEST_SOCKET:?socket Unix del destino exclusivo}"
: "${H6015_DEST_PORT:?puerto del destino}"
: "${H6015_DEST_BOOTSTRAP:?bootstrap temporal exclusivo}"
: "${H6015_MAINT_DB:?base de mantenimiento aislada}"
: "${H6015_SOURCE_DB:?nombre acreditado en origen}"
: "${H6015_ARCHIVE_DB:?nombre acreditado en el archivo protegido}"
: "${H6015_DEST_DB:?mismo nombre en el cluster nuevo}"
test "$H6015_SOURCE_DB" = "$H6015_ARCHIVE_DB"
test "$H6015_ARCHIVE_DB" = "$H6015_DEST_DB"
test "$H6015_DEST_DB" != "$H6015_MAINT_DB"
test "$H6015_DEST_DB" != template0
test "$H6015_DEST_DB" != template1
test ! -e "$H6015_PRIVATE_DIR/destination-properties.json"
# H6014-CMD restore-database
"$H6015_BIN/pg_restore" --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_MAINT_DB" --create --use-list="$H6015_PRIVATE_DIR/database.list" --exit-on-error "$H6015_PRIVATE_DIR/database.dump" >/dev/null 2>&1
# H6014-CMD restore-crypto-schema
"$H6015_BIN/pg_restore" --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_DEST_DB" --exit-on-error --single-transaction --use-list="$H6015_PRIVATE_DIR/crypto-schema.list" "$H6015_PRIVATE_DIR/database.dump" >/dev/null 2>&1
# H6014-CMD provision-extension
"$H6015_BIN/psql" -X --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_DEST_DB" --set=ON_ERROR_STOP=1 --file="$H6015_PRIVATE_DIR/provision-pgcrypto.sql" >/dev/null 2>&1
# H6014-CMD restore-content
"$H6015_BIN/pg_restore" --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_DEST_DB" --exit-on-error --single-transaction --use-list="$H6015_PRIVATE_DIR/content.list" "$H6015_PRIVATE_DIR/database.dump" >/dev/null 2>&1
# H6014-CMD destination-properties
"$H6015_BIN/psql" -X --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_DEST_DB" --set=ON_ERROR_STOP=1 --tuples-only --no-align --file="$H6015_PRIVATE_DIR/database-properties.sql" >"$H6015_PRIVATE_DIR/destination-properties.json" 2>/dev/null
# H6014-CMD compare-properties
/usr/bin/cmp -s "$H6015_PRIVATE_DIR/source-properties.json" "$H6015_PRIVATE_DIR/destination-properties.json"
```

**Variante Storage local del runner fijado únicamente, no ejecutada en H6-014:**

La fuente scripts/test-postgres.mjs:40–46 crea otra base postgres bajo el rol postgres y fija el upstream 5def1dfc15ab7f08fe271c7d1e70542424524e4e. Su SQL tenant crea storage y sus roles propios; no declara crm_crypto, crm_h0_migration ni CREATE EXTENSION. Esto acredita la receta conocida, no un catálogo o backup existente. Antes de seleccionar esta variante, el recibo futuro S03/S04 debe comprobar el catálogo real y la TOC íntegra, origen/base/owner postgres, schema storage, todos los owners/roles capturados y ausencia de extensiones añadidas después de initdb. partition_restore_toc(..., "postgres", "postgres", resource_kind="storage") comprueba la estructura limitada y cobertura literal en memoria, sin generar ni usar listas de selección. No sustituye ese catálogo ni el segundo cotejo independiente con el archivo. Si el catálogo o TOC tienen otra extensión/variante, parar antes de cargar: se necesita una receta revisada para ese recurso; no importar la provisión Core ni normalizar owners desconocidos.

```sh
set +x
set -euo pipefail
: "${H6015_DEST_SOCKET:?socket Unix del destino Storage exclusivo}"
: "${H6015_DEST_PORT:?puerto del destino}"
: "${H6015_DEST_BOOTSTRAP:?bootstrap temporal exclusivo}"
: "${H6015_MAINT_DB:?base de mantenimiento aislada}"
: "${H6015_SOURCE_DB:?nombre acreditado en origen}"
: "${H6015_ARCHIVE_DB:?nombre acreditado en archivo}"
: "${H6015_DEST_DB:?mismo nombre en destino}"
test "$H6015_SOURCE_DB" = "$H6015_ARCHIVE_DB"
test "$H6015_ARCHIVE_DB" = "$H6015_DEST_DB"
test "$H6015_DEST_DB" != "$H6015_MAINT_DB"
test "$H6015_DEST_DB" != template0
test "$H6015_DEST_DB" != template1
test ! -e "$H6015_PRIVATE_DIR/destination-properties.json"
# H6014-CMD restore-storage
"$H6015_BIN/pg_restore" --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_MAINT_DB" --create --exit-on-error "$H6015_PRIVATE_DIR/database.dump" >/dev/null 2>&1
# H6014-CMD storage-destination-properties
"$H6015_BIN/psql" -X --host="$H6015_DEST_SOCKET" --port="$H6015_DEST_PORT" --username="$H6015_DEST_BOOTSTRAP" --no-password --dbname="$H6015_DEST_DB" --set=ON_ERROR_STOP=1 --tuples-only --no-align --file="$H6015_PRIVATE_DIR/database-properties.sql" >"$H6015_PRIVATE_DIR/destination-properties.json" 2>/dev/null
# H6014-CMD storage-compare-properties
/usr/bin/cmp -s "$H6015_PRIVATE_DIR/source-properties.json" "$H6015_PRIVATE_DIR/destination-properties.json"
```

Storage carga el archivo completo con --create, sin --use-list, sin -1, sin supresión de owner/ACL y sin crear objetos CRM. Conserva su nombre postgres mediante el mismo mantenimiento aislado ya reservado y usa compare_database_properties(..., resource_kind="storage") más catálogo y privilegios efectivos propios antes de servicio. Mantener el servicio detenido durante la carga; no arrancarlo para regenerar ni migrar metadata por conveniencia. Los objetos builtin de initdb no recreados por pg_dump son plataforma nueva compatible, acreditada por versión/catálogo, no objetos CRM restaurados ni una equivalencia genérica de owners. No confundir esa plataforma con extensiones añadidas por usuario: estas no están soportadas por esta variante Storage. PostgreSQL17 selectDumpableExtension explica el tratamiento de extensiones builtin y sus ACL; cualquier cambio de ACL capturado se conserva y coteja.

Fuente técnica fijada: [Storage tenant 0002](https://raw.githubusercontent.com/supabase/storage/5def1dfc15ab7f08fe271c7d1e70542424524e4e/migrations/tenant/0002-storage-schema.sql). Plataforma: [pg_dump selectDumpableExtension](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/bin/pg_dump/pg_dump.c). Ninguna consulta a estas fuentes ha instalado o ejecutado Storage.

La base de negocio no se precrea con createdb: pg_restore --create la crea con el nombre archivado y restaura su owner, ACL y propiedades. createdb es un wrapper de CREATE DATABASE y no recupera ACL/GUC de una copia. Seleccionar la variante específica anterior para cada base; los globals se restauran una sola vez por cluster de origen/destino, antes de cualquiera de sus bases. Las fases crypto-schema/provision-extension/content son exclusivas de Core. Verificar antes la ausencia de colisiones con roles o extensiones preinstalados; una variante Hosted no se aplica aquí. `pgcrypto` conserva versión y schema; no mover ni reinstalar por conveniencia.

La restauración reproduce definiciones capturadas y ligadas a SQL versionado. No reaplicar las 68 migraciones sobre una base que ya contiene su estructura ni ejecutar DDL correctivo manual. Una diferencia del esquema aprobado exige diagnóstico y autorización/migración correspondiente bajo P13. Tras error, preservar copia/log y descartar para uso el recurso fallido; una nueva tentativa usa destino nuevo, sin limpiar evidencia histórica.

**Salida observable:** códigos de proceso satisfactorios y verificación independiente de contenido/ACL/propiedades; la transacción única solo cubre los globals compatibles, no la creación/carga de base; no éxito de negocio por `pg_restore` exit 0. **Parada:** conflicto de rol, owner, extensión, constraint o cualquier error. Ninguna reparación por borrado de datos.

### Correctivo M1 — Propiedades de base y nombre archivado

Este mecanismo se limita al cluster nuevo sintético. `pg_dumpall --globals-only --no-role-passwords` cubre roles, atributos, memberships, configuración global de roles y grants de parámetros; no contiene las bases ni sus propiedades. El recibo independiente debe confirmar que no hay tablespaces de usuario ni globals no reproducibles en el destino. Si existen, parar esta receta: no reproducir rutas de tablespace del origen en el mismo Mac ni omitir globals para conseguir PASS. Con tablespaces por defecto, el SQL global se restaura con ON_ERROR_STOP y transacción única. Sus valores siguen siendo sensibles.

`pg_dump --format=custom` conserva la información de base necesaria. Añadir --create a ese dump no cambia el archivo custom. En cambio, `pg_restore --create` aplica creación/owner, ACL de base, ALTER DATABASE SET y ALTER ROLE IN DATABASE SET, además de objetos, permisos y datos internos. No se añaden --no-owner ni --no-acl/--no-privileges. Las listas TOC son particiones completas y disjuntas, nunca una selección que omite tablas o datos. En las invocaciones --create, la conexión --dbname es la base de mantenimiento y la carga va al nombre archivado; las fases Core posteriores sin --create se conectan expresamente a esa base ya creada. No sustituir nombres mediante sed, SQL reescrito o un --dbname distinto esperando un remapeo.

S01/S04 deben contrastar por lectura protegida el nombre real en origen, la identidad del dump/TOC y el destino autorizado. Se exige igualdad exacta origen = archivo = destino, dentro de clusters diferentes. Si se pide un nombre diferente, parar esta variante y presentar una secuencia revisada antes de ejecutar. Antes de restore, el harness independiente consulta el catálogo del destino y acredita que el nombre archivado no existe. Esta comprobación y el hash del archivo no se sustituyen por las comparaciones de variables del bloque.

initdb crea una base vacía postgres. El bloque la renombra UNA VEZ a un nombre h6015_maint_* nuevo, validado y distinto de todos los nombres capturados, conectado a template1. Es una operación de aprovisionamiento del cluster nuevo, no una alteración del origen ni una reparación del esquema CRM. No borra datos ni base alguna; habilita que un archivo cuyo nombre sea postgres (como el Storage local) se restaure sin colisión. Exigir cluster recién creado sin sesiones adicionales y comprobar identidad/ausencia de colisiones antes del rename. No repetir este bloque para la segunda base del mismo cluster.

CREATE DATABASE no admite transacción. pg_restore --create se ejecuta sin --single-transaction/-1, con --exit-on-error, sin --clean y sin reintento sobre el recurso parcialmente cargado. Exit 0 no abre acceso. Toda la carga permanece en cuarentena, con solo el bootstrap del harness conectado; si falla, se conserva el destino fallido para diagnóstico protegido y una repetición usa cluster/destino nuevo. No prometer atomicidad del conjunto global+creación+carga.

**Comparación independiente exigida antes de abrir:** el futuro harness materializa EXACTAMENTE el SQL siguiente en database-properties.sql dentro del área privada, verifica su SHA-256 contra database_recovery.property_snapshot_sql_sha256 y lo usa sin modificaciones en origen y destino. Captura source-properties.json durante el mismo corte quiescente y destination-properties.json inmediatamente tras la carga, antes de S07. Ambos ficheros son privados: settings pueden contener información sensible. cmp -s compara el resultado canónico sin imprimirlo; cualquier diferencia o fichero vacío/malformado mantiene la cuarentena. El harness debe además parsear ambos objetos y ejecutar compare_database_properties del verificador para la base Core, y revisar privilegios efectivos mediante autoridad independiente. No basta que cmp compare dos archivos vacíos.

<!-- H6014-DATABASE-PROPERTIES-SQL -->
```sql
WITH db AS (
  SELECT oid, datname, datdba, datacl FROM pg_database
  WHERE datname = current_database()
), acl_rows AS (
  SELECT jsonb_build_array(pg_get_userbyid(a.grantor),
    CASE WHEN a.grantee = 0 THEN NULL ELSE pg_get_userbyid(a.grantee) END,
    a.privilege_type, a.is_grantable) AS item
  FROM db CROSS JOIN LATERAL
    aclexplode(COALESCE(db.datacl, acldefault('d', db.datdba))) AS a
), settings_rows AS (
  SELECT jsonb_build_array(
    CASE WHEN s.setrole = 0 THEN NULL ELSE pg_get_userbyid(s.setrole) END,
    setting) AS item
  FROM db JOIN pg_db_role_setting AS s ON s.setdatabase = db.oid
  CROSS JOIN LATERAL unnest(s.setconfig) AS setting
)
SELECT jsonb_build_object(
  'database', db.datname,
  'owner', pg_get_userbyid(db.datdba),
  'acl', COALESCE((SELECT jsonb_agg(item ORDER BY item::text COLLATE "C") FROM acl_rows), '[]'::jsonb),
  'settings', COALESCE((SELECT jsonb_agg(item ORDER BY item::text COLLATE "C") FROM settings_rows), '[]'::jsonb)
) FROM db;
```

La comparación normaliza datacl NULL mediante acldefault, descompone cada ACL en grantor, grantee (NULL identifica PUBLIC), privilegio y grant option y compara nombres lógicos, no OID. settings incluye todas las filas de pg_db_role_setting de esta base: rol NULL representa ALTER DATABASE SET; un rol identificado representa ALTER ROLE IN DATABASE SET. Conserva la asignación completa y el valor exacto; no redactar ni eliminar claves antes de comparar dentro del área privada. El futuro harness cubre aparte globals y configuración no contenida en estas filas, con su evidencia protegida.

Para Core, antes de capturar y tras restaurar, exigir que PUBLIC no tenga CONNECT ni TEMPORARY, conforme a 202609150001_h0_m01_context.sql. Comparar además el conjunto entero de ACL y owner, atributos/memberships y has_database_privilege para cada rol ordinario relevante: CONNECT, CREATE y TEMPORARY deben corresponder al origen aprobado. No generalizar esa revocación a una base Storage externa cuya ACL legítima sea distinta: allí se compara exactamente su propia fuente. Valores inesperados en origen también paran el ensayo; no se arreglan para producir igualdad. Solo resultados redactados de igualdad/denegación salen a evidencia, nunca los snapshots GUC.

Las comprobaciones presentes son estáticas y de comparación sintética en memoria. No se han obtenido catálogos originales/restaurados, ejecutado este SQL ni acreditado equivalencia dinámica en H6-014. Ese observado independiente sigue siendo una puerta obligatoria de H6-015.

Fuentes técnicas: [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_dumpall](https://www.postgresql.org/docs/17/app-pg-dumpall.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html), [createdb](https://www.postgresql.org/docs/17/app-createdb.html), [CREATE DATABASE](https://www.postgresql.org/docs/17/sql-createdatabase.html), [ALTER DATABASE](https://www.postgresql.org/docs/17/sql-alterdatabase.html). Son semántica técnica de PostgreSQL 17, no nueva normativa del CRM.

### A02 — Owner de extensión y miembros nativos

Este apartado se aplica SOLO a Core, nunca a Storage. pg_restore no restaura el owner de una EXTENSION automáticamente. Antes de la ejecución futura Core, generar tres listas privadas desde la TOC íntegra obtenida con pg_restore --list --create (sin conectar), mediante partition_restore_toc del verificador: database.list contiene DATABASE y todas sus propiedades/ACL/comentarios/etiquetas; crypto-schema.list contiene únicamente SCHEMA crm_crypto; content.list contiene absolutamente el resto, incluida la entrada EXTENSION. Cada dumpId pertenece a una sola lista; se conserva cada línea literal y todo el conjunto, sin omitir ni duplicar contenido. El recibo independiente fija nombre y owner esperados del catálogo de origen, y un segundo verificador coteja clasificación, cobertura, hashes y TOC con el archivo. El parser se limita a identificadores simples del ensayo; un formato/nombre no soportado detiene esta variante. No deducir el owner original de la entrada EXTENSION, que no lo contiene.

La fase database usa --create conectado a mantenimiento y sin -1. Sigue la fase crypto-schema sin --create, con owners/ACL por defecto; después se ejecuta el SQL de provisión siguiente, derivado de la migración F1 y del catálogo autorizado. Finalmente content se restaura sin --create, con -1 y sin suprimir owners/ACL. La entrada EXTENSION IF NOT EXISTS del archivo encuentra la instancia recién provisionada: no sustituye comprobar antes y después owner/version/schema/miembros. Este es el único objeto preinstalado deliberadamente. No instalarlo bajo el bootstrap temporal ni confiar en la versión por defecto; si origen no es exactamente pgcrypto 1.3 en crm_crypto con owner crm_h0_migration y el instalador no conserva el CREATE legítimo del origen, parar sin conceder nuevos permisos.

<!-- H6014-EXTENSION-SQL -->
```sql
BEGIN;
SET LOCAL ROLE crm_h0_migration;
CREATE EXTENSION pgcrypto WITH SCHEMA crm_crypto VERSION '1.3';
COMMIT;
```

El owner de la extensión permanece exactamente crm_h0_migration y el del schema también. Para sus miembros nativos existe una equivalencia administrativa explícita y limitada: la migración 202609160001_h0_f1_capabilities.sql:14–17 documenta que los objetos de pgcrypto trusted pertenecen al bootstrap PostgreSQL; CREATE EXTENSION de PG17 confirma ese comportamiento. El bootstrap del cluster fuente y el del nuevo pueden tener nombres diferentes. Solo se admite correspondencia entre el rol builtin OID 10 de cada cluster, acreditado por lectura privilegiada independiente, para funciones C no SECURITY DEFINER que pg_depend acredite como miembros de pgcrypto y que conserven ACL inicial por defecto. No se normalizan roles CRM, owner de extensión/schema, funciones SECURITY DEFINER, membresías, grants explícitos ni otros objetos. Si cualquier miembro cae fuera de ese caso acotado, parar y revisar la variante; no ampliar la equivalencia. La migración F2:147 conserva expresamente la ACL de extensión de PostgreSQL.

Capturar en privado antes del corte y tras la carga pg_extension (extname, extowner por rol, extversion, extnamespace), pg_depend con deptype e para el inventario completo de miembros y, para funciones, pg_proc (identidad lógica, owner, lenguaje, prosecdef y ACL). Comprobar bootstrap OID10/rol de cada cluster y comparar con compare_pgcrypto_properties del verificador. Conservar definiciones/binarios/versiones y acceso efectivo; no sustituir captura por un JSON autodeclarado. Una revisión independiente del catálogo real es puerta de H6-015, NO EJECUTADA aquí. Esta correspondencia reproduce la autoridad builtin descrita por el código aprobado y no modifica una autoridad contractual CRM.

## S06 — Configuración y secretos protegidos

**Entrada:** bases restauradas y configuración del mismo corte disponible mediante custodio. Mantener servicios suspendidos.

Recuperar configuración no secreta y versiones de aplicación/lockfile, reglas, automatismos y contratos por separado. Usar runtime y pool TTE privados ya existentes; no otorgar DML/DDL general al rol ordinario. Credenciales de roles, claves F1/F2 y secretos de Storage/Auth son recursos separados: no se deducen del código ni del éxito de un dump. Recuperar material del ensayo por canal protegido y cargarlo en memoria/archivo privado mediante composición del servidor. No usar SELECT a tablas de claves desde runtime; el custodio no exporta valores a contexto IA ni evidencia.

Comprobar keyId/audience/generation/purposes y correspondencia del material con la tabla restaurada, separación F1/F2, login y entorno. Solo registrar resultado de la comprobación e identificadores mínimos; no hashes individuales de secretos como sustituto de custodia ni valores. No rotar claves ni alterar grants como atajo ante una incompatibilidad; la renovación obligatoria de entorno D037/D038 descrita abajo es una operación de seguridad distinta y previa a servir; un medio ausente bloquea su uso dependiente. Una copia antigua de contraseña de rol o de configuración no acredita la credencial vigente.

Para Storage local, verificar el commit fijado por `scripts/test-postgres.mjs`, configuración `file`, backend restaurado y base/puertos propios. La posterior invocación del servicio se hará con la configuración protegida y loopback del harness; no copiar el ambiente de producción ni activar colas, S3 o conectores no necesarios. El runner completo de integración tiene escrituras y no se usa para comprobar H6-014.

La recuperación del usuario real, email, cuenta propietaria y TOTP/papel se mantiene en D025/D027/D031 y H6-009/010/011. El Auth sintético de este ensayo no acredita esos medios.

### A01 — Renovación obligatoria de generación de entorno

D037.5 exige generación propia renovada tras restore/clonación/reset antes de servir; D038.6 mantiene la separación F1/F2. No confundirla con access_generation del actor ni con cambiar postmaster/binding. Antes de S07 y antes de emitir cualquier capability o arrancar servicio, el custodio y la autoridad administrativa del ensayo deben:

1. Capturar en área protegida todas las generaciones/keyId habilitadas restauradas y el inventario t1 conocido. Elegir generaciones nuevas y keyId nuevos no presentes en esos conjuntos para F1/F2, con K independientes de 32 bytes generadas criptográficamente; audience/purposes/validez proceden del recibo autorizado y no amplían el alcance. No imprimir material, hashes de secretos ni proofs.
2. Por canal administrativo separado de runtime, transacción parametrizada: deshabilitar todas las filas enabled restauradas de crm_f1.keys y crm_f2.keys conservándolas; insertar filas nuevas con los campos key_id,secret,audience,generation,purposes,enabled,valid_from,valid_until de las tablas aprobadas. Reutilizar el patrón de provisión de tests/integration/postgres-h0-014.test.ts:99–109 y tests/integration/f1-fixture.ts:8–20, no sus migraciones ni sus valores de ejemplo. Fechas/propósitos vienen del input autorizado. No UPDATE/DELETE de hechos de negocio, actores o historia.
3. Confirmar la transacción y leer de forma privilegiada y privada la coherencia de filas, generación y separación de claves. Cerrar cualquier emisor/pool preexistente; construir firmadores nuevos con las configuraciones confirmadas. Ante error, resultado incierto, falta de autoridad o lectura discordante, no emitir y mantener cuarentena.
4. Probar en H6-015 rechazo de capacidades F1 y F2 de generaciones restauradas y t1, aun dentro de su ventana y con los demás campos controlados; probar aceptación solo de generación nueva con autoridad vigente. Registrar únicamente IDs mínimos, diferencias permitidas y resultados saneados. No presentar el cambio de access_generation de S07 como esta prueba.

Son operaciones administrativas de provisión ya contempladas por D037/D038, no nuevo contrato ni DDL manual. S09 preserva la foto original de key rows y enumera exactamente el deshabilitado y las altas de seguridad como diferencias posteriores autorizadas; no usa una exclusión genérica. Estas operaciones no se ejecutan durante H6-014. Si falta una pieza de la provisión protegida, la continuación dependiente permanece bloqueada, nunca se reutiliza la generación restaurada como alternativa.

**Salida observable:** configuración compatible y comprobación redactada de medios protegidos; ningún servicio sensible habilitado. **Parada:** credencial ausente, configuración ambigua o autoridad insuficiente.

## S07 — Identificación nueva y revocación

**Entrada:** cuarentena activa, actor/subject del origen legítimo, medios protegidos coherentes y Auth de prueba independiente del rollback.

No autorizar ninguna petición con una sesión recuperada. La composición local crea una identificación nueva de control con `verifyAuth` y `H0005PostgresAdapter.establish`, sin `sessionId` previo y con password/MFA comprobadas por el puerto sintético de ensayo. `establish` genera sessionId/epoch nuevos. Con esa autoridad llamar a `H0013GlobalAccessRevocationAdapter.revokeAll`, cuyo contrato incrementa la generación del Core y coordina Auth. Debe resultar `status=completed` y `auth=revoked`; incluye la sesión emisora. Cualquier estado partial/pending/failed/uncertain mantiene la cuarentena.

La forma de composición usa únicamente contratos existentes (fragmento futuro para harness, no ejecutado):

```ts
import {verifyAuth} from '../../src/application/verified-auth.ts';
import {H0005PostgresAdapter} from '../../src/infrastructure/postgres/h0-005-adapter.ts';
import {H0013GlobalAccessRevocationAdapter} from '../../src/infrastructure/postgres/h0-013-adapter.ts';
import {createSyntheticAuthVerifier} from '../../tests/integration/synthetic-auth-fixture.ts';
// Solo harness sintético: runtimeSql, f1/f2, subject y authRevocation se reciben
// de su composición protegida. authRevocation implementa AuthGlobalRevocationPort
// con estado del doble independiente del rollback; no se afirma Auth real.
const synthetic = createSyntheticAuthVerifier();
const access = new H0005PostgresAdapter(runtimeSql, f1, f2);
const revoke = new H0013GlobalAccessRevocationAdapter(runtimeSql, f1, f2, authRevocation);
const identified = await verifyAuth(synthetic.port, synthetic.register({subject, passwordVerified: true, mfaVerified: true}));
const established = await access.establish(identified);
const active = await verifyAuth(synthetic.port, synthetic.register({subject, sessionId: established.sessionId, passwordVerified: true, mfaVerified: true}));
const result = await revoke.revokeAll(active);
if (result.status !== 'completed' || result.auth !== 'revoked') throw new Error('RESTORE_QUARANTINE_REQUIRED');
```

El fragmento usa los exports y firmas existentes; `createSyntheticAuthVerifier.register` produce pruebas exclusivamente sintéticas como los tests H0-014. Los flags password/MFA del fixture no acreditan contraseña/TOTP reales. El puerto de revocación debe conservar y comprobar el estado independiente del doble; un callback que solo devuelve revoked no prueba por sí solo esa revocación. La implementación real de Auth sigue sin acreditarse. No registrar proofs o el objeto auth.

Aplicar el procedimiento al único Administrador habilitado de V1 y enumerar cualquier otro actor presente: un actor deshabilitado o con recuperación incompleta permanece denegado, no se habilita para ejecutar esta operación. Si el contrato no puede obtener autoridad legítima, parar la apertura; no usar UPDATE de generaciones/sesiones como atajo. No basta comparar un contador restaurado contra un máximo supuesto: probar denegación efectiva.

Contrastar todas las sesiones t0 y del testigo t1, incluida la emisora de la revocación: lecturas, mutaciones, resultados previos, proyecciones y objetos pertinentes deben denegar sin filtración. El registro Core y el estado de Auth se comprueban por separado; JWT vigente y URL emitida pueden tener límites técnicos propios. Para acceder a las comprobaciones positivas, hacer una segunda identificación completa nueva, diferente de todas las anteriores, sin revivir epochs ni reutilizar sessionId.

**Salida observable:** revocación coordinada y pruebas negativas por superficie; nuevas operaciones de seguridad se añaden a historia, no reescriben hechos de negocio. **Parada:** cualquier sesión previa admitida, Auth incierto o medio faltante. No abrir UI ni automatismos.

## S08 — Objetos y metadata independientes

**Entrada:** denegación de sesiones previas comprobada y Storage local recuperable identificado.

Recuperar su propia base/metadata y backend de bytes conservando el corte S03. No asumir que el dump Core contiene los objetos o que `storage.objects` del proveedor vive en la misma base del runner. Arrancar solo el servicio Storage aislado imprescindible para las verificaciones de bytes; ningún worker de negocio.

Comparar cada objeto por referencia privada, digest SHA-256, tamaño y media, con versiones y vínculos Core. Usar `PrivateStorage.inventory/get` y `H1015ObjectAdapter.metadata/reconcile/download` con nueva autoridad F2 verificada. `reconcile` es una operación autorizada que registra la observación real y preserva historia; no simula atomicidad externa. La descarga reautoriza antes y después. No publicar signed URLs.

Para el caso AC-073, dejar identificado un objeto que sigue ausente: debe constar missing/incompleto y su descarga debe fallar. La corrupción o media distinta también falla integridad. Un blob sin metadata se conserva como huérfano/revisión sin inventar owner, borrar bytes o afirmar original recuperado. La reparación posterior queda explícita y trazada; una referencia conocida no concede acceso.

**Salida observable:** lista de presentes/ausentes/corruptos/huérfanos y sus vínculos, resultados de acceso y comprobación. **Parada:** diferencia inexplicada o declaración de conservación que contradice los bytes. No ocultar ausencia para pasar el ensayo.

## S09 — Integridad de datos y restricciones

**Entrada:** bases y objetos en estado conocido, sesiones previas denegadas y acceso de prueba nuevo.

Comparar todos los datos canónicos/identidades/relaciones/versiones/snapshots/historia/porciones y resultados del corte. Reutilizar `tests/support/h6-013-preservation.ts` para esquemas CRM con su semántica exacta de tipos, decimal, bigint, SQL NULL, arrays y multiplicidad. No usar IEEE754 Number para normalizar importes o IDs. Para Auth, metadata Storage, globals y configuración construir cobertura explícita adicional en el futuro harness; el filtro `crm%` no los incluye.

Verificar constraints validadas, propietarios, índices, triggers, FORCE RLS, memberships, SECURITY DEFINER, firma y search_path de cada función pertinente. La identidad lógica/definición debe conservarse; OID y binding de backend/xid/postmaster pueden ser distintos en un cluster nuevo y no se comparan como identidad contractual. El rol ordinario no adquiere ownership, BYPASSRLS, DDL ni acceso a claves; migrador/administrador no se usa como actor normal de los casos funcionales.

Separar las diferencias deliberadas posteriores a la restauración (nueva identificación, revocación coordinada, observaciones de objetos y conciliación) del conjunto inmutable del corte. Enumerarlas por operación, autoridad y expected independiente; no aplicar exclusiones genéricas ni igualar la foto eliminando esa historia nueva. Reservas, decisiones y recibos no se liberan por el restore.

**Salida observable:** comparación por recurso y criterios, incluidas denegaciones y permisos legítimos. **Parada:** pérdida o mutación no prevista; ninguna reparación por borrar hechos o debilitar restricciones.

## S10 — Conciliación de efectos posteriores

**Entrada:** integridad conocida y testigo t1 íntegro fuera del rollback; efectos sensibles suspendidos.

Unir por identidad de operación/efecto/parte/intento, no por semejanza de importe o fecha. Para cada pago, envío u otro efecto posterior al corte, consultar la fuente simulada independiente con estado propio. Identificar: ejecutado acreditado, no ejecutado acreditado, incierto o cobertura insuficiente. Conservar destinatario/material/versión y evidencias pertinentes. Un timeout o un registro inexistente en Core restaurado no prueba fracaso externo.

Si la fuente acredita ejecución previa, reutilizar/conciliar su resultado por los contratos existentes, sin iniciar otro efecto. Si sigue incierto, mantener reserva, intento e intervención pendiente; no liberar por caducidad del lease, permiso manual o espera. Solo una ausencia de efecto acreditada, con aprobación exacta vigente e idempotencia segura, permite evaluar un intento posterior en el alcance autorizado. `WorkResultVerifier` y `verifyWorkEffect` niegan priorEffect distinto de none; conservar ese comportamiento.

Las aprobaciones retiradas, caducadas o con contenido cambiado siguen históricas y no reaparecen aplicables por `resume`. La respuesta tardía debe pertenecer a su intento; un ejecutor obsoleto no sobrescribe resultados. Usar las operaciones existentes de `createPersistedWorkExecutor` y la fachada de aprobación humana existente, sin UPDATE de partes, reservas o recibos. Si el intento posterior no existe en Core t0, no fabricar un intento ni una transición aplicada: conservar evidencia/revisión por C04 y mantener el efecto suspendido hasta disponer de una vía legítima. Si una combinación exige contrato nuevo o política no aprobada, detener la parte afectada y solicitar decisión; no escribirlo como capacidad ya disponible.

**Salida observable:** tabla efecto → estado restaurado → fuente t1 → discrepancia → decisión/operación trazada, y contador de contactos/efectos del doble que demuestra ausencia de duplicación. Un objeto ausente permanece pendiente y no altera hechos financieros. **Parada:** identidad ambigua, fuente incompleta o resultado incierto sin protección; mantener bloqueo dependiente y no declarar no-efecto.

## S11 — Decisión de reentrada

**Entrada:** cuarentena, integridad, permisos y revocaciones comprobados; conciliación completa para el efecto cuya continuación se estudie. Un objeto ausente o hecho incierto deja explícito qué parte no puede avanzar. No es necesario inventar una recuperación íntegra para permitir análisis independiente.

El técnico presenta resultados y límites; Andrés debe autorizar expresamente cualquier reentrada del ensayo en el alcance exacto y con las aprobaciones/guardas vigentes. Restaurar datos o pasar los checks no reanuda workers, libera reservas ni concede aprobación humana. La propuesta por defecto mantiene todos los efectos sensibles suspendidos. Si falta una condición, documentar la negativa y continuar únicamente con comprobaciones que no generen esos efectos.

Una eventual continuación solo usa dobles sintéticos dentro del ensayo y contratos actuales. No habilita acceso real, Hosted, Production, emails, pagos, canales ni un scheduler productivo. La aceptación/configuración definitiva de continuidad sigue ARCH-PENDING-002; el tratamiento de datos reales sigue DM-PENDING-005.

**Salida observable:** decisión explícita por alcance, o estado pendiente con cuarentena conservada. **Parada:** ninguna autorización o condición material insuficiente. El paquete H6-014 no contiene una autorización de reentrada.

## S12 — Medición observada

**Entrada:** corte t0, testigo t1 y destino observados con cobertura conocida. No se producen mediciones dinámicas en H6-014.

Medir pérdida por diferencia de conjuntos de hechos/IDs entre punto de corte, testigo posterior completo y destino. Separar hechos posteriores ausentes, presentes y conciliados, versiones, vínculos y efectos externos ya ejecutados. Para importes, sumar exactamente por moneda y porción sin doble conteo. Si la fuente es incompleta, pérdida queda NO DETERMINADA; cero no es el valor por defecto. Medir ventana temporal solo cuando los límites de commit/hecho son comprobables; no asumir que el timestamp de una fila sea orden de commit.

Medir duración con reloj monotónico del harness para cada fase y total, acompañado de UTC de inicio/fin, herramientas, volumen y pausas incluidas/excluidas. Diferenciar tiempo de restauración de base, recuperación de objetos, validación, conciliación y espera humana. No convertir una medición de laboratorio en garantía.

RPO objetivo, RTO objetivo, frecuencia/cadencia y coste de Production permanecen pendientes y sin cifras. La prueba periódica exigida por normativa sigue siendo obligación futura; este documento no fija su frecuencia ni acredita haberla cumplido.

**Salida observable:** mediciones observadas con unidades, método, cobertura y límites, o NO EJECUTADA/NO DETERMINADA según corresponda. **Parada:** dato no reproducible; conservar desconocido sin ajustar el expected.

## S13 — Evidencia y STOP

**Entrada:** observados anteriores identificados y estado de cada comprobación. Registrar en paquete nuevo por tarea: commit/árbol, versiones, recursos, casos, expected previo, observado, resultado, limitaciones y referencias recuperables. Conservar originales FAIL y correctivos en caso de repeticiones; no convertir el último PASS en una ejecución retroactiva.

Los backups, configuración protegida, proofs, tokens y datos sensibles nunca forman parte del paquete de evidencia. Solo descriptores, resultados mínimos y referencias bajo autoridad válida. El manifest de integridad excluye su propio hash y debe poder comprobarse por lectura externa; no prometer WORM ni reloj externo.

Para H6-014, conservar los once artefactos del expected y los nueve del correctivo enumerados en criteria.json; el manifiesto y los resultados originales identifican solo el candidato histórico. Verificar el candidato actual con el manifiesto correctivo y conservar únicamente los artefactos declarados: expected, inventario, procedimiento, matriz, informe, verificador, autorización, preflight, sello expected, resultados y manifest. No modificar Tasks/PROJECT-STATUS/NEXT-STEPS para cerrar o maquillar el desfase histórico de publicación. No ejecutar auditoría independiente antes de la revisión del director.

Custodia oficial futura: cuenta info@huescaventura.com, carpeta 02_AUDITORIAS `14xSnNfE7K4hUrMopJaPEab2ccxD_8Rrr`, con subcarpeta propia de tarea. En esta ejecución no se crea carpeta ni se sube ningún archivo. BAILO OS no es repositorio principal de evidencia técnica CRM.

**Salida observable:** candidato local verificable para el director y propuesta de revisión focal. **Parada:** terminar al entregar el candidato. **STOP obligatorio:** sin H6-015, restauración integrada, auditoría independiente, cierre formal, commits, push, despliegue o publicación.

## Límites y comprobaciones de capacidad

Las opciones de CLI de los bloques se contrastaron contra `--help` de los binarios 17.11; no se ejecutaron contra una base. El control puro comprueba estructura y coherencia documental; no demuestra que los comandos/puertos restauren correctamente ni que Auth, Storage o el rollback temporal funcionen. Ese es el ensayo H6-015 con sus dependencias.

Referencias técnicas públicas ya contrastadas en el análisis del 21/10/2026: [Supabase Database Backups](https://supabase.com/docs/guides/platform/backups) y [credenciales tras restauración física](https://supabase.com/changelog/restore-credential-resync). No sustituyen la normativa del commit ni prueban un plan contratado, backups/PITR o configuración Hosted. Este procedimiento elige una recuperación lógica sintética; no generalizarlo a restore físico de PGDATA, PITR o in-place.
