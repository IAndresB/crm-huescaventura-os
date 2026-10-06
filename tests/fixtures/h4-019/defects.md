# Cronología H4-019

## F01 — técnico de entorno

Primera ejecución `focal1`: se invocó directamente node --test sin el runner Storage aislado. FAIL ejecutado `ISOLATED_STORAGE_REQUIRED` en before, antes de producir estados funcionales. Logs stdout/stderr/status conservados. Corrección: invocar scripts/test-postgres.mjs, que crea PostgreSQL/Storage oficiales exclusivamente loopback. No modifica producto ni expected. Retest pendiente.

## F02 — técnico del fixture, con bloqueo normativo localizado

`focal2` FAIL ejecutado en before: intento de provisionar segundo actor por API de migración devuelve F2_DENIED. Diagnóstico independiente: crm_actors.unique(singleton), D015, ARCH-DEC-004, SPEC-FR-SEC-001 y D038 §CRM Actor mantienen un único Administrador. F2 usa FOR UPDATE de actor antes del kernel. No se cambia producto ni autorización. Se corrige fixture a dos sesiones válidas del mismo actor; esta prueba pública NO acredita por sí sola solapamiento de consumidores en raíz económica. La obligación fuerte de H4-019 sigue PENDING hasta criterio normativo concreto; dirección consultada. Expected intacto.

## F03 — técnico del fixture

`focal3`: cuatro FAIL J03/J04, ambos órdenes, CANCELLATION_BASE_REQUIRED:E3 antes de la carrera. El fixture reutilizado tenía precio fijo/grupal sin base atribuible legítima; no permite inventar precio por participación. Corrección del nuevo fixture: alcance servicio y determinación explícita del Administrador por contrato existente c.base, evidencia revisada y registro B07. Conserva fixture original, producto y expected. No se fabrica Cancellation Right para Deposit; el derecho separado pertenece únicamente a Refund contractual competidor.

## F04 — técnico del nuevo verificador

`development-typecheck` FAIL TS2540: seis mutaciones deliberadas de inputs negativos readonly sin tipado mutable del fixture. Corrección únicamente en el nuevo verificador: inputs de inyección tipados mutable/any. Producto/contratos readonly intactos. Retest pendiente.

## F05 — técnico del nuevo verificador

`focal6` 61 PASS/1 FAIL. J14 esperaba texto público D019_REQUIRED:E3; el adaptador vigente sanitiza ese error como ALLOCATION_DENIED. Expected exige rechazo/pendiente localizado, conservación y ausencia de efecto; no exige publicar código interno. Corrección de la nueva aserción al contrato público vigente, manteniendo las cuatro causas y comparación completa de estado antes/después; no cambia expected ni verificadores históricos. Retest pendiente.

F01/F03: retest focal4 y focal8 PASS. F04: development-typecheck-retest PASS. F05: focal8 PASS, las cuatro causas bloqueadas sin efecto. CLOSED técnicos local/aislado.

## F06 — material de acreditación / observación estática y evidencia de locks

No es un FAIL económico ejecutado ni un defecto de sobreconsumo observado. D015, ARCH-DEC-004, SPEC-FR-SEC-001 y D038 autorizan un actor operativo singleton. crm_f2.admit bloquea actor FOR UPDATE antes del kernel y conserva esa exclusión hasta COMMIT. focal3–focal8 muestran primera sesión esperando en payment-root observacional y segunda sesión serializada por F2 o un padre dependiente. Los casos públicos pasan, pero no sustituyen el solapamiento económico exigido por dirección H4-019. No se elimina singleton, no se amplían permisos ni se debilita F2. Hace falta criterio normativo/técnico aprobado para el ensayo económico independiente de esa serialización. OPEN localizado; impide COMPLETED de H4-019. Trabajo independiente continúa; ninguna tarea posterior iniciada.

Cierre técnico F02: dos sesiones ordinarias válidas del único actor se establecen y ejecutan los contratos en focal8 y regresión final1995/1995; ya no se intenta provisionar segundo actor. CLOSED técnico; F06 conserva separadamente la falta material de acreditación, no escondida como fallo técnico.

Resultado definitivo del verificador 6dbd550:1995/1995 PostgreSQL,138/138 unitarias,health1/1 separado y gates PASS. F01/F02/F03/F04/F05 CLOSED técnicos. F06 OPEN de acreditación. No FAIL económico de sobreconsumo observado, ni fix de producto aplicado. Los FAIL de desarrollo y sus status quedan intactos. El expected independiente permanece congelado.

Trabajo dependiente pendiente: demostrar entrada concurrente de consumidores en raíces económicas sin confundir exclusión F2. Hace falta criterio aprobado de ensayo que mantenga autoridad ordinaria y D038/D039/TTE; o decisión concreta de coordinación F2 que permita tal solapamiento con garantías equivalentes. No se interpreta autorización de H4-019 como alta de actores futuros o permiso para ejecutar el kernel por SQL privilegiado. La consulta a dirección permanece pendiente. Todo el trabajo independiente descrito está verificado; ninguna tarea posterior preparada.
