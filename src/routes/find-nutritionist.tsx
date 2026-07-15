import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, BadgeCheck, Building2, ChevronDown, ChevronUp,
  Mail, MapPin, Phone, Plus, Search, Stethoscope, X,
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

function Field({
  label, value, onChange, placeholder, span,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; span?: 2;
}) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/40">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink/12 bg-white/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-emerald-deep/30 transition"
      />
    </div>
  );
}

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
    setSpecialty((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl bg-white border border-emerald-deep/15 p-8 text-center space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-deep/10">
          <BadgeCheck className="size-8 text-emerald-deep" />
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">Entry added</h3>
        <p className="text-sm text-ink/55">The listing will appear in the directory.</p>
        <button onClick={onClose} className="rounded-full bg-emerald-deep px-8 py-2.5 text-sm font-semibold text-mint">
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-3xl bg-white border border-ink/8 p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Add to Directory</h3>
            <p className="text-xs text-ink/40 mt-0.5">Fields marked * are required</p>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-full hover:bg-ink/8 text-ink/40 transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full name *"         value={name}        onChange={setName}        placeholder="e.g. Philemon Kwizera"                    span={2} />
          <Field label="Credential / title"  value={credential}  onChange={setCredential}  placeholder="e.g. Registered Nutritionist-Dietitian"   span={2} />
          <Field label="Institution / clinic" value={institution} onChange={setInstitution} placeholder="e.g. Nutri-Santé Rwanda"                  span={2} />
          <Field label="District / city *"   value={district}    onChange={setDistrict}    placeholder="e.g. Kicukiro, Kigali" />
          <Field label="Phone"               value={phone}       onChange={setPhone}       placeholder="+250 7XX XXX XXX" />
          <Field label="Address"             value={address}     onChange={setAddress}     placeholder="Street / building"                         span={2} />
          <Field label="Email"               value={email}       onChange={setEmail}       placeholder="name@example.com" />
          <Field label="Source / website"    value={source}      onChange={setSource}      placeholder="e.g. rahpc.org.rw" />
        </div>

        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-ink/40">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={cn(
                  "rounded-full px-3.5 py-1 text-xs font-medium border transition-all",
                  specialty.includes(s)
                    ? "bg-emerald-deep text-white border-emerald-deep shadow-sm"
                    : "border-ink/15 text-ink/60 hover:border-emerald-deep/50 hover:text-emerald-deep"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-600">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-ink/15 py-3 text-sm font-semibold text-ink/60 hover:bg-ink/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!valid || loading}
            className="flex-1 rounded-2xl bg-emerald-deep py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-40 transition-opacity"
          >
            {loading ? "Adding…" : "Add Entry"}
          </button>
        </div>
      </div>
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

  const hasContact = entry.phone || entry.email;

  return (
    <div className={cn(
      "rounded-2xl border bg-white flex flex-col transition-shadow hover:shadow-md",
      entry.available ? "border-emerald-deep/15" : "border-ink/10 opacity-60",
    )}>

      {/* Card body */}
      <div className="flex flex-col gap-3 p-5 flex-1">

        {/* Name row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-display text-base font-bold text-ink leading-snug">{entry.name}</h3>
              {entry.verified && (
                <BadgeCheck className="size-4 shrink-0 text-emerald-deep" title="Verified" />
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

        {/* Institution + location */}
        <div className="space-y-1.5">
          {entry.institution && (
            <div className="flex items-start gap-2 text-sm text-ink/70">
              <Building2 className="size-3.5 shrink-0 mt-0.5 text-emerald-deep" />
              <span className="leading-snug">{entry.institution}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-ink/55">
            <MapPin className="size-3.5 shrink-0 text-emerald-deep" />
            <span>{entry.district}</span>
          </div>
        </div>

        {/* Specialties */}
        {entry.specialty?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.specialty.map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-deep/8 px-2.5 py-0.5 text-[11px] font-medium text-emerald-deep/80"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Expandable: address + source + admin toggle */}
        {expanded && (
          <div className="border-t border-ink/8 pt-3 space-y-2 text-sm">
            {entry.address && (
              <p className="text-xs text-ink/50 leading-relaxed">{entry.address}</p>
            )}
            {entry.source && (
              <p className="text-[10px] text-ink/30">Source: {entry.source}</p>
            )}
            {isAdmin && (
              <button
                onClick={() => onToggle(entry.id, !entry.available)}
                className="text-xs font-semibold text-ink/40 hover:text-red-500 transition-colors"
              >
                {entry.available ? "Mark unavailable" : "Mark available"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact buttons — always visible at card bottom */}
      <div className="border-t border-ink/8 px-5 py-3.5 flex items-center gap-2">
        {entry.phone && (
          <a
            href={`tel:${entry.phone.replace(/\s/g, "")}`}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-deep py-2.5 text-sm font-semibold text-white hover:bg-emerald-deep/90 transition-colors shadow-sm"
          >
            <Phone className="size-4" />
            Call
          </a>
        )}
        {entry.email && (
          <a
            href={`mailto:${entry.email}`}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors",
              entry.phone
                ? "px-4 border border-emerald-deep/30 text-emerald-deep hover:bg-emerald-deep/8"
                : "flex-1 bg-emerald-deep text-white shadow-sm hover:bg-emerald-deep/90"
            )}
          >
            <Mail className="size-4" />
            {entry.phone ? "Email" : "Email"}
          </a>
        )}
        {!hasContact && (
          <span className="flex-1 text-center text-xs text-ink/35">No contact listed</span>
        )}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="ml-auto flex items-center gap-1 rounded-xl border border-ink/10 px-3 py-2.5 text-xs font-medium text-ink/50 hover:text-ink/80 hover:border-ink/20 transition-colors"
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          {expanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function FindNutritionist() {
  const navigate = useNavigate();
  const { user, profile, loaded } = useAuth();
  const { entries, loading, addEntry, toggleAvailability } = useNutritionistDirectory(user);

  const [query,   setQuery]   = useState("");
  const [district, setDistrict] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

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
    <div className="min-h-screen bg-gray-50 text-ink pb-24">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-ink/8 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="grid size-9 place-items-center rounded-full hover:bg-ink/6 text-ink/50 transition-colors"
            >
              <ArrowLeft className="size-4.5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-deep shadow-sm">
                <Stethoscope className="size-4.5 text-white" />
              </div>
              <div>
                <div className="font-display text-[15px] font-bold text-ink leading-tight">
                  Find a Nutritionist
                </div>
                <div className="text-[10px] uppercase tracking-widest text-ink/40">
                  Rwanda · Verified Directory
                </div>
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-deep px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-deep/90 transition-colors"
            >
              <Plus className="size-4" />
              Add Entry
            </button>
          )}
        </div>
      </header>

      {/* ── Search + filters ── */}
      <div className="bg-white border-b border-ink/6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 space-y-3">

          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, clinic, or specialty…"
              className="w-full rounded-xl border border-ink/12 bg-gray-50 py-3 pl-11 pr-10 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-emerald-deep/30 focus:bg-white transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 grid size-6 place-items-center rounded-full hover:bg-ink/10 text-ink/40"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* District filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {districts.map((d) => (
              <button
                key={d}
                onClick={() => setDistrict(d)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold border transition-all",
                  district === d
                    ? "bg-emerald-deep text-white border-emerald-deep shadow-sm"
                    : "border-ink/15 text-ink/55 bg-white hover:border-emerald-deep/40 hover:text-emerald-deep"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">

        {/* Disclaimer */}
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
          <span className="text-base shrink-0">⚠️</span>
          <span>
            Listings sourced from public directories (RAHPC, nutrirwanda.com, afridoctor.com).
            Always verify credentials before booking a consultation.
          </span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="size-7 rounded-full border-[3px] border-emerald-deep/20 border-t-emerald-deep animate-spin" />
          </div>

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-ink/5">
              <Search className="size-7 text-ink/30" />
            </div>
            <div>
              <p className="font-semibold text-ink/60">No results found</p>
              <p className="mt-1 text-sm text-ink/35">
                {query ? `Nothing matched "${query}"` : "No listings for this district yet."}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAdd(true)}
                className="mt-1 flex items-center gap-2 rounded-xl bg-emerald-deep px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                <Plus className="size-4" />
                Add this nutritionist
              </button>
            )}
          </div>

        ) : (
          <>
            <p className="mb-4 text-xs font-medium text-ink/40">
              {filtered.length} {filtered.length === 1 ? "listing" : "listings"}
              {district !== "All" ? ` in ${district}` : " across Rwanda"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
