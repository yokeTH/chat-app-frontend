import { fetchConversationById } from '@/actions/conversation/get';
import { Conversation, Message } from '@/lib/mock-data';

interface HandleMessage {
  payload: any;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export async function handleConversationUpdate({ payload, setConversations }: HandleMessage) {
  const updatedConversation: Conversation = {
    id: payload.id,
    name: payload.name,
    members: payload.members,
    messages: payload.messages,
    lastMessage: payload.messages[0],
    isGroup: true,
  };
  console.log('update conversation to:', updatedConversation);
  setConversations((conversations) => [
    ...conversations.filter((c) => c.id != updatedConversation.id),
    updatedConversation,
  ]);
}
