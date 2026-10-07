/** SM-BK-02–05. Operational history and current applicability are separate. */
export type BookingPreparationPhase = 'Pendiente de preparación'|'En confirmación con proveedores'|'Parcialmente confirmada'|'Confirmada operativamente';
export interface CriticalScope {readonly serviceId:string;readonly nightId:string|null;readonly contributionId:string|null;readonly necessary:boolean;readonly basis:string;readonly evidenceId:string;}
export interface BookingPreparationCommand {
 readonly action:'start'|'evaluate';readonly operationId:string;readonly bookingId:string;readonly expectedRevision:number;
 readonly expectedMaterial:string;readonly sourceRef:string;readonly reason:string;readonly at:string;readonly evidenceId:string;
 readonly origin?:'manual'|'ai';readonly criticalScopes:readonly CriticalScope[];readonly preparationEvidenceIds:readonly string[];
 readonly economicException?:{readonly reason:string;readonly scopeIds:readonly string[];readonly evidenceId:string};
}
export interface BookingPreparationView {
 readonly bookingId:string;readonly revision:number;readonly historicalPhase:BookingPreparationPhase;
 readonly phase:BookingPreparationPhase|'Cancelada'|'En curso'|'Finalizada';readonly applicable:boolean;readonly material:string;
 readonly coverage:readonly Record<string,unknown>[];readonly missing:readonly string[];
 readonly economics:readonly Record<string,unknown>[];readonly history:readonly Record<string,unknown>[];
}
