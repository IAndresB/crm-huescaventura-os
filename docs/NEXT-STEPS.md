# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Fase 07 — Plan: revisión v0.2 autorizada el 2026-09-14 sobre 5531f69284ae38eea22d54f0b506ddc3a37ee83d. specs/001-core-crm/plan.md está DRAFT v0.2 / IN PROGRESS, completo para revisión humana y NOT APPROVED.

Architecture v0.1 y sus 18 ARCH-DEC continúan APPROVED; SPEC 001 v0.1 permanece APPROVED / COMPLETED por D022. D024 autoriza únicamente la corrección editorial permanente de AC-084 y su referencia; la aprobación y el historial se preservan.

D023 aprueba precisión/materialización en los casos expresos y D025 la política de acceso/recuperación. Las nueve PLAN-DEC permanecen propuestas técnicas: estas decisiones parciales no aprueban globalmente el plan.

La acción actual es revisar plan v0.2 con Andrés: alcance, propuestas, H0–H6, ejemplos PM-01–PM-09, trazabilidad y §12. PLAN-PENDING-001 está RESOLVED; 002 RESOLVED en alcance D023; 003 PARTIALLY RESOLVED y bloquea acceso real hasta concretar decisiones residuales y verificar PLAN-AUTH-001–PLAN-AUTH-006; 004 bloquea únicamente casos monetarios materiales no cubiertos.

En 003 falta decidir alcance de inactividad por dispositivo o global y recuperación de contraseña no disponible en el gestor, además de verificar capacidad/coste, revocación efectiva, otro dispositivo y recuperación TOTP en papel. La renovación del token no equivale a uso del CRM. No dar por configurados ni probados los mecanismos al publicar.

ARCH-PENDING-001/002 y demás pendientes heredados conservan sus ámbitos; el segundo condiciona recuperación/continuidad de Production H6. D018–D020 y SM-PENDING-001/002/003 mantienen sus resoluciones; BR-PENDING-023/027/036 y DM-PENDING-001/003/004 se interpretan en esos alcances. tasks.md permanece como placeholder sin iniciar ni modificar; implementación no iniciada.

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

docs/business-rules.md v0.2, docs/domain-model.md v0.1 y docs/state-machines.md v0.1 continúan APPROVED. Architecture v0.1 y SPEC 001 Core CRM v0.1 están APPROVED. D022 registra la aprobación y cierre de SPEC 001 sin iniciar automáticamente la fase siguiente.

La fase autorizada es actualizar y publicar plan DRAFT v0.2, registrar D023–D025 y aplicar la corrección editorial de AC-084 autorizada expresamente, con sus archivos de coordinación. Completar la revisión y obtener aprobación humana antes de abrir la siguiente fase; tasks.md requerirá la instrucción correspondiente. No iniciar tasks.md, implementación, código, SQL, migraciones, RLS concreta, endpoints definitivos, UI, configuración de proveedores, infraestructura ni despliegues. Fuera de esa corrección editorial, no modificar fuentes APPROVED ni resolver pendientes por iniciativa. DECISIONS.md conserva D001–D022 y añade D023–D025; las nueve PLAN-DEC siguen propuestas en plan.md.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
