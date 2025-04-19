import ChatLayout from '@/components/chat-layout';
import {
  useWebSocketContext,
  WebSocketProvider,
} from '@/contexts/websocket-context';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return (
    <WebSocketProvider>
      <ChatLayout initialChatId={chatId} />
    </WebSocketProvider>
  );
}
