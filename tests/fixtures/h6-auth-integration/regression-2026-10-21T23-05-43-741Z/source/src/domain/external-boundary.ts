/** Synthetic/manual boundary contracts. External evidence never carries Core authority. */
export type BoundaryChannel = "avaibook" | "calendar" | "web" | "whatsapp" | "email" | "other";
export type BoundaryReview = "pending" | "review" | "accepted_simulated" | "applied" | "rejected" | "uncertain";

export interface IntegrationSource {
  readonly id: string;
  readonly kind: BoundaryChannel;
  readonly label: string;
  readonly provenance: string;
  readonly verifiedCapabilities: readonly string[];
  readonly enabled: boolean;
}

export interface ExternalReference {
  readonly id: string;
  readonly sourceId: string;
  readonly externalKey: string;
  readonly context: string;
  readonly coverage: string;
  readonly replacesId?: string;
  readonly authority: "reference_only" | "review_only";
  readonly recordedAt: string;
}

export interface ExternalEvent {
  readonly id: string;
  readonly sourceId: string;
  readonly referenceId?: string;
  readonly externalKey?: string;
  readonly context: string;
  readonly coverage: string;
  readonly occurredAt?: string;
  readonly receivedAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly provenance: string;
  readonly echoOfOperationId?: string;
  readonly echoRecognized?: boolean;
  readonly operationId: string;
  readonly review: BoundaryReview;
  readonly resultRef?: string;
}

export type BoundaryErrorCode = "E2" | "BOUNDARY_DENIED" | "BOUNDARY_SOURCE_UNAVAILABLE";
export class BoundaryError extends Error {
  readonly code: BoundaryErrorCode;
  constructor(code: BoundaryErrorCode) { super(code); this.code = code; }
}

export interface BoundaryAuthority {
  readonly actor: string;
  readonly purpose: string;
  readonly context: string;
  readonly coverage: string;
  readonly permission: "boundary:receive" | "boundary:review" | "boundary:send";
}

export interface SimulatedOutcome {
  readonly state: "accepted_simulated" | "uncertain" | "rejected";
  readonly resultRef: string;
  readonly effectMayHaveOccurred: boolean;
}

export interface ExternalBoundaryPort {
  registerSource(source: IntegrationSource): void;
  registerReference(reference: ExternalReference, authority: BoundaryAuthority): ExternalReference;
  receive(event: ExternalEvent, authority: BoundaryAuthority): ExternalEvent;
  recordIntent(operationId: string, sourceId: string, context: string, coverage: string,
    authority: BoundaryAuthority): void;
  recordOutcome(operationId: string, outcome: SimulatedOutcome, authority: BoundaryAuthority): void;
  reconcile(operationId: string, outcome: SimulatedOutcome, authority: BoundaryAuthority): void;
  snapshot(): Readonly<{ sources: readonly IntegrationSource[]; references: readonly ExternalReference[];
    events: readonly ExternalEvent[]; intents: readonly Record<string, unknown>[];
    outcomes: readonly Record<string, unknown>[] }>;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
function assertAuthority(authority: BoundaryAuthority, context: string, coverage: string,
  permission: BoundaryAuthority["permission"]): void {
  if (!authority.actor || authority.purpose !== "external-boundary" || authority.context !== context
    || authority.coverage !== coverage || authority.permission !== permission) throw new BoundaryError("BOUNDARY_DENIED");
}
function validateSource(source: IntegrationSource): void {
  if (!source.id || !source.kind || !source.label || !source.provenance
    || !Array.isArray(source.verifiedCapabilities)) throw new BoundaryError("BOUNDARY_DENIED");
}

/** A controlled double: each instance owns isolated state and simulates no real channel. */
export class ManualExternalBoundaryDouble implements ExternalBoundaryPort {
  private readonly sources = new Map<string, IntegrationSource>();
  private readonly references = new Map<string, ExternalReference>();
  private readonly events = new Map<string, ExternalEvent>();
  private readonly keyed = new Map<string, ExternalEvent>();
  private readonly intents = new Map<string, Record<string, unknown>>();
  private readonly outcomes = new Map<string, Record<string, unknown>>();

  registerSource(source: IntegrationSource): void {
    validateSource(source);
    if (this.sources.has(source.id)) throw new BoundaryError("BOUNDARY_DENIED");
    this.sources.set(source.id, structuredClone(source));
  }

