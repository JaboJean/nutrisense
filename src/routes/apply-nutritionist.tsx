import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/apply-nutritionist")({
  head: () => ({ meta: [{ title: "Apply for Clinician Access · Nutrisense-AI" }] }),
  component: ApplyNutritionistPage,
});

function ApplyNutritionistPage() {
  const navigate = useNavigate();
  const { user, profile, loaded } = useAuth();

  const [credentialNo, setCredentialNo] = useState("");
  const [institution,  setInstitution]  = useState("");
  const [note,         setNote]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [submitted,    setSubmitted]    = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (!user) { navigate({ to: "/signup" }); return; }
    if (profile?.role === "nutritionist") { window.location.href = "/nutritionist"; return; }
    if (profile?.role === "admin")        { window.location.href = "/admin"; return; }
  }, [loaded, user, profile, navigate]);

  const valid = credentialNo.trim().length > 2 && institution.trim().length > 2;

  async function handleSubmit() {
    if (!valid || !user || !profile) return;
    setLoading(true);
    setError("");

    // Insert application
    const { error: insertErr } = await supabase
      .from("nutritionist_applications")
      .insert({
        user_id:       user.id,
        full_name:     profile.name,
        credential_no: credentialNo.trim(),
        institution:   institution.trim(),
        note:          note.trim() || null,
      });

    if (insertErr) {
      if (insertErr.code === "23505") {
        setError("You have already submitted an application. Please wait for review.");
      } else {
        setError(insertErr.message);
      }
      setLoading(false);
      return;
    }

    // Set role to pending
    const { error: roleErr } = await supabase
      .from("profiles")
      .update({ role: "pending_nutritionist" })
      .eq("id", user.id);

    if (roleErr) { setError(roleErr.message); setLoading(false); return; }

    setSubmitted(true);
    setLoading(false);
  }

  if (!loaded || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40";

  // Already pending state
  if (profile?.role === "pending_nutritionist" || submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-deep/5 to-white px-6">
        <div className="w-full max-w-sm text-center space-y-5">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-amber/10 ring-2 ring-amber/20">
            <Clock className="size-9 text-amber" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Application submitted</h1>
            <p className="mt-2 text-sm text-ink/55 leading-relaxed">
              Your application is under review. An admin will verify your credentials and activate
              your account within 1–2 business days. You'll be able to log in as a nutritionist
              once approved.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/dashboard", search: { tab: "overview" } })}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Back to my dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-deep/5 to-white px-6 py-16">
      <div className="w-full max-w-sm">

        <a href="/" className="mb-8 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-emerald-deep">
            <Sparkles className="size-4 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </a>

        <div className="mb-7">
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink/35">Clinician access</div>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">Apply as nutritionist</h1>
          <p className="mt-1.5 text-sm text-ink/50 leading-relaxed">
            We verify every clinician before granting access to patient data.
            Your RAHPC registration number will be confirmed by our admin team.
          </p>
        </div>

        {/* Pre-filled identity banner */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-emerald-deep/6 px-4 py-3 ring-1 ring-emerald-deep/15">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-deep/15 text-emerald-deep font-bold text-xs">
            {(profile?.name ?? "?").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink truncate">{profile?.name ?? "—"}</div>
            <div className="text-[11px] text-ink/45">Applying as {user.email}</div>
          </div>
          <Check className="size-4 text-emerald-deep shrink-0 ml-auto" />
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className={labelCls}>RAHPC Registration No.</span>
            <input
              autoFocus
              value={credentialNo}
              onChange={(e) => setCredentialNo(e.target.value)}
              placeholder="e.g. RNC-2024-0042"
              className={inputCls}
            />
            <p className="mt-1 text-[10px] text-ink/35">
              Rwanda Allied Health Professions Council registration number.
            </p>
          </label>

          <label className="block">
            <span className={labelCls}>Institution / Hospital</span>
            <input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. King Faisal Hospital, Kigali"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className={labelCls}>Additional note (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything you'd like the admin team to know…"
              className={cn(inputCls, "resize-none")}
            />
          </label>

          {error && (
            <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">
              {error}
            </div>
          )}

          <button
            type="button"
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
              ? <><Loader2 className="size-4 animate-spin" /> Submitting…</>
              : <>Submit application <ArrowRight className="size-4" /></>}
          </button>

          <p className="text-center text-xs text-ink/35">
            Already have an account?{" "}
            <a href="/dashboard" className="font-semibold text-emerald-deep hover:underline">
              Back to dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
