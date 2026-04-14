import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { PlusIcon, type LucideIcon } from 'lucide-react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import LogoApp, { LogoAdaptive } from '../../fragments/svg/logo-app';
import { MenuSheet } from './menu-sheet';

import { Icon } from '../../fragments/shadcn-ui/icon';

import { router } from 'expo-router';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../fragments/shadcn-ui/dropdown-menu';
// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScreenOptionsParams {
  title?: string;
  transparent?: boolean;
  leftIcon?: LucideIcon;
  leftAction?: () => void;
  rightIcon?: LucideIcon;
  id?: number;
  RigthComponent?: React.ReactNode; // opsional, untuk custom right component (misal dropdown menu)
  rightAction?: () => void;
  children?: React.ReactNode;
  surahSetelahnya?: { id: number; namaLatin: string } | null; // untuk navigasi next/prev di Surah detail
  surahSebelumnya?: { id: number; namaLatin: string } | null;
  isFullPlaying?: boolean; // untuk kondisi play/pause di dropdown menu
}

// ─── HeaderComponent ──────────────────────────────────────────────────────────
// ✅ Proper React component — semua hooks di sini, dipanggil via JSX
// React dapat track lifecycle-nya dengan benar.

interface HeaderComponentProps extends ScreenOptionsParams {}

function HeaderComponent({
  title,
  transparent = true,
  RigthComponent,
  leftIcon: LeftIcon,
  leftAction,
  children,
  rightIcon: RightIcon,
  rightAction,
  id,
}: HeaderComponentProps) {
  // ✅ Hook aman di sini karena ini adalah proper React component
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';

  const handleLeave = () => {
    router.push('/');
  };
  const handlePost = () => {
    router.push('/(drawer)/post');
  };
  const bgColor = transparent ? 'transparent' : THEME[currentTheme].background;

  const foregroundColor = THEME[currentTheme].foreground;
  return (
    <>
      <View
        style={{ paddingTop: insets.top + 7, backgroundColor: bgColor }}
        className="flex-row items-center justify-between px-4 pb-3">
        {/* Left action */}
        <View className="w-10 items-start">
          {LeftIcon ? (
            <Button
              variant={'ghost'}
              onPress={leftAction ?? handleLeave}
              size="icon"
              className="size-12 rounded-full">
              <Icon as={LeftIcon} className="size-6" />
            </Button>
          ) : (
            <MenuSheet />
          )}
        </View>

        {/* Title */}
        {title ? (
          <Text
            variant="h4"
            className="line-clamp-1 text-center font-poppins_medium text-xl tracking-tighter"
            numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View className="items-center justify-center gap-7 text-center">
            {/* <Text
              variant={'small'}
              className="font-poppins_medium text-xs tracking-tighter text-muted-foreground/60">
              Location
            </Text> */}
            <View className="w-fit flex-row items-center gap-1.5">
              <View className="size-12 scale-[.70]">
                <LogoAdaptive />
              </View>

              <Text
                variant="h4"
                className="text-center font-poppins_semibold text-base tracking-tighter">
                FogyNotion
              </Text>
            </View>
          </View>
        )}

        {/* Right action */}
        <View className="items-end">
          {RigthComponent ? (
            RigthComponent
          ) : RightIcon ? (
            <Button
              variant={'ghost'}
              onPress={rightAction ?? handleLeave}
              size="icon"
              className="size-12 rounded-full">
              <Icon as={RightIcon} className="size-6" />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-10">
                  <Icon as={PlusIcon} className="size-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem
                  onPress={() => {
                    router.push('/(drawer)/post');
                  }}
                  className="gap-2">
                  <Text>To DO</Text>
                </DropdownMenuItem>

                {/* RESET OPTION */}

                {/* DELETE OPTION */}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </View>
      </View>

      {children}
    </>
  );
}
interface HeaderComponentProps extends ScreenOptionsParams {}

// ─── SCREEN_OPTIONS ───────────────────────────────────────────────────────────
// ✅ Arrow function di `header:` hanya thin wrapper → return JSX
// Hooks TIDAK dipanggil di sini — semua ada di HeaderComponent di atas

export const SCREEN_OPTIONS = ({
  title,
  transparent = true,
  leftIcon,
  leftAction,
  rightIcon,
  RigthComponent,
  rightAction,
  children,
  // backward compat
}: ScreenOptionsParams) => ({
  headerShown: true,

  header: () => (
    <HeaderComponent
      title={title}
      transparent={transparent}
      leftIcon={leftIcon}
      leftAction={leftAction}
      rightIcon={rightIcon}
      RigthComponent={RigthComponent}
      children={children}
      rightAction={rightAction}
    />
  ),
});
