# Publicación pendiente — lote propio H6-004

**PREPARADO, NO AUTORIZADO NI EJECUTADO.** Base Git `971c55d5ce5770c71284d106d3c0deecca9514b5`. Esta propuesta no altera ni incorpora el candidato de prepublicación A/B/C/D1/D2. Tampoco incluye antecedentes E ni reabre H6-015.

Se denomina **F — H6-004 propio** para distinguirlo de A (H6-006/H6-008), B (H6-015 técnico), C (cierre formal H6-015), D1/D2 (H6-001) y E (antecedentes no seleccionados). No existe dependencia funcional de A–D2: los ensayos H6-004 corren sobre la base publicada. No se duplica ningún archivo `src` ni migración heredada. Las copias de pruebas históricas son sucesores instrumentales identificados, no producto nuevo.

El inventario literal y hashes de F son los de `tests/fixtures/h6-004/delivery-manifest-v1.json`, con su sello separado. La lectura posterior a ese sello se custodia en paquete distinto; no se añade silenciosamente al manifiesto congelado. Los artefactos de lectura de cierre se seleccionarán expresamente por su propio recibo.

## Dos componentes separables

1. **F-a — pruebas, evidencia y cierre propio:** todos los payloads nuevos del manifiesto, conservando intentos fallidos, sucesores, expected, informe independiente y custodia. Los archivos dentro de `documentary-variant` son propuestas archivadas y no sustituyen por sí solos los coordinadores canónicos. No se seleccionan archivos locales ignorados, cachés, BD, secretos, `.next`, `node_modules` ni contenido de otros worktrees.
2. **F-b — superposición documental de estado vigente:** exactamente `specs/001-core-crm/tasks.md`, `docs/PROJECT-STATUS.md` y `docs/NEXT-STEPS.md`. Preimagen obligatoria: las tres postimágenes selladas de prepublicación v2, manifiesto `cc5dc936c411500d8e2085ef613d4710a5c1ac95892b20ef56e1971cbc31ec69`. Las nuevas postimágenes y el patch se fijan en `documentary-overlay-v1.json`. Este componente depende documentalmente de D2 y de autorización expresa para publicar los coordinadores compartidos. No se aplica a la base antigua ni a fuentes protegidas.

## Procedimiento determinista posterior a autorización

Antes de integrar, verificar identidad del repositorio, HEAD/base autorizada, índice y árbol de destino; comprobar manifiestos/sellos originales y ausencia de divergencias. Cada ruta tiene una preimagen y una postimagen esperadas: postimagen exacta = NO_OP; preimagen exacta = cambio permitido por el lote autorizado; cualquier otro contenido = conflicto localizado, sin sobrescribir. Nunca `git add .` ni selección por directorio indiscriminado.

F-a puede ensayarse sobre la base publicada en un área nueva. Para F-b, primero completar la integración documental A–D2 expresamente autorizada, validar las tres preimágenes y aplicar el patch exacto. El texto previo completo permanece en orden como historia; la única ficha modificada es el estado H6-004 y se añade cabecera vigente con su acta y exclusiones. H6 global sigue IN PROGRESS. El corte anterior que decía H6-004 IN PROGRESS queda como antecedente fechado, no se elimina.

Después de F-a: frozen install con versiones fijadas, typecheck, lint, build, unitarias; focal31 y suplemento1 en PostgreSQL local vacío cadena68; verificador de custodia y trazabilidad. Si los lotes A–D2 han cambiado los adaptadores respecto a la base probada, repetir focal31/suplemento1 y regresiones afectadas en la composición final antes de aceptar esa composición. El PASS actual no acredita por anticipado una integración funcional futura. Después de F-b: comparación de hashes, aplicación idempotente NO_OP, lectura de los tres estados, búsqueda de marcadores de conflicto, integridad de preimágenes/historia y diff-check. Cualquier cambio funcional posterior invalida la reutilización indiscriminada de pruebas anteriores.

## Recuperación

Antes de cada lote guardar identidad Git, inventario, hashes y preimágenes en custodia nueva. Ante discrepancia, detener únicamente ese lote y conservar el árbol fallido y sus logs. Recuperar en un destino aislado nuevo a partir de la base y preimágenes verificadas; no reset destructivo, force-push, borrado de historial ni modificación de candidatos sellados. Si un lote ya se hubiera publicado, su corrección o reversión requiere una operación Git expresamente autorizada, sin reescribir historia remota.

## Verificación remota preparada, no ejecutada

Tras una publicación autorizada: obtener el SHA remoto exacto por la API o lectura Git autorizada; no basta un mensaje de éxito local. Leer el árbol de ese commit y comparar rutas, modos y bytes SHA-256 contra los lotes efectivamente seleccionados, incluido el cálculo local de SHA-256 de cada blob (el OID Git no es SHA-256 de contenido). Confirmar base/parentage, ausencia de rutas extras, manifiestos y estados, y registrar los checks asociados al mismo SHA. Cualquier discrepancia se documenta sin atribuir publicación satisfactoria. Esta preparación no autoriza commit, push, merge, main, GitHub, Drive, deploy, Hosted/Production ni reentrada H6-015.
