# Evidencia — TSK-H0-001

Estado: COMPLETED en su alcance de preparación
Fecha de consulta y ejecución: 2026-09-15
Entorno: Work Local Mac, macOS 26.5.2 (arm64), repositorio `IAndresB/crm-huescaventura-os`, rama `main`
Base inicialmente comprobada: `c3910ea531bf3c43f84b4a7604c724f082706886`
Commit finalmente probado: el commit único de publicación que contiene este archivo, recuperable con `git log -1 --format=%H -- specs/001-core-crm/evidence-TSK-H0-001.md`; su igualdad con `origin/main` se comprobó después del push.

## 1. Alcance y trazabilidad

Esta evidencia cubre exclusivamente TSK-H0-001: compatibilidad de versiones, recursos por entorno, capacidad publicada, límites técnicos y coste previo al acceso. No implementa ni prepara TSK-H0-002.

Correspondencias exactas asignadas a TSK-H0-001 en `tasks.md`:

| ID | Asignación | Resultado de esta tarea |
|---|---|---|
| AC-079 | Desarrollo | Recursos y secretos separados por entorno; Development local, Staging y Production con proyectos propios. |
| SPEC-NFR-004 | Desarrollo | Se preserva Work Local Mac y el aislamiento Development/Staging/Production. |
| ARCH-DEC-017 | Desarrollo | Tres entornos separados; no se ha creado ninguno. |
| PLAN-DEC-001 | Desarrollo | Propuesta concreta de Node.js/TypeScript/Next.js y SDK; instalación y build quedan fuera. |
| PLAN-B10 | Desarrollo | Inventario de acceso, infraestructura, evidencia y costes; no es salida completa de H0/H6. |
| PLAN-AUTH-001 | Desarrollo parcial | Capacidad documental y coste calculado; configuración, entrega y ensayos reales siguen pendientes. |

## 2. Entorno local observado

| Elemento | Esperado para TSK-H0-001 | Observado | Resultado |
|---|---|---|---|
| Repositorio | Remoto `git@github.com:IAndresB/crm-huescaventura-os.git`, `main`, árbol limpio, base publicada esperada | Remoto y rama correctos; árbol limpio; `HEAD == origin/main == c3910ea531bf3c43f84b4a7604c724f082706886` antes de editar | PASS |
| Sistema | Mac compatible para Work Local | macOS 26.5.2, Apple Silicon arm64 | PASS documental/local |
| Git | Disponible | 2.50.1 (Apple Git-155) | PASS |
| Gestor de paquetes | Alguno disponible, sin instalar dependencias | pnpm 11.19.0 disponible | PASS de disponibilidad; no se usó para instalar |
| Node.js / npm / TypeScript | Runtime futuro soportado | No instalados o no disponibles en `PATH` | PENDING — REQUIERE AUTORIZACIÓN POSTERIOR DE CONFIGURACIÓN |
| PostgreSQL / `psql` | Cliente/servidor futuro para ensayos aislados | No instalados o no disponibles en `PATH` | PENDING — REQUIERE AUTORIZACIÓN POSTERIOR DE CONFIGURACIÓN |
| Supabase CLI / Docker | Stack local futuro aislado | No instalados o no disponibles en `PATH` | PENDING — REQUIERE AUTORIZACIÓN POSTERIOR DE CONFIGURACIÓN |
| Vercel CLI | Verificación/despliegue futuro autorizado | No instalado o no disponible en `PATH` | No necesario para esta tarea; no se configuró |

No se solicitaron ni inspeccionaron secretos, cuentas, proyectos, dispositivos, factores o buzones.

## 3. Versiones propuestas y compatibilidad

Propuesta a fijar mediante manifest y lockfile únicamente cuando se autorice la base técnica:

