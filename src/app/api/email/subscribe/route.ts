import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { emailEnabled, sendEmail, renderEmail } from "@/lib/email";

export const runtime = "nodejs";

const SITE = "https://plzenskaunikovka.cz";
// Záměrně benevolentní validace — o doručitelnosti stejně rozhodne double opt-in.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface Body {
  email?: string;
  watched?: string[];
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "email" }, { status: 422 });
  }
  const watched = Array.isArray(body.watched)
    ? body.watched
        .filter((w) => typeof w === "string" && w.length > 0 && w.length <= 80)
        .slice(0, 100)
    : [];
  if (watched.length === 0) {
    return NextResponse.json({ error: "watched" }, { status: 422 });
  }

  const supabase = getSupabase();
  if (!supabase || !emailEnabled()) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase.rpc("email_subscribe", {
    p_email: email,
    p_watched: watched,
    p_token: token,
  });
  if (error) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }

  const row = data as { confirmed?: boolean; token?: string } | null;
  // Nepotvrzený odběr → potvrzovací e-mail (double opt-in). Potvrzenému se
  // jen tiše rozšířil seznam hlídaných ulic.
  if (!row?.confirmed && row?.token) {
    const confirmUrl = `${SITE}/api/email/confirm?token=${row.token}`;
    await sendEmail(
      email,
      "Potvrďte hlídání uzavírek — Plzeňská únikovka",
      renderEmail({
        heading: "Ještě jedno kliknutí",
        bodyText:
          "Nastavili jste si e-mailová upozornění na plzenskaunikovka.cz: každá nová uzavírka v Plzni + připomínka den před startem uzavírky na hlídané ulici. Kliknutím potvrdíte, že je to váš e-mail — bez potvrzení nic posílat nebudeme.",
        ctaUrl: confirmUrl,
        ctaLabel: "Potvrdit hlídání",
      }),
    );
  }

  // Vždy {ok} — API neprozrazuje, jestli e-mail už existoval.
  return NextResponse.json({ ok: true });
}
