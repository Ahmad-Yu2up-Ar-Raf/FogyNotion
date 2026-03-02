import React from 'react';

import { router, Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* Tambahkan screen lain di sini jika ada nested routes */}
    </Stack>
  );
}
