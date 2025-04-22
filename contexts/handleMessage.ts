import { fetchConversationById } from '@/actions/conversation/get';
import { Conversation, Message } from '@/lib/mock-data';

interface HandleMessage {
  payload: Message;
  activeConversation: Conversation | null;
  conversations: Conversation[];
  setActiveConversation: (conversation: Conversation) => void;
  setConversations: (conversations: Conversation[]) => void;
}

export async function handleMessage({
  payload,
  activeConversation,
  conversations,
  setActiveConversation,
  setConversations,
}: HandleMessage) {
  const messageConversationId = payload.conversation_id;

  let targetConversation =
    conversations.find((c) => c.id === messageConversationId) ||
    (activeConversation?.id === messageConversationId ? activeConversation : undefined);

  if (!targetConversation) {
    const fetched = await fetchConversationById(messageConversationId);
    if ('error' in fetched) {
      console.error('No target conversation found for message', payload);
      return;
    }
    targetConversation = fetched;
  }

  const updatedConversation: Conversation = {
    ...targetConversation,
    messages: [...targetConversation.messages.filter((e) => e.id != payload.id), payload],
    lastMessage: payload,
  };

  if (activeConversation?.id === messageConversationId) {
    setActiveConversation(updatedConversation);
  }

  const existingIndex = conversations.findIndex((c) => c.id === messageConversationId);

  const newConversations =
    existingIndex !== -1
      ? conversations.map((c) => (c.id === messageConversationId ? updatedConversation : c))
      : [...conversations, updatedConversation];

  setConversations(newConversations);
}
