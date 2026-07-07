import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getBMI, getBMILabel } from "@/hooks/useProfile";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account · Nutrisense-AI" }] }),
  component: SignupPage,
});

const STEPS = ["Account", "Personal", "Body"] as const;

const PWD_RULES = [
  { label: "8+ characters",         test: (p: string) => p.length >= 8           },
  { label: "Uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p)        },
  { label: "Number (0-9)",           test: (p: string) => /[0-9]/.test(p)        },
  { label: "Special character",      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

function getPasswordScore(pwd: string): number {
  return PWD_RULES.filter((r) => r.test(pwd)).length;
}

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"] as const;
const STRENGTH_COLORS = [
  "bg-ink/15",
  "bg-coral",
  "bg-amber",
  "bg-sky",
  "bg-emerald-deep",
] as const;

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

function SignupPage() {
  const navigate    = useNavigate();
  const { user, loaded, register, loginWithGoogle } = useAuth();
  const registering = useRef(false); // prevent useEffect from redirecting mid-registration

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [age,      setAge]      = useState("");
  const [sex,      setSex]      = useState<"male" | "female" | "">("");
  const [weight,   setWeight]   = useState("");
  const [height,   setHeight]   = useState("");
  const [error,         setError]         = useState<string | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Only redirect if already logged in BEFORE the user started registering
  useEffect(() => {
    if (loaded && user && !registering.current) {
      navigate({ to: "/dashboard", search: { tab: "overview" } });
    }
  }, [loaded, user, navigate]);

  const bmi = weight && height && Number(weight) > 0 && Number(height) > 0
    ? getBMI(Number(weight), Number(height))
    : null;

  const pwdScore = getPasswordScore(password);
  const step0Ok  = name.trim().length > 1 && email.includes("@") && pwdScore >= 3;
  const step1Ok = Number(age) >= 10 && sex !== "";
  const step2Ok = Number(weight) >= 20 && Number(height) >= 100;
  const stepOk  = [step0Ok, step1Ok, step2Ok][step];

  async function handleGoogleSignup() {
    setGoogleLoading(true);
    setError(null);
    await loginWithGoogle();
    // Page redirects to Google — no need to reset state
  }

  async function handleNext() {
    setError(null);
    if (step < 2) { setStep((s) => s + 1); return; }

    registering.current = true;
    setLoading(true);

    const result: true | string = await register(email.trim().toLowerCase(), password, {
      name:     name.trim(),
      age:      Number(age),
      sex:      sex as "male" | "female",
      weightKg: Number(weight),
      heightCm: Number(height),
      role:     "patient",
    });

    if (result === true) {
      setDone(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1400);
    } else {
      registering.current = false;
      setError(result);
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40";

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-deep">
        <div className="animate-nv-rise text-center text-mint px-6">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-mint/15 ring-2 ring-mint/30">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-medium">Welcome, {name.trim().split(" ")[0]}!</h2>
          <p className="mt-2 text-mint/70">Your account is ready. Loading your dashboard…</p>
          <div className="mt-5 mx-auto size-5 rounded-full border-2 border-mint/30 border-t-mint animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between bg-emerald-deep p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-mint/20">
            <Sparkles className="size-4 text-mint" />
          </div>
          <span className="font-display text-[16px] font-semibold text-mint">
            Nutrisense<span className="text-mint/50">-AI</span>
          </span>
        </Link>

        <div>
          <h2 className="font-display text-3xl font-bold text-mint leading-snug">
            Your personal disease risk dashboard.
          </h2>
          <p className="mt-3 text-mint/55 leading-relaxed text-sm">
            Set up your profile in 60 seconds. We use your age, sex, and body measurements
            to calibrate your personalised risk scores.
          </p>

          <div className="mt-10 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className={cn(
                "flex items-center gap-3 text-sm transition-all",
                i < step   ? "text-mint/50"            : "",
                i === step ? "text-mint font-semibold"  : "",
                i > step   ? "text-mint/25"             : "",
              )}>
                <div className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  i < step   ? "bg-mint/20 text-mint/60"      : "",
                  i === step ? "bg-mint text-emerald-deep"    : "",
                  i > step   ? "bg-mint/10 text-mint/30"      : "",
                )}>
                  {i < step ? <Check className="size-3" /> : i + 1}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">

        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="grid size-7 place-items-center rounded-lg bg-emerald-deep">
            <Sparkles className="size-3.5 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </Link>

        <div className="w-full max-w-sm">

          {/* Mobile progress */}
          <div className="flex items-center gap-1.5 mb-6 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className={cn(
                "h-1 rounded-full flex-1 transition-all duration-500",
                i <= step ? "bg-emerald-deep" : "bg-ink/10",
              )} />
            ))}
          </div>

          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/35">Step {step + 1} of 3</div>
            <h1 className="mt-1 font-display text-2xl font-bold">
              {step === 0 && "Create your account"}
              {step === 1 && "Tell us about you"}
              {step === 2 && "Body measurements"}
            </h1>
            <p className="mt-1 text-sm text-ink/45">
              {step === 0 && "Your sign-in credentials."}
              {step === 1 && "Personalises your disease risk analysis."}
              {step === 2 && "Used to calibrate your overweight risk score."}
            </p>
          </div>

          <div className="space-y-4">

            {step === 0 && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={googleLoading || loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-ink/12 bg-white py-3 text-sm font-semibold text-ink/80 shadow-sm hover:bg-ink/[0.02] hover:shadow transition-all"
                >
                  {googleLoading ? <Loader2 className="size-5 animate-spin text-ink/40" /> : <GoogleIcon />}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-ink/8" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-ink/30">or with email</span>
                  <div className="flex-1 h-px bg-ink/8" />
                </div>

                <label className="block">
                  <span className={labelCls}>Full name</span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Jacques"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Email address</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                  />
                </label>
                <div className="block">
                  <span className={labelCls}>Password</span>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      autoComplete="new-password"
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

                  {/* Strength meter — only shows once user starts typing */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {/* Bar */}
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-all duration-300",
                              i <= pwdScore ? STRENGTH_COLORS[pwdScore] : "bg-ink/10",
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[11px] font-semibold",
                          pwdScore <= 1 ? "text-coral" : pwdScore === 2 ? "text-amber" : pwdScore === 3 ? "text-sky" : "text-emerald-deep",
                        )}>
                          {STRENGTH_LABELS[pwdScore]}
                        </span>
                        <span className="text-[10px] text-ink/35">{pwdScore}/4 rules met</span>
                      </div>
                      {/* Requirement checklist */}
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
              </>
            )}

            {step === 1 && (
              <>
                <label className="block">
                  <span className={labelCls}>Age (years)</span>
                  <input
                    autoFocus
                    type="number" min={10} max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    className={inputCls}
                  />
                </label>
                <div>
                  <span className={labelCls}>Biological sex</span>
                  <div className="flex gap-3">
                    {(["male", "female"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSex(s)}
                        className={cn(
                          "flex-1 rounded-2xl py-3 text-sm font-semibold capitalize transition-all",
                          sex === s
                            ? "bg-emerald-deep text-mint shadow-[0_6px_16px_-8px_rgba(15,118,110,0.6)]"
                            : "border border-ink/10 bg-ink/[0.02] text-ink/55 hover:border-emerald-deep/30",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelCls}>Weight</span>
                    <div className="relative">
                      <input
                        autoFocus
                        type="number" min={20} max={300}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="68"
                        className={cn(inputCls, "pr-10")}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/35">kg</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className={labelCls}>Height</span>
                    <div className="relative">
                      <input
                        type="number" min={100} max={250}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="172"
                        className={cn(inputCls, "pr-10")}
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/35">cm</span>
                    </div>
                  </label>
                </div>
                <p className="text-[11px] text-ink/35 -mt-1">Enter height in centimetres (e.g. 172, not 1.72)</p>

                {bmi && (
                  <div className={cn(
                    "flex items-center gap-4 rounded-2xl p-4 ring-1",
                    bmi < 18.5 ? "bg-sky/8 ring-sky/20"
                    : bmi < 25  ? "bg-emerald-deep/8 ring-emerald-deep/20"
                    : bmi < 30  ? "bg-amber/8 ring-amber/20"
                    :             "bg-coral/8 ring-coral/20",
                  )}>
                    <span className={cn(
                      "font-display text-4xl font-bold tabular-nums",
                      bmi < 18.5 ? "text-sky" : bmi < 25 ? "text-emerald-deep" : bmi < 30 ? "text-amber" : "text-coral",
                    )}>
                      {bmi}
                    </span>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-ink/40">Your BMI</div>
                      <div className="text-sm font-semibold">{getBMILabel(bmi)}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">
                {error.toLowerCase().includes("rate limit") || error.includes("429")
                  ? "Too many signup attempts for this email. Wait a few minutes, or use a different email address."
                  : error}
                {error.includes("already") && (
                  <span> <Link to="/login" className="font-bold underline">Sign in instead</Link></span>
                )}
              </div>
            )}

            {/* Validation hint when button is disabled */}
            {!stepOk && !error && (
              <p className="text-[11px] text-ink/35">
                {step === 0 && "Fill in all fields — password needs 8+ characters and 3 of the 4 rules."}
                {step === 1 && (!age || Number(age) < 10 ? "Enter your age (10–100)." : "Select your biological sex.")}
                {step === 2 && (!weight || Number(weight) < 20
                  ? "Enter your weight in kg."
                  : !height || Number(height) < 100
                  ? "Enter your height in cm (e.g. 172, not 1.72)."
                  : "")}
              </p>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!stepOk || loading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all",
                stepOk && !loading
                  ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98]"
                  : "cursor-not-allowed bg-ink/8 text-ink/30",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 rounded-full border-2 border-mint/30 border-t-mint animate-spin" />
                  Creating account…
                </span>
              ) : (
                <>{step < 2 ? "Continue" : "Create account"} <ArrowRight className="size-4" /></>
              )}
            </button>

            {step > 0 && !loading && (
              <button
                type="button"
                onClick={() => { setError(null); setStep((s) => s - 1); }}
                className="w-full text-center text-sm text-ink/40 hover:text-ink/70 transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <p className="mt-7 text-center text-sm text-ink/45">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-deep hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-4 rounded-2xl border border-ink/8 bg-ink/[0.02] px-4 py-3 text-center">
            <p className="text-[12px] text-ink/50">
              Are you a registered nutritionist or dietitian?
            </p>
            <a
              href="/apply-nutritionist"
              className="mt-1 inline-block text-[12px] font-semibold text-emerald-deep hover:underline"
            >
              Apply for clinician access →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
