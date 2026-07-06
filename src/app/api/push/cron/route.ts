import { NextResponse } from "next/server";
import webpush from "web-push";
import { closures } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
// Cron běží nad čerstvým buildem (data commit z GH Actions = nový deploy).
export const dynamic = "force-dynamic";

/*
 * Denní notifikační cron (viz vercel.json).
 *
 * Události:
 *  1. "start"  — hlídaná uzavírka začíná zítra (od = zítřek) → připomínka.
 *  2. "seen"   — nová uzavírka na ulici, kterou uživatel hlídá (match přes
 *                name jiné hlídané uzavírky) → upozornění.
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
  // Cron běží v UTC; "dnes" počítáme v Praze.
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

  const admin = getSupabaseAdmin();
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const privateKey = process.env.VAPID_PRIVATE_KEY ?? "";
  if (!admin || !publicKey || !privateKey) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  webpush.setVapidDetails(
    "mailto:kontakt@plzenskaunikovka.cz",
    publicKey,
    privateKey,
  );

  const today = pragueToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIso = tomorrow.toISOString().slice(0, 10);

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
  // "Nové" uzavírky = ty, které cron ještě neviděl (seen klíč chybí).
  const seenKeys = closures.map((c) => `seen:${c.id}`);
  const { data: seenRows } = await admin
    .from("push_events")
    .select("key")
    .in("key", seenKeys);
  const seen = new Set((seenRows ?? []).map((r: { key: string }) => r.key));
  const newClosures = closures.filter((c) => !seen.has(`seen:${c.id}`));

  // ── Odběratelé ──────────────────────────────────────────────────────────
  const { data: subsData, error: subsErr } = await admin
    .from("push_subscriptions")
    .select("endpoint, keys, watched");
  if (subsErr) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  const subs = (subsData ?? []) as SubRow[];

  const nameById = new Map(closures.map((c) => [c.id, c.name]));
  function watchedStreets(sub: SubRow): Set<string> {
    const names = new Set<string>();
    for (const id of sub.watched) {
      const n = nameById.get(id);
      if (n) names.add(n);
    }
    return names;
  }

  // Nová uzavírka na hlídané ulici → notice jen pokud ji někdo hlídá jménem.
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

  // ── Dedup přes push_events ──────────────────────────────────────────────
  const eventKeys = candidates.map((n) => n.eventKey);
  const { data: sentRows } = eventKeys.length
    ? await admin.from("push_events").select("key").in("key", eventKeys)
    : { data: [] };
  const alreadySent = new Set(
    (sentRows ?? []).map((r: { key: string }) => r.key),
  );
  const toSend = candidates.filter((n) => !alreadySent.has(n.eventKey));

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

  // ── Úklid + zápis stavu ─────────────────────────────────────────────────
  if (dead.length) {
    await admin.from("push_subscriptions").delete().in("endpoint", dead);
  }
  const stamp = new Date().toISOString();
  const newEventRows = [
    ...toSend.map((n) => ({ key: n.eventKey, sent_at: stamp })),
    ...newClosures.map((c) => ({ key: `seen:${c.id}`, sent_at: stamp })),
  ];
  if (newEventRows.length) {
    await admin
      .from("push_events")
      .upsert(newEventRows, { onConflict: "key" });
  }

  return NextResponse.json({
    ok: true,
    events: toSend.length,
    delivered,
    prunedSubscriptions: dead.length,
    newClosuresMarked: newClosures.length,
  });
}
