import ChatLayout from '@/components/chat-layout';

export default function ChatPage({ params }: { params: { chatId: string } }) {
  return <ChatLayout initialChatId={params.chatId} />;
}
