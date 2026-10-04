# Evidencia TSK-H3-010 — Verificación normativa independiente

**Resultado: COMPLETED local/aislado.**

Base `2471d044662026d52bf63b7d5064fb924d4f8127` exacta tras fetch/main/limpio/HEAD==origin/main. Producto/verificación probado `30314215efd170eef3a8a3eb038aa5c9a28358e5`; publicación documental posterior diferenciada. Expected congelado `60848d003e5057651f3c36df37951bd704f0ca3d`:69 casos/24 filas Tasks §6, byte idéntico antes y después de corregir. Ninguna aserción deriva expected del resultado productivo.

Entorno local/aislado, fixtures exclusivamente sintéticos: Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo, CLI2.118.0; Storage oficial `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend privado file loopback/credenciales efímeras, sin hosted. [Manifiesto](../../tests/fixtures/h3-010/closure-verification.json), [PostgreSQL](../../tests/fixtures/h3-010/closure-postgres.log), [unitarias](../../tests/fixtures/h3-010/closure-unit.log).

**Regresión1003/1003 PostgreSQL y107/107 unitarias. Matriz69/69 +focal1/1 +reproducers5/5:75 casos lógicos,76 tests Node incluyendo agrupador.**0 FAIL/skipped/cancelled/materiales abiertos. Instalación congelada, typecheck, lint/boundaries/imports, build, auditoría producción0 vulnerabilidades conocidas, diff-check, V-MIG y preservación PASS sobre SHA citado.

V-DOM/V-DAT/V-MIG/V-AT/V-SM/V-NEG/V-EVI/PT07: guardas individuales G1–G6, SM-SU01–04, FORB16/17/26, ACC005/ECON009/SEC007, AC044/046/078, INV010/032/033/034/052, D008/D013/D019/P16 y contratos B05/B07/C01/C02/C03/C06 contrastados. Las24 filas asignadas están copiadas en expected; T07/E2E05 se verifican solo en frontera documental autorizada, sin acreditar ejecución externa ni integración posterior.

## Comparación observada por caso

|ID|Observado en SHA probado|Resultado|
|---|---|---|
|R01|Gestión abierta; componentes ausentes null, pendientes pago/conciliación de salida/factura, dos seguimientos.|PASS|
|R02|Cliente ausente rechazado; sin raíz.|PASS|
|R03|Proveedor ausente rechazado; sin raíz.|PASS|
|R04|Servicio ausente/ajeno rechazado sin enumeración.|PASS|
|R05|Dos importes desconocidos, number o precisión indebida rechazados; desconocido no cero.|PASS|
|R06|Fuente de acción/base retirada: rechazo atómico.|PASS|
|R07|Booking Tararí interna rechaza Suplido externo; economía intacta.|PASS|
|R08|Previsto500.00/confirmado null y snapshots/versiones preservados.|PASS|
|R09|Confirmado600.00 añadido conservando previsto500.00 y otros componentes.|PASS|
|R10|Intentos de mandato desde Acceptance/fondos/Human Approval rechazados; null.|PASS|
|R11|Mandato sintético con identidad/versión/contenido/aceptación/evidencia/momento conservados, sin pago.|PASS|
|R12|Cada campo de mandato/evidencia específica retirado: rechazo sin inferencia.|PASS|
|R13|Asignados/utilizables300.00 para500.00; pendientes200.00, gestión abierta, financiación propia false.|PASS|
|R14|Fondos600.00 para500.00: excedente100.00 explícito, sin destino nuevo.|PASS|
|R15|Allocation plan: asignados/utilizables0.00; pendientes500.00.|PASS|
|R16|Allocation ajena o Fee rechazada como Suplido; sin mover fondos.|PASS|
|R17|Mismo ID aporta300.00 una vez; lista con ID duplicado rechazada.|PASS|
|R18|Asignados500.00, incidencia100.00, utilizables400.00; independientes conservados.|PASS|
|R19|300.00 Suplido/200.00 Fee separados; total500.00, sin mandato/pago.|PASS|
|R20|Fondos300.00 sin factura/pago: abierto, consumido0.00 y pendientes explícitos.|PASS|
|R21|Factura Vinculada cambia solo invoice; restantes componentes iguales.|PASS|
|R22|Recibida/Revisada conservan estado real y requisito invoice pendiente.|PASS|
|R23|Factura de Booking/proveedor ajenos rechazada, original intacto.|PASS|
|R24|Doble con pago sin factura: abierto/invoice pendiente; payload pago productivo rechazado; seguimiento conservado.|PASS|
|R25|Factura Vinculada sin pago: abierto/payment pendiente, consumido0.00.|PASS|
|R26|Correspondencia entrante únicamente; supplierPaymentVerified false y salida pendiente.|PASS|
|R27|Correspondencia ajena o afectada por incidencia rechazada.|PASS|
|R28|C02 con todos los hechos sintéticos: Documentalmente resuelto, pending vacío, fundamento exacto.|PASS|
|R29|Retirar factura/importe/pago/conciliación/vínculo/correspondencia: abierto.|PASS|
|R30|499.99 frente500.00 en cada componente: pendiente localizado; originales500.00.|PASS|
|R31|Intentos de cierre Booking/comercial/operativo/económico/confirmación rechazados; economía previa intacta.|PASS|
|R32|Reapertura factura conserva evaluación histórica sintética resuelta y fondos previos.|PASS|
|R33|Incidencia Allocation300.00 de500.00: identificados200.00; factura válida intacta.|PASS|
|R34|Incidencias pago/conciliación/obligación conservan otros componentes y pendientes materiales.|PASS|
|R35|Fuente/causa/evidencia/componente/incidentId/Allocations afectadas retirados: rechazo.|PASS|
|R36|Resolución agrega evidencia; incidencia original no resuelta permanece en snapshot histórico.|PASS|
|R37|Mark provider paid/execute programmed/component payment rechazados; payment null.|PASS|
|R38|Reclasificación de fondos ajenos como ingreso/coste/Fee rechazada.|PASS|
|R39|Derecho/cancelación/refund desde saldo rechazados.|PASS|
|R40|Emisión/numeración/series/IVA/override P16 rechazados.|PASS|
|R41|Fondos/factura/correspondencia/evaluación no cambian economía H0–H3-006 ni Booking.|PASS|
|R42|Replay apertura: mismo resultado/snapshot sin nueva historia.|PASS|
|R43|Nueva clave apertura equivalente: raíz previa, una revisión.|PASS|
|R44|Misma identidad material distinto: conflicto sin overwrite.|PASS|
|R45|Replays fondos/evaluación/discrepancia: sin nuevos componentes/incidencias; dos tareas de causa.|PASS|
|R46|Actor desconocido y Booking ajena no recuperan resultado.|PASS|
|R47|Respuesta perdida tras COMMIT: resultado durable recuperado una vez.|PASS|
|R48|Dos sesiones, claves iguales/distintas/raíz alternativa: una raíz e historia.|PASS|
|R49|Dos actualizaciones fondos, ambos órdenes: una válida, otra conflicto;300.00 una vez.|PASS|
|R50|Factura concurrente: una revisión vigente, vínculo íntegro.|PASS|
|R51|Dos evaluaciones concurrentes, claves iguales/distintas: replay/conflicto coherente.|PASS|
|R52|Evaluación espera raíces Invoice/Payment; corrección factura reabre requisito, incidencia fuente deja200.00 utilizables.|PASS|
|R53|Discrepancia concurrente/evaluación: una revisión válida; Revisión actual con historia conservada.|PASS|
|R54|Revisión0 obsoleta en component/evaluate/discrepancy/resolve: rechazo sin efecto.|PASS|
|R55|Sesión observadora antes COMMIT ve revisión anterior1; tras COMMIT2 íntegra.|PASS|
|R56|Fallo antes INSERT raíz: rollback.|PASS|
|R57|Fallo tras raíz antes historia: tres tablas y tareas/historia/resultados B07 idénticos.|PASS|
|R58|Fallo componente: rollback sin parcial.|PASS|
|R59|Fallo evaluación/resultado: rollback.|PASS|
|R60|Fallo reapertura: rollback, evaluación anterior retenida.|PASS|
|R61|Fallo historia B07 de seguimiento: rollback de unidad entera.|PASS|
|R62|Trigger diferido COMMIT: tablas dependientes sin cambios.|PASS|
|R63|F1/F2 forjados/ausentes/scope/actor deshabilitado/IA: denegación.|PASS|
|R64|DML runtime/roles ordinarios y overwrite histórico negados.|PASS|
|R65|ID con Booking/scope ajeno devuelve null; campos de enumeración rechazados.|PASS|
|R66|Fresh35;34 previas idénticas;3 FORCE RLS/6 policies/3 triggers/6 funcs/search_path/ACL/roles verificados.|PASS|
|R67|Upgrade poblado34→35: catálogo/filas/B07bytes intactos; consumo80.00, disponible220.00.|PASS|
|R68|Migración fallida rollback: inventario previo idéntico y cero tablas Suplido.|PASS|
|R69|Expected69/24 byte idéntico a60848d0; límites posteriores y cierre local conservados.|PASS|

## Defectos y conservación de FAIL

[Registro F01–F05](../../tests/fixtures/h3-010/defects.md):5 encontrados,5 CLOSED,0 materiales abiertos. F01 codec JSONB del fixture histórico, F02 comando del harness preconstruido sobre revisión antigua, F03 consulta de API futura antes del upgrade; producto conserva rechazo fail-closed. F04 de producto: lectura de fondos snapshot300.00 tras incidencia fuente100.00 no señalaba cambio; ahora currentComponents200.00/sourceRevalidationRequired fondos/Revisión, snapshot/evaluación históricos300.00 intactos. Reevaluar agrega nuevo fundamento y limpia flag; no mueve dinero.

first-matrix-original.log contiene71 tests/67PASS/4FAIL (tres casos más agrupador), F01-original-reproducer.log1FAIL, F01-first-correction-fail.log conserva intento incompleto y F04-original-fail.log4tests/3PASS/1FAIL. No se sustituyen. F05: primera regresión completa1002 tests/1001PASS/1FAIL conservada en F05-first-full-postgres-original.log; reproducer histórico H3-008-F06 contaba35 globales frente34 históricos. Se acota exclusivamente a invoiceMigration, conservando34/33 y sin alterar expected/migraciones; nueva reproducción y83/83 afectados PASS. Reproducers actuales reproducen causa y corrección; F04 restaura función histórica93a1432 únicamente en base aislada, demuestra lectura antigua defectuosa, reinstala función nueva y verifica proyección/historia. .gitattributes limita excepción whitespace a esos cinco logs originales Node para conservar bytes; producto/tests/migración/documentación pasan control normal. Hashes en manifiesto.

## V-MIG, seguridad y preservación

Fresh35, upgrade poblado34→35 y fallo transaccional R66–68 PASS;3 tablas append-only/owner separado/FORCE RLS,6 policies,3 triggers,6 funciones con search_path explícito/sin PUBLIC EXECUTE; runtime solo dos APIs estrechas, executor NOLOGIN/NOBYPASSRLS. Roles/ACL/policies/functions/triggers/owners y filas anteriores preservados. Upgrade mantiene consumo80.00/disponible220.00 y bytes originales B07privados.58 archivos protegidos byte idénticos,34 migraciones históricas sin edición.

Concurrencia con sesiones independientes, raíces Suplido/Invoice/Payment compartidas, optimistic revision/idempotencia/replay y lectura MVCC PASS. Rollback real antes raíz/entre raíz e historia/componente/evaluación/reapertura/seguimiento/COMMIT PASS. Respuesta perdida tras COMMIT recupera resultado durable sin duplicación. Privacidad: no consultas abiertas por referencia/importe/proveedor/filename/ID ajeno; C01/C03/C06 requieren propósito/Booking/scope autorizado y C02 no emite efectos.

Actualización de fuentes revalidada: componentes snapshot y evaluación anterior son históricos; currentComponents/flag distinguen estado actual. Seguimientos reusan B07 sin cierre ficticio de tareas, ni inventar prioridad/plazo reales. SM-SU03 positivo usa únicamente C02 y doble sintético seguro; reapertura tras resuelto histórico se siembra por migración aislada, nunca permite al runtime acreditar pago. Runtime mantiene payment/outgoing_reconciliation pendientes: Provider Payment productivo no implementado/acreditado.

La revisión operativa local no determina fiscalidad. Se consultó [RLS oficial](https://supabase.com/docs/guides/database/postgres/row-level-security) y [cambios PostgreSQL15.19/17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes): el cambio nuevo no introduce operadores/extensiones afectados; comprobaciones nativas17.11 PASS. No conexión/despliegue Supabase hosted.

## Pendiente posterior / no acreditado

**H3 IN PROGRESS; H3-001–010 COMPLETED local/aislado; H3-011+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-010; continuidad requiere nueva autorización humana.**

H3-012/H5-014/H6-005 permanecen pendientes de integración hasta sus dependencias. E2E-05 y AC-046 se comprueban solo en el fragmento autorizado. Provider Payment productivo, programación/ejecución/resultado externo/conciliación de salida, cierre económico y Booking, fiscalidad profesional, mandato real, facturación/numeración/IVA, conectores, datos y fondos reales, hosted y Production no acreditados. Sin inicio ni preparación de tareas posteriores.

DM-PENDING-002 / BR-PENDING-021/022/033, P16/D008 y todos los pendientes globales conservados. Se conservan también los pendientes anteriores H4-019/H4-021/H5-016/H6-007/H6-016 y carrera completa Refund/fianza. PLAN-AUTH-001–006 siguen PENDING globalmente; ninguna aprobación humana/técnica levanta P16. Health-check Supabase independiente byte idéntico, fuera de H0–H6; hosted H2/H3 no acreditados y Production no autorizada.
