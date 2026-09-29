# TSK-H1-012 — matriz formal previa V-DOM

Fecha: 2026-09-29. Base a falsar `f79beca9fdd686715a894c69bae961bc7fabd7ee`. Estado final: **COMPLETED en V-DOM/V-NEG local/aislado**. Esta matriz se fijó desde fuentes APPROVED antes de escribir assertions formales; los PASS focales H1-011 no fueron oráculo.

Fuentes: ficha H1-012 y Tasks §6–7; D020; Plan §§5.2/8/10.8; SPEC-FR-CHG-009, ECON-002, COORD-003, §11.2, AC-033/039/041/042/043/076; BR-PAY-002, PAX-008, TASK-005, CHANGE-007; DM-INV-031/038/039; SM §2.4, EP-01/03, TA-04, RF-02, FORB-33; Constitution P05–P07/P20. Protocolo asignado: V-DOM y V-NEG para SM-FORB-33. V-MIG solo si hay persistencia; H1-011 no la añade.

Setup: fechas, instantes, zonas y referencias sintéticas explícitas. No se usa hora/zona del equipo como fuente. PASS requiere resultado exacto, alcance correcto, historia/versión y rechazo de ausencia o contradicción material; sumar días en horas o usar configuración ambiental es FAIL.

| Fila | Expected y criterio PASS |
|---|---|
| R01 | Referencia servicio 20: fecha 13 = 7 días civiles, intervalo ≥7 completo. Fechas 12/14 a lados distintos. |
| R02 | Misma referencia: fecha 17 = 3 días civiles, intervalo ≥3 y <7 completo. Fechas 16/18 a lados distintos. |
| R03 | Saldo debido fecha 13: no vencido durante todo 13; vencido desde fecha 14 si impagado, sin corte horario ficticio. |
| R04 | Cambiar hora de servicio o acto dentro de la misma fecha local no altera intervalo; cruzar medianoche local sí puede reevaluar. |
| R05 | Instante cercano a medianoche UTC se convierte usando zona contractual acreditada; no se usa UTC/Mac como sustituto. |
| R06 | Zona ausente/incorrecta bloquea conversión dependiente; `Europe/Madrid` no se infiere de D040. Fuente y versión de zona retenidas. |
| R07 | Global Booking 20, modalidad B 22, noche 23, servicio propio; selección exacta por alcance e ID. |
| R08 | Referencia contractual expresa válida prevalece solo para el alcance identificado. Cifra/umbral específico no se propaga. |
| R09 | Cambio de referencia 20→22 produce nueva evaluación con antes/después, actor, motivo, momento, fuentes y versiones; anterior intacta. |
| R10 | Un cambio solo de hora que conserva fecha local mantiene resultado; no reescribe historial. |
| R11 | Primavera y otoño DST no alteran diferencia civil; ensayos sobre fechas que incluyen días de 23/25 horas. |
| R12 | Fin de mes, fin de año y 29 de febrero válido calculan días exactos. |
| R13 | Fecha imposible, formato ambiguo, zona/instante inválidos son rechazados. |
| R14 | Deadline horario externo solo con fecha, hora, zona, instante, fuente y alcance compatibles; expiración por instante acreditado separada de D020. |
| R15 | Ausencia de hora externa no crea deadline horario; límite civil conserva día completo. |
| R16 | Cálculo de dominio no decide cobro, cancelación, importe ni confirmación; no implementa integración H3/H4/H5 ni sesión D025/D026 30/7. |
| R17 | Reejecución de los mismos datos/versiones da mismo resultado; versión de algoritmo retenida. |
| R18 | Intentos de usar referencia de otro alcance, doble contractual o datos desconocidos fallan sin efecto parcial (SM-FORB-33). |

Si aparece defecto material: H1-012-Fxx con expected, observed, reproducer, materialidad, corrección y reverificación, sin modificar este expected.

## Defectos detectados

**H1-012-F01 — CLOSED localmente, R06.** Fuente: Constitution P05/P06, Plan §5.2, D020 y R06. Expected: ninguna conversión dependiente acepta una zona sin procedencia y versión verificables. Observed inicial: `dateAtInstant` aceptó un objeto `ZoneEvidence` construido directamente con `sourceRef: ""`; la suite formal dio 5/6 PASS y falló por ausencia de excepción. Reproducer: assertion R05–R06 en `tests/civil-time-h1-012.test.ts` con `{...zone, sourceRef: ""}`. Materialidad: una entrada del API público podía eludir la guarda del constructor y producir una fecha con procedencia incompleta. Corrección: validar fuente, versión y zona en la conversión misma. Reverificación completa: 6/6 PASS sin cambiar expected.

**H1-012-F02 — CLOSED localmente, R18.** Fuente: D020, SPEC §11.2, SM-FORB-33 y R18. Expected: la prioridad contractual solo existe para la base `express_contract` válida; una etiqueta material desconocida se rechaza. Observed inicial: `civilReference` aceptó `basis: "unverified"` mediante una entrada JavaScript/JSON ajena a la garantía estática de TypeScript; suite formal 5/6 PASS. Reproducer: assertion R07–R10/R18 en `tests/civil-time-h1-012.test.ts`. Materialidad: una base de referencia no válida podía entrar en la selección y alterar la aplicación de la precedencia contractual. Corrección: validar `basis` en el constructor. Reverificación completa: 6/6 PASS sin cambiar expected.

## Observado frente a R01–R18

`tests/civil-time-h1-012.test.ts` ensayó la matriz de forma separada y dio **6/6 PASS**. R01–R04: días 12/13/14 y 16/17/18, mismo día a distintas horas y vencimiento solo desde 14. R05–R06: un instante UTC cercano a medianoche produce fecha contractual distinta; ejecutar en procesos con `TZ=UTC` y `TZ=Asia/Tokyo` conserva el mismo resultado explícito. R07–R10/R18: global 20, modalidad 22, noche 23 y servicio propio no se confunden; override contractual localizado, historial antes/después y rechazos sin efecto parcial. R11–R13: cambios de 23 y 25 horas, fin de mes/año, bisiesto y fechas inválidas. R14–R15: horario externo acreditado compatible y límite civil completo separados. R16–R17: módulo puro, sin sesión 30/7 ni persistencia; replay exacto con versión de algoritmo y procedencia.

Ningún Fxx material permanece abierto. D020 no autoriza uso de zona/referencia real sin procedencia acreditada. No hay migración ni prueba hosted; H3-002/H4-014/H5-012 conservan las integraciones persistidas. Production no autorizada y PLAN-AUTH-001–006 sin cambios.

## Gates locales

| Comprobación | Resultado |
|---|---|
| Focal H1-011 | 5/5 PASS |
| Formal H1-012 | 6/6 PASS, R01–R18 y V-NEG |
| `pnpm test` | 67/67 PASS |
| `pnpm run typecheck` | PASS |
| `pnpm run lint` | PASS |
| `pnpm run build` | PASS |
| `pnpm audit --prod` | PASS, sin vulnerabilidades conocidas |
| `pnpm run test:postgres` | 299/299 PASS, 0 fallos/omitidos/cancelados, 399290 ms; regresión acumulada H0/H1-001–008 |
| `git diff --check` | PASS antes de publicar |
