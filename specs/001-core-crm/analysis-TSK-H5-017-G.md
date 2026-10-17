# H5-017/H5-018 — correctivo G, análisis causal e instrumentación

Fecha: 2026-10-17, Europe/Madrid. Datos sintéticos y PostgreSQL/Storage locales aislados. Este documento acredita los diagnósticos terminados; el dictamen completo y el sello se registran por separado una vez terminada la batería20.

## Fuente y límites

Encargo completo en `tests/fixtures/h5-017-g/request.txt`. ExpectedG escrito y sellado antes de implementar: `expected-TSK-H5-017-G.md` / `expected-seal.json`. Normas aprobadas y hashes en `normative-sources.json`: Constitution, Decisions, Business Rules, SM, Tasks§2.2/2.3, Plan§§7.1/8/11.2 y SPEC CHG006/008/009, HIST001/002, AC032/033/034/040/041/042. Las relaciones temporales y las reglas civiles D020 permanecen intactas.

El momento del hecho y el de registro son distintos. La evidencia usada para admitir una cancelación debe ser compatible con el acto; el contrato SQL recibido `payment_evidence` impone occurred_at<=at. No se fabrica una política nueva ni se relaja esa guarda. Los hechos históricos se registran por los contratos B07 ordinarios con actor real del entorno sintético; recorded_at/Auth/F1/F2 y reloj PostgreSQL permanecen reales.

## Causa H5-018-5-F01

`h4-cancellation-fixtures.ts` fija command.at y facts.at en2026-10-17T10:00:00Z. Su attest por defecto delega a `confirmationFixture.proof`, cuyo instante se captura mediante new Date() al construir conf. Después de ese límite produce evidencia posterior al acto; el rechazo E3 es correcto.

El comando reproduce el rechazo en01:103 casos recibidos,29 PASS/74 FAIL, incluidos los casos concurrentes. En02, H5-016 races da11 PASS/2 FAIL. Las trazas G de solo lectura registran instante de acto/evidencia, identidad sintética, respuesta y replay. No modifican comandos, respuestas, permisos, tiempos de espera ni estado.

## Adaptación mínima

El original es uno de los38.118 archivosF protegidos: no se edita. `h5-017-g-cancellation-fixtures.ts` es una copia derivada con dos cambios semánticos de instrumentación, comparables en `cancellation-fixture.diff`:

1. `attest` utiliza por defecto q.at para su evidencia, también al re-atestiguar. Conserva literalmente cualquier evidenceAt explícito; la evidencia posterior sigue produciendo E3.
2. En esa instancia de fixture, `conf.proof` dirige únicamente la familia `cancellation:` de pruebas auxiliares al acto sintético predeterminado17/10 10:00Z. Base administrativa, aprobación de ajuste y cláusula no reembolsable dejan de depender de conf.at real. El resto de familias delega al proof original, conservando sus precondiciones. Para un escenario con acto explícito diferente se aporta evidencia explícita de ese acto; no se infiere una política de cronología comercial universal.

Se preservan command.at, facts.at, fechas civiles, términos, sourceRef, contenido del claim, algoritmo hash, cobertura, tipo de enlace, identidades, revisión, permisos y cada aserción recibida. Producto y migraciones1–68 no cambian.

`h5-017-g-hook.mjs` carga primero el hookFv2 protegido y después sustituye exclusivamente la resolución de la URL del fixture de cancelaciones por el puente G. Todas las demás resoluciones pasan sin cambio. El puente usa G por defecto; el modo `H5017G_FIXTURE=original` sirve para la comparación causal. El padre del puente conserva su import original para evitar recursión. Los tests V09 de la quinta auditoría mantienen el original: su expected exige demostrar el rechazo heredado. El test temporal G importa directamente la adaptación. Estas exclusiones conservan los oráculos recibidos y no omiten casos.

La transición declara ruta/hash de original y derivado y justificación en `instrumentation-transition.json`. La adaptación es un archivo nuevo; ningún input recibido tiene transición de bytes.

## Diez controles temporales nuevos

Capturas04 y08:10/10 PASS en cada una, contadas como10 casos distintos y una repetición. Incluyen acto fijo y re-attest; evidencia anterior1ms/igual/posterior1ms y1día; evidencia histórica; prueba de otra determinación/reserva; familias auxiliares y aislamiento respecto a otras familias; construcciones en momentos reales distintos; actos civiles13/10 y18/10 independientes de la fecha real17/10.

Se verifican importe, retención, base, replay, una sola revisión, evidencia original inmutable, ausencia de nuevas determinaciones/operaciones ante rechazo y ausencia de movimientos financieros por la determinación. El control con importe200 mantiene los resultados civiles200/100/0 según13/17/18; no desplaza la fecha del acto para conseguir un importe.

En04 las construcciones reales G-T07 tienen11:42:50Z; en08,11:46:17Z. La evidencia de cancelación conserva10:00:00Z y el resto de pruebas mantiene conf.at real. No se intercepta Date, Date.now, timezone global, Auth ni reloj del OS/servidor. La independencia comprobada corresponde a la cronología de cancelación corregida; los diagnósticos históricos originales conservan su precondición explícita de ejecución después del límite, sin atribuirles independencia universal.

## Análisis individual de los ocho fallos pendientes

