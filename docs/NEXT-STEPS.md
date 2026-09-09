# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Revisar y aprobar docs/state-machines.md

docs/state-machines.md continúa DRAFT v0.1, actualizado el 2026-09-09 y pendiente de revisión humana global. docs/domain-model.md v0.1 continúa APPROVED.

La revisión debe comprobar estados y transiciones, guardas/evidencias, independencia comercial/operativa/económica, revalidación sin pérdida de hechos, excepciones y trazabilidad. D018 resuelve SM-PENDING-001 para V1: aceptación parcial expresamente seleccionable, nueva versión previa a Acceptance si la parte no era independiente/seleccionable, reserva directa con cadena comercial completa y una Booking por Opportunity aceptada, sin división/agrupación automática. D019 resuelve SM-PENDING-002: usa la modalidad real en promociones/cancelaciones individuales, prohíbe medias y prorrateos implícitos y exige determinar el derecho contractual antes de ajustar fondos u obligaciones. Queda únicamente SM-PENDING-003 abierto. Los demás pendientes heredados conservan su alcance; BR-PENDING-027/DM-PENDING-001 y BR-PENDING-023/DM-PENDING-003 se interpretan junto con D018/D019 para los alcances resueltos. Aprobar globalmente este documento requiere decisión humana explícita; ni estas decisiones ni el commit/push de la corrección constituyen esa aprobación.

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
