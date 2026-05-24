import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: "var(--accent)" }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Loading…
      </p>
    </div>
  );
}

export function ErrorScreen({ message }: { message?: string }) {
  const WA = "+916380691764";
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <h1
        className="font-display"
        style={{ fontSize: "clamp(40px, 6vw, 64px)", letterSpacing: "-0.02em" }}
      >
        Shop not found
      </h1>
      <p className="mt-4 max-w-md" style={{ color: "var(--text-muted)" }}>
        {message ?? "We couldn't find this storefront. Want one of your own?"}
      </p>
      <a
        href={`https://wa.me/${WA.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 rounded-2xl px-6 py-3 font-medium text-white"
        style={{ backgroundColor: "var(--wa-green)" }}
      >
        Message us on WhatsApp
      </a>
    </div>
  );
}