| Componente | Versión propuesta | Compatibilidad acreditada documentalmente | Límite |
|---|---:|---|---|
| Node.js | 24.21.0 local; `24.x` en Vercel | Rama 24 LTS; Vercel la ofrece por defecto; Next.js exige Node >=20.9 y Supabase JS >=22 | Vercel actualiza parches dentro de 24.x; falta build real |
| Next.js App Router | 16.3.5 | Metadatos publicados: Node >=20.9; compatible con Node 24 | Falta instalación/build; no se creó app |
| TypeScript estricto | 7.0.2 | Next.js 16 declara mínimo 5.1; TypeScript 7 exige Node >=16.20 | No existe garantía publicada de cada combinación; validar con typecheck/build |
| React / React DOM | 19.3.0 | `next@16.3.5` admite React `^19.0.0`; `react-dom@19.3.0` exige React `^19.3.0` | Dependencia de soporte, no decisión de UI |
| `@supabase/supabase-js` | 2.116.0 | Exige Node >=22; compatible con Node 24 | Falta prueba contra proyecto real |
| `@supabase/ssr` | 0.12.7 | Peer `@supabase/supabase-js ^2.114.0`; 2.116.0 satisface el rango; guía oficial para Next.js/PKCE/cookies | Paquete beta y API inestable; fijar versión exacta y vigilar cambios |
| PostgreSQL | 17.11 | PostgreSQL 17 está soportado hasta 2029-11-08; Supabase publica ruta/plataforma PG17 | La versión exacta del futuro proyecto debe inspeccionarse en Dashboard |
| Postgres.js (`postgres`) | 3.4.9 | Driver Node compatible; Supabase lo documenta para conexión directa/pooler | Falta transacción y permisos reales; no se instaló |

Decisión de conexión propuesta: repositorios servidor en runtime Node.js, usando el **pooler compartido en modo transacción** para funciones serverless, SSL requerido, cliente a nivel de módulo, máximo de una conexión por instancia caliente y prepared statements desactivados. El modo transacción no conserva estado de sesión; por ello cualquier identidad técnica/contexto fiable deberá establecerse dentro de cada transacción y demostrarse posteriormente contra reutilización del pool. Migraciones, `pg_dump` y restauración usarán conexión directa en el alcance futuro autorizado, no el pool transaccional.

Esta propuesta satisface la compatibilidad publicada y evita Node 20, ya fuera de soporte y no soportado por las bibliotecas Supabase desde 2026-06-30. No acredita un build, una conexión ni un proyecto configurado.

## 4. Capacidad publicada, política propia y comprobación real

| Capacidad | Publicado por fuente oficial | Aplicación a PLAN-AUTH-001 | Estado real |
|---|---|---|---|
| Sesiones simultáneas | Por defecto un usuario puede tener sesiones ilimitadas en varios dispositivos; `session_id` identifica cada sesión | Compatible con varios dispositivos; no activar single-session | DOCUMENTAL; PENDING — REQUIERE ENSAYO REAL AUTORIZADO |
| Timeout absoluto e inactividad nativos | Disponibles en Pro; se comprueban al refrescar y pueden añadir la vigencia restante del JWT; la inactividad nativa mide refresh | No acreditan 30 días absolutos + 7 días de inactividad humana independiente por sesión | DOCUMENTAL; control propio servidor obligatorio y pendiente |
| Política 30/7 | Supabase aporta `session_id`, JWT/AAL y Auth; no publica semántica de uso humano del CRM | Guardar inicio de identificación completa, último uso humano admitido y revocación por sesión; comprobar límites antes de actualizar actividad | DISEÑO APPROVED; PENDING — REQUIERE ENSAYO REAL AUTORIZADO |
| TOTP/MFA | TOTP disponible en todos los proyectos; enrolar/desafiar/verificar y AAL2 están publicados | Compatible conceptualmente con Contraseñas de Apple y MFA obligatorio | DOCUMENTAL; PENDING — REQUIERE INTERVENCIÓN HUMANA |
| Recuperación TOTP | La API no ofrece recovery codes; admite hasta 10 factores | La copia en papel de la clave TOTP restaura el mismo factor; no es recovery code ni bypass | LIMITACIÓN DOCUMENTADA; PENDING — REQUIERE INTERVENCIÓN HUMANA |
| Recuperación de contraseña | `resetPasswordForEmail` y flujo PKCE/redirect publicados | Email previamente verificado; tras cambiar contraseña el Core sigue exigiendo TOTP | DOCUMENTAL; entrega/retorno PENDING — REQUIERE ENSAYO REAL AUTORIZADO |
| SMTP | SMTP por defecto: solo destinatarios del equipo, 2 emails/hora, best-effort y no Production; custom SMTP requerido para uso real | Staging y Production necesitan proveedor/credenciales separados y comprobar entrega | PENDING — REQUIERE CREDENCIALES / ACCESO AUTORIZADO |
| Recuperación extrema | Propietario de plataforma y eliminación administrativa de factor son capacidades publicadas; no se promete recuperar una cuenta propietaria sin sus factores | D031 requiere autoridad independiente, permisos mínimos, revocación, incidente, nuevo TOTP y nueva copia | PENDING — REQUIERE INTERVENCIÓN HUMANA y ENSAYO REAL AUTORIZADO |
| SSR | `@supabase/ssr` usa cookies/PKCE; `getClaims` valida identidad y `getUser` obtiene usuario fresco; no usar `getSession().user` para autorizar | Base documental compatible con servidor Next.js | DOCUMENTAL; paquete beta y flujo real pendientes |

