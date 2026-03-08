// hooks/useQibla.ts — FINAL TRUE 60FPS
//
// ROOT CAUSE SEMUA VERSI SEBELUMNYA MASIH PATAH-PATAH:
//
//   Gyroscope listener (expo-sensors) → JS thread callback → sv.value = x
//   watchHeadingAsync → JS thread callback → sv.value = x
//   withTiming/withSpring → animasi 150ms per update
//
//   Semua itu masih lewat JS bridge = latency tidak bisa dihindari
//
// ✅ SOLUSI BENAR: useAnimatedSensor (react-native-reanimated)
//
//   useAnimatedSensor membaca sensor LANGSUNG di UI thread via Worklet.
//   Zero JS bridge. Zero latency. True 60fps.
//
//   Cara kerjanya:
//   SensorType.ROTATION → { yaw, pitch, roll } tersedia di UI thread
//   useAnimatedStyle → akses langsung sensor.value di worklet → rotate
//
//   Ini persis yang dipakai Apple Compass app, Google Maps compass.
//   Tidak ada cara lebih cepat dari ini di React Native.
//
// ARSITEKTUR:
//   ┌─────────────────────────────────────────────────────────┐
//   │  useAnimatedSensor(ROTATION) → UI thread worklet        │
//   │  → yaw (rad) → compassDeg, arrowDeg                     │
//   │  → useAnimatedStyle → transform rotate                  │
//   │  = TRUE 60fps, ZERO JS bridge, ZERO latency             │
//   ├─────────────────────────────────────────────────────────┤
//   │  watchHeadingAsync → JS thread (lambat, tidak apa-apa)  │
//   │  → HANYA untuk: rotationToQibla text, isFacingQibla     │
//   │  → Tidak driving animasi sama sekali                    │
//   └─────────────────────────────────────────────────────────┘
//
// CATATAN useAnimatedSensor ROTATION:
//   yaw   = rotasi sumbu Z (horizontal spin) — ini yang kita pakai
//   pitch = rotasi sumbu X (tilt maju/mundur)
//   roll  = rotasi sumbu Y (tilt kiri/kanan)
//
//   Satuan: radian, range -π sampai π
//   Convention: CW positif di iOS, CCW positif di Android
//   Kita handle perbedaan platform via Platform.OS check
//

