# TSK-H5-017 — Candidato de implementación, Bloque A

2026-10-16. **PASS de implementación y verificación interna del candidato corregido, exclusivamente local/aislado.** Pendiente de aceptación y revisión independiente. H5-017 permanece IN PROGRESS. H5-018/H5-019/H6 no iniciadas por este encargo; H6-015/H6-017 no acreditadas. Sin commit, push, deploy, datos ni operaciones reales.

## Base, fuentes e integridad

Tras fetch: `HEAD = main = origin/main = 9649a2773530ea8a43237b4e1f2034f80e34136f`, divergencia0/0, índice vacío y árbol limpio. No se facilitó un SHA distinto en la misión; se estableció la base publicada actual por identidad de los tres refs y sus antecedentes. Se verificaron los456 inputs sellados de H5-016 y se inventariaron los36.778 archivos versionados antes de modificar. Los encabezados históricos de prepublicación no se confunden con el estado Git actual.

Fuentes consultadas: Constitución, README, Decisions pertinentes, estado/pasos actuales, Tasks ficha H5-017/§2.2/§6/§7; Plan B01/B07/B08/B10, C01/C04 y §§7.1/8/11.2; SPEC §19/§21/AC-072/AC-081/NFR-009/010/014; ARCH §13; DM-INV-047, reglas de privacidad/automatización y SM-FORB-27. Se revisaron contratos y evidencias de H4-024, H5-008, cierre vigente H5-012 y auditoría H5-016, preservando sus resultados históricos. La [matriz previa](matrix-TSK-H5-017.md) conserva las diez asignaciones literales y nueve obligaciones derivadas. Sin AGENTS.md propio del repositorio; se aplican las instrucciones del usuario.

## Implementación y contratos

- Dominio: `operation-diagnostic.ts` usa E1–E8 y descriptores ya existentes, validación de raíz/referencias, estados técnicos y paginación explícita1–100. El límite de página es un límite técnico de salida, no un umbral operativo de avisos/reintentos.
- Adaptador: `H5017DiagnosticAdapter` aporta record/read autenticados por F1/F2 en transacción, interacción adecuada, ámbito del administrador y revalidación final. Construye cada campo permitido; errores constantes sin detalles SQL, originales o contenido restringido.
- Frontera de operación: `invokeDiagnosticOperation` envuelve un contrato ya autorizado, conserva todas las causas permitidas, clasifica excepción de efecto desconocido como E4/pending y no reintenta. El escritor se aporta vinculado a Auth por la composición del servidor. El callback mantiene sus propias guardas de negocio; esta envoltura no concede autoridad para ejecutarlo. Una indisponibilidad del registro devuelve `diagnosticRecorded:false` sin alterar un hecho/resultados conocidos, ni generar avisos recursivos. El sink recibe solo referencias y códigos, nunca payload/value/excepción.
- Migración64: `20261016142812_h5_protected_diagnostics.sql`. Añade un localizador técnico append-only `b10_diagnostic_observations`, tres helpers privados y dos APIs estrechas. Reutiliza roles existentes; RLS/FORCE RLS, sin CRUD directo para runtime/TTE/anon/authenticated y sin permiso PUBLIC. No cambia funciones, tablas ni migraciones anteriores. Un fallo antes del commit revierte la migración íntegra y permite repetirla; tras commit se prevé corrección hacia delante mediante migración nueva, preservando observaciones, sin down destructivo.
- Consulta: petición opaca, operación, ejecución o evento llevan a nodos de procedencia existentes, historial/actor/momentos, versiones y aprobaciones, responsable y ejecutor diferenciados, partes/intentos, estado/concesión/antigüedad de trabajo, alertas/notificaciones, recibos externos y objetos incompletos. El catálogo de fuentes es cerrado; todos los joins se limitan al ámbito y raíces relacionadas. Resultados ordenados y paginados; recorrido de referencias dentro de la raíz, sin consulta indiscriminada de otras raíces. La entrada exige una raíz booking/opportunity/contact/organization, como las proyecciones H5-012; no ofrece una búsqueda global de expedientes por conocer una referencia. Otros registros se localizan por sus vínculos a la raíz autorizada.

Una operación que falló antes de persistir puede tener identidad intentada sin fila de operación: la observación conserva esa referencia, no fabrica un hecho ni una FK a una operación inexistente. executionId/eventId, cuando se aportan, deben existir en el contexto autorizado y mantienen FK. El registro técnico y sus outcomes no acreditan pago, Acceptance, entrega, cierre, efecto externo ni exactly-once; la respuesta lleva `technicalOnly:true`.

El diagnóstico contiene referencias a la historia original, no copias de before/after, motivos libres, materiales, cuerpos ni resultados completos. El detalle se investiga por los contratos autorizados propietarios. `authorizedEvidenceRef` permite recuperar el original mediante B07 con autenticación/contexto vigentes; poseer su ID no permite usar otra raíz. Aprobación/ejecutor y resultados inciertos quedan diferenciados. La nueva superficie se entrega como módulos de servidor siguiendo la convención del repositorio, sin añadir interfaz pública, conectores ni scheduler.

## Pruebas y resultados

Entorno: Node24.21.0, pnpm11.19.0, PostgreSQL17.11 Postgres.app; Storage oficial pinned `5def1dfc15ab7f08fe271c7d1e70542424524e4e`, backend file y conexiones loopback con credenciales efímeras sintéticas. Roles de migración y ejecución separados. Los resultados nuevos pertenecen al candidato sin commit y a los hashes de cada recibo, no al SHA base por sí solo. Los manifests amplios de algunos controles incluyen las cuatro copias temporales de regresión: el verificador reconstruye sus bytes exactos desde originales protegidos y las sustituciones de import registradas. Dos versiones preparatorias del propio verificador, inventariadas antes de ejecutarlo, se conservan por hash en gzip; ninguna ejecutaba ni cambiaba aserciones de producto.

