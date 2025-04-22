'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Paperclip, Send, Smile, X, ArrowLeft, Download, Users, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useWebSocketContext } from '@/contexts/websocket-context';
import { ReadyState } from 'react-use-websocket';
import type { Conversation, Message, User } from '@/lib/mock-data';
import MessageItem from '@/components/message-item';
import EmojiPicker from '@/components/emoji-picker';
import ImageLightbox from '@/components/image-lightbox';
import TypingIndicator from '@/components/typing-indicator';
import OnlineStatus from '@/components/online-status';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ChatAreaProps {
  onAddReaction: (messageId: string, emoji: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function ChatArea({
  onAddReaction,
  onToggleSidebar,
  // isSidebarOpen,
}: ChatAreaProps) {
  const { messagesEndRef, currentUser, activeConversation, typingUsers } = useWebSocketContext();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  const {
    sendMessage: wsSendMessage,
    sendTypingStart,
    sendTypingEnd,
    addReaction: wsAddReaction,
    connectionStatus,
    lastMessage,
  } = useWebSocketContext();

  const [uploadingFiles, setUploadingFiles] = useState<
    {
      id: string;
      file: File;
      progress: number;
      complete: boolean;
      isImage: boolean;
      previewUrl?: string;
    }[]
  >([]);

  const getOtherUser = () => {
    if (!activeConversation || activeConversation.isGroup) return null;
    return activeConversation.members.find((member) => member?.id !== currentUser?.id) || null;
  };

  // Add drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingFile(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const isFileImage = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleFiles = (files: File[]) => {
    const newUploadingFiles = files.map((file) => {
      const isImage = isFileImage(file);
      let previewUrl: string | undefined = undefined;

      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }

      return {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        progress: 0,
        complete: false,
        isImage,
        previewUrl,
      };
    });

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Simulate upload progress for each file
    newUploadingFiles.forEach((fileInfo) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setUploadingFiles((prev) =>
            prev.map((item) => (item.id === fileInfo.id ? { ...item, progress: 100, complete: true } : item))
          );

          // Send a message with the file info
          setTimeout(() => {
            const fileMessage = fileInfo.isImage
              ? `[Image: ${fileInfo.file.name}]${fileInfo.previewUrl ? `|${fileInfo.previewUrl}` : ''}`
              : `[File: ${fileInfo.file.name}]`;

            // Remove the upload indicator after a delay
            setTimeout(() => {
              setUploadingFiles((prev) => prev.filter((item) => item.id !== fileInfo.id));

              // Clean up object URLs to prevent memory leaks
              if (fileInfo.previewUrl) {
                URL.revokeObjectURL(fileInfo.previewUrl);
              }
            }, 1000);
          }, 500);
        } else {
          setUploadingFiles((prev) => prev.map((item) => (item.id === fileInfo.id ? { ...item, progress } : item)));
        }
      }, 200);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
      // Reset the input
      e.target.value = '';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Only search if there's a term
    if (value.trim() && activeConversation) {
      const term = value.toLowerCase();
      const matches = activeConversation.messages.filter(
        (message) => typeof message.content === 'string' && message.content.toLowerCase().includes(term)
      );
      setSearchResults(matches);
    } else {
      setSearchResults([]);
    }
  };

  // Jump to a specific message and highlight it
  const jumpToMessage = (messageId: string) => {
    setActiveTab('chat');

    // Small delay to ensure the chat view is rendered
    setTimeout(() => {
      const messageElement = document.getElementById(`message-${messageId}-bubble`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth' });

        // Highlight the message briefly
        messageElement.classList.add('bg-yellow-100');
        setTimeout(() => {
          messageElement.classList.remove('bg-yellow-100');
        }, 1000);
      }
    }, 500);
  };

  useEffect(() => {
    if (activeTab === 'chat' && activeConversation?.messages) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 0);
    }
  }, [activeConversation?.messages]);

  // Reset search when changing conversations
  useEffect(() => {
    setSearchTerm('');
    setSearchResults([]);
    setActiveTab('chat');
  }, [activeConversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && activeConversation) {
      wsSendMessage(activeConversation.id, message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    // Create a temporary anchor element
    const a = document.createElement('a');

    // Create a blob URL from the image URL
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);

        // Set download attributes
        a.href = blobUrl;
        a.download = fileName || 'download';
        a.style.display = 'none';

        // Add to DOM, trigger click, and clean up
        document.body.appendChild(a);
        a.click();

        // Clean up
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  };

  const openLightbox = (src: string, alt: string) => {
    setLightboxImage({ src, alt });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevValue = message;
    setMessage(value);

    if (activeConversation) {
      // Send typing start event only if we're typing AND not already in typing state
      if (value.length > prevValue.length && !isTyping) {
        sendTypingStart(activeConversation.id);
        setIsTyping(true); // Track that we're in typing state
      }

      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to send typing end event after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        sendTypingEnd(activeConversation.id);
        setIsTyping(false); // Reset typing state when we send end event
      }, 2000);
      setTypingTimeout(timeout);
    }
  };

  // Handle reaction via WebSocket
  const handleAddReaction = (messageId: string, emoji: string) => {
    if (!activeConversation) return;

    // Send via WebSocket
    wsAddReaction(messageId, activeConversation.id, emoji);

    // Also update UI via the provided handler
    onAddReaction(messageId, emoji);
  };

  // Function to parse message content for files and images
  const renderMessageContent = (content: string) => {
    if (content.startsWith('[Image:')) {
      const parts = content.split('|');
      const imageName = parts[0].substring(8, parts[0].length - 1);
      const imageUrl = parts[1];

      return (
        <div className="space-y-2">
          <div className="relative group">
            <Image
              width={240}
              height={240}
              src={imageUrl || '/placeholder.svg'}
              alt={imageName}
              className="max-w-full rounded-md max-h-60 object-contain cursor-pointer"
              onClick={() => openLightbox(imageUrl, imageName)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                size="sm"
                className="shadow-md mr-2"
                onClick={() => openLightbox(imageUrl, imageName)}
              >
                <ZoomIn className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFile(imageUrl, imageName);
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate max-w-[200px]">{imageName}</span>
          </div>
        </div>
      );
    } else if (content.startsWith('[File:')) {
      const fileName = content.substring(7, content.length - 1);

      return (
        <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded">
              <span className="text-xs font-medium">{fileName.split('.').pop()?.toUpperCase()}</span>
            </div>
            <span className="text-sm truncate max-w-[150px]">{fileName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleDownloadFile('/placeholder.svg', fileName)}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return content;
  };

  // Show connection status
  const connectionStatusIndicator = () => {
    if (connectionStatus === ReadyState.CONNECTING) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
          Connecting...
        </Badge>
      );
    } else if (connectionStatus === ReadyState.OPEN) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Connected
        </Badge>
      );
    } else if (connectionStatus === ReadyState.CLOSING) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700">
          Closing...
        </Badge>
      );
    } else if (connectionStatus === ReadyState.CLOSED) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700">
          Disconnected
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700">
          Uninstantiated
        </Badge>
      );
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Welcome to Chat App</h2>
          <p className="text-muted-foreground">Select a conversation or start a new one</p>
          <div className="mt-2 mb-4">{connectionStatusIndicator()}</div>
          <Button className="mt-4 lg:hidden" onClick={onToggleSidebar}>
            View Conversations
          </Button>
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-2rem)] max-h-screen m-4 bg-background shadow-lg rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        {activeTab === 'chat' && (
          <>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={onToggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>{activeConversation.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold truncate">
                  {activeConversation.isGroup ? activeConversation.name : otherUser?.name}
                </h2>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  {activeConversation.isGroup ? (
                    `${activeConversation.members.length} members`
                  ) : (
                    <>
                      {otherUser?.is_online ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block mr-1"></span>
                          Online
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 inline-block mr-1"></span>
                          Offline
                        </>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatusIndicator()}
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('search')}>
                <Search className="h-5 w-5" />
              </Button>
              {activeConversation.isGroup && (
                <Button variant="ghost" size="icon" onClick={() => setActiveTab('members')}>
                  <Users className="h-5 w-5" />
                </Button>
              )}
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="flex items-center w-full">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setActiveTab('chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold">Group Members</h2>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="flex items-center w-full">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => setActiveTab('chat')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold">Search Messages</h2>
          </div>
        )}
      </div>

      {activeTab === 'chat' && (
        <div
          ref={chatContainerRef}
          className={cn(
            'flex-1 overflow-y-auto p-4 space-y-4 relative',
            isDraggingFile && 'bg-primary/5 border-2 border-dashed border-primary/50'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDraggingFile && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="text-center">
                <Paperclip className="h-12 w-12 mx-auto mb-2 text-primary" />
                <p className="text-lg font-medium">Drop files to upload</p>
              </div>
            </div>
          )}

          {activeConversation.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={{
                ...message,
                content: renderMessageContent(message?.content),
              }}
              isOwnMessage={message.sender?.id === currentUser?.id}
              onAddReaction={(emoji) => handleAddReaction(message.id, emoji)}
            />
          ))}

          {uploadingFiles.map((fileInfo) => (
            <div
              key={fileInfo.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg ml-auto max-w-[80%]',
                fileInfo.complete ? 'bg-primary/10' : 'bg-muted'
              )}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{fileInfo.file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {fileInfo.complete ? 'Uploaded' : `${Math.round(fileInfo.progress)}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${fileInfo.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}

          <div ref={messagesEndRef} id="end" />
        </div>
      )}

      {activeTab === 'members' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{activeConversation.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{activeConversation.name}</h2>
              <p className="text-sm text-muted-foreground">{activeConversation.members.length} members</p>
            </div>
          </div>

          <div className="space-y-2">
            {activeConversation.members.map((member) => (
              <div key={member?.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member?.avatar || '/placeholder.svg'} />
                      <AvatarFallback>{member?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <OnlineStatus isOnline={member?.is_online || false} className="absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <p className="font-medium">{member?.name}</p>
                    {member?.id === currentUser?.id && <p className="text-xs text-muted-foreground">You</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member?.is_online && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Online
                    </Badge>
                  )}
                  {member?.id === currentUser?.id && <Badge variant="outline">You</Badge>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-3 p-2 border rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => jumpToMessage(message.id)}
                >
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={message.sender?.avatar || '/placeholder.svg'} />
                    <AvatarFallback>{message.sender?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium text-sm">{message.sender?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        }).format(new Date(message.created_at))}
                      </span>
                    </div>
                    <p className="text-sm">{highlightText(message.content, searchTerm)}</p>
                  </div>
                </div>
              ))
            ) : searchTerm ? (
              <div className="text-center p-4 text-muted-foreground">No messages found</div>
            ) : null}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors">
              <Paperclip className="h-5 w-5" />
            </div>
            <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileInputChange} />
          </label>

          <div className="relative flex-1">
            <Input value={message} onChange={handleMessageChange} placeholder="Type a message..." className="pr-10" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            >
              <Smile className="h-5 w-5" />
            </Button>

            {isEmojiPickerOpen && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setIsEmojiPickerOpen(false)} />
              </div>
            )}
          </div>

          <Button type="submit" size="icon" disabled={!message.trim() || connectionStatus !== ReadyState.OPEN}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {lightboxImage && (
        <ImageLightbox
          src={lightboxImage.src || '/placeholder.svg'}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
          onDownload={handleDownloadFile}
        />
      )}
    </div>
  );
}

// Helper function to highlight search terms
function highlightText(text: string, term: string) {
  if (!term.trim()) return text;

  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
