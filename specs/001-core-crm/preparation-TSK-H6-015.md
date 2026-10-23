# TSK-H6-015 — Expediente previo documental

Fecha: 2026-10-22. Base: `971c55d5ce5770c71284d106d3c0deecca9514b5`.
Estado: **NOT STARTED / NO EJECUTADA**. Preparación documental autorizada expresamente por el director. Este expediente no autoriza restauración, recursos operativos, reentrada ni publicación.

## 1. Autoridad y trazabilidad

La ficha exacta de Tasks, sus 15 asignaciones de §6, líneas y hashes de las diez fuentes aprobadas están conservados en [normative-source-lock.json](../../tests/fixtures/h6-local-validation/normative-source-lock.json). Prevalece la jerarquía Constitution → Product → BR → DM → SM → Architecture → SPEC → Plan → Tasks. Este documento concreta el diseño de prueba; no modifica requisitos.

Dependencias expresas: H5-019, H6-014, H6-006 y H6-008. H5-019 está aceptada en su alcance local. H6-014 r3 está aceptada como preparación: manifiesto `1352361f1bf22ffb3670d8a7f36ca15b583ccf11bef9d6c4bd0d94adf1b7c065`; auditoría independiente r3 `3e610a7c2e276a33cc262d2818691a31429b73120a0db70c51dc2932ecf33f88`. Su preparación no acredita restauración ejecutada. H6-006/H6-008 necesitan su salida completa; una prueba parcial no satisface la dependencia. H6-009/010/011 no se añaden artificialmente como dependencias directas.

Las 15 asignaciones son SPEC-FR-HIST-004, SPEC-FR-IDEMP-002, SPEC-FR-ERR-002, AC-073, AC-074, SPEC-NFR-005, SPEC-NFR-014, SM-FORB-27, ARCH-DEC-010, ARCH-DEC-017, P13, PLAN-DEC-008, PLAN-B10, PT-12 y D017. Se aplican además V-DOM/DAT/MIG/AT/SM/NEG/EVI según Tasks §2.2, sin dar por cubiertas obligaciones globales por una fila aislada.

## 2. Expected anterior al futuro observado

No hay observado en este expediente. Estos escenarios deben congelarse junto al inventario concreto antes del futuro ensayo, después de satisfacer dependencias y obtener autorización expresa de ejecución. Un cambio de receta o candidato requiere nueva revisión, sin alterar r3 ni históricos FAIL.

| Caso propuesto | Preparación sintética y contraste futuro | Resultado exigido | Cobertura |
|---|---|---|---|
| R01 | Inventariar Core, roles/ACL/RLS, funciones, configuración, Auth, metadatos y bytes privados en un punto consistente t0. | Inventario completo; cobertura y exclusiones expresas. Un dump de esquema no prueba recuperación de datos/objetos. | P13, PLAN-DEC-008, ARCH-DEC-017, PLAN-B10 |
| R02 | Restaurar en destino nuevo y en cuarentena; comparar identidades, relaciones, versiones, historia e importes/porciones exactos. | Equivalencia de datos y permisos; diferencias justificadas por eventos legítimos identificados. Ningún redondeo con Number ni exclusión amplia. | AC-073, D017, SPEC-NFR-005, PT-12 |
| R03 | Objeto completo, metadata sin bytes, bytes corruptos y bytes huérfanos. | Solo íntegro y vinculado consta recuperado; missing/inconsistent/huérfano quedan explícitos. Reparación autorizada trazable, sin limpieza automática. | AC-074, HIST-004, ARCH-DEC-010 |
| R04 | Pago/envío simulado ocurrido en t1 posterior a t0; testigo del proveedor fuera del conjunto restaurado. | Cero repetición; identidad exacta operación/parte/intento. Igual importe no identifica un mismo efecto. | IDEMP-002, ERR-002, AC-073, SM-FORB-27 |
| R05 | Fuente confirma efecto, confirma ausencia, mantiene incertidumbre o no responde. | Conciliar solo lo acreditado; reserva/aprobación no se libera por restauración, timeout, permiso manual o ausencia de registro t0. | ERR-002, SPEC-NFR-014, SM-FORB-27 |
| R06 | Intento de t1 ausente en t0; información externa llega después. | Conservar evidencia pendiente por contrato autorizado; no fabricar intento, UPDATE administrativo o ruta alternativa para cuadrar la prueba. | P13, ERR-002, AC-073 |
| R07 | Sesiones t0/t1 revocadas, JWT vigente y URL conocida; descarga tardía. | Ninguna sesión antigua revive. Core denegado hasta revocación completa y nueva identificación; Auth real se acredita con Auth real. | AC-073, ARCH-DEC-010, PT-12 |
| R08 | Recuperación de configuración y generaciones F1/F2 sintéticas. | Material protegido, generaciones nuevas y antiguas deshabilitadas con historia; comprobar readback antes de nuevos firmantes. No contraseñas/secretos/TOTP en evidencia. | P13, ARCH-DEC-017, AC-073 |
| R09 | Intentar reanudar mientras falte cobertura de objetos, efectos, permisos o revocación. | Alcance afectado suspendido y motivo concreto; ningún job reactivado por inferencia. Reentrada requiere autorización separada. | AC-073, ERR-002, SM-FORB-27 |
| R10 | Medición monotónica por fase, UTC, pérdida de registros/objetos/porciones. | Tiempos y pérdidas observados con unidad, referencia y límites; desconocido no equivale a cero ni a RPO/RTO aprobados. | SPEC-NFR-005/014, PLAN-B10 |

