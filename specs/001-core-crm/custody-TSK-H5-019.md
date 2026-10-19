# PP-H5-019-01 — Cierre de disponibilidad de evidencia empresarial

19 de octubre de 2026. **PP-H5-019-01 — CLOSED — Disponibilidad de evidencia empresarial acreditada.** El director acepta la acreditación técnica de la custodia y autoriza este correctivo documental. El [recibo de cierre](../../tests/fixtures/h5-019-acceptance/custody-receipt.json) distingue esa decisión humana de los resultados de los instrumentos; no se atribuye firma criptográfica del director. **Nueva auditoría independiente de prepublicación: NO EJECUTADA, pendiente sobre el conjunto documental resultante. Publicación no autorizada.**

## Causa y resolución, con historia conservada

El informe independiente de prepublicación original emitió FAIL porque las auditorías esenciales no disponían de un localizador empresarial con recuperación acreditada. La integridad de las 179 rutas y sus hashes no proporcionaba sus bytes: rutas privadas del Mac no bastaban para un auditor autorizado. No era un defecto funcional del Core.

Se almacenaron seis paquetes y doce auxiliares en Google Drive empresarial; se leyeron sus metadatos por ID, se descargaron realmente a un directorio limpio, se contrastaron tamaños/SHA-256 y se autenticaron los sellos. La ejecución de custodia fue aceptada por el director. En este cierre se han vuelto a descargar y autenticar los 18 recursos y a reproducir la recuperación documental con los originales y la red bloqueados durante el replay.

El **FAIL histórico de prepublicación permanece FAIL**: paquete03, 47 archivos, sello `761d4ba3ddf36f910235e64d94f34e06dedf13fbeef7eb4f0c0d6bcdb9cac4c6`. Su hallazgo OPEN y la propuesta CLOSED del recibo de custodia describen momentos anteriores que no se reescriben. El presente documento registra el correctivo aceptado; no sustituye el dictamen de la nueva auditoría pendiente.

## Custodia verificable y cadena de confianza

