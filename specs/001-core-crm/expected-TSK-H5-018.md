# TSK-H5-018 — esperado independiente, anterior a la ejecución

Estado: congelado para auditoría del candidato H5-017; no aceptación. Base 9649a2773530ea8a43237b4e1f2034f80e34136f. Identidad completa: tests/fixtures/h5-018/candidate-seal.json. No se altera ningún archivo del candidato, incluidos sus documentos.

Autoridad: Constitución P05/P06/P07/P10/P11/P12/P13/P14/P18/P19; Tasks ficha H5-018, §2.2, §6 completo y §7; SPEC §§14/19/20/21/24.4/25; Plan §§4/7.1/8/11.2; DM-INV-047; SM-FORB-27. Las filas literales asignadas están en normative-rows.json. La implementación y sus pruebas solo sirven para elegir puntos de entrada, nunca para definir estos resultados.

| Caso | Fuente | Escenario independiente y resultado exigido |
|---|---|---|
| A01 | SPEC §19 E1, AC-072, V-DAT | Permiso ausente: rechazar acceso y efecto; consulta legítima localiza rechazo sin revelar contexto protegido. |
| A02 | SPEC §19 E2, AC-072 | Dos contenidos para una identidad: conservar original y conflicto, sin sobrescritura ni efectos duplicados; localizar ambos contextos. |
| A03 | SPEC §19 E3, AC-072 | Evidencia necesaria ausente: pendiente identificado, investigación independiente permitida. |
| A04 | SPEC §19 E4, SM-FORB-27 | Efecto sintético seguido de excepción/timeout: incierto, nunca fracaso definitivo/éxito ni reintento automático; intento y efecto canónico no desaparecen. |
| A05 | SPEC §19 E5, AC-072 | Fallo conocido sin efecto: causa técnica diferenciada; siguiente revisión solo permite reintento seguro. |
| A06 | SPEC §19 E6, AC-072 | Canal no disponible: parte pendiente, sin entrega; combinado con contacto incierto conserva también E4. |
| A07 | SPEC §19 E7, AC-072 | Alternativas ambiguas: original y revisión conservados; extracción no confirmada. |
| A08 | SPEC §19 E8, AC-072 | Documento nuevo contradice anterior: ambas evidencias conservadas y revisión del alcance, sin reescribir historia. |
| A09 | SPEC-FR-ERR-001, NFR-014 | Causas coexistentes con ámbitos diferentes mantienen sus códigos/estados/revisiones; un fallo del registrador no cambia efecto ya conocido. |
| A10 | HIST-001, NFR-009, DM-INV-047, AC-081 | Petición → operación → ejecución/intentos → versiones/aprobaciones → historia/evidencia verificables; actor/ejecutor/responsable/momentos separados. |
| A11 | PLAN-C01, C04, AC-081, P10 | Referencia de otro contexto no amplía consulta ni acceso al original. Probar raíces con identificador igual y tipo distinto, referencias de otro expediente, y actor/sesión revocados. |
| A12 | Plan 11.2, NFR-010, PLAN-B08 | Trabajo incompleto, antigüedad y reclamación vencida visibles; lectura no recupera ni reintenta ni acredita efecto. |
| A13 | AC-070, Plan §8 | Fallo persistente visible, detener/revisar efectivo; WhatsApp no disponible separado del aviso CRM; sin email ni recursión. |
| A14 | AC-081, P12, NFR-010 | Canarios sintéticos en secretos/tokens/URLs/cuerpos/economía/identidades no aparecen en respuesta diagnóstica, error, sink ni persistencia mínima. Comprobar valores y no solo nombres de campos. |
| A15 | P10, V-DAT | Sin Auth/MFA/interacción, contexto falsificado, sesión revocada, rol runtime/API/TTE: denegación; RLS/FORCE RLS y privilegios efectivos, dueño de tabla sin bypass. |
| A16 | V-DAT, P07 | Observación persistente inmutable; replay equivalente, conflicto sin cambio, referencias inexistentes rechazadas; no sustitución de hechos por accepted técnico. |
| A17 | V-MIG, P13 | Instalación64 limpia, upgrade63 con datos anteriores, rollback transaccional fallido y reintento; datos/funciones/ACL previos preservados; roles API presentes y creados después. |
| A18 | V-EVI, P06/P07 | 36.775 archivos históricos, 456 inputs H5-016, expected/migraciones1–63 idénticos; FAIL2762/25 original y migración previa recuperables y diferentes del candidato corregido. |
| A19 | §2.2/2.3, Plan §10 | Regresiones aplicables, health separado y controles técnicos; separar pruebas nuevas, repeticiones e historial reutilizado, sin sumar solapamientos. |
| A20 | §7, P18/P19 | DM-PENDING-005 abierto, sin plazos/políticas/servicios reales, H5-017/018 sin COMPLETED; H5-019/H6 no iniciados. |

Las pruebas se desarrollan desde estos resultados. Escenarios de negocio sintéticos pueden usar preparación histórica existente; las aserciones nuevas se escriben independientemente. Los dobles de canales solo acreditan el contrato simulado. No se supone independencia de autor humano/modelo: auditoría independiente por fuentes, esperado y contrapruebas separadas dentro del mismo chat.
