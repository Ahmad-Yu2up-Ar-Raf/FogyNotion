// components/ui/core/block/chat-block.tsx
//
// FIX FREEZE ERROR — ROOT CAUSE SEBENARNYA:
//
//   Animated.ScrollView dari react-native-reanimated mem-FREEZE object-nya
//   sehingga useRef (maupun useAnimatedRef) tidak bisa di-set → error freeze
//
// ✅ SOLUSI FINAL:
//   1. Pakai ScrollView biasa dari 'react-native' → supports useRef<ScrollView> normal
//   2. Animated padding dipindah ke Animated.View WRAPPER di dalam ScrollView
//      bukan di contentContainerStyle ScrollView-nya
//   3. Layout tetap benar: ScrollView flex:1, InputBar di bawahnya

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, View, ActivityIndicator, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Send, RotateCcw, Sparkles } from 'lucide-react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import { Text } from '../../fragments/shadcn-ui/text';
import { SCREEN_OPTIONS } from '@/components/ui/core/layout/chat-header';
import { Textarea } from '../../fragments/shadcn-ui/textarea';
import { Button } from '../../fragments/shadcn-ui/button';
import { Spinner } from '../../fragments/shadcn-ui/spinner';
import { streamChatWithAI, type ChatMessage } from '@/lib/server/chat/together-ai';
import { THEME } from '@/lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = 'user' | 'assistant';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

// ✅ Union type — accept light dan dark theme sekaligus
type AppTheme = (typeof THEME)[keyof typeof THEME];

// ─── Konstanta ────────────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Assalamualaikum warahmatullahi wabarakatuh 🌙\n\nSaya Unta, asisten AI Islami kamu. Tanya apa saja seputar ibadah, dzikir, doa, atau kehidupan sehari-hari berdasarkan Islam.',
};

// ─── ChatBlock ────────────────────────────────────────────────────────────────

export default function ChatBlock() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputBarHeight, setInputBarHeight] = useState(90);

  // ✅ useRef<ScrollView> dari react-native — BUKAN Animated.ScrollView
  // ScrollView biasa tidak di-freeze oleh Reanimated → ref bekerja normal
  const scrollRef = useRef<ScrollView>(null);

  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();
  const cancelRef = useRef<(() => void) | null>(null);

  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'] as AppTheme;

  // Cleanup typewriter saat unmount
  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  // ─── Scroll to bottom ──────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    cancelRef.current?.();
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setIsLoading(false);
  }, []);

  // ─── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const aiMsgId = `ai-${Date.now() + 1}`;
    const aiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome' && !m.isStreaming)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: trimmed });

    const cancel = await streamChatWithAI(
      history,
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + chunk } : m))
        );
        scrollToBottom();
      },
      () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m))
        );
        setIsLoading(false);
        cancelRef.current = null;
      },
      (err) => {
        console.error('[ChatBlock]', err.message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                  isStreaming: false,
                }
              : m
          )
        );
        setIsLoading(false);
        cancelRef.current = null;
      }
    );

    cancelRef.current = cancel;
  }, [input, isLoading, messages, scrollToBottom]);

  // ─── Animated styles ───────────────────────────────────────────────────────

  // ✅ Padding bawah untuk Animated.View di DALAM ScrollView
  // Ini yang buat content bisa di-scroll sampai bawah meskipun input bar ada
  const animatedInnerPaddingStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(keyboard.height.value + inputBarHeight, inputBarHeight + 16),
  }));

  // Input bar naik mengikuti keyboard
  const safeBottom = insets.bottom > 0 ? insets.bottom : 12;
  const animatedInputBarStyle = useAnimatedStyle(() => {
    const kbHeight = keyboard.height.value;
    return {
      transform: [{ translateY: kbHeight > 0 ? -(kbHeight - safeBottom) : 0 }],
    };
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <Stack.Screen
        options={SCREEN_OPTIONS({
          title: 'Unta AI',
          leftIcon: ChevronLeft,
          leftAction: () => router.back(),
          rightIcon: RotateCcw,
          rightAction: handleReset,
        })}
      />

      {/* ── Message List ─────────────────────────────────────────────────── */}
      {/* ✅ ScrollView dari react-native — ref tidak di-freeze */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}>
        {/* ✅ Animated.View di DALAM ScrollView sebagai content wrapper */}
        {/* Ini yang animasi paddingBottom mengikuti keyboard — bukan ScrollView-nya */}
        <Animated.View style={animatedInnerPaddingStyle} className="gap-3 px-4 pt-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} theme={theme} />
          ))}
        </Animated.View>
      </ScrollView>

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          animatedInputBarStyle,
          {
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            paddingBottom: safeBottom,
          },
        ]}
        onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}>
        <View className="flex-row items-end gap-2 px-4 pt-3">
          <Textarea
            value={input}
            onChangeText={setInput}
            placeholder="Tanya sesuatu..."
            numberOfLines={Platform.select({ native: 4, web: 2 })}
            className="max-h-[120px] min-h-[44px] flex-1 rounded-2xl border-border bg-input font-poppins_regular text-white placeholder:text-white  text-[14px] dark:bg-input/20"
            blurOnSubmit={false}
            returnKeyType="default"
          />

          <SendButton
            onPress={handleSend}
            isLoading={isLoading}
            canSend={input.trim().length > 0 && !isLoading}
            theme={theme}
          />
        </View>

        <Text className="pb-1 pt-2 text-center font-poppins_regular text-[11px] text-muted-foreground/50">
          Unta AI dapat membuat kesalahan. Verifikasi info penting.
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  theme: AppTheme;
}

function MessageBubble({ message, theme }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View className={isUser ? 'items-end' : 'items-start'}>
      {!isUser && (
        <View className="mb-1 flex-row items-center gap-1.5 pl-1">
          <Sparkles size={11} color={theme.primary} />
          <Text className="font-poppins_medium text-xs text-muted-foreground">Unta AI</Text>
        </View>
      )}

      <View
        className={
          isUser
            ? 'max-w-[82%] rounded-3xl rounded-tr-md bg-primary px-4 py-3'
            : 'max-w-[88%] rounded-3xl rounded-tl-md border border-border bg-card px-4 py-3'
        }>
        {message.isStreaming && message.content.length === 0 ? (
          <TypingDots />
        ) : (
          <Text
            className={
              isUser
                ? 'font-poppins_regular text-[14.5px] leading-6 text-primary-foreground'
                : 'font-poppins_regular text-[14.5px] leading-6 text-foreground'
            }>
            {message.content}
            {message.isStreaming && <Text className="font-poppins_semibold text-primary"> ▍</Text>}
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── TypingDots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <View className="flex-row items-center gap-1.5 px-1 py-1">
      <ActivityIndicator size="small" />
      <Text className="font-poppins_regular text-xs text-muted-foreground">sedang menulis...</Text>
    </View>
  );
}

// ─── SendButton ───────────────────────────────────────────────────────────────

interface SendButtonProps {
  onPress: () => void;
  isLoading: boolean;
  canSend: boolean;
  theme: AppTheme;
}

function SendButton({ onPress, isLoading, canSend, theme }: SendButtonProps) {
  return (
    <Button
      onPress={onPress}
      disabled={!canSend}
      size="icon"
      variant={canSend ? 'default' : 'outline'}
      className="mb-0.5 h-11 w-11 rounded-2xl">
      {isLoading ? (
        <Spinner color={theme.primaryForeground} />
      ) : (
        <Send size={18} color={canSend ? theme.primaryForeground : theme.mutedForeground} />
      )}
    </Button>
  );
}
