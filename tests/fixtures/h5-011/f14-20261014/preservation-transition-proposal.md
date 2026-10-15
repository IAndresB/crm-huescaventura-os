# H5-011-F14 — transición de preservación propuesta, pendiente de aprobación

Estado: correctivo del fixture aplicado y R06/suplemento45/45 PASS; transición NO APLICADA. H5-011 IN PROGRESS y H5-012 NOT STARTED.

## Diagnóstico y semántica

R06 fija el primer comando evaluate en 2026-10-13T21:59:59+02:00. El fixture de confirmación fija f.at con new Date() y f.proof usa ese instante como occurredAt. En el árbol anterior, attest preservaba q.at para el comando pero no para su evidencia; desde14/10 r.occurred_at>at_time y payment_evidence rechaza E3.

BR-HIST-002 (docs/business-rules.md §21), Domain Model §5.2/§7 y Constitution P06/P07 distinguen hecho y registro. R06 congelado (expected-TSK-H4-011-012.md R06: AC043/D020/CHG009/SPEC11.2) conserva días7/3, alcance y decisiones históricas. B07 registra occurred_at explícito y recorded_at=clock_timestamp(), sin equipararlos. La guarda payment_evidence de 20261003093202_h3_customer_payment_reconciliation.sql exige occurred_at<=at_time, claim, coverage, contexto, scope, reviewed y fuente manual/external; modification_apply exige además recorded_by=actor. La igualdad de instantes está admitida. No se presume que esta evidencia acreditaría aprobación o acceso retroactivo real: toda la simulación es sintética y usa autenticación actual aislada.

## Correctivo aplicado

Única ruta funcional: tests/support/h4-modification-fixtures.ts. Claim canónico idéntico, mismo B07 y mismo actor, finalidad/contexto other, cobertura, certeza reviewed y procedencia manual. q.at===f.at conserva f.proof exactamente. Si existe override explícito, occurredAt=q.at; recorded_at continúa asignado por B07. El instante ya no depende del reloj de ejecución en esa rama; UUID, registro y la preparación normal conservan su comportamiento existente. No se modifica Date ni ninguna aserción de R06.

Original:2856bytes, SHA2567739f5603d576a41855c0d1238f1f2535568e2dd34f4a8fd0f48d35fec8d75ed. Correctivo:3177bytes, SHA2565cb28867ff6bbba211ff04fd65dc39f8d00c26727957bcc3d827e37708cd14d2. Original archivado en fixture-before.ts.txt y verificable en Git71906987. Diff exacto en fixture-corrective.diff.

## Procedimiento aprobado encontrado y límite de autorización

El precedente F12 (specs/001-core-crm/evidence-TSK-H5-005-006-F12.md) mantiene manifiestos inmutables y solo admite pares de hashes literales bajo autorización expresa. El precedente C12 en tests/support/h5-006-dependency-preservation.ts añade una transición individual y el auditor autentica la guarda ANTES de importarla. El protocolo publicado tests/fixtures/h5-009/f09/closure-protocol-20261013/README.md exige: «El revisor debe comprobar el diff exacto y suministrar separadamente el nuevo sello de trust.json». «El hash calculado durante desarrollo es una propuesta; no equivale a una aceptación externa».

Son precedentes de versiones protegidas autorizadas; no habilitan una lista abierta ni una transición F14 automática. La guarda vigente no contiene F14. Añadirlo modifica una guarda histórica protegida. El auditor actual se encuentra sellado y verifica sus bytes; tampoco acepta las nuevas rutas H5-011 en su inventario cerrado H5-009/010. Conforme a la instrucción actual§4: «Si el procedimiento exige aprobación adicional para alterar una guarda o auditor histórico, prepara la propuesta y detente antes de modificarlo». STOP antes de cualquier cambio de guarda/auditor/sello/inventario histórico. El fixture autorizado sí está corregido; no es un cierre de preservación.

## Propuesta concreta para revisión

1. guard-transition.proposed.diff añade únicamente f14Transition/assertF14Transition y su llamada en assertHistoricalBytes/assertHistoricalHash. Ruta literal, original y corregido exactos, Git719 como baseline, tipo regular0644, tamaños, bytes actuales en disco, expected H5 congelado y registro exacto de autorización. Rechazo de tercera versión y hash histórico falso. No altera las entradas F07/F09/C12/F10/F12 ni los manifiestos originales. Hash anterior de guarda8a422285bd817982eeb9c8785616aed07a209121ea7290b9075a1348f3ba49f5; propuesto722780f466a8d1f490ad3a4b993dfc1cda49bb1ee09242c1c7bbc192d09f8aa2. El diff es propuesta; no se ha aplicado ni atribuido PASS.
2. Tras aprobación expresa, crear transition.authorized.json con el literal definido en el diff. La propuesta actual transition.proposed.json nunca se usa como autorización efectiva ni sello.
3. Incorporar un protocolo sucesor H5-011 separado y revisable: autenticar la guarda exacta antes de importar; mantener originales y sellos C12/F16/cierre; ejecutar auditor histórico intacto sobre su snapshot publicado y contrastar el árbol actual contra los hashes históricos, admitiendo únicamente la transición F14 exacta y las nuevas rutas H5-011 inventariadas. No atribuir el auditor de un snapshot antiguo al producto actual. Si la revisión exige modificar el auditor vigente, solicitar autorización específica de esa ruta; no está autorizado por esta propuesta.
4. La autoridad revisora debe suministrar el sello externo del nuevo registro de confianza. No autoaprobarlo desde su propio hash. Contrapruebas en copias: original/correctivo admitidos; fixture tercera versión, histórico falso, ruta/tamaño/modo/symlink alterados, registro inexistente/manipulado, expected alterado, guarda alterada, inventario adulterado y sello incorrecto rechazados. Reejecutar negativos F06/F07/F08/F09/F16 sin cambiar originales ni límites históricos.
5. Solo después del cierre de esa transición: resto H4-012 y consumidores directos/transitivos, guardas, PostgreSQL completa, unitarias, build/typecheck/lint, health y audit sobre árbol definitivo. Conservar y separar todos los resultados antiguos, incluido2492/2493; no reutilizar194/194 ni otros gates anteriores para el fixture corregido.

## Resultado y STOP

Runner oficial aislado, suplemento completo45/45 PASS, R06 con todas sus aserciones originales PASS,0 skipped/cancelled/todo. Registro de árbol tested-inputs.candidate.json SHA256a88f185697b7bc4a7727ec768af758e4aaabfae52bc8a59d5c40afacea85fea3. La guarda vigente acepta el buffer histórico y rechaza el correctivo, una tercera versión y un hash original falso; son resultados esperados de la guarda existente, NO validación de la transición propuesta. Resto de gates NO EJECUTADOS tras STOP; preservación obligatoria PENDIENTE. F14 permanece OPEN: correctivo funcional focal verificado, cierre de preservación pendiente.
