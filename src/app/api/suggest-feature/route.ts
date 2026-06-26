import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashIp } from "@/lib/clientMeta";

export const runtime = "nodejs";

interface SuggestBody {
  title?: string;
  description?: string;
  email?: string;
}

export async function POST(request: Request) {
  let body: SuggestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  if (title.length < 4 || title.length > 200) {
    return NextResponse.json({ error: "title_length" }, { status: 422 });
  }

  const description = (body.description ?? "").trim() || null;
  if (description && description.length > 2000) {
    return NextResponse.json({ error: "description_length" }, { status: 422 });
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

  const { data, error } = await supabase.rpc("suggest_feature", {
    p_title: title,
    p_description: description,
    p_email: email,
    p_ip_hash: ipHash,
  });

  if (error) {
    console.error("[suggest-feature] rpc failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const result = (data ?? {}) as { ok?: boolean; error?: string };
  if (result.ok === false) {
    return NextResponse.json({ error: result.error ?? "rpc_error" }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
