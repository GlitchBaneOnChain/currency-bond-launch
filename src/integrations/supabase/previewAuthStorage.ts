// Storage adapter used by the browser-side Supabase auth client.
// Kept as its own module so we can swap in a different backend (IndexedDB,
// cookie broker, etc.) without touching the client itself.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
