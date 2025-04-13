'use client';

import { useState } from 'react';
import { PlusCircle, X, LogOut, Settings, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type Conversation, type User, mockUsers } from '@/lib/mock-data';
import NewConversationDialog from '@/components/new-conversation-dialog';
import OnlineStatus from '@/components/online-status';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: (users: User[], name?: string) => void;
  currentUser: User;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  currentUser,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [newName, setNewName] = useState(currentUser.name);

  const handleSignOut = () => {
    signOut();
  };

  const handleSaveSettings = () => {
    // In a real app, this would update the user's name in the database
    // For now, we'll just close the dialog
    setIsSettingsOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-10 lg:hidden',
          isOpen ? 'block' : 'hidden'
        )}
        onClick={onToggle}
      />
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-20 w-80 bg-background shadow-lg transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Chats</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <Button
            className="w-full"
            onClick={() => setIsNewConversationOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Start a new conversation
          </Button>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.map((conversation) => {
            // For DMs, get the other user to show their online status
            const otherUser = !conversation.isGroup
              ? conversation.members.find(
                  (member) => member.id !== currentUser.id
                )
              : null;

            return (
              <div
                key={conversation.id}
                className={cn(
                  'flex items-start gap-3 p-3 cursor-pointer hover:bg-accent/50 transition-colors',
                  activeConversation?.id === conversation.id && 'bg-accent'
                )}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={
                        getConversationAvatar(conversation, currentUser) ||
                        '/placeholder.svg'
                      }
                    />
                    <AvatarFallback>
                      {getInitials(
                        getConversationName(conversation, currentUser)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {!conversation.isGroup && otherUser && (
                    <OnlineStatus
                      isOnline={otherUser.isOnline || false}
                      className="absolute bottom-0 right-0"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-medium truncate">
                      {getConversationName(conversation, currentUser)}
                    </h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.isGroup &&
                        conversation.lastMessage.sender.id !==
                          currentUser.id && (
                          <span className="font-medium">
                            {conversation.lastMessage.sender.name}:{' '}
                          </span>
                        )}
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* User profile section at bottom of sidebar */}
        <div className="mt-auto relative">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-md p-2 transition-colors"
            onClick={toggleUserMenu}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar>
                  <AvatarImage src={currentUser.avatar || '/placeholder.svg'} />
                  <AvatarFallback>
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <OnlineStatus
                  isOnline={true}
                  className="absolute bottom-0 right-0"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-medium truncate">{currentUser.name}</h3>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Custom dropdown menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 w-72 p-2 m-4 bg-popover border rounded-md shadow-md mb-0 z-50">
              <div
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsUserMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div
                className="flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        isOpen={isNewConversationOpen}
        onClose={() => setIsNewConversationOpen(false)}
        onCreateConversation={onCreateConversation}
        availableUsers={mockUsers.filter((user) => user.id !== currentUser.id)}
      />

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.avatar || '/placeholder.svg'} />
                  <AvatarFallback>
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-0 right-0 h-6 w-6 rounded-full"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper functions
function getConversationName(
  conversation: Conversation,
  currentUser: User
): string {
  if (conversation.isGroup) {
    return conversation.name;
  }
  // For DMs, show the other person's name
  const otherMember = conversation.members.find(
    (member) => member.id !== currentUser.id
  );
  return otherMember ? otherMember.name : conversation.name;
}

function getConversationAvatar(
  conversation: Conversation,
  currentUser: User
): string {
  if (conversation.isGroup) {
    return ''; // Group avatar placeholder
  }
  // For DMs, show the other person's avatar
  const otherMember = conversation.members.find(
    (member) => member.id !== currentUser.id
  );
  return otherMember ? otherMember.avatar : '';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function formatTime(date: Date): string {
  // return new Intl.DateTimeFormat("en-US", {
  //   hour: "numeric",
  //   minute: "numeric",
  //   hour12: true,
  // }).format(date)

  return date.toLocaleString();
}
