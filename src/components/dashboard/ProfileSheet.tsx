import { useState, useEffect } from "react";
import { Check, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { type UserProfile, getBMI, getBMILabel } from "@/hooks/useProfile";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: UserProfile | null;
  onSave: (p: UserProfile) => void;
  onReset: () => void;
};

export function ProfileSheet({ open, onOpenChange, profile, onSave, onReset }: Props) {
  const [name, setName]     = useState("");
  const [age, setAge]       = useState("");
  const [sex, setSex]       = useState<"male" | "female">("male");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAge(String(profile.age));
      setSex(profile.sex);
      setWeight(String(profile.weightKg));
      setHeight(String(profile.heightCm));
    }
  }, [profile, open]);

  const bmi = weight && height && Number(weight) > 0 && Number(height) > 0
    ? getBMI(Number(weight), Number(height))
    : null;

  const valid = name.trim() && Number(age) > 0 && Number(weight) > 0 && Number(height) > 0;

  function handleSave() {
    if (!valid) return;
    onSave({ name: name.trim(), age: Number(age), sex, weightKg: Number(weight), heightCm: Number(height) });
    setSaved(true);
    setTimeout(() => { setSaved(false); onOpenChange(false); }, 800);
  }

  const inputCls = "w-full rounded-2xl bg-ink/4 px-4 py-3 text-sm ring-1 ring-ink/8 focus:outline-none focus:ring-2 focus:ring-emerald-deep/40 transition-shadow";
  const labelCls = "block text-[11px] font-semibold uppercase tracking-widest text-ink/40 mb-1.5";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm flex flex-col gap-0 p-0 overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-ink/5">
          <SheetTitle className="font-display text-xl font-semibold text-ink">Your Profile</SheetTitle>
          <p className="text-sm text-ink/50">Personalises your disease risk analysis.</p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <label className="block">
            <span className={labelCls}>Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Age</span>
              <input type="number" min={10} max={100} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 24" className={inputCls} />
            </label>
            <div>
              <span className={labelCls}>Sex</span>
              <div className="flex gap-2">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSex(s)}
                    className={cn(
                      "flex-1 rounded-xl py-2.5 text-xs font-semibold capitalize transition-all",
                      sex === s
                        ? "bg-emerald-deep text-mint"
                        : "bg-ink/5 text-ink/50 hover:bg-ink/10",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelCls}>Weight (kg)</span>
              <input type="number" min={30} max={250} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="68" className={inputCls} />
            </label>
            <label className="block">
              <span className={labelCls}>Height (cm)</span>
              <input type="number" min={100} max={250} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="172" className={inputCls} />
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
                "font-display text-2xl font-medium tabular-nums",
                bmi < 18.5 ? "text-sky" : bmi < 25 ? "text-emerald-deep" : bmi < 30 ? "text-amber" : "text-coral",
              )}>
                {bmi}
              </span>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-ink/40">BMI</div>
                <div className="text-sm font-semibold">{getBMILabel(bmi)}</div>
              </div>
            </div>
          )}

          <button
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-semibold text-ink/40 hover:text-coral hover:bg-coral/5 transition-colors"
          >
            <LogOut className="size-3.5" /> Reset profile
          </button>
        </div>

        <div className="px-6 py-4 border-t border-ink/5 bg-white/50">
          <button
            onClick={handleSave}
            disabled={!valid}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all",
              valid
                ? "bg-emerald-deep text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98]"
                : "cursor-not-allowed bg-ink/8 text-ink/30",
            )}
          >
            {saved ? <><Check className="size-4" /> Saved!</> : "Save changes"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
