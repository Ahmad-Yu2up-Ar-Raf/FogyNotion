import { Button } from '@/components/ui/fragments/shadcn-ui/button';
import { Icon } from '@/components/ui/fragments/shadcn-ui/icon';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';

import { MoonStarIcon, XIcon, SunIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';

const SCREEN_OPTIONS_HOME = {
  header: () => (
    <View className="top-safe absolute left-0 right-0 flex-row justify-between px-4 py-2 web:mx-2">
      <Button variant={'ghost'} size={'icon'}>
        <Icon as={ChevronLeft} className="size-8 text-primary" />
      </Button>
      <View className="items-center text-center gap-1">
        <Text variant={"h3"}>28 shaban 1445</Text>
        <Text variant={'muted'}>Month, January 20 2023</Text>
      </View>
      <Button variant={'ghost'} size={'icon'}>
        <Icon as={ChevronRight} className="size-8 text-primary" />
      </Button>
    </View>
  ),
};

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

export { SCREEN_OPTIONS_HOME };
