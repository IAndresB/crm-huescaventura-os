# Correctivo E — variantes derivadas de procedencia y acceso

El mapa previo y el esperado congelado permanecen íntegros. E01/E06 y AC081/DM-INV047 exigen comprobar el propietario real y acceso a cada fuente. Las capturas16/17/18 demuestran omisiones adicionales de esa misma superficie; no se modifican normas ni se amplían funcionalidades.

1. E-I06: la proyección genérica B07 compara result_ref/subject_id contra la unión de UUID de evidencias, tareas, ejecuciones y avisos. Una ejecución B08 de otro contexto puede compartir UUID con una evidencia B07 local y aportar incorrectamente su operación/historia. La existencia de command_results identifica a B08 como propietario; debe cotejarse contra las ejecuciones autorizadas, no contra los UUID de otros tipos.
2. E-S01: el conjunto de ejecuciones actuales coteja contexto tipo/UUID pero omite b08_context, que el lector propietario sí exige. La evidencia restringida deja trabajo visible en diagnóstico. La proyección vigente debe satisfacer el mismo control de fuente que la histórica.
3. E-S02: una observación sin operación conocida conserva referencias de ejecución/evento aunque se restrinja la fuente. La incertidumbre no autoriza dichas referencias. Comprobar ejecución actual o histórica autorizada, y evento autorizado, antes de proyectar cualquier observación. Conservar la fila original; al restablecer permiso vuelve a ser localizable.

La captura18 contiene dos FAIL materiales y un fallo de instrumento (ruta de socket demasiado larga); el nombre del clúster se acorta sin cambiar el esperado. La confirmación de las tres variantes se captura por separado.

Ajuste mínimo adicional de67: incorporar el cuerpo existente diagnostic_canonical_nodes, con b08_context en la selección de ejecuciones y validación de propietario B08 en las dos proyecciones B07. Además, aplicar al lector los controles de referencias opcionales a todas las observaciones. Se modifican tres cuerpos existentes en total, sin objetos ni permisos nuevos. Los datos canónicos e históricos no se alteran. V-MIG comprobará los tres cuerpos, atributos y recuperación completos.

La completa15 en curso corresponde a la versión inicial de E. Su resultado no acreditará estos cambios posteriores. Se conserva ese SQL por hash y se ejecutará una nueva completa después de cerrar las contrapruebas y controles de la versión final.
