# Expected independiente — TSK-H5-003/004

Base exacta `e54331e41d5da154379542d0a08578288a57f01a`. Derivado exclusivamente de fuentes APPROVED antes de producto/tests. Mac Local, aislado, sintéticos. No es evidencia de ejecución.

Autoridad: Constitution1.0, Product0.1, Business Rules0.2, Domain Model0.1, State Machines0.1, Architecture0.1, SPEC0010.1, Plan0.3, Tasks0.1. Fuentes: Tasks §§2.2,2.3,5,6,7 y fichas completas H5-003/004; Plan §§8,11.2/T09; D016/D027; BR-TASK-001–006 y BR-AUTO-001–002.

## Inventario literal Tasks §6 (10 filas)

| **SPEC-FR-COORD-004** — [spec.md](spec.md), § 15. Tasks, Alerts, Incidents and Operational Calendar | [TSK-H5-003] | [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-IDEMP-002** — [spec.md](spec.md), § 17. Idempotency and Duplicate Prevention | [TSK-H0-009], [TSK-H1-017], [TSK-H3-005], [TSK-H4-015], [TSK-H4-017], [TSK-H5-007], [TSK-H5-003] | [TSK-H0-010], [TSK-H1-018], [TSK-H2-010], [TSK-H4-019], [TSK-H5-008], [TSK-H5-004], [TSK-H6-015] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-FR-CONC-006** — [spec.md](spec.md), § 18. Concurrency and Consistency | [TSK-H5-007], [TSK-H5-003] | [TSK-H5-008], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-070** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-007], [TSK-H5-003] | [TSK-H5-008], [TSK-H5-004], [TSK-H5-018] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **AC-083** — [spec.md](spec.md), § 24.4. Controles técnicos y fronteras | [TSK-H5-001], [TSK-H5-003], [TSK-H5-007] | [TSK-H5-002], [TSK-H5-004], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **SPEC-NFR-010** — [spec.md](spec.md), § 25. Non-Functional Requirements | [TSK-H5-017], [TSK-H5-003] | [TSK-H5-018], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **DM-INV-044** — [domain-model.md](../../docs/domain-model.md), § 14. Invariants — Invariantes del dominio | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003] | [TSK-H1-018], [TSK-H5-002], [TSK-H5-004] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **ARCH-DEC-011** — [architecture.md](../../docs/architecture.md), § 17. ARCH-DEC — Decisiones arquitectónicas aprobadas | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-007] | [TSK-H1-018], [TSK-H5-002], [TSK-H5-004], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PLAN-B07** — [plan.md](plan.md), § 4. Bloques, componentes y responsabilidades | [TSK-H1-013], [TSK-H1-015], [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-005], [TSK-H5-011] | [TSK-H1-014], [TSK-H1-016], [TSK-H1-018], [TSK-H5-002], [TSK-H5-004], [TSK-H5-006], [TSK-H5-012] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |
| **PT-08** — [plan.md](plan.md), § 10.2. Familias de pruebas y los 92 criterios | [TSK-H1-017], [TSK-H5-001], [TSK-H4-001], [TSK-H4-003], [TSK-H5-003], [TSK-H5-005], [TSK-H5-011], [TSK-H5-007] | [TSK-H1-018], [TSK-H5-002], [TSK-H4-002], [TSK-H4-004], [TSK-H5-004], [TSK-H5-006], [TSK-H5-012], [TSK-H5-008] | Contrastar la fila normativa con casos y salidas de las fichas asignadas; evidencia V-EVI, todavía NO EJECUTADA. |

## Pendiente transversal literal Tasks §7

| Parámetros de avisos, reintentos y scheduler ausentes | [TSK-H1-017], [TSK-H5-001], [TSK-H5-003], [TSK-H5-007], [TSK-H5-017], con sus comprobaciones. | Necesidad/intención persistida, fallos visibles, contratos probados con parámetros sintéticos declarados. | Verificar valores/capacidad y aceptar configuración operativa antes de programar efecto dependiente. No asumir frecuencia, adelanto ni reintentos ilimitados. |

## Casos normativos

