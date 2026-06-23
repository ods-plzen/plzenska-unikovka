import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashIp, userAgent } from "@/lib/clientMeta";

export const runtime = "nodejs";

interface VoteBody {
  featureId?: string;
}

export async function POST(request: Request) {
  let body: VoteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const featureId = (body.featureId ?? "").trim();
  if (!featureId || featureId.length > 80) {
    return NextResponse.json({ error: "feature_id" }, { status: 422 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const ipHash = hashIp(request.headers);
  const ua = userAgent(request.headers);

  const { error } = await supabase.from("feature_votes_log").insert({
    feature_id: featureId,
    ip_hash: ipHash,
    user_agent: ua,
  });

  // unique (feature_id, ip_hash) → 23505 = už hlasoval, vrátíme 200 idempotentně
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, alreadyVoted: true });
    }
    console.error("[vote] insert failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
