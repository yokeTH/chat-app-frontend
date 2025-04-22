'use server';

import { auth } from '@/auth';
import { Conversation } from '@/lib/mock-data';

export const fetchConversationById = async (id: string) => {
  const session = await auth();
  const resp = await fetch(`${process.env.BACKEND_URL}/conversations/${id}`, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  if (!resp.ok) {
    return (await resp.json()) as { error: string };
  }
  const data = await resp.json();
  return data.data as Conversation;
};
