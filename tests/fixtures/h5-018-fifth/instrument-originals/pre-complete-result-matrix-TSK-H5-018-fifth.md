# Quinta auditoría H5-018 — matriz normativa independiente

Oráculo previo: [expected congelado](expected-TSK-H5-018-fifth.md). Se conservan sus dos aclaraciones aditivas de instrumentación V01/V03: [primera](expected-TSK-H5-018-fifth-clarification.md), [precisión definitiva](expected-TSK-H5-018-fifth-clarification-v2.md). La primera describió incorrectamente la lectura B07 por padre; la segunda delimita el control correcto de fuente original más relación canónica. Ni expected originales ni producto se modificaron.

Las trece asignaciones de Tasks §6 y sus líneas literales están capturadas en `tests/fixtures/h5-018-fifth/normative-sources.json`, con hashes de los ocho documentos fuente. También se conservan dos filas transversales de pendientes de §7. No son quince asignaciones nuevas.

| Norma / fila Tasks | Obligación contrastada | Ejecución actual y resultado focal |
|---|---|---|
| SPEC-FR-HIST-001 /2659 | Procedencia, actores, fuente, versión, historia y observación inmutable. | V01–V06; R01/R02, T01/T07, Q02–Q04, F-P/F-R en01/06; PASS. |
| SPEC-FR-ERR-001 /2688 | E1–E8 distinguibles, E4 no degradado por excepción ni confundido con resultado acreditado. | A01–A09 originales, incluida composición tras efecto durable, captura01 PASS. |
| AC-070 /2777 | Fallo persistente visible, stop/withdraw eficaz, canal ausente no es entrega, sin recursión ni retry ilimitado. | A13 original en01 PASS; regresión B08 seleccionada en08. |
| AC-072 /2779 | Ocho causas con alcance y continuidad; excepción con efecto incierto sigue E4. | A01–A09 y original A04,01 PASS; observaciones V04 siguen pending sin efectos duplicados. |
| AC-081 /2788 | Investigar por petición/operación/ejecución/evento mediante fuentes autorizadas. | V01/V02/V03/V04/V06/V07, originales R/T/Q y F;01/06 PASS. Referencias no sustituyen hechos. |
| SPEC-NFR-009 /2808 | Reconstrucción histórica exacta, registros separados, datos intactos. | V01/V03/V04/V06; V08 compara175 tablas;04/06 PASS. |
| SPEC-NFR-010 /2809 | Diagnóstico mínimo, contexto correcto y ausencia de cuerpos/secretos/URLs. | A10/A14 en01, V02/V07 en06 PASS; proyección histórica estática revisada. |
| SPEC-NFR-014 /2813 | Reintento seguro, resultado incierto preservado, duplicaciones y efectos laterales impedidos. | A04/A16, F-R01/F-R05 y V04/V06;01/06 PASS. H6-015 no acreditado. |
| DM-INV-047 /2866 | Cambio material conserva quién/cuándo/motivo; timeline no amplía permisos. | V01/V02/V03/V05/V07; fuente retirada impide acceso/replay y restaurada recupera original;06 PASS. |
| SM-FORB-27 /3056 | No declarar éxito ni repetir efecto sensible ante incertidumbre. | A04/A16 y V04; E4 persistente y una fila por identidad;01/06 PASS. |
| P12 /3097 | Secretos fuera de logs/salidas; privilegios mínimos. | A14/A15 en01; V08 con16 denegaciones directas en04 PASS. |
| PLAN-B08 /3127 | Definition/version, ejecución, reclamación, historia, aprobación y resultado mantienen propietarios. | V01/V02/V03/V06; F-P01/P02/F-R05;01/06 PASS. |
| PT-11 /3162 | Autorización efectiva y revocación, denegación por defecto, RLS/roles. | A15, Q04 revokeOne/revokeAll, F-R02, V05 y V08;01/04/06 PASS. No certificación integral H6-017. |

## Contrapruebas nuevas y evidencias

