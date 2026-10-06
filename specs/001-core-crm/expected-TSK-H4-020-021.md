# Expected independiente congelado — TSK-H4-020/021

Base autorizada `77e36157f174eee1f796f429b556217b71d996fa`. 2026-10-06. Derivado de fuentes aprobadas antes de producto/verificador. No modificar bytes para obtener PASS. H4-022+, H5/H6, hosted y Production fuera de alcance.

## Autoridad y límites

Tasks fichas020/021, protocolos§2.2, unión23filas§6 y bloqueos§7. Textos exactos y referencias recuperables en `tests/fixtures/h4-021/normative-23.json`. SM§6 guarda anterior a tabla, §2.1G1–G6, §2.4/D020 y§16; BR-CONV-004/BR-DIM-001–005/BR-PAY-002; Plan§7.3/9 yC03/T08; D038/D039 yF1/F2/HA/TTE. AC-019/051 mantienen identidad/noches/revisión. E2E-01 solo traza tramo disponible; validación integralH6 futura.

Siete días: ≥7 durante todo día local; inicial50%; saldo no vencido hasta concluir día límite. Seis días:100% antes de confirmar. Momento de consulta y acto civil explícitos; una historia no garantiza cobertura actual permanente.

## Diseño previo de integración

Persistencia append-only de evaluación actual y decisiones/fundamentos por Booking. Servicios reales se clasifican con evidencia manual autorizada y fundamento por alcance; manifest incompleto no acredita ausencia de críticos. Cobertura se reconstruye de hechos/evaluacionesH4, requisitos/revisiones actuales y políticas/schedules/porcionesH3; no calculador o ledger nuevo. La consulta actual distingue snapshot histórico de aplicabilidad actual y faltas temporales.

UnidadT04: admisiónF1/F2→raíz de evaluaciónBooking→lectura actual de insumos→precondiciones/binding→evaluación/estado+historia+resultado+seguimiento local→revalidación→COMMIT. AI/excepción económica sensibles reutilizanT08/HA yTTE: contenido exacto incluye huella material vigente; reservar/consumir y aplicar comparten unidad. Final checkD039 bajo propiedad exclusiva delTTE; sin SQL/callback/handle del llamador.

Coordinación mínima propuesta: raíz advisory por Booking de evaluación, adquirida antes de leer insumos por evaluador, y antes de hacer visibles las escrituras materiales por escritores existentes. Root no sustituye sus locks de Opportunity/payment-root ni autoridad. Identificar insumos: alcance/servicios/noches, evaluación/revisión de confirmación, requisitos/documentos, catálogo aplicado, dependenciasAvailability/Hold, schedules/policies, recibos/conciliación/asignación/ajustes/salidas/reservas legítimosH3/H4, clasificación/evidencia y aprobación. La integración debe cubrir inserciones aunque no existan hijos; si hay varias Bookings, raíces en orden estable. Evaluador no adquiere inversamente raíces privativas de escritores tras raíz nueva; no introducir ciclo. Versiones/huellas del conjunto se verifican tras esperas. Cualquier cuerpo previo adaptado debe declararse, preservar atributos y probar ambos órdenes. F06: actorSHARE compatible; sesión/epoch exclusivos; autoridad mutadora exclusiva.

Fixture baseF: cadenaH2 normal con Acceptance, Booking/servicios/noches y catálogo sintéticos; contratosH3 ordinarios para política/schedule/recepción/conciliación/asignación; H4 ordinary para confirmación/requisitos/revisiones/Incident. SQL privilegiado solo instalación/observación/inyección técnica. Cada caso siguiente adaptaF únicamente en las precondiciones descritas. Cada fila registra ID, precondición/guarda retirada, acción, resultado exacto y conservación/efectos prohibidos. Fuente no especifica códigos técnicos para todo rechazo: E2 conflicto material; E3 guarda/evidencia insuficiente; denegado por autoridad. Estado parcial depende de cobertura independiente válida realmente existente.

## Matriz

