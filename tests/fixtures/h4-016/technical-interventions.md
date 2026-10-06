# Intervenciones técnicas — registro documental, no streams raw

Durante dev19, el harness aguardaba una revocación síncrona bloqueada por la autoridad TTE. Se liberaron exclusivamente los blockers de ensayo mediante pg_terminate_backend del backend crm_h0_migration cuya última consulta era pg_advisory_xact_lock, en loopback puertos56932/56933, bases crm_f16_tte_actor/session.

Durante dev21, mismo actor F2 serializaba autoridad/actividad mientras el harness esperaba el segundo scope antes de soltar el primero. Misma intervención sobre blocker en loopback56920/base crm_h4016, dos fixtures. Los comandos y salidas se observaron en herramientas de la conversación, sin archivo raw independiente. No se reconstruyen stdout/stderr/status/signal del backend. Runner conserva las salidas originales del ensayo y su status real.

No se interrumpió proceso de negocio ni PostgreSQL ajeno; no se reseteó Git, no se borraron datos del proyecto. Los retests corrigen la espera del harness, conservan locks/garantías del producto y distinguen orden serial de autoridad de independencia material de scopes.
