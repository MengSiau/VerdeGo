/*
Holds the user data so profile screen can read from it 
*/

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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

// use to share data across components - share of the type UserStoreValue
const UserDetailStoreContext = createContext<UserDetailStoreValue | null>(null);

// App-wide store for the signed-in user's profile, seeded from DEFAULT_USER_PROFILE. This is
// what lets data collected in ProfileSetup (signup) actually show up on the Profile screen
// without a real backend - same pattern as RidesStore for ride data.
export function UserDetailStoreProvider({ children }: { children: ReactNode }) {
  // start with default user profile (set in currentUser.ts)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

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
