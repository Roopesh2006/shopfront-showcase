import { AnimatePresence, motion } from "framer-motion";
import { useCountdown } from "@/lib/useCountdown";

function Box({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-11 w-12 sm:h-14 sm:w-16 items-center justify-center overflow-hidden rounded-lg sm:rounded-xl"
        style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)" }}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-lg sm:text-2xl font-semibold tabular-nums"
            style={{ color: "var(--accent)" }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const { hh, mm, ss, expired } = useCountdown(expiresAt);
  if (expired) {
    return (
      <p className="font-medium" style={{ color: "var(--danger)" }}>
        Offer ended
      </p>
    );
  }
  return (
    <div className="flex items-end gap-3">
      <Box value={hh} label="Hrs" />
      <Box value={mm} label="Min" />
      <Box value={ss} label="Sec" />
    </div>
  );
}
