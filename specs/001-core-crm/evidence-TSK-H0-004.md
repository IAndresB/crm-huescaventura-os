# Evidencia — TSK-H0-004

Estado: COMPLETED en su alcance de comprobación normativa formal
Fecha de ejecución: 2026-09-15
Tarea: TSK-H0-004 — Verificar: Componer servidor modular y resultados C01–C06
Entorno: Work Local Mac, macOS 26.5.2 (arm64), repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Commit base comprobado: `eff54d773dc710094470f78458883d22ffe98fef`
Commit final probado y publicado: el commit único que contiene este archivo, recuperable con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-004.md`; su igualdad con `origin/main` se comprobó después del push.

## 1. V-EVI, alcance y método

Se contrastó TSK-H0-003 contra Constitution → Product → Business Rules → Domain Model → State Machines → Architecture → SPEC → Plan → Tasks → evidencias H0-002/H0-003 → código. La evidencia H0-003 se trató como afirmación a refutar. Fuentes directas: Plan §§3.2/4/6.5/7.1, B01/B10, C01–C06, G1–G6, E1–E8; SPEC-FR-ERR-001, SPEC-FR-SEC-005, AC-072, AC-082; y filas §6/puertas §7 asignadas.

Método V-EVI: caso sintético positivo y negativo, expected normativo, observed ejecutado y PASS/FAIL. No se usaron datos, credenciales ni proveedores reales. Los dobles prueban contratos y control de flujo, no Auth, persistencia, atomicidad PostgreSQL, RLS ni entrega externa.

Versiones observadas: Node.js 24.21.0; pnpm 11.19.0; Next.js 16.3.5; TypeScript 7.0.2; React/React DOM 19.3.0.

## 2. Matriz C01–C06

| ID | Obligación | Caso positivo | Caso negativo | Expected | Observed | Resultado |
|---|---|---|---|---|---|---|
| C01 | Autorizar antes de leer; proyección mínima con procedencia/certeza; sin salida fuera de alcance | Contexto+G1 válidos, puerto devuelve solo ID sintético | G1 ausente | Una lectura; denegado no llama al puerto | Proyección exacta; contador de puerto permanece 1 | PASS |
| C02 | Decisión síncrona de dominio, sin framework/SDK, escritura ni efecto externo | Estado `v1` produce cambio permitido | Guardas/contexto inválidos impiden decidir | Decisión pura y aislada | Callback síncrono ejecutado una vez; imports de dominio limpios | PASS |
| C03 | Una unidad representable con cambios, historia, resultado e intención; transporte no transacciona | Doble recibe unidad completa con versión | Guarda inválida impide `commit` | Delegar al puerto sin afirmar PostgreSQL | Unidad exacta observada; solo doble sintético | PASS |
| C04 | Adjuntar no confirma; verificar exige acto explícito válido | Sin revisión → candidate; revisión completa → verified | Revisor vacío/fecha inválida | No verificación implícita ni llamada al puerto inválida | Candidate/verified separados; inválido E3 y sin registro | PASS |
| C05 | Separar intención, intento, resultado acreditado e incertidumbre; no ejecutar proveedor | Unión cerrada cubre cuatro etapas; resultado conocido aplicado | Resultado incierto | Incierto E4, nunca éxito/fallo conocido; ningún proveedor | Estados distinguibles; intent/attempt pendientes, result aplicado, uncertain E4 | PASS |
| C06 | Evaluación acotada; no cerrar, confirmar ni propagar globalmente | `request-review` en el mismo alcance | Otro alcance y cambio inyectado `close` | Rechazo E1 fuera del vocabulario/alcance | Ambos intentos rechazados; no hay cierre | PASS |

Límite C01: la proyección se acredita en el puerto autorizado y el contrato; el filtrado sobre repositorio/datos reales pertenece a implementaciones posteriores. Límite C03: el doble acredita forma y delegación, no transacción, rollback ni atomicidad real.

## 3. Matriz G1–G6

| Guarda | Obligación y permitido | Denegado / contexto | Error expected | Observed | Resultado |
|---|---|---|---|---|---|
| G1 | Identidad y alcance satisfechos permiten continuar | `missing`; contexto ausente, forjado o incompleto | E1 | Puerto/handler no ejecutado; E1 | PASS |
| G2 | Veracidad material suficiente | `insufficient` | E3 | E3 pending/supply-required-evidence | PASS |
| G3 | Supervisión satisfecha o no requerida | `missing` cuando aplica | E1 | E1 sin efecto lateral | PASS |
| G4 | Conservación satisfecha | `missing` | E1 | E1 sin efecto lateral | PASS |
| G5 | Independencia satisfecha | `violated` | E1 | E1 sin efecto lateral | PASS |
| G6 | Operación nueva/equivalente controlada | `conflicting` / `uncertain` | E2 / E4 | E2 conflicto y E4 incertidumbre diferenciados | PASS |

Las seis guardas se ensayaron también con todos los hechos satisfechos: ninguna produjo fallo. El contexto incompleto emitido por un doble servidor no supera `isTrustedContext`; deny-by-default prevalece.

## 4. Matriz E1–E8

| Código | Alcance observable probado | Estado / siguiente paso expected | Observed | Resultado |
|---|---|---|---|---|
| E1 | Entrada, origen, contexto, G1/G3/G4/G5, C06 | unchanged / correct-or-review | Coincide | PASS |
| E2 | Replay conflictivo y G6 | conflicting / reevaluate-current-state | Coincide | PASS |
| E3 | G2 y revisión de evidencia inválida | pending / supply-required-evidence | Coincide | PASS |
| E4 | Replay/resultado externo incierto | uncertain / reconcile-before-retry | Coincide | PASS |
| E5 | Excepción conocida capturada | unchanged / retry-only-if-safe | Coincide, sin mensaje/stack | PASS |
| E6 | Intención/intento aún pendientes | pending / restore-dependency | Coincide | PASS |
| E7 | Resultado semántico directo observable | pending / resolve-ambiguity | Descriptor íntegro y distinguible | PASS |
| E8 | Resultado semántico directo observable | conflicting / review-discrepancy | Descriptor íntegro y distinguible | PASS |

E4 ≠ E5: un puerto que declara incertidumbre produce E4 `uncertain/reconcile-before-retry`; una excepción genérica capturada produce E5 `unchanged/retry-only-if-safe`. El manejo de excepciones no captura ni remapea la rama explícita E4.

## 5. Entrada, origen, replay y contexto

| Área | Casos expected | Observed | Resultado |
|---|---|---|---|
| Entrada | `{}`, `null`, array, string, campos ausentes, operación ausente/mal formada y autoridad/contexto top-level inyectados fallan cerrados | Todos rechazados antes del handler | PASS |
| Origen | Exacto permitido; ausente, subdominio, sufijo engañoso, HTTP, puerto distinto y valor parcial denegados | Comparación exacta por `Set`; todos los engaños rechazados | PASS |
| Replay | Nueva ejecuta; equivalente recupera previo; misma ID+huella distinta E2; incierto E4; sin registro ejecuta | Handler 2 veces para 5 solicitudes: primera y nueva; no doble efecto equivalente/conflictivo/incierto | PASS |
| Contexto | Servidor válido permite; ausente, objeto cliente, contexto incompleto y payload con contexto no conceden autoridad | Marcador privado + contenido obligatorio; frontera revalida; E1 por defecto | PASS |

El doble de replay acredita que la composición no reinvoca el handler en `previous/conflict/uncertain`; no acredita registro durable, carrera concurrente ni idempotencia PostgreSQL.

## 6. Fronteras y transporte

Positivo: `pnpm run lint` / `check:boundaries` observó `Import boundaries: PASS`; domain no importa Next.js/server/application/SDK y application no importa infrastructure/server/app/Next.js.

Negativo temporal, retirado antes del commit: cuatro fixtures con imports laterales intentaron `domain → next/server`, `domain → server`, `application → infrastructure` y `application → next/server`. El primer ensayo reveló un bypass del patrón para `import "…"` y dio falso PASS. Tras la corrección, el mismo ensayo listó las cuatro rutas y terminó con código 1. Los fixtures se eliminaron y el positivo volvió a PASS.

Revisión de transporte: `/health` solo adapta configuración a HTTP; `boundary` valida envolvente/origen/contexto/replay y traduce fallos; `composition` conecta dependencias. No contienen decisiones comerciales C01–C06, acceso a persistencia, identidad humana fabricada, transacción ni proveedor.

## 7. Configuración, canarios y salida sensible

Configuración válida sintética: PASS. Ausencia de `CRM_ENV`, entorno desconocido, origen no-URL y URL con path: `CONFIGURATION_INVALID`, fail closed. Variables adicionales no relevantes se ignoran. `/health` inválido devuelve únicamente `503 {status:"denied",code:"CONFIGURATION_INVALID"}` y válido únicamente `{status:"ready"}`.

Canarios `SECRET_CANARY_H0_004` y `TOKEN_CANARY_H0_004` atravesaron payload, request ID, operation ID, excepción y entorno inválido. No aparecieron en resultado semántico, mensaje público, evento diagnóstico, stack devuelto ni `/health`. Las referencias diagnósticas se vuelven hashes opacos truncados para correlación sin copiar entrada.

## 8. Comandos, expected y observed

| Comando / prueba | Expected | Observed | Resultado |
|---|---|---|---|
| Comprobación Git inicial | clean, main, remoto correcto, HEAD=origin/main=base | `eff54d773dc710094470f78458883d22ffe98fef` en ambos | PASS |
| `pnpm install --frozen-lockfile` | lockfile inmutable | Already up to date; salida 0 | PASS |
| `pnpm audit --prod` | sin vulnerabilidad runtime conocida | `No known vulnerabilities found` | PASS |
| `pnpm run typecheck` | TypeScript estricto | tipos generados; salida 0 | PASS |
| `pnpm run lint` | fronteras permitidas | `Import boundaries: PASS` | PASS |
| Prueba negativa de fronteras | cuatro infracciones detectadas, salida 1 | cuatro infracciones listadas, salida 1 | PASS |
| `pnpm test` | todos los casos normativos | 27 tests; 27 pass; 0 fail/cancelled/skipped/todo | PASS |
| `pnpm run build` | build de producción local | compiló; `/_not-found` y `/health` | PASS |
| `git diff --check` | sin errores de whitespace | salida 0 | PASS |

## 9. Defectos encontrados y correcciones

1. Contexto marcado pero incompleto podía ser aceptado: se validan claims obligatorios, tipo de identidad y fecha, y la frontera revalida el resultado del resolver.
2. Request/operation IDs podían copiar canarios a diagnóstico: se registran referencias SHA-256 opacas truncadas.
3. C04 trataba cualquier objeto `verification` como verificación: revisión vacía/mal fechada produce E3 antes del puerto.
4. C05 solo representaba intención pendiente: unión cerrada distingue intent, attempt, result conocido e uncertain; uncertain produce E4.
5. C06 dependía solo del tipo TypeScript para impedir cierre: validación runtime rechaza vocabulario inyectado.
6. El comprobador ignoraba imports laterales: el patrón ahora cubre `import "…"`, además de `from` e import dinámico.

Todas son correcciones pequeñas dentro de contratos/fronteras ya aprobados; no introducen arquitectura, decisión humana, Auth, persistencia ni proveedor. No queda defecto material abierto conocido dentro de TSK-H0-004.

## 10. Limitaciones y capacidades no acreditadas

No se acreditan Auth, CRM Actor real, login, sesiones, TOTP, recuperación, PostgreSQL, tablas, SQL, migraciones, RLS, Storage, Supabase SDK, atomicidad/rollback/concurrencia reales, historia durable, idempotencia durable, jobs, proveedor, correo, WhatsApp, DNS, Vercel, deploy, Production/Staging hosted, datos reales ni UI. C01 no acredita filtrado de un repositorio real; C03 no acredita transacción; replay no acredita almacenamiento durable; C04 no acredita objetos; C05 no acredita ejecución/entrega externa.

## 11. Resultado

Todos los casos normativos obligatorios del alcance son PASS; 27/27 tests, typecheck, fronteras positivas/negativas, lint, audit y build son PASS; los canarios no se filtran y no hay defecto material abierto propio del alcance.

Resultado: **PASS / TSK-H0-004 COMPLETED exclusivamente en su alcance de comprobación normativa formal**.

TSK-H0-005 permanece **NOT STARTED / NO EJECUTADA**. No se creó recurso externo ni se inició Auth, SQL, RLS o UI.
