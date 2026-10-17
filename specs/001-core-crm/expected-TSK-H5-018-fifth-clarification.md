# Quinta auditoría — aclaración de precondiciones V01/V03

El expected congelado original y la captura02 (9 PASS/2 FAIL) permanecen intactos. Esta aclaración no cambia normas ni producto; documenta dos errores del instrumento propio antes del retest.

V01: la evidencia nueva tiene su propia finalidad. El fixture copió `purpose` de la comunicación anterior, por lo que B08 rechazó correctamente la revisión con WORK_APPROVAL_REQUIRED antes de la aserción adversarial. BR-DOC-001 y SPEC-FR-HIST-003 exigen finalidad coherente; el retest transporta `evidence.purpose` junto a su `recordId`. No se cambia aprobación, seguridad o SQL.

V03: la afirmación inicial «la reserva no adquiere operación de oportunidad como propia» era demasiado amplia para la oportunidad canónica de ESA reserva. BR-BOOK-001 (business-rules.md:82) concentra su procedencia comercial; BR-HIST-002 (:253) conserva vínculos entre oportunidad/reserva/servicios; HIST006 y C01 exigen respetar relaciones autorizadas, no suprimirlas. El contrato B07 existente resuelve la oportunidad canónica de una reserva mediante b04_bookings, igual que sus servicios. No existe norma que exija denegar esa relación acreditada.

El retest verifica primero, mediante el lector B07 independiente del diagnóstico, que esa evidencia de oportunidad es accesible desde su reserva. Solo entonces exige la relación canónica y conserva la investigación y repetición originales. Añade una reserva ajena como control negativo; esa reserva no puede consultar la operación. La rama histórica explícita y sus marcadores se prueban en V02 entre raíces SIN relación canónica, donde sí son obligatorios. No se atribuye una fuga entre raíces ni usuarios al resultado02 de V03.

Original del instrumento conservado en `tests/fixtures/h5-018-fifth/instrument-originals/sequences-v1.ts`; hashes exactos en la captura02. No se sobrescribe un FAIL, una prueba recibida ni un expected anterior. Esta aclaración es visible en el informe final y no oculta que el primer oráculo V03 tuvo una premisa equivocada.
