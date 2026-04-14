import React, { useCallback, useEffect } from 'react';
import { Wrapper } from '../layout/wrapper';
import { LegendList } from '@legendapp/list';
import { Text } from '../../fragments/shadcn-ui/text';

import LoadingIndicator from '../loading-indicator';

import { Button } from '../../fragments/shadcn-ui/button';
import { useQuery } from '@tanstack/react-query';
import { TodosListQueryOptions } from '@/hooks/useTodoData';
import LottieView from 'lottie-react-native';
import { RefreshControl, View } from 'react-native';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { PlusIcon, RotateCwIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { TodoCard } from '../../fragments/custom-ui/card/todo-card';

export default function HomeBlock() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(TodosListQueryOptions());

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
            refetch();
          }}>
          <View className="h-full w-fit flex-row items-center justify-center gap-3">
            <Text className="font-poppins_medium text-sm">Try again</Text>
            {isRefetching ? (
              <LoadingIndicator />
            ) : (
              <Icon className="text-primary-foreground" as={RotateCwIcon} />
            )}
          </View>
        </Button>
      </Wrapper>
    );
  }

  if (!data || data.length === 0) {
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
        <Text className="mb-4 text-center text-muted-foreground">No todos yet</Text>
        <Button size={'lg'} className="gap-2" onPress={handleNewNote}>
          <Icon className="text-primary-foreground" as={PlusIcon} />
          <Text className="font-poppins_medium text-sm">Create a todo</Text>
        </Button>
      </Wrapper>
    );
  }
  return (
    <LegendList
      data={data}
      renderItem={({ item, index }) => <TodoCard index={index} todo={item} />}
      keyExtractor={(item, index) => `todo-${item}-${index}`}
      numColumns={1}
      onEndReachedThreshold={1.5}
      contentContainerStyle={{
        paddingTop: 30,
        gap: 12,
        paddingBottom: 100,
      }}
      className="gap-20 px-7"
      maintainVisibleContentPosition
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      recycleItems
      showsVerticalScrollIndicator={false}
    />
  );
}
