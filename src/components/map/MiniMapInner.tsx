"use client";

import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import type { Severity } from "@/lib/severity";

const SEVERITY_FILL: Record<Severity, string> = {
  major: "#153d8a", // ODS modrá tmavá
  medium: "#009fe3", // ODS modrá světlá
  minor: "#94a3b8", // neutrální šedá (mimo ODS paletu — pro nezvýrazněné položky)
};

export default function MiniMapInner({
  center,
  severity = "minor",
  height = 160,
  zoom = 15,
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
      {/* light_all má názvy ulic — důležité pro user "vidět, kde to je" */}
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      <CircleMarker
        center={center}
        radius={severity === "major" ? 16 : severity === "medium" ? 12 : 8}
        pathOptions={{
          color: "#ffffff",
          weight: 4,
          fillColor: SEVERITY_FILL[severity],
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  );
}
