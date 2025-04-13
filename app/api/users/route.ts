import { NextResponse } from "next/server"
import { mockUsers } from "@/lib/mock-data"

export async function GET() {
  // In a real app, you would fetch users from a database
  return NextResponse.json({ users: mockUsers })
}
