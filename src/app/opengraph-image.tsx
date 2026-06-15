import { ImageResponse } from "next/og";

export const alt = "Plzeňská únikovka — únikovka z plzeňského dopravního chaosu";
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
        {/* U-turn arrow mark */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 50,
            right: 60,
            width: 180,
            height: 180,
            border: `28px solid ${SKY}`,
            borderRight: "none",
            borderTopLeftRadius: 90,
            borderTopRightRadius: 90,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 175,
            right: 40,
            width: 0,
            height: 0,
            borderLeft: "40px solid transparent",
            borderRight: "40px solid transparent",
            borderTop: `66px solid ${SKY}`,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.02 }}>
            Plzeňská únikovka
          </div>
          <div
            style={{
              fontSize: 38,
              color: SKY,
              marginTop: 12,
              fontWeight: 600,
            }}
          >
            plzenskaunikovka.cz
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#ffffffcc",
              marginTop: 28,
              maxWidth: 940,
              lineHeight: 1.3,
            }}
          >
            Uzavírky, hlasy zastupitelstva, stavby a komunita pro všech 10
            plzeňských obvodů na jednom místě.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
