# Evidencia independiente — TSK-H2-010

Base `fd1c1e1b06bffbef786383e98827ade4b13c919d`. Expected [expected-TSK-H2-009-010.md](expected-TSK-H2-009-010.md) congelado antes de38793e677368008193ad785862e2f8b9d5cdef3a; R61–R66 fijados antes de ensayarlos. Todas las filas Tasks §6 copiadas. PostgreSQL17.11 aislado en cluster nuevo crm_h2_010:55483, reproducer histórico cluster crm_h2_010_hist:55484, datos sintéticos, runtime sin owner/BYPASSRLS. Node24.21.0/pnpm11.19.0/Supabase CLI2.118.0.

## Resultados históricos

Primer intento formal first-formal-38793e6.log:51/60 PASS,9 FAIL de fixtures: revisión Opportunity omitida tras T02 (R03), verify reutilizaba campos inmutables de register (R18/22/23/24/25/26/49), designación H1 usaba expectedVersion0 en contexto versión1 (R28). Expected intacto, corregidos los inputs para construir los orígenes normativos. Segundo intento second-formal-38793e6.log:60/60 PASS. Typecheck-verifier-development FAIL por array implícito, corregido tipo explícito sin cambiar expected.

### F01 — duplicado nominal de identidad conocida

Expected previo R61/DM-INV015/SPEC-FR-SVC004: el mismo Contact verificado no cuenta como dos personas dentro del mismo alcance nominal. Observed sobre producto38793e6: dos Participant IDs enlazados al mismo Contact pasan alta; `Missing expected rejection`. Material: duplicado de identidad y recuento nominal. Original F01-original-38793e6.log, SQL booking-38793e6.sql.txt y verifier-F01-original.ts.txt conservados. Corrección: índice único parcial Booking/Contact en Participant; una persona reutiliza la misma entidad para sus asignaciones. No deduplicación por nombre/canal ni inferencia de identidades desconocidas.

Nueva ejecución completa third-formal-corrected.log:66/66 casos normativos +1/1 reproducer histórico PASS;0FAIL/skipped/cancelled. V-DOM/DAT/MIG/AT/SM/NEG/EVI ejecutados: normativa, ACL/FORCE RLS/direct SQL/falsificación/actores, migración vacía/predecesor/fallo/roles opcionales, replay/carreras/dos sesiones, fallos todos los puntos T03 incluyendo noches/nominal/COMMIT y composición directa T01/T02/T03. El reproducer aplica SQL original y exige el FAIL normativo original, no adapta expected al defecto. F01 corregido, cierre definitivo pendiente de commit probado y regresión.

Regresión completa PENDIENTE. Matriz final por caso y commit probado se anexan después de ejecución fresca. Ningún cierre todavía en Tasks. H2 IN PROGRESS, H2-011+/H3–H6 NOT STARTED; pendientes globales conservados; hosted H2 no acreditado/Production no autorizada. Sin módulos/efectos positivos económicos/operativos/externos ni datos reales. Origen IA se deniega: el ensayo de G3 no acredita nueva automatización sensible ni habilita acciones H5/H6; Administrador manual y Acceptance real siguen siendo hechos distintos.

## Matriz sobre candidato4aa784ce2ccec3fd11a7f8989922063ac1c7355d

66/66 +1/1 histórico PASS,0fallos/omisiones/cancelaciones. Regresión81/81 unitarias y gates install/typecheck/lint/boundaries/build/audit PASS; runner PostgreSQL en curso, no cierre todavía.

