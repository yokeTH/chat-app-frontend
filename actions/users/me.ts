'use server';

import { auth } from '@/auth';

export const fetchUsersMe = async () => {
  const session = await auth();
  const resp = await fetch(`${process.env.BACKEND_URL}/users/me`, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });
  const data = await resp.json();
  return data.data;
};
