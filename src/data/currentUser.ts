// Stands in for a real logged-in user until auth/accounts exist. Rides whose `driverId`
// matches this are yours - i.e. rides you're offering as a driver, not just riding on.
export const CURRENT_USER_ID = "me";
export const CURRENT_USER_NAME = "You";

import type { GreenScore } from "@/src/screens/PostRide/PostRideContext";
export type TextSizePreference = "normal" | "large";

export type UserProfile = {
  firstName: string; //assume like Monash and have first + middle together
  lastName: string;
  studentId: string;
  email: string;
  rating: number;
  totalRides: number;
  userGreenScore: GreenScore;
  notificationEnabled: boolean; //notification section on figma mockup
  prefTextSize: TextSizePreference;
  contrast: boolean;
};