| Caso | Precondición / secuencia / esperado | Resultado y evidencia |
|---|---|---|
| V01 | Dos ejecuciones con coincidencia UUID operación/ejecución; A→B→A con evidencia de retorno distinta y finalidad correcta. Par falso denegado, versiones A1/3, pagina1=pagina100. | PASS06; intento02 falló antes por finalidad mal copiada, conservado. |
| V02 | A→B→A→B; operación original explícita desde B, restricción y restauración de fuente original y actual. | PASS06; marcadores históricos1/A, bulk excluye operaciónA, escritura falsa denegada, trabajo ajeno excluido. |
| V03 | Servicio→reserva→oportunidad→servicio de una cadena canónica ordinaria; consulta de fuentes en su contexto original y control de reserva ajena. | PASS06; dos observaciones/replays preservados. Fallos02/05 del oráculo/invocación propia conservados y aclarados, no defectos materiales. |
| V04/V05 ×5 | Operación/ejecución/ambas/evento/todas; dos sesiones legítimas para primera identidad; A→B→A; revocar sesión y establecer otra; cuatro replays y contenido conflictivo. | 5 PASS06; una inserción, replays mismo id, conflicto denegado, sin cambio a observaciones/operaciones/historia. Evento retirado/restaurado en2 variantes. |
| V06 ×2 | Intento desconocido, A→B→A, confirmación posterior por propietario correcto o distinto dentro de la misma raíz. | 2 PASS06; correcto pasa a canonical sin reescribir observación; incorrecto deja de ser consultable/repetible. |
| V07 | Ejecución trasladada; tarea/evidencia originales y referencias ajenas; consultas y escrituras negativas. | PASS06; cuatro escrituras denegadas y cuatro consultas vacías; tarea no transferida. Colisión adicional registro/ejecución cubierta por E-I06 en08. |
| V08 ×2 | Cluster nuevo68 y67 poblado; catálogos/datos/dependencias, error DDL, rollback, restauración/reaplicación, privilegios directos. | 2 PASS04, revisión detallada en migration-review; vuelve a ejecutarse en08. |

La SQL privilegiada usada para retirar enlaces es una perturbación de fuente exclusivamente sintética, identificada como tal; no se inventa una API ordinaria de desvinculación. La revocación de sesión sí utiliza el contrato real de B01. D025 se respeta: distintas sesiones del mismo administrador, sin fabricar un segundo administrador.

## Protocolos y conteos

V-DOM: fuentes y casos anteriores. V-DAT: PostgreSQL real aislado, permisos, referencias y filas exactas. V-MIG: dos casosV08. V-NEG: negativas de referencias, permisos y efectos. V-AT: primera identidad concurrente y replay; F-R05 con revisión durante espera y dos sesiones, repetido en01. V-EVI: capturas append-only, huellas de inputs, casos por nombre, originales y preimágenes conservados; inventario/sello propios.

Captura01:71/71; captura04:2/2; captura06:11/11. Esas baterías solapan la completa08 y no se suman. Completa08 selecciona192 archivos recibidosF más2 nuevos:2920 casos de regresión y13 nuevos. El resultado final, fases, estado del postcheck y dictamen se acreditan en el informe A–R y `current-coverage.json`, no por anticipación desde esta matriz. Las unitarias208 y health1 se mantienen separados.

`selection-audit.json` explica los27 archivos históricos fuera de los194 seleccionados entre221 físicos: sustituciones autorizadas anteriores, instrumentos temporales con aclaración normativa previa y auditoría histórica de migración66. No se atribuye PASS actual a archivos no ejecutados. Las13 contrapruebas nuevas no sustituyen la regresión; la regresión tampoco define su esperado.

DM-PENDING-005 OPEN; retención, anonimización, eliminación y parámetros operativos no inferidos. H5-017/H5-018 IN PROGRESS; H5-019/H6 no iniciados. La recomendación de aceptación y publicación corresponde al conjunto exactoF y queda sujeta al director, con alcance local/aislado.