## 3. Diseño por bloques y controles

1. **Puerta documental:** verificar las cuatro dependencias, base/candidato exactos, expected, permisos del ensayo y manifiestos. La autoridad presente solo permite este documento.
2. **Cuarentena:** aplicar S01–S03 del procedimiento r3, destino inequívoco, recursos exclusivos, fuentes sintéticas, writers detenidos en t0, testigos t1 separados. No se crea aquí ningún recurso.
3. **Copia y reconstrucción:** S04–S05. Core y Storage son variantes diferentes; conservar roles, propietarios, ACL, ajustes y nombre de base del archivo. No sustituir por `--no-owner`, `--no-acl`, `--clean` ni desactivar triggers. No reaplicar 68 migraciones sobre estructura ya restaurada. La receta pgcrypto 1.3/autoridad mínima aprobada sigue siendo la de r3.
4. **Seguridad antes del acceso:** S06–S07; generaciones F1/F2 nuevas por cauce administrativo autorizado, configuración protegida, revocación de todas las sesiones incluida emisora, identificación nueva. El éxito del Core con doble no prueba Auth real.
5. **Integridad:** S08–S09; comparación independiente Core + roles/Auth + metadata/bytes Storage. El comparador H6-013 cubre `crm%`; no cubre por sí solo Auth, globals ni objetos. Añadir cobertura explícita sin manipular el esperado.
6. **Conciliación:** S10; clasificar cada efecto por identidad y cobertura de fuente. Mantener pendientes sin vía legítima de incorporación; no forzar resultados con SQL administrativo.
7. **Medición y acta:** S12–S13; informe, manifiesto de payload admisible, FAIL históricos, contrapruebas y limitaciones. S11/reentrada queda fuera hasta autorización especial posterior.

Cada bloque conserva evidencias antes/después y detiene únicamente lo afectado por una discrepancia material. Un fallo técnico reparable permite nueva versión del candidato y repetición controlada. El resultado de un comando no sustituye comprobación independiente de datos, permisos y efectos.

## 4. Riesgos, pendientes y límites

- **ARCH-PENDING-002 OPEN:** RPO/RTO, coste y frecuencia Production no están decididos. Permite futuro ensayo aislado autorizado; prohíbe deducir compromisos productivos de medidas locales.
- **DM-PENDING-005 OPEN:** retención, supresión/anonimización y tratamiento de comunicaciones/audio siguen pendientes. Este diseño solo usa sintéticos; no autoriza copiar datos reales, eliminar huérfanos ni fijar política de backups/logs.
- Copias con `crm_f1.keys.secret`/`crm_f2.keys.secret` contienen secretos incluso siendo sintéticos. El futuro archivo debe quedar en recinto privado fuera de Git/Drive; manifests no exponen material. `--no-role-passwords` no elimina los secretos de tablas de aplicación.
- Recuperar contraseñas/factores/cuenta propietaria reales, intervenir autoridades reales, usar backups reales, acceder operativamente a Hosted/Production o contactar proveedores exige autorización independiente. No se utiliza este expediente como procedimiento de recuperación real de credenciales.
- Auth, Storage y Core no forman una transacción única. Conservar por separado éxito, fallo parcial y desconocido; el testigo del efecto externo no se rebobina con Core.
- Publicación Git, Drive, despliegue y reentrada siguen expresamente reservados. H6 global y Production no quedan acreditados por este bloque.

## 5. Propuesta al director

Conservar este expediente como preparación revisable. No autorizar ejecución de H6-015 mientras H6-006 o H6-008 carezcan de salida completa. Tras resolverlas, revisar inventario/r3 y conceder, si procede, autorización nueva y exacta de ensayo sintético aislado; mantener reentrada/publicación como decisiones separadas.

**No se han ejecutado restauraciones ni preparado recursos operativos de H6-015.**
