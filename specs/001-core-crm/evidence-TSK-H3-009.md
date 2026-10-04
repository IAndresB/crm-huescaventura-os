# Evidencia TSK-H3-009 — Gestión de fondos ajenos y evaluación documental

**Resultado: COMPLETED local/aislado.**

Base inicial `2471d044662026d52bf63b7d5064fb924d4f8127`: fetch/main/árbol limpio/HEAD==origin/main exactos antes de modificar; H0 técnico/local/aislado, H1/H2 y H3-001–008 local/aislado COMPLETED; H3 IN PROGRESS; H3-009+ NOT STARTED; H3-008-F01–F08 CLOSED, cero materiales abiertos y34 migraciones. Fuentes aprobadas y fichas completas009/010 consultadas antes del producto. Expected independiente congelado en `60848d003e5057651f3c36df37951bd704f0ca3d`,69 casos/24 filas Tasks §6; no modificado posteriormente.

Commit exacto de producto/verificación probado: `30314215efd170eef3a8a3eb038aa5c9a28358e5`. El commit documental de cierre y SHA final publicado son posteriores; no cambian ese producto. [Verificación independiente](evidence-TSK-H3-010.md), [expected](expected-TSK-H3-009-010.md) y [manifiesto/hashes](../../tests/fixtures/h3-010/closure-verification.json).

## Implementado

[Dominio C02](../../src/domain/managed-client-funds.ts), [adaptador F1/F2](../../src/infrastructure/postgres/h3-suplido-adapter.ts) y una sola migración forward nueva: [20261004175435_h3_managed_client_funds_documentary.sql](../../supabase/migrations/20261004175435_h3_managed_client_funds_documentary.sql), creada mediante CLI oficial `supabase migration new`2.118.0. Cadena35; las34 anteriores intactas.

Suplido tiene raíz estable scope/Booking/servicio, base inicial y snapshots de cliente/proveedor/servicio/versiones. Previsto y confirmado permanecen separados; ausencia nunca se convierte en cero. Componentes independientes: importe, fondos, factura, correspondencia entrante, pago y mandato; diferencias por componente, evaluación con fundamento, pendientes/seguimiento e historia before/after con actor, fuente, motivo, evidencia y momentos. Apertura requiere cliente/proveedor/servicio externo/importe previsto o confirmado/fuente; Tararí interno rechaza gestión externa.

Reutiliza Payment Allocation H3-005/006: solo IDs del mismo Booking/servicio/finalidad `managed_client_funds`, comprobación actual de recepción/correspondencia, suspensión localizada y conservación de asignado/utilizable/consumido/disponible. No crea segundo ledger ni mueve fondos. Suplido500/fondos300 → identificados300, pendientes200, sin financiación propia inferida. Fondos600 → excedente100 explícito, sin reasignación. AC044:300 Suplido/200 Fee separados, total500 no reconocido como ingreso propio; no se implementa motor Fee.

Reutiliza Provider Invoice H3-007/008 y B07: estado/original/revisión/vínculo/porción documental de servicio, cliente y proveedor comprobados; Recibida/Revisada no satisfacen vínculo. Vinculada actualiza únicamente factura; no crea salida, consumo ni pago. La correspondencia H3-003/004 es entrante y nunca acredita conciliación de salida. Mandato permanece null salvo vínculo de identidad/versión/contenido/aceptación/evidencia/momento específicamente comprobados. Acceptance, fondos, factura y Human Approval no crean mandato. Prueba positiva de mandato usa contenido sintético expresamente no legal; ningún mandato real acreditado.

SM-SU01 abre Gestión abierta. SU02 actualiza únicamente componente acreditado; seguimiento factura/pago reusa Pending Business Task B07, identidad de causa deduplicada y transacción común. Prioridad/plazo reales permanecen no acreditados; no se inventan. `followUpIds` representa requisitos actualmente pendientes; tareas históricas conservan su historia, sin cerrar ficticiamente el ciclo integral posterior.

SU03: evaluador puro C02 permite Documentalmente resuelto únicamente con factura al cliente/importe/vínculo, pago ejecutado, conciliación correspondiente y ninguna diferencia material. Prueba positiva utiliza exclusivamente doble sintético seguro. Runtime productivo no puede registrar/programar/ejecutar/acreditar Provider Payment ni conciliación de salida: continúa Gestión abierta con frontera explícita `NOT_IMPLEMENTED_H3_011_012`. Pago sin factura mantiene requisito documental/seguimiento; factura sin pago y fondos sin factura/pago continúan abiertos. La evaluación histórica resuelta utilizada para probar reapertura es sembrada solo por rol de migración en base aislada, nunca por comando productivo ni movimiento externo ficticio.

