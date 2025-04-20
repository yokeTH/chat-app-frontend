import ChatLayout from '@/components/chat-layout';
import { useWebSocketContext, WebSocketProvider } from '@/contexts/websocket-context';

export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  return (
    <WebSocketProvider>
      <ChatLayout />
    </WebSocketProvider>
  );
}
