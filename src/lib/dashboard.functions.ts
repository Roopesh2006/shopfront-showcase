import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function assertShop(shopId: string, shopSlug: string) {
  const { data } = await admin
    .from("lp_shop")
    .select("id, slug")
    .eq("id", shopId)
    .eq("slug", shopSlug)
    .maybeSingle();
  if (!data) throw new Error("Unauthorized");
  return data.id;
}

// === SETTINGS ===
export const getShopSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ shopId: z.string(), shopSlug: z.string() }).parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { data: shop, error } = await admin
      .from("lp_shop")
      .select("id, name, slug, shop_phone_number, shop_email, banner_url_1, banner_url_2")
      .eq("id", data.shopId)
      .maybeSingle();
    if (error) throw new Error("Failed to fetch shop");
    return shop;
  });

export const updateShopSettings = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        shopId: z.string(),
        shopSlug: z.string(),
        name: z.string().min(1),
        shop_phone_number: z.string().nullable(),
        shop_email: z.string().nullable(),
        banner_url_1: z.string().nullable(),
        banner_url_2: z.string().nullable(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { error } = await admin
      .from("lp_shop")
      .update({
        name: data.name,
        shop_phone_number: data.shop_phone_number,
        shop_email: data.shop_email,
        banner_url_1: data.banner_url_1,
        banner_url_2: data.banner_url_2,
      })
      .eq("id", data.shopId);
    if (error) throw new Error("Failed to update shop");
    return { ok: true };
  });

export const changeShopPassword = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        shopId: z.string(),
        shopSlug: z.string(),
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const { data: shop } = await admin
      .from("lp_shop")
      .select("id, admin_password_hash")
      .eq("id", data.shopId)
      .maybeSingle();
    if (!shop) throw new Error("Unauthorized");

    const ok = await bcrypt.compare(data.currentPassword, shop.admin_password_hash);
    if (!ok) throw new Error("Current password is incorrect");

    const newHash = await bcrypt.hash(data.newPassword, 12);
    const { error } = await admin
      .from("lp_shop")
      .update({ admin_password_hash: newHash })
      .eq("id", data.shopId);
    if (error) throw new Error("Failed to update password");
    return { ok: true };
  });

// === INVENTORY ===
export const getProducts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ shopId: z.string(), shopSlug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { data: products, error } = await admin
      .from("lp_products")
      .select("*")
      .eq("shop_id", data.shopId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Failed to fetch products");
    return products;
  });

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        shopId: z.string(),
        shopSlug: z.string(),
        name: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        description: z.string().nullable(),
        rate: z.number().positive(),
        original_price: z.number().nullable(),
        category: z.string().nullable(),
        sort_order: z.number(),
        banner_url_1: z.string().nullable(),
        banner_url_2: z.string().nullable(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { error } = await getAdmin().from("lp_products").insert({
      shop_id: data.shopId,
      name: data.name,
      slug: data.slug,
      description: data.description,
      rate: data.rate,
      original_price: data.original_price,
      category: data.category,
      sort_order: data.sort_order,
      banner_url_1: data.banner_url_1,
      banner_url_2: data.banner_url_2,
    });
    if (error) throw new Error("Failed to create product: " + error.message);
    return { ok: true };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        shopId: z.string(),
        shopSlug: z.string(),
        productId: z.string(),
        name: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        description: z.string().nullable(),
        rate: z.number().positive(),
        original_price: z.number().nullable(),
        category: z.string().nullable(),
        sort_order: z.number(),
        banner_url_1: z.string().nullable(),
        banner_url_2: z.string().nullable(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { error } = await admin
      .from("lp_products")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        rate: data.rate,
        original_price: data.original_price,
        category: data.category,
        sort_order: data.sort_order,
        banner_url_1: data.banner_url_1,
        banner_url_2: data.banner_url_2,
      })
      .eq("id", data.productId)
      .eq("shop_id", data.shopId);
    if (error) throw new Error("Failed to update product");
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ shopId: z.string(), shopSlug: z.string(), productId: z.string() }).parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { error } = await admin
      .from("lp_products")
      .delete()
      .eq("id", data.productId)
      .eq("shop_id", data.shopId);
    if (error) throw new Error("Failed to delete product");
    return { ok: true };
  });

// === OFFERS ===
export const getOffers = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ shopId: z.string(), shopSlug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { data: products, error } = await admin
      .from("lp_products")
      .select("id, name, slug, banner_url_1, rate, original_price")
      .eq("shop_id", data.shopId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error("Failed to fetch products");

    const productIds = products.map((p) => p.id);
    const { data: offers, error: offerErr } = await admin
      .from("lp_offers")
      .select("*")
      .in("product_id", productIds);
    if (offerErr) throw new Error("Failed to fetch offers");

    const now = new Date().toISOString();
    const result = products.map((p) => {
      const offer = offers?.find((o) => o.product_id === p.id);
      const isActive = offer && new Date(offer.expires_at) > new Date(now);
      return { ...p, offer, offerStatus: isActive ? "active" : offer ? "expired" : "none" };
    });
    return result;
  });

export const setOffer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        shopId: z.string(),
        shopSlug: z.string(),
        productId: z.string(),
        discount_price: z.number().positive(),
        expires_at: z.string(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { data: existing } = await admin
      .from("lp_offers")
      .select("id")
      .eq("product_id", data.productId)
      .maybeSingle();

    let error;
    if (existing) {
      const result = await admin
        .from("lp_offers")
        .update({ discount_price: data.discount_price, expires_at: data.expires_at })
        .eq("id", existing.id);
      error = result.error;
    } else {
      const result = await getAdmin().from("lp_offers").insert({
        product_id: data.productId,
        discount_price: data.discount_price,
        expires_at: data.expires_at,
      });
      error = result.error;
    }
    if (error) throw new Error("Failed to set offer");
    return { ok: true };
  });

export const removeOffer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ shopId: z.string(), shopSlug: z.string(), productId: z.string() }).parse(d)
  )
  .handler(async ({ data }) => {
    await assertShop(data.shopId, data.shopSlug);
    const { error } = await getAdmin().from("lp_offers").delete().eq("product_id", data.productId);
    if (error) throw new Error("Failed to remove offer");
    return { ok: true };
  });
