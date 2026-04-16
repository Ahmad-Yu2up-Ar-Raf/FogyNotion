import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAllTodos,
  Todos,
  getCompletedTodos,
  getPendingTodos,
  getTodosByIntensity,
  getCompletedTodosFromToday,
  getCompletedTodosFromYesterday,
} from '@/lib/storage/todos-storage';

const TODO_QUERY_KEY = ['todo'] as const;

export function TodosListQueryOptions() {
  return {
    queryKey: TODO_QUERY_KEY,
    queryFn: async (): Promise<Todos[]> => {
      console.log('📚 Fetching todos from AsyncStorage...');
      const todos = await getAllTodos();
      console.log('✅ Todos fetched:', todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

export function useTodosData() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(TodosListQueryOptions());

  return {
    todos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

export function useInvalidateTodos() {
  const queryClient = useQueryClient();

  return () => {
    console.log('🔄 Invalidating todos cache...');
    queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
  };
}

/**
 * ✅ NEW: Query options untuk fetch completed todos (server-side filter)
 * Real-time fetch hanya untuk completed todos
 * Reduces data transfer & front-end processing
 */
export function CompletedTodosQueryOptions() {
  return {
    queryKey: [...TODO_QUERY_KEY, 'completed'] as const,
    queryFn: async (): Promise<Todos[]> => {
      console.log('📚 Fetching completed todos from storage...');
      const todos = await getCompletedTodos();
      console.log('✅ Completed todos fetched:', todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ NEW: Query options untuk fetch pending todos
 */
export function PendingTodosQueryOptions() {
  return {
    queryKey: [...TODO_QUERY_KEY, 'pending'] as const,
    queryFn: async (): Promise<Todos[]> => {
      console.log('📚 Fetching pending todos from storage...');
      const todos = await getPendingTodos();
      console.log('✅ Pending todos fetched:', todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ NEW: Query options untuk fetch todos by intensity
 */
export function TodosByIntensityQueryOptions(intensity: string) {
  return {
    queryKey: [...TODO_QUERY_KEY, 'intensity', intensity] as const,
    queryFn: async (): Promise<Todos[]> => {
      console.log(`📚 Fetching ${intensity} intensity todos...`);
      const todos = await getTodosByIntensity(intensity);
      console.log(`✅ ${intensity} intensity todos fetched:`, todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ NEW: Hook untuk fetch completed todos dengan real-time updates
 */
export function useCompletedTodos() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    CompletedTodosQueryOptions()
  );

  return {
    completedTodos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

/**
 * ✅ NEW: Hook untuk fetch pending todos dengan real-time updates
 */
export function usePendingTodos() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(PendingTodosQueryOptions());

  return {
    pendingTodos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

/**
 * ✅ NEW: Hook untuk fetch todos by intensity
 */
export function useTodosByIntensity(intensity: string) {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    TodosByIntensityQueryOptions(intensity)
  );

  return {
    todos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

/**
 * ✅ NEW: Query options untuk fetch completed todos from TODAY
 */
export function CompletedTodosFromTodayQueryOptions() {
  return {
    queryKey: [...TODO_QUERY_KEY, 'completed', 'today'] as const,
    queryFn: async (): Promise<Todos[]> => {
      console.log('📚 Fetching completed todos from TODAY...');
      const todos = await getCompletedTodosFromToday();
      console.log('✅ Today completed todos fetched:', todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ NEW: Query options untuk fetch completed todos from YESTERDAY
 */
export function CompletedTodosFromYesterdayQueryOptions() {
  return {
    queryKey: [...TODO_QUERY_KEY, 'completed', 'yesterday'] as const,
    queryFn: async (): Promise<Todos[]> => {
      console.log('📚 Fetching completed todos from YESTERDAY...');
      const todos = await getCompletedTodosFromYesterday();
      console.log('✅ Yesterday completed todos fetched:', todos.length);
      return todos;
    },
    staleTime: 0,
    retry: 1,
    enabled: true,
  };
}

/**
 * ✅ NEW: Hook untuk fetch completed todos from TODAY
 */
export function useCompletedTodosFromToday() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    CompletedTodosFromTodayQueryOptions()
  );

  return {
    todayTodos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}

/**
 * ✅ NEW: Hook untuk fetch completed todos from YESTERDAY
 */
export function useCompletedTodosFromYesterday() {
  const { data, isLoading, isError, refetch, isRefetching } = useQuery(
    CompletedTodosFromYesterdayQueryOptions()
  );

  return {
    yesterdayTodos: data ?? [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  };
}