Capacidad comprobada realmente en TSK-H0-001: únicamente el entorno local y la accesibilidad/metadatos actuales de las fuentes. No se ha comprobado capacidad real de Auth, pool, email, recuperación, Apple Passwords, cuenta propietaria ni plan contratado.

## 5. Recursos mínimos separados por entorno

| Entorno | Recursos previstos | Separación / limitación | Estado |
|---|---|---|---|
| Development | Mac local; Node 24; pnpm; Supabase CLI + Docker/stack local PG17; aplicación y secretos locales; fixtures exclusivamente sintéticos | Sin datos, secretos, SMTP, DNS ni recursos Production | Herramientas Node/Supabase/Docker pendientes de autorización; no creadas |
| Staging | Proyecto Supabase propio en organización Pro, Micro inicial; proyecto Vercel propio; secretos y URLs propios; SMTP de prueba/seguridad propio o sandbox autorizado | Debe permitir probar timeouts Pro, migraciones, pool, Auth, objetos y recuperación sin tocar Production | PENDING — REQUIERE CREDENCIALES / ACCESO AUTORIZADO y contratación/configuración |
| Production | Proyecto Supabase Pro propio, Micro inicial sujeto a medición; proyecto Vercel Pro propio; secretos y SMTP de seguridad propios; subdominio previsto `crm.huescaventura.com`; copias/recuperación según decisión posterior | Ningún recurso compartido por comodidad con Development/Staging; sin habilitar hasta puertas H6 | PENDING — REQUIERE ACEPTACIÓN HUMANA DE COSTE, CREDENCIALES / ACCESO AUTORIZADO y autorización de configuración |

Micro es solo punto de partida económico, no capacidad aceptada. Carga, conexiones, almacenamiento, egreso, retención, RPO/RTO y recuperación deben medirse/decidirse antes de Production. El pooler compartido transaction-mode evita necesitar el add-on IPv4 para el tráfico serverless previsto.

## 6. Coste publicado y calculado

Todos los importes son USD/mes, sin IVA/impuestos, a fecha 2026-09-15. No son factura, contrato ni coste aceptado.

| Concepto | Tipo | Importe / cálculo | Estado |
|---|---|---:|---|
| Supabase Pro | PRECIO PUBLICADO | 25 USD/mes; incluye 10 USD/mes de crédito de cómputo | PENDING — REQUIERE ACEPTACIÓN HUMANA DE COSTE |
| Dos proyectos hosted Micro (Staging + Production) | CÁLCULO | 20 USD - 10 USD crédito; total Supabase = **35 USD/mes** | Micro y consumo aún no aceptados/comprobados |
| Development local | ESTIMACIÓN | 0 USD/mes de suscripción Supabase; usa Mac existente | No incluye hardware, energía ni tiempo; herramientas no instaladas |
| Vercel Pro, un miembro | PRECIO PUBLICADO | **20 USD/mes**, con 20 USD de crédito mensual de uso; proyectos sin coste fijo adicional publicado | PENDING — REQUIERE ACEPTACIÓN HUMANA DE COSTE |
| Base prevista | CÁLCULO | **55 USD/mes** = 35 Supabase + 20 Vercel | Antes de impuestos y consumos; no aceptado |
| Alternativa con Development hosted Micro | CÁLCULO | Supabase 45 + Vercel 20 = **65 USD/mes** | No necesaria para el mínimo propuesto; no aceptada |
| PITR Production, si ARCH-PENDING-002 lo exige | PRECIO PUBLICADO / ESCENARIO | +100 USD/mes por 7 días; base pasaría a **155 USD/mes** | No incluido; decisión RPO/RTO pendiente |
| SMTP de seguridad | COSTE DESCONOCIDO | Depende de proveedor, plan, dominio y volumen | PENDING — REQUIERE CREDENCIALES / ACCESO AUTORIZADO y ACEPTACIÓN HUMANA DE COSTE |
| Excesos de cómputo, almacenamiento, egreso, funciones y logs | COSTE DEPENDIENTE DE CONSUMO | No determinable sin carga/uso real | PENDING — REQUIERE ENSAYO REAL AUTORIZADO |
| IVA/impuestos y conversión EUR/USD | COSTE DESCONOCIDO | Depende de facturación y tipo de cambio | PENDING — REQUIERE COMPROBACIÓN HUMANA |
| DNS/dominio existente | COSTE DESCONOCIDO | No se compra dominio nuevo; cuenta/DNS existentes no inspeccionados | PENDING — REQUIERE CREDENCIALES / ACCESO AUTORIZADO |

