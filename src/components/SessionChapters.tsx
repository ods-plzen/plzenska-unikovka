import { session } from "@/data/chapters";

export function SessionChapters() {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="head text-lg font-semibold text-blue">
            📺 Záznam jednání — kapitoly
          </h2>
          <p className="text-sm text-muted">
            {session.label} · {session.date}
          </p>
        </div>
        <a
          href={session.zaznamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-blue hover:border-sky"
        >
          Otevřít záznam
        </a>
      </div>

      <ol className="mt-4 space-y-3">
        {session.chapters.map((ch, i) => (
          <li
            key={i}
            className="border-l-2 border-sky/40 pl-3"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-sky">
              {ch.topic}
            </div>
            <div className="head font-semibold text-ink">{ch.title}</div>
            <p className="mt-0.5 text-sm text-ink/80">{ch.summary}</p>
            {ch.result && (
              <div className="mt-1 inline-block rounded bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
                {ch.result}
              </div>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-lg bg-sky/5 p-3 text-xs text-muted">
        ℹ️ Kapitoly jsou strojově připravené shrnutí z přepisu záznamu a ručně
        ověřené. Přesné znění a hlasování najdete vždy v oficiálním záznamu.
      </p>
    </section>
  );
}
