// Historical reproduction is supplementary; current formal credit belongs to H2-004 R20.
import assert from "node:assert/strict";
import {test} from "node:test";
import {mkdtemp,readFile,writeFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {isolatedProposal,read,write} from "../support/h2-proposal-isolated.ts";
import {reconstructCalculation} from "../../src/domain/exact-money.ts";
test('H2-004-F01 historical jsonb reproducer fails old comparator, current reconstructs exact historic',async()=>{
 const h=await isolatedProposal('crm_h2_004_f01',55468),tmp=await mkdtemp(join(tmpdir(),'crm-h2-f01-money-'));
 try{
  const module=join(tmp,'old-money.ts');await writeFile(module,await readFile(new URL('../fixtures/h2-004/exact-money-69a0ef1.ts.txt',import.meta.url),'utf8'));
  const old=await import(pathToFileURL(module).href),f=await h.fixtures(),cmd=f.command();await h.proposal.apply(await h.auth(),write,cmd);
  await h.proposal.apply(await h.auth(),write,{...cmd,action:'fix',content:undefined,operationId:crypto.randomUUID(),versionId:crypto.randomUUID(),expectedRevision:1});
  const v=await h.proposal.read(await h.auth(),read,cmd.proposalId,'internal') as any;
  assert.throws(()=>old.reconstructCalculation(v.economics[0].finalCalculation),/MONEY_HISTORY_MISMATCH/);
  assert.equal((reconstructCalculation(v.economics[0].finalCalculation) as any).amount,'1000.10');
  const tampered=structuredClone(v.economics[0].finalCalculation);tampered.output.amount='1000.11';assert.throws(()=>reconstructCalculation(tampered),/MONEY_HISTORY_MISMATCH/);
 }finally{await h.close();await rm(tmp,{recursive:true,force:true});}
});
