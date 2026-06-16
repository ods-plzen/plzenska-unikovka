"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import type { Severity } from "@/lib/severity";

const SEVERITY_FILL: Record<Severity, string> = {
  major: "#c0392b",
  medium: "#153d8a",
  minor: "#6b7280",
};

export default function MiniMapInner({
  center,
  severity = "minor",
  height = 160,
  zoom = 14,
}: {
  center: [number, number];
  severity?: Severity;
  height?: number;
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
      style={{ height, width: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
      <CircleMarker
        center={center}
        radius={severity === "major" ? 14 : severity === "medium" ? 10 : 7}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: SEVERITY_FILL[severity],
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  );
}
