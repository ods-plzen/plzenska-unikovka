// Odesílání e-mailů přes Resend REST API (bez SDK — jeden fetch).
// Bez RESEND_API_KEY se e-maily neodešlou (routes vrací 503 / cron přeskočí).
//
// ⚠️ Kanál výhradně dopravní — viz docs/UX-BENCHMARK-A-PLAYBOOK-2026-07-06.md.

const API_KEY = process.env.RESEND_API_KEY ?? "";
const FROM =
  process.env.EMAIL_FROM ??
  "Plzeňská únikovka <upozorneni@plzenskaunikovka.cz>";

export function emailEnabled(): boolean {
  return API_KEY.length > 0;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  if (!API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: [to], subject, html }),
  });
  return res.ok;
}

const BLUE = "#153d8a";
const SITE = "https://plzenskaunikovka.cz";

/** Jednoduchá branded šablona — inline styly (e-mailoví klienti). */
export function renderEmail(opts: {
  heading: string;
  bodyText: string;
  bodyHtml?: string; // volitelný blok pod bodyText (např. seznam uzavírek)
  ctaUrl?: string;
  ctaLabel?: string;
  unsubUrl?: string;
}): string {
  const cta = opts.ctaUrl
    ? `<p style="margin:24px 0"><a href="${opts.ctaUrl}" style="background:${BLUE};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block">${opts.ctaLabel ?? "Otevřít"}</a></p>`
    : "";
  const unsub = opts.unsubUrl
    ? `<p style="margin-top:32px;font-size:12px;color:#8b968f">Tato upozornění chodí, protože jste si na plzenskaunikovka.cz nastavili hlídání uzavírek. <a href="${opts.unsubUrl}" style="color:#8b968f">Odhlásit odběr</a> jedním klikem.</p>`
    : "";
  return `<!doctype html><html lang="cs"><body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <p style="font-size:13px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:${BLUE};margin:0 0 16px">Plzeňská únikovka</p>
  <div style="background:#ffffff;border-radius:10px;padding:24px;border:1px solid #e3e7f0">
    <h1 style="font-size:20px;color:#0b1320;margin:0 0 12px">${opts.heading}</h1>
    <p style="font-size:15px;line-height:1.55;color:#33423d;margin:0">${opts.bodyText}</p>
    ${opts.bodyHtml ?? ""}
    ${cta}
  </div>
  <p style="font-size:12px;color:#8b968f;margin-top:16px">Data: SITmP / JSDI ŘSD · aktualizace denně · <a href="${SITE}" style="color:#8b968f">${SITE.replace("https://", "")}</a></p>
  ${unsub}
</div>
</body></html>`;
}
