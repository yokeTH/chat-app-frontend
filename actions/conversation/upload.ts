'use server';

import { auth } from '@/auth';

export const upload = async (conversationId: string, file: File) => {
  const session = await auth();
  const form = new FormData();
  form.append('file', file);

  const resp = await fetch(`${process.env.BACKEND_URL}/conversations/${conversationId}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: form,
  });
  const data = await resp.json();
  return data.data;
};
