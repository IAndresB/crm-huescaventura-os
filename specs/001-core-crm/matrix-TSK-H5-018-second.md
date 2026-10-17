# H5-018 — segunda auditoría: matriz normativa y observada

Identidad C verificada en `tests/fixtures/h5-018-second/identity.json`. Resultado global FAIL por H5-018-2-F01. Las13 filas asignadas de Tasks §6 se contrastaron literalmente con las fuentes actuales y constan en normative.json. A01–A20 proceden del esperado independiente anterior, cuyo SHA se volvió a verificar; no del expected del implementador C. Precisión temporal adicional congelada en archivo distinto, sin alterar el esperado inicial.

| Obligación / fuente | Evidencia actual o reutilizada verificada | Resultado y límite |
|---|---|---|
| SPEC-FR-HIST-001; Constitución P06/P07 | A10, M01, R01/R02, preservación | Historia física intacta; FAIL funcional de localización de petición tras revisión. |
| SPEC-FR-ERR-001; AC-072 | A01–A09/causes, repetición de25 originales; T04 | PASS E1–E8 y coexistencia, E4 incierto/E5 conocido; no nuevo estado de negocio. |
| AC-070; PLAN-B08 | A12/A13, C04/C06, regresión seguridad | PASS trabajo incompleto, incertidumbre, aviso CRM, canal no disponible, pausa/detención; sin envío real. |
| AC-081 | A10/A11/A14, R01/R02 | Originales PASS; R01 FAIL dos veces: petición válida deja de localizar historia autorizada tras `revise`. |
| SPEC-NFR-009; DM-INV-047 | M01; A10; R01; identidad histórica | Actores/fechas/versiones e inmutabilidad conservados; defecto funcional de correlación abierto. |
| SPEC-NFR-010 | A12/A14; C02/C03; R01 | Minimización y trabajo pendiente PASS; recorrido por petición FAIL bajo revisión posterior. |
| SPEC-NFR-014; SM-FORB-27 | A04/A05/A09 y T04; unitarias208 verificadas | PASS excepción real con efecto durable E4/pending y una invocación; E5 explícito/precontrato conservado. |
| P12 y P10/P11; PLAN-C01/C04 | A11/A14/A15; C02/C03/C04/C07; M01 | PASS negativos de UUID/tipo, contexto, MAC, interacción, sesión/actor, ACL, RLS/FORCE, canarios, errores mínimos; sin acceso real. |
| PT-11; Tasks §2.2 V-DOM/V-DAT |48/48 repetidos en PostgreSQL17.11; casos propios T01/T04/M01/O01/R01/R02 |5/6 propios utilizables PASS, R01 FAIL. Cuatro aserciones iniciales excesivas conservadas y excluidas de conclusión material. No sumar con2834 históricos. |
| V-MIG y P13 | M01 nuevo1/1; dos C12 repetidos dentro de48 | PASS upgrade64→65 con datos, rollback/reintento,175 tablas,302→305 funciones,332 políticas,1037 restricciones;2 cuerpos sustituidos con atributos/ACL conservados. Instalación limpia y roles creados después PASS. |
| Plan B01/B07/B08/B10, §§7.1/8/11.2 | Revisión directa de SQL64/65/composición y lectores propietarios; originales y casos temporales | Correlación histórica falla por clasificación actual demasiado restrictiva. Ninguna política nueva necesaria para formular el defecto. |
| Preservación H5-016 y anteriores | identity.json, historical-reuse.json, final-preservation.json |455/456 idénticos,1 transición explícita de composition.ts. Fuentes/migraciones y evidencias anteriores intactas; sin fingir456 identidades. |
| Frozen/typecheck/lint/build/audit/health | Capturas actuales12/13/07; evidencias C exactas de frozen/build/audit/units/full | PASS controles técnicos con procedencia separada. No neutralizan R01 FAIL. |
| Tasks §7; DM-PENDING-005 | Ningún cambio de coordinación/producto | Pendiente abierto; sin retención/anonimización/borrado/política inventados, sin Hosted/Production/H5-019/H6. |

F03 A–J: A fallo conocido antes del contrato=A05 y C09; B excepción desconocida=A04; C efecto durable y excepción=A04/T04; D rechazo explícito=C09/T04; E éxito explícito=T04; F trabajo incompleto=A12; G autorización actual=A15/D06/T04; H duplicados y replay=C04/C09/T04; I composición real y consumidores=causes, guardas de preservación y regresión verificada; J éxito técnico no acredita negocio=C05 y technicalOnly. Los dobles y ejecuciones sintéticas acreditan exclusivamente esos contratos locales.
