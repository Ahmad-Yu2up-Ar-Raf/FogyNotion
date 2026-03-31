// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/core/haptic-tab';
import KabbahIcon from '@/components/ui/fragments/svg/icons/heart';
import MenuIcon from '@/components/ui/fragments/svg/icons/menu-icon';

import { View } from 'react-native';
import ProfileIcon from '@/components/ui/fragments/svg/icons/profile-icon';
import HomeIcon from '@/components/ui/fragments/svg/icons/home';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { cn } from '@/lib/utils';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primary;
  const backgroundColor = THEME[currentTheme].background;
  const mutedForeground = THEME[currentTheme].mutedForeground;
  const inactiveTintColor = THEME[currentTheme].mutedForeground;

  const insets = useSafeAreaInsets(); // ✅ Dapetin safe area insets

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarButton: HapticTab,

          tabBarActiveTintColor: tintColor,

          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,

            height: 70 + insets.bottom, // ✅ CRITICAL: Tinggi + bottom inset
            paddingTop: 13,
            display: 'flex',
            alignItems: 'center',

            borderTopWidth: 0.5,
            borderTopColor: THEME[currentTheme].background,
            shadowColor: mutedForeground,
            shadowOffset: {
              width: 2,
              height: 0,
            },
            shadowOpacity: 20.1,
            shadowRadius: 2.84,
            elevation: 3,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: ({ color, focused }) => (
              <Text
                className={cn(
                  'mt-1.5 text-xs',
                  focused
                    ? 'font-poppins_semibold text-accent-foreground'
                    : 'font-poppins_medium text-muted-foreground'
                )}>
                Home
              </Text>
            ),
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <View className="scale-1">
                <HomeIcon fill={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="quran"
          options={{
            headerShown: false,
            title: 'Quran',
            tabBarLabel: ({ color, focused }) => (
              <Text
                className={cn(
                  'mt-1.5 text-xs',
                  focused
                    ? 'font-poppins_semibold text-accent-foreground'
                    : 'font-poppins_medium text-muted-foreground'
                )}>
                Menu
              </Text>
            ),
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <View className="scale-1">
                <MenuIcon fill={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="qibla"
          options={{
            title: 'Qibla',
            tabBarLabel: ({ color, focused }) => (
              <Text
                className={cn(
                  'mt-1.5 text-xs',
                  focused
                    ? 'font-poppins_semibold text-accent-foreground'
                    : 'font-poppins_medium text-muted-foreground'
                )}>
                Like
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => <KabbahIcon fill={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            headerShown: false,
            title: 'Settings',
            tabBarLabel: ({ color, focused }) => (
              <Text
                className={cn(
                  'mt-1.5 text-xs',
                  focused
                    ? 'font-poppins_semibold text-accent-foreground'
                    : 'font-poppins_medium text-muted-foreground'
                )}>
                Me
              </Text>
            ),
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1 size-full p-0.5">
                <ProfileIcon fill={color} />
              </View>
            ),
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
