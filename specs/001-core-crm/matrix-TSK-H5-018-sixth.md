# TSK-H5-018 sexta auditoría — matriz normativa independiente

Oráculo congelado antes de ejecutar: `expected-TSK-H5-018-sixth.md`, con su SHA en `tests/fixtures/h5-018-sixth/expected-seal.json`. Las fuentes y sus hashes constan en `normative-sources.json`. Los resultados siguientes se apoyan en capturas de esta sexta auditoría; los anteriores sirven únicamente para identificar regresiones y contrastar preservación.

| Control | Norma y obligación | Ensayo / evidencia de sexta |
| --- | --- | --- |
| Identidad | tasks §2.2 V-EVI; base y hashes del director | Preflight con fetch, tres refs exactas,0/0, índice vacío; 38.388 metadatos recalculados. `preflight.json`, `received-inventory.json.gz`. |
| B01/B07/B08/B10; C01/C04 | Plan §§4,7.1, 8, 11.2; autoridad de registro/consulta, diagnóstico sin efectos de negocio | Revisión de dominio/adaptador/SQL68 y hook; V-DAT propio y reproductores protegidos. |
| A: evidencia anterior | BR-DOC-001/003, BR-HIST-002; instante de hecho separado del registro | S6 A/B/C delta-1día y-1ms; derecho 100/base 200, original inmutable, replay sin nueva historia. |
| B: evidencia simultánea | Mismo contrato, occurred_at<=acto | Delta 0 ms, derecho 100 y retención 100; no pagos/deuda derivados por determinación. |
| C: evidencia posterior | V-NEG, prueba insuficiente E3 | +1 ms/+1 día, dos rechazos por cada caso y snapshot intacto. Prueba auxiliar +1 ms también E3. |
| D: fechas sintéticas | SM §12.2 y§2.4/D020; calendario local y umbrales≥7/≥3/<3 | 13 de octubre→200,18 de octubre→0; 2025-02-22→200 y 2027-03-26→100 para sus servicios expresos. Fechas contractuales intactas. |
| E/F: instantes reales/repetición | V-DOM determinista, sin falsificar relojes de seguridad | Dos construcciones reales distintas; original E3, original con evidencia explícita PASS, G PASS; recorded_at real. Bloque temporal repetido en captura 05. |
| G/H: válida/inválida | SM §12.2; SPEC-FR-ERR-001 | Positivos exactos y negativos de certeza, contexto y fechas; código de producto intacto. |
| I/J: historia/contexto ajeno | BR-HIST-001/002/004; PlanC01/C04 | Snapshot de evidencia histórica exacto; otra reserva/determinación no acredita el acto; actor/contexto no autenticados denegados. |
| K: contradicción | V-NEG; facts.at debe corresponder al acto acreditado | Contradicción command.at/facts.at rechazada; evidencia auxiliar 17 de octubre para acto13 de octubre rechazada dos veces, evidencia explícita 13 de octubre aceptada. No normalización silenciosa. |
| L/M: efectos/historia | BR-HIST-003/005, SM §18; V-AT | Snapshots de 7 tablas, historia antes/después, conflictosE2, replay original tras nueva decisión y ausencia de efectos económicos colaterales. |
| N: negativos originales | V-NEG, expected protegidos | Todos los negativos de la completa y de los originales seleccionados permanecen sin editar; futura evidencia principal/auxiliar rechazada. |
| 303 anteriores | V-EVI y correspondencia individual | Extracción propia de log quinta: 295E3+7 aserciones+1 bloqueo; `recovered-303.json` enlaza cada nombre/localización/hash/log actual. |
| Concurrencia ocho | V-AT; SPEC-FR-CONC-001/003 | Capturas21 original / 22 G, PG real y traza de fecha de evidencia; `eight-causal-reproduction.json`; plazo15 s y barreras originales. |
| F01/F02/F03 | AC-072/081; SPEC-FR-HIST-001 y ERR-001 | Originales `postgres-h5-018-audit/causes`, ejecutados con hookF recibido a producto68; contexto, identidad, referencias y E4. |
| H5-018-2-F01 | BR-HIST-002/004; Plan §7.1/11.2 | Original second-correlation R01/R02 y variantesD/T/Q; recuperación histórica autorizada, sin exponer actualidad de otra raíz. |
| H5-018-3-F01/F02 | B01/B07/B08; AC-081 | Originales third-temporal/parent-context, pares operación/ejecución, tipos y padres canónicos. |
| H5-018-4-F01/F02 | Plan §7.1/8; SPEC-FR-IDEMP | Originales fourth-history/identity/permissions/replay-controls y F-provenance/replay; A→B→A, permisos efectivos, lookup histórico explícito, ausencia de duplicados. |
| V-MIG | tasks §2.2, conservación de persistencia | Propia 03: 67 poblada → 68,175 tablas/305 funciones/487 relaciones/332 políticas/565 dependencias; solo3 cuerpos cambian, rollback, recuperación/reaplicación y hashes por tabla exactos. F-MIG y V08 recibidas reejecutadas en 20. Adicional12 verifica histórica 66. |
| V-DAT / confidencialidad | SPEC-FR-SEC-001/002/003/005; AC-081 | Propia 03: 20 denegaciones efectivas, RLS/FORCE, owners sin login/super/bypass. Canarios y permisos de reproductores protegidos; logs funcionales no sustituyen hechos. |
| V-DOM / E1–E8 | AC-070/072, SPEC-FR-ERR-001, Plan §11.2 | 208 unitarias y batería protegida de causas; incertidumbreE4 permanece pendiente, sin acreditar entrega ni llamar servicios externos. |
| Técnica | V-EVI / paquete congelado | Instalación congelada13, tipos06, lint09, build11, health08 y dependencias10; resultados separados, sin sumar al PostgreSQL. |
| Preservación | BR-HIST-003; condición expresa del director | 38.388 recibidos exactos, cinco FAIL,68 SQL, expected y sellos; 455inputsH5-016 idénticos y transición única autorizada de composition. |
| STOP | tasks §2.3; DM-PENDING-005 | OPEN; H5-017/018 IN PROGRESS, sin aceptación efectiva/publicación ni H5-019/H6. |

Las14 contrapruebas temporales propias y 2 de migración/seguridad son16 casos adicionales, informados separadamente. Los2 de V-MIG66 son regresión histórica adicional. Los116 del contraste causal y 71 reproductores protegidos repiten cobertura de la completa: no incrementan2945. Las57 pruebas del subprocess histórico H2-008 (55 PASS/2 FAIL deliberados del producto antiguo) tampoco se suman; el test padre actual exige esa reproducción histórica.
