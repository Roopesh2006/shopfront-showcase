import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getShopSettings, updateShopSettings, changeShopPassword, getProducts, createProduct, updateProduct, deleteProduct, getOffers, setOffer, removeOffer } from "@/lib/dashboard.functions";
import { Settings, Package, Tag, LogOut, Upload, Save, Plus, CreditCard as Edit3, Trash2, X, CircleAlert as AlertCircle, Check, Clock } from "lucide-react";
import { useCountdown } from "@/lib/useCountdown";

type Session = { shopId: string; shopSlug: string; shopName: string } | null;

function getSession(): Session {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sp.session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Shop Dashboard" }],
  }),
});

type Tab = "settings" | "inventory" | "offers";

function DashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>(null);
  const [tab, setTab] = useState<Tab>("settings");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate({ to: "/login" });
      return;
    }
    setSession(s);
    setChecking(false);
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("sp.session");
    navigate({ to: "/login" });
  };

  if (checking || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
    { id: "inventory", label: "Inventory", icon: <Package size={20} /> },
    { id: "offers", label: "Offers", icon: <Tag size={20} /> },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r md:flex" style={{ backgroundColor: "var(--bg-2)", borderColor: "var(--border)" }}>
        <div className="border-b p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-display text-lg" style={{ fontSize: 20 }}>
            {session.shopName}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {session.shopSlug}
          </p>
        </div>

        <nav className="flex-1 p-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-all"
              style={{
                backgroundColor: tab === t.id ? "var(--accent)" : "transparent",
                color: tab === t.id ? "#0a0a0a" : "var(--text)",
              }}
            >
              {t.icon}
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all hover:bg-white/5"
            style={{ color: "var(--danger)" }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Bottom Tabs - Mobile */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{ backgroundColor: "var(--bg-2)", borderTop: "1px solid var(--border)" }}
      >
        <div className="flex justify-around py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-1 px-4 py-2"
              style={{ color: tab === t.id ? "var(--accent)" : "var(--text-muted)" }}
            >
              {t.icon}
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 px-4 py-2"
            style={{ color: "var(--danger)" }}
          >
            <LogOut size={20} />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:ml-0">
        <AnimatePresence mode="wait">
          {tab === "settings" && <SettingsTab key="settings" session={session} />}
          {tab === "inventory" && <InventoryTab key="inventory" session={session} />}
          {tab === "offers" && <OffersTab key="offers" session={session} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// === SETTINGS TAB ===
function SettingsTab({ session }: { session: NonNullable<Session> }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [pwForm, setPwForm] = useState({ current: "", new: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const fileInput1 = useRef<HTMLInputElement>(null);
  const fileInput2 = useRef<HTMLInputElement>(null);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getShopSettings({ data: { shopId: session.shopId, shopSlug: session.shopSlug } });
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const upload = async (file: File, bannerNum: 1 | 2) => {
    const setUploading = bannerNum === 1 ? setUploading1 : setUploading2;
    const ref = bannerNum === 1 ? fileInput1 : fileInput2;
    setUploading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const path = `lp-assets/${session.shopSlug}/banners/banner_${bannerNum}`;
      const { error } = await supabase.storage.from("lp-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from("lp-assets").getPublicUrl(path);
      const url = publicUrl.publicUrl;
      await updateShopSettings({ data: {
        ...data,
        shopId: session.shopId,
        shopSlug: session.shopSlug,
        [`banner_url_${bannerNum}`]: url,
      } });
      setData((d: any) => ({ ...d, [`banner_url_${bannerNum}`]: url }));
    } catch (e: any) {
      alert("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setData((d: any) => ({ ...d, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateShopSettings({ data: {
        shopId: session.shopId,
        shopSlug: session.shopSlug,
        name: data.name,
        shop_phone_number: data.shop_phone_number,
        shop_email: data.shop_email,
        banner_url_1: data.banner_url_1,
        banner_url_2: data.banner_url_2,
      } });
      alert("Settings saved!");
    } catch (e: any) {
      alert("Failed to save: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.new.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwError("Passwords do not match");
      return;
    }
    try {
      await changeShopPassword({ data: {
        shopId: session.shopId,
        shopSlug: session.shopSlug,
        currentPassword: pwForm.current,
        newPassword: pwForm.new,
      } });
      setPwForm({ current: "", new: "", confirm: "" });
      setPwSuccess(true);
    } catch (e: any) {
      setPwError(e.message || "Failed to change password");
    }
  };

  if (loading || !data) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center p-8">
        <p style={{ color: "var(--text-muted)" }}>Loading settings...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto max-w-3xl p-6 md:p-10"
    >
      <h1 className="font-display mb-8" style={{ fontSize: 32 }}>
        Settings
      </h1>

      {/* Shop Info */}
      <section className="mb-10 space-y-5">
        <div>
          <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
            Shop Name
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
            WhatsApp Number
          </label>
          <input
            type="text"
            value={data.shop_phone_number || ""}
            onChange={(e) => handleChange("shop_phone_number", e.target.value)}
            placeholder="+919876543210"
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <input
            type="email"
            value={data.shop_email || ""}
            onChange={(e) => handleChange("shop_email", e.target.value)}
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-2xl px-6 py-4 font-medium"
          style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      {/* Banners */}
      <section className="mb-10">
        <h2 className="mb-5 font-display" style={{ fontSize: 24 }}>
          Banners
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((num) => {
            const ref = num === 1 ? fileInput1 : fileInput2;
            const uploading = num === 1 ? uploading1 : uploading2;
            const url = data[`banner_url_${num}`];
            return (
              <div key={num}>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  Banner {num}
                </label>
                <div
                  className="relative overflow-hidden rounded-2xl"
                  style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
                >
                  {url ? (
                    <img src={url} alt={`Banner ${num}`} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center" style={{ color: "var(--text-muted)" }}>
                      No banner uploaded
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={ref}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) upload(file, num as 1 | 2);
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => ref.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                  >
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Password */}
      <section>
        <h2 className="mb-5 font-display" style={{ fontSize: 24 }}>
          Change Password
        </h2>
        <div className="space-y-4">
          <input
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            placeholder="Current password"
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <input
            type="password"
            value={pwForm.new}
            onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
            placeholder="New password (min 8 chars)"
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          <input
            type="password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            placeholder="Confirm new password"
            className="w-full rounded-2xl px-5 py-4 outline-none"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text)" }}
          />
          {pwError && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
              <AlertCircle size={18} style={{ color: "var(--danger)" }} />
              <span className="text-sm" style={{ color: "var(--danger)" }}>
                {pwError}
              </span>
            </div>
          )}
          {pwSuccess && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
              <Check size={18} style={{ color: "#22c55e" }} />
              <span className="text-sm" style={{ color: "#22c55e" }}>
                Password changed successfully
              </span>
            </div>
          )}
          <button
            onClick={handlePasswordChange}
            disabled={!pwForm.current || !pwForm.new || !pwForm.confirm}
            className="flex items-center gap-2 rounded-2xl px-6 py-4 font-medium disabled:opacity-50"
            style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
          >
            <Lock size={18} />
            Update Password
          </button>
        </div>
      </section>
    </motion.div>
  );
}

// === INVENTORY TAB ===
function InventoryTab({ session }: { session: NonNullable<Session> }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getProducts({ data: { shopId: session.shopId, shopSlug: session.shopSlug } });
        setProducts(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const refresh = async () => {
    const res = await getProducts({ data: { shopId: session.shopId, shopSlug: session.shopSlug } });
    setProducts(res || []);
  };

  const handleDelete = async () => {
    if (deleteInput !== deleteConfirm) {
      alert("Product name does not match");
      return;
    }
    try {
      await deleteProduct({ data: { shopId: session.shopId, shopSlug: session.shopSlug, productId: deleteConfirm! } });
      setProducts(products.filter((p) => p.id !== deleteConfirm));
      setDeleteConfirm(null);
      setDeleteInput("");
    } catch (e: any) {
      alert("Failed to delete: " + (e.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center p-8">
        <p style={{ color: "var(--text-muted)" }}>Loading inventory...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10"
    >
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display" style={{ fontSize: 32 }}>
          Inventory
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2 rounded-2xl px-5 py-3 font-medium"
          style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl" style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Product
              </th>
              <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Price
              </th>
              <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Category
              </th>
              <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Offer
              </th>
              <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    {p.banner_url_1 ? (
                      <img src={p.banner_url_1} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-lg"
                        style={{ backgroundColor: "var(--bg-3)" }}
                      >
                        <Package size={20} style={{ color: "var(--text-muted)" }} />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {p.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">₹{p.rate.toLocaleString()}</td>
                <td className="p-4">{p.category || "-"}</td>
                <td className="p-4">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: p.offerStatus === "active"
                        ? "var(--accent)"
                        : p.offerStatus === "expired"
                        ? "var(--danger)"
                        : "var(--bg-3)",
                      color: p.offerStatus === "active" ? "#0a0a0a" : p.offerStatus === "expired" ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {p.offerStatus === "active"
                      ? "Active"
                      : p.offerStatus === "expired"
                      ? "Expired"
                      : "No offer"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setDrawerOpen(true);
                      }}
                      className="rounded-xl p-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="rounded-xl p-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--danger)" }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Drawer */}
      <ProductDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
        }}
        session={session}
        product={editingProduct}
        onSave={refresh}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setDeleteConfirm(null);
              setDeleteInput("");
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-8"
              style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
            >
              <h2 className="font-display mb-4" style={{ fontSize: 24 }}>
                Delete Product
              </h2>
              <p className="mb-6" style={{ color: "var(--text-muted)" }}>
                Type the product name to confirm deletion:
              </p>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="Product name"
                className="mb-4 w-full rounded-2xl px-5 py-4 outline-none"
                style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null);
                    setDeleteInput("");
                  }}
                  className="flex-1 rounded-2xl py-3 font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteInput !== deleteConfirm}
                  className="flex-1 rounded-2xl py-3 font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--danger)", color: "#fff" }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// === OFFERS TAB ===
function OffersTab({ session }: { session: NonNullable<Session> }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerModal, setOfferModal] = useState<string | null>(null);
  const [offerForm, setOfferForm] = useState({ discount_price: "", expires_at: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getOffers({ data: { shopId: session.shopId, shopSlug: session.shopSlug } });
        setProducts(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const refresh = async () => {
    const res = await getOffers({ data: { shopId: session.shopId, shopSlug: session.shopSlug } });
    setProducts(res || []);
  };

  const handleSetOffer = async (productId: string) => {
    setSaving(true);
    try {
      await setOffer({ data: {
          shopId: session.shopId,
          shopSlug: session.shopSlug,
          productId,
          discount_price: parseFloat(offerForm.discount_price),
          expires_at: new Date(offerForm.expires_at).toISOString(),
        } });
      setOfferModal(null);
      setOfferForm({ discount_price: "", expires_at: "" });
      refresh();
    } catch (e: any) {
      alert("Failed to set offer: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOffer = async (productId: string) => {
    if (!confirm("Remove the offer for this product?")) return;
    try {
      await removeOffer({ data: { shopId: session.shopId, shopSlug: session.shopSlug, productId } });
      refresh();
    } catch (e: any) {
      alert("Failed to remove offer: " + (e.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center p-8">
        <p style={{ color: "var(--text-muted)" }}>Loading offers...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10"
    >
      <h1 className="font-display mb-8" style={{ fontSize: 32 }}>
        Offers
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="overflow-hidden rounded-2xl"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
          >
            <div className="h-40 overflow-hidden">
              {p.banner_url_1 ? (
                <img src={p.banner_url_1} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-3)" }}>
                  <Package size={32} style={{ color: "var(--text-muted)" }} />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="mb-1 font-medium">{p.name}</h3>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg font-semibold" style={{ color: "var(--accent)" }}>
                  ₹{p.offer?.discount_price?.toLocaleString() || p.rate.toLocaleString()}
                </span>
                {p.offer && (
                  <span className="text-sm line-through" style={{ color: "var(--text-muted)" }}>
                    ₹{p.rate.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor:
                      p.offerStatus === "active"
                        ? "var(--accent)"
                        : p.offerStatus === "expired"
                        ? "var(--danger)"
                        : "var(--bg-3)",
                    color:
                      p.offerStatus === "active"
                        ? "#0a0a0a"
                        : p.offerStatus === "expired"
                        ? "#fff"
                        : "var(--text-muted)",
                  }}
                >
                  {p.offerStatus === "active"
                    ? "Active"
                    : p.offerStatus === "expired"
                    ? "Expired"
                    : "No offer"}
                </span>
                {p.offerStatus === "active" && p.offer && (
                  <div className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <OfferCountdown expiresAt={p.offer.expires_at} />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOfferModal(p.id)}
                  className="flex-1 rounded-xl py-2 text-sm font-medium"
                  style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                >
                  {p.offer ? "Edit Offer" : "Set Offer"}
                </button>
                {p.offer && (
                  <button
                    onClick={() => handleRemoveOffer(p.id)}
                    className="rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Set Offer Modal */}
      <AnimatePresence>
        {offerModal && (
          <motion.div
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setOfferModal(null);
              setOfferForm({ discount_price: "", expires_at: "" });
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-8"
              style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
            >
              <h2 className="font-display mb-6" style={{ fontSize: 24 }}>
                Set Offer
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    value={offerForm.discount_price}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_price: e.target.value })}
                    placeholder="999"
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={offerForm.expires_at}
                    onChange={(e) => setOfferForm({ ...offerForm, expires_at: e.target.value })}
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setOfferModal(null);
                    setOfferForm({ discount_price: "", expires_at: "" });
                  }}
                  className="flex-1 rounded-2xl py-3 font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSetOffer(offerModal)}
                  disabled={!offerForm.discount_price || !offerForm.expires_at || saving}
                  className="flex-1 rounded-2xl py-3 font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                >
                  {saving ? "Saving..." : "Save Offer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// === HELPER: Offer Countdown with Refresh ===
function OfferCountdown({ expiresAt }: { expiresAt: string }) {
  const { expired } = useCountdown(expiresAt);
  if (expired) {
    return (
      <span style={{ color: "var(--danger)" }}>Offer expired</span>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <Clock size={12} style={{ color: "var(--accent)" }} />
      <span>Ends soon</span>
    </div>
  );
}

// === PRODUCT DRAWER COMPONENT ===
function ProductDrawer({
  open,
  onClose,
  session,
  product,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  session: NonNullable<Session>;
  product: any | null;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    rate: "",
    original_price: "",
    category: "",
    sort_order: "0",
    banner_url_1: "",
    banner_url_2: "",
  });
  const [saving, setSaving] = useState(false);
  const fileInput1 = useRef<HTMLInputElement>(null);
  const fileInput2 = useRef<HTMLInputElement>(null);
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        rate: product.rate?.toString() || "",
        original_price: product.original_price?.toString() || "",
        category: product.category || "",
        sort_order: product.sort_order?.toString() || "0",
        banner_url_1: product.banner_url_1 || "",
        banner_url_2: product.banner_url_2 || "",
      });
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        rate: "",
        original_price: "",
        category: "",
        sort_order: "0",
        banner_url_1: "",
        banner_url_2: "",
      });
    }
  }, [product, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleChange = (field: string, value: string) => {
    setForm((f) => {
      if (field === "name" && !product && !f.slug) {
        return { ...f, name: value, slug: generateSlug(value) };
      }
      return { ...f, [field]: value };
    });
  };

  const upload = async (file: File, bannerNum: 1 | 2) => {
    const setUploading = bannerNum === 1 ? setUploading1 : setUploading2;
    const ref = bannerNum === 1 ? fileInput1 : fileInput2;
    setUploading(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const slug = form.slug || "temp";
      const path = `lp-assets/${session.shopSlug}/products/${slug}_${bannerNum}`;
      const { error } = await supabase.storage.from("lp-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from("lp-assets").getPublicUrl(path);
      handleChange(`banner_url_${bannerNum}`, publicUrl.publicUrl);
    } catch (e: any) {
      alert("Upload failed: " + (e.message || "Unknown error"));
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug.match(/^[a-z0-9-]+$/)) {
      alert("Slug must be lowercase letters, numbers, and hyphens only");
      return;
    }
    setSaving(true);
    try {
      if (product) {
        await updateProduct({ data: {
          shopId: session.shopId,
          shopSlug: session.shopSlug,
          productId: product.id,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          rate: parseFloat(form.rate),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          category: form.category || null,
          sort_order: parseInt(form.sort_order) || 0,
          banner_url_1: form.banner_url_1 || null,
          banner_url_2: form.banner_url_2 || null,
        } });
      } else {
        await createProduct({ data: {
          shopId: session.shopId,
          shopSlug: session.shopSlug,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          rate: parseFloat(form.rate),
          original_price: form.original_price ? parseFloat(form.original_price) : null,
          category: form.category || null,
          sort_order: parseInt(form.sort_order) || 0,
          banner_url_1: form.banner_url_1 || null,
          banner_url_2: form.banner_url_2 || null,
        } });
      }
      onSave();
      onClose();
    } catch (e: any) {
      alert("Failed to save product: " + (e.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85vh] overflow-y-auto rounded-t-3xl md:bottom-auto md:left-auto md:right-0 md:top-0 md:h-full md:w-[500px] md:rounded-l-3xl md:rounded-tr-none"
            style={{ backgroundColor: "var(--bg-2)" }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b p-6" style={{ backgroundColor: "var(--bg-2)", borderColor: "var(--border)" }}>
              <h2 className="font-display" style={{ fontSize: 24 }}>
                {product ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={onClose} className="rounded-xl p-2 transition-colors hover:bg-white/5">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full rounded-2xl px-5 py-4 outline-none"
                  style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  Slug *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value.toLowerCase())}
                  required
                  pattern="^[a-z0-9\-]+$"
                  className="w-full rounded-2xl px-5 py-4 outline-none"
                  style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-2xl px-5 py-4 outline-none"
                  style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Base Rate (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.rate}
                    onChange={(e) => handleChange("rate", e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => handleChange("original_price", e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => handleChange("sort_order", e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>
              </div>

              {[1, 2].map((num) => (
                <div key={num}>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Product Image {num} {num === 1 ? "*" : ""}
                  </label>
                  <div
                    className="relative overflow-hidden rounded-2xl"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)" }}
                  >
                    {form[`banner_url_${num}` as keyof typeof form] ? (
                      <img
                        src={form[`banner_url_${num}` as keyof typeof form]}
                        alt={`Product ${num}`}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center" style={{ color: "var(--text-muted)" }}>
                        Click to upload
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      ref={num === 1 ? fileInput1 : fileInput2}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) upload(file, num as 1 | 2);
                      }}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    {uploading1 && num === 1 ? "Uploading..." : uploading2 && num === 2 ? "Uploading..." : ""}
                  </p>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl py-4 font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.name || !form.slug || !form.rate || !form.banner_url_1 || saving}
                  className="flex-1 rounded-2xl py-4 font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                >
                  {saving ? "Saving..." : product ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
