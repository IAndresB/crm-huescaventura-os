# Evidencia TSK-H2-007

Base autorizada/comprobada: `d333f140abf63b900b7e6ffbfdcfc4869575cca5`, main limpia tras fetch. Expected previo: [expected-TSK-H2-007-008.md](expected-TSK-H2-007-008.md), fijado antes de implementación. Autoridad: fichas007/008 y todas las filas asignadas de Tasks §6, protocolos §2.2/2.3; alcance exclusivo Acceptance/T02, STOP tras008.

## Implementación y pruebas focales

Nueva migración `20261001172433_h2_exact_acceptance.sql`, creada mediante CLI Supabase2.118.0. Tablas privadas con FORCE RLS/select+insert limitados, Acceptance inmutable, operaciones/historia/verificaciones/rectificaciones anexas. Reutiliza H1 identidad/designación, B07 evidencia y Communication, Proposal Version exacta H2-003 y revisión/validez H2-005; no generador adicional de códigos.

Contrato servidor F1/F2 y revisión optimista de Opportunity/Proposal. Registro identificado separado de verificación; candidata no crea acuerdo. Ganada solicitada exige verificación y se confirma con historia/resultado en T02. Rectificación conserva original/verificación y exige evidencia del error/revisión humana/reevaluación explícita. Ningún efecto externo/económico/operativo/Booking.

PostgreSQL17.11 nativo aislado; datos sintéticos. Runtime `crm_h0_runtime` ordinario, observador/migración independiente. Node24.21.x, pnpm11.19.0. Focal `postgres-h2-007.test.ts`:1/1 PASS; dominio `exact-acceptance.test.ts`:1/1 PASS; typecheck y diffcheck PASS. Verificación formal008 todavía NO EJECUTADA.

Fallos de desarrollo previos al commit: primer focal de recorrido rechazado por llamada a función F2 inexistente; sustituida por función real `crm_f2.verify(...,'human_evidence',...)` acreditada en H1/H2. Typecheck del fixture rechazó campo temporal no existente; se utilizó `happenedAt` del contrato H1. Repetición focal y typecheck PASS. No Fxx formal aún.

## Límites

No acredita hosted/Auth reales/Production ni datos comerciales/personales reales. H2-009+ y H3–H6 NOT STARTED; H2 IN PROGRESS. E2E/Booking/Payment/conciliación/fondos/proveedor/disponibilidad operacional no implementados. PLAN-AUTH001–006 globales, PLAN-PENDING003 abierto, DM-PENDING005, BR-PENDING022/033 y políticas/datos reales pendientes.

## Cierre actual — COMPLETED local/aislado

Base `d333f140abf63b900b7e6ffbfdcfc4869575cca5`. Commit probado exacto `800de9518f0289f46e74a5a3a2c1218ad4b403d0`; producto sin diferencias frente a76cfc71 (el último commit añade integración de identidad). Matriz independiente R01–R62 **62/62 PASS**, reproducer histórico **1/1 PASS**, log `verified-800de95.log`; cero fallos/skipped/cancelled.

Regresión fresca posterior a matriz: instalación congelada, typecheck, lint/boundaries, **80/80 unitarias**, **510/510 PostgreSQL17.11**, build y audit--prod sin vulnerabilidades conocidas: PASS. PostgreSQL397530.340125ms, esperas H0 intactas. Node24.21.0/pnpm11.19.0. Comandos y outputs exactos en `tests/fixtures/h2-008/*-800de95.log`; resumen recuperable regression-summary.json. Diffcheck final y comparación de coordinación se registran antes de publicación. F01/F02 **CLOSED local/aislado**, cero Fxx abiertos; matriz completa afectada y regresión completas repetidas.

El diffcheck previo al commit800de95 detectó exclusivamente líneas vacías finales en logs de instalación/build. Presentación corregida mediante commit posterior; originales byte a byte comprimidos y hash verificado en raw-log-manifest.json. No se ocultó un FAIL ni se reescribió ningún commit.

H2 IN PROGRESS, únicamente007/008 cerradas en este bloque. H2-009+ y H3–H6 NOT STARTED. STOP tras008. PLAN-AUTH001–006 pendientes globales; PLAN-PENDING003 en su parte abierta; DM-PENDING005; BR-PENDING022/033; datos personales/comerciales/catálogo/tarifas/costes/capacidades/prioridades/plazos reales no acreditados. Hosted H2 no acreditado, Production no autorizada. Sin Booking/conversión/Payment/recepción/conciliación/fondos/Refund/proveedor/disponibilidad operacional/conectores/envíos reales.

Los IDs compartidos con tareas posteriores no se cierran globalmente: AC-014/016 solo contribución comercial/Acceptance, no Booking; AC-044 solo separación Acceptance/mandato/evidencia, no economía; SPEC-NFR-001 y E2E-01/02 conservan integración completa H6 pendiente. El anticipo se ensaya como prueba B07 inequívoca; no hay un movimiento económico. La prueba de Human Approval comprueba que una evidencia interna y origen IA no sustituyen cliente/actos exactos; no acredita nuevas acciones sensibles externas ni hosted.
