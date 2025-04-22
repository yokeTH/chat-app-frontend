export interface User {
  id: string;
  name: string;
  avatar: string;
  is_online?: boolean;
}

export interface Reaction {
  emoji: string;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  sender?: User;
  created_at: Date;
  conversation_id: string;
  reactions: Reaction[];
  type: string;
}

export interface Conversation {
  id: string;
  name: string;
  members: (User | undefined)[];
  messages: Message[];
  lastMessage: Message | null;
  isGroup: boolean;
}
