# TSK-H4-019 — Evidencia local/aislada; acreditación integral PENDING

Base exacta autorizada `ae1f3c360624bb0fb3714ec3983a13b888a444a7`; main/origin/main/HEAD y árbol limpio comprobados tras fetch. Cierres H4-017/018, checkpoint50ded y F16/F23/F24/F30 conservados. Expected independiente publicado `eb2dab9dcc7b7c0d09a8cec7677de5d745776f19` antes de crear verificador. Verificador publicado y congelado `6dbd550647b4d5479914d5a8dae0d57d590ff56e`; refs coincidentes y árbol limpio antes de regresión. El commit posterior contiene solo evidencia, logs y coordinación, sin una nueva atribución de ejecución a su SHA.

## Resultado y límite material

**H4-019 IN PROGRESS. No COMPLETED. F06 OPEN de acreditación.** El único actor V1 está fijado por D015, ARCH-DEC-004, SPEC-FR-SEC-001 y D038. `crm_actors` tiene unicidad singleton; F2 admite con bloqueo exclusivo del actor antes de llegar al kernel. Se alcanzaron estados y efectos por contratos ordinarios usando dos sesiones válidas, sin permisos nuevos. Los logs observan solapamiento PostgreSQL público y una barrera económica `payment-root`, pero la segunda sesión puede esperar en F2. Esa espera no se presenta como demostración suficiente del solapamiento económico exigido por H4-019.

No se observó sobreconsumo en los casos ejecutados. No se eludió F2 ni se crearon actores futuros, callbacks/runtime privilegiado o hechos por SQL. Sigue pendiente un criterio aprobado concreto para ensayar la raíz independientemente de esa serialización manteniendo D038/D039 y contratos ordinarios. Los resultados funcionales y gates PASS no cierran ese requisito material. La consulta a dirección se realizó durante el trabajo; el trabajo independiente continuó hasta terminar y verificarlo.

## Matriz y resultados

[Expected congelado](expected-TSK-H4-019.md) reúne literalmente las19 filas Tasks §6. [Matriz por ID](../../tests/fixtures/h4-019/matrix.md), [defectos y cronología](../../tests/fixtures/h4-019/defects.md), [resumen de regresión](../../tests/fixtures/h4-019/final/regression-summary.json).

61 casos funcionales nuevos y3 de preservación/advisors:64 incluidos una sola vez en PostgreSQL. Ambos órdenes de Allocation80/Refund80 sobre100, dos primeras asignaciones sin hijos, Refund/Deposit interno, Refund/Provider Payment, restitución/retención/consumo y porciones disjuntas. Cada segundo efecto incompatible rechaza/conflicta; bruto histórico intacto. Prueba fuerte de concurrencia económica PENDING F06, incluso aunque los ensayos públicos pasen.

Deposit y Refund representan un solo movimiento canónico y un solo importe; replay por otra operación y después de revisión técnica de fondos no duplica. Material conflictivo E2 conserva original. F13/F24 no eluden reserva. Intento80 con salida20 conserva pendiente180/reserva60; resto no ocurrido deja20/180/0; otra salida60 deja80/120/0. Incident resuelta no libera ni ejecuta. AC040 permite cancelación operativa con economía pendiente por falta de base; ajustes/asignaciones sin D019 rechazan. No base por media o fondos disponibles.

Oráculos monetarios constantes independientes: PM08 +500,01→−500,01 y consumo−20,00→ajuste+20,00; PM11 33,34/33,33/33,33; PM12 0,01/0,01/0,03; negativos PM13 mismos restos/orden sobre magnitud. Registros conservan input, pesos, orden, fracciones/restos, versión y asignación residual. No se usa cálculo del producto para fabricar el expected, ni floats para calcular importes.

## Seguridad, atomicidad y preservación

F1/F2/contexto/actor/sesión, revocación e inhabilitación, reautorización de replay y aprobación exacta retirados individualmente en casos pertinentes. Referencias ajenas/UUID desconocidos no enumeran; proyección Refund mínima. Runtime/anon/authenticated sin CRUD directo ni helpers privados; RLS/FORCE, owners y search_path comprobados. D039/TTE histórico se reejecuta en regresión; no se acredita una nueva carrera económica T08 que siga pendiente por F06.

Seis fallos de escritura de movimiento/vínculo/historia/resultado/fondos y fallo deferred COMMIT: snapshots completos idénticos, retry válido. Respuesta perdida únicamente después de COMMIT PostgreSQL real: lectura y replay recuperan un movimiento20 por ambos contratos, sin segundo consumo. Ninguna promesa exactly-once externo ni rollback de salida externa.

No producto, dependencias o SQL de negocio cambiados; cero cuerpos previos modificados; cero migraciones nuevas. Las48 publicadas, todos los expected históricos, fuentes aprobadas y health/documentación comparados byte a byte. Fresh48 y fixtures poblados reales de Refund parcial/incertidumbre y Deposit/resto; datos y catálogo/OID/owners/ACL/firmas/configuración/políticas/triggers/roles/membresías conservados ante DDL técnico fallido, rollback y retry. Upgrade desde48 no aplicable sin nueva migración; upgrades históricos aplicables reejecutados por sus verificadores sin alterar su frontera. Advisors oficiales2.119.0 exclusivamente loopback, stdout/stderr/status completos, sin errores.

## Regresión sobre SHA exacto

Node24.21.0, pnpm11.19.0, PostgreSQL17.11, datos sintéticos, Storage aislado oficial. Frozen install, production tree (source-map-js1.2.2 preservado), audit producción cero vulnerabilidades, typecheck, lint/import/boundaries, build, PostgreSQL1995/1995 (1931 anteriores+64 nuevos), unitarias138/138, health independiente1/1, V-MIG aplicable/advisors y diff-check PASS. Cero FAIL/skipped/cancelled en regresión. Esto acredita únicamente los ensayos ejecutados, no un cierre integral de H4-019 ni validación H6.

Los FAIL de desarrollo F01–F05 son técnicos, conservados y CLOSED por retest. F06 es observación material de acreditación, OPEN. No se transforma en fallo económico ejecutado. Los campos comando/argumentos/SHA/instantes/stdout/stderr/status/signal/error disponibles se conservan en [logs completos](../../tests/fixtures/h4-019/final/). Compresión gzip sin pérdida y hashes original/almacenado con comprobación de recuperación. Los helpers históricos no exponen todos los estados/streams internos del arranque Storage (`stdio:ignore`); no se reconstruyen. La captura exterior del runner y los streams nativos realmente disponibles son completos, con esa limitación explícita.

Artefactos históricos regenerados archivados como nueva ejecución y originales restaurados: h2-011 reproducersF01/F02 y h4-012-f16/preservation.json; [manifest de restauración](../../tests/fixtures/h4-019/final/regenerated-historical/restore-manifest.json). Ningún resultado anterior se sustituye ni se atribuye al SHA nuevo.

## Coordinación y límites

H0 técnico/local/aislado, H1/H2/H3 y H4-001–018 COMPLETED local/aislado conservados. H4 IN PROGRESS; H4-019 IN PROGRESS con acreditación PENDING F06; H4-020+ y H5–H6 NOT STARTED. Integraciones posteriores, DM-PENDING-005 y demás pendientes conservados. Hosted H2/H3 no acreditados; Production no autorizada. Sin datos reales, audio, conectores, consultas/envíos/cobros/pagos bancarios ni efectos externos de negocio. STOP para tareas posteriores; el efecto dependiente de F06 espera criterio concreto de dirección.
