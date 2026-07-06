"use client";

import { MapContainer, TileLayer, CircleMarker, Polyline } from "react-leaflet";
import type { Severity } from "@/lib/severity";
import { DetourPath } from "@/components/map/DetourPath";

const SEVERITY_FILL: Record<Severity, string> = {
  major: "#c0392b", // alert červená — úplná uzavírka (dopravní stop)
  medium: "#009fe3", // ODS modrá světlá — omezení provozu
  minor: "#94a3b8", // neutrální šedá — drobné omezení
};

const DETOUR_GREEN = "#15803d"; // objízdná trasa — pozitivní zelená

export default function MiniMapInner({
  center,
  ways,
  detourWays,
  severity = "minor",
  height = 160,
  zoom = 15,
}: {
  center: [number, number];
  ways?: [number, number][][]; // pokud má closure polyline geometrii, nakreslíme ji
  detourWays?: [number, number][][]; // objížďka — kudy jet místo
  severity?: Severity;
  height?: number;
  zoom?: number;
}) {
  const color = SEVERITY_FILL[severity];
  const polylines = (ways ?? []).filter((w) => w.length >= 2);
  const detours = (detourWays ?? []).filter((w) => w.length >= 2);
  const hasPolyline = polylines.length > 0;

  return (
    <MapContainer
      center={center}
      zoom={hasPolyline ? zoom - 1 : zoom}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      style={{ height, width: "100%" }}
    >
      {/* light_all má názvy ulic — důležité pro "vidět, kde to je" */}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {hasPolyline ? (
        polylines.map((way, i) => (
          <Polyline
            key={i}
            positions={way}
            pathOptions={{
              color: "#ffffff",
              weight: 10,
              opacity: 1,
            }}
          />
        ))
      ) : null}
      {hasPolyline ? (
        polylines.map((way, i) => (
          <Polyline
            key={`top-${i}`}
            positions={way}
            pathOptions={{
              color,
              weight: 7,
              opacity: 1,
            }}
          />
        ))
      ) : null}

      {detours.map((way, i) => (
        <DetourPath
          key={`detour-${i}`}
          route={way}
          arrows={height >= 220 ? 4 : 2}
          endpoints={height >= 220}
        />
      ))}

      <CircleMarker
        center={center}
        radius={severity === "major" ? 14 : severity === "medium" ? 10 : 7}
        pathOptions={{
          color: "#ffffff",
          weight: 4,
          fillColor: color,
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  );
}
