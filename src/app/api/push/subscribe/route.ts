import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

// Zápis přes security-definer RPC (pattern vote_for_feature) — anon klíč
// stačí, tabulka samotná je za RLS bez policies.

interface SubscribeBody {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  watched?: string[];
}

/** Upsert push odběru + seznamu hlídaných uzavírek. */
export async function POST(request: Request) {
  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const endpoint = body.subscription?.endpoint ?? "";
  const p256dh = body.subscription?.keys?.p256dh ?? "";
  const auth = body.subscription?.keys?.auth ?? "";
  if (
    !endpoint.startsWith("https://") ||
    endpoint.length > 1000 ||
    !p256dh ||
    !auth
  ) {
    return NextResponse.json({ error: "subscription" }, { status: 422 });
  }

  const watched = Array.isArray(body.watched)
    ? body.watched
        .filter((w) => typeof w === "string" && w.length > 0 && w.length <= 80)
        .slice(0, 100)
    : [];

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const { error } = await supabase.rpc("push_upsert_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
    p_watched: watched,
  });
  if (error) {
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Odhlášení odběru (uživatel zrušil notifikace). */
export async function DELETE(request: Request) {
  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const endpoint = body.endpoint ?? "";
  if (!endpoint.startsWith("https://")) {
    return NextResponse.json({ error: "endpoint" }, { status: 422 });
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  await supabase.rpc("push_delete_subscription", { p_endpoint: endpoint });
  return NextResponse.json({ ok: true });
}
