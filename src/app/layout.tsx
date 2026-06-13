import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { AreaProvider } from "@/components/AreaProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plzeň přehledně — od ODS",
  description:
    "Uzavírky, rozhodnutí zastupitelstva, stavby a komunitní informace pro všech 10 plzeňských obvodů na jednom místě.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Plzeň přehledně" },
};

export const viewport: Viewport = {
  themeColor: "#153d8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="cs" className={`${inter.variable} ${oswald.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <AreaProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            {children}
          </main>
          <Footer />
        </AreaProvider>
      </body>
    </html>
  );
}
