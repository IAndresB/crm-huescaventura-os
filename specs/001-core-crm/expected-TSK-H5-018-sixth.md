# TSK-H5-018 sexta auditoría — expected independiente previo a ejecución

Candidato: producto F + instrumentación G. Base 9649a2773530ea8a43237b4e1f2034f80e34136f. Solo datos sintéticos, PostgreSQL/Storage locales aislados. No modificación de producto, G, pruebas/expected recibidos ni migraciones.

| ID | Fuente primaria consultada | Oráculo independiente y comprobación |
|---|---|---|
| S01 | tasks §2.2 V-EVI y §2.3; petición del director | Identidad exacta: 38.388 recibidos; 38.271 F+quinta y 117 G. Tipos, modos, tamaños, SHA; base común, 0/0, índice vacío. Altas sexta separadas. |
| S02 | tasks H5-017/H5-018; Plan B01/B07/B08/B10, C01/C04, §7.1 | Registro autorizado separa tiempo del hecho/registro; diagnóstico relaciona fuente canónica y permisos. Ningún log acredita efecto. |
| S03 | SM §12.2 y §2.4 D020; BR-MOD; BR-HIST-001/002/003; contratos congelados H4-013/014 | Acto original 17-10-2026 10:00Z inalterado. Evidencia anterior/igual válida si satisface resto de guardas; posterior E3, sin mutación de cancelación/economía/historia. Fechas civiles13/17/18Oct dan derecho200/100/0 para base200 y servicio20Oct. No usar reloj real como oráculo comercial. |
| S04 | Plan §7.1/§8; SPEC-FR-IDEMP-001/004; V-AT | Replay equivalente conserva resultado/historia, cambio material E2. Contexto ajeno/claim/cobertura/certeza inválidos no autoriza. Evidence original inmutable. No duplicación ni pago por cancelación. |
| S05 | SPEC-FR-CONC-001/003; V-AT; aserciones originales H4-014 C27/C28 y H5-016 A03 | Los siete casos conservan éxito/conflicto/replay exactos; el octavo alcanza dos esperas reales y resultado original, plazo15s intacto. Comparación original/G repetible, sin instrumentar validaciones de producto. |
| S06 | tasks H5-018; AC-070/072/081; SPEC-FR-ERR-001; Plan §11.2 | E1–E8, incertidumbre E4, permisos/contextos/correlación, A→B→A y recuperación histórica explícita. Reejecutar reproductores protegidos y variantes sobre F mediante hook recibido. |
| S07 | V-MIG/V-DAT §2.2; SPEC-FR-SEC-001/002/003/005 | 68 SQL byte-identical. Base vacía y67 poblada→68; comparar filas, identificadores, ACL/owners/RLS/FORCE, rollback/recuperación/reaplicación. Denegar identidades ordinarias sin autoridad; sin secretos ni cuerpos en diagnóstico. |
| S08 | V-DOM/V-EVI; selección histórica protegida | Reejecutar196 archivos/15 fases disjuntas:2945 casos candidato, incluidos10G y15quinta. Catalogar27 sustituciones históricas; no nuevas exclusiones. Mapear cada303 FAIL quinta al caso actual; no sumar repeticiones/unitarias/health/contrapruebas. |
| S09 | V-EVI y preservación histórica | Unitarias,health,instalación congelada,typecheck,lint,build,auditoría dependencias actuales. Identidad de inputs de cada ejecución y postcheck completo de réplica/workspace antes de retirar réplica. |
| S10 | BR-HIST-003/004; SPEC-FR-SEC-006; DM-PENDING-005 | Preservar cinco FAIL, sellos/inventarios y456 inputs H5-016 con única transición autorizada. OPEN/IN PROGRESS y STOP, sin publicación ni H5-019/H6. |

Controles adversariales propios A–N: antes/igual/después; fechas civiles diferentes; dos instantes reales y repetición; cancelación válida/inválida; evidencia histórica/contexto erróneo/cronología contradictoria; sin efectos colaterales; historia y negativos originales. Evidencia explícitamente posterior jamás normalizada por G.

Criterio de dictamen: FAIL ante defecto material reproducido y repetido; BLOCKED solo evidencia indispensable imposible de obtener; PASS local únicamente tras verificación íntegra y sin defectos materiales abiertos. Congelar este documento antes de ejecutar; observados se escriben aparte. No adoptar resultados del implementador como esperado.
