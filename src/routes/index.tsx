import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useShopData, type Product } from "@/lib/useShopData";
import { BannerSection } from "@/components/BannerSection";
import { ProductsSection } from "@/components/ProductsSection";
import { ProductModal } from "@/components/ProductModal";
import { ContactFooter } from "@/components/ContactFooter";
import { ErrorScreen, LoadingScreen } from "@/components/LoadingScreen";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Shop · Premium Landing Page" },
      {
        name: "description",
        content:
          "A premium storefront landing page — explore the collection, view live offers, and enquire directly via WhatsApp.",
      },
    ],
  }),
});

function Index() {
  const { shop, products, loading, error } = useShopData();
  const [modalProduct, setModalProduct] = useState<Product | null>(null);

  if (loading) return <LoadingScreen />;
  if (error || !shop) return <ErrorScreen message={error ?? undefined} />;

  return (
    <main style={{ backgroundColor: "var(--bg)" }}>
      <BannerSection shop={shop} />
      <ProductsSection products={products} onOpen={setModalProduct} />
      <ContactFooter />
      <ProductModal
        product={modalProduct}
        shop={shop}
        onClose={() => setModalProduct(null)}
      />
    </main>
  );
}
