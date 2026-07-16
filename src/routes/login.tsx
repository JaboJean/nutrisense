import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Nutrisense-AI" }] }),
  component: LoginPage,
});


function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function LoginPage() {
  const { user, loaded, login, loginWithGoogle } = useAuth();

  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPwd,       setShowPwd]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotMode,    setForgotMode]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotSent,    setForgotSent]    = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (loaded && user) window.location.href = "/dashboard";
  }, [loaded, user]);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result: true | string = await login(email.trim().toLowerCase(), password);
    if (result === true) {
      window.location.href = "/dashboard";
    } else {
      setError(result);
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!forgotEmail.includes("@")) return;
    setForgotLoading(true);
    await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);
    await loginWithGoogle();
    // Page redirects to Google — no need to reset state
  }


  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ── */}
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

      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">

        <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <div className="grid size-7 place-items-center rounded-lg bg-emerald-deep">
            <Sparkles className="size-3.5 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-sm text-ink/50">Sign in to your Nutrisense-AI account</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="mb-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/12 bg-white py-3 text-sm font-semibold text-ink/80 shadow-sm hover:bg-ink/[0.02] hover:shadow transition-all"
          >
            {googleLoading ? <Loader2 className="size-5 animate-spin text-ink/40" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-ink/8" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink/30">or sign in with email</span>
            <div className="flex-1 h-px bg-ink/8" />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-ink/40">Password</span>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setForgotEmail(email); setError(null); }}
                  className="text-[11px] font-semibold text-emerald-deep hover:underline"
                >
                  Forgot password?
                </button>
              </div>
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
                {error.includes("Invalid") && (
                  <span className="block mt-1 text-[11px] text-coral/70">
                    No account yet? <Link to="/signup" className="font-bold underline">Create one free →</Link>
                  </span>
                )}
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

      {/* ── Forgot-password overlay ── */}
      {forgotMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => { setForgotMode(false); setForgotSent(false); }} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => { setForgotMode(false); setForgotSent(false); }}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-ink/40 hover:bg-ink/5 transition-colors"
            >
              ✕
            </button>

            {forgotSent ? (
              <div className="text-center space-y-3 py-2">
                <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-deep/10">
                  <Check className="size-6 text-emerald-deep" />
                </div>
                <h2 className="font-display text-lg font-semibold text-ink">Check your email</h2>
                <p className="text-sm text-ink/55">
                  We sent a password-reset link to <strong>{forgotEmail}</strong>. Click it to set a new password.
                </p>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); }}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2 text-sm font-semibold text-mint"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">Reset your password</h2>
                  <p className="mt-1 text-sm text-ink/50">Enter your email and we'll send a reset link.</p>
                </div>
                <input
                  autoFocus
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all"
                />
                <button
                  onClick={handleForgotPassword}
                  disabled={!forgotEmail.includes("@") || forgotLoading}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all",
                    forgotEmail.includes("@") && !forgotLoading
                      ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.6)] hover:scale-[1.01]"
                      : "cursor-not-allowed bg-ink/8 text-ink/30",
                  )}
                >
                  {forgotLoading ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : "Send reset link"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
