# Evidencia H4-017 — COMPLETED local/aislado

Base original `f04e6797a8ff69a14b77e7e9f8bdb1fc9b8bf21f`; base de continuación `50dedbdb47d3e8ef7fbb269c34bf624cdd2b90fc`. Preflight main/HEAD/origin main iguales tras fetch y árbol limpio; cadena y cierre F23/F24/F30 publicados conservados. Expected independiente publicado `7ec013b0d98ae593908255b56a3fdc7dfc8032b7`, SHA256 `48c306538e0f1bde3ad9d156333662a7c9ba9757519aa3958b4c4f37aa1c22cb`, bytes intactos. No nuevo expected equivalente.

SHA definitivo producto/migración/verificador **`a26eec923854aada4c6ecb3af518576d473811b6`**. Regresión final íntegra2026-10-06 entre14:08:50 y14:15:40 UTC: **1931/1931 PostgreSQL** (1831 anteriores +96 funcionales +4 V-MIG/preservación =100 nuevos incluidos una vez), **138/138 unitarias**, **health-check independiente1/1 separado**. Cero FAIL/skipped/cancelled. Frozen install, typecheck, lint/import-boundaries, build, auditoría producción sin vulnerabilidades, V-MIG, advisors exclusivamente loopback y diff-check50ded..SHA PASS. No dependencia cambiada; source-map-js1.2.2 conservado. Los100 focales y compatibility48 no se suman otra vez.

Comandos y resultados: [regresión resumida](../../tests/fixtures/h4-018/continuation/regression-summary.json), [statuses del runner definitivo](../../tests/fixtures/h4-018/continuation/final-results.json), [cadena hasta SHA probado](../../tests/fixtures/h4-018/continuation/commits-tested.txt). Streams completos en continuation, almacenados gzip sin pérdida cuando corresponde, con hashes original/almacenado en [manifest](../../tests/fixtures/h4-018/continuation/manifest.json). Capturas status contienen comando/argumentos/SHA/instantes/status/signal/error reales. Entorno Mac local, Node24.21.0/pnpm11.19.0, PostgreSQL17.11 de Postgres.app aislado; versión real en final-versions-postgres. Storage sintético loopback administrado por runner histórico.

H4 IN PROGRESS; H4-001–018 COMPLETED local/aislado; H4-019+ y H5–H6 NOT STARTED. H4-019/H5-014/H6-005 y restantes integraciones futuras NO ACREDITADAS en sus ámbitos. DM-PENDING-005 y pendientes globales intactos. Hosted H2/H3 no acreditados; Production no autorizada. Sin datos reales, audio, retención inventada, consentimiento supuesto, borrado importante, conectores ni efectos externos reales. STOP tras publicar H4-018, continuidad al hilo de dirección H4.

## Modelo e integración acreditados

Reutiliza Booking H2 real y alcance operativo canónico por servicio/noche, catálogo y términos aceptados/versionados, B07 privado revisado, Incident, H3 Customer Payment/Reconciliation/Allocation y Refund. Diseño previo original y borrador incompleto conservados como antecedentes; [addendum técnico](../../tests/fixtures/h4-018/continuation/design-addendum.md) delimita la implementación terminada. No se convirtió el borrador archivado en migración ejecutable.

Deposit mantiene aplicabilidad, exigencia, entregas/custodia, evaluación, determinación, retenciones aplicadas, restituciones y discrepancias separadas. Dinero en strings/numeric exacto; porciones semiabiertas de cada entrega, sin solapamientos/excesos ni greatest para ocultarlos. Resolución completa exige además que no quede exigencia pendiente de entrega:40 entregados de100 conserva60 faltantes. Cambio material invalida aplicabilidad para nuevos efectos sin borrar decisiones/hechos anteriores.

AC-036 por contratos ordinarios: entrega externa100 al proveedor; determinación20 retener/80 devolver no acredita aplicación. Retención efectiva20 conserva100/20/0/80. Restitución30 deja devuelto30/pendiente50; restitución50 deja devuelto80/pendiente0, retenido20. El Refund tiene baseType=guarantee y depositId; cada restitución está una sola vez en b05_refund_movements. Deposit referencia esa identidad; no almacena otra salida sumable. Se usan ambas APIs en el mismo recorrido y replay. Cero Customer Payment ficticios en custodia externa, sin Cancellation Right, cancelación ni fondos internos inventados.

Custodia interna solo con cobro, conciliación y Allocation verificables purpose=deposit y porciones reales; entrega no duplica fondos, retención y devolución utilizan raíces/protección común H3. Bruto100 conservado; retorno30 aparece una sola vez en fondos. Anticipo comercial no acredita custodia de garantía sin asignación específica. No transformación automática de retención en ingreso/honorario/fiscalidad.

SM-DE01–08 y FORB19 contrastados; Incident resuelta no acredita restitución. Nueva solución documentada enlaza revisión y conserva último progreso/original; S2 y noches independientes continúan. Condiciones/método/receptor/destinatario/porciones/evidencia/HA insuficientes se rechazan sin fabricar resultado.

## Producto y migración

