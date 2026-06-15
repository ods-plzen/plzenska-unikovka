import type { MetadataRoute } from "next";
import { closures } from "@/lib/data";

const SITE = "https://plzenskaunikovka.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString();
  const closureRoutes = closures.map((c) => ({
    url: `${SITE}/doprava/${c.id}`,
    lastModified: today,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
  return [
    { url: `${SITE}/`, lastModified: today, changeFrequency: "daily", priority: 1 },
    ...closureRoutes,
    { url: `${SITE}/ochrana-soukromi`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];
}
