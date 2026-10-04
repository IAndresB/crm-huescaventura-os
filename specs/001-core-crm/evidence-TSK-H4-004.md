# Evidencia TSK-H4-004 — Verificación independiente de Incident

Estado: **COMPLETED local/aislado**, 2026-10-05. Expected congelado anterior a producto; sin adaptación posterior.

Base inicial publicada: `2f27ae3b5cd8a8d7f510ee32072fda0ddbc33d25`; main/origin/main y árbol limpio después de fetch. Dependencias H3-015, H4-002 y H1-004 documentadas COMPLETED local/aislado. No AGENTS.md adicional en repositorio/ancestros; instrucciones humanas AGENTS aplicadas, README y normativa vigente contrastados.

Expected independiente: `0b2ec9623e2f44424910f4d66efce11f6a39b336`, [expected-TSK-H4-003-004.md](expected-TSK-H4-003-004.md), anterior al producto. Se conserva byte a byte (R37). Las 19 filas Tasks §6 están literalmente identificadas en el expected. Constitution → Product → BR → DM → SM → Architecture → SPEC → Plan → Tasks; tablas prevalecen sobre diagramas. Fuentes: Plan §§4/8–9, SPEC-FR-ID-005/COORD-006, AC-052/060, DM-INV-042, SM-BK-10/11, SM-BS-11, SM-IN-01–06, SM-FORB-18/24, PLAN-B04, PT-08 y E2E-07 como obligación futura. G1–G6, BR-INC-001/002, BR-ID-001/002, D040, D016/D017 y DM-PENDING-005 aplicados sin decisiones nuevas.

SHA exacto probado: `6bbab09d36632b1d9ed7726230fb402c5d4009d2`. Producto tuvo último cambio en `894566f6b60f9a3e1a210d7344d4bfb979debbe9`; lógica de verificador en `cfac6180070450f4412fd3044f1b0d5a415b2033`. El commit documental final añade evidencias/logs/coordinación, sin cambiar producto ni lógica de pruebas. Su SHA se obtiene del commit que contiene estas evidencias y se registra expresamente en el informe de publicación; no se presenta como SHA ensayado.

Entorno: Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 Postgres.app, CLI Supabase 2.118.0. Binario nativo `/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin`. Storage oficial aislado en loopback, backend nativo de archivos y commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, sin hosted. Fixtures únicamente sintéticos y efímeros, recuperables en `tests/support/h4-incident-*.ts` y builders históricos. Ninguna identidad ordinaria usa owner, service_role o BYPASSRLS; credencial técnica Storage solo dentro del backend aislado acreditado H1.

Resultados finales: **1344/1344 PostgreSQL, 118/118 unitarias, health-check independiente 1/1**, 0 FAIL/skipped/cancelled. Las **50 pruebas de este bloque** (38 grupos normativos +1 focal +1 vínculos económicos +10 complementos/reproducer) están incluidas en las 1344; no se suman otra vez. Los múltiples guardas retirados dentro de cada grupo tampoco inflan ese recuento. F01–F10 CLOSED local/aislado; un defecto material (F06), nueve técnicos de verificador/ejecución. FAIL originales, correcciones y retests conservados en [defects.md](../../tests/fixtures/h4-004/defects.md), logs gzip sin alteración de bytes y hashes verificables en [log-originals.json](../../tests/fixtures/h4-004/log-originals.json).

Pendientes expresos: **H4-005+; H4-021; H4-023; H5-016; H6-007/E2E-07**. Motor completo de preparación/confirmación/prestación/revalidación/modificaciones, Refund/fianza, Closure Assessment, coordinación/avisos/jobs H5 y ciclo integrado posterior no implementados ni preparados. DM-PENDING-005, política definitiva de retención/anonimización/eliminación, audio, datos reales, consentimiento, conectores, hosted y Production pendientes. Sin envíos, pagos, fondos externos, IA externa ni automatización sensible. Hosted H2/H3 no acreditado; Production no autorizada. H0 COMPLETED técnico/local/aislado; H1/H2/H3 y H4-001/002 COMPLETED local/aislado conservados. H4 IN PROGRESS; H4-003/004 COMPLETED local/aislado; H4-005+ y H5–H6 NOT STARTED. **STOP obligatorio tras publicar H4-004**; continuidad al hilo de dirección H4 con nueva autorización humana.

## Protocolos, comandos y registros

V-DOM/V-DAT/V-SM/V-NEG/V-AT/V-MIG ejecutados contra assertions independientes en `tests/integration/postgres-h4-004.test.ts`, vínculos económicos reales, supplement y focal H4-003. No se importa ningún helper de decisión del producto como expected. Builders preparan contexto/evidencias; comparaciones usan estados, guardas, igualdad de snapshots y catálogos, rechazo y ausencia de efectos normativos explícitos.

