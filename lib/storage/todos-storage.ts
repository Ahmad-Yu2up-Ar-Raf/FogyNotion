import AsyncStorage from '@react-native-async-storage/async-storage';

const TODO_KEY = 'TODO';

export interface Todos {
  id: string;
  title: string;
  content: string;
  status: boolean;
  intensity: string;
  date: Date | undefined;
  createdAt: number;
  updatedAt: number;
}

export interface Todo {
  title: string;
  content: string;
  date: Date | undefined;
  status: boolean;
  intensity: string;
}

export async function createTodo({ status, intensity, title, content, date }: Todo): Promise<Todo> {
  try {
    if (!title.trim()) {
      throw new Error('❌ Title tidak boleh kosong!');
    }

    const newTodo: Todos = {
      status: status,
      date: date,
      intensity: intensity,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      content: content.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existingTodos = await getAllTodos();

    const allTodos = [newTodo, ...existingTodos];

    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(allTodos));

    console.log('✅ Todo created:', newTodo.id);
    return newTodo;
  } catch (error) {
    console.error('❌ createTodo error:', error);
    throw error;
  }
}

export async function getAllTodos(): Promise<Todos[]> {
  try {
    const data = await AsyncStorage.getItem(TODO_KEY);
    if (!data) return [];

    const todos = JSON.parse(data) as any[];
    // Convert date strings back to Date objects
    return todos.map((todo) => ({
      ...todo,
      date: todo.date ? new Date(todo.date) : undefined,
      createdAt: typeof todo.createdAt === 'string' ? parseInt(todo.createdAt) : todo.createdAt,
      updatedAt: typeof todo.updatedAt === 'string' ? parseInt(todo.updatedAt) : todo.updatedAt,
    })) as Todos[];
  } catch (error) {
    console.error('❌ getAllTodos error:', error);
    return [];
  }
}

export async function getTodoById(id: string): Promise<Todos | null> {
  try {
    const todos = await getAllTodos();
    const todo = todos.find((n) => n.id === id);
    if (todo && todo.date && typeof todo.date === 'string') {
      todo.date = new Date(todo.date);
    }
    return todo || null;
  } catch (error) {
    console.error('❌ getTodoById error:', error);
    return null;
  }
}

export async function updateTodo({
  title,
  intensity,
  id,
  date,
  status,
  content,
}: Todo & { id: string }): Promise<Todos | null> {
  try {
    if (!title.trim()) {
      throw new Error('❌ Title tidak boleh kosong!');
    }

    const todos = await getAllTodos();
    const todoIndex = todos.findIndex((n) => n.id === id);

    if (todoIndex === -1) {
      console.warn(`⚠️ Todo dengan ID ${id} tidak ditemukan`);
      return null;
    }

    const updatedTodo: Todos = {
      ...todos[todoIndex],
      title: title.trim(),
      date: date,
      intensity: intensity,
      status: status,
      content: content.trim(),
      updatedAt: Date.now(),
    };

    todos[todoIndex] = updatedTodo;

    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(todos));

    console.log('✅ Todo updated:', id);
    return updatedTodo;
  } catch (error) {
    console.error('❌ updateTodo error:', error);
    throw error;
  }
}
export async function updateStatusTodo({
  id,
  done,
}: {
  id: string;
  done: boolean;
}): Promise<Todos | null> {
  try {
    const todos = await getAllTodos();
    const todoIndex = todos.findIndex((n) => n.id === id);

    if (todoIndex === -1) {
      console.warn(`⚠️ Todo dengan ID ${id} tidak ditemukan`);
      return null;
    }

    const updatedTodo: Todos = {
      ...todos[todoIndex],

      status: done,
    };

    todos[todoIndex] = updatedTodo;

    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(todos));

    console.log('✅ Todo updated:', id);
    console.log('✅ Todo updated:', done);
    return updatedTodo;
  } catch (error) {
    console.error('❌ updateTodo error:', error);
    throw error;
  }
}

export async function deleteTodo(id: string): Promise<boolean> {
  try {
    const todos = await getAllTodos();
    const filteredTodos = todos.filter((n) => n.id !== id);

    if (filteredTodos.length === todos.length) {
      console.warn(`⚠️ Todo dengan ID ${id} tidak ditemukan`);
      return false;
    }

    await AsyncStorage.setItem(TODO_KEY, JSON.stringify(filteredTodos));

    console.log('✅ Todo deleted:', id);
    return true;
  } catch (error) {
    console.error('❌ deleteTodo error:', error);
    throw error;
  }
}

export async function clearAllTodos(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TODO_KEY);
    console.log('✅ All todos cleared');
  } catch (error) {
    console.error('❌ clearAllTodos error:', error);
    throw error;
  }
}

export async function getTodoCount(): Promise<number> {
  try {
    const todos = await getAllTodos();
    return todos.length;
  } catch (error) {
    console.error('❌ getTodoCount error:', error);
    return 0;
  }
}

export async function searchTodos(query: string): Promise<Todo[]> {
  try {
    const todos = await getAllTodos();
    const lowerQuery = query.toLowerCase();

    return todos.filter(
      (todo) =>
        todo.title.toLowerCase().includes(lowerQuery) ||
        todo.content.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('❌ searchTodos error:', error);
    return [];
  }
}
