import { motion } from "framer-motion";
import type { Product } from "@/lib/useShopData";
import { formatPrice } from "@/lib/format";

function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: Product;
  index: number;
  onOpen: (p: Product) => void;
}) {
  const activePrice = product.offer?.discount_price ?? product.rate;
  const slashPrice = product.offer ? product.rate : product.original_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      onClick={() => onOpen(product)}
      className="cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl"
      style={{
        backgroundColor: "var(--bg-2)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="overflow-hidden">
        <img
          src={product.banner_url_1 ?? ""}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
          style={{ aspectRatio: "4/5" }}
          loading="lazy"
        />
      </div>
      <div className="p-4 sm:p-5">
        <h3
          className="font-display mb-2 line-clamp-2"
          style={{ fontSize: "clamp(16px, 2.5vw, 22px)", lineHeight: 1.2 }}
        >
          {product.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base sm:text-lg font-medium" style={{ color: "var(--accent)" }}>
            {formatPrice(activePrice)}
          </span>
          {slashPrice && slashPrice > activePrice && (
            <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
              {formatPrice(slashPrice)}
            </span>
          )}
          {product.offer && (
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
}

export function ProductsSection({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
      <div className="mb-10 sm:mb-16 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display"
          style={{ fontSize: "clamp(28px, 5vw, 48px)", letterSpacing: "-0.02em" }}
        >
          Our Collection
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: 60 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto mt-4 h-[3px]"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
