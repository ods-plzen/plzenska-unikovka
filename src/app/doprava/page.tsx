import type { Metadata } from "next";
import { DopravaView } from "@/components/views/DopravaView";

export const metadata: Metadata = {
  title: "Doprava a uzavírky",
  description:
    "Aktivní uzavírky v Plzni, MHD odklony a dočasné zastávky. Data z plzen.eu a PMDP aktualizovaná denně.",
};

export default function Page() {
  return <DopravaView />;
}
