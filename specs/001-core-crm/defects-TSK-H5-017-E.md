# Correctivo E — hallazgos, causas y cierre interno

Estado: **PASS interno local/aislado**. Los dos defectos originales y los tres derivados están cerrados en la verificación interna: focal22 63/63 y completa30 2884/2884, sin fallos, cancelados u omitidos. Cero defectos materiales detectados pendientes de corrección interna. La cuarta auditoría independiente sigue pendiente. El dictamen independiente D sigue siendo FAIL en sus archivos originales. H5-017/H5-018 IN PROGRESS; DM-PENDING-005 abierto. Ninguna publicación o aceptación definitiva.

## H5-018-3-F01 — operación y ejecución

El escritor65 y la rama vigente66 comprobaban pertenencia al contexto por separado. Una operación de A se podía registrar con ejecución B; la confirmación tardía de una operación desconocida convertía la asociación contradictoria en canónica. La comprobación añadida por D solo cubría la recuperación histórica.

Reproducción E01 sobre D: T03/T04 originales, tres FAIL, UUID distintos e iguales entre tipos. Conservados sus archivos, entradas y logs. La corrección comprueba `b07_operations.result_ref` y `b08_command_results`, con ámbito, tanto al registrar como al consultar. Ninguna coincidencia entre UUID de tipos diferentes sustituye al propietario. Una operación desconocida conserva estado no verificado y se revalida después; una pareja incompatible previamente almacenada se oculta sin modificarla.

Norma: encargo E §5; SPEC-FR-HIST-001/006, AC-081, DM-INV-047, Plan B07/B08/C01/C04. Evidencia: originales T03/T04/T05; E-I01–E-I05, incluyendo define/claim/start/result, confirmación tardía positiva y negativa, otra fuente, alias y actualización de una asociación falsa persistida en D.

## H5-018-3-F02 — recorrido desde un padre

La proyección vigente65 expandía `diagnostic_contexts`; la histórica66 exigía igualdad directa con la raíz. Una observación legítima del padre perdía la operación del hijo al revisar el trabajo. La fila original y la historia seguían existiendo.

Reproducción E01 sobre D: las dos T07 originales FAIL. La corrección utiliza las relaciones canónicas tipo+UUID existentes también en la recuperación histórica, con definición/version/contexto exactos, historia de trabajo, resultado propietario y evidencia autorizada mediante `b08_context`. Las referencias explícitas de ejecución desde un padre se admiten solo si esa ejecución vigente está autorizada por el mismo recorrido. No se trasladan observaciones ni se concede acceso al contexto destino.

Norma: AC-081, HIST001/006, BR-HIST001–005, DM-INV047, Plan C01/§8/§11.2. Evidencia: T07 originales; E-P01 en servicio→reserva, reserva→oportunidad, servicio→oportunidad y propuesta→oportunidad, con/sin executionId; cinco versiones, petición posterior, vuelta al origen y paginación. E-P02 retira la evidencia y prueba raíz de otro tipo.

## H5-017-E-F01 — colisión entre ejecución B08 y evidencia B07

Hallazgo derivado del análisis transversal, reproducido en captura16 (E-I06, FAIL). El conjunto genérico de sujetos B07 mezclaba UUID de evidencias, tareas, ejecuciones y avisos. Una ejecución de otro contexto con UUID igual a una evidencia local hacía visible su operación e historia, y permitía registrarla como local.

La proyección identifica la propiedad B08 mediante `b08_command_results` y compara esas operaciones/historias exclusivamente contra las ejecuciones autorizadas. Las operaciones B07 que no pertenecen a B08 mantienen su proyección anterior. No se introduce un registro de propietarios paralelo. Contraprueba E-I06 conserva el FAIL original y exige ausencia de metadatos ajenos y rechazo de escritura.

## H5-017-E-F02 — evidencia de trabajo vigente restringida

Hallazgo derivado, captura17 (E-S01, FAIL). El lector B08 denegaba el trabajo después de restringir la evidencia, pero la selección de ejecuciones del diagnóstico solo comprobaba contexto tipo/UUID. La corrección añade el control propietario `b08_context` al conjunto vigente. Las proyecciones de definición, aprobación, partes e intentos se derivan de ese conjunto autorizado.

E-S01 acredita denegación del lector propietario, ausencia del trabajo/operación diagnósticos y recuperación al restablecer el permiso. La alteración de permiso es un fixture adversarial sintético; no es una vía ordinaria de edición de datos.

## H5-017-E-F03 — referencias de observaciones no verificadas

Hallazgo derivado, capturas18/19: operación desconocida, operación ausente y evento opcional. Una observación técnica conservaba referencias aun cuando se había restringido su fuente. La incertidumbre no concede permiso sobre dichas referencias.

La consulta verifica en todas las ramas que la ejecución sea actual o histórica autorizada y que el evento conserve vínculo y ámbito válidos. La fila original permanece idéntica y reaparece al restaurar el permiso. Las peticiones desconocidas con fuente autorizada conservan su trazabilidad anterior. E-S02 contiene los tres negativos y sus controles positivos.

Los tres hallazgos derivados concretan E01/E06 del esperado congelado y las obligaciones de procedencia/privacidad existentes. No amplían funcionalidad ni cambian normas. Su mapa previo al ajuste está en [addendum](relations-TSK-H5-017-E-addendum.md).

## Instrumentos e incidencias conservadas

- Captura04 V-MIG: faltaba un separador entre dos definiciones al ensayar recuperación. Fuente inicial y error conservados; se corrige solo el instrumento. Captura05 verifica upgrade, rollback y recuperación de la primera versión E.
- Captura06: tipos demasiado amplios en un fixture nuevo. Se anotan los tipos existentes sin cambiar aserciones; captura08 PASS.
- Verificación09 inicial: la lista permitida omitía el nombre exacto del fixture E. Se añade esa ruta; los 37.543 archivos previos ya eran idénticos.
- Captura18: el nombre largo de un clúster supera el límite de ruta del socket. Ese caso no acredita FAIL de producto; los otros dos sí. Nombre abreviado, mismo setup/esperado; captura19 reproduce los tres FAIL materiales.
- Captura20: prueba de la propuesta ampliada, 61/61 PASS. Usa exactamente los bytes de `proposed67.sql` mediante sustitución limitada del fixture propio; no modifica los reproductores protegidos. Se informa separadamente de las verificaciones posteriores del archivo de migración final.

Los cinco cierres se verifican sobre la migración67 definitiva, SHA-256 `45ee62b013979f09b1145b6fa3ad096f88f676bc2170f48e245b7df2ca8c28a5`, en capturas22 y30. La segunda contiene 184 archivos/14 fases disjuntas; la focal se solapa y no se suma. El [informe final](evidence-TSK-H5-017-E.md), la [matriz](matrix-TSK-H5-017-E.md) y `tests/fixtures/h5-017-e/final-verification.json` identifican las entradas y resultados. La completa15 inicial y la propuesta20 no se reutilizan para acreditar la versión final. La cuarta auditoría independiente conserva autoridad para confirmar o rechazar el candidato E.
