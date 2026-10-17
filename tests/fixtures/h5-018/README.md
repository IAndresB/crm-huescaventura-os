# Evidencias TSK-H5-018

Candidato congelado: candidate-seal.json + candidate-manifest.json.gz + candidate-overlay.tar.gz. Base9649a277; no cambios al candidato. Esperado previo en specs/001-core-crm/expected-TSK-H5-018.md.

01/02:16 tests independientes,14 PASS/2 FAIL idénticos F01/F02. 03:dos FAIL del instrumento de migración; snapshot original conservado.04:instrumento corregido2/2 PASS.05/11:nueve casos de causas/composición,8 PASS/1 FAIL idéntico F03.14:cinco controles PASS; mediciones F02/F03 no los cierran.

06/15:typecheck.07:lint.08:201 unitarias.09:health1.10:29 regresiones H5-017.12:build.13:audit producción0 vulnerabilidades.16:fallo de reconstrucción del auditor; snapshot original.17:verificación corregida de reutilización histórica. Cada etiqueta tiene status/input hashes y stdout/stderr lossless gzip.

32 tests nuevos únicos29 PASS/3 FAIL; repeticiones no sumadas. 2788 completa/104 adicionales/frozen install se reutilizan con verificación de inputs; no se reejecutan ni contienen las contrapruebas H5-018. preservation.json acredita hashes históricos/candidato. Informe, matriz y defectos en specs/001-core-crm. Auditoría FAIL, sin aceptación ni producto corregido.
