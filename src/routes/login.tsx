import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Lock, User, CircleAlert as AlertCircle } from "lucide-react";
import { loginShop } from "@/lib/auth.functions";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Shop Login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const doLogin = useServerFn(loginShop);
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await doLogin({ data: { slug: slug.trim().toLowerCase(), password } });
      localStorage.setItem(
        "sp.session",
        JSON.stringify({
          shopId: result.shopId,
          shopSlug: result.shopSlug,
          shopName: result.shopName,
        })
      );
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl p-10"
          style={{ backgroundColor: "var(--bg-2)", border: "1px solid var(--border)" }}
        >
          <div className="mb-10 text-center">
            <h1
              className="font-display mb-2"
              style={{ fontSize: "clamp(28px, 5vw, 40px)", letterSpacing: "-0.02em" }}
            >
              Shop Login
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Access your storefront dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                Shop Handle
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="your-shop-slug"
                  className="w-full rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full rounded-2xl py-4 pl-12 pr-4 outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                  }}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-3"
                style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
              >
                <AlertCircle size={18} style={{ color: "var(--danger)" }} />
                <span className="text-sm" style={{ color: "var(--danger)" }}>
                  {error}
                </span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                backgroundColor: "var(--accent)",
                color: "#0a0a0a",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
