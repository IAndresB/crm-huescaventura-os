# Defectos H3-002 — primer pase sobre e578241

Expected congelado en8d1f527 intacto. first-formal.log:56/60 PASS,4 FAIL.

- F01 material de producto: R29/R32; lectura de ajustes convierte numeric exacto en JSON number. D023/Plan§5.2/PM08, precisión monetaria y reconstrucción; esperado cadena decimal y diferencia exacta -500.01/+500.01. Proyección debe conservar texto monetario, no representación binaria. Reproducer: original numeric en to_jsonb, demanda string.
- F02 material de producto: R55; falta comprobación jsonb_typeof base.amount en API SQL; JSON number1000.01 entra como importe autoritativo. H1/D023/PLAN-DEC006 y R55 exigen fail closed ante number/float. Reproducer: petición firmada idéntica salvo amount numérico con evidencia sintética vinculada; original debe mostrar aceptación indebida.
- F03 de verificador: R53 compara literalmente last_human_activity_at antes/después de acto autorizado; H0/D026/F2 debe avanzar esa actividad. El expected conserva H0–H2; comparar hechos de negocio e identidad completos y comprobar avance monotónico explícito de este único campo es la corrección del harness, no un cambio de expected. Log/test originales retenidos; reproducción pide fallo de la comparación original.

Estados iniciales OPEN; solo cerrar tras matriz y regresión completas. SQL y verificador originales conservados con FAIL.
