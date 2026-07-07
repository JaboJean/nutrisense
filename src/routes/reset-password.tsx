import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set your password · Nutrisense-AI" }] }),
  component: ResetPasswordPage,
});

const PWD_RULES = [
  { label: "8+ characters",         test: (p: string) => p.length >= 8           },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p)        },
  { label: "Number (0-9)",           test: (p: string) => /[0-9]/.test(p)        },
  { label: "Special character",      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

function ResetPasswordPage() {
  const navigate  = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [done,     setDone]     = useState(false);
  const [ready,    setReady]    = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the user arrives via the email link.
  // We wait for that event before showing the form so we know a valid session exists.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
          setReady(true);
        }
      },
    );

    // If already in an active session (e.g. page refreshed), show form immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const score = PWD_RULES.filter((r) => r.test(password)).length;
  const valid = score >= 3 && password === confirm;

  async function handleSubmit() {
    if (!valid) return;
    setLoading(true);
    setError("");

    const { error: updateErr } = await supabase.auth.updateUser({ password });
    if (updateErr) {
      setError(updateErr.message);
      setLoading(false);
      return;
    }

    setDone(true);
    // Redirect based on role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      setTimeout(() => {
        window.location.href =
          profile?.role === "nutritionist" ? "/nutritionist"
          : profile?.role === "admin"       ? "/admin"
          : "/dashboard";
      }, 1400);
    }
    setLoading(false);
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-deep">
        <div className="text-center text-mint px-6 space-y-4">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-mint/15 ring-2 ring-mint/30">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-medium">Password set!</h2>
          <p className="text-mint/70">Taking you to your portal…</p>
          <div className="mx-auto size-5 rounded-full border-2 border-mint/30 border-t-mint animate-spin" />
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-deep/5 to-white px-6 py-16">
      <div className="w-full max-w-sm">

        <div className="mb-8 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-emerald-deep">
            <Sparkles className="size-4 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Set your password</h1>
          <p className="mt-1 text-sm text-ink/50">
            Choose a strong password to secure your clinician account.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40">
              New password
            </div>
            <div className="relative">
              <input
                autoFocus
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(inputCls, "pr-11")}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="mt-2.5 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i <= score
                        ? score <= 1 ? "bg-coral" : score === 2 ? "bg-amber" : score === 3 ? "bg-sky" : "bg-emerald-deep"
                        : "bg-ink/10",
                    )} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {PWD_RULES.map((r) => {
                    const ok = r.test(password);
                    return (
                      <div key={r.label} className={cn("flex items-center gap-1.5 text-[10px]", ok ? "text-emerald-deep" : "text-ink/35")}>
                        <Check className={cn("size-3 shrink-0", ok ? "opacity-100" : "opacity-30")} />
                        {r.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40">
              Confirm password
            </div>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className={cn(inputCls, confirm && password !== confirm ? "border-coral/40 ring-coral/15" : "")}
            />
            {confirm && password !== confirm && (
              <p className="mt-1 text-[11px] text-coral">Passwords don't match</p>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!valid || loading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all",
              valid && !loading
                ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98]"
                : "cursor-not-allowed bg-ink/8 text-ink/30",
            )}
          >
            {loading
              ? <><Loader2 className="size-4 animate-spin" /> Setting password…</>
              : <><Check className="size-4" /> Set password &amp; log in</>}
          </button>
        </div>
      </div>
    </div>
  );
}
