import { NextResponse } from "next/server";
import { sendEmail, emailEnabled } from "@/lib/email";

/**
 * Podnět občana k uzavírce → oficiální elektronická podatelna města
 * (posta@plzen.eu, ověřeno z plzen.eu), k rukám náměstka pro dopravu.
 *
 * Zásady:
 *  - Odesílá se NA VÝSLOVNOU ŽÁDOST návštěvníka (submit formuláře) a jeho
 *    jménem — Reply-To je jeho adresa, město odpovídá přímo jemu.
 *  - Jméno a e-mail se nikam neukládají, projdou jen odesláním.
 *  - Do Supabase jde jen anonymní záznam pro počítadlo (bez osobních údajů).
 *  - Honeypot pole `web` tiše zahazuje boty.
 */

const TO = process.env.PODNET_TO ?? "posta@plzen.eu";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function logCount(closureId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url}/rest/v1/rpc/send_feedback`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        p_message: "[podnet-mestu] odeslán přes formulář",
        p_closure_id: closureId || null,
        p_page_url: `/doprava/${closureId}`,
      }),
    });
  } catch {
    // počítadlo je bonus — odeslání podnětu na něm nesmí záviset
  }
}

export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const name = String(data.name ?? "").trim();
  const email = String(data.email ?? "").trim();
  const message = String(data.message ?? "").trim();
  const closureId = String(data.closureId ?? "").trim().slice(0, 80);
  const closureName = String(data.closureName ?? "").trim().slice(0, 140);
  const termin = String(data.termin ?? "").trim().slice(0, 120);
  const honeypot = String(data.web ?? "");

  // bot → tiché "ok", ať se nenaučí, co prošlo
  if (honeypot.length > 0) return NextResponse.json({ ok: true });

  if (name.length < 2 || name.length > 100)
    return NextResponse.json({ ok: false, error: "name" }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 200)
    return NextResponse.json({ ok: false, error: "email" }, { status: 400 });
  if (message.length < 20 || message.length > 3000)
    return NextResponse.json({ ok: false, error: "message" }, { status: 400 });
  if (!closureName)
    return NextResponse.json({ ok: false, error: "closure" }, { status: 400 });

  if (!emailEnabled())
    return NextResponse.json({ ok: false, error: "email_off" }, { status: 503 });

  const subject = `Podnět občana: uzavírka „${closureName}" (k rukám náměstka pro dopravu)`;
  const bodyCity = `
<p><b>Věc:</b> podnět k uzavírce „${esc(closureName)}"${termin ? ` (${esc(termin)})` : ""}</p>
<p>K rukám náměstka primátora pro oblast dopravy a životního prostředí.</p>
<hr>
<p style="white-space:pre-wrap">${esc(message)}</p>
<hr>
<p>${esc(name)}<br>${esc(email)}</p>
<p style="color:#777;font-size:12px">Tento e-mail byl odeslán prostřednictvím formuláře na plzenskaunikovka.cz
na výslovnou žádost odesílatele. Odpovědi prosím směřujte přímo na adresu odesílatele
(${esc(email)}, nastavena v Reply-To).</p>`;

  const sent = await sendEmail(TO, subject, bodyCity, email);
  if (!sent)
    return NextResponse.json({ ok: false, error: "send" }, { status: 502 });

  // kopie odesílateli — potvrzení + text podnětu
  await sendEmail(
    email,
    `Kopie: váš podnět k uzavírce „${closureName}" odešel na podatelnu města`,
    `
<p>Dobrý den,</p>
<p>váš podnět odešel na oficiální elektronickou podatelnu města Plzně
(posta@plzen.eu), k rukám náměstka pro dopravu. Podatelna má povinnost
podání zaevidovat a předat. Odpověď města přijde přímo vám.</p>
<hr>
<p style="white-space:pre-wrap">${esc(message)}</p>
<hr>
<p style="color:#777;font-size:12px">Vaše údaje jsme použili jen k tomuto
odeslání, neukládáme je. — plzenskaunikovka.cz</p>`,
  );

  await logCount(closureId);
  return NextResponse.json({ ok: true });
}
