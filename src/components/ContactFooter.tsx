import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";

const WA = "+916380691764";
const EMAIL = "roopesh5roopesh555@gmail.com";

export function ContactFooter() {
  return (
    <footer
      className="px-4 py-20"
      style={{ backgroundColor: "var(--bg-2)", borderTop: "1px solid var(--border)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <h3
          className="font-display"
          style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em" }}
        >
          Want a landing page like this?
        </h3>
        <p className="mt-3" style={{ color: "var(--text-muted)" }}>
          Get in touch to set up your own storefront in minutes.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
            href={`https://wa.me/${WA.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl px-5 sm:px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 text-sm sm:text-base"
            style={{
              backgroundColor: "var(--wa-green)",
              boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
            }}
          >
            <MessageCircle size={18} />
            <span className="truncate">WhatsApp: {WA}</span>
          </motion.a>
          <motion.a
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            href={`mailto:${EMAIL}`}
            className="flex items-center justify-center gap-2 rounded-2xl px-5 sm:px-6 py-3 font-medium transition-colors hover:bg-white/5 text-sm sm:text-base"
            style={{ border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <Mail size={18} />
            <span className="truncate">{EMAIL}</span>
          </motion.a>
        </div>

        <div
          className="mx-auto mt-12 h-px max-w-md"
          style={{ backgroundColor: "var(--border)" }}
        />
        <p className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
          © 2025 SELLERPRODUCT · Built by Roopesh
        </p>
      </motion.div>
    </footer>
  );
}
