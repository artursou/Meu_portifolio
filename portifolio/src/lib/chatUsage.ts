import { serviceClient } from '@/lib/supabaseAdmin';

export type ChatUsageEntry = {
  status: 'ok' | 'error' | 'aborted';
  finishReason?: string;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  totalTokens?: number;
  durationMs: number;
  messageCount: number;
};

const count = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;

// Stores only metadata (when, tokens, duration, outcome), never message text.
// Failures are swallowed: usage logging must never break the chat.
export async function recordChatUsage(entry: ChatUsageEntry): Promise<void> {
  try {
    const { error } = await serviceClient().rpc('record_chat_usage', {
      p_status: entry.status,
      p_finish_reason: entry.finishReason?.slice(0, 32) ?? null,
      p_input_tokens: count(entry.inputTokens),
      p_output_tokens: count(entry.outputTokens),
      p_reasoning_tokens: count(entry.reasoningTokens),
      p_total_tokens: count(entry.totalTokens),
      p_duration_ms: count(entry.durationMs),
      p_message_count: count(entry.messageCount),
    });
    if (error) throw error;
  } catch {
    console.error('Chat usage logging unavailable');
  }
}
