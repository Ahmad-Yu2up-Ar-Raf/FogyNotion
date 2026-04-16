import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Wrapper } from '../layout/wrapper';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../fragments/shadcn-ui/alert-dialog';
import { Text } from '../../fragments/shadcn-ui/text';
import { View, Platform } from 'react-native';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../fragments/shadcn-ui/dropdown-menu';
import { useToast } from '../../fragments/shadcn-ui/toast';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../fragments/shadcn-ui/button';
import { Calendar } from 'lucide-react-native';
import { SCREEN_OPTIONS } from '../layout/nav';
import { router, Stack } from 'expo-router';
import { ChevronLeftIcon, MoreHorizontalIcon } from 'lucide-react-native';
import { RadioGroup, RadioGroupItem } from '@/components/ui/fragments/shadcn-ui/radio-group';
import { Input } from '../../fragments/shadcn-ui/input';
import { Label } from '../../fragments/shadcn-ui/label';
import { useTodos } from '@/hooks/useTodo';
import { deleteTodo, Todo, Todos } from '@/lib/storage/todos-storage';
import { Textarea } from '../../fragments/shadcn-ui/textarea';
import * as Haptics from 'expo-haptics';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { cn } from '@/lib/utils';
import { Spinner } from '../../fragments/shadcn-ui/spinner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Separator } from '../../fragments/shadcn-ui/separator';

