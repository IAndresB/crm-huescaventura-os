# Evidence — TSK-H0-011: Autorizar y reservar un efecto exacto

**V-EVI — implementación local; no es la reverificación independiente TSK-H0-012.**

## Alcance y entorno

- Task: TSK-H0-011, exclusivamente implementación local B08 / Human Approval y PLAN-T08.
- Base commit: `28865186f0afe848facb8be83abba67db7ab74aa`.
- PostgreSQL local real: 17.11 (Postgres.app); Node.js 24.21.0; pnpm 11.19.0.
- Datos, identidades, claves, destinatarios, contenido y resultados: sintéticos.
- Migración nueva: `202609270000_h0_m04_human_approval.sql`; forward-only.
- Sin cambios en Supabase Staging, Auth real, proveedores o canales externos.

## Normativa implementada

Alcance directo: B01/B08; C02/C03/C05; PLAN-T08; D009/D016/D038; SPEC-FR-HA-001–005, SPEC-FR-CONC-002, AC-053–056 y guardas G1–G6/SM-HA-01–03 aplicables. El esperado independiente asignado a la posterior TSK-H0-012 continúa pendiente.

## Modelo persistido y fronteras

- `crm_ha.proposals`, `parts`, `decisions`, `reservations`, `events` y `command_receipts` guardan la revisión específica de Human Approval. La aprobación y su decisión son inmutables para runtime; los eventos distinguen propuesta, aprobación/rechazo, reserva, intento, resultado e incertidumbre. `reservations.material_fingerprint` conserva el fingerprint aprobado de la parte completa; `external_effect_records.content_fingerprint` mantiene el codec H0-M02 ya publicado para destino/versión, sin reinterpretarlo ni cambiar su contrato.
- Se reutilizan H0-M02 `unit_operations`, `unit_attempts`, `unit_history`, `unit_results` y `external_effect_records`; no se crea un segundo almacén de intentos/resultados/efectos. La operación de cada comando, historia, resultado e intención se confirma junto con los cambios M04 en una transacción C03.
- Una reserva identifica una sola parte, conserva `effect_id` e `intent_id` deterministas y únicos, y usa lock transaccional por propuesta/parte más restricciones únicas. Una parte consumida no se vuelve a reservar; otras partes aprobadas permanecen independientes.
- No se llaman proveedores. Los intentos/resultados son únicamente datos sintéticos suministrados al puerto técnico; no acreditan envío/entrega externa.
- No existe verificador de vigencia de evidencia genérica en esta fase. La presencia de evidencia requerida hace que `reserve` falle cerrada con `H0_011_EVIDENCE_REVALIDATION_REQUIRED`; no se acepta un booleano declarativo.
- F2 existente exige Auth evidence verificada con sesión/MFA, interacción de servidor, actor/scope/sesión/epoch/generación vigentes y revalidación SQL. No se crea autoridad humana paralela ni se aceptan claims del cliente.
- Las dos funciones públicas están limitadas a `EXECUTE` explícito de `crm_h0_runtime`; sus dueños son `crm_h0_f2_executor` NOLOGIN. Tablas pertenecen a `crm_h0_table_owner` NOLOGIN, RLS está ENABLE + FORCE, y `PUBLIC`, genéricos y runtime no tienen acceso directo ni privilegios DML. El helper de política no tiene EXECUTE público. Sin nuevos roles.

## Material exacto

Codec versionado `CRM-H0-HA-MATERIAL1`: vector F1 de campos UTF-8, prefijo de longitud uint32 big-endian, posiciones fijas y slots explícitos `value`, `unknown` o `not-applicable`. El orden de propiedades de los objetos TS no influye; los campos adicionales, prototipos no planos, arrays con huecos, UTF-8 inválido, NUL, valores mayores de 16 KiB, más de 20 partes y payload total mayor de 16 KiB se rechazan. SHA-256 cubre el vector completo y cada parte; cada reserva vuelve a comparar fingerprints completos y de parte con la versión persistida. No hay normalización Unicode silenciosa: se firma/compara el UTF-8 exacto.

**Expected:** cambio en acción, versión/contenido, destinatario, importe, condiciones, scope, destino/efecto o partes cambia el fingerprint; vacío, desconocido y no aplicable son distintos. **Observed:** los vectores de prueba dieron igualdad solo para la misma representación canónica y diferencia para cada cambio probado; intento de reservar material alterado fue denegado sin reserva. Un nuevo material necesita propuesta/decisión nueva.

