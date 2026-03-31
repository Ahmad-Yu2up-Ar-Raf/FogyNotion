import React from 'react';
import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';

import { ToastProvider } from '../ui/fragments/shadcn-ui/toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ComponentProps = {
  children?: React.ReactNode;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 menit
      gcTime: 5 * 60 * 1000, // 5 menit
      retry: 1, // fail fast
      retryDelay: 1000, // flat 1s delay
      refetchOnWindowFocus: true, // via focusManager
      refetchOnReconnect: true,
      refetchOnMount: true,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

export default function Provider({ children }: ComponentProps) {
  const { colorScheme } = useColorScheme();

  React.useEffect(() => {
    // ✅ Best practice TanStack Query RN: gunakan focusManager
    // bukan queryClient.refetchQueries() saat app kembali ke foreground
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        {/*
          ✅ Provider order:
          - LastRead: paling luar karena dibutuhkan AudioProvider (audio sambil baca)
          - Audio: di luar Bookmark karena audio bisa jalan lintas screen
          - Bookmark: paling dalam, scoped ke konten
        */}
        <GestureHandlerRootView>
          <ToastProvider>{children}</ToastProvider>
        </GestureHandlerRootView>
        {/*
          ❌ DIHAPUS: <PortalHost /> dari sini
          PortalHost hanya boleh ada SATU, letaknya di root _layout.tsx
          Duplikasi PortalHost → context collision → hook order error di BottomTabView
        */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export { queryClient };
