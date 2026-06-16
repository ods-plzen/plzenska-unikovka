import { Suspense } from "react";
import type { Metadata } from "next";
import { ListView } from "@/components/views/ListView";

export const metadata: Metadata = {
  title: "Seznam všech uzavírek v Plzni",
  description:
    "Plný A–Z seznam uzavírek a plánovaných oprav v Plzni. Hledejte podle ulice, obvodu nebo stavu (probíhá / plánováno).",
};

export default function Page() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted">Načítám seznam…</div>}
    >
      <ListView />
    </Suspense>
  );
}
