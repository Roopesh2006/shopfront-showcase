import { AnimatePresence, motion } from "framer-motion";
import { Mail, MessageCircle, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Product, Shop } from "@/lib/useShopData";
import { formatPrice } from "@/lib/format";
import { CountdownTimer } from "./CountdownTimer";
import { LiveViewers } from "./LiveViewers";

export function ProductModal({
  product,
  shop,
  onClose,
}: {
  product: Product | null;
  shop: Shop;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[960px] max-h-[90vh] overflow-y-auto rounded-3xl"
            style={{
              backgroundColor: "var(--bg-2)",
              border: "1px solid var(--border)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
              style={{ color: "var(--text)" }}
              aria-label="Close"
            >
              <X size={22} />
            </button>

            <div className="grid gap-0 md:grid-cols-2">
              <div className="overflow-hidden md:rounded-l-3xl">
                <img
                  src={product.banner_url_1 ?? ""}
                  alt={product.name}
                  className="h-full w-full object-cover aspect-square"
                />
              </div>
              <ModalDetails product={product} shop={shop} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ModalDetails({ product, shop }: { product: Product; shop: Shop }) {
  const activePrice = product.offer?.discount_price ?? product.rate;
  const slashPrice = product.offer ? product.rate : product.original_price;
  const discountPct =
    slashPrice && slashPrice > activePrice
      ? Math.round(((slashPrice - activePrice) / slashPrice) * 100)
      : 0;

  const waMessage = `Hi! I found *${product.name}* on ${shop.name}'s page and I'm interested. Could you share more details about availability and how to order?`;
  const waHref = shop.shop_phone_number
    ? `https://wa.me/${shop.shop_phone_number.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`
    : "#";

  const mailSubject = `Enquiry: ${product.name}`;
  const mailBody = `Hi, I'm interested in ${product.name} from ${shop.name}. Please share more details.`;
  const mailHref = shop.shop_email
    ? `mailto:${shop.shop_email}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : "#";

  return (
    <div className="flex flex-col gap-5 p-6 md:p-10">
      <p
        className="text-xs uppercase tracking-[0.18em]"
        style={{ color: "var(--text-muted)" }}
      >
        {shop.name}
      </p>
      <h2
        className="font-display"
        style={{ fontSize: "clamp(26px, 4vw, 38px)", lineHeight: 1.1, letterSpacing: "-0.02em" }}
      >
        {product.name}
      </h2>

      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className="text-3xl font-semibold"
          style={{ color: "var(--accent)" }}
        >
          {formatPrice(activePrice)}
        </span>
        {slashPrice && slashPrice > activePrice && (
          <span
            className="text-lg line-through"
            style={{ color: "var(--text-muted)" }}
          >
            {formatPrice(slashPrice)}
          </span>
        )}
        {product.offer && discountPct > 0 && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{ backgroundColor: "var(--danger)", color: "#fff" }}
          >
            -{discountPct}% SALE
          </span>
        )}
      </div>

      {product.offer && <CountdownTimer expiresAt={product.offer.expires_at} />}
      <LiveViewers productId={product.id} />

      {product.description && (
        <p
          className="leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {product.description}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl py-4 font-medium text-white transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: "var(--wa-green)",
            boxShadow: "0 8px 24px rgba(37,211,102,0.25)",
          }}
        >
          <MessageCircle size={20} />
          Enquire via WhatsApp
        </a>
        <a
          href={mailHref}
          className="flex items-center justify-center gap-2 rounded-2xl py-4 font-medium transition-colors hover:bg-white/5"
          style={{
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        >
          <Mail size={20} />
          Send Email Enquiry
        </a>
      </div>
    </div>
  );
}
