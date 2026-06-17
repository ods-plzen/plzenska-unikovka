import { ImageResponse } from "next/og";
import { closures } from "@/lib/data";

export const alt =
  "Plzeňská únikovka — mapa všech uzavírek a MHD odklonů v Plzni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b1320";
const BLUE = "#153d8a";
const SKY = "#009fe3";
const PAPER = "#f7f4ec";

export default function Image() {
  const activeCount = closures.filter(
    (c) => c.status === "now" && c.od,
  ).length;
  const planCount = closures.filter((c) => c.status === "plan").length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        {/* ─── Top bar — ODS blue strip ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: BLUE,
            color: PAPER,
            padding: "20px 60px",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          <span>ODS</span>
          <span style={{ margin: "0 18px", opacity: 0.45 }}>·</span>
          <span style={{ color: SKY }}>plzenskaunikovka.cz</span>
          <span style={{ marginLeft: "auto", opacity: 0.7, fontSize: 18 }}>
            Mapa uzavírek v Plzni
          </span>
        </div>

        {/* ─── Hero counter ─── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 60px 30px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 280,
              fontWeight: 900,
              lineHeight: 0.85,
              letterSpacing: "-0.03em",
              alignItems: "baseline",
              gap: 30,
            }}
          >
            <span style={{ color: "#c0392b" }}>{activeCount}</span>
            <span style={{ color: "#cfd6e0", fontWeight: 200 }}>/</span>
            <span style={{ color: BLUE }}>{planCount}</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#5b6273",
              gap: 80,
            }}
          >
            <span>probíhá</span>
            <span>plánuje se</span>
          </div>
        </div>

        {/* ─── Wordmark + footer ─── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "30px 60px 60px",
            borderTop: `4px solid ${INK}`,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 84,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              color: INK,
            }}
          >
            Plzeňská únikovka
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 26,
              color: "#5b6273",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span>Mapa, plánované projekty, MHD odklony.</span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: BLUE,
              }}
            >
              Provozuje ODS Plzeň-město
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
