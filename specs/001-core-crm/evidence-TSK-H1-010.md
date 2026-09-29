# TSK-H1-010 — matriz formal previa

Fecha: 2026-09-29. Base a falsar: `46aace3ef92b227ce5131bad5683e10d7863c2e6`, H1-009 publicado. Estado final: **COMPLETED en alcance V-DOM local/aislado**. Esta matriz se fijó desde las fuentes APPROVED antes de las assertions formales; no heredó PASS de los focales H1-009.

Fuentes: ficha TSK-H1-010 y Tasks §6; Plan §§3.2/5.2/10.8, PLAN-DEC-006, C02/PT-07; SPEC-FR-CAT-002, PROP-005, ECON-013/014, SPEC-NFR-013, AC-011/047/049/085; D019/D023/D028/D029/D032; BR-ECON-007/BR-PACK-004; DM-INV-026/028/029; Constitution P05/P06/P07/P20. Verificación asignada: V-DOM. No hay migración ni escritura PostgreSQL en H1-009.

Setup: pruebas de dominio separadas, sin reloj ni configuración actual, con datos sintéticos textuales en EUR. El oráculo compara cadenas/fracciones exactas, bases, versiones, restos, orden y signo. PASS exige resultado exacto y rechazo localizado para negativos; una mera suma coincidente no basta. La regresión previa no se hereda.

| Fila | Expected normativo y criterio PASS |
|---|---|
| R01 / PM-01 | 10.005 → 10.01; exacto 10.005 y delta +.005 retenidos. |
| R02 / PM-02 | Final/persona 100.01 × 10 = 1000.10; ninguna tarifa interna distinta reemplaza ese final. |
| R03 / PM-03 | 1000.01 × 50 % = interno 500.005, anticipo 500.01, saldo 500.00 por diferencia. |
| R04 / PM-04 | 100.01 × 50 % = interno 50.005, devolución 50.01, retención 50.00 por diferencia. |
| R05 / PM-05 | Tres participaciones independientes producen 3 × 50.01 = 150.03, bases 300.03, retenciones 150.00; no 150.02 agregado. |
| R06 / PM-06 | Derecho fijado 50.01 menos 20.00 = 30.01; salida posterior 30.01 agota, sin nuevo 50 %. |
| R07 / PM-07 | Fijo 900.00 permanece 900.00 al cambiar participantes; ningún prorrateo. |
| R08 / PM-08 | Reversiones +500.01→−500.01 y −20.00→+20.00 con vínculo/motivo, sin cuantización nueva. |
| R09 / PM-09 | PM-02–08 se reproducen con entradas/versiones históricas; configuración nueva y unknown no reinterpretan importes ni ajustan componentes. |
| R10 / PM-10 | Nuevo −10.005→−10.01, delta −.005; magnitud primero. |
| R11 / PM-11 | Igual 100.00 A/B/C registrado: 33.34/33.33/33.33, residuo a A. |
| R12 / PM-12 | 0.05 con pesos 1/1/2: internos .0125/.0125/.025, pisos .01/.01/.02, restos .0025/.0025/.005, extra a C. |
| R13 / PM-13 | Los repartos negativos son signo de R11/R12 sin alterar orden, pesos o restos. |
| R14 | Cero, no-half, half-cent positivo/negativo y números grandes: sin coma flotante, overflow ni HALF_EVEN. |
| R15 | Pesos no positivos, orden/ID duplicado o ausente y cadenas monetarias mal formadas se rechazan; peso cero no inventa destinatario. |
| R16 | Empate y mayor resto asignan solo céntimos residuales conforme a orden registrado; varios residuos suman exactamente al total. |
| R17 | Dato material unknown bloquea su resultado; cero comprobado sigue siendo cero; fiscalidad no verificada no se fabrica. |
| R18 | Precio final manual conserva calculado/final, actor, fecha y motivo; no ajuste comercial automático. |
| R19 | Cada cálculo conserva versión de algoritmo, entradas/versiones/configuración, signo, componentes y diferencia; replay histórico no consulta latest. |
| R20 | Núcleo de dominio independiente de framework/PostgreSQL; sin H2–H4, conectores, UI, D020 ni datos reales. |

