import { motion } from "framer-motion";
import type { Product } from "@/lib/useShopData";
import { SingleProduct } from "./SingleProduct";
import { MotionSlider } from "./MotionSlider";
import { CoverflowCarousel } from "./CoverflowCarousel";

export function ProductsSection({
  products,
  onOpen,
}: {
  products: Product[];
  onOpen: (p: Product) => void;
}) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display"
          style={{ fontSize: "clamp(32px, 5vw, 48px)", letterSpacing: "-0.02em" }}
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

      {products.length === 1 && (
        <SingleProduct product={products[0]} onOpen={onOpen} />
      )}
      {(products.length === 2 || products.length === 3) && (
        <MotionSlider products={products} onOpen={onOpen} />
      )}
      {products.length >= 4 && (
        <CoverflowCarousel products={products} onOpen={onOpen} />
      )}
    </section>
  );
}
