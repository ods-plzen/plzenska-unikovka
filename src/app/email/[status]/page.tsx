import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// Landing stránky pro e-mailové akce (confirm / unsubscribe / chyba).
const CONTENT: Record<
  string,
  { emoji: string; title: string; text: string }
> = {
  potvrzeno: {
    emoji: "✅",
    title: "Hlídání potvrzeno",
    text: "Od teď vám pošleme e-mail o každé nové uzavírce v Plzni a připomínku den před začátkem uzavírky na hlídané ulici. Nic jiného — žádný spam, žádná politika. Odhlásit se můžete jedním klikem v patičce každé zprávy.",
  },
  odhlaseno: {
    emoji: "👋",
    title: "Odhlášeno",
    text: "Váš e-mail jsme smazali, už vám nic nepřijde. Kdybyste si to rozmysleli, hlídání si znovu nastavíte na detailu kterékoli uzavírky.",
  },
  "neplatny-odkaz": {
    emoji: "🤔",
    title: "Neplatný odkaz",
    text: "Tenhle odkaz už neplatí — buď byl použitý, nebo je poškozený. Zkuste si hlídání nastavit znovu na detailu uzavírky.",
  },
};

export function generateStaticParams() {
  return Object.keys(CONTENT).map((status) => ({ status }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ status: string }>;
}): Promise<Metadata> {
  const { status } = await params;
  const c = CONTENT[status];
  return { title: c?.title ?? "E-mail", robots: { index: false } };
}

export default async function Page({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const c = CONTENT[status];
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="text-5xl">{c.emoji}</div>
      <h1 className="head mt-4 text-3xl font-bold text-ink">{c.title}</h1>
      <p className="mt-3 leading-relaxed text-muted">{c.text}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        ← Zpět na uzavírky
      </Link>
    </div>
  );
}
