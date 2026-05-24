import { motion } from "framer-motion";
import type { Product } from "@/lib/useShopData";
import { formatPrice } from "@/lib/format";

function Card({
  product,
  delay,
  liftMiddle,
  onOpen,
}: {
  product: Product;
  delay: number;
  liftMiddle: boolean;
  onOpen: (p: Product) => void;
}) {
  const activePrice = product.offer?.discount_price ?? product.rate;
  const slash = product.offer ? product.rate : product.original_price;
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: liftMiddle ? -20 : 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      onClick={() => onOpen(product)}
      className="w-[340px] shrink-0 cursor-pointer overflow-hidden rounded-3xl"
      style={{
        backgroundColor: "var(--bg-2)",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ aspectRatio: "3/4" }} className="overflow-hidden">
        <img
          src={product.banner_url_1 ?? ""}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display mb-2" style={{ fontSize: 22, lineHeight: 1.15 }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium" style={{ color: "var(--accent)" }}>
            {formatPrice(activePrice)}
          </span>
          {slash && slash > activePrice && (
            <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
              {formatPrice(slash)}
            </span>
          )}
          {product.offer && (
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
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

export function MotionSlider({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  return (
    <div className="relative overflow-x-hidden">
      <div className="flex justify-center gap-6 px-4 py-8 flex-wrap md:flex-nowrap">
        {products.map((p, i) => (
          <Card
            key={p.id}
            product={p}
            delay={i * 0.15}
            liftMiddle={products.length === 3 && i === 1}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  );
}
