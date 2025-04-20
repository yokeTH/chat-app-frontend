import { Conversation, Message } from '@/lib/mock-data';

interface HandleMessage {
  payload: Message;
  activeConversation: Conversation | null;
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
  const messageConversationId = payload.conversation_id;

  let targetConversation = conversations.find(
    (conversation) => conversation.id === messageConversationId
  );

  if (!targetConversation && activeConversation) {
    targetConversation = activeConversation;
  }

  if (!targetConversation) {
    console.error('No target conversation found for message', payload);
    return;
  }

  const updatedConversation: Conversation = {
    ...targetConversation,
    messages: [...targetConversation.messages, payload],
    lastMessage: payload,
  };

  if (activeConversation && messageConversationId === activeConversation.id) {
    setActiveConversation(updatedConversation);
  }

  setConversations(
    conversations.map((conversation) =>
      conversation.id === messageConversationId
        ? updatedConversation
        : conversation
    )
  );
}
