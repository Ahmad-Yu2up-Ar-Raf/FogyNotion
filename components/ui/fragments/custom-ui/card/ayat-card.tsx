// components/LastReadCard.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityIndicator, View, ViewProps } from 'react-native';
import { Text } from '../../shadcn-ui/text';
import { Ayat } from '@/type/surah-detail-type';
import {
  Bookmark,
  MoreHorizontal,
  PauseCircleIcon,
  PlayCircleIcon,
  Share2Icon,
} from 'lucide-react-native';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { useGlobalAudio } from '@/components/provider/AudioProvider';
import { useBookmarks } from '@/components/provider/BookmarkProvider';
import { useLastRead } from '@/components/provider/LastReadProvider';

type componentProps = ViewProps & {
  className?: string;
  ayat: Ayat;
  surahNomor: number;
  surahNama: string;
};

export function AyatCard({ className, surahNomor, surahNama, ayat, ...props }: componentProps) {
  const audio = ayat.audio['01'] ?? ayat.audio['02'];
  const { setLastRead } = useLastRead();
  const audioId = `${surahNomor}-${ayat.nomorAyat}`;

  const { bookmarks, toggle } = useBookmarks();

  // bagian atas komponen
  const { play, pause, currentId, isPlaying, isLoading } = useGlobalAudio();
  const handlePlay = async () => {
    await play(audioId, audio);
    await setLastRead({
      surahNomor: surahNomor,
      surahName: surahNama ?? undefined,
      ayat: ayat.nomorAyat,
    });
  };

  const isActive = currentId === audioId;
  const isBookmarked = bookmarks.includes(audioId);

  // handler

  return (
    <>
      <Card
        className={cn(
          'h-fit w-full gap-1 border-b border-b-muted-foreground/10 bg-background transition-all duration-200',
          className
        )}
        {...props}>
        <CardContent className="h-full w-full items-center justify-between gap-8 px-1">
          <View className="w-full flex-row items-center justify-between">
            <View className="content-center overflow-hidden rounded-2xl bg-primary/10 px-4 py-0.5 text-center">
              <Text className="m-auto font-poppins_semibold text-sm">
                {surahNomor}:{ayat.nomorAyat}
              </Text>
            </View>
            <Button variant={'ghost'} className="size-4 h-fit p-0" size={'sm'}>
              <Icon as={MoreHorizontal} className="size-full" />
            </Button>
          </View>
          {/* FULL-WIDTH RADIAL GRADIENT (absolute, covers whole card width) */}
          <View className="w-full gap-7">
            <CardHeader className="w-full gap-5 p-0">
              <CardTitle
                variant={'muted'}
                className="w-full text-right font-arabic text-2xl leading-relaxed text-foreground">
                {ayat.teksArab}
              </CardTitle>
              <CardDescription className="w-full text-left font-poppins_medium text-sm leading-relaxed text-foreground">
                {ayat.teksIndonesia}
              </CardDescription>
            </CardHeader>

            {/* MOSQUE (absolute, right background) */}
            <CardFooter className="w-full flex-row items-center justify-start gap-5 p-0">
              <Button
                onPress={handlePlay}
                variant={'ghost'}
                size={'sm'}
                className="size-6 h-fit p-0">
                {isLoading && isActive ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Icon
                    className="size-full text-muted-foreground"
                    as={isActive && isPlaying ? PauseCircleIcon : PlayCircleIcon}
                  />
                )}
              </Button>
              <Button
                onPress={() => toggle(audioId)}
                variant={'ghost'}
                size={'sm'}
                className="size-6 h-fit p-0">
                <Icon
                  as={Bookmark}
                  className={cn(
                    'size-full text-muted-foreground',
                    isBookmarked
                      ? 'fill-secondary text-secondary dark:fill-primary dark:text-primary'
                      : 'text-muted-foreground'
                  )}
                />
              </Button>
              <Button variant={'ghost'} size={'sm'} className="size-6 h-fit p-0.5">
                <Icon as={Share2Icon} className="size-full text-muted-foreground" />
              </Button>
            </CardFooter>
          </View>
        </CardContent>
      </Card>
    </>
  );
}
