import { validateServerConfig } from "../../server/config.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  const result = validateServerConfig(process.env);
  if (result.status === "invalid") {
    return Response.json({ status: "denied", code: result.code }, { status: 503 });
  }
  return Response.json({ status: "ready" });
}
