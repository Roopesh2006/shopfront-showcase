import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const loginShop = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ slug: z.string().min(1), password: z.string().min(1) }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: shop, error } = await adminSupabase
      .from("lp_shop")
      .select("id, name, slug, admin_password_hash")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error("Database error");
    if (!shop) throw new Error("Invalid credentials");

    const ok = await bcrypt.compare(data.password, shop.admin_password_hash);
    if (!ok) throw new Error("Invalid credentials");

    return { shopId: shop.id, shopSlug: shop.slug, shopName: shop.name };
  });

export const loginAdmin = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ masterKey: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env.ADMIN_MASTER_KEY;
    if (!key || data.masterKey !== key) throw new Error("Invalid master key");
    return { ok: true };
  });
