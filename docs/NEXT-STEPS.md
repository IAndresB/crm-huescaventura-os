# CRM HUESCAVENTURA OS — Next Steps

## Current Step

**Fase 08 — Tasks SPEC 001: IN PROGRESS — pendiente de revisión humana.** [tasks.md](../specs/001-core-crm/tasks.md) v0.1 es **DRAFT / NOT APPROVED**. D035 autoriza exclusivamente preparar, revisar y publicar este borrador y su coordinación.

**Siguiente paso: revisión en GitHub por ChatGPT y Andrés.** La publicación no aprueba Tasks ni autoriza ejecución. Implementación y H0–H6: **NOT STARTED**. Pruebas técnicas: **NO EJECUTADAS**.

La fase 07 permanece COMPLETED: [Plan SPEC 001](../specs/001-core-crm/plan.md) v0.3 APPROVED / COMPLETED por D034 el 2026-09-14; Ready for tasks.md: YES. Last Approved Commit conserva c2c908495afb8eacd39775f273585173533d6b51. La autorización posterior D035 se explica en la coordinación, sin modificar las frases históricas de cierre del Plan aprobado.

Architecture v0.1 y sus 18 ARCH-DEC, SPEC 001 v0.1 por D022, D023–D034 y PLAN-DEC-001–PLAN-DEC-009 permanecen APPROVED. El commit del borrador se registra por separado en [PROJECT-STATUS](PROJECT-STATUS.md).

## Review Focus

- Contrastar granularidad, fuentes, dependencias y criterios de las 125 tareas; 618 filas de trazabilidad con desarrollo y verificación concretos.
- Revisar capacidades mínimas B07/B08 anteriores a H5, evidencia H1 para economía H3, requisitos/incidencias al inicio de H4, confirmación completa de Booking H4 y cierre integrado H5.
- Revisar ensayos aislados de acceso/recuperación, comprobaciones posteriores y puertas separadas antes de acceso real y Production.
- Conservar los bloqueos localizados de Tasks §7. La revisión documental no sustituye evidencia técnica ni resuelve pendientes por suposición.

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
8. tasks.md — IN PROGRESS, v0.1 DRAFT / NOT APPROVED.
9. implementación — NOT STARTED.

## Working Rule

Work solo debe ejecutar el siguiente paso aprobado.

La autorización D035 termina tras publicar el borrador de Tasks y la coordinación. La revisión humana, la aprobación del contenido y una instrucción posterior delimitada son necesarias antes de iniciar implementación. No deducir autorización técnica de un commit, push, árbol limpio o cierre de fase anterior.

No iniciar código, SQL, migraciones, RLS, endpoints, UI, pruebas del CRM, configuración Supabase/Vercel, proveedores/dispositivos, DNS, infraestructura o despliegues bajo esta autorización documental.

Si aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente sin reabrir políticas ya resueltas;
- solicitar decisión antes de continuar esa parte;
- completar el trabajo independiente autorizado.

No avanzar automáticamente a la siguiente fase sin aprobación e instrucción correspondiente.
