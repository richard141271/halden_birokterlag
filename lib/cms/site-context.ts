import { env } from "@/lib/config/env";
import { siteRegistry } from "@/lib/config/sites";

export function getCurrentSiteKey() {
  return env.siteKey;
}

export function getCurrentSite() {
  const siteKey = getCurrentSiteKey() as keyof typeof siteRegistry;
  return siteRegistry[siteKey] ?? siteRegistry.default;
}
