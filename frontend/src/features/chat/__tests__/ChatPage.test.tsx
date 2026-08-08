import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '../../../design-system';

vi.mock('../../../lib/chatClient', () => ({ streamChat: vi.fn() }));
import { streamChat } from '../../../lib/chatClient';
import { ChatPage } from '../ChatPage';

const mockStream = streamChat as unknown as ReturnType<typeof vi.fn>;

function renderChat() {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={['/chat']}>
        <ChatPage />
      </MemoryRouter>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  mockStream.mockReset();
});

describe('ChatPage', () => {
  it('renders the empty state with suggestions', () => {
    renderChat();
    expect(screen.getByText('How can I help, Sir?')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('chat-voice')).toBeInTheDocument();
  });

  it('streams an assistant reply from the seam', async () => {
    mockStream.mockImplementationOnce(async (_turns, handlers) => {
      handlers.onMeta?.('s1');
      handlers.onDelta('Hello ');
      handlers.onDelta('Sir.');
    });
    renderChat();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('chat-input'), 'hi');
    await user.click(screen.getByTestId('chat-send'));
    await waitFor(() => expect(screen.getByText('Hello Sir.')).toBeInTheDocument());
    expect(screen.getByText('Jarvis')).toBeInTheDocument();
  });

  it('shows an error banner with retry when the stream fails', async () => {
    mockStream.mockImplementationOnce(async (_turns, handlers) => {
      handlers.onError?.('network down');
    });
    renderChat();
    const user = userEvent.setup();
    await user.type(screen.getByTestId('chat-input'), 'hi');
    await user.click(screen.getByTestId('chat-send'));
    await screen.findByTestId('chat-error');
    expect(screen.getByTestId('chat-error')).toHaveTextContent(/network down/);
    expect(screen.getByTestId('chat-retry')).toBeInTheDocument();
  });
});
