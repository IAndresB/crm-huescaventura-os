# H5-018 — segunda auditoría independiente: esperado previo

Candidato exclusivo: H5-017-C, inventario completo SHA256 b44d4adadcb907340094b617ad8445c162daef4df21ae2d8b05c300b543e2602. Base 9649a2773530ea8a43237b4e1f2034f80e34136f. Identidad comprobada antes de escribir instrumentos nuevos.

Oráculo: Constitución P05/P06/P07/P10/P11/P12/P13/P14; Tasks fichas H5-017/018, §2.2 y filas §6; SPEC HIST-001/ERR-001, AC070/072/081 y NFR009/010/014; Plan §§4,7.1,8,11.2, C01/C04; DM-INV-047 y SM-FORB-27. Se han consultado directamente. Las 13 filas asignadas y los 20 esperados de la primera auditoría siguen vigentes: misma norma y bytes, independencia metodológica declarada antes de sus pruebas; no se usa el PASS C como oráculo. A17 se extiende de64 a65, A18 reconoce explícitamente455 identidades y1 transición autorizada. No implica independencia de persona/modelo: este chat conserva historia del implementador.

| Caso nuevo | Fuente | Secuencia y esperado |
|---|---|---|
| S01 | P10, C01, AC081, DM-INV-047 | Referencia executionId inicialmente válida; revisión autorizada con nueva aprobación/contexto y lector original que ya deniega el contexto anterior. El diagnóstico debe revalidar la vinculación; no seguir mostrando una ejecución actual de otro contexto como propia. Historia original inmutable. |
| S02 | P10, C01/C04, DM-INV-047 | Tras revisión a otro contexto, proyectar versiones/historia no debe dar acceso indirecto a IDs/evidencia del contexto anterior si el lector original la deniega en el contexto consultado. Relaciones históricas autorizadas deben conservarse sin ampliar permisos. |
| S03 | Plan7.1, AC072, SM-FORB-27 | Composición real: fallo previo conocido E5 sin ejecutar; excepción desconocida tras inicio E4/pending con llamada única; efecto durable seguido de excepción E4; rechazo y éxito explícitos conservados. Replay previo/conflicto/incierto y falta de autorización no vuelven a ejecutar. Ningún éxito técnico acredita negocio. |
| S04 | P10/P12, C01, AC081 | Mismo UUID en tipos distintos y referencias indirectas, sin Auth, revocación, errores constantes y evidencia restringida: nada fuera de autorización. Rutas legítimas preservadas. |
| S05 | V-MIG, P13, P10 | Migraciones64/65 limpias y upgrade con datos, rollback/reintento, firmas/ACL/RLS/FORCE y anteriores preservados. Instrumentos de migración se contrastan con catálogo real y fuentes. |
| S06 | P06/P07, V-EVI | Reutilizar solo evidencia histórica con entradas exactas vigentes, logs/códigos de salida y selección comprobados; no sumar solapamientos. FAIL históricos inmutables. |

Todo hallazgo material conserva el FAIL, norma, causa e impacto; se continúa comprobación segura, sin modificar producto ni sellos anteriores. Sin commits/push/deploy ni trabajo posterior. DM-PENDING-005 abierto; H5-017/018 no COMPLETED. STOP al entregar.
