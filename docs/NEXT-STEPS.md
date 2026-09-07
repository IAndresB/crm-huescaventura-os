# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Revisar y aprobar docs/state-machines.md

docs/state-machines.md está DRAFT v0.1, con fecha 2026-09-07 y pendiente de revisión humana. docs/domain-model.md v0.1 continúa APPROVED.

La revisión debe comprobar estados y transiciones, guardas/evidencias, independencia comercial/operativa/económica, revalidación sin pérdida de hechos, excepciones y trazabilidad. Los BR-PENDING, DM-PENDING y SM-PENDING siguen vigentes en sus ámbitos. Aprobar este documento requiere decisión humana explícita; el commit/push del borrador no constituye aprobación.

## Approved Order

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

docs/business-rules.md continúa APPROVED en su versión 0.2. docs/domain-model.md v0.1 continúa APPROVED. El trabajo actual se limita a la revisión de docs/state-machines.md DRAFT v0.1 y a las correcciones documentales que se autoricen.

architecture.md permanece bloqueado/no iniciado hasta la aprobación humana explícita de State Machines y una nueva instrucción específica para iniciar arquitectura. No avanzar a arquitectura, Specs, planes, tareas de implementación, código ni despliegues dentro de esta fase.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
