# Matriz observada — TSK-H5-008

Expected congelado en ae7f3b02745f3011bf3b324f2a5b3420f22a0a79. 45 filas normativas / 56 casos. STOP previo a producto por F01. Ningún caso funcional se declara PASS.

| Caso | Clase | Fuente | Expected | Observado / estado |
|---|---|---|---|---|
| W01 | positivo | PLAN-B08 P14 ARCH-DEC-011 D016 | Definition/version y entradas mínimas persistidas, responsable humano y ejecutor técnico separados; versión histórica inmutable. NO EJECUTADO; STOP previo a implementación por F01. |
| W02 | recuperación | SPEC-FR-CONC-005 AC-069 PLAN-T09 | Trabajo pendiente recuperable por identidad tras reiniciar proceso; reclamar no acredita contacto ni efecto. NO EJECUTADO; STOP previo a implementación por F01. |
| W03 | concurrencia | AC-055 AC-069 SPEC-NFR-007 PLAN-T09 | Dos ejecutores A/B y B/A con sesiones reales solapadas y bloqueo observado: solo un ganador por trabajo y generación. NO EJECUTADO; STOP previo a implementación por F01. |
| W04 | recuperación | SPEC-FR-CONC-005 AC-069 | Reclamación vencida antes de iniciar efecto: nueva generación recupera; intento anterior conservado y sin efecto acreditado. NO EJECUTADO; STOP previo a implementación por F01. |
| W05 | recuperación | SPEC-FR-ERR-002 AC-057 SM-FORB-27 E4 | Caída durante contacto simulado: resultado incierto y reserva retenida; reclamar o pedir retry manual no reenvía. NO EJECUTADO; STOP previo a implementación por F01. |
| W06 | recuperación | AC-069 SPEC-FR-IDEMP-004 G6 | Proveedor simulado acredita efecto y proceso cae antes de persistir: conciliar intento original una vez, sin nuevo contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W07 | negativo | PLAN-T09 AC-069 SPEC-FR-ERR-002 | Expirar concesión tras marcar contacto, incluso sin respuesta: nunca autoriza por sí solo nuevo efecto. NO EJECUTADO; STOP previo a implementación por F01. |
| W08 | negativo | SPEC-FR-IDEMP-004 SPEC-NFR-007 | Generación obsoleta intenta iniciar, renovar o registrar resultado vigente: fencing impide sobrescribir generación posterior. NO EJECUTADO; STOP previo a implementación por F01. |
| W09 | recuperación | SPEC-FR-HA-003 SPEC-FR-IDEMP-004 PLAN-T09 | Respuesta tardía comprobable se vincula a intento original; replay de la misma respuesta no duplica hecho ni consumo. NO EJECUTADO; STOP previo a implementación por F01. |
| W10 | negativo | SPEC-FR-IDEMP-004 G6 | Resultado tardío conflictivo con resultado acreditado queda conflicto/revisión; no sobreescribe el hecho previo. NO EJECUTADO; STOP previo a implementación por F01. |
| W11 | positivo | SPEC-FR-HA-002 G3 PLAN-T08 D039 | Revalidar aprobación exacta antes de inicio de efecto y dentro de TTE con final check obligatorio. NO EJECUTADO; STOP previo a implementación por F01. |
| W12 | negativo | SPEC-FR-HA-002 AC-054 SM-FORB-22 | Aprobación revocada entre preparación y efecto impide contacto; aprobación histórica conservada. NO EJECUTADO; STOP previo a implementación por F01. |
| W13 | negativo | SPEC-FR-HA-002 AC-054 PLAN-DEC-005 | Cambio de versión/contenido entre preparación y efecto exige nueva aprobación, sin contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W14 | negativo | SPEC-FR-HA-002 AC-054 | Cambio de destinatario entre preparación y efecto exige nueva aprobación, sin contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W15 | negativo | SPEC-FR-HA-002 AC-054 | Cambio de alcance/porción entre preparación y efecto exige nueva aprobación, sin contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W16 | negativo | SPEC-FR-HA-002 AC-054 | Cambio de importe/precio entre preparación y efecto exige nueva aprobación, sin contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W17 | negativo | SPEC-FR-HA-002 AC-054 | Cambio de condiciones/efecto entre preparación y efecto exige nueva aprobación, sin contacto. NO EJECUTADO; STOP previo a implementación por F01. |
| W18 | negativo | AC-054 SPEC-FR-HA-002 | Evidencia caducada o estado no aplicable con mismo material impide contacto; se requiere revalidación. NO EJECUTADO; STOP previo a implementación por F01. |
| W19 | concurrencia | SPEC-FR-HA-004 AC-055 PLAN-T08 | Reserva de parte ya consumida o reservada por otro intento no se duplica; una aprobación no da dos permisos. NO EJECUTADO; STOP previo a implementación por F01. |
| W20 | positivo | SPEC-FR-CONC-006 P14 AC-070 | Pausa antes del efecto impide nuevas reclamaciones/contacto; historial e intentos permanecen. NO EJECUTADO; STOP previo a implementación por F01. |
| W21 | positivo | SPEC-FR-CONC-006 AC-070 P14 | Detener antes del efecto impide ejecución; no borra Definition, Execution Record, aprobación ni reservas pendientes. NO EJECUTADO; STOP previo a implementación por F01. |
| W22 | recuperación | AC-057 AC-070 G6 | Pausa/detención tras contacto mantiene resultado incierto; permite conciliación acreditada sin volver a enviar. NO EJECUTADO; STOP previo a implementación por F01. |
| W23 | negativo | SPEC-FR-ERR-002 SPEC-FR-CONC-006 | Revisión/reanudación autorizada reevalúa estado, aprobación y efecto previo; no limpia incertidumbre por orden manual. NO EJECUTADO; STOP previo a implementación por F01. |
| W24 | positivo | SPEC-FR-HA-004 SM-HA-03 AC-055 | Parcial: de dos partes aprobadas solo la acreditada consume; resto seguro sigue pendiente sin repetir la acreditada. NO EJECUTADO; STOP previo a implementación por F01. |
| W25 | negativo | SPEC-FR-HA-003 SPEC-FR-ERR-002 SM-FORB-27 | Parcial con resto incierto retiene reserva de ese resto; no lo considera fracaso ni permiso de retry. NO EJECUTADO; STOP previo a implementación por F01. |
| W26 | positivo | SPEC-FR-IDEMP-002 ARCH-DEC-013 PLAN-C05 | Repetición equivalente de definición/ejecución/reclamación devuelve resultado previo reautorizado. NO EJECUTADO; STOP previo a implementación por F01. |
| W27 | negativo | SPEC-FR-IDEMP-002 ARCH-DEC-013 | Misma clave con contenido material distinto produce E2 y cero cambios. NO EJECUTADO; STOP previo a implementación por F01. |
| W28 | rollback | PLAN-T09 SPEC-NFR-007 V-AT | Fallo antes/durante escrituras T09: reclamación/generación/historia/operación se revierten íntegramente. NO EJECUTADO; STOP previo a implementación por F01. |
| W29 | rollback | PLAN-T08 D039 V-AT | Fallo antes/durante T08 o final check: reserva/intención/intento/historia/resultado no dejan éxito parcial. NO EJECUTADO; STOP previo a implementación por F01. |
| W30 | rollback | PLAN-T08 PLAN-T09 D039 V-AT | Fallo al registrar resultado: consumo/resultado/historia atómicos; repetir identidad tras respuesta perdida recupera commit. NO EJECUTADO; STOP previo a implementación por F01. |
| W31 | seguridad | V-DAT ARCH-DEC-002 | Actor ordinario autorizado con contexto confiable y finalidad aplicable; sin owner ni BYPASSRLS. NO EJECUTADO; STOP previo a implementación por F01. |
| W32 | seguridad | V-DAT G1 | Sin contexto o contexto falsificado: rechazar y no filtrar datos. NO EJECUTADO; STOP previo a implementación por F01. |
| W33 | seguridad | V-DAT G1 | Actor inhabilitado/sesión revocada: rechazar también lectura y replay. NO EJECUTADO; STOP previo a implementación por F01. |
| W34 | seguridad | D039 V-DAT PLAN-T08 | Finalidad/login no aplicable y runtime general intentan unidad HA directa/indirecta: denegar. NO EJECUTADO; STOP previo a implementación por F01. |
| W35 | seguridad | V-DAT ARCH-DEC-002 | RLS y FORCE RLS activos, sin CRUD directo ordinario ni privilegios PUBLIC/anon/authenticated sobre dominio privado. NO EJECUTADO; STOP previo a implementación por F01. |
| W36 | seguridad | V-DAT P14 | Historial y versiones no editables/borrables por acceso directo; permisos mínimos conservados. NO EJECUTADO; STOP previo a implementación por F01. |
| W37 | positivo | AC-070 D016 PT-08 E6 | Fallo persistente visible Importante/Crítico en CRM; intención WhatsApp pendiente sin envío, sin email ni avisos recursivos. NO EJECUTADO; STOP previo a implementación por F01. |
| W38 | negativo | AC-083 SPEC-FR-CONC-006 PLAN-DEC-009 | Sin límite/pausa/capacidad de scheduler aprobados: programación dependiente pendiente; no valores operativos por defecto. NO EJECUTADO; STOP previo a implementación por F01. |
| W39 | recuperación | E4 E5 SPEC-NFR-014 | Error técnico conocido antes del efecto permite solo recuperación segura acotada; si efecto desconocido sigue E4. NO EJECUTADO; STOP previo a implementación por F01. |
| W40 | negativo | E6 SPEC-FR-INT-003 PLAN-C05 | Canal no disponible mantiene pendiente; no entrega ni recepción inferidas. NO EJECUTADO; STOP previo a implementación por F01. |
| W41 | recuperación | AC-073 PT-12 | Restauración simulada de estado anterior suspende efectos sensibles hasta conciliar fuente simulado durable; no acredita restauración integral H6. NO EJECUTADO; STOP previo a implementación por F01. |
| W42 | recuperación | AC-069 SPEC-FR-CONC-005 ARCH-DEC-015 | Reinicio real de proceso conserva Definition, ejecución, generación, incertidumbre e identidad del intento; cero dependencia de memoria. NO EJECUTADO; STOP previo a implementación por F01. |
| W43 | negativo | SM-HA-03 SM-FORB-22 P15 D009 | Aprobación sin evidencia de ejecución no crea éxito ni aceptación/pago/confirmación; P16 permanece prohibido. NO EJECUTADO; STOP previo a implementación por F01. |
| W44 | negativo | SM-HA-03 SPEC-FR-HA-003 G2 | Solicitar resultado exitoso sin evidencia verificable del intento no consume ni acredita. NO EJECUTADO; STOP previo a implementación por F01. |
| W45 | concurrencia | AC-054 SPEC-NFR-007 G3 | Revocación/cambio/pausa versus inicio: ambos órdenes con sesiones reales, espera observable y reevaluación después de lock. NO EJECUTADO; STOP previo a implementación por F01. |
| W46 | concurrencia | SPEC-FR-IDEMP-004 AC-069 | Recuperación versus ejecutor antiguo/resultado tardío: ambos órdenes reales; no doble generación activa ni overwrite. NO EJECUTADO; STOP previo a implementación por F01. |
| W47 | rollback | D039 PLAN-T08 V-AT | Fallo T08 tras espera/final check o COMMIT: rollback o commit incierto recuperado por identidad, nunca falso PASS durable. NO EJECUTADO; STOP previo a implementación por F01. |
| W48 | migración | V-MIG ARCH-DEC-002 | Fresh y upgrade desde 55 migraciones con datos anteriores preservan IDs, relaciones, snapshots, historia y permisos. NO EJECUTADO; STOP previo a implementación por F01. |
| W49 | migración | V-MIG | Rollback transaccional de migración y retry no dejan objetos parciales; cadena anterior byte intacta. NO EJECUTADO; STOP previo a implementación por F01. |
| W50 | seguridad | V-DAT V-MIG | Advisors loopback y catálogo: nuevos objetos sin exposición indebida y dependencias existentes preservadas. NO EJECUTADO; STOP previo a implementación por F01. |
| W51 | regresión | V-EVI PT-09 PT-12 | Regresión PostgreSQL 2408 previos más focales una vez; unitarias150 previas y health1 independiente; sin FAIL/skip/cancel. NO EJECUTADO; STOP previo a implementación por F01. |
| W52 | regresión | V-EVI | Frozen install, typecheck, lint/import boundaries, build y audit producción PASS sobre SHA definitivamente probado. NO EJECUTADO; STOP previo a implementación por F01. |
| W53 | preservación | V-EVI | Cadena F10/F12 preservada con hashes exactos; no ampliar excepciones históricas; FAIL original conservado si aparece. PARCIAL: cadena F10/F12 y 800 entradas PASS intactas. Guarda histórica H5-006 falla con archivo56 inerte (F01 OPEN); no corregida. |
| W54 | preservación | V-DOM V-EVI | Expected permanece byte idéntico al commit publicado anterior a producto; casos observados trazables a cada fila. Expected publicado antes de producto; hash/tamaño intactos. Cobertura observada funcional pendiente. |
| W55 | preservación | V-EVI | Auditor final y diff-check PASS; cierre local/aislado separa SHA probado de documentación posterior. Diff-check del checkpoint y bytes protegidos comprobados; auditor final de cierre NO EJECUTADO. |
| W56 | límite | E2E-06 PT-08 PT-09 PT-12 Tasks§7 | Límites: sintéticos/contactos simulados; DM-PENDING-005 y otros pendientes intactos; H5-010/H6-006/015/016/E2E-06 integral no acreditados. Límites conservados; sin trabajo ni acreditación posterior. |