Abreviaturas: COORD=SPEC-FR-COORD-004; IDEMP=SPEC-FR-IDEMP-001/002; CONC=SPEC-FR-CONC-006; NFR-010=SPEC-NFR-010. Casos de entrega utilizan exclusivamente doble sintético local, nunca proveedor. Visibilidad CRM significa contrato de lectura Core autorizado, sin anticipar UI.

| Caso | Fuente | Expected |
|---|---|---|
| H5-AA | COORD/D016 | Informativa conserva causa, alcance y urgencia; visible en CRM, único Administrador; sin WhatsApp/email. |
| H5-AB | COORD/D016 | Importante visible en CRM y exactamente una intención WhatsApp pendiente/no disponible. |
| H5-AC | COORD/D016 | Crítica visible en CRM y exactamente una intención WhatsApp pendiente/no disponible. |
| H5-AD | COORD/BR-TASK-006 | Destinatario derivado del Administrador autorizado, no elegible por entrada; otros destinatarios/canales se rechazan. |
| H5-AE | COORD/BR-TASK-002/004 | Causa, alcance/riesgo, acción requerida, origen y versión persistidos y reconstruibles; campos requeridos ausentes rechazan. |
| H5-AF | COORD/NFR-010 | Notification separa intención, canal, destinatario y resultado; historia correlacionada con causa. |
| H5-AG | COORD/DM-INV-044 | Crear intención no acredita entrega; estado externo pendiente/no disponible. |
| H5-AH | COORD/D016 | Sin conector la intención sobrevive y el CRM permite leer el aviso; ninguna entrega externa real. |
| H5-AI | AC-070/CONC | Doble local fallido registra resultado/error referenciado, versión e intento; fallo visible en CRM. |
| H5-AJ | AC-070/IDEMP | Fallo de aviso permanece en su identidad; replay o procesamiento equivalente no crea alerta/aviso recursivo. |
| H5-AK | IDEMP | Operaciones distintas con misma identidad causa/alcance/efecto convergen en un Alert y una intención por canal. |
| H5-AL | IDEMP/Tasks2.2 | Dos sesiones PostgreSQL solapadas sobre identidad ausente, ambos órdenes, locks observados; convergen sin duplicar historia efectiva. |
| H5-AM | IDEMP | Misma operación o misma identidad con material distinto produce conflicto; nunca reutilización silenciosa. |
| H5-AN | DM-INV-044 | Registrar aviso no resuelve causa, cierra Task ni modifica otros hechos originarios. |
| H5-AO | DM-INV-044 | Resultado entregado solo de doble sintético permanece marcado simulado, sin acreditar entrega externa ni cambiar Booking/pago/proveedor/Incident/Requirement/Task. |
| H5-AP | D016 | Intento de canal email interno se rechaza sin persistir efectos. |
| H5-AQ | D027 | Código/migración de recuperación por email de seguridad y sus pruebas permanecen; regresión independiente. |
| H5-AR | AC-083 | Sin límite de retry solo automatismo dependiente bloqueado; alerta/intención independiente visible, sin valor por defecto. |
| H5-AS | AC-083 | Sin pausa o cualquier parámetro requerido (frecuencia/adelanto/fecha) solo efecto dependiente bloqueado, sin fecha/frecuencia inventada. |
| H5-AT | AC-070/CONC/ARCH-DEC-011 | Fallo persistente Importante/Crítico con responsable, trigger, versión, entradas/permisos/efectos/registros referenciados; administrador detiene/revisa; no ejecución/retry ilimitado. |
| H5-AU | Tasks2.2 V-DAT | Sin auth/contexto, interacción incorrecta, identidad falsa o actor deshabilitado no escribe ni lee/reutiliza resultado. |
| H5-AV | Tasks2.2 V-DAT | Runtime/anon/authenticated acceso directo denegado; RLS y FORCE RLS; propietarios y ACL mínimos. |
| H5-AW | Tasks2.2 V-AT/T09 | Fallos inyectados en Alert, Notification, intento/resultado, historia y finalización revierten unidad completa; retry válido una vez. |
| H5-AX | IDEMP/V-AT | Respuesta perdida después del commit y replay autorizado no duplica; replay tras revocación denegado. |
| H5-AY | NFR-010/Plan11.2 | Lectura autorizada reconstruye causa/intención/intentos/versiones/estado/historia sin depender de logs; logs sin secretos/URLs/cuerpos/personales innecesarios. |
| H5-AZ | Plan8/Tasks7 | Ausencia de scheduler, cron, polling periódico, proveedor WhatsApp, email interno o envío real en nuevo producto. |
| H5-AAA | IDEMP/BR-TASK-004 | Causas/alcances/efectos realmente distintos con texto parecido conservan identidades distintas; no deduplicación por semejanza. |
| H5-AAB | Tasks2.2 V-MIG | Fresh y upgrade poblado desde 53 preservan datos/historia/owners/ACL anteriores; fallo DDL rollback y retry; 53 migraciones anteriores intactas. |
| H5-AAC | Tasks2.3/PT-08/PLAN-B07 | Regresión vigente PostgreSQL 2340 + nuevos una vez, unitarias 142 + nuevas, health1 separado; gates y advisors loopback. |
| H5-AAD | Tasks2.3/V-EVI | Expected bytes/SHA anterior a producto, matriz 10 filas y pendiente §7; SHA probado exacto, Fxx preservados, cierre documental separado; STOP H5-004. |
| H5-AAE | CONC/BR-AUTO-002 | Reintento manual autorizado y revisado preserva intento previo; límites/pausas solo configurados; incertidumbre exige conciliación, detener impide intento dependiente. |
| H5-AAF | IDEMP/CONC | Concurrencia de resultados sobre misma intención conserva orden/revisión; resultado obsoleto/conflictivo no sobrescribe; intentos materiales distintos conservados. |

