import type { ApplicationResult } from "../application/result.ts";
import type { TrustedExecutionContext } from "../application/trusted-context.ts";
import { semanticIssue } from "../domain/semantic-error.ts";
import {
  invokeServerBoundary,
  type BoundaryDependencies,
} from "./boundary.ts";

export function composeServer(dependencies: BoundaryDependencies) {
  return Object.freeze({
    invoke<T>(
      raw: unknown,
      contract: (
        context: TrustedExecutionContext,
        payload: unknown,
      ) => Promise<ApplicationResult<T>>,
    ): Promise<ApplicationResult<T>> {
      // Once a business contract starts, an exception alone cannot establish
      // whether its effect happened. Preserve E4 before the technical boundary
      // can classify the exception as a known failure. No retry is performed.
      return invokeServerBoundary(raw, dependencies, async (context, payload) => {
        try {
          return await contract(context, payload);
        } catch {
          return { status: "pending", issues: [semanticIssue("E4", "operation")] };
        }
      });
    },
  });
}
