import { NextResponse } from "next/server";
import webpush from "web-push";
import { closures } from "@/lib/data";
import { getSupabase } from "@/lib/supabase";
import { emailEnabled, sendEmail, renderEmail } from "@/lib/email";

export const runtime = "nodejs";
// Cron běží nad čerstvým buildem (data commit z GH Actions = nový deploy).
export const dynamic = "force-dynamic";

/*
 * Denní notifikační cron (viz vercel.json).
 *
 * Data přes security-definer RPC (push_cron_*) — secret se ověřuje v DB
 * proti push_config, takže anon klíč stačí a service_role není potřeba.
 *
 * Události:
 *  1. "start" — hlídaná uzavírka začíná zítra (od = zítřek) → připomínka.
 *  2. "new"   — nová uzavírka na ulici, kterou uživatel hlídá (match přes
 *               name jiné hlídané uzavírky) → upozornění.
 *
 * ⚠️ PRÁVNÍ MANTINEL: obsah notifikací je VÝHRADNĚ dopravní. Žádná politická
 * sdělení, žádné výzvy k volbám — TTPA čl. 18 vyžaduje pro politickou reklamu
 * oddělený souhlas, který dopravní opt-in nedává. Neměnit bez právní konzultace.
 * Detail: docs/UX-BENCHMARK-A-PLAYBOOK-2026-07-06.md, sekce D.
 */

interface SubRow {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  watched: string[];
}

interface Notice {
  eventKey: string;
  closureId: string;
  streetName: string;
  title: string;
  body: string;
  url: string;
}

function pragueToday(): Date {
  const now = new Date();
  const praha = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Prague" }),
  );
  praha.setHours(0, 0, 0, 0);
  return praha;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
  if (!supabase || !publicKey || !privateKey) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  webpush.setVapidDetails(
    "mailto:kontakt@plzenskaunikovka.cz",
    publicKey,
    privateKey,
  );

  // ── Stav z DB (RPC se secretem) ─────────────────────────────────────────
  const [subsRes, eventsRes, emailRes] = await Promise.all([
    supabase.rpc("push_cron_subs", { p_secret: secret }),
    supabase.rpc("push_cron_events", { p_secret: secret }),
    supabase.rpc("email_cron_subs", { p_secret: secret }),
  ]);
  if (subsRes.error || eventsRes.error) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  const subs = (subsRes.data ?? []) as SubRow[];
  const knownEvents = new Set((eventsRes.data ?? []) as string[]);
  const emailSubs = (emailRes.data ?? []) as {
    email: string;
    watched: string[];
    token: string;
  }[];

  const today = pragueToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

  const nameById = new Map(closures.map((c) => [c.id, c.name]));
  function watchedStreets(sub: SubRow): Set<string> {
    const names = new Set<string>();
    for (const id of sub.watched) {
      const n = nameById.get(id);
      if (n) names.add(n);
    }
    return names;
  }

  // ── Kandidátské události ────────────────────────────────────────────────
  const candidates: Notice[] = [];
  for (const c of closures) {
    if (c.od === tomorrowIso && c.status !== "done") {
      candidates.push({
        eventKey: `start:${c.id}:${c.od}`,
        closureId: c.id,
        streetName: c.name,
        title: `Zítra začíná uzavírka: ${c.name}`,
        body: `${c.akce}. ${c.termin}`,
        url: `/doprava/${c.id}`,
      });
    }
  }
  const newClosures = closures.filter((c) => !knownEvents.has(`seen:${c.id}`));
  for (const c of newClosures) {
    const anyWatcher = subs.some(
      (s) => !s.watched.includes(c.id) && watchedStreets(s).has(c.name),
    );
    if (anyWatcher) {
      candidates.push({
        eventKey: `new:${c.id}`,
        closureId: c.id,
        streetName: c.name,
        title: `Nová uzavírka na sledované ulici: ${c.name}`,
        body: `${c.akce}. ${c.termin}`,
        url: `/doprava/${c.id}`,
      });
    }
  }

  const toSend = candidates.filter((n) => !knownEvents.has(n.eventKey));

  // ── Odeslání ────────────────────────────────────────────────────────────
  let delivered = 0;
  const dead: string[] = [];
  for (const notice of toSend) {
    const audience = subs.filter(
      (s) =>
        s.watched.includes(notice.closureId) ||
        watchedStreets(s).has(notice.streetName),
    );
    for (const sub of audience) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify({
            title: notice.title,
            body: notice.body,
            url: notice.url,
          }),
        );
        delivered++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) dead.push(sub.endpoint);
      }
    }
  }

  // ── E-mailový kanál (stejné události, stejný matching) ──────────────────
  let deliveredEmail = 0;
  if (emailEnabled() && emailSubs.length) {
    function emailWatchedStreets(watched: string[]): Set<string> {
      const names = new Set<string>();
      for (const id of watched) {
        const n = nameById.get(id);
        if (n) names.add(n);
      }
      return names;
    }
    for (const notice of toSend) {
      const audience = emailSubs.filter(
        (s) =>
          s.watched.includes(notice.closureId) ||
          emailWatchedStreets(s.watched).has(notice.streetName),
      );
      for (const sub of audience) {
        const ok = await sendEmail(
          sub.email,
          notice.title,
          renderEmail({
            heading: notice.title,
            bodyText: notice.body,
            ctaUrl: `https://plzenskaunikovka.cz${notice.url}`,
            ctaLabel: "Detail uzavírky a objížďky",
            unsubUrl: `https://plzenskaunikovka.cz/api/email/unsubscribe?token=${sub.token}`,
          }),
        );
        if (ok) deliveredEmail++;
      }
    }
  }

  // ── Zápis stavu + úklid mrtvých odběrů (jedno RPC) ──────────────────────
  const newEventKeys = [
    ...toSend.map((n) => n.eventKey),
    ...newClosures.map((c) => `seen:${c.id}`),
  ];
  if (newEventKeys.length || dead.length) {
    await supabase.rpc("push_cron_commit", {
      p_secret: secret,
      p_event_keys: newEventKeys,
      p_dead_endpoints: dead,
    });
  }

  return NextResponse.json({
    ok: true,
    events: toSend.length,
    delivered,
    deliveredEmail,
    prunedSubscriptions: dead.length,
    newClosuresMarked: newClosures.length,
  });
}
