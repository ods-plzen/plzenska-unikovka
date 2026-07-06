import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/** Potvrzení odběru z e-mailu (double opt-in) → redirect na landing. */
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
  const { data } = await supabase.rpc("email_confirm", { p_token: token });
  return NextResponse.redirect(
    data === true ? `${base}/email/potvrzeno` : `${base}/email/neplatny-odkaz`,
  );
}
