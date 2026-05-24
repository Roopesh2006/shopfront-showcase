import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Offer = {
  id: string;
  product_id: string;
  discount_price: number;
  expires_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rate: number;
  original_price: number | null;
  banner_url_1: string | null;
  banner_url_2: string | null;
  category: string | null;
  offer: Offer | null;
};

export type Shop = {
  id: string;
  name: string;
  slug: string;
  shop_phone_number: string | null;
  shop_email: string | null;
  banner_url_1: string | null;
  banner_url_2: string | null;
};

const SHOP_SLUG = import.meta.env.VITE_SHOP_SLUG || "rohan-electronics";

export function useShopData() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: shopData, error: shopErr } = await supabase
          .from("lp_shop")
          .select("id, name, slug, shop_phone_number, shop_email, banner_url_1, banner_url_2")
          .eq("slug", SHOP_SLUG)
          .maybeSingle();
        if (shopErr) throw shopErr;
        if (!shopData) {
          if (!cancelled) {
            setError("Shop not found");
            setLoading(false);
          }
          return;
        }

        const { data: productsData, error: prodErr } = await supabase
          .from("lp_products")
          .select("id, name, slug, description, rate, original_price, banner_url_1, banner_url_2, category")
          .eq("shop_id", shopData.id)
          .order("sort_order", { ascending: true });
        if (prodErr) throw prodErr;

        const ids = (productsData ?? []).map((p) => p.id);
        let offers: Offer[] = [];
        if (ids.length > 0) {
          const { data: offersData, error: offErr } = await supabase
            .from("lp_offers")
            .select("id, product_id, discount_price, expires_at")
            .in("product_id", ids)
            .gt("expires_at", new Date().toISOString());
          if (offErr) throw offErr;
          offers = offersData ?? [];
        }

        const enriched: Product[] = (productsData ?? []).map((p) => ({
          ...p,
          offer: offers.find((o) => o.product_id === p.id) ?? null,
        }));

        if (!cancelled) {
          setShop(shopData as Shop);
          setProducts(enriched);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? "Failed to load shop");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { shop, products, loading, error };
}
