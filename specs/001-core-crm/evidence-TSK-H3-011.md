# Evidencia TSK-H3-011 — Registrar programación y pago acreditado al proveedor

**Resultado: COMPLETED local/aislado.**

Base exacta `028cbaef887acf68a23bffd2069b91c477ac7e0c` tras fetch/main/árbol limpio/HEAD==origin/main. Producto y verificación probados en `aaa1ce94ebae591225a1f64054d1001372ae6f7b`; el SHA final publicado corresponde al commit documental sucesor y se distingue en el informe Git final. Expected independiente [R001–R100](expected-TSK-H3-011-012.md), congelado antes del producto en `095078128bb18f8e6dc28eb4d8282039b0b1f57b`;23 filas Tasks §6 asignadas, nunca modificado para acomodar producto.

Entorno local/aislado, fixtures solo sintéticos: Node24.21.0/pnpm11.19.0/PostgreSQL17.11 nativo/CLI2.118.0. B07 reutiliza Storage oficial fuente `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, file loopback privado/credenciales efímeras; sin hosted. Preflight confirma H0 técnico/local/aislado y H1/H2 local/aislado COMPLETED; H3 IN PROGRESS/H3-001–010 COMPLETED;011+ yH4–H6 NOT STARTED antes del bloque;H3-010-F01–F05 CLOSED/cero material abierto/35 migraciones/health-check independiente intacto; hosted H2/H3 no acreditado y Production no autorizada.

[Manifiesto](../../tests/fixtures/h3-012/closure-verification.json), [regresión PostgreSQL](../../tests/fixtures/h3-012/closure-postgres.log), [unitarias](../../tests/fixtures/h3-012/closure-unit.log), [defectos](../../tests/fixtures/h3-012/defects.md). **100/100 matriz +7/7 reproducers +1/1 focal =108 casos lógicos PASS;110 tests Node con dos agrupadores. PostgreSQL completo1113/1113 y unitarias109/109 PASS;0 FAIL/skipped/cancelled/todo/materiales abiertos.** Instalación congelada/typecheck/lint-boundaries-imports/build/audit producción0 vulnerabilidades conocidas/diff-check/V-MIG/preservación PASS.

## Implementado

Provider Payment separa base/obligación prevista y confirmada, programación/intención, salida real acreditada, correspondencia saliente, porciones consumidas, saldo, incidencia, resolución, corrección y retirada. Estados Pendiente/Programado/Pagado en importe acreditado/Incidencia con complete/remaining explícitos; una parte pagada no etiqueta toda la obligación como pagada. Identidad estable de movimiento fuente+externalId y revisiones/historia append-only; datos monetarios definitivos string/NUMERIC exactos, helpers H1/D023/PM08 reutilizados, sin floats ni segundo ledger.

Código [dominio](../../src/domain/provider-payment.ts), [API C01/C03](../../src/infrastructure/postgres/h3-provider-payment-adapter.ts), [TTE existente](../../src/infrastructure/postgres/h0-011-adapter.ts) y [ejecutor estrecho](../../src/infrastructure/postgres/human-approval-executor.ts). El factory Human Approval histórico conserva sus siete operaciones; la nueva fachada dedicada expone solo scheduleProviderPayment/close, sin transacción ni callback del solicitante. Programación sensible T08 integra reserva exacta, intención, M02 y final checks/COMMIT en la misma transacción privada; runtime no puede programar por atajo.

Una única migración forward oficial [20261004185628_h3_provider_payment_accredited_outgoing.sql](../../supabase/migrations/20261004185628_h3_provider_payment_accredited_outgoing.sql) añade seis tablas, ocho funciones y garantías de historia/seguridad. Las35 anteriores se conservan; fresh36 y upgrade poblado35→36 verificados. El procedimiento oficial fue CLI migration new; no migración operacional de health-check ni hosted.

## SM-PP-01–06 e integraciones verificadas

|Transición/unidad|Resultado local acreditado|
|---|---|
|PP01 determinar|Proveedor/servicio/obligación/importe/fuente requeridos; Pendiente sin salida/coste propio. Previsto500.00 y confirmado600.00 separados. Tararí externo rechazado.|
|PP02 programar/T08|Importe/destinatario/medio/fecha/condiciones/porciones previstas o verificadas y aprobación exacta conservados. Programado paga0.00/consume0.00. Cambio material invalida autorización.|
|PP03 registrar/T07|Movimiento real individual, fecha/medio/referencia/evidencia revisada/fuente/correspondencia saliente separados.500/200/300 exactos; dos movimientos200+300 completan500; similares200+200 conservan dos hechos.|
|PP04 incidencia|Resultado incierto no Pagado ni fallo definitivo; fuente/intento/resultado/alcance requeridos. Falta/suspensión/Fee/finalidad ajena impiden efecto dependiente. Realidad anómala se conserva sin consumo inventado.|
|PP05 resolver/corregir|Comprobación del efecto previo obligatoria; AC063 registra realidad sin aprobación previa e incidencia, sin aprobación retroactiva. Ajuste exacto enlazado conserva original y no revierte banco ni libera fondos automáticamente.|
|PP06 retirar|Solo sin ejecución/pending/resultado desconocido comprobados; vuelve Pendiente conservando intención. Incertidumbre o movimiento real bloquean retirada.|
|Allocation|Reusa porciones/actos/historia/fund_refresh de H3-005/006 y raíz payment-root compartida; no segundo ledger.80/80 sobre100 consume solo80/disponible20.|
|Suplido|Actualiza pago y correspondencia saliente productivos locales; factura/fondos/mandato independientes. Pago sin factura abierto; factura posterior no duplica salida; conjunto correcto Documentalmente resuelto sin doble de pago. Pago parcial200 mantiene saldo300 y Suplido abierto.|
|B07/C04/C05|Evidencia presentada no acredita salida; evidencia manual revisada vincula actor/acción/material. Intención/intento/resultado/timeout son hechos separados; no ejecución externa por CRM.|

T07 confirma salida, correspondencia, consumo, historia y reevaluación material juntos. T08/D039 conserva dueño TTE, F1/F2, pool/login exclusivo, check final actual y COMMIT sin retorno intermedio al solicitante. Dos ejecutores no duplican parte/reserva; evidencia caducada o fondo cambiado antes COMMIT revierte todo. PM08: +500.01→−500.01 y −20.00→+20.00 exactos, sin recalcular ni redondear; consumo20.00 permanece afectado mientras no exista fundamento de efecto bancario contrario.

[Verificador independiente](../../tests/integration/postgres-h3-012.test.ts) y [focal](../../tests/integration/postgres-h3-011.test.ts) contrastan las23 filas asignadas/Plan7.2–7.3/8/ECON009011/AC045046063/INV032034/PP01–06/SU01–04/FORB16/17/G1–6/B05/B07/B08/C02–06/T07/T08/D039/PT07/PM08. E2E05 solo fragmento autorizado. V-DOM/V-DAT/V-MIG/V-AT/V-SM/V-NEG/V-EVI y familias asignadas PASS. Detalle observado R001–R100 en [H3-012](evidence-TSK-H3-012.md).

## Pendiente posterior y no acreditado

H3 sigue IN PROGRESS. H3-013+ yH4–H6 siguen NOT STARTED; STOP obligatorio tras H3-012 y continuidad solo con nueva autorización humana. H4-019/H5-014/H6-005 y demás pendientes globales vigentes conservados, incluidas H4-021/H6-016 y carrera completa Refund/fianza. No se ha iniciado ni preparado ninguna tarea posterior.

Provider Payment es productivo únicamente como modelo local de registro de una salida externa ya ocurrida y comprobada. No existe banco/PSD2/conector/API proveedor/webhook/pago real iniciado por CRM, contacto a proveedores ni fondos/datos reales acreditados. Refund/fianza completos, cierre Booking/Economic Closure, fiscalidad/mandato real/facturación, hosted H2/H3 y Production no acreditados; Production no autorizada. D008/D013/P16 y todas las decisiones/normas protegidas intactas; fondos ajenos no son ingreso ni coste propio. Health-check Supabase independiente intacto, sin despliegue H3.
