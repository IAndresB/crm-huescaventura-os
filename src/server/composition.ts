import type { ApplicationResult } from "../application/result.ts";
import type { TrustedExecutionContext } from "../application/trusted-context.ts";
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
      return invokeServerBoundary(raw, dependencies, contract);
    },
  });
}
