# Evidencia — TSK-H0-003

Estado: COMPLETED en su alcance de implementación
Fecha de ejecución: 2026-09-15
Entorno: Work Local Mac, macOS 26.5.2 (arm64), repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Base inicialmente comprobada: `d51fd2054a5ab54b9dad61e0d8a7f9e700d82630`
Commit finalmente probado y publicado: el commit único que contiene este archivo, recuperable con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-003.md`; su igualdad con `origin/main` se comprobó después del push.

## 1. Alcance y trazabilidad

Esta evidencia cubre exclusivamente TSK-H0-003: composición servidor modular, contratos internos C01–C06, representación de G1–G6, resultados E1–E8, validación de entrada/origen/replay, configuración cerrada, diagnóstico mínimo y fronteras de imports. TSK-H0-004 permanece NOT STARTED / NO EJECUTADA; los ensayos de esta tarea son comprobaciones de ingeniería, no su aceptación normativa formal.

Fuentes directas: Plan §§3.2/4/6.5/7.1, SPEC-FR-ERR-001, SPEC-FR-SEC-005, AC-072, AC-082, SPEC-NFR-014, DM-INV-001, ARCH-DEC-001/005/017/018, P12, PLAN-DEC-001, PLAN-B01, PT-11, PLAN-AUTH-001, D002/D005/D021/D032 y la delimitación aprobada de TSK-H0-002.

## 2. Runtime y dependencias fijadas

| Elemento | Versión real | Uso en esta tarea | Resultado |
|---|---:|---|---|
| Node.js | 24.21.0 | Runtime servidor y runner nativo de tests | PASS |
| pnpm | 11.19.0 | Gestor único y lockfile | PASS |
| Next.js | 16.3.5 | Borde App Router y build; solo `/health` | PASS |
| TypeScript | 7.0.2 | Modo estricto, typecheck y contratos | PASS |
| React / React DOM | 19.3.0 | Peers obligatorios de Next.js; no se creó UI | PASS |
| `@types/node` | 24.13.4 | Tipos del runtime | PASS |
| `@types/react` / `@types/react-dom` | 19.3.0 | Tipos requeridos por el build Next.js | PASS |

`pnpm audit --prod` observó `No known vulnerabilities found`. No se añadieron Supabase SDK, driver PostgreSQL, validadores, framework de dominio ni framework de tests.

## 3. Estructura implementada

- `src/domain`: E1–E8 y evaluación pura de G1–G6; no importa framework, transporte, SDK, entorno ni aplicación.
- `src/application`: contexto confiable opaco, resultados explícitos y contratos C01–C06 con puertos estrechos; no importa infraestructura, servidor, Next.js ni Supabase.
- `src/server`: validación de configuración, diagnóstico tipado sin cuerpos sensibles, validación de envolvente/origen/replay y composición.
- `src/app/health/route.ts`: único borde Next.js, diagnóstico sin UI que falla cerrado si falta configuración.
- `tests`: datos exclusivamente sintéticos y comprobaciones de ingeniería de contratos, guardas, errores y frontera.
- `scripts/check-boundaries.mjs`: comprueba dependencias prohibidas de dominio y aplicación.

No se crearon carpetas futuras vacías, UI, páginas de producto, endpoints C01–C06, infraestructura, persistencia, esquema o adaptadores externos.

## 4. C01–C06

| Contrato | Implementación en esta tarea | Límite explícito |
|---|---|---|
| C01 | Consulta mediante `AuthorizedQueryPort`, contexto confiable y proyección con procedencia/certidumbre | No concede mutación ni implementa repositorio real |
| C02 | Decisión síncrona pura con cambios permitidos y bloqueos | Sin escritura ni llamada externa |
| C03 | `TransactionPort` recibe operación, cambios, versión esperada, historia/resultado obligatorios e intención aplicable | Contrato únicamente; no PostgreSQL ni atomicidad real acreditada |
| C04 | `EvidencePort` registra original o registro manual; el contrato determina `candidate` salvo revisión explícita | Adjuntar nunca confirma automáticamente; sin Storage |
| C05 | `ExternalIntentPort` registra intención y devuelve pendiente E6 | No intenta ni ejecuta proveedor real |
| C06 | Evaluación pura acotada al alcance con cambios `record-assessment`, `mark-pending` o `request-review` | El tipo no ofrece confirmar, cerrar ni propagar globalmente |

Todos reciben contexto emitido tras verificación servidor, guardas y alcance; devuelven `applied`, `previous`, `pending` o `rejected` sin convertirse en rutas HTTP.

## 5. G1–G6

`evaluateCommonGuards` conserva seis evaluaciones distintas: G1 identidad/alcance; G2 veracidad material; G3 supervisión sensible; G4 conservación; G5 independencia; G6 repetición/incertidumbre. Los fallos conservan el ID de guarda, alcance afectado y E1/E2/E3/E4 aplicable. Una repetición equivalente no es un nuevo efecto; conflicto produce E2 y resultado incierto produce E4. Los puertos reales de identidad, historia y persistencia pertenecen a tareas posteriores y no se simulan como implementados.

## 6. E1–E8

Los ocho códigos son una unión cerrada y cada resultado incluye alcance afectado, estado conocido y siguiente paso seguro: E1 rechazo; E2 conflicto; E3 insuficiencia pendiente; E4 resultado incierto; E5 fallo técnico confirmado; E6 dependencia no disponible; E7 ambigüedad; E8 discrepancia. E4 conserva `uncertain/reconcile-before-retry`; E5 conserva `unchanged/retry-only-if-safe`. Pueden coexistir como lista de causas. Las excepciones del borde se convierten en E5 sin mensaje, secreto ni stack; una incertidumbre declarada por el puerto permanece E4.

## 7. Entrada, origen, replay, configuración y diagnóstico

- La envolvente acepta únicamente `requestId`, `kind`, `origin`, `payload` y, para mutaciones, `operation.id`; campos de autoridad/contexto añadidos por el solicitante se rechazan.
- El origen debe pertenecer al conjunto validado del servidor. No se confía en origen, actor, permisos, finalidad ni contexto enviados dentro del payload.
- El servidor calcula la huella material mediante `FingerprintPort`; `ReplayPort` distingue operación nueva, resultado previo, conflicto y resultado incierto. No existe almacén persistente todavía.
- Sin `TrustedExecutionContext`, la frontera deniega. No existe bypass, `service_role`, propietario ni privilegio global.
- `CRM_ENV` y `CRM_ALLOWED_ORIGINS` se validan; ausencia, entorno u origen inválidos dejan `/health` en `503 CONFIGURATION_INVALID`. No se versiona `.env` ni credencial.
- El diagnóstico solo admite referencias de petición/operación, código y resultado; su tipo no admite tokens, cookies, cabeceras, cuerpos o mensajes de excepción.

## 8. Comandos, esperado y observado

| Comando | Esperado | Observado | Resultado |
|---|---|---|---|
| `node --version` | Node exacto propuesto | `v24.21.0` | PASS |
| `pnpm --version` | Gestor exacto | `11.19.0` | PASS |
| `pnpm run typecheck` | TypeScript estricto sin errores | salida 0 | PASS |
| `pnpm run lint` | fronteras sin violaciones | `Import boundaries: PASS` | PASS |
| `pnpm test` | casos mínimos propios satisfactorios | 13 tests, 13 pass, 0 fail/cancelled/skipped/todo | PASS |
| `pnpm run build` | build Next.js y borde servidor compilables | Next.js 16.3.5 compiló; rutas `/_not-found` y `/health` | PASS |
| `pnpm audit --prod` | sin vulnerabilidad conocida en runtime | `No known vulnerabilities found` | PASS |

Casos observados: entrada inválida, origen no permitido y contexto ausente deniegan; replay equivalente recupera resultado, conflicto E2 e incertidumbre E4; excepción no filtra mensaje y produce E5; C01–C06 son invocables; C04 conserva candidata sin revisión; C05 permanece pendiente; C06 no escapa de alcance; G1–G6 y E1–E8 permanecen distinguibles.

Incidencias corregidas, sin ocultar fallos: `pnpm env use --global 24.21.0` no pudo exponer el runtime porque el directorio global configurado no estaba en `PATH`; se instaló la distribución oficial Node 24.21.0 para macOS arm64 y se enlazó desde la ruta local ya incluida en `PATH`, sin sobrescribir binarios previos. La primera configuración auxiliar de tests usó el modo retirado `moduleResolution=node10` y TypeScript 7 devolvió `TS5108`; se eliminó esa compilación auxiliar y se adoptó el runner TypeScript nativo de Node 24. Todos los comandos de cierre se repitieron después y finalizaron con salida 0.

## 9. Limitaciones y tareas propietarias

- TSK-H0-004: comprobación normativa formal V-DOM/build/fronteras y evidencia propia; NOT STARTED.
- TSK-H0-005/006: Auth/CRM Actor, habilitación, sesiones, MFA y límites 30/7; NOT STARTED.
- TSK-H0-007/008: rol ordinario, migración y contexto PostgreSQL; no implementados.
- TSK-H0-009/010: persistencia real de historia, idempotencia, resultado e intención; no implementados.
- TSK-H0-011/012: Human Approval y reserva/consumo real del efecto; no implementados.
- H1/H5: evidencia/objetos e integraciones/jobs reales; no implementados.
- TSK-H6-017: integración futura de exposición y privacidad; no ejecutada.

No se acredita persistencia, migración, Auth, RLS, atomicidad/concurrencia PostgreSQL, objetos, proveedor, email, sesión, recuperación, deploy ni acceso real. PLAN-AUTH-001 permanece globalmente PENDING / NO EJECUTADA fuera de la compatibilidad/build local independiente.

## 10. Resultado

Esperado: contratos C01–C06 invocables en aislamiento, dominio independiente, fronteras comprobables, denegación segura, entrada/origen/replay rechazables y E1–E8 diferenciados sin fuga sensible.

Observado: el código mínimo satisface esas condiciones mediante tipos/puertos explícitos, frontera servidor, configuración validada, diagnóstico limitado, tests sintéticos, comprobador de imports y build Next.js. No existe desviación normativa conocida ni bloqueo propio de TSK-H0-003.

Resultado: **PASS / TSK-H0-003 COMPLETED exclusivamente en su alcance de implementación**. TSK-H0-004 y TSK-H0-005 permanecen **NOT STARTED / NO EJECUTADAS**.
