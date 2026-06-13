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
      className="group relative block overflow-hidden rounded-xl border border-line bg-card pl-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: c.color }}
      />
      <div className="p-4 pl-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="head text-lg font-semibold leading-tight text-ink">
              {c.name}
            </div>
            <div className="mt-0.5 text-sm text-muted">{title}</div>
          </div>
          <StatusBadge status={c.status} label={c.state} />
        </div>

        {sub && <p className="mt-2 text-sm text-ink/80">{sub}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="ods-chip">{c.oblast}</span>
          {c.termin && <span>· {c.termin}</span>}
          {(extra?.objizdka || extra?.mhd) && (
            <span className="rounded bg-green/10 px-1.5 py-0.5 font-medium text-green">
              objížďka + MHD
            </span>
          )}
          <span className="head ml-auto text-xs font-semibold uppercase tracking-wide text-blue group-hover:text-sky">
            Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
