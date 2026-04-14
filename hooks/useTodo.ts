import { useCallback, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createTodo,
  updateTodo,
  deleteTodo,
  getAllTodos,
  getTodoById,
  Todos,
  Todo,
  updateStatusTodo,
} from '@/lib/storage/todos-storage';

interface UseTodosReturn {
  todo: Todos[];
  isLoading: boolean;
  error: string | null;
  updateStatus: ({ id, done }: { id: string; done: boolean }) => Promise<Todo | null>;
  saveTodo: ({
    title,
    intensity,
    id,
    date,
    status,
    content,
  }: Todos & {
    id: string;
  }) => Promise<Todo | null>;
  removeTodo: (id: string) => Promise<boolean>;
  loadAllTodos: () => Promise<void>;
  clearError: () => void;
}

export function useTodos(): UseTodosReturn {
  const [todo, setTodos] = useState<Todos[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadAllTodos();
  }, []);

  const loadAllTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allTodos = await getAllTodos();
      setTodos(allTodos);
      console.log('✅ Todos loaded:', allTodos.length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load todo';
      setError(errorMsg);
      console.error('❌ loadAllTodos:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTodo = useCallback(
    async ({
      title,
      intensity,
      id,
      date,
      status,
      content,
    }: Todos & { id: string }): Promise<Todo | null> => {
      try {
        setIsLoading(true);
        setError(null);

        let savedTodo: Todo | null;

        if (id) {
          console.log('📝 Updating todo:', id);
          savedTodo = await updateTodo({
            id: id,
            title: title,
            status: status,
            date: date,
            content: content,
            intensity: intensity,
          });
        } else {
          console.log('✨ Creating new todo');
          savedTodo = await createTodo({
            title: title,
            status: status,
            date: date,
            content: content,
            intensity: intensity,
          });
        }

        queryClient.invalidateQueries({ queryKey: ['todo'] });

        return savedTodo;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to save todo';
        setError(errorMsg);
        console.error('❌ saveTodo:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadAllTodos, queryClient]
  );
  const updateStatus = useCallback(
    async ({ id, done }: { id: string; done: boolean }): Promise<Todo | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const savedTodo = await updateStatusTodo({
          id: id,
          done: done,
        });

        console.log('📝 Updating Status todo:', id);

        queryClient.invalidateQueries({ queryKey: ['todo'] });

        return savedTodo;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to save todo';
        setError(errorMsg);
        console.error('❌ saveTodo:', errorMsg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [loadAllTodos, queryClient]
  );

  const removeTodo = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const success = await deleteTodo(id);

        if (success) {
          setTodos((prev) => prev.filter((n) => n.id !== id));
          console.log('✅ Todo deleted locally');

          queryClient.invalidateQueries({ queryKey: ['todo'] });
        }

        return success;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete todo';
        setError(errorMsg);
        console.error('❌ removeTodo:', errorMsg);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    todo,
    isLoading,
    error,
    updateStatus,
    saveTodo,
    removeTodo,
    loadAllTodos,
    clearError,
  };
}
