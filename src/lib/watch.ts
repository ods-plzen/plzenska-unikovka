// Malý externí store nad localStorage pro „hlídané" ulice.
// Díky useSyncExternalStore čteme klientskou hodnotu bez setState-v-efektu.

const KEY = "pp.watch";
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export function toggleWatch(id: string) {
  const list = read();
  write(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
}

export function subscribeWatch(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

// Snapshot jednoho id (stabilní boolean pro useSyncExternalStore).
export function isWatched(id: string) {
  return read().includes(id);
}
