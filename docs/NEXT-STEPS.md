# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Fase 07 — Plan: revisión v0.3 autorizada el 2026-09-14 sobre 53557f3dc294e5410d69b9b9bff4b3135403475b. specs/001-core-crm/plan.md está DRAFT v0.3 / IN PROGRESS, completo para revisión humana y NOT APPROVED.

Architecture v0.1 y sus 18 ARCH-DEC continúan APPROVED; SPEC 001 v0.1 permanece APPROVED / COMPLETED por D022. D024 autoriza únicamente la corrección editorial permanente de AC-084 y su referencia; la aprobación y el historial se preservan.

D023–D025 permanecen aprobadas e intactas. D026–D033 registran las nuevas decisiones; D032 aprueba PLAN-DEC-001–PLAN-DEC-009. El plan global sigue NOT APPROVED.

La acción actual es revisión final de plan v0.3 con Andrés: alcance, decisiones técnicas aprobadas, H0–H6, PM-01–PM-13, trazabilidad y §12. PLAN-PENDING-001/002/004 resueltos en sus alcances; 003 PARTIALLY RESOLVED conserva únicamente PLAN-AUTH-001–PLAN-AUTH-006, verificaciones técnicas NO EJECUTADAS antes de acceso real/H6.

En 003 falta verificar capacidad/coste, medición humana por sesión, revocación efectiva, entrega al email previamente verificado y ensayos de otro dispositivo, copia TOTP y break-glass del propietario. Políticas completas D026/D027/D031; refresh no es uso humano. D030 queda para futura Spec de interfaz. D033 fija crm.huescaventura.com en proyecto/despliegue separado, sin configuración.

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

La fase autorizada es actualizar y publicar plan DRAFT v0.3 y registrar D026–D033 con coordinación. D001–D025 y todas las fuentes aprobadas, incluida SPEC, permanecen intactas. PLAN-DEC-001–PLAN-DEC-009 APPROVED no aprueba globalmente el plan. Obtener aprobación del plan e instrucción posterior antes de tasks.md; no modificar su placeholder. No iniciar implementación, código, SQL, migraciones, RLS concreta, endpoints, UI, configuración Supabase/Vercel, DNS, infraestructura ni despliegues.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
