import { useState, useEffect } from "react";
import type { UserProfile } from "./useProfile";

export type AuthUser = {
  name:    string;
  email:   string;
  token:   string;
  profile: UserProfile;
};

type StoredAccount = {
  email:    string;
  password: string;
  profile:  UserProfile;
};

const AUTH_KEY     = "nv_auth";
const ACCOUNTS_KEY = "nv_accounts";

export function useAuth() {
  const [user, setUser]     = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
    } catch {
      setUser(null);
    }
    setLoaded(true);
  }, []);

  function register(email: string, password: string, profile: UserProfile): true | string {
    try {
      const raw      = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];
      if (accounts.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
        return "An account with this email already exists.";
      }
      accounts.push({ email, password, profile });
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      localStorage.setItem("nv_profile", JSON.stringify(profile));
      const authUser: AuthUser = { name: profile.name, email, token: `nv_${Date.now()}`, profile };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return true;
    } catch {
      return "Something went wrong. Please try again.";
    }
  }

  function login(email: string, password: string): true | string {
    try {
      const raw      = localStorage.getItem(ACCOUNTS_KEY);
      const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];
      const account  = accounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
      );
      if (!account) return "Invalid email or password.";
      localStorage.setItem("nv_profile", JSON.stringify(account.profile));
      const authUser: AuthUser = { name: account.profile.name, email, token: `nv_${Date.now()}`, profile: account.profile };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
      setUser(authUser);
      return true;
    } catch {
      return "Something went wrong. Please try again.";
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("nv_profile");
    setUser(null);
  }

  return { user, loaded, register, login, logout };
}
