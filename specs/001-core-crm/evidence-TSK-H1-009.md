# TSK-H1-009 — expected previo de cálculo monetario

Fecha: 2026-09-29. Base `e034560295fd6e316ae2d855fbffd2f63181d18c`, `main` limpio. Este expected se fijó antes de escribir el núcleo. Implementación publicada en `46aace3ef92b227ce5131bad5683e10d7863c2e6`. Estado final: **COMPLETED en alcance de dominio local/aislado** tras [TSK-H1-010](evidence-TSK-H1-010.md), R01–R20 PASS.

Fuentes APPROVED: Constitution P05/P06/P07/P20; BR-ECON-007, BR-PACK-004; Domain Model DM-INV-026/028/029; SPEC-FR-CAT-002, PROP-005, ECON-013/014, AC-011/047/049/085; Plan PLAN-DEC-006, §§5.2/10.8, PM-01–13; D019/D023/D028/D029/D032; Tasks TSK-H1-009/010 y §6. H1-005–008 aportan versiones estructurales, no oráculos de importe.

Expected del núcleo local, fijado antes del código:

| Caso | Entrada sintética explícita | Resultado exacto |
|---|---|---|
| PM-01 | 10.005 EUR | 10.01; delta +0.005 |
| PM-02 | 100.01 EUR final/persona × 10 | 1000.10; sin otro redondeo comercial |
| PM-03 | 1000.01 × 50 % | interno 500.005, anticipo 500.01, saldo 500.00 |
| PM-04 | 100.01 × 50 % | interno 50.005, devolución 50.01, retención 50.00 |
| PM-05 | 3 derechos independientes de 100.01 × 50 % | 50.01 por participación, total 150.03, bases 300.03, retenciones 150.00 |
| PM-06 | derecho fijado 50.01, salida 20.00 | pendiente 30.01; otra 30.01 agota, sin recalcular porcentaje |
| PM-07 | servicio fijo 900.00, asistentes cambian | 900.00 intactos; ningún precio/persona o prorrateo inferido |
| PM-08 | originales +500.01 y −20.00 | reversos −500.01 y +20.00, vínculo/motivo; sin redondear |
| PM-09 | config actual cambia o coste desconocido | reproducir PM-02–08 desde entradas/versiones retenidas; no usar latest ni convertir unknown en 0 |
| PM-10 | nuevo −10.005 | −10.01, delta −0.005; reversión sigue PM-08 |
| PM-11 | 100.00, partes iguales A/B/C, orden A-B-C | 33.34/33.33/33.33; residuo A |
| PM-12 | 0.05, pesos A/B/C 1/1/2 | internos .0125/.0125/.025, pisos .01/.01/.02, restos .0025/.0025/.005, residuo C, final .01/.01/.03 |
| PM-13 | −100.00 y −0.05, mismos órdenes/pesos | −33.34/−33.33/−33.33 y −.01/−.01/−.03; magnitud primero |

Invariantes: entrada monetaria decimal textual estricta; aritmética con enteros arbitrarios, nunca `number` para importes definitivos; medio céntimo por magnitud y signo; operación de reparto solo sobre total y pesos/orden explícitos; restos, versión, fuentes y diferencias conservados; suma exacta por alcance; unknown bloquea únicamente cálculo dependiente. Rechazar pesos/órdenes inválidos, importes mal formados y operaciones que requerirían datos fiscales o costes ausentes. No se crean políticas de precio, devolución, IVA, base contractual o asignación nuevas. La integración persistida H2–H4 queda pendiente.

## Observado H1-009

`src/domain/exact-money.ts` usa racionales de `bigint` con entradas decimales de texto. La materialización cuantiza a céntimos por magnitud, con empate hacia arriba, y aplica el signo al final. Las respuestas conservan fracción exacta y decimal cuando tiene expansión finita; si un reparto produce un tercio periódico, conserva numerador/denominador sin aproximación. El cálculo por participación, complementos por diferencia, reversión exacta y reparto por restos están separados. `captureCalculation` copia entradas/versiones y `reconstructCalculation` las reproduce sin consultar configuración actual. La selección manual retiene precio calculado y final junto a actor, fecha y motivo. Los bloqueos de datos materiales desconocidos se representan explícitamente; cero conocido permanece distinto de desconocido.

Focal `tests/exact-money-h1-009.test.ts`: **15/15 PASS**, cubre PM-01–PM-13 y casos negativos/límites indicados en la petición. No introduce dependencias ni persistencia. No usa tarifas, costes, impuestos o datos personales reales. Las versiones estructurales H1-005–008 pueden suministrar las referencias históricas en futuras integraciones; el núcleo no lee `latest`. H2–H4 deben integrar persistencia y autoridad de bases/derechos; estas pruebas locales no acreditan esos recorridos.

## Verificación de implementación

| Comprobación | Resultado |
|---|---|
| Focal H1-009 | 15/15 PASS |
| `pnpm install --frozen-lockfile` | PASS, lockfile sin cambios |
| `pnpm audit --prod` | PASS, sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS |
| `pnpm test` | 51/51 PASS, incluye 15 focales H1-009 |
| `pnpm run test:postgres` | 299/299 PASS en regresión acumulada H0/H1-001–008; H1-009 no modifica persistencia ni contratos PostgreSQL |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |

Sin Supabase hosted/Production, efectos externos ni datos reales. PLAN-AUTH-001–006 permanecen PENDING globalmente; H1 permanece IN PROGRESS. H1-011 y posteriores siguen NOT STARTED.
