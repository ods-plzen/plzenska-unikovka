import Link from "next/link";
import { getLatestChange, kindLabel } from "@/lib/changelog";
import { AnnouncementBarClient } from "./AnnouncementBarClient";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

export async function AnnouncementBar() {
  const entry = await getLatestChange();
  if (!entry) return null;

  return (
    <AnnouncementBarClient entryId={entry.id}>
      <div className="border-b border-sky/20 bg-sky/10 text-ink">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-3 py-2 sm:items-center sm:gap-4 sm:px-6 sm:py-2.5">
          <span
            style={HEAD_FONT}
            className="mt-0.5 shrink-0 rounded-full bg-sky px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-paper sm:mt-0 sm:text-[10px]"
            aria-label={kindLabel(entry.kind)}
          >
            {kindLabel(entry.kind)}
          </span>

          <div className="min-w-0 flex-1 text-[13px] leading-snug sm:flex sm:items-center sm:gap-3 sm:text-sm">
            <span className="font-semibold text-ink">{entry.title}</span>
            {entry.attribution && (
              <span
                style={HEAD_FONT}
                className="block text-[10px] font-bold uppercase tracking-[0.15em] text-ink/55 sm:inline sm:text-[11px]"
              >
                {entry.attribution}
              </span>
            )}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {entry.link_href && entry.link_label && (
              <Link
                href={entry.link_href}
                style={HEAD_FONT}
                className="hidden rounded-full bg-blue px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-paper transition-colors hover:bg-blue-deep sm:inline-block"
              >
                {entry.link_label} →
              </Link>
            )}
            <Link
              href="/zmeny"
              style={HEAD_FONT}
              className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55 transition-colors hover:bg-ink/5 hover:text-ink sm:px-3 sm:text-[11px]"
            >
              Vše
            </Link>
          </div>
        </div>
      </div>
    </AnnouncementBarClient>
  );
}
