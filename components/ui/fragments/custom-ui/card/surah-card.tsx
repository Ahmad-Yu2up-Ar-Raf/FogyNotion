// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React, { useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Pressable, View, ViewProps } from 'react-native';

import { Datum } from '@/type/surah-type';
 
import { Text } from '../../shadcn-ui/text';
 
import { router } from 'expo-router';

type componentProps = ViewProps & {
  className?: string;
  sura: Datum;
};

export function SurahCard({ className, sura, ...props }: componentProps) {
  const navigateToSurah = ({ id }: { id: number }) => {
    router.push({
      pathname: '/(drawer)/(tabs)/quran/[id]',
      params: { id: id, name: sura.namaLatin },
    });
  };

  return (
    <Card
      className={cn(
        'h-28 w-full overflow-hidden bg-background transition-all duration-200',
        className
      )}
      {...props}>
      <Pressable onPress={() => navigateToSurah({ id: sura.nomor })} className="active:opacity-80">
        <CardContent className="h-full w-full flex-row items-center justify-between px-1">
          {/* LEFT content: flex 1 with right padding reserved for mosque */}
          <CardHeader className="relative z-40 w-fit flex-row items-center gap-6 p-0 py-0">
            <View className="size-11 content-center overflow-hidden rounded-2xl bg-primary/10 text-center">
              <Text className="m-auto font-poppins_semibold text-lg">
                {sura.nomor > 9 ? sura.nomor : '0' + sura.nomor}
              </Text>
            </View>
            <View className="gap-1.5">
              <CardTitle className="font-poppins_semibold text-lg tracking-tighter">
                {sura.namaLatin}
              </CardTitle>
              <View className="flex-row items-center gap-2">
               

                <Text variant={'muted'} className="font-poppins_medium text-muted-foreground/40">
                  •
                </Text>
                <CardDescription className="font-poppins_medium text-muted-foreground">
                  {sura.jumlahAyat} Ayahs
                </CardDescription>
              </View>
            </View>
          </CardHeader>
          {/* FULL-WIDTH RADIAL GRADIENT (absolute, covers whole card width) */}
          <Text
            variant={'muted'}
            className="font-poppins_medium text-base text-muted-foreground/80">
            {sura.nama}
          </Text>
          {/* MOSQUE (absolute, right background) */}
        </CardContent>
      </Pressable>
    </Card>
  );
}
