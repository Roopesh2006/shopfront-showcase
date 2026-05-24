import { motion } from "framer-motion";
import type { Product } from "@/lib/useShopData";
import { formatPrice } from "@/lib/format";

export function SingleProduct({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  const activePrice = product.offer?.discount_price ?? product.rate;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-[600px]"
    >
      <div
        className="overflow-hidden rounded-3xl"
        style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <div style={{ aspectRatio: "4/5" }} className="overflow-hidden">
          <img
            src={product.banner_url_1 ?? ""}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
        <div className="p-8 text-center">
          <h3 className="font-display mb-3" style={{ fontSize: 36, lineHeight: 1.1 }}>
            {product.name}
          </h3>
          <p className="mb-6 text-2xl" style={{ color: "var(--accent)" }}>
            {formatPrice(activePrice)}
          </p>
          <button
            onClick={() => onOpen(product)}
            className="rounded-2xl px-8 py-4 font-medium transition-all hover:-translate-y-0.5"
            style={{
              backgroundColor: "var(--accent)",
              color: "#0a0a0a",
            }}
          >
            View Product
          </button>
        </div>
      </div>
    </motion.div>
  );
}
