import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { type UserProfile, getBMI, getBMILabel } from "@/hooks/useProfile";

type Props = { onComplete: (p: UserProfile) => void };

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep]     = useState(0);
  const [name, setName]     = useState("");
  const [age, setAge]       = useState("");
  const [sex, setSex]       = useState<"male" | "female" | "">("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [done, setDone]     = useState(false);

  const bmi = weight && height && Number(weight) > 0 && Number(height) > 0
    ? getBMI(Number(weight), Number(height))
    : null;

  const step1Ok = name.trim().length > 0 && Number(age) > 0 && sex !== "";
  const step2Ok = Number(weight) > 0 && Number(height) > 0;

  function handleNext() {
    if (step === 0 && step1Ok) { setStep(1); return; }
    if (step === 1 && step2Ok) {
      setDone(true);
      setTimeout(() => {
        onComplete({
          name: name.trim(),
          age: Number(age),
          sex: sex as "male" | "female",
          weightKg: Number(weight),
          heightCm: Number(height),
        });
      }, 1400);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-deep">
        <div className="animate-nv-rise text-center text-mint">
          <div className="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-mint/15 ring-2 ring-mint/30">
            <Check className="size-10" strokeWidth={2.5} />
          </div>
          <h2 className="font-display text-3xl font-medium">
            Welcome, {name.trim().split(" ")[0]}!
          </h2>
          <p className="mt-2 text-mint/70">Your profile is ready. Let's monitor your nutrition.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md rounded-t-[32px] bg-ivory p-8 shadow-2xl sm:rounded-[32px] animate-nv-rise">

        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i <= step ? "flex-1 bg-emerald-deep" : "w-8 bg-ink/12",
              )}
            />
          ))}
        </div>

        {/* ── Step 0 ── */}
        {step === 0 && (
          <div className="space-y-6 animate-nv-slide-in">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40">Step 1 of 2</div>
              <h2 className="mt-1 font-display text-2xl font-medium">Tell us about you</h2>
              <p className="mt-1 text-sm text-ink/50">Used to personalise your risk analysis.</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5">Full name</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="Your name"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5">Age</span>
                <input
                  type="number" min={10} max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
                />
              </label>

              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5">Biological sex</span>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(s)}
                      className={cn(
                        "flex-1 rounded-2xl py-3 text-sm font-semibold capitalize transition-all",
                        sex === s
                          ? "bg-emerald-deep text-mint shadow-[0_6px_16px_-8px_rgba(15,118,110,0.6)]"
                          : "bg-white ring-1 ring-ink/10 text-ink/55 hover:ring-emerald-deep/30",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="space-y-6 animate-nv-slide-in">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40">Step 2 of 2</div>
              <h2 className="mt-1 font-display text-2xl font-medium">Body measurements</h2>
              <p className="mt-1 text-sm text-ink/50">Calibrates your overweight risk score.</p>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5">Weight (kg)</span>
                <input
                  autoFocus
                  type="number" min={30} max={250}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 68"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5">Height (cm)</span>
                <input
                  type="number" min={100} max={250}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  placeholder="e.g. 172"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/10 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow"
                />
              </label>

              {bmi && (
                <div className={cn(
                  "flex items-center gap-4 rounded-2xl p-4 ring-1",
                  bmi < 18.5 ? "bg-sky/8 ring-sky/20"
                  : bmi < 25  ? "bg-emerald-deep/8 ring-emerald-deep/20"
                  : bmi < 30  ? "bg-amber/8 ring-amber/20"
                  :             "bg-coral/8 ring-coral/20",
                )}>
                  <span className={cn(
                    "font-display text-3xl font-medium tabular-nums",
                    bmi < 18.5 ? "text-sky" : bmi < 25 ? "text-emerald-deep" : bmi < 30 ? "text-amber" : "text-coral",
                  )}>
                    {bmi}
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-ink/40">BMI</div>
                    <div className="text-sm font-semibold text-ink">{getBMILabel(bmi)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={step === 0 ? !step1Ok : !step2Ok}
          className={cn(
            "mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all",
            (step === 0 ? step1Ok : step2Ok)
              ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98]"
              : "cursor-not-allowed bg-ink/8 text-ink/30",
          )}
        >
          {step === 1 ? "Complete setup" : "Continue"}
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
