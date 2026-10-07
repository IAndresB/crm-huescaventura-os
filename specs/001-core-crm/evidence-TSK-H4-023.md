# TSK-H4-023 — Verificación independiente de realidad operacional

**COMPLETED exclusivamente local/aislado, 2026-10-07.** H4-001–023 COMPLETED local/aislado; H4 IN PROGRESS. H4-024 y H5–H6 NOT STARTED. STOP tras publicar este cierre; continuidad al hilo de dirección H4.

## Base, congelación y cadena

Preflight fetch: main del remoto configurado IAndresB/crm-huescaventura-os, árbol limpio, HEAD/main/origin/main = `9355da0cd23059128b724f212e1417a08ac2e95d`; sin divergencia ni incorporación ajena.

1. Expected previo publicado `408a7f7caa39bdd18811104c9f03f40411185e55`, antes del producto; [matriz normativa previa](expected-TSK-H4-022-023.md),28filas base y89archivos protegidos. Expected históricos intactos.
2. Producto/migración `0363d9a562089f1c5ec9b6b9e40b56676757f42e`: [implementación y registro de cuerpos](evidence-TSK-H4-022.md).
3. Verificador/SHA exacto publicado y probado `f99de8bad495c86021e91730bb69af81f69e44ec`. Producto/verificador congelados durante todos los gates.
4. Cierre posterior: exclusivamente evidencias/logs/coordinación. SHA final se identifica en el informe y Git; no se añade código ni se atribuye ejecución al commit posterior.

## Resultado definitivo y conteos

|Gate|Resultado|
|---|---|
|Frozen install / typecheck|PASS / PASS|
|Lint/imports/boundaries / build|PASS / PASS|
|Auditoría dependencias producción|PASS, sin vulnerabilidades conocidas|
|PostgreSQL completo|2240/2240, cero FAIL/skipped/cancelled|
|Unitarias|138/138, cero FAIL/skipped/cancelled|
|Health SQL independiente|1/1 separado, cero FAIL/skipped/cancelled|
|V-MIG fresh52 / upgrade51poblado / DDLrollback / retry|PASS|
|Advisors oficiales exclusivamente loopback|PASS, results=[]|
|Diff base→SHA probado / árbol restaurado|PASS / PASS|

Base2105PG +135casos Node nuevos (subtests incluidos) =2240. Los focales de desarrollo,32intercalaciones y9puntos de fallo están incluidos en esos135; no se suman otra vez. Unitarias138 conservadas; health1 nunca se incluye en PostgreSQL funcional. El runner completo conserva los límites de migración históricos de los harness antiguos; los casos nuevos instalan52. No se afirma que cada prueba histórica ejecute52. [Matriz28, trazas y guardas](matrix-TSK-H4-023.md).

Versiones capturadas: Node24.21.0; pnpm11.19.0; PostgreSQL17.11 Postgres.app; CLI Supabase2.119.0 pin documentado; Next16.3.6 y TypeScript7.0.2 del lock congelado. Comandos/argumentos, SHA/árbol inicial/final, tiempos Unix, stdout/stderr íntegros, status/signal/error y conteos reales en `tests/fixtures/h4-023/final`. Los warnings genéricos del CLI «remote database» acompañan una URL127.0.0.1 explícita; no acreditan hosted.

## Dominio, datos y estado

A–M acreditan inicio normal y excepcional, ejecución completa/parcial, resto conservado/cancelado con Modification ordinaria, no Finalizada con S2pendiente, al menos una prestación efectiva, y finalización con pendientes económicos intactos. Rafting10 confirmado frente a estimación global14; noches12/10 y cuatro nominalesN1 sin doble cómputo; S1/S2/S3 independientes. Tararí interno mantiene capacidad, confirmación, preparación y ejecución como hechos separados, con actor/original/evidencia, sin proveedor asignado ni factura/pago externo fabricados.

Booking/preparation read y servicios observan En curso/Finalizada/Cancelada coherentes con hechos, cobertura y condición Incident distintas. Fecha prevista alcanzada, pago, Task, aprobación o confirmación no disparan prestación. Replay identifica resultado histórico reautorizado; no vuelve a preparación ni reejecuta. Rectificaciones/revisiones conservan antes/después, original, momento conocido y registro; no inventan horas/precedencia. Finalización histórica cambia aplicabilidad si se rectifica materialmente el hecho, y no vuelve a aplicarse sola tras prestación nueva. B07 History factual y seguimiento permanecen en la misma unidad.

Incident ordinaria superpuesta sobre En curso/Finalizada y servicio; dos impactos actuales, resolver uno conserva otro, resolver todos no restaura cobertura inválida ni toca economía. Se reutilizan SM-IN/Modification/Confirmation/Requirement/B07/HA, sin otros sistemas de cancelación/aprobación/almacenamiento/economía.

## Seguridad, concurrencia, atomicidad y recuperación

