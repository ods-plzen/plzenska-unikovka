import { klub, klubSource, initials } from "@/data/klub";

export function OdsKlub() {
  return (
    <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className="section-rule mb-4">
        <div>
          <span className="kicker">Klub ODS · {klub.length} zastupitelů</span>
          <h2 className="head text-2xl font-bold uppercase tracking-tight text-ink">
            ODS v zastupitelstvu
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {klub.map((m) => (
          <div
            key={m.name}
            className={`flex items-center gap-3 rounded-xl border p-3 ${
              m.highlight
                ? "border-sky/50 bg-sky/5"
                : "border-line bg-paper/40"
            }`}
          >
            <div
              className={`head flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                m.highlight ? "bg-sky" : "bg-blue"
              }`}
            >
              {initials(m.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-ink">
                {m.titul && (
                  <span className="text-xs font-normal text-muted">
                    {m.titul}{" "}
                  </span>
                )}
                {m.name}
              </div>
              {m.role && (
                <div className="text-xs font-medium text-sky">{m.role}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted">
        Zdroj:{" "}
        <a
          href={klubSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue hover:underline"
        >
          {klubSource.label}
        </a>{" "}
        · volební období 2022–2026
      </p>
    </section>
  );
}
