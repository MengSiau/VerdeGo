// Route group for the post-a-ride wizard. The "(post-ride)" segment doesn't appear in the
// URL - routes still resolve to /post-location, /post-datetime, etc. This layout wraps every
// step in PostRideProvider so the draft ride survives navigation between steps without
// passing a growing pile of data through URL params.

import { Stack } from 'expo-router';

import { PostRideProvider } from '@/src/screens/PostRide/PostRideContext';

export default function PostRideLayout() {
  return (
    <PostRideProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PostRideProvider>
  );
}
