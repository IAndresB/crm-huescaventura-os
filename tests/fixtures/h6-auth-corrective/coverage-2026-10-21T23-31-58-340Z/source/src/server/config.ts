export interface ServerConfig {
  readonly environment: "development" | "staging" | "production";
  readonly allowedOrigins: ReadonlySet<string>;
}

export type ConfigResult =
  | { readonly status: "valid"; readonly config: ServerConfig }
  | { readonly status: "invalid"; readonly code: "CONFIGURATION_INVALID" };

function parseOrigin(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.origin === value && ["http:", "https:"].includes(url.protocol)
      ? url.origin
      : undefined;
  } catch {
    return undefined;
  }
}

export function validateServerConfig(
  environment: Readonly<Record<string, string | undefined>>,
): ConfigResult {
  const runtimeEnvironment = environment.CRM_ENV;
  if (!new Set(["development", "staging", "production"]).has(runtimeEnvironment ?? "")) {
    return { status: "invalid", code: "CONFIGURATION_INVALID" };
  }

  const values = environment.CRM_ALLOWED_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean);
  const origins = values?.map(parseOrigin);
  if (!origins || origins.length === 0 || origins.some((origin) => origin === undefined)) {
    return { status: "invalid", code: "CONFIGURATION_INVALID" };
  }

  return {
    status: "valid",
    config: {
      environment: runtimeEnvironment as ServerConfig["environment"],
      allowedOrigins: new Set(origins as string[]),
    },
  };
}
