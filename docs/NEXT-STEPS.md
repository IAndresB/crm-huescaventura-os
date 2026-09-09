# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Revisar docs/architecture.md

docs/state-machines.md v0.1 está APPROVED por revisión humana de 2026-09-09. La fase State Machines queda completada. docs/domain-model.md v0.1 continúa APPROVED.

La aprobación incluye D018–D020 y las resoluciones históricas de SM-PENDING-001/002/003; no queda ningún SM-PENDING activo. Los demás pendientes heredados conservan su alcance; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan junto con D018–D020 para los alcances resueltos.

Architecture v0.1 DRAFT está publicada. La siguiente acción es la revisión humana del borrador y de sus 17 ARCH-DEC propuestas. ARCH-PENDING-001 (proveedor definitivo Telefonía IA + WhatsApp) y ARCH-PENDING-002 (RPO/RTO de producción) siguen activos. Architecture permanece en progreso y no está aprobada; SPEC 001 Core CRM sigue no iniciado.

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

docs/business-rules.md v0.2, docs/domain-model.md v0.1 y docs/state-machines.md v0.1 continúan APPROVED. El paso actual es la revisión humana de Architecture v0.1 DRAFT; publicar el borrador no aprueba sus propuestas.

NO iniciar SPEC 001 hasta la aprobación explícita de Architecture y la instrucción humana correspondiente. No avanzar automáticamente a Specs, planes, tareas de implementación, código, SQL, migraciones, RLS, endpoints definitivos ni despliegues.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
