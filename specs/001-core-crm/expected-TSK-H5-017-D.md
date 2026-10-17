# H5-017/H5-018 — esperado del correctivo D, previo al cambio

Base 9649a2773530ea8a43237b4e1f2034f80e34136f. C y segunda auditoría acreditados,37229 archivos previos. H5-018-2-F01 P2 abierto hasta reproducir y comprobar. No modificar pruebas/expected/evidencias anteriores. Autorización expresa del usuario para correctivo D local, sin publicación.

Fuentes: Constitución P06/P07/P10/P11/P12/P13/P18/P19; Tasks fichas H5-017/018, §§2.2/6/7; SPEC-FR-HIST-001/ERR-001, AC070/072/081; Plan B01/B07/B08/B10, C01/C04, §§7.1/8/11.2; BR-HIST-001/002/004, DM-INV-047 y SM-FORB-27. Las filas literales aprobadas siguen vigentes. El lector propietario B08 conserva historia autorizada de revisiones; una referencia histórica no habilita lectura universal ni del contexto actual ajeno.

| Caso | Esperado normativo |
|---|---|
| D01 A/H | Sin revisión: petición y operación canónica propias siguen localizables, sin duplicados ni hechos de negocio inferidos. |
| D02 B/C/D/K | Revisión autorizada A→B: la petición conserva un recorrido histórico válido con contexto y fecha originales; no exige que A y B muestren lo mismo. No exponer estado/evidencia/aprobación actuales de B en A. Originales y observación inmutables. R01 original pasa sobre sucesor66; R02 conserva su negativo. |
| D03 J | Revisiones A→B→C y regreso: cada operación histórica propia se distingue por su versión/contexto real. No aristas por mera coincidencia UUID. |
| D04 E/F/G/L | Consultas autorizadas por Auth/MFA/interacción/sesión/alcance actuales; falta o revocación deniega. Contexto tipo+UUID y evidencia original autorizada obligatorios, sin autorización derivada solo de la observación. |
| D05 I/M/N | Referencias ajenas o inexistentes no se vuelven canónicas por revisión, UUID, observación previa o historia de otro trabajo. Intento aún desconocido explícito; posterior canonización ajena se filtra. Rechazos sin observaciones ni efectos colaterales. |
| D06 | Repetir F01/F02/F03 originales y casos C: aislamiento, integridad y E4/pending tras efecto desconocido; E5 conocido conservado, sin retry ciego. |
| D07 V-MIG | Nueva66 forward;65 SQL intactos. Base limpia y upgrade65 poblado, aborto/rollback/reintento, filas/políticas/restricciones/ACL/RLS/FORCE y funciones anteriores preservadas excepto cuerpo mínimo documentado. Sin grants ni políticas nuevos. |
| D08 V-EVI | Full PostgreSQL con selección única identificada; unit/health/gates aparte; reutilizar solo entradas no afectadas justificadas. FAIL históricos intactos. D sellado con tamaños/modos/hashes y delta exacto frente a C y al preflight con segunda auditoría. |

No se incorporan políticas de retención/borrado/anonimización ni valores productivos. DM-PENDING-005 abierto. H5-017/H5-018 IN PROGRESS. STOP tras D interno para tercera auditoría independiente, sin ejecutar esa auditoría ni H5-019/H6.
