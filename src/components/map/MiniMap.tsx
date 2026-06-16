"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Severity } from "@/lib/severity";

const Inner = dynamic(() => import("./MiniMapInner"), {
  ssr: false,
  loading: () => (
    <div
      className="h-full w-full bg-gradient-to-br from-line to-paper"
      aria-hidden
    />
  ),
});

export function MiniMap({
  center,
  severity,
  height,
  zoom,
}: {
  center: [number, number];
  severity?: Severity;
  height?: number;
  zoom?: number;
}) {
  return (
    <Inner center={center} severity={severity} height={height} zoom={zoom} />
  );
}
