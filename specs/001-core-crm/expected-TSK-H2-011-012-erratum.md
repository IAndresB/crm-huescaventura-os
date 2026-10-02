# Erratum recuperable del verificador H2-011

2026-10-03, antes de repetición. El expected original706c1e4 queda byteidéntico.

F01 — materialidad de verificación: R01/R02/R04 anotaron7 contribuciones sin fuente. El desglose normativo de AC-017/BR-PACK-002/DM10.2 exige A:rafting,cena,noche1,noche2=4; B:cena,noche1=2; 4+2=6. No se infiere del código. Oráculo corregido: exactamenteesas6 contribuciones conlas mismas cantidades rafting10/cena12/noches12/10 ytodoslos vínculos. Primeraejecución FAIL6!=7 conservada, no cambiaproducto ni requisitos.

F02 — R13 consulta l.snapshot, inexistente en la tabla publicada b03_proposal_lines. El contrato exige fecha propia de línea; columna real service_date. Expected fechas/ocupaciones/certidumbre no cambia. Primeraejecución42703 conservada.

Original completo tests/fixtures/h2-011/verifier-first-original.ts.txt y first-formal.log. Reproducers ejecutarán original sinalterarasserts/expected (solo ruta temporal/puerto aislado) y deben observar ambosFAIL originales. Cierre F01/F02 únicamente después de matriz completa+regresión PASS. Ambos pertenecen al verificador, no defectos productivos. No nueva migración.
