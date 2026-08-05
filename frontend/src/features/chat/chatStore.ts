export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const KEY = 'jarvis.chat.messages';

export function loadMessages(): ChatMessage[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveMessages(messages: ChatMessage[]) {
  localStorage.setItem(KEY, JSON.stringify(messages.slice(-100)));
}

export function clearMessages() {
  localStorage.removeItem(KEY);
}
