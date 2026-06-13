import Link from "next/link";
import type { Closure } from "@/lib/types";
import { extraFor } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

export function ClosureCard({ c }: { c: Closure }) {
  const extra = extraFor(c.id);
  const title = extra?.title ?? c.akce;
  const sub = extra?.sub;

  return (
    <Link
      href={`/doprava/${c.id}`}
      className="group block rounded-xl border border-line bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="head text-lg font-semibold leading-tight text-ink">
            {c.name}
          </div>
          <div className="mt-0.5 text-sm text-muted">{title}</div>
        </div>
        <StatusBadge status={c.status} label={c.state} />
      </div>

      {sub && <p className="mt-2 text-sm text-ink/80">{sub}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="ods-chip not-italic">{c.oblast}</span>
        {c.termin && <span>· {c.termin}</span>}
        <span className="ml-auto font-medium text-blue group-hover:underline">
          Detail →
        </span>
      </div>
    </Link>
  );
}