|Rxx|Expected previo|Observed/assertions reales|Resultado|
|---|---|---|---|
|R01|Una Booking Pendiente de preparación, cadena y detalle íntegros.|normal valid chain exact immutable Booking|PASS|
|R02|Mismas invariantes, sin Lead/envíos ficticios.|direct reuses existing real chain without Lead or fake sends|PASS|
|R03|T01/T02/T03 atómicos; falta de acuerdo permite preparación, no Booking.|direct composes real T02 then T03 atomically; missing agreement retains preparation|PASS|
|R04|UNIQUE Opportunity, no segunda raíz.|uniqueness at database boundary|PASS|
|R05|Resultado íntegro único o reconocimiento/conflicto.|concurrent same keys both dispatch orders|PASS|
|R06|Una Booking íntegra; equivalente reconoce, contenido distinto conflicto.|concurrent different keys both dispatch orders|PASS|
|R07|Identidad/código/detalle/historia conservados.|exact replay retains root code detail and history|PASS|
|R08|Resultado durable recuperado sin efecto segundo.|committed result survives lost response|PASS|
|R09|Conflicto E2, cero mutación.|changed replay conflicts E2|PASS|
|R10|No Booking; preparación preservada.|unverified Acceptance no Booking|PASS|
|R11|No Booking, no inferencia textual.|textual Ganada cannot substitute exact chain|PASS|
|R12|No conversión indebida; original/reevaluación conservados.|rectified Acceptance does not permit conversion|PASS|
|R13|Solo A; B intacta.|exact modality A leaves B uncontracted|PASS|
|R14|Solo línea aceptada.|exact selectable line only|PASS|
|R15|Nueva versión previa obligatoria; no alta.|no unselected/nonselectable part sneaks into Booking|PASS|
|R16|Rechazo atómico.|wrong version and terms reject atomically|PASS|
|R17|Pendiente/preparación, ninguna raíz incompleta.|incomplete detail no fictitious complete Booking|PASS|
|R18|Rafting10/cena12/noche1=12/noche2=10, una Booking, contribuciones trazables.|AC017 rafting10 dinner12 nights12/10 with contributions|PASS|
|R19|No prestaciones excluidas.|exact inclusions only no extra contribution|PASS|
|R20|Prestaciones distintas; no unión por catálogo.|same catalog does not merge incompatible prestations|PASS|
|R21|Cobro/asistentes/certeza separados, sin inferencia personas×noches.|unit and quantity remain distinct from estimated attendees|PASS|
|R22|Ocupación/certeza/calculo propios, sin reparto habitación obligatorio.|night occupancy independent no rooms or person-night pricing inferred|PASS|
|R23|4 explica parte de12; no16 ni8 participantes ficticios.|partial nominal4 explains12 without double count or fictitious8|PASS|
|R24|Bloqueo únicamente nominal dependiente.|nominal necessity required|PASS|
|R25|No asociación tácita.|unverified Contact cannot become verified Participant association|PASS|
|R26|No doble asignación en mismo alcance.|duplicate nominal assignment rejected|PASS|
|R27|Organization/Contact/aceptante/payer/actor/Participant distintos, sin permisos internos.|accepter and actor not nominal participants by default|PASS|
|R28|Cadena histórica original intacta.|changing Primary Contact preserves Acceptance and Booking chain|PASS|
|R29|Rollback integral, preparaciones previas preservadas.|fault identity_contexts material write rolls back all|PASS|
|R30|Cero raíces/códigos/hijos/historia/resultados parciales.|fault b04_services material write rolls back all|PASS|
|R31|Rollback T03.|fault b04_contributions material write rolls back all|PASS|
|R32|Rollback T03.|fault b04_modalities material write rolls back all|PASS|
|R33|Rollback T03.|fault b04_contributions material write rolls back all|PASS|
|R34|Rollback T03.|fault b04_history material write rolls back all|PASS|
|R35|Rollback T03.|fault b04_operations at COMMIT rolls back all|PASS|
|R36|Serialización/versión; no overwrite.|concurrent revision change rejects stale conversion|PASS|
|R37|Orden consistente; conversión nunca sobre rectificación previa.|rectification first prevents conversion; original never erased|PASS|
|R38|Fail closed.|no trusted auth context or null SQL envelope|PASS|
|R39|Fail closed, firmas/scope actuales.|forged context and signature fail closed|PASS|
|R40|Denegado inclusive replay.|disabled and unprovisioned actor including replay|PASS|
|R41|ACL/RLS mínimos; no CRUD arbitrario.|ordinary SQL roles ACL/FORCE RLS and authorized direct SQL|PASS|
|R42|Direct update/delete denegados, conexión independiente visible.|append-only immutable facts visible independently|PASS|
|R43|Asignación/corte anual Madrid, único/inmutable; no segundo generador.|RES reuses H1 allocator Madrid year stable replay|PASS|
|R44|Cadena completa instala objetos esperados.|empty database full migration chain|PASS|
|R45|IDs/identidades/códigos/evidencia/Tasks/Version/Acceptance/ACL intactos.|predecessor upgrade retains all prior fixtures|PASS|
|R46|Sin objetos/privilegios parciales.|migration fault rolls back objects and privileges|PASS|
|R47|Funciona presentes/ausentes; no error por rol ausente.|optional anon/authenticated roles absent migration|PASS|
|R48|Intento inferencia SM-FORB04 no confirma operación ni concilia fondos.|SM-FORB04 tempting Ganada cannot confirm or reconcile|PASS|
|R49|Intento SM-FORB10 no sobrescribe cantidades/noches/deuda ni inventa modalidad.|SM-FORB10 global quantity/gratuity cannot overwrite scope|PASS|
|R50|SM-FORB31 rechazado, una Booking.|SM-FORB31 split/merge or second distinct Booking rejected|PASS|
|R51|Ningún Payment/fondos/conciliación/Refund/factura.|no Payment funds reconciliation Refund invoice|PASS|
|R52|Ninguna confirmación/disponibilidad/ejecución.|no provider availability confirmation execution|PASS|
|R53|Sin conectores/Communication/Lead/Proposal/Acceptance/HA fabricados.|no fake Lead Proposal Acceptance Communications Human Approval or external effect|PASS|
|R54|Invalidar cada guarda material, rechazo/pending sin efectos.|SM-BK01 each material guard withdrawn|PASS|
|R55|Invalidar procedencia/servicio/unidad/cantidad/noches, rechazo sin efectos.|SM-BS01 each source detail guard withdrawn|PASS|
|R56|G3 deniega, Human Approval no sustituye Acceptance.|AI creation without exact Human Approval denied G3|PASS|
|R57|Snapshots/referencias retenidos, no reinterpretación.|retained sources after catalog change not reinterpreted|PASS|
|R58|C01 retorna alcance mínimo; reautoriza resultado previo.|authorized C01 read reauthorizes result|PASS|
|R59|Todos conservados; regresión completa sin debilitar.|H1/H2 historical migrations unchanged and previous persisted fixtures retained|PASS|
|R60|No cierre H2/H6/E2E/pendientes/hosted/Production.|scope limits no future operation economy external module|PASS|
|R61|Dos Participant IDs vinculados al mismo Contact verificado en el mismo alcance nominal no pueden contar dos veces a la misma persona; rechazo/revisión atómica.|duplicate known Contact identity must not count as two Participants|PASS|
|R62|Organization, pagador contextual no participante y aceptante H1 separados; cambios de interlocutor no reescriben cadena ni conceden permisos.|Organization and payer contextual stay distinct from participant and internal actor|PASS|
|R63|Fallos reales durante noches/ocupaciones/participantes/asignaciones hacen rollback integral.|actual nights occupancy participant assignment fault rollbacks|PASS|
|R64|Directa compone nueva Proposal/Version, emisión y Acceptance reales más Booking en T03; fallo tardío no conserva esos efectos nuevos.|direct composes T01 T02 T03 same commit with full late rollback|PASS|
|R65|Nueva clave con contenido distinto concurrente: solo un resultado íntegro, otro conflicto; dos sesiones autorizadas sin hijos previos.|distinct conflicting keys two authorized sessions both orders|PASS|
|R66|Revisión/estado material cambiado y envejecimiento de referencias no se sobrescriben; FK/snapshots/ACL/funciones previas preservados por upgrade.|actual stale revision plus FK and historical source invariance|PASS|

