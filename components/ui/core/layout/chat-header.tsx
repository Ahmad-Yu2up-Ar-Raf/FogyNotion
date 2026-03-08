// components/ui/core/layout/header.tsx
//
// ✅ ROOT CAUSE FIX — Hook Order Violation (BottomTabView & SceneView error)
//
// ❌ WRONG PATTERN (penyebab error):
//   header: (props) => {
//     const insets = useSafeAreaInsets();  ← Hook dipanggil di dalam render prop
//     return <View>...</View>              ← React tidak tahu ini "component"
//   }
//
//   React Navigation memanggil fungsi `header` ini di dalam .map() BottomTabView.
//   Karena dipanggil sebagai plain function (bukan lewat JSX), React tidak bisa
//   track hooks dengan benar → "change in order of Hooks" error.
//
// ✅ CORRECT PATTERN:
//   Pindahkan semua hooks ke dalam komponen React yang proper (PascalCase).
//   Arrow function di `header:` hanya menjadi thin wrapper yang return JSX.
//   React akan render <HeaderComponent /> sebagai proper component → hooks aman.
//

import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { MenuIcon, MoreHorizontal, SearchIcon, type LucideIcon } from 'lucide-react-native';
import { Button, buttonTextVariants, buttonVariants } from '../../fragments/shadcn-ui/button';
import { Icon } from '../../fragments/shadcn-ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/fragments/shadcn-ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { router } from 'expo-router';
import { MenuSheet } from './menu-sheet';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScreenOptionsParams {
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

  const bgColor = transparent ? 'transparent' : THEME[currentTheme].background;

  return (
    <>
      <View
        style={{ paddingTop: insets.top, backgroundColor: bgColor }}
        className="flex-row items-center justify-between px-4 pb-3">
        {/* Left action */}
        <View className="w-10 items-start">
          {LeftIcon && leftAction ? (
            <Button
              variant={'ghost'}
              size={'icon'}
              onPress={leftAction}
              className="rounded-2xl p-1 active:opacity-60">
              <Icon as={LeftIcon} className="size-5" />
            </Button>
          ) : (
            <MenuSheet />
          )}
        </View>

        {/* Title */}
        <Text
          variant="h4"
          className="flex-1 text-center font-schluber text-xl tracking-tight"
          numberOfLines={1}>
          {title}
        </Text>

        {/* Right action */}
        <View className="items-end">
          {RigthComponent ? (
            RigthComponent
          ) : RightIcon && rightAction ? (
            <Button
              variant={'ghost'}
              size={'icon'}
              onPress={rightAction}
              className="rounded-2xl p-1 active:opacity-60">
              <Icon as={RightIcon} className="size-5" />
            </Button>
          ) : (
            <Button variant={'ghost'} size={'icon'}>
              <Icon as={SearchIcon} className="size-5" />
            </Button>
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
      children={children}
      rightAction={rightAction}
    />
  ),
});
