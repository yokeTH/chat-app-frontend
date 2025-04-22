'use server';

import { auth } from '@/auth';

export const fetchConversation = async (page = 1, limit = 50) => {
  const session = await auth();
  const resp = await fetch(`${process.env.BACKEND_URL}/conversations`, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  const data = await resp.json();
  return data.data;
};
