import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface DirectoryEntry {
  id: string;
  name: string;
  credential: string | null;
  institution: string | null;
  district: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  specialty: string[];
  available: boolean;
  verified: boolean;
  source: string | null;
  created_at: string;
}

export type NewEntry = Omit<DirectoryEntry, "id" | "created_at" | "verified">;

export function useNutritionistDirectory(user: User | null) {
  const [entries, setEntries]   = useState<DirectoryEntry[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("nutritionist_directory")
      .select("*")
      .order("verified", { ascending: false })
      .order("name")
      .then(({ data }) => {
        if (data) setEntries(data as DirectoryEntry[]);
        setLoading(false);
      });
  }, [user]);

  async function addEntry(entry: NewEntry): Promise<true | string> {
    const { data, error } = await supabase
      .from("nutritionist_directory")
      .insert([{ ...entry, verified: false }])
      .select()
      .single();
    if (error) return error.message;
    setEntries((prev) => [data as DirectoryEntry, ...prev]);
    return true;
  }

  async function toggleAvailability(id: string, available: boolean) {
    const { error } = await supabase
      .from("nutritionist_directory")
      .update({ available })
      .eq("id", id);
    if (!error)
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, available } : e)));
  }

  return { entries, loading, addEntry, toggleAvailability };
}