|Caso|Norma|Fixture/precondición o guarda retirada|Acción|Expected|Conservación/efectos permitidos y prohibidos|
|---|---|---|---|---|---|
|B01|AC-016;DM-INV-006;SM-FORB-04;P08|F: Acceptance válida; sin fondos ni confirmación|convertir y evaluar|Ganada; Booking Pendiente de preparación; faltan críticos/economía|Acceptance, servicios y ledger intactos|
|B02|SM-BK-02;PLAN-B04|F: servicios/dependencias identificados y actuación registrada|iniciar coordinación|En confirmación con proveedores; incluye internos|Task local e historia; no crear proveedor|
|B03|SM-BK-02;G2|F: retirar manifest/identidad de servicios|iniciar coordinación|E3 o pendiente; no transición acreditada|sin efecto indebido|
|B04|SM-BK-02;G2|F: retirar actuaciones registradas|iniciar coordinación|E3 o pendiente; no transición acreditada|sin hechos fabricados|
|B05|AC-022;SM-BK-03|F: S1 externo llamada inequívoca registrada; S2 pendiente; S3 interno sin prueba|evaluar parcial|Parcialmente confirmada; únicamente S1 cubierto|sin escrito obligatorio ni proveedor ficticio|
|B06|AC-022;G2|F: S3 interno con responsable/prueba propia, S1 independiente|evaluar|S3 cubierto solo tras prueba propia|sin invoice/Suplido/pago externo|
|B07|SM-BK-03|F: ningún alcance confirmado válido|evaluar parcial|En confirmación si coordinación iniciada; no parcial ficticia|estado histórico conservado|
|B08|AC-023;SM-BK-04;DM-INV-023|F: 10 días; críticos cubiertos; inicial50% conciliado/asignado|confirmar|Confirmada operativamente|no modifica Opportunity, fondos, servicios|
|B09|AC-023;SM-FORB-06|F: retirar un crítico necesario|confirmar|no Confirmada; parcial si otro alcance válido|conservar independiente|
|B10|AC-023;G2|F: retirar prueba de capacidad/seguridad|confirmar|no Confirmada; dependencia específica pendiente|no dispensa por dinero|
|B11|AC-023;SPEC-FR-ECON-002|F: retirar recepción verificada|confirmar|economía pendiente; no Confirmada|sin dinero fabricado|
|B12|AC-023;SPEC-FR-ECON-002|F: retirar conciliación pertinente|confirmar|economía pendiente; no Confirmada|conservar conciliación histórica|
|B13|AC-023;SPEC-FR-ECON-002|F: retirar asignación pertinente/revertir|confirmar|economía pendiente; no Confirmada|otros destinos no se reutilizan|
|B14|AC-023|F: justificante/aviso/Expected Payment sin verificación|confirmar|no Confirmada; sin recepción/conciliación implícita|originales conservados|
|B15|AC-023;DM-INV-031|F: 6 días; cobertura50%|confirmar|no Confirmada;100% exigido|sin recálculo del ledger|
|B16|AC-023;DM-INV-031|F: 6 días; cobertura100% pertinente|confirmar|Confirmada si resto de guardas satisfechas|history/policy/reference|
|B17|SPEC-FR-ECON-001;D020|F: exactamente7 días;50% inicial|evaluar|inicial50%; saldo no vencido en ese día completo|distinguir exigencia inicial/vencimiento|
|B18|SPEC-FR-ECON-002;D020|F: último instante local del día límite|evaluar saldo|no vencido hasta concluir ese día|no168 horas/corte de servicio|
|B19|SPEC-FR-ECON-002;D020|F: día siguiente al límite impagado|evaluar|saldo vencido y guarda actual insatisfecha|sin cancelación/cobro automático|
|B20|D020;PLAN-T04|F: cambiar hora dentro del mismo día|reevaluar|mismo intervalo civil|otras dependencias horarias propias conservadas|
|B21|D020;PLAN-T04|F: cambiar fecha material de S1|reevaluar|plazos afectados actuales; historia intacta|S2/N2 independientes intactos|
|B22|SPEC-FR-ECON-001;DM-INV-031|F: política específica válida H3/contrato expreso|evaluar|partes/fechas/versiones correspondientes|sin segunda política implícita|
|B23|SPEC-FR-ECON-001;G2|F: referencia civil desconocida|evaluar|economía dependiente pendiente|no fecha inventada|
|B24|SPEC-FR-ECON-001;G2|F: zona desconocida|evaluar|economía dependiente pendiente|no zona presumida|
|B25|SM-FORB-06;AC-023|F: excepción económica autorizada exacta; sin saldo|confirmar|salva solo guarda económica|autoridad/actor/momento/motivo/evidencia|
|B26|SM-FORB-06;G3|F: excepción boolean/free text sin autoridad|confirmar|denegada o pendiente; no Confirmada|sin bypass|
|B27|SM-FORB-06|F: excepción económica; crítico/capacidad/requisito faltante|confirmar|no Confirmada|operación no dispensada|
|B28|G3;PLAN-C02|F: IA sin aprobación exacta|confirmar|denegado sin efecto|autoridad humana no inferida|
|B29|G3;PLAN-C02|F: aprobación exacta y TTE; guardas completas|confirmar|efecto+consumo+historia+resultado atómicos|final checkD039|
|B30|G3;PLAN-T04|F: A→B después de aprobación|ejecutar aprobación anterior|no aplicable al compromiso nuevo|historia A y aprobación intactas|
|B31|G3;PLAN-T04|F: V1→V2 después de aprobación|ejecutar aprobación anterior|no aplicable al compromiso nuevo|contratos H4-011/012 preservados|
|B32|SM-BK-05|F: confirmación histórica; S1 pierde cobertura; S2 válido|reevaluar|Parcialmente confirmada actual; historia Confirmada recuperable|no cancela compromisos|
|B33|SM-BK-05|F: confirmación histórica; último alcance pierde cobertura|reevaluar|En confirmación actual; historia intacta|no restaura hechos|
|B34|SM-BK-05;G4|F: retirar revisión/evidencia material de cambio|reevaluar|no atribuir invalidación ficticia; faltas actuales visibles|conservación obligatoria|
|B35|AC-019;PLAN-T04|F: N1=12/N2=10;4 nominalesN1|evaluar cobertura por noche|12 y10; no16/8 contactos inventados|cantidades/lista separadas|
|B36|AC-051;SM-BK-04|F: documento imprescindible Recibido sin revisar|confirmar|no Confirmada; requisito pendiente revisión|S2 independiente|
|B37|AC-051;SM-BK-04|F: documento imprescindible Revisado válido|confirmar|guarda documental satisfecha|no acredita otras guardas|
|B38|AC-051;G2|F: No aplica sin fundamento / requisito obligatorio|confirmar|no dispensa indebida|conservación del original|
|B39|AC-051;PLAN-T04|F: cambio material localizado de requisito|reevaluar|reabre solo necesidad afectada|revisión anterior intacta|
|B40|G2;DM-INV-023|F: retirar clasificación/fundamento de necesidad crítica|confirmar|no Confirmada; ausencia no prueba cero críticos|no lista universal|
|B41|G2;PLAN-C06|F: servicio no crítico pendiente con fundamento válido|confirmar|no bloqueo global por ese hecho solamente|pendiente visible por alcance|
|B42|G2;PLAN-C06|F: coverage menor que porción/noche crítica necesaria|confirmar|parcial pertinente; no completa ficticia|unidades/cantidades sin prorrateo|
|B43|G5;SM-FORB-04|F: Availability/Hold/Incident resuelta/dinero sin confirmación|intentar confirmar|no confirmación por arrastre|máquinas independientes|
|B44|G5;PLAN-C06|F: Task completada sin evidencia negocio|intentar confirmar|no satisface la guarda|Task no sustituye prueba|
|B45|SPEC-FR-ECON-002|F: fondos verificadamente usados en finalidad legítima H3|reevaluar|no impago por ubicación/consumo físico legítimo|misma semántica H3/ajustes|
|B46|SPEC-FR-ECON-002|F: garantía/reserva incierta/destino ajeno|evaluar anticipo|no cobertura ordinaria reutilizable|no doble cómputo|
|B47|SM-BK-05;D020|F: confirmación anterior50%; tiempo pasa de10→6|consulta actual|historia recuperable; guarda actual100%|evaluación anterior no garantía|
|B48|G1;PLAN-C02|F: sin F1/F2/contexto falsificado|mutar/leer/replay|denegado|sin lectura/enumeración ajena|
|B49|G1;PLAN-C02|F: sesión revocada/actor disabled/epoch expirado|mutar/leer/replay|denegado|ninguna actividad reactiva|
|B50|G1;PLAN-C06|F: IDs de Booking/evidence/servicio/schedule ajenos|mutar/leer|denegado sin revelar material privado|mínima proyección|
|B51|G1;PLAN-C02|F: runtime CRUD/helpers privados/DDL/rol ajeno|intentar SQL directo|42501 o denegación real|RLS/FORCE/ACL/search_path|
|B52|G6;PLAN-C02|F: misma identidad/material|replay|mismo resultado durable;no duplicados|reautorización antes de replay|
|B53|G6;PLAN-C02|F: misma identidad/material distinto|replay|E2|no consume aprobación ni efecto nuevo|
|B54|PLAN-C02;PLAN-T04|F: dos evaluaciones concurrentes misma revisión|ambos órdenes/solapamiento|una vigente;otra replay/E2 conforme clave|dos PID/xid/sesión;espera de negocio|
|B55|PLAN-T04;SM-BK-05|F: confirmar vs pérdida crítica|ambos órdenes/solapamiento|writer primero impide;confirmación primero conserva historia y actual pendiente|locks/versiones/cadena observada|
|B56|PLAN-T04;AC-051|F: confirmar vs reapertura documental|ambos órdenes/solapamiento|sin confirmar sobre insumo anterior cuando writer gana|historia original/revisión conservadas|
|B57|PLAN-T04;D020|F: confirmar vs alcance/fecha|ambos órdenes/solapamiento|no proyección vieja como autoridad;actual reevaluado|porción independiente|
|B58|PLAN-T04;SPEC-FR-ECON-002|F: confirmar vs cambio económico legítimo|ambos órdenes/solapamiento|versiones actuales;historia si cambio posterior|no garantiza inmunidad permanente|
|B59|G3;PLAN-T04|F: aprobación exacta vs cambio material|ambos órdenes/solapamiento|binding viejo no aplicable al material nuevo|historia/consumo atómico|
|B60|PLAN-C02|F: fallar entre evaluación/historia/resultado/Task|inyectar fallo SQL técnico|rollback completo|sin Confirmada residual|
|B61|PLAN-C02;G3|F: fallar COMMIT real/constraint diferida|inyectar fallo técnico|rollback completo y aprobación no parcialmente consumida|original FAIL y retest|
|B62|G6;PLAN-C02|F: COMMIT real;respuesta perdida|replay autorizado|mismo resultado durable sin repetir transición|no retry ciego externo|
|B63|PLAN-B04;PLAN-C02|F: vacío49→50|instalar|cadena íntegra y APIs reales disponibles|49 migraciones originales byte a byte|
|B64|PLAN-B04;PLAN-T04|F: upgrade49 poblado|migrar|datos/relaciones/originales/historia preservados|OID/firma/owner/ACL/config|
|B65|PLAN-B04|F: falloDDL antesCOMMIT|rollback/reintentar|sin cambio residual;reintento íntegro|rol migración exclusivo|
|B66|PT-03;E2E-01|F: cadena ordinaria H2→H3→H4 sintética|integrar|tramo Booking guardas probado;E2E integral futuro|H4-023/H6-001/H6-016 no acreditados|
|B67|G4;G5|F: regresión base completa y authorityF06|frozen/type/lint/build/audit/PG/unit/health/advisors|todos gates aplicablesPASS sobre SHA exacto|2010PG/138unit base;health separado|
|B68|G4|F: fuentes/expected/health/dependencias y49 migrations|comparar hashes/diff|intactos salvo integración mínima declarada|FAIL históricos intactos|
|B69|G1;G4|F: datos sintéticos y proyección|examinar salida|estado/cobertura/faltas pertinentes|economía reservada/originales privados;DM-PENDING-005 abierto|

## Verificación y publicación

V-DOM/V-DAT/V-SM/V-NEG/V-AT/V-MIG/V-EVI, sin mocks como prueba de seguridad/atomicidad. Concurrencia: dos sesiones reales, PID/xid/sesión, versiones, locks/granted/waits ypg_blocking_pids; distinguirF2/padre/root. Conservar FAIL originalesFxx/reproducción/causa/fix/retest. Regresión en SHA congelado: frozen install/typecheck/lint/boundaries/build/auditoría producción/PostgreSQL completo/unitarias completas/health-check independiente separado/V-MIG/advisors loopback/diff-check. Streams íntegros,status/signal/tiempos/manifiesto; ausencias declaradas. STOP inequívoco trasH4-021; cero cierre si gate/acreditación material pendiente.
