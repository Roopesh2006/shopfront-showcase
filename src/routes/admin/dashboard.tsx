import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Check,
  Building2,
  Phone,
  Mail,
  Calendar,
  Lock,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
  head: () => ({
    meta: [{ title: "Platform Admin Dashboard" }],
  }),
});

type Shop = {
  id: string;
  name: string;
  slug: string;
  shop_phone_number: string | null;
  shop_email: string | null;
  banner_url_1: string | null;
  created_at: string;
};

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [masterKey, setMasterKey] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("sp.admin");
    if (!raw) {
      navigate({ to: "/admin" });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.admin) {
        navigate({ to: "/admin" });
        return;
      }
      setMasterKey(parsed.masterKey || "");
    } catch {
      navigate({ to: "/admin" });
      return;
    }
    setChecking(false);
  }, [navigate]);

  useEffect(() => {
    if (checking || !masterKey) return;
    (async () => {
      try {
        const res = await import("@/lib/platform.functions").then((m) =>
          m.getAllShops({ masterKey })
        );
        setShops(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [masterKey, checking]);

  const logout = () => {
    sessionStorage.removeItem("sp.admin");
    navigate({ to: "/admin" });
  };

  const refresh = async () => {
    if (!masterKey) return;
    const res = await import("@/lib/platform.functions").then((m) =>
      m.getAllShops({ masterKey })
    );
    setShops(res || []);
  };

  if (checking || loading || !masterKey) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between border-b px-6 py-4"
        style={{ backgroundColor: "var(--bg-2)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <Shield size={28} style={{ color: "var(--accent)" }} />
          <h1 className="font-display" style={{ fontSize: 24 }}>
            Platform Admin
          </h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors hover:bg-white/5"
          style={{ color: "var(--danger)" }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-display" style={{ fontSize: 32 }}>
            Shops
          </h2>
          <CreateShopButton masterKey={masterKey} onSave={refresh} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              masterKey={masterKey}
              onSave={refresh}
            />
          ))}
        </div>

        {shops.length === 0 && (
          <div className="rounded-2xl p-12 text-center" style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <Building2 size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>No shops created yet</p>
          </div>
        )}
      </main>
    </div>
  );
}

// === SHOP CARD ===
function ShopCard({
  shop,
  masterKey,
  onSave,
}: {
  shop: Shop;
  masterKey: string;
  onSave: () => void;
}) {
  const [pwModal, setPwModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl"
        style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
      >
        <div className="h-20 overflow-hidden">
          {shop.banner_url_1 ? (
            <img src={shop.banner_url_1} alt={shop.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center" style={{ backgroundColor: "var(--bg-3)" }}>
              <Building2 size={24} style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="mb-1 font-medium text-lg">{shop.name}</h3>
          <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
            {shop.slug}
          </p>

          <div className="mb-4 space-y-2 text-sm">
            {shop.shop_phone_number && (
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Phone size={14} />
                <span>{shop.shop_phone_number}</span>
              </div>
            )}
            {shop.shop_email && (
              <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Mail size={14} />
                <span className="truncate">{shop.shop_email}</span>
              </div>
            )}
            <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <Calendar size={14} />
              <span>{format(new Date(shop.created_at), "MMM d, yyyy")}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPwModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium"
              style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}
            >
              <Lock size={16} />
              Reset Password
            </button>
            <button
              onClick={() => setDeleteModal(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium"
              style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        open={pwModal}
        onClose={() => setPwModal(false)}
        shop={shop}
        masterKey={masterKey}
        onSave={onSave}
      />

      {/* Delete Modal */}
      <DeleteShopModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setDeleteInput("");
        }}
        shop={shop}
        masterKey={masterKey}
        onSave={onSave}
        deleteInput={deleteInput}
        setDeleteInput={setDeleteInput}
      />
    </>
  );
}

// === CREATE SHOP BUTTON/MODAL ===
function CreateShopButton({
  masterKey,
  onSave,
}: {
  masterKey: string;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shop_phone_number: "",
    shop_email: "",
    password: "",
    confirmPassword: "",
    banner_url_1: "",
    banner_url_2: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((f) => {
      if (field === "name" && !f.slug) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        return { ...f, name: value, slug };
      }
      return { ...f, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.slug.match(/^[a-z0-9-]+$/)) {
      setError("Slug must be lowercase letters, numbers, and hyphens only");
      return;
    }
    if (!form.shop_phone_number.startsWith("+")) {
      setError("WhatsApp number must start with + and include country code");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await import("@/lib/platform.functions").then((m) =>
        m.createShop({
          masterKey,
          name: form.name,
          slug: form.slug,
          shop_phone_number: form.shop_phone_number,
          shop_email: form.shop_email,
          password: form.password,
          banner_url_1: form.banner_url_1 || null,
          banner_url_2: form.banner_url_2 || null,
        })
      );
      setOpen(false);
      setForm({
        name: "",
        slug: "",
        shop_phone_number: "",
        shop_email: "",
        password: "",
        confirmPassword: "",
        banner_url_1: "",
        banner_url_2: "",
      });
      onSave();
    } catch (e: any) {
      setError(e.message || "Failed to create shop");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl px-5 py-3 font-medium"
        style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
      >
        <Plus size={18} />
        Create Shop
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            exit={{ backgroundColor: "rgba(0,0,0,0)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-8"
              style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display" style={{ fontSize: 24 }}>
                  Create Shop
                </h2>
                <button onClick={() => setOpen(false)} className="rounded-xl p-2 transition-colors hover:bg-white/5">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Shop Name *
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
                    pattern="^[a-z0-9-]+$"
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Must be unique, lowercase letters/numbers/hyphens
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    value={form.shop_phone_number}
                    onChange={(e) => handleChange("shop_phone_number", e.target.value)}
                    required
                    placeholder="+919876543210"
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Must start with + and include country code
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.shop_email}
                    onChange={(e) => handleChange("shop_email", e.target.value)}
                    required
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    Minimum 8 characters
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Banner URL 1 (optional)
                  </label>
                  <input
                    type="url"
                    value={form.banner_url_1}
                    onChange={(e) => handleChange("banner_url_1", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                    Banner URL 2 (optional)
                  </label>
                  <input
                    type="url"
                    value={form.banner_url_2}
                    onChange={(e) => handleChange("banner_url_2", e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-2xl px-5 py-4 outline-none"
                    style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                    <AlertCircle size={18} style={{ color: "var(--danger)" }} />
                    <span className="text-sm" style={{ color: "var(--danger)" }}>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-2xl py-4 font-medium"
                    style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!form.name || !form.slug || !form.shop_phone_number || !form.shop_email || !form.password || saving}
                    className="flex-1 rounded-2xl py-4 font-medium disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                  >
                    {saving ? "Creating..." : "Create Shop"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// === RESET PASSWORD MODAL ===
function ResetPasswordModal({
  open,
  onClose,
  shop,
  masterKey,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  shop: Shop;
  masterKey: string;
  onSave: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await import("@/lib/platform.functions").then((m) =>
        m.resetShopPassword({ masterKey, shopId: shop.id, newPassword })
      );
      setNewPassword("");
      setConfirm("");
      onClose();
      onSave();
    } catch (e: any) {
      setError(e.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-8"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
          >
            <h2 className="font-display mb-2" style={{ fontSize: 24 }}>
              Reset Password
            </h2>
            <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
              Reset password for <strong>{shop.name}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-2xl px-5 py-4 outline-none"
                  style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-2xl px-5 py-4 outline-none"
                  style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(239,68,68,0.1)" }}>
                  <AlertCircle size={18} style={{ color: "var(--danger)" }} />
                  <span className="text-sm" style={{ color: "var(--danger)" }}>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl py-3 font-medium"
                  style={{ border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPassword || !confirm || saving}
                  className="flex-1 rounded-2xl py-3 font-medium disabled:opacity-50"
                  style={{ backgroundColor: "var(--accent)", color: "#0a0a0a" }}
                >
                  {saving ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === DELETE SHOP MODAL ===
function DeleteShopModal({
  open,
  onClose,
  shop,
  masterKey,
  onSave,
  deleteInput,
  setDeleteInput,
}: {
  open: boolean;
  onClose: () => void;
  shop: Shop;
  masterKey: string;
  onSave: () => void;
  deleteInput: string;
  setDeleteInput: (v: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleteInput !== shop.slug) {
      alert("Slug does not match");
      return;
    }
    setDeleting(true);
    try {
      await import("@/lib/platform.functions").then((m) =>
        m.deleteShop({ masterKey, shopId: shop.id, slug: shop.slug })
      );
      onClose();
      onSave();
    } catch (e: any) {
      alert("Failed to delete shop: " + (e.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl p-8"
            style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
          >
            <h2 className="font-display mb-4" style={{ fontSize: 24, color: "var(--danger)" }}>
              Delete Shop
            </h2>
            <p className="mb-6" style={{ color: "var(--text-muted)" }}>
              This will permanently delete <strong>{shop.name}</strong> and all its products, offers, and assets. This cannot be undone.
            </p>
            <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
              Type the shop slug to confirm: <strong style={{ color: "var(--text)" }}>{shop.slug}</strong>
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={shop.slug}
              className="mb-6 w-full rounded-2xl px-5 py-4 outline-none"
              style={{ backgroundColor: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl py-3 font-medium"
                style={{ border: "1px solid var(--border)", color: "var(--text)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== shop.slug || deleting}
                className="flex-1 rounded-2xl py-3 font-medium disabled:opacity-50"
                style={{ backgroundColor: "var(--danger)", color: "#fff" }}
              >
                {deleting ? "Deleting..." : "Delete Shop"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