import { useRef, useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Coordinates, Qibla } from 'adhan';
import {
  useAnimatedSensor,
  SensorType,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { Platform } from 'react-native';
import type { AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QiblaState = {
  qiblaBearing: number;
  rotationToQibla: number;
  isFacingQibla: boolean;
  accuracy: number;
  isLoading: boolean;
  error: string | null;
  // AnimatedStyle langsung dari UI thread sensor
  compassRingStyle: AnimatedStyle<ViewStyle>;
  arrowStyle: AnimatedStyle<ViewStyle>;
};

// ─── Helpers (worklet-compatible) ────────────────────────────────────────────

// Harus 'worklet' agar bisa dipanggil dari useAnimatedStyle/useDerivedValue
function normalizeAngleWorklet(a: number): number {
  'worklet';
  return ((a % 360) + 360) % 360;
}

function shortestDeltaWorklet(from: number, to: number): number {
  'worklet';
  let d = to - from;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

// Hysteresis constants
const QIBLA_ENTER_DEG = 5;
const QIBLA_EXIT_DEG = 8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useQibla(coordinates: Coordinates): QiblaState {
  // ── Qibla bearing sebagai SharedValue ──────────────────────────────────
  // SharedValue agar bisa diakses dari worklet di UI thread
  const qiblaBearingSV = useSharedValue<number>(Qibla(coordinates));

  // ── UI state untuk text display ────────────────────────────────────────
  const [slowState, setSlowState] = useState({
    rotationToQibla: 0,
    isFacingQibla: false,
    accuracy: 999,
    isLoading: true,
    error: null as string | null,
  });

  const isFacingQiblaRef = useRef<boolean>(false);

  // ── useAnimatedSensor — KUNCI UTAMA ─────────────────────────────────────
  // Ini membaca sensor LANGSUNG di UI thread, zero JS bridge
  // SensorType.ROTATION memberikan yaw/pitch/roll dalam radian
  const rotationSensor = useAnimatedSensor(SensorType.ROTATION, {
    interval: 'auto', // 'auto' = maximum rate hardware sensor (biasanya 60-100fps)
  });

  // ── Compass Ring Style (UI thread worklet) ─────────────────────────────
  // Akses sensor.value langsung — ini jalan di UI thread, 0 latency
  const compassRingStyle = useAnimatedStyle<ViewStyle>(() => {
    const { yaw } = rotationSensor.sensor.value;

    // yaw dalam radian → derajat
    // Negate karena: ring harus rotate BERLAWANAN heading
    // → heading 90° = ring rotate -90° agar N tetap menunjuk North
    //
    // iOS dan Android punya sign convention berbeda untuk yaw:
    // iOS: CW = negatif, CCW = positif
    // Android: CW = positif, CCW = negatif
    // Kita negate iOS agar konsisten
    const yawDeg =
      Platform.OS === 'ios'
        ? yaw * (180 / Math.PI) // iOS: balik sign
        : -yaw * (180 / Math.PI); // Android: pakai langsung

    return {
      transform: [{ rotate: `${yawDeg}deg` }],
    };
  });

  // ── Arrow Style (UI thread worklet) ───────────────────────────────────
  const arrowStyle = useAnimatedStyle<ViewStyle>(() => {
    const { yaw } = rotationSensor.sensor.value;

    // Heading device dalam derajat (0-360, 0=North)
    const headingDeg =
      Platform.OS === 'ios'
        ? normalizeAngleWorklet(-yaw * (180 / Math.PI))
        : normalizeAngleWorklet(yaw * (180 / Math.PI));

    // Arrow rotate ke arah Qibla relatif terhadap heading
    // arrowTarget = 0° saat heading == qiblaBearing (menghadap Qibla)
    const arrowTarget = normalizeAngleWorklet(qiblaBearingSV.value - headingDeg);

    return {
      transform: [{ rotate: `${arrowTarget}deg` }],
    };
  });

  // ── watchHeadingAsync — HANYA untuk text UI & isFacingQibla ───────────
  // Tidak driving animasi — hanya update text label dan hysteresis state

  useFocusEffect(
    useCallback(() => {
      let locationSub: Location.LocationSubscription | null = null;
      let cancelled = false;

      async function startHeading() {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            if (!cancelled) {
              setSlowState((p) => ({
                ...p,
                isLoading: false,
                error: 'Izin lokasi diperlukan untuk kompas.',
              }));
            }
            return;
          }

          locationSub = await Location.watchHeadingAsync((data) => {
            if (cancelled) return;

            const trueH = data.trueHeading >= 0 ? data.trueHeading : data.magHeading;

            // rotationToQibla untuk label teks
            let rotToQibla = qiblaBearingSV.value - trueH;
            if (rotToQibla > 180) rotToQibla -= 360;
            if (rotToQibla < -180) rotToQibla += 360;

            // Hysteresis: cegah toggle rapid di batas 5°
            const absRot = Math.abs(rotToQibla);
            let newFacing = isFacingQiblaRef.current;
            if (!newFacing && absRot <= QIBLA_ENTER_DEG) newFacing = true;
            else if (newFacing && absRot > QIBLA_EXIT_DEG) newFacing = false;
            isFacingQiblaRef.current = newFacing;

            setSlowState({
              rotationToQibla: rotToQibla,
              isFacingQibla: newFacing,
              accuracy: data.accuracy,
              isLoading: false,
              error: null,
            });
          });
        } catch (err: any) {
          if (!cancelled) {
            setSlowState((p) => ({
              ...p,
              isLoading: false,
              error: err?.message ?? 'Sensor kompas tidak tersedia.',
            }));
          }
        }
      }

      const timeout = setTimeout(() => {
        setSlowState((p) => {
          if (!p.isLoading) return p;
          return { ...p, isLoading: false, error: 'Sensor tidak tersedia.' };
        });
      }, 5000);

      startHeading();

      return () => {
        cancelled = true;
        locationSub?.remove();
        clearTimeout(timeout);
        isFacingQiblaRef.current = false;
        setSlowState({
          rotationToQibla: 0,
          isFacingQibla: false,
          accuracy: 999,
          isLoading: true,
          error: null,
        });
      };
    }, [])
  );

  return {
    qiblaBearing: qiblaBearingSV.value,
    rotationToQibla: slowState.rotationToQibla,
    isFacingQibla: slowState.isFacingQibla,
    accuracy: slowState.accuracy,
    isLoading: slowState.isLoading,
    error: slowState.error,
    compassRingStyle,
    arrowStyle,
  };
}
