# CRM HUESCAVENTURA OS — Next Steps

## Current Step

Fase 07 — Plan completada. Plan SPEC 001 Core CRM v0.3 está APPROVED / COMPLETED por D034 tras la revisión final del commit e902220b96a7df36454a984531c27c2f14d14529. Ready for tasks.md: YES; Implementation: NOT STARTED.

La siguiente fase autorizable es **08 — Tasks SPEC 001**. Todavía está NOT STARTED y requiere una instrucción humana posterior; tasks.md conserva su placeholder sin modificar.

Architecture v0.1, sus 18 ARCH-DEC y SPEC 001 v0.1 continúan APPROVED. D023–D034 y PLAN-DEC-001–PLAN-DEC-009 permanecen APPROVED. La aprobación del plan no inicia tareas ni convierte comprobaciones pendientes en pruebas satisfactorias.

PLAN-PENDING-001/002/004 permanecen resueltos en sus alcances. PLAN-PENDING-003 sigue PARTIALLY RESOLVED y conserva únicamente PLAN-AUTH-001–PLAN-AUTH-006, verificaciones técnicas NO EJECUTADAS antes de acceso real/H6.

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

La fase 07 está cerrada por D034. La fase 08 — Tasks SPEC 001 es el siguiente paso autorizable, pero no está iniciada: requiere una instrucción humana posterior. Hasta entonces no modificar tasks.md ni iniciar implementación, código, SQL, migraciones, RLS concreta, endpoints, UI, configuración Supabase/Vercel, DNS, infraestructura o despliegues.

Si durante el trabajo aparece una decisión de negocio, arquitectura, seguridad, datos o cumplimiento no resuelta:

- detener únicamente la parte afectada;
- registrarla como pendiente;
- solicitar decisión antes de continuar esa parte.

No avanzar automáticamente a la siguiente fase sin aprobación.
