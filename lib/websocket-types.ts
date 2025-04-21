// Types for WebSocket messages and events

export type WebSocketEvent =
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'typing_start'
  | 'typing_end'
  | 'reaction_add'
  | 'reaction_remove'
  | 'user_status'
  | 'read_receipt';

export interface WebSocketMessage {
  event: WebSocketEvent;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  content: string;
  senderId: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
}

export interface ReactionEvent {
  messageId: string;
  conversationId: string;
  userId: string;
  emoji: string;
}

export interface ReadReceiptEvent {
  conversationId: string;
  userId: string;
  lastReadMessageId: string;
  timestamp: number;
}

export interface UserStatusEvent {
  userId: string;
  status?: 'online' | 'offline';
  name?: string;
  lastSeen?: number;
}
