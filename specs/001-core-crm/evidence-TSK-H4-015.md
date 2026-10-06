# Evidencia TSK-H4-015 — Refund parcial local/aislado

**TSK-H4-015/016 COMPLETED local/aislado — 2026-10-06.** H4 IN PROGRESS; H4-001–016 COMPLETED local/aislado; H4-017+ y H5–H6 NOT STARTED. SHA probado `c1eb4ae796b01ab7dd955365a22e392e4b4bf1be`: 1788/1788 PostgreSQL (1695 previos +93 nuevos incluidos), 138/138 unitarias (135 previas +3 nuevas), health-check independiente1/1 separado. Frozen/typecheck/lint-boundaries/build/auditoría/V-MIG/advisors loopback/diff-check PASS; cero FAIL/skipped/cancelled materiales. Expected congelado intacto; una migración forward46 y45 anteriores íntegras. F01–F21 CLOSED, originales recuperables; captura inicial CLI limitada declarada. H4-019/H5-014/H6-004/H6-016 NO ACREDITADAS. H0 técnico/local/aislado y H1/H2/H3 local/aislado COMPLETED conservados. DM-PENDING-005 y pendientes globales conservan sus bloqueos dependientes. Hosted H2/H3 no acreditados; Production no autorizada. STOP tras H4-016; continuidad al hilo de dirección H4. Sin efectos externos reales ni datos reales.

Base exacta `3facc93da6505a3a3657598ca0653a0172b9c645`, main limpio tras fetch y evidencias H4-013/014 publicadas. Expected independiente publicado antes del producto: `4a8db5e577912be714d1924a4b1d8a2a4ee1ccda`; SHA256 `571449d318f6db5c22517bab6d4f3869429c2c4b797fd12e2cbcc318cab27ad8`. Sus 39 filas asignadas de Tasks§6 y R01–R34 permanecen congelados. No cambios en fuentes aprobadas, expected anteriores ni cierres históricos.

## Integración y recorrido

Se reutiliza la determinación persistida/versionada H4-013 como derecho, sin segundo cálculo contractual. Refund tiene identidad propia y referencias a Booking, Cancellation Right/Modification, pagos, conciliación y porciones reales. Request no determina derecho. Determine consume estado vigente legítimo; falta de base es E3 y no cero. Authorize reutiliza Human Approval exacta y ejecutor TTE existente: Administrador, destinatario, importe, causa, efecto, medio, condiciones, origen/porciones y determinación aplicable. No API ordinaria de autorización alternativa.

Record registra solamente hechos acreditados sintéticos: importe, destinatario, fecha, medio, referencia/identidad fuente-cuenta-medio y porciones. No transmite ninguna orden bancaria. La identidad fiable deduplica salida, no descripción/filename. Revisión técnica posterior de fondos no transforma un hecho idéntico en otra salida. Derecho200/salida80 conserva ejecutado80 y pendiente120, nunca ejecución total. PM06 consume derecho50,01: salida20 deja30,01; salida30,01 lo agota sin reaplicar porcentaje.

Un intento incierto protege su porción en los consumidores H3 existentes hasta prueba NUEVA inequívoca del mismo intento/porción. Incident Resuelta no libera reserva ni ejecuta devolución. Resolución acreditada como salida convierte reserva en consumo una sola vez; no ocurrencia acreditada retira exclusivamente aquella reserva. Una salida real sin aprobación exige Incident existente y se conserva no autorizada, sin aprobación retroactiva. Si cambiaron versiones del derecho, sigue siendo un hecho excepcional con Incident; la autorización antigua no vuelve a vigente.

Withdraw retira solicitud, no el derecho debido ni salidas previas. No procede exige derecho legítimo cero; ausencia no basta. Correct añade rectificación enlazada con cantidades firmadas exactas: −20/+20 y evidencia/Incident; no infiere reversión bancaria ni devuelve automáticamente capacidad de consumo. Bruto, conciliación, asignaciones y movimientos históricos permanecen recuperables. La determinación/obligación legítima H4-013/H3 no genera deuda por una simple resta del Refund.

## Arquitectura y persistencia

