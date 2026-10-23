# H6-015 / PG17 — Propuesta de decisión sobre bootstrap, v1

Estado: **DRAFT, NO APROBADA, NO IMPLEMENTADA**. Fecha: 2026-10-22. No modifica H6-014 r3 ni autoriza ejecución. H6-015 sigue IN PROGRESS.

## Decisión concreta propuesta al director

Autorizar la elaboración y revisión de una **nueva variante** del procedimiento S05 para preservar, en cada clúster exclusivo, el bootstrap original como raíz OID 10 con su nombre fuente: `h2_bootstrap` para el recurso Core/Auth y `postgres` para Storage. Sustituir únicamente en esa variante la exigencia de r3 de un bootstrap distinto de todos los roles del origen, conservando r3 intacto como antecedente.

Autorizar además el diseño explícito del tratamiento de **una única creación preexistente**, la del bootstrap creado por initdb. No ignorar el error de CREATE ROLE ni continuar con errores. La variante deberá demostrar que ese rol preexistente es precisamente el bootstrap OID 10 esperado y que todos sus atributos y configuración capturados se aplican y cotejan. El original globals.sql no se edita: cualquier derivado deberá tener hash, inventario de sentencias y prueba de cobertura, con la única creación identificada satisfecha por aprovisionamiento comprobado y todas las demás instrucciones conservadas. Este tratamiento cambia una restricción de r3 y necesita aprobación previa.

No se solicita autorizar cambios en permisos de negocio, contratos de identidad, reentrada S11, datos reales, Hosted/Production, despliegues ni publicación. No se propone ampliar la equivalencia limitada de pgcrypto a memberships o grantors.

## Justificación y límites

PostgreSQL 17 atribuye a su bootstrap OID 10 los grants de membresía realizados por superusuarios sin un grantor explícito. Un grantor explícito diferente necesita ADMIN OPTION para sostener su concesión. Conservar nombre y raíz builtin evita traducir ese grafo a otro grantor o añadir una arista ADMIN. Esto es una justificación técnica para investigar la variante, **no prueba de restauración segura ni autorización vigente**.

La compatibilidad debe verificarse por recurso. Core requiere su carga particionada y pgcrypto, owners exactos y autoridad de migración. Auth alojado en ese clúster necesita su copia completa y garantías R2, sin deducirlas del PASS Auth dedicado. Storage conserva su carga íntegra, base y propietario `postgres`, metadatos y bytes por separado. El nombre de la base de mantenimiento seguirá reservado mediante el mecanismo ya aprobado para evitar colisión con la base archivada; no se reutilizan destinos fallidos.

## Verificaciones exigidas al futuro candidato

Antes de observar resultados: congelar expected, fuentes, versiones, identidades, grafo completo, roles/atributos/configuración, ACL con grantor/grantee/opciones, owners, extensiones y catálogos; mantener los expected históricos.

1. Verificar dos destinos nuevos y exclusivos con bootstrap OID 10/nombre exactos. Comprobar ausencia de usuarios/roles de otros proyectos, tablespaces no previstos, listeners o escritores.
2. Demostrar cobertura literal del globals original y del único CREATE ROLE satisfecho por initdb, sin eliminar ALTER ROLE, configuración, grants o instrucciones desconocidas. Una variante inesperada se detiene.
3. Comparar todos los roles, memberships, ADMIN/INHERIT/SET y grantors por identidad lógica, sin normalización ni privilegios transitorios residuales. Examinar dependencias de revocación, no solo privilegios de lectura.
4. Restaurar Core, Auth y Storage según sus recetas y comparar antes de escrituras de seguridad datos exactos, historia/versiones/relaciones, secuencias, settings, constraints, RLS/FORCE RLS, funciones, ACL y propietarios. Comprobar pgcrypto y la línea base builtin de cada clúster.
5. Probar roles ordinarios, aislamiento entre actores, denegación de escalada y acceso a claves/Auth; incluir contrapruebas reales de permisos omitidos, ampliados o atribuidos a otro grantor. No basta exit 0.
6. Con revisión independiente satisfactoria, continuar S06–S10: F1/F2, revocación Auth/Core, objetos y conciliación de los hechos t1 conservados. No reconstruir los expected desde el observado.
7. Medir fases con pausas declaradas; no fijar objetivos Production. S11 permanece reservado; no cierre automático de H6-015.

## Alternativas descartadas o pendientes

Cambiar de superusuario, SET ROLE/SESSION AUTH y reordenar la existencia de roles no resuelven la condición de grantor. ADMIN temporal añade una dependencia: RESTRICT impide retirarla y CASCADE elimina grants dependientes. Omitir GRANTED BY altera la atribución. Restauración física, mecanismos de upgrade o manipulación de catálogos no son variantes aprobadas de este ensayo. No se han implementado esas opciones como recuperación.

**STOP: esta propuesta requiere decisión expresa antes de convertirla en procedimiento o implementación.**
