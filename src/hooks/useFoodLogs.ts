import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { FoodTone, LogItem } from "@/data/mock";

export function useFoodLogs(user: User | null) {
  const [logs, setLogs]       = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLogs([]); setLoading(false); return; }
    load();
  }, [user?.id]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("logged_at", { ascending: false });

    if (data) {
      setLogs(
        data.map((row) => ({
          id:        row.id        as string,
          name:      row.name      as string,
          meta:      (row.meta  ?? "")        as string,
          tag:       (row.tag   ?? "neutral") as string,
          tone:      (row.tone  ?? "emerald") as FoodTone,
          glyph:     (row.glyph ?? "🍽️")     as string,
          img:       (row.img   ?? undefined) as string | undefined,
          meal:      (row.meal  ?? "Lunch")   as string,
          logged_at: row.logged_at as string | undefined,
        })),
      );
    }
    setLoading(false);
  }

  async function addLog(item: LogItem) {
    if (!user) return;
    // Optimistic — stamp logged_at now so today-filter sees it immediately
    const optimistic = { ...item, logged_at: item.logged_at ?? new Date().toISOString() };
    setLogs((prev) => [optimistic, ...prev]);

    const { data, error } = await supabase
      .from("food_logs")
      .insert({
        user_id: user.id,
        name:    item.name,
        meta:    item.meta,
        tag:     item.tag,
        tone:    item.tone,
        glyph:   item.glyph,
        img:     item.img ?? null,
        meal:    item.meal,
      })
      .select()
      .single();

    if (data) {
      // Replace temp id with real UUID from DB
      setLogs((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, id: data.id as string } : l)),
      );
    } else if (error) {
      // Rollback on failure
      setLogs((prev) => prev.filter((l) => l.id !== item.id));
    }
  }

  async function removeLog(id: string) {
    const removed = logs.find((l) => l.id === id);
    // Optimistic remove
    setLogs((prev) => prev.filter((l) => l.id !== id));

    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("id", id);

    if (error && removed) {
      // Rollback on failure
      setLogs((prev) => [removed, ...prev]);
    }
  }

  return { logs, loading, addLog, removeLog };
}
