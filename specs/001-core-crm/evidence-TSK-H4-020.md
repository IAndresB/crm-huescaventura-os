# Implementación TSK-H4-020 — preparación y confirmación de Booking

Base autorizada `77e36157f174eee1f796f429b556217b71d996fa`; preflight fetch/main/HEAD/origin y árbol limpio PASS. Expected publicado ANTES del producto en `33c8666f58f0af915a652e41260b4996bb60b928`, SHA256 `fc6468995b62cba6ad5eeeb40e27074a20a1fe9d96a06a7c57739a4ddf87978c`. Sus bytes permanecen congelados. Producto `1964dd732b2832988bf97a4a36e8f143d681bcc4`. SHA definitivo/gates: pendientes de ejecutar; este documento no acredita cierre.

## Integración implementada

Una migración forward50 creada por `npx --yes supabase@2.119.0 migration new h4_booking_preparation_confirmation`;49 anteriores intactas. API estrecha `booking_preparation_apply/read`, adapter `h4-booking-preparation-adapter.ts`, tipos `booking-preparation.ts`. Tres registros append-only: operaciones durables, evaluaciones/historia y binding de aprobación. El estado heredado de conversión sigue siendo histórico; la fase operativa vigente procede de la API nueva. No UI ni prestación futura añadidas.

El manifest identifica los alcances reales y su necesidad/fundamento/evidencia; no presume críticos universales ni convierte opcionales en bloqueos. Cobertura utiliza `confirmation_current`, versiones operativas, catálogo aplicado y requisitos revisados. Las noches usan asistentes por contribución vigente, sin contar nominales otra vez; fechas diferentes de un servicio se separan por contribución. Ausencia o cobertura menor no acredita completo. Los cambios de fecha/proveedor/variante conservan las fuentes/contratos H4-011/012 y la evidencia histórica.

Economía reusa las partes vigentes H3 y `fund_coverage`; no introduce calculador monetario ni ledger. Se guarda política/base/referencia/porciones/demanda/cobertura. Por defecto a10días inicial50%; a7días sigue50% inicial durante todo el día límite; a6días100% antes de confirmar. Civil no168horas. Referencia material diferente exige revisión del schedule; zona/referencia ausente impide determinar el cálculo dependiente. Condiciones específicas legítimas H3 se respetan. Consumo legítimo no equivale a impago. Excepción económica exacta solo salva las condiciones económicas indicadas, jamás crítico/capacidad/documento.

Manual ordinario exige F1/F2 y evidencia propia revisada. AI o excepción usa Human Approval y TTE existentes, exacta al JSON y huella material actual. `createBookingPreparationExecutor` conserva conexión exclusiva; caller sin SQL/callback/handle. Reserva/binding/evaluación/Task/historia/resultado y finalización D039 comparten unidad y COMMIT. Replay reautoriza antes de recuperar el resultado; mismo ID/material diferente E2.

## Raíces y preservación

Raíz nueva `booking-preparation:<bookingId>` adquirida por lectura/evaluación tras admisión F2 y antes de insumos. Escritores conservan sus raíces previas Opportunity/payment-root; triggers `preparation_material_lock` obtienen Booking antes de hacer visible material. IDs indirectos se resuelven por sus raíces allocation/refund/deposit/provider-payment/modification/requirement/confirmation/availability/hold; múltiples Bookings ordenadas. Se cubren creación de primera necesidad/schedule/allocation, revisiones y versiones operativas. El evaluador no adquiere después raíces privativas de escritores; su seguimiento tiene causa específica Booking. Esperas/versiones se observan con sesiones distintas. Actor `FOR SHARE` F06 queda intacto; sesión/epoch y autoridad mutadora exclusivos. Autoridad final F2/F1 permanece.

ÚNICO cuerpo SQL previo adaptado: `crm_api.b07_task_apply`, factorización del core existente en `booking_preparation_task_core`. Se conservan admisión y verificación final, validación ordinaria, OID/firma/owner/ACL/config y semántica Task. No se conceden permisos ni actores nuevos. Todos los demás cuerpos originales intactos según comparación de catálogo. Tablas nuevas RLS/FORCE, ACL mínimo, search_path `pg_catalog,pg_temp`; runtime sin CRUD/helpers/DDL ni endpoint sensible.

El verificador J22 histórico cuenta explícitamente las49 migraciones hasta F06, preservando su aserción49 y hash de las48 originales; la cadena actual50 se prueba aparte. No se cambian fuentes aprobadas, expected históricos, health-check/documentación independiente ni dependencias.

Fuentes exactas: [expected](expected-TSK-H4-020-021.md) y23 filas en `tests/fixtures/h4-021/normative-23.json`. D020/D038/D039/SM§6 guardas conjuntas; detalles de revisión en [H4-021](evidence-TSK-H4-021.md). CLI consultada según [documentación oficial](https://supabase.com/docs/reference/cli/supabase-migration-new). Changelog [PG17.11](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes) revisado: instalación aislada nueva, digest/HMAC pgcrypto; no ltree/legacy PGP/custom operator usados en este cambio. Advisors solo loopback.

STOP H4-020/021. H4-022+, H5/H6, prestación/cierre, avisos/conectores, hosted/Production y datos/efectos reales fuera de alcance. DM-PENDING-005 abierto.
