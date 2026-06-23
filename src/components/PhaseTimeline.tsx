import type { Phase } from "@/lib/types";
import { resolvePhases } from "@/lib/resolvePhases";

const DOT: Record<string, string> = {
  done: "var(--ods-green)",
  now: "var(--ods-sky)",
  "": "var(--line)",
};

export function PhaseTimeline({ phases }: { phases: Phase[] }) {
  const resolved = resolvePhases(phases);
  return (
    <ol className="relative ml-2 border-l-2 border-line">
      {resolved.map(([label, when, state], i) => (
        <li key={i} className="relative pb-5 pl-5 last:pb-0">
          <span
            className="absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-2 ring-white"
            style={{ background: DOT[state] ?? DOT[""] }}
          />
          <div
            className={`text-sm font-semibold ${
              state === "now" ? "text-blue" : "text-ink"
            }`}
          >
            {label}
            {state === "now" && (
              <span className="ml-2 rounded bg-sky/15 px-1.5 py-0.5 text-[11px] font-medium text-sky">
                právě teď
              </span>
            )}
          </div>
          <div className="text-xs text-muted">{when}</div>
        </li>
      ))}
    </ol>
  );
}
