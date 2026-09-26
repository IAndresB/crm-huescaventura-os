# CRM HUESCAVENTURA OS — Next Steps

## Current Step

**Fase 08 — Tasks SPEC 001: COMPLETED.** [tasks.md](../specs/001-core-crm/tasks.md) v0.1 está **APPROVED** por D036, sobre el borrador `04a98a81720dd02892b12c67fbcede69e5ae7787` y la coordinación revisada `f267e2c02d3c920dc385a73a6a0cc0f0e8c6dc5f`. COMPLETED corresponde exclusivamente a la fase documental.

**TSK-H0-005: COMPLETED solo en implementación local.** [Evidencia H0-005](../specs/001-core-crm/evidence-TSK-H0-005.md): F2/H0-M03, actor/sesiones/epochs y límites 7/30 se ensayaron con PostgreSQL 17.11 y Auth sintética. El siguiente paso, TSK-H0-006, requiere autorización humana nueva para reverificación normativa adversarial; permanece NOT STARTED. No aplicar H0-M03 a Staging ni configurar Auth real desde este bloque. H0 y PLAN-AUTH-002/006 siguen incompletos.

**D038 APPROVED** en `6248820e3253a9d88755ed0a4996fff8f865690e`: F2 resolvió el bloqueo de diseño F1/humano sin modificar D037/F1. Una autorización posterior permitió H0-005 local; no autorizó H0-006, Auth real ni despliegue. TSK-H0-009/010 y H0-008 permanecen COMPLETED en sus alcances; PLAN-AUTH-002 y PLAN-AUTH-006 permanecen PENDING globalmente.

La fase 07 permanece COMPLETED: [Plan SPEC 001](../specs/001-core-crm/plan.md) v0.3 APPROVED / COMPLETED por D034 el 2026-09-14; Ready for tasks.md: YES. D035 conserva su contexto histórico de autorización de preparación/publicación. Last Approved Commit corresponde al commit documental de aprobación formal D038, no al commit de coordinación, sin modificar el Plan aprobado.

Architecture v0.1 y sus 18 ARCH-DEC, SPEC 001 v0.1 por D022, D023–D038 y PLAN-DEC-001–PLAN-DEC-009 permanecen APPROVED. Los commits del borrador, aprobación y coordinación se registran por separado en [PROJECT-STATUS](PROJECT-STATUS.md).

## Preserved Scope

### Authorized hosted continuation — 2026-09-17

The subsequent human authorization permits only PLAN-AUTH-006 hosted database/F1
validation on `wrcrhbdbydkchxxlcacb`. This supersedes the earlier authorization
boundary below only for that isolated subset; no new H0 task is authorized.
Current result is **VALIDATED for the hosted database/F1 subset**: runtime login,
both poolers, affinity, F01/M2, F1, C01/C03, key lifecycle, Data API, advisors and
bounded performance passed. Temporary JIT/runtime/K were removed and Temporary
Access disabled. Do not replay the five applied migrations. H0-M02 is now applied
and validated on Staging under the separate human authorization of 2026-09-26;
TSK-H0-009/010 remain COMPLETED and no new task was started.
Before any hosted application deployment, replace/configure the current
Postgres.js `ssl:"require"` path with explicit CA/hostname verification and
validate Vercel secret injection/concurrency; those are not part of this DB/F1
closure.

- Se conservan las 125 fichas, dependencias, protocolos y 618 correspondencias aprobadas; TSK-H0-001/002/003/004/005/007/008/009/010 están marcadas COMPLETED en sus respectivos alcances locales.
- PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED y PLAN-AUTH-001–006 permanecen PENDING globalmente; solo el subset hosted database/F1 de PLAN-AUTH-006 está VALIDATED.
- Los bloqueos localizados de Tasks §7 y los pendientes heredados permanecen vigentes en sus ámbitos.
- La aprobación documental no sustituye evidencia técnica ni resuelve pendientes por suposición.

PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED; PLAN-AUTH-001–006 permanecen PENDING globalmente, con el subset hosted database/F1 de PLAN-AUTH-006 ya VALIDATED. D025/D026/D027/D031 completan la política: varios dispositivos, 30 días absolutos y 7 de inactividad por sesión, uso humano validado, revocación efectiva, email de seguridad verificado, TOTP y recuperación independiente del propietario/papel. Las capacidades y ensayos restantes aún deben acreditarse; refresh no es uso humano.

ARCH-PENDING-001/002 y los demás pendientes heredados conservan sus ámbitos; el segundo condiciona aceptación/configuración definitiva de recuperación y continuidad de Production, sin impedir ensayos aislados futuros autorizados. D018–D020 y SM-PENDING-001/002/003 mantienen sus resoluciones históricas; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan en esos alcances.

D030 queda exclusivamente para futura SPEC de interfaz. D033 conserva crm.huescaventura.com como dirección prevista, separada de la web pública; sin DNS, recursos ni despliegue configurados.

## Approved Order

Precedido por Constitution v1.0 APPROVED.

1. product.md
2. business-rules.md
3. domain-model.md
4. state-machines.md
5. architecture.md
6. SPEC 001 Core CRM
7. plan.md — COMPLETED, v0.3 APPROVED por D034.
8. tasks.md — COMPLETED, v0.1 APPROVED por D036.
9. implementación — H0 IN PROGRESS, sin nueva tarea autorizada: TSK-H0-001/002/003/004/005/007/008/009/010 COMPLETED en sus alcances; TSK-H0-006 y posteriores permanecen NOT STARTED.

## Working Rule

Work solo debe ejecutar el siguiente paso aprobado.

La aprobación documental D038 resolvió el modelo de confianza F2; la implementación H0-005 necesitó y recibió autorización humana separada. Ni D038 ni el cierre local H0-005 autorizan H0-006 o Auth/hosted H0-M03. Los bloques hosted anteriores conservan exclusivamente sus autorizaciones y evidencia históricas.

No iniciar TSK-H0-006 ni tareas posteriores, Auth real, UI, esquema comercial, endpoints de negocio, configuración Supabase/Vercel adicional, proveedores/dispositivos, DNS, infraestructura externa o despliegues. No aplicar H0-M03 hosted sin autorización separada.

Si aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente sin reabrir políticas ya resueltas;
- solicitar decisión antes de continuar esa parte;
- completar el trabajo independiente autorizado.

No avanzar automáticamente a la siguiente fase sin aprobación e instrucción correspondiente.
