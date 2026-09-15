# CRM HUESCAVENTURA OS — Next Steps

## Current Step

**Fase 08 — Tasks SPEC 001: COMPLETED.** [tasks.md](../specs/001-core-crm/tasks.md) v0.1 está **APPROVED** por D036, sobre el borrador `04a98a81720dd02892b12c67fbcede69e5ae7787` y la coordinación revisada `f267e2c02d3c920dc385a73a6a0cc0f0e8c6dc5f`. COMPLETED corresponde exclusivamente a la fase documental.

**Implementación/H0: IN PROGRESS con TSK-H0-001/002/003/004 COMPLETED.** Las dos primeras conservan sus alcances de preparación; [TSK-H0-003](../specs/001-core-crm/evidence-TSK-H0-003.md) completa exclusivamente la composición servidor y contratos C01–C06, y [TSK-H0-004](../specs/001-core-crm/evidence-TSK-H0-004.md) completa su verificación normativa formal con fronteras positivas/negativas y 27/27 tests. TSK-H0-005 y todas las tareas posteriores permanecen **NOT STARTED** y requieren una nueva instrucción humana delimitada. H1–H6: **NOT STARTED**. Auth/recuperación y comprobaciones posteriores: **NO EJECUTADAS**.

La fase 07 permanece COMPLETED: [Plan SPEC 001](../specs/001-core-crm/plan.md) v0.3 APPROVED / COMPLETED por D034 el 2026-09-14; Ready for tasks.md: YES. D035 conserva su contexto histórico de autorización de preparación/publicación. Last Approved Commit identificará el commit de aprobación de Tasks mediante el segundo commit de coordinación, sin modificar el Plan aprobado.

Architecture v0.1 y sus 18 ARCH-DEC, SPEC 001 v0.1 por D022, D023–D036 y PLAN-DEC-001–PLAN-DEC-009 permanecen APPROVED. Los commits del borrador, aprobación y coordinación se registran por separado en [PROJECT-STATUS](PROJECT-STATUS.md).

## Preserved Scope

- Se conservan las 125 fichas, dependencias, protocolos y 618 correspondencias aprobadas; únicamente TSK-H0-001/002/003/004 están marcadas COMPLETED en sus respectivos alcances.
- PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED y PLAN-AUTH-001–006 PENDING / NO EJECUTADAS.
- Los bloqueos localizados de Tasks §7 y los pendientes heredados permanecen vigentes en sus ámbitos.
- La aprobación documental no sustituye evidencia técnica ni resuelve pendientes por suposición.

PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED, exclusivamente PLAN-AUTH-001–006 PENDING / NO EJECUTADAS. D025/D026/D027/D031 completan la política: varios dispositivos, 30 días absolutos y 7 de inactividad por sesión, uso humano validado, revocación efectiva, email de seguridad verificado, TOTP y recuperación independiente del propietario/papel. Las capacidades y ensayos aún deben acreditarse; refresh no es uso humano.

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
9. implementación — IN PROGRESS solo por TSK-H0-001/002/003/004 COMPLETED; TSK-H0-005 y posteriores NOT STARTED.

## Working Rule

Work solo debe ejecutar el siguiente paso aprobado.

La autorización específica actual termina al publicar y verificar TSK-H0-004. Una nueva instrucción humana delimitada es necesaria antes de TSK-H0-005 o cualquier tarea posterior. No deducir autorización técnica de una aprobación, un commit, push o árbol limpio.

No iniciar TSK-H0-005, SQL, migraciones, RLS, Auth, UI, endpoints de negocio, configuración Supabase/Vercel, proveedores/dispositivos, DNS, infraestructura externa o despliegues bajo esta autorización.

Si aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente sin reabrir políticas ya resueltas;
- solicitar decisión antes de continuar esa parte;
- completar el trabajo independiente autorizado.

No avanzar automáticamente a la siguiente fase sin aprobación e instrucción correspondiente.
