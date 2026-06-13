"use client";

import { AREAS } from "@/data/areas";
import { useArea } from "./AreaProvider";

export function AreaSelect() {
  const { area, setArea } = useArea();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-white/70 sm:inline">Obvod:</span>
      <select
        value={area}
        onChange={(e) => setArea(e.target.value)}
        aria-label="Vyber městský obvod"
        className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-sm font-medium text-white outline-none focus:border-white/60"
      >
        {AREAS.map((a) => (
          <option key={a.id} value={a.id} className="text-ink">
            {a.short}
          </option>
        ))}
      </select>
    </label>
  );
}
