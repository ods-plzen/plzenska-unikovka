import { ImageResponse } from "next/og";
import { closures, closureById, getExtra } from "@/lib/data";

export const alt = "Uzavírka — Plzeň přehledně";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return closures.map((c) => ({ id: c.id }));
}

const BLUE = "#153d8a";
const SKY = "#009fe3";
const STATUS: Record<string, { bg: string; label: string }> = {
  now: { bg: "#c0392b", label: "Probíhá" },
  plan: { bg: "#cf8a12", label: "Plánováno" },
  done: { bg: "#1f8a5b", label: "Hotovo" },
};

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = closureById(id);
  const extra = c ? await getExtra(c.id) : undefined;
  const st = c ? STATUS[c.status] ?? STATUS.now : STATUS.now;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* horní ODS pruh */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: BLUE,
            color: "#fff",
            padding: "26px 56px",
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ width: 54, height: 9, background: SKY }} />
            <div style={{ width: 40, height: 9, background: "#fff" }} />
            <div style={{ width: 26, height: 9, background: "#ffffff99" }} />
          </div>
          Plzeň přehledně
          <span style={{ color: SKY, fontSize: 22, fontWeight: 600 }}>
            · doprava
          </span>
        </div>

        {/* tělo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 56,
            flex: 1,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                background: SKY,
                color: "#fff",
                fontSize: 24,
                fontWeight: 700,
                padding: "6px 18px",
              }}
            >
              {c?.oblast ?? "Plzeň"}
            </div>
            <div
              style={{
                display: "flex",
                background: st.bg,
                color: "#fff",
                fontSize: 24,
                fontWeight: 700,
                padding: "6px 18px",
                borderRadius: 30,
              }}
            >
              {c?.state ?? st.label}
            </div>
          </div>

          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#0f172a",
              marginTop: 24,
              lineHeight: 1.05,
            }}
          >
            {c?.name ?? "Uzavírka"}
          </div>
          <div
            style={{
              fontSize: 34,
              color: "#5b6473",
              marginTop: 16,
              maxWidth: 1000,
            }}
          >
            {extra?.title ?? c?.akce ?? ""}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              fontSize: 26,
              color: BLUE,
              fontWeight: 700,
            }}
          >
            {extra?.objizdka ? "Objízdné trasy a MHD uvnitř →" : "Detail na webu →"}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
