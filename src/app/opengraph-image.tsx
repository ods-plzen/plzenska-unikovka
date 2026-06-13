import { ImageResponse } from "next/og";

export const alt = "Plzeň přehledně — od ODS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#153d8a";
const SKY = "#009fe3";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BLUE,
          color: "#fff",
          padding: 70,
          fontFamily: "sans-serif",
        }}
      >
        {/* logo bars (ODS „racek" styl) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ width: 150, height: 18, background: SKY }} />
          <div style={{ width: 110, height: 18, background: "#fff" }} />
          <div style={{ width: 70, height: 18, background: "#ffffff99" }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1.05 }}>
            Plzeň přehledně
          </div>
          <div style={{ fontSize: 40, color: SKY, marginTop: 8 }}>od ODS</div>
          <div
            style={{
              fontSize: 34,
              color: "#ffffffcc",
              marginTop: 28,
              maxWidth: 900,
            }}
          >
            Uzavírky, zastupitelstvo, stavby a komunita pro všech 10 plzeňských
            obvodů na jednom místě.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
