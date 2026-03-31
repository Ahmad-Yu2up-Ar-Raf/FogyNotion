// components/ui/core/block/qibla-block.tsx
// UI tidak berubah — hanya pastikan import dari hook yang sudah di-upgrade ke Gyroscope

import { View, ActivityIndicator, Pressable } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useIsFocused } from '@react-navigation/native';
import { Wrapper } from '../layout/wrapper';
import { Text } from '../../fragments/shadcn-ui/text';
import KabbahIcon from '../../fragments/svg/icons/heart';
import ArrowSvg from '../../fragments/svg/arrow';
import PollyGon from '../../fragments/svg/pollygon';
import { useQibla } from '@/hooks/Useqibla ';
import { usePrayer } from '@/hooks/usePrayerContext';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraIcon } from 'lucide-react-native';
import LoadingIndicator from '../loading-indicator';

const COMPASS_SIZE = 292;
const ARROW_SIZE = COMPASS_SIZE * 0.35;
const HAPTIC_COOLDOWN_MS = 1500;

function buildGoogleQiblaUrl(lat: number, lng: number): string {
  return `https://qiblafinder.withgoogle.com/intl/en/embed?lat=${lat}&lng=${lng}`;
}

function formatRotationLabel(deg: number): string {
  const abs = Math.abs(Math.round(deg));
  const dir = deg > 0 ? 'right' : 'left';
  if (abs <= 5) return '✓ Menghadap Qibla';
  return `Rotate the phone ${abs}° to the ${dir}`;
}

function accuracyLabel(acc: number): string {
  if (acc <= 0) return 'Akurasi: Tinggi ●';
  if (acc <= 1) return 'Akurasi: Baik ●';
  if (acc <= 2) return 'Akurasi: Sedang ●';
  return 'Akurasi: Rendah — Gerakkan device ●';
}

