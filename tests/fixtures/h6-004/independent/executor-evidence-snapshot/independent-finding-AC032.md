# Hallazgo independiente IA04-07 / AC-032

La primera matriz del autor acreditaba la cláusula «fondos ya pagados al proveedor no reducen el derecho» mediante H4-014 C15. La lectura independiente del cuerpo mostró que C15 registra un enunciado B07 de salida al cliente y cálculo parcial; no persiste un ProviderPayment previo. A06 calcula el derecho200 y H3-012 verifica pagos en otras raíces, pero esa combinación no acredita la interacción en la misma Booking.

**Hallazgo de cobertura material aceptado.** No se formalizó COMPLETED mientras faltaba esta prueba. `coverage-matrix-v1.json` y `verification-v1.json` quedan preservados como antecedentes; su validación de hashes/títulos era correcta, su atribución semántica a esa cláusula era insuficiente. No cambian Tasks, SPEC, expected, producto ni las 68 migraciones.

Correctivo aditivo: `tests/integration/postgres-h6-004-ac032.test.ts`. Crea por contratos ordinarios un cobro700 y una obligación con un componente de proveedor200, abre el pago, asigna fondos, registra programación autorizada mediante TTE y salida sintética acreditada200. A continuación cancela el mismo servicio de la misma Booking y determina D019 explícito200 por causa del proveedor: derecho200, retención0, sin descontar el pago ya realizado. Las identidades Booking/servicio se comparan explícitamente; pago e historia, fondos y servicios restantes quedan intactos; no se crea Refund ni otra salida por determinar el derecho.

Primera ejecución propia: `supplement-2026-10-22T23-50-13-251Z`, **1/1 PASS**, stdout SHA `edfad3ec1ca286752370a64c012facfa86a2a7a2dd43666d2c48bd90262973c0`. `ac032-readback.json` conserva la lectura antes/después. La condición de no reembolsable expresamente aceptada sigue probada por H4-014 C01/C05; el suplemento prueba la interacción de fondos pagados y derecho en la misma raíz.

`coverage-matrix-v2.json` sustituye en AC-032 la atribución C15 por S01; el focal original31 permanece intacto. El dictamen independiente definitivo determina el cierre de este hallazgo después de su propia repetición e inspección del suplemento. No se presenta la nueva prueba como ejecutada en A/B ni se reescribe el intento original.
