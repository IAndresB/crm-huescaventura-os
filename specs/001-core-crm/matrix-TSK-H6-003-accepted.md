# Matriz aceptada H6-003 — sucesor documental

COMPLETED exclusivamente local/aislado. H6 global IN PROGRESS. Este sucesor corrige únicamente los localizadores AUD003-D01 y vincula las contrapruebas finales; el original técnico sellado permanece intacto. La aceptación se limita al alcance local y sintético.

# TSK-H6-003 — Matriz normativa y de ejecución local/aislada

Base publicada `0cd5f06d2efec9741906d4927318734451b01d4a`, árbol `8b184d1d470a3bf190dee14499369fe9c665ab3d`; fetch y creación del worktree coordinados antes de actuar. Fuentes consultadas directamente: Tasks ficha/§§2.2/5/6/7, SPEC §§9/10/24/25, Constitution P09, Architecture §3, Plan §§7.2/7.3/9/10.1, D018/D019/D020, contratos y State Machines aplicables. Las filas literales asignadas son **P09 y E2E-03**. Su expansión exige **AC-017, 018, 019, 024, 038 y 043**: AC-043 procede expresamente de la correspondencia P09 en SPEC §28.2 y no se omite por no aparecer en el nombre de tarea.

Expected previo: [expected.json](../../tests/fixtures/h6-003/expected.json), SHA-256 `24202c2d00175f3585772af83cbde20426c4cfd705007dbdf0ec9abdb2b13da6`. Suplemento de composición T03/T04 fijado antes de observar esa intercalación: [composition-expected.json](../../tests/fixtures/h6-003/composition-expected.json), SHA-256 `ea5c9358566c000d4d0162543296abb029faf42b6d9570ed44ad5e55c8b0787f`. No contienen resultados derivados del producto usados como su propio oráculo.

Resultado técnico observado: **2/2 asignaciones y 6/6 AC satisfactorios**, con quince grupos focales reales —F01–F14 y S01— y174 resultados de regresión dirigida PASS, cero SKIP. Estado formal **COMPLETED exclusivamente local/aislado**, conforme al acta posterior y dictamen independiente vinculado. H6 global IN PROGRESS.

## Asignaciones y criterios

| Fila | Fuente y alcance exigible | Positivo y negativo | Observado e instrumento | Prueba independiente |
|---|---|---|---|---|
| P09 | Constitution §P09; SPEC correspondencia P09; Plan §§5.1/7.3. Cantidades/configuración por servicio y noche; global no sobrescribe; precios, capacidad y resúmenes conservan granularidad. | F01–F05/F14; F02 rechaza sobrescritura/doble cómputo; F13 autoridad; F07/F08 fecha/plazo específico. | API Booking, Proposal interna/comercial, Confirmation, Preparation y Projection sobre68 migraciones: rafting10/cena12/noches12–10; componentes fijos900×1, finales1000.10/200.02 por modalidad; confirmaciones nocturnas12/10 y resumen individual; global14 no altera detalle. | Auditor propio con expected, instrumentos, PG61600 y worktree separados; dictamen PASS_LOCAL_ISOLATED vinculado al candidato técnico exacto de311 archivos. |
| E2E-03 | SPEC §9, Tasks ficha. T03 conversión y T04 cambio localizado, preservación de historia/nominales, promoción y protocolos transversales. | F01–F14/S01; retirada de guardas, pérdida de respuesta, rollback y carreras. | Una Booking/Opportunity; cuatro nombres de12 sin agregarlos; noche2 cambia21→22, noche1 sigue20/12; promoción150 mantiene15 asistentes y base documental externa500; T03 recupera existente sin restaurar detalle anterior sobre T04. | Misma separación; no auditoría humana externa ni sustitución por informes del implementador. |
| AC-017 | SPEC §24.2 y E2E-03. Modalidades10+2, rafting/cena/alojamiento y procedencia exacta. | F01 correcto; F02 line/night ajenos o detalle material cambiado se rechazan. | Una Booking, tres servicios, seis contribuciones aceptadas con source_snapshot y modalidad;10/12/12/10. | Contrapruebas originales del auditor, vinculadas por dictamen propio. |
| AC-018 | Global12→14 no sobrescribe rafting10 confirmado; cena conserva antes/después y revisión solo dependiente. | F03 global14 aplicado; petición/evaluación cena no la cambia; aplicación solo tras pruebas/aprobación. F09 retira pruebas. | Rafting10 confirmado sigue usable; cena cambia20→22, su confirmación queda no usable en revisión; noches y resto del servicio conservados, accepted_detail íntegro. | Auditor propio. |
| AC-019 | N1=12/N2=10, cuatro nombres parciales; cambio N2 no afecta N1; sin habitaciones obligatorias. | F01/F04; F02 intenta duplicar nominal o mezclar contribuciones de otra noche/servicio. | N1 id/fecha/contributionIds originales, revisión1/cancelled=false explícitos del lector; N2→22 conserva10; mismos cuatro participantes/asignaciones; sin ocho personas inventadas ni total16. | Auditor propio. |
| AC-024 | Confirmado18 frente a «creo16» o fecha nueva; revisión y tarea acotadas, hora no ratifica cantidad/precio/capacidad. | F05 establece primero T04 autorizado a18, ratifica ese acto y registra/verifica Provider Confirmation18 real sintética. Luego solicitud16 y ratificación solo time. |18 confirmado permanece; hecho de proveedor idéntico, cobertura actual no usable durante revisión, aspectos quantity/capacity/conditions pendientes y dos Tasks;16 no aplicado. | Auditor propio. |
| AC-038 | Despedida A10×150/B5×120, novi@A; falta modalidad o público no elegible. | F06 tres variantes completas; no promedio ni efecto automático por falta de modalidad/público. | Aplicada150/15 asistentes/14 pagadores; sin modalidad pending/importe null; público other ineligible/importe null. Booking íntegra y fila documental externa con base500 idénticas antes/después. No implica factura fiscal emitida ni obligación externa real. | Auditor propio. |
| AC-043 | P09, SPEC §24.2; cambio hora dentro20 conserva intervalo; fecha22 reevalúa solo alcance; cifra final específica no se propaga ni reescribe histórico. | F07 cambia hora real vía T04 y después fecha; F08 materializa Tasks por servicio, actualiza fecha y plazo solo correspondiente; F02/F09 guardas. | Evaluación histórica7 días/referencia20 preservada; acto posterior conserva antes20 y referencia actual22; hermano sigue20. Task fecha20→22 conserva historia, otra Task independiente y Task completed anterior no se alteran por plazo específico posterior. | Auditor propio. |

