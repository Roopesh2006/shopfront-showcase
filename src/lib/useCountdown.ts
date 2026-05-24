import { useEffect, useState } from "react";

export function useCountdown(expiresAt: string | null | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return { hh: "00", mm: "00", ss: "00", expired: true };

  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return { hh: "00", mm: "00", ss: "00", expired: true };

  const totalH = Math.floor(diff / 3_600_000);
  const mm = Math.floor((diff % 3_600_000) / 60_000);
  const ss = Math.floor((diff % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hh: pad(totalH), mm: pad(mm), ss: pad(ss), expired: false };
}
