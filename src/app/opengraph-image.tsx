import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";
import { closures } from "@/lib/data";

export const alt =
  "Plzeňská únikovka — mapa všech uzavírek a MHD odklonů v Plzni";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b1320";
const BLUE = "#153d8a";
const SKY = "#009fe3";
const PAPER = "#f7f4ec";
const ALERT = "#c0392b";

async function loadFont(fileName: string): Promise<ArrayBuffer> {
  const path = join(process.cwd(), "src/app/_fonts", fileName);
  const data = await readFile(path);
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

export default async function Image() {
  const activeCount = closures.filter(
    (c) => c.status === "now" && c.od,
  ).length;
  const planCount = closures.filter((c) => c.status === "plan").length;
  const oswald = await loadFont("Oswald-Bold.ttf");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BLUE,
          color: PAPER,
          fontFamily: "Oswald",
        }}
      >
        {/* ─── TOP STRIP ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 50px",
            borderBottom: `2px solid rgba(247,244,236,0.15)`,
            fontSize: 22,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontWeight: 700 }}>ODS</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span style={{ color: SKY, fontWeight: 600 }}>
              plzenskaunikovka.cz
            </span>
          </div>
          <span style={{ opacity: 0.55, fontSize: 18 }}>
            Mapa uzavírek v Plzni
          </span>
        </div>

        {/* ─── HERO: ICON + WORDMARK ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "30px 50px 20px",
            gap: 40,
          }}
        >
          <svg
            width="180"
            height="220"
            viewBox="0 0 240 240"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M83.3,171.3v-80c0-22.1,17.9-40,40-40s40,17.9,40,40v80"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="42"
            />
            <path d="M83.3,210.3l-55-39h110l-55,39Z" fill="#FFFFFF" />
            <path
              d="M83.3,171.3v-80c0-22.1,17.9-40,40-40s40,17.9,40,40v80"
              fill="none"
              stroke={BLUE}
              strokeWidth="3"
              strokeDasharray="14 10"
              strokeLinecap="round"
            />
          </svg>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                display: "flex",
                fontSize: 110,
                fontWeight: 800,
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
                color: PAPER,
              }}
            >
              PLZEŇSKÁ
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 110,
                fontWeight: 800,
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
                color: PAPER,
              }}
            >
              ÚNIKOVKA
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontSize: 28,
                fontWeight: 600,
                letterSpacing: "0.35em",
                color: SKY,
              }}
            >
              VÍTE, KUDY VEN.
            </div>
          </div>
        </div>

        {/* ─── COUNTER STRIP ─── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 50px",
            marginTop: "auto",
            borderTop: `2px solid rgba(247,244,236,0.15)`,
            gap: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: ALERT,
                lineHeight: 0.9,
              }}
            >
              {activeCount}
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.3em",
                color: "rgba(247,244,236,0.75)",
              }}
            >
              PROBÍHÁ TEĎ
            </span>
          </div>
          <div
            style={{
              fontSize: 90,
              color: "rgba(247,244,236,0.2)",
              fontWeight: 200,
            }}
          >
            /
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span
              style={{
                fontSize: 90,
                fontWeight: 800,
                color: SKY,
                lineHeight: 0.9,
              }}
            >
              {planCount}
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: "0.3em",
                color: "rgba(247,244,236,0.75)",
              }}
            >
              PLÁNUJE SE
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.3em",
              color: "rgba(247,244,236,0.55)",
            }}
          >
            PROVOZUJE ODS PLZEŇ-MĚSTO
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Oswald",
          data: oswald,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
