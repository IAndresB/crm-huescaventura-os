// A server route supplies one of these fixed events. Client JSON cannot mint
// this authority; absence or an unverified copy fails closed.
const classified = new WeakSet<object>();

export type ServerEvent =
  | "core-read" | "core-action" | "token-refresh" | "polling"
  | "background-job" | "passive";
export type InteractionClass =
  | "interactive_read" | "interactive_action" | "token_refresh"
  | "polling" | "background_job" | "passive";

export interface VerifiedServerInteraction {
  readonly interactionClass: InteractionClass;
}

const classes: Record<ServerEvent,InteractionClass> = {
  "core-read":"interactive_read",
  "core-action":"interactive_action",
  "token-refresh":"token_refresh",
  polling:"polling",
  "background-job":"background_job",
  passive:"passive",
};

export function classifyServerEvent(event: ServerEvent): VerifiedServerInteraction {
  if (!Object.hasOwn(classes,event)) throw new Error("SERVER_INTERACTION_DENIED");
  const value=Object.freeze({interactionClass:classes[event]});
  classified.add(value);
  return value;
}

export function isVerifiedServerInteraction(
  value: unknown, expected: InteractionClass,
): value is VerifiedServerInteraction {
  return typeof value === "object" && value !== null
    && classified.has(value)
    && (value as VerifiedServerInteraction).interactionClass === expected;
}
