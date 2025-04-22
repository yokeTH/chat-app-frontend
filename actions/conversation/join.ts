'use server';

import { auth } from '@/auth';

export const joinConversation = async (conversationId: string) => {
  const session = await auth();

  const resp = await fetch(`${process.env.BACKEND_URL}/conversations/${conversationId}/join`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  const data = await resp.json();
  return data.data;
};
