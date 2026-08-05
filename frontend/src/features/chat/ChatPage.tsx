import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, Copy, Mic, Paperclip, RotateCcw, Sparkles, Square, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  PageHeader,
  SimpleTooltip,
  VoiceOrb,
  WorkspaceContainer,
} from '../../design-system';
import { streamChat, type ChatTurn } from '../../lib/chatClient';
import { clearMessages, loadMessages, saveMessages, type ChatMessage } from './chatStore';
import { Markdown } from './Markdown';

const suggestions = [
  'Summarize my day and suggest 3 priorities',
  'Draft a project plan for "Mark III"',
  'Explain the JARVIS knowledge graph',
  'Write a Python function to debounce calls',
];

let idCounter = 0;
const uid = () => `${Date.now()}-${idCounter++}`;

export function ChatPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => saveMessages(messages), [messages]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;
      setInput('');

      const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed };
      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: '' };
      const base = [...messages, userMsg];
      setMessages([...base, assistantMsg]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const turns: ChatTurn[] = base.map((m) => ({ role: m.role, content: m.content }));

      await streamChat(
        turns,
        {
          onDelta: (delta) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantMsg.id ? { ...m, content: m.content + delta } : m)),
            ),
          onError: (err) =>
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: `⚠️ ${err}. Please try again.` } : m,
              ),
            ),
        },
        controller.signal,
      );
      setStreaming(false);
      abortRef.current = null;
    },
    [messages, streaming],
  );

  // Auto-send a prompt passed from the command palette / voice.
  const consumedPrompt = useRef(false);
  useEffect(() => {
    const prompt = (location.state as { prompt?: string } | null)?.prompt;
    if (prompt && !consumedPrompt.current) {
      consumedPrompt.current = true;
      void send(prompt);
      window.history.replaceState({}, '');
    }
  }, [location.state, send]);

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === lastUser.id);
      return prev.slice(0, idx);
    });
    setTimeout(() => void send(lastUser.content), 0);
  };

  const onComposerInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  };

  return (
    <WorkspaceContainer
      header={
        <PageHeader
          title="AI Chat"
          description="A document-style thread with Jarvis. Streaming, markdown, and code."
          actions={
            messages.length > 0 && (
              <Button
                variant="ghost"
                leftIcon={<Trash2 className="size-4" />}
                onClick={() => {
                  clearMessages();
                  setMessages([]);
                }}
                data-testid="chat-clear"
              >
                Clear
              </Button>
            )
          }
        />
      }
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pb-4" data-testid="chat-thread">
          {messages.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title="How can I help, Sir?"
              description="Ask anything, or start with a suggestion below."
              action={
                <div className="mt-2 flex max-w-lg flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => void send(s)}
                      className="rounded-full border border-line bg-surface-base px-3.5 py-2 text-body-sm text-content-secondary transition-colors hover:border-line-strong hover:text-content"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              }
            />
          ) : (
            <div className="flex flex-col gap-6 py-4">
              {messages.map((m, i) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent-soft px-4 py-2.5 text-body text-content">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="group flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      <VoiceOrb size={28} state={streaming && i === messages.length - 1 ? 'thinking' : 'idle'} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-label font-semibold text-content">Jarvis</span>
                        <Badge variant="accent" size="sm">Sonnet 4.6</Badge>
                      </div>
                      {m.content ? (
                        <Markdown content={m.content} />
                      ) : (
                        <div className="flex items-center gap-1.5 text-body-sm text-content-tertiary">
                          <span className="size-1.5 animate-pulse rounded-full bg-ai-aura" />
                          Jarvis is thinking…
                        </div>
                      )}
                      {!streaming && m.content && (
                        <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <SimpleTooltip label="Copy">
                            <IconButton label="Copy" size="sm" onClick={() => navigator.clipboard.writeText(m.content)}>
                              <Copy className="size-3.5" />
                            </IconButton>
                          </SimpleTooltip>
                          {i === messages.length - 1 && (
                            <SimpleTooltip label="Retry">
                              <IconButton label="Retry" size="sm" onClick={retry}>
                                <RotateCcw className="size-3.5" />
                              </IconButton>
                            </SimpleTooltip>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="sticky bottom-0 pb-2 pt-2">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="neutral" size="sm">Memory: on</Badge>
            <Badge variant="neutral" size="sm">Workspace: default</Badge>
          </div>
          <div className="glass flex items-end gap-2 rounded-2xl p-2">
            <IconButton label="Attach" size="md"><Paperclip className="size-[18px]" /></IconButton>
            <textarea
              ref={composerRef}
              value={input}
              onChange={onComposerInput}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Message Jarvis…  (⌘↵ to send)"
              data-testid="chat-input"
              className="max-h-[220px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-body text-content placeholder:text-content-tertiary outline-none"
            />
            <IconButton label="Voice"><Mic className="size-[18px]" /></IconButton>
            {streaming ? (
              <IconButton label="Stop" variant="solid" onClick={stop} data-testid="chat-stop">
                <Square className="size-4" />
              </IconButton>
            ) : (
              <IconButton
                label="Send"
                variant="solid"
                onClick={() => void send(input)}
                disabled={!input.trim()}
                data-testid="chat-send"
              >
                <ArrowUp className="size-[18px]" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </WorkspaceContainer>
  );
}
