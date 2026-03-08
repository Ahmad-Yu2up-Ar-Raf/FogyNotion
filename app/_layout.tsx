// app/_layout.tsx
import '@/global.css';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useFonts } from 'expo-font';
import Provider from '@/components/provider/provider';
import {
  PrayerBootstrapData,
  PrayerProvider,
  initializePrayerData,
} from '@/hooks/usePrayerContext';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Teko_300Light } from '@expo-google-fonts/teko/300Light';
import { Teko_400Regular } from '@expo-google-fonts/teko/400Regular';
import { Teko_500Medium } from '@expo-google-fonts/teko/500Medium';
import { Teko_600SemiBold } from '@expo-google-fonts/teko/600SemiBold';
import { Teko_700Bold } from '@expo-google-fonts/teko/700Bold';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <AppBootstrap />;
}

function AppBootstrap() {
  const [fontsLoaded, fontError] = useFonts({
    Schluber: require('@/assets/fonts/Schluber.otf'),
    Arabic: require('@/assets/fonts/NotoNaskhArabic-VariableFont_wght.ttf'),
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Teko_300Light,
    Teko_400Regular,
    Teko_500Medium,
    Teko_600SemiBold,
    Teko_700Bold,
  });

  const [bootstrapData, setBootstrapData] = React.useState<PrayerBootstrapData | null>(null);

  React.useEffect(() => {
    if (!fontsLoaded && !fontError) return;
    async function prepare() {
      try {
        const data = await initializePrayerData();
        setBootstrapData(data);
      } catch {
        // fallback handled inside initializePrayerData
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  if ((!fontsLoaded && !fontError) || !bootstrapData) return null;

  return (
    <PrayerProvider initialData={bootstrapData}>
      <Provider>
        {/*
          ✅ Stack root hanya punya SATU entry point: (drawer)
          Semua route (tabs, doa, article) dikelola di dalam Drawer.
          Stack ini hanya untuk hal-hal di luar Drawer seperti modal global.
        */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
        </Stack>
        <PortalHost />
      </Provider>
    </PrayerProvider>
  );
}
