import type { ClosureStatus } from "@/lib/types";

const MAP: Record<ClosureStatus, { bg: string; label: string }> = {
  now: { bg: "var(--ods-red)", label: "Probíhá" },
  plan: { bg: "var(--ods-amber)", label: "Plánováno" },
  done: { bg: "var(--ods-green)", label: "Hotovo" },
};

export function StatusBadge({
  status,
  label,
}: {
  status: ClosureStatus;
  label?: string;
}) {
  const s = MAP[status] ?? MAP.now;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
      style={{ background: s.bg }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
      {label ?? s.label}
    </span>
  );
}
