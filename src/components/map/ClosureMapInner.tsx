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
import type { LatLngBoundsExpression, PathOptions } from "leaflet";
import type { Closure } from "@/lib/types";
import type { Severity } from "@/lib/severity";

const PLZEN_CENTER: [number, number] = [49.7475, 13.3776];

const ODS_RED = "#c0392b";
const ODS_BLUE = "#153d8a";
const GRAY = "#6b7280";

const STYLE: Record<Severity, { radius: number; pathOptions: PathOptions }> = {
  major: {
    radius: 12,
    pathOptions: { color: "#fff", weight: 3, fillColor: ODS_RED, fillOpacity: 1 },
  },
  medium: {
    radius: 7,
    pathOptions: { color: "#fff", weight: 2, fillColor: ODS_BLUE, fillOpacity: 0.95 },
  },
  minor: {
    radius: 4,
    pathOptions: { color: "#fff", weight: 1, fillColor: GRAY, fillOpacity: 0.75 },
  },
};

const SELECTED_BOOST: PathOptions = {
  color: "#fff",
  weight: 4,
  fillOpacity: 1,
};

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
  selectedId,
  onSelect,
}: {
  closures: Closure[];
  height?: number;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return (
    <MapContainer
      center={PLZEN_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height, borderRadius: 12 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · &copy; <a href="https://carto.com/">CARTO</a> · zdroj uzavírek SITmP / JSDI ŘSD'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {/* Major markers nahoře (renderují se poslední → leží navrch) */}
      {(["minor", "medium", "major"] as Severity[]).flatMap((sev) =>
        closures
          .filter((c) => (c.severity ?? "minor") === sev)
          .map((c) => {
            const isSelected = c.id === selectedId;
            const style = STYLE[sev];
            const pathOptions: PathOptions = isSelected
              ? { ...style.pathOptions, ...SELECTED_BOOST }
              : style.pathOptions;
            const radius = isSelected ? style.radius + 4 : style.radius;
            const handlers = onSelect ? { click: () => onSelect(c.id) } : undefined;

            const tip = (
              <Tooltip
                direction="top"
                offset={[0, -radius]}
                opacity={0.92}
                sticky
              >
                <strong>{c.name}</strong>
                <br />
                <span style={{ fontSize: "0.85em", opacity: 0.8 }}>
                  {c.oblast}
                </span>
              </Tooltip>
            );

            // Bodový prvek nebo bodové uzavírky → marker.
            if (c.point || c.ways[0]?.length === 1) {
              const pt = c.ways[0]?.[0];
              if (!pt) return null;
              return (
                <CircleMarker
                  key={c.id}
                  center={pt}
                  radius={radius}
                  pathOptions={pathOptions}
                  eventHandlers={handlers}
                >
                  {tip}
                </CircleMarker>
              );
            }

            // Linie → polyline. Major dostane silnější stroke.
            const lineWeight = sev === "major" ? 7 : sev === "medium" ? 5 : 3;
            return c.ways.map((way, i) => (
              <Polyline
                key={`${c.id}-${i}`}
                positions={way}
                pathOptions={{
                  color: style.pathOptions.fillColor,
                  weight: isSelected ? lineWeight + 2 : lineWeight,
                  opacity: isSelected ? 1 : 0.85,
                }}
                eventHandlers={handlers}
              >
                {i === 0 ? tip : null}
              </Polyline>
            ));
          }),
      )}
      <FitBounds closures={closures} />
    </MapContainer>
  );
}