export interface PostBlockProps {
  mode?: 'create' | 'edit';
  todoData?: Todos;
}
export default function TodoBlock({ mode = 'create', todoData }: PostBlockProps) {
  const { saveTodo } = useTodos();

  // ✅ Scroll animation hook for header trigger
  // Only active when mode is 'create' to show "New Task" title on scroll
  const { scrollAnimatedPosition, scrollHandler } = useScrollAnimation({
    showTriggerPoint: 80,
    hideTriggerPoint: 0,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateFromTodo = todoData?.date;
    if (!dateFromTodo) return new Date();
    if (dateFromTodo instanceof Date) return dateFromTodo;
    return new Date(dateFromTodo); // Convert string to Date if needed
  });
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [postData, setPostData] = useState<Todo>({
    title: todoData?.title ?? '',
    content: todoData?.content ?? '',
    status: todoData?.status ?? false,
    date: todoData?.date ?? undefined,
    intensity: todoData?.intensity ?? 'medium',
  });
  const initialStateRef = useRef<Todo>({
    title: todoData?.title ?? '',
    content: todoData?.content ?? '',
    status: todoData?.status ?? false,
    date: todoData?.date ?? undefined,
    intensity: todoData?.intensity ?? 'medium',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();
  const hasChanges = useMemo(
    () =>
      postData.title.trim() !== initialStateRef.current.title.trim() ||
      postData.content.trim() !== initialStateRef.current.content.trim(),
    [postData.title, postData.content]
  );

  const handleDiscard = useCallback(() => {
    if (!hasChanges) {
      router.push('/');
      return;
    }
    setShowDiscardDialog(true);
  }, [hasChanges]);
  const handleSaveTodo = useCallback(async () => {
    try {
      const title = postData.title.trim();
      const content = postData.content.trim();

      if (!title) {
        showError('Oops', 'Title cannot be empty');
        return;
      }

      setIsSaving(true);
      console.log('💾 Saving todo...');

      requestAnimationFrame(async () => {
        try {
          const now = new Date().getTime();
          const todoId = todoData?.id ?? '';
          const result = await saveTodo({
            id: todoId,
            title: title,
            date: postData.date ?? new Date(),
            intensity: postData.intensity,
            status: postData.status,
            content: content,
            createdAt: todoData?.createdAt ?? now,
            updatedAt: now,
          });

          if (result) {
            router.push('/');
            if (mode === 'create') {
              setTimeout(
                () =>
                  setPostData({
                    title: '',
                    content: '',
                    date: new Date(),
                    status: false,
                    intensity: 'medium',
                  }),
                500
              );
              setTimeout(
                () =>
                  (initialStateRef.current = {
                    title: '',
                    date: new Date(),
                    content: '',
                    status: false,
                    intensity: 'medium',
                  }),
                500
              );
            }

            success('Saved!', mode === 'edit' ? 'Todo updated' : 'Your todo has been saved');
          }
        } catch (error) {
          console.error('❌ Save error:', error);
          showError('Failed', 'Could not save todo. Try again.');
        } finally {
          setIsSaving(false);
        }
      });
    } catch (error) {
      console.error('❌ Save error:', error);
      showError('Error', 'Something went wrong');
      setIsSaving(false);
    }
  }, [postData, saveTodo, success, showError, mode, todoData?.id]);

  const insets = useSafeAreaInsets();

  const keyboard = useAnimatedKeyboard();

  const animatedButtonStyle = useAnimatedStyle(() => {
    const keyboardHeight = keyboard.height.value;
    const bottomPadding = insets.bottom > 0 ? insets.bottom : 12;

    return {
      bottom: keyboardHeight > 0 ? keyboardHeight + 8 : bottomPadding,
    };
  });

  const handleTitleChange = useCallback((text: string) => {
    const cleanedText = text.replace(/\n/g, '');
    setPostData((prev) => ({ ...prev, title: cleanedText }));
    console.log('📝 Title:', cleanedText.substring(0, 20) || '(empty)');
  }, []);
  const handleContentChange = useCallback((text: string) => {
    setPostData((prev) => ({ ...prev, content: text }));
    console.log('📝 Content updated');
  }, []);
  function onLabelPress(label: string) {
    return () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPostData((prev) => ({ ...prev, intensity: label }));
    };
  }

  function onValueChange(value: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPostData((prev) => ({ ...prev, intensity: value }));
  }

  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 18);
  const handleConfirmDelete = useCallback(async () => {
    if (mode === 'edit' && todoData?.id) {
      setShowDeleteDialog(false);
      setIsSaving(true);

      try {
        const success_delete = await deleteTodo(todoData.id);
        if (success_delete) {
          console.log('✅ Note deleted:', todoData.id);
          success('Deleted', 'Note has been deleted');
          // Navigate back
          setTimeout(() => router.back(), 500);
        }
      } catch (error) {
        console.error('❌ Delete error:', error);
        showError('Error', 'Failed to delete todo');
      } finally {
        setIsSaving(false);
      }
    } else {
      setShowDeleteDialog(false);
      setPostData({ title: '', content: '', date: new Date(), status: false, intensity: 'medium' });
      router.push('/');
      console.log('↩️ Cleared');
      success('Cleared', 'Note cleared');
    }
  }, [mode, todoData, success, showError]);
  const minTodoDate = new Date();
  minTodoDate.setHours(0, 0, 0, 0);
  const handleResetNote = useCallback(() => {
    if (mode === 'edit') {
      setPostData({
        title: '',
        content: '',
        date: new Date(),
        status: false,
        intensity: 'medium',
      });
      success('Reverted', 'Changes discarded');
    } else {
      setPostData({ title: '', content: '', date: new Date(), status: false, intensity: 'medium' });
      initialStateRef.current = {
        title: '',
        content: '',
        date: new Date(),
        status: false,
        intensity: 'medium',
      };

      success('Reset', 'Note cleared');
    }
    console.log('🔄 Note reset');
  }, [mode, postData, success]);

  const formatDateDisplay = useCallback((date: Date | undefined) => {
    if (!date) return 'Select a date';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }, []);

  const handleDateChange = useCallback(
    (event: any, date?: Date) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }

      if (date) {
        if (date < minTodoDate) {
          showError('Invalid Date', 'Cannot select past dates');
          return;
        }

        setSelectedDate(date);
        setPostData((prev) => ({ ...prev, date: date }));
        console.log('📅 Date selected:', date.toLocaleDateString());
      }
    },
    [minTodoDate, showError]
  );
  const handleConfirmDiscard = useCallback(() => {
    setShowDiscardDialog(false);
    setPostData({ title: '', content: '', date: new Date(), status: false, intensity: 'medium' });
    router.back();
    console.log('↩️ Discarded');
  }, []);
  const MenuButton = useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-10" disabled={isSaving}>
            <Icon as={MoreHorizontalIcon} className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-[160px]">
          <DropdownMenuItem
            onPress={handleSaveTodo}
            disabled={isSaving || !hasChanges}
            className="gap-2">
            <Text className={!hasChanges ? 'opacity-50' : ''}>Save</Text>
          </DropdownMenuItem>

          <DropdownMenuItem onPress={handleResetNote} disabled={!hasChanges} className="gap-2">
            <Text className={!hasChanges ? 'opacity-50' : ''}>Reset</Text>
          </DropdownMenuItem>
          {mode === 'edit' && (
            <DropdownMenuItem onPress={() => setShowDeleteDialog(true)} className="gap-2">
              <Text className="text-destructive">Delete</Text>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [isSaving, hasChanges, handleSaveTodo, handleResetNote]
  );
  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          leftIcon: ChevronLeftIcon,
          title: mode == 'edit' ? 'Edit' : mode == 'create' ? 'New Task' : ' ',
          RigthComponent: MenuButton,
          leftAction: handleDiscard,
          // ✅ Pass scroll animation for create mode
          // Title will fade in/slide up as user scrolls
          ...(mode === 'create' && {
            scrollAnimatedPosition,
            scrollTriggerPoint: 80,
          }),
        })}
      />
      <Wrapper
        className="items-start justify-start gap-7 pb-56 pt-3"
        edges={['bottom', 'left', 'right']}
        // ✅ Pass scroll handler only for create mode
        // Wrapper akan trigger scroll animation di header
        animatedScrollHandler={mode === 'create' ? scrollHandler : undefined}>
        {mode == 'create' && (
          <>
            <View className="gap-6 pr-16">
              <Text variant={'small'} className="tracking-widest">
                TASK CREATION
              </Text>
              <View>
                <Text
                  variant={'h2'}
                  className="m-0 border-0 p-0 text-left font-poppins_thin text-5xl uppercase">
                  Define your next move.
                </Text>
              </View>
            </View>
            <Separator />
          </>
        )}
        <View className="mt-6 w-full gap-14">
          <View className="gap-5">
            <Label
              nativeID="title-todo"
              className="font-poppins_thin tracking-widest"
              htmlFor="title-todo">
              THE OBJECTIVE
            </Label>
            <Input
              aria-labelledby="title-todo"
              id="title-todo"
              value={postData.title}
              onChangeText={handleTitleChange}
              placeholder="What needs to be done?"
              className="w-full"
            />
          </View>
          <View className="gap-5">
            <Label
              nativeID="content-todo"
              className="font-poppins_thin tracking-widest"
              htmlFor="content-todo">
              CONTEXT & DETAILS
            </Label>
            <Textarea
              aria-labelledby="content-todo"
              id="content-todo"
              value={postData.content}
              onChangeText={handleContentChange}
              placeholder="Add any specific requirements or links..."
              className="w-full placeholder:text-muted-foreground/50"
            />
          </View>
          <View className="gap-9">
            <Text variant={'small'} className="font-poppins_thin tracking-widest">
              TASK INTENSITY
            </Text>
            <RadioGroup
              value={postData.intensity}
              onValueChange={onValueChange}
              className="flex-row items-center justify-start gap-10">
              <View className="flex-row items-center gap-2">
                <RadioGroupItem
                  indicatorClassName="bg-destructive"
                  value="high"
                  id="high"
                  className="cursor-pointer border-destructive text-destructive"
                />
                <Label
                  onPress={onLabelPress('high')}
                  htmlFor="high"
                  className="cursor-pointer pb-0.5 font-medium leading-none text-destructive">
                  High
                </Label>
              </View>

              <View className="flex-row items-center gap-2">
                <RadioGroupItem
                  indicatorClassName="bg-teal-500"
                  value="medium"
                  id="medium"
                  className="cursor-pointer border-teal-500 text-teal-500"
                />
                <Label
                  onPress={onLabelPress('medium')}
                  htmlFor="medium"
                  className="cursor-pointer pb-0.5 font-medium leading-none text-teal-500">
                  Medium
                </Label>
              </View>

              <View className="flex-row items-center gap-2">
                <RadioGroupItem
                  indicatorClassName="bg-amber-500"
                  value="low"
                  id="low"
                  className="cursor-pointer border-amber-500 text-amber-500"
                />
                <Label
                  onPress={onLabelPress('low')}
                  htmlFor="low"
                  className="cursor-pointer pb-0.5 font-medium leading-none text-amber-500">
                  Low
                </Label>
              </View>
            </RadioGroup>
          </View>
          <View className="gap-5">
            <Label className="font-poppins_thin tracking-widest">THE DEADLINE</Label>
            <Button
              size={'lg'}
              onPress={() => setShowDatePicker(true)}
              variant="outline"
              className="flex-row items-center justify-between rounded-2xl border border-border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Calendar} size={20} className="text-muted-foreground" />
                <Text variant={'muted'} className={cn('text-muted-foreground')}>
                  {formatDateDisplay(selectedDate)}
                </Text>
              </View>
            </Button>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={minTodoDate}
              onChange={handleDateChange}
            />
          )}
        </View>
      </Wrapper>
      <Animated.View
        className="absolute left-0 right-0 bg-background px-7"
        style={animatedButtonStyle}>
        <Button
          onPress={handleSaveTodo}
          disabled={isSaving || postData.title.trim().length == 0}
          variant="default"
          size={'lg'}>
          <Text className="font-poppins_semibold text-lg text-primary-foreground">
            {mode == 'edit' ? 'Update' : 'Deploy'}
          </Text>
          {isSaving && <Spinner className="text-primary-foreground" />}
        </Button>
      </Animated.View>
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Save before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={handleConfirmDiscard}>
              <Text>Discard</Text>
            </AlertDialogCancel>
            <AlertDialogAction variant={'default'} onPress={handleSaveTodo}>
              <Text>Save</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete todo?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction variant={'destructive'} onPress={handleConfirmDelete}>
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
