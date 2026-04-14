import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllTodos, Todos } from '@/lib/storage/todos-storage';

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
