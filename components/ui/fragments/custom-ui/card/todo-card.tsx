import React, { useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/fragments/shadcn-ui/card';
import { cn } from '@/lib/utils';
import { Pressable, View, ViewProps } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../shadcn-ui/button';
import { Icon } from '../../shadcn-ui/icon';
import { Text } from '../../shadcn-ui/text';
import { Clock, MoreHorizontalIcon, TrashIcon } from 'lucide-react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../shadcn-ui/dropdown-menu';
import { deleteTodo, Todos, updateStatusTodo } from '@/lib/storage/todos-storage';
import { useToast } from '../../shadcn-ui/toast';
import * as Haptics from 'expo-haptics';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../shadcn-ui/alert-dialog';
import { queryClient } from '@/components/provider/provider';
import { DateArg, intervalToDuration, format, compareAsc } from 'date-fns';

import { Checkbox } from '../../shadcn-ui/checkbox';
import { Badge } from '../../shadcn-ui/badge';

type TodoCardProps = ViewProps & {
  className?: string;
  todo: Todos;
  index: number;
  onDelete?: (todoId: string) => Promise<void>;
};

export function TodoCard({ className, index, todo, onDelete, ...props }: TodoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { success, error: showError } = useToast();

  const contentPreview = useMemo(() => {
    if (!todo.content) return 'No content';
    if (todo.content.length > 100) {
      return todo.content.substring(0, 100) + '...';
    }
    return todo.content;
  }, [todo.content]);

  const navigateToDetail = useCallback(() => {
    router.push({
      pathname: '/(drawer)/post/[id]',
      params: { id: todo.id },
    });
  }, [todo.id]);

  const handleUpdateStatus = useCallback(async () => {
    try {
      console.log('💾 Saving todo...');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateStatusTodo({
        id: todo.id,
        done: !todo.status,
      });
      queryClient.invalidateQueries({ queryKey: ['todo'] });
    } catch (error) {
      console.error('❌ Save error:', error);
      showError('Error', 'Something went wrong');
    }
  }, [success, showError, index, todo.status, todo?.id]);

  const handleDeleteConfirm = useCallback(async () => {
    console.log('hello');
    setShowDeleteDialog(false);
    setIsDeleting(true);

    try {
      await deleteTodo(todo.id);

      queryClient.invalidateQueries({ queryKey: ['todo'] });
      success('Deleted', 'Todo has been deleted');
      console.log('✅ Todo deleted:', todo.id);
    } catch (error) {
      console.error('❌ Delete error:', error);
      showError('Error', 'Failed to delete todo');
    } finally {
      setIsDeleting(false);
    }
  }, [todo.id, onDelete, success, showError]);
  const DateT =
    todo && todo.date && typeof todo.date === 'string' ? new Date(todo.date) : todo.date;
  const end = DateT; // Target date
  const formattedDate = format(`${DateT}`, 'MM/dd/yyyy');

  return (
    <>
      <Card
        className={cn(
          'h-fit w-full items-center rounded-xl px-6 py-4 transition-all duration-200',
          todo.status && 'bg-muted/50',
          className
        )}
        {...props}>
        {/* ✅ MAIN CONTENT AREA - Tap to edit */}
        <Pressable
          onPress={handleUpdateStatus}
          key={`todo-${todo.id}`}
          className="w-full flex-row items-center gap-8 overflow-hidden">
          <View className="w-fit">
            <Checkbox
              id="terms"
              className="size-6 rounded-full"
              checked={todo.status}
              onCheckedChange={handleUpdateStatus}
            />
          </View>
          <CardContent className="w-full flex-1 gap-2 rounded-none p-0 py-0">
            <CardHeader className="relative w-full flex-row items-start justify-between rounded-none p-0">
              <View className="item w-fit flex-row items-center gap-3">
                <CardTitle
                  className={cn(
                    'line-clamp-1 w-fit font-poppins_thin text-lg text-foreground',
                    todo.status && 'text-muted-foreground line-through'
                  )}>
                  {todo.title || 'Untitled'}
                </CardTitle>
                <Text variant={'muted'} className="opacity-55">
                  •
                </Text>
                <Badge
                  className={cn(
                    todo.intensity == 'medium' && 'bg-green-500',
                    todo.intensity == 'low' && 'bg-amber-500',
                    todo.intensity == 'high' && 'bg-destructive',

                    todo.status && 'opacity-65'
                  )}>
                  <Text className={cn(todo.status && 'text-muted')}>{todo.intensity}</Text>
                </Badge>
              </View>

              <DropdownMenu className="">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 size-8"
                    disabled={isDeleting}
                    onPress={(e) => {
                      e.preventDefault();
                    }}>
                    <Icon as={MoreHorizontalIcon} className="size-4 flex-1 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="min-w-[140px]">
                  <DropdownMenuItem onPress={navigateToDetail} className="gap-2">
                    <Text>Edit</Text>
                  </DropdownMenuItem>

                  <DropdownMenuItem onPress={() => setShowDeleteDialog(true)} className="gap-2">
                    <Text className="text-destructive">Delete</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardDescription
              variant="p"
              className={cn('sr-only line-clamp-2 text-xs leading-relaxed text-muted-foreground')}>
              {contentPreview}
            </CardDescription>
            <CardFooter className="w-full gap-2 rounded-none p-0">
              <View className="flex-row items-center gap-2">
                {/* <Icon as={Clock} className="text-muted-foreground/60" /> */}
                <Text
                  className={cn(
                    'text-xs text-muted-foreground/60',
                    todo.status && 'text-muted-foreground/40'
                  )}>
                  Deadline :{formattedDate}
                </Text>
              </View>
            </CardFooter>
          </CardContent>
        </Pressable>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete todo?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? this will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              variant={'destructive'}
              onPress={handleDeleteConfirm}
              disabled={isDeleting}>
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
