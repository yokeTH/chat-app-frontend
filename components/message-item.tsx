'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Smile, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OnlineStatus from '@/components/online-status';
import type { Reaction, User } from '@/lib/mock-data';
import EmojiPicker from '@/components/emoji-picker';
import { cn } from '@/lib/utils';
import { useWebSocketContext } from '@/contexts/websocket-context';

interface MessageItemProps {
  message: {
    id: string;
    content: string | React.JSX.Element;
    sender: User;
    created_at: Date;
    reactions: Reaction[];
  };
  isOwnMessage: boolean;
  onAddReaction: (emoji: string) => void;
}

export default function MessageItem({ message, isOwnMessage, onAddReaction }: MessageItemProps) {
  const { currentUser } = useWebSocketContext();
  const [showReactions, setShowReactions] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const [reactionDetailsOpen, setReactionDetailsOpen] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleEmojiSelect = (emoji: string) => {
    onAddReaction(emoji);
    setIsEmojiPickerOpen(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  // Check if current user has reacted with a specific emoji
  const hasUserReacted = (emoji: string) => {
    return message.reactions.some((r) => r.emoji === emoji && r.user.id === currentUser?.id);
  };

  // Get users who reacted with a specific emoji
  const getUsersForReaction = (emoji: string) => {
    return message.reactions.filter((r) => r.emoji === emoji).map((r) => r.user);
  };

  // Format users list for tooltip
  const formatReactionUsers = (users: User[]) => {
    if (users.length === 0) return '';
    if (users.length === 1) return users[0].name;
    if (users.length === 2) return `${users[0].name} and ${users[1].name}`;
    return `${users[0].name}, ${users[1].name} and ${users.length - 2} more`;
  };

  // Open reaction details dialog
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const openReactionDetails = (emoji: string) => {
    setSelectedReaction(emoji);
    setReactionDetailsOpen(true);
  };

  return (
    <div
      id={`message-${message.id}`}
      ref={messageRef}
      className={cn(
        'group flex gap-3 max-w-[80%] transition-colors duration-300',
        isOwnMessage ? 'ml-auto flex-row-reverse' : ''
      )}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* {message.sender.avatar} */}
      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
        <AvatarImage src={message.sender.avatar} />
        <AvatarFallback>{message.sender.name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col', isOwnMessage ? 'items-end' : '')}>
        <div className="flex items-center gap-2 mb-1">
          {!isOwnMessage && <span className="text-sm font-medium">{message.sender.name}</span>}
          <span className="text-xs text-muted-foreground">{formatTime(new Date(message.created_at))}</span>
        </div>

        <div className="relative">
          <div
            id={`message-${message.id}-bubble`}
            className={cn('rounded-lg p-3 w-fit', isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}
          >
            {message.content}
          </div>

          {showReactions && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'absolute top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
                isOwnMessage ? 'right-full mr-1' : 'left-full ml-1'
              )}
              onClick={() => setIsEmojiPickerOpen(true)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          )}

          {isEmojiPickerOpen && (
            <div className={cn('absolute z-10', isOwnMessage ? 'right-0' : 'left-0', 'top-full mt-1')}>
              <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setIsEmojiPickerOpen(false)} />
            </div>
          )}
        </div>

        {message.reactions.length > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex flex-wrap gap-1 max-w-[calc(100%-30px)]">
              {Array.from(new Set(message.reactions.map((r) => r.emoji)))
                .slice(0, 5)
                .map((emoji) => {
                  const count = message.reactions.filter((r) => r.emoji === emoji).length;
                  const userReacted = hasUserReacted(emoji);

                  return (
                    <div
                      key={emoji}
                      className="relative"
                      onMouseEnter={() => setHoveredReaction(emoji)}
                      onMouseLeave={() => setHoveredReaction(null)}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1 text-xs rounded-full px-2 py-0.5 cursor-pointer box-border h-6',
                          userReacted ? 'bg-primary/20' : 'bg-muted hover:bg-muted/80'
                        )}
                        onClick={() => onAddReaction(emoji)}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </div>

                      {hoveredReaction === emoji && (
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md whitespace-nowrap z-50">
                          {formatReactionUsers(getUsersForReaction(emoji))}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-popover"></div>
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Show +X more if there are more than 5 reaction types */}
              {new Set(message.reactions.map((r) => r.emoji)).size > 5 && (
                <div className="flex items-center gap-1 text-xs rounded-full px-2 py-0.5 bg-muted h-6">
                  +{new Set(message.reactions.map((r) => r.emoji)).size - 5} more
                </div>
              )}
            </div>

            {/* Single view reactions button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full bg-muted hover:bg-muted/80 p-0 flex-shrink-0"
              onClick={() => {
                setReactionDetailsOpen(true);
                setSelectedReaction(Array.from(new Set(message.reactions.map((r) => r.emoji)))[0] || null);
              }}
            >
              <Users className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Reaction Details Dialog */}
      <Dialog open={reactionDetailsOpen} onOpenChange={setReactionDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reactions</DialogTitle>
          </DialogHeader>

          {/* Tabs for different reaction types */}
          <div className="flex overflow-x-auto pb-2 mb-2 border-b">
            {Array.from(new Set(message.reactions.map((r) => r.emoji))).map((emoji) => (
              <Button
                key={emoji}
                variant={selectedReaction === emoji ? 'secondary' : 'ghost'}
                className="flex items-center gap-1 px-3 rounded-full mr-1"
                onClick={() => setSelectedReaction(emoji)}
              >
                <span>{emoji}</span>
                <span className="text-xs bg-muted rounded-full px-1.5">
                  {message.reactions.filter((r) => r.emoji === emoji).length}
                </span>
              </Button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {selectedReaction &&
              getUsersForReaction(selectedReaction).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <OnlineStatus isOnline={user.isOnline || false} className="absolute bottom-0 right-0" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      {user.id === currentUser?.id && <p className="text-xs text-muted-foreground">You</p>}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
