# H5-018 — cuarta auditoría: esperado independiente congelado

2026-10-17 Europe/Madrid. Candidato E, base9649a2773530ea8a43237b4e1f2034f80e34136f, contenido0e0c08b8b70da6d12c2480eb8217cdf1e5df9b640c6dd1244f153b76a3be8191. Los37758 archivos recibidos son inmutables. Solo nuevas pruebas, instrumentos y evidencias de esta auditoría; sin producto, publicación, datos reales ni H5-019/H6.

Oráculo: Constitución P01/P06/P07/P10/P11/P12/P14; Tasks H5-017/H5-018, §2.2 y sus13 asignaciones literales §6; Plan B01/B07/B08/B10, C01/C04, §§7.1/8/11.2; HIST001/003/006, ERR001, AC070/072/081, NFR009/010/014, SEC001/002/003/005; BR-HIST001–005/SEC001–005, DM-INV047 y SM-FORB27/29. Las pruebas y declaraciones del implementador son antecedentes y no definen este esperado.

## Invariantes y casos nuevos

Q01. Cada relación canónica exige identidad completa, propietario, contexto y procedencia autorizados. Operación/ejecución/evidencia/evento no se identifican entre sí por UUID. Contrastar múltiples referencias opcionales y confirmar tarde una operación correcta/incorrecta después de revisar contexto. Una referencia histórica incompatible no se presenta como canónica; la observación original no se modifica.

Q02. La historia conserva su versión y contexto. En secuencias A→B→A y A→B→C, desde padre y origen, la reaparición de una ejecución en la raíz no concede permiso a todas sus otras versiones/evidencias/aprobaciones. Cada nodo debe justificar su inclusión en el alcance de C01 y conservar el acceso de su fuente. Intentar correlacionar una referencia externa al alcance no debe crear un enlace de autorización. Se requieren controles positivos para las versiones originales autorizadas, revisión vigente y petición histórica.

Q03. Una petición anterior y otra posterior mantienen identidad y contexto, incluso sin operación, con operación desconocida o con referencia explícita de ejecución/evento. Se comprueban recuperación desde padre, páginas de tamaño1/2, vuelta al origen, eventos vinculados legítimamente a varios contextos y consultas por las distintas referencias. No trasladar observaciones ni inferir efecto acreditado de logs.

Q04. Retirar autorización debe ocultar tanto hechos como referencias, metadatos y enlaces; restaurar acceso exige un flujo permitido y no revivir una sesión revocada. Usar revocación de sesión individual/global y nueva identificación por contratos B01 existentes. Extender a consulta/escritura/replay de diagnóstico, B07 y B08, con contexto padre y derivado. No inventar un comando de unlink/revocación por evidencia: si B07 no lo ofrece, registrar esa limitación y distinguir expresamente pruebas de perturbación privilegiada de las transiciones autorizadas. La restauración se realiza mediante sesión nueva, no borrando revocaciones por SQL.

Q05. Retirar aprobación de ejecución afecta a la autorización del efecto, no borra historia ni convierte incertidumbre en fracaso. Comprobar observaciones antes/después de withdraw_approval, revisión humana y versión posterior, manteniendo resultado E4 y evitando retry/duplicación.

Q06. V-MIG independiente: verificar SQL67 y definiciones previas, catálogo/ACL/RLS/roles, instalación vacía y upgrade66 poblado, DDL fallido/rollback, recuperación de los cuerpos previos y reaplicación. Exactamente tres cuerpos cambiados, cero otros cambios de objeto/privilegio/datos por DDL; roles ordinarios sin acceso directo ni autoridad migradora. No atribuir cambios normales de sesión por consultas al DDL.

Q07. Reejecutar originales F01/F02/F03, R01/R02, tercera auditoría y variantes E con sus bytes/aserciones intactos y fixtures67 explícitos. Reejecutar completa2884, unitarias208, health1 y controles técnicos; son ejecuciones nuevas, sin sumar focales solapadas ni resultados históricos incrustados.

Q08. Recalcular inventario E y sellos históricos al final. Cualquier defecto material reproducible determina FAIL; conservar original y retest sin corregir producto. Dictamen, matriz, causas, recomendaciones y sello propios. H5-017/H5-018 IN PROGRESS y DM-PENDING-005 OPEN.

## Registro exigido

Cada caso debe identificar norma, precondiciones, datos sintéticos, transición permitida, esperado, observado/log y conclusión. Un error de instrumento no prueba un defecto del producto; su fuente original y causa se conservan antes de reparar el instrumento. Los casos nuevos que concreten estas invariantes no pueden debilitar este esperado. Las limitaciones de cobertura se declaran.
