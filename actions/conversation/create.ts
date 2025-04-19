'use server';

import { auth } from '@/auth';

export const createConversation = async (members: string[], name: string) => {
  const session = await auth();
  const resp = await fetch(`${process.env.BACKEND_URL}/conversations`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ members, name }),
  });
  const data = await resp.json();
  return data.data;
};