Cuenta: **info@huescaventura.com**. [Carpeta empresarial H5-019](https://drive.google.com/drive/folders/1rBMvOXrHzhWqj9Kf7tI7-EPVNrOwMOTB), en Mi unidad/HUESCAVENTURA/07_TECNOLOGIA_Y_SISTEMAS/CRM_HUESCAVENTURA_OS/02_AUDITORIAS/H5-019/. ID `1rBMvOXrHzhWqj9Kf7tI7-EPVNrOwMOTB`. Propietario observado y único permiso: info@huescaventura.com; acceso restringido. No se han cambiado permisos ni contenido de Drive en este cierre. Conocer un ID o acceder a GitHub no concede acceso a Drive: el auditor debe contar con autorización y acceso empresarial efectivos. No usar enlaces públicos para solventarlo.

Referencias externas aceptadas, que deben contrastarse antes de ejecutar código descargado:

- Selección `CUSTODY-SELECTION.json`: SHA-256 `580fc61b0b82e5c9e4c7aee9703d97a878aeca09a1c844deab07e009ece4f77a`.
- Registro original `CUSTODY-REGISTRY.json`: SHA-256 `1bf655cee58edc961c65795a96b2c6dce947406cdf0723d9b77a8e9f142dbb6c`.
- Recibo externo de custodia original: SHA-256 `f0f6f78627e4a8ecc22e29d26314373423797611ee1a923bbf10d32204c0605d`.
- Sello del expediente de ejecución: SHA-256 `80319c761997e102bc89118c869ad981d3b207143d0c5f1ff813293b6efcb787`.

Los dos últimos identifican antecedentes aceptados; el recibo JSON nuevo es una derivación documental distinta y no se autentica con el hash del recibo anterior. El recibo nuevo incorpora todos los 18 IDs, tamaños, hashes, fechas, permisos observados y procedencias necesarios para repetir la recuperación sin depender de rutas privadas. Los originales externos se preservan. Los IDs localizan recursos restringidos y sus hashes autentican los bytes; ninguna de esas propiedades se deduce de la otra.

| Paquete | Archivos recuperados | Bytes | ID de Drive | SHA-256 |
|---|---:|---:|---|---|
| 01-audit-original.tar.gz | 152 | 2488791 | 1KiGcWTMH_MD8axfNiLzX9csj_IU6_vby | f403cfdeeebcfdbaa9d7bec30739c678aa86272f3b3855d3560ce5761840b2b0 |
| 02-audit-corrective.tar.gz | 416 | 2788372 | 1Ebr3matbJsXUArBhp4CnFKkWJDgVtiCa | 00de5e49cd96291079b9adc641a2a63291267989e6a0711bf2cef6c07d40a1ec |
| 03-audit-prepublication.tar.gz | 47 | 2993754 | 193ZNNnKUoOynx2X08-IGZ9pQqbBDH20Y | 47bda4edb0793b45eec490e807be6aa1947d347d3f2b98fa9998e45f9da57ab6 |
| 04-context-corrective.tar.gz | 483 | 4668388 | 1bOpXXqcgSySEXY3dVkGcGNBDYXPLo63K | f3a8587031784ffc06bfe58116694b908a9a0dcb3d51ea793a4f99d375235212 |
| 05-context-closure.tar.gz | 14 | 1318379 | 1uKQKh6-RVU2uenszcXE2ERm3wTB47Rwo | d79e2543811c8fa3bbdf5afa58afd64b8db63711d801b9a242ee86925674ea34 |
| 06-publication-inputs.tar.gz | 179 | 11414714 | 1BcETBxDpByNB5w0D2oZfTy3ZQkEi8aVK | 839ae7c68b4221ce85488d77fb70dae92921ba99dcc4b22cc24ce1e05a06985d |

El recibo relaciona los seis inventarios y los demás auxiliares, incluidos los tres instrumentos y la guía de recuperación. Son 18 archivos y 26.011.319 bytes. `07-git-base.bundle` y su inventario no están subidos. El registro original contiene siete paquetes como antecedente; la selección autenticada de seis y su adaptador delimitan lo custodiado realmente. No se presenta la séptima entrada histórica como recurso disponible en Drive.

## Recuperación repetible sin las carpetas originales

1. Desde el acceso empresarial autorizado, localizar por los IDs del recibo y descargar los 18 archivos binarios, sin conversión, a una carpeta nueva `download`, fuera de la sincronización. Mantener los nombres exactos. No aceptar un icono «sincronizado» como prueba de recuperación.
2. Antes de ejecutar los instrumentos, verificar con Python estándar la raíz externa de selección y todos sus archivos. La selección excluye únicamente su propia identidad; esta se contrasta con la referencia anterior por un canal independiente. No tomar como raíz un hash editable que llegue junto con una selección manipulada.

```sh
python3 -I - <<'PY'
from pathlib import Path
import json,hashlib
d=Path('download')
h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert h(d/'CUSTODY-SELECTION.json')=='580fc61b0b82e5c9e4c7aee9703d97a878aeca09a1c844deab07e009ece4f77a'
s=json.loads((d/'CUSTODY-SELECTION.json').read_bytes())
assert set(p.name for p in d.iterdir())==set(s['files'])|{'CUSTODY-SELECTION.json'}
for n,m in s['files'].items():
    p=d/n
    assert Path(n).name==n and p.is_file() and not p.is_symlink()
    assert p.stat().st_size==m['bytes'] and h(p)==m['sha256']
assert h(d/'CUSTODY-REGISTRY.json')=='1bf655cee58edc961c65795a96b2c6dce947406cdf0723d9b77a8e9f142dbb6c'
print('SATISFACTORIA:18 archivos e instrumentos autenticados')
PY
```

3. Obtener la base desde GitHub con acceso de lectura autorizado. Drive aporta los 1.291 archivos de evidencia y las 179 rutas anteriores; **GitHub aporta la base de 38.524 archivos**. El siguiente snapshot histórico aislado permite usar los instrumentos congelados incluso cuando main avance legítimamente. Sus refs representan la base histórica y no se presentan como refs actuales de GitHub. Solo se crean objetos/refs en estas copias temporales nuevas; no se toca el índice ni el repositorio original y no se crea un commit.

```sh
GIT_TERMINAL_PROMPT=0 git clone --no-hardlinks --branch main git@github.com:IAndresB/crm-huescaventura-os.git github-download
git -C github-download rev-parse '1e7822c11be817e4f2d4791338284aa825ad1a24^{tree}'
git init --bare --initial-branch=main historical-base.git
git -C historical-base.git fetch --no-tags ../github-download 1e7822c11be817e4f2d4791338284aa825ad1a24:refs/heads/main
git clone --no-hardlinks --branch main historical-base.git github-base
git -C github-base rev-parse HEAD main origin/main 'HEAD^{tree}'
git -C github-base fsck --full
```

Esperado: las tres refs del snapshot son `1e7822c11be817e4f2d4791338284aa825ad1a24`; árbol `bbc8b1f1219201a8425e55a5cde6ce873cdc4006`; fsck termina0. Si la base no se puede recuperar de GitHub, detener la reconstrucción completa y registrar la dependencia. No cambiar expected, subir07 ni solicitar visibilidad pública automáticamente.

4. Con Python3.9+, Git y entorno POSIX, ejecutar el adaptador autenticado:

```sh
python3 -B download/recover_six.py --input-dir download --selection-sha256 580fc61b0b82e5c9e4c7aee9703d97a878aeca09a1c844deab07e009ece4f77a --destination recovery-new --github-base github-base
```

El destino debe ser nuevo. Verificar salida0, 1.291 archivos, auditorías152/416/47 y sus sellos, 179 rutas del manifiesto histórico `3a8d7810f82428619cabbe09fe8e9844d8a8f8a0e23eada7616b3caf24fa52fe`, reconstrucción de38.696 entradas técnicas y contraste de38.646 del candidato original. El contenedor original de339MB no se regenera ni se declara descargado. Se reconstruyen sus identidades de contenido mediante las preimágenes autenticadas.

5. Conservar RECOVERY-RESULTS.json, adapter-provenance.json, documentary/documentary-results.json y stdout/stderr. Verificador y ensamblador deben terminar0, con ensamblado idéntico,25 AC SATISFACTORIA heredados y AC-073 NO EJECUTADA. Los campos históricos DriveRecoveryVerified=false/PP=OPEN del replayer original describen su ensayo anterior y se conservan; la procedencia real cloud y el cierre actual se documentan separadamente. El ensayo actual usó sandbox macOS con red y fuentes originales bloqueadas. No se afirma ejecución Linux/Windows ni equivalencia de permisos POSIX en Windows nativo.

## Resultado, límites y publicación pendiente

Custodia y recuperación documental: **SATISFACTORIA**, con nueva descarga18/18 y reproducción documental satisfactoria durante este correctivo. Las pruebas funcionales PostgreSQL2.945/2.945 y demás antecedentes conservan su procedencia anterior; no se repiten ni se atribuyen al cierre como pruebas de negocio nuevas. La matriz conserva26 AC,25 satisfactorios locales y AC-073 reservada a H6-015; las19 dependencias siguen acreditadas en su ámbito previo. Ninguna familia PT recibe PASS global.

Mi unidad depende de la continuidad administrativa de la cuenta propietaria y del acceso autorizado. No se acredita una Unidad compartida, WORM ni segunda copia independiente. La base GitHub sigue siendo una dependencia separada; Drive no contiene el historial Git. Esta recuperación de evidencias no acredita restauración del servicio de negocio, continuidad productiva, envíos o cobros reales.

H5 y H5-019 COMPLETED exclusivamente local/aislado. **DM-PENDING-005 OPEN. H6 NOT STARTED. Hosted/Production NO ACREDITADOS.** Permanecen PLAN-AUTH, ARCH-PENDING-002, políticas de datos/audio/conservación, fiscalidad, conectores y parámetros operativos en sus ámbitos originales. No se fijan políticas nuevas ni se levantan bloqueos mediante esta custodia.

El paquete06 conserva los179 inputs anteriores; no contiene estos nuevos documentos ni el manifiesto actualizado. El [manifiesto vigente](../../tests/fixtures/h5-019-acceptance/publication-manifest.json) identifica el nuevo conjunto documental. Su hash externo y árbol Git propuesto se entregan por separado para evitar autorreferencia. Los sellos técnicos originales identifican sus bytes históricos; no se reutilizan para autenticar este delta. La [aceptación técnica](acceptance-TSK-H5-019.md) y el [cierre H5](closure-TSK-H5-019.md) conservan su alcance. **Nueva prepublicación independiente pendiente. Sin git add, commit, push ni despliegue autorizados. STOP.**
