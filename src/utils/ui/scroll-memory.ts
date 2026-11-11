const KEY = "kerben-list-scroll";
const MAX_AGE_MS = 30 * 60 * 1000;

interface Saved {
  path: string;
  y: number;
  at: number;
}

export function rememberScroll() {
  try {
    const saved: Saved = { path: window.location.pathname + window.location.search, y: window.scrollY, at: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
  }
}

export function forgetScroll() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
  }
}

export function takeScroll(path: string): number | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    if (saved.path !== path) return null;
    sessionStorage.removeItem(KEY);
    return Date.now() - saved.at < MAX_AGE_MS && saved.y > 0 ? saved.y : null;
  } catch {
    return null;
  }
}

export function restoreScroll(y: number) {
  let frames = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  window.addEventListener("wheel", stop, { once: true, passive: true });
  window.addEventListener("touchstart", stop, { once: true, passive: true });
  const step = () => {
    if (stopped) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: Math.min(y, max), behavior: "instant" });
    if (max < y && frames++ < 90) requestAnimationFrame(step);
    else {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
    }
  };
  step();
}
