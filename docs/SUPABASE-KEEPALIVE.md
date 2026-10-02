# Health-check técnico de Supabase

Configurado y verificado el 2026-10-03 (Europe/Madrid), fuera de H0–H6.
H2 permanece IN PROGRESS; H2-011/012 siguen NOT STARTED y no fueron modificadas.

## Proyecto y motivo

Único destino autorizado: **CRM Huescaventura OS - Staging**, ref
`wrcrhbdbydkchxxlcacb`, organización `dzgrnoidxesrxjtafqwz`, región `eu-west-1`.
El conector oficial observó plan **Free**, estado **ACTIVE_HEALTHY**, PostgreSQL
17.6, primario disponible. La identidad coincide con la documentación y las
pruebas hosted existentes del repositorio. El otro proyecto de la organización
no se utilizó. Production queda fuera del alcance.

Existe para comprobar la disponibilidad SQL del backend y generar actividad
técnica diaria durante periodos sin usuarios. La [política oficial de pausa](https://supabase.com/docs/guides/platform/free-project-pausing)
describe baja actividad de usuarios durante siete días y menciona unas pocas
peticiones diarias como orientación; no publica un umbral contractual ni confirma
que consultas internas de Cron se contabilicen igual que solicitudes de usuarios.
**Este mecanismo no garantiza evitar la pausa.** Su eficacia concreta frente a
esa política queda pendiente de observación; tampoco reanuda una base pausada.

## Arquitectura y alcance

Un solo job nativo de [Supabase Cron](https://supabase.com/docs/guides/cron),
`crm-huescaventura-os-daily-health`, jobid observado `1`, con expresión
`17 3 * * *`: **cada día a las 03:17 UTC**. El parámetro de plataforma
`cron.timezone=GMT` es equivalente a UTC, sin cambios estacionales; la migración
exige GMT/UTC y la sesión del check establece UTC explícitamente. No se cambió
la zona global. El worker nativo estaba activo y la ejecución real funcionó.

Se eligió el scheduler nativo porque ejecuta SQL real sin usuarios, usa la
infraestructura del propio proyecto y no necesita servicios, dependencias de
aplicación ni secretos nuevos. Vercel es una plataforma prevista en la
arquitectura, pero su despliegue/scheduler no están acreditados en este proyecto.
Un scheduler externo añadiría configuración y credenciales. No se configuró.
El `/health` de Next.js existente solo valida configuración; no acredita conexión
a la base y se conserva sin cambios.

Cada ejecución abre una conexión local de Cron como el rol administrativo
existente `postgres`, necesario para el scheduler y su historial. Primero acota
**exclusivamente el historial técnico de este job** a los 30 registros más
recientes. Esa transacción se confirma antes del check, para que un error del
check no revierta la retención. No elimina historia del CRM ni de otros jobs.
Después inicia `BEGIN READ ONLY`, cambia a `crm_supabase_health` y usa
`search_path=pg_catalog`, timeout de sentencia de 5 s y de bloqueo de 1 s.

La comprobación exige la base `postgres`, el rol técnico esperado, transacción
read-only, ausencia de recuperación/standby, ausencia de superuser/BYPASSRLS en
el rol y una entrada válida de la base en `pg_catalog.pg_database`.
Consulta únicamente catálogos; emite un mensaje técnico con estado, ref, rol y
latencia. Si falla una guarda, genera error; no convierte un fallo en éxito.
Cron conserva resultado, timestamps, error y duración total de la ejecución.
La retención funciona mientras se pueda ejecutar su fase inicial; errores
persistentes de esa fase requieren intervención para evitar acumulación.

`crm_supabase_health` es NOLOGIN, NOINHERIT, NOSUPERUSER, NOCREATEDB,
NOCREATEROLE, NOREPLICATION y NOBYPASSRLS, sin contraseña ni acceso a los
esquemas `crm_*` o `cron`. Solo el administrador existente recibe capacidad
SET sobre ese rol, sin heredar sus privilegios. No se añadió SECURITY DEFINER
propio. Las funciones administrativas de la nueva extensión Cron se restringen
a la superficie administrativa; no se concedió acceso a anon/authenticated.

No consulta clientes ni entidades comerciales, no genera filas ficticias,
no cambia estados de negocio, Auth, políticas RLS existentes, networking, planes
ni secretos existentes. No hace HTTP, envíos, reintentos automáticos ni efectos
externos. Un error queda aislado del CRM. No hay secretos, variables de entorno,
Vault entries ni configuración NEXT_PUBLIC nueva.

## Migración y reproducción

Nueva migración operacional:
[`20261002225221_crm_supabase_daily_health.sql`](../supabase/operations/20261002225221_crm_supabase_daily_health.sql).
Creada con `supabase migration new` (CLI 2.119.0) y aplicada íntegramente con
`supabase_apply_migration`, nombre `crm_supabase_daily_health`, al ref autorizado.
El servicio registró versión hosted **20261002225323** (su timestamp de aplicación).
El cuerpo registrado y el archivo local deben ser idénticos.

Permanece en `supabase/operations/`, separado de las migraciones funcionales
canónicas: el entorno hosted conserva su baseline operacional H0 y no tiene
H1/H2 hosted acreditados. No ejecutar `db push` de la cadena funcional para
instalar este job ni reproducir migraciones ya aplicadas. No se editó ninguna
migración anterior.

Para reproducir en un entorno expresamente autorizado, comprobar primero ref,
baseline, ausencia de esta migración/job/rol, pg_cron disponible y precargado,
timezone GMT/UTC, launcher y logs habilitados. Aplicar el archivo completo con
el conector oficial y después verificar permisos, worker y una ejecución real.
La [instalación oficial de Cron](https://supabase.com/docs/guides/cron/install)
respalda CREATE EXTENSION y los permisos administrativos utilizados.
La migración es forward-only y deliberadamente falla si la extensión/rol ya
existen: no reinstala ni sobreescribe recursos existentes. Los cambios de
programación posteriores usan las [funciones oficiales de Cron](https://supabase.com/docs/guides/cron/quickstart),
nunca DML directo sobre `cron.job`.

Se verificó upgrade desde el estado hosted real y creación inicial del módulo,
rol y job, previamente ausentes. No se reseteó el proyecto ni se ensayó una
instalación completa del CRM desde cero: esta operación no cambia esa cadena.
La prueba local aislada valida el SQL exacto del job y su retención, no emula
el scheduler o la extensión hosted.

## Verificar, probar manualmente y desactivar

Desde [Cron → Jobs](https://supabase.com/dashboard/project/wrcrhbdbydkchxxlcacb/integrations/cron/jobs),
abrir **History** del job. También desde SQL Editor o `supabase_execute_sql`,
siempre con `project_id=wrcrhbdbydkchxxlcacb`:

```sql
select jobid, jobname, schedule, active, database, username,
       current_setting('cron.timezone') as timezone
from cron.job
where jobname = 'crm-huescaventura-os-daily-health';

select runid, status, return_message, start_time, end_time,
       extract(epoch from end_time - start_time) * 1000 as duration_ms
from cron.job_run_details
where jobid = (select jobid from cron.job
              where jobname = 'crm-huescaventura-os-daily-health')
order by runid desc limit 10;
```

La próxima hora prevista se calcula desde el cron activo; no es una reserva
garantizada de ejecución. Para el horario configurado:

```sql
select active, schedule,
  case when (now() at time zone 'UTC')::time < time '03:17'
    then date_trunc('day', now() at time zone 'UTC') + interval '3 hours 17 minutes'
    else date_trunc('day', now() at time zone 'UTC') + interval '1 day 3 hours 17 minutes'
  end as next_scheduled_utc
from cron.job
where jobname = 'crm-huescaventura-os-daily-health';
```

Para una prueba manual, consultar `select command from cron.job where
jobname = 'crm-huescaventura-os-daily-health';` y ejecutar **todo el texto devuelto**
en una sesión administrativa separada, sin transacción envolvente. El comando
contiene sus propias transacciones. No usar EXECUTE dentro de una función/DO
para ejecutar ese texto. La prueba manual produce el log SQL de health; solo
las ejecuciones del scheduler generan entradas en `cron.job_run_details`.

Los [logs de PostgreSQL](https://supabase.com/dashboard/project/wrcrhbdbydkchxxlcacb/logs/postgres-logs)
incluyen mensajes que empiezan por `crm-huescaventura-os health ok`. Con
`supabase_query_logs`, indicar el ref y una ventana UTC explícita de hasta 24 h:

```sql
select timestamp, event_message
from logs
where source = 'postgres_logs'
  and event_message like 'crm-huescaventura-os health ok%'
order by timestamp desc limit 10;
```

La ausencia de ejecuciones recientes también indica un problema: una base
pausada/caída no puede registrar su propio fallo. No se añadió un monitor
externo ni notificaciones. La retención de los logs generales depende del plan.
El [diagnóstico oficial de pg_cron](https://supabase.com/docs/guides/troubleshooting/pgcron-debugging-guide-n1KTaz)
describe worker, historial y logs.

Para desactivar de forma reversible, como administrador:

```sql
select cron.alter_job(
  job_id := (select jobid from cron.job
             where jobname = 'crm-huescaventura-os-daily-health'),
  active := false
);
```

Reactivar con `active := true`. No desinstalar pg_cron ni borrar roles/history
como parte de la desactivación. Retirar/desactivar cuando el plan deje de estar
sujeto a pausa, haya monitorización equivalente o la política cambie. Cualquier
eliminación definitiva de recursos requiere una autorización separada.

## Evidencia de aceptación

- Preflight: fetch correcto, main limpio, HEAD=origin/main=
  `b94bdb10e7182a7affe2738f2a7277bc25ea23a3`.
- Scheduler real probado adelantando una única ejecución del mismo job a
  `2026-10-02 22:54 UTC`, sin duplicarlo ni cambiar su comando; después se
  restauró `17 3 * * *`.
- Runid `1`: **succeeded**, `2026-10-02T22:54:00.120252Z` →
  `2026-10-02T22:54:00.138442Z`, **18,19 ms**, resultado `COMMIT`.
- Log real: `database=postgres role=crm_supabase_health readonly=on`, latencia
  del bloque **1,49 ms**, ref correcto. Prueba manual adicional del mismo comando
  completada sin error.
- Job único activo, worker observado, GMT/UTC, próxima ejecución calculada en
  cierre **2026-10-03 03:17 UTC** (05:17 Europe/Madrid).
- Catálogo CRM antes/después idéntico: 20 relaciones, 10 funciones, 8 políticas,
  20 triggers y 6 roles existentes; incluidos OID, definiciones, ACL, propietarios
  y flags RLS. El rol nuevo no tiene USAGE sobre CRM ni acceso efectivo a DML.
  No se consultaron filas comerciales para esta evidencia.
- Security Advisor: sin lints. Historial de migraciones previo conservado.
- Prueba local PostgreSQL 17.11 **1/1 PASS**: retención 40→30 registros propios,
  conservación de 40 ajenos, repetición idempotente, rechazo de rol incorrecto,
  DML en transacción read-only y acceso del rol técnico al esquema cron.
  Comando: `POSTGRES_H0_BIN=/ruta/a/postgres/bin node --test tests/operations/supabase-health.test.mjs`.
- Regresión proporcional: lint/import boundaries, **81/81 unitarias**,
  typecheck y build PASS. No se ejecutaron suites hosted de negocio ni se aplicó
  H1/H2 hosted. Código de aplicación, tasks y documentos de estado intactos.

El efecto acreditado es actividad SQL técnica diaria y diagnóstico de la base
cuando está disponible. No acredita Auth, Data API, disponibilidad de la app ni
cierre funcional de milestones. Si llegan avisos de pausa, revisar la política
y las ejecuciones; no asumir que este job ofrece una garantía contractual.
