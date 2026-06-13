// Kontaktní napojení na WhatsApp (click-to-chat, bez backendu).
// Doplň reálné údaje — než je doplníš, formulář funguje přes „Zkopírovat".

// Telefon ve formátu pro wa.me: jen číslice s předvolbou, bez +, mezer a 00.
// Příklad pro ČR: "420777123456". Prázdné = WhatsApp tlačítko se skryje.
export const WHATSAPP_PHONE = "";

// Odkaz na pozvánku do WhatsApp skupiny (https://chat.whatsapp.com/...).
// Prázdné = blok skupiny se skryje.
export const WHATSAPP_GROUP = "";

export function waMeUrl(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
