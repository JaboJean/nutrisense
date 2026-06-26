import { useState, useEffect } from "react";

export type UserProfile = {
  name: string;
  age: number;
  sex: "male" | "female";
  weightKg: number;
  heightCm: number;
};

export function getBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
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
