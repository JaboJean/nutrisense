import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getBMI, getBMILabel } from "@/hooks/useProfile";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account · Nutrisense-AI" }] }),
  component: SignupPage,
});

const STEPS = ["Account", "Personal", "Body"] as const;

function SignupPage() {
  const navigate = useNavigate();
  const { user, loaded, register } = useAuth();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  // Step 0
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);

  // Step 1
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");

  // Step 2
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bmi = weight && height && Number(weight) > 0 && Number(height) > 0
    ? getBMI(Number(weight), Number(height))
    : null;

  useEffect(() => {
    if (loaded && user) navigate({ to: "/dashboard" });
  }, [loaded, user, navigate]);

  const step0Ok = name.trim().length > 1 && email.includes("@") && password.length >= 6;
  const step1Ok = Number(age) >= 10 && sex !== "";
  const step2Ok = Number(weight) >= 20 && Number(height) >= 100;

  async function handleNext() {
    setError(null);
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = register(email.trim().toLowerCase(), password, {
      name:     name.trim(),
      age:      Number(age),
      sex:      sex as "male" | "female",
      weightKg: Number(weight),
      heightCm: Number(height),
    });
    if (result === true) {
      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 1600);
    } else {
      setError(result);
      setLoading(false);
    }
  }

  const inputCls = "w-full rounded-2xl border border-ink/10 bg-ink/[0.02] px-4 py-3 text-sm focus:border-emerald-deep/40 focus:outline-none focus:ring-2 focus:ring-emerald-deep/15 transition-all";
  const labelCls = "mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-ink/40";

  const stepOk = [step0Ok, step1Ok, step2Ok][step];

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-emerald-deep">
        <div className="animate-nv-rise text-center text-mint px-6">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-mint/15 ring-2 ring-mint/30">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-medium">Welcome, {name.trim().split(" ")[0]}!</h2>
          <p className="mt-2 text-mint/70">Your account is ready. Taking you to the dashboard…</p>
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
            Set up your profile in 60 seconds. We use your age, sex, and body measurements to calibrate your personalised risk scores.
          </p>

          {/* Step indicator */}
          <div className="mt-10 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className={cn(
                "flex items-center gap-3 text-sm transition-all",
                i < step   ? "text-mint/50"  : "",
                i === step ? "text-mint font-semibold" : "",
                i > step   ? "text-mint/25"  : "",
              )}>
                <div className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  i < step   ? "bg-mint/20 text-mint/60" : "",
                  i === step ? "bg-mint text-emerald-deep" : "",
                  i > step   ? "bg-mint/10 text-mint/30" : "",
                )}>
                  {i < step ? <Check className="size-3" /> : i + 1}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-mint/30">BSc Software Engineering Capstone · ALU Rwanda</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">

        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="grid size-7 place-items-center rounded-lg bg-emerald-deep">
            <Sparkles className="size-3.5 text-mint" />
          </div>
          <span className="font-display text-sm font-semibold text-emerald-deep">Nutrisense-AI</span>
        </Link>

        <div className="w-full max-w-sm">

          {/* Progress (mobile) */}
          <div className="flex items-center gap-1.5 mb-6 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className={cn(
                "h-1 rounded-full flex-1 transition-all duration-500",
                i <= step ? "bg-emerald-deep" : "bg-ink/10",
              )} />
            ))}
          </div>

          <div className="mb-7">
            <div className="text-[10px] uppercase tracking-[0.2em] text-ink/35">Step {step + 1} of 3</div>
            <h1 className="mt-1 font-display text-2xl font-bold">
              {step === 0 && "Create your account"}
              {step === 1 && "Tell us about you"}
              {step === 2 && "Body measurements"}
            </h1>
            <p className="mt-1.5 text-sm text-ink/45">
              {step === 0 && "Your credentials to sign in."}
              {step === 1 && "Personalises your disease risk analysis."}
              {step === 2 && "Used to calibrate your overweight risk score."}
            </p>
          </div>

          <div className="space-y-4">

            {/* Step 0: Account */}
            {step === 0 && (
              <>
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
                <label className="block">
                  <span className={labelCls}>Password <span className="normal-case tracking-normal text-ink/30">(min 6 chars)</span></span>
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
                </label>
              </>
            )}

            {/* Step 1: Personal */}
            {step === 1 && (
              <>
                <label className="block">
                  <span className={labelCls}>Age</span>
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

            {/* Step 2: Body */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={labelCls}>Weight (kg)</span>
                    <input
                      autoFocus
                      type="number" min={30} max={250}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 68"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Height (cm)</span>
                    <input
                      type="number" min={100} max={250}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 172"
                      className={inputCls}
                    />
                  </label>
                </div>

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
                      <div className="text-xs text-ink/40">Used to calibrate risk model</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="rounded-2xl bg-coral/8 px-4 py-3 text-sm text-coral ring-1 ring-coral/20">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!stepOk || loading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all mt-1",
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

            {step > 0 && (
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

        </div>
      </div>
    </div>
  );
}
