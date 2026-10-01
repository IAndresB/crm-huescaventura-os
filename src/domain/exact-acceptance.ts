/** T02 decisions consume verified facts supplied by the owning application boundary. */
export interface AcceptanceAssessment {
 readonly identified:boolean;readonly selectable:boolean;readonly evidence:boolean;
 readonly attributable:boolean;readonly actValidity:boolean;readonly materialVerified:boolean;
 readonly requestedWon:boolean;readonly active:boolean;readonly rectified:boolean;
}
export function decideAcceptance(a:AcceptanceAssessment):{allowed:boolean;registered:boolean;won:boolean;ids:readonly string[];blockers:readonly string[]}{
 const blockers:string[]=[];
 if(!a.identified) blockers.push('identity-version-terms-scope-required');
 if(!a.selectable) blockers.push('new-version-required');
 if(!a.evidence) blockers.push('unequivocal-evidence-required');
 if(!a.attributable) blockers.push('client-authority-required');
 if(!a.actValidity) blockers.push('act-validity-required');
 if(!a.materialVerified) blockers.push('material-review-required');
 if(a.rectified) blockers.push('rectification-review-required');
 if(a.requestedWon&&!a.active) blockers.push('active-commercial-origin-required');
 return {allowed:blockers.length===0,registered:a.identified&&a.selectable,won:blockers.length===0&&a.requestedWon,ids:['SM-AC-01','SM-AC-02','SM-PV-07',...(a.requestedWon?['SM-OP-07']:[])],blockers};
}
