# Evidencia independiente — TSK-H3-002

**COMPLETED local/aislado.** V-DOM +V-DAT +V-MIG, matriz60/60 PASS.

Base inicial `b60031e04ddaa6f2a442979edeb0d3a8dd6568a9` tras `git fetch origin`: main, árbol limpio, HEAD==origin/main y SHA exigido exactos. Fuentes vigentes comprobaron H0 COMPLETED técnico/local/aislado, H1/H2 COMPLETED local/aislado, H2-001–012 COMPLETED; H3–H6 NOT STARTED y cero Fxx materiales H2 abiertos. Health-check Supabase independiente fuera de H0–H6 conservado; hosted H2 no acreditado y Production no autorizada.

Expected independiente [expected-TSK-H3-001-002.md](expected-TSK-H3-001-002.md), **60 casos y19 filas Tasks §6**, congelado en `8d1f527b38f620f5fd29df2a130838a3f04b62ba` antes del producto `e578241467a1dc20b6e03e0bcb034df2baaf9b04`. Hash SHA256 `3b5784814e023c80f8d3b3370abec2a354d151fd9eea515cb7b8982f92f698bd`, idéntico tras todas las correcciones. Fuentes: fichas Tasks completas, Plan §§5.2/7.3/9, SPEC-FR-ECON-001/002, AC-023/025/041/042, PM-03, D011/D020/D023, DM-INV031, SM-EP01/03/04, SM-FORB14/33, PLAN-DEC006/B05/C02/C03/C06/T05/T06/PT04; Tasks §2.2 y todas las filas §6 asignadas copiadas en expected. H1/H2 no se reinterpretan. Las referencias auxiliares de SM-EP02 se aplican únicamente al contrato de cobertura, sin integrar movimientos.

Commit exacto de producto/verificación probado: `a2bbcd0cf85ebd3f0ecdf9d0383d7d54df3ae9a0`. Dominio/adaptador/migración idénticos a `6f53c32466bed9c30eaab3153758e7fb47f754b5`; a2bbcd0 añade la corrección del inventario histórico H2-011 y la reproducción F04. La evidencia/coordinación final se publica después, en SHA distinto. Node24.21.0/pnpm11.19.0/PostgreSQL17.11/Supabase CLI2.118.0. Clusters efímeros independientes, datos/credenciales sintéticos; runtime crm_h0_runtime sin owner/SUPERUSER/BYPASSRLS. Clusters H3 focal/formal/upgrade/rollback/roles ausentes/históricos en puertos55670–55675; runner completo añade Storage oficial aislado con backend de archivos y loopback, preservando pruebas H0–H2.

## Historial de defectos conservado

Primer intento formal sobre e578241:56/60 PASS,4 FAIL de F01/F02/F03. F01 producto: R29/R32 devuelven numeric como JSON number; corrección proyecta diferencia como texto decimal. F02 producto: R55 API firmada acepta amount JSON number; corrección exige string decimal. F03 verificador: R53 compara last_human_activity_at literalmente pese a acto humano F2; corrección conserva comparación de todos los otros campos y verifica monotonicidad explícita, sin cambiar expected. Segundo formal60/60 PASS; tercero con dos sesiones reales+focal+3 históricos64/64 PASS.

Primera regresión completa sobre6f53c32:680/681 PASS, F04 de verificador R35 H2-011 cuenta31 migraciones vivas al exigir30 de su base H2. Corrección limita inventario a bookingMigration y conserva exactamente30 comparaciones byte a byte y el ensayo V-MIG anterior. No modifica producto/normativa H2. Repetición afectada100/100 PASS; regresión final fresca682/682 PASS. F01/F02/F03/F04 **CLOSED local/aislado**, cero materiales abiertos. Originales `first-formal.log.gz`, `postgres-6f53c32.log.gz`, SQL e578241 y ambos verificadores originales, cuatro reproducers mínimos, hashes y detalle en `tests/fixtures/h3-002/defects.md`. No FAIL borrado/sustituido ni expected acomodado al producto.

## Matriz expected frente a observed

