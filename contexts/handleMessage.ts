import { Conversation, Message } from '@/lib/mock-data';

interface HandleMessage {
  payload: Message;
  activeConversation: Conversation;
  conversations: Conversation[];
  setActiveConversation: (conversation: Conversation) => void;
  setConversations: (conversations: Conversation[]) => void;
}

export function handleMessage({
  payload,
  activeConversation,
  conversations,
  setActiveConversation,
  setConversations,
}: HandleMessage) {
  const updatedConversation = {
    ...activeConversation,
    messages: [...activeConversation.messages, payload],
    lastMessage: payload,
  };

  setActiveConversation(updatedConversation);
  setConversations(
    conversations.map((conversation) =>
      conversation.id === activeConversation.id
        ? updatedConversation
        : conversation
    )
  );
}
