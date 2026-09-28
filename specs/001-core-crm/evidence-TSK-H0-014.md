# TSK-H0-014 — verificación formal independiente de revocación global

Estado: COMPLETED en verificación formal local independiente.
Fecha: 2026-09-28. Alcance: Work Local y PostgreSQL efímero con datos
sintéticos; sin Supabase hosted, Auth real, dispositivos ni Production.
Commit productivo verificado: `ddfaaf840162070c3bb40bd5598d388c6db1cf70`.

Este bloque se registra antes de inspeccionar o escribir las assertions de
H0-014. Las fuentes son Plan §§6.3–6.4, PLAN-AUTH-003, D025, ARCH-DEC-004,
PLAN-DEC-007, PLAN-B01, D038 y los protocolos V-DAT/V-MIG/V-EVI de Tasks. D031
solo delimita la coordinación Auth/break-glass asignada a H0-013; no se simula
recuperación extrema ni se acredita PLAN-AUTH-005 globalmente. D037 y D039 se
mantienen como regresiones de separación F1/F2 y TTE, no como una ampliación de
la revocación.

## Matriz expected fijada antes de assertions

| ID | Caso normativo y amenaza | Expected exacto |
|---|---|---|
| R01 | Administrador vigente en sesión A solicita cierre global mientras A y B conservan JWT/Auth vigente | El Core incrementa `access_generation` exactamente una vez, persiste el cierre y deniega inmediatamente A y B; la emisora no conserva autoridad. |
| R02 | Refresh, polling, background o respuesta tardía posteriores al cierre | No reactivan sesión, epoch, generación ni actividad humana; no producen acceso Core. |
| R03 | F2, sesión, epoch o capability emitidos con la generación anterior | Se rechazan aunque el token Auth siga vivo; ningún dato/actividad/resultado parcial cambia. |
| R04 | Auth confirma revocación global después del cierre Core | Solo tras persistir el resultado Auth se devuelve cierre completo; el registro conserva generación, estado y momento de servidor sin secreto/JWT. |
| R05 | Auth confirma fallo conocido | El Core permanece revocado; se persiste `failed` y se devuelve fallo parcial explícito, nunca éxito. |
| R06 | Auth devuelve resultado incierto o lanza excepción | El Core permanece revocado; se persiste `uncertain` cuando la escritura es posible y nunca se devuelve éxito. |
| R07 | Falla la persistencia final después de contactar Auth | El Core permanece revocado y la respuesta es parcial/pendiente; el estado durable no se inventa como `revoked`. |
| R08 | Falla antes o dentro de la unidad que incrementa generación y registra el cierre | Rollback conjunto: ni generación nueva ni registro parcial; Auth no se contacta. |
| R09 | Dos cierres concurrentes desde la misma autoridad previa | El orden actor → sesión → epoch serializa; solo el primero autorizado confirma e inicia coordinación Auth; el segundo se deniega sin segundo incremento. |
| R10 | Operación Core ya obtuvo locks antes del cierre | Puede terminar su transacción; el cierre espera, confirma después y toda operación posterior con autoridad anterior se deniega. |
| R11 | Cierre confirma primero y una operación Core preemitida continúa | La operación se deniega tras locks/revalidación y no actualiza actividad ni deja efecto Core. |
| R12 | Revocación individual o `disabled` compiten con cierre global | Se conserva el mismo orden estable; la primera autoridad confirmada prevalece y no existe éxito parcial ni reactivación por `enable`. |
| R13 | Reidentificación/nueva identificación tras el cierre | La autoridad vieja no reidentifica; una nueva identificación completa puede crear sesión/epoch de la generación vigente sin reabrir los históricos. |
| R14 | Actividad humana real y no humana alrededor del cierre | La interacción admitida antes de locks puede completar según R10; después del cierre ninguna clase revive autoridad. Refresh/polling/background no cuentan como actividad. |
| R15 | Límites 7/30, recovery/enrollment incompletos, actor disabled o generación máxima | El cierre solo parte de autoridad humana vigente; estados incompletos/caducados/disabled y overflow se deniegan sin mutación ni llamada Auth. |
| R16 | Acceso C01, mutación C03 y lectura de resultados anteriores tras cierre | Todos los accesos humanos H0 disponibles exigen F2 vigente y se deniegan con autoridad anterior; F1 técnica no sustituye F2. |
| R17 | M1/M2, SQL directo, GUC, Data API/PUBLIC, overload, `SET ROLE` o helper indirecto | No pueden incrementar/decrementar generación, fabricar cierre/resultado Auth, leer/escribir tablas protegidas ni asumir owner/verifier/executor. |
| R18 | Persistencia y reloj | Tiempos proceden de PostgreSQL; `access_generation` es monotónica; registro y estado posterior se comprueban desde otra conexión. |
| R19 | Migración H0-M05 desde vacío y desde H0-M04/D039 | Es forward-only, conserva fixtures anteriores, falla atómicamente, se reaplica limpiamente y restaura owners, grants, RLS, PUBLIC y firmas esperadas. |
| R20 | Resultado Auth falsificado por runtime sin F1 o con capability alterada/reutilizada | Se deniega sin cambiar el diagnóstico; la capability técnica queda ligada a transacción, login, scope, input, reloj y target exactos. |
| R21 | Compatibilidad F1/F2 y D039/TTE | F1 y F2 siguen separados; H0-M05 no abre las superficies TTE/HA ni modifica la autoridad de finalización D039. |
| R22 | Regresiones H0-005/006, H0-009/010 y H0-011/012 | Las suites completas relevantes pasan sin expected debilitado y sin borrar FAIL históricos. |
| R23 | Límites de acreditación | Dobles locales prueban coordinación y fallos, no Auth/Supabase hosted, dispositivos, entrega, URL/objeto privado ni Production; PLAN-AUTH-003/005 permanecen pendientes globalmente. |

