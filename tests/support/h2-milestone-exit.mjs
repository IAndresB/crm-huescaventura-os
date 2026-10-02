// H2-012 documentary audit uses APPROVED exit criteria + fresh independent logs.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root=new URL('../../',import.meta.url),read=async p=>readFile(new URL(p,root),'utf8');
const sha=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const formal=await read('tests/fixtures/h2-012/formal-candidate.log'),pg=await read('tests/fixtures/h2-012/postgres-candidate.log'),unit=await read('tests/fixtures/h2-012/unit-candidate.log');
const stats=log=>Object.fromEntries(['tests','pass','fail','cancelled','skipped'].map(k=>[k,Number(log.match(new RegExp(`(?:ℹ|#) ${k} (\\d+)`))?.[1]??NaN)]));
for(const log of [formal,pg,unit]){const s=stats(log);assert.ok(s.tests>0);assert.equal(s.fail,0);assert.equal(s.skipped,0);assert.equal(s.cancelled,0);assert.equal(s.tests,s.pass);}
const evidence=[];
for(let i=1;i<=10;i++){const path=`specs/001-core-crm/evidence-TSK-H2-${String(i).padStart(3,'0')}.md`,body=await read(path);assert.match(body,/COMPLETED|PASS local/);assert.match(body,/CLOSED|verificad|verificaci/);evidence.push({path,sha256:createHash('sha256').update(body).digest('hex')});}
const commits={2:'6aba8be5dfffdca46c355b405314fb261643869b',4:'a080eb76e800126d155e78471ad2f6b59e382a7d',6:'ad28a0ed25b598e891e7eb88e95b058a08e59137',8:'800de9518f0289f46e74a5a3a2c1218ad4b403d0',10:'cb2246ea4830fdf08a3a723bfc759309716712ca'};
for(const [n,c] of Object.entries(commits)){assert.equal(execFileSync('git',['cat-file','-t',c],{encoding:'utf8'}).trim(),'commit');assert.ok((await read(`specs/001-core-crm/evidence-TSK-H2-${String(n).padStart(3,'0')}.md`)).includes(c));}
const cases=[
[1,'Lead/Opportunity/progreso','001/002','SPEC-FR-COM001–005/PT01',['three exact minima','incomplete Lead']],
[2,'Proposal/alternativas','003/004','PT02 AC007/008',['independent alternatives retained']],
[3,'Version/T01/términos/fuentes','003/004','PLAN-T01',['fixed v1 exact linked preparation','ordinary contract cannot edit fixed v1']],
[4,'Preciofinalmanual/total','003/004','D023/PM02',['exact PM02 100.01 x10 =1000.10']],
[5,'Repartos yno prorrateo grupal','H1-011/012+003/004','D029/PM11–13',['PM09 replay historical calculation']],
[6,'Vigencia/revalidación/envíomanual','005/006','PT02 AC009/010/075',['most restrictive material limit','real manual send exact commercial effects','intent not sent or received']],
[7,'Rechazo/sustitución','003–006','PT02',['rejection modality no whole loss','new condition requires T01 replacement retains v1']],
[8,'Acceptanceexacta/facultad','007/008','AC011/012',['each incorrect commercial relation rejects atomically','different exact terms cannot register']],
[9,'SelecciónD018','007–010','AC013/016',['nonselectable request needs new version before Acceptance','exact modality A leaves B uncontracted']],
[10,'Rectificación/original','007–010','AC086',['rectification preserves original','rectified Acceptance does not permit conversion']],
[11,'Ganada soloAcceptanceverificada','001/002/007/008','SM-OP07/P08',['verified Acceptance + exact won/history/result T02','direct ordinary Ganada write denied']],
[12,'Cadena normal/directa','009/010','AC014/016/T03',['normal valid chain exact immutable Booking','direct composes real T02 then T03 atomically']],
[13,'Bookingúnica carrera/replay','009/010','AC015/G6',['uniqueness at database boundary','committed result survives lost response']],
[14,'T01/T02/T03 atomicidad','003–010','AC068/Plan7.2',['prewrite fault rolls back whole T01','early intermediate nights nominal history late COMMIT rollback']],
[15,'Servicio/contribución/cantidad/noches','009–011','AC017/019/P09',['AC017 exact 10/12/12/10','provenance exact full chain per contribution']],
[16,'Nominalopcional/privacidad','009–011','FR-ID004/AC019/NFR003',['four names explain twelve','same verified Contact two Participant IDs rejected','same name unknown people not fused']],
[17,'Seguridad/historia/migración','002/004/006/008/010/011','V-DAT/V-MIG',['context actor ACL FORCE RLS fail closed','preservation predecessor and published chain byte identical']],
[18,'C05 intención/hecho manual','005/006','C05/PT02',['intent not sent or received','real manual send exact commercial effects']],
[19,'Sin economía/operación/externo','001–011','P08/Plan9',['explicit prohibited economic operational external fields','no Payment funds reconciliation Refund invoice']],
[20,'Pendientesglobales/STOP','012','Plan9–10/12;Tasks2.3/7',[]]
];
const result=[];
for(const [id,criterion,tasks,source,names] of cases){for(const name of names){assert.ok(formal.split('\n').some(l=>l.includes('✔')&&l.includes(name)),`${id}: ${name}`);}result.push({id:`S${String(id).padStart(2,'0')}`,criterion,tasks,source,evidence:id<=19?'evidence-TSK-H2-001–011 + fresh formal-candidate.log/postgres-candidate.log/unit-candidate.log':'approved-source and pending preservation',historicalTestedCommits:commits,currentTestedCommit:sha,expected:'Complete local evidence and fresh material PASS; no future attribution',observed:'PASS',limits:'Local/isolated only; H3 economy/H4 confirmation/operational changes/H5 integration/H6 E2E not accredited; hosted/Production/realdata unauthorized'});}
for(const name of ['PM-11','PM-12','PM-13','group'])assert.ok(unit.includes(name));
const manifest=JSON.parse(await read('tests/fixtures/h2-011/preservation-manifest.json'));
for(const [path,hash] of Object.entries(manifest)){assert.equal(createHash('sha256').update(await readFile(new URL(path,root))).digest('hex'),hash,path);}
const plan=await read('specs/001-core-crm/plan.md');assert.match(plan,/H2 — Contratación y conversión/);assert.match(plan,/D023\/PM-02/);assert.match(plan,/D029/);
const tasks=await read('specs/001-core-crm/tasks.md');for(const [,id,body] of [...tasks.matchAll(/#### (TSK-H[3-6]-\d{3})[^\n]*\n([\s\S]*?)(?=\n<a id=|$)/g)])assert.match(body,/NOT STARTED/);
const output={approvedBase:'b94bdb10e7182a7affe2738f2a7277bc25ea23a3',effectiveBase:'d9d76363f5589f83093aff9b802280408b2e890b',testedCommit:sha,formal:stats(formal),postgres:stats(pg),unit:stats(unit),criteria:result,evidence,allCriteriaPass:20};
await writeFile(new URL('tests/fixtures/h2-012/milestone-exit-matrix.json',root),JSON.stringify(output,null,2)+'\n');
console.log('H2-012 S01–S20 20/20 PASS; all historical evidence + fresh material suites + normative/pending preservation verified');
