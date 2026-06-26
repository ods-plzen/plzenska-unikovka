import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashIp, userAgent } from "@/lib/clientMeta";

export const runtime = "nodejs";

interface FeedbackBody {
  message?: string;
  email?: string;
  notify?: boolean;
  closureId?: string;
  pageUrl?: string;
}

export async function POST(request: Request) {
  let body: FeedbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (message.length < 4 || message.length > 4000) {
    return NextResponse.json({ error: "message_length" }, { status: 422 });
  }

  const email = (body.email ?? "").trim() || null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "email_format" }, { status: 422 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  const ipHash = hashIp(request.headers);
  const ua = userAgent(request.headers);

  const { data, error } = await supabase.rpc("send_feedback", {
    p_message: message,
    p_email: email,
    p_notify: Boolean(body.notify) && Boolean(email),
    p_closure_id: body.closureId ?? null,
    p_page_url: body.pageUrl ?? null,
    p_user_agent: ua,
    p_ip_hash: ipHash,
  });

  if (error) {
    console.error("[feedback] rpc failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string };
  if (result.ok === false) {
    return NextResponse.json({ error: result.error ?? "rpc_error" }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
