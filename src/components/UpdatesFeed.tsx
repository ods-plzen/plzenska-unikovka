import Link from "next/link";
import { sortedUpdates, KIND_META } from "@/data/updates";

export function UpdatesFeed({ limit = 6 }: { limit?: number }) {
  const items = sortedUpdates().slice(0, limit);
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="head text-xl font-bold text-ink">Co je nového</h2>
      <p className="text-sm text-muted">Poslední změny napříč obvody — chronologicky, bez algoritmu.</p>

      <ol className="mt-4 space-y-1">
        {items.map((u, i) => {
          const m = KIND_META[u.kind];
          return (
            <li key={i}>
              <Link
                href={u.href}
                className="group flex items-start gap-3 rounded-lg px-2 py-2 hover:bg-bg"
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: m.color }}
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="font-semibold" style={{ color: m.color }}>
                      {m.label}
                    </span>
                    <span>· {u.display}</span>
                    {u.upcoming && (
                      <span className="rounded bg-sky/10 px-1.5 py-0.5 font-medium text-sky">
                        nadcházející
                      </span>
                    )}
                  </span>
                  <span className="block text-sm text-ink group-hover:underline">
                    {u.title}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
