# TSK-H1-019 — Salida de identidades, catálogo y cálculo

Fecha: 2026-10-01. Base comprobada tras fetch: `HEAD == origin/main == 4a1b47af25e87661ca3aa5783fd8157c4e58da7a`, rama `main`, árbol limpio. Alcance exclusivamente documental, local/aislado. No se implementa funcionalidad nueva ni se inicia H2.

## 1. Autoridad y criterio previo de cierre

Fuentes: ficha [TSK-H1-019](tasks.md#tsk-h1-019), Tasks §§2.2/6/7, [Plan §§9–10](plan.md), evidencias H0-018 y H1-001–018 enlazadas abajo, [PROJECT-STATUS](../../docs/PROJECT-STATUS.md), [NEXT-STEPS](../../docs/NEXT-STEPS.md). Decisiones aplicables ya citadas por esas evidencias: D019/D020/D023/D028/D029 para bases/cálculo/referencias, D037/D038/D039 para autoridad técnica y D040 para año/zona de códigos. No se modifica ninguna fuente normativa ni decisión.

Expected fijado para V-EVI: cada dependencia COMPLETED en su alcance con implementación y verificación vinculadas; matrices independientes finales PASS; ningún Fxx material abierto; migraciones versionadas sin reescritura histórica; regresión acumulada nueva PASS; capacidades de Plan §9 reconstruibles en aislamiento. Un PM fallido, versiones/códigos ausentes o permisos de evidencia incorrectos impiden el cierre afectado. El cálculo de dominio no acredita Refund real. El cierre no convierte pendientes globales en resueltos ni autoriza H2.

Tasks §6 no contiene filas asignadas directamente a H1-019 (comprobado sobre la sección completa). Se consolidan sus correspondencias mediante las nueve parejas de dependencias, sin inventar nuevas obligaciones funcionales. PT-01/PT-03/PT-07 se acreditan solo en sus partes de identidad/catálogo/cálculo H1; sus recorridos de contratación/economía/operación esperan H2–H5. C01–C04/C06 y T11 se conservan según la asignación concreta de cada pareja, sin declarar su integración global concluida.

## 2. Matriz de dependencias y capacidades

Todas las parejas siguientes están **COMPLETED local/aislado** en las fichas vigentes; cada implementación tiene evidencia formal separada. Las filas R corresponden a las matrices independientes originales, no a PASS heredados de focales. Entorno PostgreSQL: clústeres efímeros PostgreSQL 17, actores/sesiones/claves y datos sintéticos, inspección persistida desde otra conexión donde corresponde. Dominio: pruebas separadas sin framework/PostgreSQL. H0-018 aporta la base técnica aislada ya cerrada; su evidencia histórica y regresión H0 se conservan.

| ID / pareja / evidencia | Observed formal final | Capacidades acreditadas y entorno | Límites e integración futura |
|---|---|---|---|
| M01 — [H1-001](evidence-TSK-H1-001.md) / [H1-002](evidence-TSK-H1-002.md) | R01–R18 PASS; 4 pruebas formales | Contact, Organization y Group distintos; funciones/designaciones contextuales verificadas, interlocutor cambiante, procedencia e historia; incompletitud permitida sin autoridad inferida. PostgreSQL aislado. | Pagador/participante/aceptante independientes; Acceptance real y su integración H2-008 no acreditadas. Fusión se acredita en M02, no en esta pareja. |
| M02 — [H1-003](evidence-TSK-H1-003.md) / [H1-004](evidence-TSK-H1-004.md) | R01–R10 PASS; 4 contenedores formales | Resolución/fusión humana, archivo/restauración y ambos historiales; códigos OP/PR/RES/INC, búsqueda, contadores separados, no reutilización, año/zona D040. PostgreSQL aislado. | Contextos comerciales sintéticos no son Opportunity/Proposal/Booking/Incident reales. RES se integrará en nacimiento Booking SM-BK-01; cambios de fechas comerciales se comprobarán en sus hitos. |
| M03 — [H1-005](evidence-TSK-H1-005.md) / [H1-006](evidence-TSK-H1-006.md) | R01–R10 PASS; 2 pruebas formales | Service/Variant, categorías/atributos/recomendaciones, unidades/formas, Provider/Offering distintos y versiones exactas; snapshot histórico tras cambiar maestros. PostgreSQL aislado. | Catálogo/ofertas reales, disponibilidad temporal y recorridos de prestación no acreditados; H2/H4 integran consumo. |
| M04 — [H1-007](evidence-TSK-H1-007.md) / [H1-008](evidence-TSK-H1-008.md) | R01–R11 PASS; 2 pruebas formales | Tariff/Pack/Promotion y requisitos/capacidad/elegibilidad versionados; estados unknown/estimated/confirmed/real distintos, pack personalizado/promoción manual trazables; guardas dependientes y siete revisiones históricas. Dominio + PostgreSQL aislado. | Configuración no acredita disponibilidad, recepción documental ni confirmación. Tarifas/costes/fiscalidad reales e integración económica H2–H4 pendientes. |
| M05 — [H1-009](evidence-TSK-H1-009.md) / [H1-010](evidence-TSK-H1-010.md) | R01–R20 PASS; 5 pruebas formales | Decimal exacto mediante racionales/enteros de precisión arbitraria, materialización y repartos deterministas, componentes/restos/orden/versiones, precio final manual separado, PM-01–13. Dominio independiente. | No decide precio comercial, tratamiento fiscal, base ni derecho desconocidos; no Booking económica, fondos/recepciones o Refund operativos H2–H4. |
| M06 — [H1-011](evidence-TSK-H1-011.md) / [H1-012](evidence-TSK-H1-012.md) | R01–R18 PASS; 6 pruebas formales | Días civiles inclusivos y día límite completo D020, referencias por alcance, zona/fuente/versiones explícitas, reconstrucción, hora externa acreditada separada; DST y TZ del proceso. Dominio independiente. | Zona/referencia contractual real sigue pendiente; no fija parámetros de negocio/sesión ni integra vencimientos/cancelación operativos. |
| M07 — [H1-013](evidence-TSK-H1-013.md) / [H1-014](evidence-TSK-H1-014.md) | R01–R17 PASS; 5 pruebas formales | Document/Evidence/Communication distintos; original/derivado, vínculos/cobertura contextual, llamada manual, hechos envío/recepción/respuesta con prueba propia, procedencia/corrección sin reescritura. PostgreSQL aislado. | Adjuntar no acredita aceptación/pago/revisión. Referencias Proposal/autorización son estructurales; H2/H5 integran autoridades/envíos reales. Objetos físicos acreditados por M08. |
| M08 — [H1-015](evidence-TSK-H1-015.md) / [H1-016](evidence-TSK-H1-016.md) | R01–R20 PASS; 7 pruebas formales | Prepare/upload/accredit/link recuperables, bytes/digest/tamaño/media, versiones originales e Evidence fijada a versión, diagnóstico de huérfanos y reparación; descarga reautorizada antes/después. PostgreSQL + Storage oficial privado aislado real. | No hosted. URL nativa firmada sobrevive revocación Core hasta expirar: el contrato CRM no la entrega. Missing significa no recuperable por API, no prueba ausencia física. Límites/privacidad/TTL operativos, Auth y H6 pendientes. |
| M09 — [H1-017](evidence-TSK-H1-017.md) / [H1-018](evidence-TSK-H1-018.md) | R01–R20 PASS; 5 pruebas formales | Task mínima B07 pending, causa/contexto/alcance/objeto/efecto, Administrador CRM Actor, unknown/civil/instant/D020 explícito; deduplicación funcional, replay técnico, revisiones/historia atómicas. Dominio + PostgreSQL aislado. | Prioridad pendiente sin vocabulario inventado; unknown no vence ni acredita hecho. H4/H5 integran causas reales, ciclo/cierre/reapertura y coordinación; sin scheduler/Notification/conectores. |

## 3. Salida real frente a Plan §9 e histórico reconstruible

| ID | Expected de Plan §9 / contrato | Observed y alcance |
|---|---|---|
| S01 | B02: contexto, fusión humana, códigos | M01–M03 PASS: identidades/designaciones con origen y revisiones; resolución conserva origen/destino e historias; código/ID permanecen y no se liberan. C01/C03/T11 ensayados con conflicto, replay y rollback. |
| S02 | B05: configuración/versiones, unidades, tarifas/packs y cálculo con fuentes | M03–M06 PASS: referencias exactas y snapshots, versión comercial aplicada, entrada/base exacta, resultado interno/materializado/diferencia, algoritmo, pesos/restos/orden y referencia temporal retenidos. Cambio de maestros no reinterpreta histórico; unknown no es cero. |
| S03 | B07 temprano y historia | M07–M09 PASS: original/evidencia/documento/corrección con fuente/cobertura/actor/momentos; vínculo a versión exacta del objeto; Task pendiente y causa estructural/versionada reconstruibles. Conservación física y efectos Core separados recuperables. |
| S04 | Salida PT-01/PT-03/PT-07 aislada, sin catálogo real inventado | Nueve matrices formales finales y PM-01–13 documentados; regresión de cierre acumulada registrada en §6. Se conservan los expected originales y los FAIL históricos. |
| S05 | Integraciones posteriores delimitadas | H2–H6 NOT STARTED. No contratación completa, Acceptance integrada, Booking, economía operativa real, Refund real, confirmación de servicios, cambios/cancelaciones, coordinación H5 completa, cierre integrado, conectores reales ni hosted/Production. |

La reconstrucción se acredita por componente y contrato H1; **no** se declara un expediente Booking/economía/operación completo reconstruible. Las dependencias tempranas de H3/H4 están satisfechas documentalmente como componentes disponibles; sus dependencias de contratación, fondos, operación y pruebas integradas siguen pendientes. No se crean Lead/Opportunity, Proposal, Acceptance ni Booking.

## 4. PM-01–PM-13 — contraste documental de oráculos

Fuente: Plan §5.2, tabla PM-01–PM-13, D023/D028/D029 y trazabilidad §10.8. Evidencia: [H1-009](evidence-TSK-H1-009.md) y [H1-010](evidence-TSK-H1-010.md), R01–R13; ambas preservan entradas/resultados. H1-010 vuelve a comprobar valores literales externos. Aquí no se recalcula con una implementación nueva; se contrasta esa evidencia y se ejecuta la suite existente en la regresión.

| Oráculo | Expected documentado / observed acreditado | Resultado |
|---|---|---|
| PM-01 | 10,005 → 10,01; entrada retenida y diferencia +0,005 | PASS dominio local |
| PM-02 | Precio final por persona 100,01 × 10 = 1.000,10 | PASS dominio local |
| PM-03 | 1.000,01 × 50 %: interno 500,005; anticipo 500,01; saldo por diferencia 500,00 | PASS dominio local |
| PM-04 | Base 100,01: interno 50,005; devolución 50,01; retención por diferencia 50,00 | PASS dominio local |
| PM-05 | Tres participaciones independientes: 3 × 50,01 = 150,03; bases 300,03; retenciones 150,00, sin nominal obligatorio | PASS dominio local |
| PM-06 | Derecho fijado 50,01 − salida 20,00 = pendiente 30,01; segunda salida lo agota, sin reaplicar porcentaje | PASS dominio local |
| PM-07 | Total fijo/grupal 900,00 permanece al cambiar participantes, sin prorrateo | PASS dominio local |
| PM-08 | +500,01 → reversión −500,01; −20,00 → +20,00, enlace/motivo sin redondear | PASS dominio local |
| PM-09 | PM-02–08 reproducidos con mismas bases/versiones tras cambios; sin latest, unknown→0 ni compensar componentes | PASS dominio local |
| PM-10 | Nuevo −10,005 → −10,01, diferencia −0,005; magnitud y luego signo, distinto de reversión | PASS dominio local |
| PM-11 | 100,00 iguales A/B/C orden registrado: 33,34 + 33,33 + 33,33; residual a A | PASS dominio local |
| PM-12 | 0,05 pesos 1/1/2: internos 0,0125/0,0125/0,025; céntimos 0,01/0,01/0,02; restos 0,0025/0,0025/0,005; residual C; finales 0,01/0,01/0,03 | PASS dominio local |
| PM-13 | −100: −33,34/−33,33/−33,33; −0,05: −0,01/−0,01/−0,03; mismos restos/orden sobre magnitud antes del signo | PASS dominio local |

Sumar correctamente no prueba por sí mismo base/derecho correctos. Estas son entradas sintéticas explícitas y cálculo de dominio; fiscalidad/base material ausente bloquea solo el resultado dependiente. No se acredita anticipo, devolución, salida efectiva ni reversión económica real.

## 5. Migraciones y defectos históricos

Inventario H1 versionado en `supabase/migrations/`. Auditoría Git: para cada archivo se comparó el contenido actual con `git show` del primer commit que lo añadió: **siete de siete idénticos byte a byte**. La cadena H0/H1 se aplica desde cero y sobre fixtures anteriores en V-MIG de las suites existentes. La comparación desde la base previa a H1 `f9eed55a4331e9e0f9ba28aa74e20639006883a8` muestra solo estas siete adiciones, ninguna modificación histórica H0. No se modifica SQL ni una migración histórica en este cierre. Cálculo monetario/fechas civiles son dominio puro, sin migración propia.

| Migración | Commit de incorporación (abreviado) |
|---|---|
| `202609290001_h1_contextual_identities.sql` | `bb259a927872` |
| `202609290002_h1_merge_archive_codes.sql` | `5a9d545ce4e2` |
| `202609290003_h1_catalog_versions.sql` | `4e4aae9b5238` |
| `202609290004_h1_commercial_rules.sql` | `f4d51d21b7ab` |
| `202609300001_h1_evidence_communications.sql` | `f4725aa33721` |
| `20260930170533_h1_private_object_conservation.sql` | `818171bbbc91` |
| `20260930185257_h1_pending_business_tasks.sql` | `4f287c2ad02a` |

Defectos materiales de verificaciones anteriores, **todos CLOSED localmente**, con reproducer/expected/observed y reverificaciones conservados en sus evidencias originales:

- H1-004-F01/F02: búsqueda de código autorizada ausente y carrera archivo/referencia; corregidos y matriz completa PASS.
- H1-008-F01–F04: fases estimado/confirmado/real, elegibilidad objetiva, disponibilidad temporal y migración sobre roles históricos ausentes; corregidos y regresión completa PASS.
- H1-010-F01: referencia fiscal verificada tratada como importe decimal; distinción contractual y matriz completa PASS, sin acreditar fiscalidad real.
- H1-012-F01/F02: conversión con zona no acreditada y fundamento contractual inválido; matriz completa PASS.
- H1-014-F01: misma prueba de envío reutilizable para recepción/respuesta; pruebas propias y unicidad transaccional, matriz completa PASS.
- H1-016-F01: vínculo tras acreditación obsoleta; recuperación/verificación nueva de bytes al vincular, matriz completa PASS.
- H1-018-F01: campo horario extra aceptado en fecha civil; allowlists sin weakening, matriz completa PASS.

H1-002/H1-006 no registran Fxx material del producto. Fallos históricos de preparación de fixtures/harness permanecen en sus evidencias; no se convierten en FAIL productivos abiertos. H0-012-F01–F05 siguen CLOSED localmente bajo D039; no se altera F1/F2/TTE. Ningún defecto H1-019 nuevo identificado en la revisión documental.

## 6. Regresión nueva de cierre

Ejecución sobre la base indicada, con código/tests/migraciones sin cambios. PostgreSQL nativo 17 local efímero, runner oficial existente `scripts/test-postgres.mjs`; Storage oficial privado aislado fijado a `supabase/storage` commit `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, loopback/backend de archivos y credenciales sintéticas efímeras. Ninguna llamada hosted. No se acortan esperas de caducidad H0 ni se omiten pruebas.

| Gate | Resultado observado |
|---|---|
| `pnpm install --frozen-lockfile` | PASS; lockfile sin cambios |
| `pnpm audit --prod` | PASS; sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` / boundaries | PASS |
| `pnpm test` | 71/71 PASS; 0 failed/skipped/cancelled; 762,608667 ms; incluye PM y formal monetaria/civil previas |
| `POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres` | 330/330 PASS; 0 failed/skipped/cancelled; 396093,6535 ms; H0 acumulada y todas las focales/formales PostgreSQL H1 |
| `pnpm run build` | PASS; Next.js 16.3.6 |
| Búsqueda focal de secretos | PASS; patrones de claves privadas/tokens GitHub/Stripe/AWS en archivos versionados, sin hallazgos; no certifica ausencia universal de secretos |
| `git diff --check` y revisión de alcance | PASS; únicamente evidencia H1-019 y coordinación Tasks/PROJECT-STATUS/NEXT-STEPS |

No se añaden nuevas pruebas funcionales: la ficha exige V-EVI de consolidación, respaldada por matrices previas y regresión fresca completa. Las evidencias anteriores no se reescriben.

## 7. Pendientes y límites preservados

PLAN-AUTH-001–006 siguen **PENDING globalmente**; PLAN-PENDING-003 **PARTIALLY RESOLVED**. PLAN-PENDING-001/002/004 conservan sus resoluciones previas; PM ahora tiene prueba local, sin elevarla a acceso real. El subset histórico hosted database/F1 de PLAN-AUTH-006 y H0-M01/F1/M02 validado separadamente no acredita H1 hosted. H0-M03/M04/M05/M06 siguen NO ACREDITADOS hosted.

DM-PENDING-005 y BR-PENDING-022 siguen pendientes, junto con los pendientes fiscales/suplidos/Tararí/mandato aplicables, ARCH-PENDING-001/002 y demás pendientes heredados de Tasks §7. Datos personales/documentos/catálogo/tarifas/costes/capacidades/prioridades/plazos reales no acreditados. Zona/referencia contractual real pendiente: D040 resuelve solo códigos, no esa referencia. Límites de adjuntos/MIME/cuota/TTL operativo, privacidad, retención, anonimización/eliminación y eventual audio no se fijan por fixtures. Desconocido no es cero ni permiso ni compromiso.

H1 **NO ACREDITADO hosted**, Storage solo aislado; Production **NO AUTORIZADA**. Sin Auth/email/TOTP/dispositivos/papel/recuperación reales, UI, scheduler, Notification, conectores o efectos externos reales. H2–H6 **NOT STARTED**. D001–D040 y fuentes APPROVED intactas. Last Approved Commit documental D039 `3e3f47a1692290412a03cf14087c2c470b8cab90` se conserva; este commit técnico/documental de cierre no lo sustituye.

## 8. Conclusión

**PASS — TSK-H1-019 COMPLETED; H1 COMPLETED exclusivamente en alcance local/aislado.** Dependencias H0-018/H1-001–018 satisfechas en sus alcances; matrices finales y PM acreditados; regresión fresca completa PASS; ningún Fxx material abierto. H1-001–019 COMPLETED localmente. H2–H6 NOT STARTED. El punto de parada de esta autorización es H1-019; H2 requiere nueva instrucción humana y no se inicia ni prepara funcionalmente.
