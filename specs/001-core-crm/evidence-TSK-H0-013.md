# TSK-H0-013 — implementación de revocación global de acceso

Estado: COMPLETED localmente.
Fecha: 2026-09-28.
Base inicial: `45fc635a0f3894832183307706024b0dce25f411`.
Ámbito: Work Local, PostgreSQL 17 efímero y dobles sintéticos del proveedor
Auth. No se tocó Supabase hosted, Production, usuarios reales, dispositivos ni
credenciales reales.

## Autoridad y alcance

La implementación se deriva de TSK-H0-013 y sus fuentes asignadas: Plan
§§6.3–6.4, PLAN-AUTH-003/005, D025, D031, D037, D038 y la separación D039/TTE
cuando afecta a composición transaccional. H0-005/006 aportan la sesión,
`identification_epoch`, F1/F2, límites 7/30 y el orden de locks histórico. No
se cambia el significado aprobado de esas decisiones ni se introduce una regla
comercial nueva.

## Implementación

- `src/application/global-access-revocation.ts` define un puerto Auth mínimo:
  el proveedor conserva sus credenciales y Core solo recibe un resultado
  acotado `revoked | failed | uncertain`.
- `src/infrastructure/postgres/h0-013-adapter.ts` cierra primero la autoridad
  Core, confirma el `COMMIT`, coordina después la revocación Auth y registra el
  resultado en una unidad F1 independiente. Solo devuelve `completed` cuando
  el resultado Auth `revoked` también quedó persistido.
- `src/server/human-postgres-composition.ts` sustituye la ruta pública
  `revokeAll` por la coordinación H0-013 y mantiene las demás operaciones de
  H0-005/006 sin ampliar su superficie.
- `src/infrastructure/postgres/f1-codec.ts` añade exclusivamente el target
  `global_access_revocation/record_auth_outcome` para el propósito técnico
  `h0-013-auth-revocation` y el login `crm_h0_runtime`.
- H0-M05 crea registro durable del cierre Core y un historial append-only de
  intentos Auth, sin guardar JWT, refresh token, secreto ni credencial del
  proveedor.

## Propiedades verificadas durante implementación

| Propiedad | Observado local |
|---|---|
| Cierre global normal | `access_generation` aumenta una sola vez; emisor y demás sesiones antiguas quedan denegados. |
| Fallo Auth conocido | Core permanece cerrado; `failed` queda persistido y la respuesta es parcial. |
| Resultado Auth incierto/excepción | Core permanece cerrado; se registra `uncertain` cuando es posible y nunca se informa éxito. |
| Fallo al persistir después de contactar Auth | Se devuelve `pending`; no se revierte ni se reabre Core. |
| Fallo antes/durante la unidad Core | Rollback completo y el puerto Auth no se invoca. |
| Migración | Forward-only desde H0-M04, atómica ante fallo, preserva fixtures y restaura owners, RLS, grants y revocaciones PUBLIC/runtime. |
| F1/F2 | F2 autoriza el cierre humano; F1 solo registra el resultado técnico exacto y ligado a transacción. |
| D039/TTE | No se amplía el login HA ni la autoridad de finalización; las superficies permanecen separadas. |

## Pruebas de implementación

- `tests/integration/postgres-h0-013.test.ts`: **6/6 PASS**.
- `pnpm test`: **31/31 PASS**.
- `pnpm run test:postgres`: **254/254 PASS**, incluida la regresión histórica
  H0-005/006, H0-009/010 y H0-011/012.
- `pnpm audit --prod`: **0 vulnerabilidades**.
- `pnpm run typecheck`: PASS.
- `pnpm run lint`: PASS.

La verificación formal independiente y su oráculo previo están separados en
`evidence-TSK-H0-014.md`; estos PASS de implementación no se heredan como PASS
formal.

## Límites conservados

La prueba local acredita la composición Core/adapter y sus fallos mediante un
doble Auth. No acredita Supabase Auth real, invalidación efectiva en dispositivos,
entrega, disponibilidad hosted, URL/objeto privado ni Production. Por ello
PLAN-AUTH-003 y PLAN-AUTH-005 continúan `PENDING` globalmente aunque el tramo H0
asignado quede implementado; PLAN-AUTH-002/006 no cambian.
