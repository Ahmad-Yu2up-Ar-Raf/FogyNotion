// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HapticTab } from '@/components/ui/core/haptic-tab';
import HeartIcon from '@/components/ui/fragments/svg/icons/heart';

import { View } from 'react-native';
import ProfileIcon from '@/components/ui/fragments/svg/icons/profile-icon';
import HomeIcon from '@/components/ui/fragments/svg/icons/home';

import NotifIcon from '@/components/ui/fragments/svg/icons/notif-icon';

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const tintColor = THEME[currentTheme].primary;
  const backgroundColor = THEME[currentTheme].card;
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

            height: 60 + insets.bottom,
            paddingTop: 10,
            display: 'flex',
            alignItems: 'center',
            paddingHorizontal: 0,
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
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <HomeIcon
                fill={focused ? tintColor : 'none'}
                stroke={focused ? 'none' : inactiveTintColor}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="inbox"
          options={{
            headerShown: false,
            title: 'Inbox',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <NotifIcon
                fill={focused ? tintColor : 'none'}
                stroke={focused ? tintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="liked"
          options={{
            title: 'Liked',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <HeartIcon
                fill={focused ? tintColor : 'none'}
                stroke={focused ? tintColor : inactiveTintColor}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: 'Profile',
            tabBarShowLabel: false,
            tabBarButton: HapticTab,
            tabBarIcon: ({ color, focused }) => (
              <View className="mb-1 size-full p-0.5">
                <ProfileIcon
                  fill={focused ? tintColor : 'none'}
                  stroke={focused ? tintColor : inactiveTintColor}
                />
              </View>
            ),
          }}
        />

        {/* Tab lainnya... */}
      </Tabs>
    </>
  );
}
