# Defectos H3-002 — primer pase sobre e578241

Expected congelado en8d1f527 intacto. first-formal.log:56/60 PASS,4 FAIL.

- F01 material de producto: R29/R32; lectura de ajustes convierte numeric exacto en JSON number. D023/Plan§5.2/PM08, precisión monetaria y reconstrucción; esperado cadena decimal y diferencia exacta -500.01/+500.01. Proyección debe conservar texto monetario, no representación binaria. Reproducer: original numeric en to_jsonb, demanda string.
- F02 material de producto: R55; falta comprobación jsonb_typeof base.amount en API SQL; JSON number1000.01 entra como importe autoritativo. H1/D023/PLAN-DEC006 y R55 exigen fail closed ante number/float. Reproducer: petición firmada idéntica salvo amount numérico con evidencia sintética vinculada; original debe mostrar aceptación indebida.
- F03 de verificador: R53 compara literalmente last_human_activity_at antes/después de acto autorizado; H0/D026/F2 debe avanzar esa actividad. El expected conserva H0–H2; comparar hechos de negocio e identidad completos y comprobar avance monotónico explícito de este único campo es la corrección del harness, no un cambio de expected. Log/test originales retenidos; reproducción pide fallo de la comparación original.

Estados iniciales OPEN; solo cerrar tras matriz y regresión completas. SQL y verificador originales conservados con FAIL.

- F04 de verificador de regresión: PostgreSQL completo sobre6f53c32 termina680/681 PASS por R35 H2-011:31!==30. Inventario vivo incluye migración H3 futura al comparar con base histórica d9d7636 (30). Expected de preservar30 migraciones H2 y sus bytes intacto; se limita inventario a bookingMigration, sin retirar comparaciones/ensayo V-MIG. Original verificador y FAIL completo conservados; nuevo reproducer exige31 y el FAIL30 original. Corrección necesaria para continuar H3 sin modificar producto/normativa H2. Estado OPEN hasta regresión fresca completa.

Cierre tras regresión fresca completa sobre `a2bbcd0cf85ebd3f0ecdf9d0383d7d54df3ae9a0`: **F01/F02/F03/F04 CLOSED local/aislado**, cuatro reproducciones históricas PASS y682/682 PostgreSQL +86/86 unitarias; cero abiertos. Expected intacto y originales/FAIL preservados.
