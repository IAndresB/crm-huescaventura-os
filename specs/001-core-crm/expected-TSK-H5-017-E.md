# H5-017/H5-018 — correctivo E: esperado previo

Estado: esperado congelado antes de corregir el producto. Base 9649a2773530ea8a43237b4e1f2034f80e34136f; candidato D y tercera auditoría FAIL conservados. Autorización: encargo correctivo E, 2026-10-17 Europe/Madrid. Solo local/aislado y sintético; H5-017/H5-018 IN PROGRESS, DM-PENDING-005 abierto, sin publicación ni H5-019/H6.

## Fuente normativa

Constitución P01/P06/P07/P10/P12/P13/P18/P19; Tasks H5-017/H5-018, §2.2 y las 13 asignaciones §6; Plan B01/B07/B08/B10, C01/C04, §§7.1/8/11.2; SPEC HIST001/006, ERR001, AC070/072/081, NFR009/010/014; DM-INV047, BR-HIST001–005, SM-FORB27. Se mantienen las fuentes y expected anteriores. La salida del implementador no define el esperado.

## Integridad e identidad

E01. Una operación conocida y una ejecución opcional solo forman una asociación canónica si la fuente propietaria acredita su pertenencia, con tipo, UUID y ámbito. Igual UUID entre objetos diferentes o mismo contexto no prueban pertenencia. Rechazar escritura falsa y no devolver como canónica una observación previa contradictoria. Nunca reescribir hechos u observaciones originales.
E02. Una operación desconocida puede conservar un intento no verificado. Una confirmación posterior debe revalidar la pertenencia: positiva al mismo propietario, negativa a otro, incluso después de una revisión de contexto. La falta de una referencia opcional no inventa una asociación. La incertidumbre sigue E4; no hay retry.
E03. Operaciones de trabajo define/revise/claim/start/result y control mantienen identidad y relación con su ejecución a través de estados/versiones, sin convertir intento en efecto acreditado. Referencias inexistentes, ajenas o incompatibles no producen una asociación canónica.

## Trazabilidad y permisos

E04. Una petición válida en un contexto padre conserva su recorrido autorizado tras revisar el contexto de trabajo: servicio→reserva, reserva→oportunidad y servicio→reserva→oportunidad cuando existe la relación canónica. Debe funcionar con y sin ejecución opcional para una ejecución visible por la proyección autorizada del padre. La observación permanece en su contexto original.
E05. Revisiones sucesivas y vuelta al origen conservan peticiones anteriores y posteriores sin trasladarlas. Cada lectura revalida el ámbito, tipo, procedencia, historia inmutable y evidencia de su fuente; una relación padre/hijo no concede acceso universal.
E06. Contextos ajenos, tipo distinto con UUID igual, evidencia restringida, actor/rol/permiso inválidos y acceso SQL directo deben denegarse o no revelar nodos protegidos, incluidos identificadores y metadatos. No usar historia como autorización de hechos actuales ajenos.
E07. Evento, intento, trabajo, operación e historia conservan sus fuentes y estados distintos; el diagnóstico es técnico. Reejecutar los originales F01/F02/F03 y temporal anterior sin cambiar sus bytes/aserciones. Hook o sucesor de fixture, si necesario, explícito y limitado a la cadena de migración.

## Migración y verificación

E08. Nueva migración forward67, 1–66 intactas. Datos, identificadores, historial, RLS/FORCE RLS, ACL, owners y firmas preservados. Instalar vacío, actualizar66 poblada, abortar/rollback, recuperar cuerpos anteriores y reintentar67. Funciones privadas sin nuevos permisos.
E09. Reproducir los FAIL antes de corregir; conservar todas las capturas. Añadir negativos y positivos transversales. Ejecutar PostgreSQL completo, unitarias, health independiente, frozen, typecheck, lint, build y auditoría. No sumar baterías solapadas ni presentar históricos como actuales.
E10. Inventario exacto y sello reproducible del candidato E, con verificación posterior. No modificar ninguno de los 37543 archivos recibidos. Nueva documentación E identifica la vigencia del correctivo y conserva las declaraciones D como antecedentes. STOP tras entregar para cuarta auditoría independiente; no declarar COMPLETED.
