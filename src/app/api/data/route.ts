import { NextResponse } from "next/server";
import { closures, dataGenerated } from "@/lib/data";

// Otevřená data: stejná uzavírková data, na kterých běží web, v jednom JSON.
// Zdroje: SITmP (agp.plzen.eu), JSDI ŘSD, plzen.eu/doprava. Data podléhají
// licenčním podmínkám původních zdrojů (viz /zdroje-a-licence), kód MIT.
//
// Data se mění 1× denně (ranní cron), takže odpověď smí agresivně cachovat
// CDN a klienti ji nemusí stahovat opakovaně.

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      generated: dataGenerated,
      source: "https://plzenskaunikovka.cz",
      repo: "https://github.com/ods-plzen/plzenska-unikovka",
      licence:
        "Kód MIT. Data podléhají podmínkám původních zdrojů — viz https://plzenskaunikovka.cz/zdroje-a-licence",
      count: closures.length,
      closures,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600, s-maxage=21600",
      },
    },
  );
}