|Caso|Fuente del expected previo|Expected y estado posterior|Observed en el ensayo independiente|Resultado|
|---|---|---|---|---|
|R01|PM-03/D023|500.01 + 500.00 = 1000.01; internal 500.005|PM-03 500.01+500.00 and exact internal 500.005|PASS|
|R02|D023|0.01+0.00 /0.02+0.01 /0+0 /500+500; exact money|zero and odd cent limits|PASS|
|R03|SM-EP-01/DM-INV031|Policy version, schedule, expected obligations, base/source snapshots retained|policy schedule obligations retain applied version chain and sources|PASS|
|R04|D020/AC042|Ordinary 50/50, balance lastAllowedDate 13|before threshold day12 ordinary|PASS|
|R05|D020/AC042|Ordinary 50/50 all day13|exactly day13 all local hours ordinary|PASS|
|R06|D020/AC023|100 percent before confirmation; one obligation|after threshold day14 requires100 before confirmation|PASS|
|R07|D020|100 percent before confirmation|service day20 requires100|PASS|
|R08|D020/AC042|Not expired|before balance day12 not expired|PASS|
|R09|D020/AC042|Not expired throughout day13|whole limit day13 not expired|PASS|
|R10|D020/AC042|Expired if uncovered; no charge/cancel/reconciliation|next local day14 expired without any charge/cancel/funds|PASS|
|R11|D020|Local date in applied zone; no universal Madrid|sourced NewYork zone determines local day|PASS|
|R12|D020|Civil dates, unchanged by elapsed hours|DST leap month year boundaries are civil|PASS|
|R13|AC041/D020|First contracted service20; no propagation of modality/night date|global first contracted service20 despite modalityB22|PASS|
|R14|AC041/D020|Override only identified scope; original default retained|explicit valid reference only its scope|PASS|
|R15|SM-EP-01|Affected scope blocked; no valid schedule fabricated|missing temporal reference blocks|PASS|
|R16|SM-EP-01|Affected scope blocked|zone or provenance missing blocks|PASS|
|R17|SM-EP-01|Affected scope blocked; no zero substitution|missing amount blocks no zero guess|PASS|
|R18|SM-EP-01|Affected scope blocked|missing policy/version blocks|PASS|
|R19|SM-EP-01|Reject; no economics on merely Ganada/Proposal/Acceptance|missing Booking/scope cannot use Proposal/Ganada|PASS|
|R20|SPEC-FR-ECON001|Independent valid schedule succeeds|localized missing source preserves independent obligation|PASS|
|R21|SPEC-FR-ECON001/DM-INV031|Original policy/ordinary calculation + decision/actor/moment/reason/result retained|authorized exception retains original policy actor cause moment result|PASS|
|R22|DM-INV031|Reject atomically|exception missing cause or authorization denied|PASS|
|R23|DM-INV031|Reject; no silent exception|customer integration AI payload cannot change dates/amounts|PASS|
|R24|PM-09/D023|Historical bases, versions and amounts identical|historical bases reconstruct after masters change|PASS|
|R25|AC025/SM-FORB14|No Customer Payment or funds|Expected never money received|PASS|
|R26|AC025/SM-FORB14|No reconciliation or credited payment|Expected/promised reference never reconciliation|PASS|
|R27|SM-EP-02|Pending; expected never verified portion|forecast payload never positive coverage|PASS|
|R28|SPEC-FR-ECON002|Zero verified coverage; partial/full contract pending H3-006|no funds integration all obligations remain pending|PASS|
|R29|SM-EP-04/D023|Append linked before/after; original debt and schedule retained|authorized correction keeps original debt cause history link|PASS|
|R30|SM-EP-04|Reject atomically|missing change cause authority amount fails atomically|PASS|
|R31|SM-EP-04|Reject unsupported input; no automatic debt|simple refund cannot generate new debt|PASS|
|R32|D023/PM08|Exact materialized difference; no double rounding|exact inverse without rounding original|PASS|
|R33|C03/G6|Same durable result; no extra obligation/history|same operation replay no new history|PASS|
|R34|C03/E2|Conflict; no effects|changed content same operation conflict E2|PASS|
|R35|C03/V-AT|One schedule/advance/balance/history; authorized durable replay|simultaneous same key one complete schedule|PASS|
|R36|C03/V-AT|One functional schedule; no duplicate components|different keys same functional obligation no duplicate|PASS|
|R37|C03/G6|Conflict without overwrite|stale revision no overwrite|PASS|
|R38|T06/V-AT|One succeeds, other conflict; original and one complete linked adjustment|concurrent adjustments one revision succeeds|PASS|
|R39|C03/V-AT|No partial effects|failure before first write no partial effects|PASS|
|R40|C03/V-AT|Entire dependent unit rolls back|each material insert failure rolls back dependent unit|PASS|
|R41|C03/V-AT|Entire unit rolls back|deferred failure at COMMIT rollback|PASS|
|R42|C03/V-AT|Durable result recovered, no duplicate|committed response lost replay durable result|PASS|
|R43|V-DAT|Denied|absent or forged signed contexts denied|PASS|
|R44|V-DAT|Denied|disabled/unprovisioned actor including read and replay denied|PASS|
|R45|V-DAT|Denied/no sensitive disclosure|wrong scope cannot disclose/replay|PASS|
|R46|V-DAT|Denied; FORCE RLS; least privilege|owners ACL FORCE RLS no ordinary DML|PASS|
|R47|V-DAT|Denied; immutable append-only|direct historical update delete denied including executor|PASS|
|R48|C02/C03/C06|No costs/margins/fees/internal economics; no unauthorized projection|no third party economic projection route|PASS|
|R49|V-MIG|Fresh install passes; owners/ACL/RLS/functions/policies/triggers verified|fresh migration installs tables policies functions with least ACL|PASS|
|R50|V-MIG|H0-H2 IDs/facts/snapshots/history/objects/roles/ACL retained|H2 fixture upgrade preserves all prior data objects IDs privileges|PASS|
|R51|V-MIG|Objects/grants rollback; H2 remains|failed migration objects ACL rollback and H2 remains|PASS|
|R52|V-MIG|Pass, no implicit public grants|migration with optional roles absent|PASS|
|R53|H2/Plan9|Remain Pending preparation and Pending; no provider confirmed|Booking and service states unchanged|PASS|
|R54|Tasks/Plan9|H0-H2 preserved; H3-003+ NOT STARTED; no hosted/Production|all historical migrations intact H3 only no future positive modules|PASS|
|R55|SM-EP-01|Fail closed, no partial/valid-looking economics|material null invalid numeric signed input fail closed|PASS|
|R56|SM-EP-01|No guessed proration; explicit authorized base required|specific service uses authorized exact base never guessed proration|PASS|
|R57|SM-EP-01/D020|Reject invented default; express reference needs authority|invented default reference rejected without legitimate express override|PASS|
|R58|SM-EP-01|Reject silent price alteration|accepted reproducible total cannot be silently changed|PASS|
|R59|DM-INV031|Applied historical version stays unchanged|revised current policy does not alter historical application|PASS|
|R60|T05/T06|No partial state; no funds locks fabricated, integration T05 pending H3-006|separate session cannot see partial schedule during uncommitted change|PASS|

