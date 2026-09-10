# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Architecture v0.1 está APPROVED por revisión humana de 2026-09-10.

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La fase State Machines queda completada. docs/domain-model.md v0.1 continúa APPROVED.

La aprobación incluye D018–D020 y las resoluciones históricas de SM-PENDING-001/002/003; no queda ningún SM-PENDING activo. Los demás pendientes heredados conservan su alcance; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan junto con D018–D020 para los alcances resueltos.

La fase actual es 6 — SPEC 001 Core CRM, IN PROGRESS / DRAFT v0.1. Se ha redactado specs/001-core-crm/spec.md por instrucción humana; el siguiente paso es su revisión humana, sin aprobación otorgada todavía. No está Ready for plan.md. ARCH-PENDING-001 y ARCH-PENDING-002 siguen PENDING y no bloquean la redacción/revisión del Core; cada uno bloquea exclusivamente el trabajo dependiente indicado en Architecture §18.1. plan.md y tasks.md permanecen como placeholders sin iniciar ni modificar; implementación no iniciada.

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

docs/business-rules.md v0.2, docs/domain-model.md v0.1 y docs/state-machines.md v0.1 continúan APPROVED. Architecture v0.1 está aprobada; SPEC 001 está en redacción/revisión como DRAFT, sin aprobación ni avance automático de fase.

La autorización actual cubre exclusivamente redactar y publicar SPEC 001 DRAFT y su coordinación necesaria. Esperar revisión y aprobación humana explícita de la Spec y autorización posterior antes de iniciar plan.md. No iniciar tasks.md, implementación, código, SQL, migraciones, RLS concreta, endpoints definitivos, UI, configuración de proveedores ni despliegues. No modificar documentos APPROVED ni resolver pendientes heredados por iniciativa.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