export default function QiblaBlock() {
  const { coordinates, city } = usePrayer();
  const isFocused = useIsFocused();

  const {
    qiblaBearing,
    rotationToQibla,
    isFacingQibla,
    accuracy,
    isLoading,
    error,
    compassRingStyle,
    arrowStyle,
  } = useQibla(coordinates);

  const { colorScheme } = useColorScheme();
  const currentTheme = colorScheme ?? 'light';
  const primaryColor = THEME[currentTheme].primary;

  const prevFacingRef = useRef<boolean>(false);
  const lastHapticRef = useRef<number>(0);

  useEffect(() => {
    if (isFocused && isFacingQibla && !prevFacingRef.current) {
      const now = Date.now();
      if (now - lastHapticRef.current >= HAPTIC_COOLDOWN_MS) {
        lastHapticRef.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    prevFacingRef.current = isFacingQibla;
  }, [isFacingQibla, isFocused]);

  const handleOpenCameraMode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = buildGoogleQiblaUrl(coordinates.latitude, coordinates.longitude);
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: currentTheme === 'dark' ? '#1e1e1e' : '#fff8f0',
      controlsColor: primaryColor,
      dismissButtonStyle: 'close',
    });
  };

  if (isLoading) {
    return <LoadingIndicator loadingText="Memuat sensor kompas..." />;
  }

  if (error) {
    return (
      <Wrapper
        edges={['top']}
        className="m-auto justify-end overflow-visible"
        containerClassName="content-end overflow-visible">
        <View className="flex-1 items-center justify-center">
          <KabbahIcon width={48} height={48} />
          <Text variant="large" className="mt-4 text-center font-poppins_semibold">
            Sensor tidak tersedia
          </Text>
          <Text variant="muted" className="mt-2 px-8 text-center text-sm">
            {error}
          </Text>
          <Pressable
            onPress={handleOpenCameraMode}
            className="mt-6 flex-row items-center gap-2 rounded-2xl bg-primary/10 px-5 py-3 active:opacity-70">
            <CameraIcon size={16} color={primaryColor} />
            <Text className="font-poppins_semibold text-sm text-primary">Coba Camera Mode</Text>
          </Pressable>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper
      edges={['top']}
      className="m-auto justify-end overflow-visible"
      containerClassName="content-end overflow-visible">
      {/* Compass */}
      <View
        style={{ width: COMPASS_SIZE, height: COMPASS_SIZE }}
        className="relative z-50 items-center justify-center self-center">
        {/* Layer 1 (z-50): Kabbah — FIXED, tidak rotate */}
        <View className="absolute inset-0 z-50 items-center justify-center">
          <View style={{ top: -33 }} className="absolute items-center gap-2">
            <View className="scale-75">
              <PollyGon />
            </View>
            <View
              style={{ borderColor: primaryColor }}
              className="size-7 items-center justify-center rounded-2xl border bg-white">
              <KabbahIcon width={15} height={15} />
            </View>
          </View>
        </View>

        {/* Layer 2 (z-40): Arrow — rotate ke arah Qibla @60fps */}
        <View className="absolute inset-0 z-40 items-center justify-center">
          <Animated.View
            style={[{ width: COMPASS_SIZE, height: COMPASS_SIZE }, arrowStyle]}
            className="items-center justify-center">
            <View
              style={{ width: ARROW_SIZE, height: ARROW_SIZE }}
              className="mb-10 scale-75 items-center justify-center">
              <ArrowSvg />
            </View>
          </Animated.View>
        </View>

        {/* Layer 3: Compass ring — rotate berlawanan heading @60fps */}
        <Animated.View
          style={[{ width: COMPASS_SIZE, height: COMPASS_SIZE }, compassRingStyle]}
          className={cn(
            'items-center justify-between rounded-full border-4 px-6 py-5',
            isFacingQibla ? 'border-primary' : 'border-primary/50'
          )}>
          <Text variant="large" className="m-0 p-0 font-poppins_bold">
            N
          </Text>
          <View className="w-full flex-row justify-between px-9">
            <Text variant="small" className="font-poppins_bold text-xs text-secondary/70">
              ●
            </Text>
            <Text variant="small" className="font-poppins_bold text-xs text-secondary/70">
              ●
            </Text>
          </View>
          <View className="w-full flex-row justify-between">
            <Text variant="large" className="m-0 p-0 font-poppins_bold">
              W
            </Text>
            <Text variant="large" className="m-0 p-0 font-poppins_bold">
              E
            </Text>
          </View>
          <View className="w-full flex-row justify-between px-9 pt-5">
            <Text variant="small" className="font-poppins_bold text-xs text-secondary/70">
              ●
            </Text>
            <Text variant="small" className="font-poppins_bold text-xs text-secondary/70">
              ●
            </Text>
          </View>
          <Text variant="large" className="m-0 p-0 font-poppins_bold">
            S
          </Text>
        </Animated.View>
      </View>

      {/* Info bearing */}
      <View className="relative z-30 mt-6 items-center gap-1">
        <Text variant="h3" className="text-center font-poppins_semibold text-xl tracking-tighter">
          {Math.round(qiblaBearing)}°
        </Text>
        <Text variant="muted" className="text-center text-xs tracking-wider">
          Device angle to qibla
        </Text>
      </View>

      {/* Rotation label */}
      <View className="z-30 mt-8 items-center gap-1">
        <Text
          variant="small"
          className="w-fit items-center gap-1 rounded-2xl bg-secondary/10 px-4 py-3 text-center font-poppins_medium text-xs tracking-tighter text-secondary">
          {formatRotationLabel(rotationToQibla)}
        </Text>
      </View>

      {/* Linear gradient decoration */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.0)',
          currentTheme === 'dark' ? 'hsl(37.1014 100% 12.4118%)' : 'hsl(37.1014 100% 79.4118%)',
          'rgba(0,0,0,0.0)',
        ]}
        locations={[0, 0.5, 1]}
        style={{
          position: 'absolute',
          margin: 'auto',
          left: -990,
          top: '10%',
          zIndex: 15,
          bottom: 0,
          height: 200,
          width: 4000,
          borderRadius: 200,
          overflow: 'hidden',
        }}
      />
    </Wrapper>
  );
}
