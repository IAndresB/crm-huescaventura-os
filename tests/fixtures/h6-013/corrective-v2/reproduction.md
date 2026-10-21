# Reproducción V2 en copia aislada

No ejecutar los runners que escriben desde el repositorio original. Leer primero sus fuentes. Preparar una copia nueva de la base Git y candidato V2, dependencias locales fijadas y directorios nuevos de salida. No copiar .env ni credenciales del negocio. Las migraciones se leen y contrastan con Git.

Los scripts en execution-tools registran la ejecución realizada y sus rutas; no son un instalador portable ni se deben lanzar contra las carpetas históricas. replica-plan.json documenta la copia, el entorno explícito y el sandbox usados. Pueden inspeccionarse como receta para un workspace nuevo, cambiando únicamente los destinos propios.

Node 24.21.0; PostgreSQL 17.11; postgres.js 3.4.9; lockfile de la base. HOME y TMPDIR privados, COREPACK_ENABLE_NETWORK=0, npm_config_offline=true. POSTGRES_H0_BIN apunta a los binarios locales verificados. Usar un sandbox que deniegue escrituras fuera de la copia/salidas nuevas y red exterior; permitir solo loopback y Unix sockets. NEXT_TELEMETRY_DISABLED=1 evita incluso el intento de telemetría del build (la ejecución registrada tenía la red exterior bloqueada).

Desde la copia, con rutas de salida inexistentes:

```sh
H6013_V2_DIR=/ruta/nueva/focal node --test --experimental-strip-types tests/integration/postgres-h6-013-v2-controls.test.ts
H6013_H1_DIR=/ruta/nueva/h1 node --test --experimental-strip-types tests/integration/postgres-h6-013-h1-preservation.test.ts
H6013_NEGATIVE_DIR=/ruta/nueva/security node --test --experimental-strip-types tests/integration/postgres-h6-013-negatives.test.ts
H6013_CAPTURE_DIR=/ruta/nueva/h6-013/cross node scripts/test-postgres.mjs postgres-h6-013-migration.test.ts
H6013_H1_RESOURCE=/ruta/nueva/h1/resource.json H6013_FIXTURE_OUTPUT=/ruta/nueva/fixture55.json node --experimental-strip-types scripts/check-h6-013-v2-fixture.ts
node --test --experimental-strip-types tests/*.test.ts
node node_modules/next/dist/bin/next typegen
node node_modules/typescript/bin/tsc --noEmit
node scripts/check-boundaries.mjs
node node_modules/next/dist/bin/next build
```

La prueba cross requiere el cache oficial Storage ya disponible y verificado, commit 5def1dfc15ab7f08fe271c7d1e70542424524e4e, en el TMPDIR propio; si falta, el runner intentaría prepararlo. No iniciar ese runner sin inspección y cache local o autorización independiente. Todos los recursos utilizados son propios y sintéticos.

El test focal crea un clúster Unix privado, muta solamente funciones/tabla sintéticas, verifica restauración por rollback y lo detiene en finally. Las pruebas H1/negativas/cross tienen su limpieza propia. Comprobar al terminar la ausencia de procesos y postmaster.pid activos dentro del workspace propio.

Para reproducir el FAIL V1, preparar otra copia de los dos helpers originales desde candidate-v1.tar en la custodia pre-v2 y usar el mismo test focal final, con nueva salida. Nunca restaurarlos encima del candidato original ni editar el TAR.

Readback de solo lectura: `python3 scripts/verify-h6-013-v2.py`. Requiere las custodias locales referenciadas; verificará sus identidades y los descriptores del delta. No crea ni sustituye su informe por sí mismo.
