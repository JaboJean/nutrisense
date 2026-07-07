import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "./useProfile";

export type { UserProfile };
export type { User };

export interface UseAuthReturn {
  user:            User | null;
  profile:         UserProfile | null;
  loaded:          boolean;
  displayName:     string;
  register:        (email: string, password: string, p: UserProfile) => Promise<true | string>;
  login:           (email: string, password: string)                 => Promise<true | string>;
  loginWithGoogle: ()                                                => Promise<void>;
  logout:          ()                                                => Promise<void>;
  updateProfile:   (p: UserProfile)                                  => Promise<true | string>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) await fetchProfile(u.id, u.user_metadata as Record<string, unknown>);
      setLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) await fetchProfile(u.id, u.user_metadata as Record<string, unknown>);
        else setProfile(null);
        setLoaded(true);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string, meta?: Record<string, unknown>): Promise<void> {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) {
      setProfile({
        name:     data.name      ?? "",
        age:      data.age       ?? 0,
        sex:      data.sex       ?? "male",
        weightKg: data.weight_kg ?? 0,
        heightCm: data.height_cm ?? 0,
        role:     (data.role     ?? "patient") as "patient" | "nutritionist",
      });
      return;
    }
    // Bootstrap from user_metadata written at signup (email-confirmation flow)
    if (meta?.age) {
      const p: UserProfile = {
        name:     String(meta.name     ?? ""),
        age:      Number(meta.age),
        sex:      (meta.sex as "male" | "female") ?? "male",
        weightKg: Number(meta.weight_kg ?? 0),
        heightCm: Number(meta.height_cm ?? 0),
        role:     (meta.role as "patient" | "nutritionist") ?? "patient",
      };
      await supabase.from("profiles").upsert({
        id:        userId,
        name:      p.name,
        age:       p.age,
        sex:       p.sex,
        weight_kg: p.weightKg,
        height_cm: p.heightCm,
        role:      p.role ?? "patient",
      });
      setProfile(p);
    }
  }

  async function register(
    email: string,
    password: string,
    p: UserProfile,
  ): Promise<true | string> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Store full profile in user_metadata so fetchProfile can bootstrap
      // the DB row after email confirmation when no session exists yet.
      options: {
        data: {
          name:      p.name,
          age:       p.age,
          sex:       p.sex,
          weight_kg: p.weightKg,
          height_cm: p.heightCm,
          role:      p.role ?? "patient",
        },
      },
    });
    if (error) return error.message;
    if (!data.user) return "Signup failed — please try again.";

    if (data.session) {
      // Email confirmation is disabled — session is live, write the row now.
      const { error: pe } = await supabase.from("profiles").upsert({
        id:        data.user.id,
        name:      p.name,
        age:       p.age,
        sex:       p.sex,
        weight_kg: p.weightKg,
        height_cm: p.heightCm,
        role:      p.role ?? "patient",
      });
      if (pe) return pe.message;
      setProfile(p);
    }
    // No session means email confirmation is required.
    // Profile data is in user_metadata and will be written by fetchProfile on first login.

    return true;
  }

  async function login(email: string, password: string): Promise<true | string> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return true;
  }

  async function loginWithGoogle(): Promise<void> {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function updateProfile(p: UserProfile): Promise<true | string> {
    if (!user) return "Not authenticated.";
    const { error } = await supabase.from("profiles").upsert({
      id:        user.id,
      name:      p.name,
      age:       p.age,
      sex:       p.sex,
      weight_kg: p.weightKg,
      height_cm: p.heightCm,
      role:      p.role ?? "patient",
    });
    if (error) return error.message;
    setProfile(p);
    return true;
  }

  const displayName =
    profile?.name ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "User";

  return { user, profile, loaded, displayName, register, login, loginWithGoogle, logout, updateProfile };
}