SU04 conserva evaluación/componentes históricos y agrega discrepancia/resolución con fuente/causa. Incidencia fondos identifica Allocations afectadas; no invalida factura ni porciones independientes. Incidencia factura no borra fondos. Cambio posterior en fuente se serializa bajo raíces existentes `payment-root` / `invoice-root`, además de raíz Suplido: lectura devuelve `currentComponents` revalidados y `sourceRevalidationRequired`, estado Revisión si cambia fundamento. Snapshots y evaluación anterior permanecen históricos; reevaluación explícita añade fundamento nuevo. Lectura no consume ni muta historia.

D013 mantiene fondos ajenos separados de Fee/coste propio; ubicación no determina derecho D019/FORB26. FORB16/17 rechazan factura/programación→pago y pago sin factura→cierre. AC078/SEC007/P16 rechazan emisión, numeración, series e IVA/validación fiscal. Suplido resuelto no cierra Booking ni Commercial/Operational/Economic Closure ni confirma proveedor.

## Verificado

Sobre `30314215efd170eef3a8a3eb038aa5c9a28358e5`: **1003/1003 PostgreSQL;107/107 unitarias;69/69 matriz;1/1 focal;5/5 reproducers**.76 tests Node del bloque incluyen agrupador;75 casos lógicos. Instalación congelada/typecheck/lint/boundaries/imports/build/audit producción/diff-check/V-MIG/preservación PASS;0 FAIL/skipped/cancelled/materiales abiertos.

V-MIG: fresh35, upgrade poblado H3-00834 con Customer Payment/recepción/Reconciliation/Allocation/consumo80/Invoice Vinculada/B07bytes privados, fallo y rollback integral. Owner separado, executor NOLOGIN/NOBYPASSRLS,3 tablas FORCE RLS,6 policies,3 triggers append-only,6 funciones con search_path explícito; APIs estrechas SECURITY DEFINER conservan patrón acreditado, sin EXECUTE PUBLIC ni DML runtime/roles ordinarios. Catálogo/owners/ACL/RLS/functions/triggers/roles previos preservados.

Concurrencia real con sesiones independientes: aperturas/actualizaciones fondos/factura/evaluaciones/discrepancia, raíces fuente bloqueadas, revisión obsoleta, MVCC antes COMMIT. Idempotencia misma operación/material, distintas claves equivalentes, conflicto E2 con material distinto, actor/scope ajeno y respuesta perdida tras COMMIT. Fallos antes raíz/entre raíz e historia/componente/evaluación/reapertura/seguimiento/COMMIT: rollback del conjunto. No duplicación de raíz/componente/evaluación/incidencia/tareas.

H3-010-F01–F05:5 encontrados,5 CLOSED,0 materiales abiertos; F01–03 y F05 del harness/verificador histórico, F04 de producto. FAIL originales y reproducciones conservados en [registro](../../tests/fixtures/h3-010/defects.md); corrección no cambia expected.58 archivos protegidos byte idénticos. La regresión incluye preservación H0–H3-008 y objetos/bytes B07 locales privados. No hosted, URLs públicas ni fondos reales.

## Pendiente posterior / no acreditado

**H3 IN PROGRESS; H3-001–010 COMPLETED local/aislado; H3-011+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-010; continuidad requiere nueva autorización humana.**

H3-012/H5-014/H6-005 permanecen pendientes de integración hasta sus dependencias. E2E-05 y AC-046 se comprueban solo en el fragmento autorizado. Provider Payment productivo, programación/ejecución/resultado externo/conciliación de salida, cierre económico y Booking, fiscalidad profesional, mandato real, facturación/numeración/IVA, conectores, datos y fondos reales, hosted y Production no acreditados. Sin inicio ni preparación de tareas posteriores.

DM-PENDING-002 / BR-PENDING-021/022/033, P16/D008 y todos los pendientes globales conservados. Se conservan también los pendientes anteriores H4-019/H4-021/H5-016/H6-007/H6-016 y carrera completa Refund/fianza. PLAN-AUTH-001–006 siguen PENDING globalmente; ninguna aprobación humana/técnica levanta P16. Health-check Supabase independiente byte idéntico, fuera de H0–H6; hosted H2/H3 no acreditados y Production no autorizada.