| Comprobación exacta sobre SHA congelado | Observado | Registro recuperable |
|---|---|---|
| `POSTGRES_H0_BIN=… pnpm test:postgres` | 1344/1344 PASS; incluidos 50 actuales y todas las históricas | `postgres-full.log.gz` |
| `pnpm test` | 118/118 PASS | `unit-full.log.gz` |
| `POSTGRES_H0_BIN=… node --test tests/operations/supabase-health.test.mjs` | 1/1 PASS, separado del total anterior | `health-independent-retest.log.gz` |
| `pnpm install --frozen-lockfile` | PASS, lock intacto | `install-frozen.log.gz` |
| `pnpm typecheck` | PASS | `typecheck-final.log.gz` |
| `pnpm lint` | PASS, incluye import/boundaries | `lint-boundaries.log.gz` |
| `pnpm build` | PASS | `build-final.log.gz` |
| `pnpm audit --prod` | Sin vulnerabilidades conocidas | `audit-production.log.gz` |
| CLI 2.118.0 `db advisors --db-url postgresql://crm_h0_migration@127.0.0.1:56209/crm_h4004_advisor?sslmode=disable --type all --fail-on error` | PASS, results=[]; base efímera local con cadena 39 | `advisors-local.log.gz` |
| `git diff 2f27ae3… --check` y hash baseline | PASS | resumen/protected-baseline |

Todos los registros están en [tests/fixtures/h4-004](../../tests/fixtures/h4-004/regression-summary.json); [manifest](../../tests/fixtures/h4-004/log-originals.json) permite descomprimir y comprobar SHA-256/bytes originales. La etiqueta genérica CLI «remote database» corresponde a `--db-url` de loopback, no a Supabase hosted. No proyecto hosted consultado ni modificado.

V-MIG: instalación vacía de cadena 39, upgrade real desde 38 con Booking/servicios, Requirement Revisado y original privado real B07; comparación de todas las filas anteriores y catálogos (IDs, owners/ACL/RLS, funciones/search_path/definer, policies, triggers y roles) sin pérdida. Inyección DDL antes de COMMIT deja inventario idéntico, rollback y retry PASS. Rol runtime no migra. Los verificadores históricos H4-002 se acotan a su frontera original de 38 migraciones; conservan el mismo expected/recuento y no fallan por el forward 39. Ninguna de las 38 migraciones ni fuentes aprobadas se modifica.

AC-019/051, SM-DO, correcciones/originales privados, H0–H3, economía exacta/fondos, cantidades y privacidad/D039/TTE vuelven a pasar íntegramente. Los dos logs históricos H2-011 regenerados durante el ensayo se archivan aquí y se restauran byte a byte en sus rutas históricas; no se reescriben originales.

## Resultado por grupo del expected

Cada ID siguiente identifica el test Rxx y las múltiples guardas retiradas de ese grupo; esperado completo en expected congelado y observed assertions en el test/SHA. Todos PASS en postgres-full.log.gz, sin doble cómputo.

| ID | Fuente normativa congelada | Observado final |
|---|---|---|
| R01 | BR-INC-001; SM-IN-01 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R02 | SM-IN-01; G1/G2 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R03 | SPEC-FR-ID-005; D040 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R04 | D040; BR-ID-001/002 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R05 | SM-IN-02 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R06 | SM-IN-02; G1/G2 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R07 | SM-IN-03; AC-052 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R08 | SM-IN-03 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R09 | SM-IN-03; G2 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R10 | SM-IN-04 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R11 | SM-IN-04 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R12 | SM-IN-05; AC-052 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R13 | SM-IN-05 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R14 | SM-IN-06 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R15 | SM-IN-06 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R16 | SM-BK-10; SM-BS-11; PLAN-B04 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R17 | SM-BK-11; SM-BS-11 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R18 | SM-BK-10/11; G1/G2 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R19 | AC-060; DM-INV-042; SM-FORB-24 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R20 | AC-060; DM-INV-042 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R21 | SM-FORB-24 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R22 | SM-FORB-18; AC-052 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R23 | G4/G5; SM-IN-05/06 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R24 | D016/D017; DM-PENDING-005; P10 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R25 | C01/C06; G1; P10 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R26 | V-DAT; F1/F2; D039 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R27 | V-DAT; P10 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R28 | V-AT; G6 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R29 | V-AT; E2 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R30 | V-AT; G6 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R31 | V-AT; V-DAT | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R32 | V-AT; G4/G6 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R33 | SM-BK-11; V-AT | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R34 | V-AT | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R35 | V-MIG | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R36 | V-MIG | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R37 | V-EVI; Tasks2.2/2.3 | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |
| R38 | PT-08; E2E-07; Tasks | PASS; estado/efectos/guardas contrastados, sin cambio del expected. |

Los diez complementos acreditan: alta equivalente sin hijos mediante barrera PG; INC concurrente para dos Bookings distintas; gestión/gravedad en ambos órdenes; acceso cruzado por ID/código/historia y replay; pérdida de respuesta tras COMMIT; AC-060 con Provider Payment pendiente real e impacto económico independiente; reproducer mínimo F06; resolución/reapertura en ambos órdenes; cierre/evidencia contradictoria con stale revision; y dos Incident activos sobre el mismo impacto. Se observan dos sesiones runtime bloqueadas en unidades crm_api; una puede esperar admisión F2 y otra la barrera de dominio. No se promete ejecución simultánea dentro de ambas secciones críticas ni capacidad de Closure Assessment.

F01–F10 CLOSED localmente; las ejecuciones FAIL originales permanecen disponibles y no cuentan como PASS. [Cronología y clasificación](../../tests/fixtures/h4-004/defects.md). La integración futura H4-021/023,H5-016,H6-007/E2E-07 permanece pendiente, sin dobles acreditativos. **STOP aplicado tras publicación de H4-004.**
