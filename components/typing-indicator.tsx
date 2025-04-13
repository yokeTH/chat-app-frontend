'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/mock-data';

interface TypingIndicatorProps {
  users: User[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  // Format the typing message based on number of users
  const getTypingMessage = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing`;
    } else if (users.length === 3) {
      return `${users[0].name}, ${users[1].name}, and ${users[2].name} are typing`;
    } else {
      return `${users[0].name}, ${users[1].name}, and ${users.length - 2} others are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex items-center">
        <span className="mr-2">{getTypingMessage()}</span>
        <span className="flex">
          <span className="animate-bounce mx-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
          <span className="animate-bounce animation-delay-200 mx-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
          <span className="animate-bounce animation-delay-400 mx-0.5 h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
        </span>
      </div>
    </div>
  );
}
