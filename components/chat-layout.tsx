"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import Sidebar from "@/components/sidebar";
import ChatArea from "@/components/chat-area";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { type Conversation, type Message, type User, mockConversations, mockUsers } from "@/lib/mock-data";

interface ChatLayoutProps {
  initialChatId?: string;
}

export default function ChatLayout({ initialChatId }: ChatLayoutProps) {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [currentUser] = useState<User>(mockUsers[0]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const pathname = usePathname();

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations");
        const data = await response.json();
        if (data.conversations) {
          setConversations(data.conversations);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  // Set initial active conversation based on URL or default to first conversation
  useEffect(() => {
    if (initialChatId) {
      const conversation = conversations.find((c) => c.id === initialChatId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [initialChatId, conversations]);

  // On mobile, selecting a conversation should close the sidebar
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);

    // Update the URL without using router.push
    window.history.pushState({}, "", `/chat/${conversation.id}`);

    if (!isDesktop) {
      setSidebarOpen(false);
    }
  };

  const handleNewMessage = async (content: string) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: currentUser,
      timestamp: new Date(),
      reactions: [],
    };

    // Optimistically update UI
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
      lastMessage: newMessage,
    };

    setActiveConversation(updatedConversation);
    setConversations(conversations.map((conv) => (conv.id === activeConversation.id ? updatedConversation : conv)));

    // Send to API
    try {
      await fetch(`/api/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          sender: currentUser,
        }),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!activeConversation) return;

    // Optimistically update UI
    const updatedMessages = activeConversation.messages.map((message) => {
      if (message.id === messageId) {
        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find((r) => r.emoji === emoji && r.user.id === currentUser.id);

        if (existingReaction) {
          // Remove reaction if it already exists
          return {
            ...message,
            reactions: message.reactions.filter((r) => !(r.emoji === emoji && r.user.id === currentUser.id)),
          };
        } else {
          // Add new reaction
          return {
            ...message,
            reactions: [...message.reactions, { emoji, user: currentUser }],
          };
        }
      }
      return message;
    });

    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages,
    };

    setActiveConversation(updatedConversation);
    setConversations(conversations.map((conv) => (conv.id === activeConversation.id ? updatedConversation : conv)));
  };

  const handleCreateConversation = async (users: User[], name?: string) => {
    // If it's a DM (single user), check if conversation already exists
    if (users.length === 1) {
      const existingDM = conversations.find((conv) => !conv.isGroup && conv.members.some((m) => m.id === users[0].id));

      if (existingDM) {
        // Use existing conversation instead of creating a new one
        setActiveConversation(existingDM);
        window.history.pushState({}, "", `/chat/${existingDM.id}`);

        if (!isDesktop) {
          setSidebarOpen(false);
        }
        return;
      }
    }

    // Create new conversation
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || (users.length === 1 ? users[0].name : "New Group"),
          members: [...users.map((u) => u.id), currentUser.id],
          isGroup: users.length > 1,
        }),
      });

      const data = await response.json();

      if (data.conversation) {
        const newConversation = {
          ...data.conversation,
          members: [...users, currentUser],
          messages: [],
          lastMessage: null,
        };

        setConversations([newConversation, ...conversations]);
        setActiveConversation(newConversation);
        window.history.pushState({}, "", `/chat/${newConversation.id}`);

        if (!isDesktop) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  return (
    <WebSocketProvider user={currentUser}>
      <div className="flex h-screen w-screen overflow-hidden bg-muted">
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onCreateConversation={handleCreateConversation}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <ChatArea
          conversation={activeConversation}
          currentUser={currentUser}
          onSendMessagexxx={handleNewMessage}
          onAddReaction={handleAddReaction}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
      </div>
    </WebSocketProvider>
  );
}
