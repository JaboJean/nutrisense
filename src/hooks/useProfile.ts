import { useState, useEffect } from "react";

export type UserProfile = {
  name: string;
  age: number;
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
  role?: "patient" | "nutritionist";
};

export function getBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function getGoals(profile: UserProfile | null): { kcalGoal: number; ironGoal: number; proteinGoal: number } {
  if (!profile || profile.weightKg <= 0 || profile.heightCm <= 0 || profile.age <= 0) {
    return { kcalGoal: 2000, ironGoal: 18, proteinGoal: 50 };
  }
  const ironGoal = profile.sex === "male" ? 8 : 18;
  const proteinGoal = Math.max(40, Math.round(profile.weightKg * 0.8));
  // Harris-Benedict BMR × 1.4 (sedentary–light activity), rounded to nearest 50
  const bmr = profile.sex === "male"
    ? 88 + 13.4 * profile.weightKg + 4.8 * profile.heightCm - 5.7 * profile.age
    : 448 + 9.2 * profile.weightKg + 3.1 * profile.heightCm - 4.3 * profile.age;
  const kcalGoal = Math.round((bmr * 1.4) / 50) * 50;
  return { kcalGoal, ironGoal, proteinGoal };
}

export function getBMILabel(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25)   return "Healthy weight";
  if (bmi < 30)   return "Overweight";
  return "Obese";
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nv_profile");
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  function saveProfile(p: UserProfile) {
    localStorage.setItem("nv_profile", JSON.stringify(p));
    setProfile(p);
  }

  function clearProfile() {
    localStorage.removeItem("nv_profile");
    setProfile(null);
  }

  return { profile, saveProfile, clearProfile, loaded };
}
