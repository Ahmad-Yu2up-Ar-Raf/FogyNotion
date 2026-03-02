import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';

import { Link, Stack } from 'expo-router';
import { MoonStarIcon, XIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

const SCREEN_OPTIONS = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row justify-between px-4 py-2 web:mx-2">
      <ThemeToggle />
    </View>
  ),
};

export default function Screen() {
  

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="flex-1 items-center justify-center gap-8 p-4">
        <View className="max-w-sm gap-2 px-4">
          <ThemeToggle />
          <Text variant="h1" className="text-3xl font-medium">
            Make it yours
          </Text>
          <Text className="ios:text-foreground font-mono text-center text-sm text-muted-foreground">
            Update the screens and components to match your design and logic.
          </Text>
        </View>
        <View className="gap-2">
          <Link href="https://go.clerk.com/8e6CCee" asChild>
            <Button size="sm">
              <Text>Explore Clerk Docs</Text>
            </Button>
          </Link>
        </View>
      </View>
    </>
  );
}

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <Button onPress={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-6" />
    </Button>
  );
}
