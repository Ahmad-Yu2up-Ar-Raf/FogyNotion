import React, { useCallback } from 'react';
import { Wrapper } from '../layout/wrapper';

import { useAuth, useUser } from '@clerk/clerk-expo';
import { UserAvatar } from '../feauture/auth/user-menu';
import { router, Stack } from 'expo-router';
import { SCREEN_OPTIONS } from '../layout/nav';
import { batasiKata } from '@/hooks/useWord';
import {
  Bell,
  ChevronLeft,
  Edit,
  LogOutIcon,
  Moon,
  Pen,
  Pencil,
  PenLine,
  PlusIcon,
  RotateCcwIcon,
  Settings,
  Share2,
  Shield,
} from 'lucide-react-native';
import { View } from 'react-native';
import { Button } from '../../fragments/shadcn-ui/button';
import { Icon } from '../../fragments/shadcn-ui/icon';

import { Text } from '../../fragments/shadcn-ui/text';

import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Separator } from '../../fragments/shadcn-ui/separator';
import LoadingIndicator from '../loading-indicator';
import { useQuery } from '@tanstack/react-query';
import LottieView from 'lottie-react-native';
import {
  CompletedTodosFromTodayQueryOptions,
  CompletedTodosFromYesterdayQueryOptions,
} from '@/hooks/useTodoData';
import { TodoCard } from '../../fragments/custom-ui/card/todo-card';
export default function ProfileBlock() {
  const { scrollAnimatedPosition, scrollHandler } = useScrollAnimation({
    showTriggerPoint: 80,
    hideTriggerPoint: 0,
  });

  // ✅ CHANGE: Fetch completed todos for TODAY
  const {
    data: todayData,
    isLoading: isTodayLoading,
    isError: isTodayError,
    refetch: refetchToday,
    isRefetching: isTodayRefetching,
  } = useQuery(CompletedTodosFromTodayQueryOptions());

  // ✅ CHANGE: Fetch completed todos for YESTERDAY
  const {
    data: yesterdayData,
    isLoading: isYesterdayLoading,
    isError: isYesterdayError,
    refetch: refetchYesterday,
    isRefetching: isYesterdayRefetching,
  } = useQuery(CompletedTodosFromYesterdayQueryOptions());

  const isLoading = isTodayLoading || isYesterdayLoading;
  const isError = isTodayError || isYesterdayError;
  const isRefetching = isTodayRefetching || isYesterdayRefetching;

  const completedTodayData = todayData ?? [];
  const completedYesterdayData = yesterdayData ?? [];
  const totalCompleted = completedTodayData.length + completedYesterdayData.length;
  const handleNewNote = useCallback(() => {
    router.push('/(drawer)/post');
  }, []);

  if (isLoading) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-2 text-center text-muted-foreground">Failed to load todos</Text>
        <Button
          disabled={isRefetching}
          size={'lg'}
          className="gap-2"
          onPress={() => {
            refetchToday();
            refetchYesterday();
          }}>
          <View className="h-full w-fit flex-row items-center justify-center gap-3">
            <Text className="font-poppins_medium text-sm">Try again</Text>
            {isRefetching ? (
              <LoadingIndicator />
            ) : (
              <Icon className="text-primary-foreground" as={RotateCcwIcon} />
            )}
          </View>
        </Button>
      </Wrapper>
    );
  }

  if (
    (!todayData && !yesterdayData) ||
    (completedTodayData.length === 0 && completedYesterdayData.length === 0)
  ) {
    return (
      <Wrapper
        className="flex-1 content-center items-center justify-center"
        edges={['bottom', 'left', 'right']}>
        <LottieView
          autoPlay
          style={{
            width: 200,
            height: 200,
          }}
          source={require('@/assets/animations/error.json')}
        />
        <Text className="mb-4 text-center text-muted-foreground">No completed tasks yet</Text>
        <Button size={'lg'} className="gap-2" onPress={handleNewNote}>
          <Icon className="text-primary-foreground" as={PlusIcon} />
          <Text className="font-poppins_medium text-sm">Create a task</Text>
        </Button>
      </Wrapper>
    );
  }
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: 'Completed',
          leftIcon: ChevronLeft,
          scrollAnimatedPosition,
          scrollTriggerPoint: 80,
        })}
      />
      <Wrapper
        animatedScrollHandler={scrollHandler}
        className="items-start justify-start gap-12 pb-56 pt-9"
        edges={['left', 'right']}>
        <View className="mb-2 w-full gap-6">
          <Text variant={'small'} className="tracking-widest">
            COMPLETED TASKS
          </Text>
          <View>
            <Text
              variant={'h2'}
              className="up m-0 border-0 p-0 text-left font-poppins_thin text-4xl">
              Achievement
            </Text>
          </View>
          <View className="w-full flex-row items-center gap-3">
            <Separator className="w-full flex-1" />
            <Text variant={'small'} className="text-muted-foreground">
              {totalCompleted < 10 ? '0' + totalCompleted : totalCompleted}{' '}
              {totalCompleted > 1 ? 'tasks' : 'task'} Done
            </Text>
          </View>
        </View>

        {/* ✅ SECTION 1: Today's Completed Todos */}
        {completedTodayData && completedTodayData.length > 0 && (
          <View className="gap-9">
            <View className="w-full flex-row items-baseline justify-between gap-6">
              <Text variant={'h4'} className="up m-0 border-0 p-0 text-left font-poppins_semibold">
                Today
              </Text>
              <Text variant={'small'} className="font-poppins_semibold text-muted-foreground/50">
                {new Date().toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View className="w-full gap-2">
              {completedTodayData
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((todo, i) => (
                  <TodoCard index={i} key={todo.id} todo={todo} />
                ))}
            </View>
          </View>
        )}

        {/* ✅ SECTION 2: Yesterday's Completed Todos */}
        {completedYesterdayData && completedYesterdayData.length > 0 && (
          <View className="gap-9">
            <View className="w-full flex-row items-baseline justify-between gap-6">
              <Text variant={'h4'} className="up m-0 border-0 p-0 text-left font-poppins_semibold">
                Yesterday
              </Text>
              <Text variant={'small'} className="font-poppins_semibold text-muted-foreground/50">
                {new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString(
                  'id-ID',
                  {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }
                )}
              </Text>
            </View>
            <View className="w-full gap-2">
              {completedYesterdayData
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((todo, i) => (
                  <TodoCard index={i} key={todo.id} todo={todo} />
                ))}
            </View>
          </View>
        )}
      </Wrapper>
    </>
  );
}