APIs reales F1/F2 y HA/TTE/D039; runtime sin CRUD/helpers, RLS/FORCE RLS e inmutabilidad de tres tablas, owners/grants/search_path mínimos; desconocido/ajeno no enumerado, originales privados sin contenido económico/personal indiscriminado en proyección. Actor SHARE F06 compatible, sesión/epoch exclusivos; revocación/generación/expiración del F2 común en regresión, inhabilitación y replay en API nueva. IA runtime sin HA rechazada; material HA cambiado no aplicable, historia preservada. No actores operativos extra ni permisos ampliados.

32intercalaciones reales en ambos órdenes, sesiones PostgreSQL/F2/PID/xid distintos, locks/raíces/cadena observados y ambas admisiones antes de negocio. Identidad equivalente, misma clave material distintoE2, disjuntos con relectura, solapes sin doble cómputo, prestación/cancelación, finalización/pendiente o cambio, inicio/pérdida confirmación o requisito, HA/cambio, preparación/inicio/final/cancelación e Incident/resolución. BarreraOpportunity31 donde rechazo ocurre antes de escritura; raízPreparación para otros. Ensayo adicional: BookingB avanza mientras raízA sigue bloqueada. No serialización global del actor presentada como protección operacional.

9puntos de inyección técnica de escritura/COMMIT/finalizador TTE real: rollback completo de hecho/historia/resultado/seguimiento/reserva, sin ejecución residual ni aprobación consumida parcialmente. Respuesta descartada después de COMMIT PostgreSQL real, manual y TTE: recuperación autorizada del resultado durable, sin nueva ejecución/historia/tarea. SQL privilegiado solo instalación, observación e inyección técnica explícita; fixtures de negocio mediante contratos ordinarios H2/H3/H4.

## V-MIG y preservación

Una migración52 forward creada por CLI;51anteriores byte a byte intactas. Upgrade51poblado incluye Confirmada, CanceladaF23, Modification parcialmente aplicada, fondos/Refund/Deposit y originales privados. Fallo DDL22012 real, rollback de datos y catálogo exactos, reintento correcto. Original privado SHA256 `94ad2febd91c6a0ead4ebc5cd62464325d5f4d2c0d340d870b2a939d374f2473` conservado. Datos previos SHA256 `eaf4f65c1ca90b58835d9cc9127db620a73face0219df8dd7f1076431b4130c3`, igual antes/después.

Catálogo comprueba OID/firmas/proargtypes/owners/ACL/config/volatilidad/security-definer, relaciones/RLS, roles/membresías/policies/triggers y vistas. Seis cuerpos adaptados deliberadamente: modification_apply, modification_cancelled, booking_preparation_core/read/writer, booking_read; cuerpo vista b04_current_services adaptado con OID/atributos conservados. Los demás cuerpos/objetos previos iguales. Resultados y catálogos before/after en final/postgres/reality-*. No igualdad de cuerpos cambiados afirmada.

El runner heredado genera tres archivos históricos: se archivaron salidas nuevas en final/generated y restauraron los originales de f99de8b byte a byte; `generated-preservation.json` conserva hashes original/generado/restaurado. El CLI generó solo caché .temp, preservada como temp-generated fuera del árbol fuente. Status conserva esas diferencias reales; no se reconstruye un árbol limpio falso. Producto/verificador inalterados y árbol restaurado antes del diff-check final.

## Defectos, evidencia y límites

H4-023-F01–F23 técnicos y F24–F30 observaciones materiales estáticas CLOSED tras comparación definitiva. [Registro Fxx](defects-TSK-H4-023.md): original FAIL, reproducción posterior, causa/fix/retest; estático diferenciado de ejecución. No se atribuye FAIL anterior a hallazgos no ejecutados, ni se reconstruyen snapshots/versiones ausentes. Cero material abierto y cero FAIL/skipped/cancelled definitivo. Históricos F23 correctivo y todos los cierres anteriores conservados.

[Manifest final](../../tests/fixtures/h4-023/final/manifest.json), [resultado verificable](../../tests/fixtures/h4-023/final/closure-verification.json), capturas íntegras gzip sin pérdida con hash comprimido/descomprimido. Development posee su manifest propio y originales completos disponibles; campos ausentes iniciales declarados en Fxx. SHA probado identifica código/verificador, commit posterior únicamente documenta cierre.

AC-058 aquí preserva finalización real con factura/fianza/Refund pendientes; integral H5-014 futuro. E2E-01 solo recorrido local disponible; H6-001 futuro. Sin Closure Assessment/H5/validación integralH6, avisos/conectores, hosted/Production, datos reales/audio/consentimiento/retención inventados/borrado importante automático. D019/D020/cálculo exacto/F06/fondos/F13/F23/F24/Deposit–Refund preservados; prestación/finalización/cancelación no concilian ni ejecutan economía. Hosted H2/H3 no acreditados; Production NO autorizada; DM-PENDING-005 y bloqueos globales/dependientes conservados.