## Método congelado

Identidad por fuente/causa/contexto/alcance/efecto, nunca texto aproximado. Un fallo de entrega se relaciona con su intención original; nuevo fallo material de causa no se oculta. Pruebas reales F1/F2/RLS, dos sesiones con solapamiento observado y ambos órdenes. Atomicidad incluye rollback de escrituras y finalización; reautorizar replay. No exactamente-una-vez externo ni transacción distribuida. Reutilizar B07/B08 y Task existente cuando corresponda; no modificar Task para ajustar tests de Alert.

Los parámetros desconocidos bloquean exclusivamente su acción dependiente. No se activa scheduler aunque existan parámetros sintéticos. No se configura canal real; no se crea email interno. Pruebas históricas no se atribuyen a este bloque; se reejecutan. STOP ante contradicción normativa material o trabajo ajeno. H5-005+ y H6 NOT STARTED; H5 no completo; DM-PENDING-005 vigente; Hosted/Production no acreditados.

## Hashes de autoridad en base

- `docs/constitution.md`: `12f92ecd2e6c449a0bdbfbf1a8831d165e03498f1b975687f452a1fdde6cde6a`
- `docs/product.md`: `1c1473069ad3932e059fd0888eff4b61419b46849332031c9dd7c437886fd7cc`
- `docs/business-rules.md`: `ab2504153a32ef9abfaec45efa5ee6846fc9ebcd8b5c244877d0d633ebfcbc07`
- `docs/domain-model.md`: `f9fafbb715ca57ef843d673af3a475847b4bcae6c37c0469552430c2a8558ddf`
- `docs/state-machines.md`: `683e2089227005724bff097cd79659c4bc74d0fc81c2e2fe142e9a4634edd240`
- `docs/architecture.md`: `61a04ca2a7d151f5fb07e713e5f3cfda439b91837f48d547ec99ce82d6e33117`
- `docs/DECISIONS.md`: `994bbf572776fa3e11f299f5a79c619e3a093dc1816819e408fcad735dd3a8fe`
- `specs/001-core-crm/spec.md`: `b6f581058c00b440dfb896404f9d6de6514c780d04f551e9acb365c905fdc747`
- `specs/001-core-crm/plan.md`: `6e40e4fec9e8f3f99aa9d11215bbafcbf046189ef561b3591bcdf2c69f3f479e`
- `specs/001-core-crm/tasks.md`: `613291b89a2521523dc7802e463ea16d433325438ee6ef975e05ca04be5ed5cc`
