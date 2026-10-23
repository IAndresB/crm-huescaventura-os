import type {EvidencePort,EvidenceRegistration} from '../application/contracts.ts';
import {isTrustedContext,type TrustedExecutionContext} from '../application/trusted-context.ts';
import {isVerifiedAuth,type VerifiedAuthEvidence} from '../application/verified-auth.ts';
import type {VerifiedServerInteraction} from '../application/verified-interaction.ts';
import type {B07Command,H1013EvidenceAdapter} from '../infrastructure/postgres/h1-evidence-adapter.ts';

export interface ManualEvidenceBinding {
  readonly operationId:string;
  readonly evidenceId:string;
  readonly contextKind:B07Command['contextKind'];
  readonly contextId:string;
  readonly sourceReference:string;
  readonly occurredAt:string;
  readonly purpose:string;
  readonly coverage:string;
  readonly claim:string;
  readonly reason:string;
}

// Server composition only. C04 describes registration; B07 remains responsible
// for durable authorization, replay, history and transaction finalization.
// This port records a new manual observation, never an execution result.
export function createManualB07EvidencePort(
  adapter:Pick<H1013EvidenceAdapter,'apply'>,
  auth:VerifiedAuthEvidence,
  interaction:VerifiedServerInteraction,
  boundContext:TrustedExecutionContext,
  input:ManualEvidenceBinding,
):EvidencePort {
  if(!isVerifiedAuth(auth)||!auth.sessionId||!auth.mfaVerified
    ||!isTrustedContext(boundContext)||boundContext.identityKind!=='human'
    ||boundContext.identityId!==auth.subject)throw new Error('C04_B07_IDENTITY_DENIED');
  const binding=Object.freeze({...input});
  return Object.freeze({
    async register(context:TrustedExecutionContext,evidence:EvidenceRegistration){
      if(context!==boundContext||!isTrustedContext(context))throw new Error('C04_B07_CONTEXT_DENIED');
      // This composition has no original-file preservation port. It must never
      // claim that bytes were preserved merely because a reference was stored.
      if(evidence.preservation!=='authorized-manual-record'
        ||evidence.sourceReference!==binding.sourceReference
        ||!Number.isFinite(Date.parse(evidence.receivedAt)))throw new Error('C04_B07_EVIDENCE_DENIED');
      if(evidence.verification&&(evidence.verification.reviewerIdentityId!==auth.subject
        ||!Number.isFinite(Date.parse(evidence.verification.reviewedAt))))throw new Error('C04_B07_REVIEW_DENIED');
      const claim=JSON.stringify({claim:binding.claim,registration:{
        receivedAt:evidence.receivedAt,preservation:evidence.preservation,
        ...(evidence.verification?{verification:{...evidence.verification}}:{}),
      }});
      const result=await adapter.apply(auth,interaction,{
        action:'create',operationId:binding.operationId,targetId:binding.evidenceId,
        kind:'evidence',material:{claim,coverage:binding.coverage,
          certainty:evidence.verification?'reviewed':'candidate',source_kind:'manual'},
        sourceRef:binding.sourceReference,purpose:binding.purpose,occurredAt:binding.occurredAt,
        contextKind:binding.contextKind,contextId:binding.contextId,
        coverage:binding.coverage,reason:binding.reason,
      });
      return {evidenceId:result.id};
    },
  });
}
