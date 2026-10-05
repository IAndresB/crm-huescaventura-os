# Evidencia TSK-H4-008 — Verificar opciones, vigencia y liberación

**COMPLETED local/aislado; verificador independiente con oráculos normativos congelados.**

Base exacta `3306f68b30987bca86968b341301bdab63e93c13`, main limpio y origin IAndresB/crm-huescaventura-os comprobados con fetch antes de escribir. AGENTS.md no existe en checkout/ancestros comprobados; aplicadas instrucciones AGENTS suministradas por el usuario. Dependencias H3-015/H4-006 COMPLETED local/aislado comprobadas; H0 técnico/local/aislado y H1/H2/H3/H4-001–006 preservados. Expected independiente publicado antes de producto en `e4bba9b735cf345325755379c036e413fd009952`. Producto en `ec4bb9fcf36fbff6e588a2c42839da7048528801`; producto/verificador congelado y probado en **`8849b0fa86d9efbc2fb09e6a05b9362438b1af9d`**. Después solo evidencias/logs/coordinación y corrección documental F15 EOF en `47a5e62e0bc6d91db99994d2546e626a2249f11d`: ningún caso/fuente/guarda/expected normativo cambió, commit original íntegro recuperable; preservación normalizada por EOF en preservation.json. No cambió producto, migración o lógica de pruebas después del SHA probado. El SHA documental final se distingue del probado y se recupera por Git; no se atribuye nueva ejecución a su commit.

