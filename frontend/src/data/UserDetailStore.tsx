/*
Holds the user data so profile screen can read from it 
*/

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/src/auth/AuthProvider";

import {
  DEFAULT_USER_PROFILE,
  type TextSizePreference,
  type UserProfile,
} from "./currentUser";

type UserDetailStoreValue = {
  profile: UserProfile;
  updateProfile: (fields: Partial<UserProfile>) => void;
  togglePushNotifications: () => void;
  setTextSize: (size: TextSizePreference) => void;
  toggleHighContrastMode: () => void;
};

// Google (via Supabase) gives us the account holder's name as one full-name string.
// Following the Monash convention (first + middle together), the LAST word becomes the
// last name and everything before it becomes the first name:
//   "Sam Smith"        -> first "Sam",       last "Smith"
//   "Mary Jane Watson" -> first "Mary Jane", last "Watson"
//   "Cher"             -> first "Cher",      last ""
// If Google ever supplies given_name / family_name, those are used instead.
export function splitName(meta: Record<string, unknown> | undefined) {
  const given = typeof meta?.given_name === "string" ? meta.given_name : "";
  const family = typeof meta?.family_name === "string" ? meta.family_name : "";
  if (given || family) {
    return { firstName: given.trim(), lastName: family.trim() };
  }

  const full = String(meta?.full_name ?? meta?.name ?? "").trim();
  const parts = full.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

// use to share data across components - share of the type UserStoreValue
const UserDetailStoreContext = createContext<UserDetailStoreValue | null>(null);

// App-wide store for the signed-in user's profile, seeded from DEFAULT_USER_PROFILE and then
// filled in from the signed-in Supabase account (see the useEffect below).
// NOTE: this must sit INSIDE <AuthProvider> in app/_layout.tsx so that useAuth() works.
export function UserDetailStoreProvider({ children }: { children: ReactNode }) {
  // start with default user profile (set in currentUser.ts)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  const { session } = useAuth();
  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  // Runs when someone signs in or out (the user id changes), so the profile always
  // belongs to whoever is currently signed in.
  useEffect(() => {
    setProfile((prev) => ({
      ...DEFAULT_USER_PROFILE,
      // device settings survive signing in and out
      notificationEnabled: prev.notificationEnabled,
      prefTextSize: prev.prefTextSize,
      contrast: prev.contrast,
      // personal details come from the signed-in account (left blank when signed out)
      ...(user
        ? { ...splitName(user.user_metadata), email: user.email ?? "" }
        : {}),
    }));
    // Keyed on the user's id, NOT the session object: Supabase creates a new session object
    // on every token refresh, and that must not wipe things like the preferred name.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const value = useMemo<UserDetailStoreValue>(
    () => ({
      profile,
      //changing general profile fields
      updateProfile: (fields) => setProfile((prev) => ({ ...prev, ...fields })),
      // notifs on and off
      togglePushNotifications: () =>
        setProfile((prev) => ({
          ...prev,
          notificationEnabled: !prev.notificationEnabled,
        })),
      //changing between normal/karge
      setTextSize: (size) =>
        setProfile((prev) => ({ ...prev, prefTextSize: size })),
      //high contrast mode on and off
      toggleHighContrastMode: () =>
        setProfile((prev) => ({
          ...prev,
          contrast: !prev.contrast,
        })),
    }),
    [profile],
  );

  return (
    <UserDetailStoreContext.Provider value={value}>
      {children}
    </UserDetailStoreContext.Provider>
  );
}

export function useUserDetailStore() {
  const context = useContext(UserDetailStoreContext);
  if (!context) {
    throw new Error(
      "useUserDetailStore must be used within a UserDetailStoreProvider",
    );
  }
  return context;
}