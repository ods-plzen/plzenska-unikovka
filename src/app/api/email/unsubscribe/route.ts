import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/** Odhlášení odběru z patičky e-mailu → smaže záznam (GDPR right to erasure). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const base = new URL(request.url).origin;
  if (!token || token.length > 100) {
    return NextResponse.redirect(`${base}/email/neplatny-odkaz`);
  }
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.redirect(`${base}/email/neplatny-odkaz`);
  }
  const { data } = await supabase.rpc("email_unsubscribe", { p_token: token });
  return NextResponse.redirect(
    data === true ? `${base}/email/odhlaseno` : `${base}/email/neplatny-odkaz`,
  );
}
