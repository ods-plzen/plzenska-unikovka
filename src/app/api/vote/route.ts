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

  // RPC obchází Supabase RLS — security definer funkce běží jako owner.
  const { data, error } = await supabase.rpc("vote_for_feature", {
    p_feature_id: featureId,
    p_ip_hash: ipHash,
    p_user_agent: ua,
  });

  if (error) {
    console.error("[vote] rpc failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const result = (data ?? {}) as { ok?: boolean; alreadyVoted?: boolean; error?: string };
  if (result.ok === false) {
    return NextResponse.json({ error: result.error ?? "rpc_error" }, { status: 422 });
  }
  return NextResponse.json({
    ok: true,
    alreadyVoted: Boolean(result.alreadyVoted),
  });
}
