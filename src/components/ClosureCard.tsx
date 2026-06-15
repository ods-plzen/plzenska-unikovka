import Link from "next/link";
import type { Closure } from "@/lib/types";
import { extraFor, mhdInfoFor } from "@/lib/data";
import { StatusBadge } from "./StatusBadge";

function mhdChipLabel(
  info: ReturnType<typeof mhdInfoFor>,
  extra: ReturnType<typeof extraFor>,
): { label: string; structured: boolean } | null {
  if (info) {
    const reroutes = info.reroutes?.length ?? 0;
    const tempStops = info.tempStops?.length ?? 0;
    if (reroutes > 0 && tempStops > 0)
      return {
        structured: true,
        label: `🚌 ${reroutes} odklon${reroutes === 1 ? "" : reroutes < 5 ? "y" : "ů"} · ${tempStops} zastáv${tempStops === 1 ? "ka" : tempStops < 5 ? "ky" : "ek"}`,
      };
    if (reroutes > 0)
      return {
        structured: true,
        label: `🚌 ${reroutes} odklon${reroutes === 1 ? "" : reroutes < 5 ? "y" : "ů"}`,
      };
    if (tempStops > 0)
      return {
        structured: true,
        label: `🚌 ${tempStops} dočasná zastáv${tempStops === 1 ? "ka" : tempStops < 5 ? "ky" : "ek"}`,
      };
    return { structured: true, label: "🚌 MHD info" };
  }
  if (extra?.mhd || extra?.objizdka)
    return { structured: false, label: "objížďka + MHD" };
  return null;
}

export function ClosureCard({ c }: { c: Closure }) {
  const extra = extraFor(c.id);
  const info = mhdInfoFor(c.id);
  const title = extra?.title ?? c.akce;
  const sub = extra?.sub;
  const chip = mhdChipLabel(info, extra);

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
          {chip && (
            <span
              className={
                chip.structured
                  ? "rounded bg-blue/10 px-1.5 py-0.5 font-medium text-blue"
                  : "rounded bg-green/10 px-1.5 py-0.5 font-medium text-green"
              }
            >
              {chip.label}
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
