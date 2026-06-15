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

const SITE_URL = "https://plzenskaunikovka.cz";
const SITE_NAME = "Plzeňská únikovka";
const SITE_DESCRIPTION =
  "Únikovka z plzeňského dopravního chaosu. Mapa uzavírek, MHD odklony a dočasné zastávky pro všech 10 plzeňských obvodů. Data z plzen.eu a PMDP aktualizovaná denně.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: SITE_NAME },
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "cs_CZ",
    type: "website",
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
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
