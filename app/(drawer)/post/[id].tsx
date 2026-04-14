import React, { useEffect, useState, useMemo } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getTodoById, Todos } from '@/lib/storage/todos-storage';
import PostTodoBlock from '@/components/ui/core/block/post-block';
import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/fragments/shadcn-ui/text';
import LoadingIndicator from '@/components/ui/core/loading-indicator';

export default function TodoDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [todo, setTodo] = useState<Todos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No todo ID provided');
      setIsLoading(false);
      return;
    }

    const loadTodo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📚 Loading todo:', id);

        const loadedTodo = await getTodoById(id);

        if (!loadedTodo) {
          setError('Todo not found');
          console.warn('⚠️ Todo not found:', id);
          setIsLoading(false);
          return;
        }

        setTodo(loadedTodo);
        console.log('✅ Todo loaded successfully:', {
          id: id,
          title: loadedTodo.title,
          contentLength: loadedTodo.content.length,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load todo';
        setError(errorMsg);
        console.error('❌ Error loading todo:', errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodo();
  }, [id]);

  const screenOptions = useMemo(() => {
    return {
      headerShown: false,
    };
  }, []);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={screenOptions} />
        <LoadingIndicator />
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 6️⃣ ERROR STATE
  // ─────────────────────────────────────────────────────────────

  if (error || !todo) {
    return (
      <>
        <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
          <Text className="text-center font-poppins_semibold text-lg text-destructive">Error</Text>
          <Text className="text-center text-muted-foreground">{error || 'Todo not found'}</Text>
        </View>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 7️⃣ SUCCESS: Pass todo data to PostBlock in edit mode
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={screenOptions} />
      {/* 
        ✅ KEY: Import PostBlock directly (not the wrapper)
        ✅ mode='edit' tells PostBlock this is an edit operation
        ✅ todoData={todo} pre-fills the form with loaded todo
      */}
      <PostTodoBlock mode="edit" todoData={todo} />
    </>
  );
}