## F02 — fallo material del harness de inventario histórico

Runner completo sobre4aa784c: FAIL de R54 H2-008 y wrapper histórico H2-008. Su inventario vivo incluía la nueva migración H2-009 al contrastar git base d333f14 (anterior a Acceptance); ese archivo no existía entonces. Log postgres-4aa784c.log íntegro conservado. Defecto de harness, sin fallo de producto ni modificación de expected comercial. Corrección: inventariar archivos estrictamente anteriores a acceptanceMigration y exigir exactamente las28 originales en R54; ninguna comparación de bytes/ACL retirada. Wrapper adapta exclusivamente esa selección en su copia temporal, mantiene intacto el artefacto histórico verifier-defects.ts.txt y todos sus expected/assertions/R56/R57/55PASS2FAIL. Nueva comparación de las29 migraciones previas de H2-010 se mantiene en R66 contra fd1c1e1. Se repiten matrix y regresión completa contra siguiente commit.

F02 expected: las migraciones de la base histórica siguen byte a byte y con ACL; observed: R54 intenta exigir a la base anterior una migración futura y rompe también el reproducer. Materialidad: bloquea la acreditación de la regresión. Original legacy-R54-4aa784c.ts.txt y FAIL postgres-4aa784c.log preservados. Reproducer específico ejecuta R54 original contra inventario actual y exige el fallo original, manteniendo su expected. Estado pendiente de repetición completa.

Diffcheck previo a siguiente commit detectó únicamente blanco final/trailing spaces de outputs. Originales completos comprimidos antes de normalizar exclusivamente esos espacios de presentación; hashes/raw-log-manifest.json recuperan bytes originales. Los FAIL no se sustituyen: ningún mensaje/caso/expected/assertion retirado. Diffcheck se repite antes de publicar.
