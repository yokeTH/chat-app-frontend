import { User } from '@/lib/mock-data';
import { UserStatusEvent } from '@/lib/websocket-types';

interface HandleUserStatus {
  payload: UserStatusEvent;
  availableUsers: User[];
  setAvailableUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export function handleUserStatus({ payload, availableUsers, setAvailableUsers }: HandleUserStatus) {
  const filteredUsers = availableUsers.filter((user) => user.id === payload.userId);
  const updatedUsers = filteredUsers.map((user) => ({
    ...user,
    is_online: payload.status === 'online',
  }));

  setAvailableUsers((prev) => [...prev.filter((user) => user.id !== payload.userId), ...updatedUsers]);
}
