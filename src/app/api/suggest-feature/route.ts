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

  const { error } = await supabase.from("feature_suggestions").insert({
    title,
    description,
    email,
    ip_hash: ipHash,
  });

  if (error) {
    console.error("[suggest-feature] insert failed:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
