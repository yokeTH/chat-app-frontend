'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import OnlineStatus from '@/components/online-status';
import type { User } from '@/lib/mock-data';

interface ReactionDetailsProps {
  reaction: string;
  users: User[];
  onClose: () => void;
}

export default function ReactionDetails({
  reaction,
  users,
  onClose,
}: ReactionDetailsProps) {
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Card
      ref={detailsRef}
      className="absolute z-10 mt-1 p-2 shadow-lg max-w-xs w-full"
    >
      <div className="flex items-center justify-between mb-2 p-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg">{reaction}</span>
          <span className="text-sm font-medium">{users.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="max-h-40 overflow-y-auto">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline !== undefined && (
                  <OnlineStatus
                    isOnline={user.isOnline}
                    className="absolute -bottom-0.5 -right-0.5 h-2 w-2 border border-background"
                  />
                )}
              </div>
              <span className="text-sm">{user.name}</span>
            </div>
            {user.isOnline && (
              <span className="text-xs text-green-600">Online</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
