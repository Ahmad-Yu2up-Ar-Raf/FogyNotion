// app/surah/[id].tsx
// ✅ FIXED: Header konsisten dari awal — tidak bergantung data load
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import SurahBlock from '@/components/ui/core/block/surah-block';
import { ChevronLeft, MoreHorizontal, PlayCircleIcon } from 'lucide-react-native';
import { SCREEN_OPTIONS } from '@/components/ui/core/layout/header';

export default function Page() {
  const params = useLocalSearchParams<{ id?: string; name?: string }>();
  const nomor = params?.id ? Number(params.id) : NaN;
  const nameSurah = params?.name ?? 'Surah';

  // ✅ Invalid nomor guard — tapi header tetap pakai nameSurah dari params
  if (!Number.isFinite(nomor)) {
    return (
      <>
        <Stack.Screen
          options={SCREEN_OPTIONS({
            title: nameSurah, // ✅ pakai name dari params, bukan hardcode
            transparent: false,
            leftIcon: ChevronLeft,
            rightIcon: MoreHorizontal,
          })}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </>
    );
  }

  /*
    ✅ SurahBlock sekarang yang handle Stack.Screen headernya sendiri
    karena di dalam SurahBlock, hooks sudah di top level dan
    header diupdate setelah data loaded (nama latin dari API)

    Tidak perlu Stack.Screen di sini lagi untuk kasus valid nomor —
    SurahBlock yang handle semua state (loading, error, success)
    masing-masing dengan header yang sesuai.
  */
  return <SurahBlock id={nomor} nameSurah={nameSurah} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
