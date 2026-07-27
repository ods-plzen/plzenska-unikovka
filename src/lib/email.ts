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
  replyTo?: string,
): Promise<boolean> {
  if (!API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: [replyTo] } : {}),
    }),
  });
  return res.ok;
}

// Barvy = design systém webu (globals.css): blue-deep hlavička, sky akcent.
const BLUE = "#153d8a";
const BLUE_DEEP = "#0e2a63";
const SKY = "#009fe3";
const INK = "#1a2332";
const MUTED = "#5a6478";
const LINE = "#e2e6f1";
const SITE = "https://plzenskaunikovka.cz";
const HEAD_FONT =
  "'Arial Narrow','Helvetica Neue',Helvetica,Arial,sans-serif";
const BODY_FONT = "-apple-system,'Segoe UI',Roboto,Arial,sans-serif";

/**
 * Branded šablona — replika hlavičky webu (tmavě modrý pruh, U-turn logo,
 * wordmark). Inline styly a tabulkový header kvůli e-mailovým klientům;
 * wordmark je text, takže hlavička drží brand i s vypnutými obrázky.
 */
export function renderEmail(opts: {
  heading: string;
  bodyText: string;
  bodyHtml?: string; // volitelný blok pod bodyText (např. seznam uzavírek)
  ctaUrl?: string;
  ctaLabel?: string;
  unsubUrl?: string;
}): string {
  const cta = opts.ctaUrl
    ? `<p style="margin:26px 0 4px"><a href="${opts.ctaUrl}" style="background:${BLUE};color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:bold;font-size:15px;display:inline-block">${opts.ctaLabel ?? "Otevřít"} →</a></p>`
    : "";
  const unsub = opts.unsubUrl
    ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${MUTED}">Tenhle e-mail chodí, protože jste si na plzenskaunikovka.cz nastavili hlídání uzavírek. Kdykoli se <a href="${opts.unsubUrl}" style="color:${MUTED}">odhlásíte jedním klikem</a>.</p>`
    : "";
  return `<!doctype html><html lang="cs"><head>
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
</head><body style="margin:0;padding:0;background:#f2f5fb;font-family:${BODY_FONT}">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <!-- hlavička jako na webu — celý pruh je PNG, takže ho dark mode nepřebarví -->
  <a href="${SITE}" style="text-decoration:none">
    <img src="${SITE}/brand/email-header.png" width="560" alt="Plzeňská únikovka" style="width:100%;max-width:560px;height:auto;display:block;border-radius:12px 12px 0 0">
  </a>
  <div style="height:4px;background:${SKY};background:linear-gradient(90deg,${BLUE} 0%,${SKY} 100%)"></div>
  <!-- obsah -->
  <div style="background:#ffffff;border:1px solid ${LINE};border-top:0;border-radius:0 0 12px 12px;padding:28px 24px">
    <h1 style="font-family:${HEAD_FONT};font-size:23px;line-height:1.25;color:${BLUE_DEEP};margin:0 0 12px">${opts.heading}</h1>
    <p style="font-size:15px;line-height:1.6;color:${INK};margin:0">${opts.bodyText}</p>
    ${opts.bodyHtml ?? ""}
    ${cta}
  </div>
  <!-- patička -->
  <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:${MUTED}">Šťastnou cestu bez objížděk přeje<br><a href="${SITE}" style="color:${BLUE};font-weight:bold;text-decoration:none">Plzeňská únikovka</a> · živá mapa uzavírek</p>
  <p style="margin:10px 0 0;font-size:12px;color:${MUTED}">Data: SITmP a JSDI ŘSD, aktualizujeme každé ráno.</p>
  ${unsub}
</div>
</body></html>`;
}
