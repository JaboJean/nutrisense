import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Nutrisense-AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loaded, login } = useAuth();

  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loaded && user) navigate({ to: "/dashboard" });
  }, [loaded, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(email.trim(), password);
    if (result === true) {
      navigate({ to: "/dashboard" });
    } else {
      setError(result);
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel (desktop branding) ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-emerald-deep p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-mint/20">
            <Sparkles className="size-4 text-mint" />
          </div>
          <span className="font-display text-[16px] font-semibold text-mint">
            Nutrisense<span className="text-mint/50">-AI</span>
          </span>
        </Link>

        <div>
          <h2 className="font-display text-4xl font-bold text-mint leading-snug">
            Your disease risk,<br />updated with every meal.
          </h2>
          <p className="mt-4 text-mint/55 leading-relaxed">
            Sign in to see your personalised risk scores for anemia, Type 2 diabetes,
            and overweight — powered by XGBoost and SHAP explainability.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "AI food recognition via Vision Transformer",
              "3 XGBoost risk classifiers",
              "SHAP-powered explanations",
              "Personalised nutrition recommendations",
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-mint/70">
                <div className="size-1.5 rounded-full bg-mint/40 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-mint/30">BSc Software Engineering Capstone · ALU Rwanda</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="grid size-7 place-items-center rounded-lg bg-emerald-deep">
            <Sparkles className="size-3.5 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-ink/50">Sign in to your Nutrisense-AI account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40">Password</span>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(inputCls, "pr-11")}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
                >
                  {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all mt-2",
                !loading && email && password
                  ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98]"
                  : "cursor-not-allowed bg-ink/8 text-ink/30",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-mint/30 border-t-mint animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>Sign in <ArrowRight className="size-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/45">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-emerald-deep hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
