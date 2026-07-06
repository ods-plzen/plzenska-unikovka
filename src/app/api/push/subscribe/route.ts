import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

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

  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint,
      keys: { p256dh, auth },
      watched,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" },
  );
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
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
