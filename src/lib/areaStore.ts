// Vybraný městský obvod jako externí store nad localStorage.
import { DEFAULT_AREA } from "@/data/areas";

const KEY = "pp.area";
const listeners = new Set<() => void>();

export function getArea(): string {
  try {
    return localStorage.getItem(KEY) || DEFAULT_AREA;
  } catch {
    return DEFAULT_AREA;
  }
}

export function setArea(area: string) {
  try {
    localStorage.setItem(KEY, area);
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function subscribeArea(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
