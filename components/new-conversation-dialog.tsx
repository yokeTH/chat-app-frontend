'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import OnlineStatus from '@/components/online-status';

interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateConversation: (users: User[], name?: string) => void;
  availableUsers: User[];
}

export default function NewConversationDialog({
  isOpen,
  onClose,
  onCreateConversation,
  availableUsers,
}: NewConversationDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleUserToggle = (user: User) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0) return;

    onCreateConversation(selectedUsers, selectedUsers.length > 1 ? groupName : undefined);

    // Reset state
    setSelectedUsers([]);
    setGroupName('');
    setSearchTerm('');
    onClose();
  };

  const filteredUsers = availableUsers.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="search-users">Select Users</Label>
            <Input
              id="search-users"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-1 bg-primary/10 rounded-full pl-1 pr-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{user.name}</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => handleUserToggle(user)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto border rounded-md">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center justify-between p-2 hover:bg-accent cursor-pointer',
                    selectedUsers.some((u) => u.id === user.id) && 'bg-primary/10'
                  )}
                  onClick={() => handleUserToggle(user)}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <OnlineStatus isOnline={user.is_online || false} className="absolute bottom-0 right-0" />
                    </div>
                    <span>{user.name}</span>
                  </div>
                  {selectedUsers.some((u) => u.id === user.id) && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">No users found</div>
            )}
          </div>

          {selectedUsers.length > 1 && (
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateConversation} disabled={selectedUsers.length === 0}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
