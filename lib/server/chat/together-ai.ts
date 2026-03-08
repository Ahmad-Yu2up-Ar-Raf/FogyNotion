// lib/server/chat/together-ai.ts
//
// ⚠️  ROOT CAUSE STREAMING ERROR:
//    React Native (Hermes engine) TIDAK support ReadableStream / res.body.getReader()
//    Sehingga setiap call streaming masuk ke catch → onError → "Maaf terjadi kesalahan"
//
// ✅ SOLUSI:
//    1. Pakai non-streaming fetch biasa (reliable di semua RN version)
//    2. Simulate typewriter effect dengan chunking + setTimeout
//    3. Feel-nya tetap "streaming" tapi technically non-streaming

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── ENV vars — Expo Babel replace ini saat build time ────────────────────────
const TOGETHER_API_KEY = process.env.EXPO_PUBLIC_TOGETHER_API_KEY ?? '';
const TOGETHER_MODEL =
  process.env.EXPO_PUBLIC_TOGETHER_MODEL ?? 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
const TOGETHER_BASE_URL = 'https://api.together.xyz/v1/chat/completions';

// ─── System Prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Kamu adalah Unta, asisten AI Islami yang cerdas, sopan, dan berpengetahuan luas.
Kamu membantu umat Muslim dengan pertanyaan seputar ibadah, dzikir, doa, Al-Quran, hadits, dan kehidupan sehari-hari berdasarkan Islam.
Jawab dengan bahasa Indonesia yang santun. Selalu awali jawaban dengan Bismillah jika relevan.
Jika ditanya sesuatu yang tidak berkaitan dengan Islam atau di luar pengetahuanmu, sampaikan dengan jujur dan sopan.
Hindari fatwa yang tidak berdasar — arahkan ke ulama atau sumber terpercaya untuk pertanyaan fiqih kompleks.`;

// ─── Typewriter Simulator ─────────────────────────────────────────────────────
// Memecah full response menjadi micro-chunks dan emit dengan delay
// sehingga UI terasa "streaming" meskipun fetch-nya non-streaming
function simulateTypewriter(
  fullText: string,
  onChunk: (text: string) => void,
  onDone: () => void
): () => void {
  const CHUNK_SIZE = 3; // karakter per emit
  const DELAY_MS = 16; // ~60fps feel

  let index = 0;
  let cancelled = false;
  let timerId: ReturnType<typeof setTimeout>;

  function emit() {
    if (cancelled) return;
    if (index >= fullText.length) {
      onDone();
      return;
    }
    const chunk = fullText.slice(index, index + CHUNK_SIZE);
    index += CHUNK_SIZE;
    onChunk(chunk);
    timerId = setTimeout(emit, DELAY_MS);
  }

  timerId = setTimeout(emit, DELAY_MS);

  // Cancel function — panggil saat komponen unmount untuk cegah memory leak
  return () => {
    cancelled = true;
    clearTimeout(timerId);
  };
}

// ─── streamChatWithAI ─────────────────────────────────────────────────────────
// Interface identik dengan versi streaming lama → chat-block tidak perlu diubah banyak
// Returns cancel function yang harus dipanggil saat unmount
export async function streamChatWithAI(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<() => void> {
  let cancelTypewriter: () => void = () => {};

  const payload = {
    model: TOGETHER_MODEL,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    stream: false, // ✅ non-streaming: reliable di Hermes/React Native
    max_tokens: 1024,
    temperature: 0.7,
    top_p: 0.9,
  };

  try {
    const res = await fetch(TOGETHER_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOGETHER_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '(unreadable)');
      console.error('[Together AI] HTTP Error:', res.status, errBody);
      throw new Error(`Together AI error ${res.status}`);
    }

    const json = await res.json();
    const fullText: string | undefined = json?.choices?.[0]?.message?.content;

    if (!fullText) {
      console.error('[Together AI] Unexpected shape:', JSON.stringify(json));
      throw new Error('Together AI: response kosong');
    }

    // Mulai typewriter — simpan cancel function
    cancelTypewriter = simulateTypewriter(fullText, onChunk, onDone);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[Together AI] Error:', error.message);
    onError(error);
  }

  return cancelTypewriter;
}

// ─── chatWithAI (non-streaming, return langsung) ──────────────────────────────
export async function chatWithAI(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(TOGETHER_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: false,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) throw new Error(`Together AI error ${res.status}`);
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Together AI: empty response');
  return text;
}
