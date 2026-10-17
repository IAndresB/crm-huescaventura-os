import {fourthDatabase,read,write} from './h5-018-fourth-isolated.ts';
export {read,write};
// Exact protected test assertions; only ports/labels and migration fixture differ.
// Offset avoids shared-loopback collisions with the simultaneous complete rerun.
export function originalDatabase(label:string,port:number,previous=false){void label;return fourthDatabase('fourthorig'+port,port+100,previous);}
export {originalDatabase as thirdDatabase,originalDatabase as auditDatabase,originalDatabase as isolatedCorrectedDiagnostics,originalDatabase as isolatedDiagnosticsE};
