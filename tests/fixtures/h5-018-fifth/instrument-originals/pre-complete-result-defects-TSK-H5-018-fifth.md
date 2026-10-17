# Quinta auditoría — hallazgos y clasificación

## Defectos materiales del candidato F

Ningún defecto material reproducible confirmado por la revisión estática, los71 casos focales recibidos repetidos, las11 contrapruebas funcionales nuevas y los2 casos V-MIG independientes. El resultado completo y su postcheck se acreditan separadamente en el informe A–R y `current-coverage.json`; esta conclusión no se extrapola a Hosted/Production.

Los cuatro reproductores H5-018-4-F01 y los tres H5-018-4-F02 pasan sobre68 en la captura01. El verificador de resultados exige además sus nombres exactos dentro de la selección completa actual. Las cuatro auditorías anteriores conservan FAIL sobre sus propios candidatos; no se reescriben ni se les atribuye retrospectivamente PASS.

No se propone ni aplica correctivo de producto. Aceptación/publicación requieren decisión expresa del director sobre el conjunto exactoF, manteniendo los límites de privacidad y entorno.

## Incidencias del instrumento independiente

| ID | Evidencia preservada | Causa y resolución | Clasificación |
|---|---|---|---|
| AUD5-I01 | Captura02, V01 WORK_APPROVAL_REQUIRED; `instrument-originals/sequences-v1.ts`. | El fixture cambió recordId, pero copió purpose de una comunicación anterior. La revisión fue correctamente denegada antes de probar la colisión. Se trasladó la finalidad de la evidencia nueva junto a su identidad. V01 PASS05/06. | Precondición incorrecta del auditor. Sin cambio de producto. |
| AUD5-I02 | Captura02 V03, captura05 V03; expected inicial y ambas aclaraciones; instrumentosv1/v2. | La primera aserción trató como ajena la oportunidad canónica de la propia reserva. BR-BOOK-001/BR-HIST-002 permiten esa procedencia. El primer retest invocó además B07 con el contexto del padre, pero el lector directo exige contexto exacto. La precisiónv2 verifica la fuente en opportunity y la relación canónica creada por el flujo ordinario; una reserva distinta sigue denegada. V03 PASS06. | Interpretación e invocación incorrectas del auditor, explícitamente corregidas. Ninguna supresión de FAIL o norma nueva. |

La captura02 tiene9 PASS/2 FAIL y la05 tiene10 PASS/1 FAIL. No se contabilizan como baterías PASS. La captura06 tiene11/11 PASS con la versión final del instrumento. Las preimágenes permiten reconstruir cada captura por SHA256. El expected original permanece intacto; las aclaraciones son aditivas y visibles.

Se creó por error un archivo propio vacío ` spec.tmp` durante la escritura documental y se retiró inmediatamente; nunca fue input de ejecución ni parte del candidato. El inventario final exige que solo permanezcan rutas de la quinta auditoría. No se tocó un archivo recibido para resolver este error.

## Límites explícitos

- Restricción/restauración de enlaces de evidencia: perturbación SQL privilegiada de datos sintéticos; no se presenta como API ordinaria de revocación B07.
- Revocación de sesión: contrato real B01, con nuevas sesiones legítimas del mismo administrador D025. No se atribuye una fuga entre usuarios.
- Replay sin efectos laterales: se comprueban observaciones, operaciones e historia; no se afirma ausencia de toda actividad técnica de autenticación/capacidades.
- La selección completa mantiene versiones históricas de sus ensayos de migración. No se afirma que cada archivo físico histórico instale68.
- DM-PENDING-005 sigue OPEN. No se fijan conservación, eliminación, anonimización ni parámetros operativos.
- H5-017/H5-018 siguen IN PROGRESS. No commit/push/deploy, H5-019/H6, H6-015/H6-017, datos o servicios de negocio reales.
