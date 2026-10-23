// Trusted composition port. No caller-supplied success flag is evidence.
export interface WorkResultRequest {
 readonly executionId:string;readonly attemptId:string;readonly outcome:'succeeded'|'failed';readonly resultRef:string;
}
export interface WorkResultObservation extends WorkResultRequest {
 readonly verifierIdentity:string;readonly sourceKind:'simulated';
}
export interface WorkEffectRequest {
 readonly executionId:string;readonly proposalId:string;readonly partId:string;readonly materialFingerprint:string;
}
export interface WorkEffectObservation extends WorkEffectRequest {
 readonly availability:'available'|'unavailable';readonly priorEffect:'none'|'succeeded'|'uncertain';
 readonly sourceKind:'simulated';readonly verifierIdentity:string;readonly observationRef:string;
}
export interface WorkResultVerifier {
 checkEffect?(request:Readonly<WorkEffectRequest>):Promise<WorkEffectObservation|undefined>;
 inspect(request:Readonly<WorkResultRequest>):Promise<WorkResultObservation|undefined>;
}
export async function verifyWorkResult(provider:WorkResultVerifier|undefined,request:WorkResultRequest):Promise<WorkResultObservation>{
 const seen=await provider?.inspect(Object.freeze({...request}));
 if(!seen||seen.executionId!==request.executionId||seen.attemptId!==request.attemptId||seen.outcome!==request.outcome||
  seen.resultRef!==request.resultRef||seen.sourceKind!=='simulated'||!/^[a-z][a-z0-9-]{0,127}$/u.test(seen.verifierIdentity))throw new Error('WORK_RESULT_EVIDENCE_REQUIRED');
 return Object.freeze({...seen});
}

export async function verifyWorkEffect(provider:WorkResultVerifier|undefined,request:WorkEffectRequest):Promise<void>{
 const observation=await provider?.checkEffect?.(Object.freeze({...request}));
 if(!observation||observation.executionId!==request.executionId||observation.proposalId!==request.proposalId||observation.partId!==request.partId||observation.materialFingerprint!==request.materialFingerprint||observation.sourceKind!=='simulated'||!observation.observationRef||!/^[a-z][a-z0-9-]{0,127}$/u.test(observation.verifierIdentity))throw new Error('WORK_EFFECT_CHECK_REQUIRED');
 if(observation.availability!=='available')throw new Error('WORK_CHANNEL_UNAVAILABLE');
 if(observation.priorEffect!=='none')throw new Error('WORK_PRIOR_EFFECT_REVIEW_REQUIRED');
}