El gasto mínimo calculable previo a contratar es 55 USD/mes en el escenario descrito. No contratar/configurar hasta que Andrés acepte el importe y se comprueben cuenta, región, impuestos, SMTP y límites reales. Mantener activo el spend cap donde esté disponible y revisar cualquier desactivación como decisión humana de coste.

## 7. Fuentes oficiales consultadas

Todas consultadas el 2026-09-15:

- Node.js, ciclo y versiones LTS: https://nodejs.org/en/about/previous-releases
- Índice oficial de distribuciones Node.js, parche 24.21.0: https://nodejs.org/dist/index.json
- Next.js 16, requisitos Node.js/TypeScript: https://nextjs.org/docs/app/guides/upgrading/version-16
- Vercel, versiones Node.js soportadas: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- Vercel, precios y uso Pro: https://vercel.com/pricing
- Supabase, conexión, pool serverless y límites: https://supabase.com/docs/guides/database/connecting-to-postgres
- Supabase, sesiones: https://supabase.com/docs/guides/auth/sessions
- Supabase, MFA/TOTP: https://supabase.com/docs/guides/auth/auth-mfa y https://supabase.com/docs/guides/auth/auth-mfa/totp
- Supabase, referencia MFA y ausencia de recovery codes: https://supabase.com/docs/reference/javascript/auth-mfa
- Supabase, recuperación por contraseña: https://supabase.com/docs/guides/auth/passwords
- Supabase, SSR/Next.js: https://supabase.com/docs/guides/auth/server-side y https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- Supabase, SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Supabase, precios: https://supabase.com/pricing y https://supabase.com/docs/guides/platform/billing-faq
- Supabase, PostgreSQL 17/actualizaciones: https://supabase.com/docs/guides/platform/upgrading
- PostgreSQL, soporte de versiones: https://www.postgresql.org/support/versioning/
- Apple, Contraseñas y códigos de verificación: https://support.apple.com/es-es/120758 y https://support.apple.com/es-es/guide/passwords/mchl873a6e72/mac
- Metadatos publicados de paquetes: https://registry.npmjs.org/next/16.3.5, https://registry.npmjs.org/typescript/7.0.2, https://registry.npmjs.org/@supabase%2fsupabase-js/2.116.0, https://registry.npmjs.org/@supabase%2fssr/0.12.7, https://registry.npmjs.org/postgres/3.4.9

## 8. Resultado y pendientes localizados

Esperado: identificar capacidades con fuente/fecha/límites, proponer versiones y recursos separados, calcular el coste comprobable y no presentar documentación como configuración.

Observado: versiones y compatibilidades publicadas conciliadas; entorno local inventariado; pool serverless y límites identificados; tres entornos y coste base definidos; capacidades reales sensibles no ensayadas y gastos no aceptados.

Resultado: **PASS / TSK-H0-001 COMPLETED en su alcance de preparación**. Sus pendientes externos son compatibles con la salida de la ficha porque quedan localizados y asignados a pruebas/configuraciones posteriores. No se declara acceso real, Production, PLAN-PENDING-003 ni PLAN-AUTH-001 globalmente resueltos.

PLAN-AUTH-001 queda acreditado solo en: compatibilidad documental de versiones, arquitectura de conexión propuesta, capacidades/limitaciones publicadas, recursos mínimos por entorno y coste base calculado. Sigue **PENDING / NO EJECUTADA globalmente** en: proyecto/plan/región y versión reales, build y conexión, pool/transacciones/permisos, TOTP/Apple, sesiones 30/7, varios dispositivos, revocación, SMTP/entrega/retorno, recuperación extrema, capacidad/carga y aceptación humana del coste.

Punto de parada: TSK-H0-002 permanece NOT STARTED. No se instalaron dependencias ni se creó aplicación, SQL, migración, RLS, Auth, proyecto, dominio, despliegue, usuario o recurso Production.
