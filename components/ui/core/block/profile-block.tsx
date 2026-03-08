import { Dimensions, View } from 'react-native';
import React from 'react';
import { Wrapper } from '../layout/wrapper';
import { Link } from 'expo-router';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/fragments/shadcn-ui/avatar';
import { Text } from '../../fragments/shadcn-ui/text';
import { Icon } from '../../fragments/shadcn-ui/icon';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Heart,
  HelpCircleIcon,
  MessageCircleMore,
  Moon,
  Settings,
  Share2Icon,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import { ImageBackground } from 'expo-image';

import { useColorScheme } from 'nativewind';
import { Switch } from '@/components/ui/fragments/shadcn-ui/switch';
import MenuCard from '@/components/ui/fragments/custom-ui/card/menu-card';
import { MenuDetail } from '@/type';

export default function ProfileBlock() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const menuDetails: MenuDetail[] = [
    {
      Label: 'Favorit',
      icon: Heart,
    },
  ];
  const menuDetails2: MenuDetail[] = [
    {
      Label: 'Settins',
      icon: Settings,
    },
    {
      Label: 'Dark Mode',
      icon: Moon,
      rigthComponent: (
        <Switch
          checked={colorScheme === 'dark'}
          onCheckedChange={toggleColorScheme}
          id="toggle-dark-mode"
          nativeID="toggle-dark-mode"
        />
      ),

      onPress: toggleColorScheme,
    },

    {
      Label: 'Notif',
      icon: Bell,
    },
  ];
  const menuDetails3: MenuDetail[] = [
    {
      Label: 'Helpdesk',
      icon: HelpCircleIcon,
    },
    {
      Label: 'Contact support',
      icon: MessageCircleMore,
    },
  ];

  return (
    <Wrapper
      edges={[]}
      className="gap-5 px-4 py-2 pb-10"
      containerClassName="  bg-secondary  dark:bg-muted-foreground/5">
      <Link href="/" className={cn('group rounded-xl border-0 p-3')}>
        <View className="w-full flex-row items-center justify-between group-active:opacity-65">
          <View className="flex-row items-center gap-3">
            <Avatar
              className="size-12 overflow-hidden rounded-full border-2 border-background bg-primary-foreground"
              alt={`Profile avatar`}>
              <AvatarFallback>
                <Text className="text-xs font-semibold">PL</Text>
              </AvatarFallback>
            </Avatar>
            <View className="gap-0">
              <Text variant="h2" className="m-0 border-0 p-0 text-base font-semibold">
                Gurun{'  '}
              </Text>
              <Text variant="muted" className="m-0 border-0 p-0 font-normal">
                Lihat profil
              </Text>
            </View>
          </View>
          <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
        </View>
      </Link>
      <AdsCard />
      <MenuCard MenuList={menuDetails} />ks
      <MenuCard MenuList={menuDetails2} />
      <MenuCard MenuList={menuDetails3} />
    </Wrapper>
  );
}

function AdsCard() {
  const screenWidth = Dimensions.get('window').width;
  const CARD_WIDTH = screenWidth / 3;
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 3.5);
  return (
    <Card
      className={cn(
        'm-auto h-fit w-full content-start items-start justify-start overflow-hidden rounded-xl border-0 bg-background p-0 shadow-none active:scale-95 active:opacity-70'
      )}>
      <CardContent className="w-full overflow-hidden p-0">
        <ImageBackground
          source={{
            uri: 'https://img.freepik.com/premium-photo/book-quran-with-rosary-top-left-with-copy-space-islamic-ramadan-greeting-background_430468-758.jpg',
          }}
          contentFit="cover"
          className="relative z-30 h-full w-full items-start justify-end gap-1 overflow-hidden bg-muted p-0"
          style={{ width: '100%', height: IMAGE_HEIGHT }}>
          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(0,0,0,9)', // kiri gelap
              'rgba(0,0,0,0.7)', // tengah
              'rgba(0,0,0,0)', // kanan transparan
            ]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }} // mulai dari kiri
            end={{ x: 1, y: 0 }} // berakhir di kanan
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
            }}
          />
          <View className="relative z-30 h-full w-full justify-center gap-5 overflow-hidden px-6">
            <CardHeader className="ml-0 w-full max-w-[200px] gap-2 p-0">
              <CardTitle className="text-left text-xl font-semibold tracking-tight text-white">
                Mulai Ngaji
              </CardTitle>

              <CardDescription className="line-clamp-2 w-full text-left text-base text-muted/70 dark:text-muted-foreground">
                Temukan berbagai macam pilihan Al-Qur'an digital dengan fitur lengkap untuk
                pengalaman
              </CardDescription>
            </CardHeader>
            {/* <CardAction>
              <Button
                variant={'secondary'}
                size={'sm'}
                className="h-fit rounded-md py-1 bg-white text-black active:bg-white/60">
                <Text className="text-base text-black">Jual</Text>
              </Button>
            </CardAction> */}
          </View>
        </ImageBackground>
      </CardContent>
      {/* ✅ Top 3 Product Images Grid */}
    </Card>
  );
}
