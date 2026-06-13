import { dataSources } from "@/data/sources";

export function DataSources() {
  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <h2 className="head text-xl font-bold text-ink">Odkud bereme data</h2>
      <p className="text-sm text-muted">
        Jen oficiální a veřejné zdroje. Žádné domněnky — u každé položky najdete
        odkaz na původní zdroj.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {dataSources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 hover:border-sky"
          >
            <span>
              <span className="block text-sm font-semibold text-blue">
                {s.label}
              </span>
              <span className="block text-xs text-muted">{s.what}</span>
            </span>
            <span aria-hidden className="text-sky">
              ↗
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
