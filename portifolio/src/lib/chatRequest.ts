export const MAX_BODY_BYTES = 128 * 1024;
export const MAX_USER_CHARS = 1000;
// Model replies (800 output tokens) are echoed back as history and run longer.
export const MAX_ASSISTANT_CHARS = 4000;
export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export class ChatRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readChatMessages(req: Request): Promise<ChatMessage[]> {
  if (req.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new ChatRequestError(415, 'unsupported_media_type');
  }
  const declared = req.headers.get('content-length');
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_BODY_BYTES)) {
    throw new ChatRequestError(413, 'payload_too_large');
  }
  if (!req.body) throw new ChatRequestError(400, 'invalid_json');

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = AbortSignal.timeout(10_000);
  const onTimeout = () => { void reader.cancel().catch(() => {}); };
  deadline.addEventListener('abort', onTimeout, { once: true });
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (deadline.aborted) throw new ChatRequestError(408, 'request_timeout');
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        void reader.cancel().catch(() => {});
        throw new ChatRequestError(413, 'payload_too_large');
      }
      chunks.push(value);
    }
  } finally {
    deadline.removeEventListener('abort', onTimeout);
    reader.releaseLock();
  }

  let body: unknown;
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch { throw new ChatRequestError(400, 'invalid_json'); }

  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).length !== 1 || !('messages' in body)) {
    throw new ChatRequestError(400, 'invalid_messages');
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 10 ||
      !messages.every((message: unknown) => {
        if (!message || typeof message !== 'object' || Array.isArray(message)) return false;
        const m = message as Record<string, unknown>;
        return Object.keys(m).length === 2 &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' && m.content.trim().length > 0 &&
          m.content.length <= (m.role === 'user' ? MAX_USER_CHARS : MAX_ASSISTANT_CHARS);
      })) {
    throw new ChatRequestError(400, 'invalid_messages');
  }
  return messages as ChatMessage[];
}
