import { SCREEN_OPTIONS_HOME } from '@/components/ui/core/layout/header/home-header';

import { Link, Stack } from 'expo-router';

import * as React from 'react';
import { View } from 'react-native';

export default function Screen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS_HOME} />

      <View className="flex-1 items-center justify-center gap-8 p-4"></View>
    </>
  );
}
