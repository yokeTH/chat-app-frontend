import { Conversation, User } from '@/lib/mock-data';
import { UserStatusEvent } from '@/lib/websocket-types';

interface HandleUserStatus {
  payload: UserStatusEvent;
  setAvailableUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveConversation: React.Dispatch<React.SetStateAction<Conversation | null>>;
}

export function handleUserStatus({
  payload,
  setAvailableUsers,
  setConversations,
  setActiveConversation,
}: HandleUserStatus) {
  setAvailableUsers((prev) => {
    const filteredUsers = prev.filter((user) => user.id === payload.userId);
    const updatedUsers = filteredUsers.map((user) => ({
      ...user,
      is_online: payload.status === 'online',
    }));
    return [...prev.filter((user) => user.id !== payload.userId), ...updatedUsers];
  });

  setConversations((prev) => {
    const filteredConversation = prev.filter((conversation) =>
      conversation.members.some((user) => payload.userId == user?.id)
    );
    const updatedConversation = filteredConversation.map((conversation) => ({
      ...conversation,
      members: conversation.members.map((member) => {
        return member?.id == payload.userId ? { ...member, is_online: payload.status === 'online' } : member;
      }),
    }));

    if (updatedConversation.length > 0) {
      setActiveConversation((prevActive) => {
        if (!prevActive) return prevActive;
        const matchingConversation = updatedConversation.find((conv) => conv.id === prevActive.id);
        return matchingConversation || prevActive;
      });
    }

    return [
      ...prev.filter((conversation) => !conversation.members.some((user) => payload.userId == user?.id)),
      ...updatedConversation,
    ];
  });
}
