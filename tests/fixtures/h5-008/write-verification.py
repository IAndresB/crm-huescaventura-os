from pathlib import Path
import re,json,gzip,hashlib,subprocess
root=Path('tests/fixtures/h5-008/definitive')
sha='5e3add4b2c82fc5b0e459b43ea0685393c495840'
gates=['frozen','typecheck','lint','unit','build','audit','historical','historical-negative','focal','postgres','health','diff']
for gate in gates:
 status=json.loads((root/(gate+'-final.status.json')).read_text());assert status['exit']==0 and status['sha']==sha,(gate,status)
for gate,count in [('focal',54),('postgres',2462),('unit',154),('health',1)]:
 log=gzip.decompress((root/(gate+'-final.log.gz')).read_bytes()).decode()
 for label,n in [('tests',count),('pass',count),('fail',0),('skipped',0),('cancelled',0)]:assert int(re.findall('ℹ '+label+r' (\d+)',log)[-1])==n,(gate,label)
# Preserve complete captured streams and JSON, without normalization.
manifest=json.loads((root/'capture-preservation.json').read_text())if(root/'capture-preservation.json').exists()else[]
for folder in ['focal-data','postgres-data','historical']:
 for p in (root/folder).glob('*.json'):
  raw=p.read_bytes();dest=p.with_suffix('.json.gz');dest.write_bytes(gzip.compress(raw));assert gzip.decompress(dest.read_bytes())==raw
  manifest.append({'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'gzip':str(dest)});p.unlink()
(root/'capture-preservation.json').write_text(json.dumps(manifest,indent=2)+'\n')
frozen=Path('specs/001-core-crm/expected-TSK-H5-007-008.md').read_bytes();assert len(frozen)==26621 and hashlib.sha256(frozen).hexdigest()=='39eb753f8a2fc57a33d827a7980640256fd16d96ec7f2b70a27bf49a6841c40d'
lines=frozen.decode().splitlines();inventory=[x for x in lines if x.startswith('| **')];sourceRows=[re.search(r'\*\*(.*?)\*\*',x).group(1)for x in inventory];assert len(sourceRows)==45
caseRows=[x for x in lines if re.match(r'\| W\d\d \|',x)];assert len(caseRows)==56
# Observations summarize passed assertions and the independently preserved native evidence.
observations={
1:('Definición y versión inmutable; ejecución y Task vinculados; reclamar no crea reserva ni resultado acreditado',['versions']),
2:('Proceso hijo reiniciado lee el intento reclamado persistido; antes de contacto se recupera una generación nueva',['process-before_contact']),
3:('A/B y B/A: dos sesiones y PIDs distintos bloqueados, un ganador y un intento por generación',['claim-race-0','claim-race-1']),
4:('Concesión anterior vence sin contacto; intento expirado conservado y generación2 utilizable',['fencing','process-before_contact']),
5:('Caída real durante contacto simulado: incertidumbre y reserva retenida; reclamar o reanudar no reenvía',['uncertain-recovery','process-during_contact']),
6:('Proceso cae después de efecto simulado durable; proceso reiniciado concilia el intento original y su replay',['process-after_effect']),
7:('Vencimiento después de contacto cambia a incierto; no hay parte segura que permita otro contacto',['uncertain-recovery']),
8:('Start/renew/result antiguo rechazados; prueba tardía de intento fallido no cambia el resultado de su sucesor',['fencing','old-generation-late-result']),
9:('Respuesta comprobada se acredita una vez en HA original; replay reconocido sin consumo adicional',['late-result','process-after_effect']),
10:('Prueba contradictoria produce conflicto y revisión, preservando el result_ref y estado succeeded previos',['late-result','old-generation-late-result']),
11:('Reserva HA exacta, TTE propietario y final check de F2 original alcanzado; rechazo inyectado revierte toda la unidad',['deferred-rollback']),
12:('Retirada de aplicabilidad de propuesta/decisión exactas bloquea start y resume, con decisión histórica approved',['withdrawal','withdrawal-start-race-0','withdrawal-start-race-1']),
13:('Versión/contenido cambiado rechazado sin reserva; revisión conserva versión anterior y las carreras reevalúan tras lock',['versions','version-start-race-0','version-start-race-1']),
14:('Destinatario cambiado rechazado: intento sigue claimed y cero reservas de su propuesta',[]),
15:('Alcance cambiado rechazado: intento sigue claimed y cero reservas de su propuesta',[]),
16:('Importe cambiado rechazado: intento sigue claimed y cero reservas de su propuesta',[]),
17:('Condiciones/efecto cambiados rechazados: cero reservas y sin contacto',[]),
18:('Evidencia caducada rechazada antes de reserva; caducidad durante espera deferred revierte20 tablas',['expired-final-check']),
19:('Una parte aprobada no se duplica; exclusividad y reservas HA originales se mantienen por parte',['partial','claim-race-0','claim-race-1']),
20:('Pausa impide reclamación/start y conserva historia; ambos órdenes con start probados',['control-pause','pause-start-race-0','pause-start-race-1']),
21:('Stop previo bloquea contacto y resume; conserva Definition, intento, Task y aprobación',['control-stop']),
22:('Pausa/revisión y stop después de contacto conservan incertidumbre; prueba original concilia una vez sin reenvío',['control-pause','control-review','stop-after-contact']),
23:('Review/resume revalidan; incertidumbre no se borra ni habilita otro intento sensible',['uncertain-recovery','withdrawal','control-review']),
24:('Primera parte consumed y segunda pendiente; siguiente claim selecciona solo part-2',['partial']),
25:('Resto incierto conserva reserva uncertain; primera consumed no se repite',['partial']),
26:('Replays de define/claim retornan recibo persistido con acceso reautorizado; sin nuevo intento',[]),
27:('Clave repetida con inputs/reason materialmente distinto da WORK_REPLAY_CONFLICT sin cambios',[]),
28:('Cuatro inyecciones claim comparan20 tablas y revierte todo; retry misma identidad pasa',['rollback-claim-b08_attempts','rollback-claim-b08_executions','rollback-claim-b07_operations','rollback-claim-b07_history']),
29:('Inyecciones de start y rechazo final original/deferred/evidencia vencida comparan rollback íntegro',['rollback-start-b08_attempts','rollback-start-b07_history','deferred-rollback','expired-final-check']),
30:('Inyecciones result revierten consumo/historia/resultado; COMMIT real con acuse retenido se recupera por identidad',['rollback-result-b08_parts','rollback-result-b07_operations','commit-response-loss']),
31:('Sesiones verificadas del único administrador V1 y dos ejecutores técnicos; actor/contexto/finalidad exactos',['security']),
32:('Contexto ajeno/finalidad ajena/actor falsificado/F1 o F2 corrupto rechazados en PostgreSQL',['security']),
33:('Actor inhabilitado y sesión revocada rechazan lectura y replay; fixtures se restauran por bootstrap',['security']),
34:('Runtime general no accede a API directa ni ejecuta facade HA; issuer/SQL/commit no expuestos',['security']),
35:('Cinco tablas con RLS+FORCE RLS; cuatro roles ordinarios sin CRUD, owners sin bypass',['security']),
36:('Versiones y B07 historia preservadas; UPDATE/DELETE ordinarios denegados',['versions','security']),
37:('Fallo declarado critical visible en CRM; WhatsApp unavailable y ningún envío',['failure-alert']),
38:('retryLimit, pauseSeconds, schedulerCapacity y resumePolicy explícitamente pendientes; sin defaults',['failure-alert','preservation']),
39:('Fracaso comprobado permite intento explícito seguro de otro ejecutor; lo desconocido retiene incertidumbre',['old-generation-late-result','fencing','uncertain-recovery']),
40:('Canal simulado unavailable bloquea antes de reserva; no se infiere entrega ni recepción',['failure-alert']),
41:('Fuente simulada durable recuerda efecto de otra línea temporal y bloquea contacto sobre estado previo',['restore-barrier']),
42:('Tres fases de caída y reinicio real conservan identidad/estado; conciliación after_effect usa archivo durable simulado',['process-before_contact','process-during_contact','process-after_effect']),
43:('Aprobación y reclamación no producen éxito; solo evidencia del resultado simulado consume',[]),
44:('Resultado invented sin prueba del intento es rechazado; estado sigue contacted y reserva no consumida',[]),
45:('Seis carreras reales: pausa, retirada HA y versión/contenido contra start en ambos órdenes; locks y reevaluación',['pause-start-race-0','pause-start-race-1','withdrawal-start-race-0','withdrawal-start-race-1','version-start-race-0','version-start-race-1']),
46:('Cuatro carreras reales recovery contra resultado tardío/ejecutor viejo, ambos órdenes, sin overwrite ni doble generación',['recovery-result-race-0','recovery-result-race-1','recovery-old-executor-race-0','recovery-old-executor-race-1']),
47:('Constraints/finalizadores fallan con rollback; pérdida simulada de acuse después de COMMIT real retorna incertidumbre y replay durable',['deferred-rollback','expired-final-check','commit-response-loss']),
48:('Fresh56 y upgrade55 poblado conservan todos los objetos/datos previos; job posterior utilizable',['vmig']),
49:('DDL con división por cero antes de COMMIT revierte catálogo íntegro; retry aplica56 y job funciona',['vmig']),
50:('CLI Supabase2.119.0 advisors exclusivamente loopback: exit0, results vacío; catálogo sin cambios anteriores',['advisors','vmig']),
51:('PostgreSQL2408+54=2462/2462; unit150+4=154/154; health1/1 separado; cero fail/skip/cancel',[]),
52:('Frozen/typecheck/lint-import boundaries/build/audit producción PASS; Next16.3.8 y lockfile intactos',[]),
53:('F10/F12 originales PASS con800 entradas; solo cambio histórico F01/F03 autorizado; negativos esperados preservados',['preservation']),
54:('Expected publicado ae7f3b0 anterior a producto, 26.621 bytes/SHA256 intactos;45 filas literales y56 casos',['preservation']),
55:('Diff-check de gates PASS; auditor preclosure pendiente; cierre documental todavía no emitido',[]),
56:('Solo sintéticos/contactos simulados; DM-PENDING-005/BR-PENDING-035 vigentes; futuras integraciones no acreditadas',['preservation','restore-barrier'])}
cases=[]
for row in caseRows:
 c=[x.strip()for x in row.split('|')];id=c[1];n=int(id[1:]);observed,files=observations[n];evidence=[str(root/'focal-final.log.gz')]+[str(root/'focal-data'/(f+'.json.gz'))for f in files]
 if n==51:evidence=[str(root/(g+'-final.log.gz'))for g in ['postgres','unit','health']]
 if n==52:evidence=[str(root/(g+'-final.status.json'))for g in ['frozen','typecheck','lint','build','audit']]
 if n==53:evidence += [str(root/'historical-final.log.gz'),'tests/fixtures/h5-008/f03-applied/result.json']
 if n==55:evidence=[str(root/'diff-final.status.json'),'scripts/verify-h5-008-evidence.mjs']
 for p in evidence:assert Path(p).exists(),p
 cases.append({'id':id,'class':c[2],'source':c[3],'expected':c[4],'observed':observed,'status':'PENDING'if n==55 else'PASS','evidence':evidence})
coverage=[]
for id in sourceRows:
 matches=[c['id']for c in cases if id in c['source'].split()]
 if id=='ARCH-DEC-012':matches=['W'+str(n).zfill(2)for n in list(range(11,20))+[24,25,34,43,44,45,47]]
 assert matches,id;coverage.append({'id':id,'cases':matches,'basis':'Frozen matrix and paragraph Trazabilidad filas a casos; original normative row unchanged'})
report={'status':'READY_FOR_FINAL_AUDIT','testedSha':sha,'base':'ff109036e3bb08a1d61e948693bc622bb10f240e','expectedPublication':'ae7f3b02745f3011bf3b324f2a5b3420f22a0a79','expectedBytes':26621,'expectedSha256':hashlib.sha256(frozen).hexdigest(),'baselinePostgres':2408,'newPostgres':54,'postgres':2462,'baselineUnit':150,'newUnit':4,'unit':154,'healthIndependent':1,'migrations':{'before':55,'after':56},'sourceRows':sourceRows,'normativeCoverage':coverage,'cases':cases,'pending':['DM-PENDING-005','BR-PENDING-035','retryLimit','pauseSeconds','schedulerCapacity','resumePolicy'],'scope':'B08 C02/C03/C05/C06 T08/T09 local/isolated synthetic only','externalExactlyOncePromised':False,'laterTasksStarted':False}
(root/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
parts=['# Matriz observada — TSK-H5-008','','Expected independiente publicado antes de producto en `ae7f3b02745f3011bf3b324f2a5b3420f22a0a79`, intacto: **45 filas literales /56 casos;26.621 bytes**. Gates12/12 PASS sobre `'+sha+'`; auditor y cierre todavía pendientes. H5-007/008 IN PROGRESS.','','| Caso | Clase | Fuente | Expected congelado | Observado / evidencia |','|---|---|---|---|---|']
for row,c in zip(caseRows,cases):
 refs='; '.join('['+Path(p).name+'](../../'+p+')'for p in c['evidence']);parts.append(row+' '+c['status']+' — '+c['observed']+'. '+refs+' |')
parts+=['','## Inventario literal de Tasks §6','','Copia literal de las45 filas congeladas. La expresión «todavía NO EJECUTADA» dentro de la columna normativa reproduce el texto de fuente previo; el observado vigente figura arriba. No altera Tasks §6 ni el expected.','','| ID y fuente literal | Implementación asignada | Comprobación asignada | Protocolo literal |','|---|---|---|---|',*inventory,'','## Trazabilidad fila → casos','','Complemento documental de la matriz y el párrafo de trazabilidad ya congelados; no cambia ningún expected.','','| Fila | Casos contrastados |','|---|---|']
parts +=['| '+c['id']+' | '+', '.join(c['cases'])+' |'for c in coverage]
parts +=['','[Verificación recuperable](../../'+str(root/'verification.json')+') y [defectos originales/correctivos](defects-TSK-H5-008.md). Health separado de PostgreSQL; contrapruebas F03 de filesystem excluidas de los contadores. La pérdida de acuse usa doble wire simulado sobre COMMIT real; las caídas/reinicios de procesos hijo son reales. STOP tras H5-007/008.','']
Path('specs/001-core-crm/matrix-TSK-H5-008.md').write_text('\n'.join(parts))
print('READY_FOR_FINAL_AUDIT: 45 source rows,56 cases, gates all matched tested SHA')
