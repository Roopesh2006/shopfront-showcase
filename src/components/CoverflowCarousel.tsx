import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/useShopData";
import { formatPrice } from "@/lib/format";

export function CoverflowCarousel({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setActive((p) => (p + 1) % products.length),
      4000
    );
    return () => clearInterval(id);
  }, [paused, products.length]);

  const onCardClick = (i: number, p: Product) => {
    if (i === active) onOpen(p);
    else setActive(i);
  };

  return (
    <div
      className="relative mx-auto"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative h-[520px] w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {products.map((p, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);
          if (abs > 2) return null;
          const activePrice = p.offer?.discount_price ?? p.rate;
          return (
            <motion.div
              key={p.id}
              animate={{
                x: offset * 260,
                z: offset === 0 ? 0 : -120,
                rotateY: Math.max(-60, Math.min(60, offset * -30)),
                scale: offset === 0 ? 1 : 1 - abs * 0.12,
                opacity: 1 - abs * 0.25,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={() => onCardClick(i, p)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer overflow-hidden rounded-3xl"
              style={{
                width: 320,
                height: 460,
                backgroundColor: "var(--bg-2)",
                border: "1px solid var(--border)",
                zIndex: 10 - abs,
                transformStyle: "preserve-3d",
                boxShadow:
                  offset === 0
                    ? "0 30px 60px -20px rgba(201,169,110,0.35)"
                    : "0 20px 40px -20px rgba(0,0,0,0.6)",
              }}
            >
              <div style={{ height: 340 }} className="overflow-hidden">
                <img
                  src={p.banner_url_1 ?? ""}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3
                  className="font-display mb-2 line-clamp-1"
                  style={{ fontSize: 20, lineHeight: 1.2 }}
                >
                  {p.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--accent)" }} className="text-lg font-medium">
                    {formatPrice(activePrice)}
                  </span>
                  {p.offer && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                    >
                      SALE
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={() => setActive((p) => (p - 1 + products.length) % products.length)}
        className="absolute left-4 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "var(--accent)" }}
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={() => setActive((p) => (p + 1) % products.length)}
        className="absolute right-4 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "var(--accent)" }}
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      <div className="mt-8 flex justify-center gap-2">
        {products.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(i)}
            animate={{
              width: i === active ? 10 : 6,
              height: i === active ? 10 : 6,
              backgroundColor:
                i === active ? "var(--accent)" : "rgba(255,255,255,0.2)",
            }}
            className="rounded-full"
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