Las ubicaciones literales de test/aserción, resultados originales de quinta, datos de las dos ejecuciones actuales y clasificación están en `eight-failures-analysis.json`. Los ocho se clasifican como **consecuencia demostrada del fixture temporal**, con0 casos no concluyentes tras la comparación. No se obtuvo esa clasificación por la sola coincidencia de un mensaje.

| ID | Test original íntegro | Esperado original preservado | Evidencia actual |
|---|---|---|---|
| G-R01 | H4-014 C27 competing determinations with actual independent PG sessions 0,1 | one fulfilled, one REVISION_CONFLICT:E2; one revision and order-specific right | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R02 | H4-014 C27 competing determinations with actual independent PG sessions 1,0 | one fulfilled, one REVISION_CONFLICT:E2; one revision and order-specific right | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R03 | H4-014 C27 equivalent concurrent replay independent sessions 0,1 | two fulfilled responses; exactly one replay and one history revision | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R04 | H4-014 C27 equivalent concurrent replay independent sessions 1,0 | two fulfilled responses; exactly one replay and one history revision | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R05 | H4-014 C28 determination versus applied actual service date change 0,1 | both writes fulfilled in order0,1; cancellation becomes inapplicable after date change, accepted_detail preserved | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R06 | H4-014 C27 distinct identities competing overlapping participation rights 0,1 | one fulfilled, one PORTION_CONFLICT:E2; one determination | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R07 | H4-014 C27 distinct identities competing overlapping participation rights 1,0 | one fulfilled, one PORTION_CONFLICT:E2; one determination | 01-original-cancellation.stdout.log.gz → 05-corrected-cancellation.stdout.log.gz; FAIL → PASS. |
| G-R08 | H5-016 A03 close has read material before cancellation writes | writer fulfilled; joint close rejected as commercial pending; no joint history; both waits observed | 02-original-races.stdout.log.gz → 07-corrected-races.stdout.log.gz; FAIL → PASS. |

Los C27 mantienen las dos sesiones PostgreSQL bloqueadas realmente y ambos órdenes. Antes, las dos solicitudes contienen evidencia posterior y son rechazadas E3: las aserciones observan0 éxitos. Después se observa el resultado original: un éxito/un conflicto de revisión, dos éxitos/un replay, o un éxito/un conflicto de porción según el caso. C28 mantiene cambio de fecha, instantánea comercial aceptada y posterior invalidez de la determinación; no se altera su aserción r.every(ok).

En A03, el primer wait del cierre sí se observa. El segundo wait (:27:222) busca al escritor de cancelación esperando el bloqueo de preparación. Con el fixture original, cancellation_apply rechaza en la guarda de evidencia (migración20261005223726:105), antes del insert (:143). Por tanto no alcanza el trigger closure_material_lock / closure_writer (migración20261015204955:31–46) que toma booking_preparation_lock. La traza original registra E3 y el timeout de15s; no es prueba de un bloqueo perdido en el producto. Con G, la escritura alcanza el trigger, se observan al menos dos advisory waits y termina al liberar el cierre. El cierre sigue rechazado como commercial pending y no genera historia conjunta, conforme la aserción original. El plazo15s no cambia.

Comparaciones terminadas:05 cancelación103/103 PASS;07 races13/13 PASS. Todos estos casos vuelven a formar parte de la batería completa20, sin sumar resultados solapados.

## Incidencia propia conservada

Captura03:103 FAIL de inicialización, `pg_ctl: could not start server`. Se lanzó en paralelo con01 sobre los mismos puertos locales de H4-013/014. La ejecución no acredita resultados de dominio; se preservan stdout/stderr/status. Se corrigió únicamente la coordinación:05 se ejecutó tras terminar01, con los mismos archivos, aserciones y plazos;103/103 PASS. No se normalizó ni sobrescribió03.

## Selección y conservación

La selección20 mantiene los192 archivos recibidos de F y añade las tres suites de la quinta auditoría y una temporal G:196 archivos y2945 casos previstos,2920+15+10. Quince fases disjuntas, con los mismos aislamientos recibidos de puertos/plazos. Los27 archivos históricos no seleccionados siguen explicados por la selección recibida y `selection-audit.json` de quinta; no son exclusiones nuevas G. La nueva suite V09 que quinta ejecutó aparte se incorpora a la completa conservando su fixture original.

El runner G crea una réplica con bytes verificados y Git propio; los outputs antiguos solo se regeneran dentro de esa réplica. El postcheck debe comprobar workspace/réplica y esperar todos los workers antes de retirarla. Un test funcional PASS sin ese postcheck no acredita cierre. No se reutiliza como PASS actual la salida anterior2920 ni la quinta2630/303.

El preflight verificó38.271 archivos recibidos:38.118 F y153 de la quinta auditoría; sus bytes, tipos, tamaños y modos siguen protegidos. Sello de quinta dcd6a2ad70c72b6e22c52c95230155df76e775a47bb3b2a88d9fe3d025887dea. La quinta auditoría conserva FAIL. H5-016 mantiene455 inputs exactos y la única transición de composition anteriormente autorizada. No se modifica coordinación recibida ni se marca H5-017/H5-018 COMPLETED. DM-PENDING-005 OPEN. No publicación, aceptación, commit, push, deploy, datos de negocio reales ni tareas posteriores.
