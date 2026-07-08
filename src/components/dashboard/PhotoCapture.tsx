import { useRef, useState } from "react";
import { Camera, Upload, X, Loader2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOOD_DATABASE, type LogItem } from "@/data/mock";

// ── ML API integration point ──────────────────────────────────────────────────
// When your FastAPI is ready, set VITE_ML_API_URL in .env.local and remove the
// mock below. The fetch signature stays identical — only the URL changes.
//
//   VITE_ML_API_URL=http://localhost:8000
//
const ML_API_URL = import.meta.env.VITE_ML_API_URL as string | undefined;

interface FoodResult {
  name:       string;
  confidence: number; // 0–1
  kcal:       number;
  protein:    number;
  iron:       number;
  fiber:      number;
  vitC:       number;
  glyph:      string;
  tone:       "emerald" | "amber" | "sky";
  tag:        string;
}

async function classifyFood(file: File): Promise<FoodResult> {
  // ── Real ML path ─────────────────────────────────────────────────────────
  if (ML_API_URL) {
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${ML_API_URL}/api/predict/food`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json() as Promise<FoodResult>;
  }

  // ── Mock path (remove when ML is ready) ──────────────────────────────────
  await new Promise((r) => setTimeout(r, 2200));
  const food = FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];
  return {
    name:       food.name,
    confidence: 0.87 + Math.random() * 0.12,
    kcal:       food.kcal,
    protein:    food.protein,
    iron:       food.iron,
    fiber:      food.fiber,
    vitC:       food.vitC,
    glyph:      food.glyph,
    tone:       food.tone,
    tag:        food.tag,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

type Stage = "idle" | "preview" | "analyzing" | "result" | "low-confidence" | "error";

type Props = { onAdd: (item: LogItem) => void };

const PORTION_OPTIONS = [
  { label: "½×",  value: 0.5 },
  { label: "1×",  value: 1   },
  { label: "1½×", value: 1.5 },
  { label: "2×",  value: 2   },
  { label: "3×",  value: 3   },
];

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

function autoMeal(): string {
  const h = new Date().getHours();
  if (h < 10) return "Breakfast";
  if (h < 14) return "Lunch";
  if (h < 18) return "Snack";
  return "Dinner";
}

export function PhotoCapture({ onAdd }: Props) {
  const fileRef             = useRef<HTMLInputElement>(null);
  const cameraRef           = useRef<HTMLInputElement>(null);
  const [stage, setStage]   = useState<Stage>("idle");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [result, setResult] = useState<FoodResult | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [servings, setServings] = useState(1);
  const [meal, setMeal]         = useState<string>(autoMeal());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(URL.createObjectURL(file));
    setImgFile(file);
    setStage("preview");
  }

  async function runAnalysis() {
    if (!imgFile) return;
    setStage("analyzing");
    setErrMsg(null);
    setStatusMsg(null);
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const food = await classifyFood(imgFile);
        setStatusMsg(null);
        if (food.confidence < 0.45) {
          setResult(food);
          setStage("low-confidence");
          return;
        }
        setResult(food);
        setStage("result");
        return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Analysis failed";
        if (msg.includes("503") && attempt < MAX_RETRIES) {
          setStatusMsg(`Server waking up… retry ${attempt + 1} of ${MAX_RETRIES}`);
          await new Promise((r) => setTimeout(r, 10_000));
          continue;
        }
        setErrMsg(
          msg.includes("503")
            ? "Server took too long to wake up. Please try again in a minute."
            : msg,
        );
        setStage("error");
        return;
      }
    }
  }

  async function handleAddToLog() {
    if (!result) return;
    const scaledKcal    = Math.round(result.kcal    * servings);
    const scaledIron    = parseFloat((result.iron    * servings).toFixed(1));
    const scaledProtein = parseFloat((result.protein * servings).toFixed(1));

    let persistedImg: string | undefined;
    if (imgFile) {
      persistedImg = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imgFile);
      });
    }

    onAdd({
      id:        `photo-${Date.now()}`,
      name:      result.name,
      meta:      `Photo · ${scaledKcal} kcal · ${scaledIron}mg iron · ${scaledProtein}g protein`,
      tag:       result.tag,
      tone:      result.tone,
      glyph:     result.glyph,
      meal,
      img:       persistedImg,
      logged_at: new Date().toISOString(),
    });
    setImgUrl(null);
    setImgFile(null);
    setResult(null);
    setErrMsg(null);
    setServings(1);
    setMeal(autoMeal());
    setStage("idle");
  }

  function reset() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setImgFile(null);
    setResult(null);
    setErrMsg(null);
    setServings(1);
    setMeal(autoMeal());
    setStage("idle");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  };

  return (
    <div className="rounded-3xl nv-glass p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40">AI Food Recognition</div>
          <h4 className="font-display text-base font-semibold text-ink">Photo Analysis</h4>
        </div>
        <div className="grid size-8 place-items-center rounded-full bg-emerald-deep/10 text-emerald-deep">
          <Camera className="size-3.5" />
        </div>
      </div>

      {/* ── Idle / drop zone ── */}
      {stage === "idle" && (
        <div className="space-y-2">
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-7 transition-all",
              dragging
                ? "border-emerald-deep/60 bg-emerald-deep/5"
                : "border-ink/15 hover:border-emerald-deep/40 hover:bg-emerald-deep/3",
            )}
          >
            <div className="grid size-12 place-items-center rounded-full bg-emerald-deep/8">
              <Upload className="size-5 text-emerald-deep" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-ink/70">Upload a food photo</p>
              <p className="mt-0.5 text-xs text-ink/40">Drag &amp; drop or tap to browse · JPG / PNG / WEBP</p>
            </div>
          </button>

          {/* Camera shortcut (shows camera roll on mobile) */}
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 py-2.5 text-sm font-medium text-ink/60 hover:border-emerald-deep/30 hover:text-emerald-deep transition-colors"
          >
            <Camera className="size-4" /> Take a photo
          </button>

          {/* Hidden inputs */}
          <input ref={fileRef}   type="file" accept="image/*"                        className="hidden" onChange={pickFile} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"  className="hidden" onChange={pickFile} />
        </div>
      )}

      {/* ── Preview ── */}
      {stage === "preview" && imgUrl && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Food preview" className="h-48 w-full object-cover" />
            <button
              onClick={reset}
              className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink/60 text-white backdrop-blur-sm hover:bg-ink/80 transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <button
            onClick={runAnalysis}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-deep py-3 text-sm font-semibold text-mint shadow-[0_10px_28px_-12px_rgba(15,118,110,0.7)] hover:scale-[1.01] active:scale-[0.98] transition-transform"
          >
            <Sparkles className="size-4" /> Analyse food
          </button>
        </div>
      )}

      {/* ── Analysing ── */}
      {stage === "analyzing" && imgUrl && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Analysing" className="h-48 w-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-emerald-deep/30 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-mint" />
              <span className="text-sm font-semibold text-mint text-center px-4">
                {statusMsg ?? (ML_API_URL ? "Sending to AI model…" : "Identifying food…")}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 px-1">
            {["Preprocessing image", "Running ViT classifier", "Mapping nutrients"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-xs text-ink/40">
                <Loader2 className="size-3 animate-spin" style={{ animationDelay: `${i * 0.3}s` }} />
                {s}…
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {stage === "result" && imgUrl && result && (
        <div className="space-y-3 animate-nv-rise">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Result" className="h-32 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result.glyph}</span>
                <div>
                  <div className="text-sm font-bold text-mint">{result.name}</div>
                  <div className="text-[10px] text-mint/70">
                    {Math.round(result.confidence * 100)}% confidence
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portion selector */}
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-widest text-ink/40">Portion size</div>
            <div className="flex gap-1.5">
              {PORTION_OPTIONS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setServings(p.value)}
                  className={cn(
                    "flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all",
                    servings === p.value
                      ? "bg-emerald-deep text-mint shadow-sm"
                      : "bg-ink/5 text-ink/50 hover:bg-ink/10",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal type */}
          <div>
            <div className="mb-1.5 text-[10px] uppercase tracking-widest text-ink/40">Meal type</div>
            <div className="flex gap-1.5">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={cn(
                    "flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all",
                    meal === m
                      ? "bg-emerald-deep text-mint shadow-sm"
                      : "bg-ink/5 text-ink/50 hover:bg-ink/10",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Nutrient chips — scaled by servings */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "kcal",    v: Math.round(result.kcal    * servings),                      c: "amber"   as const },
              { l: "protein", v: `${(result.protein * servings).toFixed(1)}g`,               c: "sky"     as const },
              { l: "iron",    v: `${(result.iron    * servings).toFixed(1)}mg`,              c: "coral"   as const },
              { l: "fiber",   v: `${(result.fiber   * servings).toFixed(1)}g`,               c: "emerald" as const },
            ].map((n) => (
              <div key={n.l} className="rounded-xl bg-white/70 p-2 text-center ring-1 ring-ink/5">
                <div className={cn(
                  "font-display text-sm font-semibold tabular-nums",
                  n.c === "amber"   && "text-amber",
                  n.c === "sky"     && "text-sky",
                  n.c === "coral"   && "text-coral",
                  n.c === "emerald" && "text-emerald-deep",
                )}>
                  {n.v}
                </div>
                <div className="text-[9px] uppercase tracking-wide text-ink/40">{n.l}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddToLog}
              className="flex-1 rounded-2xl bg-emerald-deep py-2.5 text-sm font-semibold text-mint shadow-[0_8px_20px_-10px_rgba(15,118,110,0.6)] hover:scale-[1.01] active:scale-[0.98] transition-transform"
            >
              Add to log
            </button>
            <button
              onClick={reset}
              className="rounded-2xl bg-ink/5 px-4 py-2.5 text-sm font-semibold text-ink/50 hover:bg-ink/10 transition-colors"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Low confidence — show best guess, let user confirm or discard ── */}
      {stage === "low-confidence" && result && imgUrl && (
        <div className="space-y-3 animate-nv-rise">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Result" className="h-32 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-amber/80 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result.glyph}</span>
                <div>
                  <div className="text-sm font-bold text-white">{result.name}?</div>
                  <div className="text-[10px] text-white/70">
                    {Math.round(result.confidence * 100)}% confidence · best guess
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-amber/8 px-4 py-3 ring-1 ring-amber/20">
            <p className="text-xs font-semibold text-amber">Low confidence result</p>
            <p className="mt-0.5 text-xs text-ink/55">
              The model isn't sure. If this looks right, log it — otherwise discard and log manually.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setStage("result")}
              className="rounded-2xl bg-emerald-deep py-2.5 text-sm font-semibold text-mint transition-colors hover:opacity-90"
            >
              Looks right
            </button>
            <button
              onClick={reset}
              className="rounded-2xl bg-ink/5 py-2.5 text-sm font-semibold text-ink/60 transition-colors hover:bg-ink/10"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {stage === "error" && (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-coral/8 py-8 ring-1 ring-coral/20">
            <AlertCircle className="size-8 text-coral" />
            <div className="text-center">
              <p className="text-sm font-semibold text-coral">Analysis failed</p>
              <p className="mt-1 text-xs text-ink/50">{errMsg}</p>
            </div>
          </div>
          <button
            onClick={() => setStage("preview")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink/5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-ink/10 transition-colors"
          >
            <RefreshCw className="size-4" /> Try again
          </button>
          <button onClick={reset} className="w-full text-center text-xs text-ink/35 hover:text-ink/60 transition-colors py-1">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
