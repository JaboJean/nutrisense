import { useRef, useState } from "react";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FOOD_DATABASE, type LogItem } from "@/data/mock";

type Stage = "idle" | "preview" | "analyzing" | "result";

type Props = { onAdd: (item: LogItem) => void };

export function PhotoCapture({ onAdd }: Props) {
  const inputRef            = useRef<HTMLInputElement>(null);
  const [stage, setStage]   = useState<Stage>("idle");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [detected, setDetected] = useState<typeof FOOD_DATABASE[0] | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setStage("preview");
  }

  function runAnalysis() {
    setStage("analyzing");
    setTimeout(() => {
      const food = FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];
      setDetected(food);
      setStage("result");
    }, 2200);
  }

  function handleAddToLog() {
    if (!detected) return;
    onAdd({
      id:   `photo-${Date.now()}`,
      name: detected.name,
      meta: `Photo log · ${detected.kcal} kcal · ${detected.iron}mg Iron`,
      tag:  detected.tag,
      tone: detected.tone,
      glyph: detected.glyph,
      meal: "Lunch",
    });
    reset();
  }

  function reset() {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    setImgUrl(null);
    setDetected(null);
    setStage("idle");
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="rounded-3xl nv-glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink/40">AI Food Recognition</div>
          <h4 className="font-display text-base font-semibold text-ink">Photo Analysis</h4>
        </div>
        <div className="grid size-8 place-items-center rounded-full bg-emerald-deep/10 text-emerald-deep">
          <Camera className="size-3.5" />
        </div>
      </div>

      {/* ── Idle / Drop zone ── */}
      {stage === "idle" && (
        <button
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed py-8 transition-all",
            dragging
              ? "border-emerald-deep/60 bg-emerald-deep/5"
              : "border-ink/15 hover:border-emerald-deep/40 hover:bg-emerald-deep/3",
          )}
        >
          <div className="grid size-12 place-items-center rounded-full bg-emerald-deep/8">
            <Upload className="size-5 text-emerald-deep" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-ink/70">
              Tap to upload a food photo
            </p>
            <p className="mt-0.5 text-xs text-ink/40">or drag &amp; drop · JPG / PNG / WEBP</p>
          </div>
        </button>
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

      {/* ── Analyzing ── */}
      {stage === "analyzing" && imgUrl && (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Food preview" className="h-48 w-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-emerald-deep/30 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-mint" />
              <span className="text-sm font-semibold text-mint">Identifying food…</span>
            </div>
          </div>
          <div className="space-y-1.5 px-1">
            {["Classifying image", "Looking up nutrients", "Estimating portion"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-xs text-ink/40">
                <Loader2
                  className="size-3 animate-spin"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                {s}…
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {stage === "result" && imgUrl && detected && (
        <div className="space-y-3 animate-nv-rise">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={imgUrl} alt="Food preview" className="h-32 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-deep/80 to-transparent flex items-end p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{detected.glyph}</span>
                <div>
                  <div className="text-sm font-bold text-mint">{detected.name}</div>
                  <div className="text-[10px] text-mint/70">Detected with high confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nutrients */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "kcal",    v: detected.kcal,          c: "amber"   as const },
              { l: "protein", v: `${detected.protein}g`,  c: "sky"     as const },
              { l: "iron",    v: `${detected.iron}mg`,    c: "coral"   as const },
              { l: "fiber",   v: `${detected.fiber}g`,    c: "emerald" as const },
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

          <p className="text-[11px] text-ink/50 italic px-0.5">{detected.note}</p>

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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
