import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts } from '@expo-google-fonts/cinzel/useFonts';
import { Cinzel_400Regular } from '@expo-google-fonts/cinzel/400Regular';
import { Cinzel_500Medium } from '@expo-google-fonts/cinzel/500Medium';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { Cinzel_800ExtraBold } from '@expo-google-fonts/cinzel/800ExtraBold';
import { Cinzel_900Black } from '@expo-google-fonts/cinzel/900Black';
import Provider from '@/components/provider/provider';
export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  return (
    <Provider>
      <Routes />
      <PortalHost />
    </Provider>
  );
}

SplashScreen.preventAutoHideAsync();

function Routes() {
  const [loaded, error] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Cinzel_800ExtraBold,
    Cinzel_900Black,
  });

  React.useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded || error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="article" options={{ headerShown: false }} />
    </Stack>
  );
}
