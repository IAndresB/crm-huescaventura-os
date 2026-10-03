# H3-006 — FAIL originales y defectos

Expected 75 casos congelado en034ddc0; nunca adaptar al producto.

H3-006-F01 — Producto/V-MIG: primera instalación focal falla42601 por variable `full` reservada. SQL inicial y raw FAIL conservados. Corrección inequívoca: nombre `full_cents`. Pendiente de reproducer y regresión completa.

H3-006-F02 — Producto/C03/V-MIG: variable `revision` ambigua en consultas laterales de cobertura y verificación. Segundo SQL y FAIL/diagnóstico sin secretos conservados. Corrección: referencias explícitas `ar.revision`/`ar.snapshot`. Pendiente reproducer y regresión.

H3-006-F03 — Verificador R18/R30: FAIL original independiente 73/75 conservado. R18 reutilizaba por error la identidad de operación del plan para su verificación materialmente distinta; E2 lo rechaza correctamente. R30 exigía un literal de error no normativo, aunque la ausencia de D019 era rechazada sin escritura. Corrección del verificador: nueva identidad para el acto separado y comprobar el rechazo y rollback, sin imponer un mensaje no previsto. Expected normativo intacto. Pendiente reproducer y regresión.
