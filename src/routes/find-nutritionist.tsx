import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Building2, ChevronDown, ChevronUp,
  Mail, MapPin, Phone, Plus, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  useNutritionistDirectory,
  type DirectoryEntry,
  type NewEntry,
} from "@/hooks/useNutritionistDirectory";

export const Route = createFileRoute("/find-nutritionist")({
  head: () => ({ meta: [{ title: "Find a Nutritionist · Nutrisense-AI" }] }),
  component: FindNutritionist,
});

// ── Add-entry dialog ──────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS = [
  "Weight Management", "Diabetes Nutrition", "Anaemia & Iron Deficiency",
  "Pregnancy & Maternal Nutrition", "Paediatric Nutrition", "Sports Nutrition",
  "Clinical Dietetics", "Medical Nutrition Therapy", "Non-Communicable Diseases",
  "Nutrition Counselling",
];

function AddEntryDialog({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: NewEntry) => Promise<true | string>;
}) {
  const [name,        setName]        = useState("");
  const [credential,  setCredential]  = useState("");
  const [institution, setInstitution] = useState("");
  const [district,    setDistrict]    = useState("");
  const [address,     setAddress]     = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [specialty,   setSpecialty]   = useState<string[]>([]);
  const [source,      setSource]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [done,        setDone]        = useState(false);

  const toggleSpecialty = (s: string) =>
    setSpecialty((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const valid = name.trim().length > 1 && district.trim().length > 1;

  async function handleAdd() {
    if (!valid) return;
    setLoading(true); setError("");
    const result = await onAdd({
      name: name.trim(),
      credential:  credential.trim()  || null,
      institution: institution.trim() || null,
      district:    district.trim(),
      address:     address.trim()     || null,
      phone:       phone.trim()       || null,
      email:       email.trim().toLowerCase() || null,
      specialty,
      available:   true,
      source:      source.trim()      || null,
    });
    setLoading(false);
    if (result === true) setDone(true);
    else setError(result);
  }

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl nv-glass border border-emerald-deep/15 p-8 text-center space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-deep/10">
          <BadgeCheck className="size-8 text-emerald-deep" />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">Entry added</h3>
        <p className="text-sm text-ink/55">The listing will appear in the directory once reviewed by an admin.</p>
        <button onClick={onClose} className="mt-2 rounded-full bg-emerald-deep px-6 py-2.5 text-sm font-semibold text-mint">
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-3xl nv-glass border border-emerald-deep/15 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Add to Directory</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-ink/8 text-ink/40 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Full name *" value={name} onChange={setName} placeholder="e.g. Philemon Kwizera" span={2} />
          <Field label="Credential / title" value={credential} onChange={setCredential} placeholder="e.g. Registered Nutritionist-Dietitian (RAHPC)" span={2} />
          <Field label="Institution / clinic" value={institution} onChange={setInstitution} placeholder="e.g. Nutri-Santé Rwanda" span={2} />
          <Field label="District / city *" value={district} onChange={setDistrict} placeholder="e.g. Kicukiro, Kigali" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="+250 7XX XXX XXX" />
          <Field label="Address" value={address} onChange={setAddress} placeholder="Street / building" span={2} />
          <Field label="Email" value={email} onChange={setEmail} placeholder="name@example.com" />
          <Field label="Source / website" value={source} onChange={setSource} placeholder="e.g. rahpc.org.rw" />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                  specialty.includes(s)
                    ? "bg-emerald-deep text-mint border-emerald-deep"
                    : "border-ink/15 text-ink/55 hover:border-emerald-deep/40"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          onClick={handleAdd}
          disabled={!valid || loading}
          className="w-full rounded-2xl bg-emerald-deep py-3 text-sm font-semibold text-mint disabled:opacity-40 transition-opacity"
        >
          {loading ? "Adding…" : "Add Entry"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, span,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; span?: 1 | 2;
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-ink/50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/10 bg-white/50 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-emerald-deep/30"
      />
    </div>
  );
}

// ── Nutritionist card ─────────────────────────────────────────────────────────

function NutritionistCard({
  entry,
  isAdmin,
  onToggle,
}: {
  entry: DirectoryEntry;
  isAdmin: boolean;
  onToggle: (id: string, available: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "rounded-3xl nv-glass border p-5 flex flex-col gap-3 transition-all",
      entry.available
        ? "border-emerald-deep/12 hover:border-emerald-deep/25"
        : "border-ink/8 opacity-60",
    )}>

      {/* Name + badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display font-semibold text-ink leading-snug">{entry.name}</h3>
            {entry.verified && (
              <BadgeCheck className="size-4 shrink-0 text-emerald-deep" aria-label="Verified" />
            )}
          </div>
          {entry.credential && (
            <p className="mt-0.5 text-xs text-ink/50 leading-snug">{entry.credential}</p>
          )}
        </div>
        {!entry.available && (
          <span className="shrink-0 rounded-full bg-ink/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/40">
            Unavailable
          </span>
        )}
      </div>

      {/* Institution + district */}
      <div className="space-y-1.5">
        {entry.institution && (
          <div className="flex items-center gap-2 text-sm text-ink/70">
            <Building2 className="size-3.5 shrink-0 text-emerald-deep/60" />
            <span>{entry.institution}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-ink/60">
          <MapPin className="size-3.5 shrink-0 text-emerald-deep/60" />
          <span>{entry.district}</span>
        </div>
      </div>

      {/* Specialties */}
      {entry.specialty?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.specialty.map((s) => (
            <span
              key={s}
              className="rounded-full bg-emerald-deep/8 px-2.5 py-0.5 text-[11px] font-medium text-emerald-deep"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Expanded: address + contact */}
      {expanded && (
        <div className="border-t border-ink/8 pt-3 space-y-2">
          {entry.address && (
            <p className="text-xs text-ink/50 leading-relaxed">{entry.address}</p>
          )}
          {entry.phone && (
            <a
              href={`tel:${entry.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm font-medium text-emerald-deep hover:underline"
            >
              <Phone className="size-3.5" />
              {entry.phone}
            </a>
          )}
          {entry.email && (
            <a
              href={`mailto:${entry.email}`}
              className="flex items-center gap-2 text-sm font-medium text-emerald-deep hover:underline"
            >
              <Mail className="size-3.5" />
              {entry.email}
            </a>
          )}
          {entry.source && (
            <p className="text-[10px] text-ink/30 mt-1">Source: {entry.source}</p>
          )}
          {isAdmin && (
            <button
              onClick={() => onToggle(entry.id, !entry.available)}
              className="mt-1 text-xs font-semibold text-ink/40 hover:text-coral transition-colors"
            >
              {entry.available ? "Mark unavailable" : "Mark available"}
            </button>
          )}
        </div>
      )}

      {/* Expand / contact row */}
      <div className="flex items-center justify-between pt-1">
        {!expanded && entry.phone ? (
          <a
            href={`tel:${entry.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-deep hover:bg-emerald-deep/20 transition-colors"
          >
            <Phone className="size-3" />
            Call
          </a>
        ) : !expanded && entry.email ? (
          <a
            href={`mailto:${entry.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-deep/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-deep hover:bg-emerald-deep/20 transition-colors"
          >
            <Mail className="size-3" />
            Email
          </a>
        ) : (
          <span />
        )}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-xs text-ink/40 hover:text-ink/70 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="size-3.5" /> Less</>
          ) : (
            <><ChevronDown className="size-3.5" /> Details</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function FindNutritionist() {
  const navigate   = useNavigate();
  const { user, profile, loaded } = useAuth();
  const { entries, loading, addEntry, toggleAvailability } = useNutritionistDirectory(user);

  const [query,      setQuery]      = useState("");
  const [district,   setDistrict]   = useState("All");
  const [showAdd,    setShowAdd]    = useState(false);

  useEffect(() => {
    if (loaded && !user) navigate({ to: "/login" });
  }, [loaded, user, navigate]);

  const isAdmin = profile?.role === "admin";

  const districts = ["All", ...Array.from(new Set(entries.map((e) => e.district))).sort()];

  const filtered = entries.filter((e) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      e.name.toLowerCase().includes(q) ||
      (e.institution ?? "").toLowerCase().includes(q) ||
      e.district.toLowerCase().includes(q) ||
      (e.specialty ?? []).some((s) => s.toLowerCase().includes(q));
    const matchD = district === "All" || e.district === district;
    return matchQ && matchD;
  });

  return (
    <div className="nv-mesh min-h-screen text-ink pb-16">

      {/* Header */}
      <header className="sticky top-0 z-40 nv-glass border-b border-emerald-deep/10">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="grid size-9 place-items-center rounded-full hover:bg-ink/8 text-ink/50 transition-colors"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div>
              <div className="font-display text-[15px] font-semibold text-emerald-deep">
                Find a Nutritionist
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-ink/40">
                Rwanda · Verified Directory
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-full bg-emerald-deep px-4 py-2 text-xs font-semibold text-mint shadow-sm hover:bg-emerald-deep/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Add Entry
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-6 space-y-5">

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, clinic, or specialty…"
            className="w-full rounded-2xl border border-ink/10 bg-white/60 py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-emerald-deep/25"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full hover:bg-ink/8 text-ink/35"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* District chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setDistrict(d)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-colors",
                district === d
                  ? "bg-emerald-deep text-mint border-emerald-deep"
                  : "border-ink/12 text-ink/55 hover:border-emerald-deep/30 bg-white/30"
              )}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Info banner */}
        <div className="rounded-2xl border border-amber/20 bg-amber/8 px-4 py-3 text-xs text-ink/60 leading-relaxed">
          <span className="font-semibold text-amber-700">Note:</span> Listings are sourced from public
          directories (RAHPC, nutrirwanda.com, afridoctor.com). Always verify credentials before booking.
          {isAdmin && " As admin you can add or disable entries."}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="size-6 rounded-full border-2 border-emerald-deep/20 border-t-emerald-deep animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-sm text-ink/50">No results for &ldquo;{query}&rdquo;</p>
            {isAdmin && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1 rounded-full bg-emerald-deep/10 px-4 py-2 text-xs font-semibold text-emerald-deep hover:bg-emerald-deep/20"
              >
                + Add this nutritionist
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-ink/40">
              {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
              {district !== "All" ? ` in ${district}` : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((entry) => (
                <NutritionistCard
                  key={entry.id}
                  entry={entry}
                  isAdmin={isAdmin}
                  onToggle={toggleAvailability}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {showAdd && (
        <AddEntryDialog
          onClose={() => setShowAdd(false)}
          onAdd={async (entry) => {
            const result = await addEntry(entry);
            if (result === true) setShowAdd(false);
            return result;
          }}
        />
      )}
    </div>
  );
}