`src/domain/refund.ts`; adaptador estrecho `src/infrastructure/postgres/h4-refund-adapter.ts`; extensión acotada del mismo `h0-011-adapter.ts`/`human-approval-executor.ts` para TTE. C02 separación de cálculo, C03 persistencia explícita, C04 hecho/B07, C05 aprobación/supervisión, C06 resumen mínimo. T05 raíces monetarias existentes; T06 derecho antes de fondos; T07 movimiento/consumo o reserva/historia/resultado/reevaluación internos juntos; T08 aprobación exacta, autoridad y finalcheck.

Única migración forward46: `20261006001131_h4_refund_partial_portions.sql`, creada por `npx --yes supabase@2.119.0 migration new h4_refund_partial_portions` tras versión/help y documentación oficial. Cuatro tablas de hechos/raíces/revisiones/operaciones Refund; no nuevo ledger de fondos. Los intervalos protegidos se derivan de hechos Refund en las raíces H3, incluidas reservas inciertas. No cambios en las 45 migraciones publicadas.

Cuerpos anteriores modificados deliberadamente, atributos/OID/firmas/owners/ACL/configuración conservados según V-MIG: `crm_private.fund_assign(jsonb,jsonb,text,uuid,uuid,text,uuid)`, `crm_private.fund_usable(jsonb,jsonb)`, `crm_private.fund_summary(uuid,text)` y `crm_api.payment_read(bytea,bytea,bytea,bytea,bytea)`. Los tres primeros integran protección/consulta de porciones y devoluciones; payment_read añade devuelto acreditado a summary conservando snapshot/current bruto. No se afirma igualdad de bytes de esos cuatro cuerpos. Todas las demás funciones anteriores, políticas, triggers, roles, relaciones y datos se comparan.

## Seguridad y límites

F1/F2 vigentes, actor/sesión/contexto emitido por servidor, replay reautorizado. FORCE RLS, owner F2, APIs mínimas, helpers privados sin PUBLIC EXECUTE, search_path explícito; runtime/anon/authenticated sin CRUD. Proyección C06 excluye nombres, originales, costes internos y metadatos de autorización. B07 privado reutilizado; solo fixtures sintéticos y PostgreSQL loopback. Sin audio, datos reales, consentimiento supuesto, retención inventada ni borrado automático importante; DM-PENDING-005 abierto.

No conector ni ejecución externa real. H4-019, H5-014, H6-004/H6-016 NO ACREDITADAS; H4-017+, fianza, matriz integral Refund/fianza/pago proveedor, operación completa, cierres/H5/H6 fuera del bloque. Hosted H2/H3 no acreditados; Production no autorizada. STOP tras H4-016.

## Cierre exacto y regresión

SHA producto/migración/verificador probado `c1eb4ae796b01ab7dd955365a22e392e4b4bf1be`. Ejecución final3 íntegra: 1788/1788 PostgreSQL, 138/138 unitarias, health1/1 separado. Los93 casos nuevos ya están incluidos en PostgreSQL; no se suman de nuevo. V-MIG/advisors forman parte de esa suite. Frozen/typecheck/lint-boundaries/build/auditoría/diff-check todos status0. Comandos/versiones/instantes/status/signal/error y streams: [final3](../../tests/fixtures/h4-016/final3/). Los cambios posteriores a este SHA son exclusivamente evidencia/logs/coordinación; no se atribuye nueva ejecución al commit documental. `final1` falló typecheck (F20); `final2` queda ensayo previo superado, no cierre exacto.

Cadena desde base: expected4a8db5e; producto d4e2ba3; fixes a7c6545; verificador391ae8c; fix técnico2005934; complemento definitivo c1eb4ae; cierre documental posterior. [Hash manifest](../../tests/fixtures/h4-016/manifest.json), [preservación](../../tests/fixtures/h4-016/final3/preservation.json), [fuentes y45 migraciones](../../tests/fixtures/h4-016/final3/source-hashes.json). Logs gzip son completos sin pérdida, no extractos; recuperar con `gzip -dc archivo.stdout.log.gz`.

F22 exclusivamente documental CLOSED: CRLF del CSV corregido a LF; FAIL original de diff-check capturado. No cambio de producto/verificador ni expected.
