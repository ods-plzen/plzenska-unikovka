import type { Metadata, Viewport } from "next";
import { Oswald, Libre_Franklin, Newsreader } from "next/font/google";
import "./globals.css";
import { AreaProvider } from "@/components/AreaProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plzen-prehledne.vercel.app"),
  title: "Plzeň přehledně — od ODS",
  description:
    "Uzavírky, rozhodnutí zastupitelstva, stavby a komunitní informace pro všech 10 plzeňských obvodů na jednom místě.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Plzeň přehledně" },
  openGraph: {
    title: "Plzeň přehledně — od ODS",
    description:
      "Uzavírky, zastupitelstvo, stavby a komunita pro všech 10 plzeňských obvodů na jednom místě.",
    siteName: "Plzeň přehledně",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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
    <html
      lang="cs"
      className={`${franklin.variable} ${oswald.variable} ${newsreader.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AreaProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <Footer />
        </AreaProvider>
      </body>
    </html>
  );
}
