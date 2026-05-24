import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function verifyMasterKey(key: string | undefined, providedKey: string) {
  if (!key || providedKey !== key) throw new Error("Unauthorized: invalid master key");
}

export const getAllShops = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ masterKey: z.string() }).parse(d))
  .handler(async ({ data }) => {
    verifyMasterKey(process.env.ADMIN_MASTER_KEY, data.masterKey);
    const { data: shops, error } = await admin
      .from("lp_shop")
      .select("id, name, slug, shop_phone_number, shop_email, banner_url_1, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to fetch shops");
    return shops;
  });

export const createShop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        masterKey: z.string(),
        name: z.string().min(1),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        shop_phone_number: z.string().min(1),
        shop_email: z.string().email(),
        password: z.string().min(8),
        banner_url_1: z.string().nullable(),
        banner_url_2: z.string().nullable(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    verifyMasterKey(process.env.ADMIN_MASTER_KEY, data.masterKey);

    const { data: existing } = await admin.from("lp_shop").select("id").eq("slug", data.slug).maybeSingle();
    if (existing) throw new Error("Slug already in use");

    const hash = await bcrypt.hash(data.password, 12);
    const { error } = await admin.from("lp_shop").insert({
      name: data.name,
      slug: data.slug,
      shop_phone_number: data.shop_phone_number,
      shop_email: data.shop_email,
      admin_password_hash: hash,
      banner_url_1: data.banner_url_1,
      banner_url_2: data.banner_url_2,
    });
    if (error) throw new Error("Failed to create shop: " + error.message);
    return { ok: true };
  });

export const resetShopPassword = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ masterKey: z.string(), shopId: z.string(), newPassword: z.string().min(8) }).parse(d)
  )
  .handler(async ({ data }) => {
    verifyMasterKey(process.env.ADMIN_MASTER_KEY, data.masterKey);
    const hash = await bcrypt.hash(data.newPassword, 12);
    const { error } = await admin.from("lp_shop").update({ admin_password_hash: hash }).eq("id", data.shopId);
    if (error) throw new Error("Failed to reset password");
    return { ok: true };
  });

export const deleteShop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ masterKey: z.string(), shopId: z.string(), slug: z.string() }).parse(d)
  )
  .handler(async ({ data }) => {
    verifyMasterKey(process.env.ADMIN_MASTER_KEY, data.masterKey);
    const { data: shop } = await admin.from("lp_shop").select("slug").eq("id", data.shopId).maybeSingle();
    if (!shop || shop.slug !== data.slug) throw new Error("Slug mismatch");

    const { error } = await admin.from("lp_shop").delete().eq("id", data.shopId);
    if (error) throw new Error("Failed to delete shop");
    return { ok: true };
  });
