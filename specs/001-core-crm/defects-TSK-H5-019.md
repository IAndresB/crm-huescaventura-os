# TSK-H5-019 — Defectos, limitaciones y pendientes

## Defectos materiales de producto

**Cero defectos materiales abiertos detectados en el alcance autorizado.** La regresión de 2.945 casos, los tres suplementos sobre la cadena 68 y las puertas g04 son satisfactorios. No se ha modificado producto. Los defectos históricos mantienen sus FAIL originales y las correcciones posteriores conservan su identidad propia.

## Incidencias de los instrumentos nuevos

| ID | Diagnóstico y resultado original | Corrección y estado | Evidencia recuperable |
|---|---|---|---|
| H5019-I01 | El postcontrol g02 terminó FALLIDA, exit 1. Sus nueve puertas terminaron exit 0, pero el inventario incluía `01-phases.json`, actualizado por la regresión paralela. Ningún input funcional ni archivo histórico cambió. | CLOSED local. El instrumento excluye de su copia únicamente los outputs actuales de H5-019. La serie g04 repite las nueve puertas y supera el postcontrol. | `02-gates.status.json`, `g02-gates.json`, `g02-postcheck-diagnosis.json`, logs originales, script anterior en `instrument-originals/`, serie g04. |
| H5019-I02 | El generador documental no se ejecutó por un SyntaxError en una expresión redundante para construir enlaces. No tuvo efecto sobre producto ni pruebas. | CLOSED local. Se elimina esa expresión; se preserva la fuente anterior. La generación de dependencias, resultados e informe termina correctamente. | `consolidation-syntax-original.json` y `instrument-originals/consolidate-before-link-syntax.py`. |
| H5019-O01 | El JSON de preflight se capturó después de crear el inventario propio y muestra ese instante con un archivo nuevo. La primera lectura Git de esta ejecución había mostrado el árbol limpio. | Aclaración documental. La captura original se conserva; no había cambios ajenos ni discrepancia de SHA. | `preflight.json`, `preflight-timing-note.json`, `received-inventory.json.gz`. |
| H5019-O02 | Las fichas H5-011, H5-013 y H5-015 conservan estados anteriores: NOT STARTED o IN PROGRESS. | Observación documental abierta para coordinación. La base COMPLETED indicada por el director se contrasta con código, manifiestos y auditorías posteriores. No se modifica Tasks ni se inventa una aceptación histórica. | Matriz de dependencias y `dependencies.json`, con el literal de cada ficha. |

Todos los archivos citados están en [tests/fixtures/h5-019](../../tests/fixtures/h5-019/). La réplica g02 se eliminó solo después de volver a verificar sus bytes; el recibo `g02-replica-release.json` conserva ese control. Los resultados FALLIDOS originales permanecen recuperables.

## Limitaciones conocidas

| ID | Límite conservado | Consecuencia |
|---|---|---|
| L01 | Solo datos sintéticos, PostgreSQL y Storage locales, Auth y canales simulados. | No acredita Hosted, Production, pagos, envíos ni disponibilidad real de proveedores. |
| L02 | Las 27 exclusiones de sexta se mantienen: 24 predecesores con derivada, dos instrumentos con prohibición histórica excesiva aclarada y una V-MIG66 ejecutada adicionalmente en sexta. | Los 2.945 casos corresponden a esa selección. Los dos instrumentos excluidos no reciben PASS actual. |
| L03 | H5-009 conserva dos logs originales no recuperados y su sustitución documental autorizada; también las 69 diferencias históricas de tablas y R67/R030. | No hay pérdida nueva. Una ejecución actual no recupera retroactivamente aquellos originales. |
| L04 | Los auxiliares G por defecto pertenecen al acto fijo del 17 de octubre, 10:00Z. | Otros actos requieren evidencia auxiliar explícita y coherente. No se acredita una corrección universal de relojes. |
| L05 | Las suites históricas instalan versiones fijadas de sus componentes. | No se afirma que los 2.945 casos instalen todos la cadena 68. I01–I03 y V-MIG68 verifican convivencia actual. |
| L06 | Hay 26 AC revisados y 187 asignaciones documentales inventariadas. | Las 187 asignaciones no son 187 pruebas PASS. Los 25 AC satisfactorios solo acreditan su tramo local; AC-073 conserva NO EJECUTADA. |
| L07 | Algunas contrapruebas históricas introducen corrupción sintética mediante un rol técnico de ensayo. | Esa preparación no se presenta como capacidad del usuario ordinario. Los permisos se verifican separadamente. |

## Decisiones y configuración pendientes

**DM-PENDING-005 permanece OPEN**, junto con BR-PENDING-014/015/019/020. No se fijan políticas definitivas de conservación, anonimización, eliminación, tratamiento de audio, tratamiento real de comunicaciones ni acceso real.

Se conservan los pendientes de Tasks §7 y Plan §12: PLAN-PENDING-003 y PLAN-AUTH-001–006 en su ámbito global; ARCH-PENDING-001/002; DM-PENDING-002/006; BR-PENDING-001/012/013/021/022/033/034/035. Cada uno mantiene su bloqueo localizado de capacidad, acceso, continuidad, fiscalidad, roles o conectores. Los parámetros y datos ausentes no reciben valores ficticios. PLAN-PENDING-001/002/004 y los SM-PENDING históricos mantienen sus resoluciones.

## Verificaciones reservadas a H6

**AC-073: NO EJECUTADA.** H6-014/015 deberán preparar y restaurar el conjunto, y conciliar efectos externos antes de reanudar. Los controles locales preventivos de incertidumbre y objetos no sustituyen esa prueba.

Las asignaciones explícitas siguen pendientes: AC-056/088 → H6-017; AC-057 → H6-006; AC-061 → H6-007; AC-067/068 → H6-016; AC-074 → H6-015. Permanecen además los E2E, las comprobaciones completas de acceso, dispositivos, papel, recuperación, migraciones, concurrencia y privacidad de H6. Hosted y Production no están acreditados. RPO/RTO, coste y periodicidad de continuidad no se inventan.

La auditoría independiente y la aceptación final de H5-019 y H5 están pendientes. No falta autorización para preparar este candidato local; commit, push, despliegue y ejecución de H6 quedan excluidos. **STOP.**