Fail-fast: el primer incumplimiento material nuevo se registra como
`H0-014-F01` (y sucesivos), preservando reproducer, expected, observed,
materialidad y cronología. Tras una corrección inequívoca se repite esta matriz
completa desde cero; ningún PASS de implementación se hereda.

## Ejecución formal independiente

La implementación H0-013 se publicó primero y se verificó de nuevo desde un
clúster PostgreSQL 17.11 efímero nuevo sobre el commit anterior. Los datos, IDs,
sesiones, epochs y puertos Auth son sintéticos e independientes de los usados
por la suite de implementación.

| Filas | Observed | Resultado |
|---|---|---|
| R01–R04, R13, R16, R18 | Cierre durable; emisor y demás sesiones antiguas denegados; persistencia comprobada desde otra conexión; solo una identificación nueva completa obtiene la generación vigente. | PASS |
| R05–R08 | Fallo, incertidumbre y fallo post-proveedor nunca informan éxito ni reabren Core; un fallo en la unidad Core hace rollback y no llama Auth. | PASS |
| R09 | Dos cierres concurrentes serializan por actor → sesión → epoch; uno confirma y coordina Auth una sola vez. | PASS |
| R10 | Una operación que obtuvo locks primero termina; el cierre espera y toda autoridad anterior queda después denegada. | PASS |
| R11 | Si el cierre mantiene primero el lock de actor, la operación antigua se deniega sin efecto ni actualización de actividad. | PASS |
| R12, R14, R15 | Revocación individual, disable, estado incompleto/caducado, generación anterior y ruta no humana no reviven autoridad. | PASS |
| R17, R20, R21 | SQL/GUC/Data API/PUBLIC/overloads/`SET ROLE`, capability alterada/reutilizada y cruce F1/F2/TTE quedan denegados; owners, RLS y grants son mínimos. | PASS |
| R19 | H0-M05 aplica desde H0-M04/D039, conserva fixtures/objetos, falla atómicamente y reaplica limpiamente. | PASS |
| R22 | Regresión PostgreSQL completa, incluidas H0-005/006, H0-009/010 y H0-011/012. | PASS |
| R23 | No se atribuye a los dobles locales ninguna acreditación Auth/hosted/Production. | PASS |

Comandos y resultados:

- `tests/integration/postgres-h0-014.test.ts`: **8/8 PASS**, 0 skipped,
  0 cancelled.
- `pnpm run test:postgres`: **254/254 PASS**, 0 skipped, 0 cancelled.
- `pnpm test`: **31/31 PASS**.
- `pnpm audit --prod`: **0 vulnerabilidades**.
- `pnpm run typecheck`, `pnpm run lint`, `pnpm run build` y
  `git diff --check`: PASS.

## Defectos y conclusión

No apareció ningún defecto material de producto `H0-014-F01+`. Los dos fallos
observados al construir el harness fueron de la propia prueba (mensaje esperado
y temporización de una promesa); se conservaron los expected normativos y no se
cambió el producto para obtener PASS. La matriz R01–R23 queda **23/23 PASS** y TSK-H0-014
queda COMPLETED solo en alcance local.

PLAN-AUTH-003 y PLAN-AUTH-005 permanecen `PENDING` globalmente: faltan Auth real,
objetos H1, todas las superficies H6, dispositivos y recuperación/break-glass.
PLAN-AUTH-002/006 no cambian. H0 sigue `IN PROGRESS`; H0-015 continúa
`NOT STARTED`.
