import type { MetadataRoute } from "next";
import { closures } from "@/lib/data";

const SITE = "https://plzenskaunikovka.cz";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date().toISOString();
  const staticRoutes = [
    { url: `${SITE}/`, lastModified: today, changeFrequency: "daily" as const, priority: 1 },
    { url: `${SITE}/doprava`, lastModified: today, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${SITE}/zastupitelstvo`, lastModified: today, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE}/stavby`, lastModified: today, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE}/komunita`, lastModified: today, changeFrequency: "weekly" as const, priority: 0.6 },
    { url: `${SITE}/ochrana-soukromi`, lastModified: today, changeFrequency: "yearly" as const, priority: 0.3 },
  ];
  const closureRoutes = closures.map((c) => ({
    url: `${SITE}/doprava/${c.id}`,
    lastModified: today,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...closureRoutes];
}
