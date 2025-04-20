'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import useWebSocket, { type ReadyState } from 'react-use-websocket';
import type { ChatMessage, WebSocketMessage } from '@/lib/websocket-types';
import type { Conversation, Message, User } from '@/lib/mock-data';
import { useSession } from 'next-auth/react';
import { handleMessage } from '@/contexts/handleMessage';

interface WebSocketContextType {
  sendMessage: (
    conversationId: string,
    content: string,
    attachments?: any[]
  ) => void;
  sendTypingStart: (conversationId: string) => void;
  sendTypingEnd: (conversationId: string) => void;
  addReaction: (
    messageId: string,
    conversationId: string,
    emoji: string
  ) => void;
  removeReaction: (
    messageId: string,
    conversationId: string,
    emoji: string
  ) => void;
  sendReadReceipt: (conversationId: string, messageId: string) => void;
  connectionStatus: ReadyState;
  lastMessage: WebSocketMessage | null;
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  currentUser?: User;
  setCurrentUser: (user: User) => void;
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      'useWebSocketContext must be used within a WebSocketProvider'
    );
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User>();
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // In a real app, you would get this from an environment variable
  const socketUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws`;
  const { data: session, status, update } = useSession();

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      onOpen: async () => {
        console.log('connection established try to making authentication');
        if (!session) return;
        sendJsonMessage({ token: session.access_token });
        console.log(lastJsonMessage);
      },
      onClose: () => console.log('WebSocket connection closed'),
      onError: (event) => console.error('WebSocket error:', event),
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  );

  useEffect(() => {
    const m = lastJsonMessage as WebSocketMessage;
    console.log('(m)', m);
    if (m) {
      if (m.event === 'message') {
        handleMessage({
          payload: m.payload,
          activeConversation,
          conversations,
          setActiveConversation,
          setConversations,
        });
      }
    }
  }, [lastJsonMessage]);

  const sendMessage = useCallback(
    (conversationId: string, content: string, attachments: any[] = []) => {
      sendJsonMessage({
        event: 'message',
        payload: {
          conversationId,
          content,
          attachments,
          senderId: currentUser?.id,
          created_at: Date.now(),
        },
        created_at: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  const sendTypingStart = useCallback(
    (conversationId: string) => {
      sendJsonMessage({
        event: 'typing_start',
        payload: {
          conversationId,
          userId: currentUser?.id,
        },
        timestamp: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  const sendTypingEnd = useCallback(
    (conversationId: string) => {
      sendJsonMessage({
        event: 'typing_end',
        payload: {
          conversationId,
          userId: currentUser?.id,
        },
        timestamp: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  const addReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      sendJsonMessage({
        event: 'reaction_add',
        payload: {
          messageId,
          conversationId,
          userId: currentUser?.id,
          emoji,
        },
        timestamp: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  const removeReaction = useCallback(
    (messageId: string, conversationId: string, emoji: string) => {
      sendJsonMessage({
        event: 'reaction_remove',
        payload: {
          messageId,
          conversationId,
          userId: currentUser?.id,
          emoji,
        },
        timestamp: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  const sendReadReceipt = useCallback(
    (conversationId: string, messageId: string) => {
      sendJsonMessage({
        event: 'read_receipt',
        payload: {
          conversationId,
          userId: currentUser?.id,
          lastReadMessageId: messageId,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      });
    },
    [sendJsonMessage, currentUser]
  );

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        sendTypingStart,
        sendTypingEnd,
        addReaction,
        removeReaction,
        sendReadReceipt,
        connectionStatus: readyState,
        lastMessage,
        conversations,
        setConversations,
        currentUser,
        setCurrentUser,
        activeConversation,
        setActiveConversation,
        messagesEndRef,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
