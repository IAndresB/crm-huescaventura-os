// Literal oracle from frozen R001-R093. No expected values derived from product output.
import assert from 'node:assert/strict';
import {calculateOwnEconomics,ownClientProjection,type OwnEconomicsView} from '../../src/domain/own-economics.ts';
import {captureCalculation,selectManualFinalPrice} from '../../src/domain/exact-money.ts';
import {syntheticOwnInput,syntheticOwnSources,fact,promotion} from './h3-own-economics-fixtures.ts';
export function normativePure(n:number):boolean{
 const i=syntheticOwnInput(),s=syntheticOwnSources(),c=i.fees[0]!,k=i.costs[0]!,run=()=>calculateOwnEconomics(i,s,'SYNTHETIC ADMIN','2026-10-04T10:00:00Z','SYNTHETIC approved decision','SYNTHETIC source');
 const reject=()=>assert.throws(run),fee=(x:string)=>assert.equal(run().totals.real.fee,x),promo=(x='150.00')=>{Object.assign(i,{promotion:promotion()});assert.equal(run().promotion!.amount,x);};
 switch(n){
 case 1:assert.deepEqual(run().totals.real,{fee:'100.00',cost:'20.00',profit:'80.00',definitive:true,unknown:[]});break;
 case 3:Object.assign(c,{serviceId:'UNKNOWN'});reject();break;
 case 5:Object.assign(c.rule,{mechanism:'unapproved'});reject();break;
 case 6:Object.assign(c.phases.real,{input:{kind:'materialize'}});reject();break;
 case 7:Object.assign(c.phases.real,{sourceRef:''});reject();break;
 case 8:Object.assign(c.rule,{version:''});reject();break;
 case 10:fee('100.00');assert.equal(run().fees[0]!.component.rule.version,'1');break;
 case 11:Object.assign(c.rule,{mechanism:'per_person'});for(const p of Object.values(c.phases))Object.assign(p,{input:{kind:'per_person',finalPersonPrice:'10.00',participations:15}});fee('150.00');break;
 case 12:Object.assign(c.rule,{mechanism:'per_booking'});fee('100.00');break;
 case 13:Object.assign(c.rule,{mechanism:'variable'});for(const p of Object.values(c.phases))Object.assign(p,{input:{kind:'percentage',base:'100.00',percent:'5'}});fee('5.00');break;
 case 15:Object.assign(k.phases.real,fact(null));assert.equal(run().totals.real.profit,null);assert.equal(run().totals.real.definitive,false);break;
 case 16:Object.assign(k.phases.real,fact('0.00'));assert.equal(run().totals.real.profit,'100.00');assert.equal(run().totals.real.definitive,true);break;
 case 17:Object.assign(k.phases,{expected:fact('100.00'),confirmed:fact('110.00'),real:fact('115.00')});assert.deepEqual(['expected','confirmed','real'].map(p=>run().costs[0]!.phases[p as 'real'].amount),['100.00','110.00','115.00']);break;
 case 18:Object.assign(c.phases,{expected:fact('200.00'),confirmed:fact('220.00'),real:fact('230.00')});assert.deepEqual(['expected','confirmed','real'].map(p=>run().fees[0]!.phases[p as 'real'].amount),['200.00','220.00','230.00']);break;
 case 19:Object.assign(c.phases.real,fact('230.00'));Object.assign(k.phases.real,fact('115.00'));assert.equal(run().totals.real.profit,'115.00');break;
 case 22:fee('100.00');assert.equal(run().fees[0]!.component.unitRevisionId,'U');assert.equal(run().fees[0]!.component.pricingFormRevisionId,'F');break;
 case 23:{const selected=selectManualFinalPrice('140.00','150.00','SYNTHETIC ADMIN','2026-10-04T10:00:00Z','SYNTHETIC manual difference',{sourceRef:'SYNTHETIC',calculationRef:'R023',reason:'approved',configurationVersions:[]});assert.equal(selected.calculated,'140.00');assert.equal(selected.final,'150.00');break;}
 case 24:assert.throws(()=>selectManualFinalPrice('140.00','150.00','SYNTHETIC ADMIN','2026-10-04T10:00:00Z','',{sourceRef:'SYNTHETIC',calculationRef:'R024',reason:'approved',configurationVersions:[]}));break;
 case 25:promo();assert.equal(run().promotion!.realAttendees,15);break;
 case 26:Object.assign(i,{promotion:promotion('B')});assert.equal(run().promotion!.amount,'120.00');break;
 case 27:case 28:case 29:{const pax=n-12;Object.assign(s.modalities[0]!.snapshot,{participants:pax-5});promo();assert.equal(run().promotion!.payers,pax-1);assert.equal(run().promotion!.realAttendees,pax);assert.equal(s.modalities[0]!.snapshot.participants,pax-5);break;}
 case 30:Object.assign(i,{promotion:promotion(null)});assert.equal(run().promotion!.status,'pending');assert.equal(run().promotion!.amount,null);break;
 case 31:case 32:case 33:case 34:case 35:case 36:Object.assign(i,{promotion:{...promotion(),audience:'other'}});assert.equal(run().promotion!.status,'ineligible');assert.equal(run().promotion!.amount,null);break;
 case 37:Object.assign(s.modalities[0]!.snapshot,{participants:9});Object.assign(i,{promotion:promotion()});assert.equal(run().promotion!.amount,null);break;
 case 38:case 39:case 40:case 41:case 42:{const prop={38:'lodgingIncluded',39:'activityIncluded',40:'restaurantIncluded',41:'tarariDrinksIncluded',42:'packComplete'}[n]!;Object.assign(i,{promotion:{...promotion(),[prop]:n===41?0:false}});assert.equal(run().promotion!.status,'ineligible');break;}
 case 43:Object.assign(i,{promotion:{...promotion(),reduceAttendees:true}});reject();break;
 case 44:promo();assert.deepEqual(s.modalities.map(m=>m.snapshot.participants),[10,5]);assert.equal(run().serviceQuantitiesPreserved,true);break;
 case 45:promo();assert.equal(s.booking.providerDebt,'500.00');assert.equal(run().providerDebtsChanged,false);break;
 case 46:Object.assign(i,{promotion:{...promotion(),averagePrice:'140.00'}});reject();break;
 case 47:Object.assign(i,{promotion:promotion(null)});assert.equal(run().promotion!.amount,null);assert.equal(run().promotion!.modalityId,null);break;
 case 48:Object.assign(c.phases.real,{input:{kind:'allocation',total:'100.00',parts:[]}});reject();break;
 case 49:Object.assign(s.versions[2]!.definition,{policy:'new_unapproved'});Object.assign(i,{promotion:promotion()});reject();break;
 case 50:case 51:case 52:{const kind=n===50?'included2':n===51?'extra25':'extra50';Object.assign(i,{tarari:[{id:'T',serviceId:'S',unitRevisionId:'U',pricingFormRevisionId:'F',kind}]});const t=run().tarari[0]!;assert.equal(t.quantity,n===50?2:n===51?25:50);assert.equal(t.commercial,n===50?'15.00':n===51?'175.00':'325.00');assert.equal(t.cost,n===50?'3.80':null);assert.equal(t.costPhases.real,null);assert.equal(run().totals.real.profit,null);assert.equal(t.provider,null);assert.equal(t.suplido,null);assert.equal(t.internalInvoice,null);break;}
 case 53:case 54:case 55:Object.assign(i,{tarari:[{id:'T',serviceId:'S',unitRevisionId:'U',pricingFormRevisionId:'F',kind:n===55?'extra25':'included2',inventedCost:'0.00'}]});reject();break;
 case 56:case 57:Object.assign(k.phases.real,fact(null));assert.equal(run().costs[0]!.phases.real.amount,null);assert.equal(run().totals.real.profit,null);assert.equal(run().totals.real.definitive,false);break;
 case 58:Object.assign(s.services[0]!,{nature:'external'});Object.assign(i,{tarari:[{id:'T',serviceId:'S',unitRevisionId:'U',pricingFormRevisionId:'F',kind:'included2'}]});reject();break;
 case 59:Object.assign(c.phases.real,{vat:'included',tax:{base:'80.00',tax:'20.00',total:'100.00',sourceRef:'SYNTHETIC separately verified tax facts; no inferred rate'}});Object.assign(k.phases.real,fact(null));assert.equal(run().fees[0]!.phases.real.fact.vat,'included');assert.equal(run().costs[0]!.phases.real.fact.vat,'unknown');assert.equal(run().totals.real.profit,null);break;
 case 60:Object.assign(c.phases.real,{vat:'excluded',tax:{base:'100.00',tax:'21.00',total:'121.00',sourceRef:'SYNTHETIC explicit tax data; no type inferred'}});assert.equal(run().fees[0]!.phases.real.fact.tax!.total,'121.00');break;
 case 68:Object.assign(c.rule,{mechanism:'per_person'});for(const p of Object.values(c.phases))Object.assign(p,{input:{kind:'per_person',finalPersonPrice:'100.01',participations:10}});fee('1000.10');break;
 case 69:Object.assign(c.phases.real,fact('-10.005'));fee('-10.01');break;
 case 70:{const r=captureCalculation({kind:'allocation',total:'100.00',parts:[{id:'A',weight:'1',order:0},{id:'B',weight:'1',order:1},{id:'C',weight:'1',order:2}]},{sourceRef:'D029',calculationRef:'R070',reason:'approved exact distribution',configurationVersions:[]});assert.deepEqual((r.output as {parts:readonly {amount:string}[]}).parts.map(x=>x.amount),['33.34','33.33','33.33']);break;}
 case 88:{const v={id:'E',bookingId:'B',scope:'S',revision:1,input:i,computed:run(),actorId:'A',at:'2026-10-04T10:00:00Z',history:[]} as OwnEconomicsView;assert.deepEqual(Object.keys(ownClientProjection(v)),['bookingId','modalities','promotion']);assert.doesNotMatch(JSON.stringify(ownClientProjection(v)),/fees|costs|profit|approvalEvidenceId|providerDebt/);break;}
 default:return false;
 }return true;
}
