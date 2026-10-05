# H4-010 — Cronología conservada

F01 TÉCNICO DEL VERIFICADOR: dev-01.log conserva FAIL CATALOG_RELATION_INVALID. Fixture Offering no proporcionaba parent/related revisions al publicar. Fuente contrato catálogo H1 y V-DAT. Corregido fixture usando las revisiones reales; producto previo sin cambios. Retest pendiente.

F02 TÉCNICO DEL VERIFICADOR: dev-typecheck-01.log conserva FAIL por inferencia TypeScript UUID literal en parámetro de proof. Anotación string expresa; ningún cambio de expected/producto. Retest pendiente.

F03 MATERIAL: dev-02.log y dev-03-diagnostic.log preservan FAIL al evaluar SM-BS-04: precedencia de extracción JSON/resta hacía interpretar coverage como JSON. Fuente SM-BS-04/V-DOM R03. Corregido paréntesis explícito; reproducer focal permanente. Retest pendiente.

F04 MATERIAL: dev-04-matrix.log y dev-05-diagnostic.log preservan FAIL SQL alias root ambiguo con variable PLpgSQL root en comparación de hechos. Fuente E8/SM-BS-04 R03/R11. Alias context_root explícito; focal y matriz retest pendientes.

F05 TÉCNICO DEL VERIFICADOR: dev-04-matrix.log R02/R06 falla construyendo evidence certainty=received, no estado B07 permitido. Fixture corregido a candidate, que representa evidencia aún no revisada; expected intacto.

F06 TÉCNICO DEL VERIFICADOR: dev-04-matrix.log R12 crea Communication sin recipient_ref obligatorio. Fixture completa contraparte real; ninguna guarda relajada.

F07 TÉCNICO DEL VERIFICADOR: fixture Requirement confirm conservaba cobertura documentaria prepare. Ajustada al alcance real confirm de la necesidad; se reutiliza Application existente por servicio. Retest pendiente.

F06 diagnóstico precisado en dev-06-matrix.log: Communication incoming requiere initial_fact=received, no none. La contraparte añadida es pertinente pero no era la causa; fixture corregido sin alterar contrato B07.

F08 MATERIAL: dev-08-strengthened.log conserva FAIL R23 tras endurecer oráculo para exigir ambas operaciones reales satisfactorias: lookup de Availability usaba coverage inexistente en raíz y rechazaba dependencia legítima. Fuente T04/C06/BR-AVAIL-005. Usa coverage de confirmed.response y verifica unidad/cantidad/fecha/vigencia reales. Snapshot material de Hold omite request (no libera ni retira vigencia). Retest pendiente.

F09 MATERIAL: dev-08-strengthened.log conserva FAIL reproducer de cobertura actual tras nueva confirmación contradictoria verificada. La lectura no reevaluaba otras nuevas pruebas. Fuente E8/SM-PC-02/G5 R11. Consulta actual de hechos por alcance/momento, conservando anterior y sin orden de recepción. Retest pendiente.

F10 MATERIAL: dev-09-retest.log/dev-10-diagnostic.log preservan FAIL por precedencia JSON/concatenación al derivar instante explícito date/time de la dependencia. Fuente R23/V-DOM. Paréntesis de extracciones antes de concatenar. Focal/retest pendiente.

F11 TÉCNICO DEL VERIFICADOR: dev-11-retest.log y dev-13-pending-dependency-diagnostic.log conservan FAIL R23: se cambió la unidad real de Availability en receive pero el fixture Review conservaba la antigua. Fuente contrato SM-AV-04 guard dependencies. Se usa cobertura real recibida; guardas no relajadas. Retest pendiente.

F12 MATERIAL: dev-16-action-validity.log conserva FAIL del reproducer de Hold sin vencimiento: se aceptaba check de otra acción como cobertura de compromiso posterior. Fuente SM-HO-02/SM-BS-04/BR-AVAIL-003/G2 R23. Dependencia coteja momento de la acción de evaluación con check/verificación exactos; no usa la fecha futura del servicio como momento del compromiso ni inventa TTL. Request sigue fuera del token material y no resta capacidad. Retest pendiente.

F13 TÉCNICO DEL VERIFICADOR: dev-17-retest.log conserva FAIL AVAILABILITY_CHRONOLOGY_REQUIRED: fixture pedía verificación a momento anterior a registro de Availability. Se evalúa confirmación en momento real de comprobación a.at, con nueva prueba de comando. Ninguna guarda ni fuente modificada. Retest pendiente.

Aclaración de trazabilidad F07: fue una observación técnica estática del fixture durante el diagnóstico; no se atribuye un FAIL ejecutado independiente a F07. Los FAIL previos R05 estaban interceptados por F04. La retirada y satisfacción documental reales se verifican después por R05/R22, sin inventar una ejecución original.

Retest de desarrollo dev-18-retest.log: 45/45 PASS, 0 FAIL/skipped/cancelled. F01–F13 corregidos y reproducidos por la matriz definitiva; F02 además por dev-typecheck-05.log. El cierre definitivo se supedita a la regresión completa del SHA congelado, todavía en ejecución. F10 conserva el fallo de precedencia y su arreglo histórico aunque la comparación temporal posterior se precisó con F12.

Cierre definitivo: F01–F13 CLOSED local/aislado por regresión completa del SHA fc9c62ee514b0560fc94c980937bbb34160e0d9e;1488/1488 PostgreSQL,118/118 unitarias,health1/1 ytodos los gates PASS. Seis materiales (F03/F04/F08/F09/F10/F12),siete técnicos del verificador (F01/F02/F05/F06/F07/F11/F13),cero abiertos. FAIL originales ydiagnósticos conservados íntegros;expected bytes intactos.
