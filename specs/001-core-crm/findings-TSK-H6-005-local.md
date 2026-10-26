# H6-005 — hallazgos técnicos y sucesores

Sin defecto material de producto detectado ni corrección de producto. Expected-v1 original intacto.

La primera focal produjo5FAIL instrumentales: detección representa desconocido como null; nombre verifiedCorrespondence; nueva discrepancia implica Revisión; fixture de cancelación histórica desajustada con acto fijo; cierre requiere aplicabilidad explícita; error público tras respuesta perdida se sanitiza. Se agrupan los dos primeros en el mismo casoC01. Los instrumentos originales y snapshots de cada ejecución permanecen. Sucesor9/9PASS.

C10 inicial usó identidad inexistente, que fue rechazada antes de revisar documento(INVOICE_DOCUMENT_REQUIRED); sucesor usa otra identidad sintética existente y observa Incidencia por destinatario e importe, sin ajustar contenido para cuadrar. Focal final10/10PASS.

La regresión inicial551 registró512PASS/39FAIL. Los39 pertenecen a H4-019 y fallan antes del efecto por cronología de evidencia de cancelación histórica creada ahora frente al acto fijo17octubre. El sucesor cambia únicamente importaciones a la fixtureG ya existente y conserva cada aserción normativa. H4-019 sucesor63/63PASS;488restantesPASS ya observados;total único551/551PASS. CadaFAIL→sucesor figura en `findings-regression39-successors.json`; no se convierte elFAIL original enPASSretroactivo.

| FAIL original | Caso sucesor observado | Resultado |
|---|---|---|
|J07 T08 exact authorization vs competing Allocation80 on100 0,1|J07 T08 exact authorization vs competing Allocation80 on100 0,1|PASS|
|J07 T08 exact authorization vs competing Allocation80 on100 1,0|J07 T08 exact authorization vs competing Allocation80 on100 1,0|PASS|
|J01 Allocation80 vs Refund80 on100 0,1|J01 Allocation80 vs Refund80 on100 0,1|PASS|
|J03 Refund vs guarantee restitution shared internal100 0,1|J03 Refund vs guarantee restitution shared internal100 0,1|PASS|
|J04 Refund vs Provider Payment shared managed funds 0,1|J04 Refund vs Provider Payment shared managed funds 0,1|PASS|
|J06 disjoint Allocation20 and Refund20 plus safe revaluation 0,1|J06 disjoint Allocation20 and Refund20 plus safe revaluation 0,1|PASS|
|J01 Allocation80 vs Refund80 on100 1,0|J01 Allocation80 vs Refund80 on100 1,0|PASS|
|J03 Refund vs guarantee restitution shared internal100 1,0|J03 Refund vs guarantee restitution shared internal100 1,0|PASS|
|J04 Refund vs Provider Payment shared managed funds 1,0|J04 Refund vs Provider Payment shared managed funds 1,0|PASS|
|J06 disjoint Allocation20 and Refund20 plus safe revaluation 1,0|J06 disjoint Allocation20 and Refund20 plus safe revaluation 1,0|PASS|
|J10-13 public concurrent uncertainty sameFact 0,1|J10-13 public concurrent uncertainty sameFact 0,1|PASS|
|J10-13 public concurrent uncertainty overlap 0,1|J10-13 public concurrent uncertainty overlap 0,1|PASS|
|J10-13 public concurrent uncertainty disjoint 0,1|J10-13 public concurrent uncertainty disjoint 0,1|PASS|
|J10-13 public concurrent uncertainty rest 0,1|J10-13 public concurrent uncertainty rest 0,1|PASS|
|J10-13 public concurrent uncertainty allocation 0,1|J10-13 public concurrent uncertainty allocation 0,1|PASS|
|J10-13 public concurrent uncertainty sameFact 1,0|J10-13 public concurrent uncertainty sameFact 1,0|PASS|
|J10-13 public concurrent uncertainty overlap 1,0|J10-13 public concurrent uncertainty overlap 1,0|PASS|
|J10-13 public concurrent uncertainty disjoint 1,0|J10-13 public concurrent uncertainty disjoint 1,0|PASS|
|J10-13 public concurrent uncertainty rest 1,0|J10-13 public concurrent uncertainty rest 1,0|PASS|
|J10-13 public concurrent uncertainty allocation 1,0|J10-13 public concurrent uncertainty allocation 1,0|PASS|
|J10/J12 exact partial20 rest60 not_occurred|J10/J12 exact partial20 rest60 not_occurred|PASS|
|J10/J12 exact partial20 rest60 occurred|J10/J12 exact partial20 rest60 occurred|PASS|
|J11 F13/F24 absence inference outside|J11 F13/F24 absence inference outside|PASS|
|J11 F13/F24 absence inference attemptId|J11 F13/F24 absence inference attemptId|PASS|
|J11 F13/F24 absence inference incident|J11 F13/F24 absence inference incident|PASS|
|J19 replay reauthorized actor|J19 replay reauthorized actor|PASS|
|J19 replay reauthorized session|J19 replay reauthorized session|PASS|
|J19 individual ordinary write guard context|J19 individual ordinary write guard context|PASS|
|J19 individual ordinary write guard F1|J19 individual ordinary write guard F1|PASS|
|J19 individual ordinary write guard F2|J19 individual ordinary write guard F2|PASS|
|J19 individual ordinary write guard evidence|J19 individual ordinary write guard evidence|PASS|
|J19 individual ordinary write guard booking|J19 individual ordinary write guard booking|PASS|
|J19 individual ordinary write guard payment|J19 individual ordinary write guard payment|PASS|
|J19 individual ordinary write guard recipient|J19 individual ordinary write guard recipient|PASS|
|J19 individual ordinary write guard method|J19 individual ordinary write guard method|PASS|
|J19 individual ordinary write guard amount|J19 individual ordinary write guard amount|PASS|
|J19 private catalogue runtime/anon/authenticated CRUD denied and minimal scope reads|J19 private catalogue runtime/anon/authenticated CRUD denied and minimal scope reads|PASS|
|J07 exact Human Approval material changes rejected, no fund reservation|J07 exact Human Approval material changes rejected, no fund reservation|PASS|
|J14 AC040 operational cancellation legitimate while economic base remains pending|J14 AC040 operational cancellation legitimate while economic base remains pending|PASS|

Auditoría independiente PENDING;ningún dictamen humano externo atribuido.