## Matriz de implementación — expected → observed

| Caso | Expected | Observed |
|---|---|---|
| Propuesta sintética IA/humana sin decisión | No reservable | PASS; reserva ausente |
| Rechazo humano | No reserva/intención | PASS |
| Identidad no verificada / MFA o sesión no vigentes | Denegar aprobación/reserva | PASS; también una sesión revocada fue denegada |
| Aprobación válida | Registrar actor, sesión, fingerprint y momento; sin intento/éxito | PASS; decisión separada de ejecución |
| Material/parte modificados (incluye destinatario e importe) | Aprobación anterior no aplicable | PASS; denegación antes de persistir reserva |
| Evidencia requerida, caducada o no verificable | Fail closed | PASS; no se permite reservar |
| Dos conexiones reservan misma parte | Como máximo una | PASS; carrera real en dos conexiones PostgreSQL: 1 ganadora, 1 denegada |
| Partes diferentes | Reserva/consumo independiente | PASS; A consumida, B continúa reservable |
| Resultado incierto | Mantener reserva; no nuevo intento | PASS; stage uncertain, sin result, retry denegado |
| Conciliación sintética posterior | Resultado separado, una sola parte consumida | PASS; stage result único y parte consumida |
| Replay equivalente post-COMMIT | Recuperar mismo receipt, sin duplicar historia/intent/reserva | PASS; mismo `reservation_id`, una historia y una reserva |
| Misma identidad de comando, material distinto | Conflicto E2 | PASS; señal segura `H0_011_CONFLICT_E2`, sin segunda operación |
| Fallo al escribir intent M02 | Rollback de reserva, eventos, ledger e intención | PASS; trigger de fallo dentro del clúster efímero, cero residuo |
| SQL directo runtime, PUBLIC o rol genérico | Sin lectura/escritura/ejecución | PASS; DML/SELECT/SET ROLE/helper/API no autorizado denegados |
| Migración desde cadena previa + fixture H0-M02 | Aplicar forward, preservar fixture, mínimo privilegio | PASS en PostgreSQL 17.11; fixture anterior conservó estado e historia |

La prueba de sesión revocada y la de revalidación utilizan PostgreSQL y adaptadores reales, no mocks de autorización. La concurrencia utiliza dos conexiones distintas; no solo dos promesas sobre una conexión.

## Ejecución y regresiones

Comandos ejecutados:

```text
pnpm install --frozen-lockfile                       PASS
pnpm audit --prod                                     PASS — sin vulnerabilidades conocidas
pnpm run typecheck                                    PASS
pnpm run lint                                         PASS — Import boundaries
pnpm test                                             PASS — 27/27, 0 omitidos
POSTGRES_H0_BIN=/Users/andres/Applications/Postgres.app/Contents/Versions/17/bin pnpm run test:postgres
                                                      PASS — 163/163, 0 omitidos; H0-011 12/12
pnpm run build                                        PASS
git diff --check                                     PASS
```

`test:postgres` ejecutó la regresión histórica completa H0 disponible además de H0-011; no ejecutó la comprobación independiente H0-012. La migración se aplicó desde clúster efímero vacío tras la cadena histórica y desde el estado H0-M03 anterior con una fila sintética H0-M02 preexistente. La inyección de fallo DDL durante la migración abortó la transacción, no dejó el esquema H0-M04 y conservó el fixture H0-M02 preexistente; tras retirar el trigger de fallo, la aplicación limpia pasó. El clúster/socket temporales fueron detenidos y eliminados por el teardown de la suite.

## Limitaciones / no acreditado

- TSK-H0-012 conserva la auditoría normativa independiente, sus ataques y expected derivados de fuentes como trabajo futuro NO EJECUTADO.
- No hay Auth humano real; la frontera H0-005/006 se ensayó con autoridad técnica sintética ya verificada localmente.
- Evidencia genérica exigida permanece denegada hasta que una tarea autorizada provea un verificador de vigencia. No se acepta evidencia basada solo en referencia/fecha declarada.
- No se ejecutó ningún proveedor; intentos/resultados son sintéticos. No se acredita exactly-once externo, entrega, conciliación externa ni conectores.
- Sin integración H5/H6, UI, API pública, esquema comercial, Staging o Production.
- PLAN-AUTH-002 y PLAN-AUTH-006 permanecen PENDING globalmente; la evidencia local no cambia su estado.

Estado de implementación: **PASS local para TSK-H0-011**. TSK-H0-012: **NOT STARTED / NO EJECUTADA**.
