// Central hook for surfacing unexpected client errors. Wire this up to your
// telemetry (Sentry, PostHog, etc.) when you have one; for now it just logs.
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error("[bankpad] client error:", message, { ...context, stack });
}
