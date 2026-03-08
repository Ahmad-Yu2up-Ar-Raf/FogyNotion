// components/ui/fragments/custom-ui/card/prayer-schedule-card.tsx

import React from 'react';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';

import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import { Separator } from '@/components/ui/fragments/shadcn-ui/separator';
import { Card, CardContent } from '@/components/ui/fragments/shadcn-ui/card';
// ✅ FIX error 1: FormattedPrayerTimes sekarang di-export dari hook
import { usePrayer, type FormattedPrayerTimes } from '@/hooks/usePrayerContext';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

// ─── Konfigurasi ──────────────────────────────────────────────────────────────

type PrayerKey = keyof FormattedPrayerTimes;

const PRAYERS: { key: PrayerKey; label: string }[] = [
  { key: 'Fajr', label: 'Subuh' },
  { key: 'Dhuhr', label: 'Dzuhur' },
  { key: 'Asr', label: 'Ashar' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isya' },
];

// adhan nextPrayer() return lowercase: 'fajr','dhuhr','asr','maghrib','isha'
const ADHAN_TO_KEY: Record<string, PrayerKey> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PrayerScheduleCard() {
  // ✅ FIX error 2: prayerTimes sekarang ada di context setelah hook diupdate
  const { prayerTimes, nextPrayer } = usePrayer();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  const nextKey: PrayerKey | undefined = ADHAN_TO_KEY[nextPrayer?.toLowerCase() ?? ''];

  return (
    <View className="gap-2">
      <Text className="px-1 font-poppins_semibold text-xs uppercase tracking-widest text-muted-foreground">
        Jadwal Shalat
      </Text>

      <Card className="overflow-hidden rounded-2xl border border-border p-0">
        <CardContent className="p-0">
          {PRAYERS.map(({ key, label }, index) => {
            const isNext = key === nextKey;
            const isLast = index === PRAYERS.length - 1;

            return (
              // ✅ FIX error 3: key pakai string literal bukan PrayerKey symbol
              <React.Fragment key={String(key)}>
                <View
                  className={cn(
                    'flex-row items-center justify-between px-5 py-3.5',
                    isNext && 'bg-primary/10'
                  )}>
                  {/* Left: dot + nama + badge */}
                  <View className="flex-row items-center gap-3">
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 99,
                        backgroundColor: isNext ? theme.primary : theme.mutedForeground,
                        opacity: isNext ? 1 : 0.3,
                      }}
                    />
                    <Text
                      className={cn(
                        'font-poppins_medium text-sm',
                        isNext ? 'text-primary' : 'text-foreground'
                      )}>
                      {label}
                    </Text>
                    {isNext && (
                      <View
                        style={{ backgroundColor: theme.primary + '22' }}
                        className="rounded-full px-2 py-0.5">
                        <Text
                          style={{ color: theme.primary }}
                          className="font-poppins_semibold text-[10px]">
                          Berikutnya
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Right: waktu */}
                  <Text
                    className={cn(
                      'font-poppins_semibold text-sm tabular-nums',
                      isNext ? 'text-primary' : 'text-muted-foreground'
                    )}>
                    {prayerTimes[key]}
                  </Text>
                </View>

                {!isLast && <Separator />}
              </React.Fragment>
            );
          })}
        </CardContent>
      </Card>
    </View>
  );
}