## Contratos, migración y regresión

Regresión final fresca: **682/682 PostgreSQL17.11**, **86/86 unitarias**, **60/60 matriz H3-002**, **4/4 reproducciones históricas**, **1/1 focal H3-001**; total propio65/65. 0FAIL,0skipped,0cancelled. Instalación congelada/typecheck/lint/import boundaries/build/audit--prod PASS, sin vulnerabilidades conocidas. Diff-check y revisión de alcance/publicación documentados al final.

V-DOM/V-DAT/V-MIG ejecutados: fresh install de cadena completa, upgrade desde H2 con Booking/cadena/evidencias previas reales sintéticas, preservación de todas las filas/IDs/snapshots y OID/definiciones de tablas/funciones/policies/triggers/ACL/owners/roles anteriores; fallos de migración sin objetos/grants parciales y roles anon/authenticated ausentes. Nuevas7 tablas con14 policies y FORCE RLS,3 funciones con ACL/owners/search_path controlados; FK y triggers RI nuevos, sin reemplazo de los anteriores. SQL directo, actor deshabilitado/no provisionado, contexto/scope/firma falsificados y lectura/replay no autorizados se deniegan.30 migraciones históricas byte a byte y fuentes normativas sin modificar.

V-AT: dos sesiones autorizadas del mismo Administrador (no nuevo rol humano), misma clave, claves diferentes equivalentes/conflictivas, revisión obsoleta y cambios concurrentes; identidad funcional serializada desde raíz incluso sin hijos previos. Fallos antes del primer write, en todas las escrituras materiales, en ajustes/política/historia y fallo deferred al COMMIT; respuesta perdida después de COMMIT y replay real. Observador en conexión independiente no ve estado parcial. Deuda/original/historia/resultados se conservan íntegros.

