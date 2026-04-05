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
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { ShoppingBagIcon, ShoppingCartIcon, type LucideIcon } from 'lucide-react-native';
import { Button } from '../../fragments/shadcn-ui/button';

import { MenuSheet } from './menu-sheet';
import MenuSheetIcon from '../../fragments/svg/icons/menu-icon';
import MapPinIcon from '../../fragments/svg/icons/map-pin';
import NotifIcon from '../../fragments/svg/icons/notif-icon';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { useCart } from '@/components/provider/CartProvider';
import { cn } from '@/lib/utils';

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
  const { count: cartCount } = useCart(); // ✅ Get cart count

  const bgColor = transparent ? 'transparent' : THEME[currentTheme].background;

  const foregroundColor = THEME[currentTheme].foreground;
  return (
    <>
      <View
        style={{ paddingTop: insets.top + 7, backgroundColor: bgColor }}
        className="flex-row items-center justify-between px-6 pb-3">
        {/* Left action */}
        <View className="w-10 items-start">
          {LeftIcon && leftAction ? (
            <Button size="icon" className="rounded-full bg-card">
              <MenuSheetIcon className="size-5" />
            </Button>
          ) : (
            <MenuSheet />
          )}
        </View>

        {/* Title */}
        {title ? (
          <Text
            variant="h4"
            className="text-center font-poppins_medium text-xl tracking-tighter"
            numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View className="items-center justify-center gap-1 text-center">
            <Text
              variant={'small'}
              className="font-poppins_medium text-xs tracking-tighter text-muted-foreground/60">
              Location
            </Text>
            <View className="w-fit flex-row items-center gap-1.5">
              <MapPinIcon fill={foregroundColor} />
              <Text
                variant="h4"
                className="text-center font-poppins_medium text-base tracking-tighter">
                Indonesia
              </Text>
            </View>
          </View>
        )}

        {/* Right action */}
        <View className="items-end">
          {RigthComponent ? (
            RigthComponent
          ) : RightIcon && rightAction ? (
            <View className="relative">
              <Button size="icon" className="size-12 rounded-full bg-card" onPress={rightAction}>
                <Icon as={ShoppingBagIcon} className="size-5" />
              </Button>
              {/* ✅ Cart badge */}
              {cartCount > 0 && (
                <View className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary">
                  <Text variant={'small'} className="text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="relative">
              <Button size="icon" className="size-12 rounded-full bg-card">
                <Icon as={ShoppingCartIcon} className="size-5" />
              </Button>
              {/* ✅ Cart badge */}
              {cartCount > 0 && (
                <View className="absolute -right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary">
                  <Text variant={'small'} className="text-[10px] font-bold text-primary-foreground">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Text>
                </View>
              )}
            </View>
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
