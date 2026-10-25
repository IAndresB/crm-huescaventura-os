# Plan reproducible TSK-H6-016

Entorno nuevo: worktree detached sobre `9c15e6d143822f7fcc84f29744194554630f4ac4`, árbol `fe7cabb05e44462121c70ad52405765e2c94fcd2`; PostgreSQL 17.11 local, cadena íntegra de 68 migraciones, Node 24.21.0 y pnpm 11.19.0. Software Storage fijado por el bootstrap publicado, sin conectores reales. Cada ejecutor/auditor usa TMPDIR, clústeres y puertos propios. Las claves sintéticas efímeras de ensayo no se incorporan a la evidencia.

1. Verificar fuentes, seis dependencias, identidad Git, hashes y candidatos protegidos antes de usar derivados.
2. Congelar esperado propio y esperado del auditor antes de implementar sus respectivos instrumentos.
3. Ejecutar T01–T07/T10/T11 con dos sesiones autorizadas en ambos órdenes, raíz común observada por backend y progreso de otra raíz. Probar hijo ausente cuando aplica, fallos antes del callback, primera escritura, escritura tardía y finalización; comprobar rollback e intento exacto posterior.
4. Suprimir el acuse real de COMMIT en relay loopback, comprobar rechazo incierto del llamador, efecto durable y recuperación por identidad. Separar el caso L de éxito conocido del caso Lwire real.
5. Ejecutar T08/T09 por las fachadas TTE publicadas: aprobación/reserva/start/result, claims y generaciones, lease vencida naturalmente, rollback/final check D039, eventos/dedupe, replay y autoridad actual. No simular atomicidad con mocks.
6. Ejecutar cruces X01–X08 y suplemento Provider Payment; conservar historia, datos de origen y ámbitos no afectados.
7. Repetir regresión dirigida con derivados identificados de H5-019 y H6-007. No ejecutar indiscriminadamente el historial global ni convertir su reconciliación en ejecución limpia.
8. Ejecutar unitarias, typecheck, lint y build sobre la composición final de fuentes. Revisar diff y formatos propios sin staging.
9. El auditor copia fuentes por hash, ejecuta réplica crítica y contrapruebas propias sobre otra base PostgreSQL. La independencia técnica de agentes del mismo modelo no equivale a auditoría humana externa.
10. Sellar logs originales, FAIL y sucesores, inventario, código, matriz, dictamen y recibos. Verificación independiente de custodia antes de formalizar aceptación local. Preparar variantes/parches de documentos compartidos sin sobrescribir originales.

Las invocaciones exactas, entornos permitidos, fechas, hashes de entradas y resultados están en las cápsulas de ejecución. `run-integration.py` conserva stdout/stderr, entradas y resultados por intento; no sustituye logs fallidos. Tras cualquier FAIL se conserva su fuente y se identifica su sucesor concreto. Las bases efímeras se cierran, y cualquier recuperación de un runtime propio queda documentada sin acceder a runtimes ajenos.
