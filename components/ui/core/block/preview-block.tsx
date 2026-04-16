import React, { useCallback } from 'react';
import { Wrapper } from '../layout/wrapper';

import { useAuth, useUser } from '@clerk/clerk-expo';

import { router, Stack } from 'expo-router';
import { SCREEN_OPTIONS } from '../layout/nav';
import { batasiKata } from '@/hooks/useWord';
import { Calendar, ChevronLeft, Clock, Pen, Settings } from 'lucide-react-native';
import { Dimensions, View } from 'react-native';

import { useColorScheme } from 'nativewind';
import { Todos } from '@/lib/storage/todos-storage';
import { Text } from '../../fragments/shadcn-ui/text';
import { Image } from '../../fragments/shadcn-ui/image';
import { Badge } from '../../fragments/shadcn-ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

type componentProps = {
  Todo: Todos;
};

export default function PreviewBlock({ Todo }: componentProps) {
  const { scrollAnimatedPosition, scrollHandler } = useScrollAnimation({
    showTriggerPoint: 80,
    hideTriggerPoint: 0,
  });
  const title = batasiKata(Todo.title, 2);
  const NavigateToEdit = useCallback(() => {
    router.push({
      pathname: '/(drawer)/post/[id]',
      params: { id: Todo.id, mode: 'edit' },
    });
  }, [Todo.id]);
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const CARD_WIDTH = SCREEN_WIDTH / 1.18;
  const IMAGE_HEIGHT = CARD_WIDTH * (4 / 4);
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: title,
          leftIcon: ChevronLeft,

          scrollAnimatedPosition,
          scrollTriggerPoint: 400,

          rightIcon: Pen,
          rightAction: NavigateToEdit,
        })}
      />
      <Wrapper
        animatedScrollHandler={scrollHandler}
        className="items-start justify-start gap-14 pb-56 pt-11"
        edges={['bottom', 'left', 'right']}>
        <View className="gap-6 pr-0">
          {/* <Text variant={'small'} className="tracking-widest">
            TASK CREATION
          </Text> */}
          <View className="flex-row items-center gap-2">
            <Badge
              className={cn(
                'px-3 py-1',
                Todo.intensity == 'medium' && 'bg-green-500',
                Todo.intensity == 'low' && 'bg-amber-500',
                Todo.intensity == 'high' && 'bg-destructive'
              )}>
              <Text className={cn('w-fit uppercase tracking-widest')}>{Todo.intensity}</Text>
            </Badge>
            <Badge className={cn('px-3 py-1')}>
              <Text className={cn('w-fit uppercase tracking-widest')}>DEEP WORK</Text>
            </Badge>
          </View>
          <View>
            <Text
              variant={'h2'}
              className="m-0 border-0 p-0 text-left font-poppins_thin text-5xl uppercase tracking-tighter">
              {Todo.title}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Badge variant={'secondary'} className={cn('gap-2 border-0 px-3 py-1')}>
              <Icon as={Calendar} className="" />
              <Text className={cn('w-fit uppercase tracking-widest')}>Oct 24, 2023</Text>
            </Badge>
            <Badge variant={'secondary'} className={cn('gap-2 border-0 px-3 py-1')}>
              <Icon as={Clock} className="" />
              <Text className={cn('w-fit uppercase tracking-widest')}>4:00 PM</Text>
            </Badge>
            {/* <Badge className={cn('px-3 py-1')}>
              <Text className={cn('w-fit uppercase tracking-widest')}>DEEP WORK</Text>
            </Badge> */}
          </View>
        </View>
        <View className="gap-3">
          <Text variant={'muted'} className="font-poppins_thin text-base uppercase tracking-widest">
            Project Scope
          </Text>
          <Text
            variant={'p'}
            className="text-justify font-poppins_regular text-lg leading-relaxed tracking-tight text-muted-foreground">
            {Todo.content || `No content available for this task.`}
          </Text>
        </View>
        <Image
          variant="rounded"
          source={require('@/assets/images/placeholder.png')}
          width={CARD_WIDTH}
          height={IMAGE_HEIGHT}
          containerClassName="overflow-hidden rounded-2xl"
        />
      </Wrapper>
    </>
  );
}
