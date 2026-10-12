# F05 — diagnóstico y alcance autorizado

Preflight: main, origin/main=fdbd08bafdc6651d1ad6867242cd71791a25deb6, expected exclusivo=e8b38fa45b0170689784dd3af6ef6cba93e46ae1, producto=1c86e695144509fff0254c4d7a076dbb3921f777, divergencia 2/0. Expected intacto 24417 bytes / b9f5beaa45c3d4a08f101694115724a6569a43fd590e965f28f9a1ab79c5e639. Inventario previo con hashes: f05-preflight.json.

El cierre H5-008 publicado es fdbd08bafdc6651d1ad6867242cd71791a25deb6; producto histórico probado=5e3add4b2c82fc5b0e459b43ea0685393c495840; antecedente H5-006=ff109036e3bb08a1d61e948693bc622bb10f240e. El cierre contiene 35599 archivos registrados, incluidas 56 migraciones. El auditor anterior validaba expected 26621 bytes/hash y commit ae7f3b0, 45 filas/56 casos, hashes/SHAs y conteos 2462/154/1 de evidencias y snapshots generados, bytes de src/scripts/tests anteriores y cadena F10/F12.

Línea 27: whitelist documental desde testedSha histórico; rechaza producto posterior autorizado. Línea 36: igualdad de todo el sufijo Tasks desde009; impide progresar009/010. El loop de bytes usa ff109 y no incluía entonces archivos de recuperación007/008; el correctivo conserva ese loop y añade protección del cierre publicado completo por los blobs Git originales. Las 56 migraciones quedan cubiertas tanto por esta comparación como por W53/F01.

Delta de producto autorizado literal:

```
A	specs/001-core-crm/expected-TSK-H5-009-010.md
A	src/domain/external-boundary.ts
A	src/infrastructure/postgres/h5-external-event-adapter.ts
A	supabase/migrations/20261008192000_h5_external_event_receipts.sql
A	tests/h5-009.test.ts
M	tests/integration/postgres-h5-008-migration.test.ts
A	tests/integration/postgres-h5-009-migration.test.ts
A	tests/integration/postgres-h5-009.test.ts
A	tests/support/h5-boundary-isolated.ts
M	tests/support/h5-work-isolated.ts
```

Dos modificaciones existentes: guarda W53 autorizada F01 y estrechamiento de tipo claim del fixture work; el resto son adiciones. Todas quedan fijadas a los bytes de1c86e69. Expected009 queda fijado a e8b38fa y hash original. Documentos históricos: solo status/evidencia en fichas009/010; solo inserción de párrafo009/010 en Next Steps/Project Status conservando texto original completo. Desde011, incluyendo H6 y contratos de009/010, igualdad exacta. Las nuevas evidencias y contrapruebas tienen lista de nombres concretos; no glob ni excepción de directorio.

Controles separados: preservación de archivos originales frente al cierre publicado; progreso posterior mediante lista exacta de rutas/versiones y, para COMPLETED, prueba estructurada local/isolated con26 IDs,51 normas y gates/hash del SHA probado. Hosted/Production solo pueden figurar en las frases negativas explícitas admitidas; acreditación positiva rechazada.

La cadena F10/F12, sus cuatro manifests y snapshots no cambian. El auditor final temporal de H5-006 también contiene una whitelist del delta desde201dada; ya es incompatible con el cierre publicado H5-008 previo a esta tarea. No se adapta ni se usa para atribuir evidencia corriente: la preservación H5-006 se ejecuta con sus verificadores F10/F12 actuales e intactos. No se solicita ni amplía otra excepción.

FAIL F05 original permanece intacto (10865 bytes, SHA2560da057cef8311426a7c18e4192003d1570288f0103c06fbfc7ef4c447ce953be). Fallos de desarrollo: buffer de inventario, comprobación de aislamiento por línea en vez de ficha y symlink node_modules en copia temporal; logs/ hashes separados en f05-development-fails.json. Primeras contrapruebas completas preservadas en f05-precommit.tar.gz; retests del SHA correctivo se conservan por separado.

Revisión adicional del candidato3158161: eliminar la guarda histórica W53 en copia intacta devolvió exit0 donde se esperaba1. Resultado/hash conservados en f05-development-deletion.log.gz y f05-development-fails.json. Se añadió lstat sobre cada archivo del cierre antes de considerar excepciones: presencia obligatoria, archivo regular y modo Git100644. También los archivos posteriores admitidos deben ser regulares sin bit ejecutable. Las pruebas directas añaden eliminación W53 en copia intacta, symlink con idénticos bytes y cambio de modo100644→100755;18 contrapruebas totales. Para acreditar COMPLETED, el auditor exige que sus propios bytes y los de su prueba coincidan con el SHA definitivamente probado y que este sea ancestro de HEAD. Correctivo final0dae8a4a0b5ce92845b13fd82c60c1ed931184dc. La tanda íntegra3158161 y sus hashes quedan en f05-initial-revalidation.tar.gz; no acreditan el correctivo final.
