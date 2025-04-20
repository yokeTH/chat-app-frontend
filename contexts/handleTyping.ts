import { User, Conversation } from '@/lib/mock-data';
import { TypingEvent } from '@/lib/websocket-types';

interface HandleTyping {
  payload: TypingEvent;
  type: 'start' | 'end';
  availableUsers: User[];
  setTypingUsers: React.Dispatch<React.SetStateAction<User[]>>;
  activeConversation: Conversation | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function handleTyping({
  payload,
  type,
  availableUsers,
  setTypingUsers,
  activeConversation,
  messagesEndRef,
}: HandleTyping) {
  if (!activeConversation) return;

  if (type === 'end') {
    setTypingUsers((prev) => prev.filter((user) => user.id !== payload.userId));
  }

  if (type === 'start' && activeConversation.id === payload.conversationId) {
    setTypingUsers((prev) => [...prev, ...availableUsers.filter((user) => user.id == payload.userId)]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
