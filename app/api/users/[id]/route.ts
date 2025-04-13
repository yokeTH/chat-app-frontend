import { NextResponse } from 'next/server';
import { mockUsers } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // In a real app, you would fetch the user from a database
  const user = mockUsers.find((user) => user.id === id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const data = await request.json();

  // In a real app, you would update the user in the database

  return NextResponse.json({
    user: {
      id,
      ...data,
    },
  });
}
