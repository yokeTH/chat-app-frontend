import { NextResponse } from 'next/server';
import { mockConversations } from '@/lib/mock-data';

export async function GET() {
  // In a real app, you would fetch conversations from a database
  // and filter them based on the authenticated user
  return NextResponse.json({ conversations: mockConversations });
}

export async function POST(request: Request) {
  const data = await request.json();

  // In a real app, you would create a new conversation in the database
  // and return the created conversation
  const newConversation = {
    id: `conv-${Date.now()}`,
    name: data.name || 'New Conversation',
    members: data.members || [],
    messages: [],
    lastMessage: null,
    isGroup: data.isGroup || false,
  };

  return NextResponse.json({ conversation: newConversation });
}
