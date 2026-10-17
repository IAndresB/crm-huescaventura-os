// E-I01–I04 exercise current F. E-I05 explicitly prepares D/66 and upgrades
// through its original migration67; preserve that historical precondition.
import {isolatedDiagnosticsE as originalE} from './h5-diagnostic-e-isolated.ts';
import {isolatedDiagnosticsF} from './h5-diagnostic-f-isolated.ts';
export {read,write,migration67} from './h5-diagnostic-e-isolated.ts';
export async function isolatedDiagnosticsE(label:string,port:number,previous=false){
 return previous?originalE(label,port,true):isolatedDiagnosticsF(label,port);
}