Un defecto material se registrará H1-010-Fxx con expected/observed/reproducer, se corregirá sin cambiar esta matriz y se repetirá la comprobación completa.

## Observado frente al expected fijado

La suite separada `tests/exact-money-h1-010.test.ts` ejecutó **5/5 PASS** y contrastó R01–R20. Volvió a comprobar PM-01–PM-13 como valores literales de Plan, además de céntimos residuales múltiples, orden cambiado, tamaño grande, cadena mal formada, fiscalidad/coste desconocidos y precio manual con actor/motivo. Reprodujo registros históricos con referencias a versiones retenidas después de presentar una versión actual distinta. `MONEY_ALGORITHM_VERSION` se conserva en el registro.

| Filas | Observado |
|---|---|
| R01–R06, R10 | Importes/deltas internos exactos y complementos por diferencia; derecho por participación 150.03 y pendiente 30.01. |
| R07–R09 | Fijo 900.00 invariable, reversos exactos enlazados, registros PM-02–08 reconstruidos sin consulta a latest. |
| R11–R13, R16 | 33.34/33.33/33.33; 0.01/0.01/0.03 con internos y restos exigidos; signo negativo aplicado después; dos residuos y orden de entrada distinto comprobados. |
| R14–R15, R17–R18 | Cero, half-cent, no-half y magnitud > 2^53 reproducidos; entradas/pesos/órdenes inválidos rechazados; unknown bloquea, cero conocido se conserva; final manual separado. |
| R19–R20 | Versión y referencias conservadas en snapshot; replay determinista; módulo sin imports de framework/PostgreSQL ni `parseFloat`, `Math.round` o `toFixed`. |

**H1-010-F01 — CLOSED localmente.** Fuente: SPEC-FR-ECON-014, DM-INV-029, AC-049 y matriz R17. Expected: un importe monetario conocido se valida como decimal y una referencia sintética de tratamiento fiscal ya verificado puede permanecer textual; `unknown` bloquea únicamente el cálculo dependiente. Observed inicial: `requireKnownMoneyFacts` intentaba analizar `fixture-tax-treatment-v1` como decimal y rechazaba toda referencia fiscal conocida. Reproducer: assertion formal R17 en `tests/exact-money-h1-010.test.ts`, ejecución inicial 4/5 PASS y `MONEY_INPUT_INVALID` en esa fila. Materialidad: el contrato no podía representar un tratamiento fiscal conocido sin un importe falso. Corrección localizada: distinguir `kind: money` de `kind: verified_reference`, conservando validación decimal y rechazo de vacío/unknown literal. Focal H1-009 15/15 y **matriz formal completa H1-010 5/5 PASS** tras la corrección, sin cambiar expected. No queda Fxx material abierto. Esta referencia es un identificador de prueba; la verificación real del tratamiento sigue fuera de este núcleo.

La integración persistida con propuesta, fondo, pago o Refund y sus permisos sigue asignada a H2–H4. Datos, fiscalidad y costes reales no acreditados. La verificación H1-010 es V-DOM local/aislada, no prueba de Supabase hosted ni de Production.

## Gates acumulados

| Comprobación | Resultado |
|---|---|
| Focal H1-009 | 15/15 PASS |
| Formal H1-010 | 5/5 PASS, R01–R20 |
| `pnpm install --frozen-lockfile` | PASS |
| `pnpm audit --prod` | PASS, sin vulnerabilidades conocidas |
| `pnpm run typecheck` | PASS, repetido secuencialmente después del build |
| `pnpm run lint` | PASS |
| `pnpm test` | 56/56 PASS |
| `pnpm run test:postgres` | 299/299 PASS, 0 fallos/omitidos/cancelados, 396501 ms; H0 y H1-001–008 intactos |
| `pnpm run build` | PASS |
| `git diff --check` | PASS |

Una primera invocación de `typecheck` corrió en paralelo con `build` y encontró un archivo temporal `.next/types` mientras el build regeneraba el directorio. Repetida secuencialmente, pasó; no hubo cambio de producto ni de expected.