Entorno: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 Postgres.app y CLI Supabase2.119.0; CLI2.118.0 consultada inicialmente. Storage oficial fijado a `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend privado de archivos en loopback. Clústeres efímeros, fixtures/credenciales sintéticos, migración y runtime separados. La palabra genérica del CLI «remote database» corresponde exclusivamente a127.0.0.1; sslmode=disable solo en ese clúster nativo sin SSL. Sin hosted/Production, datos reales ni envíos/consultas a proveedores, pagos/fondos externos.

**Regresión:**1443/1443 PostgreSQL PASS,118/118 unitarias PASS;44 tests del bloque incluidos en1443, sin doble cómputo (1 focal+20 grupos normativos+5 reproducers+18 complementos). Los27 IDs del expected se trazan a fuentes/fixtures/acciones/guardas/expected/observado/evidencia en matrix.json. Health-check independiente1/1 separado. Cero FAIL/skipped/cancelled materiales al cierre. Gates frozen-install/typecheck/lint-boundaries/build/audit producción/diff-check PASS; auditoría sin vulnerabilidades conocidas; advisors loopback results[]. V-MIG instalación41 vacía, upgrade40 poblada, DDL fallo/rollback/retry y preservación de datos/ACL/catálogos PASS.

Recuperación de evidencia: [matriz](../../tests/fixtures/h4-008/matrix.json), [resumen](../../tests/fixtures/h4-008/regression-summary.json), [entorno](../../tests/fixtures/h4-008/environment.json), [preservación/hashes](../../tests/fixtures/h4-008/preservation.json), [FAIL/causas/correcciones/retests](../../tests/fixtures/h4-008/defects.md), [manifest raw](../../tests/fixtures/h4-008/raw-manifest.json). Logs completos comprimidos sin alterar bytes; manifest incluye hash/longitud originales y gzip. F13 primera salida stdout interna no emitida no se presenta como recuperada; diagnóstico posterior stdout/stderr completo. Logs históricos H2-011 regenerados se archivaron nuevos y se conservaron originales Git; ningún verificador heredado se modificó.

**F01–F15 CLOSED:**7 materiales,7 técnicos/entorno,1 documental. Reproducción material permanente de replay equivalente, precedencia contradictoria, cobertura obsoleta del vínculo, identidad de split y cambio expreso de fecha. FAIL originales conservados con cronología; expected no acomodado al producto.

**Pendientes y STOP:** H4 IN PROGRESS; H4-001–008 COMPLETED local/aislado; H4-009+ y H5–H6 NOT STARTED. H4-021 integración adicional NO ACREDITADA; H4-023 y capacidades posteriores pendientes. Sin Provider Confirmation, confirmación firme, operación/modificación/revalidación completas, Refund/fianza, Closure Assessment/cierres, coordinación/avisos/jobs H5, conectores o ejecutor externo nuevo. DM-PENDING-005 abierto; sin audio, consentimiento supuesto, retención inventada, borrado automático importante ni datos reales. Hosted H2/H3 no acreditados; Production no autorizada; health-check independiente intacto. STOP tras publicar H4-008; continuidad vuelve al hilo de dirección H4 y exige nueva autorización humana.

## Fuente, matriz y observación

Fichas completas Tasks §4.5, protocolos §§2.2–2.3, filas §6 y bloqueo §7; Plan §§4/5.1/7.3/8 y T04/T08; SPEC-FR-SVC-007 yAC-021; Domain Model Capacity Hold yDM-INV-021; State Machines §8.2 completo SM-HO-01–07,SM-BS-03,SM-FORB-07/12 yG1–G6; BR-AVAIL-003/006,BR-SUP-002–004, alcance/noches/historia; Architecture/Constitution/D016/D017/D037/D038/D039. Tablas prevalecen; ninguna fuente aprobada modificada.

[Expected](expected-TSK-H4-007-008.md) R01–R27, derivado antes del producto. Comparaciones literales y SQL real, no helpers producto como expected. Fixtures solo usan contratos H1/H2/H3/H4 reales para fabricar estados de negocio; observer/migration/bootstrap se emplean exclusivamente para inspección de integridad/ACL, fixtures técnicos de seguridad, locks e inyección identificada de fallo. No se siembran estados futuros de confirmación, ejecución, Refund o cierre.

Verificadores: `postgres-h4-007.test.ts` focal; `postgres-h4-008.test.ts`20 grupos normativos con retirada individual de claves/guardas; `postgres-h4-008-reproducer.test.ts`5 reproducciones materiales permanentes; `postgres-h4-008-supplement.test.ts`18 complementos. Fixture/protocolo en h4-hold-fixtures/isolation. Matriz JSON conserva cada fuente, precondición, acción, prohibiciones, resultado y referencias recuperables. Los Node tests agrupados contienen múltiples retiradas; no se inflan recuentos por assertions.

Resultados observados: concesión inequívoca pre-Booking; cantidad/unidad/catálogo/versiones/alcance reales; documento no concede por adjuntar; vigencia acotada para acción, offsets y frontera explícita; no TTL infinito; próximo a vencer requiere configuración; vencimiento/incertidumbre no resta capacidad; petición manual sent independiente de vigencia; negativa/silencio/ambigüedad/preparación sin envío rechazados; respuesta espontánea/parcial4 deja8; repetición no resta; prórroga parcial no extiende resto; sustitución mantiene identidad anterior; nueva fecha externa no modifica aceptación. Respuesta antigua o igual instante contradictorio no reemplaza por llegada (E8); incertidumbre conserva último hecho.

Conversión H2 real antes/después con Hold mismoID/original/condiciones; vínculo obsoleto/otra línea/versión/condiciones/fecha/variante rechazado. AC-01912/10 y4 nominales conservados sin16/ficticios; Required Document Recibido sigue sin revisión; AC-020 disponibilidad12 no cubre16. Economy/funds/PM-03/08/T05/T07 yD039/TTE preservados por suite previa completa.

V-DAT/V-NEG: F1/F2/contexto nulo/falso; disabled actor, revoked session y replay reautorizado; cross Opportunity/UUID/original yscope; CRUD directo runtime/anon/authenticated denegado, helpers sinPUBLIC, ownerNOLOGIN yFORCE/ACL/search_path observados. Proyección mínima sin economía/datos personales/sourcecontenido. Intentos explícitos SM-FORB-07/12 yTask complete no admitidos; ninguna capacidad H5 implementada ni acreditada con doubles.

V-AT: sesiones PostgreSQL independientes con solapamiento observado y ambos órdenes; altas equivalentes sin hijos/samekeymaterialdiff, liberación parcial competidora, liberación vs prórroga/check, prórrogas distintas sobre misma base, vinculación y conversión H2 reales vs cambio, porciones/scopes independientes, stale revision. Raíz/porciones/historia/resultado/seguimiento no duplicados. Fallos root/revisión/resultado/Task y deferred COMMIT, además de cada transición; rollback exacto y reintento. Wrapper pierde respuesta solo tras PostgreSQL COMMIT exitoso; replay recupera durable sin volver a liberar4.

V-MIG: instalación vacía41 yupgrade40 con Requirement Revisado/original privado, Incident INC En gestión/historia yAvailability verificada. Snapshot completo de cada tabla privada ycatálogo de owners/ACL/function config/policies/triggers/roles antes/después; todos previos idénticos. Fallo DDL revierte esquema/ACL entero yretry aplica sin editar40 migraciones.

## Comandos ejecutados y logs completos

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm audit --prod
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm test:postgres
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin node --test tests/operations/supabase-health.test.mjs
git diff 3306f68b30987bca86968b341301bdab63e93c13..HEAD --check
```

Todos PASS. PostgreSQL1443/1443 duró396122.211ms;44 del bloque incluidos, frente a1399 previos (+44), unitarias118 preservadas. Health1/1 separado. Advisors CLI2.119 ejecutados por test sobre clúster127.0.0.1 aislado completo41, JSON results[] yexit0. Diff-check rangePASS después de F15 documental; no se presenta el FAIL original como PASS ni se atribuye correcciónEOF a producto. Producto/verificador probados en8849b0f; cierre documental posterior solo evidencia/coordinación.
