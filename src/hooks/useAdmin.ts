import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type NutritionistApplication = {
  id: string;
  user_id: string;
  full_name: string;
  credential_no: string;
  institution: string;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export function useAdmin(user: User | null) {
  const [applications, setApplications] = useState<NutritionistApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setApplications([]); setLoading(false); return; }
    load();
  }, [user?.id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("nutritionist_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApplications((data ?? []) as NutritionistApplication[]);
    setLoading(false);
  }

  async function approve(application: NutritionistApplication): Promise<true | string> {
    const { error: roleErr } = await supabase
      .from("profiles")
      .update({ role: "nutritionist" })
      .eq("id", application.user_id);
    if (roleErr) return roleErr.message;

    const { error: appErr } = await supabase
      .from("nutritionist_applications")
      .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", application.id);
    if (appErr) return appErr.message;

    setApplications((prev) =>
      prev.map((a) => (a.id === application.id ? { ...a, status: "approved" } : a)),
    );
    return true;
  }

  async function reject(application: NutritionistApplication): Promise<true | string> {
    const { error: roleErr } = await supabase
      .from("profiles")
      .update({ role: "patient" })
      .eq("id", application.user_id);
    if (roleErr) return roleErr.message;

    const { error: appErr } = await supabase
      .from("nutritionist_applications")
      .update({ status: "rejected", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", application.id);
    if (appErr) return appErr.message;

    setApplications((prev) =>
      prev.map((a) => (a.id === application.id ? { ...a, status: "rejected" } : a)),
    );
    return true;
  }

  return { applications, loading, approve, reject, reload: load };
}
