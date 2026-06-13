import type { Vote } from "@/lib/types";

export function VoteCard({ v }: { v: Vote }) {
  const hasTally = typeof v.pro === "number";
  return (
    <article className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="head flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue text-sm font-bold text-white">
          {v.av}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-ink">{v.who}</div>
          <div className="text-xs text-muted">{v.role}</div>
        </div>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-ink">{v.stmt}</p>

      {hasTally && (
        <div className="mt-3 flex gap-2 text-xs font-medium">
          <span className="rounded-md bg-green/10 px-2 py-1 text-green">
            Pro {v.pro}
          </span>
          <span className="rounded-md bg-red/10 px-2 py-1 text-red">
            Proti {v.proti}
          </span>
          <span className="rounded-md bg-muted/10 px-2 py-1 text-muted">
            Zdržel se {v.zdr}
          </span>
        </div>
      )}

      {v.note && (
        <p className="mt-2 text-xs italic text-muted">Pozn.: {v.note}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs">
        {v.tags.map((t) => (
          <span key={t} className="rounded bg-sky/10 px-1.5 py-0.5 text-sky">
            #{t}
          </span>
        ))}
        {v.srcUrl ? (
          <a
            href={v.srcUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto font-medium text-blue hover:underline"
          >
            Zdroj: {v.src}
          </a>
        ) : (
          <span className="ml-auto font-medium text-blue">Zdroj: {v.src}</span>
        )}
      </div>
      {v.rec && <div className="mt-1.5 text-xs text-muted">{v.rec}</div>}
    </article>
  );
}
