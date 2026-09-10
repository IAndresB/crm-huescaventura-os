# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Architecture v0.1 está APPROVED por revisión humana de 2026-09-10.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La fase State Machines queda completada. docs/domain-model.md v0.1 continúa APPROVED.

La aprobación incluye D018–D020 y las resoluciones históricas de SM-PENDING-001/002/003; no queda ningún SM-PENDING activo. Los demás pendientes heredados conservan su alcance; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan junto con D018–D020 para los alcances resueltos.

La siguiente fase autorizable por el orden SDD es SPEC 001 Core CRM, pero SPEC 001 todavía NO se ha iniciado. Esperar instrucción humana antes de comenzar. ARCH-PENDING-001 y ARCH-PENDING-002 permanecen abiertos y no bloquean iniciar posteriormente SPEC 001; cada uno bloquea exclusivamente el trabajo dependiente indicado en Architecture §18.1.

## Approved Order

Precedido por Constitution v1.0 APPROVED.

1. product.md
2. business-rules.md
3. domain-model.md
4. state-machines.md
5. architecture.md
6. SPEC 001 Core CRM
7. plan.md
8. tasks.md
9. implementación

## Working Rule

Work solo debe ejecutar el siguiente paso aprobado.

docs/business-rules.md v0.2, docs/domain-model.md v0.1 y docs/state-machines.md v0.1 continúan APPROVED. Architecture v0.1 está aprobada; SPEC 001 es la siguiente fase, pero no se inicia automáticamente.

NO iniciar SPEC 001 sin instrucción humana expresa. No avanzar automáticamente a plan, tasks, implementación, código, SQL, migraciones, RLS, endpoints definitivos ni despliegues.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
