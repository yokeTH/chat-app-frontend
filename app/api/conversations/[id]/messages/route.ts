import { NextResponse } from "next/server"
import { mockConversations } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id

  // In a real app, you would fetch messages from a database
  const conversation = mockConversations.find((conv) => conv.id === id)

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  return NextResponse.json({ messages: conversation.messages })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const data = await request.json()

  // In a real app, you would add the message to the database
  // and broadcast it via WebSocket

  const newMessage = {
    id: `msg-${Date.now()}`,
    content: data.content,
    sender: data.sender,
    timestamp: new Date(),
    reactions: [],
  }

  return NextResponse.json({ message: newMessage })
}
