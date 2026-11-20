declare global {
  interface Window {
    whop?: {
      track?: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export function trackWhopEvent(
  eventName: "service_viewed" | "deposit_started" | "estimate_requested",
  properties: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;
  const payload = { ...properties, timestamp: new Date().toISOString() };
  if (window.whop && typeof window.whop.track === "function") {
    window.whop.track(eventName, payload);
  }
  console.log(`[whop.track] ${eventName}`, payload);
}