## Escenarios, precondiciones y trazabilidad funcional

Actor ordinario común: único Administrador ficticio, Auth verificada sintética con contraseña/MFA y sesiones explícitas. Ámbito: Opportunity/Booking/servicio/noche concretos; las carreras usan dos sesiones del mismo actor, respetando singleton. Bootstrap y migración solo preparan fixtures, fallos e inspecciones; aplicación siempre `crm_h0_runtime`. Todos los datos/contactos/documentos/canales son sintéticos.

| Caso | Precondición y datos | Acción/esperado | Observado final e instrumento |
|---|---|---|---|
| F01 | A10 rafting/cena/casa20–21; B2 cena/casa20; cuatro nombres N1. | T03 crea una Booking exacta, con cadena válida. | Una por Opportunity, tres servicios/seis contribuciones,10/12/12/10, cuatro participantes/asignaciones. |
| F02 | Misma aceptación previa, sin Booking convertida en ese caso. | Alterar asistentes globales, identidad nominal duplicada, night/line ajenos; rechazar sin efectos. | Cuatro denegaciones con snapshot completo idéntico; original después convierte. |
| F03 | Rafting10 confirmado; global12; cena12 con confirmación propia. | Global14 autorizado no altera detalle. Revisar cena y aplicar fecha22 solo con guardas. | Cantidades iguales, rafting usable, cena en revisión no usable y cambio preciso; historia y original íntegros. |
| F04 | N1/N2 y nominales previos. | Autorizar/aplicar fecha de N2. | N1 misma identidad/fecha/orígenes; N2=22/10; cuatro nombres y accepted_detail iguales. |
| F05 | Cantidad18 confirmada mediante modificación y hecho exacto proveedor. | Pedir16; ratificar únicamente horario. |18 vigente como hecho, original de confirmación intacto, tres aspectos pendientes, dos Tasks. |
| F06 | Dos modalidades15 personas y deuda documental externa sintética con base500 previa. | Calcular promoción elegible; retirar modalidad/público. |150 o pendiente/ineligible según prueba; ni asistentes ni fila externa cambian. |
| F07 | Referencia civil20/EuropeMadrid explícita, T04 horario y fecha separados. | Hora del20 conserva intervalo; fecha22 revisa solo servicio. | Histórico7d/20 íntegro; referencia actual22, hermano20. |
| F08 | Tasks de cifra final por servicio con referencias verificadas. | Recibir/repetir/actualizar referencia y completar; plazo específico posterior en otra. | Identidad estable, historia20→22, hermano íntegro y completed histórico íntegro. |
| F09 | Solicitud/evaluación válida; inputs/evidencias preparados antes de snapshot. | Retirar aprobación/pruebas, cambiar contexto Booking o material. | Denegaciones de aplicación real sin mutación; original aplica al final. |
| F10 | T04 aprobado con operación estable. | Fallo diferido en COMMIT; rollback total, retry y replay. | Efecto/historia/resultado/Tasks idénticos tras fallo; una aplicación, replay no duplica. |
| F11 | Igual, sin fallo de escritura. | Inyectar pérdida de resultado después de COMMIT y recuperar misma operación. | Aplicada ya persistida; replay idéntico sin versiones extra. |
| F12 | Dos modificaciones aprobadas incompatibles sobre N2, revisión1, dos sesiones. | Ambas órdenes con barrera real de Booking; una gana. | Dos sesiones Lock observadas, una aplicación y un conflicto por orden; N1/nominales íntegros. |
| F13 | T04 aplicado; rol ordinario, anon, authenticated y actor inhabilitado. | Contexto ausente/falso, CRUD directo y replay/consulta sin autoridad. | Todas denegadas; consulta cruzada devuelve null; habilitación restaurada y lectura legítima funciona. |
| F14 | Datos F01, precios/reglas fijos aprobados del fixture. | Leer cálculo/comercial, confirmar N1 y N2 individualmente; intentar ampliar N1 haciaN2; resumir. |900×1 por línea; finales1000.10/200.02; confirmaciones12/10 separadas; preparación resume12/10 y documento cliente conserva modalidades10/2. |
| S01 | Booking existente, T04 N2 aprobado, T03 equivalente nueva clave y replay exacto. | Dos sesiones, barrera Opportunity advisory31, primero T03 y primero T04; perder intento de alterar material. | Por orden se observan1 y2 esperas, ambas operaciones válidas, una Booking, N2=22 y accepted_detail original; replay no restaura21, cambio material denegado. |