Archivos: src/domain/deposit.ts; src/infrastructure/postgres/h4-deposit-adapter.ts; integración mínima h4-refund-adapter.ts y h0-011-adapter.ts. Una migración CLI nueva **20261006133716_h4_deposit_guarantee_custody.sql**, total48. Invocaciones nuevas CLI2.119.0 version/help/migration new capturadas completas. [CLI oficial](https://supabase.com/docs/reference/cli/supabase-migration-new) y [RLS oficial](https://supabase.com/docs/guides/database/postgres/row-level-security) consultados para el procedimiento vigente; ninguna vinculación hosted.

Solo cambian deliberadamente dos cuerpos previos: crm_private.refund_core(jsonb,text,uuid,text), que protege raíces de garantía frente al recorrido contractual ordinario; crm_api.refund_apply(bytea,bytea,bytea,bytea,bytea), que enruta garantía explícita al mismo kernel. El resto del comportamiento contractual se conserva y regresa sobre48. Firmas/OID/owners/ACL/configuración anteriores coinciden. No se afirma igualdad de bytes de esos dos cuerpos. El adaptador HA existente incorpora exclusivamente determinación/finalización Deposit y el finalcheck D039 tras drenar constraints, inmediatamente antes de COMMIT, sin callbacks/SQL arbitrarios expuestos.

## Seguridad, porciones y atomicidad

F1/F2 vigentes antes de actuación/lectura/replay; HA exacta Administrator/TTE para resolución, actor/sesión y autorización aplicable para registrar hechos. Candidato B07 no es hecho revisado, origen IA no es aprobación. FORCE RLS, owner F2 separado, EXECUTE mínimo, helpers privados y search_path=pg_catalog,pg_temp. Runtime/anon/authenticated no tienen CRUD directo; referencias cruzadas y contexto falso denegados. Proyección summary mínima con5 claves, sin originales/datos personales innecesarios.

Carreras PG independientes con espera Lock observada1/2 sesiones y ambos órdenes: altas, entregas, retenciones, retornos solapados/disjuntos, mismo hecho y nueva evaluación. Revisión obsoleta rechazada; retry disjunto tras nueva base válido; independencia mantiene ambos alcances. Raíces H3 protegen porciones internas. Inyecciones identificadas en root/facts/operations/revisions/movimientos/Refund y constraint diferida COMMIT comparan snapshot completo antes/después, rollback exacto y retry. Pérdida simulada solo después de COMMIT real recupera resultado durable sin doble movimiento. No garantía exactly-once externa ni rollback de hechos externos.

Verificador, matriz y detalle de preservación en [evidencia H4-018](evidence-TSK-H4-018.md). F01–F09 CLOSED con FAIL originales y retests. El primer final92cdfe3 falló typecheck F09 y está conservado; la definitiva ejecutada es a26eec. El commit posterior solo puede añadir evidencia/logs/coordinación, sin atribuirle ejecución nueva de producto.

## Antecedente publicado50dedbdb — texto original del checkpoint, sin reinterpretación

# Evidencia parcial H4-017 — no cierre

Base autorizada f04e6797a8ff69a14b77e7e9f8bdb1fc9b8bf21f, main/HEAD/origin main iguales tras fetch y árbol limpio. Cierre F23/F24/F30 publicado confirmado. Expected independiente congelado y publicado en7ec013b0d98ae593908255b56a3fdc7dfc8032b7;17 filas literales Tasks§6 y8 transiciones SM-DE, casos D01–D21. Expected históricos intactos.

Implementación INCOMPLETE. Contratos inspeccionados: Refund exige Cancellation Right; H3 Allocation admite purpose deposit. Diseño previo en tests/fixtures/h4-018/design-before-product.md. Falta completar implementación segura de garantía/custodia/porciones y vínculo canónico Refund sin fundamento de cancelación ficticio ni fondos internos ficticios. Es trabajo pendiente de este bloque, no una divergencia Git ni una nueva exigencia de autorización humana.

CLI2.119.0 creó20261006123259_h4_deposit_custody_resolution.sql; borrador incompleto de estructura/ACL/cálculo archivado exclusivamente como migration-incomplete.sql.txt, fuera de supabase/migrations. No aplicado ni presentado como producto terminado. Se conservan las47 migraciones publicadas y lockfile source-map-js1.2.2, manifiesto y health-check. No nueva migración de producto publicada.

No pruebas PostgreSQL, unitarias, V-MIG, carreras, rollback, seguridad ni regresión ejecutadas para este bloque; no nuevo SHA de producto probado ni PASS atribuido. Ayuda CLI, stdout/stderr y changelog consultado conservados; los estados/signals individuales de las invocaciones CLI iniciales no fueron capturados separadamente y no se reconstruyen. Web no pudo leer changelog markdown; curl lo recuperó localmente. Ningún FAIL funcional ejecutado; no defecto Fxx inventado a partir de diseño incompleto.

H4 IN PROGRESS; H4-001–016 COMPLETED local/aislado conservados; H4-017 IN PROGRESS documental, producto pendiente; H4-018 NOT STARTED en verificación técnica. H4-019+ y H5–H6 NOT STARTED. Integraciones H4-019/H5-014/H6-005 NO ACREDITADAS; pendientes globales intactos. Sin hosted/Production/datos reales/efectos externos reales.
