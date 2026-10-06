# Integración técnica de continuación, previa al producto

El borrador original se conserva íntegro. La garantía es un agregado por Booking/servicio/noche, con revisiones append-only. Exigencia pendiente de entrega y explicación de lo entregado son dimensiones separadas, sin clamping de excesos. Cada entrega tiene identidad fiable y porciones; las retenciones y restituciones consumen exclusivamente porciones disjuntas de esas entregas.

La restitución utiliza b05_refund_movements como hecho canónico. El Refund asociado tiene baseType=guarantee y referencia al Deposit/resolución, nunca Cancellation Right. Deposit conserva referencias al movimiento, no una segunda salida. La API Refund delega la actuación de garantía al mismo kernel transaccional y no permite eludir sus guardas por el recorrido contractual.

Custodia externa no utiliza porciones Customer Payment. Custodia interna referencia una Allocation real purpose=deposit y sus porciones verificadas; el movimiento Refund consume esas porciones con refund_portions y fund_refresh existentes. No se añade ledger. El receptor y origen se conservan desde la entrega real, independientes de cambios posteriores de proveedor.

Condiciones aplicadas: referencia de catálogo del servicio y texto/version/sourceRef de términos efectivamente aceptados H2. El actor no puede convertir un booleano en aceptación. La comprobación de condiciones/evaluación se acredita mediante B07 revisado y contenido exacto; la determinación sensible requiere reserva Human Approval exacta, ejecutada y finalizada dentro del adaptador TTE existente.

Las funciones refund_apply y refund_core cambian únicamente para admitir el enrutado explícito de garantía y impedir que el recorrido contractual escriba una raíz de garantía. Sus atributos se compararán; los demás cuerpos anteriores se preservan. Los hechos canónicos de devolución se proyectan mediante refund_read existente. No hay nuevo ejecutor externo.
