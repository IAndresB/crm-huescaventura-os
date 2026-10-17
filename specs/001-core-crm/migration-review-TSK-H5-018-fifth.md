# Quinta auditoría — revisión independiente de migración 68

Candidato recibido intacto. Archivo `supabase/migrations/20261017004525_h5_diagnostic_version_provenance_replay.sql`, SHA256 `69f8bdddb1acd5fbef1d2154ae81d16a6ecc1a0f5ed34783a99c11dbb83e9563`. Las 67 migraciones anteriores se verifican contra el inventario F. Las diferencias exactas extraídas de las definiciones vigentes al terminar67 están en `tests/fixtures/h5-018-fifth/crm_*.diff`, con procedencia y hashes en `migration-static.json`.

## Identidad y contratos

| Función | Contrato conservado | Diferencia de cuerpo revisada |
|---|---|---|
| `crm_private.diagnostic_canonical_nodes(text,text,uuid)` | JSONB, STABLE, invoker, search_path cerrado. | Restringe versiones, aprobaciones e intentos por contexto tipado y fuente propia; une operación e historia con el propietario real y snapshot exacto; tarea solo si autorizada por su raíz; partes solo del material vigente y referencias de intento compatibles. |
| `crm_api.h5_diagnostic_record(bytea,bytea,bytea,bytea,bytea)` | JSONB, VOLATILE, definer; envolturas F1/F2, C03, entrada y límites conservados. | Serializa identidad antes de distinguir replay/inserción; compara actor, scope, contexto tipado, request, operación, ejecución, evento, outcome e issues. Reautoriza observación histórica existente mediante diagnostic_nodes; identidad nueva conserva controles canónicos estrictos. |
| `crm_api.h5_diagnostic_read(bytea,bytea,bytea,bytea,bytea)` | JSONB, VOLATILE, definer; C01, validación, paginación y comprobación F1/F2 final conservadas. | Petición explícita por operación agrega solo referencias históricas mínimas cuyo propietario actual y fuente original están autorizados. Marca historia, versión y contexto originales; esa rama no alimenta al escritor. |

`diagnostic_nodes`, `diagnostic_operation_reference`, `diagnostic_contexts` y `b08_context` son dependencias existentes, sin sustitución en68. El lector anterior proviene de64, mientras que los otros dos cuerpos anteriores provienen de67. El SQL dinámico de la proyección usa un catálogo literal de tablas y parámetros para scope/identidades; la modificación no introduce nombres suministrados por el solicitante. La correlación por referencias se aplica después de filtrar el conjunto autorizado. No acredita efectos de negocio por la presencia de una observación.

La revisión de procedencia exige definición_id, versión, contexto JSON original, sujeto de historia, result_ref de operación y resultado B08. No acepta coincidencia del UUID de otra ejecución como sustituto del propietario. Las entradas admitidas mantienen tipo+UUID de raíz; una igualdad de UUID entre tipos no cambia esa autoridad. El replay no reevalúa la inserción histórica como una identidad nueva, pero tampoco reutiliza la autorización de una sesión anterior.

## Catálogo y datos, ejecución independiente04

Base67 poblada con trabajo, aprobación, historia, operación y observación sintéticos. Se comparan íntegramente 175 tablas, 487 relaciones, 305 funciones, 332 políticas y 565 dependencias de funciones, además de constraints, namespaces, ACL por objeto/default, roles y membresías. Solo difieren los tres `prosrc` esperados. OID, firmas, nombres de argumentos, defaults, tipos de resultado, owners, prosecdef, proconfig y demás atributos se conservan. No aparecen objetos ni GRANT/REVOKE nuevos.

Las filas se ordenan determinísticamente y se resumen por SHA256 para TODAS las tablas CRM. Antes/después de la aplicación y recuperación coinciden. No se borra, reescribe ni «sanea» historia anterior.

Ensayos ejecutados:

- Rol ordinario intenta migrar: denegado por autoridad, transacción revertida.
- Error deliberado antes de COMMIT68: rollback deja catálogo y datos67 idénticos.
- Aplicación68 completa: tres cuerpos y ningún otro cambio comprobado.
- Recuperación técnica: restaurar las tres definiciones67 capturadas, conservando catálogo y filas; reaplicar68 reproduce el catálogo esperado.
- Instalación en cluster aislado nuevo hasta68 y operaciones autorizadas funcionales.
- Owners de funciones sin login, superuser ni BYPASSRLS; search_path `pg_catalog, pg_temp`; solo las dos API son SECURITY DEFINER.
- Observaciones con RLS y FORCE RLS. Dieciséis intentos directos desde anon, authenticated, runtime y ha_tx: SELECT, UPDATE, función privada y elevación al rol de migración denegados.

La restauración es un ensayo local sobre cuerpos capturados, no una orden de downgrade/despliegue. La migración no añade mecanismo operativo de rollback ni nueva política de datos. No se acredita Hosted/Production, H6-015 ni H6-017. La batería completa vuelve a ejecutar estos dos casos, separados de los tests históricos anclados a versiones anteriores.

## Límites y conclusión de V-MIG

V-MIG independiente04 PASS, dos casos, sin skip/cancel. La evidencia cruda conserva resultados y huella de datos. Las comprobaciones dinámicas de seguridad complementan la revisión estática; no se infiere seguridad global únicamente porque el SQL no contenga GRANT. Las regresiones del candidato y la preservación final se reportan separadamente en el informe A–R.
