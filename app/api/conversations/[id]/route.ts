import { NextResponse } from 'next/server';
import { mockConversations } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // In a real app, you would fetch the conversation from a database
  const conversation = mockConversations.find((conv) => conv.id === id);

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ conversation });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const data = await request.json();

  // In a real app, you would update the conversation in the database
  // For now, we'll just return the updated data

  return NextResponse.json({
    conversation: {
      id,
      ...data,
    },
  });
}

export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: Request,
  { params }: { params: { id: string } }
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const id = params.id;

  // In a real app, you would delete the conversation from the database

  return NextResponse.json({ success: true });
}
