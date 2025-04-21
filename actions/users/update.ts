'use server';

import { auth } from '@/auth';

export const updateUser = async (name: string) => {
  const session = await auth();
  const resp = await fetch(`http://localhost:8080/users/${session?.user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ name }),
  });
  const data = await resp.json();
  return data.data;
};