  registerReference(reference: ExternalReference, authority: BoundaryAuthority): ExternalReference {
    assertAuthority(authority, reference.context, reference.coverage, "boundary:receive");
    const source = this.sources.get(reference.sourceId);
    if (!source || !source.enabled || !reference.id || !reference.externalKey || !reference.coverage)
      throw new BoundaryError("BOUNDARY_SOURCE_UNAVAILABLE");
    if (reference.replacesId) {
      const previous = this.references.get(reference.replacesId);
      if (!previous || previous.sourceId !== reference.sourceId || previous.context !== reference.context)
        throw new BoundaryError("BOUNDARY_DENIED");
    }
    if (this.references.has(reference.id)) throw new BoundaryError("E2");
    const saved = structuredClone(reference);
    this.references.set(saved.id, saved);
    return structuredClone(saved);
  }

  receive(event: ExternalEvent, authority: BoundaryAuthority): ExternalEvent {
    assertAuthority(authority, event.context, event.coverage, "boundary:receive");
    const source = this.sources.get(event.sourceId);
    if (!source || !source.enabled) throw new BoundaryError("BOUNDARY_SOURCE_UNAVAILABLE");
    if (!event.id || !event.operationId || !event.provenance || !event.coverage
      || !this.references.has(event.referenceId ?? "") && event.referenceId !== undefined)
      throw new BoundaryError("BOUNDARY_DENIED");
    const sameOp = this.events.get(event.operationId);
    if (sameOp) {
      const original = (value:ExternalEvent) => { const {review:_review,resultRef:_resultRef,echoRecognized:_echoRecognized,...rest}=value;return canonical(rest); };
      if (original(sameOp) === original(event)) return structuredClone(sameOp);
      throw new BoundaryError("E2");
    }
    const key = event.externalKey ? `${event.sourceId}\u001f${event.context}\u001f${event.coverage}\u001f${event.externalKey}` : undefined;
    const prior = key ? this.keyed.get(key) : undefined;
    if (prior) {
      if (canonical({ occurredAt: prior.occurredAt, payload: prior.payload })
        !== canonical({ occurredAt: event.occurredAt, payload: event.payload }))
        throw new BoundaryError("E2");
      const repeated = { ...structuredClone(event), review: prior.review, resultRef: prior.resultRef ?? prior.id };
      this.events.set(event.operationId, repeated);
      return structuredClone(repeated);
    }
    const echoIntent = event.echoOfOperationId ? this.intents.get(event.echoOfOperationId) : undefined;
    const echoRecognized = Boolean(echoIntent && echoIntent.sourceId === event.sourceId
      && echoIntent.context === event.context && echoIntent.coverage === event.coverage);
    let review: BoundaryReview = "pending";
    if (!event.externalKey) review = "review";
    else if (event.echoOfOperationId && !echoRecognized) review = "review";
    else if (source.kind === "calendar" || source.kind === "avaibook" || source.kind === "web") review = "review";
    const saved = { ...structuredClone(event), review, resultRef: event.resultRef ?? event.id,
      ...(event.echoOfOperationId ? { echoRecognized } : {}) };
    this.events.set(event.operationId, saved);
    if (key) this.keyed.set(key, saved);
    return structuredClone(saved);
  }

  recordIntent(operationId: string, sourceId: string, context: string, coverage: string,
    authority: BoundaryAuthority): void {
    assertAuthority(authority, context, coverage, "boundary:send");
    const source = this.sources.get(sourceId);
    if (!source || !source.enabled || this.intents.has(operationId)) throw new BoundaryError("BOUNDARY_DENIED");
    this.intents.set(operationId, { operationId, sourceId, context, coverage, state: "intent_pending", simulated: true });
  }

  recordOutcome(operationId: string, outcome: SimulatedOutcome, authority: BoundaryAuthority): void {
    const intent = this.intents.get(operationId);
    if (!intent) throw new BoundaryError("BOUNDARY_DENIED");
    assertAuthority(authority, String(intent.context), String(intent.coverage), "boundary:send");
    if (this.outcomes.has(operationId)) throw new BoundaryError("E2");
    this.outcomes.set(operationId, { ...structuredClone(outcome), operationId, simulated: true });
  }

  reconcile(operationId: string, outcome: SimulatedOutcome, authority: BoundaryAuthority): void {
    const prior = this.outcomes.get(operationId), intent = this.intents.get(operationId);
    if (!intent || !prior || prior.state !== "uncertain") throw new BoundaryError("BOUNDARY_DENIED");
    assertAuthority(authority, String(intent.context), String(intent.coverage), "boundary:review");
    this.outcomes.set(operationId, { ...structuredClone(outcome), operationId, simulated: true, reconciled: true });
  }

  snapshot() {
    return structuredClone({ sources: [...this.sources.values()], references: [...this.references.values()],
      events: [...this.events.values()], intents: [...this.intents.values()], outcomes: [...this.outcomes.values()] });
  }
}
