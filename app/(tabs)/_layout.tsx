// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/core/haptic-tab';
import KabbahIcon from '@/components/ui/fragments/svg/icons/kabbah';
import QuranIcon from '@/components/ui/fragments/svg/icons/quran';
import MasjidIcon from '@/components/ui/fragments/svg/icons/masjid';
import { View } from 'react-native';
import SettingIcon from '@/components/ui/fragments/svg/icons/setting';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primary;
  const backgroundColor = THEME[currentTheme].background;
  const inactiveTintColor = THEME[currentTheme].mutedForeground;

  const insets = useSafeAreaInsets(); // ✅ Dapetin safe area insets

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarButton: HapticTab,

          tabBarActiveTintColor: tintColor,
          tabBarShowLabel: false,
          tabBarInactiveTintColor: inactiveTintColor,
          tabBarStyle: {
            backgroundColor,

            height: 70 + insets.bottom, // ✅ CRITICAL: Tinggi + bottom inset
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',

            borderTopWidth: 0.01,
            borderTopColor: THEME[currentTheme].border,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1 size-full scale-110">
                <MasjidIcon fill={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="kiblat"
          options={{
            title: 'Kiblat',
            tabBarIcon: ({ color, focused }) => <KabbahIcon fill={color} />,
          }}
        />
        <Tabs.Screen
          name="surah"
          options={{
            title: 'Surah',

            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <View className="scale-1">
                <QuranIcon fill={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1 size-full p-0.5">
                <SettingIcon fill={color} />
              </View>
            ),
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
