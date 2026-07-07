import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { FoodTone, LogItem } from "@/data/mock";
import type { UserProfile } from "@/hooks/useProfile";

export type PatientRecord = {
  id: string;
  profile: UserProfile;
  todayLogs: LogItem[];
  recentLogs: LogItem[];
  assignedAt: string;
};

export function usePatients(user: User | null) {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) { setPatients([]); setLoading(false); return; }
    load();
  }, [user?.id]);

  async function load() {
    setLoading(true);

    const { data: assignments } = await supabase
      .from("patient_assignments")
      .select("patient_id, created_at")
      .eq("nutritionist_id", user!.id);

    if (!assignments?.length) { setPatients([]); setLoading(false); return; }

    const ids = assignments.map((a: Record<string, string>) => a.patient_id);

    const [{ data: profiles }, { data: logs }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", ids),
      supabase
        .from("food_logs")
        .select("*")
        .in("user_id", ids)
        .order("logged_at", { ascending: false }),
    ]);

    const now = new Date();

    const list: PatientRecord[] = (profiles ?? []).map((p: Record<string, unknown>) => {
      const assignment = assignments.find(
        (a: Record<string, string>) => a.patient_id === p.id,
      );

      const patientLogs: LogItem[] = (logs ?? [])
        .filter((l: Record<string, unknown>) => l.user_id === p.id)
        .map((l: Record<string, unknown>) => ({
          id:        l.id         as string,
          name:      l.name       as string,
          meta:      (l.meta   ?? "")         as string,
          tag:       (l.tag    ?? "neutral")  as string,
          tone:      (l.tone   ?? "emerald")  as FoodTone,
          glyph:     (l.glyph  ?? "🍽️")      as string,
          img:       (l.img    ?? undefined)  as string | undefined,
          meal:      (l.meal   ?? "Lunch")    as string,
          logged_at: l.logged_at              as string | undefined,
        }));

      const todayLogs = patientLogs.filter((l) => {
        if (!l.logged_at) return false;
        const d = new Date(l.logged_at);
        return (
          d.getFullYear() === now.getFullYear() &&
          d.getMonth()    === now.getMonth()    &&
          d.getDate()     === now.getDate()
        );
      });

      return {
        id: p.id as string,
        profile: {
          name:     (p.name      ?? "")       as string,
          age:      (p.age       ?? 0)        as number,
          sex:      ((p.sex      ?? "female") as "male" | "female"),
          weightKg: (p.weight_kg ?? 0)        as number,
          heightCm: (p.height_cm ?? 0)        as number,
          role:     "patient" as const,
        },
        todayLogs,
        recentLogs: patientLogs.slice(0, 30),
        assignedAt: (assignment as Record<string, string>)?.created_at ?? "",
      };
    });

    setPatients(list);
    setLoading(false);
  }

  async function addPatient(patientId: string): Promise<true | string> {
    if (!user) return "Not authenticated.";
    const { error } = await supabase
      .from("patient_assignments")
      .insert({ nutritionist_id: user.id, patient_id: patientId });
    if (error) {
      if (error.code === "23505") return "This patient is already in your list.";
      return "Could not add patient — double-check the ID and try again.";
    }
    await load();
    return true;
  }

  async function removePatient(patientId: string) {
    await supabase
      .from("patient_assignments")
      .delete()
      .eq("nutritionist_id", user!.id)
      .eq("patient_id", patientId);
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
  }

  return { patients, loading, addPatient, removePatient };
}
