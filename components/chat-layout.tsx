'use client';

import { useState, useEffect } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import Sidebar from '@/components/sidebar';
import ChatArea from '@/components/chat-area';
import { useWebSocketContext, WebSocketProvider } from '@/contexts/websocket-context';
import { type Conversation, type Message, type User } from '@/lib/mock-data';
import { useSession } from 'next-auth/react';
import { fetchConversation } from '@/actions/conversation/get';
import { fetchUsers } from '@/actions/users/get';
import { createConversation } from '@/actions/conversation/create';
import { fetchUsersMe } from '@/actions/users/me';

interface ChatLayoutProps {
  initialChatId?: string;
}

export default function ChatLayout({ initialChatId }: ChatLayoutProps) {
  const {
    conversations,
    setConversations,
    currentUser,
    setCurrentUser,
    activeConversation,
    setActiveConversation,
    availableUsers,
    setAvailableUsers,
  } = useWebSocketContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { data: session, status } = useSession();
  useEffect(() => {
    const user: User = {
      id: session?.user?.id ?? '',
      name: session?.user?.name ?? '',
      avatar: session?.user?.image ?? '',
      is_online: true,
    };
    setCurrentUser(user);
  }, [session]);

  // Fetch conversations from API
  useEffect(() => {
    fetchConversation().then((data) => {
      console.log('conversation:', data);
      setConversations(data ?? []);
    });
    fetchUsers().then((data) => setAvailableUsers(data ?? []));
    fetchUsersMe().then((data) => {
      console.log('My user info:', data);
      setCurrentUser(data);
    });
  }, []);

  // Set initial active conversation based on URL or default to first conversation
  useEffect(() => {
    if (initialChatId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === initialChatId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [initialChatId]);

  // On mobile, selecting a conversation should close the sidebar
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);

    // Update the URL without using router.push
    window.history.pushState({}, '', `/chat/${conversation.id}`);

    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!activeConversation) return;

    // Optimistically update UI
    const updatedMessages = activeConversation.messages.map((message) => {
      if (message.id === messageId) {
        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find((r) => r.emoji === emoji && r.user.id === currentUser?.id);

        if (existingReaction) {
          // Remove reaction if it already exists
          return {
            ...message,
            reactions: message.reactions.filter((r) => !(r.emoji === emoji && r.user.id === currentUser?.id)),
          };
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, user: currentUser! }],
          };
        }
      }
      return message;
    });

    const updatedConversation: Conversation = {
      ...activeConversation,
      messages: updatedMessages,
    };

    setActiveConversation(updatedConversation);
    setConversations(
      conversations.map((conversation) =>
        conversation.id === activeConversation.id ? updatedConversation : conversation
      )
    );
  };

  const handleCreateConversation = async (users: User[], name?: string) => {
    // If it's a DM (single user), check if conversation already exists
    if (users.length === 1) {
      const existingDM = conversations.find(
        (conversation) => !conversation.isGroup && conversation.members.some((m) => m?.id === users[0].id)
      );

      if (existingDM) {
        // Use existing conversation instead of creating a new one
        setActiveConversation(existingDM);
        window.history.pushState({}, '', `/chat/${existingDM.id}`);

        if (!isDesktop) {
          setSidebarOpen(false);
        }
        return;
      }
    }

    // Create new conversation
    try {
      console.log([...users.map((u) => u.id), currentUser?.id]);
      const data = await createConversation(
        [...users.map((u) => u.id), currentUser?.id ?? ''],
        name || (users.length === 1 ? users[0].name : 'New Group')
      );

      if (data) {
        const newConversation = {
          id: data.id,
          name: data.name,
          members: [...users, currentUser],
          messages: [],
          lastMessage: null,
          isGroup: !(users.length === 1),
        };

        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
        window.history.pushState({}, '', `/chat/${newConversation.id}`);

        if (!isDesktop) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    redirect('/');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-muted">
      <Sidebar
        availableUsers={availableUsers}
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <ChatArea
        onAddReaction={handleAddReaction}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
    </div>
  );
}
