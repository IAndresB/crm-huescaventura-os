# Observación original de dirección H4 — antecedente estático

Transcripción del hallazgo recibido antes de reproducción, sin presentarlo como FAIL PostgreSQL:

> En la migración:
> supabase/migrations/20261005202444_h4_operational_modification.sql
>
> - crm_private.modification_source lee b04_services y compara
>   v.applied.provider / v.applied.variant.
> - La guarda requester.kind=provider de modification_apply también
>   consulta b04_services y sus valores originales.
> - El alcance operativo vigente se conserva por separado en
>   b04_operational_versions y b04_current_services.
>
> Recorrido crítico:
> a) Booking H2 real con proveedor A expresamente fijado.
> b) Modificación legítima aplicada que cambia ese servicio de A a B.
> c) El lector canónico muestra B y conserva el snapshot aceptado con A.
> d) Nueva modificación sobre el compromiso vigente de B.
> e) Petición y respuesta legítimas de B deben validarse según la
>    facultad y el compromiso pertinentes.
> f) El vínculo histórico de A no lo convierte automáticamente en
>    contraparte válida para modificar ese nuevo compromiso de B.
>
> El hallazgo de dirección es estático. No lo describas como un FAIL
> PostgreSQL ya ejecutado. Reprodúcelo y conserva el resultado original.

La reproducción posterior se conserva separadamente en `repro-01`, SHA73c7ab9:0PASS/4FAIL. El cierre publicado anterior y final3 no se reinterpretan como cobertura del caso nuevo.
