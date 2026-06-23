import { createHash } from "crypto";

/** Server-side helper: hash IP klienta. Vrací 16-char SHA-256 prefix.
 *  Nikdy nelogujeme raw IP — GDPR compliance + brand „neuživujeme uživatele".
 */
export function hashIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(ip + (process.env.IP_HASH_SALT ?? "plzenska-unikovka"))
    .digest("hex")
    .slice(0, 16);
}

export function userAgent(headers: Headers): string | null {
  const ua = headers.get("user-agent");
  return ua ? ua.slice(0, 300) : null;
}
