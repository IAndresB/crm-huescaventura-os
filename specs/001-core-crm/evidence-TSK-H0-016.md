# TSK-H0-016 — expected de implementación local

Base de trabajo: `52b1c696aeeab21a8db74eba3e656430ceba0ec2`. Fuentes: Tasks H0-016 y §6.9; Plan §§5.3/6.3–6.4; SPEC-FR-SEC-004, AC-080; PLAN-AUTH-005/006; D025/D027/D031. Este expected se fija antes de implementación y pruebas.

| ID | Esperado local |
|---|---|
| I01 | El inicio D027 requiere prueba opaca de enlace consumido, email previamente verificado y sujeto igual al CRM Actor. Un enlace inválido, repetido o email no verificado no altera Core. |
| I02 | El inicio D031 requiere prueba opaca de propietario independiente y autoridad vigente; actor/sujeto no cambian ni se crea otro Administrador. |
| I03 | Iniciar recuperación cierra Core de inmediato: incrementa generation una vez, conserva actor/historia/sesiones y registra incidente sin secretos. Una operación concurrente se serializa respecto al cierre. |
| I04 | Revocación Auth fallida o incierta deja recuperación parcial explícita; no se declara completada. La respuesta tardía o retry no revive autoridad previa. |
| I05 | Solo termina D027 tras contraseña nueva y TOTP vigente verificados por Auth; D031 exige factor nuevo, revocación del anterior y copia nueva verificada. Antes, Core denegado. |
| I06 | Al completar, nueva identificación completa crea sesión/epoch nuevos. Los anteriores siguen denegados por generation; reset no salta MFA, 7/30 ni F1/F2. |
| I07 | IDs duplicados equivalentes son idempotentes, IDs distintos en carrera no abren dos recuperaciones, replay cruzado deniega. |
| I08 | Runtime carece de DML directo y de emisión F1; PUBLIC/anon/authenticated y Data API carecen de EXECUTE. RLS/FORCE, owners y locks conservan mínimo privilegio. |

Los proveedores Auth/email y dispositivos se sustituyen por dobles aislados. H6 debe acreditar entrega, autoridad y factores reales. Ningún secreto real se conserva en este registro.

## Observado y resultado local

Entorno: macOS local, Node 24.21.0, pnpm 11.19.0, PostgreSQL 17.11 efímero; identidades, claves F1/F2 y factores representados con datos sintéticos. Implementación: `src/application/recovery-authority.ts`, `src/infrastructure/postgres/h0-016-adapter.ts`, composición servidor y migración forward-only `20260929000000_h0_m06_access_recovery.sql`. El doble Auth no entrega email ni prueba TOTP real.

| IDs | Observado | Resultado |
|---|---|---|
| I01/I03/I05/I06 | D027 cierra Core, revoca generation anterior, conserva actor/sesiones y exige prueba TOTP antes de reabrir; nueva identificación crea sesión/epoch nuevos. | PASS local |
| I01/I02 | Email sin verificación, enlace no consumido y propietario no independiente deniegan sin cambiar generation. | PASS local |
| I04/I05 | D031 exige nuevo factor, revocación del anterior y nueva copia verificada; fallo de Auth deja `recovery_in_progress`. | PASS local |
| I07/I08 | Duplicado conserva generation, nuevo ID concurrente deniega; runtime sin DML, roles públicos sin EXECUTE; tabla con owner separado y FORCE RLS. | PASS local |

Focal H0-016: 5/5 PASS. Regresión: `pnpm install --frozen-lockfile` PASS; `pnpm audit --prod` sin vulnerabilidades conocidas; typecheck, lint/boundaries, unitarios 31/31 y build PASS; PostgreSQL completo 259/259 PASS, 0 omitidos/cancelados, 396,203 s; `git diff --check` PASS. La suite histórica H0-001–014 siguió pasando. No hubo F01+ material en focales. La comprobación H0-017 y H6 son independientes y no se heredan de esta salida.

La recuperación parcial ante fallo o incertidumbre de revocación Auth permanece cerrada para revisión/conciliación; no se afirma que un proveedor real pueda reintentarla automáticamente. No se usaron cuentas, emails, dispositivos, QR ni secretos reales. Hosted M03/M04/M05/M06 no se aplicó. PLAN-AUTH-005/006 siguen PENDING globalmente.
