# Siguiente bloque H6 tras el cierre local de H6-015 — preparación documental

2026-10-22. **Solo preparación documental. H6-016 y H6-001 NOT STARTED.** Sin código, SQL, recursos, datos nuevos ni ejecución de pruebas funcionales. No se declara H6 global COMPLETED.

## Orden y dependencias efectivas

Tasks §5 establece que la dependencia manda sobre el orden numérico. La ficha inmediatamente posterior es **TSK-H6-016 — Verificar intercalaciones y fallos de T01–T11 integradas**, pero no puede iniciarse todavía. H6-015 no es una dependencia directa suya.

| Dependencia directa H6-016 | Estado comprobado |
|---|---|
| TSK-H5-019 | COMPLETED_LOCAL |
| TSK-H6-013 | COMPLETED_LOCAL |
| TSK-H6-001 | NOT STARTED |
| TSK-H6-004 | NOT STARTED |
| TSK-H6-006 | COMPLETED_LOCAL |
| TSK-H6-007 | NOT STARTED |

H5-019/H6-013 constan cerradas en la base y sus actas; H6-006 en el [acta local aceptada](/Users/andres/.codex/worktrees/h6-c04-integration/crm-huescaventura-os/specs/001-core-crm/acceptance-TSK-H6-006-local.md). H6-001/004/007 conservan NOT STARTED en sus fichas; no se ha encontrado acta de cierre en el candidato vigente. No se infiere su satisfacción de pruebas parciales de otros hitos.

La propuesta técnica es **H6-001 → H6-004 → H6-007 → H6-016**. Es orden sugerido de trabajo, no nuevas dependencias: H6-001/004/007 dependen directamente de H5-019 y pueden organizarse por recursos autorizados. H6-006, también requerida, ya está cerrada.

## H6-016: alcance preparado, sin resultados

Fuentes: Tasks ficha H6-016 y §6, Plan §§7.2/10.1, SPEC §18, AC-067/AC-068. B01–B10; C02/C03/C06; T01–T11. Los **25 renglones asignados** se conservan literalmente en [matriz documental](../../tests/fixtures/h6-015-formal-closure/next-H6-preparation-v1.json), con líneas del Tasks anterior al cierre, hash de fuente y resultado NOT_EXECUTED. Las once unidades PLAN-T01–T11 se extraen literalmente del Plan.

Diseño futuro: para cada unidad, identificar raíz y cambios atómicos; fijar expected independiente antes del observado; ensayar ambos órdenes y solapamiento, ausencia inicial de hijos, fallo antes/durante commit y pérdida de respuesta; comprobar historia, idempotencia y efectos colaterales. Los casos específicos incluyen cierre contra factura/Refund/Incident, reserva/consumo y aislamiento del contexto en pool. PostgreSQL aislado real; un doble no acredita atomicidad ni concurrencia. La repetición de efecto incierto sigue prohibida.

La ficha contiene la remisión literal «matriz §6.5», mientras el título vigente §6.5 es Prohibiciones y PLAN-T01–T11 se asigna en §6.7. Se conserva esa remisión sin corregir norma ni omitir §6.5: la preparación cruza ficha, totalidad de §6 y Plan §7.2. No se inventa una matriz alternativa aprobada. Si la futura ejecución necesitara cambiar el significado, deberá presentarse la decisión normativa concreta; esta observación no bloquea la documentación ni crea una dependencia de H6-015.

## H6-001: primer bloque futuro con dependencia satisfecha

**TSK-H6-001 — Verificar E2E-01: Venta y prestación completa.** Dependencia directa única H5-019, COMPLETED local. Queda pendiente autorización del nuevo alcance funcional; este cierre no la concede.

Fuentes exactas: Tasks ficha H6-001 y §6, Plan §§9–10.1, SPEC §9. Tres asignaciones directas: AC-089, SPEC-NFR-001 y E2E-01. Sus literales se incluyen en la misma matriz documental. Bloques B01–B10; contratos C01–C06; unidades T01/T02/T03/T04/T05/T07/T10.

Recorrido previsto: contexto → Lead/Opportunity → modalidades/versiones/Acceptance → Booking/cantidades → fondos y críticos → ejecución/documentos → tres cierres. La salida debe reconstruir necesidad, versiones, aceptación, cantidades/noches, confirmaciones, movimientos/porciones y fundamentos de los tres cierres. Preparación no equivale a confirmación, pago, prestación ni cierre.

Bloques documentales para futura ejecución autorizada:

1. Preflight: revalidar H5-019, seleccionar candidato efectivo y sus interfaces existentes, entorno exclusivo/sintético y expected congelado por frontera. No ejecutar este checkout documental como si contuviera C07/Auth R2; reconstruir el candidato exacto desde referencias aceptadas.
2. Composición E2E desde entradas válidas mediante contratos de aplicación y PostgreSQL aislado. Dobles únicamente para efectos externos. Evidencia de cada frontera con identidad, permisos, historia y repetición; no deducir integración de PASS aislados.
3. Contrapruebas de guardas relevantes al recorrido y lectura de la salida completa; resultado por asignación, sin inventar un número de tests ni reclamar cobertura futura.
4. Auditoría independiente sobre fuentes/instrumentos/expected separados; preservar FAIL y candidatos. Cualquier discrepancia corregible se resuelve dentro de la autorización futura; cierre y publicación conservan sus puertas.

No se prepara infraestructura ni se modifica producto. Reservados S11, N03, datos/credenciales reales, Hosted/Production, negocio externo, cambios normativos, Git/Drive/despliegues. ARCH-PENDING-002 y DM-PENDING-005 OPEN. **STOP documental: no iniciar H6-001, H6-004, H6-007 ni H6-016.**
