import { describe, expect, it, vi } from 'vitest';

// Mock the raw SSE client so we can drive the dev adapter deterministically.
vi.mock('../../../lib/chatClient', () => ({
  streamChat: vi.fn(),
}));

import { streamChat } from '../../../lib/chatClient';
import { getChatService } from '../chatService';
import { devChatService } from '../adapters/devStreamAdapter';
import { coreChatService } from '../adapters/coreChatAdapter';

const mockStream = streamChat as unknown as ReturnType<typeof vi.fn>;

describe('chat service seam', () => {
  it('defaults to the development adapter', () => {
    expect(getChatService()).toBe(devChatService);
    expect(devChatService.id).toBe('dev');
    expect(devChatService.ready).toBe(true);
  });

  it('the core adapter is present but not ready (no invented contract)', () => {
    expect(coreChatService.id).toBe('core');
    expect(coreChatService.ready).toBe(false);
  });

  it('dev adapter forwards deltas and completes', async () => {
    mockStream.mockImplementationOnce(async (_turns, handlers) => {
      handlers.onMeta?.('sess-1');
      handlers.onDelta('Hello');
      handlers.onDelta(' world');
    });
    const deltas: string[] = [];
    const statuses: string[] = [];
    const result = await devChatService.sendMessage(
      [{ role: 'user', content: 'hi' }],
      { onDelta: (d) => deltas.push(d), onStatus: (s) => statuses.push(s) },
    );
    expect(deltas.join('')).toBe('Hello world');
    expect(statuses).toEqual(['sending', 'streaming', 'completed']);
    expect(result).toMatchObject({ outcome: 'completed', sessionId: 'sess-1' });
  });

  it('dev adapter maps an abort to a cancelled outcome (no throw)', async () => {
    mockStream.mockImplementationOnce(async () => {
      throw new DOMException('aborted', 'AbortError');
    });
    const controller = new AbortController();
    controller.abort();
    const result = await devChatService.sendMessage(
      [{ role: 'user', content: 'hi' }],
      { onDelta: () => {} },
      controller.signal,
    );
    expect(result.outcome).toBe('cancelled');
  });

  it('dev adapter surfaces a server error as an error outcome', async () => {
    mockStream.mockImplementationOnce(async (_turns, handlers) => {
      handlers.onError?.('boom');
    });
    const result = await devChatService.sendMessage(
      [{ role: 'user', content: 'hi' }],
      { onDelta: () => {} },
    );
    expect(result).toMatchObject({ outcome: 'error', error: 'boom' });
  });
});
