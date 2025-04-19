import ChatLayout from '@/components/chat-layout';
import {
  useWebSocketContext,
  WebSocketProvider,
} from '@/contexts/websocket-context';

export default function ChatPage() {
  return (
    <WebSocketProvider>
      <ChatLayout />
    </WebSocketProvider>
  );
}