Comandos exactos reproducibles desde el SHA probado: `pnpm install --frozen-lockfile`; `pnpm run typecheck`; `pnpm run lint` (incluye `check:boundaries`); `pnpm test`; `pnpm run build`; `pnpm audit --prod`; `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres`. Focal/formal: misma variable +`node --test --experimental-strip-types tests/integration/postgres-h3-001.test.ts tests/integration/postgres-h3-002.test.ts tests/integration/postgres-h3-002-defects.test.ts`. Repetición afectada F04: H2-011+H3-002+defects,100/100 PASS. Logs y resumen en `tests/fixtures/h3-002/*-a2bbcd0.log`, `regression-summary.json`; originales gzip/SHA256 en `raw-log-manifest.json`. Los dos logs de reproducciones H2 que el harness regenera se preservaron aparte y se restauraron byte a byte; sus originales no se sustituyen.

Referencia al [modelo de H3-001](evidence-TSK-H3-001.md): C02/C03/C06, B05/T06, separación obligación/movimiento y contrato T05. C06 positivo requiere hechos verificados H3-006: ninguna previsión alcanza coverage parcial/completa; productor/admisión no implementados aquí. Security Definer solo en API estrecha existente, R46/R49 prueban no bypass y ACL/contexto; ningún CRUD ordinario ni proyección para terceros.

## Pendientes y parada

**Pendiente de integración posterior:** H3-006, H4-021 y H6-005, cuando estén disponibles sus dependencias. T05 no integra ni asigna fondos en este bloque; conserva contrato y contorno de serialización para la tarea de fondos. T06/C03 aplica únicamente cada conjunto de efectos dependiente de la determinación o corrección de obligación. No hay Customer Payment, Reconciliation, Refund completo, facturación, fondos reales, proveedor confirmado, operación confirmada, conectores ni envíos reales. H0–H2 locales preservados; hosted H3/H2 no acreditados, Production no autorizada. PLAN-AUTH001–006 globales, PLAN-PENDING003 en parte abierta y todos los ARCH-PENDING/DM-PENDING/BR-PENDING vigentes conservados, incluidos DM-PENDING005 y BR-PENDING022/033; catálogo/tarifas/costes/capacidades, zona/referencias contractuales y prioridades/plazos reales siguen sin acreditar. No políticas reales de retención ni datos personales/comerciales reales.

Estado final: **H3 IN PROGRESS; únicamente TSK-H3-001/002 COMPLETED local/aislado. H3-003+ y H4–H6 NOT STARTED. STOP obligatorio tras H3-002; no iniciar ni preparar posteriores.**

## Coordinación previa a publicación

`coordination-check.json`: PASS.125 fichas; únicamente H3-001/002 cambian ejecución;74 futuras siguen NOT STARTED. Tasks §§6–7 idénticas, expected congelado intacto y hashes de FAIL originales verificados;30 migraciones históricas idénticas a la base. Dominio/migración/verificadores idénticos al SHA exacto probado a2bbcd0; después solo evidencia/coordinación y normalización de blancos de presentación de un log de build previo (original recuperable en Git), sin cambio de assertions/resultados. `git diff --check`: PASS. Fetch previo a publicar confirma origin/main aún en b60031e04ddaa6f2a442979edeb0d3a8dd6568a9. El SHA final del commit de evidencia se distingue del probado y se comunica tras push y comprobación de árbol limpio/HEAD==origin/main.
