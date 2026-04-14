import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Wrapper } from '../layout/wrapper';

import { Text } from '../../fragments/shadcn-ui/text';
import { View, Platform } from 'react-native';

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
import { Todo, Todos } from '@/lib/storage/todos-storage';
import { Textarea } from '../../fragments/shadcn-ui/textarea';
import * as Haptics from 'expo-haptics';
import { Icon } from '../../fragments/shadcn-ui/icon';
import { cn } from '@/lib/utils';
import { Spinner } from '../../fragments/shadcn-ui/spinner';

export interface PostBlockProps {
  mode?: 'create' | 'edit';
  todoData?: Todos;
}
export default function TodoBlock({ mode = 'create', todoData }: PostBlockProps) {
  const { saveTodo } = useTodos();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const dateFromTodo = todoData?.date;
    if (!dateFromTodo) return new Date();
    if (dateFromTodo instanceof Date) return dateFromTodo;
    return new Date(dateFromTodo); // Convert string to Date if needed
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [postData, setPostData] = useState<Todo>({
    title: todoData?.title ?? '',
    content: todoData?.content ?? '',
    status: todoData?.status ?? false,
    date: todoData?.date ?? undefined,
    intensity: todoData?.intensity ?? 'High Priority',
  });
  const initialStateRef = useRef<Todo>({
    title: todoData?.title ?? '',
    content: todoData?.content ?? '',
    status: todoData?.status ?? false,
    date: todoData?.date ?? undefined,
    intensity: todoData?.intensity ?? 'High Priority',
  });
  const [isSaving, setIsSaving] = useState(false);
  const { success, error: showError } = useToast();
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
                    intensity: 'High Priority',
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
                    intensity: 'High Priority',
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

  const bottomWhenClosed = insets.bottom > 0 ? insets.bottom : 12;

  const bottomWhenOpen = 8;

  const animatedButtonStyle = useAnimatedStyle(() => {
    const isKeyboardOpen = keyboard.height.value > 0;
    return {
      bottom: isKeyboardOpen ? keyboard.height.value + bottomWhenOpen : bottomWhenClosed,
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

  const minTodoDate = new Date();
  minTodoDate.setHours(0, 0, 0, 0);

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

  return (
    <>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          leftIcon: ChevronLeftIcon,
          title: ' ',
          rightIcon: MoreHorizontalIcon,
        })}
      />
      <Wrapper
        className="items-start justify-start gap-10 pb-36 pt-9"
        edges={['bottom', 'left', 'right']}>
        {mode == 'create' && (
          <View className="gap-6 pr-7">
            <Text variant={'small'} className="tracking-widest">
              TASK CREATION
            </Text>
            <View>
              <Text variant={'h2'} className="pb-6 text-left text-4xl font-thin uppercase">
                Define your next move.
              </Text>
            </View>
          </View>
        )}
        <View className="w-full gap-14">
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
              className="flex-row items-center justify-between gap-4">
              <View className="flex items-center gap-4">
                <RadioGroupItem value="High Priority" id="r1" />
                <Label htmlFor="r1" onPress={onLabelPress('High Priority')}>
                  High Priorit
                </Label>
              </View>
              <View className="flex items-center gap-4">
                <RadioGroupItem value="Steady Pace" id="r2" />
                <Label htmlFor="r2" onPress={onLabelPress('Steady Pace')}>
                  Steady Pace
                </Label>
              </View>
              <View className="flex items-center gap-4">
                <RadioGroupItem value="Low Focus" id="r3" />
                <Label htmlFor="r3" onPress={onLabelPress('Low Focus')}>
                  Low Focus
                </Label>
              </View>
            </RadioGroup>
          </View>
          <View className="gap-5">
            <Label className="font-poppins_thin tracking-widest">SCHEDULE DATE</Label>
            <Button
              size={'lg'}
              onPress={() => setShowDatePicker(true)}
              variant="outline"
              className="flex-row items-center justify-between rounded-2xl border border-border px-4 py-3">
              <View className="flex-row items-center gap-3">
                <Icon as={Calendar} size={20} className="text-muted-foreground" />
                <Text
                  variant={'muted'}
                  className={cn(
                    'text-sm',
                    selectedDate ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}>
                  {formatDateDisplay(selectedDate)}
                </Text>
              </View>
            </Button>
          </View>

          {/* Native Date Picker Modal */}
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
            {mode == 'edit' ? 'Update' : 'Create'}
          </Text>
          {isSaving && <Spinner className="text-primary-foreground" />}
        </Button>
      </Animated.View>

      {/* <Animated.View
        className="absolute left-0 right-0 px-8"
        style={animatedButtonStyle}></Animated.View> */}
    </>
  );
}
