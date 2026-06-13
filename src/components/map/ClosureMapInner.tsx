"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { LatLngBoundsExpression } from "leaflet";
import type { Closure } from "@/lib/types";

const PLZEN_CENTER: [number, number] = [49.7475, 13.3776];

function FitBounds({ closures }: { closures: Closure[] }) {
  const map = useMap();
  useEffect(() => {
    const pts = closures.flatMap((c) => c.ways.flat());
    if (pts.length === 0) {
      map.setView(PLZEN_CENTER, 12);
      return;
    }
    const bounds = pts.map((p) => [p[0], p[1]]) as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [closures, map]);
  return null;
}

export default function ClosureMapInner({
  closures,
  height = 420,
}: {
  closures: Closure[];
  height?: number;
}) {
  return (
    <MapContainer
      center={PLZEN_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height, borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {closures.map((c) => {
        const tip = (
          <Tooltip sticky>
            <strong>{c.name}</strong>
            <br />
            {c.state} · {c.oblast}
            {c.approx && (
              <>
                <br />
                <em>přibližná poloha</em>
              </>
            )}
          </Tooltip>
        );
        // Bodový prvek (náměstí, lávka) → značka místo čáry.
        if (c.point) {
          const pt = c.ways[0]?.[0];
          if (!pt) return null;
          return (
            <CircleMarker
              key={c.id}
              center={pt}
              radius={9}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: c.color,
                fillOpacity: c.approx ? 0.55 : 0.9,
                dashArray: c.approx ? "3 3" : undefined,
              }}
            >
              {tip}
            </CircleMarker>
          );
        }
        return c.ways.map((way, i) => (
          <Polyline
            key={`${c.id}-${i}`}
            positions={way}
            pathOptions={{ color: c.color, weight: 6, opacity: 0.9 }}
          >
            {tip}
          </Polyline>
        ));
      })}
      <FitBounds closures={closures} />
    </MapContainer>
  );
}
