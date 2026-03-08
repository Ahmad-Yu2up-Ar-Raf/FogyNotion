// hooks/usePrayerContext.tsx
//
// MINIMAL CHANGES dari versi asli kamu:
//   + FormattedPrayerTimes interface (baru)
//   + field `prayerTimes: FormattedPrayerTimes` di PrayerContextValue
//   + rename internal variable: prayerTimes → rawPrayerTimes (hindari naming conflict)
//   + formatTime helper (baru)
//   + formattedPrayerTimes useMemo (baru)
//   Semua logic lain TIDAK DIUBAH

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { PrayerTimes, Coordinates, CalculationMethod, Madhab } from 'adhan';

/* ================= TYPES ================= */

export interface PrayerBootstrapData {
  coordinates: Coordinates;
  city: string;
}

// ✅ NEW: type waktu shalat terformat
export interface FormattedPrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerContextValue {
  coordinates: Coordinates;
  nextPrayer: string;
  remaining: string;
  city: string;
  dateString: string;
  hour: string;
  minute: string;
  prayerTimes: FormattedPrayerTimes; // ✅ NEW
}

/* ================= CONTEXT ================= */

const PrayerContext = createContext<PrayerContextValue | null>(null);

/* ================= HELPERS ================= */

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

// ✅ NEW: format Date → "HH:mm"
function formatTime(date: Date | null): string {
  if (!date) return '--:--';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeCity(place: Location.LocationGeocodedAddress | null): string {
  if (!place) return 'Indonesia';
  const clean = (v: string | null | undefined) =>
    (v ?? '')
      .replace(/^Kecamatan\s+/i, '')
      .replace(/^Kabupaten\s+/i, '')
      .replace(/^Kota\s+/i, '')
      .trim();

  const district = clean(place.district);
  const city = clean(place.city);
  const subregion = clean(place.subregion);
  const region = clean(place.region);

  return district || city || subregion || region || 'Indonesia';
}

/* ================= BOOTSTRAP ================= */

export async function initializePrayerData(): Promise<PrayerBootstrapData> {
  let latitude = -6.595;
  let longitude = 106.806;
  let city = 'Bogor';

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const position = await Location.getCurrentPositionAsync({});
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      const reverse = await Location.reverseGeocodeAsync(position.coords);
      if (reverse.length > 0) {
        city = normalizeCity(reverse[0]);
      }
    }
  } catch {
    console.warn('Location fallback used');
  }

  return {
    coordinates: new Coordinates(latitude, longitude),
    city,
  };
}

/* ================= PROVIDER ================= */

interface PrayerProviderProps {
  children: React.ReactNode;
  initialData: PrayerBootstrapData;
}

export function PrayerProvider({ children, initialData }: PrayerProviderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Rename: prayerTimes → rawPrayerTimes (hindari conflict dengan field di value)
  const rawPrayerTimes = useMemo(() => {
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;
    const baseDate = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    );
    return new PrayerTimes(initialData.coordinates, baseDate, params);
  }, [
    initialData.coordinates,
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
  ]);

  // ✅ NEW: format ke HH:mm untuk UI
  const formattedPrayerTimes: FormattedPrayerTimes = useMemo(
    () => ({
      Fajr: formatTime(rawPrayerTimes.fajr),
      Dhuhr: formatTime(rawPrayerTimes.dhuhr),
      Asr: formatTime(rawPrayerTimes.asr),
      Maghrib: formatTime(rawPrayerTimes.maghrib),
      Isha: formatTime(rawPrayerTimes.isha),
    }),
    [rawPrayerTimes]
  );

  const { nextPrayer, remaining } = useMemo(() => {
    const next = rawPrayerTimes.nextPrayer();
    const nextTime = rawPrayerTimes.timeForPrayer(next);
    if (!nextTime) return { nextPrayer: '', remaining: '00:00:00' };

    const diff = nextTime.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return {
      nextPrayer: next ?? '',
      remaining: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    };
  }, [rawPrayerTimes, currentTime]);

  const value: PrayerContextValue = {
    coordinates: initialData.coordinates,
    nextPrayer,
    remaining,
    city: initialData.city,
    dateString: currentTime.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    hour: pad(currentTime.getHours()),
    minute: pad(currentTime.getMinutes()),
    prayerTimes: formattedPrayerTimes, // ✅ NEW
  };

  return <PrayerContext.Provider value={value}>{children}</PrayerContext.Provider>;
}

/* ================= HOOK ================= */

export function usePrayer(): PrayerContextValue {
  const context = useContext(PrayerContext);
  if (!context) throw new Error('usePrayer must be used inside PrayerProvider');
  return context;
}