Instrumentos: [focal F01–F14](../../tests/integration/postgres-h6-003-integrated.test.ts), [composición S01](../../tests/integration/postgres-h6-003-composition.test.ts), [fixture](../../tests/support/h6-003-integrated-fixture.ts), [runner controlado](../../scripts/run-h6-003.mjs). [Ronda completa final15/15](../../tests/fixtures/h6-003/runs/2026-10-25T22-41-50.363Z/stdout.log). [Regresión limpia174/174](../../tests/fixtures/h6-003/runs/2026-10-25T22-38-33.100Z/stdout.log). [Procedencia de copias](../../tests/fixtures/h6-003/regression-provenance-v1.json): exclusivamente puertos y rutas de evidencia generada; aserciones intactas.

Los defaults del lector no se borran mediante normalización general: para N1 se afirman exactamente `revision=1`, `cancelled=false` y las cinco claves id/date/contributionIds/revision/cancelled, además de los tres hechos originales. Review, pendingRevalidation e historial son efectos esperados observados separadamente. Los siete FAIL instrumentales históricos siguen FAIL; [hallazgos](findings-TSK-H6-003-local.md) identifica cada ronda y sucesor, sin doble conteo.


## Correspondencia independiente final

Dictamen propio `tests/fixtures/h6-003/independent/package/audit/h6-003/verdict.json`; matriz propia `matrix-independent.md` y observaciones `results-08.json` en el mismo paquete. Expectativas, fixtures e instrumentos independientes con PostgreSQL61600–61649. Independencia técnica entre agentes del mismo modelo, no auditoría humana externa.

| Asignación/criterio | Contraprueba original independiente | Resultado |
|---|---|---|
| P09 | A01–A05/A07/A14–A18 | PASS, ronda08 |
| E2E-03 | A01–A19, incluido A19 T03/T04 | PASS, ronda08 |
| AC-017 | A01/A02 | PASS, ronda08 |
| AC-018 | A03/A04 | PASS, ronda08 |
| AC-019 | A01/A05/A15 | PASS, ronda08 |
| AC-024 | A06 final08, ProviderConfirmation18 real usable antes de16 | PASS, ronda08 |
| AC-038 | A12/A13 | PASS, ronda08 |
| AC-043 | A07 | PASS, ronda08 |