| Batería | Resultado propio | Evidencia |
|---|---|---|
| Focal H5-017 corregida |32/32 PASS, incluidas una vez en57/57 junto a25 regresiones H0 | `26-corrective.*` |
| Migraciones/permisos/advisors | Incluidos en32: instalación64, upgrade63 poblado, rollback provocado y reintento;171 tablas y297 funciones anteriores preservadas;0 funciones anteriores cambiadas; advisors results[]; instalación con roles API presentes y ausentes | `26-corrective` |
| Regresión adicional sobre64 |104/104 PASS | `27-regression-on64-final.*`; copias solo cambian import de arnés; originales intactos |
| Unitarias |201/201 PASS =197 anteriores +4 nuevas | `28-unit-final.*` |
| PostgreSQL completo inicial |2762 PASS /25 FAIL de2787; original conservado | `16-postgres-complete.*` |
| PostgreSQL completo corregido |**2788/2788 PASS**,0 fail/cancelled/skipped; una ejecución integral limpia | `36-postgres-complete-final.*` |
| Health separado |1/1 PASS | `31-health-final.*`, fuera del conteo PostgreSQL |
| Frozen install / typecheck / lint / build / audit | PASS; audit0 vulnerabilidades | Recibos29/30/32/33/34, todos del candidato corregido |

Las focales iniciales26/26, ampliadas31/31 y corregidas32/32 son retests/ampliación del mismo bloque: no se suman como89 pruebas nuevas. El correctivo26 ejecuta57 casos físicos:25 H0 repetidos y32 H5-017 propios. La completa final contiene2756 anteriores y32 nuevos, incluidos una sola vez. No se obtiene2788 sumando retests ni se reutiliza como PASS la completa inicial fallida. Las104 de regresión adicional tampoco se suman a la batería completa. Los resultados históricos de H4-024/H5-008/H5-012/H5-016 se reutilizan como contratos y antecedentes, no como ejecuciones H5-017. [Defectos, originales y contrapruebas](defects-TSK-H5-017.md).

## Límites y siguiente revisión

DM-PENDING-005 y BR-PENDING-014/015/019/020 siguen abiertos: sin plazo de conservación, anonimización, eliminación o audio supuesto. La tabla no activa políticas de borrado ni de uso real; una política posterior requiere su propia autorización y evolución versionada. No se introducen reintentos productivos, frecuencias, umbrales/SLA, scheduler, avisos reales, proveedor, UI de operación ni servicios de negocio externos. El acceso real/Hosted/Production y PLAN-AUTH pendientes no se acreditan mediante estos ensayos.

Para H5-018, el auditor deberá revisar las diez asignaciones y D01–D09; frontera de operación frente a callback autorizado; E4 ante efecto ya ocurrido y excepción; coexistencia de causas; procedencia y transiciones sin inferencia; recorrido/paginación y catálogo SQL de fuentes; raíces compartidas y ámbitos; permisos/F1/F2 y check final; originales B07; inmutabilidad y migración/rollback; pérdidas del registrador y ausencia de contenido confidencial en errores/logs. También deberá contrastar las limitaciones de integración H6 y DM-PENDING-005. Esta lista identifica superficies; no se ejecuta esa auditoría ni se la atribuye a un tercero.


## Integridad y entrega

La verificación reproducible `python3 scripts/verify-h5-017-candidate.py` exige los recibos finales correctivo57/57, regresión104/104, unitarias201/201, health1/1, completa2788/2788 y todos los gates de calidad. Contrasta cada input con el candidato actual o, únicamente para copias temporales y versiones no ejecutadas del propio verificador, reconstruye/verifica los bytes originales identificados por hash. No admite otra transición de producto.

Los36.775 archivos históricos ajenos a los tres documentos de estado permanecen intactos, incluidos456 inputs H5-016, todos los expected, migraciones1–63, health y evidencias FAIL anteriores. La restauración lossless de los tres outputs históricos regenerados está registrada en `36-historical-output-restoration.json`; no modifica sus originales. Los tres documentos modificados son PROJECT-STATUS, NEXT-STEPS y Tasks (prefacio y metadatos de H5-017), con el contenido normativo y las tareas posteriores conservados. No archivos tracked eliminados. El índice real queda vacío; el árbol contiene únicamente el candidato sin commit/publicación.

Producto nuevo: tres módulos TypeScript y migración64. Verificación nueva: tres suites PostgreSQL, cuatro casos unitarios dentro de una suite, tres soportes y tres scripts de captura/regresión/integridad. Se añaden matriz, defectos, este informe y capturas propias. El inventario exacto final incluye rutas, bytes, modos y SHA-256 de cada cambio; excluye su propio hash y el recibo que lo referencia para evitar autorreferencia. Los conteos exactos e identidad se encuentran en el inventario y `final-verification.json`.

**Defectos materiales abiertos:0 en el alcance probado.** F01 (correlación) y F02 (roles API ausentes) CLOSED localmente; errores de preparación/verificador corregidos y originales conservados. Sin obligaciones propias pendientes dentro del alcance declarado. Permanecen aceptación humana, H5-018 y las integraciones/puertas de uso real indicadas. Se entrega el candidato y se aplica STOP sin iniciar ninguna de ellas.
