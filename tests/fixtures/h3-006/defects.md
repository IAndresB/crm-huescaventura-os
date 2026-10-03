# H3-006 — FAIL originales y defectos

Expected 75 casos congelado en034ddc0; nunca adaptar al producto.

H3-006-F01 — Producto/V-MIG: primera instalación focal falla42601 por variable `full` reservada. SQL inicial y raw FAIL conservados. Corrección inequívoca: nombre `full_cents`. Pendiente de reproducer y regresión completa.

H3-006-F02 — Producto/C03/V-MIG: variable `revision` ambigua en consultas laterales de cobertura y verificación. Segundo SQL y FAIL/diagnóstico sin secretos conservados. Corrección: referencias explícitas `ar.revision`/`ar.snapshot`. Pendiente reproducer y regresión.

H3-006-F03 — Verificador R18/R30: FAIL original independiente 73/75 conservado. R18 reutilizaba por error la identidad de operación del plan para su verificación materialmente distinta; E2 lo rechaza correctamente. R30 exigía un literal de error no normativo, aunque la ausencia de D019 era rechazada sin escritura. Corrección del verificador: nueva identidad para el acto separado y comprobar el rechazo y rollback, sin imponer un mensaje no previsto. Expected normativo intacto. Pendiente reproducer y regresión.

H3-006-F04 — Producto/D019: R32 ampliado a subcasos de campos materialmente nulos encontró una admisión indebida de base revisada con `kind: null`. El condicional SQL podía resultar UNKNOWN. FAIL y SQL originales conservados. Fuente: D019, SPEC-FR-CHG-008/ECON-002, AC-023/040 y fila D019 asignada; R30–R32 congelados exigen derecho determinado previo. Corrección inequívoca: tipo string no nulo y valor no vacío para cada campo material; razón y fuente no pueden delegarse en mera presencia de clave. Pendiente reproducer y regresión completa.

H3-006-F05 — Verificador/reproducer: nombre de base efímera con F01 mayúsculo, incompatible con el helper de conexión y el identificador SQL plegado a minúsculas. Setup falló y dejó conexión de bootstrap abierta; ejecución interrumpida y cluster exclusivamente sintético detenido. Raw conservado. Corrección mínima: etiqueta minúscula. Ningún cambio de expected ni producto; pendiente rerun completo sin cancelados.

H3-006-F06 — Producto/revisión: R46 con revisión de Schedule nula (clave presente) admitía una asignación porque el condicional SQL daba UNKNOWN. FAIL y SQL originales conservados. Fuente: PLAN-DEC-004/E2, SPEC-FR-CONC-003, AC-068, R46 congelado. Corrección: validar tipo numérico entero no negativo de revisión de Reconciliation y de Schedule cuando se proporciona; no aceptar null ni string ni fracción. Pendiente reproducer y regresión.

H3-006-F07 — Verificador, ampliación R11: retiraba Schedule/slot de la propuesta Reconciliation aunque el contrato H3-003/004 acreditado exige ese contexto de destino. PAYMENT_CONTEXT_REQUIRED es rechazo correcto; independencia de Customer Payment respecto de Expected no elimina guardas de Reconciliation. FAIL conservado. Corrección del verificador: conservar correspondencia H3-003 íntegra y probar destino de finalidad sin obligación enlazada cuando procede; añadir reproducer negativo de la retirada. Expected y producto H3-003 intactos.

H3-006-F08 — Verificador histórico/V-MIG: primera regresión completa 848/850, dos FAIL en reproducers F07/F08 H3-004 que contaban todas las migraciones futuras como parte de su base de 32. Fuente: V-MIG/preservación H0–H3-004 y R68–R75; conservar cadena histórica exige congelar su inventario hasta `paymentMigration`, sin modificar las 32 migraciones ni su expected original. Raw completo conservado. Corrección localizada exclusivamente del inventario de esos dos reproducer(s); añade reproducción mínima del 33 vs32 y filtro histórico32. Pendiente regresión completa.

## Cierre posterior a regresión completa

H3-006-F01–F08 **CLOSED local/aislado**, cero materiales abiertos. 4 de producto (F01/F02/F04/F06), 4 del verificador (F03/F05/F07/F08). Cinco reproducciones iniciales y dos añadidas forman 7/7 PASS; el reproducer F01 incluye el setup minúsculo corregido de F05. V-MIG poblado adicional PASS. Revalidación afectada 91/91 y final 852/852 PostgreSQL +100/100 unitarias sobre `3113028f26a906f2b4f6935ae0bb59877c59d74d`, 0 FAIL/skipped/cancelled; gates PASS. FAIL originales y SQL anteriores permanecen íntegros. Expected congelado sin modificación.

| Defecto | Fuente normativa exacta | Reproducer / cierre |
|---|---|---|
| F01 | Tasks §2.2 V-MIG; fichas TSK-H3-005/006 y PLAN-B05 | SQL original42601, instalación actual PASS |
| F02 | PLAN-C03/PLAN-T05; AC-068; V-DAT/V-MIG | Cobertura original42702, cualificada PASS |
| F03 | SPEC-FR-IDEMP-001/E2; Tasks §2.2 expected independiente | Identidad distinta por hecho distinto y rechazo/rollback PASS |
| F04 | D019; SPEC-FR-CHG-008/ECON-002; SM-RC-02/G2; AC-023/040 | NULL original admitido, actual bloqueado PASS |
| F05 | Tasks §2.2 V-MIG/V-EVI local/aislado | Setup minúsculo en reproducer F01 PASS |
| F06 | PLAN-DEC-004/E2; SPEC-FR-CONC-003; AC-068/G6 | Revisión NULL original admitida, actual bloqueada PASS |
| F07 | SPEC-FR-ECON-004; SM-RC-01/G2; precondición H3-004 acreditada | Contexto Reconciliation incompleto rechazado PASS |
| F08 | Tasks §2.2 V-MIG/V-EVI; R68–R75; preservación H3-004 | Inventario global33 frente a histórico32, filtro congelado PASS |
