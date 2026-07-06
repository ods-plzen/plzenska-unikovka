"use client";

import { useMemo } from "react";
import { Marker, Polyline } from "react-leaflet";
import L from "leaflet";

/**
 * Souvislá objízdná trasa: bílý lem + zelená čára + šipky po směru jízdy
 * + body A (start) a B (cíl). Sdílená pro velkou mapu i minimapy.
 */
const GREEN = "#15803d";
const DEEP = "#0e2a63";

function metres(a: [number, number], b: [number, number]): number {
  const dLat = (a[0] - b[0]) * 111_320;
  const dLng = (a[1] - b[1]) * 111_320 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

interface ArrowDecor {
  pos: [number, number];
  deg: number; // CSS rotace ➤ (0° = východ, kladně po směru ručiček)
}

// Šipky rovnoměrně podél trasy (v (i+1)/(count+1) celkové délky).
function arrowsAlong(route: [number, number][], count: number): ArrowDecor[] {
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const l = metres(route[i], route[i + 1]);
    segLens.push(l);
    total += l;
  }
  if (total === 0) return [];
  const out: ArrowDecor[] = [];
  for (let k = 1; k <= count; k++) {
    const target = (total * k) / (count + 1);
    let cum = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (cum + segLens[i] >= target) {
        const t = segLens[i] > 0 ? (target - cum) / segLens[i] : 0;
        const p = route[i];
        const q = route[i + 1];
        const pos: [number, number] = [
          p[0] + (q[0] - p[0]) * t,
          p[1] + (q[1] - p[1]) * t,
        ];
        const dx = (q[1] - p[1]) * Math.cos((p[0] * Math.PI) / 180);
        const dy = q[0] - p[0];
        out.push({ pos, deg: (Math.atan2(-dy, dx) * 180) / Math.PI });
        break;
      }
      cum += segLens[i];
    }
  }
  return out;
}

function arrowIcon(deg: number) {
  return L.divIcon({
    className: "",
    html: `<div style="transform:rotate(${Math.round(deg)}deg);font-size:14px;line-height:16px;text-align:center;color:${GREEN};text-shadow:0 0 3px #fff,0 0 3px #fff">➤</div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function endpointIcon(letter: "A" | "B") {
  return L.divIcon({
    className: "",
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${DEEP};color:#fff;font:bold 11px/22px Arial,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)">${letter}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export function DetourPath({
  route,
  arrows = 4,
  endpoints = true,
}: {
  route: [number, number][];
  arrows?: number;
  endpoints?: boolean;
}) {
  const decors = useMemo(() => arrowsAlong(route, arrows), [route, arrows]);
  if (route.length < 2) return null;
  return (
    <>
      <Polyline
        positions={route}
        pathOptions={{ color: "#ffffff", weight: 9, opacity: 1 }}
      />
      <Polyline
        positions={route}
        pathOptions={{ color: GREEN, weight: 5, opacity: 0.95 }}
      />
      {decors.map((d, i) => (
        <Marker
          key={`arr-${i}`}
          position={d.pos}
          icon={arrowIcon(d.deg)}
          interactive={false}
        />
      ))}
      {endpoints && (
        <>
          <Marker
            position={route[0]}
            icon={endpointIcon("A")}
            interactive={false}
          />
          <Marker
            position={route[route.length - 1]}
            icon={endpointIcon("B")}
            interactive={false}
          />
        </>
      )}
    </>
  );
}
