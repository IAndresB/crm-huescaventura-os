import ts from '/tmp/crm-h6-local-0ca8f751d141/crm-supabase-storage-5def1dfc15ab7f08fe271c7d1e70542424524e4e/node_modules/typescript/lib/typescript.js';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),hash=s=>createHash('sha256').update(s).digest('hex');
const files=readdirSync(join(root,'src/infrastructure/postgres')).filter(x=>x.endsWith('.ts')).map(x=>'src/infrastructure/postgres/'+x);
const testFiles=readdirSync(join(root,'tests/integration')).filter(x=>x.endsWith('.test.ts')).map(x=>'tests/integration/'+x);
const text=p=>readFileSync(join(root,p),'utf8');
const parsed=new Map();
function source(p){if(!parsed.has(p))parsed.set(p,ts.createSourceFile(p,text(p),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS));return parsed.get(p);}
function location(sf,node){return {file:sf.fileName,line:sf.getLineAndCharacterOfPosition(node.getStart(sf)).line+1};}
function imports(p){const sf=source(p),out=[];for(const s of sf.statements){if(ts.isImportDeclaration(s)&&ts.isStringLiteral(s.moduleSpecifier)&&s.moduleSpecifier.text.startsWith('.')){const q=resolve(root,dirname(p),s.moduleSpecifier.text).slice(root.length+1);if(q.endsWith('.ts'))out.push(q);}}return out;}
const graph=new Map();
function reaches(p,target,seen=new Set()){if(p===target)return true;if(seen.has(p))return false;seen.add(p);let deps;try{deps=graph.get(p)??imports(p);graph.set(p,deps);}catch{return false;}return deps.some(q=>reaches(q,target,seen));}
const rows=[];
for(const p of files){const sf=source(p),content=text(p);
 for(const cls of sf.statements.filter(ts.isClassDeclaration)){
  const methods=new Map(cls.members.filter(ts.isMethodDeclaration).map(m=>[m.name.getText(sf),m]));
  const functions=new Map(sf.statements.filter(ts.isFunctionDeclaration).filter(x=>x.name).map(f=>[f.name.text,f]));
  function reachable(method,seen=new Set()){
   const key=method.name?.getText(sf);if(seen.has(key))return[];seen.add(key);
   const out=[method];
   function visit(n){if(ts.isCallExpression(n)){
    let next;if(ts.isPropertyAccessExpression(n.expression)&&n.expression.expression.kind===ts.SyntaxKind.ThisKeyword)next=methods.get(n.expression.name.text);
    else if(ts.isIdentifier(n.expression))next=functions.get(n.expression.text);
    if(next)out.push(...reachable(next,seen));
   }ts.forEachChild(n,visit);}if(method.body)visit(method.body);return out;
  }
  for(const [name,m]of methods){
   if(m.modifiers?.some(x=>x.kind===ts.SyntaxKind.PrivateKeyword||x.kind===ts.SyntaxKind.ProtectedKeyword))continue;
   if(!m.parameters.some(x=>x.type?.getText(sf).includes('VerifiedAuthEvidence')))continue;
   const chain=reachable(m),guardMarkers=[];
   for(const n of chain){const body=n.getText(sf);for(const marker of ['isVerifiedAuth','isVerifiedServerInteraction','f2_lookup','this.f2(','this.issueF2(','postgresF1Binding','this.sql.begin','this.unit(','this.command(','admit','finalize']){
    if(body.includes(marker)){const at=n.getStart(sf)+body.indexOf(marker);guardMarkers.push({marker,file:p,line:sf.getLineAndCharacterOfPosition(at).line+1});}
   }}
   const sql=[];for(const n of chain){for(const match of n.getText(sf).matchAll(/crm_api\.([a-zA-Z0-9_]+)/g))if(!sql.includes(match[1]))sql.push(match[1]);}
   const historical=testFiles.filter(q=>!q.includes('h6-')&&reaches(q,p));
   const own=historical.filter(q=>q.includes(cls.name?.text.slice(0,5).toLowerCase()));
   rows.push({entrypoint:cls.name?.text+'.'+name,...location(sf,m),sourceSha256:hash(content),parameters:m.parameters.map(x=>x.getText(sf)),reachableHelpers:chain.slice(1).map(n=>({name:n.name?.getText(sf),...location(sf,n)})),guardMarkers,sqlReferences:sql,historicalTestCandidates:own.length?own:historical,reviewNote:'AST identifies declared public human-auth method and reachable same-file guards. SQL references are a conservative superset across private dispatcher branches; historical tests are import reachability candidates, not proof all methods were exercised.'});
  }
 }
}
const out={generatedAt:new Date().toISOString(),baseCommit:'971c55d5ce5770c71284d106d3c0deecca9514b5',parserVersion:ts.version,kind:'independent public human adapter AST inventory',scope:'src/infrastructure/postgres/*.ts; Auth/session management included; technical-only methods excluded',count:rows.length,rows};
writeFileSync(join(root,'tests/fixtures/h6-auth-independent-review/public-human-adapter-inventory.json'),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,classes:[...new Set(rows.map(x=>x.entrypoint.split('.')[0]))].length,unguarded:rows.filter(x=>!x.guardMarkers.some(g=>g.marker==='isVerifiedAuth')).map(x=>x.entrypoint)},null,2));
