# TSK-H5-012 — Cierre local/aislado y publicación autorizada

2026-10-15. **COMPLETED exclusivamente local/aislado.** El usuario autoriza expresamente el cierre documental y la publicación, incluida la excepción exacta de formato que se describe a continuación. El dictamen técnico del candidato61 es PASS. El control global de formato conserva exit 2 y no se declara PASS.

## Candidato y aceptación

Base publicada: `f063879d203330adb57d7e8fef3607ae796f52d5`. Se preservan los 257 archivos del candidato verificado y los diez archivos de la revisión anterior. Los 428 inputs del producto y pruebas coinciden con el manifiesto SHA256 `44d32a2ff5840bfc77fd160e45f90af2c85e3372db44a0a249a1f60e07805723`. No se modifica producto durante el cierre ni se atribuyen pruebas de otra versión.

F01 resuelve las fechas vigentes mediante `b04_current_nights` conservando el snapshot aceptado. F02 utiliza revisiones canónicas vigentes en bloqueos/requisitos y conserva su historia. F03 representa el estado operacional vigente de noche, servicio y Booking, incluidas cancelaciones, sin segunda fuente de verdad. Migraciones59/60/61 y compositor permanecen idénticos al candidato probado. Los tres defectos quedan CLOSED local/aislado; se conservan sus FAIL originales y reproducciones posteriores.

| Verificación acreditada | Resultado |
|---|---|
| Casos independientes | 41/41 PASS, aserciones originales conservadas |
| Filas normativas | 34: 28 verificaciones propias y seis límites locales |
| C03/C05/C06 | PASS con suplementos persistidos |
| Focales sobre61 | 57/57 PASS, incluidos F01/F02/F03 |
| PostgreSQL completo | 2600/2600 PASS |
| Unitarias / health independiente | 197/197 y 1/1 PASS |
| Typecheck / lint / build | PASS |
| Dependencias de producción | Cero vulnerabilidades reportadas |
| V-MIG / permisos / aislamiento / advisors | PASS en alcance local/aislado |

Los ocho recibos y hashes de logs se verifican nuevamente contra el producto exacto. No se repiten baterías completas porque el código probado permanece idéntico. [Informe técnico conservado](review-TSK-H5-012-candidate61.md), [matriz individual41/34](matrix-TSK-H5-012-candidate61.md), [recibos verificados](../../tests/fixtures/h5-012/publication-20261015/validation.json).

## Excepción humana de formato

El [informe de publicación anterior](publication-review-TSK-H5-012.md) queda intacto como antecedente BLOCKED. La autorización expresa posterior levanta exclusivamente ese bloqueo: se aceptan los 27 avisos exactos de las 17 evidencias allí identificadas, conservando sus SHA256. No cambia ningún criterio de negocio, permiso ni control general.

Se ejecuta literalmente `git diff --cached --check` sobre el índice completo. **Resultado global: exit 2, NO PASS; excepción de formato autorizada aplicada.** Coinciden ruta, línea y tipo de los 27 avisos: 24 de espacios finales y tres de línea vacía al final. Cero avisos adicionales. La salida completa se conserva comprimida sin pérdida; no se normalizan los originales, no se alteran `.gitattributes`, guardas ni auditores.

[Autorización, 17 hashes y 27 ubicaciones exactas](../../tests/fixtures/h5-012/publication-20261015/authorization.json), [resultado completo](../../tests/fixtures/h5-012/publication-20261015/staged-check.json), [salida original gzip](../../tests/fixtures/h5-012/publication-20261015/staged-check.log.gz).

## Preservación e inventario

Expected congelado: 67.346 bytes, SHA256 `669dcfa74aff6a95e01e93c5a3f72718c33e04c41ab5bab6ff67a9bef8dedb4b`, intacto. Las 17 evidencias conservan bytes y permisos. Se preservan todos los originales del candidato y de la revisión anterior. Los 36.408 archivos de la base de preservación se comprueban: 36.405 siguen idénticos y tres documentos de estado reciben exclusivamente el cierre autorizado, con transiciones de hashes registradas. Los controles históricos quedan intactos y mantienen su contexto original; no se afirma que sus hashes previos de esos tres documentos sigan vigentes.

Únicos documentos anteriores actualizados: PROJECT-STATUS, NEXT-STEPS y estado de la tarjeta H5-012 en Tasks. Se conservan sus antecedentes. Las filas normativas de Tasks y el contenido restante se verifican sin cambios mediante reversión exacta de las ediciones documentales; H5-013 permanece intacto. D020 y los demás contratos aprobados no cambian.

Inventario final: **278 archivos respecto a la base** =257 del candidato +10 de la revisión de publicación +3 documentos de estado actualizados +8 archivos nuevos de cierre/evidencia. El manifiesto incluye todas las rutas, modos y hashes; su propia entrada omite el hash autorreferente, sellado por el árbol Git del commit. Se comprueba igualdad de bytes entre índice y disco y ausencia de rutas adicionales.

[Inventario completo](../../tests/fixtures/h5-012/publication-20261015/inventory.json), [preservación, transiciones documentales y examen de contenido](../../tests/fixtures/h5-012/publication-20261015/preservation.json), [preflight](../../tests/fixtures/h5-012/publication-20261015/preflight.json).

## Publicación y límites

Se autoriza commit trazable y push normal a main, sin force, seguido de fetch y verificación HEAD=main=origin/main, divergencia0/0 y árbol limpio. El SHA definitivo y la comprobación posterior se comunican al usuario al terminar; este documento no inventa un SHA autorreferente antes de crear el commit.

Hosted/Production no acreditados; DM-PENDING-005 permanece abierto. No se acredita disponibilidad real de terceros ni rendimiento de grandes históricos en producción. Solo PostgreSQL y Storage oficial en loopback con datos sintéticos. No se ejecutan despliegues, envíos, operaciones reales ni tareas posteriores. Los límites y antecedentes históricos de otros hitos permanecen independientes.

**Punto de parada: H5-012 cerrado exclusivamente local/aislado; H5-013 NOT STARTED.** No se prepara ni ejecuta ninguna tarea posterior. Cualquier continuación requiere autorización humana.
