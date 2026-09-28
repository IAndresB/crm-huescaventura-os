# TSK-H0-015 — preparación local de recuperación y dispositivos

Estado: COMPLETED únicamente en preparación documental local. Base: `fab39ebd0b856beff368f839ea871711d28e4e3c`. Entorno: repositorio local; sin Auth, email, dispositivo, factor ni cuenta real. Fuentes: Tasks §4.1/§6.9, Plan §§6.1–6.4/11.3, D025/D027/D031 y P13.

## Autoridad y medios

| Componente | Autoridad y función | Frontera local / acreditación posterior |
|---|---|---|
| Core | CRM Actor estable, habilitación, sesión, epoch, generation y F1/F2. Deniega expedientes durante enrolamiento/recuperación incompletos. | PostgreSQL efímero con identidades sintéticas; permisos y regresión local H0-016/017. Hosted pendiente. |
| Auth | Identifica al Administrador, contraseña y TOTP; emite estado verificado. El restablecimiento de contraseña no acredita TOTP. | Doble aislado para contratos; proveedor real pendiente H6. |
| Email de seguridad | Enlace D027 solo al email del Administrador previamente verificado; retorno seguro y enlace de uso único. No es conector comercial ni avisos D016. | Buzón y entrega reales pendientes H6-010. No publicar dirección/enlace. |
| Otro dispositivo | Contraseña y TOTP del factor vigente; varias sesiones permitidas, cada una con 7/30 días propios. | Sintético local; dispositivo real pendiente H6-009. |
| Papel | Copia protegida fuera de iCloud del secreto/configuración TOTP **vigente**, no código temporal ni recovery code. Restaura el mismo factor y no recupera contraseña. | Comparación sintética local; copia física y restauración real pendientes H6-009. |
| Break-glass D031 | Cuenta propietaria de Supabase independiente del usuario CRM y de los medios perdidos; autoridad verificada antes de actuar. Mínimos permisos, revocación, incidente, recuperación mínima, nuevo TOTP y nueva copia verificada. | Doble de autoridad aislado; independencia, permisos y recorrido reales pendientes H6-011. No garantiza recuperar también la cuenta propietaria perdida. |

## Guiones preparados y expected previo a implementación

| ID | Procedimiento y expected local | Evidencia real posterior |
|---|---|---|
| P01 | Enrolamiento interrumpido, actor inhabilitado, identidad/MFA incompletos o enlace inválido/consumido: sin Core ni nuevas sesiones autorizadas. | H6-008/010. |
| P02 | D027: email previamente verificado, enlace de un uso, contraseña nueva y TOTP vigente. Antes de TOTP, Core denegado; sesiones/generaciones anteriores no se reactivan. Fallo de entrega/retorno queda pendiente, no éxito. | Entrega y retorno H6-010. |
| P03 | Otro dispositivo: identificación completa y actividad propia; sesión abandonada no se renueva por usar otro dispositivo ni por refresh. | Dispositivos H6-009 y superficies H6-008. |
| P04 | Papel: restaurar el factor vigente sin iCloud; copia antigua/incorreta deniega. Reinscripción exige verificar nueva copia; la anterior deja de servir. | Papel protegido H6-009. |
| P05 | D031: verificar autoridad independiente; cerrar Core/revocar todas las sesiones; registrar incidente/acciones sin secretos; restablecer solo lo necesario, enrolar TOTP nuevo y verificar copia nueva. Core sigue cerrado mientras falte un paso o Auth sea incierto. | Autoridad/permiso/proveedor H6-011. |
| P06 | Carreras, duplicados, replay y respuesta tardía no restauran sesión/epoch/generation anteriores ni producen éxito ficticio. Estado parcial explícito y revisión. | Auth y datos hosted H6. |
| P07 | Recuperación de datos, objetos, referencias e idempotencia es procedimiento separado de acceso; restaurar no revive revocaciones. Intervención administrativa de base sigue P13: emergencia crítica, administrador autorizado, intervención mínima, registro y migración equivalente inmediata en Git. | Restauración H6/ARCH-PENDING-002. |

Ningún guion autoriza email real, propietario real, secreto duradero, QR, cuenta/dispositivo real ni hosted. H0-016 puede ejecutar controles locales con dobles sintéticos; H0-017 deberá fijar matriz normativa independiente antes de revisar sus assertions.
